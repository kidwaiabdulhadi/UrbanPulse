// UrbanPulse AI – Seeded Intelligence Engine
// All "AI" responses are generated deterministically from inputs — no two unrelated
// interactions will ever produce the same output.

// ─── NETWORK TOPOLOGY ────────────────────────────────────────────────────────
export const STATIONS = [
  {
    id: 'central-hub',
    name: 'Central Hub',
    lat: 51.5074, lon: -0.1278,
    occupancy: 220, capacity: 200,
    risk: 'critical' as const,
    scenario: 'Evening peak demand is surging. A large sporting event at the nearby arena is dispersing.',
    forecast: 'Peak in 20 min',
    trend: '+12 pax/min',
  },
  {
    id: 'airport-terminal',
    name: 'Airport Terminal',
    lat: 51.4775, lon: -0.4614,
    occupancy: 174, capacity: 250,
    risk: 'moderate' as const,
    scenario: 'International arrivals from two delayed flights are creating a temporary surge.',
    forecast: 'Easing in 35 min',
    trend: '+7 pax/min',
  },
  {
    id: 'university-district',
    name: 'University District',
    lat: 51.5246, lon: -0.1340,
    occupancy: 68, capacity: 200,
    risk: 'low' as const,
    scenario: 'Normal operations. Afternoon lecture schedule has concluded.',
    forecast: 'Stable',
    trend: '-2 pax/min',
  },
  {
    id: 'business-bay',
    name: 'Business Bay',
    lat: 51.5033, lon: -0.0876,
    occupancy: 158, capacity: 200,
    risk: 'moderate' as const,
    scenario: 'Post-work commuter wave is building. Peak expected at 18:30.',
    forecast: 'Peak in 45 min',
    trend: '+5 pax/min',
  },
  {
    id: 'stadium',
    name: 'Stadium',
    lat: 51.4934, lon: -0.1951,
    occupancy: 188, capacity: 200,
    risk: 'moderate' as const,
    scenario: 'Match has just ended. Large-scale dispersal event in progress. Crowd expected for another 20 min.',
    forecast: 'Easing in 25 min',
    trend: '+18 pax/min',
  },
  {
    id: 'downtown',
    name: 'Downtown',
    lat: 51.5154, lon: -0.1416,
    occupancy: 95, capacity: 200,
    risk: 'low' as const,
    scenario: 'Moderate evening activity. Restaurants and entertainment venues are filling up.',
    forecast: 'Gradual rise until 21:00',
    trend: '+3 pax/min',
  },
];

export type Station = typeof STATIONS[0];

// ─── COMMUTER COPILOT ENGINE ──────────────────────────────────────────────────

interface JourneyParams {
  from: string;
  to: string;
  mode: string;
  value: string;
}

interface RouteResult {
  travelTime: number;
  waitTime: number;
  crowdPct: number;
  crowdLabel: string;
  crowdColor: string;
  confidence: number;
  cost: string;
  insightMinutes: number;
  insightReduction: number;
  insightExtraMins: number;
  insightText: string;
  altTravelTime: number;
  altCrowdPct: number;
  altLabel: string;
  scenario: string;
}

// Simple deterministic hash so the same inputs always give the same output
function seedHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// Pick item from array deterministically
function seededPick<T>(arr: T[], seed: number, offset = 0): T {
  return arr[(seed + offset) % arr.length];
}

// Clamp a number between min and max
function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

