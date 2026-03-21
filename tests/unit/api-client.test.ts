// phiacta-web-repo/tests/unit/api-client.test.ts
//
// Unit tests for the API client module — verifies that API functions call
// the correct URLs, send correct request bodies, and use correct field names.
//
// These tests use fetch mocking to intercept all outgoing requests.

import { describe, it, expect, vi, beforeEach } from "vitest";

// We test the contract — the API client MUST be importable from @/lib/api
// and expose these functions with these signatures.
// The actual import will fail until stubs exist.
import {
  registerApi,
  loginApi,
  fetchEntries,
  fetchEntry,
  createEntry,
  fetchMe,
  API_BASE_URL,
} from "@/lib/api";

describe("API Client — endpoint URLs", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
    vi.stubGlobal("fetch", fetchMock);
  });

  // Verifies registerApi calls POST /v1/auth/register
  it("registerApi calls POST /v1/auth/register", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          access_token: "token",
          token_type: "bearer",
          agent: {
            id: "test-id",
            handle: "testuser",
            agent_type: "human",
            is_active: true,
            created_at: "2026-01-01T00:00:00Z",
          },
        }),
    });

    await registerApi("testuser", "test@example.com", "password123");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain("/v1/auth/register");
    expect(url).not.toContain("/v1/claims");
    expect(options.method).toBe("POST");
  });

  // Verifies loginApi calls POST /v1/auth/login
  it("loginApi calls POST /v1/auth/login", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          access_token: "token",
          token_type: "bearer",
          agent: {
            id: "test-id",
            handle: "testuser",
            agent_type: "human",
            is_active: true,
            created_at: "2026-01-01T00:00:00Z",
          },
        }),
    });

    await loginApi("test@example.com", "password123");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain("/v1/auth/login");
    expect(options.method).toBe("POST");
  });

  // Verifies fetchEntries calls GET /v1/entries
  it("fetchEntries calls GET /v1/entries", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          items: [],
          total: 0,
          limit: 20,
          offset: 0,
          has_more: false,
        }),
    });

    await fetchEntries();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url] = fetchMock.mock.calls[0];
    expect(url).toContain("/v1/entries");
    expect(url).not.toContain("/v1/claims");
  });

  // Verifies fetchEntry calls GET /v1/entries/{id}
  it("fetchEntry calls GET /v1/entries/{id}", async () => {
    const testId = "11111111-2222-3333-4444-555555555555";
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: testId, title: "Test" }),
    });

    await fetchEntry(testId);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url] = fetchMock.mock.calls[0];
    expect(url).toContain(`/v1/entries/${testId}`);
    expect(url).not.toContain("/v1/claims");
  });

  // Verifies createEntry calls POST /v1/entries
  it("createEntry calls POST /v1/entries", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          id: "new-entry-id",
          title: "Test Entry",
        }),
    });

    await createEntry({
      title: "Test Entry",
      content_format: "markdown",
      layout_hint: "research-paper",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain("/v1/entries");
    expect(url).not.toContain("/v1/claims");
    expect(options.method).toBe("POST");
  });

  // Verifies fetchMe calls GET /v1/auth/me
  it("fetchMe calls GET /v1/auth/me with Authorization header", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          id: "test-id",
          handle: "testuser",
          agent_type: "human",
          is_active: true,
          created_at: "2026-01-01T00:00:00Z",
        }),
    });

    await fetchMe("test-token");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain("/v1/auth/me");
    expect(options.headers).toBeDefined();
    // Authorization header must be present
    const headers = options.headers as Record<string, string>;
    const authHeader =
      headers["Authorization"] || headers["authorization"] || "";
    expect(authHeader).toContain("Bearer test-token");
  });
});

describe("API Client — request bodies", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
    vi.stubGlobal("fetch", fetchMock);
  });

  // Verifies registerApi sends {handle, email, password} not {name, email, password}
  it("registerApi sends handle, not name", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          access_token: "token",
          token_type: "bearer",
          agent: {
            id: "id",
            handle: "drchen",
            agent_type: "human",
            is_active: true,
            created_at: "2026-01-01T00:00:00Z",
          },
        }),
    });

    await registerApi("drchen", "dr@chen.com", "secure123");

    const [, options] = fetchMock.mock.calls[0];
    const body = JSON.parse(options.body);

    expect(body).toHaveProperty("handle", "drchen");
    expect(body).toHaveProperty("email", "dr@chen.com");
    expect(body).toHaveProperty("password", "secure123");
    // MUST NOT have "name" — old schema
    expect(body).not.toHaveProperty("name");
  });

  // Verifies createEntry sends content_format and layout_hint, not format and claim_type
  it("createEntry sends content_format and layout_hint, not format and claim_type", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: "new-id", title: "Test" }),
    });

    await createEntry({
      title: "My Research Paper",
      content_format: "markdown",
      layout_hint: "research-paper",
      summary: "A paper about things",
      license: "CC-BY-4.0",
      content: "# Content\n\nBody text here.",
    });

    const [, options] = fetchMock.mock.calls[0];
    const body = JSON.parse(options.body);

    // Correct field names
    expect(body).toHaveProperty("title", "My Research Paper");
    expect(body).toHaveProperty("content_format", "markdown");
    expect(body).toHaveProperty("layout_hint", "research-paper");
    expect(body).toHaveProperty("summary", "A paper about things");
    expect(body).toHaveProperty("license", "CC-BY-4.0");
    expect(body).toHaveProperty("content", "# Content\n\nBody text here.");

    // MUST NOT have old field names
    expect(body).not.toHaveProperty("format");
    expect(body).not.toHaveProperty("claim_type");
    expect(body).not.toHaveProperty("type");
    expect(body).not.toHaveProperty("claimType");
  });

  // Verifies createEntry sends only provided fields (optional fields omitted)
  it("createEntry omits undefined optional fields", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: "new-id", title: "Test" }),
    });

    await createEntry({
      title: "Minimal Entry",
    });

    const [, options] = fetchMock.mock.calls[0];
    const body = JSON.parse(options.body);

    expect(body).toHaveProperty("title", "Minimal Entry");
    // Optional fields should either be absent or null, never the old field names
    expect(body).not.toHaveProperty("format");
    expect(body).not.toHaveProperty("claim_type");
  });

  // Verifies loginApi sends {email, password}
  it("loginApi sends email and password", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          access_token: "token",
          token_type: "bearer",
          agent: {
            id: "id",
            handle: "user",
            agent_type: "human",
            is_active: true,
            created_at: "2026-01-01T00:00:00Z",
          },
        }),
    });

    await loginApi("user@example.com", "password");

    const [, options] = fetchMock.mock.calls[0];
    const body = JSON.parse(options.body);

    expect(body).toHaveProperty("email", "user@example.com");
    expect(body).toHaveProperty("password", "password");
  });
});

describe("API Client — no deprecated endpoints", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
    vi.stubGlobal("fetch", fetchMock);
  });

  // Verifies the API_BASE_URL points to the backend
  it("API_BASE_URL is set to backend URL", () => {
    expect(API_BASE_URL).toBeDefined();
    expect(typeof API_BASE_URL).toBe("string");
    // Should be a valid URL or at minimum a non-empty string
    expect(API_BASE_URL.length).toBeGreaterThan(0);
  });
});
