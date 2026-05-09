"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import MarkdownContent from "@/components/MarkdownContent";
import LatexContent from "@/components/LatexContent";
import ContentDiff from "@/components/ContentDiff";
import { Code, Eye, Check, ArrowLeft, RotateCcw } from "lucide-react";

const ContentEditor = dynamic(() => import("@/components/ContentEditor"), { ssr: false });

interface ProposalFileEditorProps {
  filePath: string;
  entryId: string;
  originalContent: string;
  value: string;
  onChange: (text: string) => void;
  onStage: () => void;
  onBack: () => void;
  hasChanges: boolean;
}

function getFormat(path: string): string {
  const dot = path.lastIndexOf(".");
  if (dot === -1) return "txt";
  return path.substring(dot + 1).toLowerCase();
}

export default function ProposalFileEditor({
  filePath,
  entryId,
  originalContent,
  value,
  onChange,
  onStage,
  onBack,
  hasChanges,
}: ProposalFileEditorProps) {
  const [viewMode, setViewMode] = useState<"edit" | "preview" | "changes">("edit");
  const format = getFormat(filePath);
  const isMarkdown = format === "md";
  const isLatex = format === "tex";

  const segments = filePath.split("/");

  return (
    <div className="space-y-3">
      {/* File path */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        {segments.map((seg, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-muted-foreground/50">/</span>}
            <span className={i === segments.length - 1 ? "text-foreground font-medium" : ""}>{seg}</span>
          </span>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-lg bg-muted p-[3px]">
          <button
            onClick={() => setViewMode("edit")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              viewMode === "edit"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Code className="h-3 w-3" />
            Edit
          </button>
          {(isMarkdown || isLatex) && (
            <button
              onClick={() => setViewMode("preview")}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                viewMode === "preview"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Eye className="h-3 w-3" />
              Preview
            </button>
          )}
          <button
            onClick={() => setViewMode("changes")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              viewMode === "changes"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Changes
          </button>
        </div>
      </div>

      {/* Editor */}
      {viewMode === "edit" && (
        <ContentEditor value={value} onChange={onChange} format={format} />
      )}

      {/* Preview */}
      {viewMode === "preview" && (
        <div className="rounded-xl border border-border bg-card p-6">
          {isLatex ? (
            <LatexContent content={value} className="text-sm leading-relaxed text-card-foreground" entryId={entryId} />
          ) : isMarkdown ? (
            <MarkdownContent content={value} className="text-sm leading-relaxed text-card-foreground" entryId={entryId} />
          ) : (
            <pre className="text-xs font-mono leading-5 whitespace-pre-wrap text-foreground">{value}</pre>
          )}
        </div>
      )}

      {/* Changes */}
      {viewMode === "changes" && (
        <ContentDiff original={originalContent} modified={value} path={filePath} />
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={onStage} disabled={!hasChanges} className="gap-1.5">
          <Check className="h-3.5 w-3.5" />
          Stage Change
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onChange(originalContent)}
          disabled={!hasChanges}
          className="gap-1.5"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Discard
        </Button>
        <Button size="sm" variant="ghost" onClick={onBack} className="gap-1.5">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Files
        </Button>
      </div>
    </div>
  );
}
