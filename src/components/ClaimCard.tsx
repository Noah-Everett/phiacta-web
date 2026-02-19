import Link from "next/link";
import type { Claim } from "@/lib/types";
import MarkdownContent from "./MarkdownContent";

interface ClaimCardProps {
  claim: Claim;
  namespaceName?: string;
}

export default function ClaimCard({ claim, namespaceName }: ClaimCardProps) {
  return (
    <Link
      href={`/claims/${claim.id}`}
      className="block rounded-lg border border-gray-200 bg-white p-5 transition hover:border-gray-300 hover:shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600"
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
          {claim.claim_type}
        </span>
        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
          {namespaceName || claim.namespace_id.slice(0, 8)}
        </span>
        <span
          className={`ml-auto rounded px-2 py-0.5 text-xs font-medium ${
            claim.status === "active"
              ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : claim.status === "retracted"
                ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                : "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
          }`}
        >
          {claim.status}
        </span>
      </div>
      <MarkdownContent
        content={claim.content_cache || claim.title}
        compact
        className="text-sm leading-relaxed text-gray-800 dark:text-gray-200"
      />
      <div className="mt-3 flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
        <span>{new Date(claim.created_at).toLocaleDateString()}</span>
        <span>{claim.format}</span>
      </div>
    </Link>
  );
}
