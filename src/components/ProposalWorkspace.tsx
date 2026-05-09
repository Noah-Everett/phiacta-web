"use client";

import { useReducer, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, X } from "lucide-react";
import ProposalFileBrowser from "@/components/ProposalFileBrowser";
import ProposalFileEditor from "@/components/ProposalFileEditor";
import ProposalStagedChanges from "@/components/ProposalStagedChanges";
import ProposalSubmitForm from "@/components/ProposalSubmitForm";
import { createEditProposal, postEntryFiles, API_URL, getStoredToken } from "@/lib/api";
import type { FileListItem } from "@/lib/types";

// --- State types ---

interface StagedFile {
  path: string;
  originalContent: string;
  modifiedContent: string;
}

interface WorkspaceState {
  phase: "browsing" | "editing" | "loading" | "reviewing" | "submitting";
  stagedFiles: Map<string, StagedFile>;
  currentFilePath: string | null;
  currentFileOriginal: string | null;
  editorText: string;
  proposalTitle: string;
  proposalBody: string;
  error: string | null;
  submitting: boolean;
}

type WorkspaceAction =
  | { type: "START_LOADING"; path: string }
  | { type: "OPEN_FILE"; path: string; content: string }
  | { type: "UPDATE_EDITOR"; text: string }
  | { type: "STAGE_CURRENT" }
  | { type: "UNSTAGE_FILE"; path: string }
  | { type: "SET_PHASE"; phase: WorkspaceState["phase"] }
  | { type: "SET_TITLE"; title: string }
  | { type: "SET_BODY"; body: string }
  | { type: "SET_SUBMITTING"; submitting: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "RESET" };

function workspaceReducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
  switch (action.type) {
    case "START_LOADING":
      return { ...state, phase: "loading", currentFilePath: action.path, error: null };

    case "OPEN_FILE": {
      // If there's a current file with changes, auto-stage it
      const newStaged = new Map(state.stagedFiles);
      if (
        state.currentFilePath &&
        state.currentFileOriginal !== null &&
        state.editorText !== state.currentFileOriginal
      ) {
        newStaged.set(state.currentFilePath, {
          path: state.currentFilePath,
          originalContent: state.currentFileOriginal,
          modifiedContent: state.editorText,
        });
      }

      // Check if we have a staged version of this file
      const staged = newStaged.get(action.path);
      return {
        ...state,
        phase: "editing",
        stagedFiles: newStaged,
        currentFilePath: action.path,
        currentFileOriginal: staged?.originalContent ?? action.content,
        editorText: staged?.modifiedContent ?? action.content,
        error: null,
      };
    }

    case "UPDATE_EDITOR":
      return { ...state, editorText: action.text };

    case "STAGE_CURRENT": {
      if (!state.currentFilePath || state.currentFileOriginal === null) return state;
      const newStaged = new Map(state.stagedFiles);
      if (state.editorText !== state.currentFileOriginal) {
        newStaged.set(state.currentFilePath, {
          path: state.currentFilePath,
          originalContent: state.currentFileOriginal,
          modifiedContent: state.editorText,
        });
      } else {
        // No changes — unstage if previously staged
        newStaged.delete(state.currentFilePath);
      }
      return {
        ...state,
        stagedFiles: newStaged,
        phase: "browsing",
        currentFilePath: null,
        currentFileOriginal: null,
        editorText: "",
      };
    }

    case "UNSTAGE_FILE": {
      const newStaged = new Map(state.stagedFiles);
      newStaged.delete(action.path);
      return { ...state, stagedFiles: newStaged };
    }

    case "SET_PHASE":
      return { ...state, phase: action.phase, error: null };

    case "SET_TITLE":
      return { ...state, proposalTitle: action.title };

    case "SET_BODY":
      return { ...state, proposalBody: action.body };

    case "SET_SUBMITTING":
      return { ...state, submitting: action.submitting };

    case "SET_ERROR":
      return { ...state, error: action.error };

    case "RESET":
      return initialState();

    default:
      return state;
  }
}

function initialState(): WorkspaceState {
  return {
    phase: "browsing",
    stagedFiles: new Map(),
    currentFilePath: null,
    currentFileOriginal: null,
    editorText: "",
    proposalTitle: "",
    proposalBody: "",
    error: null,
    submitting: false,
  };
}

// --- Component ---

interface ProposalWorkspaceProps {
  entryId: string;
  isOwner: boolean;
  entryFiles: FileListItem[];
  onComplete: () => void;
  onCancel: () => void;
}

