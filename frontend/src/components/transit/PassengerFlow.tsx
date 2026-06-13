"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// Deterministic seeded RNG — eliminates ALL hydration mismatches from Math.random()
function srng(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

interface PassengerFlowProps {
  occupancy: number;
  capacity: number;
  isSimulating: boolean;
}

interface Particle {
  y: number;
  duration: number;
  delay: number;
}

export function PassengerFlow({ occupancy, capacity, isSimulating }: PassengerFlowProps) {
  const percentage = Math.min((occupancy / capacity) * 100, 100);
  const isOvercrowded = percentage > 90;
  const count = Math.floor(percentage / 5);

  // Only initialize particles on the client after mount — zero SSR/hydration mismatch
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setParticles(
      Array.from({ length: count }, (_, i) => ({
        y: srng(i * 7 + 1) * 130,
        duration: 1.2 + srng(i * 13 + 3) * 2,
        delay: srng(i * 17 + 5) * 2.5,
      }))
    );
  }, [count]);

  const fillColor = isSimulating
    ? "bg-green-500/25"
    : isOvercrowded
    ? "bg-red-500/30"
    : "bg-blue-500/20";

  const textColor = isSimulating
    ? "text-green-400"
    : isOvercrowded
    ? "text-red-400"
    : "text-white";

  const dotColor = isSimulating ? "bg-green-400" : "bg-zinc-500";

  return (
    <div className="relative w-full h-36 bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center">
      {/* Critical state pulsing background */}
      {isOvercrowded && !isSimulating && (
        <motion.div
          animate={{ opacity: [0.05, 0.22, 0.05] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          className="absolute inset-0 bg-red-500"
        />
      )}

      {/* Animated fill level */}
      <motion.div
        className={`absolute bottom-0 left-0 w-full ${fillColor}`}
        animate={{ height: `${percentage}%` }}
        transition={{ type: "spring", stiffness: 40, damping: 18 }}
      />

      {/* Flowing passenger particles — client-only to avoid hydration mismatch */}
      {mounted && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((p, i) => (
            <motion.div
              key={i}
              className={`absolute w-1.5 h-1.5 rounded-full ${dotColor}`}
              style={{ top: p.y }}
              animate={{ x: ["-12px", "108%"], opacity: [0, 0.8, 0] }}
              transition={{
                repeat: Infinity,
                duration: p.duration,
                delay: p.delay,
                ease: "linear",
              }}
            />
          ))}
        </div>
      )}

      {/* Occupancy readout */}
      <div className="z-10 flex flex-col items-center select-none">
        <span className="text-xs text-zinc-400 uppercase tracking-[0.15em] font-semibold mb-1">
          Live Occupancy
        </span>
        <motion.span
          className={`text-5xl font-black tabular-nums ${textColor}`}
          animate={{ scale: isSimulating ? [1, 1.03, 1] : 1 }}
          transition={{ repeat: isSimulating ? Infinity : 0, duration: 1.4 }}
        >
          {Math.round(occupancy)}
        </motion.span>
        <span className="text-xs text-zinc-500 mt-1 font-mono">
          / {capacity} MAX · {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
}
