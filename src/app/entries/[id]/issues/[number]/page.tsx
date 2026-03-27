"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import MarkdownContent from "@/components/MarkdownContent";
import {
  ChevronRight,
  CircleDot,
  MessageCircle,
  Loader2,
  X,
  GitMerge,
  RotateCcw,
} from "lucide-react";
import {
  getEntry,
  getEntryIssueDetail,
  getEntryEdits,
  closeIssue,
  addIssueComment,
  ApiError,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type {
  EntryDetailResponse,
  IssueDetail,
  EditProposalListItem,
} from "@/lib/types";

interface IssuePageProps {
  params: Promise<{ id: string; number: string }>;
}

export default function IssuePage({ params }: IssuePageProps) {
  const router = useRouter();
  const [entryId, setEntryId] = useState<string | null>(null);
  const [issueNumber, setIssueNumber] = useState<number | null>(null);
  const [entry, setEntry] = useState<EntryDetailResponse | null>(null);
  const [issue, setIssue] = useState<IssueDetail | null>(null);
  const [linkedPrs, setLinkedPrs] = useState<{ number: number; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [commentBody, setCommentBody] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const { user } = useAuth();
  const isLoggedIn = !!user;

  useEffect(() => {
    params.then((p) => {
      setEntryId(p.id);
      setIssueNumber(parseInt(p.number));
    });
  }, [params]);

  const loadData = useCallback(() => {
    if (!entryId || !issueNumber) return;
    setLoading(true);
    Promise.all([
      getEntry(entryId),
      getEntryIssueDetail(entryId, issueNumber),
      getEntryEdits(entryId),
    ])
      .then(([entryData, issueData, edits]) => {
        setEntry(entryData);
        setIssue(issueData);
        // Find PRs that reference this issue
        const linked = edits
          .filter((e) => e.body && [...e.body.matchAll(/(?:closes|fixes|resolves)\s+#(\d+)/gi)].some((m) => parseInt(m[1]) === issueNumber))
          .map((e) => ({ number: e.number, title: e.title }));
        setLinkedPrs(linked);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [entryId, issueNumber]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleClose = () => {
    if (!entryId || !issueNumber) return;
    setClosing(true);
    setActionError(null);
    closeIssue(entryId, issueNumber)
      .then(() => loadData())
      .catch((err) => setActionError(err instanceof Error ? err.message : "Close failed"))
      .finally(() => setClosing(false));
  };

  const handleComment = () => {
    if (!entryId || !issueNumber || !commentBody.trim()) return;
    setSubmittingComment(true);
    setCommentError(null);
    addIssueComment(entryId, issueNumber, commentBody.trim())
      .then(() => {
        setCommentBody("");
        loadData();
      })
      .catch((err) =>
        setCommentError(err instanceof Error ? err.message : "Failed to add comment"),
      )
      .finally(() => setSubmittingComment(false));
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

  if (error || !entry || !issue) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="mb-2 text-2xl font-bold text-foreground">Issue not found</h1>
        <p className="mb-4 text-sm text-muted-foreground">{error || "This issue does not exist."}</p>
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
        <span className="text-foreground">Issue #{issue.number}</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start gap-3 mb-3">
          <CircleDot className={`mt-1 h-5 w-5 shrink-0 ${issue.state === "open" ? "text-green-500" : "text-muted-foreground"}`} />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{issue.title}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge
                variant="outline"
                className={
                  issue.state === "open"
                    ? "text-green-700 border-green-200 bg-green-50 dark:text-green-300 dark:border-green-800 dark:bg-green-950/50"
                    : "text-muted-foreground border-border"
                }
              >
                {issue.state}
              </Badge>
              <span>{issue.author.handle} opened on {new Date(issue.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
              <span>&middot; {issue.comments_count} comment{issue.comments_count !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Linked PRs */}
      {linkedPrs.length > 0 && (
        <div className="mb-4 flex items-center gap-2 flex-wrap text-sm rounded-lg border border-border bg-card p-3">
          <GitMerge className="h-4 w-4 text-violet-500" />
          <span className="text-muted-foreground">Linked PRs:</span>
          {linkedPrs.map((pr) => (
            <Link
              key={pr.number}
              href={`/entries/${entryId}/edits/${pr.number}`}
              className="hover:underline"
            >
              <Badge variant="outline" className="text-xs gap-1 bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800">
                #{pr.number} {pr.title}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      {/* Body */}
      {issue.body && (
        <div className="rounded-xl border border-border bg-card p-6 mb-6">
          <MarkdownContent content={issue.body} className="text-sm leading-relaxed" />
        </div>
      )}

      {/* Comments */}
      {issue.comments.length > 0 && (
        <div className="space-y-4 mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {issue.comments.length} comment{issue.comments.length !== 1 ? "s" : ""}
          </h2>
          {issue.comments.map((c) => (
            <div key={c.id} className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-muted/50">
                <span className="text-sm font-medium text-foreground">{c.author.handle}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(c.created_at).toLocaleDateString("en-US", {
                    year: "numeric", month: "short", day: "numeric",
                  })}
                </span>
              </div>
              <div className="px-5 py-4">
                <MarkdownContent content={c.body} className="text-sm" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment Form */}
      {isLoggedIn && (
        <div className="rounded-xl border border-border bg-card p-5 mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Add a comment
          </h2>
          <textarea
            value={commentBody}
            onChange={(e) => setCommentBody(e.target.value)}
            placeholder="Leave a comment..."
            rows={4}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Markdown supported</span>
            <Button
              onClick={handleComment}
              disabled={submittingComment || !commentBody.trim()}
              className="gap-1.5"
            >
              {submittingComment && <Loader2 className="h-4 w-4 animate-spin" />}
              Comment
            </Button>
          </div>
          {commentError && (
            <p className="mt-2 text-xs text-red-600 dark:text-red-400">{commentError}</p>
          )}
        </div>
      )}

      {/* Actions */}
      {actionError && (
        <p className="mb-3 text-xs text-red-600 dark:text-red-400">{actionError}</p>
      )}
      {isLoggedIn && (
        <div className="flex items-center gap-2 pt-4 border-t border-border">
          {issue.state === "open" && (
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={closing}
              className="gap-1.5"
            >
              {closing ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
              Close issue
            </Button>
          )}
          {issue.state === "closed" && (
            <Button
              variant="outline"
              disabled
              title="Reopening not yet supported"
              className="gap-1.5"
            >
              <RotateCcw className="h-4 w-4" />
              Reopen issue
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
