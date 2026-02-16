"use client";

import { useState } from "react";
import type { ClaimType } from "@/lib/types";

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
  const [content, setContent] = useState("");
  const [claimType, setClaimType] = useState<ClaimType>("assertion");
  const [namespace, setNamespace] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: call submitClaim from api.ts once backend is connected
    alert("Backend not connected yet. Claim data logged to console.");
    console.log({ content, claim_type: claimType, namespace });
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Contribute a Claim</h1>
      <p className="mb-8 text-sm text-gray-500">
        Add a new claim to the knowledge graph.
      </p>

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
            placeholder="State the claim clearly and precisely..."
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>

        <button
          type="submit"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          Submit Claim
        </button>
      </form>
    </div>
  );
}
