"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  getEntry,
  getUser,
  getEntryEdits,
  getEntryIssues,
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
      }}
    >
      {children}
    </EntryContext.Provider>
  );
}