export default function ProposalWorkspace({
  entryId,
  isOwner,
  entryFiles,
  onComplete,
  onCancel,
}: ProposalWorkspaceProps) {
  const [state, dispatch] = useReducer(workspaceReducer, undefined, initialState);

  const fetchAndOpenFile = useCallback(async (path: string) => {
    dispatch({ type: "START_LOADING", path });
    try {
      const encodedPath = path.split("/").map(encodeURIComponent).join("/");
      const token = getStoredToken();
      const res = await fetch(`${API_URL}/v1/entries/${entryId}/files/${encodedPath}`, {
        cache: "no-store",
        ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
      });
      if (!res.ok) throw new Error("Failed to load file");
      const text = await res.text();
      dispatch({ type: "OPEN_FILE", path, content: text });
    } catch (err) {
      dispatch({ type: "SET_ERROR", error: err instanceof Error ? err.message : "Failed to load file" });
      dispatch({ type: "SET_PHASE", phase: "browsing" });
    }
  }, [entryId]);

  const handleSelectFile = useCallback((path: string) => {
    // If we already have it staged, skip the fetch — OPEN_FILE will use the staged version
    if (state.stagedFiles.has(path)) {
      dispatch({ type: "OPEN_FILE", path, content: "" }); // content ignored when staged
    } else {
      fetchAndOpenFile(path);
    }
  }, [state.stagedFiles, fetchAndOpenFile]);

  const handleSubmitProposal = useCallback(async () => {
    if (!state.proposalTitle.trim() || state.stagedFiles.size === 0) return;
    dispatch({ type: "SET_SUBMITTING", submitting: true });
    dispatch({ type: "SET_ERROR", error: null });
    try {
      const files = Array.from(state.stagedFiles.values()).map((f) => ({
        path: f.path,
        content: f.modifiedContent,
      }));
      await createEditProposal(
        entryId,
        state.proposalTitle.trim(),
        state.proposalBody.trim() || undefined,
        files
      );
      onComplete();
    } catch (err) {
      dispatch({ type: "SET_ERROR", error: err instanceof Error ? err.message : "Failed to create proposal" });
    } finally {
      dispatch({ type: "SET_SUBMITTING", submitting: false });
    }
  }, [entryId, state.proposalTitle, state.proposalBody, state.stagedFiles, onComplete]);

  const handleDirectCommit = useCallback(async () => {
    if (state.stagedFiles.size === 0 || !state.proposalTitle.trim()) return;
    dispatch({ type: "SET_SUBMITTING", submitting: true });
    dispatch({ type: "SET_ERROR", error: null });
    try {
      // One atomic commit via the bulk endpoint. Previously we issued one
      // PUT per staged file, which produced N separate commits and left
      // the workspace in an indeterminate state on partial failure.
      const files = Array.from(state.stagedFiles.values()).map((staged) => ({
        path: staged.path,
        data: new Blob([staged.modifiedContent], { type: "text/plain" }),
      }));
      await postEntryFiles(
        entryId,
        files,
        state.proposalTitle.trim() || "Update files",
      );
      onComplete();
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        error: err instanceof Error ? err.message : "Failed to commit changes",
      });
      dispatch({ type: "SET_SUBMITTING", submitting: false });
    }
  }, [entryId, state.stagedFiles, state.proposalTitle, onComplete]);

  const stagedCount = state.stagedFiles.size;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-foreground">New Proposal</h3>
          {stagedCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {stagedCount} file{stagedCount !== 1 ? "s" : ""} staged
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {state.phase === "browsing" && stagedCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => dispatch({ type: "SET_PHASE", phase: "reviewing" })}
            >
              Review Changes
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={onCancel} disabled={state.submitting} className="gap-1.5">
            <X className="h-3.5 w-3.5" />
            Cancel
          </Button>
        </div>
      </div>

      {state.error && <p className="text-xs text-destructive">{state.error}</p>}

      {/* Loading */}
      {state.phase === "loading" && (
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading {state.currentFilePath}...
        </div>
      )}

      {/* Browsing */}
      {state.phase === "browsing" && (
        <ProposalFileBrowser
          entryId={entryId}
          files={entryFiles}
          stagedFiles={state.stagedFiles}
          onSelectFile={handleSelectFile}
        />
      )}

      {/* Editing */}
      {state.phase === "editing" && state.currentFilePath && state.currentFileOriginal !== null && (
        <ProposalFileEditor
          filePath={state.currentFilePath}
          entryId={entryId}
          originalContent={state.currentFileOriginal}
          value={state.editorText}
          onChange={(text) => dispatch({ type: "UPDATE_EDITOR", text })}
          onStage={() => dispatch({ type: "STAGE_CURRENT" })}
          onBack={() => {
            // Auto-stage if changed, then go back to browsing
            dispatch({ type: "STAGE_CURRENT" });
          }}
          hasChanges={state.editorText !== state.currentFileOriginal}
        />
      )}

      {/* Reviewing */}
      {state.phase === "reviewing" && (
        <ProposalStagedChanges
          stagedFiles={state.stagedFiles}
          onUnstage={(path) => dispatch({ type: "UNSTAGE_FILE", path })}
          onEditFile={(path) => handleSelectFile(path)}
          onSubmit={() => dispatch({ type: "SET_PHASE", phase: "submitting" })}
          onBack={() => dispatch({ type: "SET_PHASE", phase: "browsing" })}
        />
      )}

      {/* Submitting */}
      {state.phase === "submitting" && (
        <ProposalSubmitForm
          stagedFiles={state.stagedFiles}
          title={state.proposalTitle}
          body={state.proposalBody}
          onTitleChange={(title) => dispatch({ type: "SET_TITLE", title })}
          onBodyChange={(body) => dispatch({ type: "SET_BODY", body })}
          onSubmit={handleSubmitProposal}
          onBack={() => dispatch({ type: "SET_PHASE", phase: "reviewing" })}
          submitting={state.submitting}
          error={state.error}
          isOwner={isOwner}
          onDirectCommit={isOwner ? handleDirectCommit : undefined}
        />
      )}
    </div>
  );
}
