import type { Review } from "@/lib/types";

const VERDICT_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  endorse: { bg: "bg-green-50", text: "text-green-700", label: "Endorse" },
  dispute: { bg: "bg-red-50", text: "text-red-700", label: "Dispute" },
  neutral: { bg: "bg-gray-100", text: "text-gray-600", label: "Neutral" },
};

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const style = VERDICT_STYLES[review.verdict] ?? VERDICT_STYLES.neutral;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-2 flex items-center gap-2">
        <span
          className={`rounded px-2 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}
        >
          {style.label}
        </span>
        <span className="text-xs text-gray-500">
          {Math.round(review.confidence * 100)}% confidence
        </span>
        <span className="ml-auto text-xs text-gray-400">
          {new Date(review.created_at).toLocaleDateString()}
        </span>
      </div>
      {review.comment && (
        <p className="mb-2 text-sm leading-relaxed text-gray-800">
          {review.comment}
        </p>
      )}
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <span className="font-medium text-gray-700">{review.reviewer.name}</span>
        <span className="text-gray-400">&middot;</span>
        <span>{review.reviewer.agent_type}</span>
      </div>
    </div>
  );
}
