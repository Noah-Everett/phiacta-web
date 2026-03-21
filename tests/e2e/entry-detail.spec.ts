// phiacta-web-repo/tests/e2e/entry-detail.spec.ts
//
// E2E tests for the entry detail page — verifies it fetches from the
// correct endpoint and renders backend-shaped data.

import { test, expect } from "@playwright/test";

const ENTRY_ID = "11111111-2222-3333-4444-555555555555";

test.describe("Entry detail page", () => {
  test.beforeEach(async ({ page }) => {
    // Mock the entry detail endpoint
    await page.route(`**/v1/entries/${ENTRY_ID}`, (route) => {
      if (route.request().url().includes("/files") ||
          route.request().url().includes("/edits") ||
          route.request().url().includes("/history") ||
          route.request().url().includes("/references")) {
        // Let sub-resource routes pass through or return empty
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        });
        return;
      }
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: ENTRY_ID,
          title: "On the Riemann Hypothesis",
          layout_hint: "research-paper",
          summary: "A detailed exploration of the Riemann Hypothesis.",
          license: "CC-BY-4.0",
          content_format: "markdown",
          schema_version: 1,
          forgejo_repo_id: 42,
          repo_name: ENTRY_ID,
          current_head_sha: "abc123def456789012345678901234567890abcd",
          repo_status: "ready",
          status: "active",
          created_by: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
          created_at: "2026-01-15T10:30:00Z",
          updated_at: "2026-02-20T14:00:00Z",
          content_cache:
            "# On the Riemann Hypothesis\n\nThe Riemann Hypothesis states that...",
          outgoing_refs: [],
          incoming_refs: [],
        }),
      });
    });
  });

  // Scenario: User navigates to /entries/{id} and sees the entry title
  // and content rendered
  test("renders entry title and content from backend data", async ({
    page,
  }) => {
    await page.goto(`/entries/${ENTRY_ID}`);
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByText("On the Riemann Hypothesis"),
    ).toBeVisible();
  });

  // Scenario: The detail page fetches from /v1/entries/{id}, not /v1/claims/{id}
  test("fetches from /v1/entries/{id}, not /v1/claims/{id}", async ({
    page,
  }) => {
    const apiRequests: string[] = [];

    page.on("request", (request) => {
      const url = request.url();
      if (url.includes("/v1/")) {
        apiRequests.push(url);
      }
    });

    await page.goto(`/entries/${ENTRY_ID}`);
    await page.waitForLoadState("networkidle");

    // Should have fetched from /v1/entries/
    const entryRequests = apiRequests.filter((url) =>
      url.includes(`/v1/entries/${ENTRY_ID}`),
    );
    expect(entryRequests.length).toBeGreaterThanOrEqual(1);

    // Should NOT have fetched from /v1/claims/
    const claimRequests = apiRequests.filter((url) =>
      url.includes("/v1/claims"),
    );
    expect(claimRequests).toEqual([]);
  });

  // Scenario: The detail page does not crash and renders the entry page
  // (not a 404 or error)
  test("does not render a 404 for valid entry route", async ({ page }) => {
    await page.goto(`/entries/${ENTRY_ID}`);
    await page.waitForLoadState("networkidle");

    // Should not show a Next.js 404 page
    const bodyText = await page.textContent("body");
    expect(bodyText).not.toContain("404");
    expect(bodyText).not.toContain("This page could not be found");
  });
});
