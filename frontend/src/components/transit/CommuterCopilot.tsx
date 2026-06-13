"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Navigation, MapPin, Search, Bus, Train, Car,
  Footprints, Bike, Sparkles, Loader2, Target, ChevronLeft,
  Clock, Timer
} from "lucide-react";
import { RouteRecommendation } from "./RouteRecommendation";
import { generateRouteResult } from "@/lib/intelligence";

type Step = 1 | 2 | 3 | 4 | "loading" | "result";

const DESTINATIONS = [
  "Central Hub",
  "Airport Terminal",
  "University District",
  "Business Bay",
  "Stadium",
  "Downtown",
];

const MODES = [
  { name: "Metro",       icon: Train },
  { name: "Bus",         icon: Bus },
  { name: "Taxi",        icon: Car },
  { name: "Walking",     icon: Footprints },
  { name: "Cycling",     icon: Bike },
  { name: "Fastest Mix", icon: Sparkles },
];

const VALUES = [
  "Fastest arrival",
  "Least crowded journey",
  "Lowest cost",
  "Most comfortable",
  "Accessible route",
];

const LOADING_STEPS = [
  "Querying live sensor telemetry…",
  "Running crowd-flow predictions…",
  "Evaluating 12 route alternatives…",
  "Applying preference optimisation…",
  "Generating AI crowd insights…",
];

const stepVariants = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
};

