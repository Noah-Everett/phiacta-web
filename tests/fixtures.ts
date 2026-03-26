// Shared test data factories that produce backend-shaped data.
// Types are imported from the implementation to ensure they stay in sync.

import type {
  User,
  AuthResponse,
  EntryListItem,
  EntryCreate,
  PaginatedResponse,
} from "@/lib/types";

/** Produces a realistic User matching the backend schema */
export function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    handle: "drchen",
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
    summary: "A detailed exploration of the Riemann Hypothesis and its implications.",
    entry_type: "empirical",
    schema_version: 1,
    forgejo_repo_id: null,
    repo_name: "11111111-2222-3333-4444-555555555555",
    current_head_sha: null,
    repo_status: "provisioning",
    status: "active",
    created_by: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    created_at: "2026-01-15T10:30:00Z",
    updated_at: "2026-02-20T14:00:00Z",
    tags: [],
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
    user: makeUser(),
    ...overrides,
  };
}

/** Produces a realistic PaginatedResponse of entries */
export function makePaginatedEntries(
  items: EntryListItem[] = [makeEntryListItem()],
  overrides: Partial<PaginatedResponse<EntryListItem>> = {},
): PaginatedResponse<EntryListItem> {
  return {
    items,
    total: items.length,
    limit: 20,
    offset: 0,
    has_more: false,
    ...overrides,
  };
}

/** Produces a realistic EntryCreate request */
export function makeEntryCreate(
  overrides: Partial<EntryCreate> = {},
): EntryCreate {
  return {
    title: "Test Entry",
    content_format: "markdown",
    entry_type: "empirical",
    ...overrides,
  };
}
