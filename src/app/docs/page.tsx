"use client";

import { ApiReferenceReact } from "@scalar/api-reference-react";
import "@scalar/api-reference-react/style.css";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.phiacta.com";

export default function DocsPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-background px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-1 text-3xl font-bold text-foreground">
            API Reference
          </h1>
          <p className="text-muted-foreground">
            Auto-generated from the backend&apos;s OpenAPI specification.
          </p>
        </div>
      </div>

      {/* Scalar viewer */}
      {mounted && (
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
      )}
    </div>
  );
}
