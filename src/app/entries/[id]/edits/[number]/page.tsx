"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import MarkdownContent from "@/components/MarkdownContent";
import DiffBlock from "@/components/DiffBlock";
import {
  ChevronRight,
  GitBranch,
  GitMerge,
  CircleDot,
  Loader2,
  X,
} from "lucide-react";
import {
  getEntry,
  getEntryEditDetail,
  mergeEditProposal,
  closeEditProposal,
  getStoredToken,
} from "@/lib/api";
import type {
  EntryDetailResponse,
  EditProposalDetail,
} from "@/lib/types";

interface EditPageProps {
  params: Promise<{ id: string; number: string }>;
}

export default function EditPage({ params }: EditPageProps) {
  const router = useRouter();
  const [entryId, setEntryId] = useState<string | null>(null);
  const [editNumber, setEditNumber] = useState<number | null>(null);
  const [entry, setEntry] = useState<EntryDetailResponse | null>(null);
  const [edit, setEdit] = useState<EditProposalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [merging, setMerging] = useState(false);
  const [closing, setClosing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const isLoggedIn = typeof window !== "undefined" && !!getStoredToken();

  useEffect(() => {
    params.then((p) => {
      setEntryId(p.id);
      setEditNumber(parseInt(p.number));
    });
  }, [params]);

  const loadData = useCallback(() => {
    if (!entryId || !editNumber) return;
    setLoading(true);
    Promise.all([
      getEntry(entryId),
      getEntryEditDetail(entryId, editNumber),
    ])
      .then(([entryData, editData]) => {
        setEntry(entryData);
        setEdit(editData);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [entryId, editNumber]);

  useEffect(() => { loadData(); }, [loadData]);

  // Parse "closes #N" / "fixes #N" from body
  const linkedIssues = edit?.body
    ? [...edit.body.matchAll(/(?:closes|fixes|resolves)\s+#(\d+)/gi)].map((m) => parseInt(m[1]))
    : [];

  const handleMerge = () => {
    if (!entryId || !editNumber) return;
    setMerging(true);
    setActionError(null);
    mergeEditProposal(entryId, editNumber)
      .then(() => loadData())
      .catch((err) => setActionError(err instanceof Error ? err.message : "Merge failed"))
      .finally(() => setMerging(false));
  };

  const handleClose = () => {
    if (!entryId || !editNumber) return;
    setClosing(true);
    setActionError(null);
    closeEditProposal(entryId, editNumber)
      .then(() => loadData())
      .catch((err) => setActionError(err instanceof Error ? err.message : "Close failed"))
      .finally(() => setClosing(false));
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8">
        <Skeleton className="h-4 w-48 mb-6" />
        <Skeleton className="h-8 w-2/3 mb-4" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !entry || !edit) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="mb-2 text-2xl font-bold text-foreground">Edit proposal not found</h1>
        <p className="mb-4 text-sm text-muted-foreground">{error || "This edit proposal does not exist."}</p>
        <Button variant="outline" onClick={() => router.back()}>Go back</Button>
      </div>
    );
  }

  const statusLabel = edit.merged_at ? "merged" : edit.state;
  const statusClass = edit.state === "open"
    ? "text-green-700 border-green-200 bg-green-50 dark:text-green-300 dark:border-green-800 dark:bg-green-950/50"
    : "text-violet-700 border-violet-200 bg-violet-50 dark:text-violet-300 dark:border-violet-800 dark:bg-violet-950/50";

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/explore" className="hover:text-foreground transition-colors">Explore</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/entries/${entryId}`} className="hover:text-foreground transition-colors truncate max-w-[200px]">
          {entry.title}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">Edit #{edit.number}</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start gap-3 mb-3">
          {edit.state === "open" ? (
            <GitBranch className="mt-1 h-5 w-5 shrink-0 text-green-500" />
          ) : (
            <GitMerge className="mt-1 h-5 w-5 shrink-0 text-violet-500" />
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{edit.title}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline" className={statusClass}>
                {statusLabel}
              </Badge>
              <span>{edit.author.handle} opened on {new Date(edit.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Branch info */}
      <div className="mb-4 rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
        <code className="font-mono text-xs">{edit.head_branch}</code>
        <span className="mx-2">&rarr;</span>
        <code className="font-mono text-xs">{edit.base_branch}</code>
        {edit.is_draft && <Badge variant="outline" className="ml-3 text-amber-600 border-amber-200 dark:text-amber-400 dark:border-amber-800">Draft</Badge>}
      </div>

      {/* Linked issues */}
      {linkedIssues.length > 0 && (
        <div className="mb-4 flex items-center gap-2 flex-wrap text-sm rounded-lg border border-border bg-card p-3">
          <CircleDot className="h-4 w-4 text-green-500" />
          <span className="text-muted-foreground">Linked issues:</span>
          {linkedIssues.map((n) => (
            <Link key={n} href={`/entries/${entryId}/issues/${n}`} className="hover:underline">
              <Badge variant="outline" className="text-xs gap-1 bg-green-50 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-300 dark:border-green-800">
                #{n}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      {/* Body */}
      {edit.body && (
        <div className="rounded-xl border border-border bg-card p-6 mb-6">
          <MarkdownContent content={edit.body} className="text-sm leading-relaxed" />
        </div>
      )}

      {/* Diff */}
      {edit.diff.length > 0 && (
        <div className="mb-6 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {edit.diff.length} file{edit.diff.length !== 1 ? "s" : ""} changed
          </h2>
          {edit.diff.map((f) => (
            <DiffBlock key={f.path} path={f.path} patch={f.patch} />
          ))}
        </div>
      )}
      {edit.diff.length === 0 && (
        <p className="mb-6 text-sm text-muted-foreground">No file changes in this proposal.</p>
      )}

      {/* Actions */}
      {actionError && (
        <p className="mb-3 text-xs text-red-600 dark:text-red-400">{actionError}</p>
      )}
      {edit.state === "open" && isLoggedIn && (
        <div className="flex items-center gap-2 pt-4 border-t border-border">
          <Button
            onClick={handleMerge}
            disabled={merging || closing}
            className="gap-1.5 bg-violet-600 hover:bg-violet-700 text-white"
          >
            {merging ? <Loader2 className="h-4 w-4 animate-spin" /> : <GitMerge className="h-4 w-4" />}
            Merge
          </Button>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={merging || closing}
            className="gap-1.5"
          >
            {closing ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
            Close
          </Button>
        </div>
      )}
    </div>
  );
}
