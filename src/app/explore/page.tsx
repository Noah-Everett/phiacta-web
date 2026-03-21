"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LayoutHintBadge, StatusBadge } from "@/components/EntryBadges";
import { MOCK_ENTRIES } from "@/lib/mock-data";
import {
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

function ExploreContent() {
  const [search, setSearch] = useState("");
  const [selectedHint, setSelectedHint] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Derive available layout_hint values from the data
  const availableHints = Array.from(
    new Set(MOCK_ENTRIES.map((e) => e.layout_hint).filter(Boolean) as string[])
  ).sort();

  const filtered = MOCK_ENTRIES.filter((entry) => {
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
            placeholder="Search by title or summary..."
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

      {/* Results */}
      <p className="mb-3 text-sm text-muted-foreground">
        {filtered.length} entr{filtered.length !== 1 ? "ies" : "y"}
      </p>
      <div className="space-y-2">
        {filtered.map((entry) => (
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
        ))}

        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-border py-16 text-center">
            <p className="text-sm text-muted-foreground">No entries match your filters.</p>
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
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-6 py-8">Loading...</div>}>
      <ExploreContent />
    </Suspense>
  );
}
