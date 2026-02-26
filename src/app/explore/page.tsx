"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ClaimTypeBadge,
  EpistemicBadge,
  VerificationBadge,
} from "@/components/ClaimBadges";
import { MOCK_CLAIMS } from "@/lib/mock-data";
import { Search, SlidersHorizontal, X, ThumbsUp, ThumbsDown, Minus } from "lucide-react";

const CLAIM_TYPES = [
  "empirical",
  "theorem",
  "conjecture",
  "definition",
  "evidence",
  "hypothesis",
  "refutation",
  "assertion",
];

const EPISTEMIC_STATUSES = ["endorsed", "disputed", "under_review", "unverified"];
const VERIFICATION_STATUSES = ["verified", "empirical", "submitted", "unverified", "failed"];

const ALL_TOPICS = Array.from(
  new Set(MOCK_CLAIMS.flatMap((c) => c.topics))
).sort();

function ExploreContent() {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedEpistemic, setSelectedEpistemic] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = MOCK_CLAIMS.filter((claim) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !claim.title.toLowerCase().includes(q) &&
        !claim.topics.some((t) => t.toLowerCase().includes(q))
      )
        return false;
    }
    if (selectedType && claim.claim_type !== selectedType) return false;
    if (selectedEpistemic && claim.epistemic_status !== selectedEpistemic) return false;
    if (selectedTopic && !claim.topics.includes(selectedTopic)) return false;
    return true;
  });

  const activeFilters = [selectedType, selectedEpistemic, selectedTopic].filter(Boolean).length;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6">
        <h1 className="mb-1 text-2xl font-bold text-foreground">Explore</h1>
        <p className="text-sm text-muted-foreground">
          Browse and filter claims across all disciplines.
        </p>
      </div>

      {/* Search + filter toggle */}
      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title or topic…"
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
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Claim type
              </p>
              <div className="flex flex-wrap gap-1.5">
                {CLAIM_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedType(selectedType === t ? null : t)}
                    className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                      selectedType === t
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Epistemic status
              </p>
              <div className="flex flex-wrap gap-1.5">
                {EPISTEMIC_STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedEpistemic(selectedEpistemic === s ? null : s)}
                    className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                      selectedEpistemic === s
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground"
                    }`}
                  >
                    {s.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Topics
              </p>
              <div className="flex flex-wrap gap-1.5">
                {ALL_TOPICS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTopic(selectedTopic === t ? null : t)}
                    className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                      selectedTopic === t
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {activeFilters > 0 && (
            <>
              <Separator className="my-3" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedType(null);
                  setSelectedEpistemic(null);
                  setSelectedTopic(null);
                }}
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
          {selectedType && (
            <Badge variant="secondary" className="gap-1.5 text-xs">
              {selectedType}
              <button onClick={() => setSelectedType(null)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedEpistemic && (
            <Badge variant="secondary" className="gap-1.5 text-xs">
              {selectedEpistemic.replace("_", " ")}
              <button onClick={() => setSelectedEpistemic(null)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {selectedTopic && (
            <Badge variant="secondary" className="gap-1.5 text-xs">
              {selectedTopic}
              <button onClick={() => setSelectedTopic(null)}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Results count */}
      <p className="mb-3 text-sm text-muted-foreground">
        {filtered.length} claim{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Claim list */}
      <div className="space-y-2">
        {filtered.map((claim) => (
          <Link
            key={claim.id}
            href={`/claims/${claim.id}`}
            className="group flex flex-col gap-2.5 rounded-xl border border-border bg-card p-5 transition hover:border-primary/30 hover:shadow-sm sm:flex-row sm:items-start sm:gap-4"
          >
            {/* Left: type + title */}
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <ClaimTypeBadge type={claim.claim_type} />
                <EpistemicBadge status={claim.epistemic_status} />
                <VerificationBadge status={claim.verification_status} />
              </div>
              <p className="text-sm font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
                {claim.title}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {claim.topics.slice(0, 4).map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full bg-secondary px-2 py-0 text-xs text-secondary-foreground"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: signals */}
            <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground sm:flex-col sm:items-end sm:gap-1">
              {claim.cached_confidence != null && (
                <span className="font-semibold tabular-nums text-foreground">
                  {Math.round(claim.cached_confidence * 100)}%
                </span>
              )}
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-0.5 text-green-600 dark:text-green-400">
                  <ThumbsUp className="h-3 w-3" /> {claim.agree_count}
                </span>
                <span className="flex items-center gap-0.5 text-red-500">
                  <ThumbsDown className="h-3 w-3" /> {claim.disagree_count}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(claim.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </Link>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-border py-16 text-center">
            <p className="text-sm text-muted-foreground">No claims match your filters.</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => {
                setSearch("");
                setSelectedType(null);
                setSelectedEpistemic(null);
                setSelectedTopic(null);
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
    <Suspense fallback={<div className="mx-auto max-w-6xl px-6 py-8">Loading…</div>}>
      <ExploreContent />
    </Suspense>
  );
}
