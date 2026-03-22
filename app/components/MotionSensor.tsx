"use client";

import { useEffect } from "react";
import SensorCard from "./SensorCard";
import DataRow from "./DataRow";
import { useMotion } from "../hooks/useSensors";

export default function MotionSensor() {
  const { acceleration, rotationRate, status, start } = useMotion();

  useEffect(() => {
    const cleanup = start();
    return cleanup;
  }, [start]);

  const accel = acceleration;
  const rot = rotationRate;

  // Visual 3D indicator
  const tiltX = accel.x !== null ? Math.max(-30, Math.min(30, accel.x * 3)) : 0;
  const tiltY = accel.y !== null ? Math.max(-30, Math.min(30, accel.y * 3)) : 0;

  return (
    <SensorCard title="Accelerometer" icon="📱" status={status} onStart={start} accentColor="#60a5fa">
      {/* Visual phone tilt */}
      <div className="flex justify-center my-3">
        <div
          className="w-12 h-20 rounded-xl border-2 border-blue-400/40 bg-blue-400/10 transition-transform duration-100"
          style={{ transform: `rotateX(${tiltY}deg) rotateY(${tiltX}deg)` }}
        >
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-blue-400/60" />
          </div>
        </div>
      </div>

      <DataRow label="X (left/right)" value={accel.x} unit="m/s²" color="text-blue-400" />
      <DataRow label="Y (up/down)" value={accel.y} unit="m/s²" color="text-green-400" />
      <DataRow label="Z (forward/back)" value={accel.z} unit="m/s²" color="text-purple-400" />
      <DataRow label="Rotation α" value={rot.x} unit="°/s" color="text-orange-400" />
      <DataRow label="Rotation β" value={rot.y} unit="°/s" color="text-pink-400" />
      <DataRow label="Rotation γ" value={rot.z} unit="°/s" color="text-cyan-400" />
      <DataRow label="Sample interval" value={accel.interval} unit="ms" />
    </SensorCard>
  );
}
