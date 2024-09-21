import type { PartialReligionQAResponse } from "@/app/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { Skeleton } from "@/client/components/ui/skeleton";
import Markdown from "@/client/components/views/project/activity/assistant/message/markdown";

function QAResponseCard({
  qaResponse,
}: {
  qaResponse: PartialReligionQAResponse | undefined;
}) {
  if (!qaResponse?.religion) {
    return null;
  }

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>
          {qaResponse.religion || <Skeleton className="h-6 w-24" />}
        </CardTitle>
        <CardDescription>Response to the question</CardDescription>
        <video
          src="/christianity_persona.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="mb-4 w-full rounded-lg"
        />
      </CardHeader>
      <CardContent>
        {qaResponse.message ? (
          <div className="text-foreground/80">
            <Markdown
              content={qaResponse.message}
              components={{
                strong: ({ children }) => (
                  <span className="font-medium text-pink-400 ">{children}</span>
                ),
              }}
            />
          </div>
        ) : (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        )}
        <div className="mt-4">
          <h3 className="text-xs font-semibold text-gray-500">SOURCES</h3>
          {qaResponse.sources && qaResponse.sources.length > 0 ? (
            <ul className="mt-2 list-disc pl-5">
              {qaResponse.sources.map((source, index) => (
                <li key={index}>
                  {source?.quote ? (
                    <>
                      <span className="text-gray-300">{source.quote}</span>
                      {source?.sourceDescription && (
                        <span className="ml-2 text-sm text-gray-500">
                          ({source.sourceDescription})
                        </span>
                      )}
                    </>
                  ) : (
                    <Skeleton className="h-4 w-full" />
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <Skeleton className="mt-2 h-4 w-full" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default QAResponseCard;
