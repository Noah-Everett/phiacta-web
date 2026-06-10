// Unit tests for EntryProvider's server-seeding contract.
//
// The SSR fix hinges on one thing: when the server passes initial entry +
// content down as props, the provider must expose them on its VERY FIRST
// render (before any effect runs). React renders the same tree on the
// server, so "available on first render" == "present in the SSR HTML".
//
// We assert the seeded values are visible synchronously and that loading is
// already false when seeded. The second test pins the unseeded fallback
// (private / unknown entries) to today's behaviour: loading, no content.

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// The provider refetches on mount and reads auth — make those inert so the
// only thing under test is the synchronous seed, not async side effects.
vi.mock("@/lib/auth-context", () => ({
  useAuth: () => ({ user: null }),
}));

// NB: vi.mock is hoisted above imports, so its factory cannot close over
// module-scope variables — keep the "pending promise" inline here.
vi.mock("@/lib/api", () => ({
  getEntry: vi.fn(() => new Promise(() => {})),
  getUser: vi.fn(() => new Promise(() => {})),
  getEntryEdits: vi.fn(() => new Promise(() => {})),
  getEntryIssues: vi.fn(() => new Promise(() => {})),
  updateEntry: vi.fn(),
  setEntryTags: vi.fn(),
  API_URL: "http://localhost:8000",
  getStoredToken: () => null,
  ApiError: class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
      super(message);
      this.status = status;
    }
  },
}));

import { EntryProvider, useEntryContext } from "@/app/entries/[id]/entry-context";
import type { EntryDetailResponse } from "@/lib/types";

const SEED_ENTRY: EntryDetailResponse = {
  id: "11111111-1111-1111-1111-111111111111",
  forgejo_repo_id: 1,
  repo_name: "11111111-1111-1111-1111-111111111111",
  current_head_sha: "abc123",
  repo_status: "ready",
  visibility: "public",
  created_by: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-02T00:00:00Z",
  title: "SSR Seeded Title",
  summary: "A seeded summary",
  entry_type: "paper",
  tags: [],
};

function Probe() {
  const { entry, contentText, contentFormat, loading } = useEntryContext();
  return (
    <div>
      <span data-testid="title">{entry?.title ?? ""}</span>
      <span data-testid="content">{contentText ?? ""}</span>
      <span data-testid="format">{contentFormat}</span>
      <span data-testid="loading">{String(loading)}</span>
    </div>
  );
}

beforeEach(() => {
  // Content probe goes through fetch — keep it pending so it can't clobber
  // the seed during the test.
  vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
});

describe("EntryProvider seeding", () => {
  it("exposes seeded entry + content on first render with loading already false", () => {
    render(
      <EntryProvider
        entryId={SEED_ENTRY.id}
        initialEntry={SEED_ENTRY}
        initialContent={"# Hello from SSR"}
        initialContentFormat="md"
      >
        <Probe />
      </EntryProvider>,
    );

    expect(screen.getByTestId("title").textContent).toBe("SSR Seeded Title");
    expect(screen.getByTestId("content").textContent).toBe("# Hello from SSR");
    expect(screen.getByTestId("format").textContent).toBe("md");
    // Seeded => not loading => server renders real UI, not a skeleton.
    expect(screen.getByTestId("loading").textContent).toBe("false");
  });

  it("renders nothing seeded and stays loading when no initial data (private/unknown)", () => {
    render(
      <EntryProvider entryId={SEED_ENTRY.id}>
        <Probe />
      </EntryProvider>,
    );

    expect(screen.getByTestId("title").textContent).toBe("");
    expect(screen.getByTestId("content").textContent).toBe("");
    expect(screen.getByTestId("loading").textContent).toBe("true");
  });
});
