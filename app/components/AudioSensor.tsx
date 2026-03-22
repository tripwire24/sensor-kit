"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import SensorCard from "./SensorCard";
import DataRow from "./DataRow";
import { SensorStatus } from "../hooks/useSensors";

const FFT_SIZE = 64;

export default function AudioSensor() {
  const [status, setStatus] = useState<SensorStatus>("idle");
  const [db, setDb] = useState<number | null>(null);
  const [bars, setBars] = useState<number[]>(Array(FFT_SIZE / 2).fill(0));
  const [peak, setPeak] = useState<number | null>(null);
  const [sampleRate, setSampleRate] = useState<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const tick = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);

    // dB calculation from time domain
    const td = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(td);
    let rms = 0;
    for (let i = 0; i < td.length; i++) rms += td[i] * td[i];
    rms = Math.sqrt(rms / td.length);
    const dbVal = rms > 0 ? +(20 * Math.log10(rms)).toFixed(1) : -100;

    setDb(dbVal);
    setPeak(prev => prev === null ? dbVal : Math.max(prev, dbVal));
    setBars(Array.from(data).map(v => v / 255));
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;
      const ctx = new AudioContext();
      setSampleRate(ctx.sampleRate);
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = FFT_SIZE * 2;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;
      setStatus("active");
      rafRef.current = requestAnimationFrame(tick);
    } catch (e) {
      if ((e as Error).name === "NotAllowedError") setStatus("denied");
      else setStatus("error");
    }
  }, [tick]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const dbNorm = db !== null ? Math.max(0, Math.min(1, (db + 80) / 80)) : 0;
  const dbColor = dbNorm > 0.8 ? "#ef4444" : dbNorm > 0.5 ? "#f59e0b" : "#22c55e";

  return (
    <SensorCard title="Microphone & Audio" icon="🎙️" status={status} onStart={start} accentColor="#22c55e">
      {/* FFT Spectrum bars */}
      <div className="flex items-end gap-px h-16 my-3 bg-black/20 rounded-lg px-2 py-1">
        {bars.map((v, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm transition-none"
            style={{
              height: `${Math.max(4, v * 100)}%`,
              background: `hsl(${120 + i * 2}, 70%, ${40 + v * 30}%)`,
              opacity: 0.85,
            }}
          />
        ))}
      </div>

      {/* dB meter */}
      <div className="flex items-center gap-2 my-2">
        <span className="text-xs text-slate-500 w-6">dB</span>
        <div className="flex-1 h-3 bg-black/30 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-none"
            style={{ width: `${dbNorm * 100}%`, background: dbColor }}
          />
        </div>
        <span className="text-xs font-mono w-14 text-right" style={{ color: dbColor }}>
          {db !== null ? `${db} dB` : "—"}
        </span>
      </div>

      <DataRow label="Level" value={db} unit="dBFS" color="text-green-400" />
      <DataRow label="Peak" value={peak} unit="dBFS" color="text-amber-400" />
      <DataRow label="Sample rate" value={sampleRate} unit="Hz" color="text-emerald-400" />
      <DataRow label="FFT size" value={status === "active" ? FFT_SIZE * 2 : null} color="text-slate-400" />
    </SensorCard>
  );
}
