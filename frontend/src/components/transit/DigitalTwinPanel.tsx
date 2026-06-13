"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PlayCircle, Activity, ShieldCheck, AlertTriangle,
  Users, Clock, TrendingDown, Zap, ChevronDown
} from "lucide-react";
import { PassengerFlow } from "./PassengerFlow";
import { SimulationChart } from "./SimulationChart";
import { motion, AnimatePresence } from "framer-motion";
import { STATIONS, type Station } from "@/lib/intelligence";

const BASE_OCCUPANCY = 220;
const POST_INTERVENTION_OCCUPANCY = 108;
const CAPACITY = 200;

function KpiCard({
  label, value, sub, color = "text-white", bg = "bg-zinc-900 border-zinc-800"
}: {
  label: string; value: string; sub?: string;
  color?: string; bg?: string;
}) {
  return (
    <div className={`${bg} border rounded-xl p-3`}>
      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-xl font-black ${color}`}>{value}</p>
      {sub && <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>}
    </div>
  );
}

interface Props {
  activeStation?: Station;
}

export function DigitalTwinPanel({ activeStation }: Props) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [occupancy, setOccupancy] = useState(BASE_OCCUPANCY);

  const station = activeStation ?? STATIONS[0]; // Default to Central Hub
  const pct = Math.round((occupancy / CAPACITY) * 100);

  const handleSimulate = useCallback(() => {
    setIsSimulating(true);
    setShowResults(false);
    setTimeout(() => setOccupancy(POST_INTERVENTION_OCCUPANCY), 800);
    setTimeout(() => setShowResults(true), 1400);
    setTimeout(() => {
      setIsSimulating(false);
      setOccupancy(BASE_OCCUPANCY);
      setShowResults(false);
    }, 10000);
  }, []);

  const simulationData = [
    { time: "17:00", baseline: 100, mitigated: 100 },
    { time: "17:05", baseline: 150, mitigated: null },
    { time: "17:10", baseline: 200, mitigated: 70 },
    { time: "17:15", baseline: 220, mitigated: 108 },
    { time: "17:20", baseline: 210, mitigated: 108 },
    { time: "17:25", baseline: 185, mitigated: 100 },
    { time: "17:30", baseline: 155, mitigated: 92 },
  ];

  return (
    <Card className="bg-zinc-950/80 backdrop-blur-xl border-zinc-800 shadow-2xl text-white overflow-hidden">
      <CardHeader className="border-b border-zinc-800/60 bg-zinc-900/60 px-5 py-4">
        <div className="flex justify-between items-start gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <Activity className="w-4 h-4 text-blue-400" />
              Digital Twin Simulation
            </CardTitle>
            <p className="text-xs text-zinc-400 mt-1">
              Counterfactual scenario · <span className="text-blue-400">{station.name}</span>
            </p>
          </div>
          <Badge className={
            isSimulating
              ? "bg-green-500/15 text-green-400 border-green-500/30 text-xs"
              : "bg-red-500/15 text-red-400 border-red-500/30 text-xs"
          }>
            {isSimulating ? "✓ MITIGATING" : "⚠ CRITICAL"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-5">

        {/* KPIs: Without vs With Intervention */}
        <div>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            Scenario Comparison
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <p className="text-xs font-bold text-red-400 uppercase tracking-wider">Without Intervention</p>
              <KpiCard label="Peak Occupancy" value={`${BASE_OCCUPANCY} pax`} sub={`${Math.round(BASE_OCCUPANCY/CAPACITY*100)}% of capacity`} color="text-red-400" bg="bg-red-500/5 border-red-500/20" />
              <KpiCard label="Wait Time" value="18 min" sub="Platform queuing" color="text-red-400" bg="bg-red-500/5 border-red-500/20" />
              <KpiCard label="Congestion Risk" value="Critical" bg="bg-red-500/5 border-red-500/20" color="text-red-400" />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold text-green-400 uppercase tracking-wider">With Intervention</p>
              <KpiCard label="Peak Occupancy" value={`${POST_INTERVENTION_OCCUPANCY} pax`} sub="54% of capacity" color="text-green-400" bg="bg-green-500/5 border-green-500/20" />
              <KpiCard label="Wait Time" value="4 min" sub="Normal boarding" color="text-green-400" bg="bg-green-500/5 border-green-500/20" />
              <KpiCard label="Congestion Risk" value="Low" bg="bg-green-500/5 border-green-500/20" color="text-green-400" />
            </div>
          </div>
        </div>

        {/* Live Occupancy Visualiser */}
        <div>
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Live Platform Occupancy
          </h3>
          <PassengerFlow occupancy={occupancy} capacity={CAPACITY} isSimulating={isSimulating} />
        </div>

        {/* Impact Results */}
        <AnimatePresence>
          {showResults && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-2 gap-3 overflow-hidden"
            >
              <KpiCard label="Passengers Protected" value="112 pax" color="text-blue-400" bg="bg-blue-500/5 border-blue-500/20" />
              <KpiCard label="Wait Time Saved" value="14 min" color="text-blue-400" bg="bg-blue-500/5 border-blue-500/20" />
              <KpiCard label="Confidence Score" value="94.8%" color="text-emerald-400" bg="bg-emerald-500/5 border-emerald-500/20" />
              <KpiCard label="Congestion Reduction" value="51%" color="text-emerald-400" bg="bg-emerald-500/5 border-emerald-500/20" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chart */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <div>
              <h3 className="text-xs font-semibold text-zinc-400">Intervention Analysis</h3>
              <p className="text-xs text-zinc-600">Baseline vs. DISPATCH_VEHICLE simulation</p>
            </div>
            <Button
              onClick={handleSimulate}
              disabled={isSimulating}
              size="sm"
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-lg shadow-blue-900/40 text-xs"
            >
              {isSimulating ? (
                <><ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> Executing…</>
              ) : (
                <><PlayCircle className="w-3.5 h-3.5 mr-1.5" /> Run Simulation</>
              )}
            </Button>
          </div>
          <SimulationChart data={simulationData} />
        </div>

      </CardContent>
    </Card>
  );
}