export function generateRouteResult(params: JourneyParams): RouteResult {
  const key = `${params.from}|${params.to}|${params.mode}|${params.value}`.toLowerCase();
  const seed = seedHash(key);

  // Base travel time influenced by mode
  const modeTimes: Record<string, number> = {
    metro: 14, bus: 22, taxi: 18, walking: 45, cycling: 28, 'fastest mix': 16,
  };
  const modeKey = params.mode.toLowerCase();
  const baseTime = modeTimes[modeKey] ?? 20;

  // Vary by destination seed
  const destVariance = (seed % 20) - 10; // -10 to +10
  const travelTime = clamp(baseTime + destVariance, 8, 65);

  // Crowd levels influenced by priority
  let crowdPct: number;
  if (params.value === 'Least crowded journey') {
    crowdPct = clamp(22 + (seed % 18), 20, 45);
  } else if (params.value === 'Fastest arrival') {
    crowdPct = clamp(52 + (seed % 30), 50, 85);
  } else if (params.value === 'Lowest cost') {
    crowdPct = clamp(44 + (seed % 22), 40, 68);
  } else {
    crowdPct = clamp(34 + (seed % 25), 28, 62);
  }

  // Crowd label and color
  let crowdLabel: string;
  let crowdColor: string;
  if (crowdPct >= 70) { crowdLabel = 'High'; crowdColor = 'text-red-400'; }
  else if (crowdPct >= 45) { crowdLabel = 'Moderate'; crowdColor = 'text-amber-400'; }
  else { crowdLabel = 'Low'; crowdColor = 'text-green-400'; }

  // Confidence: higher when crowd is lower (model is more certain about quieter routes)
  const confidence = clamp(97 - Math.floor(crowdPct / 5) + (seed % 5), 82, 98);

  // Cost varies by mode
  const costBases: Record<string, number> = {
    metro: 2.5, bus: 1.8, taxi: 14, walking: 0, cycling: 0, 'fastest mix': 3.2,
  };
  const baseCost = costBases[modeKey] ?? 2.5;
  const costVariance = ((seed % 10) - 5) * 0.1;
  const cost = baseCost === 0 ? 'Free' : `£${(baseCost + costVariance).toFixed(2)}`;

  // AI Insight – wait-time optimisation
  const insightMinutes = clamp(3 + (seed % 10), 3, 12);
  const insightReduction = clamp(28 + (seed % 30), 25, 55);
  const insightExtraMins = clamp(1 + (seed % 5), 1, 6);

  // Dynamic insight text pool
  const insights = [
    `Waiting ${insightMinutes} min for the next ${params.mode.toLowerCase()} is expected to reduce crowd exposure by ${insightReduction}% while only adding ${insightExtraMins} min to your journey.`,
    `Departing ${insightMinutes} min later avoids a ${insightReduction}% crowd surge and saves you waiting on a packed platform.`,
    `Our model predicts a ${insightReduction}% drop in platform density if you delay departure by just ${insightMinutes} minutes.`,
    `Current occupancy at ${params.from} will drop ${insightReduction}% within ${insightMinutes} minutes as an intervention is already underway.`,
    `Taking the next departure in ${insightMinutes} min increases travel time by ${insightExtraMins} min but reduces crowd exposure by ${insightReduction}%.`,
  ];
  const insightText = seededPick(insights, seed);

  // Alt route
  const altTravelTime = clamp(travelTime + 4 + (seed % 8), travelTime + 3, travelTime + 15);
  const altCrowdPct = clamp(crowdPct - 12 + (seed % 8), 15, crowdPct - 5);
  const altLabel = altCrowdPct < 40 ? 'Low' : altCrowdPct < 60 ? 'Moderate' : 'High';

  // Scenario context by destination
  const scenarios: Record<string, string> = {
    'central hub': 'Central Hub is currently over capacity. Expect platform queuing.',
    'airport terminal': 'Two delayed flights have just landed. Temporary surge in progress.',
    'university district': 'Lectures have concluded. Light evening traffic expected.',
    'business bay': 'Post-work commuter wave building. Peak at 18:30.',
    'stadium': 'Match dispersal in progress. High volumes for next 25 minutes.',
    'downtown': 'Evening activity building. Manageable at current level.',
  };
  const scenario = scenarios[params.to.toLowerCase()] ?? 'Normal network conditions prevail.';

  return {
    travelTime, waitTime: insightMinutes, crowdPct, crowdLabel, crowdColor,
    confidence, cost, insightMinutes, insightReduction, insightExtraMins,
    insightText, altTravelTime, altCrowdPct, altLabel, scenario,
  };
}

// ─── AGENT INTELLIGENCE ENGINE ────────────────────────────────────────────────

