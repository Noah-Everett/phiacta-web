"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface SearchBarProps {
  compact?: boolean;
  defaultValue?: string;
}

export default function SearchBar({ compact, defaultValue = "" }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search claims..."
        className={`w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-gray-400 dark:focus:ring-gray-400 ${
          compact ? "px-3 py-1.5 text-sm" : "px-4 py-3 text-base"
        }`}
      />
    </form>
  );
}
