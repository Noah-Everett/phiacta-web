import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get display initials from a username string.
 * Returns first two characters uppercased. Handles edge cases gracefully.
 */
export function getInitials(username: string): string {
  if (!username) return "?";
  return username.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase() || "?";
}
