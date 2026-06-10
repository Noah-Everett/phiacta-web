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
  API_URL,
  getStoredToken,
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
  // Primary rendered content (`.phiacta/content.<ext>`). Seeded from the
  // server for public entries so it is present in the initial SSR HTML;
  // re-fetched on the client (with the viewer's token) whenever the entry
  // changes, which also covers authorized-private content.
  contentText: string | null;
  contentFormat: string;
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
  initialEntry = null,
  initialContent = null,
  initialContentFormat = "md",
  children,
}: {
  entryId: string;
  // Server-fetched seed for public entries (null for private/unknown, where
  // the client fetches with the viewer's token after hydration).
  initialEntry?: EntryDetailResponse | null;
  initialContent?: string | null;
  initialContentFormat?: string;
  children: ReactNode;
}) {
  const { user } = useAuth();
  const [entry, setEntry] = useState<EntryDetailResponse | null>(initialEntry);
  const [author, setAuthor] = useState<PublicUserResponse | null>(null);
  // Seeded entries are already loaded — start non-loading so the server
  // renders the real UI instead of a skeleton.
  const [loading, setLoading] = useState(initialEntry == null);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [issues, setIssues] = useState<IssueListItem[]>([]);
  const [edits, setEdits] = useState<EditProposalListItem[]>([]);
  const [compiledInfo, setCompiledInfo] = useState<CompiledContentInfo | null>(
    initialEntry?.compiled_content ?? null,
  );
  const [contentText, setContentText] = useState<string | null>(initialContent);
  const [contentFormat, setContentFormat] = useState<string>(initialContentFormat);

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

  // Probe the entry's primary content file. Server-seeded for public
  // entries (so it's in the SSR HTML); this re-runs on the client whenever
  // the entry changes, sending the viewer's token so an owner sees their
  // private content too. Only overwrites on success, so a failed refresh
  // never blanks a good seed.
  const fetchContent = useCallback(async (id: string) => {
    const token = getStoredToken();
    const headers: Record<string, string> = token
      ? { Authorization: `Bearer ${token}` }
      : {};
    for (const ext of [".md", ".tex", ".txt"]) {
      try {
        const res = await fetch(
          `${API_URL}/v1/entries/${id}/files/.phiacta/content${ext}`,
          { cache: "no-store", headers },
        );
        if (res.ok) {
          const text = await res.text();
          if (text) {
            setContentText(text);
            setContentFormat(ext.slice(1));
          }
          return;
        }
      } catch {
        // try next extension
      }
    }
  }, []);

  useEffect(() => {
    setError(null);
    setNotFound(false);

    // Refresh in the background. `loading` is already seeded from
    // initialEntry, so we don't flip it back to true here — that would
    // flash a skeleton over an entry we can already render.
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
        // Don't tear down a successfully-seeded page over a transient
        // background-refresh failure — only surface errors when we have
        // nothing to show.
        if (initialEntry) {
          console.warn("Failed to refresh entry:", err);
          return;
        }
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
    // initialEntry is stable per mount (the provider is keyed by entryId).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryId, refetchIssues, refetchEdits]);

  // Fetch content whenever the entry becomes available or changes identity
  // (e.g. after an edit merge or metadata save refetches it).
  useEffect(() => {
    if (!entry) return;
    fetchContent(entryId);
  }, [entry, entryId, fetchContent]);

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
        contentText,
        contentFormat,
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
