"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { createEntry, setEntryTags } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  LogIn,
  X,
} from "lucide-react";

const LAYOUT_HINTS = [
  { value: "empirical", label: "Empirical", description: "Based on observation or experiment" },
  { value: "theorem", label: "Theorem", description: "A formally provable mathematical result" },
  { value: "conjecture", label: "Conjecture", description: "An unproven mathematical claim" },
  { value: "definition", label: "Definition", description: "Introduces a concept or term" },
  { value: "evidence", label: "Evidence", description: "A piece of supporting evidence" },
  { value: "assertion", label: "Assertion", description: "A general claim without formal proof" },
  { value: "refutation", label: "Refutation", description: "Challenges or contradicts another entry" },
];

const FORMATS = [
  { value: "markdown", label: "Markdown" },
  { value: "latex", label: "LaTeX" },
  { value: "plain", label: "Plain text" },
] as const;

export default function ContributePage() {
  const { user, isLoading } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [contentFormat, setContentFormat] = useState<string>("markdown");
  const [layoutHint, setLayoutHint] = useState<string>("empirical");
  const [customHint, setCustomHint] = useState("");
  const [useCustomHint, setUseCustomHint] = useState(false);
  const [summary, setSummary] = useState("");
  const [license, setLicense] = useState("CC-BY-4.0");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [createdEntryId, setCreatedEntryId] = useState<string | null>(null);
  const [tagWarning, setTagWarning] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const MAX_TAGS = 20;

  function addTag() {
    const tag = tagInput.trim().toLowerCase();
    if (!tag || tag.length > 50 || tags.length >= MAX_TAGS || tags.includes(tag)) {
      setTagInput("");
      return;
    }
    setTags((prev) => [...prev, tag]);
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  function handleTagKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  }

  const effectiveHint = useCustomHint ? customHint.trim() : layoutHint;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSubmitting(true);
    try {
      const entry = await createEntry({
        title,
        content: content || null,
        content_format: contentFormat,
        layout_hint: effectiveHint || null,
        summary: summary || null,
        license: license || null,
      });
      // Set tags if any were added
      if (tags.length > 0 && entry.id) {
        try {
          await setEntryTags(entry.id, tags);
        } catch {
          setTagWarning("Entry published, but tags could not be saved. You can add them from the entry page.");
        }
      }
      setCreatedEntryId(entry.id);
      setSuccess(true);
      setTitle("");
      setContent("");
      setSummary("");
      setLayoutHint("empirical");
      setCustomHint("");
      setUseCustomHint(false);
      setContentFormat("markdown");
      setLicense("CC-BY-4.0");
      setTags([]);
      setTagInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit entry.");
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Post-success
  if (success) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="mb-6 flex items-center gap-3">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
          <div>
            <h1 className="text-xl font-bold text-foreground">Entry published</h1>
            <p className="text-sm text-muted-foreground">Your entry is now live and citable.</p>
          </div>
        </div>

        {tagWarning && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
            {tagWarning}
          </div>
        )}

        <div className="flex gap-2">
          {createdEntryId && (
            <Button asChild>
              <Link href={`/entries/${createdEntryId}`}>View your entry</Link>
            </Button>
          )}
          <Button asChild variant={createdEntryId ? "outline" : "default"}>
            <Link href="/explore">Browse entries</Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setSuccess(false);
              setCreatedEntryId(null);
              setTagWarning("");
            }}
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
        <h1 className="mb-1 text-2xl font-bold text-foreground">Publish an entry</h1>
        <p className="text-sm text-muted-foreground">
          Every entry gets its own versioned file store — permanent, citable, and open.
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
            placeholder="A concise, precise statement..."
          />
        </div>

        {/* Layout hint */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Layout hint</p>
            <button
              type="button"
              onClick={() => setUseCustomHint((v) => !v)}
              className="text-xs text-primary hover:underline"
            >
              {useCustomHint ? "Use preset" : "Custom value"}
            </button>
          </div>
          {useCustomHint ? (
            <Input
              type="text"
              value={customHint}
              onChange={(e) => setCustomHint(e.target.value)}
              placeholder="Enter a custom layout hint..."
              maxLength={100}
            />
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {LAYOUT_HINTS.map(({ value, label, description }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setLayoutHint(value)}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    layoutHint === value
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background hover:border-muted-foreground/30"
                  }`}
                >
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Format */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Content format</label>
          <div className="flex gap-2">
            {FORMATS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setContentFormat(value)}
                className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                  contentFormat === value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-1.5">
          <label htmlFor="summary" className="text-sm font-medium text-foreground">
            Summary <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <Input
            id="summary"
            type="text"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            maxLength={500}
            placeholder="A brief summary of the entry..."
          />
        </div>

        {/* License */}
        <div className="space-y-1.5">
          <label htmlFor="license" className="text-sm font-medium text-foreground">
            License <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <Input
            id="license"
            type="text"
            value={license}
            onChange={(e) => setLicense(e.target.value)}
            placeholder="e.g. CC-BY-4.0"
          />
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <label htmlFor="tags" className="text-sm font-medium text-foreground">
            Tags <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <div className="flex gap-2">
            <Input
              id="tags"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Add a tag and press Enter..."
              maxLength={50}
            />
            <Button type="button" variant="outline" size="sm" onClick={addTag} disabled={!tagInput.trim()}>
              Add
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1 text-xs">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-1.5">
          <label htmlFor="content" className="text-sm font-medium text-foreground">
            Content <span className="text-muted-foreground font-normal">(optional — can be added later via files)</span>
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            placeholder={
              contentFormat === "latex"
                ? "State the entry formally. LaTeX math supported: $E = mc^2$"
                : "State the entry clearly and precisely. Include key evidence, conditions, and scope."
            }
            className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 font-mono"
          />
        </div>

        <Separator />

        {!user && (
          <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-secondary/40 px-4 py-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Sign in to publish.</span>{" "}
              You need an account to submit entries.
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

        {user && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Entries are public by default.
            </p>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Publishing..." : "Publish entry"}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
