"use client";

interface DataRowProps {
  label: string;
  value: string | number | null;
  unit?: string;
  color?: string;
}

export default function DataRow({ label, value, unit = "", color = "text-blue-400" }: DataRowProps) {
  const display = value === null || value === undefined ? "—" : String(value);

  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className={`text-xs font-mono font-medium ${value !== null ? color : "text-slate-600"}`}>
        {display}
        {value !== null && unit && <span className="text-slate-500 ml-1">{unit}</span>}
      </span>
    </div>
  );
}
