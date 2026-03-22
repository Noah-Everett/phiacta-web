"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { LayoutHintBadge, StatusBadge } from "@/components/EntryBadges";
import { getInitials } from "@/lib/utils";
import { getUser, listEntries, getEntryIssues, getEntryEdits } from "@/lib/api";
import {
  ChevronRight,
  FileText,
  CircleDot,
  GitBranch,
  GitMerge,
  MessageCircle,
} from "lucide-react";
import type {
  PublicUserResponse,
  EntryListItem,
  IssueListItem,
  EditProposalListItem,
} from "@/lib/types";

interface AgentPageProps {
  params: Promise<{ id: string }>;
}

type ActivityType = "all" | "entry" | "issue" | "edit";

interface ActivityItem {
  type: "entry" | "issue" | "edit";
  date: string;
  entry?: EntryListItem;
  issue?: IssueListItem & { entryId: string; entryTitle: string };
  edit?: EditProposalListItem & { entryId: string; entryTitle: string };
}

export default function AgentPage({ params }: AgentPageProps) {
  const [id, setId] = useState<string | null>(null);
  const [user, setUser] = useState<PublicUserResponse | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [filter, setFilter] = useState<ActivityType>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [counts, setCounts] = useState({ entries: 0, issues: 0, edits: 0 });

  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    Promise.all([
      getUser(id),
      listEntries(200, 0),
    ])
      .then(async ([userData, entriesRes]) => {
        setUser(userData);
        const userEntries = entriesRes.items.filter((e) => e.created_by === id);

        const items: ActivityItem[] = userEntries.map((entry) => ({
          type: "entry" as const,
          date: entry.created_at,
          entry,
        }));

        // Fetch issues and edits for all user entries in parallel
        const [issueResults, editResults] = await Promise.all([
          Promise.allSettled(
            userEntries.map(async (entry) => {
              const entryIssues = await getEntryIssues(entry.id);
              return entryIssues.map((issue) => ({
                ...issue,
                entryId: entry.id,
                entryTitle: entry.title,
              }));
            })
          ),
          Promise.allSettled(
            userEntries.map(async (entry) => {
              const entryEdits = await getEntryEdits(entry.id);
              return entryEdits.map((edit) => ({
                ...edit,
                entryId: entry.id,
                entryTitle: entry.title,
              }));
            })
          ),
        ]);

        const allIssues = issueResults
          .filter((r): r is PromiseFulfilledResult<(IssueListItem & { entryId: string; entryTitle: string })[]> => r.status === "fulfilled")
          .flatMap((r) => r.value);

        const allEdits = editResults
          .filter((r): r is PromiseFulfilledResult<(EditProposalListItem & { entryId: string; entryTitle: string })[]> => r.status === "fulfilled")
          .flatMap((r) => r.value);

        for (const issue of allIssues) {
          items.push({ type: "issue", date: issue.created_at, issue });
        }
        for (const edit of allEdits) {
          items.push({ type: "edit", date: edit.created_at, edit });
        }

        items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setActivity(items);
        setCounts({
          entries: userEntries.length,
          issues: allIssues.length,
          edits: allEdits.length,
        });
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  const filtered = useMemo(
    () => filter === "all" ? activity : activity.filter((a) => a.type === filter),
    [activity, filter]
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8">
        <Skeleton className="h-4 w-32 mb-6" />
        <div className="flex gap-5 mb-6">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="mb-2 text-2xl font-bold text-foreground">User not found</h1>
        <p className="mb-4 text-sm text-muted-foreground">This user does not exist or the API is unavailable.</p>
        <Link href="/explore" className="text-sm text-primary hover:underline">Browse entries</Link>
      </div>
    );
  }

  const filterButtons: { value: ActivityType; label: string; count: number }[] = [
    { value: "all", label: "All", count: activity.length },
    { value: "entry", label: "Entries", count: counts.entries },
    { value: "issue", label: "Issues", count: counts.issues },
    { value: "edit", label: "Edits", count: counts.edits },
  ];

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/explore" className="hover:text-foreground transition-colors">
          Explore
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{user.handle}</span>
      </nav>

      {/* Profile header */}
      <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-start">
        <Avatar className="h-20 w-20 text-2xl">
          <AvatarFallback className="text-2xl font-semibold">
            {getInitials(user.handle)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <h1 className="mb-1 text-2xl font-bold text-foreground">{user.handle}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span>
              Joined{" "}
              {new Date(user.created_at).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </span>
            <Separator orientation="vertical" className="h-4" />
            <span>{counts.entries} entries</span>
            <span>{counts.issues} issues</span>
            <span>{counts.edits} edits</span>
          </div>
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Filter bar */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {filterButtons.map((btn) => (
          <Button
            key={btn.value}
            variant={filter === btn.value ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilter(btn.value)}
            className="gap-1.5"
          >
            {btn.label}
            <Badge
              variant="secondary"
              className="ml-0.5 text-xs py-0 px-1.5"
            >
              {btn.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Activity feed */}
      {filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((item, i) => {
            if (item.type === "entry" && item.entry) {
              const entry = item.entry;
              return (
                <Link
                  key={`entry-${entry.id}`}
                  href={`/entries/${entry.id}`}
                  className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition hover:border-primary/30 hover:shadow-sm"
                >
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground">Created entry</span>
                      <LayoutHintBadge hint={entry.layout_hint} />
                      <StatusBadge status={entry.status} />
                    </div>
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {entry.title}
                    </p>
                    {entry.summary && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{entry.summary}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(entry.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </Link>
              );
            }

            if (item.type === "issue" && item.issue) {
              const issue = item.issue;
              return (
                <Link
                  key={`issue-${issue.entryId}-${issue.number}`}
                  href={`/entries/${issue.entryId}/issues/${issue.number}`}
                  className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition hover:border-primary/30 hover:shadow-sm"
                >
                  <CircleDot className={`mt-0.5 h-4 w-4 shrink-0 ${issue.state === "open" ? "text-green-500" : "text-muted-foreground"}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground">
                        Opened issue on <span className="font-medium text-foreground">{issue.entryTitle}</span>
                      </span>
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
                      {issue.comments_count > 0 && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MessageCircle className="h-3 w-3" />
                          {issue.comments_count}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {issue.title}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(issue.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </Link>
              );
            }

            if (item.type === "edit" && item.edit) {
              const edit = item.edit;
              return (
                <Link
                  key={`edit-${edit.entryId}-${edit.number}`}
                  href={`/entries/${edit.entryId}/edits/${edit.number}`}
                  className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition hover:border-primary/30 hover:shadow-sm"
                >
                  {edit.merged_at ? (
                    <GitMerge className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
                  ) : edit.state === "open" ? (
                    <GitBranch className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                  ) : (
                    <GitBranch className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground">
                        Proposed edit on <span className="font-medium text-foreground">{edit.entryTitle}</span>
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          edit.state === "open"
                            ? "text-green-700 border-green-200 bg-green-50 dark:text-green-300 dark:border-green-800 dark:bg-green-950/50"
                            : "text-violet-700 border-violet-200 bg-violet-50 dark:text-violet-300 dark:border-violet-800 dark:bg-violet-950/50"
                        }
                      >
                        {edit.merged_at ? "merged" : edit.state}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {edit.title}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(edit.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </Link>
              );
            }

            return null;
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border py-12 text-center">
          <p className="text-sm text-muted-foreground">
            {filter === "all" ? "No activity yet." : `No ${filter === "entry" ? "entries" : filter === "issue" ? "issues" : "edits"} yet.`}
          </p>
        </div>
      )}
    </div>
  );
}
