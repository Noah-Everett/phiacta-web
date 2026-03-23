"use client";

import { useMemo } from "react";

interface RadarAxis {
  label: string;
  value: number;
  displayValue?: string | number;
}

interface RadarChartProps {
  axes: RadarAxis[];
  size?: number;
}

const RING_COUNT = 4;

function polarToCartesian(
  cx: number, cy: number, axisIndex: number, totalAxes: number, radius: number,
): { x: number; y: number } {
  const angle = -Math.PI / 2 + (2 * Math.PI * axisIndex) / totalAxes;
  return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
}

function toPointsString(points: { x: number; y: number }[]): string {
  return points.map((p) => `${p.x},${p.y}`).join(" ");
}

export default function RadarChart({ axes, size = 180 }: RadarChartProps) {
  if (axes.length < 3) return null;

  const n = axes.length;
  const padding = 52;
  const viewSize = size + padding * 2;
  const cx = viewSize / 2;
  const cy = viewSize / 2;
  const radius = size * 0.38;

  const gradientId = useMemo(
    () => `radar-fill-${Math.random().toString(36).slice(2, 8)}`,
    [],
  );

  const rings = useMemo(() => {
    return Array.from({ length: RING_COUNT }, (_, ringIdx) => {
      const r = (radius * (ringIdx + 1)) / RING_COUNT;
      const pts = Array.from({ length: n }, (_, i) => polarToCartesian(cx, cy, i, n, r));
      return toPointsString(pts);
    });
  }, [cx, cy, n, radius]);

  const spokes = useMemo(() => {
    return Array.from({ length: n }, (_, i) => polarToCartesian(cx, cy, i, n, radius));
  }, [cx, cy, n, radius]);

  const dataPoints = useMemo(() => {
    return axes.map((axis, i) => {
      const r = radius * Math.max(0.05, Math.min(axis.value, 1));
      return polarToCartesian(cx, cy, i, n, r);
    });
  }, [axes, cx, cy, n, radius]);

  const dataPolygon = toPointsString(dataPoints);

  const labelDistance = radius + 18;
  const labels = useMemo(() => {
    return axes.map((axis, i) => {
      const pos = polarToCartesian(cx, cy, i, n, labelDistance);
      const dx = pos.x - cx;
      let anchor: "start" | "middle" | "end" = "middle";
      if (dx > 1) anchor = "start";
      else if (dx < -1) anchor = "end";
      const nudgeX = dx > 1 ? 4 : dx < -1 ? -4 : 0;
      const dy = pos.y - cy;
      const nudgeY = dy > 1 ? 6 : dy < -1 ? -4 : 0;
      return { x: pos.x + nudgeX, y: pos.y + nudgeY, anchor, label: axis.label, displayValue: axis.displayValue };
    });
  }, [axes, cx, cy, n, labelDistance]);

  return (
    <svg
      viewBox={`0 0 ${viewSize} ${viewSize}`}
      className="mx-auto w-full"
      style={{ maxWidth: `${viewSize}px` }}
      role="img"
      aria-label="Radar chart showing activity distribution"
    >
      <defs>
        <radialGradient id={gradientId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.28} />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.06} />
        </radialGradient>
      </defs>

      {/* Grid rings */}
      {rings.map((points, i) => (
        <polygon
          key={`ring-${i}`}
          points={points}
          fill="none"
          stroke="var(--border)"
          strokeWidth={i === RING_COUNT - 1 ? 0.75 : 0.5}
          opacity={i === RING_COUNT - 1 ? 0.7 : 0.35}
        />
      ))}

      {/* Spokes */}
      {spokes.map((p, i) => (
        <line
          key={`spoke-${i}`}
          x1={cx} y1={cy} x2={p.x} y2={p.y}
          stroke="var(--border)"
          strokeWidth={0.5}
          opacity={0.35}
        />
      ))}

      {/* Data polygon */}
      <polygon
        points={dataPolygon}
        fill={`url(#${gradientId})`}
        stroke="var(--primary)"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />

      {/* Dots */}
      {dataPoints.map((p, i) => (
        <circle
          key={`dot-${i}`}
          cx={p.x} cy={p.y} r={2.5}
          fill="var(--primary)"
        />
      ))}

      {/* Labels — name on first line, value on second */}
      {labels.map((l, i) => (
        <text
          key={`label-${i}`}
          x={l.x}
          y={l.y}
          textAnchor={l.anchor}
          dominantBaseline="central"
          fill="var(--muted-foreground)"
          fontSize={9}
          fontWeight={500}
          letterSpacing="0.02em"
        >
          {l.label}
          {l.displayValue !== undefined && (
            <tspan
              x={l.x}
              dy="1.15em"
              fill="var(--foreground)"
              fontSize={11}
              fontWeight={600}
            >
              {l.displayValue}
            </tspan>
          )}
        </text>
      ))}
    </svg>
  );
}
