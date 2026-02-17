interface VerificationBadgeProps {
  level: string | null | undefined;
  status: string | null | undefined;
  size?: "sm" | "lg";
}

const LEVEL_CONFIG: Record<string, { label: string; color: string }> = {
  l0_unverified: { label: "Unverified", color: "gray" },
  l1_syntax_checked: { label: "Syntax Checked", color: "yellow" },
  l2_code_runs: { label: "Code Runs", color: "blue" },
  l3_output_verified: { label: "Output Verified", color: "green" },
  l4_statistically_verified: { label: "Statistically Verified", color: "green" },
  l5_independently_replicated: { label: "Independently Replicated", color: "purple" },
  l6_formally_proven: { label: "Formally Proven", color: "amber" },
};

const COLOR_CLASSES: Record<string, string> = {
  gray: "bg-gray-100 text-gray-600",
  yellow: "bg-yellow-50 text-yellow-700",
  blue: "bg-blue-50 text-blue-700",
  green: "bg-green-50 text-green-700",
  purple: "bg-purple-50 text-purple-700",
  amber: "bg-amber-50 text-amber-700",
};

export default function VerificationBadge({
  level,
  status,
  size = "sm",
}: VerificationBadgeProps) {
  if (!level && !status) return null;

  const config = level ? LEVEL_CONFIG[level] : null;
  const label = config?.label ?? level ?? "Unknown";
  const colorKey = config?.color ?? "gray";
  const colorClass = COLOR_CLASSES[colorKey] ?? COLOR_CLASSES.gray;

  const sizeClass =
    size === "lg"
      ? "rounded-md px-3 py-1 text-sm font-medium"
      : "rounded px-2 py-0.5 text-xs font-medium";

  const statusSuffix =
    status === "pending" ? " (Pending)" : status === "failed" ? " (Failed)" : "";

  return (
    <span className={`${sizeClass} ${colorClass}`} title={`Verification: ${label}${statusSuffix}`}>
      {label}{statusSuffix}
    </span>
  );
}
