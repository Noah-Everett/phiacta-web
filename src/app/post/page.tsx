"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { createEntry, setEntryTags, putEntryFile } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Atom,
  ShieldCheck,
  Target,
  CheckCircle2,
  LogIn,
  X,
  ArrowRight,
  Plus,
  Sparkles,
  Upload,
  FileIcon,
} from "lucide-react";

const ENTRY_TYPES = [
  { value: "paper", label: "Paper" },
  { value: "blog post", label: "Blog post" },
  { value: "empirical", label: "Empirical" },
  { value: "theorem", label: "Theorem" },
  { value: "conjecture", label: "Conjecture" },
  { value: "definition", label: "Definition" },
  { value: "evidence", label: "Evidence" },
  { value: "assertion", label: "Assertion" },
  { value: "refutation", label: "Refutation" },
  { value: "argument", label: "Argument" },
] as const;

const FORMATS = [
  { value: "markdown", label: "Markdown" },
  { value: "latex", label: "LaTeX" },
  { value: "plain", label: "Plain text" },
] as const;

const GUIDELINES = [
  {
    icon: Atom,
    title: "One idea per entry",
    body: "An entry is atomic. State one assertion, one result, or one definition — not a paper.",
  },
  {
    icon: Target,
    title: "Be precise",
    body: "Include scope, conditions, and limitations. A narrow claim with clear boundaries is more useful than a broad one.",
  },
  {
    icon: ShieldCheck,
    title: "Show your evidence",
    body: "Attach data, proofs, or code. Unverified entries are accepted — but the absence of proof is visible.",
  },
];

