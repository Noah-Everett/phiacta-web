// phiacta-web-repo/tests/e2e/no-dead-api-calls.spec.ts
//
// E2E tests that verify NO network requests are made to deprecated API
// endpoints across all major pages.

import { test, expect } from "@playwright/test";

const DEPRECATED_PATTERNS = [
  "/v1/claims",
  "/v1/namespaces",
  "/v1/sources",
  "/v1/search",
  "/layers/",
];

const PAGES_TO_CHECK = [
  "/",
  "/explore",
  "/auth/login",
  "/auth/signup",
  "/about",
];

for (const pagePath of PAGES_TO_CHECK) {
  test(`no deprecated API calls on ${pagePath}`, async ({ page }) => {
    const deprecatedRequests: string[] = [];

    page.on("request", (request) => {
      const url = request.url();
      for (const pattern of DEPRECATED_PATTERNS) {
        if (url.includes(pattern)) {
          deprecatedRequests.push(`${pattern} -> ${url}`);
        }
      }
    });

    await page.goto(pagePath);
    await page.waitForLoadState("networkidle");

    expect(deprecatedRequests).toEqual([]);
  });
}

test("no deprecated API calls when navigating to entry detail", async ({
  page,
}) => {
  const deprecatedRequests: string[] = [];

  page.on("request", (request) => {
    const url = request.url();
    for (const pattern of DEPRECATED_PATTERNS) {
      if (url.includes(pattern)) {
        deprecatedRequests.push(`${pattern} -> ${url}`);
      }
    }
  });

  // Mock entries list
  await page.route("**/v1/entries?**", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        items: [
          {
            id: "11111111-2222-3333-4444-555555555555",
            title: "Test Entry",
            layout_hint: "research-paper",
            summary: "Test summary",
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
          },
        ],
        total: 1,
        limit: 20,
        offset: 0,
        has_more: false,
      }),
    });
  });

  // Mock single entry detail
  await page.route(
    "**/v1/entries/11111111-2222-3333-4444-555555555555",
    (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "11111111-2222-3333-4444-555555555555",
          title: "Test Entry",
          layout_hint: "research-paper",
          summary: "Test summary",
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
          content_cache: "# Test Entry\n\nThis is the content.",
          outgoing_refs: [],
          incoming_refs: [],
        }),
      });
    },
  );

  await page.goto("/entries/11111111-2222-3333-4444-555555555555");
  await page.waitForLoadState("networkidle");

  expect(deprecatedRequests).toEqual([]);
});
