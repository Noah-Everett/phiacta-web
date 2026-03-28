"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EntryTypeBadge, StatusBadge } from "@/components/EntryBadges";
import GraphView from "@/components/GraphView";
import GraphConfigPanel from "@/components/GraphConfigPanel";
import type { GraphConfig } from "@/components/GraphConfigPanel";
import { getInitials } from "@/lib/utils";
import { listEntries, searchEntries, findEntriesByTags, fetchGraph, getUser } from "@/lib/api";
import type { EntryListItem, PublicUserResponse, SearchResultItem, EntryTagItem, GraphResponse } from "@/lib/types";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  X,
  Tag,
  Shapes,
  List,
  GitFork,
} from "lucide-react";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 300;

const SORT_OPTIONS = [
  { value: "created_at:desc", label: "Newest first" },
  { value: "created_at:asc", label: "Oldest first" },
  { value: "updated_at:desc", label: "Recently updated" },
  { value: "updated_at:asc", label: "Least recently updated" },
] as const;

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

function toTagEntry(r: EntryTagItem): DisplayEntry {
  return {
    id: r.entry_id,
    title: r.title,
    entry_type: null,
    summary: null,
  };
}

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
] as const;


function ExploreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize from URL params
  const initialView = searchParams.get("view") === "graph" ? "graph" : "list";
  const initialQ = searchParams.get("q") ?? "";

  const [entries, setEntries] = useState<DisplayEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(initialQ);
  const [sortKey, setSortKey] = useState("created_at:desc");
  const [authors, setAuthors] = useState<Record<string, PublicUserResponse>>({});
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [tagMode, setTagMode] = useState<"and" | "or">("or");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filterTypes, setFilterTypes] = useState<string[]>([]);
  const [typeInput, setTypeInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [isTagFilterMode, setIsTagFilterMode] = useState(false);
  const authorsRef = useRef<Record<string, PublicUserResponse>>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Graph view state
  const [viewMode, setViewMode] = useState<"list" | "graph">(initialView);

  // Sync view mode and search to URL
  const updateUrl = useCallback((view: string, q: string) => {
    const params = new URLSearchParams();
    if (view === "graph") params.set("view", "graph");
    if (q.trim()) params.set("q", q.trim());
    const qs = params.toString();
    router.replace(`/explore${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [router]);

  const handleViewChange = useCallback((view: "list" | "graph") => {
    setViewMode(view);
    updateUrl(view, search);
  }, [search, updateUrl]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    updateUrl(viewMode, value);
  }, [viewMode, updateUrl]);
  const [graphData, setGraphData] = useState<GraphResponse | null>(null);
  const [graphLoading, setGraphLoading] = useState(false);
  const [graphError, setGraphError] = useState<string | null>(null);
  const [graphConfig, setGraphConfig] = useState<GraphConfig>({
    depth: 2,
    direction: "both",
    limit: 50,
    showLabels: true,
    scaleByConnections: true,
    centerForce: 0.3,
    repulsion: -350,
    linkForce: 0.3,
    linkDistance: 60,
  });
  const graphAbortRef = useRef<AbortController | null>(null);

  // Fetch graph data from entry IDs (seeds)
  const fetchGraphData = useCallback(async (seedIds: string[]) => {
    if (seedIds.length === 0) {
      setGraphData(null);
      return;
    }
    // Cancel previous request
    graphAbortRef.current?.abort();
    const controller = new AbortController();
    graphAbortRef.current = controller;

    setGraphLoading(true);
    setGraphError(null);
    try {
      const res = await fetchGraph({
        entry_ids: seedIds,
        depth: graphConfig.depth,
        direction: graphConfig.direction,
        limit: graphConfig.limit,
      });
      if (!controller.signal.aborted) {
        setGraphData(res);
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        setGraphError(err instanceof Error ? err.message : "Failed to load graph");
      }
    } finally {
      if (!controller.signal.aborted) {
        setGraphLoading(false);
      }
    }
  }, [graphConfig.depth, graphConfig.direction, graphConfig.limit]);

  // When view mode switches to graph or entries change, fetch graph
  useEffect(() => {
    if (viewMode !== "graph") return;
    const ids = entries.map((e) => e.id);
    fetchGraphData(ids);
  }, [viewMode, entries, fetchGraphData]);

  const handleGraphRecenter = useCallback((entryId: string) => {
    fetchGraphData([entryId]);
  }, [fetchGraphData]);

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
      const [field, dir] = sortKey.split(":");
      const filters: { status?: string; sort?: string; order?: string } = { sort: field, order: dir };
      if (statusFilter && statusFilter !== "all") filters.status = statusFilter;
      const res = await listEntries(PAGE_SIZE, pageOffset, filters);
      setEntries(res.items.map(toBrowseEntry));
      setTotal(res.total);
      setHasMore(res.has_more);
      setOffset(pageOffset);
      setIsSearchMode(false);
      setIsTagFilterMode(false);

      const uniqueIds = Array.from(new Set(res.items.map((e) => e.created_by)));
      await resolveAuthors(uniqueIds);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load entries");
    } finally {
      setLoading(false);
    }
  }, [resolveAuthors, sortKey, statusFilter]);

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

  const fetchByTags = useCallback(async (tags: string[], mode: "and" | "or", pageOffset: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await findEntriesByTags(tags, mode, PAGE_SIZE, pageOffset);
      setEntries(res.items.map(toTagEntry));
      setTotal(res.total);
      setHasMore(res.has_more);
      setOffset(pageOffset);
      setIsSearchMode(false);
      setIsTagFilterMode(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to filter by tags");
    } finally {
      setLoading(false);
    }
  }, []);

  // Determine the active fetch strategy based on current filters
  const fetchActive = useCallback((pageOffset: number) => {
    const trimmed = search.trim();
    if (trimmed) {
      fetchSearch(trimmed, pageOffset);
    } else if (filterTags.length > 0) {
      fetchByTags(filterTags, tagMode, pageOffset);
    } else {
      fetchBrowse(pageOffset);
    }
  }, [search, filterTags, tagMode, fetchSearch, fetchByTags, fetchBrowse]);

  // Initial load + re-fetch on sort/status/tag changes
  useEffect(() => {
    const trimmed = search.trim();
    if (!trimmed) {
      if (filterTags.length > 0) {
        fetchByTags(filterTags, tagMode, 0);
      } else {
        fetchBrowse(0);
      }
    }
  }, [fetchBrowse, filterTags, tagMode, fetchByTags]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = search.trim();
    if (!trimmed) {
      // Switch back to browse/tag mode
      if (isSearchMode) {
        if (filterTags.length > 0) {
          fetchByTags(filterTags, tagMode, 0);
        } else {
          fetchBrowse(0);
        }
      }
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
    fetchActive(newOffset);
  };

  const addFilterTag = (tag: string) => {
    const normalized = tag.trim().toLowerCase();
    if (normalized && !filterTags.includes(normalized)) {
      setFilterTags((prev) => [...prev, normalized]);
    }
  };

  const removeFilterTag = (tag: string) => {
    setFilterTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addFilterTag(tagInput);
      setTagInput("");
    }
  };

  const addFilterType = (type: string) => {
    const normalized = type.trim().toLowerCase();
    if (normalized && !filterTypes.includes(normalized)) {
      setFilterTypes((prev) => [...prev, normalized]);
    }
  };

  const removeFilterType = (type: string) => {
    setFilterTypes((prev) => prev.filter((t) => t !== type));
  };

  const handleTypeInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addFilterType(typeInput);
      setTypeInput("");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-foreground">Explore</h1>
          <p className="text-sm text-muted-foreground">
            Browse and search entries across all disciplines.
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            className="h-7 gap-1.5 px-2.5 text-xs"
            onClick={() => handleViewChange("list")}
          >
            <List className="h-3.5 w-3.5" />
            List
          </Button>
          <Button
            variant={viewMode === "graph" ? "default" : "ghost"}
            size="sm"
            className="h-7 gap-1.5 px-2.5 text-xs"
            onClick={() => handleViewChange("graph")}
          >
            <GitFork className="h-3.5 w-3.5" />
            Graph
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search entries..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Controls bar */}
      <div className="mb-3 flex items-center gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-[140px] text-sm">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent position="popper">
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sortKey}
          onValueChange={setSortKey}
          disabled={isSearchMode || isTagFilterMode}
        >
          <SelectTrigger className="h-9 w-[190px] text-sm">
            <ArrowUpDown className="h-3.5 w-3.5 shrink-0" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="h-5 w-px bg-border" />

        <div className="relative flex-1">
          <Shapes className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filter by type..."
            value={typeInput}
            onChange={(e) => setTypeInput(e.target.value)}
            onKeyDown={handleTypeInputKeyDown}
            className="pl-9"
          />
        </div>

        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filter by tag..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagInputKeyDown}
            className="pl-9"
          />
        </div>
      </div>

      {/* Active filters */}
      {(filterTypes.length > 0 || filterTags.length > 0) && (
        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          {filterTypes.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Types:</span>
              {filterTypes.map((type) => (
                <Badge key={type} variant="outline" className="gap-1 pr-1 text-xs">
                  {type}
                  <button
                    type="button"
                    onClick={() => removeFilterType(type)}
                    className="ml-0.5 rounded-sm hover:bg-muted-foreground/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-1.5 text-xs text-muted-foreground"
                onClick={() => setFilterTypes([])}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          {filterTags.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Tags:</span>
              {filterTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1 pr-1 text-xs">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeFilterTag(tag)}
                    className="ml-0.5 rounded-sm hover:bg-muted-foreground/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <Button
                variant={tagMode === "and" ? "default" : "outline"}
                size="sm"
                className="h-6 px-2 text-[10px]"
                onClick={() => setTagMode((m) => (m === "and" ? "or" : "and"))}
              >
                {tagMode.toUpperCase()}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-1.5 text-xs text-muted-foreground"
                onClick={() => setFilterTags([])}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Graph view */}
      {viewMode === "graph" && (
        <>
          <div className="mb-3">
            <p className="text-sm text-muted-foreground">
              {graphData
                ? `${graphData.nodes.length} node${graphData.nodes.length !== 1 ? "s" : ""}, ${graphData.edges.length} edge${graphData.edges.length !== 1 ? "s" : ""}`
                : "Loading graph..."}
            </p>
          </div>
          {graphLoading && (
            <div className="flex h-[500px] items-center justify-center rounded-xl border border-border bg-card">
              <p className="text-sm text-muted-foreground">Loading graph...</p>
            </div>
          )}
          {graphError && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {graphError}
            </div>
          )}
          {!graphLoading && !graphError && graphData && graphData.nodes.length > 0 && (
            <GraphView
              data={graphData}
              onRecenter={handleGraphRecenter}
              centerForce={graphConfig.centerForce}
              repulsion={graphConfig.repulsion}
              linkForce={graphConfig.linkForce}
              linkDistance={graphConfig.linkDistance}
              showLabels={graphConfig.showLabels}
              scaleByConnections={graphConfig.scaleByConnections}
              configPanel={<GraphConfigPanel config={graphConfig} onChange={setGraphConfig} />}
            />
          )}
          {!graphLoading && !graphError && graphData && graphData.nodes.length === 0 && (
            <div className="flex h-[500px] items-center justify-center rounded-xl border border-dashed border-border">
              <p className="text-sm text-muted-foreground">No references found. Try a different search or add references between entries.</p>
            </div>
          )}
        </>
      )}

      {/* List view */}
      {viewMode === "list" && loading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <EntryCardSkeleton key={i} />
          ))}
        </div>
      )}

      {viewMode === "list" && error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {viewMode === "list" && !loading && !error && (() => {
        const filteredEntries = filterTypes.length === 0
          ? entries
          : entries.filter((e) => e.entry_type !== null && filterTypes.includes(e.entry_type));
        const displayCount = filterTypes.length === 0 ? total : filteredEntries.length;
        return (
        <>
          <p className="mb-3 text-sm text-muted-foreground">
            {isSearchMode
              ? `${displayCount} result${displayCount !== 1 ? "s" : ""} for \u201c${search.trim()}\u201d`
              : isTagFilterMode
                ? `${displayCount} entr${displayCount !== 1 ? "ies" : "y"} tagged ${filterTags.map((t) => `\u201c${t}\u201d`).join(tagMode === "and" ? " & " : " | ")}`
                : `${displayCount} entr${displayCount !== 1 ? "ies" : "y"}`}
          </p>
          <div className="space-y-2">
            {filteredEntries.map((entry) => {
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
                        <Badge
                          key={t}
                          variant="secondary"
                          className="cursor-pointer text-[10px] px-1.5 py-0 hover:bg-primary/20"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addFilterTag(t);
                          }}
                        >
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

            {filteredEntries.length === 0 && (
              <div className="rounded-xl border border-dashed border-border py-16 text-center">
                <p className="text-sm text-muted-foreground">
                  {isSearchMode
                    ? "No entries match your search."
                    : isTagFilterMode
                      ? "No entries match those tags."
                      : filterTypes.length > 0
                        ? "No entries match those types."
                        : "No entries yet. Create one from the Post page."}
                </p>
                {(isSearchMode || isTagFilterMode || filterTypes.length > 0) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setSearch("");
                      setFilterTags([]);
                      setFilterTypes([]);
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
        );
      })()}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense>
      <ExploreContent />
    </Suspense>
  );
}
