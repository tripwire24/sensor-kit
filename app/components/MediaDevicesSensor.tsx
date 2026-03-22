"use client";

import { useState, useEffect, useCallback } from "react";
import SensorCard from "./SensorCard";
import { SensorStatus } from "../hooks/useSensors";

interface MediaDev {
  deviceId: string;
  kind: MediaDeviceKind;
  label: string;
}

const kindIcon: Record<MediaDeviceKind, string> = {
  audioinput: "🎙️",
  audiooutput: "🔊",
  videoinput: "📷",
};

const kindColor: Record<MediaDeviceKind, string> = {
  audioinput: "text-green-400",
  audiooutput: "text-blue-400",
  videoinput: "text-purple-400",
};

export default function MediaDevicesSensor() {
  const [devices, setDevices] = useState<MediaDev[]>([]);
  const [status, setStatus] = useState<SensorStatus>("idle");

  const load = useCallback(async () => {
    try {
      // Request permission to get labels
      await navigator.mediaDevices.getUserMedia({ audio: true }).then(s => s.getTracks().forEach(t => t.stop())).catch(() => {});
      const list = await navigator.mediaDevices.enumerateDevices();
      setDevices(list.map(d => ({ deviceId: d.deviceId, kind: d.kind, label: d.label || `${d.kind} (${d.deviceId.substring(0, 8)})` })));
      setStatus("active");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
    navigator.mediaDevices.addEventListener("devicechange", load);
    return () => navigator.mediaDevices.removeEventListener("devicechange", load);
  }, [load]);

  const counts = {
    audioinput: devices.filter(d => d.kind === "audioinput").length,
    audiooutput: devices.filter(d => d.kind === "audiooutput").length,
    videoinput: devices.filter(d => d.kind === "videoinput").length,
  };

  return (
    <SensorCard title="Media Devices" icon="🎛️" status={status} onStart={load} accentColor="#a855f7">
      {/* Count summary */}
      <div className="flex gap-2 my-3">
        {(["audioinput", "audiooutput", "videoinput"] as MediaDeviceKind[]).map(k => (
          <div key={k} className="flex-1 rounded-lg py-2 text-center bg-white/3 border border-white/5">
            <div className="text-xl">{kindIcon[k]}</div>
            <div className="text-sm font-bold text-slate-200">{counts[k]}</div>
          </div>
        ))}
      </div>

      {/* Device list */}
      <div className="space-y-1.5">
        {devices.length === 0 && (
          <p className="text-xs text-slate-600 text-center py-2">No devices found</p>
        )}
        {devices.map(d => (
          <div key={d.deviceId + d.kind} className="flex items-center gap-2 py-1 border-b border-white/5 last:border-0">
            <span className="text-base">{kindIcon[d.kind]}</span>
            <div className="flex-1 min-w-0">
              <div className={`text-xs truncate ${kindColor[d.kind]}`}>{d.label}</div>
              <div className="text-xs text-slate-600 font-mono">{d.kind}</div>
            </div>
          </div>
        ))}
      </div>
    </SensorCard>
  );
}
