"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials } from "@/lib/utils";
import { getUser, getActivity, listEntries, getEntryTags } from "@/lib/api";
import {
  FileText,
  CircleDot,
  GitBranch,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";
import type {
  PublicUserResponse,
  ActivityItem,
} from "@/lib/types";

interface AgentPageProps {
  params: Promise<{ id: string }>;
}

type FilterType = "all" | "entry" | "issue" | "edit" | "comment";

function actionIcon(item: ActivityItem) {
  switch (item.action) {
    case "entry.created":
    case "entry.visibility_changed":
      return <FileText className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />;
    case "issue.created":
    case "issue.closed":
      return <CircleDot className={`mt-0.5 h-4 w-4 shrink-0 ${item.action === "issue.created" ? "text-green-500" : "text-muted-foreground"}`} />;
    case "issue.commented":
      return <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />;
    case "edit.created":
    case "edit.closed":
      return <GitBranch className={`mt-0.5 h-4 w-4 shrink-0 ${item.action === "edit.created" ? "text-violet-500" : "text-muted-foreground"}`} />;
    case "edit.merged":
      return <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />;
    default:
      return <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />;
  }
}

function actionLabel(action: string): string {
  switch (action) {
    case "entry.created": return "Published entry";
    case "entry.visibility_changed": return "Changed entry visibility";
    case "issue.created": return "Opened issue";
    case "issue.closed": return "Closed issue";
    case "issue.commented": return "Commented on issue";
    case "edit.created": return "Proposed change";
    case "edit.merged": return "Change accepted";
    case "edit.closed": return "Change closed";
    default: return action;
  }
}

function itemLink(item: ActivityItem): string | null {
  const parentId = item.parent_id;
  const meta = item.metadata;
  switch (item.entity_type) {
    case "entry":
      return `/entries/${item.entity_id}`;
    case "issue":
      return parentId && meta?.["external_ref"]
        ? `/entries/${parentId}/issues/${meta["external_ref"].replace("issues/", "")}`
        : parentId ? `/entries/${parentId}` : null;
    case "edit":
      return parentId && meta?.["external_ref"]
        ? `/entries/${parentId}/edits/${meta["external_ref"].replace("pulls/", "")}`
        : parentId ? `/entries/${parentId}` : null;
    case "comment":
      return parentId ? `/entries/${parentId}` : null;
    default:
      return null;
  }
}

function filterMatches(item: ActivityItem, filter: FilterType): boolean {
  if (filter === "all") return true;
  return item.entity_type === filter;
}

export default function AgentPage({ params }: AgentPageProps) {
  const [id, setId] = useState<string | null>(null);
  const [user, setUser] = useState<PublicUserResponse | null>(null);
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [metrics, setMetrics] = useState({
    entries: 0, topTags: [] as string[],
  });

  useEffect(() => { params.then((p) => setId(p.id)); }, [params]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    Promise.all([
      getUser(id),
      getActivity({ actor: id, limit: 100 }),
      listEntries(200, 0),
    ])
      .then(async ([userData, activityData, entriesRes]) => {
        setUser(userData);
        setItems(activityData.items);

        // Compute reach, entry index, and top tags from entries
        const userEntries = entriesRes.items.filter((e) => e.created_by === id);

        const [tagResults] = await Promise.all([
          Promise.allSettled(
            userEntries.map(async (e) => {
              const res = await getEntryTags(e.id);
              return Array.isArray(res.tags) ? res.tags.map((t) => t.tag) : [];
            })
          ),
        ]);

        const allTags = tagResults.filter((r): r is PromiseFulfilledResult<string[]> => r.status === "fulfilled").flatMap((r) => r.value);

        const tagFreq: Record<string, number> = {};
        for (const t of allTags) tagFreq[t] = (tagFreq[t] || 0) + 1;

        setMetrics({
          entries: userEntries.length,
          topTags: Object.entries(tagFreq).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([t]) => t),
        });
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  const filtered = useMemo(
    () => items.filter((i) => filterMatches(i, filter)),
    [items, filter]
  );

  const counts = useMemo(() => {
    const c = { entry: 0, issue: 0, edit: 0, comment: 0 };
    for (const i of items) {
      if (i.entity_type in c) c[i.entity_type as keyof typeof c]++;
    }
    return c;
  }, [items]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="flex gap-4 mb-8">
          <Skeleton className="h-16 w-16 rounded-full shrink-0" />
          <div className="space-y-2 flex-1">
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
      <div className="flex gap-4 mb-8">
        <Avatar className="h-16 w-16 text-xl shrink-0">
          <AvatarFallback className="text-xl font-semibold">{getInitials(user.handle)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-foreground">{user.handle}</h1>
          <p className="text-sm text-muted-foreground mb-2">
            Joined {new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
          {metrics.topTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {metrics.topTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[11px] font-normal px-2 py-0">{tag}</Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="flex gap-8 mb-8 pb-6 border-b border-border">
        {[
          { label: "Entries", value: metrics.entries },
        ].map(({ label, value }) => (
          <div key={label}>
            <div className="text-2xl font-bold tabular-nums text-foreground">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        {([
          ["all", "All", items.length],
          ["entry", "Entries", counts.entry],
          ["issue", "Issues", counts.issue],
          ["edit", "Changes", counts.edit],
        ] as [FilterType, string, number][]).map(([val, label, count]) => (
          <Button
            key={val}
            variant={filter === val ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilter(val)}
            className="text-xs gap-1"
          >
            {label} <span className="text-muted-foreground tabular-nums">{count}</span>
          </Button>
        ))}
      </div>

      {/* Activity feed */}
      {filtered.length > 0 ? (
        <div className="space-y-px">
          {filtered.map((item) => {
            const link = itemLink(item);
            const meta = item.metadata || {};
            const title = meta["title"] || meta["entry_title"] || "";
            const entryTitle = meta["entry_title"] || "";
            const inner = (
              <>
                {actionIcon(item)}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {title || actionLabel(item.action)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {actionLabel(item.action)}
                    {entryTitle && title !== entryTitle && <> on {entryTitle}</>}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground mt-0.5">
                  {new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </>
            );

            return link ? (
              <Link
                key={item.id}
                href={link}
                className="group flex items-start gap-3 rounded-lg p-3 -mx-3 hover:bg-accent/40 transition"
              >
                {inner}
              </Link>
            ) : (
              <div key={item.id} className="flex items-start gap-3 rounded-lg p-3 -mx-3">
                {inner}
              </div>
            );
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
