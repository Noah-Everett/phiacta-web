"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { listEntries } from "@/lib/api";
import type { EntryListItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EntryTypeBadge, StatusBadge } from "@/components/EntryBadges";
import {
  Plus,
  ArrowRight,
  LogIn,
  Sparkles,
  ExternalLink,
  LayoutDashboard,
} from "lucide-react";

const STATUS_TABS = ["all", "active", "hidden", "archived"] as const;
type StatusTab = (typeof STATUS_TABS)[number];

function EntryCardSkeleton() {
  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-start sm:gap-4">
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-14" />
        </div>
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const daysAgo = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
  if (daysAgo < 7) {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [entries, setEntries] = useState<EntryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusTab, setStatusTab] = useState<StatusTab>("all");

  const fetchEntries = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all entries with a large limit, then filter client-side by created_by
      const res = await listEntries(200, 0, { sort: "updated_at", order: "desc" });
      const mine = res.items.filter((e) => e.created_by === userId);
      setEntries(mine);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load entries");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return;
    fetchEntries(user.id);
  }, [user, authLoading, fetchEntries]);

  // Auth loading skeleton
  if (authLoading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  // Not logged in — CTA
  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <Sparkles className="mx-auto mb-4 h-8 w-8 text-muted-foreground" />
          <h1 className="mb-2 text-2xl font-bold text-foreground">
            Your Dashboard
          </h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Sign in to see your entries and manage your knowledge.
          </p>
          <div className="flex justify-center gap-3">
            <Button asChild variant="outline">
              <Link href="/auth/login">
                <LogIn className="mr-1.5 h-3.5 w-3.5" />
                Log in
              </Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">
                Sign up <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const filtered =
    statusTab === "all"
      ? entries
      : entries.filter((e) => e.status === statusTab);

  const counts = {
    all: entries.length,
    active: entries.filter((e) => e.status === "active").length,
    hidden: entries.filter((e) => e.status === "hidden").length,
    archived: entries.filter((e) => e.status === "archived").length,
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-2xl font-bold text-foreground">My Entries</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {entries.length} entr{entries.length !== 1 ? "ies" : "y"} total
          </p>
        </div>
        <Button asChild>
          <Link href="/post">
            <Plus className="mr-1.5 h-4 w-4" />
            New entry
          </Link>
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <EntryCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!loading && !error && (
        <Tabs
          value={statusTab}
          onValueChange={(v) => setStatusTab(v as StatusTab)}
        >
          <TabsList>
            {STATUS_TABS.map((tab) => (
              <TabsTrigger key={tab} value={tab}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                <Badge
                  variant="secondary"
                  className="ml-1.5 px-1.5 py-0 text-[10px]"
                >
                  {counts[tab]}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {STATUS_TABS.map((tab) => (
            <TabsContent key={tab} value={tab}>
              <div className="space-y-2">
                {filtered.map((entry) => (
                  <div
                    key={entry.id}
                    className="group flex flex-col gap-2.5 rounded-xl border border-border bg-card p-5 transition hover:border-primary/30 hover:shadow-sm sm:flex-row sm:items-start sm:gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-1.5">
                        <EntryTypeBadge entryType={entry.entry_type} />
                        <StatusBadge status={entry.status} />
                        {entry.tags &&
                          entry.tags.slice(0, 3).map((t) => (
                            <Badge
                              key={t}
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0"
                            >
                              {t}
                            </Badge>
                          ))}
                        {entry.tags && entry.tags.length > 3 && (
                          <span className="text-[10px] text-muted-foreground">
                            +{entry.tags.length - 3}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold leading-snug text-foreground">
                        {entry.title || "Untitled"}
                      </p>
                      {entry.summary && (
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                          {entry.summary}
                        </p>
                      )}
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        Created {formatDate(entry.created_at)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end sm:gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-xs"
                        asChild
                      >
                        <Link href={`/entries/${entry.id}`}>
                          View
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}

                {filtered.length === 0 && (
                  <div className="rounded-xl border border-dashed border-border py-16 text-center">
                    <p className="text-sm text-muted-foreground">
                      {statusTab === "all"
                        ? "You haven't created any entries yet."
                        : `No ${statusTab} entries.`}
                    </p>
                    {statusTab === "all" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-3"
                        asChild
                      >
                        <Link href="/post">
                          <Plus className="mr-1.5 h-3.5 w-3.5" />
                          Create your first entry
                        </Link>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
