"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import FileIcon from "@/components/FileIcon";
import { ChevronRight, ChevronDown, Loader2 } from "lucide-react";
import { API_URL, getStoredToken } from "@/lib/api";
import type { FileListItem } from "@/lib/types";

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

interface StagedFile {
  path: string;
  originalContent: string;
  modifiedContent: string;
}

interface ProposalFileBrowserProps {
  entryId: string;
  files: FileListItem[];
  stagedFiles: Map<string, StagedFile>;
  onSelectFile: (path: string) => void;
}

function FileRow({
  file,
  entryId,
  stagedFiles,
  onSelectFile,
  depth,
}: {
  file: FileListItem;
  entryId: string;
  stagedFiles: Map<string, StagedFile>;
  onSelectFile: (path: string) => void;
  depth: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [children, setChildren] = useState<FileListItem[] | null>(null);
  const [loading, setLoading] = useState(false);

  const isDir = file.type === "dir";
  const isImmutable = file.path === ".phiacta/entry.yaml";
  const canEdit = !isDir && !isImmutable && isTextFile(file.path);
  const isStaged = stagedFiles.has(file.path);

  const handleClick = () => {
    if (isDir) {
      const next = !expanded;
      setExpanded(next);
      if (next && children === null && !loading) {
        setLoading(true);
        const token = getStoredToken();
        const encodedPath = file.path.split("/").map(encodeURIComponent).join("/");
        fetch(`${API_URL}/v1/entries/${entryId}/files/${encodedPath}`, {
          cache: "no-store",
          ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
        })
          .then((res) => (res.ok ? res.json() : []))
          .then((items) => setChildren(items))
          .catch(() => setChildren([]))
          .finally(() => setLoading(false));
      }
    } else if (canEdit) {
      onSelectFile(file.path);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={!isDir && !canEdit}
        className={`flex w-full items-center gap-2 px-3 py-2 text-left transition-colors border-b border-border last:border-0 ${
          canEdit || isDir
            ? "hover:bg-accent/40 cursor-pointer"
            : "opacity-50 cursor-not-allowed"
        }`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        {isDir ? (
          expanded ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          )
        ) : (
          <span className="w-3.5" />
        )}
        <FileIcon name={file.name} type={file.type} />
        <code className="flex-1 font-mono text-sm text-foreground truncate">{file.name}</code>
        {isStaged && (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 text-green-700 bg-green-50 border-green-200 dark:text-green-300 dark:bg-green-950/50 dark:border-green-800">
            Modified
          </Badge>
        )}
        {isImmutable && (
          <span className="text-[10px] text-muted-foreground">(immutable)</span>
        )}
        {!isDir && !isImmutable && (
          <span className="shrink-0 font-mono text-xs text-muted-foreground">
            {formatBytes(file.size)}
          </span>
        )}
      </button>
      {isDir && expanded && (
        <>
          {loading && (
            <div className="flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground" style={{ paddingLeft: `${28 + depth * 16}px` }}>
              <Loader2 className="h-3 w-3 animate-spin" /> Loading...
            </div>
          )}
          {children?.map((child) => (
            <FileRow
              key={child.path}
              file={child}
              entryId={entryId}
              stagedFiles={stagedFiles}
              onSelectFile={onSelectFile}
              depth={depth + 1}
            />
          ))}
          {children?.length === 0 && (
            <p className="px-4 py-2 text-xs text-muted-foreground" style={{ paddingLeft: `${28 + depth * 16}px` }}>
              Empty directory.
            </p>
          )}
        </>
      )}
    </>
  );
}

export default function ProposalFileBrowser({ entryId, files, stagedFiles, onSelectFile }: ProposalFileBrowserProps) {
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card">
      <div className="border-b border-border px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Select a file to edit
        </p>
      </div>
      <div>
        {files.map((file) => (
          <FileRow
            key={file.path}
            file={file}
            entryId={entryId}
            stagedFiles={stagedFiles}
            onSelectFile={onSelectFile}
            depth={0}
          />
        ))}
        {files.length === 0 && (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading files...
          </div>
        )}
      </div>
    </div>
  );
}
