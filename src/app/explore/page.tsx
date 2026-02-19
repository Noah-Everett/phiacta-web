"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import ClaimCard from "@/components/ClaimCard";
import Pagination from "@/components/Pagination";
import { listClaims, listNamespaces, listSources } from "@/lib/api";
import type { Claim, Namespace, Source } from "@/lib/types";

const ITEMS_PER_PAGE = 20;

const CLAIM_TYPES = [
  "assertion",
  "definition",
  "theorem",
  "proof",
  "evidence",
  "law",
  "conjecture",
  "refutation",
  "hypothesis",
];

type Tab = "claims" | "namespaces" | "sources";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildNamespaceTree(namespaces: Namespace[]) {
  const byId = new Map(namespaces.map((ns) => [ns.id, ns]));
  const childrenOf = new Map<string | null, Namespace[]>();

  for (const ns of namespaces) {
    const parentKey = ns.parent_id;
    if (!childrenOf.has(parentKey)) childrenOf.set(parentKey, []);
    childrenOf.get(parentKey)!.push(ns);
  }

  const ordered: { ns: Namespace; depth: number }[] = [];
  function walk(node: Namespace, depth: number) {
    ordered.push({ ns: node, depth });
    for (const child of childrenOf.get(node.id) || []) walk(child, depth + 1);
  }

  // Roots: namespaces whose parent_id is null or references a non-existent parent
  for (const ns of namespaces) {
    if (!ns.parent_id || !byId.has(ns.parent_id)) {
      walk(ns, 0);
    }
  }

  return ordered;
}

// ---------------------------------------------------------------------------
// Claims Tab
// ---------------------------------------------------------------------------

