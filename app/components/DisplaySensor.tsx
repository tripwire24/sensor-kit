"use client";

import { useState, useEffect } from "react";
import SensorCard from "./SensorCard";
import DataRow from "./DataRow";

interface DisplayInfo {
  orientation: string | null;
  orientationType: string | null;
  width: number | null;
  height: number | null;
  availWidth: number | null;
  availHeight: number | null;
  colorDepth: number | null;
  pixelDepth: number | null;
  devicePixelRatio: number | null;
  hdr: boolean | null;
  darkMode: boolean | null;
  reducedMotion: boolean | null;
  highContrast: boolean | null;
  fps: number | null;
  refreshRate: number | null;
}

export default function DisplaySensor() {
  const [info, setInfo] = useState<DisplayInfo>({
    orientation: null, orientationType: null,
    width: null, height: null, availWidth: null, availHeight: null,
    colorDepth: null, pixelDepth: null, devicePixelRatio: null,
    hdr: null, darkMode: null, reducedMotion: null, highContrast: null,
    fps: null, refreshRate: null,
  });

  useEffect(() => {
    const update = () => {
      const ori = screen.orientation;
      setInfo(prev => ({
        ...prev,
        orientation: ori?.angle !== undefined ? `${ori.angle}°` : null,
        orientationType: ori?.type ?? null,
        width: screen.width,
        height: screen.height,
        availWidth: screen.availWidth,
        availHeight: screen.availHeight,
        colorDepth: screen.colorDepth,
        pixelDepth: screen.pixelDepth,
        devicePixelRatio: window.devicePixelRatio,
        hdr: window.matchMedia("(dynamic-range: high)").matches,
        darkMode: window.matchMedia("(prefers-color-scheme: dark)").matches,
        reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        highContrast: window.matchMedia("(prefers-contrast: high)").matches,
      }));
    };

    update();
    screen.orientation?.addEventListener("change", update);
    window.addEventListener("resize", update);

    // Measure refresh rate
    let frames = 0;
    let start = performance.now();
    let rafId: number;
    const measureFPS = (ts: number) => {
      frames++;
      if (ts - start >= 1000) {
        const fps = Math.round(frames * 1000 / (ts - start));
        setInfo(prev => ({ ...prev, fps, refreshRate: fps > 100 ? 120 : fps > 75 ? 90 : fps > 50 ? 60 : 30 }));
        frames = 0;
        start = ts;
      }
      rafId = requestAnimationFrame(measureFPS);
    };
    rafId = requestAnimationFrame(measureFPS);

    return () => {
      screen.orientation?.removeEventListener("change", update);
      window.removeEventListener("resize", update);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <SensorCard title="Display & Screen" icon="🖥️" status="always" accentColor="#a855f7">
      {/* Screen visual */}
      <div className="flex justify-center my-3">
        <div
          className="border-2 border-purple-500/30 bg-purple-500/5 rounded-lg flex items-center justify-center transition-all"
          style={{
            width: info.orientationType?.includes("landscape") ? "80px" : "48px",
            height: info.orientationType?.includes("landscape") ? "48px" : "72px",
          }}
        >
          <span className="text-xs text-purple-400">{info.refreshRate ?? "—"}Hz</span>
        </div>
      </div>

      <DataRow label="Resolution" value={info.width && info.height ? `${info.width}×${info.height}` : null} color="text-purple-400" />
      <DataRow label="Available" value={info.availWidth && info.availHeight ? `${info.availWidth}×${info.availHeight}` : null} color="text-purple-300" />
      <DataRow label="Pixel ratio" value={info.devicePixelRatio} unit="x" color="text-violet-400" />
      <DataRow label="Color depth" value={info.colorDepth} unit="bit" color="text-fuchsia-400" />
      <DataRow label="Orientation" value={info.orientationType} color="text-purple-300" />
      <DataRow label="Measured FPS" value={info.fps} color="text-violet-300" />
      <DataRow label="HDR" value={info.hdr === null ? null : info.hdr ? "Yes" : "No"} color={info.hdr ? "text-emerald-400" : "text-slate-500"} />
      <DataRow label="Dark mode" value={info.darkMode === null ? null : info.darkMode ? "Yes" : "No"} color="text-purple-400" />
      <DataRow label="Reduced motion" value={info.reducedMotion === null ? null : info.reducedMotion ? "Yes" : "No"} color="text-slate-400" />
      <DataRow label="High contrast" value={info.highContrast === null ? null : info.highContrast ? "Yes" : "No"} color="text-slate-400" />
    </SensorCard>
  );
}
