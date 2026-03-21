// phiacta-web-repo/tests/e2e/explore-entries.spec.ts
//
// E2E tests for the explore/browse entries page — verifies the page calls
// the correct API endpoint and renders entry data.

import { test, expect } from "@playwright/test";

test.describe("Explore entries page", () => {
  // Scenario: User visits /explore and the page makes a request to
  // GET /v1/entries (not /v1/claims)
  test("fetches entries from /v1/entries, not /v1/claims", async ({ page }) => {
    const apiRequests: string[] = [];

    page.on("request", (request) => {
      const url = request.url();
      if (url.includes("/v1/")) {
        apiRequests.push(url);
      }
    });

    await page.goto("/explore");
    await page.waitForLoadState("networkidle");

    // At least one request should go to /v1/entries
    const entryRequests = apiRequests.filter((url) =>
      url.includes("/v1/entries"),
    );
    expect(entryRequests.length).toBeGreaterThanOrEqual(1);

    // No requests should go to /v1/claims
    const claimRequests = apiRequests.filter((url) =>
      url.includes("/v1/claims"),
    );
    expect(claimRequests).toEqual([]);
  });

  // Scenario: The explore page renders without crashing even if the API
  // returns an error or empty list
  test("renders without crashing on empty data", async ({ page }) => {
    // Mock the entries endpoint to return an empty list
    await page.route("**/v1/entries**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: [],
          total: 0,
          limit: 20,
          offset: 0,
          has_more: false,
        }),
      });
    });

    await page.goto("/explore");

    // Page should load without console errors
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));

    await page.waitForLoadState("networkidle");
    expect(errors).toEqual([]);
  });

  // Scenario: The explore page renders entries with backend-shaped data
  // (layout_hint string, not ClaimType enum)
  test("renders entries with layout_hint strings from backend", async ({
    page,
  }) => {
    await page.route("**/v1/entries**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: [
            {
              id: "11111111-2222-3333-4444-555555555555",
              title: "On the Riemann Hypothesis",
              layout_hint: "research-paper",
              summary: "A detailed exploration of the hypothesis.",
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
            {
              id: "66666666-7777-8888-9999-aaaaaaaaaaaa",
              title: "CRISPR Gene Editing Techniques",
              layout_hint: "methodology",
              summary: "An overview of CRISPR techniques.",
              license: "CC-BY-SA-4.0",
              content_format: "markdown",
              schema_version: 1,
              forgejo_repo_id: 43,
              repo_name: "66666666-7777-8888-9999-aaaaaaaaaaaa",
              current_head_sha: "def456789012345678901234567890abcd123456",
              repo_status: "ready",
              status: "active",
              created_by: "bbbbbbbb-cccc-dddd-eeee-ffffffffffff",
              created_at: "2026-02-10T09:00:00Z",
              updated_at: "2026-03-01T12:00:00Z",
            },
          ],
          total: 2,
          limit: 20,
          offset: 0,
          has_more: false,
        }),
      });
    });

    await page.goto("/explore");
    await page.waitForLoadState("networkidle");

    // Verify entry titles are rendered
    await expect(page.getByText("On the Riemann Hypothesis")).toBeVisible();
    await expect(
      page.getByText("CRISPR Gene Editing Techniques"),
    ).toBeVisible();
  });

  // Scenario: No deprecated terminology appears on the explore page
  test("explore page uses entries terminology, not claims", async ({
    page,
  }) => {
    await page.route("**/v1/entries**", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: [],
          total: 0,
          limit: 20,
          offset: 0,
          has_more: false,
        }),
      });
    });

    await page.goto("/explore");
    await page.waitForLoadState("networkidle");

    const bodyText = await page.textContent("body");

    // Should not contain old terminology
    expect(bodyText).not.toContain("Browse Claims");
    expect(bodyText).not.toContain("All Claims");
    expect(bodyText).not.toContain("ClaimType");
  });
});
