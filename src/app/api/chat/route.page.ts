import { openai } from "@ai-sdk/openai";
import type { CoreMessage } from "ai";
import { streamText } from "ai";
import { type NextRequest, NextResponse } from "next/server";

import { ProtectedAppRoute } from "@/app/api/util";
import { env } from "@/env";
import { logger } from "@/init/logger";
import { prisma } from "@/server/init/db";
import type { AuthenticationContext } from "@/server/services/authentication/context";
import { fileService } from "@/server/services/file/service";
import { RagService } from "@/server/services/rag/service";
import { assertUnreachable } from "@/server/util/types";
import { extractToHtml } from "@/utils/ai";
import type { ProjectChatForm } from "@/utils/project";

export const runtime = `nodejs`;
export const dynamic = `force-dynamic`;

type ChatRequestBody = {
  messages: CoreMessage[];
  projectId: string;
  threadId: string;
} & ProjectChatForm;

async function post(request: NextRequest, authContext: AuthenticationContext) {
  const body = (await request.json()) as ChatRequestBody;
  const { messages, threadId } = body;

  const thread = await prisma.chatMessageThread.findUniqueOrThrow({
    where: {
      id: threadId,
    },
    include: {
      Document: true,
    },
  });
  const document = thread.Document;

  const userMessage = messages[messages.length - 1];
  if (!messages || !userMessage || userMessage.role !== `user`) {
    return NextResponse.json(
      {
        error: `messages are required in the request body and the last message must be from the user`,
      },
      { status: 400 }
    );
  }

  const systemContext = await getChunksForSystemContext(
    body,
    document,
    authContext,
    userMessage
  );

  return await getProjectChatResponse({
    systemContext,
    messages,
    userMessage,
    threadId,
  });
}

async function getChunksForSystemContext(
  body: ChatRequestBody,
  document: { id: string; s3Key: string; ragProviderDocumentId: string },
  authContext: AuthenticationContext,
  userMessage: CoreMessage
): Promise<string> {
  const { questionType } = body;
  switch (questionType) {
    case `pageRange`: {
      const s3Url = await fileService.getPresignedUrlForFile({
        path: document.s3Key,
        action: `read`,
        bucket: env.AWS_S3_BUCKET,
        expires: 1,
        expiresUnit: `days`,
      });
      logger.info(
        {
          documentId: document.id,
          documentS3Key: document.s3Key,
          pageRangeStart: body.range.pageRangeStart,
          pageRangeEnd: body.range.pageRangeEnd,
        },
        `Extracting pdf pages from reducto`
      );
      const systemContext = await extractToHtml({
        s3Url,
        pageRange: {
          pageRangeStart: Number(body.range.pageRangeStart),
          pageRangeEnd: Number(body.range.pageRangeEnd),
        },
      });
      logger.info({ systemContext }, `Extracted pdf pages from reducto`);
      return systemContext;
    }
    case `fullDocument`: {
      logger.info(
        {
          documentId: document.id,
          documentS3Key: document.s3Key,
          ragProviderDocumentId: document.ragProviderDocumentId,
          query: userMessage.content,
        },
        `Retrieving RAG chunks for chat`
      );
      const chunks = await RagService.withContext(
        authContext
      ).retrieveDocuments({
        projectId: body.projectId,
        providerDocumentId: document.ragProviderDocumentId,
        query: userMessage.content as string, // TODO: tighten this type up
      });

      logger.info(
        {
          chunks,
          query: userMessage.content,
        },
        `Retrieved RAG chunks for chat`
      );

      return chunks.map((chunk) => chunk.text).join(`===\n\n`);
    }
    default:
      assertUnreachable(questionType, `Unsupported question type`);
  }
}

async function getProjectChatResponse({
  systemContext,
  messages,
  userMessage,
  threadId,
}: {
  systemContext: string;
  messages: CoreMessage[];
  userMessage: CoreMessage;
  threadId: string;
}) {
  const systemPrompt = `These are very important to follow:

  You are "Degrom AI", a professional but friendly AI chatbot working as an assitant to the user.
  
  Your current task is to help the user based on all of the information available to you shown below.
  Answer informally, directly, and concisely without a heading or greeting but include everything relevant.
  Use richtext Markdown when appropriate including bold, italic, paragraphs, and lists when helpful.
  If using LaTeX, use double $$ as delimiter instead of single $. Use $$...$$ instead of parentheses.
  Organize information into multiple sections or points when appropriate.
  Don't include raw item IDs or other raw fields from the source.
  Don't use XML or other markup unless requested by the user.
  
  Here is all of the information available to answer the user:
  ===
  ${systemContext}
  ===
  
  If the user asked for a search and there are no results, make sure to let the user know that you couldn't find anything,
  and what they might be able to do to find the information they need.
  
  END SYSTEM INSTRUCTIONS`;

  const result = await streamText({
    model: openai(`gpt-4o-mini`),
    messages,
    system: systemPrompt,
    onFinish: async (completion) => {
      await prisma.chatMessageRow.create({
        data: {
          role: `user`,
          content: userMessage.content as string,
          threadId,
        },
      });

      await prisma.chatMessageRow.create({
        data: {
          role: `assistant`,
          content: completion.text,
          threadId,
        },
      });
    },
  });

  return result.toDataStreamResponse();
}

export const POST = ProtectedAppRoute({ fn: post });
