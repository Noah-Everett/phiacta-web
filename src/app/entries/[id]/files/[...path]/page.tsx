"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import FileIcon from "@/components/FileIcon";
import { Skeleton } from "@/components/ui/skeleton";
import MarkdownContent from "@/components/MarkdownContent";
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

function isTextFile(path: string): boolean {
  const ext = path.substring(path.lastIndexOf(".")).toLowerCase();
  return TEXT_EXTENSIONS.has(ext) || !path.includes(".");
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

interface FilePageProps {
  params: Promise<{ id: string; path: string[] }>;
}

export default function FilePage({ params }: FilePageProps) {
  const [entryId, setEntryId] = useState<string>("");
  const [filePath, setFilePath] = useState<string>("");
  const [content, setContent] = useState<string | null>(null);
  const [dirItems, setDirItems] = useState<FileListItem[] | null>(null);
  const [isDir, setIsDir] = useState(false);
  const [isBinary, setIsBinary] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => {
      setEntryId(p.id);
      setFilePath(p.path.join("/"));
    });
  }, [params]);

  useEffect(() => {
    if (!entryId || !filePath) return;
    setLoading(true);
    setError(null);

    fetch(`${API_URL}/v1/entries/${entryId}/files/${filePath}`, { cache: "no-store" })
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
        if (isTextFile(filePath) || ct.startsWith("text/")) {
          setContent(await res.text());
        } else {
          setIsBinary(true);
        }
      })
      .catch(() => setError("Failed to load file"))
      .finally(() => setLoading(false));
  }, [entryId, filePath]);

  const fileName = filePath.split("/").pop() || filePath;
  const parentPath = filePath.includes("/")
    ? filePath.substring(0, filePath.lastIndexOf("/"))
    : null;
  const isMarkdown = filePath.endsWith(".md");

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

      {/* File content */}
      {!isDir && content !== null && (
        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <div className="border-b border-border px-4 py-3 flex items-center justify-between">
            <code className="font-mono text-sm text-muted-foreground">{fileName}</code>
            <a
              href={`${API_URL}/v1/entries/${entryId}/files/${filePath}`}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Raw
            </a>
          </div>
          {isMarkdown ? (
            <div className="p-6">
              <MarkdownContent
                content={content}
                className="text-sm leading-relaxed text-card-foreground"
                entryId={entryId}
              />
            </div>
          ) : (
            <pre className="overflow-x-auto px-4 py-3 text-xs font-mono text-foreground leading-5 max-h-[80vh] overflow-y-auto">
              {content}
            </pre>
          )}
        </div>
      )}

      {/* Binary file */}
      {!isDir && isBinary && (
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground mb-3">Binary file — preview not available.</p>
          <a
            href={`${API_URL}/v1/entries/${entryId}/files/${filePath}`}
            className="text-sm text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Download raw file
          </a>
        </div>
      )}
    </div>
  );
}
