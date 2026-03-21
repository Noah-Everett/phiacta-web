import Link from "next/link";
import type { EntryListItem } from "@/lib/types";
import { LayoutHintBadge, StatusBadge } from "./EntryBadges";

interface EntryCardProps {
  entry: EntryListItem;
}

export default function EntryCard({ entry }: EntryCardProps) {
  return (
    <Link
      href={`/entries/${entry.id}`}
      className="block rounded-lg border border-gray-200 bg-white p-5 transition hover:border-gray-300 hover:shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600"
    >
      <div className="mb-2 flex items-center gap-2">
        <LayoutHintBadge hint={entry.layout_hint} />
        <StatusBadge status={entry.status} />
      </div>
      <p className="text-sm font-medium leading-snug text-gray-800 dark:text-gray-200">
        {entry.title}
      </p>
      {entry.summary && (
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{entry.summary}</p>
      )}
      <div className="mt-3 flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
        <span>{new Date(entry.created_at).toLocaleDateString()}</span>
        <span>{entry.content_format}</span>
      </div>
    </Link>
  );
}