function ClaimsTab({
  namespaces,
  nsMap,
}: {
  namespaces: Namespace[];
  nsMap: Map<string, string>;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const page = Number(searchParams.get("page")) || 1;
  const namespaceId = searchParams.get("namespace_id") || "";
  const claimType = searchParams.get("claim_type") || "";

  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const filters: { namespace_id?: string; claim_type?: string } = {};
    if (namespaceId) filters.namespace_id = namespaceId;
    if (claimType) filters.claim_type = claimType;

    listClaims(ITEMS_PER_PAGE, (page - 1) * ITEMS_PER_PAGE, filters)
      .then((data) => {
        setClaims(data.items);
        setHasMore(data.items.length === ITEMS_PER_PAGE);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [page, namespaceId, claimType]);

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.set("tab", "claims");
      params.delete("page");
      router.push(`/explore?${params.toString()}`);
    },
    [searchParams, router]
  );

  const setPage = useCallback(
    (p: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(p));
      router.push(`/explore?${params.toString()}`);
    },
    [searchParams, router]
  );

  return (
    <>
      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <select
          value={namespaceId}
          onChange={(e) => setParam("namespace_id", e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:focus:border-gray-400 dark:focus:ring-gray-400"
        >
          <option value="">All Namespaces</option>
          {namespaces.map((ns) => (
            <option key={ns.id} value={ns.id}>
              {ns.name}
            </option>
          ))}
        </select>

        <select
          value={claimType}
          onChange={(e) => setParam("claim_type", e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:focus:border-gray-400 dark:focus:ring-gray-400"
        >
          <option value="">All Types</option>
          {CLAIM_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <p className="py-12 text-center text-gray-400 dark:text-gray-500">Loading claims...</p>
      )}
      {error && (
        <p className="py-12 text-center text-red-400">Error: {error}</p>
      )}
      {!loading && !error && claims.length === 0 && (
        <p className="py-12 text-center text-gray-400 dark:text-gray-500">No claims found.</p>
      )}

      {!loading && !error && claims.length > 0 && (
        <>
          <div className="space-y-3">
            {claims.map((claim) => (
              <ClaimCard
                key={claim.id}
                claim={claim}
                namespaceName={nsMap.get(claim.namespace_id)}
              />
            ))}
          </div>
          <Pagination
            currentPage={page}
            hasMore={hasMore}
            onPageChange={setPage}
          />
        </>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Namespaces Tab
// ---------------------------------------------------------------------------

function NamespacesTab({ namespaces }: { namespaces: Namespace[] }) {
  const router = useRouter();
  const tree = buildNamespaceTree(namespaces);

  function handleClick(nsId: string) {
    router.push(`/explore?tab=claims&namespace_id=${nsId}`);
  }

  return (
    <div className="space-y-1">
      {tree.map(({ ns, depth }) => (
        <button
          key={ns.id}
          onClick={() => handleClick(ns.id)}
          className="flex w-full items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 text-left transition hover:border-gray-300 hover:shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600"
          style={{ marginLeft: depth * 24 }}
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{ns.name}</p>
            {ns.description && (
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{ns.description}</p>
            )}
          </div>
          <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
            {new Date(ns.created_at).toLocaleDateString()}
          </span>
        </button>
      ))}
      {namespaces.length === 0 && (
        <p className="py-12 text-center text-gray-400 dark:text-gray-500">No namespaces found.</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sources Tab
// ---------------------------------------------------------------------------

function SourcesTab() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = Number(searchParams.get("page")) || 1;

  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);

    listSources(ITEMS_PER_PAGE, (page - 1) * ITEMS_PER_PAGE)
      .then((data) => {
        setSources(data.items);
        setHasMore(data.items.length === ITEMS_PER_PAGE);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [page]);

  const setPage = useCallback(
    (p: number) => {
      const params = new URLSearchParams();
      params.set("tab", "sources");
      params.set("page", String(p));
      router.push(`/explore?${params.toString()}`);
    },
    [router]
  );

  if (loading)
    return (
      <p className="py-12 text-center text-gray-400 dark:text-gray-500">Loading sources...</p>
    );
  if (error)
    return <p className="py-12 text-center text-red-400">Error: {error}</p>;
  if (sources.length === 0)
    return (
      <p className="py-12 text-center text-gray-400 dark:text-gray-500">No sources found.</p>
    );

  return (
    <>
      <div className="space-y-3">
        {sources.map((src) => (
          <div
            key={src.id}
            className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {src.source_type}
              </span>
              <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
                {new Date(src.submitted_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {src.title || "Untitled"}
            </p>
            {src.external_ref && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{src.external_ref}</p>
            )}
          </div>
        ))}
      </div>
      <Pagination currentPage={page} hasMore={hasMore} onPageChange={setPage} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Main Explore Content
// ---------------------------------------------------------------------------

function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = (searchParams.get("tab") as Tab) || "claims";

  const [namespaces, setNamespaces] = useState<Namespace[]>([]);
  const [nsMap, setNsMap] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    listNamespaces()
      .then((data) => {
        setNamespaces(data.items);
        setNsMap(new Map(data.items.map((ns) => [ns.id, ns.name])));
      })
      .catch(() => {
        // Namespace fetch failure is non-fatal
      });
  }, []);

  function switchTab(tab: Tab) {
    const params = new URLSearchParams();
    params.set("tab", tab);
    router.push(`/explore?${params.toString()}`);
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "claims", label: "Claims" },
    { key: "namespaces", label: "Namespaces" },
    { key: "sources", label: "Sources" },
  ];

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">Explore</h1>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        Browse claims, namespaces, and sources in the knowledge graph.
      </p>

      {/* Tab bar */}
      <div className="mb-6 flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => switchTab(t.key)}
            className={`px-4 py-2 text-sm font-medium transition ${
              activeTab === t.key
                ? "border-b-2 border-gray-900 text-gray-900 dark:border-gray-100 dark:text-gray-100"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "claims" && (
        <ClaimsTab namespaces={namespaces} nsMap={nsMap} />
      )}
      {activeTab === "namespaces" && (
        <NamespacesTab namespaces={namespaces} />
      )}
      {activeTab === "sources" && <SourcesTab />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page (with Suspense boundary for useSearchParams)
// ---------------------------------------------------------------------------

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl px-6 py-10">Loading...</div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}
