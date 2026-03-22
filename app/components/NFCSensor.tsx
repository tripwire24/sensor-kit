"use client";

import { useState, useCallback } from "react";
import SensorCard from "./SensorCard";
import DataRow from "./DataRow";
import { SensorStatus } from "../hooks/useSensors";

interface NFCRecord {
  recordType: string;
  mediaType: string;
  data: string;
}

interface NFCTag {
  serialNumber: string;
  records: NFCRecord[];
}

export default function NFCSensor() {
  const [status, setStatus] = useState<SensorStatus>("idle");
  const [tag, setTag] = useState<NFCTag | null>(null);
  const [scanning, setScanning] = useState(false);

  const scan = useCallback(async () => {
    const NDEFReader = (window as unknown as Record<string, unknown>)["NDEFReader"] as (new () => {
      scan: (opts?: object) => Promise<void>;
      addEventListener: (e: string, cb: (e: { serialNumber: string; message: { records: Array<{ recordType: string; mediaType: string; data: ArrayBuffer }> } }) => void) => void;
    }) | undefined;

    if (!NDEFReader) {
      setStatus("unsupported");
      return;
    }

    setScanning(true);
    try {
      const reader = new NDEFReader();
      await reader.scan();
      setStatus("active");
      reader.addEventListener("reading", (e) => {
        const records: NFCRecord[] = e.message.records.map(r => {
          let data = "";
          try {
            data = new TextDecoder().decode(r.data);
          } catch { data = "(binary)"; }
          return { recordType: r.recordType, mediaType: r.mediaType || "—", data };
        });
        setTag({ serialNumber: e.serialNumber, records });
      });
    } catch (e) {
      if ((e as Error).name === "NotAllowedError") setStatus("denied");
      else setStatus("unsupported");
      setScanning(false);
    }
  }, []);

  return (
    <SensorCard title="NFC" icon="🏷️" status={status} onStart={scan} accentColor="#10b981">
      {status === "unsupported" ? (
        <p className="text-xs text-slate-600 text-center py-4">NFC not supported on this device/browser</p>
      ) : status === "idle" ? (
        <div className="text-center py-4">
          <div className="text-3xl mb-2">🏷️</div>
          <p className="text-xs text-slate-500">Tap &ldquo;Enable&rdquo; to start scanning for NFC tags</p>
        </div>
      ) : status === "active" && !tag ? (
        <div className="text-center py-4">
          <div className="text-3xl mb-2 animate-pulse">📡</div>
          <p className="text-xs text-slate-500">Bring an NFC tag close to your device…</p>
        </div>
      ) : tag ? (
        <>
          <div className="text-xs text-slate-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 mb-3">
            ✅ Tag detected
          </div>
          <DataRow label="Serial" value={tag.serialNumber} color="text-emerald-400" />
          <DataRow label="Records" value={tag.records.length} color="text-teal-400" />
          {tag.records.map((r, i) => (
            <div key={i} className="mt-2 p-2 bg-white/3 rounded-lg">
              <div className="text-xs text-slate-500 mb-1">Record {i + 1}</div>
              <DataRow label="Type" value={r.recordType} color="text-emerald-300" />
              <DataRow label="Media" value={r.mediaType} color="text-teal-300" />
              <div className="text-xs text-slate-400 font-mono mt-1 break-all">{r.data.substring(0, 80)}</div>
            </div>
          ))}
        </>
      ) : null}
    </SensorCard>
  );
}
