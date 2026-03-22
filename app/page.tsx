"use client";

import dynamic from "next/dynamic";

// Original sensors
const MotionSensor = dynamic(() => import("./components/MotionSensor"), { ssr: false });
const OrientationSensor = dynamic(() => import("./components/OrientationSensor"), { ssr: false });
const GeoSensor = dynamic(() => import("./components/GeoSensor"), { ssr: false });
const BatterySensor = dynamic(() => import("./components/BatterySensor"), { ssr: false });
const NetworkSensor = dynamic(() => import("./components/NetworkSensor"), { ssr: false });
const DeviceInfoSensor = dynamic(() => import("./components/DeviceInfoSensor"), { ssr: false });
const ClockSensor = dynamic(() => import("./components/ClockSensor"), { ssr: false });

// New sensors
const MagnetometerSensor = dynamic(() => import("./components/MagnetometerSensor"), { ssr: false });
const AudioSensor = dynamic(() => import("./components/AudioSensor"), { ssr: false });
const BluetoothSensor = dynamic(() => import("./components/BluetoothSensor"), { ssr: false });
const WebRTCSensor = dynamic(() => import("./components/WebRTCSensor"), { ssr: false });
const GamepadSensor = dynamic(() => import("./components/GamepadSensor"), { ssr: false });
const PerformanceSensor = dynamic(() => import("./components/PerformanceSensor"), { ssr: false });
const StorageSensor = dynamic(() => import("./components/StorageSensor"), { ssr: false });
const PermissionsSensor = dynamic(() => import("./components/PermissionsSensor"), { ssr: false });
const DisplaySensor = dynamic(() => import("./components/DisplaySensor"), { ssr: false });
const AmbientLightSensor = dynamic(() => import("./components/AmbientLightSensor"), { ssr: false });
const MediaDevicesSensor = dynamic(() => import("./components/MediaDevicesSensor"), { ssr: false });
const NFCSensor = dynamic(() => import("./components/NFCSensor"), { ssr: false });
const USBSensor = dynamic(() => import("./components/USBSensor"), { ssr: false });
const MIDISensor = dynamic(() => import("./components/MIDISensor"), { ssr: false });
const IdleWakeSensor = dynamic(() => import("./components/IdleWakeSensor"), { ssr: false });
const TouchPointerSensor = dynamic(() => import("./components/TouchPointerSensor"), { ssr: false });
const ShapeDetectionSensor = dynamic(() => import("./components/ShapeDetectionSensor"), { ssr: false });

const SECTIONS = [
  {
    title: "Time & System",
    icon: "⏱️",
    sensors: ["Clock", "Performance", "Storage", "Display"],
  },
  {
    title: "Motion & Orientation",
    icon: "📱",
    sensors: ["Motion", "Orientation", "Magnetometer"],
  },
  {
    title: "Location & Environment",
    icon: "🌍",
    sensors: ["Geo", "AmbientLight", "Battery"],
  },
  {
    title: "Connectivity & Radio",
    icon: "📡",
    sensors: ["Network", "WebRTC", "Bluetooth", "NFC", "USB", "MIDI"],
  },
  {
    title: "Media & Audio",
    icon: "🎵",
    sensors: ["Audio", "MediaDevices", "ShapeDetection"],
  },
  {
    title: "Input & Interaction",
    icon: "🎮",
    sensors: ["Gamepad", "TouchPointer", "IdleWake"],
  },
  {
    title: "Security & Permissions",
    icon: "🔑",
    sensors: ["Permissions", "DeviceInfo"],
  },
];

const SensorMap: Record<string, React.ComponentType> = {
  Clock: ClockSensor,
  Performance: PerformanceSensor,
  Storage: StorageSensor,
  Display: DisplaySensor,
  Motion: MotionSensor,
  Orientation: OrientationSensor,
  Magnetometer: MagnetometerSensor,
  Geo: GeoSensor,
  AmbientLight: AmbientLightSensor,
  Battery: BatterySensor,
  Network: NetworkSensor,
  WebRTC: WebRTCSensor,
  Bluetooth: BluetoothSensor,
  NFC: NFCSensor,
  USB: USBSensor,
  MIDI: MIDISensor,
  Audio: AudioSensor,
  MediaDevices: MediaDevicesSensor,
  ShapeDetection: ShapeDetectionSensor,
  Gamepad: GamepadSensor,
  TouchPointer: TouchPointerSensor,
  IdleWake: IdleWakeSensor,
  Permissions: PermissionsSensor,
  DeviceInfo: DeviceInfoSensor,
};

const totalSensors = Object.keys(SensorMap).length;

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      {/* Background gradient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-80 h-80 rounded-full bg-violet-600/8 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 rounded-full bg-emerald-600/8 blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-64 h-64 rounded-full bg-pink-600/6 blur-3xl" />
      </div>

      {/* Sticky header */}
      <header className="relative z-10 border-b border-white/5 bg-black/30 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-lg">
              🔬
            </div>
            <div>
              <h1 className="font-bold text-slate-100 text-lg leading-tight">Sensor Kit</h1>
              <p className="text-xs text-slate-500">Device Sensor Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-600 hidden sm:block">{totalSensors} sensors</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-ring" />
              <span className="text-xs text-slate-500 hidden sm:block">Live</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 py-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-400 text-xs font-medium mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 pulse-ring" />
          Progressive Web App · {totalSensors} Sensors
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-3">
          Every Signal Your Device Can See,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-violet-400 to-pink-400">
            All in One Place
          </span>
        </h2>
        <p className="text-slate-500 max-w-2xl mx-auto text-sm sm:text-base">
          Motion, orientation, GPS, Bluetooth, WebRTC, audio, NFC, USB, MIDI, gamepad, ambient light, performance, storage — real-time, on-device, private.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 text-xs text-slate-600">
          <span>💡</span>
          <span>Install via &ldquo;Add to Home Screen&rdquo; for the full native experience</span>
        </div>
      </section>

      {/* Sensor sections */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pb-20 space-y-12">
        {SECTIONS.map(section => (
          <div key={section.title}>
            {/* Section header */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-xl">{section.icon}</span>
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">{section.title}</h3>
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-xs text-slate-700">{section.sensors.length}</span>
            </div>

            {/* Sensor grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {section.sensors.map(name => {
                const Component = SensorMap[name];
                return Component ? <Component key={name} /> : null;
              })}
            </div>
          </div>
        ))}

        <div className="text-center text-xs text-slate-700 pt-4">
          <p>All sensor data is processed locally on your device. Nothing is sent to any server.</p>
          <p className="mt-1">Some sensors require permissions, HTTPS, and Chrome/Chromium-based browsers.</p>
        </div>
      </div>
    </main>
  );
}