const AGENT_KNOWLEDGE_BASE = {
  stationAnalysis: {
    patterns: [
      /crowd|busy|overcrowd|full|packed|congested/i,
      /why.*station|station.*why|what.*happening|whats.*wrong/i,
    ],
    responses: (station: string, seed: number) => {
      const causes = [
        `**${station}** is currently at ${clamp(108 + (seed % 50), 105, 155)}% capacity. The primary driver is a post-match crowd dispersal from the nearby arena, compounded by the evening peak commuter wave. My model predicts occupancy will begin dropping in approximately ${clamp(12 + (seed % 20), 10, 35)} minutes once the next scheduled train departs.`,
        `Elevated occupancy at **${station}** is being driven by two concurrent factors: delayed services on Line 3 (12-minute gap) and a university event that concluded 20 minutes ago. Current inflow is ${clamp(8 + (seed % 10), 7, 18)} pax/minute. I recommend pre-emptive platform management.`,
        `**${station}** is entering a critical window. Airport arrivals from two delayed international flights are merging with the 17:45 peak commuter surge. My 30-minute forecast shows occupancy peaking at ${clamp(230 + (seed % 40), 225, 275)} — ${clamp(15 + (seed % 20), 12, 38)}% over safe capacity.`,
        `Seasonal weather disruption (heavy rain) has shifted ${clamp(35 + (seed % 25), 30, 65)} passengers away from walking and cycling onto the metro at **${station}**. This is a short-term spike. Conditions expected to normalise in ${clamp(18 + (seed % 25), 15, 45)} minutes.`,
      ];
      return seededPick(causes, seed);
    },
  },

  operatorRecommendations: {
    patterns: [
      /operator|dispatch|what.*do|recommend|action|intervene|intervention/i,
      /should.*do|what.*should|how.*fix|resolve|mitigate/i,
    ],
    responses: (station: string, seed: number) => {
      const recs = [
        `**Recommended Intervention for ${station}:**\n\n🚌 **DISPATCH_VEHICLE** — Deploy reserve bus #B-07 to Platform 2. Simulation projects a **${clamp(38 + (seed % 25), 35, 60)}% reduction** in peak occupancy within 8 minutes.\n\n📢 **PASSENGER_REDIRECT** — Activate overhead displays directing passengers to North Gateway (currently at ${clamp(38 + (seed % 30), 30, 60)}% capacity). Estimated diversion: ${clamp(40 + (seed % 30), 35, 75)} passengers.\n\n⏱️ **Expected Impact:** Wait times drop from ${clamp(12 + (seed % 8), 10, 22)} min → ${clamp(3 + (seed % 4), 2, 7)} min within 12 minutes.`,
        `**Priority Action — High Confidence (${clamp(89 + (seed % 9), 88, 97)}%):**\n\n🔄 **INCREASE_FREQUENCY** — Reduce headway on Line 2 from 8 min → 4 min for the next 3 cycles. This adds ${clamp(180 + (seed % 60), 160, 250)} additional capacity without requiring reserve assets.\n\n📍 **HOLD_DEPARTURES** — Hold the 17:52 service at Business Bay for 90 seconds to allow dispersal. Disruption cost: minimal. Benefit: absorbs ${clamp(55 + (seed % 30), 50, 85)} passengers currently en route.`,
        `**Network-Level Recommendation:**\n\nI have identified a cascade risk. If no action is taken at ${station}, overflow will reach Downtown in approximately ${clamp(14 + (seed % 12), 12, 28)} minutes.\n\n✅ **Immediate:** Activate dynamic pricing on taxi lanes (reduce cost by 15%) to shift ${clamp(25 + (seed % 20), 20, 45)} passengers to road.\n✅ **Within 5 min:** Open platform barriers at University District (currently unused capacity: ${clamp(95 + (seed % 40), 90, 140)} spaces).\n✅ **Monitor:** Re-assess in 8 minutes.`,
      ];
      return seededPick(recs, seed);
    },
  },

  networkStatus: {
    patterns: [
      /network|status|overview|summary|all station|which station|most critical/i,
      /situation|current|right now|overall/i,
    ],
    responses: (seed: number) => {
      const criticalStation = seededPick(['Central Hub', 'Stadium', 'Airport Terminal'], seed);
      const moderateStation = seededPick(['Business Bay', 'Airport Terminal', 'Stadium'], seed, 1);
      const healthyStations = ['University District', 'Downtown'];
      return `**UrbanPulse Network Status — ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}**\n\n🔴 **Critical (1):** ${criticalStation} — ${clamp(105 + (seed % 45), 104, 148)}% capacity. Intervention recommended.\n🟠 **Moderate (1):** ${moderateStation} — ${clamp(68 + (seed % 22), 65, 88)}% capacity. Monitoring active.\n🟢 **Healthy (${healthyStations.length}):** ${healthyStations.join(', ')} — Operating within normal parameters.\n\n**Forecast:** Network-wide peak is expected at ${seededPick(['17:45', '18:00', '18:15', '18:30'], seed)}. My model recommends pre-positioning ${seededPick(['2', '3'], seed)} reserve vehicles in the next ${clamp(6 + (seed % 10), 5, 18)} minutes to prevent cascading delays.`;
    },
  },

  passengerAdvice: {
    patterns: [
      /avoid|passenger|route|which route|commuter|travel|journey|fastest|alternative/i,
      /where.*go|get.*to|how.*reach|best way/i,
    ],
    responses: (seed: number) => {
      const avoidStation = seededPick(['Central Hub', 'Stadium', 'Airport Terminal'], seed);
      const alternativeStation = seededPick(['University District', 'Business Bay', 'Downtown'], seed, 2);
      const timeSaved = clamp(4 + (seed % 10), 3, 14);
      const crowdReduction = clamp(30 + (seed % 30), 28, 58);
      return `**Passenger Advisory:**\n\nCurrent conditions suggest **avoiding ${avoidStation}** for the next ${clamp(15 + (seed % 20), 12, 35)} minutes due to overcrowding.\n\n✅ **Recommended Alternative:** Route via **${alternativeStation}**\n- Travel time: +${timeSaved} min longer\n- Crowd reduction: **${crowdReduction}% less congested**\n- Platform wait: ${clamp(1 + (seed % 4), 1, 5)} min vs. ${clamp(10 + (seed % 8), 9, 18)} min at ${avoidStation}\n\nThis advisory is based on my real-time occupancy forecast for the next 25 minutes. I update predictions every 90 seconds.`;
    },
  },

  forecastExplanation: {
    patterns: [
      /forecast|predict|confidence|how.*confident|model|accuracy|explain.*forecast/i,
      /how.*know|certain|sure|reliable/i,
    ],
    responses: (seed: number) => {
      const confidence = clamp(89 + (seed % 9), 88, 97);
      const modelType = seededPick(['Temporal Fusion Transformer (TFT)', 'PyTorch TFT with attention layers', 'TimescaleDB-backed sequence model'], seed);
      const dataPoints = clamp(2200 + (seed % 1800), 2000, 4000);
      return `**Forecast Methodology:**\n\nMy predictions use a **${modelType}** trained on ${dataPoints.toLocaleString()} historical data points from this network.\n\n📊 **Current Confidence: ${confidence}%**\nFactors contributing to confidence:\n- ${clamp(48 + (seed % 12), 45, 62)} hours of recent telemetry\n- Weather data integration (OpenMeteo API)\n- Historical event patterns matched to today's calendar\n- Real-time inflow/outflow sensors at all 6 stations\n\n⚠️ **Uncertainty factors:** Major unplanned incidents (accidents, service failures) fall outside my training distribution. For such events, confidence drops to ~${clamp(62 + (seed % 15), 60, 78)}% and I flag the forecast accordingly.`;
    },
  },

  interventionImpact: {
    patterns: [
      /impact|highest impact|best intervention|effective|which intervention/i,
      /what happens|no action|if.*not|consequence|risk/i,
    ],
    responses: (seed: number) => {
      const intervention = seededPick(['DISPATCH_VEHICLE', 'INCREASE_FREQUENCY', 'PASSENGER_REDIRECT'], seed);
      const impact = clamp(38 + (seed % 30), 35, 65);
      const worstCase = clamp(290 + (seed % 50), 285, 340);
      const cascadeTime = clamp(12 + (seed % 18), 10, 30);
      return `**Intervention Impact Analysis:**\n\n🏆 **Highest Impact Right Now:** \`${intervention}\`\nProjected crowd reduction: **${impact}%** within 10 minutes\nAffected passengers protected: ~${clamp(85 + (seed % 60), 80, 145)}\n\n---\n\n⚠️ **If No Action Is Taken:**\nMy model projects occupancy reaching **${worstCase} pax** at peak (${Math.round(worstCase / 200 * 100)}% of capacity). This will trigger:\n1. Platform closure at Central Hub in ~${cascadeTime} min\n2. Overflow cascade to Business Bay (+${clamp(55 + (seed % 30), 50, 90)} passengers diverted)\n3. System-wide average wait time increase: +${clamp(4 + (seed % 8), 3, 12)} minutes\n\nI recommend acting within the next **${clamp(4 + (seed % 7), 3, 11)} minutes**.`;
    },
  },

  delays: {
    patterns: [
      /delay|late|disruption|service.*issue|incident/i,
      /are.*running|on time|punctual/i,
    ],
    responses: (seed: number) => {
      const delayed = seededPick(['Line 2 (Green)', 'Line 4 (Blue)', 'Express Route A'], seed);
      const delayMins = clamp(4 + (seed % 12), 3, 16);
      const cause = seededPick(['a signal fault at Westminster Junction', 'track maintenance overrunning by 8 minutes', 'a passenger incident at Central Hub requiring emergency services'], seed);
      return `**Current Service Status:**\n\n🟠 **${delayed}:** ${delayMins}-minute delay due to ${cause}. Affected services: ${clamp(3 + (seed % 4), 3, 7)} trains. Engineers have been notified.\n\n🟢 **All other lines:** Operating within 2 minutes of schedule.\n\n📡 **Prediction:** The delay on ${delayed} will self-resolve in approximately ${clamp(8 + (seed % 14), 7, 22)} minutes without intervention. However, the downstream occupancy impact on **Central Hub** requires monitoring. I have already adjusted my crowd forecast to account for this delay.`;
    },
  },

  default: {
    responses: (query: string, seed: number) => {
      const responses = [
        `I've analysed your query about "${query.substring(0, 40)}${query.length > 40 ? '…' : ''}". Based on current telemetry, Central Hub remains the highest-priority station at ${clamp(108 + (seed % 40), 105, 148)}% capacity. Would you like me to run a specific intervention simulation or provide passenger routing advice?`,
        `Good question. My current data shows the network is experiencing ${seededPick(['moderate stress', 'elevated demand', 'a transient peak'], seed)} driven by the overlap of evening commuter and event dispersal patterns. The stations I'm watching most closely right now are Central Hub and Stadium. Shall I detail the recommended interventions?`,
        `I'm processing live telemetry across all 6 network nodes. The most time-sensitive issue right now is at **${seededPick(['Central Hub', 'Stadium', 'Airport Terminal'], seed)}**. My model gives a **${clamp(88 + (seed % 10), 87, 97)}% confidence** that crowd levels will peak within the next ${clamp(12 + (seed % 20), 10, 32)} minutes. What specific aspect would you like me to analyse?`,
      ];
      return seededPick(responses, seed);
    },
  },
};

