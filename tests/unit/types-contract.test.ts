// Type contract tests — verify at compile time that the TypeScript types
// match the backend Pydantic schemas exactly.

import { describe, it, expect } from "vitest";

import type {
  Agent,
  AuthResponse,
  EntryListItem,
  EntryDetailResponse,
  EntryCreate,
  PaginatedResponse,
} from "@/lib/types";

describe("TypeScript types match backend contract", () => {
  it("Agent has correct fields", () => {
    const agent: Agent = {
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

    expect("handle" in agent).toBe(true);

    const agentKeys = Object.keys(agent);
    expect(agentKeys).not.toContain("name");
    expect(agentKeys).not.toContain("email");
    expect(agentKeys).not.toContain("trust_score");
    expect(agentKeys).not.toContain("bio");
  });

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
    expect("name" in auth.agent).toBe(false);
  });

  it("EntryListItem has all required fields with correct nullability", () => {
    const entry: EntryListItem = {
      id: "11111111-2222-3333-4444-555555555555",
      title: "On the Riemann Hypothesis",
      layout_hint: null,
      summary: null,
      license: null,
      content_format: "markdown",
      schema_version: 1,
      forgejo_repo_id: null,
      repo_name: "11111111-2222-3333-4444-555555555555",
      current_head_sha: null,
      repo_status: "provisioning",
      status: "active",
      created_by: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
      created_at: "2026-01-15T10:30:00Z",
      updated_at: "2026-02-20T14:00:00Z",
    };

    expect(entry.layout_hint).toBeNull();
    expect(entry.content_format).toBe("markdown");
    expect(entry.repo_status).toBe("provisioning");
    expect(entry.forgejo_repo_id).toBeNull();
    expect(entry.current_head_sha).toBeNull();

    const keys = Object.keys(entry);
    expect(keys).not.toContain("claim_type");
    expect(keys).not.toContain("claimType");
    expect(keys).not.toContain("format");
    expect(keys).not.toContain("namespace");
    expect(keys).not.toContain("source");
  });

  it("EntryCreate uses correct field names", () => {
    const request: EntryCreate = {
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

  it("PaginatedResponse has pagination fields including has_more", () => {
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

  it("EntryDetailResponse includes content_cache and refs", () => {
    const detail: EntryDetailResponse = {
      id: "11111111-2222-3333-4444-555555555555",
      title: "Test",
      layout_hint: null,
      summary: null,
      license: null,
      content_format: "markdown",
      schema_version: 1,
      forgejo_repo_id: null,
      repo_name: "11111111-2222-3333-4444-555555555555",
      current_head_sha: null,
      repo_status: "ready",
      status: "active",
      created_by: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
      created_at: "2026-01-15T10:30:00Z",
      updated_at: "2026-02-20T14:00:00Z",
      content_cache: null,
      outgoing_refs: [],
      incoming_refs: [],
    };

    expect(detail.content_cache).toBeNull();
    expect(detail.outgoing_refs).toEqual([]);
    expect(detail.incoming_refs).toEqual([]);
  });
});
