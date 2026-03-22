"use client";

import { useState, useEffect } from "react";
import SensorCard from "./SensorCard";
import DataRow from "./DataRow";

export default function ClockSensor() {
  const [now, setNow] = useState<Date | null>(null);
  const [perf, setPerf] = useState<number | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => {
      setNow(new Date());
      setPerf(performance.now());
    }, 100);
    return () => clearInterval(id);
  }, []);

  if (!now) return null;

  const timeStr = now.toLocaleTimeString(undefined, { hour12: false });
  const dateStr = now.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const ms = now.getMilliseconds();

  return (
    <SensorCard title="Clock & Timer" icon="⏱️" status="always" accentColor="#06b6d4">
      {/* Animated clock face */}
      <div className="flex justify-center my-3">
        <div className="relative w-20 h-20">
          <svg viewBox="0 0 80 80" className="w-full h-full">
            <circle cx="40" cy="40" r="38" fill="none" stroke="rgba(6,182,212,0.15)" strokeWidth="2" />
            {/* Hour marks */}
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 30 - 90) * Math.PI / 180;
              const x1 = 40 + 32 * Math.cos(angle);
              const y1 = 40 + 32 * Math.sin(angle);
              const x2 = 40 + 36 * Math.cos(angle);
              const y2 = 40 + 36 * Math.sin(angle);
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(6,182,212,0.4)" strokeWidth="1.5" />;
            })}
            {/* Hour hand */}
            {(() => {
              const h = ((now.getHours() % 12) + now.getMinutes() / 60) * 30 - 90;
              const rad = h * Math.PI / 180;
              return <line x1="40" y1="40" x2={40 + 18 * Math.cos(rad)} y2={40 + 18 * Math.sin(rad)} stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />;
            })()}
            {/* Minute hand */}
            {(() => {
              const m = (now.getMinutes() + now.getSeconds() / 60) * 6 - 90;
              const rad = m * Math.PI / 180;
              return <line x1="40" y1="40" x2={40 + 26 * Math.cos(rad)} y2={40 + 26 * Math.sin(rad)} stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" />;
            })()}
            {/* Second hand */}
            {(() => {
              const s = (now.getSeconds() + now.getMilliseconds() / 1000) * 6 - 90;
              const rad = s * Math.PI / 180;
              return <line x1="40" y1="40" x2={40 + 30 * Math.cos(rad)} y2={40 + 30 * Math.sin(rad)} stroke="#f87171" strokeWidth="1" strokeLinecap="round" />;
            })()}
            <circle cx="40" cy="40" r="2" fill="#06b6d4" />
          </svg>
        </div>
      </div>

      <div className="text-center mb-3">
        <div className="text-2xl font-mono font-bold text-cyan-400">{timeStr}</div>
        <div className="text-xs text-slate-500 mt-1">{dateStr}</div>
      </div>

      {/* Millisecond bar */}
      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-cyan-400 rounded-full transition-none"
          style={{ width: `${ms / 10}%` }}
        />
      </div>

      <DataRow label="Milliseconds" value={ms} unit="ms" color="text-cyan-400" />
      <DataRow label="Performance" value={perf !== null ? (perf / 1000).toFixed(3) : null} unit="s" color="text-teal-400" />
      <DataRow label="Timestamp" value={now.getTime()} unit="ms" color="text-slate-400" />
    </SensorCard>
  );
}
