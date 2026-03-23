"use client";

import { useMemo } from "react";

interface ActivityChartProps {
  /** Array of { month: "2026-01", entries: N, issues: N, edits: N } */
  data: { month: string; entries: number; issues: number; edits: number }[];
}

const LEGEND = [
  { key: "entries", label: "Entries", color: "var(--primary)" },
  { key: "issues", label: "Issues", color: "oklch(0.65 0.2 145)" },
  { key: "edits", label: "Changes", color: "oklch(0.65 0.15 290)" },
] as const;

export default function ActivityChart({ data }: ActivityChartProps) {
  const { bars, maxVal, months } = useMemo(() => {
    const maxVal = Math.max(
      ...data.map((d) => d.entries + d.issues + d.edits),
      1
    );
    return { bars: data, maxVal, months: data.length };
  }, [data]);

  if (months === 0) return null;

  const chartH = 120;
  const barGroupWidth = Math.min(48, Math.max(20, 600 / months));
  const barW = Math.max(4, (barGroupWidth - 6) / 3);
  const gap = 1;
  const chartW = months * barGroupWidth;
  const padTop = 8;
  const padBottom = 28;
  const padLeft = 28;
  const padRight = 8;
  const totalW = chartW + padLeft + padRight;
  const totalH = chartH + padTop + padBottom;

  // Y-axis ticks
  const yTicks = useMemo(() => {
    const step = Math.max(1, Math.ceil(maxVal / 4));
    const ticks = [];
    for (let v = 0; v <= maxVal; v += step) ticks.push(v);
    if (ticks[ticks.length - 1] < maxVal) ticks.push(maxVal);
    return ticks;
  }, [maxVal]);

  return (
    <div>
      {/* Legend */}
      <div className="flex items-center gap-4 mb-2">
        {LEGEND.map((l) => (
          <div key={l.key} className="flex items-center gap-1.5">
            <div
              className="h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: l.color }}
            />
            <span className="text-[11px] text-muted-foreground">{l.label}</span>
          </div>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${totalW} ${totalH}`}
        className="w-full"
        style={{ maxHeight: `${totalH}px` }}
        role="img"
        aria-label="Activity over time"
      >
        {/* Y-axis gridlines */}
        {yTicks.map((v) => {
          const y = padTop + chartH - (v / maxVal) * chartH;
          return (
            <g key={`y-${v}`}>
              <line
                x1={padLeft}
                y1={y}
                x2={padLeft + chartW}
                y2={y}
                stroke="var(--border)"
                strokeWidth={0.5}
                opacity={0.5}
              />
              <text
                x={padLeft - 4}
                y={y}
                textAnchor="end"
                dominantBaseline="central"
                fill="var(--muted-foreground)"
                fontSize={8}
              >
                {v}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {bars.map((d, i) => {
          const x0 = padLeft + i * barGroupWidth + (barGroupWidth - (barW * 3 + gap * 2)) / 2;
          const values = [d.entries, d.issues, d.edits];
          return (
            <g key={d.month}>
              {values.map((val, j) => {
                const h = (val / maxVal) * chartH;
                const x = x0 + j * (barW + gap);
                const y = padTop + chartH - h;
                return (
                  <rect
                    key={j}
                    x={x}
                    y={y}
                    width={barW}
                    height={Math.max(h, 0)}
                    rx={1}
                    fill={LEGEND[j].color}
                    opacity={val > 0 ? 0.85 : 0}
                  >
                    <title>{`${LEGEND[j].label}: ${val}`}</title>
                  </rect>
                );
              })}

              {/* Month label */}
              <text
                x={x0 + (barW * 3 + gap * 2) / 2}
                y={padTop + chartH + 14}
                textAnchor="middle"
                fill="var(--muted-foreground)"
                fontSize={8}
              >
                {formatMonth(d.month)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function formatMonth(m: string): string {
  // "2026-03" -> "Mar"
  const [, month] = m.split("-");
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return names[parseInt(month) - 1] || m;
}
