import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LayoutHintBadge, StatusBadge } from "@/components/EntryBadges";
import { getInitials } from "@/lib/utils";
import { getAgent, listEntries } from "@/lib/api";
import {
  ChevronRight,
  Bot,
  User,
  Building2,
  Cpu,
} from "lucide-react";
import type { PublicAgentResponse, EntryListItem } from "@/lib/types";

interface AgentPageProps {
  params: Promise<{ id: string }>;
}

const AGENT_TYPE_ICONS: Record<string, React.ElementType> = {
  human: User,
  ai: Bot,
  organization: Building2,
  pipeline: Cpu,
};

export default async function AgentPage({ params }: AgentPageProps) {
  const { id } = await params;

  let agent: PublicAgentResponse;
  try {
    agent = await getAgent(id);
  } catch {
    return (
      <div className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="mb-2 text-2xl font-bold text-foreground">Agent not found</h1>
        <p className="mb-4 text-sm text-muted-foreground">This agent does not exist or the API is unavailable.</p>
        <Link href="/explore" className="text-sm text-primary hover:underline">Browse entries</Link>
      </div>
    );
  }

  let agentEntries: EntryListItem[] = [];
  try {
    const res = await listEntries(100, 0);
    agentEntries = res.items.filter((e) => e.created_by === id);
  } catch {
    // Agent loaded successfully but entries failed — show profile with empty entries
  }

  const TypeIcon = (agent.agent_type ? AGENT_TYPE_ICONS[agent.agent_type] : null) ?? User;

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/explore" className="hover:text-foreground transition-colors">
          Explore
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{agent.handle}</span>
      </nav>

      {/* Profile header */}
      <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-start">
        <Avatar className="h-20 w-20 text-2xl">
          <AvatarFallback className="text-2xl font-semibold">
            {getInitials(agent.handle)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground">{agent.handle}</h1>
            {agent.agent_type && (
              <Badge variant="secondary" className="gap-1 capitalize">
                <TypeIcon className="h-3 w-3" />
                {agent.agent_type}
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="text-muted-foreground">
              Joined{" "}
              {new Date(agent.created_at).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Entries by this agent */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Entries
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({agentEntries.length})
          </span>
        </h2>

        {agentEntries.length > 0 ? (
          <div className="space-y-2">
            {agentEntries.map((entry) => (
              <Link
                key={entry.id}
                href={`/entries/${entry.id}`}
                className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-5 transition hover:border-primary/30 hover:shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <LayoutHintBadge hint={entry.layout_hint} />
                  <StatusBadge status={entry.status} />
                </div>
                <p className="text-sm font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
                  {entry.title}
                </p>
                {entry.summary && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {entry.summary}
                  </p>
                )}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>
                    {new Date(entry.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span>{entry.content_format}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border py-12 text-center">
            <p className="text-sm text-muted-foreground">No entries published yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
