"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import type { SearchResultItem } from "@/lib/types";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    setError(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    fetch(`${apiUrl}/v1/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    })
      .then((res) => res.json())
      .then((data) => {
        setResults(data.results || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [query]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Search Claims</h1>
      <SearchBar defaultValue={query} />

      {query ? (
        <div className="mt-8">
          <p className="mb-4 text-sm text-gray-500">
            Results for &ldquo;{query}&rdquo;
          </p>

          {loading && (
            <p className="py-12 text-center text-gray-400">Searching...</p>
          )}

          {error && (
            <p className="py-12 text-center text-red-400">Error: {error}</p>
          )}

          {!loading && !error && results.length === 0 && (
            <p className="py-12 text-center text-gray-400">
              No results found.
            </p>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-3">
              {results.map((r) => (
                <Link
                  key={r.claim.id}
                  href={`/claims/${r.claim.id}`}
                  className="block rounded-lg border border-gray-200 bg-white p-4 transition hover:border-gray-300 hover:shadow-sm"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                      {r.claim.claim_type}
                    </span>
                    <span
                      className={`ml-auto rounded px-2 py-0.5 text-xs font-medium ${
                        r.claim.status === "active"
                          ? "bg-green-50 text-green-700"
                          : "bg-yellow-50 text-yellow-700"
                      }`}
                    >
                      {r.claim.status}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-800">
                    {r.claim.content}
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                    <span>
                      {new Date(r.claim.created_at).toLocaleDateString()}
                    </span>
                    <span>Relevance: {(r.rank * 100).toFixed(0)}%</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        <p className="mt-12 text-center text-gray-400">
          Enter a query to search claims.
        </p>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl px-6 py-10">Loading...</div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
