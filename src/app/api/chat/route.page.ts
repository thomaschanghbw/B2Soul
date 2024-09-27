import { openai } from "@ai-sdk/openai";
import { streamObject } from "ai";

import { religionQAFormSchema, religionQASchema } from "../../types";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { question } = religionQAFormSchema.parse(await req.json());

  const result = await streamObject({
    model: openai(`gpt-4o-mini`),
    system:
      `You are an assistant that roleplays as spiritual figures of various religions. ` +
      `The user is asking a question and wants to know how it pertains to different religions. ` +
      `Given the user's question, provide a response from the perspective of Christianity, Islam, and Hinduism. ` +
      `Do not include responses for any other religions besides these 3. ` +
      `Cite sources from religious texts like the Bible, Qur'an, etc. `,
    prompt: `Please answer the following question: "${question}"`,
    schema: religionQASchema,
    // onFinish({ object }) {
    // },
  });

  return result.toTextStreamResponse();
}
