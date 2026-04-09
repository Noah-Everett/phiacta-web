"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { createEntry, getEntry, setEntryTags, putEntryFile, postEntryFiles, createReference, searchEntries, compileLatex } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Quote,
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
  Link2,
  Search,
  FileText,
  FolderOpen,
  Loader2,
} from "lucide-react";
import { unzipSync, gunzipSync } from "fflate";

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
  { value: "markdown", label: "Markdown", note: null },
  { value: "plain", label: "Plain text", note: null },
  { value: "latex", label: "LaTeX", note: "beta" },
] as const;

const GUIDELINES = [
  {
    icon: Quote,
    title: "Make it citable",
    body: "If someone cited this entry, would it be clear what they're pointing to? A theorem, a paper, a dataset — any granularity works if it's a meaningful unit to reference.",
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

const REL_TYPES = [
  { value: "cites", label: "Cites" },
  { value: "supports", label: "Supports" },
  { value: "refutes", label: "Refutes" },
  { value: "extends", label: "Extends" },
  { value: "derives-from", label: "Derives from" },
  { value: "reviews", label: "Reviews" },
] as const;

interface PendingRef {
  targetId: string;
  targetTitle: string;
  rel: string;
}

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
  const [files, setFiles] = useState<{ file: File; path: string }[]>([]);
  const [fileWarning, setFileWarning] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [refs, setRefs] = useState<PendingRef[]>([]);
  const [refSearch, setRefSearch] = useState("");
  const [refResults, setRefResults] = useState<{ id: string; title: string }[]>([]);
  const [refSearching, setRefSearching] = useState(false);
  const [refWarning, setRefWarning] = useState("");
  const [latexFiles, setLatexFiles] = useState<{ name: string; data: Uint8Array; isMain: boolean }[]>([]);
  const [latexDragOver, setLatexDragOver] = useState(false);
  const [latexError, setLatexError] = useState("");
  const [compileWarning, setCompileWarning] = useState("");
  const customInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const latexInputRef = useRef<HTMLInputElement>(null);
  const refDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    const newFiles: { file: File; path: string }[] = [];
    for (let i = 0; i < selected.length; i++) {
      const f = selected[i];
      if (f.size > MAX_FILE_SIZE) continue; // silently skip oversized
      // Deduplicate by name
      if (!files.some((existing) => existing.file.name === f.name) && !newFiles.some((n) => n.file.name === f.name)) {
        newFiles.push({ file: f, path: f.name });
      }
    }
    setFiles((prev) => [...prev, ...newFiles]);
    // Reset input so the same file can be re-added after removal
    e.target.value = "";
  }

  function handleFilesDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files;
    if (!dropped) return;
    const newFiles: { file: File; path: string }[] = [];
    for (let i = 0; i < dropped.length; i++) {
      const f = dropped[i];
      if (f.size > MAX_FILE_SIZE) continue;
      if (!files.some((existing) => existing.file.name === f.name) && !newFiles.some((n) => n.file.name === f.name)) {
        newFiles.push({ file: f, path: f.name });
      }
    }
    setFiles((prev) => [...prev, ...newFiles]);
  }

  function removeFile(name: string) {
    setFiles((prev) => prev.filter((f) => f.file.name !== name));
  }

  function updateFilePath(name: string, path: string) {
    setFiles((prev) => prev.map((f) => f.file.name === name ? { ...f, path } : f));
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  /** Detect which .tex file is the main one (has \documentclass). */
  function detectMainTex(files: { name: string; data: Uint8Array }[]): string | null {
    const texFiles = files.filter((f) => f.name.endsWith(".tex"));
    for (const f of texFiles) {
      const text = new TextDecoder().decode(f.data);
      if (/\\documentclass/m.test(text)) return f.name;
    }
    // Fallback: main.tex, then first .tex file
    const main = texFiles.find((f) => f.name.endsWith("main.tex"));
    return main?.name ?? texFiles[0]?.name ?? null;
  }

  /** Extract files from a zip archive. */
  function extractZip(data: Uint8Array): { name: string; data: Uint8Array }[] {
    const entries = unzipSync(data);
    const result: { name: string; data: Uint8Array }[] = [];
    for (const [path, fileData] of Object.entries(entries)) {
      // Skip directories (empty data or path ends with /)
      if (path.endsWith("/") || fileData.length === 0) continue;
      // Skip hidden files and __MACOSX
      if (path.startsWith("__MACOSX") || path.split("/").some((s) => s.startsWith("."))) continue;
      // Strip common prefix directory (e.g. "paper/" from "paper/main.tex")
      result.push({ name: path, data: fileData });
    }
    return stripCommonPrefix(result);
  }

  /** Extract files from a .tar.gz archive. */
  function extractTarGz(data: Uint8Array): { name: string; data: Uint8Array }[] {
    const tarData = gunzipSync(data);
    return parseTar(tarData);
  }

  /** Minimal tar parser — handles standard POSIX tar format. */
  function parseTar(data: Uint8Array): { name: string; data: Uint8Array }[] {
    const result: { name: string; data: Uint8Array }[] = [];
    let offset = 0;
    while (offset + 512 <= data.length) {
      // Read header
      const header = data.subarray(offset, offset + 512);
      // Check for zero block (end of archive)
      if (header.every((b) => b === 0)) break;
      // Extract name (bytes 0-99)
      let name = new TextDecoder().decode(header.subarray(0, 100)).replace(/\0+$/, "");
      // Check for prefix (bytes 345-499) for long names
      const prefix = new TextDecoder().decode(header.subarray(345, 500)).replace(/\0+$/, "");
      if (prefix) name = prefix + "/" + name;
      // Extract size (bytes 124-135, octal)
      const sizeStr = new TextDecoder().decode(header.subarray(124, 136)).replace(/\0+$/, "").trim();
      const size = parseInt(sizeStr, 8) || 0;
      // Type flag (byte 156)
      const typeFlag = header[156];
      offset += 512;
      if (typeFlag === 48 || typeFlag === 0) {
        // Regular file
        if (size > 0 && !name.endsWith("/") && !name.startsWith("__MACOSX") && !name.split("/").some((s) => s.startsWith("."))) {
          result.push({ name, data: data.subarray(offset, offset + size) });
        }
      }
      // Advance past file data (padded to 512-byte blocks)
      offset += Math.ceil(size / 512) * 512;
    }
    return stripCommonPrefix(result);
  }

  /** Strip common directory prefix from all file paths. */
  function stripCommonPrefix(files: { name: string; data: Uint8Array }[]): { name: string; data: Uint8Array }[] {
    if (files.length <= 1) return files;
    const parts = files.map((f) => f.name.split("/"));
    let prefixLen = 0;
    outer: while (true) {
      const segment = parts[0]?.[prefixLen];
      if (!segment) break;
      for (const p of parts) {
        if (p[prefixLen] !== segment) break outer;
      }
      prefixLen++;
    }
    if (prefixLen === 0) return files;
    return files.map((f) => ({
      ...f,
      name: f.name.split("/").slice(prefixLen).join("/"),
    }));
  }

  /** Detect archive type by magic bytes, falling back to extension. */
  function detectArchiveType(name: string, data: Uint8Array): "zip" | "gzip" | "tar" | null {
    // ZIP magic: PK\x03\x04
    if (data[0] === 0x50 && data[1] === 0x4b && data[2] === 0x03 && data[3] === 0x04) return "zip";
    // Gzip magic: \x1f\x8b
    if (data[0] === 0x1f && data[1] === 0x8b) return "gzip";
    // Tar magic: "ustar" at offset 257
    if (data.length > 262) {
      const ustar = new TextDecoder().decode(data.subarray(257, 262));
      if (ustar === "ustar") return "tar";
    }
    // Fallback to extension
    if (name.endsWith(".zip")) return "zip";
    if (name.endsWith(".tar.gz") || name.endsWith(".tgz") || name.endsWith(".gz")) return "gzip";
    if (name.endsWith(".tar")) return "tar";
    return null;
  }

  /** Process dropped/selected files for the LaTeX project. */
  async function processLatexFiles(inputFiles: FileList | File[]) {
    setLatexError("");
    const fileArray = Array.from(inputFiles);

    // Check for archive files (by magic bytes or extension)
    let archive: File | null = null;
    let archiveType: "zip" | "gzip" | "tar" | null = null;
    for (const f of fileArray) {
      const head = new Uint8Array(await f.slice(0, 300).arrayBuffer());
      const detected = detectArchiveType(f.name, head);
      if (detected) {
        archive = f;
        archiveType = detected;
        break;
      }
    }

    let extracted: { name: string; data: Uint8Array }[];

    if (archive && archiveType) {
      try {
        const buf = new Uint8Array(await archive.arrayBuffer());
        if (archiveType === "zip") {
          extracted = extractZip(buf);
        } else if (archiveType === "gzip") {
          extracted = extractTarGz(buf);
        } else {
          extracted = parseTar(buf);
        }
      } catch (err) {
        setLatexError(`Failed to extract ${archive.name}: ${err instanceof Error ? err.message : "unknown error"}`);
        return;
      }
    } else {
      // Individual files — read them all
      extracted = await Promise.all(
        fileArray.map(async (f) => ({
          name: f.name,
          data: new Uint8Array(await f.arrayBuffer()),
        })),
      );
    }

    if (extracted.length === 0) {
      setLatexError("No files found in archive.");
      return;
    }

    // Detect main .tex file
    const mainName = detectMainTex(extracted);

    // Mark isMain
    const withMain = extracted.map((f) => ({
      ...f,
      isMain: f.name === mainName,
    }));

    setLatexFiles(withMain);
  }

  function removeLatexFile(name: string) {
    setLatexFiles((prev) => {
      const next = prev.filter((f) => f.name !== name);
      // If we removed the main file, re-detect
      if (prev.find((f) => f.name === name)?.isMain && next.length > 0) {
        const newMain = detectMainTex(next);
        return next.map((f) => ({ ...f, isMain: f.name === newMain }));
      }
      return next;
    });
  }

  function setMainTexFile(name: string) {
    setLatexFiles((prev) => prev.map((f) => ({ ...f, isMain: f.name === name })));
  }

  const handleRefSearch = useCallback((query: string) => {
    setRefSearch(query);
    if (refDebounceRef.current) clearTimeout(refDebounceRef.current);
    const trimmed = query.trim();
    if (!trimmed) {
      setRefResults([]);
      return;
    }
    refDebounceRef.current = setTimeout(async () => {
      setRefSearching(true);
      try {
        const res = await searchEntries(trimmed, 5);
        setRefResults(res.items.map((r) => ({ id: r.entry_id, title: r.title || "Untitled" })));
      } catch {
        setRefResults([]);
      } finally {
        setRefSearching(false);
      }
    }, 300);
  }, []);

  function addRef(targetId: string, targetTitle: string) {
    if (refs.some((r) => r.targetId === targetId)) return;
    setRefs((prev) => [...prev, { targetId, targetTitle, rel: "cites" }]);
    setRefSearch("");
    setRefResults([]);
  }

  function removeRef(targetId: string, rel: string) {
    setRefs((prev) => prev.filter((r) => !(r.targetId === targetId && r.rel === rel)));
  }

  function updateRefRel(targetId: string, oldRel: string, newRel: string) {
    setRefs((prev) => prev.map((r) =>
      r.targetId === targetId && r.rel === oldRel ? { ...r, rel: newRel } : r
    ));
  }

  /** Wait for the entry repo to become ready (max ~15s). */
  async function waitForRepo(entryId: string): Promise<boolean> {
    for (let attempt = 0; attempt < 15; attempt++) {
      try {
        const check = await getEntry(entryId);
        if (check.repo_status === "ready") return true;
      } catch {}
      await new Promise((r) => setTimeout(r, 1000));
    }
    return false;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setCompileWarning("");
    setSubmitting(true);
    try {
      // For LaTeX with project files, don't send content body — files are the source
      const hasLatexProject = contentFormat === "latex" && latexFiles.length > 0;
      const entry = await createEntry({
        title,
        content: hasLatexProject ? null : (content || null),
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

      // Upload LaTeX project files and/or regular files
      const hasFiles = files.length > 0 || hasLatexProject;
      if (hasFiles && entry.id) {
        const repoReady = await waitForRepo(entry.id);
        if (!repoReady) {
          setFileWarning("Entry published, but the repository wasn't ready in time. Upload files from the entry's Files tab.");
        } else {
          // Build list of all files to upload
          const bulkFiles: { path: string; data: Blob }[] = [];

          // LaTeX project files → .phiacta/content/ or .phiacta/content.tex
          if (hasLatexProject) {
            const isMultiFile = latexFiles.length > 1;
            for (const lf of latexFiles) {
              const destPath = isMultiFile
                ? `.phiacta/content/${lf.isMain ? "main.tex" : lf.name}`
                : ".phiacta/content.tex";
              bulkFiles.push({ path: destPath, data: new Blob([lf.data]) });
            }
          }

          // Regular attached files
          for (const { file, path } of files) {
            bulkFiles.push({ path, data: file });
          }

          // Upload in batches — Forgejo limits commits to 1000 files,
          // and large single requests can freeze the browser.
          const BATCH_SIZE = 500;
          let failedBatches = 0;
          const totalBatches = Math.ceil(bulkFiles.length / BATCH_SIZE);
          for (let i = 0; i < bulkFiles.length; i += BATCH_SIZE) {
            const batch = bulkFiles.slice(i, i + BATCH_SIZE);
            const batchNum = Math.floor(i / BATCH_SIZE) + 1;
            const msg = totalBatches === 1
              ? (hasLatexProject ? "Upload LaTeX project" : `Upload ${batch.length} file(s)`)
              : `Upload batch ${batchNum}/${totalBatches} (${batch.length} files)`;
            try {
              await postEntryFiles(entry.id, batch, msg);
            } catch {
              failedBatches++;
            }
          }
          if (failedBatches > 0) {
            setFileWarning(`Entry published, but ${failedBatches} batch(es) of files could not be uploaded. You can retry from the entry's Files tab.`);
          }
        }
      }

      // Create references
      if (refs.length > 0 && entry.id) {
        const failedRefs: string[] = [];
        for (const ref of refs) {
          try {
            await createReference(entry.id, ref.targetId, ref.rel);
          } catch {
            failedRefs.push(`${ref.rel} → ${ref.targetTitle}`);
          }
        }
        if (failedRefs.length > 0) {
          setRefWarning(`Entry published, but ${failedRefs.length} reference${failedRefs.length > 1 ? "s" : ""} could not be created.`);
        }
      }

      // Auto-compile LaTeX to PDF
      if (contentFormat === "latex" && (hasLatexProject || content) && entry.id) {
        try {
          const result = await compileLatex(entry.id);
          if (!result.success) {
            setCompileWarning("Entry published, but PDF compilation failed. You can retry from the entry page.");
          }
        } catch {
          setCompileWarning("Entry published, but PDF compilation could not be started. You can compile from the entry page.");
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
      setLatexFiles([]);
      setRefs([]);
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

          {(tagWarning || fileWarning || refWarning || compileWarning) && (
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
              {refWarning && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                  {refWarning}
                </div>
              )}
              {compileWarning && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                  {compileWarning}
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
                setRefWarning("");
                setCompileWarning("");
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
          Publish a new entry to the knowledge graph. Every entry is versioned
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
              {FORMATS.map(({ value, label, note }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => { setContentFormat(value); if (value !== "latex") { setLatexFiles([]); setLatexError(""); } }}
                  className={`inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors ${
                    contentFormat === value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {label}
                  {note && (
                    <span className={`text-[10px] font-normal ${
                      contentFormat === value ? "text-primary-foreground/70" : "text-muted-foreground/60"
                    }`}>
                      {note}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content — textarea for markdown/plain, file upload for LaTeX */}
          {contentFormat === "latex" ? (
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">LaTeX Source</label>

              <input
                ref={latexInputRef}
                type="file"
                multiple
                accept=".tex,.bib,.cls,.sty,.bst,.png,.jpg,.jpeg,.pdf,.eps,.svg,.zip,.tar,.tar.gz,.tgz,.gz"
                onChange={(e) => e.target.files && processLatexFiles(e.target.files)}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => latexInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setLatexDragOver(true); }}
                onDragLeave={() => setLatexDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setLatexDragOver(false);
                  if (e.dataTransfer.files) processLatexFiles(e.dataTransfer.files);
                }}
                className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-10 text-sm transition-colors ${
                  latexDragOver
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground"
                }`}
              >
                <Upload className="h-5 w-5" />
                <span className="font-medium">Drop LaTeX files or archive here</span>
                <span className="text-xs text-muted-foreground">
                  .tex, .bib, .cls, images — or a .tar / .zip / .tar.gz from arXiv
                </span>
              </button>

              {latexError && (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 p-2.5">
                  <p className="text-xs text-destructive">{latexError}</p>
                </div>
              )}

              {latexFiles.length > 0 && (
                <div className="rounded-xl border border-border bg-card">
                  <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">
                      {latexFiles.length} file{latexFiles.length !== 1 ? "s" : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {latexFiles.filter((f) => f.name.endsWith(".tex")).length} .tex
                      {latexFiles.some((f) => f.name.endsWith(".bib")) && ", .bib"}
                      {latexFiles.some((f) => /\.(png|jpg|jpeg|pdf|eps|svg)$/i.test(f.name)) && ", figures"}
                    </p>
                  </div>
                  <div className="divide-y divide-border">
                    {latexFiles
                      .sort((a, b) => {
                        // Main file first, then .tex files, then alphabetical
                        if (a.isMain) return -1;
                        if (b.isMain) return 1;
                        const aIsTex = a.name.endsWith(".tex") ? 0 : 1;
                        const bIsTex = b.name.endsWith(".tex") ? 0 : 1;
                        if (aIsTex !== bIsTex) return aIsTex - bIsTex;
                        return a.name.localeCompare(b.name);
                      })
                      .map((f) => (
                        <div
                          key={f.name}
                          className="flex items-center gap-3 px-4 py-2"
                        >
                          <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <span className="min-w-0 flex-1 truncate text-sm font-mono text-foreground">
                            {f.name}
                          </span>
                          {f.isMain && (
                            <Badge variant="secondary" className="shrink-0 text-[10px]">main</Badge>
                          )}
                          {f.name.endsWith(".tex") && !f.isMain && (
                            <button
                              type="button"
                              onClick={() => setMainTexFile(f.name)}
                              className="shrink-0 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                            >
                              set as main
                            </button>
                          )}
                          <span className="shrink-0 text-[10px] text-muted-foreground tabular-nums">
                            {formatFileSize(f.data.length)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeLatexFile(f.name)}
                            className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                  </div>
                  {!latexFiles.some((f) => f.isMain) && (
                    <div className="border-t border-amber-200 bg-amber-50 px-4 py-2.5 dark:border-amber-800 dark:bg-amber-950/50">
                      <p className="text-xs text-amber-800 dark:text-amber-300">
                        No main .tex file detected. Click &quot;set as main&quot; on the file with \documentclass.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {latexFiles.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Or write LaTeX directly:
                </p>
              )}
              {latexFiles.length === 0 && (
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={12}
                  placeholder={"\\documentclass{article}\n\\begin{document}\n\nYour content here...\n\n\\end{document}"}
                  className="w-full resize-y rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 font-mono"
                />
              )}
            </div>
          ) : (
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
                  contentFormat === "markdown"
                    ? "State the entry clearly and precisely. Markdown formatting supported — use $...$ for inline math and $$...$$ for display math."
                    : "State the entry clearly and precisely. Include key evidence, conditions, and scope."
                }
                className="w-full resize-y rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 font-mono"
              />
            </div>
          )}
        </section>

        <Separator className="mb-10" />

        {/* Section 3: Tags & References */}
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Tags &amp; references</h2>

          {/* Tags */}
          <div className="mb-6 space-y-1.5">
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

          {/* References */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              References
            </label>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={refSearch}
                onChange={(e) => handleRefSearch(e.target.value)}
                placeholder="Search for an entry to reference..."
                className="pl-9"
              />
              {refResults.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-card shadow-lg">
                  {refResults.map((result) => (
                    <button
                      key={result.id}
                      type="button"
                      onClick={() => addRef(result.id, result.title)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent transition-colors first:rounded-t-lg last:rounded-b-lg"
                    >
                      <Link2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate text-foreground">{result.title}</span>
                    </button>
                  ))}
                </div>
              )}
              {refSearching && refSearch.trim() && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
                  <p className="text-xs text-muted-foreground">Searching...</p>
                </div>
              )}
            </div>

            {refs.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {refs.map((ref) => (
                  <div
                    key={`${ref.targetId}-${ref.rel}`}
                    className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2"
                  >
                    <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <select
                      value={ref.rel}
                      onChange={(e) => updateRefRel(ref.targetId, ref.rel, e.target.value)}
                      className="h-5 cursor-pointer rounded bg-secondary px-1 text-[11px] font-medium text-secondary-foreground outline-none"
                    >
                      {REL_TYPES.map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    <p className="min-w-0 truncate text-sm text-foreground">{ref.targetTitle}</p>
                    <button
                      type="button"
                      onClick={() => removeRef(ref.targetId, ref.rel)}
                      className="ml-auto shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
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
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFilesDrop}
            className={`flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-8 text-sm transition-colors ${
              dragOver
                ? "border-primary bg-primary/5 text-foreground"
                : "border-border text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground"
            }`}
          >
            <Upload className="h-4 w-4" />
            Choose files or drag and drop
          </button>

          {files.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {files.map(({ file, path }) => (
                <div
                  key={file.name}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2"
                >
                  <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="shrink-0 text-xs font-medium text-muted-foreground">Path:</span>
                      <input
                        type="text"
                        value={path}
                        onChange={(e) => updateFilePath(file.name, e.target.value)}
                        placeholder="e.g., figures/image.png"
                        className="w-full rounded px-1.5 py-0.5 text-sm text-foreground font-mono outline-none border border-transparent bg-transparent focus:border-border focus:bg-muted/50 transition-colors"
                        title="File path in the entry repository"
                      />
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
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
              <p className="text-xs text-muted-foreground">
                Edit the path to organize files into directories (e.g., figures/plot.png, src/code.py)
              </p>
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
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing{contentFormat === "latex" && (latexFiles.length > 0 || content) ? " & compiling..." : "..."}
                </>
              ) : (
                <>
                  {contentFormat === "latex" && (latexFiles.length > 0 || content) ? "Publish & compile" : "Publish entry"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
