"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import FileIcon from "@/components/FileIcon";
import { GitBranch, Check, Loader2, ArrowLeft } from "lucide-react";

interface StagedFile {
  path: string;
  originalContent: string;
  modifiedContent: string;
}

interface ProposalSubmitFormProps {
  stagedFiles: Map<string, StagedFile>;
  title: string;
  body: string;
  onTitleChange: (title: string) => void;
  onBodyChange: (body: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  submitting: boolean;
  error: string | null;
  isOwner: boolean;
  onDirectCommit?: () => void;
}

export default function ProposalSubmitForm({
  stagedFiles,
  title,
  body,
  onTitleChange,
  onBodyChange,
  onSubmit,
  onBack,
  submitting,
  error,
  isOwner,
  onDirectCommit,
}: ProposalSubmitFormProps) {
  const files = Array.from(stagedFiles.values());

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-foreground">{isOwner ? "Submit Edit" : "Propose Edit"}</h3>

      <Input
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Describe your changes (required)"
        className="text-sm"
        autoFocus
      />

      <textarea
        value={body}
        onChange={(e) => onBodyChange(e.target.value)}
        placeholder="Additional details (optional, markdown supported)"
        rows={3}
        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none resize-y"
      />

      {/* File summary */}
      <div className="rounded-lg border border-border bg-muted/30 p-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          {files.length} file{files.length !== 1 ? "s" : ""} changed
        </p>
        <div className="space-y-1">
          {files.map((f) => {
            const fileName = f.path.split("/").pop() || f.path;
            return (
              <div key={f.path} className="flex items-center gap-2 text-sm">
                <FileIcon name={fileName} type="file" />
                <code className="font-mono text-xs text-foreground truncate">{f.path}</code>
              </div>
            );
          })}
        </div>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={onSubmit} disabled={submitting || !title.trim()} className="gap-1.5">
          {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <GitBranch className="h-3.5 w-3.5" />}
          {isOwner ? "Submit Edit" : "Propose Edit"}
        </Button>
        {isOwner && onDirectCommit && (
          <Button size="sm" variant="outline" onClick={onDirectCommit} disabled={submitting || !title.trim()} className="gap-1.5">
            {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            Direct Commit
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={onBack} disabled={submitting} className="gap-1.5">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Button>
      </div>
    </div>
  );
}
