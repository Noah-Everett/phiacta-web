"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { ClaimType, Namespace } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { authFetch, listNamespaces } from "@/lib/api";

const CLAIM_TYPES: ClaimType[] = [
  "assertion",
  "definition",
  "theorem",
  "proof",
  "evidence",
  "conjecture",
  "refutation",
];

const FORMATS = ["markdown", "latex", "plain"] as const;

export default function ContributePage() {
  const { agent, isLoading } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [format, setFormat] = useState<string>("markdown");
  const [claimType, setClaimType] = useState<ClaimType>("assertion");
  const [namespaceId, setNamespaceId] = useState("");
  const [namespaces, setNamespaces] = useState<Namespace[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    listNamespaces()
      .then((res) => setNamespaces(res.items))
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSubmitting(true);
    try {
      await authFetch("/v1/claims", {
        method: "POST",
        body: JSON.stringify({
          title,
          content,
          format,
          claim_type: claimType,
          namespace_id: namespaceId,
        }),
      });
      setSuccess(true);
      setTitle("");
      setContent("");
      setNamespaceId("");
      setClaimType("assertion");
      setFormat("markdown");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit claim.");
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-sm text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">Sign in required</h1>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            You need to be logged in to contribute claims.
          </p>
          <Link
            href="/auth/login"
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
          >
            Log in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">Contribute a Claim</h1>
      <p className="mb-8 text-sm text-gray-500 dark:text-gray-400">
        Add a new claim to the knowledge graph.
      </p>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-900/30 dark:text-green-400">
          Claim submitted successfully.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={500}
            placeholder="A concise title for this claim..."
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-gray-400 dark:focus:ring-gray-400"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="claim-type" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Claim Type
            </label>
            <select
              id="claim-type"
              value={claimType}
              onChange={(e) => setClaimType(e.target.value as ClaimType)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-gray-400 dark:focus:ring-gray-400"
            >
              {CLAIM_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label htmlFor="format" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Format
            </label>
            <select
              id="format"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-gray-400 dark:focus:ring-gray-400"
            >
              {FORMATS.map((f) => (
                <option key={f} value={f}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="namespace" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Namespace
          </label>
          <select
            id="namespace"
            value={namespaceId}
            onChange={(e) => setNamespaceId(e.target.value)}
            required
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-gray-400 dark:focus:ring-gray-400"
          >
            <option value="">Select a namespace...</option>
            {namespaces.map((ns) => (
              <option key={ns.id} value={ns.id}>
                {ns.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="content" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Claim Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            required
            placeholder="State the claim clearly and precisely..."
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-gray-400 dark:focus:ring-gray-400"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
        >
          {submitting ? "Submitting..." : "Submit Claim"}
        </button>
      </form>
    </div>
  );
}
