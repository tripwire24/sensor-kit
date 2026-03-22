"use client";

import { useState, useEffect } from "react";
import SensorCard from "./SensorCard";

type PermState = "granted" | "denied" | "prompt" | "unsupported";

interface PermItem {
  name: string;
  icon: string;
  state: PermState;
}

const PERMISSIONS: { name: string; icon: string; perm: PermissionName }[] = [
  { name: "Geolocation", icon: "📍", perm: "geolocation" },
  { name: "Notifications", icon: "🔔", perm: "notifications" },
  { name: "Microphone", icon: "🎙️", perm: "microphone" as PermissionName },
  { name: "Camera", icon: "📷", perm: "camera" as PermissionName },
  { name: "MIDI", icon: "🎵", perm: "midi" as PermissionName },
  { name: "Clipboard Read", icon: "📋", perm: "clipboard-read" as PermissionName },
  { name: "Clipboard Write", icon: "✏️", perm: "clipboard-write" as PermissionName },
  { name: "Accelerometer", icon: "📱", perm: "accelerometer" as PermissionName },
  { name: "Gyroscope", icon: "🌀", perm: "gyroscope" as PermissionName },
  { name: "Magnetometer", icon: "🧲", perm: "magnetometer" as PermissionName },
  { name: "Ambient Light", icon: "💡", perm: "ambient-light-sensor" as PermissionName },
  { name: "Bluetooth", icon: "📡", perm: "bluetooth" as PermissionName },
  { name: "Idle Detection", icon: "🕐", perm: "idle-detection" as PermissionName },
  { name: "Storage Access", icon: "💾", perm: "storage-access" as PermissionName },
  { name: "Screen Wake Lock", icon: "🔆", perm: "screen-wake-lock" as PermissionName },
  { name: "Window Mgmt", icon: "🪟", perm: "window-management" as PermissionName },
];

const stateConfig: Record<PermState, { label: string; color: string; bg: string; dot: string }> = {
  granted: { label: "Granted", color: "text-emerald-400", bg: "bg-emerald-500/10", dot: "bg-emerald-400" },
  denied: { label: "Denied", color: "text-red-400", bg: "bg-red-500/10", dot: "bg-red-400" },
  prompt: { label: "Ask", color: "text-amber-400", bg: "bg-amber-500/10", dot: "bg-amber-400" },
  unsupported: { label: "N/A", color: "text-slate-600", bg: "bg-white/3", dot: "bg-slate-700" },
};

export default function PermissionsSensor() {
  const [perms, setPerms] = useState<PermItem[]>(
    PERMISSIONS.map(p => ({ name: p.name, icon: p.icon, state: "unsupported" }))
  );

  useEffect(() => {
    const check = async () => {
      const results = await Promise.all(
        PERMISSIONS.map(async (p, i) => {
          try {
            const result = await navigator.permissions.query({ name: p.perm });
            const state = result.state as PermState;
            // Watch for changes
            result.onchange = () => {
              setPerms(prev => {
                const next = [...prev];
                next[i] = { ...next[i], state: result.state as PermState };
                return next;
              });
            };
            return { name: p.name, icon: p.icon, state };
          } catch {
            return { name: p.name, icon: p.icon, state: "unsupported" as PermState };
          }
        })
      );
      setPerms(results);
    };
    check();
  }, []);

  const counts = {
    granted: perms.filter(p => p.state === "granted").length,
    denied: perms.filter(p => p.state === "denied").length,
    prompt: perms.filter(p => p.state === "prompt").length,
  };

  return (
    <SensorCard title="Permissions" icon="🔑" status="always" accentColor="#f43f5e">
      {/* Summary */}
      <div className="flex gap-2 my-3">
        {[
          { label: "Granted", count: counts.granted, color: "#22c55e" },
          { label: "Ask", count: counts.prompt, color: "#f59e0b" },
          { label: "Denied", count: counts.denied, color: "#ef4444" },
        ].map(s => (
          <div
            key={s.label}
            className="flex-1 rounded-lg py-2 text-center"
            style={{ background: `${s.color}15`, border: `1px solid ${s.color}30` }}
          >
            <div className="text-lg font-bold" style={{ color: s.color }}>{s.count}</div>
            <div className="text-xs text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Permission list */}
      <div className="space-y-1">
        {perms.map(p => {
          const cfg = stateConfig[p.state];
          return (
            <div
              key={p.name}
              className={`flex items-center justify-between px-2 py-1.5 rounded-lg ${cfg.bg}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{p.icon}</span>
                <span className="text-xs text-slate-300">{p.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                <span className={`text-xs ${cfg.color}`}>{cfg.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </SensorCard>
  );
}
