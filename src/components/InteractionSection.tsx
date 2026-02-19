"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { getClaimInteractions, submitInteraction } from "@/lib/api";
import type { Interaction } from "@/lib/types";
import InteractionCard from "./InteractionCard";

interface InteractionSectionProps {
  claimId: string;
}

const SIGNALS = [
  { value: "agree", label: "Agree", activeClass: "bg-green-600 text-white" },
  { value: "disagree", label: "Disagree", activeClass: "bg-red-600 text-white" },
  { value: "neutral", label: "Neutral", activeClass: "bg-gray-700 text-white dark:bg-gray-300 dark:text-gray-900" },
] as const;

export default function InteractionSection({ claimId }: InteractionSectionProps) {
  const { agent } = useAuth();
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [kind, setKind] = useState<"vote" | "review">("vote");
  const [signal, setSignal] = useState<string>("agree");
  const [confidence, setConfidence] = useState(0.8);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getClaimInteractions(claimId)
      .then((res) => setInteractions(res.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [claimId]);

  const alreadyVoted =
    agent != null &&
    interactions.some(
      (i) => i.author.id === agent.id && i.signal != null && !i.deleted_at
    );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const newInteraction = await submitInteraction(
        claimId,
        kind,
        signal,
        confidence,
        kind === "review" ? (body.trim() || null) : null
      );
      setInteractions((prev) => [newInteraction, ...prev]);
      setExpanded(false);
      setBody("");
      setConfidence(0.8);
      setSignal("agree");
      setKind("vote");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
      <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
        Interactions ({interactions.length})
      </h2>

      {loading ? (
        <p className="text-sm text-gray-400 dark:text-gray-500">Loading interactions...</p>
      ) : interactions.length > 0 ? (
        <div className="space-y-3">
          {interactions.map((i) => (
            <InteractionCard key={i.id} interaction={i} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 dark:text-gray-500">No interactions yet.</p>
      )}

      {agent && !alreadyVoted && (
        <div className="mt-4">
          {!expanded ? (
            <button
              onClick={() => setExpanded(true)}
              className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
            >
              Add Vote or Review
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Kind
                </label>
                <div className="flex gap-2">
                  {(["vote", "review"] as const).map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setKind(k)}
                      className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                        kind === k
                          ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                      }`}
                    >
                      {k.charAt(0).toUpperCase() + k.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Signal
                </label>
                <div className="flex gap-2">
                  {SIGNALS.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setSignal(s.value)}
                      className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                        signal === s.value
                          ? s.activeClass
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Confidence: {Math.round(confidence * 100)}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={confidence}
                  onChange={(e) => setConfidence(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {kind === "review" && (
                <div>
                  <label
                    htmlFor="review-body"
                    className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300"
                  >
                    Review Body
                  </label>
                  <textarea
                    id="review-body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={3}
                    maxLength={10000}
                    required
                    placeholder="Provide your detailed review..."
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-gray-400 dark:focus:ring-gray-400"
                  />
                </div>
              )}

              {error && (
                <div className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300"
                >
                  {submitting ? "Submitting..." : `Submit ${kind.charAt(0).toUpperCase() + kind.slice(1)}`}
                </button>
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {agent && alreadyVoted && (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          You have already voted on this claim.
        </p>
      )}
    </section>
  );
}
