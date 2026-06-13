"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from "recharts";

interface SimulationData {
  time: string;
  baseline: number;
  mitigated: number | null;
}

export function SimulationChart({ data }: { data: SimulationData[] }) {
  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradBaseline" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gradMitigated" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
          <XAxis dataKey="time" stroke="#52525b" tick={{ fontSize: 11, fill: "#71717a" }} />
          <YAxis stroke="#52525b" tick={{ fontSize: 11, fill: "#71717a" }} domain={[0, 250]} />
          <ReferenceLine y={200} stroke="#ef4444" strokeDasharray="4 4" strokeOpacity={0.5}
            label={{ value: "Capacity", position: "insideTopRight", fontSize: 10, fill: "#ef4444" }} />
          <Tooltip
            contentStyle={{ backgroundColor: "#09090b", border: "1px solid #27272a", borderRadius: "10px", color: "#fff", fontSize: 12 }}
            itemStyle={{ color: "#a1a1aa" }}
          />
          <Legend
            formatter={(value) => <span className="text-xs text-zinc-400">{value}</span>}
            wrapperStyle={{ fontSize: 11 }}
          />
          <Area type="monotone" dataKey="baseline" name="Baseline (No Action)"
            stroke="#ef4444" strokeWidth={1.5} fill="url(#gradBaseline)" connectNulls />
          <Area type="monotone" dataKey="mitigated" name="With Intervention"
            stroke="#22c55e" strokeWidth={2} fill="url(#gradMitigated)" connectNulls />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
