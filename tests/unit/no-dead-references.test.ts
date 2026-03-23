// phiacta-web-repo/tests/unit/no-dead-references.test.ts
//
// Static analysis tests — verify that the source code does not contain
// references to deprecated endpoints, field names, or terminology.
// These tests read source files and check for forbidden patterns.

import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const SRC_DIR = join(__dirname, "../../src");

/** Recursively collect all .ts and .tsx files under a directory */
function collectSourceFiles(dir: string): string[] {
  const results: string[] = [];
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory() && entry !== "node_modules" && entry !== ".next") {
        results.push(...collectSourceFiles(fullPath));
      } else if (
        stat.isFile() &&
        (entry.endsWith(".ts") || entry.endsWith(".tsx"))
      ) {
        results.push(fullPath);
      }
    }
  } catch {
    // Directory may not exist yet
  }
  return results;
}

describe("No dead API references in source code", () => {
  const sourceFiles = collectSourceFiles(SRC_DIR);

  // Skip if no source files found (pre-implementation)
  if (sourceFiles.length === 0) {
    it.skip("no source files found — implementation pending", () => {});
    return;
  }

  // Verifies no source file references /v1/claims
  it("no source file references /v1/claims endpoint", () => {
    const violations: string[] = [];
    for (const file of sourceFiles) {
      const content = readFileSync(file, "utf-8");
      if (content.includes("/v1/claims")) {
        violations.push(file);
      }
    }
    expect(violations).toEqual([]);
  });

  // Verifies no source file references /v1/namespaces
  it("no source file references /v1/namespaces endpoint", () => {
    const violations: string[] = [];
    for (const file of sourceFiles) {
      const content = readFileSync(file, "utf-8");
      if (content.includes("/v1/namespaces")) {
        violations.push(file);
      }
    }
    expect(violations).toEqual([]);
  });

  // Verifies no source file references /v1/sources
  it("no source file references /v1/sources endpoint", () => {
    const violations: string[] = [];
    for (const file of sourceFiles) {
      const content = readFileSync(file, "utf-8");
      if (content.includes("/v1/sources")) {
        violations.push(file);
      }
    }
    expect(violations).toEqual([]);
  });

  // Verifies no source file references /v1/search (dead endpoint)
  it("no source file references /v1/search endpoint", () => {
    const violations: string[] = [];
    for (const file of sourceFiles) {
      const content = readFileSync(file, "utf-8");
      if (content.includes("/v1/search")) {
        violations.push(file);
      }
    }
    expect(violations).toEqual([]);
  });

  // Verifies no source file references /layers/ endpoint
  it("no source file references /layers/ endpoint", () => {
    const violations: string[] = [];
    for (const file of sourceFiles) {
      const content = readFileSync(file, "utf-8");
      if (content.includes('"/layers/') || content.includes("'/layers/")) {
        violations.push(file);
      }
    }
    expect(violations).toEqual([]);
  });

  // Verifies no source file uses ClaimType enum
  it("no source file defines or uses ClaimType enum", () => {
    const violations: string[] = [];
    for (const file of sourceFiles) {
      const content = readFileSync(file, "utf-8");
      if (content.includes("ClaimType")) {
        violations.push(file);
      }
    }
    expect(violations).toEqual([]);
  });

  // Verifies no TypeScript type uses "name" field on user (should be "handle")
  it("no user type uses name field instead of handle", () => {
    const violations: string[] = [];
    for (const file of sourceFiles) {
      const content = readFileSync(file, "utf-8");
      // Extract User interface/type blocks specifically and check for "name" field
      const userBlocks = content.match(/(?:interface|type)\s+\w*User\w*\s*(?:extends\s+\w+\s*)?\{[^}]*\}/g);
      if (userBlocks) {
        for (const block of userBlocks) {
          if (block.match(/\bname\s*[?:]?\s*:\s*string/)) {
            violations.push(file);
          }
        }
      }
    }
    expect(violations).toEqual([]);
  });

  // Verifies API client uses "handle" in register, not "name"
  it("registration API call uses handle, not name", () => {
    for (const file of sourceFiles) {
      const content = readFileSync(file, "utf-8");
      if (content.includes("register") && content.includes("auth")) {
        // If the file sends a registration request, it must use "handle"
        // and not include "name" as a field key in the body
        if (content.includes("name:") && !content.includes("handle")) {
          throw new Error(
            `${file} uses "name" instead of "handle" in registration`,
          );
        }
      }
    }
  });
});
