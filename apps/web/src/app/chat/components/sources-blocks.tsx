import { Button } from "@/components/ui/button";
import { Document } from "@/types/chat";
import Link from "next/link";

export function SourcesBlocks({
  sourceDocuments,
}: {
  sourceDocuments: Document[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {sourceDocuments.map((doc, docIndex) => (
        <Button variant={"outline"} key={docIndex} className="" asChild>
          <Link
            href={`/api/files/content/${encodeURIComponent(
              doc.metadata?.source ?? ""
            )}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {docIndex + 1}
          </Link>
        </Button>
      ))}
    </div>
  );
}
