"use client";

import SensorCard from "./SensorCard";
import DataRow from "./DataRow";
import { useNetwork } from "../hooks/useSensors";

const speedLabels: Record<string, string> = {
  "slow-2g": "Slow 2G",
  "2g": "2G",
  "3g": "3G",
  "4g": "4G / LTE",
};

export default function NetworkSensor() {
  const data = useNetwork();

  return (
    <SensorCard title="Network" icon="📶" status="always" accentColor="#8b5cf6">
      {/* Signal bars visual */}
      <div className="flex items-end gap-1 justify-center my-3 h-10">
        {[1, 2, 3, 4].map((bar) => {
          const types = ["slow-2g", "2g", "3g", "4g"];
          const currentIdx = data.effectiveType ? types.indexOf(data.effectiveType) : -1;
          const active = data.online && currentIdx >= bar - 1;
          const height = bar * 25;
          return (
            <div
              key={bar}
              className={`w-4 rounded-sm transition-all duration-300 ${active ? "bg-violet-400" : "bg-white/10"}`}
              style={{ height: `${height}%` }}
            />
          );
        })}
      </div>

      <DataRow
        label="Status"
        value={data.online ? "Online" : "Offline"}
        color={data.online ? "text-emerald-400" : "text-red-400"}
      />
      <DataRow
        label="Type"
        value={data.effectiveType ? (speedLabels[data.effectiveType] ?? data.effectiveType) : null}
        color="text-violet-400"
      />
      <DataRow label="Downlink" value={data.downlink} unit="Mbps" color="text-purple-400" />
      <DataRow label="Latency (RTT)" value={data.rtt} unit="ms" color="text-indigo-400" />
      <DataRow
        label="Data saver"
        value={data.saveData === null ? null : data.saveData ? "On" : "Off"}
        color={data.saveData ? "text-amber-400" : "text-slate-400"}
      />
    </SensorCard>
  );
}
