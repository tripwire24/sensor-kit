"use client";

import dynamic from "next/dynamic";

// Dynamically import all sensor components (client-only, no SSR)
const MotionSensor = dynamic(() => import("./components/MotionSensor"), { ssr: false });
const OrientationSensor = dynamic(() => import("./components/OrientationSensor"), { ssr: false });
const GeoSensor = dynamic(() => import("./components/GeoSensor"), { ssr: false });
const BatterySensor = dynamic(() => import("./components/BatterySensor"), { ssr: false });
const NetworkSensor = dynamic(() => import("./components/NetworkSensor"), { ssr: false });
const DeviceInfoSensor = dynamic(() => import("./components/DeviceInfoSensor"), { ssr: false });
const ClockSensor = dynamic(() => import("./components/ClockSensor"), { ssr: false });

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-80 h-80 rounded-full bg-violet-600/8 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full bg-emerald-600/8 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-black/20 backdrop-blur-sm sticky top-0">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-lg">
              🔬
            </div>
            <div>
              <h1 className="font-bold text-slate-100 text-lg leading-tight">Sensor Kit</h1>
              <p className="text-xs text-slate-500">Device Sensor Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-ring" />
            <span className="text-xs text-slate-500 hidden sm:block">Live</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 py-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-400 text-xs font-medium mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 pulse-ring" />
          Progressive Web App
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-3">
          All Your Device Sensors,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
            One Dashboard
          </span>
        </h2>
        <p className="text-slate-500 max-w-xl mx-auto text-sm sm:text-base">
          Real-time data from your device&apos;s built-in sensors — motion, orientation, location, battery, network, and more.
          Install as a PWA for the full native experience.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 text-xs text-slate-600">
          <span>💡</span>
          <span>Tip: Use &ldquo;Add to Home Screen&rdquo; to install as an app</span>
        </div>
      </section>

      {/* Sensor grid */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ClockSensor />
          <NetworkSensor />
          <DeviceInfoSensor />
          <MotionSensor />
          <OrientationSensor />
          <GeoSensor />
          <BatterySensor />
        </div>

        <div className="mt-8 text-center text-xs text-slate-700">
          <p>Sensor data stays on your device. Nothing is sent to any server.</p>
          <p className="mt-1">Some sensors require device permissions and HTTPS.</p>
        </div>
      </section>
    </main>
  );
}
