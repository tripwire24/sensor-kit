"use client";

import { useState, useEffect } from "react";
import SensorCard from "./SensorCard";
import DataRow from "./DataRow";

interface StorageInfo {
  quota: number | null;
  usage: number | null;
  caches: number | null;
  indexedDB: number | null;
  serviceWorkers: number | null;
  persistent: boolean | null;
}

function toMB(bytes: number | null) {
  if (bytes === null) return null;
  if (bytes > 1073741824) return +( bytes / 1073741824).toFixed(2);
  return +(bytes / 1048576).toFixed(1);
}
function toUnit(bytes: number | null): string {
  if (bytes === null) return "";
  return bytes > 1073741824 ? "GB" : "MB";
}

export default function StorageSensor() {
  const [info, setInfo] = useState<StorageInfo>({
    quota: null, usage: null, caches: null,
    indexedDB: null, serviceWorkers: null, persistent: null,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const est = await navigator.storage.estimate();
        const detail = (est as StorageEstimate & { usageDetails?: Record<string, number> }).usageDetails;

        const persistent = await navigator.storage.persisted().catch(() => null);

        setInfo({
          quota: est.quota ?? null,
          usage: est.usage ?? null,
          caches: detail?.caches ?? null,
          indexedDB: detail?.indexedDB ?? null,
          serviceWorkers: detail?.serviceWorkerRegistrations ?? null,
          persistent,
        });
      } catch { /* not supported */ }
    };

    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  const usagePct = info.quota && info.usage ? (info.usage / info.quota) * 100 : 0;
  const barColor = usagePct > 80 ? "#ef4444" : usagePct > 50 ? "#f59e0b" : "#22c55e";

  return (
    <SensorCard title="Storage" icon="💾" status="always" accentColor="#22c55e">
      {/* Usage donut */}
      <div className="flex justify-center my-3">
        <div className="relative w-20 h-20">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
            <circle
              cx="50" cy="50" r="38" fill="none"
              stroke={barColor}
              strokeWidth="12"
              strokeDasharray={`${usagePct * 2.39} 239`}
              strokeLinecap="round"
              style={{ transition: "stroke-dasharray 0.5s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs font-bold" style={{ color: barColor }}>
              {usagePct.toFixed(1)}%
            </span>
            <span className="text-xs text-slate-600">used</span>
          </div>
        </div>
      </div>

      <DataRow
        label="Used"
        value={toMB(info.usage)}
        unit={toUnit(info.usage)}
        color="text-emerald-400"
      />
      <DataRow
        label="Quota"
        value={toMB(info.quota)}
        unit={toUnit(info.quota)}
        color="text-green-400"
      />
      <DataRow
        label="Cache storage"
        value={toMB(info.caches)}
        unit={toUnit(info.caches)}
        color="text-teal-400"
      />
      <DataRow
        label="IndexedDB"
        value={toMB(info.indexedDB)}
        unit={toUnit(info.indexedDB)}
        color="text-cyan-400"
      />
      <DataRow
        label="Persistent"
        value={info.persistent === null ? null : info.persistent ? "Yes" : "No"}
        color={info.persistent ? "text-emerald-400" : "text-amber-400"}
      />
    </SensorCard>
  );
}
