"use client";

import { useState, useCallback, useRef } from "react";
import SensorCard from "./SensorCard";
import DataRow from "./DataRow";
import { SensorStatus } from "../hooks/useSensors";

export default function IdleWakeSensor() {
  const [idleState, setIdleState] = useState<string | null>(null);
  const [screenState, setScreenState] = useState<string | null>(null);
  const [wakeLock, setWakeLock] = useState(false);
  const [idleStatus, setIdleStatus] = useState<SensorStatus>("idle");
  const wakeLockRef = useRef<{ release: () => Promise<void> } | null>(null);

  const startIdle = useCallback(async () => {
    const IdleDetector = (window as unknown as Record<string, unknown>)["IdleDetector"] as (new () => {
      start: (opts: object) => Promise<void>;
      userState: string;
      screenState: string;
      addEventListener: (e: string, cb: () => void) => void;
    }) | undefined;

    if (!IdleDetector) {
      setIdleStatus("unsupported");
      return;
    }

    try {
      const perm = await (IdleDetector as unknown as { requestPermission: () => Promise<string> }).requestPermission?.();
      if (perm && perm !== "granted") { setIdleStatus("denied"); return; }

      const detector = new IdleDetector();
      detector.addEventListener("change", () => {
        setIdleState(detector.userState);
        setScreenState(detector.screenState);
        setIdleStatus("active");
      });
      await detector.start({ threshold: 60000 });
      setIdleStatus("active");
      setIdleState(detector.userState);
      setScreenState(detector.screenState);
    } catch (e) {
      if ((e as Error).name === "NotAllowedError") setIdleStatus("denied");
      else setIdleStatus("unsupported");
    }
  }, []);

  const toggleWakeLock = useCallback(async () => {
    if (wakeLock) {
      await wakeLockRef.current?.release();
      wakeLockRef.current = null;
      setWakeLock(false);
    } else {
      try {
        const lock = await navigator.wakeLock?.request("screen");
        if (lock) {
          wakeLockRef.current = { release: () => lock.release() };
          setWakeLock(true);
          lock.addEventListener("release", () => setWakeLock(false));
        }
      } catch { /* denied or unsupported */ }
    }
  }, [wakeLock]);

  return (
    <SensorCard title="Idle & Wake Lock" icon="🕐" status={idleStatus} accentColor="#64748b">
      {/* Wake lock toggle */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/5 my-3">
        <div>
          <div className="text-xs font-medium text-slate-300">Screen Wake Lock</div>
          <div className="text-xs text-slate-500 mt-0.5">Prevent screen from sleeping</div>
        </div>
        <button
          onClick={toggleWakeLock}
          className={`relative w-10 h-6 rounded-full transition-all ${wakeLock ? "bg-blue-500" : "bg-white/10"}`}
        >
          <span
            className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
            style={{ left: wakeLock ? "22px" : "4px" }}
          />
        </button>
      </div>
      <DataRow
        label="Wake lock"
        value={wakeLock ? "Active" : "Inactive"}
        color={wakeLock ? "text-blue-400" : "text-slate-500"}
      />

      {/* Idle detection */}
      <div className="mt-3">
        {idleStatus === "idle" ? (
          <button
            onClick={startIdle}
            className="w-full py-2 rounded-lg text-xs font-medium transition-all hover:scale-[1.02]"
            style={{ background: "rgba(100,116,139,0.15)", color: "#94a3b8", border: "1px solid rgba(100,116,139,0.3)" }}
          >
            Start Idle Detection
          </button>
        ) : idleStatus === "unsupported" ? (
          <p className="text-xs text-slate-600 text-center">Idle Detection not supported</p>
        ) : (
          <>
            <DataRow
              label="User state"
              value={idleState}
              color={idleState === "active" ? "text-emerald-400" : "text-amber-400"}
            />
            <DataRow
              label="Screen state"
              value={screenState}
              color={screenState === "unlocked" ? "text-emerald-400" : "text-slate-400"}
            />
          </>
        )}
      </div>
    </SensorCard>
  );
}
