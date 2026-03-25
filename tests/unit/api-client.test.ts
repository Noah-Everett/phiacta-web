// Unit tests for the API client module — verifies that API functions call
// the correct URLs, send correct request bodies, and use correct field names.

import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  registerApi,
  loginApi,
  listEntries,
  getEntry,
  createEntry,
  getMeApi,
  setStoredToken,
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

  it("registerApi calls POST /v1/auth/register", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          access_token: "token",
          token_type: "bearer",
          user: {
            id: "test-id",
            handle: "testuser",
            created_at: "2026-01-01T00:00:00Z",
          },
        }),
    });

    await registerApi("testuser", "password123");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain("/v1/auth/register");
    expect(url).not.toContain("/v1/claims");
    expect(options.method).toBe("POST");
  });

  it("loginApi calls POST /v1/auth/login", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          access_token: "token",
          token_type: "bearer",
          user: {
            id: "test-id",
            handle: "testuser",
            created_at: "2026-01-01T00:00:00Z",
          },
        }),
    });

    await loginApi("testuser", "password123");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain("/v1/auth/login");
    expect(options.method).toBe("POST");
  });

  it("listEntries calls GET /v1/entries", async () => {
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

    await listEntries();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url] = fetchMock.mock.calls[0];
    expect(url).toContain("/v1/entries");
    expect(url).not.toContain("/v1/claims");
  });

  it("getEntry calls GET /v1/entries/{id}", async () => {
    const testId = "11111111-2222-3333-4444-555555555555";
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: testId, title: "Test" }),
    });

    await getEntry(testId);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url] = fetchMock.mock.calls[0];
    expect(url).toContain(`/v1/entries/${testId}`);
    expect(url).not.toContain("/v1/claims");
  });

  it("createEntry calls POST /v1/entries", async () => {
    // createEntry uses authFetch which reads token from localStorage
    setStoredToken("test-token");

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
      entry_type: "empirical",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain("/v1/entries");
    expect(url).not.toContain("/v1/claims");
    expect(options.method).toBe("POST");
  });

  it("getMeApi calls GET /v1/auth/me with Authorization header", async () => {
    // getMeApi reads token from localStorage
    setStoredToken("test-token");

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          id: "test-id",
          handle: "testuser",
          created_at: "2026-01-01T00:00:00Z",
        }),
    });

    await getMeApi();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain("/v1/auth/me");
    expect(options.headers).toBeDefined();
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

  it("registerApi sends handle and password only, not email", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          access_token: "token",
          token_type: "bearer",
          user: {
            id: "id",
            handle: "drchen",
            created_at: "2026-01-01T00:00:00Z",
          },
        }),
    });

    await registerApi("drchen", "secure123");

    const [, options] = fetchMock.mock.calls[0];
    const body = JSON.parse(options.body);

    expect(body).toHaveProperty("handle", "drchen");
    expect(body).toHaveProperty("password", "secure123");
    expect(body).not.toHaveProperty("name");
    expect(body).not.toHaveProperty("email");
  });

  it("createEntry sends entry_type and content_format, not layout_hint or license", async () => {
    setStoredToken("test-token");

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: "new-id", title: "Test" }),
    });

    await createEntry({
      title: "My Research Paper",
      content_format: "markdown",
      entry_type: "empirical",
      summary: "A paper about things",
      content: "# Content\n\nBody text here.",
    });

    const [, options] = fetchMock.mock.calls[0];
    const body = JSON.parse(options.body);

    expect(body).toHaveProperty("title", "My Research Paper");
    expect(body).toHaveProperty("content_format", "markdown");
    expect(body).toHaveProperty("entry_type", "empirical");
    expect(body).toHaveProperty("summary", "A paper about things");
    expect(body).toHaveProperty("content", "# Content\n\nBody text here.");

    expect(body).not.toHaveProperty("format");
    expect(body).not.toHaveProperty("claim_type");
    expect(body).not.toHaveProperty("type");
    expect(body).not.toHaveProperty("claimType");
    expect(body).not.toHaveProperty("layout_hint");
    expect(body).not.toHaveProperty("license");
  });

  it("createEntry omits undefined optional fields", async () => {
    setStoredToken("test-token");

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
    expect(body).not.toHaveProperty("format");
    expect(body).not.toHaveProperty("claim_type");
  });

  it("loginApi sends handle and password", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          access_token: "token",
          token_type: "bearer",
          user: {
            id: "id",
            handle: "user",
            created_at: "2026-01-01T00:00:00Z",
          },
        }),
    });

    await loginApi("testuser", "password");

    const [, options] = fetchMock.mock.calls[0];
    const body = JSON.parse(options.body);

    expect(body).toHaveProperty("handle", "testuser");
    expect(body).toHaveProperty("password", "password");
    expect(body).not.toHaveProperty("email");
  });
});
