"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { STATIONS, type Station } from "@/lib/intelligence";
import { AlertTriangle, TrendingUp, TrendingDown, Minus, Radio } from "lucide-react";

// ── DETERMINISTIC SEEDED RNG (no Math.random in render) ──────────────────────
function srng(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

// ── NETWORK LAYOUT ────────────────────────────────────────────────────────────
const NODE_POS: Record<string, { x: number; y: number }> = {
  "central-hub":        { x: 310, y: 210 },
  "airport-terminal":   { x: 90,  y: 360 },
  "university-district":{ x: 295, y: 75  },
  "business-bay":       { x: 490, y: 245 },
  "stadium":            { x: 165, y: 295 },
  "downtown":           { x: 285, y: 355 },
};

const ROUTES = [
  ["central-hub", "university-district"],
  ["central-hub", "business-bay"],
  ["central-hub", "stadium"],
  ["central-hub", "downtown"],
  ["stadium", "airport-terminal"],
  ["downtown", "airport-terminal"],
  ["business-bay", "downtown"],
  ["university-district", "stadium"],
];

const RISK_CFG = {
  critical: { stroke: "#ef4444", dot: "#ef4444", label: "Critical" },
  moderate: { stroke: "#f59e0b", dot: "#f59e0b", label: "Moderate" },
  low:      { stroke: "#22c55e", dot: "#22c55e", label: "Normal"   },
} as const;

// ── ANIMATED TRAIN DOT ────────────────────────────────────────────────────────
function TrainDot({ x1, y1, x2, y2, seed }: { x1:number; y1:number; x2:number; y2:number; seed:number }) {
  return (
    <motion.circle r={3} fill="#60a5fa"
      animate={{ cx: [x1, x2, x1], cy: [y1, y2, y1] }}
      transition={{ duration: 2.5 + srng(seed) * 2, delay: srng(seed + 1) * 3, repeat: Infinity, ease: "easeInOut" }} />
  );
}

// ── PREMIUM ANIMATED NETWORK VIEW (no-token fallback) ────────────────────────
function AnimatedNetworkView({ onStationSelect }: { onStationSelect?: (s: Station) => void }) {
  const [selected, setSelected] = useState<Station | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleSelect = (s: Station) => { setSelected(s); onStationSelect?.(s); };

  return (
    <div className="w-full h-[560px] rounded-2xl border border-zinc-800 overflow-hidden bg-zinc-950 shadow-2xl relative flex flex-col">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-violet-600/4 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 shrink-0 bg-zinc-900/70 backdrop-blur-sm border-b border-zinc-800 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-sm font-bold text-white">Live Transit Network</span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-xs text-zinc-500">
            {(["critical","moderate","low"] as const).map(r => (
              <span key={r} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: RISK_CFG[r].dot }} />
                {RISK_CFG[r].label}
              </span>
            ))}
          </div>
        </div>
        <span className="text-xs text-blue-400 font-semibold bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          6 Nodes
        </span>
      </div>

      {/* SVG map + sidebar */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        <div className="flex-1 relative">
          {mounted && (
            <svg viewBox="0 0 580 440" className="w-full h-full" style={{ overflow: "visible" }}>
              {/* Grid */}
              {[60,120,180,240,300,360,420].map(y => (
                <line key={`gy${y}`} x1={0} y1={y} x2={580} y2={y} stroke="#27272a" strokeWidth={0.5} />
              ))}
              {[80,160,240,320,400,480,560].map(x => (
                <line key={`gx${x}`} x1={x} y1={0} x2={x} y2={440} stroke="#27272a" strokeWidth={0.5} />
              ))}

              {/* Route lines with animated trains */}
              {ROUTES.map(([a, b], i) => {
                const pa = NODE_POS[a]; const pb = NODE_POS[b];
                if (!pa || !pb) return null;
                return (
                  <g key={i}>
                    <line x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke="#3b82f6" strokeWidth={5} strokeOpacity={0.06} />
                    <line x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke="#3b82f6" strokeWidth={1.5} strokeOpacity={0.3} strokeDasharray="4 4" />
                    <TrainDot x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} seed={i * 3 + 7} />
                  </g>
                );
              })}

              {/* Station nodes */}
              {STATIONS.map((s) => {
                const pos = NODE_POS[s.id];
                if (!pos) return null;
                const cfg = RISK_CFG[s.risk];
                const pct = s.occupancy / s.capacity;
                const isHov = hovered === s.id;
                const isSel = selected?.id === s.id;
                const R = 15;
                const circ = 2 * Math.PI * R;

                return (
                  <g key={s.id} style={{ cursor: "pointer" }}
                    onClick={() => handleSelect(s)}
                    onMouseEnter={() => setHovered(s.id)}
                    onMouseLeave={() => setHovered(null)}>
                    {/* Pulse ring for critical */}
                    {s.risk === "critical" && (
                      <motion.circle cx={pos.x} cy={pos.y} r={R + 8}
                        fill="none" stroke={cfg.stroke} strokeWidth={1}
                        animate={{ r: [R + 4, R + 16], opacity: [0.6, 0] }}
                        transition={{ repeat: Infinity, duration: 1.8, ease: "easeOut" }} />
                    )}
                    {/* Halo */}
                    <circle cx={pos.x} cy={pos.y} r={R + 7} fill={cfg.dot} fillOpacity={isHov || isSel ? 0.15 : 0.05} />
                    {/* Node background */}
                    <circle cx={pos.x} cy={pos.y} r={R} fill="#09090b"
                      stroke={isSel ? "#60a5fa" : cfg.stroke} strokeWidth={isSel ? 2.5 : 1.5} />
                    {/* Occupancy arc */}
                    <circle cx={pos.x} cy={pos.y} r={R} fill="none"
                      stroke={cfg.stroke} strokeWidth={3.5}
                      strokeDasharray={`${circ * Math.min(pct, 1)} ${circ}`}
                      strokeLinecap="round"
                      transform={`rotate(-90 ${pos.x} ${pos.y})`}
                      opacity={0.85} />
                    {/* Core dot */}
                    <circle cx={pos.x} cy={pos.y} r={4} fill={cfg.dot} />
                    {/* Label */}
                    <text x={pos.x} y={pos.y + R + 14} textAnchor="middle"
                      fill={isSel ? "#93c5fd" : "#71717a"} fontSize={9.5}
                      fontWeight={isSel ? "700" : "500"} fontFamily="system-ui, sans-serif">
                      {s.name.split(" ").map((w, wi) => (
                        <tspan key={wi} x={pos.x} dy={wi === 0 ? 0 : 11}>{w}</tspan>
                      ))}
                    </text>
                    {/* Hover tooltip */}
                    {isHov && !isSel && (
                      <g>
                        <rect x={pos.x - 56} y={pos.y - R - 46} width={112} height={38} rx={7}
                          fill="#18181b" stroke="#3f3f46" strokeWidth={1} />
                        <text x={pos.x} y={pos.y - R - 32} textAnchor="middle"
                          fill="#ffffff" fontSize={10} fontWeight="600" fontFamily="system-ui">
                          {s.name}
                        </text>
                        <text x={pos.x} y={pos.y - R - 18} textAnchor="middle"
                          fill={cfg.dot} fontSize={9} fontFamily="system-ui">
                          {s.occupancy}/{s.capacity} · {cfg.label}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          )}
        </div>

        {/* Station Detail Sidebar */}
        <div className="w-52 shrink-0 border-l border-zinc-800/60 bg-zinc-900/30 flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div key={selected.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }} className="p-4 space-y-3 overflow-y-auto flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full border"
                    style={{
                      color: RISK_CFG[selected.risk].dot,
                      background: `${RISK_CFG[selected.risk].dot}18`,
                      borderColor: `${RISK_CFG[selected.risk].dot}35`,
                    }}>
                    {RISK_CFG[selected.risk].label}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white leading-tight">{selected.name}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{selected.scenario}</p>

                {/* Occupancy bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-zinc-500">Occupancy</span>
                    <span className="text-white font-bold">{Math.round(selected.occupancy / selected.capacity * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: RISK_CFG[selected.risk].dot }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(selected.occupancy / selected.capacity * 100, 100)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-1 text-zinc-600 font-mono">
                    <span>{selected.occupancy}</span><span>/ {selected.capacity}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-2.5">
                    <p className="text-xs text-zinc-500 mb-1">Inflow Rate</p>
                    <div className="flex items-center gap-1">
                      {selected.trend.startsWith("+") ? <TrendingUp className="w-3.5 h-3.5 text-red-400" />
                        : selected.trend.startsWith("-") ? <TrendingDown className="w-3.5 h-3.5 text-green-400" />
                        : <Minus className="w-3.5 h-3.5 text-zinc-400" />}
                      <span className="text-xs font-bold text-white">{selected.trend}</span>
                    </div>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-2.5">
                    <p className="text-xs text-zinc-500 mb-1">Forecast</p>
                    <p className="text-xs font-bold text-blue-400">{selected.forecast}</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex-1 flex flex-col items-center justify-center p-4 text-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-zinc-800/80 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-zinc-500" />
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Click any node to inspect live telemetry and crowd forecasts
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ── MAPBOX VIEW ───────────────────────────────────────────────────────────────
import Map, { Marker, NavigationControl } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

function MapboxView({ token, onStationSelect }: { token: string; onStationSelect?: (s: Station) => void }) {
  const [viewState, setViewState] = useState({
    longitude: -0.1278, latitude: 51.5074, zoom: 11.5, pitch: 45,
  });

  return (
    <div className="w-full h-[560px] rounded-2xl border border-zinc-800 overflow-hidden relative shadow-2xl">
      <Map {...viewState}
        onMove={(e) => setViewState(e.viewState)}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={token}
        attributionControl={false}>
        <NavigationControl position="bottom-right" />
        {STATIONS.map((s) => {
          const cfg = RISK_CFG[s.risk];
          const isCritical = s.risk === "critical";
          return (
            <Marker key={s.id} longitude={s.lon} latitude={s.lat} anchor="center"
              onClick={() => onStationSelect?.(s)}>
              <div className="relative flex items-center justify-center group cursor-pointer">
                {isCritical && (
                  <motion.div animate={{ scale: [1, 2.4], opacity: [0.7, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute w-6 h-6 rounded-full"
                    style={{ background: `${cfg.dot}50` }} />
                )}
                <div className="w-4 h-4 rounded-full border-2 border-zinc-950 z-10"
                  style={{ background: cfg.dot }} />
                <div className="absolute bottom-7 left-1/2 -translate-x-1/2 bg-zinc-950 border border-zinc-800 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none shadow-xl">
                  <p className="font-bold">{s.name}</p>
                  <p className="text-zinc-400">{s.occupancy}/{s.capacity} · {s.forecast}</p>
                </div>
              </div>
            </Marker>
          );
        })}
      </Map>
    </div>
  );
}

// ── PUBLIC EXPORT ─────────────────────────────────────────────────────────────
export function GlobalMap({ onStationSelect }: { onStationSelect?: (s: Station) => void }) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
  const hasToken = token.length > 30 && !token.includes("dummy");
  return hasToken
    ? <MapboxView token={token} onStationSelect={onStationSelect} />
    : <AnimatedNetworkView onStationSelect={onStationSelect} />;
}
