// Unit tests for the server-side primary-content fetch helper.
//
// fetchPrimaryContent is what makes a public entry's body land in the
// initial server-rendered HTML: the route layout calls it during SSR and
// seeds the rendered content. These tests lock its contract — format
// precedence, graceful nulls, and that it sends no auth (server-side =
// public-only view).

import { describe, it, expect, vi, beforeEach } from "vitest";

import { fetchPrimaryContent } from "@/lib/server-content";

const ENTRY_ID = "11111111-2222-3333-4444-555555555555";

function ok(body: string) {
  return { ok: true, status: 200, text: () => Promise.resolve(body) };
}
function notFound() {
  return { ok: false, status: 404, text: () => Promise.resolve("") };
}
function forbidden() {
  return { ok: false, status: 403, text: () => Promise.resolve("") };
}

describe("fetchPrimaryContent", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  it("returns the markdown file and its format when content.md exists", async () => {
    fetchMock.mockResolvedValueOnce(ok("# Title\n\nBody text."));

    const result = await fetchPrimaryContent(ENTRY_ID);

    expect(result).toEqual({ content: "# Title\n\nBody text.", format: "md" });
    // Should short-circuit — no probing of .tex/.txt once .md is found.
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("probes .phiacta/content.md before .tex before .txt", async () => {
    fetchMock
      .mockResolvedValueOnce(notFound()) // .md
      .mockResolvedValueOnce(ok("\\section{Hi}")) // .tex
      .mockResolvedValueOnce(ok("plain")); // .txt (should not be reached)

    const result = await fetchPrimaryContent(ENTRY_ID);

    expect(result).toEqual({ content: "\\section{Hi}", format: "tex" });
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const urls = fetchMock.mock.calls.map((c) => String(c[0]));
    expect(urls[0]).toContain(`/v1/entries/${ENTRY_ID}/files/.phiacta/content.md`);
    expect(urls[1]).toContain(`/v1/entries/${ENTRY_ID}/files/.phiacta/content.tex`);
  });

  it("falls through to .txt when md and tex are missing", async () => {
    fetchMock
      .mockResolvedValueOnce(notFound())
      .mockResolvedValueOnce(notFound())
      .mockResolvedValueOnce(ok("just text"));

    const result = await fetchPrimaryContent(ENTRY_ID);

    expect(result).toEqual({ content: "just text", format: "txt" });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("returns null when no content file exists", async () => {
    fetchMock.mockResolvedValue(notFound());

    const result = await fetchPrimaryContent(ENTRY_ID);

    expect(result).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("returns null for a private/forbidden entry (no leak into HTML)", async () => {
    fetchMock.mockResolvedValue(forbidden());

    const result = await fetchPrimaryContent(ENTRY_ID);

    expect(result).toBeNull();
  });

  it("skips an empty file and keeps probing", async () => {
    fetchMock
      .mockResolvedValueOnce(ok("")) // .md present but empty
      .mockResolvedValueOnce(ok("real body")); // .tex

    const result = await fetchPrimaryContent(ENTRY_ID);

    expect(result).toEqual({ content: "real body", format: "tex" });
  });

  it("never sends an Authorization header (server-side = public view)", async () => {
    fetchMock.mockResolvedValueOnce(ok("# Hi"));

    await fetchPrimaryContent(ENTRY_ID);

    const [, options] = fetchMock.mock.calls[0];
    const headers = (options?.headers ?? {}) as Record<string, string>;
    expect(headers["Authorization"]).toBeUndefined();
    expect(headers["authorization"]).toBeUndefined();
  });

  it("returns null (never throws) when the network fails", async () => {
    fetchMock.mockRejectedValue(new Error("ECONNREFUSED"));

    await expect(fetchPrimaryContent(ENTRY_ID)).resolves.toBeNull();
  });
});
