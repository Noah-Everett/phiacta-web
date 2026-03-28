"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { useState } from "react";

export interface GraphConfig {
  depth: number;
  direction: string;
  limit: number;
  showLabels: boolean;
  scaleByConnections: boolean;
  centerForce: number;
  repulsion: number;
  linkForce: number;
  linkDistance: number;
}

const DEPTH_OPTIONS = [
  { value: "0", label: "0 — Seeds only" },
  { value: "1", label: "1 — Direct" },
  { value: "2", label: "2 — Two hops" },
  { value: "3", label: "3 — Three hops" },
  { value: "4", label: "4" },
  { value: "5", label: "5 — Max" },
];

const DIRECTION_OPTIONS = [
  { value: "both", label: "Both" },
  { value: "outgoing", label: "Outgoing" },
  { value: "incoming", label: "Incoming" },
];

interface GraphConfigPanelProps {
  config: GraphConfig;
  onChange: (config: GraphConfig) => void;
}

export default function GraphConfigPanel({ config, onChange }: GraphConfigPanelProps) {
  const [open, setOpen] = useState(false);

  const update = (partial: Partial<GraphConfig>) => {
    onChange({ ...config, ...partial });
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="h-7 gap-1.5 text-xs"
        onClick={() => setOpen(!open)}
      >
        <Settings2 className="h-3.5 w-3.5" />
        Graph settings
      </Button>

      {open && (
        <div className="absolute right-0 top-9 z-20 w-64 rounded-lg border border-border bg-card p-3 shadow-lg">
          <div className="space-y-3">
            {/* Depth */}
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Depth</label>
              <Select value={String(config.depth)} onValueChange={(v) => update({ depth: Number(v) })}>
                <SelectTrigger size="sm" className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  {DEPTH_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Direction */}
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Direction</label>
              <Select value={config.direction} onValueChange={(v) => update({ direction: v })}>
                <SelectTrigger size="sm" className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  {DIRECTION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Center force */}
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Center force: {Math.round(config.centerForce * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={config.centerForce}
                onChange={(e) => update({ centerForce: Number(e.target.value) })}
                className="w-full accent-primary"
              />
            </div>

            {/* Repel force */}
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Repel force: {-config.repulsion}
              </label>
              <input
                type="range"
                min="-500"
                max="0"
                step="10"
                value={config.repulsion}
                onChange={(e) => update({ repulsion: Number(e.target.value) })}
                className="w-full accent-primary"
              />
            </div>

            {/* Link force */}
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Link force: {Math.round(config.linkForce * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={config.linkForce}
                onChange={(e) => update({ linkForce: Number(e.target.value) })}
                className="w-full accent-primary"
              />
            </div>

            {/* Link distance */}
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Link distance: {config.linkDistance}
              </label>
              <input
                type="range"
                min="10"
                max="300"
                step="10"
                value={config.linkDistance}
                onChange={(e) => update({ linkDistance: Number(e.target.value) })}
                className="w-full accent-primary"
              />
            </div>

            {/* Toggles */}
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={config.showLabels}
                onChange={(e) => update({ showLabels: e.target.checked })}
                className="accent-primary"
              />
              Show labels
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={config.scaleByConnections}
                onChange={(e) => update({ scaleByConnections: e.target.checked })}
                className="accent-primary"
              />
              Scale nodes by connections
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
