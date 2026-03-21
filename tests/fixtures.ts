// phiacta-web-repo/tests/fixtures.ts
//
// Shared test data factories that produce backend-shaped data.
// All shapes match the backend Pydantic schemas exactly.

/** Produces a realistic AgentResponse matching the backend schema */
export function makeAgent(overrides: Partial<AgentResponse> = {}): AgentResponse {
  return {
    id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    handle: "drchen",
    agent_type: "human",
    is_active: true,
    created_at: "2026-01-15T10:30:00Z",
    ...overrides,
  };
}

/** Produces a realistic EntryListItem matching the backend schema */
export function makeEntryListItem(
  overrides: Partial<EntryListItem> = {},
): EntryListItem {
  return {
    id: "11111111-2222-3333-4444-555555555555",
    title: "On the Riemann Hypothesis",
    layout_hint: "research-paper",
    summary: "A detailed exploration of the Riemann Hypothesis and its implications.",
    license: "CC-BY-4.0",
    content_format: "markdown",
    schema_version: 1,
    forgejo_repo_id: 42,
    repo_name: "11111111-2222-3333-4444-555555555555",
    current_head_sha: "abc123def456789012345678901234567890abcd",
    repo_status: "ready",
    status: "active",
    created_by: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    created_at: "2026-01-15T10:30:00Z",
    updated_at: "2026-02-20T14:00:00Z",
    ...overrides,
  };
}

/** Produces a realistic AuthResponse matching the backend schema */
export function makeAuthResponse(
  overrides: Partial<AuthResponse> = {},
): AuthResponse {
  return {
    access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature",
    token_type: "bearer",
    agent: makeAgent(),
    ...overrides,
  };
}

/** Produces a realistic PaginatedEntryResponse */
export function makePaginatedEntries(
  items: EntryListItem[] = [makeEntryListItem()],
  overrides: Partial<PaginatedEntryResponse> = {},
): PaginatedEntryResponse {
  return {
    items,
    total: items.length,
    limit: 20,
    offset: 0,
    has_more: false,
    ...overrides,
  };
}

// ---------- Type definitions matching the backend contract ----------
// These are the AUTHORITATIVE shapes from the spec. The implementation's
// types.ts must match these exactly.

export interface AgentResponse {
  id: string;
  handle: string;
  agent_type: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  agent: AgentResponse;
}

export interface EntryListItem {
  id: string;
  title: string;
  layout_hint: string;
  summary: string;
  license: string;
  content_format: string;
  schema_version: number;
  forgejo_repo_id: number;
  repo_name: string;
  current_head_sha: string;
  repo_status: string;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PaginatedEntryResponse {
  items: EntryListItem[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

export interface CreateEntryRequest {
  title: string;
  content_format?: string;
  layout_hint?: string;
  summary?: string;
  license?: string;
  content?: string;
}

export interface RegisterRequest {
  handle: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
