"use client";

import { useState, useCallback, useRef } from "react";
import SensorCard from "./SensorCard";
import DataRow from "./DataRow";
import { SensorStatus } from "../hooks/useSensors";

interface DetectedFace {
  x: number; y: number; width: number; height: number;
}
interface DetectedBarcode {
  rawValue: string;
  format: string;
}

export default function ShapeDetectionSensor() {
  const [status, setStatus] = useState<SensorStatus>("idle");
  const [faces, setFaces] = useState<DetectedFace[]>([]);
  const [barcodes, setBarcodes] = useState<DetectedBarcode[]>([]);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const start = useCallback(async () => {
    const FaceDetector = (window as unknown as Record<string, unknown>)["FaceDetector"] as (new () => { detect: (img: HTMLVideoElement) => Promise<Array<{ boundingBox: DOMRectReadOnly }>> }) | undefined;
    const BarcodeDetector = (window as unknown as Record<string, unknown>)["BarcodeDetector"] as (new () => { detect: (img: HTMLVideoElement) => Promise<Array<{ rawValue: string; format: string }>> }) | undefined;

    if (!FaceDetector && !BarcodeDetector) {
      setStatus("unsupported");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStatus("active");
      setScanning(true);

      const faceDetector = FaceDetector ? new FaceDetector() : null;
      const barcodeDetector = BarcodeDetector ? new BarcodeDetector() : null;

      const detect = async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) {
          rafRef.current = requestAnimationFrame(detect);
          return;
        }
        try {
          if (faceDetector) {
            const detected = await faceDetector.detect(videoRef.current);
            setFaces(detected.map(f => ({
              x: f.boundingBox.x, y: f.boundingBox.y,
              width: f.boundingBox.width, height: f.boundingBox.height,
            })));
          }
          if (barcodeDetector) {
            const detected = await barcodeDetector.detect(videoRef.current);
            if (detected.length > 0) {
              setBarcodes(detected.map(b => ({ rawValue: b.rawValue, format: b.format })));
            }
          }
        } catch { /* frame error */ }
        rafRef.current = requestAnimationFrame(detect);
      };
      rafRef.current = requestAnimationFrame(detect);
    } catch (e) {
      if ((e as Error).name === "NotAllowedError") setStatus("denied");
      else setStatus("unsupported");
    }
  }, []);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    setScanning(false);
    setStatus("idle");
    setFaces([]);
    setBarcodes([]);
  }, []);

  return (
    <SensorCard title="Shape Detection" icon="🔍" status={status} onStart={start} accentColor="#06b6d4">
      {status === "unsupported" ? (
        <p className="text-xs text-slate-600 text-center py-4">Shape Detection API not supported (Chrome only)</p>
      ) : (
        <>
          {/* Video preview */}
          <div className="relative rounded-xl overflow-hidden bg-black/40 my-3" style={{ aspectRatio: "4/3" }}>
            <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
            {!scanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs text-slate-600">Camera off</span>
              </div>
            )}
          </div>

          {scanning && (
            <button
              onClick={stop}
              className="w-full py-1.5 rounded-lg text-xs font-medium mb-3 transition-all"
              style={{ background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.3)" }}
            >
              Stop camera
            </button>
          )}

          <DataRow label="Faces detected" value={faces.length > 0 ? faces.length : scanning ? 0 : null} color="text-cyan-400" />
          <DataRow label="Barcodes found" value={barcodes.length > 0 ? barcodes.length : null} color="text-teal-400" />
          {barcodes.slice(0, 3).map((b, i) => (
            <div key={i} className="mt-1 p-2 bg-white/3 rounded-lg">
              <div className="text-xs text-cyan-300 font-mono break-all">{b.rawValue.substring(0, 60)}</div>
              <div className="text-xs text-slate-500">{b.format}</div>
            </div>
          ))}
        </>
      )}
    </SensorCard>
  );
}
