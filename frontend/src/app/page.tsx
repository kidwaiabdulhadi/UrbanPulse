"use client";

import { useState } from "react";
import { DigitalTwinPanel } from "@/components/transit/DigitalTwinPanel";
import { NotificationCenter } from "@/components/layout/NotificationCenter";
import { AgentChatPanel } from "@/components/transit/AgentChatPanel";
import { MapWrapper } from "@/components/transit/MapWrapper";
import Link from "next/link";
import { Smartphone, Brain, GitBranch, Zap, TrendingDown } from "lucide-react";
import type { Station } from "@/lib/intelligence";

// Hero KPI strip — communicates the value proposition in 3 seconds
const HERO_KPIS = [
  { icon: Brain,       value: "94.8%",       label: "Prediction Accuracy",    color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20"    },
  { icon: TrendingDown, value: "−51%",        label: "Congestion Reduction",   color: "text-green-400",  bg: "bg-green-500/10 border-green-500/20"  },
  { icon: Zap,          value: "< 90s",       label: "Intervention Response",  color: "text-amber-400",  bg: "bg-amber-500/10 border-amber-500/20"  },
  { icon: GitBranch,    value: "6 Stations",  label: "Network Coverage",       color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
];

export default function DashboardPage() {
  const [activeStation, setActiveStation] = useState<Station | undefined>();

  return (
    <main className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto px-5 py-6 lg:px-8 space-y-6">

        {/* ── HEADER ────────────────────────────────────────────────────────── */}
        <header className="flex flex-wrap justify-between items-start gap-4 border-b border-zinc-800/80 pb-5">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/25 flex items-center justify-center">
                <Brain className="w-4 h-4 text-blue-400" />
              </div>
              <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                UrbanPulse AI
              </h1>
            </div>
            <p className="text-zinc-400 text-sm max-w-lg">
              Predictive crowd intelligence for transit operators. Forecasts overcrowding before it happens, recommends interventions, and helps commuters route smarter.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Link href="/commuter"
              className="flex items-center gap-2 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-400 text-sm font-semibold py-2 px-4 rounded-full transition-all">
              <Smartphone className="w-4 h-4" />
              Commuter Copilot
            </Link>
            <div className="h-5 w-px bg-zinc-800 hidden sm:block" />
            <NotificationCenter />
            <div className="flex items-center gap-2 bg-zinc-900/60 px-3 py-1.5 rounded-full border border-zinc-800">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-xs font-semibold tracking-wide text-green-400 uppercase">Operational</span>
            </div>
          </div>
        </header>

        {/* ── HERO KPI STRIP ─────────────────────────────────────────────────
             Communicates value proposition within 3 seconds of page load      */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {HERO_KPIS.map(({ icon: Icon, value, label, color, bg }) => (
            <div key={label} className={`flex items-center gap-3 p-3.5 rounded-xl border ${bg}`}>
              <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${bg}`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div>
                <p className={`text-lg font-black leading-none ${color}`}>{value}</p>
                <p className="text-xs text-zinc-500 mt-0.5 leading-tight">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Station sync indicator */}
        {activeStation && (
          <div className="flex items-center gap-2 text-sm text-zinc-400 animate-in fade-in slide-in-from-top-1 duration-200">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Digital Twin synced to
            <span className="text-white font-semibold">{activeStation.name}</span>
            <span className="text-zinc-600">·</span>
            <button onClick={() => setActiveStation(undefined)}
              className="text-zinc-600 hover:text-zinc-400 text-xs transition-colors">
              Reset
            </button>
          </div>
        )}

        {/* ── MAIN GRID ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Map */}
          <div className="lg:col-span-7">
            <MapWrapper onStationSelect={setActiveStation} />
          </div>

          {/* Right column */}
          <div className="lg:col-span-5 space-y-5">
            <DigitalTwinPanel activeStation={activeStation} />
            <AgentChatPanel />
          </div>
        </div>

      </div>
    </main>
  );
}
