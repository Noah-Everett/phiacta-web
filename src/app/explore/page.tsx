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
import { MOCK_CLAIMS, MOCK_AGENTS } from "@/lib/mock-data";
import {
  Search,
  SlidersHorizontal,
  X,
  ThumbsUp,
  ThumbsDown,
  List,
  Network,
  Sparkles,
  CircleDot,
  BadgeCheck,
} from "lucide-react";

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

const ALL_TOPICS = Array.from(
  new Set(MOCK_CLAIMS.flatMap((c) => c.topics))
).sort();

type ViewMode = "browse" | "graph" | "semantic";

// Mock graph data for the graph view
const GRAPH_NODES = MOCK_CLAIMS.map((c) => ({
  id: c.id,
  title: c.title.slice(0, 40) + (c.title.length > 40 ? "…" : ""),
  type: c.claim_type,
  epistemic: c.epistemic_status,
  confidence: c.cached_confidence,
  x: 0,
  y: 0,
}));

// Rough layout positions for the demo graph
const POSITIONS: Record<string, { x: number; y: number }> = {
  "11111111-1111-1111-1111-111111111111": { x: 200, y: 160 },
  "22222222-2222-2222-2222-222222222222": { x: 480, y: 100 },
  "33333333-3333-3333-3333-333333333333": { x: 600, y: 260 },
  "44444444-4444-4444-4444-444444444444": { x: 420, y: 340 },
  "55555555-5555-5555-5555-555555555555": { x: 120, y: 320 },
  "66666666-6666-6666-6666-666666666666": { x: 340, y: 180 },
};

const EDGE_COLORS: Record<string, string> = {
  endorsed: "#22c55e",
  disputed: "#ef4444",
  under_review: "#f59e0b",
  unverified: "#6b7280",
};

