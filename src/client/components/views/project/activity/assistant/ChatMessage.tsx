import type { Message } from "ai";
import { Check, Copy } from "lucide-react";

import { Button } from "@/client/components/ui/button";
import { useCopyToClipboard } from "@/client/hooks/use-copy-to-clipboard";

import ChatAvatar from "./message/ChatAvatar";
// import { ChatEvents } from "./chat-events";
// import { ChatFiles } from "./chat-files";
// import { ChatImage } from "./chat-image";
// import { ChatSources } from "./chat-sources";
// import { SuggestedQuestions } from "./chat-suggestedQuestions";
import Markdown from "./message/markdown";

// type ContentDisplayConfig = {
//   order: number;
//   component: JSX.Element | null;
// };

function ChatMessageContent({
  message,
  // isLoading,
  // append,
}: {
  message: Message;
  // isLoading: boolean;
  // append: Pick<ChatHandler, "append">["append"];
}) {
  return <Markdown content={message.content} />;
  // const annotations = message.annotations as MessageAnnotation[] | undefined;
  // if (!annotations?.length) return <Markdown content={message.content} />;
  //
  // const imageData = getAnnotationData<ImageData>(
  //   annotations,
  //   MessageAnnotationType.IMAGE
  // );
  // const contentFileData = getAnnotationData<DocumentFileData>(
  //   annotations,
  //   MessageAnnotationType.DOCUMENT_FILE
  // );
  // const eventData = getAnnotationData<EventData>(
  //   annotations,
  //   MessageAnnotationType.EVENTS
  // );
  // const sourceData = getAnnotationData<SourceData>(
  //   annotations,
  //   MessageAnnotationType.SOURCES
  // );
  // const toolData = getAnnotationData<ToolData>(
  //   annotations,
  //   MessageAnnotationType.TOOLS
  // );
  // const suggestedQuestionsData = getAnnotationData<SuggestedQuestionsData>(
  //   annotations,
  //   MessageAnnotationType.SUGGESTED_QUESTIONS
  // );
  //
  // const contents: ContentDisplayConfig[] = [
  //   {
  //     order: 1,
  //     component: imageData[0] ? <ChatImage data={imageData[0]} /> : null,
  //   },
  //   {
  //     order: -3,
  //     component:
  //       eventData.length > 0 ? (
  //         <ChatEvents isLoading={isLoading} data={eventData} />
  //       ) : null,
  //   },
  //   {
  //     order: 2,
  //     component: contentFileData[0] ? (
  //       <ChatFiles data={contentFileData[0]} />
  //     ) : null,
  //   },
  //   {
  //     order: -1,
  //     component: toolData[0] ? <ChatTools data={toolData[0]} /> : null,
  //   },
  //   {
  //     order: 0,
  //     component: <Markdown content={message.content} />,
  //   },
  //   {
  //     order: 3,
  //     component: sourceData[0] ? <ChatSources data={sourceData[0]} /> : null,
  //   },
  //   {
  //     order: 4,
  //     component: suggestedQuestionsData[0] ? (
  //       <SuggestedQuestions
  //         questions={suggestedQuestionsData[0]}
  //         append={append}
  //       />
  //     ) : null,
  //   },
  // ];
  //
  // return (
  //   <div className="flex flex-1 flex-col gap-4">
  //     {contents
  //       .sort((a, b) => a.order - b.order)
  //       .map((content, index) => (
  //         <Fragment key={index}>{content.component}</Fragment>
  //       ))}
  //   </div>
  // );
}

export default function ChatMessage({
  chatMessage,
  // isLoading,
  // append,
}: {
  chatMessage: Message;
  // isLoading: boolean;
  // append: Pick<ChatHandler, "append">["append"];
}) {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 });
  return (
    <div className="flex items-start gap-4 pr-5 pt-5">
      <ChatAvatar role={chatMessage.role} />
      <div className="group flex flex-1 justify-between gap-2">
        <ChatMessageContent
          message={chatMessage}
          // isLoading={isLoading}
          // append={append}
        />
        <Button
          onClick={() => copyToClipboard(chatMessage.content)}
          size="icon"
          variant="ghost"
          className="h-8 w-8 opacity-0 group-hover:opacity-100"
        >
          {isCopied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
