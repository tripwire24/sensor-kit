"use client";

import { useState, useCallback } from "react";
import SensorCard from "./SensorCard";
import { SensorStatus } from "../hooks/useSensors";

interface BLEDevice {
  id: string;
  name: string;
  rssi: number | null;
}

export default function BluetoothSensor() {
  const [status, setStatus] = useState<SensorStatus>("idle");
  const [devices, setDevices] = useState<BLEDevice[]>([]);
  const [scanning, setScanning] = useState(false);

  const scan = useCallback(async () => {
    const nav = navigator as Navigator & { bluetooth?: { requestDevice: (opts: object) => Promise<{ id: string; name?: string }> } };
    if (!nav.bluetooth) {
      setStatus("unsupported");
      return;
    }
    setScanning(true);
    setStatus("active");
    try {
      // Request a device — browser shows a picker; we just record what the user selects
      const device = await nav.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ["battery_service", "device_information"],
      });

      setDevices(prev => {
        const exists = prev.find(d => d.id === device.id);
        if (exists) return prev;
        return [...prev, { id: device.id, name: device.name ?? "Unknown Device", rssi: null }];
      });
    } catch (e) {
      if ((e as Error).name === "NotFoundError") { /* user cancelled */ }
      else if ((e as Error).name === "SecurityError") setStatus("denied");
      else setStatus("error");
    }
    setScanning(false);
  }, []);

  const rssiBar = (rssi: number | null) => {
    if (rssi === null) return 0;
    // RSSI: -30 = excellent, -90 = very weak
    return Math.max(0, Math.min(100, ((rssi + 90) / 60) * 100));
  };

  const rssiLabel = (rssi: number | null) => {
    if (rssi === null) return "Unknown";
    if (rssi > -50) return "Excellent";
    if (rssi > -65) return "Good";
    if (rssi > -75) return "Fair";
    return "Weak";
  };

  const rssiColor = (rssi: number | null) => {
    if (rssi === null) return "text-slate-500";
    if (rssi > -50) return "text-emerald-400";
    if (rssi > -65) return "text-green-400";
    if (rssi > -75) return "text-amber-400";
    return "text-red-400";
  };

  return (
    <SensorCard title="Bluetooth BLE" icon="📡" status={status} accentColor="#3b82f6">
      {/* Radar visual */}
      <div className="flex justify-center my-3">
        <div className="relative w-24 h-24">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="absolute inset-0 rounded-full border border-blue-500/20"
              style={{ margin: `${(i - 1) * 12}px` }}
            />
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-blue-400/80" />
          </div>
          {/* Device dots */}
          {devices.slice(0, 6).map((d, i) => {
            const angle = (i / Math.max(devices.length, 1)) * Math.PI * 2 - Math.PI / 2;
            const str = rssiBar(d.rssi) / 100;
            const r = 20 + (1 - str) * 20;
            const x = 50 + r * Math.cos(angle);
            const y = 50 + r * Math.sin(angle);
            return (
              <div
                key={d.id}
                className="absolute w-2 h-2 rounded-full bg-blue-300 pulse-ring"
                style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
                title={d.name}
              />
            );
          })}
        </div>
      </div>

      <button
        onClick={scan}
        disabled={scanning}
        className="w-full py-2 rounded-lg text-xs font-medium mb-3 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
        style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.3)" }}
      >
        {scanning ? "Scanning…" : devices.length > 0 ? "Scan for more" : "Scan for devices"}
      </button>

      {devices.length === 0 ? (
        <p className="text-xs text-slate-600 text-center py-2">No devices scanned yet</p>
      ) : (
        <div className="space-y-2">
          {devices.map(d => (
            <div key={d.id} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
              <div>
                <div className="text-xs text-slate-300">{d.name}</div>
                <div className="text-xs text-slate-600 font-mono">{d.id.substring(0, 16)}…</div>
              </div>
              <div className="text-right">
                <div className={`text-xs font-medium ${rssiColor(d.rssi)}`}>{rssiLabel(d.rssi)}</div>
                <div className="text-xs text-slate-600">{d.rssi !== null ? `${d.rssi} dBm` : "—"}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </SensorCard>
  );
}
