"use client";

import { useState, useCallback } from "react";
import SensorCard from "./SensorCard";
import DataRow from "./DataRow";
import { SensorStatus } from "../hooks/useSensors";

interface MIDIPort {
  id: string;
  name: string | undefined;
  manufacturer: string | undefined;
  type: string;
  state: string;
  connection: string;
}

interface MIDIMessage {
  channel: number;
  type: string;
  note?: number;
  velocity?: number;
  controller?: number;
  value?: number;
  timestamp: number;
}

const NOTE_NAMES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const noteStr = (n: number) => `${NOTE_NAMES[n % 12]}${Math.floor(n / 12) - 1}`;

const msgType = (status: number) => {
  const type = status & 0xF0;
  if (type === 0x80) return "Note Off";
  if (type === 0x90) return "Note On";
  if (type === 0xA0) return "Aftertouch";
  if (type === 0xB0) return "Control";
  if (type === 0xC0) return "Program";
  if (type === 0xD0) return "Ch Pressure";
  if (type === 0xE0) return "Pitch Bend";
  return `0x${type.toString(16)}`;
};

export default function MIDISensor() {
  const [ports, setPorts] = useState<MIDIPort[]>([]);
  const [messages, setMessages] = useState<MIDIMessage[]>([]);
  const [status, setStatus] = useState<SensorStatus>("idle");

  const start = useCallback(async () => {
    const nav = navigator as Navigator & { requestMIDIAccess?: (opts?: object) => Promise<{
      inputs: Map<string, { id: string; name?: string; manufacturer?: string; type: string; state: string; connection: string; onmidimessage: ((e: { data: Uint8Array; timeStamp: number }) => void) | null }>;
      outputs: Map<string, { id: string; name?: string; manufacturer?: string; type: string; state: string; connection: string }>;
    }> };

    if (!nav.requestMIDIAccess) { setStatus("unsupported"); return; }

    try {
      const access = await nav.requestMIDIAccess({ sysex: false });
      setStatus("active");

      const allPorts: MIDIPort[] = [];
      access.inputs.forEach(p => allPorts.push({ id: p.id, name: p.name ?? undefined, manufacturer: p.manufacturer ?? undefined, type: p.type, state: p.state, connection: p.connection }));
      access.outputs.forEach(p => allPorts.push({ id: p.id, name: p.name ?? undefined, manufacturer: p.manufacturer ?? undefined, type: p.type, state: p.state, connection: p.connection }));
      setPorts(allPorts);

      access.inputs.forEach(input => {
        input.onmidimessage = (e) => {
          const [statusByte, data1, data2] = Array.from(e.data ?? []);
          const channel = (statusByte & 0x0F) + 1;
          const type = msgType(statusByte);
          const msg: MIDIMessage = {
            channel, type, timestamp: e.timeStamp,
            note: data1,
            velocity: data2,
          };
          setMessages(prev => [msg, ...prev.slice(0, 9)]);
        };
      });
    } catch (e) {
      if ((e as Error).name === "SecurityError") setStatus("denied");
      else setStatus("error");
    }
  }, []);

  return (
    <SensorCard title="MIDI" icon="🎵" status={status} onStart={start} accentColor="#ec4899">
      {status === "unsupported" ? (
        <p className="text-xs text-slate-600 text-center py-4">Web MIDI not supported</p>
      ) : status === "idle" ? (
        <div className="text-center py-4">
          <div className="text-3xl mb-2">🎹</div>
          <p className="text-xs text-slate-500">Connect a MIDI device and tap Enable</p>
        </div>
      ) : (
        <>
          <div className="text-xs text-slate-600 uppercase tracking-wider mb-2">Ports ({ports.length})</div>
          {ports.length === 0 ? (
            <p className="text-xs text-slate-600 mb-3">No MIDI devices found</p>
          ) : (
            <div className="space-y-1 mb-3">
              {ports.map(p => (
                <div key={p.id} className="flex items-center justify-between py-1 border-b border-white/5">
                  <div>
                    <span className="text-xs text-pink-300">{p.name ?? "Unknown"}</span>
                    <span className="text-xs text-slate-600 ml-2">{p.type}</span>
                  </div>
                  <span className={`text-xs ${p.state === "connected" ? "text-emerald-400" : "text-slate-500"}`}>
                    {p.state}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="text-xs text-slate-600 uppercase tracking-wider mb-2">Live Messages</div>
          {messages.length === 0 ? (
            <p className="text-xs text-slate-600">Play something…</p>
          ) : (
            <div className="space-y-1 font-mono">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-xs py-1 border-b border-white/5 transition-opacity"
                  style={{ opacity: 1 - i * 0.09 }}
                >
                  <span className="text-pink-400 w-16">{m.type}</span>
                  <span className="text-slate-400">ch{m.channel}</span>
                  {m.note !== undefined && <span className="text-yellow-300">{noteStr(m.note)}</span>}
                  {m.velocity !== undefined && <span className="text-slate-500">vel:{m.velocity}</span>}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </SensorCard>
  );
}
