"use client";

import { useState, useEffect, useRef } from "react";
import SensorCard from "./SensorCard";
import DataRow from "./DataRow";

interface PerfData {
  fps: number | null;
  heapUsed: number | null;
  heapTotal: number | null;
  heapLimit: number | null;
  longTasks: number;
  navigationTime: number | null;
  domContentLoaded: number | null;
}

export default function PerformanceSensor() {
  const [data, setData] = useState<PerfData>({
    fps: null, heapUsed: null, heapTotal: null, heapLimit: null,
    longTasks: 0, navigationTime: null, domContentLoaded: null,
  });
  const [fpsHistory, setFpsHistory] = useState<number[]>(Array(30).fill(0));
  const frameTimesRef = useRef<number[]>([]);
  const longTasksRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Long task observer
    let observer: PerformanceObserver | null = null;
    try {
      observer = new PerformanceObserver((list) => {
        longTasksRef.current += list.getEntries().length;
      });
      observer.observe({ entryTypes: ["longtask"] });
    } catch { /* not supported */ }

    // Navigation timing
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    const navTime = nav ? +(nav.duration).toFixed(1) : null;
    const domCL = nav ? +(nav.domContentLoadedEventEnd - nav.startTime).toFixed(1) : null;

    const tick = (ts: number) => {
      if (lastFrameRef.current !== null) {
        const delta = ts - lastFrameRef.current;
        frameTimesRef.current.push(delta);
        if (frameTimesRef.current.length > 60) frameTimesRef.current.shift();
      }
      lastFrameRef.current = ts;

      const avgDelta = frameTimesRef.current.length > 0
        ? frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length
        : 16.67;
      const fps = Math.round(1000 / avgDelta);

      const mem = (performance as Performance & { memory?: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } }).memory;

      setData({
        fps,
        heapUsed: mem ? +(mem.usedJSHeapSize / 1048576).toFixed(1) : null,
        heapTotal: mem ? +(mem.totalJSHeapSize / 1048576).toFixed(1) : null,
        heapLimit: mem ? +(mem.jsHeapSizeLimit / 1048576).toFixed(1) : null,
        longTasks: longTasksRef.current,
        navigationTime: navTime,
        domContentLoaded: domCL,
      });

      setFpsHistory(prev => {
        const next = [...prev.slice(1), Math.min(fps, 120)];
        return next;
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      observer?.disconnect();
    };
  }, []);

  const maxFps = Math.max(...fpsHistory, 1);
  const fpsColor = (data.fps ?? 60) >= 55 ? "#22c55e" : (data.fps ?? 60) >= 30 ? "#f59e0b" : "#ef4444";
  const heapPct = data.heapUsed !== null && data.heapLimit !== null
    ? (data.heapUsed / data.heapLimit) * 100 : 0;

  return (
    <SensorCard title="Performance" icon="⚡" status="always" accentColor="#eab308">
      {/* FPS graph */}
      <div className="flex items-end gap-px h-12 my-2 bg-black/20 rounded-lg px-1 py-1">
        {fpsHistory.map((v, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm transition-none"
            style={{
              height: `${(v / maxFps) * 100}%`,
              background: v >= 55 ? "#22c55e" : v >= 30 ? "#f59e0b" : "#ef4444",
              opacity: 0.7 + (i / fpsHistory.length) * 0.3,
            }}
          />
        ))}
      </div>

      <div className="text-center mb-3">
        <span className="text-2xl font-mono font-bold" style={{ color: fpsColor }}>
          {data.fps ?? "—"}
        </span>
        <span className="text-xs text-slate-500 ml-1">FPS</span>
      </div>

      {/* Memory bar */}
      {data.heapUsed !== null && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>JS Heap</span>
            <span className="font-mono">{data.heapUsed} / {data.heapLimit} MB</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${heapPct}%`,
                background: heapPct > 80 ? "#ef4444" : heapPct > 60 ? "#f59e0b" : "#eab308",
              }}
            />
          </div>
        </div>
      )}

      <DataRow label="FPS" value={data.fps} color={fpsColor} />
      <DataRow label="Heap used" value={data.heapUsed} unit="MB" color="text-yellow-400" />
      <DataRow label="Heap total" value={data.heapTotal} unit="MB" color="text-yellow-300" />
      <DataRow label="Heap limit" value={data.heapLimit} unit="MB" color="text-slate-400" />
      <DataRow label="Long tasks" value={data.longTasks > 0 ? data.longTasks : null} color="text-red-400" />
      <DataRow label="Page load" value={data.navigationTime} unit="ms" color="text-amber-400" />
      <DataRow label="DOM ready" value={data.domContentLoaded} unit="ms" color="text-amber-300" />
    </SensorCard>
  );
}
