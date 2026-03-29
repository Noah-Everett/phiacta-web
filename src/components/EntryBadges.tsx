import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TYPE_STYLES: Record<string, string> = {
  empirical: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800",
  theorem: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800",
  conjecture: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
  definition: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700",
  proof: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
  evidence: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800",
  hypothesis: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800",
  refutation: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800",
  assertion: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
  argument: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800",
};

const DEFAULT_STYLE = "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700";

/**
 * Renders a badge for any entry_type value. Known types get specific colors;
 * unknown types render with a neutral style. Handles null gracefully.
 */
export function EntryTypeBadge({ entryType }: { entryType: string | null }) {
  const label = entryType || "entry";
  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-medium", TYPE_STYLES[label] ?? DEFAULT_STYLE)}
    >
      {label}
    </Badge>
  );
}

/** Visibility badge for entry visibility (public/private). */
export function VisibilityBadge({ visibility }: { visibility: string }) {
  const styles: Record<string, string> = {
    public: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    private: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  };
  return (
    <span className={cn("rounded px-2 py-0.5 text-xs font-medium", styles[visibility] ?? styles.public)}>
      {visibility}
    </span>
  );
}
