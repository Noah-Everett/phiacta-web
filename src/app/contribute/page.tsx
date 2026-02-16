"use client";

import { useState } from "react";
import Link from "next/link";
import type { ClaimType } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { authFetch } from "@/lib/api";

const CLAIM_TYPES: ClaimType[] = [
  "assertion",
  "definition",
  "theorem",
  "proof",
  "evidence",
  "conjecture",
  "refutation",
];

export default function ContributePage() {
  const { agent, isLoading } = useAuth();
  const [content, setContent] = useState("");
  const [claimType, setClaimType] = useState<ClaimType>("assertion");
  const [namespace, setNamespace] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSubmitting(true);
    try {
      await authFetch("/v1/claims", {
        method: "POST",
        body: JSON.stringify({
          content,
          claim_type: claimType,
          namespace: namespace || undefined,
        }),
      });
      setSuccess(true);
      setContent("");
      setNamespace("");
      setClaimType("assertion");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit claim.");
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Sign in required</h1>
          <p className="mb-4 text-sm text-gray-500">
            You need to be logged in to contribute claims.
          </p>
          <Link
            href="/auth/login"
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            Log in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Contribute a Claim</h1>
      <p className="mb-8 text-sm text-gray-500">
        Add a new claim to the knowledge graph.
      </p>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
          Claim submitted successfully.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="claim-type" className="mb-1 block text-sm font-medium text-gray-700">
            Claim Type
          </label>
          <select
            id="claim-type"
            value={claimType}
            onChange={(e) => setClaimType(e.target.value as ClaimType)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          >
            {CLAIM_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="namespace" className="mb-1 block text-sm font-medium text-gray-700">
            Namespace
          </label>
          <input
            id="namespace"
            type="text"
            value={namespace}
            onChange={(e) => setNamespace(e.target.value)}
            placeholder="e.g. mathematics.topology"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>

        <div>
          <label htmlFor="content" className="mb-1 block text-sm font-medium text-gray-700">
            Claim Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            required
            placeholder="State the claim clearly and precisely..."
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Claim"}
        </button>
      </form>
    </div>
  );
}
