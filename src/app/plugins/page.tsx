"use client";

import { useState, useEffect } from "react";
import { listPlugins } from "@/lib/api";
import type { PluginInfo } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Puzzle, Layers, Wrench } from "lucide-react";

const TYPE_CONFIG: Record<
  string,
  { label: string; icon: typeof Puzzle; color: string }
> = {
  extension: {
    label: "Extensions",
    icon: Layers,
    color:
      "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800",
  },
  tool: {
    label: "Tools",
    icon: Wrench,
    color:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
  },
};

const DEFAULT_TYPE_CONFIG = {
  label: "Plugins",
  icon: Puzzle,
  color:
    "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700",
};

function PluginCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-12" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

function PluginCard({ plugin }: { plugin: PluginInfo }) {
  const config = TYPE_CONFIG[plugin.type] ?? DEFAULT_TYPE_CONFIG;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <p className="text-sm font-semibold text-foreground">{plugin.name}</p>
        <Badge variant="outline" className={`text-xs font-medium ${config.color}`}>
          {plugin.type}
        </Badge>
        <span className="text-xs text-muted-foreground">v{plugin.version}</span>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">
        {plugin.description}
      </p>

      {plugin.provider && (
        <div className="mt-3 space-y-1.5">
          {plugin.provider.fields.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Fields:
              </span>
              {plugin.provider.fields.map((f) => (
                <Badge
                  key={f}
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0"
                >
                  {f}
                </Badge>
              ))}
            </div>
          )}
          {plugin.provider.writable_fields.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Writable:
              </span>
              {plugin.provider.writable_fields.map((f) => (
                <Badge
                  key={f}
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0"
                >
                  {f}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {plugin.depends_on.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Depends on:
          </span>
          {plugin.depends_on.map((dep) => (
            <Badge
              key={dep}
              variant="outline"
              className="text-[10px] px-1.5 py-0"
            >
              {dep}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PluginsPage() {
  const [plugins, setPlugins] = useState<PluginInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const items = await listPlugins();
        setPlugins(items);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load plugins"
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Group by type
  const groups: Record<string, PluginInfo[]> = {};
  for (const plugin of plugins) {
    const key = plugin.type;
    if (!groups[key]) groups[key] = [];
    groups[key].push(plugin);
  }

  // Sort group keys to match TYPE_CONFIG order, then any extras
  const orderedTypes = ["extension", "tool"];
  const sortedGroupKeys = [
    ...orderedTypes.filter((t) => groups[t]),
    ...Object.keys(groups).filter((t) => !orderedTypes.includes(t)),
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Puzzle className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-2xl font-bold text-foreground">Plugins</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Extensions and tools that power the platform.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading && (
        <div className="space-y-8">
          {["Extensions", "Views", "Tools"].map((label) => (
            <section key={label}>
              <Skeleton className="h-5 w-24 mb-3" />
              <div className="grid gap-3 sm:grid-cols-2">
                <PluginCardSkeleton />
                <PluginCardSkeleton />
              </div>
            </section>
          ))}
        </div>
      )}

      {!loading && !error && plugins.length === 0 && (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <Puzzle className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No plugins available yet.
          </p>
        </div>
      )}

      {!loading && !error && plugins.length > 0 && (
        <div className="space-y-8">
          {sortedGroupKeys.map((type) => {
            const config = TYPE_CONFIG[type] ?? DEFAULT_TYPE_CONFIG;
            const Icon = config.icon;
            const items = groups[type];
            return (
              <section key={type}>
                <div className="mb-3 flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                    {config.label} ({items.length})
                  </h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {items.map((plugin) => (
                    <PluginCard key={plugin.name} plugin={plugin} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
