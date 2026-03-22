"use client";

import { useState, useEffect } from "react";
import SensorCard from "./SensorCard";
import DataRow from "./DataRow";

interface DeviceInfo {
  platform: string | null;
  userAgent: string | null;
  language: string | null;
  timezone: string | null;
  screen: string | null;
  pixelRatio: number | null;
  cores: number | null;
  memory: number | null;
  touchPoints: number | null;
  cookiesEnabled: boolean | null;
}

export default function DeviceInfoSensor() {
  const [info, setInfo] = useState<DeviceInfo>({
    platform: null, userAgent: null, language: null,
    timezone: null, screen: null, pixelRatio: null,
    cores: null, memory: null, touchPoints: null, cookiesEnabled: null,
  });

  useEffect(() => {
    const nav = navigator as Navigator & { deviceMemory?: number };
    setInfo({
      platform: navigator.platform || "Unknown",
      userAgent: navigator.userAgent.substring(0, 60) + "…",
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: `${screen.width}×${screen.height}`,
      pixelRatio: window.devicePixelRatio,
      cores: navigator.hardwareConcurrency ?? null,
      memory: nav.deviceMemory ?? null,
      touchPoints: navigator.maxTouchPoints,
      cookiesEnabled: navigator.cookieEnabled,
    });
  }, []);

  return (
    <SensorCard title="Device Info" icon="💻" status="always" accentColor="#f43f5e">
      <DataRow label="Platform" value={info.platform} color="text-rose-400" />
      <DataRow label="Language" value={info.language} color="text-pink-400" />
      <DataRow label="Timezone" value={info.timezone} color="text-rose-300" />
      <DataRow label="Screen" value={info.screen} color="text-fuchsia-400" />
      <DataRow label="Pixel ratio" value={info.pixelRatio} unit="x" color="text-pink-300" />
      <DataRow label="CPU cores" value={info.cores} color="text-rose-400" />
      <DataRow label="RAM" value={info.memory} unit="GB" color="text-pink-400" />
      <DataRow label="Touch points" value={info.touchPoints} color="text-fuchsia-300" />
      <DataRow label="Cookies" value={info.cookiesEnabled ? "Enabled" : "Disabled"} color="text-slate-400" />
    </SensorCard>
  );
}
