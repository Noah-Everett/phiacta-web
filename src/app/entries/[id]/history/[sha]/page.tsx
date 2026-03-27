"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import DiffBlock from "@/components/DiffBlock";
import {
  ChevronRight,
  History,
  Plus,
  Minus,
  ArrowLeft,
} from "lucide-react";
import {
  getEntry,
  getEntryCommitDiff,
  getEntryHistory,
} from "@/lib/api";
import type {
  EntryDetailResponse,
  CommitDiffResponse,
  CommitListItem,
} from "@/lib/types";

interface CommitPageProps {
  params: Promise<{ id: string; sha: string }>;
}

export default function CommitPage({ params }: CommitPageProps) {
  const router = useRouter();
  const [entryId, setEntryId] = useState<string | null>(null);
  const [sha, setSha] = useState<string | null>(null);
  const [entry, setEntry] = useState<EntryDetailResponse | null>(null);
  const [commit, setCommit] = useState<CommitListItem | null>(null);
  const [diff, setDiff] = useState<CommitDiffResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => {
      setEntryId(p.id);
      setSha(p.sha);
    });
  }, [params]);

  const loadData = useCallback(() => {
    if (!entryId || !sha) return;
    setLoading(true);
    Promise.all([
      getEntry(entryId),
      getEntryCommitDiff(entryId, sha),
      getEntryHistory(entryId),
    ])
      .then(([entryData, diffData, historyData]) => {
        setEntry(entryData);
        setDiff(diffData);
        const found = historyData.find((c) => c.sha === sha);
        setCommit(found ?? null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [entryId, sha]);

  useEffect(() => { loadData(); }, [loadData]);

  // Compute line stats
  const totalAdditions = diff?.files_changed.reduce((sum, f) => sum + f.additions, 0) ?? 0;
  const totalDeletions = diff?.files_changed.reduce((sum, f) => sum + f.deletions, 0) ?? 0;

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8">
        <Skeleton className="h-4 w-48 mb-6" />
        <Skeleton className="h-8 w-2/3 mb-4" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !entry || !diff) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="mb-2 text-2xl font-bold text-foreground">Commit not found</h1>
        <p className="mb-4 text-sm text-muted-foreground">{error || "This commit does not exist."}</p>
        <Button variant="outline" onClick={() => router.back()}>Go back</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/explore" className="hover:text-foreground transition-colors">Explore</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/entries/${entryId}`} className="hover:text-foreground transition-colors truncate max-w-[200px]">
          {entry.title || "Untitled"}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/entries/${entryId}?tab=history`} className="hover:text-foreground transition-colors">
          History
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-mono">{sha!.slice(0, 7)}</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start gap-3 mb-3">
          <History className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">
              {commit?.message || "Commit"}
            </h1>
            {commit && (
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>{commit.author.name}</span>
                <span>&middot;</span>
                <span>
                  {new Date(commit.timestamp).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Commit metadata card */}
      <div className="mb-4 rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <div>
            <span className="text-muted-foreground">Commit </span>
            <code className="font-mono text-xs text-foreground">{sha}</code>
          </div>
          {diff.base_sha && (
            <div>
              <span className="text-muted-foreground">Parent </span>
              <code className="font-mono text-xs text-foreground">{diff.base_sha.slice(0, 7)}</code>
            </div>
          )}
        </div>
      </div>

      {/* Stats summary */}
      <div className="mb-6 flex items-center gap-4 text-sm">
        <span className="text-muted-foreground">
          {diff.files_changed.length} file{diff.files_changed.length !== 1 ? "s" : ""} changed
        </span>
        {totalAdditions > 0 && (
          <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
            <Plus className="h-3.5 w-3.5" />
            {totalAdditions} addition{totalAdditions !== 1 ? "s" : ""}
          </span>
        )}
        {totalDeletions > 0 && (
          <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
            <Minus className="h-3.5 w-3.5" />
            {totalDeletions} deletion{totalDeletions !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* File diffs */}
      {diff.files_changed.length > 0 && (
        <div className="mb-6 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Changed files
          </h2>
          {diff.files_changed.map((f) => (
            <div key={f.path}>
              <div className="mb-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="font-mono">{f.path}</span>
                {f.additions > 0 && (
                  <span className="text-green-600 dark:text-green-400">+{f.additions}</span>
                )}
                {f.deletions > 0 && (
                  <span className="text-red-600 dark:text-red-400">-{f.deletions}</span>
                )}
              </div>
              <DiffBlock path={f.path} patch={f.patch} />
            </div>
          ))}
        </div>
      )}
      {diff.files_changed.length === 0 && (
        <p className="mb-6 text-sm text-muted-foreground">No file changes in this commit.</p>
      )}

      {/* Back button */}
      <div className="pt-4 border-t border-border">
        <Button
          variant="outline"
          className="gap-1.5"
          onClick={() => router.push(`/entries/${entryId}?tab=history`)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to entry
        </Button>
      </div>
    </div>
  );
}
