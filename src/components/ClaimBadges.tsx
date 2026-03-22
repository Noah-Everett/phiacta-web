import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  AlertCircle,
  Clock,
  HelpCircle,
  FlaskConical,
  XCircle,
} from "lucide-react";

// Claim type
export function ClaimTypeBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    empirical: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800",
    theorem: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800",
    conjecture: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
    definition: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700",
    proof: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
    evidence: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800",
    hypothesis: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800",
    refutation: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800",
    assertion: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
  };

  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-medium", styles[type] ?? styles.assertion)}
    >
      {type}
    </Badge>
  );
}

// Epistemic status
export function EpistemicBadge({ status }: { status: string }) {
  const config: Record<string, { icon: React.ElementType; label: string; className: string }> = {
    endorsed: {
      icon: CheckCircle,
      label: "endorsed",
      className:
        "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-300 dark:border-green-800",
    },
    disputed: {
      icon: AlertCircle,
      label: "disputed",
      className:
        "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800",
    },
    under_review: {
      icon: Clock,
      label: "under review",
      className:
        "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
    },
    unverified: {
      icon: HelpCircle,
      label: "unverified",
      className:
        "bg-muted text-muted-foreground border-border",
    },
  };

  const { icon: Icon, label, className } = config[status] ?? config.unverified;

  return (
    <Badge variant="outline" className={cn("gap-1 text-xs", className)}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}

// Verification status
export function VerificationBadge({ status }: { status: string }) {
  const config: Record<string, { icon: React.ElementType; label: string; className: string }> = {
    verified: {
      icon: CheckCircle,
      label: "verified",
      className:
        "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/50 dark:text-green-300 dark:border-green-800",
    },
    empirical: {
      icon: FlaskConical,
      label: "empirical",
      className:
        "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800",
    },
    submitted: {
      icon: Clock,
      label: "checking",
      className:
        "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800",
    },
    failed: {
      icon: XCircle,
      label: "failed",
      className:
        "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800",
    },
    unverified: {
      icon: HelpCircle,
      label: "no proof",
      className: "bg-muted text-muted-foreground border-border",
    },
  };

  const { icon: Icon, label, className } = config[status] ?? config.unverified;

  return (
    <Badge variant="outline" className={cn("gap-1 text-xs", className)}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}

// Confidence bar
export function ConfidenceBar({ value, count }: { value: number; count: number }) {
  const pct = Math.round(value * 100);
  const color =
    pct >= 80 ? "bg-green-500" : pct >= 60 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Community confidence</span>
        <span className="font-semibold tabular-nums text-foreground">{pct}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-muted-foreground">{count} signal{count !== 1 ? "s" : ""}</p>
    </div>
  );
}
