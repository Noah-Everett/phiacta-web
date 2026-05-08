"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MarkdownContent from "@/components/MarkdownContent";
import LatexContent from "@/components/LatexContent";
import EntityLink from "@/components/EntityLink";
import FileIcon from "@/components/FileIcon";
import DiffBlock from "@/components/DiffBlock";
import ProposalWorkspace from "@/components/ProposalWorkspace";
import {
  GitBranch,
  ChevronRight,
  ChevronDown,
  FileCode2,
  File,
  Loader2,
  MessageCircle,
  CircleDot,
  GitMerge,
  Link2,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  Plus,
  Trash2,
  Upload,
  Search,
  Expand,
  XCircle,
} from "lucide-react";
import {
  getEntryFiles,
  getEntryHistory,
  getEntryCommitDiff,
  putEntryFile,
  deleteEntryFile,
  createReference,
  deleteReference,
  searchEntries,
  createIssue,
  getCompiledPdfUrl,
  listJobs,
  API_URL,
  getStoredToken,
} from "@/lib/api";
import type {
  EditProposalListItem,
  CommitListItem,
  CommitDiffResponse,
  FileListItem,
  SearchResultItem,
  JobListItem,
} from "@/lib/types";
import GraphPanel from "@/components/GraphPanel";
import { useEntryContext } from "./entry-context";

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

const REL_TYPES = ["cites", "supports", "refutes", "extends", "derives-from", "reviews"];

// Edit row — links to full page
function EditRow({ edit, entryId }: { edit: EditProposalListItem; entryId: string }) {
  return (
    <Link
      href={`/entries/${entryId}/edits/${edit.number}`}
      className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary/30 hover:shadow-sm transition-all"
    >
      {edit.state === "open" ? (
        <GitBranch className="h-4 w-4 shrink-0 text-green-500" />
      ) : (
        <GitMerge className="h-4 w-4 shrink-0 text-violet-500" />
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{edit.title}</p>
        <p className="text-xs text-muted-foreground">
          #{edit.number} &middot; {edit.author.username} &middot;{" "}
          {new Date(edit.created_at).toLocaleDateString()}
        </p>
      </div>
      <Badge
        variant="outline"
        className={
          edit.state === "open"
            ? "text-green-700 border-green-200 bg-green-50 dark:text-green-300 dark:border-green-800 dark:bg-green-950/50"
            : "text-violet-700 border-violet-200 bg-violet-50 dark:text-violet-300 dark:border-violet-800 dark:bg-violet-950/50"
        }
      >
        {edit.merged_at ? "merged" : edit.state}
      </Badge>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}

// Inline expandable commit
function CommitRow({ commit, index, total, entryId }: { commit: CommitListItem; index: number; total: number; entryId: string }) {
  const [open, setOpen] = useState(false);
  const [diff, setDiff] = useState<CommitDiffResponse | null>(null);
  const [loadingDiff, setLoadingDiff] = useState(false);

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next && !diff && !loadingDiff) {
      setLoadingDiff(true);
      getEntryCommitDiff(entryId, commit.sha)
        .then(setDiff)
        .catch((err) => console.warn("Failed to load commit diff:", err))
        .finally(() => setLoadingDiff(false));
    }
  };

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <button
        onClick={handleToggle}
        className="flex w-full items-start gap-3 bg-card p-4 text-left hover:bg-accent/40 transition-colors"
      >
        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[10px] font-mono text-muted-foreground">
          {total - index}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">{commit.message}</p>
          <p className="text-xs text-muted-foreground">
            {commit.author.name} &middot;{" "}
            {new Date(commit.timestamp).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <code className="font-mono text-[10px] text-muted-foreground">
            {commit.sha.slice(0, 7)}
          </code>
          <Link
            href={`/entries/${entryId}/history/${commit.sha}`}
            onClick={(e) => e.stopPropagation()}
            className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            title="Full diff view"
          >
            <Expand className="h-3.5 w-3.5" />
          </Link>
          {open ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {open && (
        <div className="border-t border-border bg-background p-4 space-y-3">
          <div className="text-xs text-muted-foreground">
            <p>Author: {commit.author.name} &lt;{commit.author.email}&gt;</p>
            <p>Full SHA: <code className="font-mono">{commit.sha}</code></p>
          </div>
          {loadingDiff && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading diff&hellip;
            </div>
          )}
          {diff && diff.files_changed.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {diff.files_changed.length} file{diff.files_changed.length > 1 ? "s" : ""} changed
              </p>
              {diff.files_changed.map((f) => (
                <DiffBlock key={f.path} path={f.path} patch={f.patch} />
              ))}
            </div>
          )}
          {diff && diff.files_changed.length === 0 && (
            <p className="text-xs text-muted-foreground">No file changes in this commit.</p>
          )}
        </div>
      )}
    </div>
  );
}

