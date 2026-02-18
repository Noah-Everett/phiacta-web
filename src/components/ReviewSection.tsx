"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { getClaimReviews, submitReview } from "@/lib/api";
import type { Review } from "@/lib/types";
import ReviewCard from "./ReviewCard";

interface ReviewSectionProps {
  claimId: string;
}

const VERDICTS = [
  { value: "endorse", label: "Endorse", activeClass: "bg-green-600 text-white" },
  { value: "dispute", label: "Dispute", activeClass: "bg-red-600 text-white" },
  { value: "neutral", label: "Neutral", activeClass: "bg-gray-700 text-white" },
] as const;

export default function ReviewSection({ claimId }: ReviewSectionProps) {
  const { agent } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [verdict, setVerdict] = useState<string>("endorse");
  const [confidence, setConfidence] = useState(0.8);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getClaimReviews(claimId)
      .then(setReviews)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [claimId]);

  const alreadyReviewed =
    agent != null && reviews.some((r) => r.reviewer.id === agent.id);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const newReview = await submitReview(
        claimId,
        verdict,
        confidence,
        comment.trim() || null
      );
      setReviews((prev) => [newReview, ...prev]);
      setExpanded(false);
      setComment("");
      setConfidence(0.8);
      setVerdict("endorse");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit review."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="mb-3 text-lg font-semibold text-gray-900">
        Reviews ({reviews.length})
      </h2>

      {loading ? (
        <p className="text-sm text-gray-400">Loading reviews...</p>
      ) : reviews.length > 0 ? (
        <div className="space-y-3">
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400">No reviews yet.</p>
      )}

      {agent && !alreadyReviewed && (
        <div className="mt-4">
          {!expanded ? (
            <button
              onClick={() => setExpanded(true)}
              className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
            >
              Write a Review
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border border-gray-200 p-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Verdict
                </label>
                <div className="flex gap-2">
                  {VERDICTS.map((v) => (
                    <button
                      key={v.value}
                      type="button"
                      onClick={() => setVerdict(v.value)}
                      className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                        verdict === v.value
                          ? v.activeClass
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
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

              <div>
                <label
                  htmlFor="review-comment"
                  className="mb-1 block text-xs font-medium text-gray-700"
                >
                  Comment (optional)
                </label>
                <textarea
                  id="review-comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  maxLength={10000}
                  placeholder="Add context for your review..."
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                />
              </div>

              {error && (
                <div className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Review"}
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
          )}
        </div>
      )}

      {agent && alreadyReviewed && (
        <p className="mt-4 text-sm text-gray-500">
          You have already reviewed this claim.
        </p>
      )}
    </section>
  );
}
