"use client";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
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

export default function DocsMcpPage() {
  return (
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
  );
}
