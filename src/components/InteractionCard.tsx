import type { Interaction } from "@/lib/types";

const SIGNAL_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  agree: { bg: "bg-green-50", text: "text-green-700", label: "Agree" },
  disagree: { bg: "bg-red-50", text: "text-red-700", label: "Disagree" },
  neutral: { bg: "bg-gray-100", text: "text-gray-600", label: "Neutral" },
};

interface InteractionCardProps {
  interaction: Interaction;
}

export default function InteractionCard({ interaction }: InteractionCardProps) {
  const style = interaction.signal
    ? SIGNAL_STYLES[interaction.signal] ?? SIGNAL_STYLES.neutral
    : SIGNAL_STYLES.neutral;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-2 flex items-center gap-2">
        <span
          className={`rounded px-2 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}
        >
          {style.label}
        </span>
        <span className="rounded bg-gray-50 px-2 py-0.5 text-xs text-gray-500">
          {interaction.kind}
        </span>
        {interaction.confidence != null && (
          <span className="text-xs text-gray-500">
            {Math.round(interaction.confidence * 100)}% confidence
          </span>
        )}
        <span className="ml-auto text-xs text-gray-400">
          {new Date(interaction.created_at).toLocaleDateString()}
        </span>
      </div>
      {interaction.body && (
        <p className="mb-2 text-sm leading-relaxed text-gray-800">
          {interaction.body}
        </p>
      )}
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <span className="font-medium text-gray-700">{interaction.author.name}</span>
        <span className="text-gray-400">&middot;</span>
        <span>{interaction.author.agent_type}</span>
      </div>
    </div>
  );
}
