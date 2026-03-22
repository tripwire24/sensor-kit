"use client";

import { ReactNode } from "react";
import { SensorStatus } from "../hooks/useSensors";

interface SensorCardProps {
  title: string;
  icon: string;
  status: SensorStatus | "always";
  children: ReactNode;
  onStart?: () => void;
  accentColor?: string;
}

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  idle: { label: "Ready", color: "text-slate-400", dot: "bg-slate-500" },
  active: { label: "Live", color: "text-emerald-400", dot: "bg-emerald-400" },
  error: { label: "Error", color: "text-red-400", dot: "bg-red-400" },
  denied: { label: "Denied", color: "text-amber-400", dot: "bg-amber-400" },
  unsupported: { label: "Unsupported", color: "text-slate-500", dot: "bg-slate-600" },
  always: { label: "Live", color: "text-emerald-400", dot: "bg-emerald-400" },
};

export default function SensorCard({ title, icon, status, children, onStart, accentColor = "#60a5fa" }: SensorCardProps) {
  const cfg = statusConfig[status] ?? statusConfig.idle;

  return (
    <div
      className={`sensor-card rounded-2xl p-5 fade-in ${status === "active" || status === "always" ? "sensor-active" : ""} ${status === "error" || status === "denied" ? "sensor-error" : ""}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: `${accentColor}22`, border: `1px solid ${accentColor}44` }}
          >
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-sm">{title}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${status === "active" || status === "always" ? "pulse-ring" : ""}`}
              />
              <span className={`text-xs ${cfg.color}`}>{cfg.label}</span>
            </div>
          </div>
        </div>

        {onStart && status === "idle" && (
          <button
            onClick={onStart}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105 active:scale-95"
            style={{ background: `${accentColor}22`, color: accentColor, border: `1px solid ${accentColor}44` }}
          >
            Enable
          </button>
        )}
      </div>

      {/* Content */}
      <div className="space-y-2">{children}</div>
    </div>
  );
}
