import type {
  EntryListItem,
  EntryDetailResponse,
  EntryResponse,
  EntryCreate,
  EntryRefResponse,
  PaginatedResponse,
  Agent,
  PublicAgentResponse,
  AuthResponse,
  FileListItem,
  EditProposalListItem,
  EditProposalDetail,
  CommitListItem,
  CommitDiffResponse,
  TagListResponse,
  EntryTagItem,
} from "./types";

// Server-side (SSR) uses the Docker-internal URL; browser uses the public URL
const API_URL =
  typeof window === "undefined"
    ? process.env.API_URL_INTERNAL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:8000"
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    cache: "no-store",
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const detail = body?.detail;
    throw new Error(detail || `API error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

// --- Auth utilities ---

const TOKEN_KEY = "phiacta_token";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

function getAuthHeaders(): Record<string, string> {
  const token = getStoredToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

// 401 logout coordinator — prevents multiple concurrent 401 handlers
let isLoggingOut = false;

export async function authFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...options?.headers,
    },
    cache: "no-store",
    ...options,
  });

  if (res.status === 401) {
    if (!isLoggingOut) {
      isLoggingOut = true;
      clearStoredToken();
      queueMicrotask(() => { isLoggingOut = false; });
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    }
    throw new Error("Session expired. Please log in again.");
  }

  if (res.status === 429) {
    throw new Error("Too many requests. Please wait a moment and try again.");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const detail = body?.detail;
    throw new Error(detail || `API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

// --- Auth API ---

export async function loginApi(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (res.status === 429) {
    throw new Error("Too many requests. Please wait a moment and try again.");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail || "Invalid email or password.");
  }
  return res.json() as Promise<AuthResponse>;
}

export async function registerApi(
  handle: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ handle, email, password }),
  });
  if (res.status === 429) {
    throw new Error("Too many requests. Please wait a moment and try again.");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail || "Registration failed. Please try again.");
  }
  return res.json() as Promise<AuthResponse>;
}

export async function getMeApi(): Promise<Agent> {
  const token = getStoredToken();
  if (!token) throw new Error("No token");
  const res = await fetch(`${API_URL}/v1/auth/me`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Token validation failed");
  return res.json() as Promise<Agent>;
}

// --- Entries ---

export async function listEntries(
  limit: number = 20,
  offset: number = 0,
  filters?: { layout_hint?: string; status?: string }
): Promise<PaginatedResponse<EntryListItem>> {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  params.set("offset", String(offset));
  if (filters?.layout_hint) params.set("layout_hint", filters.layout_hint);
  if (filters?.status) params.set("status", filters.status);
  return request<PaginatedResponse<EntryListItem>>(`/v1/entries?${params.toString()}`);
}

export async function getEntry(id: string): Promise<EntryDetailResponse> {
  return request<EntryDetailResponse>(`/v1/entries/${id}`);
}

export async function createEntry(data: EntryCreate): Promise<EntryResponse> {
  return authFetch<EntryResponse>("/v1/entries", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// --- Entry References ---

export async function getEntryReferences(
  id: string,
  direction: "both" | "incoming" | "outgoing" = "both"
): Promise<EntryRefResponse[]> {
  return request<EntryRefResponse[]>(`/v1/entries/${id}/references?direction=${direction}`);
}

// --- Entry Files ---

export async function getEntryFiles(id: string): Promise<FileListItem[]> {
  return request<FileListItem[]>(`/v1/entries/${id}/files`);
}

// --- Entry Edits ---

export async function getEntryEdits(
  id: string,
  state?: string
): Promise<EditProposalListItem[]> {
  const params = state ? `?state=${state}` : "";
  return request<EditProposalListItem[]>(`/v1/entries/${id}/edits${params}`);
}

export async function getEntryEditDetail(
  id: string,
  number: number
): Promise<EditProposalDetail> {
  return request<EditProposalDetail>(`/v1/entries/${id}/edits/${number}`);
}

// --- Entry History ---

export async function getEntryHistory(id: string): Promise<CommitListItem[]> {
  return request<CommitListItem[]>(`/v1/entries/${id}/history`);
}

export async function getEntryCommitDiff(
  id: string,
  sha: string
): Promise<CommitDiffResponse> {
  return request<CommitDiffResponse>(`/v1/entries/${id}/history/${sha}`);
}

// --- Agents ---

export async function getAgent(id: string): Promise<PublicAgentResponse> {
  return request<PublicAgentResponse>(`/v1/agents/${id}`);
}

// --- Tags Extension ---

export async function getEntryTags(entryId: string): Promise<TagListResponse> {
  return request<TagListResponse>(`/v1/extensions/tags/?entry_id=${entryId}`);
}

export async function setEntryTags(
  entryId: string,
  tags: string[]
): Promise<TagListResponse> {
  return authFetch<TagListResponse>(`/v1/extensions/tags/${entryId}`, {
    method: "PUT",
    body: JSON.stringify({ tags }),
  });
}

export async function findEntriesByTags(
  tags: string[],
  mode: "and" | "or" = "or",
  limit: number = 50,
  offset: number = 0
): Promise<PaginatedResponse<EntryTagItem>> {
  const params = new URLSearchParams();
  params.set("tags", tags.join(","));
  params.set("mode", mode);
  params.set("limit", String(limit));
  params.set("offset", String(offset));
  return request<PaginatedResponse<EntryTagItem>>(`/v1/extensions/tags/entries?${params.toString()}`);
}
