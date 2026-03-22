"use client";

import { useState, useEffect } from "react";
import SensorCard from "./SensorCard";
import DataRow from "./DataRow";
import { SensorStatus } from "../hooks/useSensors";

export default function AmbientLightSensorCard() {
  const [lux, setLux] = useState<number | null>(null);
  const [status, setStatus] = useState<SensorStatus>("idle");
  const [history, setHistory] = useState<number[]>(Array(20).fill(0));

  useEffect(() => {
    const ALS = (window as unknown as Record<string, unknown>)["AmbientLightSensor"] as (new (opts: object) => {
      illuminance: number;
      start: () => void;
      stop: () => void;
      addEventListener: (e: string, cb: () => void) => void;
    }) | undefined;

    if (!ALS) {
      setStatus("unsupported");
      return;
    }

    try {
      const sensor = new ALS({ frequency: 2 });
      sensor.addEventListener("reading", () => {
        const val = +sensor.illuminance.toFixed(1);
        setLux(val);
        setStatus("active");
        setHistory(prev => [...prev.slice(1), Math.min(val, 100000)]);
      });
      sensor.addEventListener("error", () => setStatus("error"));
      sensor.start();
      return () => sensor.stop();
    } catch {
      setStatus("unsupported");
    }
  }, []);

  const luxLabel = (v: number | null) => {
    if (v === null) return "—";
    if (v < 1) return "Pitch black";
    if (v < 50) return "Very dark";
    if (v < 200) return "Dim";
    if (v < 1000) return "Indoor";
    if (v < 10000) return "Bright indoor / overcast";
    if (v < 50000) return "Cloudy outside";
    return "Direct sunlight";
  };

  const luxColor = (v: number | null) => {
    if (!v) return "#475569";
    if (v < 50) return "#6366f1";
    if (v < 500) return "#f59e0b";
    return "#fbbf24";
  };

  const maxH = Math.max(...history, 1);

  return (
    <SensorCard title="Ambient Light" icon="💡" status={status} accentColor="#fbbf24">
      {/* Sun visual */}
      <div className="flex justify-center my-3">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500"
          style={{
            background: `radial-gradient(circle, ${luxColor(lux)}40, transparent)`,
            border: `2px solid ${luxColor(lux)}60`,
            boxShadow: lux && lux > 100 ? `0 0 ${Math.min(40, lux / 1000 * 40)}px ${luxColor(lux)}40` : "none",
          }}
        >
          <span className="text-2xl">
            {lux === null ? "💡" : lux < 50 ? "🌑" : lux < 500 ? "🌤" : "☀️"}
          </span>
        </div>
      </div>

      {/* Lux history sparkline */}
      <div className="flex items-end gap-px h-8 my-2 bg-black/20 rounded-lg px-1">
        {history.map((v, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm transition-none"
            style={{
              height: `${(v / maxH) * 100}%`,
              background: luxColor(v),
              opacity: 0.5 + (i / history.length) * 0.5,
            }}
          />
        ))}
      </div>

      <DataRow label="Illuminance" value={lux} unit="lux" color="text-yellow-400" />
      <DataRow label="Condition" value={luxLabel(lux)} color="text-amber-300" />
    </SensorCard>
  );
}
