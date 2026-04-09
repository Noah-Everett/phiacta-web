"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type Dispatch,
  type SetStateAction,
  type ReactNode,
} from "react";
import {
  getEntry,
  getUser,
  getEntryEdits,
  getEntryIssues,
  updateEntry,
  setEntryTags,
  ApiError,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type {
  EntryDetailResponse,
  PublicUserResponse,
  EditProposalListItem,
  IssueListItem,
  CompiledContentInfo,
} from "@/lib/types";

interface EntryContextValue {
  // Entry data
  entry: EntryDetailResponse | null;
  author: PublicUserResponse | null;
  isOwner: boolean;
  isAuthenticated: boolean;
  resolvedId: string;
  loading: boolean;
  error: string | null;
  notFound: boolean;
  issues: IssueListItem[];
  edits: EditProposalListItem[];
  compiledInfo: CompiledContentInfo | null;
  setCompiledInfo: (info: CompiledContentInfo | null) => void;
  refetchEntry: () => Promise<EntryDetailResponse | undefined>;
  refetchIssues: () => void;
  refetchEdits: () => void;

  // Edit mode
  editing: boolean;
  saving: boolean;
  saveError: string | null;
  enterEditMode: () => void;
  exitEditMode: () => void;
  handleSaveAll: () => Promise<void>;

  // Edit form state
  metaTitle: string;
  setMetaTitle: Dispatch<SetStateAction<string>>;
  metaSummary: string;
  setMetaSummary: Dispatch<SetStateAction<string>>;
  metaType: string;
  setMetaType: Dispatch<SetStateAction<string>>;
  metaVisibility: "public" | "private";
  setMetaVisibility: Dispatch<SetStateAction<"public" | "private">>;
  editTags: string[];
  newTagInput: string;
  setNewTagInput: Dispatch<SetStateAction<string>>;
  addTag: () => void;
  removeTag: (tag: string) => void;
}

const EntryContext = createContext<EntryContextValue | null>(null);

export function useEntryContext() {
  const ctx = useContext(EntryContext);
  if (!ctx)
    throw new Error("useEntryContext must be used within EntryProvider");
  return ctx;
}

export function EntryProvider({
  entryId,
  children,
}: {
  entryId: string;
  children: ReactNode;
}) {
  const { user } = useAuth();
  const [entry, setEntry] = useState<EntryDetailResponse | null>(null);
  const [author, setAuthor] = useState<PublicUserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [issues, setIssues] = useState<IssueListItem[]>([]);
  const [edits, setEdits] = useState<EditProposalListItem[]>([]);
  const [compiledInfo, setCompiledInfo] =
    useState<CompiledContentInfo | null>(null);

  // Edit mode
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Edit form state
  const [metaTitle, setMetaTitle] = useState("");
  const [metaSummary, setMetaSummary] = useState("");
  const [metaType, setMetaType] = useState("");
  const [metaVisibility, setMetaVisibility] = useState<"public" | "private">("public");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState("");

  const isOwner =
    user?.id != null &&
    entry?.created_by != null &&
    user.id === entry.created_by;
  const isAuthenticated = user != null;

  const refetchEntry = useCallback(async () => {
    try {
      const data = await getEntry(entryId);
      setEntry(data);
      setCompiledInfo(data.compiled_content ?? null);
      return data;
    } catch (err) {
      console.warn("Failed to refetch entry:", err);
      return undefined;
    }
  }, [entryId]);

  const refetchIssues = useCallback(() => {
    getEntryIssues(entryId)
      .then(setIssues)
      .catch((err: unknown) =>
        console.warn("Failed to load issues:", err),
      );
  }, [entryId]);

  const refetchEdits = useCallback(() => {
    getEntryEdits(entryId)
      .then(setEdits)
      .catch((err: unknown) =>
        console.warn("Failed to load edits:", err),
      );
  }, [entryId]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setNotFound(false);

    getEntry(entryId)
      .then((data) => {
        setEntry(data);
        setCompiledInfo(data.compiled_content ?? null);
        getUser(data.created_by)
          .then(setAuthor)
          .catch((err: unknown) =>
            console.warn("Failed to load author:", err),
          );
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) {
          setNotFound(true);
        }
        setError(
          err instanceof Error ? err.message : "Failed to load entry",
        );
      })
      .finally(() => setLoading(false));

    refetchIssues();
    refetchEdits();
  }, [entryId, refetchIssues, refetchEdits]);

  const enterEditMode = useCallback(() => {
    if (!entry) return;
    setMetaTitle(entry.title || "");
    setMetaSummary(entry.summary || "");
    setMetaType(entry.entry_type || "");
    setMetaVisibility(entry.visibility === "private" ? "private" : "public");
    setEditTags(entry.tags ? [...entry.tags] : []);
    setNewTagInput("");
    setSaveError(null);
    setEditing(true);
  }, [entry]);

  const exitEditMode = useCallback(() => {
    setEditing(false);
    setSaveError(null);
  }, []);

  const handleSaveAll = useCallback(async () => {
    if (!entry) return;
    setSaving(true);
    setSaveError(null);

    const metadataChanged =
      metaTitle !== (entry.title || "") ||
      metaSummary !== (entry.summary || "") ||
      metaType !== (entry.entry_type || "") ||
      metaVisibility !== entry.visibility;
    const tagsChanged =
      JSON.stringify([...editTags].sort()) !==
      JSON.stringify([...(entry.tags || [])].sort());

    const errors: string[] = [];
    const promises: Promise<void>[] = [];

    if (metadataChanged) {
      promises.push(
        updateEntry(entryId, {
          title: metaTitle,
          summary: metaSummary || null,
          entry_type: metaType || null,
          visibility: metaVisibility,
        })
          .then(() => {})
          .catch((err) => {
            errors.push(
              `Metadata: ${err instanceof Error ? err.message : "failed"}`,
            );
          }),
      );
    }

    if (tagsChanged) {
      promises.push(
        setEntryTags(entryId, editTags)
          .then(() => {})
          .catch((err) => {
            errors.push(
              `Tags: ${err instanceof Error ? err.message : "failed"}`,
            );
          }),
      );
    }

    await Promise.all(promises);

    if (errors.length > 0) {
      setSaveError(errors.join("; "));
      setSaving(false);
      return;
    }

    await refetchEntry();
    setEditing(false);
    setSaving(false);
  }, [entry, entryId, metaTitle, metaSummary, metaType, metaVisibility, editTags, refetchEntry]);

  const addTag = useCallback(() => {
    const tag = newTagInput.trim().toLowerCase();
    if (tag && !editTags.includes(tag)) {
      setEditTags((prev) => [...prev, tag]);
    }
    setNewTagInput("");
  }, [newTagInput, editTags]);

  const removeTag = useCallback((tag: string) => {
    setEditTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  return (
    <EntryContext.Provider
      value={{
        entry,
        author,
        isOwner,
        isAuthenticated,
        resolvedId: entryId,
        loading,
        error,
        notFound,
        issues,
        edits,
        compiledInfo,
        setCompiledInfo,
        refetchEntry,
        refetchIssues,
        refetchEdits,
        editing,
        saving,
        saveError,
        enterEditMode,
        exitEditMode,
        handleSaveAll,
        metaTitle,
        setMetaTitle,
        metaSummary,
        setMetaSummary,
        metaType,
        setMetaType,
        metaVisibility,
        setMetaVisibility,
        editTags,
        newTagInput,
        setNewTagInput,
        addTag,
        removeTag,
      }}
    >
      {children}
    </EntryContext.Provider>
  );
}
