"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Globe, Terminal, Puzzle } from "lucide-react";

const TABS = [
  { href: "/docs/api", label: "API", icon: Globe },
  { href: "/docs/sdk", label: "Python SDK", icon: Terminal },
  { href: "/docs/mcp", label: "MCP Server", icon: Puzzle },
] as const;

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-background px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-1 text-3xl font-bold text-foreground">
            Documentation
          </h1>
          <p className="mb-6 text-muted-foreground">
            Three ways to interact with Phiacta: REST API, Python SDK, or MCP server.
          </p>

          {/* Tab bar */}
          <div className="flex gap-1">
            {TABS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  pathname === href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}
