// phiacta-web-repo/tests/unit/get-initials.test.ts
//
// Unit tests for the getInitials utility — verifies it works with
// username-style strings (single words, hyphenated, short usernames),
// not just "First Last" human names.

import { describe, it, expect } from "vitest";

// The implementation must export getInitials from @/lib/utils
import { getInitials } from "@/lib/utils";

describe("getInitials — username-style strings", () => {
  // Usernames are single-word identifiers like "drchen", not "Dr. Chen"
  it('returns first two chars uppercased for simple username: "drchen" -> "DR"', () => {
    expect(getInitials("drchen")).toBe("DR");
  });

  // Single character username
  it('returns single char uppercased for 1-char username: "a" -> "A"', () => {
    expect(getInitials("a")).toBe("A");
  });

  // Hyphenated username — should use first chars of segments or first two chars
  it('handles hyphenated username: "dr-sarah-chen" -> "DR" or "DS"', () => {
    const result = getInitials("dr-sarah-chen");
    // Either take first two chars ("DR") or first char of first two segments ("DS")
    // Both are valid — the key is it does not crash and returns uppercase letters
    expect(result).toMatch(/^[A-Z]{1,2}$/);
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result.length).toBeLessThanOrEqual(2);
  });

  // Empty string
  it('returns fallback for empty input: "" -> "?"', () => {
    expect(getInitials("")).toBe("?");
  });

  // Two character username
  it('returns both chars uppercased for 2-char username: "ab" -> "AB"', () => {
    expect(getInitials("ab")).toBe("AB");
  });

  // Longer username
  it('returns first two chars uppercased for long username: "researcher42" -> "RE"', () => {
    expect(getInitials("researcher42")).toBe("RE");
  });

  // Username with underscores
  it("handles underscore-separated username", () => {
    const result = getInitials("data_scientist");
    expect(result).toMatch(/^[A-Z]{1,2}$/);
  });

  // Username with numbers at start
  it("handles username starting with numbers", () => {
    const result = getInitials("42researcher");
    // Should not crash — numbers are valid
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThanOrEqual(0);
    expect(result.length).toBeLessThanOrEqual(2);
  });

  // Uppercase username
  it("handles already-uppercase username", () => {
    expect(getInitials("ADMIN")).toBe("AD");
  });

  // Mixed case
  it("handles mixed case username", () => {
    expect(getInitials("DrChen")).toBe("DR");
  });
});
