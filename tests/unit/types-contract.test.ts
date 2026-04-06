// Type contract tests — verify at compile time that the TypeScript types
// match the backend Pydantic schemas exactly.

import { describe, it, expect } from "vitest";

import type {
  User,
  AuthResponse,
  EntryListItem,
  EntryDetailResponse,
  EntryCreate,
  EntryUpdate,
  PaginatedResponse,
  ReferenceItem,
} from "@/lib/types";

describe("TypeScript types match backend contract", () => {
  it("User has correct fields", () => {
    const user: User = {
      id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
      username: "drchen",
      created_at: "2026-01-15T10:30:00Z",
    };

    expect(user.id).toBe("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee");
    expect(user.username).toBe("drchen");
    expect(user.created_at).toBe("2026-01-15T10:30:00Z");

    expect("username" in user).toBe(true);

    const userKeys = Object.keys(user);
    expect(userKeys).not.toContain("name");
    expect(userKeys).not.toContain("email");
    expect(userKeys).not.toContain("trust_score");
    expect(userKeys).not.toContain("bio");
    expect(userKeys).not.toContain("agent_type");
    expect(userKeys).not.toContain("is_active");
  });

  it("AuthResponse has correct fields", () => {
    const auth: AuthResponse = {
      access_token: "eyJ...",
      token_type: "bearer",
      user: {
        id: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
        username: "drchen",
        created_at: "2026-01-15T10:30:00Z",
      },
    };

    expect(auth.access_token).toBe("eyJ...");
    expect(auth.token_type).toBe("bearer");
    expect(auth.user.username).toBe("drchen");
    expect("name" in auth.user).toBe(false);
  });

  it("EntryListItem has core fields and auto-composed extension fields", () => {
    const entry: EntryListItem = {
      id: "11111111-2222-3333-4444-555555555555",
      title: "On the Riemann Hypothesis",
      summary: null,
      entry_type: null,
      forgejo_repo_id: null,
      repo_name: "11111111-2222-3333-4444-555555555555",
      current_head_sha: null,
      repo_status: "provisioning",
      visibility: "public",
      created_by: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
      created_at: "2026-01-15T10:30:00Z",
      updated_at: "2026-02-20T14:00:00Z",
      tags: ["mathematics", "number-theory"],
    };

    expect(entry.entry_type).toBeNull();
    expect(entry.repo_status).toBe("provisioning");
    expect(entry.forgejo_repo_id).toBeNull();
    expect(entry.current_head_sha).toBeNull();
    expect(entry.tags).toEqual(["mathematics", "number-theory"]);

    const keys = Object.keys(entry);
    // Removed fields should not appear:
    expect(keys).not.toContain("claim_type");
    expect(keys).not.toContain("claimType");
    expect(keys).not.toContain("format");
    expect(keys).not.toContain("namespace");
    expect(keys).not.toContain("source");
    expect(keys).not.toContain("layout_hint");
    expect(keys).not.toContain("license");
    expect(keys).not.toContain("content_format");
    expect(keys).not.toContain("content_cache");
  });

  it("EntryCreate uses correct field names", () => {
    const request: EntryCreate = {
      title: "Test Entry",
      content_format: "markdown",
      entry_type: "empirical",
      summary: "A test entry",
      content: "# Content",
    };

    expect(request.title).toBe("Test Entry");
    expect(request.content_format).toBe("markdown");
    expect(request.entry_type).toBe("empirical");

    const keys = Object.keys(request);
    expect(keys).not.toContain("format");
    expect(keys).not.toContain("claim_type");
    expect(keys).not.toContain("type");
    expect(keys).not.toContain("layout_hint");
    expect(keys).not.toContain("license");
  });

  it("EntryUpdate accepts any writable extension field", () => {
    const update: EntryUpdate = {
      title: "Updated Title",
      entry_type: "theorem",
      tags: ["math", "proof"],
    };

    expect(update.title).toBe("Updated Title");
    expect(update.entry_type).toBe("theorem");
    expect(update.tags).toEqual(["math", "proof"]);
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

  it("EntryDetailResponse extends EntryListItem with references", () => {
    const detail: EntryDetailResponse = {
      id: "11111111-2222-3333-4444-555555555555",
      title: "Test",
      summary: null,
      entry_type: null,
      forgejo_repo_id: null,
      repo_name: "11111111-2222-3333-4444-555555555555",
      current_head_sha: null,
      repo_status: "ready",
      visibility: "public",
      created_by: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
      created_at: "2026-01-15T10:30:00Z",
      updated_at: "2026-02-20T14:00:00Z",
      tags: ["test"],
      references: [
        {
          id: "ref-1",
          from_entity_id: "11111111-2222-3333-4444-555555555555",
          to_entity_id: "22222222-3333-4444-5555-666666666666",
          rel: "supports",
          version_sha: null,
          note: null,
          created_by: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
          created_at: "2026-01-15T10:30:00Z",
        },
      ],
    };

    expect(detail.title).toBe("Test");
    expect(detail.references).toHaveLength(1);
    expect(detail.references![0].rel).toBe("supports");
    expect(detail.tags).toEqual(["test"]);

    const keys = Object.keys(detail);
    expect(keys).not.toContain("content_cache");
    expect(keys).not.toContain("outgoing_refs");
    expect(keys).not.toContain("incoming_refs");
  });

  it("ReferenceItem has correct fields", () => {
    const ref: ReferenceItem = {
      id: "ref-id",
      from_entity_id: "entry-1",
      to_entity_id: "entry-2",
      rel: "cites",
      version_sha: "abc123",
      note: "see section 3",
      created_by: "user-id",
      created_at: "2026-01-15T10:30:00Z",
    };

    expect(ref.rel).toBe("cites");
    expect(ref.note).toBe("see section 3");
  });
});
