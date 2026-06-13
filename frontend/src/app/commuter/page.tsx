"use client";

import Link from "next/link";
import { ArrowLeft, Activity, Cpu } from "lucide-react";
import { MapWrapper } from "@/components/transit/MapWrapper";
import { CommuterCopilot } from "@/components/transit/CommuterCopilot";

export default function CommuterPage() {
  return (
    <main className="relative w-full h-screen bg-zinc-950 overflow-hidden selection:bg-blue-500/30">
      {/* Full Bleed Map Background */}
      <div className="absolute inset-0 z-0">
        <MapWrapper />
      </div>

      {/* Dark overlay gradient so the copilot panel is always legible */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-r from-zinc-950/95 via-zinc-950/60 to-transparent pointer-events-none" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-zinc-950/80 via-transparent to-zinc-950/50 pointer-events-none" />

      {/* Top Navigation */}
      <header className="absolute top-0 left-0 w-full z-20 px-6 py-5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-500/15 rounded-xl flex items-center justify-center border border-blue-500/25 backdrop-blur-sm">
            <Activity className="w-4.5 h-4.5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-none">UrbanPulse AI</h1>
            <p className="text-blue-400 text-[10px] font-semibold uppercase tracking-[0.12em] mt-0.5">Commuter Copilot</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <Cpu className="w-3 h-3" />
            Crowd Intelligence Active
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 bg-zinc-900/80 hover:bg-zinc-800/90 backdrop-blur-md border border-zinc-700 text-sm font-semibold text-zinc-300 hover:text-white py-2 px-4 rounded-full transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Operator Center
          </Link>
        </div>
      </header>

      {/* Floating Copilot Panel */}
      <div className="absolute top-20 left-5 bottom-5 z-10 flex items-start overflow-y-auto pointer-events-none"
        style={{ maxWidth: "420px", width: "calc(100% - 40px)" }}>
        <div className="pointer-events-auto w-full pb-4">
          <CommuterCopilot />
        </div>
      </div>
    </main>
  );
}
