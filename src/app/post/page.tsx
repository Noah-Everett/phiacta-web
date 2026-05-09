"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { createEntry, getEntry, setEntryTags, putEntryFile, postEntryFiles, createReference, searchEntries, listJobs } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  LogIn,
  X,
  ArrowRight,
  Plus,
  Upload,
  FileIcon,
  Link2,
  Search,
  FileText,
  FolderOpen,
  Loader2,
  FileArchive,
  ChevronDown,
  Tag,
  XCircle,
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
  { value: "latex", label: "LaTeX", note: null },
] as const;

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
  const [arxivDragOver, setArxivDragOver] = useState(false);
  const [arxivImporting, setArxivImporting] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [showRefs, setShowRefs] = useState(false);
  const [showFiles, setShowFiles] = useState(false);

  // Compilation error — set during processing, shown on success screen
  const [compilationError, setCompilationError] = useState<string | null>(null);

  // Processing steps — shown between submit and success
  type StepStatus = "pending" | "active" | "done" | "warning" | "error";
  interface ProcessingStep {
    label: string;
    status: StepStatus;
    detail?: string;
  }
  const [steps, setSteps] = useState<ProcessingStep[]>([]);

  function updateStep(index: number, updates: Partial<ProcessingStep>) {
    setSteps((prev) => prev.map((s, i) => i === index ? { ...s, ...updates } : s));
  }
  const customInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const latexInputRef = useRef<HTMLInputElement>(null);
  const refDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const MAX_TAGS = 20;
  const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB — matches backend max_file_size_bytes

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

  function _addFiles(incoming: FileList) {
    const newFiles: { file: File; path: string }[] = [];
    const skipped: string[] = [];
    for (let i = 0; i < incoming.length; i++) {
      const f = incoming[i];
      if (f.size > MAX_FILE_SIZE) {
        skipped.push(`${f.name} (${formatFileSize(f.size)} exceeds ${formatFileSize(MAX_FILE_SIZE)} limit)`);
        continue;
      }
      if (!files.some((existing) => existing.file.name === f.name) && !newFiles.some((n) => n.file.name === f.name)) {
        newFiles.push({ file: f, path: f.name });
      }
    }
    if (skipped.length > 0) {
      setFileWarning(`Skipped: ${skipped.join(", ")}`);
    }
    setFiles((prev) => [...prev, ...newFiles]);
  }

  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    _addFiles(e.target.files);
    e.target.value = "";
  }

  function handleFilesDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (!e.dataTransfer.files) return;
    _addFiles(e.dataTransfer.files);
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

  /** Extract balanced braced content, handling nested braces. */
  function extractBraced(text: string, startIdx: number): string | null {
    if (text[startIdx] !== "{") return null;
    let depth = 0;
    let i = startIdx;
    while (i < text.length) {
      if (text[i] === "{") depth++;
      else if (text[i] === "}") { depth--; if (depth === 0) return text.slice(startIdx + 1, i); }
      i++;
    }
    return null;
  }

  /** Strip common LaTeX commands from extracted text for display. */
  function cleanLatexText(text: string): string {
    return text
      .replace(/\\(?:textbf|textit|emph|textrm|texttt|textsf|textsc|mbox|text)\{([^}]*)\}/g, "$1")
      .replace(/\\(?:cite|ref|label|eqref|cref|autoref)\{[^}]*\}/g, "")
      .replace(/\\(?:boldmath|unboldmath|bfseries|itshape|rmfamily|ttfamily|sffamily|scshape|normalfont)\b/g, "")
      .replace(/\\\\|\\newline/g, " ")
      .replace(/~|\\,|\\;|\\:|\\!/g, " ")
      .replace(/\{|\}/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  /** Strip LaTeX comments (% to end of line), preserving escaped \%. */
  function stripLatexComments(text: string): string {
    return text.replace(/^((?:[^%\\]|\\.)*)%.*$/gm, "$1");
  }

  /** Parse title and abstract from LaTeX source. */
  function parseLatexMetadata(texContent: string): { title: string | null; abstract: string | null } {
    const stripped = stripLatexComments(texContent);
    let extractedTitle: string | null = null;
    let extractedAbstract: string | null = null;

    // Extract \title{...} — handle nested braces
    const titleMatch = stripped.match(/\\title\s*(?:\[[^\]]*\]\s*)?\{/);
    if (titleMatch) {
      const braceStart = stripped.indexOf("{", titleMatch.index!);
      extractedTitle = extractBraced(stripped, braceStart);
      if (extractedTitle) extractedTitle = cleanLatexText(extractedTitle);
    }

    // Extract \begin{abstract}...\end{abstract}
    const absMatch = stripped.match(/\\begin\{abstract\}([\s\S]*?)\\end\{abstract\}/);
    if (absMatch) {
      extractedAbstract = cleanLatexText(absMatch[1]);
    }

    return { title: extractedTitle || null, abstract: extractedAbstract || null };
  }

  /** Import an arXiv archive: extract files, parse metadata, populate form. */
  async function handleArxivImport(inputFiles: FileList | File[]) {
    setArxivImporting(true);
    setLatexError("");
    setError("");

    try {
      const fileArray = Array.from(inputFiles);

      // Find and extract archive
      let archive: File | null = null;
      let archiveType: "zip" | "gzip" | "tar" | null = null;
      for (const f of fileArray) {
        const head = new Uint8Array(await f.slice(0, 300).arrayBuffer());
        const detected = detectArchiveType(f.name, head);
        if (detected) { archive = f; archiveType = detected; break; }
      }

      let extracted: { name: string; data: Uint8Array }[];
      if (archive && archiveType) {
        const buf = new Uint8Array(await archive.arrayBuffer());
        if (archiveType === "zip") extracted = extractZip(buf);
        else if (archiveType === "gzip") extracted = extractTarGz(buf);
        else extracted = parseTar(buf);
      } else {
        // Individual .tex files
        extracted = await Promise.all(
          fileArray.map(async (f) => ({ name: f.name, data: new Uint8Array(await f.arrayBuffer()) })),
        );
      }

      if (extracted.length === 0) {
        setLatexError("No files found in archive.");
        return;
      }

      // Detect main .tex and set up latex files
      const mainName = detectMainTex(extracted);
      const withMain = extracted.map((f) => ({ ...f, isMain: f.name === mainName }));
      setLatexFiles(withMain);

      // Parse metadata from main .tex
      if (mainName) {
        const mainFile = extracted.find((f) => f.name === mainName);
        if (mainFile) {
          const texContent = new TextDecoder().decode(mainFile.data);
          const { title: parsedTitle, abstract: parsedAbstract } = parseLatexMetadata(texContent);
          if (parsedTitle) setTitle(parsedTitle);
          if (parsedAbstract) setSummary(parsedAbstract);
        }
      }

      // Auto-set format, mode, and type
      setContentFormat("latex");
      setEntryType("paper");
      setIsCustomType(false);
      setCustomType("");
    } catch (err) {
      setLatexError(`Import failed: ${err instanceof Error ? err.message : "unknown error"}`);
    } finally {
      setArxivImporting(false);
    }
  }

  const arxivInputRef = useRef<HTMLInputElement>(null);

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
    setSubmitting(true);

    const hasLatexProject = contentFormat === "latex" && latexFiles.length > 0;
    const hasFiles = files.length > 0 || hasLatexProject;
    const hasRefs = refs.length > 0;
    const hasTags = tags.length > 0;

    // Build step list
    const needsRepo = hasTags || hasFiles;
    const initialSteps: ProcessingStep[] = [
      { label: "Creating entry", status: "pending" },
    ];
    if (needsRepo) initialSteps.push({ label: "Waiting for repository", status: "pending" });
    if (hasTags) initialSteps.push({ label: "Setting tags", status: "pending" });
    if (hasFiles) initialSteps.push({ label: "Uploading files", status: "pending" });
    if (hasRefs) initialSteps.push({ label: "Creating references", status: "pending" });
    if (hasLatexProject) initialSteps.push({ label: "Compiling PDF", status: "pending" });
    setSteps(initialSteps);

    let stepIdx = 0;

    try {
      // Step: Create entry
      updateStep(stepIdx, { status: "active" });
      const entry = await createEntry({
        title,
        content: hasLatexProject ? null : (content || null),
        content_format: contentFormat,
        entry_type: effectiveType || null,
        summary: summary || null,
      });
      updateStep(stepIdx, { status: "done", detail: entry.id.slice(0, 8) });
      stepIdx++;

      // Step: Wait for repo (needed by tags + files)
      let repoReady = false;
      if (needsRepo && entry.id) {
        updateStep(stepIdx, { status: "active" });
        repoReady = await waitForRepo(entry.id);
        if (!repoReady) {
          updateStep(stepIdx, { status: "warning", detail: "Timed out" });
          stepIdx++;
          if (hasTags) {
            setTagWarning("Tags could not be saved. You can add them from the entry page.");
            updateStep(stepIdx, { status: "warning", detail: "Skipped" });
            stepIdx++;
          }
          if (hasFiles) {
            setFileWarning("Repository wasn't ready in time. Upload files from the entry's Files tab.");
            updateStep(stepIdx, { status: "warning", detail: "Skipped" });
            stepIdx++;
          }
        } else {
          updateStep(stepIdx, { status: "done" });
          stepIdx++;
        }
      }

      // Step: Tags (repo is ready)
      if (hasTags && repoReady) {
        updateStep(stepIdx, { status: "active", detail: `${tags.length} tag${tags.length > 1 ? "s" : ""}` });
        try {
          await setEntryTags(entry.id, tags);
          updateStep(stepIdx, { status: "done" });
        } catch {
          setTagWarning("Tags could not be saved. You can add them from the entry page.");
          updateStep(stepIdx, { status: "warning", detail: "Failed" });
        }
        stepIdx++;
      }

      // Step: Upload files (repo is ready)
      if (hasFiles && repoReady && entry.id) {
          // Upload files
          const bulkFiles: { path: string; data: Blob }[] = [];
          if (hasLatexProject) {
            const isMultiFile = latexFiles.length > 1;
            for (const lf of latexFiles) {
              const oversized = lf.name + (lf.data.length > MAX_FILE_SIZE ? ` (${(lf.data.length / 1024 / 1024).toFixed(1)} MB)` : "");
              if (lf.data.length > MAX_FILE_SIZE) {
                throw new Error(`File ${oversized} exceeds the ${MAX_FILE_SIZE / 1024 / 1024} MB size limit.`);
              }
              const destPath = isMultiFile
                ? `.phiacta/content/${lf.isMain ? "main.tex" : lf.name}`
                : ".phiacta/content.tex";
              bulkFiles.push({ path: destPath, data: new Blob([lf.data as BlobPart]) });
            }
          }
          for (const { file, path } of files) {
            bulkFiles.push({ path, data: file });
          }

          const totalFiles = bulkFiles.length;
          updateStep(stepIdx, { status: "active", detail: `0 / ${totalFiles} files` });

          const msg = hasLatexProject
            ? "Upload LaTeX project"
            : `Upload ${totalFiles} file(s)`;
          try {
            await postEntryFiles(entry.id, bulkFiles, msg, (loaded, total) => {
              const pct = Math.round((loaded / total) * 100);
              updateStep(stepIdx, { detail: `${pct}%` });
            });
            updateStep(stepIdx, { status: "done", detail: `${totalFiles} file${totalFiles > 1 ? "s" : ""}` });
          } catch (err) {
            setFileWarning("Files could not be uploaded. You can retry from the entry's Files tab.");
            updateStep(stepIdx, { status: "warning" });
          }
          stepIdx++;
      }

      // Step: References
      if (hasRefs && entry.id) {
        updateStep(stepIdx, { status: "active", detail: `${refs.length} reference${refs.length > 1 ? "s" : ""}` });
        const failedRefs: string[] = [];
        for (const ref of refs) {
          try {
            await createReference(entry.id, ref.targetId, ref.rel);
          } catch {
            failedRefs.push(`${ref.rel} → ${ref.targetTitle}`);
          }
        }
        if (failedRefs.length > 0) {
          setRefWarning(`${failedRefs.length} reference${failedRefs.length > 1 ? "s" : ""} could not be created.`);
          updateStep(stepIdx, { status: "warning", detail: `${refs.length - failedRefs.length}/${refs.length} created` });
        } else {
          updateStep(stepIdx, { status: "done" });
        }
        stepIdx++;
      }

      // Step: Compile PDF (poll until done)
      if (hasLatexProject && entry.id) {
        updateStep(stepIdx, { status: "active" });
        const compileResult = await new Promise<"done" | "failed">((resolve) => {
          let attempts = 0;
          const MAX_POLL_ATTEMPTS = 60; // 2s × 60 = 2 min max wait
          const poll = async () => {
            attempts++;
            try {
              const result = await listJobs({
                entity_id: entry.id,
                job_type: "compiled_content",
                limit: 1,
              });
              const latest = result.items[0] as { status: string; last_error?: string } | undefined;
              if (!latest) {
                if (attempts >= MAX_POLL_ATTEMPTS) {
                  setCompilationError("Compilation job was not created. The file may not contain LaTeX source.");
                  resolve("failed");
                  return;
                }
                // No job yet, keep polling (webhook may not have fired yet)
                setTimeout(poll, 2000);
              } else if (latest.status === "pending" || latest.status === "running") {
                setTimeout(poll, 2000);
              } else if (latest.status === "completed") {
                resolve("done");
              } else {
                setCompilationError(latest.last_error ?? null);
                resolve("failed");
              }
            } catch {
              resolve("failed");
            }
          };
          poll();
        });
        if (compileResult === "done") {
          updateStep(stepIdx, { status: "done" });
        } else {
          updateStep(stepIdx, { status: "warning", detail: "Failed" });
        }
        stepIdx++;
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
      // Mark current step as error
      setSteps((prev) => prev.map((s, i) => i === stepIdx ? { ...s, status: "error" as StepStatus } : s));
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

  // Processing progress
  if (submitting && steps.length > 0) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">Publishing your entry</h1>
          <p className="text-sm text-muted-foreground">
            This may take a moment while we set everything up.
          </p>
        </div>

        <div className="space-y-3">
          {steps.map((step, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 rounded-lg border px-4 py-3 transition-all ${
                step.status === "active"
                  ? "border-primary/30 bg-primary/5"
                  : step.status === "done"
                  ? "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/30"
                  : step.status === "warning"
                  ? "border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/30"
                  : step.status === "error"
                  ? "border-destructive/20 bg-destructive/5"
                  : "border-border bg-card opacity-50"
              }`}
            >
              <div className="shrink-0">
                {step.status === "active" && (
                  <Loader2 className="h-4 w-4 text-primary animate-spin" />
                )}
                {step.status === "done" && (
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                )}
                {step.status === "warning" && (
                  <div className="h-4 w-4 rounded-full border-2 border-amber-500 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-amber-500">!</span>
                  </div>
                )}
                {step.status === "error" && (
                  <X className="h-4 w-4 text-destructive" />
                )}
                {step.status === "pending" && (
                  <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                )}
              </div>
              <span className={`text-sm font-medium ${
                step.status === "active" ? "text-foreground" :
                step.status === "done" ? "text-green-700 dark:text-green-300" :
                step.status === "warning" ? "text-amber-700 dark:text-amber-300" :
                step.status === "error" ? "text-destructive" :
                "text-muted-foreground"
              }`}>
                {step.label}
              </span>
              {step.detail && (
                <span className="ml-auto text-xs text-muted-foreground">{step.detail}</span>
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
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

          {(tagWarning || fileWarning || refWarning) && (
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
            </div>
          )}

          {compilationError && (
            <div className="mb-6 w-full">
              <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  PDF compilation failed.
                  <code className="ml-1 font-mono text-xs">{compilationError.slice(0, 200)}</code>
                </span>
              </div>
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
                setCompilationError(null);
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
    <div className="mx-auto max-w-2xl px-6 py-16">
      {/* Auth gate — gray out the form until signed in */}
      {!user && (
        <div className="mb-8 flex items-center justify-between rounded-lg border border-border bg-card px-5 py-4 shadow-sm">
          <div>
            <p className="text-sm font-medium text-foreground">Sign in to publish</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Create an account to start publishing entries.</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="ghost" size="sm">
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

      <div className={!user ? "pointer-events-none select-none opacity-50" : undefined}>
      {/* Header */}
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">New entry</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Versioned and permanently citable.
          </p>
        </div>
        {/* arXiv import — compact */}
        <div>
          <input
            ref={arxivInputRef}
            type="file"
            accept=".zip,.tar,.tar.gz,.tgz,.gz,.tex"
            onChange={(e) => { if (e.target.files) handleArxivImport(e.target.files); e.target.value = ""; }}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => arxivInputRef.current?.click()}
            disabled={arxivImporting}
            onDragOver={(e) => { e.preventDefault(); setArxivDragOver(true); }}
            onDragLeave={() => setArxivDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setArxivDragOver(false);
              if (e.dataTransfer.files) handleArxivImport(e.dataTransfer.files);
            }}
            className={`inline-flex items-center gap-2 rounded-md border px-5 py-2 text-sm font-medium transition-colors ${
              arxivDragOver
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-foreground hover:bg-accent"
            }`}
          >
            {arxivImporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileArchive className="h-4 w-4" />
            )}
            {arxivImporting ? "Importing..." : "Import from arXiv"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-8 rounded-md border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {latexError && (
        <div className="mb-8 rounded-md border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {latexError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Title */}
        <div>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={500}
            placeholder="Title"
            className="h-auto text-xl rounded-md px-3 py-2.5 font-semibold placeholder:font-normal placeholder:text-muted-foreground/60"
          />
        </div>

        {/* Type chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {ENTRY_TYPES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => handlePresetClick(value)}
              className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-medium transition-colors ${
                !isCustomType && entryType === value
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={handleCustomClick}
            className={`inline-flex h-7 items-center rounded-full border border-dashed px-3 text-xs font-medium transition-colors ${
              isCustomType
                ? "border-foreground bg-foreground text-background"
                : "border-muted-foreground/30 text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground"
            }`}
          >
            Custom
          </button>
          {isCustomType && (
            <Input
              ref={customInputRef}
              type="text"
              value={customType}
              onChange={(e) => setCustomType(e.target.value)}
              placeholder="e.g. lecture-notes"
              maxLength={100}
              className="ml-1 h-7 w-40 text-xs"
            />
          )}
        </div>

        {/* Summary */}
        <div>
          <label htmlFor="summary" className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Summary
          </label>
          <textarea
            id="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
            placeholder="A brief abstract or description..."
            className="w-full resize-none rounded-md border border-input bg-background px-3 py-2.5 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
          />
        </div>

        {/* Content area with format tabs */}
        <div>
          <div className="mb-3 flex items-center gap-0.5 rounded-md bg-muted/50 p-0.5 w-fit">
            {FORMATS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => { setContentFormat(value); if (value !== "latex") { setLatexFiles([]); setLatexError(""); } }}
                className={`inline-flex h-7 items-center rounded px-3 text-xs font-medium transition-colors ${
                  contentFormat === value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {contentFormat === "latex" ? (
            <div className="space-y-3">
              <input
                ref={latexInputRef}
                type="file"
                multiple
                accept=".tex,.bib,.cls,.sty,.bst,.png,.jpg,.jpeg,.pdf,.eps,.svg,.zip,.tar,.tar.gz,.tgz,.gz"
                onChange={(e) => e.target.files && processLatexFiles(e.target.files)}
                className="hidden"
              />

              {latexFiles.length === 0 && (
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
                  className={`flex w-full flex-col items-center justify-center gap-1.5 rounded-md border border-dashed py-8 text-sm transition-colors ${
                    latexDragOver
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground"
                  }`}
                >
                  <Upload className="h-4 w-4" />
                  <span className="font-medium">Drop LaTeX files or archive</span>
                  <span className="text-xs text-muted-foreground">.tex, .bib, .cls, images, or .tar.gz / .zip</span>
                </button>
              )}

              {latexFiles.length > 0 && (
                    <div className="rounded-md border border-border">
                      <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs font-medium text-foreground">
                            {latexFiles.length} file{latexFiles.length !== 1 ? "s" : ""}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {latexFiles.filter((f) => f.name.endsWith(".tex")).length} .tex
                            {latexFiles.some((f) => f.name.endsWith(".bib")) && ", .bib"}
                            {latexFiles.some((f) => /\.(png|jpg|jpeg|pdf|eps|svg)$/i.test(f.name)) && ", figures"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => latexInputRef.current?.click()}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          + Add files
                        </button>
                      </div>
                      <div className="divide-y divide-border">
                        {latexFiles
                          .sort((a, b) => {
                            if (a.isMain) return -1;
                            if (b.isMain) return 1;
                            const aIsTex = a.name.endsWith(".tex") ? 0 : 1;
                            const bIsTex = b.name.endsWith(".tex") ? 0 : 1;
                            if (aIsTex !== bIsTex) return aIsTex - bIsTex;
                            return a.name.localeCompare(b.name);
                          })
                          .map((f) => (
                            <div key={f.name} className="flex items-center gap-2 px-3 py-1.5">
                              <FileText className="h-3 w-3 shrink-0 text-muted-foreground" />
                              <span className="min-w-0 flex-1 truncate text-xs font-mono text-foreground">{f.name}</span>
                              {f.isMain && (
                                <Badge variant="secondary" className="shrink-0 h-4 text-[10px] px-1.5">main</Badge>
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
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                      </div>
                      {!latexFiles.some((f) => f.isMain) && (
                        <div className="border-t border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-800 dark:bg-amber-950/50">
                          <p className="text-xs text-amber-800 dark:text-amber-300">
                            No main .tex file detected. Click &quot;set as main&quot; on the file with \documentclass.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
            </div>
          ) : (
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              placeholder={
                contentFormat === "markdown"
                  ? "Write your content... (Markdown supported, $...$ for math)"
                  : "Write your content..."
              }
              className="w-full resize-y rounded-md border border-input bg-background px-3 py-2.5 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 font-mono"
            />
          )}
        </div>

        {/* Collapsible extras: Tags, References, Files */}
        <div className="space-y-0.5 rounded-md border border-border">
          {/* Tags */}
          <div>
            <button
              type="button"
              onClick={() => setShowTags((v) => !v)}
              className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-muted-foreground hover:bg-accent/50 transition-colors"
            >
              <Tag className="h-4 w-4" />
              <span className="font-medium">Tags</span>
              {tags.length > 0 && (
                <Badge variant="secondary" className="h-5 text-[10px] px-1.5">{tags.length}</Badge>
              )}
              <ChevronDown className={`ml-auto h-4 w-4 transition-transform duration-200 ${showTags ? "rotate-180" : ""}`} />
            </button>
            {showTags && (
              <div className="px-4 pb-4 pt-0 space-y-3">
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Add a tag and press Enter..."
                    maxLength={50}
                    className="h-8 text-sm"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addTag} disabled={!tagInput.trim()}>
                    Add
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
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
              </div>
            )}
          </div>

          <div className="mx-4 border-t border-border" />

          {/* References */}
          <div>
            <button
              type="button"
              onClick={() => setShowRefs((v) => !v)}
              className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-muted-foreground hover:bg-accent/50 transition-colors"
            >
              <Link2 className="h-4 w-4" />
              <span className="font-medium">References</span>
              {refs.length > 0 && (
                <Badge variant="secondary" className="h-5 text-[10px] px-1.5">{refs.length}</Badge>
              )}
              <ChevronDown className={`ml-auto h-4 w-4 transition-transform duration-200 ${showRefs ? "rotate-180" : ""}`} />
            </button>
            {showRefs && (
              <div className="px-4 pb-4 pt-0 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    value={refSearch}
                    onChange={(e) => handleRefSearch(e.target.value)}
                    placeholder="Search entries..."
                    className="h-8 pl-9 text-sm"
                  />
                  {refResults.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-card shadow-lg">
                      {refResults.map((result) => (
                        <button
                          key={result.id}
                          type="button"
                          onClick={() => addRef(result.id, result.title)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent transition-colors first:rounded-t-md last:rounded-b-md"
                        >
                          <Link2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <span className="truncate text-foreground">{result.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {refSearching && refSearch.trim() && (
                    <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-card px-3 py-2 shadow-lg">
                      <p className="text-xs text-muted-foreground">Searching...</p>
                    </div>
                  )}
                </div>
                {refs.length > 0 && (
                  <div className="space-y-1">
                    {refs.map((ref) => (
                      <div
                        key={`${ref.targetId}-${ref.rel}`}
                        className="flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5"
                      >
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
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mx-4 border-t border-border" />

          {/* Files */}
          <div>
            <button
              type="button"
              onClick={() => setShowFiles((v) => !v)}
              className="flex w-full items-center gap-2.5 px-4 py-3 text-sm text-muted-foreground hover:bg-accent/50 transition-colors"
            >
              <FileIcon className="h-4 w-4" />
              <span className="font-medium">Files</span>
              {files.length > 0 && (
                <Badge variant="secondary" className="h-5 text-[10px] px-1.5">{files.length}</Badge>
              )}
              <ChevronDown className={`ml-auto h-4 w-4 transition-transform duration-200 ${showFiles ? "rotate-180" : ""}`} />
            </button>
            {showFiles && (
              <div className="px-4 pb-4 pt-0 space-y-3">
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
                  className={`flex w-full items-center justify-center gap-2 rounded-md border border-dashed py-8 text-sm transition-colors ${
                    dragOver
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground"
                  }`}
                >
                  <Upload className="h-4 w-4" />
                  Choose files or drag and drop
                </button>

                {fileWarning && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">{fileWarning}</p>
                )}

                {files.length > 0 && (
                  <div className="space-y-1">
                    {files.map(({ file, path }) => (
                      <div
                        key={file.name}
                        className="flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5"
                      >
                        <FileIcon className="h-3 w-3 shrink-0 text-muted-foreground" />
                        <input
                          type="text"
                          value={path}
                          onChange={(e) => updateFilePath(file.name, e.target.value)}
                          placeholder="path/to/file"
                          className="min-w-0 flex-1 bg-transparent text-sm font-mono text-foreground outline-none placeholder:text-muted-foreground"
                          title="File path in the entry repository"
                        />
                        <span className="shrink-0 text-[10px] text-muted-foreground tabular-nums">{formatFileSize(file.size)}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(file.name)}
                          className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4">
            <div className="flex items-center justify-between gap-6">
              <p className="text-xs text-muted-foreground/80">
                Entries are permanent. You can update content after publishing.
              </p>
              <Button type="submit" disabled={submitting || !user} className="shrink-0">
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    Publish
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
        </div>
      </form>
      </div>
    </div>
  );
}
