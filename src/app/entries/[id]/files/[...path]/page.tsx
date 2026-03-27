"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ChevronRight, Download, FileIcon as FileIconLucide, Pencil, Loader2, X, Check } from "lucide-react";
import { useTheme } from "next-themes";
import FileIcon from "@/components/FileIcon";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import MarkdownContent from "@/components/MarkdownContent";
import { useAuth } from "@/lib/auth-context";
import { getEntry, putEntryFile } from "@/lib/api";
import { highlightCode, getLanguageFromPath, type HighlightToken } from "@/lib/highlighter";
import type { FileListItem } from "@/lib/types";

const API_URL =
  typeof window === "undefined"
    ? process.env.API_URL_INTERNAL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:8000"
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const TEXT_EXTENSIONS = new Set([
  ".md", ".txt", ".yaml", ".yml", ".json", ".toml", ".csv", ".tex",
  ".py", ".js", ".ts", ".tsx", ".jsx", ".html", ".css", ".sh", ".lean",
  ".rs", ".go", ".java", ".c", ".h", ".cpp", ".hpp", ".rb", ".r",
  ".sql", ".xml", ".ini", ".cfg", ".env", ".gitignore", ".dockerfile",
]);

const IMAGE_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".ico", ".bmp",
]);

const PDF_EXTENSIONS = new Set([".pdf"]);

function getFileExtension(path: string): string {
  const dotIndex = path.lastIndexOf(".");
  if (dotIndex === -1) return "";
  return path.substring(dotIndex).toLowerCase();
}

function isTextFile(path: string): boolean {
  const ext = getFileExtension(path);
  return TEXT_EXTENSIONS.has(ext) || !path.includes(".");
}

function isImageFile(path: string): boolean {
  return IMAGE_EXTENSIONS.has(getFileExtension(path));
}

