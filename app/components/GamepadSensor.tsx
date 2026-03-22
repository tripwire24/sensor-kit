"use client";

import { useState, useEffect, useRef } from "react";
import SensorCard from "./SensorCard";

interface GPad {
  index: number;
  id: string;
  axes: number[];
  buttons: boolean[];
  buttonValues: number[];
  connected: boolean;
  mapping: string;
}

export default function GamepadSensor() {
  const [pads, setPads] = useState<GPad[]>([]);
  const [status, setStatus] = useState<"idle" | "active" | "unsupported">("idle");
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!navigator.getGamepads) {
      setStatus("unsupported");
      return;
    }

    const poll = () => {
      const gamepads = Array.from(navigator.getGamepads()).filter(Boolean) as Gamepad[];
      if (gamepads.length > 0) setStatus("active");
      setPads(gamepads.map(g => ({
        index: g.index,
        id: g.id,
        axes: Array.from(g.axes).map(a => +a.toFixed(3)),
        buttons: Array.from(g.buttons).map(b => b.pressed),
        buttonValues: Array.from(g.buttons).map(b => +b.value.toFixed(3)),
        connected: g.connected,
        mapping: g.mapping,
      })));
      rafRef.current = requestAnimationFrame(poll);
    };

    const onConnect = () => { poll(); };
    window.addEventListener("gamepadconnected", onConnect);
    rafRef.current = requestAnimationFrame(poll);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("gamepadconnected", onConnect);
    };
  }, []);

  return (
    <SensorCard title="Gamepad" icon="🎮" status={status} accentColor="#ec4899">
      {pads.length === 0 ? (
        <div className="text-center py-6">
          <div className="text-3xl mb-2">🎮</div>
          <div className="text-xs text-slate-600">Connect a controller and press any button</div>
        </div>
      ) : (
        pads.map(pad => (
          <div key={pad.index} className="space-y-3">
            <div className="text-xs text-slate-400 truncate" title={pad.id}>{pad.id.substring(0, 40)}…</div>

            {/* Joystick visuals */}
            {pad.axes.length >= 2 && (
              <div className="flex gap-3 justify-center">
                {[[pad.axes[0], pad.axes[1]], pad.axes.length >= 4 ? [pad.axes[2], pad.axes[3]] : null]
                  .filter(Boolean).map((pair, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-full border border-pink-500/20 bg-pink-500/5">
                      <div
                        className="absolute w-4 h-4 rounded-full bg-pink-400 transition-none"
                        style={{
                          left: `calc(50% + ${(pair![0] * 20)}px - 8px)`,
                          top: `calc(50% + ${(pair![1] * 20)}px - 8px)`,
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-px h-full bg-pink-500/20" />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-px w-full bg-pink-500/20" />
                      </div>
                    </div>
                  ))
                }
              </div>
            )}

            {/* Buttons grid */}
            <div className="flex flex-wrap gap-1">
              {pad.buttons.map((pressed, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded text-xs flex items-center justify-center font-bold transition-all"
                  style={{
                    background: pressed ? "rgba(236,72,153,0.6)" : "rgba(255,255,255,0.05)",
                    color: pressed ? "#fff" : "#475569",
                    border: pressed ? "1px solid rgba(236,72,153,0.8)" : "1px solid rgba(255,255,255,0.08)",
                    transform: pressed ? "scale(0.9)" : "scale(1)",
                  }}
                >
                  {i}
                </div>
              ))}
            </div>

            {/* Axes values */}
            {pad.axes.map((v, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-slate-600 w-12">Axis {i}</span>
                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-pink-400 rounded-full transition-none"
                    style={{ marginLeft: "50%", width: `${Math.abs(v) * 50}%`, transform: v < 0 ? "translateX(-100%)" : "none" }}
                  />
                </div>
                <span className="text-xs font-mono text-pink-300 w-14 text-right">{v}</span>
              </div>
            ))}
          </div>
        ))
      )}
    </SensorCard>
  );
}
