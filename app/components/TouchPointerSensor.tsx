"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import SensorCard from "./SensorCard";
import DataRow from "./DataRow";

interface TouchPoint {
  id: number;
  x: number;
  y: number;
  force: number;
  radiusX: number;
  radiusY: number;
}

interface PointerInfo {
  pressure: number | null;
  tiltX: number | null;
  tiltY: number | null;
  twist: number | null;
  pointerType: string | null;
  width: number | null;
  height: number | null;
}

export default function TouchPointerSensor() {
  const [touches, setTouches] = useState<TouchPoint[]>([]);
  const [pointer, setPointer] = useState<PointerInfo>({
    pressure: null, tiltX: null, tiltY: null,
    twist: null, pointerType: null, width: null, height: null,
  });
  const [maxTouches, setMaxTouches] = useState(0);
  const canvasRef = useRef<HTMLDivElement>(null);

  const onTouchChange = useCallback((e: TouchEvent) => {
    e.preventDefault();
    const pts: TouchPoint[] = Array.from(e.touches).map(t => ({
      id: t.identifier,
      x: t.clientX,
      y: t.clientY,
      force: t.force ?? 0,
      radiusX: t.radiusX ?? 10,
      radiusY: t.radiusY ?? 10,
    }));
    setTouches(pts);
    setMaxTouches(prev => Math.max(prev, pts.length));
  }, []);

  const onPointerMove = useCallback((e: PointerEvent) => {
    setPointer({
      pressure: +e.pressure.toFixed(3),
      tiltX: e.tiltX,
      tiltY: e.tiltY,
      twist: e.twist,
      pointerType: e.pointerType,
      width: +e.width.toFixed(1),
      height: +e.height.toFixed(1),
    });
  }, []);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    el.addEventListener("touchstart", onTouchChange, { passive: false });
    el.addEventListener("touchmove", onTouchChange, { passive: false });
    el.addEventListener("touchend", onTouchChange, { passive: false });
    el.addEventListener("pointermove", onPointerMove);
    return () => {
      el.removeEventListener("touchstart", onTouchChange);
      el.removeEventListener("touchmove", onTouchChange);
      el.removeEventListener("touchend", onTouchChange);
      el.removeEventListener("pointermove", onPointerMove);
    };
  }, [onTouchChange, onPointerMove]);

  const canvasRect = canvasRef.current?.getBoundingClientRect();

  return (
    <SensorCard title="Touch & Pointer" icon="👆" status={touches.length > 0 ? "active" : "idle"} accentColor="#f59e0b">
      {/* Touch canvas */}
      <div
        ref={canvasRef}
        className="relative w-full h-28 bg-black/20 rounded-xl border border-amber-500/20 overflow-hidden my-3 cursor-crosshair select-none"
        style={{ touchAction: "none" }}
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-xs text-slate-700">Touch / move here</span>
        </div>
        {touches.map(t => {
          const rect = canvasRect;
          if (!rect) return null;
          const x = ((t.x - rect.left) / rect.width) * 100;
          const y = ((t.y - rect.top) / rect.height) * 100;
          const size = Math.max(24, t.radiusX * 2);
          return (
            <div
              key={t.id}
              className="absolute rounded-full border-2 border-amber-400 bg-amber-400/20 pointer-events-none"
              style={{
                left: `${x}%`, top: `${y}%`,
                width: `${size}px`, height: `${size}px`,
                transform: "translate(-50%,-50%)",
                opacity: 0.6 + t.force * 0.4,
              }}
            />
          );
        })}
      </div>

      <DataRow label="Active touches" value={touches.length > 0 ? touches.length : null} color="text-amber-400" />
      <DataRow label="Max touches" value={maxTouches > 0 ? maxTouches : null} color="text-yellow-400" />
      <DataRow label="Max touch points" value={navigator.maxTouchPoints} color="text-amber-300" />
      <DataRow label="Pointer type" value={pointer.pointerType} color="text-yellow-300" />
      <DataRow label="Pressure" value={pointer.pressure} color="text-amber-400" />
      <DataRow label="Tilt X" value={pointer.tiltX} unit="°" color="text-orange-400" />
      <DataRow label="Tilt Y" value={pointer.tiltY} unit="°" color="text-orange-300" />
      <DataRow label="Twist" value={pointer.twist} unit="°" color="text-amber-400" />
    </SensorCard>
  );
}
