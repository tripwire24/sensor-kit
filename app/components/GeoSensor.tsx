"use client";

import SensorCard from "./SensorCard";
import DataRow from "./DataRow";
import { useGeolocation } from "../hooks/useSensors";

export default function GeoSensor() {
  const { data, status, start } = useGeolocation();

  const mapsUrl = data.latitude && data.longitude
    ? `https://www.openstreetmap.org/?mlat=${data.latitude}&mlon=${data.longitude}&zoom=15`
    : null;

  return (
    <SensorCard title="GPS / Location" icon="📍" status={status} onStart={start} accentColor="#22c55e">
      {/* Mini map preview placeholder */}
      {status === "active" && data.latitude && data.longitude ? (
        <a
          href={mapsUrl!}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full h-24 rounded-xl overflow-hidden border border-emerald-400/20 bg-emerald-400/5 hover:border-emerald-400/40 transition-colors mb-3"
        >
          <div className="w-full h-full flex flex-col items-center justify-center gap-1">
            <span className="text-2xl">🗺️</span>
            <span className="text-xs text-emerald-400">View on map →</span>
            <span className="text-xs text-slate-500 font-mono">
              {data.latitude}, {data.longitude}
            </span>
          </div>
        </a>
      ) : (
        <div className="w-full h-16 rounded-xl border border-white/5 bg-white/2 flex items-center justify-center mb-3">
          <span className="text-xs text-slate-600">Waiting for GPS signal…</span>
        </div>
      )}

      <DataRow label="Latitude" value={data.latitude} unit="°" color="text-emerald-400" />
      <DataRow label="Longitude" value={data.longitude} unit="°" color="text-emerald-400" />
      <DataRow label="Altitude" value={data.altitude} unit="m" color="text-green-400" />
      <DataRow label="Accuracy" value={data.accuracy} unit="m" color="text-teal-400" />
      <DataRow label="Speed" value={data.speed !== null ? (data.speed * 3.6).toFixed(1) : null} unit="km/h" color="text-cyan-400" />
      <DataRow label="Heading" value={data.heading} unit="°" color="text-lime-400" />
    </SensorCard>
  );
}
