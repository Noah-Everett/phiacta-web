"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { forceX, forceY } from "d3-force";
import type { GraphResponse, GraphEdge } from "@/lib/types";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      Loading graph...
    </div>
  ),
});

const SEED_RING_COLOR = "#f59e0b"; // amber-500

/** Read the resolved foreground color from CSS variables for theme support. */
function getThemeColor(): string {
  if (typeof window === "undefined") return "#6b7280";
  return getComputedStyle(document.documentElement).getPropertyValue("--foreground").trim() || "#6b7280";
}
const PRIVATE_OPACITY = 0.4;

interface GraphViewProps {
  data: GraphResponse;
  onRecenter?: (entryId: string) => void;
  centerForce?: number;
  repulsion?: number;
  linkForce?: number;
  linkDistance?: number;
  showLabels?: boolean;
  scaleByConnections?: boolean;
  configPanel?: React.ReactNode;
}

interface ForceNode {
  id: string;
  title: string | null;
  summary: string | null;
  entry_type: string | null;
  visibility: string;
  depth: number;
  isSeed: boolean;
  connections: number;
  x?: number;
  y?: number;
}

interface ForceLink {
  source: string | ForceNode;
  target: string | ForceNode;
  refs: GraphEdge["refs"];
}

export default function GraphView({
  data,
  onRecenter,
  centerForce = 0.3,
  repulsion = -350,
  linkForce = 0.3,
  linkDistance = 60,
  showLabels = true,
  scaleByConnections = true,
  configPanel,
}: GraphViewProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fgRef = useRef<any>(undefined);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [hoverNode, setHoverNode] = useState<ForceNode | null>(null);

  // Ref for showLabels so the canvas callback stays stable
  const showLabelsRef = useRef(showLabels);
  showLabelsRef.current = showLabels;
  const scaleRef = useRef(scaleByConnections);
  scaleRef.current = scaleByConnections;

  // Visual-only toggles: update refs then nudge the simulation to repaint
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    // A tiny alpha bump repaints without disrupting layout
    fg.d3ReheatSimulation?.();
  }, [showLabels, scaleByConnections]);

  // Track theme color — updates on dark/light mode change
  const nodeColorRef = useRef(getThemeColor());
  useEffect(() => {
    nodeColorRef.current = getThemeColor();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => { nodeColorRef.current = getThemeColor(); };
    mq.addEventListener("change", handler);
    // Also observe class changes on <html> for manual theme toggles
    const observer = new MutationObserver(handler);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => { mq.removeEventListener("change", handler); observer.disconnect(); };
  }, []);

  // Resize observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width: Math.max(width, 200), height: Math.max(height, 300) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Apply forces to the simulation. Called both from the ref callback
  // (first mount) and from the effect (slider changes).
  const applyForces = useCallback((fg: any) => {
    if (!fg?.d3Force) return;
    if (!fg.d3Force("x")) fg.d3Force("x", forceX(0));
    if (!fg.d3Force("y")) fg.d3Force("y", forceY(0));
    const charge = fg.d3Force("charge");
    if (charge?.strength) charge.strength(repulsion);
    const link = fg.d3Force("link");
    if (link?.distance) link.distance(linkDistance);
    if (link?.strength) link.strength(linkForce);
    const fx = fg.d3Force("x");
    const fy = fg.d3Force("y");
    if (fx?.strength) fx.strength(centerForce);
    if (fy?.strength) fy.strength(centerForce);
  }, [centerForce, repulsion, linkForce, linkDistance]);

  // Apply forces once the graph instance is available
  const hasInitialForces = useRef(false);
  useEffect(() => {
    const fg = fgRef.current;
    if (fg && !hasInitialForces.current) {
      applyForces(fg);
      hasInitialForces.current = true;
    }
  });

  // On slider changes, re-apply forces and reheat
  const hasAppliedForces = useRef(false);
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg?.d3Force) return;
    applyForces(fg);
    if (hasAppliedForces.current) {
      fg.d3ReheatSimulation?.();
    } else {
      hasAppliedForces.current = true;
    }
  }, [applyForces]);

  // Memoize graph data so slider changes (repulsion, linkDistance) don't
  // create new object references and cause react-force-graph-2d to reset.
  const graphData = useMemo(() => {
    const seedSet = new Set(data.seed_ids);
    // Count connections per node
    const connCount: Record<string, number> = {};
    for (const e of data.edges) {
      connCount[e.source] = (connCount[e.source] ?? 0) + 1;
      connCount[e.target] = (connCount[e.target] ?? 0) + 1;
    }
    return {
      nodes: data.nodes.map((n): ForceNode => ({
        id: n.id,
        title: n.title,
        summary: n.summary,
        entry_type: n.entry_type,
        visibility: n.visibility,
        depth: n.depth,
        isSeed: seedSet.has(n.id),
        connections: connCount[n.id] ?? 0,
      })),
      links: data.edges.map((e): ForceLink => ({
        source: e.source,
        target: e.target,
        refs: e.refs,
      })),
    };
  }, [data]);

  // Only show seed rings when graph has both seeds and non-seeds
  const hasNonSeeds = useMemo(
    () => data.nodes.some((n) => !data.seed_ids.includes(n.id)),
    [data],
  );
  const hasNonSeedsRef = useRef(hasNonSeeds);
  hasNonSeedsRef.current = hasNonSeeds;

  const nodeCanvasObject = useCallback(
    (node: ForceNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const x = node.x ?? 0;
      const y = node.y ?? 0;
      // Scale by connections: min 5, grows with sqrt of connections
      const size = scaleRef.current
        ? Math.max(5, 3 + Math.sqrt(node.connections) * 2.5)
        : 5;

      const color = nodeColorRef.current;
      const alpha = node.visibility === "private" ? PRIVATE_OPACITY : 1;

      ctx.globalAlpha = alpha;

      // Seed ring — only when graph has expanded (non-seed) nodes
      if (node.isSeed && hasNonSeedsRef.current) {
        ctx.beginPath();
        ctx.arc(x, y, size + 1.5, 0, 2 * Math.PI);
        ctx.strokeStyle = SEED_RING_COLOR;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // Node body
      ctx.beginPath();
      ctx.arc(x, y, size, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();


      // Label
      if (showLabelsRef.current) {
        const label = node.title || "Untitled";
        const fontSize = Math.max(10 / globalScale, 2);
        ctx.font = `500 ${fontSize}px system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillStyle = color;
        ctx.fillText(label, x, y + size + 3);
      }

      ctx.globalAlpha = 1;
    },
    [], // stable — reads showLabels from ref
  );

  const linkCanvasObject = useCallback(
    (link: ForceLink, ctx: CanvasRenderingContext2D, _globalScale: number) => {
      const source = link.source as ForceNode;
      const target = link.target as ForceNode;
      if (!source.x || !source.y || !target.x || !target.y) return;

      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.strokeStyle = "rgba(156, 163, 175, 0.45)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Arrow
      const hasForward = link.refs.some((r) => r.direction === "forward");
      const hasReverse = link.refs.some((r) => r.direction === "reverse");

      const drawArrow = (fromX: number, fromY: number, toX: number, toY: number) => {
        const dx = toX - fromX;
        const dy = toY - fromY;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len === 0) return;
        const ux = dx / len;
        const uy = dy / len;
        const tipX = toX - ux * 7;
        const tipY = toY - uy * 7;
        const arrowLen = 6;
        const arrowWidth = 3;

        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(tipX - ux * arrowLen + uy * arrowWidth, tipY - uy * arrowLen - ux * arrowWidth);
        ctx.lineTo(tipX - ux * arrowLen - uy * arrowWidth, tipY - uy * arrowLen + ux * arrowWidth);
        ctx.closePath();
        ctx.fillStyle = "rgba(156, 163, 175, 0.55)";
        ctx.fill();
      };

      if (hasForward) drawArrow(source.x, source.y, target.x, target.y);
      if (hasReverse) drawArrow(target.x, target.y, source.x, source.y);
    },
    [],
  );

  const handleNodeClick = useCallback(
    (node: ForceNode) => {
      router.push(`/entries/${node.id}`);
    },
    [router],
  );

  const handleNodeDoubleClick = useCallback(
    (node: ForceNode) => {
      onRecenter?.(node.id);
    },
    [onRecenter],
  );

  return (
    <div ref={containerRef} className="relative h-[500px] w-full rounded-xl border border-border bg-card">
      {data.truncated && (
        <div className="absolute left-3 top-3 z-10 rounded-md bg-amber-50 px-2.5 py-1 text-xs text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
          Graph capped at {data.nodes.length} nodes. Narrow filters or reduce depth.
        </div>
      )}
      {configPanel && (
        <div className="absolute right-3 top-3 z-10">
          {configPanel}
        </div>
      )}
      <ForceGraph2D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeCanvasObject={nodeCanvasObject as any}
        nodePointerAreaPaint={((node: any, color: string, ctx: CanvasRenderingContext2D) => {
          const size = (node as ForceNode).isSeed ? 8 : 6;
          ctx.beginPath();
          ctx.arc(node.x ?? 0, node.y ?? 0, size, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
        }) as any}
        linkCanvasObject={linkCanvasObject as any}
        onNodeClick={((node: any) => handleNodeClick(node as ForceNode)) as any}
        onNodeRightClick={((node: any) => handleNodeDoubleClick(node as ForceNode)) as any}
        onNodeHover={((node: any) => setHoverNode(node as ForceNode | null)) as any}
        cooldownTicks={200}
        enableZoomInteraction={true}
        enablePanInteraction={true}
        enableNodeDrag={true}
      />
      {/* Hover tooltip */}
      {hoverNode && (
        <div className="pointer-events-none absolute bottom-3 left-3 z-10 max-w-xs rounded-lg border border-border bg-card p-3 shadow-md">
          <p className="text-sm font-semibold text-foreground">
            {hoverNode.title || "Untitled"}
          </p>
          {hoverNode.entry_type && (
            <span className="text-xs text-muted-foreground">{hoverNode.entry_type}</span>
          )}
          {hoverNode.summary && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              {hoverNode.summary}
            </p>
          )}
          {hoverNode.visibility === "private" && (
            <span className="text-xs text-amber-600">private</span>
          )}
        </div>
      )}
      {/* Accessibility */}
      <span className="sr-only" role="img" aria-label={`Graph showing ${data.nodes.length} entries and ${data.edges.length} connections`} />
    </div>
  );
}
