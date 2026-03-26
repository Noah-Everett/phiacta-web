import type {
  EntryListItem,
  EntryDetailResponse,
  EntryResponse,
  EntryCreate,
  EntryUpdate,
  PaginatedResponse,
  User,
  PublicUserResponse,
  AuthResponse,
  FileListItem,
  FileWriteResponse,
  EditProposalListItem,
  EditProposalDetail,
  CommitListItem,
  CommitDiffResponse,
  TagListResponse,
  EntryTagItem,
  IssueListItem,
  IssueDetail,
  ActivityFeedResponse,
  SearchResponse,
  TokenCreateResponse,
  TokenListItem,
} from "./types";

// Server-side (SSR) uses the Docker-internal URL; browser uses the public URL
const API_URL =
  typeof window === "undefined"
    ? process.env.API_URL_INTERNAL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:8000"
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const { headers: extraHeaders, ...restOptions } = options ?? {};
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders,
    },
    cache: "no-store",
    ...restOptions,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const detail = body?.detail;
    throw new ApiError(res.status, detail || `API error: ${res.status} ${res.statusText}`);
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
  const { headers: extraHeaders, ...restOptions } = options ?? {};
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...extraHeaders,
    },
    cache: "no-store",
    ...restOptions,
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
    throw new ApiError(res.status, detail || `API error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

// --- Auth API ---

export async function loginApi(handle: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ handle, password }),
  });
  if (res.status === 429) {
    throw new Error("Too many requests. Please wait a moment and try again.");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail || "Invalid handle or password.");
  }
  return res.json() as Promise<AuthResponse>;
}

export async function registerApi(
  handle: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ handle, password }),
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

export async function getMeApi(): Promise<User> {
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
  return res.json() as Promise<User>;
}

// --- Entries ---

export async function listEntries(
  limit: number = 20,
  offset: number = 0,
  filters?: { status?: string; include?: string; exclude?: string }
): Promise<PaginatedResponse<EntryListItem>> {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  params.set("offset", String(offset));
  if (filters?.status) params.set("status", filters.status);
  if (filters?.include) params.set("include", filters.include);
  if (filters?.exclude) params.set("exclude", filters.exclude);
  return request<PaginatedResponse<EntryListItem>>(`/v1/entries?${params.toString()}`);
}

export async function getEntry(
  id: string,
  options?: { include?: string; exclude?: string }
): Promise<EntryDetailResponse> {
  const params = new URLSearchParams();
  if (options?.include) params.set("include", options.include);
  if (options?.exclude) params.set("exclude", options.exclude);
  const qs = params.toString();
  return request<EntryDetailResponse>(`/v1/entries/${id}${qs ? `?${qs}` : ""}`);
}

export async function createEntry(data: EntryCreate): Promise<EntryResponse> {
  return authFetch<EntryResponse>("/v1/entries", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateEntry(
  id: string,
  data: EntryUpdate
): Promise<EntryResponse> {
  return authFetch<EntryResponse>(`/v1/entries/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function resolveEntity(id: string): Promise<Record<string, unknown>> {
  return request<Record<string, unknown>>(`/v1/entities/${id}`);
}

// --- Entry Files ---

export async function getEntryFiles(id: string): Promise<FileListItem[]> {
  return request<FileListItem[]>(`/v1/entries/${id}/files`);
}

export async function putEntryFile(
  entryId: string,
  path: string,
  file: File,
  message?: string,
): Promise<FileWriteResponse> {
  const form = new FormData();
  form.append("content", file);
  if (message) form.append("message", message);

  const res = await fetch(
    `${API_URL}/v1/entries/${entryId}/files/${encodeURIComponent(path)}`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: form,
    },
  );

  if (res.status === 401) {
    clearStoredToken();
    if (typeof window !== "undefined") window.location.href = "/auth/login";
    throw new Error("Session expired. Please log in again.");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, body?.detail || `Upload failed: ${res.status}`);
  }
  return res.json() as Promise<FileWriteResponse>;
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

export async function mergeEditProposal(
  id: string,
  number: number
): Promise<{ sha: string }> {
  return authFetch<{ sha: string }>(`/v1/entries/${id}/edits/${number}/merge`, {
    method: "POST",
  });
}

export async function closeEditProposal(
  id: string,
  number: number
): Promise<{ detail: string }> {
  return authFetch<{ detail: string }>(`/v1/entries/${id}/edits/${number}/close`, {
    method: "POST",
  });
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

// --- Users ---

export async function getUser(id: string): Promise<PublicUserResponse> {
  return request<PublicUserResponse>(`/v1/users/${id}`);
}

// --- Activity ---

export async function getActivity(
  params: { actor?: string; entity?: string; limit?: number; before?: string }
): Promise<ActivityFeedResponse> {
  const q = new URLSearchParams();
  if (params.actor) q.set("actor", params.actor);
  if (params.entity) q.set("entity", params.entity);
  if (params.limit) q.set("limit", String(params.limit));
  if (params.before) q.set("before", params.before);
  return request<ActivityFeedResponse>(`/v1/activity?${q.toString()}`);
}

// --- Entry Issues ---

export async function getEntryIssues(
  id: string,
  state?: string
): Promise<IssueListItem[]> {
  const params = state ? `?state=${state}` : "";
  return request<IssueListItem[]>(`/v1/entries/${id}/issues${params}`);
}

export async function getEntryIssueDetail(
  id: string,
  number: number
): Promise<IssueDetail> {
  return request<IssueDetail>(`/v1/entries/${id}/issues/${number}`);
}

export async function closeIssue(
  id: string,
  number: number
): Promise<{ detail: string }> {
  return authFetch<{ detail: string }>(`/v1/entries/${id}/issues/${number}/close`, {
    method: "POST",
  });
}

// --- Search Tool ---

export async function searchEntries(
  q: string,
  limit: number = 20,
  offset: number = 0
): Promise<SearchResponse> {
  const params = new URLSearchParams();
  params.set("q", q);
  params.set("limit", String(limit));
  params.set("offset", String(offset));
  return request<SearchResponse>(`/v1/tools/search/?${params.toString()}`);
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

// --- Personal Access Tokens ---

export async function createToken(
  name: string,
  expiresInDays?: number
): Promise<TokenCreateResponse> {
  const body: Record<string, unknown> = { name };
  if (expiresInDays !== undefined) body.expires_in_days = expiresInDays;
  return authFetch<TokenCreateResponse>("/v1/auth/tokens", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function listTokens(): Promise<TokenListItem[]> {
  return authFetch<TokenListItem[]>("/v1/auth/tokens");
}

export async function revokeToken(tokenId: string): Promise<void> {
  await authFetch<void>(`/v1/auth/tokens/${tokenId}`, {
    method: "DELETE",
  });
}
