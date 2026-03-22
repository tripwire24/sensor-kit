"use client";

import { useState, useEffect } from "react";
import SensorCard from "./SensorCard";
import DataRow from "./DataRow";

interface NetworkInfo {
  localIPs: string[];
  publicIP: string | null;
  natType: string | null;
  iceServers: string[];
}

function parseCandidate(candidate: string) {
  // Extract IP from ICE candidate string
  const match = candidate.match(/candidate:\S+ \d+ \S+ \d+ (\S+) \d+ typ (\S+)/);
  return match ? { ip: match[1], type: match[2] } : null;
}

export default function WebRTCSensor() {
  const [info, setInfo] = useState<NetworkInfo>({ localIPs: [], publicIP: null, natType: null, iceServers: [] });
  const [status, setStatus] = useState<"idle" | "active" | "error">("idle");

  useEffect(() => {
    let pc: RTCPeerConnection | null = null;
    try {
      pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
      pc.createDataChannel("");

      const localIPs = new Set<string>();
      const servers: string[] = [];
      let natType = "Unknown";

      pc.onicecandidate = (e) => {
        if (!e.candidate) {
          // Gathering complete
          setInfo({
            localIPs: Array.from(localIPs).filter(ip => !ip.startsWith("0.")),
            publicIP: Array.from(localIPs).find(ip => !ip.startsWith("192.") && !ip.startsWith("10.") && !ip.startsWith("172.") && !ip.startsWith("fd") && !ip.includes(":")) ?? null,
            natType,
            iceServers: servers,
          });
          setStatus("active");
          return;
        }

        const parsed = parseCandidate(e.candidate.candidate);
        if (parsed) {
          localIPs.add(parsed.ip);
          if (parsed.type === "srflx") {
            natType = "NAT (STUN reachable)";
            servers.push(parsed.ip);
          } else if (parsed.type === "relay") {
            natType = "Symmetric NAT (TURN needed)";
          } else if (parsed.type === "host") {
            if (natType === "Unknown") natType = "Direct / No NAT";
          }
        }
      };

      pc.createOffer().then(offer => pc!.setLocalDescription(offer));
    } catch {
      setStatus("error");
    }

    return () => { pc?.close(); };
  }, []);

  const isPrivate = (ip: string) =>
    ip.startsWith("192.168.") || ip.startsWith("10.") || ip.startsWith("172.") || ip.includes(":");

  return (
    <SensorCard title="WebRTC Network" icon="🌐" status={status} accentColor="#8b5cf6">
      <div className="space-y-1 my-2">
        {info.localIPs.length === 0 && status !== "active" ? (
          <div className="text-xs text-slate-600 text-center py-3">Gathering ICE candidates…</div>
        ) : (
          <>
            <div className="text-xs text-slate-600 uppercase tracking-wider mb-2">Discovered IPs</div>
            {info.localIPs.map(ip => (
              <div key={ip} className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="text-xs font-mono text-violet-300">{ip}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${isPrivate(ip) ? "bg-slate-700 text-slate-400" : "bg-violet-500/20 text-violet-300"}`}>
                  {isPrivate(ip) ? "local" : "public"}
                </span>
              </div>
            ))}
          </>
        )}
      </div>

      <DataRow label="Public IP" value={info.publicIP ?? (status === "active" ? "Behind NAT" : null)} color="text-violet-400" />
      <DataRow label="NAT type" value={info.natType} color="text-purple-400" />
      <DataRow label="Local IPs found" value={info.localIPs.length || null} color="text-indigo-400" />
      <DataRow label="STUN servers" value={info.iceServers.length || null} color="text-slate-400" />
    </SensorCard>
  );
}
