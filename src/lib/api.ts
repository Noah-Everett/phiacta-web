import type {
  EntryListItem,
  EntryDetailResponse,
  EntryResponse,
  EntryCreate,
  EntryUpdate,
  CursorPage,
  User,
  PublicUserResponse,
  AuthResponse,
  FileListItem,
  FileWriteResponse,
  ReferenceItem,
  EditProposalListItem,
  EditProposalDetail,
  CommitListItem,
  CommitDiffResponse,
  TagListResponse,
  EntryTagItem,
  IssueListItem,
  IssueDetail,
  IssueCommentResponse,
  ActivityFeedResponse,
  SearchResponse,
  TokenCreateResponse,
  TokenListItem,
  PluginInfo,
  DocListItem,
  DocDetail,
  JobListItem,
  JobListResponse,
} from "./types";

// Server-side (SSR) uses the Docker-internal URL; browser uses the public URL
export const API_URL =
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
  // Include auth token when available so the backend can apply
  // owner-specific visibility (e.g. showing private entries to their owner).
  // Unlike authFetch, this does NOT redirect on 401 — it silently
  // falls back to unauthenticated access.
  const token = getStoredToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (extraHeaders) Object.assign(headers, extraHeaders);
  const res = await fetch(`${API_URL}${path}`, {
    headers,
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

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// --- Auth API ---

export async function loginApi(username: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (res.status === 429) {
    throw new Error("Too many requests. Please wait a moment and try again.");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail || "Invalid username or password.");
  }
  return res.json() as Promise<AuthResponse>;
}

export async function registerApi(
  username: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
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
  cursor?: string | null,
  filters?: { visibility?: string; include?: string; sort?: string; order?: string }
): Promise<CursorPage<EntryListItem>> {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  if (cursor) params.set("cursor", cursor);
  if (filters?.visibility) params.set("visibility", filters.visibility);
  if (filters?.include) params.set("include", filters.include);
  if (filters?.sort) params.set("sort", filters.sort);
  if (filters?.order) params.set("order", filters.order);
  return request<CursorPage<EntryListItem>>(`/v1/entries?${params.toString()}`);
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
  const res = await request<CursorPage<FileListItem>>(`/v1/entries/${id}/files`);
  return res.items;
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
    `${API_URL}/v1/entries/${entryId}/files/${path.split("/").map(encodeURIComponent).join("/")}`,
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

/** Upload multiple files in a single atomic commit. */
export async function postEntryFiles(
  entryId: string,
  files: { path: string; data: Blob }[],
  message?: string,
): Promise<FileWriteResponse> {
  const form = new FormData();
  for (const { path, data } of files) {
    form.append("files", data);
    form.append("paths", path);
  }
  if (message) form.append("message", message);

  const res = await fetch(
    `${API_URL}/v1/entries/${entryId}/files`,
    {
      method: "POST",
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

// --- References ---

export async function createReference(
  entryId: string,
  targetEntryId: string,
  rel: string,
  note?: string,
): Promise<ReferenceItem> {
  return authFetch<ReferenceItem>(`/v1/extensions/references/${entryId}`, {
    method: "POST",
    body: JSON.stringify({ target_entry_id: targetEntryId, rel, note: note || null }),
  });
}

// --- Entry Edits ---

export async function getEntryEdits(
  id: string,
  state?: string
): Promise<EditProposalListItem[]> {
  const params = state ? `?state=${state}` : "";
  const res = await request<CursorPage<EditProposalListItem>>(`/v1/entries/${id}/edits${params}`);
  return res.items;
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
  const res = await request<CursorPage<CommitListItem>>(`/v1/entries/${id}/history`);
  return res.items;
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
  const res = await request<CursorPage<IssueListItem>>(`/v1/entries/${id}/issues${params}`);
  return res.items;
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
  cursor?: string | null,
  filters?: Record<string, string>
): Promise<SearchResponse> {
  const params = new URLSearchParams();
  params.set("q", q);
  params.set("limit", String(limit));
  if (cursor) params.set("cursor", cursor);
  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      if (value) params.set(key, value);
    }
  }
  return request<SearchResponse>(`/v1/tools/search/?${params.toString()}`);
}

// --- Graph Tool ---

export async function fetchGraph(params: {
  entry_ids: string[];
  mode?: string;
  depth?: number;
  direction?: string;
  rel?: string[];
  entry_type?: string[];
  limit?: number;
}): Promise<import("./types").GraphResponse> {
  const q = new URLSearchParams();
  q.set("entry_ids", params.entry_ids.join(","));
  if (params.mode) q.set("mode", params.mode);
  if (params.depth !== undefined) q.set("depth", String(params.depth));
  if (params.direction) q.set("direction", params.direction);
  if (params.rel?.length) q.set("rel", params.rel.join(","));
  if (params.entry_type?.length) q.set("entry_type", params.entry_type.join(","));
  if (params.limit !== undefined) q.set("limit", String(params.limit));
  return request<import("./types").GraphResponse>(`/v1/tools/graph/?${q.toString()}`);
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
  cursor?: string | null
): Promise<CursorPage<EntryTagItem>> {
  const params = new URLSearchParams();
  params.set("tags", tags.join(","));
  params.set("mode", mode);
  params.set("limit", String(limit));
  if (cursor) params.set("cursor", cursor);
  return request<CursorPage<EntryTagItem>>(`/v1/extensions/tags/entries?${params.toString()}`);
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
  const res = await authFetch<CursorPage<TokenListItem>>("/v1/auth/tokens");
  return res.items;
}

export async function revokeToken(tokenId: string): Promise<void> {
  await authFetch<void>(`/v1/auth/tokens/${tokenId}`, {
    method: "DELETE",
  });
}

// --- Entry File Deletion ---

export async function deleteEntryFile(
  entryId: string,
  path: string,
  message?: string,
): Promise<FileWriteResponse> {
  return authFetch<FileWriteResponse>(
    `/v1/entries/${entryId}/files/${encodeURIComponent(path)}`,
    {
      method: "DELETE",
      body: message ? JSON.stringify({ message }) : undefined,
    },
  );
}

// --- Reference Deletion ---

export async function deleteReference(referenceId: string): Promise<void> {
  await authFetch<void>(`/v1/extensions/references/${referenceId}`, {
    method: "DELETE",
  });
}

// --- Issue Creation & Comments ---

export async function createIssue(
  entryId: string,
  title: string,
  body?: string,
): Promise<IssueListItem> {
  return authFetch<IssueListItem>(`/v1/entries/${entryId}/issues`, {
    method: "POST",
    body: JSON.stringify({ title, body: body || null }),
  });
}

export async function addIssueComment(
  entryId: string,
  issueNumber: number,
  body: string,
): Promise<IssueCommentResponse> {
  return authFetch<IssueCommentResponse>(
    `/v1/entries/${entryId}/issues/${issueNumber}/comments`,
    { method: "POST", body: JSON.stringify({ body }) },
  );
}

// --- Edit Proposal Creation ---

export async function createEditProposal(
  entryId: string,
  title: string,
  body?: string,
  files?: { path: string; content: string }[],
): Promise<EditProposalListItem> {
  return authFetch<EditProposalListItem>(`/v1/entries/${entryId}/edits`, {
    method: "POST",
    body: JSON.stringify({ title, body: body || null, files: files || [] }),
  });
}

// --- Compiled Content ---

/** URL to fetch the compiled PDF for an entry via the compiled_content extension. */
export function getCompiledPdfUrl(entryId: string): string {
  return `${API_URL}/v1/extensions/compiled_content/${entryId}?format=pdf`;
}

// --- Jobs ---

export async function listJobs(params?: {
  status?: string;
  job_type?: string;
  entity_id?: string;
  limit?: number;
  cursor?: string | null;
}): Promise<JobListResponse> {
  const q = new URLSearchParams();
  if (params?.status) q.set("status", params.status);
  if (params?.job_type) q.set("job_type", params.job_type);
  if (params?.entity_id) q.set("entity_id", params.entity_id);
  if (params?.limit) q.set("limit", String(params.limit));
  if (params?.cursor) q.set("cursor", params.cursor);
  return authFetch<JobListResponse>(`/v1/jobs?${q.toString()}`);
}

// --- Plugins ---

export async function listPlugins(): Promise<PluginInfo[]> {
  const res = await request<CursorPage<PluginInfo>>("/v1/plugins");
  return res.items;
}

// --- Docs ---

export async function listDocs(): Promise<DocListItem[]> {
  const res = await request<CursorPage<DocListItem>>("/v1/docs");
  return res.items;
}

export async function getDoc(slug: string): Promise<DocDetail> {
  return request<DocDetail>(`/v1/docs/${slug}`);
}
