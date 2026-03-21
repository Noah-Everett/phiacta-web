import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get display initials from a handle (username-style string).
 * Returns first two characters uppercased. Handles edge cases gracefully.
 */
export function getInitials(handle: string): string {
  if (!handle) return "?";
  return handle.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase() || "?";
}
