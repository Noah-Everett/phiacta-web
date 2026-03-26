"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EntryTypeBadge, StatusBadge } from "@/components/EntryBadges";
import { getInitials } from "@/lib/utils";
import { listEntries, searchEntries, getUser } from "@/lib/api";
import type { EntryListItem, PublicUserResponse, SearchResultItem } from "@/lib/types";
import {
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

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

/** Unified card shape for both browse and search results. */
interface DisplayEntry {
  id: string;
  title: string | null;
  entry_type: string | null;
  summary: string | null;
  tags?: string[];
  // Browse-only fields (absent when searching)
  status?: string;
  created_by?: string;
  created_at?: string;
}

function toBrowseEntry(e: EntryListItem): DisplayEntry {
  return {
    id: e.id,
    title: e.title,
    entry_type: e.entry_type,
    summary: e.summary,
    tags: e.tags,
    status: e.status,
    created_by: e.created_by,
    created_at: e.created_at,
  };
}

function toSearchEntry(r: SearchResultItem): DisplayEntry {
  return {
    id: r.entry_id,
    title: r.title,
    entry_type: r.entry_type,
    summary: r.summary,
  };
}

export default function ExplorePage() {
  const [entries, setEntries] = useState<DisplayEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [authors, setAuthors] = useState<Record<string, PublicUserResponse>>({});
  const [isSearchMode, setIsSearchMode] = useState(false);
  const authorsRef = useRef<Record<string, PublicUserResponse>>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resolveAuthors = useCallback(async (ids: string[]) => {
    const newIds = ids.filter((id) => !authorsRef.current[id]);
    if (newIds.length === 0) return;
    const fetched = await Promise.allSettled(newIds.map((id) => getUser(id)));
    const resolved: Record<string, PublicUserResponse> = {};
    fetched.forEach((result, i) => {
      if (result.status === "fulfilled") {
        resolved[newIds[i]] = result.value;
      }
    });
    authorsRef.current = { ...authorsRef.current, ...resolved };
    setAuthors({ ...authorsRef.current });
  }, []);

  const fetchBrowse = useCallback(async (pageOffset: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await listEntries(PAGE_SIZE, pageOffset);
      setEntries(res.items.map(toBrowseEntry));
      setTotal(res.total);
      setHasMore(res.has_more);
      setOffset(pageOffset);
      setIsSearchMode(false);

      const uniqueIds = Array.from(new Set(res.items.map((e) => e.created_by)));
      await resolveAuthors(uniqueIds);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load entries");
    } finally {
      setLoading(false);
    }
  }, [resolveAuthors]);

  const fetchSearch = useCallback(async (query: string, pageOffset: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await searchEntries(query, PAGE_SIZE, pageOffset);
      setEntries(res.items.map(toSearchEntry));
      setTotal(res.total);
      setHasMore(res.has_more);
      setOffset(pageOffset);
      setIsSearchMode(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchBrowse(0);
  }, [fetchBrowse]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = search.trim();
    if (!trimmed) {
      // Switch back to browse mode
      if (isSearchMode) fetchBrowse(0);
      return;
    }

    debounceRef.current = setTimeout(() => {
      fetchSearch(trimmed, 0);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handlePageChange = (newOffset: number) => {
    const trimmed = search.trim();
    if (trimmed) {
      fetchSearch(trimmed, newOffset);
    } else {
      fetchBrowse(newOffset);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6">
        <h1 className="mb-1 text-2xl font-bold text-foreground">Explore</h1>
        <p className="text-sm text-muted-foreground">
          Browse and search entries across all disciplines.
        </p>
      </div>

      {/* Search */}
      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search entries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

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
            {isSearchMode
              ? `${total} result${total !== 1 ? "s" : ""} for "${search.trim()}"`
              : `${total} entr${total !== 1 ? "ies" : "y"}`}
          </p>
          <div className="space-y-2">
            {entries.map((entry) => {
              const author = entry.created_by ? authors[entry.created_by] : undefined;
              return (
                <Link
                  key={entry.id}
                  href={`/entries/${entry.id}`}
                  className="group flex flex-col gap-2.5 rounded-xl border border-border bg-card p-5 transition hover:border-primary/30 hover:shadow-sm sm:flex-row sm:items-start sm:gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-1.5">
                      <EntryTypeBadge entryType={entry.entry_type} />
                      {entry.tags && entry.tags.slice(0, 4).map((t) => (
                        <Badge key={t} variant="secondary" className="text-[10px] px-1.5 py-0">
                          {t}
                        </Badge>
                      ))}
                      {entry.tags && entry.tags.length > 4 && (
                        <span className="text-[10px] text-muted-foreground">+{entry.tags.length - 4}</span>
                      )}
                    </div>
                    <p className="text-sm font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
                      {entry.title || "Untitled"}
                    </p>
                    {entry.summary && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {entry.summary}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground sm:flex-col sm:items-end sm:gap-1.5">
                    {author && (
                      <div className="flex items-center gap-1.5">
                        <Avatar className="h-4 w-4">
                          <AvatarFallback className="text-[8px]">
                            {getInitials(author.handle)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{author.handle}</span>
                      </div>
                    )}
                    {entry.status && <StatusBadge status={entry.status} />}
                    {entry.created_at && (() => {
                      const created = new Date(entry.created_at);
                      const daysAgo = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
                      return (
                        <span>
                          {daysAgo < 7
                            ? created.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
                            : created.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                        </span>
                      );
                    })()}
                  </div>
                </Link>
              );
            })}

            {entries.length === 0 && (
              <div className="rounded-xl border border-dashed border-border py-16 text-center">
                <p className="text-sm text-muted-foreground">
                  {isSearchMode
                    ? "No entries match your search."
                    : "No entries yet. Create one from the Post page."}
                </p>
                {isSearchMode && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => setSearch("")}
                  >
                    Clear search
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
                onClick={() => handlePageChange(offset - PAGE_SIZE)}
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
                onClick={() => handlePageChange(offset + PAGE_SIZE)}
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
