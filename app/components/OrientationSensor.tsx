"use client";

import { useEffect } from "react";
import SensorCard from "./SensorCard";
import DataRow from "./DataRow";
import { useOrientation } from "../hooks/useSensors";

export default function OrientationSensor() {
  const { data, status, start } = useOrientation();

  useEffect(() => {
    const cleanup = start();
    return cleanup;
  }, [start]);

  // Compass needle rotation based on alpha
  const compassAngle = data.alpha ?? 0;

  const compassDir = (angle: number) => {
    const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return dirs[Math.round(angle / 45) % 8];
  };

  return (
    <SensorCard title="Orientation / Compass" icon="🧭" status={status} onStart={start} accentColor="#f59e0b">
      {/* Compass visual */}
      <div className="flex justify-center my-3">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-2 border-amber-400/30 bg-amber-400/5" />
          {/* Cardinal directions */}
          {["N","E","S","W"].map((d, i) => {
            const angle = i * 90;
            const rad = (angle - 90) * Math.PI / 180;
            const x = 50 + 36 * Math.cos(rad);
            const y = 50 + 36 * Math.sin(rad);
            return (
              <span
                key={d}
                className="absolute text-xs font-bold text-amber-400/60"
                style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
              >
                {d}
              </span>
            );
          })}
          {/* Needle */}
          <div
            className="absolute inset-0 flex items-center justify-center transition-transform duration-200"
            style={{ transform: `rotate(${compassAngle}deg)` }}
          >
            <div className="relative h-14 w-1">
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-red-500 rounded-t-full" />
              <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-slate-500 rounded-b-full" />
            </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
          </div>
        </div>
      </div>

      <DataRow label="Heading (α)" value={data.alpha} unit="°" color="text-amber-400" />
      <DataRow label="Tilt front/back (β)" value={data.beta} unit="°" color="text-orange-400" />
      <DataRow label="Tilt left/right (γ)" value={data.gamma} unit="°" color="text-yellow-400" />
      <DataRow label="Direction" value={data.alpha !== null ? compassDir(data.alpha) : null} color="text-amber-300" />
      <DataRow label="Absolute" value={data.absolute ? "Yes" : "No"} />
    </SensorCard>
  );
}
