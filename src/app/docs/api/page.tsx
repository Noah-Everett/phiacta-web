"use client";

import { useState, useEffect } from "react";
import { ApiReferenceReact } from "@scalar/api-reference-react";
import "@scalar/api-reference-react/style.css";
import { useTheme } from "next-themes";
import { API_URL } from "@/lib/api";

export default function DocsApiPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="scalar-wrapper min-h-[calc(100vh-200px)]">
      <ApiReferenceReact
        configuration={{
          url: `${API_URL}/openapi.json`,
          forceDarkModeState:
            resolvedTheme === "dark" ? "dark" : "light",
          hideDarkModeToggle: true,
          hideSearch: true,
          theme: "default",
        }}
      />
    </div>
  );
}
