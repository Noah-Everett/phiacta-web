"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ContentDiff from "@/components/ContentDiff";
import FileIcon from "@/components/FileIcon";
import { ChevronRight, ChevronDown, Pencil, X } from "lucide-react";

interface StagedFile {
  path: string;
  originalContent: string;
  modifiedContent: string;
}

interface ProposalStagedChangesProps {
  stagedFiles: Map<string, StagedFile>;
  onUnstage: (path: string) => void;
  onEditFile: (path: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}

function countChanges(original: string, modified: string): { added: number; removed: number } {
  const origLines = original.split("\n");
  const modLines = modified.split("\n");
  let added = 0;
  let removed = 0;
  // Simple line count diff (not exact but good enough for summary)
  const maxLen = Math.max(origLines.length, modLines.length);
  for (let i = 0; i < maxLen; i++) {
    if (i >= origLines.length) { added++; continue; }
    if (i >= modLines.length) { removed++; continue; }
    if (origLines[i] !== modLines[i]) { added++; removed++; }
  }
  return { added, removed };
}

function StagedFileRow({
  staged,
  onUnstage,
  onEditFile,
}: {
  staged: StagedFile;
  onUnstage: () => void;
  onEditFile: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { added, removed } = useMemo(
    () => countChanges(staged.originalContent, staged.modifiedContent),
    [staged.originalContent, staged.modifiedContent]
  );
  const fileName = staged.path.split("/").pop() || staged.path;

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 p-4 text-left hover:bg-accent/40 transition-colors"
      >
        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        )}
        <FileIcon name={fileName} type="file" />
        <code className="flex-1 font-mono text-sm text-foreground truncate">{staged.path}</code>
        <span className="shrink-0 text-xs font-mono">
          {added > 0 && <span className="text-green-600 dark:text-green-400">+{added}</span>}
          {added > 0 && removed > 0 && <span className="text-muted-foreground mx-1">/</span>}
          {removed > 0 && <span className="text-red-600 dark:text-red-400">-{removed}</span>}
        </span>
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onEditFile}
            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onUnstage}
            className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-accent transition-colors"
            title="Remove"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </button>
      {expanded && (
        <div className="border-t border-border p-4">
          <ContentDiff original={staged.originalContent} modified={staged.modifiedContent} path={staged.path} />
        </div>
      )}
    </div>
  );
}

export default function ProposalStagedChanges({
  stagedFiles,
  onUnstage,
  onEditFile,
  onSubmit,
  onBack,
}: ProposalStagedChangesProps) {
  const files = Array.from(stagedFiles.values());

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-foreground">Staged Changes</h3>
          <Badge variant="secondary" className="text-xs">{files.length} file{files.length !== 1 ? "s" : ""}</Badge>
        </div>
      </div>

      <div className="space-y-2">
        {files.map((staged) => (
          <StagedFileRow
            key={staged.path}
            staged={staged}
            onUnstage={() => onUnstage(staged.path)}
            onEditFile={() => onEditFile(staged.path)}
          />
        ))}
      </div>

      <div className="flex items-center gap-2 pt-2">
        <Button size="sm" onClick={onSubmit} disabled={files.length === 0}>
          Continue to Submit
        </Button>
        <Button size="sm" variant="outline" onClick={onBack}>
          Edit More Files
        </Button>
      </div>
    </div>
  );
}