function isPdfFile(path: string): boolean {
  return PDF_EXTENSIONS.has(getFileExtension(path));
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

/** Parse a location hash like #L10 or #L10-L20 into a line range. */
function parseLineHash(hash: string): { start: number; end: number } | null {
  const single = /^#L(\d+)$/.exec(hash);
  if (single) {
    const n = parseInt(single[1], 10);
    return { start: n, end: n };
  }
  const range = /^#L(\d+)-L(\d+)$/.exec(hash);
  if (range) {
    const a = parseInt(range[1], 10);
    const b = parseInt(range[2], 10);
    return { start: Math.min(a, b), end: Math.max(a, b) };
  }
  return null;
}

/** Build a hash string from a line range. */
function buildLineHash(start: number, end: number): string {
  if (start === end) return `#L${start}`;
  const lo = Math.min(start, end);
  const hi = Math.max(start, end);
  return `#L${lo}-L${hi}`;
}

interface FilePageProps {
  params: Promise<{ id: string; path: string[] }>;
}

export default function FilePage({ params }: FilePageProps) {
  const { user } = useAuth();
  const [entryId, setEntryId] = useState<string>("");
  const [filePath, setFilePath] = useState<string>("");
  const [content, setContent] = useState<string | null>(null);
  const [dirItems, setDirItems] = useState<FileListItem[] | null>(null);
  const [isDir, setIsDir] = useState(false);
  const [isBinary, setIsBinary] = useState(false);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Line selection state for PHI-132
  const [selectedLines, setSelectedLines] = useState<{ start: number; end: number } | null>(null);
  const lastClickedLine = useRef<number | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  // Syntax highlighting state for PHI-131
  const { resolvedTheme } = useTheme();
  const [tokens, setTokens] = useState<HighlightToken[][] | null>(null);

  useEffect(() => {
    params.then((p) => {
      setEntryId(p.id);
      setFilePath(p.path.map((seg) => decodeURIComponent(seg)).join("/"));
    });
  }, [params]);

  // Read hash on mount and on hash change
  useEffect(() => {
    function readHash() {
      const parsed = parseLineHash(window.location.hash);
      if (parsed) {
        setSelectedLines(parsed);
      }
    }
    readHash();
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, []);

  // Scroll to selected line when content loads or selection changes
  useEffect(() => {
    if (!selectedLines || !tableRef.current) return;
    const row = tableRef.current.querySelector(`[data-line="${selectedLines.start}"]`);
    if (row) {
      row.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [selectedLines, content]);

  const handleLineClick = useCallback((lineNum: number, e: React.MouseEvent) => {
    e.preventDefault();
    let newSelection: { start: number; end: number };

    if (e.shiftKey && lastClickedLine.current !== null) {
      // Shift-click: select range from last clicked line to this line
      const start = Math.min(lastClickedLine.current, lineNum);
      const end = Math.max(lastClickedLine.current, lineNum);
      newSelection = { start, end };
    } else {
      // Normal click: select single line
      newSelection = { start: lineNum, end: lineNum };
      lastClickedLine.current = lineNum;
    }

    setSelectedLines(newSelection);
    const hash = buildLineHash(newSelection.start, newSelection.end);
    window.history.replaceState(null, "", hash);
  }, []);

  useEffect(() => {
    if (!entryId || !filePath) return;

    // For images and PDFs, skip fetching text content
    if (isImageFile(filePath) || isPdfFile(filePath)) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const encodedPath = filePath.split("/").map((seg) => encodeURIComponent(seg)).join("/");
    fetch(`${API_URL}/v1/entries/${entryId}/files/${encodedPath}`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) {
          setError("File not found");
          return;
        }
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("json")) {
          // Directory listing
          const items = await res.json();
          if (Array.isArray(items)) {
            setIsDir(true);
            setDirItems(items);
            return;
          }
        }
        // Read content-length for binary file info
        const cl = res.headers.get("content-length");
        if (cl) setFileSize(parseInt(cl, 10));

        if (isTextFile(filePath) || ct.startsWith("text/")) {
          setContent(await res.text());
        } else {
          setIsBinary(true);
        }
      })
      .catch(() => setError("Failed to load file"))
      .finally(() => setLoading(false));
  }, [entryId, filePath]);

  // Check ownership
  useEffect(() => {
    if (!entryId || !user) { setIsOwner(false); return; }
    getEntry(entryId).then((e) => setIsOwner(e.created_by === user.id)).catch(() => setIsOwner(false));
  }, [entryId, user]);

  // Syntax highlighting (PHI-131)
  useEffect(() => {
    if (!content || !filePath || filePath.endsWith(".md")) {
      setTokens(null);
      return;
    }
    const lang = getLanguageFromPath(filePath);
    if (!lang) {
      setTokens(null);
      return;
    }
    let cancelled = false;
    const theme = resolvedTheme === "dark" ? "github-dark" : "github-light";
    highlightCode(content, lang, theme).then((result) => {
      if (!cancelled) setTokens(result);
    });
    return () => { cancelled = true; };
  }, [content, filePath, resolvedTheme]);

  const handleSave = async () => {
    if (!entryId || !filePath) return;
    setSaving(true);
    setSaveError(null);
    try {
      const blob = new Blob([editText], { type: "text/plain" });
      const file = new File([blob], filePath.split("/").pop() || "file");
      await putEntryFile(entryId, filePath, file, editMessage || undefined);
      setContent(editText);
      setEditing(false);
      setEditMessage("");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const fileName = filePath.split("/").pop() || filePath;
  const isMarkdown = filePath.endsWith(".md");
  const isImage = isImageFile(filePath);
  const isPdf = isPdfFile(filePath);
  const encodedFilePath = filePath.split("/").map((seg) => encodeURIComponent(seg)).join("/");
  const fileUrl = `${API_URL}/v1/entries/${entryId}/files/${encodedFilePath}`;
  const isImmutable = filePath === ".phiacta/entry.yaml";
  const canEdit = isOwner && !isImmutable && !isDir && !isImage && !isPdf && !isBinary && content !== null;

  // Breadcrumb segments
  const segments = filePath.split("/");

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-8">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
        <Link href={`/entries/${entryId}`} className="hover:text-foreground transition-colors">
          Entry
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/entries/${entryId}`} className="hover:text-foreground transition-colors">
          Files
        </Link>
        {segments.map((seg, i) => {
          const segPath = segments.slice(0, i + 1).join("/");
          const isLast = i === segments.length - 1;
          return (
            <span key={segPath} className="flex items-center gap-1.5">
              <ChevronRight className="h-3.5 w-3.5" />
              {isLast ? (
                <span className="text-foreground font-medium">{seg}</span>
              ) : (
                <Link
                  href={`/entries/${entryId}/files/${segPath}`}
                  className="hover:text-foreground transition-colors"
                >
                  {seg}
                </Link>
              )}
            </span>
          );
        })}
      </nav>

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Directory listing */}
      {isDir && dirItems && (
        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <div className="border-b border-border px-4 py-3">
            <code className="font-mono text-sm text-muted-foreground">{filePath}/</code>
          </div>
          {dirItems.map((item) => (
            <Link
              key={item.path}
              href={`/entries/${entryId}/files/${item.path}`}
              className="flex items-center gap-2.5 px-4 py-2.5 border-b border-border last:border-0 hover:bg-accent/40 transition-colors"
            >
              <FileIcon name={item.name} type={item.type} />
              <code className="flex-1 font-mono text-sm text-foreground">{item.name}</code>
              {item.type !== "dir" && (
                <span className="shrink-0 font-mono text-xs text-muted-foreground">
                  {formatBytes(item.size)}
                </span>
              )}
            </Link>
          ))}
          {dirItems.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">Empty directory.</p>
          )}
        </div>
      )}

      {/* Image file (PHI-130) */}
      {!isDir && isImage && (
        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <div className="border-b border-border px-4 py-3 flex items-center justify-between">
            <code className="font-mono text-sm text-muted-foreground">{fileName}</code>
            <a
              href={fileUrl}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Raw
            </a>
          </div>
          <div className="flex items-center justify-center p-6 bg-muted/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fileUrl}
              alt={fileName}
              className="max-w-full max-h-[80vh] rounded-md object-contain"
            />
          </div>
        </div>
      )}

      {/* PDF file (PHI-130) */}
      {!isDir && isPdf && (
        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <div className="border-b border-border px-4 py-3 flex items-center justify-between">
            <code className="font-mono text-sm text-muted-foreground">{fileName}</code>
            <a
              href={fileUrl}
              download
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </a>
          </div>
          <iframe
            src={fileUrl}
            title={fileName}
            className="w-full h-[80vh] border-0"
          />
        </div>
      )}

      {/* Text file content (PHI-131 + PHI-132) */}
      {!isDir && !isImage && !isPdf && content !== null && (
        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <div className="border-b border-border px-4 py-3 flex items-center justify-between">
            <code className="font-mono text-sm text-muted-foreground">{fileName}</code>
            <div className="flex items-center gap-2">
              {canEdit && !editing && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={() => { setEditText(content); setEditing(true); setSaveError(null); }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
              )}
              <a
                href={fileUrl}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Raw
              </a>
            </div>
          </div>
          {editing ? (
            <div className="p-4 space-y-3">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full min-h-[400px] rounded-lg border border-border bg-background px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <input
                type="text"
                placeholder="Commit message (optional)"
                value={editMessage}
                onChange={(e) => setEditMessage(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {saveError && <p className="text-xs text-destructive">{saveError}</p>}
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5">
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  Save
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { setEditing(false); setSaveError(null); }} disabled={saving} className="gap-1.5">
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
          {isMarkdown ? (
            <div className="p-6">
              <MarkdownContent
                content={content}
                className="text-sm leading-relaxed text-card-foreground"
                entryId={entryId}
              />
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[80vh] overflow-y-auto">
              <table ref={tableRef} className="w-full text-xs font-mono leading-5 border-collapse">
                <tbody>
                  {content.split("\n").map((line, i) => {
                    const lineNum = i + 1;
                    const isHighlighted =
                      selectedLines !== null &&
                      lineNum >= selectedLines.start &&
                      lineNum <= selectedLines.end;
                    return (
                      <tr
                        key={i}
                        data-line={lineNum}
                        className={
                          isHighlighted
                            ? "bg-primary/15"
                            : "hover:bg-accent/30"
                        }
                      >
                        <td className="select-none text-right pr-4 pl-4 py-0 w-1 whitespace-nowrap sticky left-0 bg-card">
                          <a
                            href={`#L${lineNum}`}
                            onClick={(e) => handleLineClick(lineNum, e)}
                            className={
                              isHighlighted
                                ? "text-primary font-medium"
                                : "text-muted-foreground/50 hover:text-muted-foreground"
                            }
                          >
                            {lineNum}
                          </a>
                        </td>
                        <td className="pr-4 py-0 whitespace-pre text-foreground">
                          {tokens?.[i]?.length
                            ? tokens[i].map((token, j) => (
                                <span key={j} style={token.color ? { color: token.color } : undefined}>
                                  {token.content}
                                </span>
                              ))
                            : (line || " ")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
            </>
          )}
        </div>
      )}

      {/* Binary file (PHI-130) */}
      {!isDir && !isImage && !isPdf && isBinary && (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <FileIconLucide className="h-10 w-10 text-muted-foreground/50" />
            <div>
              <p className="text-sm font-medium text-foreground">{fileName}</p>
              {fileSize !== null && (
                <p className="text-xs text-muted-foreground mt-1">{formatBytes(fileSize)}</p>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                Binary file — preview not available.
              </p>
            </div>
            <a
              href={fileUrl}
              download
              className="inline-flex items-center gap-1.5 mt-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download raw file
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