// Progress indicator
function StepDots({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {[1, 2, 3, 4].map((s) => (
        <div
          key={s}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            s < current ? "w-6 bg-blue-500" : s === current ? "w-8 bg-blue-400" : "w-4 bg-zinc-700"
          }`}
        />
      ))}
    </div>
  );
}

export function CommuterCopilot() {
  const [step, setStep] = useState<Step>(1);
  const [from, setFrom] = useState("");
  const [manualFrom, setManualFrom] = useState("");
  const [to, setTo] = useState("");
  const [mode, setMode] = useState("");
  const [value, setValue] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<ReturnType<typeof generateRouteResult> | null>(null);

  const goBack = () => {
    setStep((s) => {
      if (s === 2) return 1;
      if (s === 3) return 2;
      if (s === 4) return 3;
      return 1;
    });
  };

  const submitJourney = useCallback((selectedValue: string) => {
    setStep("loading");
    setLoadingStep(0);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setLoadingStep(i);
      if (i >= LOADING_STEPS.length - 1) clearInterval(interval);
    }, 380);

    setTimeout(() => {
      clearInterval(interval);
      const r = generateRouteResult({ from, to, mode, value: selectedValue });
      setResult(r);
      setStep("result");
    }, 2100);
  }, [from, to, mode]);

  const reset = () => {
    setFrom(""); setManualFrom(""); setTo(""); setMode(""); setValue("");
    setResult(null);
    setStep(1);
  };

  return (
    <div className="bg-zinc-950/85 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
      <AnimatePresence mode="wait">

        {/* ── STEP 1: Starting Point ── */}
        {step === 1 && (
          <motion.div key="step1" variants={stepVariants} initial="initial" animate="animate" exit="exit"
            transition={{ duration: 0.22 }} className="p-6 space-y-5">
            <StepDots current={1} />
            <div>
              <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-1">Step 1 of 4</p>
              <h2 className="text-2xl font-bold text-white">Where are you starting?</h2>
              <p className="text-sm text-zinc-400 mt-1">We'll calculate live crowd conditions from your origin.</p>
            </div>
            <button
              onClick={() => { setFrom("Current Location"); setStep(2); }}
              className="w-full flex items-center gap-3 p-4 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white rounded-2xl transition-all font-semibold shadow-lg shadow-blue-900/40"
            >
              <Navigation className="w-5 h-5 shrink-0" />
              <div className="text-left">
                <div>Use Current Location</div>
                <div className="text-xs text-blue-200/70 font-normal">GPS detected • London, UK</div>
              </div>
            </button>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="text"
                placeholder="Or type any starting point…"
                value={manualFrom}
                onChange={(e) => setManualFrom(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && manualFrom.trim()) {
                    setFrom(manualFrom.trim()); setStep(2);
                  }
                }}
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-zinc-600"
              />
            </div>
            {manualFrom.trim() && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                className="space-y-1">
                {DESTINATIONS.filter(d => d.toLowerCase().includes(manualFrom.toLowerCase())).slice(0, 3).map(d => (
                  <button key={d} onClick={() => { setFrom(d); setStep(2); }}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-white text-sm rounded-xl transition-all">
                    <MapPin className="w-4 h-4 text-zinc-500 shrink-0" />
                    {d}
                  </button>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── STEP 2: Destination ── */}
        {step === 2 && (
          <motion.div key="step2" variants={stepVariants} initial="initial" animate="animate" exit="exit"
            transition={{ duration: 0.22 }} className="p-6 space-y-5">
            <StepDots current={2} />
            <div className="flex items-center gap-3">
              <button onClick={goBack} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Step 2 of 4</p>
                <h2 className="text-2xl font-bold text-white">Where to?</h2>
              </div>
            </div>
            <p className="text-sm text-zinc-400">Select your destination — we'll fetch live crowd levels.</p>
            <div className="space-y-2">
              {DESTINATIONS.map((dest) => {
                const crowdIcons: Record<string, { color: string; label: string }> = {
                  "Central Hub": { color: "text-red-400", label: "Critical" },
                  "Airport Terminal": { color: "text-amber-400", label: "Moderate" },
                  "Stadium": { color: "text-amber-400", label: "Moderate" },
                  "Business Bay": { color: "text-amber-400", label: "Moderate" },
                  "University District": { color: "text-green-400", label: "Low" },
                  "Downtown": { color: "text-green-400", label: "Low" },
                };
                const info = crowdIcons[dest] ?? { color: "text-zinc-400", label: "—" };
                return (
                  <button key={dest} onClick={() => { setTo(dest); setStep(3); }}
                    className="w-full flex items-center gap-3 p-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-white rounded-2xl transition-all group">
                    <MapPin className="w-5 h-5 text-blue-400 shrink-0" />
                    <span className="font-medium flex-1 text-left">{dest}</span>
                    <span className={`text-xs font-semibold ${info.color}`}>{info.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: Travel Mode ── */}
        {step === 3 && (
          <motion.div key="step3" variants={stepVariants} initial="initial" animate="animate" exit="exit"
            transition={{ duration: 0.22 }} className="p-6 space-y-5">
            <StepDots current={3} />
            <div className="flex items-center gap-3">
              <button onClick={goBack} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Step 3 of 4</p>
                <h2 className="text-2xl font-bold text-white">Preferred Mode</h2>
              </div>
            </div>
            <p className="text-sm text-zinc-400">
              <span className="text-white font-medium">{from}</span> → <span className="text-white font-medium">{to}</span>
            </p>
            <div className="grid grid-cols-3 gap-3">
              {MODES.map((m) => (
                <button key={m.name} onClick={() => { setMode(m.name); setStep(4); }}
                  className="flex flex-col items-center justify-center gap-2 py-5 bg-zinc-900 hover:bg-blue-600/20 hover:border-blue-500/60 border border-zinc-800 text-white rounded-2xl transition-all group active:scale-95">
                  <m.icon className="w-6 h-6 text-zinc-400 group-hover:text-blue-400 transition-colors" />
                  <span className="text-xs font-semibold">{m.name}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── STEP 4: Priority ── */}
        {step === 4 && (
          <motion.div key="step4" variants={stepVariants} initial="initial" animate="animate" exit="exit"
            transition={{ duration: 0.22 }} className="p-6 space-y-5">
            <StepDots current={4} />
            <div className="flex items-center gap-3">
              <button onClick={goBack} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Step 4 of 4</p>
                <h2 className="text-2xl font-bold text-white">What matters most?</h2>
              </div>
            </div>
            <p className="text-sm text-zinc-400">UrbanPulse AI optimises your route based on crowd forecasts and your priority.</p>
            <div className="space-y-2">
              {VALUES.map((v) => (
                <button key={v} onClick={() => { setValue(v); submitJourney(v); }}
                  className="w-full flex items-center gap-3 p-4 bg-zinc-900 hover:bg-zinc-800 hover:border-blue-500/40 border border-zinc-800 text-white rounded-2xl transition-all group active:scale-[0.98]">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 group-hover:bg-blue-600/20 flex items-center justify-center shrink-0 transition-colors">
                    <Target className="w-4 h-4 text-zinc-500 group-hover:text-blue-400" />
                  </div>
                  <span className="font-medium text-sm">{v}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── LOADING ── */}
        {step === "loading" && (
          <motion.div key="loading" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }} className="p-8 flex flex-col items-center justify-center gap-6 min-h-[340px]">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/30 blur-2xl rounded-full animate-pulse" />
              <div className="relative w-16 h-16 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-white">Analysing Your Journey</h3>
              <AnimatePresence mode="wait">
                <motion.p key={loadingStep} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="text-sm text-zinc-400 min-h-[20px]">
                  {LOADING_STEPS[loadingStep] ?? LOADING_STEPS[LOADING_STEPS.length - 1]}
                </motion.p>
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 w-full">
              <Clock className="w-4 h-4 text-zinc-500 shrink-0" />
              <span className="text-xs text-zinc-400">{from} → {to} via {mode}</span>
              <span className="ml-auto text-xs font-semibold text-blue-400">{value}</span>
            </div>
          </motion.div>
        )}

        {/* ── RESULT ── */}
        {step === "result" && result && (
          <RouteRecommendation
            from={from} to={to} mode={mode} value={value}
            result={result}
            onReset={reset}
          />
        )}

      </AnimatePresence>
    </div>
  );
}
