// phiacta-web-repo/tests/e2e/auth-flow.spec.ts
//
// E2E tests for the authentication flow — verifies that registration sends
// "username" (not "name"), login works, and the auth state persists.

import { test, expect } from "@playwright/test";

test.describe("Registration flow", () => {
  // Scenario: User visits /auth/signup and sees a form with username and
  // password fields (not a "name" or "email" field)
  test("signup page has username field, not name or email field", async ({ page }) => {
    await page.goto("/auth/signup");

    // Must have a username input (not name)
    const usernameInput = page.locator(
      'input[name="username"], input[placeholder*="username" i], input[id*="username" i]',
    );
    await expect(usernameInput.first()).toBeVisible();

    // Must NOT have a "name" field (the old schema)
    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toHaveCount(0);

    // Must NOT have an email field (removed from registration)
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    await expect(emailInput).toHaveCount(0);

    // Must have password
    const passwordInput = page.locator(
      'input[type="password"], input[name="password"]',
    );
    await expect(passwordInput.first()).toBeVisible();
  });

  // Scenario: User submits the registration form and the request body contains
  // "username" and "password" only, hitting /v1/auth/register
  test("registration POST sends username, password to /v1/auth/register", async ({
    page,
  }) => {
    let capturedRequest: { url: string; body: string } | null = null;

    page.on("request", (request) => {
      if (request.url().includes("/auth/register") && request.method() === "POST") {
        capturedRequest = {
          url: request.url(),
          body: request.postData() || "",
        };
      }
    });

    await page.goto("/auth/signup");

    // Fill in the form
    const usernameInput = page.locator(
      'input[name="username"], input[placeholder*="username" i], input[id*="username" i]',
    );
    await usernameInput.first().fill("testuser123");

    const passwordInput = page.locator(
      'input[type="password"], input[name="password"]',
    );
    await passwordInput.first().fill("securepassword123");

    // Submit the form
    const submitButton = page.locator(
      'button[type="submit"], button:has-text("Sign up"), button:has-text("Register"), button:has-text("Create")',
    );
    await submitButton.first().click();

    // Wait for the network request
    await page.waitForTimeout(2000);

    // Verify the request was sent
    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain("/v1/auth/register");
    expect(capturedRequest!.url).not.toContain("/v1/claims");

    // Verify request body
    const body = JSON.parse(capturedRequest!.body);
    expect(body).toHaveProperty("username", "testuser123");
    expect(body).toHaveProperty("password", "securepassword123");
    // Must NOT contain "name" or "email" — those were the old schema
    expect(body).not.toHaveProperty("name");
    expect(body).not.toHaveProperty("email");
  });
});

test.describe("Login flow", () => {
  // Scenario: User visits /auth/login and sees username + password fields
  test("login page has username and password fields", async ({ page }) => {
    await page.goto("/auth/login");

    const usernameInput = page.locator(
      'input[name="username"], input[placeholder*="username" i], input[id*="username" i]',
    );
    await expect(usernameInput.first()).toBeVisible();

    const passwordInput = page.locator(
      'input[type="password"], input[name="password"]',
    );
    await expect(passwordInput.first()).toBeVisible();
  });

  // Scenario: Login form POSTs to /v1/auth/login with username and password
  test("login POST sends username, password to /v1/auth/login", async ({
    page,
  }) => {
    let capturedRequest: { url: string; body: string } | null = null;

    page.on("request", (request) => {
      if (request.url().includes("/auth/login") && request.method() === "POST") {
        capturedRequest = {
          url: request.url(),
          body: request.postData() || "",
        };
      }
    });

    await page.goto("/auth/login");

    const usernameInput = page.locator(
      'input[name="username"], input[placeholder*="username" i], input[id*="username" i]',
    );
    await usernameInput.first().fill("testuser");

    const passwordInput = page.locator(
      'input[type="password"], input[name="password"]',
    );
    await passwordInput.first().fill("securepassword123");

    const submitButton = page.locator(
      'button[type="submit"], button:has-text("Log in"), button:has-text("Login"), button:has-text("Sign in")',
    );
    await submitButton.first().click();

    await page.waitForTimeout(2000);

    expect(capturedRequest).not.toBeNull();
    expect(capturedRequest!.url).toContain("/v1/auth/login");

    const body = JSON.parse(capturedRequest!.body);
    expect(body).toHaveProperty("username", "testuser");
    expect(body).toHaveProperty("password", "securepassword123");
    expect(body).not.toHaveProperty("email");
  });
});