function GraphView() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Legend */}
      <div className="border-b border-border px-5 py-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">Graph view</span>
        <Separator orientation="vertical" className="h-4" />
        {[
          { label: "Endorsed", color: "#22c55e" },
          { label: "Disputed", color: "#ef4444" },
          { label: "Under review", color: "#f59e0b" },
          { label: "Unverified", color: "#6b7280" },
        ].map(({ label, color }) => (
          <span key={label} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            {label}
          </span>
        ))}
        <span className="ml-auto text-muted-foreground/60">Demo — live graph uses real reference data</span>
      </div>

      {/* SVG canvas */}
      <div className="relative bg-secondary/20 overflow-hidden" style={{ height: 460 }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 760 460"
          className="absolute inset-0"
        >
          {/* Edges */}
          <line x1="420" y1="340" x2="600" y2="260" stroke="#a78bfa" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="4 3" />
          <line x1="200" y1="160" x2="480" y2="100" stroke="#6b7280" strokeWidth="1.5" strokeOpacity="0.3" strokeDasharray="4 3" />
          <line x1="340" y1="180" x2="200" y2="160" stroke="#6b7280" strokeWidth="1.5" strokeOpacity="0.3" strokeDasharray="4 3" />
          <line x1="420" y1="340" x2="200" y2="160" stroke="#22c55e" strokeWidth="2" strokeOpacity="0.35" />
          <line x1="600" y1="260" x2="480" y2="100" stroke="#6b7280" strokeWidth="1.5" strokeOpacity="0.3" />
        </svg>

        {/* Nodes */}
        {MOCK_CLAIMS.map((claim) => {
          const pos = POSITIONS[claim.id] ?? { x: 300, y: 230 };
          const color = EDGE_COLORS[claim.epistemic_status] ?? "#6b7280";
          const isHovered = hoveredId === claim.id;
          return (
            <Link
              key={claim.id}
              href={`/claims/${claim.id}`}
              style={{ left: pos.x - 20, top: pos.y - 20 }}
              className="absolute"
              onMouseEnter={() => setHoveredId(claim.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div
                className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 transition-all ${
                  isHovered ? "scale-125 shadow-lg" : "scale-100"
                }`}
                style={{
                  borderColor: color,
                  backgroundColor: `${color}22`,
                }}
              >
                <CircleDot className="h-4 w-4" style={{ color }} />
              </div>
              {isHovered && (
                <div
                  className="absolute left-1/2 top-full mt-2 z-10 w-52 -translate-x-1/2 rounded-lg border border-border bg-popover px-3 py-2 shadow-md"
                >
                  <p className="text-xs font-semibold text-foreground leading-snug">
                    {claim.title}
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground capitalize">
                    {claim.claim_type} · {claim.epistemic_status.replace("_", " ")}
                  </p>
                </div>
              )}
            </Link>
          );
        })}
      </div>

      <div className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
        Hover a node to preview · Click to open claim · Edges represent typed references (evidence, method, corroboration)
      </div>
    </div>
  );
}

function SemanticView({ search }: { search: string }) {
  const query = search.trim();

  // Mock semantic scoring: just ranks by title similarity for demo
  const scored = MOCK_CLAIMS.map((claim) => {
    const hasQuery =
      query && claim.title.toLowerCase().includes(query.toLowerCase());
    const rank = hasQuery ? 0.97 - Math.random() * 0.1 : 0.75 - Math.random() * 0.4;
    return { claim, rank };
  }).sort((a, b) => b.rank - a.rank);

  const author = (id: string) => MOCK_AGENTS.find((a) => a.id === id);

  return (
    <div>
      <div className="mb-4 flex items-start gap-3 rounded-xl border border-border bg-secondary/40 px-4 py-3">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium text-foreground">Semantic search</p>
          <p className="text-xs text-muted-foreground">
            Results ranked by embedding similarity to your query.{" "}
            {query
              ? <>Searching for: <em>&ldquo;{query}&rdquo;</em></>
              : "Enter a query above to rank by relevance."}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {scored.map(({ claim, rank }) => {
          const a = author(claim.created_by);
          return (
            <Link
              key={claim.id}
              href={`/claims/${claim.id}`}
              className="group flex gap-4 rounded-xl border border-border bg-card p-5 transition hover:border-primary/30 hover:shadow-sm"
            >
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <ClaimTypeBadge type={claim.claim_type} />
                  <EpistemicBadge status={claim.epistemic_status} />
                  {claim.verification_status === "verified" && (
                    <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                      <BadgeCheck className="h-3 w-3" />
                      verified
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
                  {claim.title}
                </p>
                {a && (
                  <p className="mt-1 text-xs text-muted-foreground">{a.name}</p>
                )}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1 text-xs">
                <span className="font-semibold tabular-nums text-foreground">
                  {Math.round(rank * 100)}%
                </span>
                <span className="text-muted-foreground">similarity</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function ExploreContent() {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedEpistemic, setSelectedEpistemic] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("browse");

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

  const views: { id: ViewMode; label: string; icon: React.ElementType; description: string }[] = [
    {
      id: "browse",
      label: "Browse",
      icon: List,
      description: "Filterable list of all claims",
    },
    {
      id: "graph",
      label: "Graph",
      icon: Network,
      description: "Reference graph — explore how claims connect",
    },
    {
      id: "semantic",
      label: "Semantic",
      icon: Sparkles,
      description: "Vector search — rank by embedding similarity",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6">
        <h1 className="mb-1 text-2xl font-bold text-foreground">Explore</h1>
        <p className="text-sm text-muted-foreground">
          Browse and filter claims across all disciplines.
        </p>
      </div>

      {/* View selector */}
      <div className="mb-5 flex flex-wrap gap-2">
        {views.map(({ id, label, icon: Icon, description }) => (
          <button
            key={id}
            onClick={() => setViewMode(id)}
            title={description}
            className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm transition-colors ${
              viewMode === id
                ? "border-primary bg-primary/5 text-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-muted-foreground/40"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Search + filter toggle — shown for browse + semantic */}
      {(viewMode === "browse" || viewMode === "semantic") && (
        <>
          <div className="mb-4 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={
                  viewMode === "semantic"
                    ? "Describe what you're looking for…"
                    : "Search by title or topic…"
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            {viewMode === "browse" && (
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
            )}
          </div>

          {/* Filters panel — browse only */}
          {viewMode === "browse" && showFilters && (
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

          {/* Active filter chips — browse only */}
          {viewMode === "browse" && activeFilters > 0 && !showFilters && (
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
        </>
      )}

      {/* View content */}
      {viewMode === "browse" && (
        <>
          <p className="mb-3 text-sm text-muted-foreground">
            {filtered.length} claim{filtered.length !== 1 ? "s" : ""}
          </p>
          <div className="space-y-2">
            {filtered.map((claim) => (
              <Link
                key={claim.id}
                href={`/claims/${claim.id}`}
                className="group flex flex-col gap-2.5 rounded-xl border border-border bg-card p-5 transition hover:border-primary/30 hover:shadow-sm sm:flex-row sm:items-start sm:gap-4"
              >
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
        </>
      )}

      {viewMode === "graph" && <GraphView />}

      {viewMode === "semantic" && <SemanticView search={search} />}
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