// File row — expandable with content preview (handles dirs and files)
function FileRow({ file, entryId }: { file: FileListItem; entryId: string }) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const [children, setChildren] = useState<FileListItem[] | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [isText, setIsText] = useState(true);

  const isDir = file.type === "dir";

  const textExtensions = new Set([
    ".md", ".txt", ".yaml", ".yml", ".json", ".toml", ".csv", ".tex",
    ".py", ".js", ".ts", ".tsx", ".jsx", ".html", ".css", ".sh", ".lean",
    ".rs", ".go", ".java", ".c", ".h", ".cpp", ".hpp", ".rb", ".r",
    ".sql", ".xml", ".ini", ".cfg", ".env", ".gitignore", ".dockerfile",
  ]);

  const isTextFile = useCallback((path: string) => {
    const ext = path.substring(path.lastIndexOf(".")).toLowerCase();
    return textExtensions.has(ext) || !path.includes(".");
  }, []);

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (!next) return;

    if (isDir) {
      if (children === null && !loadingContent) {
        setLoadingContent(true);
        const dirToken = getStoredToken();
        fetch(`${API_URL}/v1/entries/${entryId}/files/${file.path}`, {
          cache: "no-store",
          ...(dirToken ? { headers: { Authorization: `Bearer ${dirToken}` } } : {}),
        })
          .then((res) => res.ok ? res.json() : [])
          .then((items) => setChildren(items))
          .catch(() => setChildren([]))
          .finally(() => setLoadingContent(false));
      }
      return;
    }

    if (content === null && !loadingContent) {
      if (!isTextFile(file.path)) {
        setIsText(false);
        return;
      }
      setLoadingContent(true);
      const fileToken = getStoredToken();
      fetch(`${API_URL}/v1/entries/${entryId}/files/${file.path}`, {
        cache: "no-store",
        ...(fileToken ? { headers: { Authorization: `Bearer ${fileToken}` } } : {}),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch");
          const ct = res.headers.get("content-type") || "";
          if (ct.startsWith("text/") || ct.includes("json") || ct.includes("yaml") || ct.includes("xml")) {
            return res.text();
          }
          setIsText(false);
          return null;
        })
        .then((text) => { if (text !== null) setContent(text); })
        .catch((err) => { console.warn("Failed to load file:", err); setContent(null); })
        .finally(() => setLoadingContent(false));
    }
  };

  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={handleToggle}
        className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left hover:bg-accent/40 transition-colors"
      >
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        )}
        {isDir ? (
          <FileCode2 className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <File className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <code className="flex-1 font-mono text-sm text-foreground">{file.name}</code>
        {!isDir && (
          <span className="shrink-0 font-mono text-xs text-muted-foreground">
            {formatBytes(file.size)}
          </span>
        )}
      </button>
      {open && (
        <div className="border-t border-border bg-background">
          {loadingContent && (
            <div className="flex items-center gap-2 px-4 py-3 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading&hellip;
            </div>
          )}
          {isDir && children !== null && (
            <div className="pl-4">
              {children.map((child: FileListItem) => (
                <FileRow key={child.path} file={child} entryId={entryId} />
              ))}
              {children.length === 0 && (
                <p className="px-4 py-3 text-xs text-muted-foreground">Empty directory.</p>
              )}
            </div>
          )}
          {!isDir && !isText && (
            <div className="px-4 py-3 text-xs text-muted-foreground">
              Binary file &mdash; preview not available.
            </div>
          )}
          {!isDir && content !== null && (
            <pre className="overflow-x-auto px-4 py-3 text-xs font-mono text-foreground leading-5 max-h-[500px] overflow-y-auto">
              {content}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

// Issue row — links to full page
function IssueRow({ issue, entryId }: { issue: { number: number; title: string; state: string; author: { username: string }; created_at: string; comments_count: number }; entryId: string }) {
  return (
    <Link
      href={`/entries/${entryId}/issues/${issue.number}`}
      className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary/30 hover:shadow-sm transition-all"
    >
      <CircleDot className={`h-4 w-4 shrink-0 ${issue.state === "open" ? "text-green-500" : "text-muted-foreground"}`} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{issue.title}</p>
        <p className="text-xs text-muted-foreground">
          #{issue.number} &middot; {issue.author.username} &middot;{" "}
          {new Date(issue.created_at).toLocaleDateString()}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {issue.comments_count > 0 && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MessageCircle className="h-3 w-3" />
            {issue.comments_count}
          </span>
        )}
        <Badge
          variant="outline"
          className={
            issue.state === "open"
              ? "text-green-700 border-green-200 bg-green-50 dark:text-green-300 dark:border-green-800 dark:bg-green-950/50"
              : "text-muted-foreground border-border"
          }
        >
          {issue.state}
        </Badge>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </Link>
  );
}

const VALID_TABS = ["content", "issues", "proposals", "history", "files", "references"] as const;

export default function EntryPage() {
  const {
    entry,
    isOwner,
    isAuthenticated,
    resolvedId,
    issues,
    edits,
    compiledInfo,
    refetchEntry,
    refetchIssues,
    refetchEdits,
    editing,
    exitEditMode,
  } = useEntryContext();

  const router = useRouter();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get("tab");
  const activeTab = tabParam && (VALID_TABS as readonly string[]).includes(tabParam) ? tabParam : "content";

  // Page-specific data
  const [entryFiles, setEntryFiles] = useState<FileListItem[]>([]);
  const [history, setHistory] = useState<CommitListItem[]>([]);
  const [contentText, setContentText] = useState<string | null>(null);
  const [contentFormat, setContentFormat] = useState<string>("md");


  // Reference adding
  const [addingReference, setAddingReference] = useState(false);
  const [refSearchQuery, setRefSearchQuery] = useState("");
  const [refSearchResults, setRefSearchResults] = useState<SearchResultItem[]>([]);
  const [refSearching, setRefSearching] = useState(false);
  const [refSelectedEntry, setRefSelectedEntry] = useState<SearchResultItem | null>(null);
  const [refRel, setRefRel] = useState("cites");
  const [refNote, setRefNote] = useState("");
  const [refSaving, setRefSaving] = useState(false);
  const [refError, setRefError] = useState<string | null>(null);
  const [refDeleting, setRefDeleting] = useState<string | null>(null);

  // File upload
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<{ file: File; path: string }[]>([]);
  const [uploadMessage, setUploadMessage] = useState("");
  const [fileSaving, setFileSaving] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileDeleting, setFileDeleting] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Job status polling
  const [activeJobs, setActiveJobs] = useState<JobListItem[]>([]);
  const [failedCompilationJob, setFailedCompilationJob] = useState<JobListItem | null>(null);
  const jobPollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialJobCheckRef = useRef(false);

  // Create issue
  const [creatingIssue, setCreatingIssue] = useState(false);
  const [issueTitle, setIssueTitle] = useState("");
  const [issueBody, setIssueBody] = useState("");
  const [issueSaving, setIssueSaving] = useState(false);
  const [issueError, setIssueError] = useState<string | null>(null);

  // Proposal workspace
  const [creatingProposal, setCreatingProposal] = useState(false);

  // --- Data fetching helpers ---

  const fetchFiles = useCallback((id: string) => {
    getEntryFiles(id).then(setEntryFiles).catch((err) => console.warn("Failed to load files:", err));
  }, []);

  const fetchContent = useCallback(async (id: string) => {
    const contentToken = getStoredToken();
    const authHeaders: Record<string, string> = contentToken ? { Authorization: `Bearer ${contentToken}` } : {};
    for (const ext of [".md", ".tex", ".txt"]) {
      try {
        const res = await fetch(`${API_URL}/v1/entries/${id}/files/.phiacta/content${ext}`, { cache: "no-store", headers: authHeaders });
        if (res.ok) {
          const text = await res.text();
          if (text) {
            setContentText(text);
            setContentFormat(ext.slice(1));
          }
          return;
        }
      } catch {}
    }
  }, []);


  // Poll jobs for this entry until none are pending/running, then refresh compiledInfo
  const pollJobs = useCallback((entryId: string) => {
    if (jobPollRef.current) clearTimeout(jobPollRef.current);

    const poll = async () => {
      try {
        // Only count pending/running jobs as "active". Without this filter
        // listJobs returns completed/failed jobs too, and active.length stays
        // > 0 forever — UI shows "compiling…" indefinitely.
        const result = await listJobs({
          entity_id: entryId,
          status: "pending,running",
          limit: 20,
        });
        const active = result.items;
        setActiveJobs(active);
        if (active.length > 0) {
          // Still running — poll again in 2s
          jobPollRef.current = setTimeout(poll, 2000);
        } else {
          // All done — check for failures (only if no completed job exists), then refresh entry
          setActiveJobs([]);
          try {
            const terminalResult = await listJobs({
              entity_id: entryId,
              job_type: "compiled_content",
              status: "completed,failed",
              limit: 10,
            });
            const hasCompleted = terminalResult.items.some((j) => j.status === "completed");
            const firstFailed = terminalResult.items.find((j) => j.status === "failed");
            // Only show failure if no completed job exists (completed = retried successfully)
            setFailedCompilationJob(!hasCompleted && firstFailed ? firstFailed : null);
          } catch {
            setFailedCompilationJob(null);
          }
          await refetchEntry();
        }
      } catch {
        // Not authenticated or error — stop polling silently
        setActiveJobs([]);
      }
    };

    poll();
  }, [refetchEntry]);

  // Fetch page-specific data when entry is available
  useEffect(() => {
    if (!resolvedId || !entry) return;

    fetchFiles(resolvedId);
    getEntryHistory(resolvedId).then(setHistory).catch((err) => console.warn("Failed to load history:", err));
    fetchContent(resolvedId);
  }, [resolvedId, entry, fetchFiles, fetchContent]);

  // On initial load, check for in-progress or failed compilation jobs
  useEffect(() => {
    if (!resolvedId || !entry || initialJobCheckRef.current) return;
    if (compiledInfo !== null) return; // already compiled — no need to check
    initialJobCheckRef.current = true;

    (async () => {
      try {
        // Only check for pending/running jobs — see comment in pollJobs.
        const activeResult = await listJobs({
          entity_id: resolvedId,
          status: "pending,running",
          limit: 20,
        });
        if (activeResult.items.length > 0) {
          pollJobs(resolvedId);
          return;
        }
        const failedResult = await listJobs({
          entity_id: resolvedId,
          job_type: "compiled_content",
          status: "failed",
          limit: 5,
        });
        setFailedCompilationJob(failedResult.items[0] ?? null);
      } catch {
        // Not authenticated or no jobs — ignore
      }
    })();
  }, [resolvedId, entry, compiledInfo, pollJobs]);

  // Clear page-local sub-states when edit mode exits
  useEffect(() => {
    if (!editing) {
      setAddingReference(false);
      setRefSearchQuery("");
      setRefSearchResults([]);
      setRefSelectedEntry(null);
      setRefRel("cites");
      setRefNote("");
      setRefError(null);
      setUploadingFile(false);
      setUploadFiles([]);
      setUploadMessage("");
      setFileError(null);
      setDragOver(false);
    }
  }, [editing]);

  // Clean up poll timer on unmount
  useEffect(() => {
    return () => {
      if (jobPollRef.current) clearTimeout(jobPollRef.current);
    };
  }, []);

  // --- Action handlers ---

  const handleRefSearch = async () => {
    if (!refSearchQuery.trim()) return;
    setRefSearching(true);
    try {
      const data = await searchEntries(refSearchQuery.trim());
      setRefSearchResults(data.items.filter((item) => item.entry_id !== resolvedId));
    } catch {
      setRefSearchResults([]);
    } finally {
      setRefSearching(false);
    }
  };

  const handleRefSubmit = async () => {
    if (!resolvedId || !refSelectedEntry) return;
    setRefSaving(true);
    setRefError(null);
    try {
      await createReference(resolvedId, refSelectedEntry.entry_id, refRel, refNote || undefined);
      await refetchEntry();
      setAddingReference(false);
      setRefSearchQuery("");
      setRefSearchResults([]);
      setRefSelectedEntry(null);
      setRefRel("cites");
      setRefNote("");
    } catch (err) {
      setRefError(err instanceof Error ? err.message : "Failed to create reference");
    } finally {
      setRefSaving(false);
    }
  };

  const handleRefDelete = async (referenceId: string) => {
    if (!resolvedId) return;
    setRefDeleting(referenceId);
    try {
      await deleteReference(referenceId);
      await refetchEntry();
    } catch (err) {
      console.warn("Failed to delete reference:", err);
    } finally {
      setRefDeleting(null);
    }
  };

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

  const handleUploadFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected) return;
    const newFiles: { file: File; path: string }[] = [];
    for (let i = 0; i < selected.length; i++) {
      const f = selected[i];
      if (f.size > MAX_FILE_SIZE) continue;
      if (!uploadFiles.some((existing) => existing.file.name === f.name) && !newFiles.some((n) => n.file.name === f.name)) {
        newFiles.push({ file: f, path: f.name });
      }
    }
    setUploadFiles((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  };

  const handleUploadFilesDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files;
    if (!dropped) return;
    const newFiles: { file: File; path: string }[] = [];
    for (let i = 0; i < dropped.length; i++) {
      const f = dropped[i];
      if (f.size > MAX_FILE_SIZE) continue;
      if (!uploadFiles.some((existing) => existing.file.name === f.name) && !newFiles.some((n) => n.file.name === f.name)) {
        newFiles.push({ file: f, path: f.name });
      }
    }
    setUploadFiles((prev) => [...prev, ...newFiles]);
  };

  const removeUploadFile = (name: string) => {
    setUploadFiles((prev) => prev.filter((f) => f.file.name !== name));
  };

  const updateUploadFilePath = (name: string, path: string) => {
    setUploadFiles((prev) => prev.map((f) => f.file.name === name ? { ...f, path } : f));
  };

  const handleFileUpload = async () => {
    if (!resolvedId || uploadFiles.length === 0) return;
    setFileSaving(true);
    setFileError(null);
    const failures: string[] = [];
    for (const { file, path } of uploadFiles) {
      try {
        const filePath = path.trim() || file.name;
        await putEntryFile(resolvedId, filePath, file, uploadMessage || undefined);
      } catch (err) {
        failures.push(`${path || file.name}: ${err instanceof Error ? err.message : "failed"}`);
      }
    }
    fetchFiles(resolvedId);
    if (failures.length > 0) {
      setFileError(`Failed to upload ${failures.length} file(s): ${failures.join("; ")}`);
      const failedNames = new Set(failures.map((f) => f.split(":")[0].trim()));
      setUploadFiles((prev) => prev.filter((f) => failedNames.has(f.path.trim() || f.file.name)));
    } else {
      setUploadingFile(false);
      setUploadFiles([]);
      setUploadMessage("");
      // Start polling for any jobs triggered by the upload (e.g. LaTeX compilation)
      pollJobs(resolvedId);
    }
    setFileSaving(false);
  };

  const handleFileDelete = async (path: string) => {
    if (!resolvedId) return;
    setFileDeleting(path);
    try {
      await deleteEntryFile(resolvedId, path);
      fetchFiles(resolvedId);
    } catch (err) {
      console.warn("Failed to delete file:", err);
    } finally {
      setFileDeleting(null);
    }
  };

  const handleIssueSubmit = async () => {
    if (!resolvedId || !issueTitle.trim()) return;
    setIssueSaving(true);
    setIssueError(null);
    try {
      await createIssue(resolvedId, issueTitle.trim(), issueBody.trim() || undefined);
      refetchIssues();
      setCreatingIssue(false);
      setIssueTitle("");
      setIssueBody("");
    } catch (err) {
      setIssueError(err instanceof Error ? err.message : "Failed to create issue");
    } finally {
      setIssueSaving(false);
    }
  };


  // Layout handles loading/error — if entry is null, we're still loading
  if (!entry) return null;

  return (
    <>
      <div>
          {/* Content */}
          {activeTab === "content" && (
            <div className="space-y-4">
              {activeJobs.length > 0 && (
                <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                  <span>
                    {activeJobs.some((j) => j.job_type === "compiled_content")
                      ? "PDF compiling\u2026"
                      : `Processing\u2026 (${activeJobs.length} job${activeJobs.length > 1 ? "s" : ""})`}
                  </span>
                </div>
              )}
              {failedCompilationJob && !compiledInfo && (
                <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">
                  <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    PDF compilation failed.
                    {failedCompilationJob.last_error && (
                      <> Error: <code className="ml-1 font-mono text-xs">{failedCompilationJob.last_error.slice(0, 200)}</code></>
                    )}
                  </span>
                </div>
              )}
              {compiledInfo && resolvedId ? (
                <div>
                  <iframe
                    key={compiledInfo.compiled_at}
                    src={getCompiledPdfUrl(resolvedId)}
                    className="w-full rounded-xl border border-border bg-muted/30"
                    style={{ height: "750px" }}
                    title="Compiled PDF"
                  />
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-card p-6">
                  {contentText && contentFormat === "tex" ? (
                    <LatexContent
                      content={contentText}
                      className="text-sm leading-relaxed text-card-foreground"
                      entryId={entry.id}
                    />
                  ) : contentText ? (
                    <MarkdownContent
                      content={contentText}
                      className="text-sm leading-relaxed text-card-foreground"
                      entryId={entry.id}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No rendered content available. Browse the source under{" "}
                      <button
                        className="underline hover:text-foreground transition-colors"
                        onClick={() => router.push(`/entries/${resolvedId}?tab=files`)}
                      >.phiacta/content/</button>.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Issues */}
          {activeTab === "issues" && (
            <>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Issues are discussions and bug reports on this entry.
                </p>
                {isAuthenticated && !creatingIssue && (
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setCreatingIssue(true)}>
                    <Plus className="h-3.5 w-3.5" />
                    New Issue
                  </Button>
                )}
              </div>
              {creatingIssue && (
                <div className="mb-4 rounded-xl border border-border bg-card p-4 space-y-3">
                  <Input
                    value={issueTitle}
                    onChange={(e) => setIssueTitle(e.target.value)}
                    placeholder="Issue title (required)"
                    className="text-sm"
                  />
                  <textarea
                    value={issueBody}
                    onChange={(e) => setIssueBody(e.target.value)}
                    placeholder="Description (optional, markdown supported)"
                    rows={4}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none resize-y"
                  />
                  {issueError && <p className="text-xs text-destructive">{issueError}</p>}
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={handleIssueSubmit} disabled={issueSaving || !issueTitle.trim()}>
                      {issueSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Plus className="h-3.5 w-3.5 mr-1" />}
                      Create Issue
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setCreatingIssue(false); setIssueTitle(""); setIssueBody(""); setIssueError(null); }} disabled={issueSaving}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                {issues.map((issue) => (
                  <IssueRow key={issue.number} issue={issue} entryId={entry.id} />
                ))}
                {issues.length === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">No issues yet.</p>
                )}
              </div>
            </>
          )}

          {/* Proposals */}
          {activeTab === "proposals" && (
            <>
              {!creatingProposal ? (
                <>
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Edit proposals are content changes — like pull requests on the entry&apos;s repository.
                    </p>
                    {isAuthenticated && (
                      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setCreatingProposal(true)}>
                        <Plus className="h-3.5 w-3.5" />
                        New Proposal
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {edits.map((edit) => (
                      <EditRow key={edit.number} edit={edit} entryId={entry.id} />
                    ))}
                    {edits.length === 0 && (
                      <p className="py-8 text-center text-sm text-muted-foreground">No proposals yet.</p>
                    )}
                  </div>
                </>
              ) : (
                <ProposalWorkspace
                  entryId={resolvedId}
                  isOwner={isOwner}
                  entryFiles={entryFiles}
                  onComplete={() => {
                    setCreatingProposal(false);
                    refetchEdits();
                    refetchEntry();
                  }}
                  onCancel={() => setCreatingProposal(false)}
                />
              )}
            </>
          )}

          {/* History */}
          {activeTab === "history" && (
            <div className="space-y-2">
              {history.map((commit, i) => (
                <CommitRow key={commit.sha} commit={commit} index={i} total={history.length} entryId={entry.id} />
              ))}
              {history.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">No commit history yet.</p>
              )}
            </div>
          )}

          {/* Files */}
          {activeTab === "files" && (
            <div className="rounded-xl border border-border overflow-hidden bg-card">
              <div className="border-b border-border px-4 py-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Files
                </p>
                <div className="flex items-center gap-2">
                  {editing && !uploadingFile && (
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setUploadingFile(true)}>
                      <Upload className="h-3.5 w-3.5" />
                      Upload File
                    </Button>
                  )}
                  <code className="font-mono text-xs text-muted-foreground">
                    {entry.id.slice(0, 8)}
                  </code>
                </div>
              </div>
              {uploadingFile && (
                <div className="border-b border-border p-4 space-y-3 bg-accent/20">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleUploadFilesSelected}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleUploadFilesDrop}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl border border-dashed py-8 text-sm transition-colors ${
                      dragOver
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground"
                    }`}
                  >
                    <Upload className="h-4 w-4" />
                    Choose files or drag and drop
                  </button>

                  {uploadFiles.length > 0 && (
                    <div className="space-y-1.5">
                      {uploadFiles.map(({ file, path }) => (
                        <div
                          key={file.name}
                          className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2"
                        >
                          <File className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="shrink-0 text-xs font-medium text-muted-foreground">Path:</span>
                              <input
                                type="text"
                                value={path}
                                onChange={(e) => updateUploadFilePath(file.name, e.target.value)}
                                placeholder="e.g., figures/image.png"
                                className="w-full rounded px-1.5 py-0.5 text-sm text-foreground font-mono outline-none border border-transparent bg-transparent focus:border-border focus:bg-muted/50 transition-colors"
                                title="File path in the entry repository"
                              />
                            </div>
                            <p className="mt-0.5 text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeUploadFile(file.name)}
                            className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                            disabled={fileSaving}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <Input
                    value={uploadMessage}
                    onChange={(e) => setUploadMessage(e.target.value)}
                    placeholder="Commit message (optional)"
                    className="text-sm"
                  />
                  {fileError && <p className="text-xs text-destructive">{fileError}</p>}
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={handleFileUpload} disabled={fileSaving || uploadFiles.length === 0}>
                      {fileSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Upload className="h-3.5 w-3.5 mr-1" />}
                      Upload
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setUploadingFile(false); setUploadFiles([]); setUploadMessage(""); setFileError(null); setDragOver(false); }} disabled={fileSaving}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              <div>
                {entryFiles.map((file) => (
                  <div key={file.path} className="flex items-center border-b border-border last:border-0">
                    <Link
                      href={`/entries/${entry.id}/files/${file.path}`}
                      className="flex flex-1 items-center gap-2.5 px-4 py-2.5 hover:bg-accent/40 transition-colors min-w-0"
                    >
                      <FileIcon name={file.name} type={file.type} />
                      <code className="flex-1 font-mono text-sm text-foreground truncate">{file.name}</code>
                      {file.type !== "dir" && (
                        <span className="shrink-0 font-mono text-xs text-muted-foreground">
                          {formatBytes(file.size)}
                        </span>
                      )}
                    </Link>
                    {editing && file.path !== ".phiacta/entry.yaml" && file.name !== "entry.yaml" && (
                      <button
                        onClick={() => handleFileDelete(file.path)}
                        disabled={fileDeleting === file.path}
                        className="shrink-0 p-2.5 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                        title="Delete file"
                      >
                        {fileDeleting === file.path ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                ))}
                {entryFiles.length === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">No files yet.</p>
                )}
              </div>
            </div>
          )}

          {/* References */}
          {activeTab === "references" && (
            <>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Typed links between this entry and other entries in the knowledge graph.
                </p>
                {editing && !addingReference && (
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setAddingReference(true)}>
                    <Plus className="h-3.5 w-3.5" />
                    Add Reference
                  </Button>
                )}
              </div>
              {/* Reference graph */}
              {resolvedId && (
                <div className="mb-4">
                  <GraphPanel seedIds={[resolvedId]} height={320} />
                </div>
              )}
              {addingReference && (
                <div className="mb-4 rounded-xl border border-border bg-card p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      value={refSearchQuery}
                      onChange={(e) => setRefSearchQuery(e.target.value)}
                      placeholder="Search for an entry..."
                      className="text-sm flex-1"
                      onKeyDown={(e) => { if (e.key === "Enter") handleRefSearch(); }}
                    />
                    <Button size="sm" variant="outline" onClick={handleRefSearch} disabled={refSearching}>
                      {refSearching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                  {refSearchResults.length > 0 && (
                    <div className="max-h-48 overflow-y-auto rounded-md border border-border">
                      {refSearchResults.map((result) => (
                        <button
                          key={result.entry_id}
                          onClick={() => setRefSelectedEntry(result)}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-accent/40 transition-colors border-b border-border last:border-0 ${
                            refSelectedEntry?.entry_id === result.entry_id ? "bg-accent" : ""
                          }`}
                        >
                          <p className="font-medium text-foreground truncate">{result.title}</p>
                          {result.summary && (
                            <p className="text-xs text-muted-foreground truncate">{result.summary}</p>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  {refSelectedEntry && (
                    <div className="text-xs text-muted-foreground">
                      Selected: <span className="font-medium text-foreground">{refSelectedEntry.title}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Select value={refRel} onValueChange={setRefRel}>
                      <SelectTrigger className="w-44 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {REL_TYPES.map((rel) => (
                          <SelectItem key={rel} value={rel}>{rel}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={refNote}
                      onChange={(e) => setRefNote(e.target.value)}
                      placeholder="Note (optional)"
                      className="text-sm flex-1"
                    />
                  </div>
                  {refError && <p className="text-xs text-destructive">{refError}</p>}
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={handleRefSubmit} disabled={refSaving || !refSelectedEntry}>
                      {refSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Plus className="h-3.5 w-3.5 mr-1" />}
                      Add Reference
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setAddingReference(false); setRefSearchQuery(""); setRefSearchResults([]); setRefSelectedEntry(null); setRefRel("cites"); setRefNote(""); setRefError(null); }} disabled={refSaving}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                {entry?.references && entry.references.length > 0 ? (
                  entry.references.map((ref) => {
                    const isOutgoing = ref.from_entity_id === entry.id;
                    const targetId = isOutgoing ? ref.to_entity_id : ref.from_entity_id;
                    return (
                      <div
                        key={ref.id}
                        className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
                      >
                        {isOutgoing ? (
                          <ArrowUpRight className="h-4 w-4 shrink-0 text-blue-500" aria-label="Outgoing" />
                        ) : (
                          <ArrowDownLeft className="h-4 w-4 shrink-0 text-green-500" aria-label="Incoming" />
                        )}
                        <div className="min-w-0 flex-1">
                          <EntityLink id={targetId} className="text-sm text-primary hover:underline block truncate" />
                          {ref.note && (
                            <p className="text-xs text-muted-foreground truncate">{ref.note}</p>
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <div className="flex flex-col items-end gap-0.5">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              {ref.rel}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(ref.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          </div>
                          {editing && isOutgoing && (
                            <button
                              onClick={() => handleRefDelete(ref.id)}
                              disabled={refDeleting === ref.id}
                              className="p-1 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                              title="Delete reference"
                            >
                              {refDeleting === ref.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <X className="h-3.5 w-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="py-8 text-center text-sm text-muted-foreground">No references yet.</p>
                )}
              </div>
            </>
          )}

      </div>
    </>
  );
}
