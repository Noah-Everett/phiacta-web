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

export default function ContributePage() {
  const { agent, isLoading } = useAuth();
  const [content, setContent] = useState("");
  const [claimType, setClaimType] = useState<ClaimType>("assertion");
  const [namespaceId, setNamespaceId] = useState("");
  const [namespaces, setNamespaces] = useState<Namespace[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationRunnerType, setVerificationRunnerType] = useState("python_script");

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
      const payload: Record<string, unknown> = {
        content,
        claim_type: claimType,
        namespace_id: namespaceId,
      };
      if (showVerification && verificationCode.trim()) {
        payload.verification_code = verificationCode;
        payload.verification_runner_type = verificationRunnerType;
      }
      await authFetch("/v1/claims", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setSuccess(true);
      setContent("");
      setNamespaceId("");
      setClaimType("assertion");
      setVerificationCode("");
      setShowVerification(false);
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
          <select
            id="namespace"
            value={namespaceId}
            onChange={(e) => setNamespaceId(e.target.value)}
            required
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
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

        <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
          <button
            type="button"
            onClick={() => setShowVerification(!showVerification)}
            className="flex w-full items-center justify-between text-sm font-medium text-gray-700"
          >
            Attach Verification Code
            <svg
              className={`h-4 w-4 transition-transform ${showVerification ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showVerification && (
            <div className="mt-4 space-y-4">
              <p className="text-xs text-gray-500">
                For computational claims, attach the code that produces your results.
              </p>
              <div>
                <label
                  htmlFor="runner-type"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Runner Type
                </label>
                <select
                  id="runner-type"
                  value={verificationRunnerType}
                  onChange={(e) => setVerificationRunnerType(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                >
                  <option value="python_script">Python Script</option>
                  <option value="python_notebook">Python Notebook</option>
                  <option value="r_script">R Script</option>
                  <option value="r_markdown">R Markdown</option>
                  <option value="julia">Julia</option>
                  <option value="lean4">Lean 4</option>
                  <option value="sympy">SymPy</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="verification-code"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Code
                </label>
                <textarea
                  id="verification-code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  rows={12}
                  maxLength={512000}
                  placeholder="Paste your verification code here..."
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 font-mono text-sm text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                />
              </div>
            </div>
          )}
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
