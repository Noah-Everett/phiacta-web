"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { fetchGraph } from "@/lib/api";
import GraphConfigPanel from "@/components/GraphConfigPanel";
import type { GraphConfig } from "@/components/GraphConfigPanel";
import type { GraphResponse } from "@/lib/types";

const GraphView = dynamic(() => import("@/components/GraphView"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      Loading graph...
    </div>
  ),
});

export const DEFAULT_GRAPH_CONFIG: GraphConfig = {
  depth: 2,
  direction: "both",
  limit: 50,
  showLabels: true,
  scaleByConnections: true,
  centerForce: 0.3,
  repulsion: -350,
  linkForce: 0.3,
  linkDistance: 60,
};

interface GraphPanelProps {
  seedIds: string[];
  height?: number;
  /** Show a loading state without fetching (e.g., while external data is still loading) */
  loading?: boolean;
  defaultConfig?: Partial<GraphConfig>;
}

export default function GraphPanel({
  seedIds,
  height = 400,
  loading = false,
  defaultConfig,
}: GraphPanelProps) {
  const [config, setConfig] = useState<GraphConfig>({ ...DEFAULT_GRAPH_CONFIG, ...defaultConfig });
  const [graphData, setGraphData] = useState<GraphResponse | null>(null);
  const [graphLoading, setGraphLoading] = useState(false);
  const [graphError, setGraphError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const doFetch = useCallback(async (ids: string[], cfg: GraphConfig) => {
    if (ids.length === 0) {
      setGraphData(null);
      return;
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setGraphLoading(true);
    setGraphError(null);
    try {
      const res = await fetchGraph({
        entry_ids: ids,
        depth: cfg.depth,
        direction: cfg.direction,
        limit: cfg.limit,
      });
      if (!controller.signal.aborted) setGraphData(res);
    } catch (err) {
      if (!controller.signal.aborted)
        setGraphError(err instanceof Error ? err.message : "Failed to load graph");
    } finally {
      if (!controller.signal.aborted) setGraphLoading(false);
    }
  }, []);

  // Stable key for seedIds so the effect doesn't fire on every render when the
  // parent passes a freshly-mapped array with identical contents.
  const seedKey = seedIds.join(",");

  useEffect(() => {
    if (loading) return;
    const ids = seedKey ? seedKey.split(",") : [];
    doFetch(ids, config);
  // config slices: only re-fetch when the query params change, not visual-only settings
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seedKey, config.depth, config.direction, config.limit, loading, doFetch]);

  const handleRecenter = useCallback(
    (entryId: string) => doFetch([entryId], config),
    [doFetch, config],
  );

  const isLoading = loading || graphLoading;

  const statsLine = isLoading
    ? "Loading graph..."
    : graphData
      ? `${graphData.nodes.length} node${graphData.nodes.length !== 1 ? "s" : ""}, ${graphData.edges.length} edge${graphData.edges.length !== 1 ? "s" : ""}`
      : null;

  return (
    <div>
      {statsLine !== null && (
        <div className="mb-2">
          <p className="text-sm text-muted-foreground">{statsLine}</p>
        </div>
      )}
      {/* Outer wrapper is relative but NOT overflow-hidden so the settings
          dropdown can escape the canvas boundary. The inner div clips the canvas. */}
      <div className="relative" style={{ height }}>
        <div className="absolute inset-0 rounded-xl border border-border overflow-hidden">
          {isLoading && !graphData ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Loading graph...
            </div>
          ) : graphError ? (
            <div className="flex h-full items-center justify-center px-4">
              <p className="text-sm text-destructive">{graphError}</p>
            </div>
          ) : graphData ? (
            <GraphView
              data={graphData}
              onRecenter={handleRecenter}
              centerForce={config.centerForce}
              repulsion={config.repulsion}
              linkForce={config.linkForce}
              linkDistance={config.linkDistance}
              showLabels={config.showLabels}
              scaleByConnections={config.scaleByConnections}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No references yet.
            </div>
          )}
        </div>
        {/* Config panel rendered outside overflow-hidden so its dropdown isn't clipped */}
        {graphData && (
          <div className="absolute right-3 top-3 z-10">
            <GraphConfigPanel config={config} onChange={setConfig} />
          </div>
        )}
      </div>
    </div>
  );
}
