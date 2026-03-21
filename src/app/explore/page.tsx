"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LayoutHintBadge, StatusBadge } from "@/components/EntryBadges";
import { getInitials } from "@/lib/utils";
import { listEntries, getAgent } from "@/lib/api";
import type { EntryListItem, PublicAgentResponse } from "@/lib/types";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const PAGE_SIZE = 20;

function EntryCardSkeleton() {
  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-start sm:gap-4">
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-14" />
        </div>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <div className="flex gap-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-14" />
      </div>
    </div>
  );
}

export default function ExplorePage() {
  const [entries, setEntries] = useState<EntryListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedHint, setSelectedHint] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [authors, setAuthors] = useState<Record<string, PublicAgentResponse>>({});
  const [allHints, setAllHints] = useState<Set<string>>(new Set());
  const authorsRef = useRef<Record<string, PublicAgentResponse>>({});

  const fetchEntries = useCallback(async (pageOffset: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await listEntries(PAGE_SIZE, pageOffset);
      setEntries(res.items);
      setTotal(res.total);
      setHasMore(res.has_more);
      setOffset(pageOffset);

      // Accumulate layout hints across pages
      const pageHints = res.items.map((e) => e.layout_hint).filter(Boolean) as string[];
      setAllHints((prev) => {
        const next = new Set(prev);
        pageHints.forEach((h) => next.add(h));
        return next;
      });

      // Resolve unique author UUIDs (using ref to avoid stale closure)
      const uniqueIds = Array.from(new Set(res.items.map((e) => e.created_by)));
      const newIds = uniqueIds.filter((id) => !authorsRef.current[id]);
      if (newIds.length > 0) {
        const fetched = await Promise.allSettled(newIds.map((id) => getAgent(id)));
        const resolved: Record<string, PublicAgentResponse> = {};
        fetched.forEach((result, i) => {
          if (result.status === "fulfilled") {
            resolved[newIds[i]] = result.value;
          }
        });
        authorsRef.current = { ...authorsRef.current, ...resolved };
        setAuthors({ ...authorsRef.current });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load entries");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries(0);
  }, [fetchEntries]);

  // Client-side filter on current page only
  const filtered = entries.filter((entry) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !entry.title.toLowerCase().includes(q) &&
        !(entry.summary || "").toLowerCase().includes(q)
      )
        return false;
    }
    if (selectedHint && entry.layout_hint !== selectedHint) return false;
    return true;
  });

  const activeFilters = selectedHint ? 1 : 0;
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const availableHints = Array.from(allHints).sort();

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6">
        <h1 className="mb-1 text-2xl font-bold text-foreground">Explore</h1>
        <p className="text-sm text-muted-foreground">
          Browse and filter entries across all disciplines.
        </p>
      </div>

      {/* Search + filter toggle */}
      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filter this page by title or summary..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant={showFilters ? "secondary" : "outline"}
          size="icon"
          onClick={() => setShowFilters((v) => !v)}
          className="relative"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {activeFilters > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
              {activeFilters}
            </span>
          )}
        </Button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="mb-4 rounded-xl border border-border bg-card p-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Layout hint
            </p>
            <div className="flex flex-wrap gap-1.5">
              {availableHints.map((h) => (
                <button
                  key={h}
                  onClick={() => setSelectedHint(selectedHint === h ? null : h)}
                  className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                    selectedHint === h
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground"
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>
          {activeFilters > 0 && (
            <>
              <Separator className="my-3" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedHint(null)}
                className="gap-1.5 text-xs"
              >
                <X className="h-3 w-3" /> Clear all filters
              </Button>
            </>
          )}
        </div>
      )}

      {/* Active filter chips */}
      {activeFilters > 0 && !showFilters && (
        <div className="mb-4 flex flex-wrap gap-2">
          {selectedHint && (
            <Badge variant="secondary" className="gap-1.5 text-xs">
              {selectedHint}
              <button onClick={() => setSelectedHint(null)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <EntryCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Results */}
      {!loading && !error && (
        <>
          <p className="mb-3 text-sm text-muted-foreground">
            {search || selectedHint
              ? `${filtered.length} matching on this page`
              : `${total} entr${total !== 1 ? "ies" : "y"}`}
          </p>
          <div className="space-y-2">
            {filtered.map((entry) => {
              const author = authors[entry.created_by];
              return (
                <Link
                  key={entry.id}
                  href={`/entries/${entry.id}`}
                  className="group flex flex-col gap-2.5 rounded-xl border border-border bg-card p-5 transition hover:border-primary/30 hover:shadow-sm sm:flex-row sm:items-start sm:gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <LayoutHintBadge hint={entry.layout_hint} />
                      <StatusBadge status={entry.status} />
                    </div>
                    <p className="text-sm font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
                      {entry.title}
                    </p>
                    {entry.summary && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {entry.summary}
                      </p>
                    )}
                    {author && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Avatar className="h-4 w-4">
                          <AvatarFallback className="text-[8px]">
                            {getInitials(author.handle)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{author.handle}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground sm:flex-col sm:items-end sm:gap-1">
                    <span>{entry.content_format}</span>
                    <span>
                      {new Date(entry.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </Link>
              );
            })}

            {filtered.length === 0 && (
              <div className="rounded-xl border border-dashed border-border py-16 text-center">
                <p className="text-sm text-muted-foreground">
                  {entries.length === 0
                    ? "No entries yet. Create one from the Contribute page."
                    : "No entries match your filters."}
                </p>
                {entries.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setSearch("");
                      setSelectedHint(null);
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                disabled={offset === 0}
                onClick={() => fetchEntries(offset - PAGE_SIZE)}
                className="gap-1.5"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!hasMore}
                onClick={() => fetchEntries(offset + PAGE_SIZE)}
                className="gap-1.5"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
