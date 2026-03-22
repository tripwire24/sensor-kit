"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface MotionData {
  x: number | null;
  y: number | null;
  z: number | null;
  interval: number | null;
}

export interface OrientationData {
  alpha: number | null;
  beta: number | null;
  gamma: number | null;
  absolute: boolean;
}

export interface GeoData {
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  accuracy: number | null;
  speed: number | null;
  heading: number | null;
}

export interface BatteryData {
  level: number | null;
  charging: boolean | null;
  chargingTime: number | null;
  dischargingTime: number | null;
}

export interface NetworkData {
  online: boolean;
  effectiveType: string | null;
  downlink: number | null;
  rtt: number | null;
  saveData: boolean | null;
}

export type SensorStatus = "idle" | "active" | "error" | "denied" | "unsupported";

export function useMotion() {
  const [acceleration, setAcceleration] = useState<MotionData>({ x: null, y: null, z: null, interval: null });
  const [rotationRate, setRotationRate] = useState<MotionData>({ x: null, y: null, z: null, interval: null });
  const [status, setStatus] = useState<SensorStatus>("idle");

  const start = useCallback(() => {
    if (typeof window === "undefined" || !window.DeviceMotionEvent) {
      setStatus("unsupported");
      return;
    }

    const handler = (e: DeviceMotionEvent) => {
      setStatus("active");
      if (e.acceleration) {
        setAcceleration({
          x: e.acceleration.x !== null ? +e.acceleration.x.toFixed(3) : null,
          y: e.acceleration.y !== null ? +e.acceleration.y.toFixed(3) : null,
          z: e.acceleration.z !== null ? +e.acceleration.z.toFixed(3) : null,
          interval: e.interval,
        });
      }
      if (e.rotationRate) {
        setRotationRate({
          x: e.rotationRate.alpha !== null ? +e.rotationRate.alpha.toFixed(3) : null,
          y: e.rotationRate.beta !== null ? +e.rotationRate.beta.toFixed(3) : null,
          z: e.rotationRate.gamma !== null ? +e.rotationRate.gamma.toFixed(3) : null,
          interval: e.interval,
        });
      }
    };

    // iOS 13+ requires permission
    if (typeof (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === "function") {
      (DeviceMotionEvent as unknown as { requestPermission: () => Promise<string> })
        .requestPermission()
        .then((state) => {
          if (state === "granted") {
            window.addEventListener("devicemotion", handler);
          } else {
            setStatus("denied");
          }
        })
        .catch(() => setStatus("error"));
    } else {
      window.addEventListener("devicemotion", handler);
    }

    return () => window.removeEventListener("devicemotion", handler);
  }, []);

  return { acceleration, rotationRate, status, start };
}

export function useOrientation() {
  const [data, setData] = useState<OrientationData>({ alpha: null, beta: null, gamma: null, absolute: false });
  const [status, setStatus] = useState<SensorStatus>("idle");

  const start = useCallback(() => {
    if (typeof window === "undefined" || !window.DeviceOrientationEvent) {
      setStatus("unsupported");
      return;
    }

    const handler = (e: DeviceOrientationEvent) => {
      setStatus("active");
      setData({
        alpha: e.alpha !== null ? +e.alpha.toFixed(2) : null,
        beta: e.beta !== null ? +e.beta.toFixed(2) : null,
        gamma: e.gamma !== null ? +e.gamma.toFixed(2) : null,
        absolute: e.absolute,
      });
    };

    if (typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === "function") {
      (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> })
        .requestPermission()
        .then((state) => {
          if (state === "granted") {
            window.addEventListener("deviceorientation", handler);
          } else {
            setStatus("denied");
          }
        })
        .catch(() => setStatus("error"));
    } else {
      window.addEventListener("deviceorientation", handler);
    }

    return () => window.removeEventListener("deviceorientation", handler);
  }, []);

  return { data, status, start };
}

export function useGeolocation() {
  const [data, setData] = useState<GeoData>({
    latitude: null, longitude: null, altitude: null,
    accuracy: null, speed: null, heading: null,
  });
  const [status, setStatus] = useState<SensorStatus>("idle");
  const watchIdRef = useRef<number | null>(null);

  const start = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setStatus("unsupported");
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setStatus("active");
        setData({
          latitude: +pos.coords.latitude.toFixed(6),
          longitude: +pos.coords.longitude.toFixed(6),
          altitude: pos.coords.altitude !== null ? +pos.coords.altitude.toFixed(1) : null,
          accuracy: +pos.coords.accuracy.toFixed(1),
          speed: pos.coords.speed !== null ? +pos.coords.speed.toFixed(2) : null,
          heading: pos.coords.heading !== null ? +pos.coords.heading.toFixed(1) : null,
        });
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) setStatus("denied");
        else setStatus("error");
      },
      { enableHighAccuracy: true, maximumAge: 1000 }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return { data, status, start };
}

export function useBattery() {
  const [data, setData] = useState<BatteryData>({ level: null, charging: null, chargingTime: null, dischargingTime: null });
  const [status, setStatus] = useState<SensorStatus>("idle");

  const start = useCallback(async () => {
    if (typeof window === "undefined") return;
    const nav = navigator as Navigator & { getBattery?: () => Promise<BatteryManager> };
    if (!nav.getBattery) {
      setStatus("unsupported");
      return;
    }

    try {
      const battery = await nav.getBattery();
      const update = () => {
        setStatus("active");
        setData({
          level: battery.level,
          charging: battery.charging,
          chargingTime: battery.chargingTime,
          dischargingTime: battery.dischargingTime,
        });
      };
      update();
      battery.addEventListener("levelchange", update);
      battery.addEventListener("chargingchange", update);
    } catch {
      setStatus("error");
    }
  }, []);

  return { data, status, start };
}

export function useNetwork() {
  const [data, setData] = useState<NetworkData>({ online: true, effectiveType: null, downlink: null, rtt: null, saveData: null });

  useEffect(() => {
    const update = () => {
      const conn = (navigator as Navigator & { connection?: { effectiveType: string; downlink: number; rtt: number; saveData: boolean } }).connection;
      setData({
        online: navigator.onLine,
        effectiveType: conn?.effectiveType ?? null,
        downlink: conn?.downlink ?? null,
        rtt: conn?.rtt ?? null,
        saveData: conn?.saveData ?? null,
      });
    };

    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    const conn = (navigator as Navigator & { connection?: EventTarget }).connection;
    conn?.addEventListener("change", update);

    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      conn?.removeEventListener("change", update);
    };
  }, []);

  return data;
}

interface BatteryManager extends EventTarget {
  level: number;
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
}
