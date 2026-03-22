"use client";

import { useEffect } from "react";
import SensorCard from "./SensorCard";
import DataRow from "./DataRow";
import { useBattery } from "../hooks/useSensors";

function formatTime(seconds: number | null) {
  if (seconds === null || !isFinite(seconds)) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function BatterySensor() {
  const { data, status, start } = useBattery();

  useEffect(() => {
    start();
  }, [start]);

  const level = data.level !== null ? Math.round(data.level * 100) : null;
  const levelColor =
    level === null ? "text-slate-400"
    : level > 60 ? "text-emerald-400"
    : level > 20 ? "text-amber-400"
    : "text-red-400";

  const barColor =
    level === null ? "bg-slate-600"
    : level > 60 ? "bg-emerald-400"
    : level > 20 ? "bg-amber-400"
    : "bg-red-400";

  return (
    <SensorCard title="Battery" icon="🔋" status={status} accentColor="#10b981">
      {/* Battery visual */}
      <div className="flex items-center gap-3 my-3">
        <div className="relative flex-1 h-8 rounded-lg border-2 border-white/10 overflow-hidden bg-white/5">
          <div
            className={`absolute left-0 top-0 bottom-0 transition-all duration-1000 rounded-md ${barColor} opacity-80`}
            style={{ width: level !== null ? `${level}%` : "0%" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-sm font-bold ${levelColor}`}>
              {level !== null ? `${level}%` : "—"}
            </span>
          </div>
        </div>
        <div className="w-2 h-4 rounded-r border-2 border-white/10 bg-white/10" />
        {data.charging && (
          <span className="text-lg">⚡</span>
        )}
      </div>

      <DataRow label="Level" value={level} unit="%" color={levelColor} />
      <DataRow
        label="Status"
        value={data.charging === null ? null : data.charging ? "Charging" : "Discharging"}
        color={data.charging ? "text-emerald-400" : "text-amber-400"}
      />
      <DataRow label="Time to full" value={formatTime(data.chargingTime)} color="text-emerald-400" />
      <DataRow label="Time remaining" value={formatTime(data.dischargingTime)} color="text-amber-400" />
    </SensorCard>
  );
}
