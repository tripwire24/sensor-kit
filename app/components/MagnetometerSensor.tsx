"use client";

import { useState, useEffect } from "react";
import SensorCard from "./SensorCard";
import DataRow from "./DataRow";
import { SensorStatus } from "../hooks/useSensors";

interface Vec3 { x: number | null; y: number | null; z: number | null; }

export default function MagnetometerSensor() {
  const [mag, setMag] = useState<Vec3>({ x: null, y: null, z: null });
  const [gravity, setGravity] = useState<Vec3>({ x: null, y: null, z: null });
  const [linear, setLinear] = useState<Vec3>({ x: null, y: null, z: null });
  const [status, setStatus] = useState<SensorStatus>("idle");

  useEffect(() => {
    const sensors: { stop: () => void }[] = [];

    try {
      // Magnetometer
      const Mag = (window as unknown as Record<string, unknown>)["Magnetometer"] as (new (opts: object) => { x: number; y: number; z: number; start: () => void; stop: () => void; addEventListener: (e: string, cb: () => void) => void });
      if (Mag) {
        const s = new Mag({ frequency: 10 });
        s.addEventListener("reading", () => {
          setMag({ x: +s.x.toFixed(2), y: +s.y.toFixed(2), z: +s.z.toFixed(2) });
          setStatus("active");
        });
        s.start();
        sensors.push({ stop: () => s.stop() });
      }
    } catch { /* unsupported */ }

    try {
      const GravSensor = (window as unknown as Record<string, unknown>)["GravitySensor"] as (new (opts: object) => { x: number; y: number; z: number; start: () => void; stop: () => void; addEventListener: (e: string, cb: () => void) => void });
      if (GravSensor) {
        const s = new GravSensor({ frequency: 10 });
        s.addEventListener("reading", () => {
          setGravity({ x: +s.x.toFixed(3), y: +s.y.toFixed(3), z: +s.z.toFixed(3) });
          setStatus("active");
        });
        s.start();
        sensors.push({ stop: () => s.stop() });
      }
    } catch { /* unsupported */ }

    try {
      const LinAccel = (window as unknown as Record<string, unknown>)["LinearAccelerationSensor"] as (new (opts: object) => { x: number; y: number; z: number; start: () => void; stop: () => void; addEventListener: (e: string, cb: () => void) => void });
      if (LinAccel) {
        const s = new LinAccel({ frequency: 10 });
        s.addEventListener("reading", () => {
          setLinear({ x: +s.x.toFixed(3), y: +s.y.toFixed(3), z: +s.z.toFixed(3) });
          setStatus("active");
        });
        s.start();
        sensors.push({ stop: () => s.stop() });
      }
    } catch { /* unsupported */ }

    if (sensors.length === 0) setStatus("unsupported");

    return () => sensors.forEach(s => s.stop());
  }, []);

  const magnitude = mag.x !== null && mag.y !== null && mag.z !== null
    ? +Math.sqrt(mag.x ** 2 + mag.y ** 2 + mag.z ** 2).toFixed(2) : null;

  // Metal detector style gauge
  const maxField = 100;
  const fieldPct = magnitude !== null ? Math.min(100, (magnitude / maxField) * 100) : 0;
  const fieldColor = fieldPct > 60 ? "#ef4444" : fieldPct > 30 ? "#f59e0b" : "#06b6d4";

  return (
    <SensorCard title="Magnetometer & Gravity" icon="🧲" status={status} accentColor="#06b6d4">
      {/* Metal detector gauge */}
      <div className="flex flex-col items-center my-3 gap-2">
        <div className="relative w-24 h-24">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
            <circle
              cx="50" cy="50" r="40" fill="none"
              stroke={fieldColor}
              strokeWidth="8"
              strokeDasharray={`${fieldPct * 2.51} 251`}
              strokeLinecap="round"
              style={{ transition: "stroke-dasharray 0.3s ease, stroke 0.3s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs font-mono font-bold" style={{ color: fieldColor }}>
              {magnitude ?? "—"}
            </span>
            <span className="text-xs text-slate-600">µT</span>
          </div>
        </div>
        <span className="text-xs text-slate-500">Magnetic field strength</span>
      </div>

      <div className="text-xs text-slate-600 uppercase tracking-wider mb-1 mt-2">Magnetometer</div>
      <DataRow label="X" value={mag.x} unit="µT" color="text-cyan-400" />
      <DataRow label="Y" value={mag.y} unit="µT" color="text-cyan-300" />
      <DataRow label="Z" value={mag.z} unit="µT" color="text-teal-400" />
      <DataRow label="Magnitude" value={magnitude} unit="µT" color="text-cyan-400" />

      <div className="text-xs text-slate-600 uppercase tracking-wider mb-1 mt-3">Gravity Vector</div>
      <DataRow label="X" value={gravity.x} unit="m/s²" color="text-indigo-400" />
      <DataRow label="Y" value={gravity.y} unit="m/s²" color="text-indigo-300" />
      <DataRow label="Z" value={gravity.z} unit="m/s²" color="text-violet-400" />

      <div className="text-xs text-slate-600 uppercase tracking-wider mb-1 mt-3">Linear Acceleration</div>
      <DataRow label="X" value={linear.x} unit="m/s²" color="text-sky-400" />
      <DataRow label="Y" value={linear.y} unit="m/s²" color="text-sky-300" />
      <DataRow label="Z" value={linear.z} unit="m/s²" color="text-blue-400" />
    </SensorCard>
  );
}
