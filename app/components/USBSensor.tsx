"use client";

import { useState, useCallback, useEffect } from "react";
import SensorCard from "./SensorCard";
import DataRow from "./DataRow";
import { SensorStatus } from "../hooks/useSensors";

interface USBDev {
  vendorId: number;
  productId: number;
  productName: string | undefined;
  manufacturerName: string | undefined;
  serialNumber: string | undefined;
  usbVersionMajor: number;
  usbVersionMinor: number;
}

export default function USBSensor() {
  const [devices, setDevices] = useState<USBDev[]>([]);
  const [status, setStatus] = useState<SensorStatus>("idle");

  type USBAPI = { getDevices: () => Promise<USBDev[]>; requestDevice: (opts: object) => Promise<USBDev> };

  const refresh = useCallback(async () => {
    const usb = (navigator as Navigator & { usb?: USBAPI }).usb;
    if (!usb) { setStatus("unsupported"); return; }
    try {
      const list = await usb.getDevices();
      setDevices(list);
      setStatus("active");
    } catch {
      setStatus("error");
    }
  }, []);

  const request = useCallback(async () => {
    const usb = (navigator as Navigator & { usb?: USBAPI }).usb;
    if (!usb) { setStatus("unsupported"); return; }
    try {
      await usb.requestDevice({ filters: [] });
      await refresh();
    } catch (e) {
      if ((e as Error).name !== "NotFoundError") setStatus("error");
    }
  }, [refresh]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <SensorCard title="USB Devices" icon="🔌" status={status} accentColor="#f97316">
      {status === "unsupported" ? (
        <p className="text-xs text-slate-600 text-center py-4">WebUSB not supported in this browser</p>
      ) : (
        <>
          <button
            onClick={request}
            className="w-full py-2 rounded-lg text-xs font-medium mb-3 transition-all hover:scale-[1.02] active:scale-95"
            style={{ background: "rgba(249,115,22,0.15)", color: "#fb923c", border: "1px solid rgba(249,115,22,0.3)" }}
          >
            + Request USB device
          </button>

          {devices.length === 0 ? (
            <p className="text-xs text-slate-600 text-center py-2">No USB devices connected</p>
          ) : (
            <div className="space-y-2">
              {devices.map((d, i) => (
                <div key={i} className="p-2 bg-white/3 rounded-lg border border-white/5">
                  <div className="text-xs font-medium text-orange-400 mb-1">
                    {d.productName ?? `Device ${i + 1}`}
                  </div>
                  <DataRow label="Vendor" value={`0x${d.vendorId.toString(16).padStart(4, "0")}`} color="text-orange-300" />
                  <DataRow label="Product" value={`0x${d.productId.toString(16).padStart(4, "0")}`} color="text-amber-300" />
                  <DataRow label="Manufacturer" value={d.manufacturerName ?? null} color="text-slate-400" />
                  <DataRow label="USB version" value={`${d.usbVersionMajor}.${d.usbVersionMinor}`} color="text-slate-400" />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </SensorCard>
  );
}
