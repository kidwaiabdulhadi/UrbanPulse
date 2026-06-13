"use client";

import { motion } from "framer-motion";
import {
  Clock, Users, ArrowRight, ShieldCheck, Activity,
  MapPin, RotateCcw, Banknote, TrendingDown, AlertTriangle
} from "lucide-react";
import type { generateRouteResult } from "@/lib/intelligence";

interface Props {
  from: string;
  to: string;
  mode: string;
  value: string;
  result: ReturnType<typeof generateRouteResult>;
  onReset: () => void;
}

export function RouteRecommendation({ from, to, mode, value, result, onReset }: Props) {
  const confidenceColor =
    result.confidence >= 93 ? "text-emerald-400" :
    result.confidence >= 88 ? "text-amber-400" : "text-red-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 space-y-5"
    >
      {/* Journey Header */}
      <div className="pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2 flex-wrap">
          <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
          <span className="font-medium text-white">{from}</span>
          <ArrowRight className="w-4 h-4 shrink-0" />
          <span className="font-medium text-white">{to}</span>
        </div>
        <h2 className="text-xl font-bold text-white">Copilot Recommendation</h2>
        <p className="text-sm text-zinc-400 mt-1">
          Optimised for <span className="text-blue-400 font-semibold">{value}</span>
          {" "}· {mode}
        </p>
        {result.scenario && (
          <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
            <AlertTriangle className="w-3 h-3 inline mr-1 text-amber-500" />
            {result.scenario}
          </p>
        )}
      </div>

      {/* AI Crowd Insight – The WOW Factor */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 relative overflow-hidden">
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-blue-500/20 blur-2xl rounded-full" />
        <div className="flex items-start gap-3 relative z-10">
          <div className="bg-blue-600 rounded-xl p-2 shrink-0 mt-0.5">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-blue-400 font-bold text-sm mb-1">AI Crowd Insight</h3>
            <p className="text-sm text-blue-100/90 leading-relaxed">{result.insightText}</p>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-zinc-400 mb-1.5">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">Travel Time</span>
          </div>
          <p className="text-3xl font-black text-white">{result.travelTime}<span className="text-base font-normal text-zinc-400 ml-1">min</span></p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-zinc-400 mb-1.5">
            <Users className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">Crowd Level</span>
          </div>
          <p className={`text-2xl font-black ${result.crowdColor}`}>
            {result.crowdLabel}
            <span className="text-base font-normal text-zinc-500 ml-1">({result.crowdPct}%)</span>
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-zinc-400 mb-1.5">
            <Banknote className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">Est. Cost</span>
          </div>
          <p className="text-2xl font-black text-white">{result.cost}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
          <div className="flex items-center gap-2 text-zinc-400 mb-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">Confidence</span>
          </div>
          <p className={`text-2xl font-black ${confidenceColor}`}>{result.confidence}%</p>
        </div>
      </div>

      {/* Alternative Route */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-zinc-300">Alternative Route</h3>
          <span className="text-xs text-zinc-500">+{result.altTravelTime - result.travelTime} min</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-xl font-bold text-white">{result.altTravelTime}<span className="text-xs text-zinc-400 ml-0.5">min</span></p>
            <p className="text-xs text-zinc-500">Travel</p>
          </div>
          <div className="flex-1 h-px bg-zinc-800" />
          <div className="text-center">
            <div className="flex items-center gap-1">
              <TrendingDown className="w-4 h-4 text-green-400" />
              <p className={`text-sm font-bold ${result.altCrowdPct < 40 ? "text-green-400" : "text-amber-400"}`}>
                {result.altLabel} ({result.altCrowdPct}%)
              </p>
            </div>
            <p className="text-xs text-zinc-500">Crowd</p>
          </div>
        </div>
      </div>

      <button
        onClick={onReset}
        className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 active:scale-[0.98] text-white font-semibold py-3.5 rounded-2xl transition-all"
      >
        <RotateCcw className="w-4 h-4" />
        Plan Another Route
      </button>
    </motion.div>
  );
}