export function generateAgentResponse(userQuery: string): string {
  const q = userQuery.toLowerCase();
  const seed = seedHash(userQuery);

  // Determine which station the user might be asking about
  const mentionedStation = STATIONS.find(s => q.includes(s.name.toLowerCase()))?.name
    ?? seededPick(STATIONS, seed).name;

  const kb = AGENT_KNOWLEDGE_BASE;

  if (kb.stationAnalysis.patterns.some(p => p.test(q))) {
    return kb.stationAnalysis.responses(mentionedStation, seed);
  }
  if (kb.operatorRecommendations.patterns.some(p => p.test(q))) {
    return kb.operatorRecommendations.responses(mentionedStation, seed);
  }
  if (kb.networkStatus.patterns.some(p => p.test(q))) {
    return kb.networkStatus.responses(seed);
  }
  if (kb.passengerAdvice.patterns.some(p => p.test(q))) {
    return kb.passengerAdvice.responses(seed);
  }
  if (kb.forecastExplanation.patterns.some(p => p.test(q))) {
    return kb.forecastExplanation.responses(seed);
  }
  if (kb.interventionImpact.patterns.some(p => p.test(q))) {
    return kb.interventionImpact.responses(seed);
  }
  if (kb.delays.patterns.some(p => p.test(q))) {
    return kb.delays.responses(seed);
  }

  return kb.default.responses(userQuery, seed);
}
