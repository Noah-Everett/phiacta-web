"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { submitVerification } from "@/lib/api";

const RUNNER_TYPES = [
  "python_script",
  "python_notebook",
  "r_script",
  "r_markdown",
  "julia",
  "lean4",
  "sympy",
];

const RUNNER_LABELS: Record<string, string> = {
  python_script: "Python Script",
  python_notebook: "Python Notebook",
  r_script: "R Script",
  r_markdown: "R Markdown",
  julia: "Julia",
  lean4: "Lean 4",
  sympy: "SymPy",
};

interface VerificationSubmitFormProps {
  claimId: string;
}

export default function VerificationSubmitForm({
  claimId,
}: VerificationSubmitFormProps) {
  const { agent } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [code, setCode] = useState("");
  const [runnerType, setRunnerType] = useState("python_script");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!agent) return null;

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
      >
        Submit Code for Verification
      </button>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSubmitting(true);
    try {
      await submitVerification(claimId, code, runnerType);
      setSuccess(true);
      setCode("");
      setExpanded(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit verification."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label
          htmlFor="runner-type"
          className="mb-1 block text-xs font-medium text-gray-700"
        >
          Runner Type
        </label>
        <select
          id="runner-type"
          value={runnerType}
          onChange={(e) => setRunnerType(e.target.value)}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
        >
          {RUNNER_TYPES.map((t) => (
            <option key={t} value={t}>
              {RUNNER_LABELS[t]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="verification-code"
          className="mb-1 block text-xs font-medium text-gray-700"
        >
          Verification Code
        </label>
        <textarea
          id="verification-code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows={12}
          required
          placeholder="Paste your verification code here..."
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 font-mono text-sm text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
        />
      </div>

      {error && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 px-3 py-2 text-xs text-green-700">
          Verification submitted successfully.
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
