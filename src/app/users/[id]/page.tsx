"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VisibilityBadge } from "@/components/EntryBadges";
import { getInitials } from "@/lib/utils";
import { getUser, listEntries, getEntryIssues, getEntryEdits, getEntryTags } from "@/lib/api";
import {
  FileText,
  CircleDot,
  GitBranch,
  MessageCircle,
  CheckCircle2,
  ArrowUpDown,
} from "lucide-react";
import type {
  PublicUserResponse,
  EntryListItem,
  IssueListItem,
  EditProposalListItem,
} from "@/lib/types";

interface UserPageProps {
  params: Promise<{ id: string }>;
}

type FilterType = "all" | "entry" | "issue" | "edit";

interface ActivityItem {
  type: "entry" | "issue" | "edit";
  date: string;
  entry?: EntryListItem;
  issue?: IssueListItem & { entryId: string; entryTitle: string };
  edit?: EditProposalListItem & { entryId: string; entryTitle: string };
}

export default function UserPage({ params }: UserPageProps) {
  const { user: authUser } = useAuth();
  const [id, setId] = useState<string | null>(null);
  const [user, setUser] = useState<PublicUserResponse | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [metrics, setMetrics] = useState({
    entries: 0, issues: 0, edits: 0,
    topTags: [] as string[],
  });

  const isOwnProfile = authUser?.id === id;

  useEffect(() => { params.then((p) => setId(p.id)); }, [params]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    Promise.all([getUser(id), listEntries(200)])
      .then(async ([userData, entriesRes]) => {
        setUser(userData);
        const userEntries = entriesRes.items.filter((e) => e.created_by === id);
        const items: ActivityItem[] = userEntries.map((e) => ({ type: "entry", date: e.created_at, entry: e }));

        const [issueResults, editResults, tagResults] = await Promise.all([
          Promise.allSettled(userEntries.map(async (e) => {
            const issues = await getEntryIssues(e.id);
            return issues.map((i) => ({ ...i, entryId: e.id, entryTitle: e.title || "Untitled" }));
          })),
          Promise.allSettled(userEntries.map(async (e) => {
            const edits = await getEntryEdits(e.id);
            return edits.map((d) => ({ ...d, entryId: e.id, entryTitle: e.title || "Untitled" }));
          })),
          Promise.allSettled(userEntries.map(async (e) => {
            const res = await getEntryTags(e.id);
            return Array.isArray(res.tags) ? res.tags.map((t) => t.tag) : [];
          })),
        ]);

        const allIssues = issueResults.filter((r): r is PromiseFulfilledResult<any[]> => r.status === "fulfilled").flatMap((r) => r.value);
        const allEdits = editResults.filter((r): r is PromiseFulfilledResult<any[]> => r.status === "fulfilled").flatMap((r) => r.value);
        const allTags = tagResults.filter((r): r is PromiseFulfilledResult<string[]> => r.status === "fulfilled").flatMap((r) => r.value);

        const tagFreq: Record<string, number> = {};
        for (const t of allTags) tagFreq[t] = (tagFreq[t] || 0) + 1;

        for (const issue of allIssues) items.push({ type: "issue", date: issue.created_at, issue });
        for (const edit of allEdits) items.push({ type: "edit", date: edit.created_at, edit });
        items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setActivity(items);
        setMetrics({
          entries: userEntries.length,
          issues: allIssues.length,
          edits: allEdits.length,
          topTags: Object.entries(tagFreq).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([t]) => t),
        });
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  const filtered = useMemo(() => {
    const items = filter === "all" ? activity : activity.filter((a) => a.type === filter);
    if (sortOrder === "oldest") return [...items].reverse();
    return items;
  }, [activity, filter, sortOrder]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8 flex gap-4">
          <Skeleton className="h-16 w-16 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="mb-2 text-2xl font-bold text-foreground">User not found</h1>
        <p className="mb-4 text-sm text-muted-foreground">This user does not exist or the API is unavailable.</p>
        <Link href="/explore" className="text-sm text-primary hover:underline">Browse entries</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">

      {/* Profile header */}
      <div className="mb-8 flex gap-4 border-b border-border pb-6">
        <Avatar className="h-16 w-16 shrink-0 text-xl">
          <AvatarFallback className="text-xl font-semibold">{getInitials(user.username)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-foreground">{user.username}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Joined {new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
          {metrics.topTags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {metrics.topTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="px-2 py-0 text-[11px] font-normal">{tag}</Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filter + sort */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {([
            ["all", "All", activity.length],
            ["entry", "Entries", metrics.entries],
            ["issue", "Issues", metrics.issues],
            ["edit", "Changes", metrics.edits],
          ] as [FilterType, string, number][]).map(([val, label, count]) => (
            <Button
              key={val}
              variant={filter === val ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilter(val)}
              className="gap-1 text-xs"
            >
              {label} <span className="tabular-nums text-muted-foreground">{count}</span>
            </Button>
          ))}
        </div>
        <Select value={sortOrder} onValueChange={(val) => setSortOrder(val as "newest" | "oldest")}>
          <SelectTrigger size="sm" className="gap-1.5">
            <ArrowUpDown className="h-3.5 w-3.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-px">
          {filtered.map((item) => {
            if (item.type === "entry" && item.entry) {
              const e = item.entry;
              return (
                <Link key={`e-${e.id}`} href={`/entries/${e.id}`}
                  className="group -mx-3 flex items-start gap-3 rounded-lg p-3 transition hover:bg-accent/40">
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground transition-colors group-hover:text-primary">{e.title || "Untitled"}</p>
                      {isOwnProfile && e.visibility !== "public" && (
                        <VisibilityBadge visibility={e.visibility} />
                      )}
                    </div>
                    {e.summary && <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{e.summary}</p>}
                  </div>
                  <span className="mt-0.5 shrink-0 text-xs text-muted-foreground">
                    {new Date(e.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </Link>
              );
            }
            if (item.type === "issue" && item.issue) {
              const iss = item.issue;
              return (
                <Link key={`i-${iss.entryId}-${iss.number}`} href={`/entries/${iss.entryId}/issues/${iss.number}`}
                  className="group -mx-3 flex items-start gap-3 rounded-lg p-3 transition hover:bg-accent/40">
                  <CircleDot className={`mt-0.5 h-4 w-4 shrink-0 ${iss.state === "open" ? "text-green-500" : "text-muted-foreground"}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground transition-colors group-hover:text-primary">{iss.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      on {iss.entryTitle}
                      {iss.comments_count > 0 && <span className="ml-2 inline-flex items-center gap-0.5"><MessageCircle className="h-3 w-3" /> {iss.comments_count}</span>}
                    </p>
                  </div>
                  <span className="mt-0.5 shrink-0 text-xs text-muted-foreground">
                    {new Date(iss.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </Link>
              );
            }
            if (item.type === "edit" && item.edit) {
              const ed = item.edit;
              return (
                <Link key={`d-${ed.entryId}-${ed.number}`} href={`/entries/${ed.entryId}/edits/${ed.number}`}
                  className="group -mx-3 flex items-start gap-3 rounded-lg p-3 transition hover:bg-accent/40">
                  {ed.merged_at
                    ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    : <GitBranch className={`mt-0.5 h-4 w-4 shrink-0 ${ed.state === "open" ? "text-violet-500" : "text-muted-foreground"}`} />}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground transition-colors group-hover:text-primary">{ed.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      on {ed.entryTitle}
                      <Badge variant="outline" className={`ml-2 py-0 text-[10px] ${
                        ed.merged_at ? "border-emerald-200 text-emerald-700 dark:border-emerald-800 dark:text-emerald-300"
                        : ed.state === "open" ? "border-violet-200 text-violet-700 dark:border-violet-800 dark:text-violet-300"
                        : "border-border text-muted-foreground"
                      }`}>{ed.merged_at ? "accepted" : ed.state}</Badge>
                    </p>
                  </div>
                  <span className="mt-0.5 shrink-0 text-xs text-muted-foreground">
                    {new Date(ed.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </Link>
              );
            }
            return null;
          })}
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-sm text-muted-foreground">No activity yet.</p>
        </div>
      )}
    </div>
  );
}
