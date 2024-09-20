import type { PartialReligionQAResponse } from "@/app/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { Skeleton } from "@/client/components/ui/skeleton";

function QAResponseCard({
  qaResponse,
}: {
  qaResponse: PartialReligionQAResponse | undefined;
}) {
  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>
          {qaResponse?.religion || <Skeleton className="h-6 w-24" />}
        </CardTitle>
        <CardDescription>Response to the question</CardDescription>
      </CardHeader>
      <CardContent>
        {qaResponse?.message ? (
          <p>{qaResponse.message}</p>
        ) : (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        )}
        <div className="mt-4">
          <h3 className="text-xs font-semibold text-gray-500">SOURCES</h3>
          {qaResponse?.sources && qaResponse.sources.length > 0 ? (
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
