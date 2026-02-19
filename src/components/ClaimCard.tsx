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
      className="block rounded-lg border border-gray-200 bg-white p-5 transition hover:border-gray-300 hover:shadow-sm"
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
          {claim.claim_type}
        </span>
        <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
          {namespaceName || claim.namespace_id.slice(0, 8)}
        </span>
        <span
          className={`ml-auto rounded px-2 py-0.5 text-xs font-medium ${
            claim.status === "active"
              ? "bg-green-50 text-green-700"
              : claim.status === "retracted"
                ? "bg-red-50 text-red-700"
                : "bg-yellow-50 text-yellow-700"
          }`}
        >
          {claim.status}
        </span>
      </div>
      <p className="mb-1 text-sm font-medium text-gray-900">{claim.title}</p>
      {claim.content_cache && (
        <MarkdownContent content={claim.content_cache} compact className="text-sm leading-relaxed text-gray-800" />
      )}
      <div className="mt-3 flex items-center gap-4 text-xs text-gray-400">
        <span>{new Date(claim.created_at).toLocaleDateString()}</span>
        <span>{claim.format}</span>
      </div>
    </Link>
  );
}
