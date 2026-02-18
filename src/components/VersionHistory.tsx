import Link from "next/link";
import type { Claim } from "@/lib/types";

interface VersionHistoryProps {
  versions: Claim[];
  currentId: string;
}

export default function VersionHistory({ versions, currentId }: VersionHistoryProps) {
  if (versions.length <= 1) {
    return (
      <p className="text-sm text-gray-500">v1 (only version)</p>
    );
  }

  return (
    <div className="space-y-1">
      {versions.map((v) => {
        const isCurrent = v.id === currentId;
        return (
          <div
            key={v.id}
            className={`flex items-center gap-2 rounded px-2 py-1 text-sm ${
              isCurrent ? "bg-gray-100 font-medium text-gray-900" : "text-gray-600"
            }`}
          >
            <span>v{v.version}</span>
            <span className="text-xs text-gray-400">
              {new Date(v.created_at).toLocaleDateString()}
            </span>
            <span
              className={`rounded px-1.5 py-0.5 text-xs ${
                v.status === "active"
                  ? "bg-green-50 text-green-700"
                  : v.status === "draft"
                    ? "bg-yellow-50 text-yellow-700"
                    : "bg-gray-100 text-gray-500"
              }`}
            >
              {v.status}
            </span>
            {isCurrent ? (
              <span className="ml-auto text-xs text-gray-400">(current)</span>
            ) : (
              <Link
                href={`/claims/${v.id}`}
                className="ml-auto text-xs text-blue-600 hover:underline"
              >
                view
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
