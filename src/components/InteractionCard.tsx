import type { Interaction } from "@/lib/types";

const SIGNAL_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  agree: { bg: "bg-green-50 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400", label: "Agree" },
  disagree: { bg: "bg-red-50 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", label: "Disagree" },
  neutral: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-600 dark:text-gray-400", label: "Neutral" },
};

interface InteractionCardProps {
  interaction: Interaction;
}

export default function InteractionCard({ interaction }: InteractionCardProps) {
  const style = interaction.signal
    ? SIGNAL_STYLES[interaction.signal] ?? SIGNAL_STYLES.neutral
    : SIGNAL_STYLES.neutral;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-2 flex items-center gap-2">
        <span
          className={`rounded px-2 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}
        >
          {style.label}
        </span>
        <span className="rounded bg-gray-50 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
          {interaction.kind}
        </span>
        {interaction.confidence != null && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {Math.round(interaction.confidence * 100)}% confidence
          </span>
        )}
        <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
          {new Date(interaction.created_at).toLocaleDateString()}
        </span>
      </div>
      {interaction.body && (
        <p className="mb-2 text-sm leading-relaxed text-gray-800 dark:text-gray-200">
          {interaction.body}
        </p>
      )}
      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
        <span className="font-medium text-gray-700 dark:text-gray-300">{interaction.author.name}</span>
        <span className="text-gray-400 dark:text-gray-500">&middot;</span>
        <span>{interaction.author.agent_type}</span>
      </div>
    </div>
  );
}
