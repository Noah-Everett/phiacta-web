// phiacta-web-repo/tests/unit/types-contract.test.ts
//
// Type contract tests — these verify at compile time that the TypeScript
// types in the frontend match the backend Pydantic schemas exactly.
// If any field is missing, misspelled, or has the wrong type, these
// tests will fail to compile.

import { describe, it, expect } from "vitest";

// Import the types the implementation must provide
import type {
  AgentResponse,
  AuthResponse,
  EntryListItem,
  EntryDetailResponse,
  CreateEntryRequest,
  PaginatedResponse,
} from "@/lib/types";

describe("TypeScript types match backend contract", () => {
  // AgentResponse must have exactly: id, handle, agent_type, is_active, created_at
  // Must NOT have: name, email, trust_score, bio
  it("AgentResponse has correct fields", () => {
    const agent: AgentResponse = {
      id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
      handle: "drchen",
      agent_type: "human",
      is_active: true,
      created_at: "2026-01-15T10:30:00Z",
    };

    expect(agent.id).toBe("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee");
    expect(agent.handle).toBe("drchen");
    expect(agent.agent_type).toBe("human");
    expect(agent.is_active).toBe(true);
    expect(agent.created_at).toBe("2026-01-15T10:30:00Z");

    // Verify handle exists (not name)
    expect("handle" in agent).toBe(true);

    // These fields must NOT exist on the type.
    // We verify at runtime that the test object does not accidentally
    // have them, and the type assertion above verifies at compile time.
    const agentKeys = Object.keys(agent);
    expect(agentKeys).not.toContain("name");
    expect(agentKeys).not.toContain("email");
    expect(agentKeys).not.toContain("trust_score");
    expect(agentKeys).not.toContain("bio");
  });

  // AuthResponse must have: access_token, token_type, agent
  it("AuthResponse has correct fields", () => {
    const auth: AuthResponse = {
      access_token: "eyJ...",
      token_type: "bearer",
      agent: {
        id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
        handle: "drchen",
        agent_type: "human",
        is_active: true,
        created_at: "2026-01-15T10:30:00Z",
      },
    };

    expect(auth.access_token).toBe("eyJ...");
    expect(auth.token_type).toBe("bearer");
    expect(auth.agent.handle).toBe("drchen");
    // agent must NOT have "name"
    expect("name" in auth.agent).toBe(false);
  });

  // EntryListItem must have the full set of backend fields
  it("EntryListItem has all required fields", () => {
    const entry: EntryListItem = {
      id: "11111111-2222-3333-4444-555555555555",
      title: "On the Riemann Hypothesis",
      layout_hint: "research-paper",
      summary: "A detailed exploration.",
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
    };

    // Verify critical field names exist
    expect(entry.layout_hint).toBe("research-paper");
    expect(entry.content_format).toBe("markdown");
    expect(entry.repo_status).toBe("ready");
    expect(entry.created_by).toBeDefined();

    // Verify old field names are NOT present
    const keys = Object.keys(entry);
    expect(keys).not.toContain("claim_type");
    expect(keys).not.toContain("claimType");
    expect(keys).not.toContain("format");
    expect(keys).not.toContain("type");
    expect(keys).not.toContain("namespace");
    expect(keys).not.toContain("source");
  });

  // CreateEntryRequest uses content_format and layout_hint, not format and claim_type
  it("CreateEntryRequest uses correct field names", () => {
    const request: CreateEntryRequest = {
      title: "Test Entry",
      content_format: "markdown",
      layout_hint: "research-paper",
      summary: "A test entry",
      license: "CC-BY-4.0",
      content: "# Content",
    };

    expect(request.title).toBe("Test Entry");
    expect(request.content_format).toBe("markdown");
    expect(request.layout_hint).toBe("research-paper");

    const keys = Object.keys(request);
    expect(keys).not.toContain("format");
    expect(keys).not.toContain("claim_type");
    expect(keys).not.toContain("type");
  });

  // PaginatedResponse has items, total, limit, offset, has_more
  it("PaginatedResponse has pagination fields", () => {
    const response: PaginatedResponse<EntryListItem> = {
      items: [],
      total: 0,
      limit: 20,
      offset: 0,
      has_more: false,
    };

    expect(response.items).toEqual([]);
    expect(response.total).toBe(0);
    expect(response.limit).toBe(20);
    expect(response.offset).toBe(0);
    expect(response.has_more).toBe(false);
  });

  // EntryDetailResponse includes content_cache and refs
  it("EntryDetailResponse includes content_cache and refs", () => {
    const detail: EntryDetailResponse = {
      id: "11111111-2222-3333-4444-555555555555",
      title: "Test",
      layout_hint: "research-paper",
      summary: "Summary",
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
      content_cache: "# Content",
      outgoing_refs: [],
      incoming_refs: [],
    };

    expect(detail.content_cache).toBe("# Content");
    expect(detail.outgoing_refs).toEqual([]);
    expect(detail.incoming_refs).toEqual([]);
  });
});
