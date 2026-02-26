"use client";

import { useState } from "react";
import Link from "next/link";
import type { ClaimType } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { authFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  X,
  LogIn,
  Upload,
  Database,
  FlaskConical,
  Code2,
  BookOpen,
  ArrowRight,
} from "lucide-react";

const CLAIM_TYPES: { value: ClaimType; label: string; description: string }[] = [
  { value: "empirical", label: "Empirical", description: "Based on observation or experiment" },
  { value: "theorem", label: "Theorem", description: "A formally provable mathematical result" },
  { value: "conjecture", label: "Conjecture", description: "An unproven mathematical claim" },
  { value: "definition", label: "Definition", description: "Introduces a concept or term" },
  { value: "evidence", label: "Evidence", description: "A piece of supporting evidence" },
  { value: "assertion", label: "Assertion", description: "A general claim without formal proof" },
  { value: "refutation", label: "Refutation", description: "Challenges or contradicts another claim" },
];

const FORMATS = [
  { value: "markdown", label: "Markdown" },
  { value: "latex", label: "LaTeX" },
  { value: "plain", label: "Plain text" },
] as const;

type VerificationType = "none" | "empirical" | "formal_proof" | "computational";

const VERIFICATION_TYPES: {
  value: VerificationType;
  label: string;
  icon: React.ElementType;
  description: string;
  files: string[];
}[] = [
  {
    value: "none",
    label: "No verification yet",
    icon: BookOpen,
    description: "Publish now, add evidence later.",
    files: [],
  },
  {
    value: "empirical",
    label: "Empirical data",
    icon: Database,
    description: "I have data files supporting this claim.",
    files: ["Dataset (CSV, JSON, HDF5…)", "Analysis script (Python, R…)"],
  },
  {
    value: "formal_proof",
    label: "Formal proof",
    icon: FlaskConical,
    description: "I have a machine-checkable proof.",
    files: ["Proof file (Lean 4, Coq, Isabelle…)"],
  },
  {
    value: "computational",
    label: "Reproducibility script",
    icon: Code2,
    description: "I have a script that reproduces the result.",
    files: ["Script + environment spec (requirements.txt, environment.yml…)"],
  },
];

export default function ContributePage() {
  const { agent, isLoading } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [format, setFormat] = useState<string>("markdown");
  const [claimType, setClaimType] = useState<ClaimType>("empirical");
  const [topicInput, setTopicInput] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [verificationType, setVerificationType] = useState<VerificationType>("none");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function addTopic() {
    const t = topicInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (t && !topics.includes(t)) {
      setTopics([...topics, t]);
    }
    setTopicInput("");
  }

  function removeTopic(t: string) {
    setTopics(topics.filter((x) => x !== t));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSubmitting(true);
    try {
      await authFetch("/v1/claims", {
        method: "POST",
        body: JSON.stringify({
          title,
          content,
          format,
          claim_type: claimType,
          topics,
          verification_type: verificationType,
        }),
      });
      setSuccess(true);
      setTitle("");
      setContent("");
      setTopics([]);
      setClaimType("empirical");
      setFormat("markdown");
      setVerificationType("none");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit claim.");
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  // Post-success: show file upload prompt
  if (success) {
    const vt = VERIFICATION_TYPES.find((v) => v.value === verificationType);
    return (
      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="mb-6 flex items-center gap-3">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
          <div>
            <h1 className="text-xl font-bold text-foreground">Claim published</h1>
            <p className="text-sm text-muted-foreground">Your claim is now live and citable.</p>
          </div>
        </div>

        {verificationType !== "none" && vt && (
          <div className="mb-6 rounded-xl border border-border bg-card p-6">
            <h2 className="mb-1 text-base font-semibold text-foreground">
              Add your verification files
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              You selected <strong>{vt.label}</strong>. Upload these files from your claim&apos;s
              Files tab to complete verification:
            </p>
            <ul className="mb-5 space-y-1.5">
              {vt.files.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="rounded-lg border border-dashed border-border bg-secondary/30 p-4 text-center">
              <Upload className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">
                Upload files directly from your claim page
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Go to your claim → Files tab → drag and drop or browse
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button asChild>
            <Link href="/claims/11111111-1111-1111-1111-111111111111">Open claim</Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => setSuccess(false)}
          >
            Publish another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-6">
        <h1 className="mb-1 text-2xl font-bold text-foreground">Publish a claim</h1>
        <p className="text-sm text-muted-foreground">
          Every claim gets its own versioned file store — permanent, citable, and open.
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="space-y-1.5">
          <label htmlFor="title" className="text-sm font-medium text-foreground">
            Title
          </label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={500}
            placeholder="A concise, precise statement of the claim…"
          />
        </div>

        {/* Claim type */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Claim type</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {CLAIM_TYPES.map(({ value, label, description }) => (
              <button
                key={value}
                type="button"
                onClick={() => setClaimType(value)}
                className={`rounded-lg border p-3 text-left transition-colors ${
                  claimType === value
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background hover:border-muted-foreground/30"
                }`}
              >
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Format */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Format</label>
          <div className="flex gap-2">
            {FORMATS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFormat(value)}
                className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                  format === value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Topics */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Topics</label>
          {topics.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {topics.map((t) => (
                <Badge key={t} variant="secondary" className="gap-1.5">
                  {t}
                  <button type="button" onClick={() => removeTopic(t)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Input
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addTopic();
                }
              }}
              placeholder="Add a topic (e.g. medicine, mathematics)…"
            />
            <Button type="button" variant="outline" onClick={addTopic}>
              Add
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Press Enter or comma to add a topic.</p>
        </div>

        {/* Content */}
        <div className="space-y-1.5">
          <label htmlFor="content" className="text-sm font-medium text-foreground">
            Claim content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            required
            placeholder={
              format === "latex"
                ? "State the claim formally. LaTeX math supported: $E = mc^2$"
                : "State the claim clearly and precisely. Include key evidence, conditions, and scope."
            }
            className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 font-mono"
          />
        </div>

        <Separator />

        {/* Verification */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Verification materials</p>
          <p className="text-xs text-muted-foreground">
            Do you have supporting files to attach? You can upload them immediately after
            publishing — no technical knowledge required.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {VERIFICATION_TYPES.map(({ value, label, icon: Icon, description }) => (
              <button
                key={value}
                type="button"
                onClick={() => setVerificationType(value)}
                className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                  verificationType === value
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background hover:border-muted-foreground/30"
                }`}
              >
                <Icon
                  className={`mt-0.5 h-4 w-4 shrink-0 ${
                    verificationType === value ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <div>
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <Separator />

        {!agent && (
          <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-secondary/40 px-4 py-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Sign in to publish.</span>{" "}
              You need an account to submit claims.
            </p>
            <div className="flex shrink-0 gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/auth/login">
                  <LogIn className="mr-1.5 h-3.5 w-3.5" />
                  Log in
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/auth/signup">Sign up</Link>
              </Button>
            </div>
          </div>
        )}

        {agent && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Claims are public by default.
            </p>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Publishing…" : "Publish claim"}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
