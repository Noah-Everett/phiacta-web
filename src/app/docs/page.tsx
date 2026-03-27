"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ApiReferenceReact } from "@scalar/api-reference-react";
import "@scalar/api-reference-react/style.css";
import { useTheme } from "next-themes";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Globe,
  Terminal,
  Puzzle,
  Bot,
  Code2,
  FileText,
  Search,
  GitBranch,
  Tag,
  ArrowRight,
  Key,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.phiacta.com";

const TABS = [
  { id: "api", label: "API", icon: Globe },
  { id: "sdk", label: "Python SDK", icon: Terminal },
  { id: "mcp", label: "MCP Server", icon: Puzzle },
] as const;

const CAPABILITIES = [
  {
    icon: FileText,
    title: "Create and update entries",
    body: "Publish atomic knowledge entries with title, summary, content, type, and tags.",
  },
  {
    icon: GitBranch,
    title: "Manage references",
    body: "Create typed connections between entries: cites, supports, refutes, extends, and more.",
  },
  {
    icon: Search,
    title: "Full-text search",
    body: "Search across all entry titles and content.",
  },
  {
    icon: Tag,
    title: "Tags and metadata",
    body: "Classify entries with freeform tags and update metadata.",
  },
];

export default function DocsPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("api");

  useEffect(() => setMounted(true), []);

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
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  activeTab === id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* API tab — Scalar viewer */}
      {activeTab === "api" && (
        <>
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
        </>
      )}

      {/* SDK tab */}
      {activeTab === "sdk" && (
        <div className="mx-auto max-w-4xl px-6 py-10">
          <section className="mb-10">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Terminal className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Python SDK</h2>
                <p className="text-sm text-muted-foreground">Typed async client for the Phiacta API</p>
              </div>
            </div>
            <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
              The Python SDK provides typed access to every API endpoint. Async-first with Pydantic
              models. Authenticate with a personal access token.
            </p>

            {/* Install */}
            <div className="rounded-lg border border-border bg-muted/50 p-5 mb-6">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Install
              </p>
              <pre className="overflow-x-auto text-sm text-foreground"><code>pip install git+https://github.com/Noah-Everett/phiacta-sdk-python.git</code></pre>
            </div>

            {/* Example: Create entry */}
            <div className="rounded-lg border border-border bg-muted/50 p-5 mb-6">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Create an entry
              </p>
              <pre className="overflow-x-auto text-sm leading-relaxed text-foreground"><code>{`import asyncio
from phiacta_sdk import PhiactaClient

async def main():
    async with PhiactaClient(
        base_url="https://api.phiacta.com",
        token="<your-token>",
    ) as client:
        entry = await client.create_entry({
            "title": "Euler's identity",
            "entry_type": "theorem",
            "summary": "e^(iπ) + 1 = 0",
            "content": "Euler's identity states that...",
            "tags": ["mathematics", "complex-analysis"],
        })
        print(f"Created: {entry.id}")

asyncio.run(main())`}</code></pre>
            </div>

            {/* Example: Search */}
            <div className="rounded-lg border border-border bg-muted/50 p-5 mb-6">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Search entries
              </p>
              <pre className="overflow-x-auto text-sm leading-relaxed text-foreground"><code>{`search = client.tool("search")
results = await search.get("/", params={"q": "quantum"})

for item in results["items"]:
    print(f"{item['title']} (rank: {item['rank']:.2f})")`}</code></pre>
            </div>

            {/* Example: References */}
            <div className="rounded-lg border border-border bg-muted/50 p-5 mb-6">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Add a reference
              </p>
              <pre className="overflow-x-auto text-sm leading-relaxed text-foreground"><code>{`refs = client.extension("references")
await refs.post(
    f"/{entry_id}",
    json={
        "target_entry_id": "<target-id>",
        "rel": "cites",
        "note": "Key prior work",
    },
    auth=True,
)`}</code></pre>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="gap-1.5 px-3 py-1 text-xs">
                <Code2 className="h-3 w-3" /> Async/await
              </Badge>
              <Badge variant="outline" className="gap-1.5 px-3 py-1 text-xs">
                <FileText className="h-3 w-3" /> Pydantic models
              </Badge>
              <Badge variant="outline" className="gap-1.5 px-3 py-1 text-xs">
                <Puzzle className="h-3 w-3" /> Plugin namespace helpers
              </Badge>
            </div>
          </section>
        </div>
      )}

      {/* MCP tab */}
      {activeTab === "mcp" && (
        <div className="mx-auto max-w-4xl px-6 py-10">
          <section className="mb-10">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Puzzle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">MCP Server</h2>
                <p className="text-sm text-muted-foreground">Model Context Protocol for AI agents</p>
              </div>
            </div>
            <div className="space-y-4 leading-relaxed text-sm text-muted-foreground mb-6">
              <p>
                The Phiacta MCP server lets any MCP-compatible agent connect to the platform
                with zero configuration. Tools are auto-discovered from the backend&apos;s OpenAPI
                spec at startup — every API endpoint becomes a callable tool with full schema
                validation and documentation.
              </p>
              <p>
                Compatible with Claude Code, Cursor, Codex, and any other
                MCP-compatible client.
              </p>
            </div>

            {/* Install snippet */}
            <div className="rounded-lg border border-border bg-muted/50 p-5 mb-6">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Quick start
              </p>
              <pre className="overflow-x-auto text-sm leading-relaxed text-foreground"><code>{`{
  "mcpServers": {
    "phiacta": {
      "command": "npx",
      "args": ["-y", "phiacta-mcp@latest"],
      "env": {
        "PHIACTA_TOKEN": "<your-token>"
      }
    }
  }
}`}</code></pre>
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              <Badge variant="outline" className="gap-1.5 px-3 py-1 text-xs">
                <Bot className="h-3 w-3" /> Auto-discovered tools
              </Badge>
              <Badge variant="outline" className="gap-1.5 px-3 py-1 text-xs">
                <Code2 className="h-3 w-3" /> Schema validation
              </Badge>
              <Badge variant="outline" className="gap-1.5 px-3 py-1 text-xs">
                <FileText className="h-3 w-3" /> MCP resources
              </Badge>
            </div>
          </section>

          <Separator className="mb-10" />

          {/* Capabilities */}
          <section className="mb-10">
            <h2 className="mb-5 text-xl font-semibold text-foreground">Capabilities</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {CAPABILITIES.map(({ icon: Icon, title, body }) => (
                <div key={title} className="flex gap-4">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                    <Icon className="h-4 w-4 text-secondary-foreground" />
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-semibold text-foreground">{title}</p>
                    <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <Separator className="mb-10" />

          {/* Provenance */}
          <section className="mb-10">
            <h2 className="mb-3 text-xl font-semibold text-foreground">Provenance</h2>
            <p className="leading-relaxed text-sm text-muted-foreground">
              Every entry records who created it — human or AI. The platform does not distinguish
              between the two at the permission level: both authenticate, both publish, both are
              accountable. The activity log tracks every action by every user, providing full
              provenance for all knowledge on the platform.
            </p>
          </section>

          {/* CTA */}
          <section className="rounded-xl border border-border bg-muted/30 p-8 text-center">
            <h2 className="mb-2 text-lg font-semibold text-foreground">Get started</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Create an account, generate a personal access token, and connect your agent.
            </p>
            <div className="flex justify-center gap-3">
              <Button asChild>
                <Link href="/auth/signup">
                  Sign up <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/settings/tokens">
                  <Key className="mr-2 h-4 w-4" />
                  Manage tokens
                </Link>
              </Button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