export default function PostPage() {
  const { user, isLoading } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [contentFormat, setContentFormat] = useState<string>("markdown");
  const [entryType, setEntryType] = useState<string>("empirical");
  const [customType, setCustomType] = useState("");
  const [isCustomType, setIsCustomType] = useState(false);
  const [summary, setSummary] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [createdEntryId, setCreatedEntryId] = useState<string | null>(null);
  const [tagWarning, setTagWarning] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [fileWarning, setFileWarning] = useState("");
  const customInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_TAGS = 20;
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

  const effectiveType = isCustomType ? customType.trim() : entryType;

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

  function handlePresetClick(value: string) {
    setIsCustomType(false);
    setCustomType("");
    setEntryType(value);
  }

  function handleCustomClick() {
    setIsCustomType(true);
    setTimeout(() => customInputRef.current?.focus(), 0);
  }

  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files;
    if (!selected) return;
    const newFiles: File[] = [];
    for (let i = 0; i < selected.length; i++) {
      const f = selected[i];
      if (f.size > MAX_FILE_SIZE) continue; // silently skip oversized
      // Deduplicate by name
      if (!files.some((existing) => existing.name === f.name) && !newFiles.some((n) => n.name === f.name)) {
        newFiles.push(f);
      }
    }
    setFiles((prev) => [...prev, ...newFiles]);
    // Reset input so the same file can be re-added after removal
    e.target.value = "";
  }

  function removeFile(name: string) {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

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
        entry_type: effectiveType || null,
        summary: summary || null,
      });
      if (tags.length > 0 && entry.id) {
        try {
          await setEntryTags(entry.id, tags);
        } catch {
          setTagWarning("Entry published, but tags could not be saved. You can add them from the entry page.");
        }
      }
      // Upload files
      if (files.length > 0 && entry.id) {
        const failed: string[] = [];
        for (const file of files) {
          try {
            await putEntryFile(entry.id, file.name, file);
          } catch {
            failed.push(file.name);
          }
        }
        if (failed.length > 0) {
          setFileWarning(`Entry published, but ${failed.length} file${failed.length > 1 ? "s" : ""} could not be uploaded: ${failed.join(", ")}`);
        }
      }
      setCreatedEntryId(entry.id);
      setSuccess(true);
      setTitle("");
      setContent("");
      setSummary("");
      setEntryType("empirical");
      setCustomType("");
      setIsCustomType(false);
      setContentFormat("markdown");
      setTags([]);
      setTagInput("");
      setFiles([]);
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
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="flex flex-col items-center text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">Entry published</h1>
          <p className="mb-1 text-sm text-muted-foreground">
            Your entry is now live, versioned, and permanently citable.
          </p>
          <p className="mb-8 text-xs text-muted-foreground">
            You can add files, manage references, and accept edit proposals from the entry page.
          </p>

          {(tagWarning || fileWarning) && (
            <div className="mb-6 w-full space-y-2">
              {tagWarning && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                  {tagWarning}
                </div>
              )}
              {fileWarning && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                  {fileWarning}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-3">
            {createdEntryId && (
              <Button asChild size="lg">
                <Link href={`/entries/${createdEntryId}`}>
                  View your entry <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                setSuccess(false);
                setCreatedEntryId(null);
                setTagWarning("");
                setFileWarning("");
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Publish another
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      {/* Hero */}
      <div className="mb-10">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Post an entry</h1>
        <p className="text-lg text-muted-foreground">
          Publish a new entry to the knowledge graph. Every entry is atomic, versioned,
          and permanently citable.
        </p>
      </div>

      {/* Guidelines */}
      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        {GUIDELINES.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
              <Icon className="h-4 w-4 text-secondary-foreground" />
            </div>
            <div>
              <p className="mb-0.5 text-sm font-semibold text-foreground">{title}</p>
              <p className="text-xs leading-relaxed text-muted-foreground">{body}</p>
            </div>
          </div>
        ))}
      </div>

      <Separator className="mb-10" />

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Section 1: The Essentials */}
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-semibold text-foreground">The entry</h2>

          {/* Title */}
          <div className="mb-5 space-y-1.5">
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
              placeholder="A concise, precise statement of one idea..."
              className="text-base"
            />
            <p className="text-xs text-muted-foreground">
              The title should be a self-contained statement. Think of it as the entry&apos;s one-line abstract.
            </p>
          </div>

          {/* Entry type — ghost chips */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Type</label>
            <div className="flex flex-wrap gap-1.5">
              {ENTRY_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handlePresetClick(value)}
                  className={`inline-flex h-8 items-center rounded-md px-3 text-sm font-medium transition-colors ${
                    !isCustomType && entryType === value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
              <button
                type="button"
                onClick={handleCustomClick}
                className={`inline-flex h-8 items-center rounded-md border border-dashed px-3 text-sm font-medium transition-colors ${
                  isCustomType
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                Custom...
              </button>
            </div>
            {isCustomType && (
              <Input
                ref={customInputRef}
                type="text"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                placeholder="e.g. lecture-notes, dataset, survey..."
                maxLength={100}
              />
            )}
          </div>
        </section>

        <Separator className="mb-10" />

        {/* Section 2: Content */}
        <section className="mb-10">
          <h2 className="mb-1 text-xl font-semibold text-foreground">Content</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Optional now — you can always add content and files from the entry page after publishing.
          </p>

          {/* Summary */}
          <div className="mb-5 space-y-1.5">
            <label htmlFor="summary" className="text-sm font-medium text-foreground">
              Summary
            </label>
            <Input
              id="summary"
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              maxLength={500}
              placeholder="A brief summary expanding on the title..."
            />
          </div>

          {/* Format selector */}
          <div className="mb-3 space-y-1.5">
            <label className="text-sm font-medium text-foreground">Format</label>
            <div className="flex gap-1.5">
              {FORMATS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setContentFormat(value)}
                  className={`inline-flex h-8 items-center rounded-md px-3 text-sm font-medium transition-colors ${
                    contentFormat === value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Content textarea */}
          <div className="space-y-1.5">
            <label htmlFor="content" className="text-sm font-medium text-foreground">
              Body
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              placeholder={
                contentFormat === "latex"
                  ? "State the entry formally. LaTeX math supported: $E = mc^2$"
                  : "State the entry clearly and precisely. Include key evidence, conditions, and scope."
              }
              className="w-full resize-y rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 font-mono"
            />
          </div>
        </section>

        <Separator className="mb-10" />

        {/* Section 3: Organization */}
        <section className="mb-10">
          <h2 className="mb-1 text-xl font-semibold text-foreground">Organization</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Tags help others discover your entry. You can also add references to other entries after publishing.
          </p>

          <div className="space-y-1.5">
            <label htmlFor="tags" className="text-sm font-medium text-foreground">
              Tags
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
              <Button type="button" variant="outline" onClick={addTag} disabled={!tagInput.trim()}>
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1 text-xs">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            {tags.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {tags.length} / {MAX_TAGS} tags
              </p>
            )}
          </div>
        </section>

        <Separator className="mb-10" />

        {/* Section 4: Files */}
        <section className="mb-10">
          <h2 className="mb-1 text-xl font-semibold text-foreground">Files</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Attach supporting materials — data, proofs, scripts, figures. Uploaded to the entry&apos;s versioned repository after publishing.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFilesSelected}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-8 text-sm text-muted-foreground transition-colors hover:border-muted-foreground/40 hover:text-foreground"
          >
            <Upload className="h-4 w-4" />
            Choose files
          </button>

          {files.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {files.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2"
                >
                  <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(file.name)}
                    className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <Separator className="mb-10" />

        {/* Auth gate / Submit */}
        {!user ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <Sparkles className="mx-auto mb-3 h-6 w-6 text-muted-foreground" />
            <p className="mb-1 text-sm font-semibold text-foreground">
              Sign in to publish
            </p>
            <p className="mb-4 text-xs text-muted-foreground">
              You need an account to post entries. It only takes a moment.
            </p>
            <div className="flex justify-center gap-3">
              <Button asChild variant="outline">
                <Link href="/auth/login">
                  <LogIn className="mr-1.5 h-3.5 w-3.5" />
                  Log in
                </Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signup">
                  Sign up <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Entries are public and permanent. You can update content after publishing.
            </p>
            <Button type="submit" size="lg" disabled={submitting}>
              {submitting ? "Publishing..." : "Publish entry"}
              {!submitting && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
