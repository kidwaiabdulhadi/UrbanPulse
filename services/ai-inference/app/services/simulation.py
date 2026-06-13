import numpy as np
from typing import List, Dict, Tuple
from enum import Enum

class InterventionType(str, Enum):
    DISPATCH_VEHICLE = "DISPATCH_VEHICLE"
    INCREASE_FREQUENCY = "INCREASE_FREQUENCY"
    REDIRECT_PASSENGERS = "REDIRECT_PASSENGERS"

def simulate_intervention(
    baseline_forecast: List[float], 
    intervention: InterventionType, 
    capacity: int = 200
) -> Tuple[List[float], Dict[str, float]]:
    """
    Given a baseline forecast of occupancy over N time steps, simulate the impact
    of a specific intervention to generate a counterfactual 'Scenario B'.
    """
    scenario_b = list(baseline_forecast)
    steps = len(baseline_forecast)
    
    if intervention == InterventionType.DISPATCH_VEHICLE:
        # A train arrives immediately at step 2, clearing `capacity` people
        flush_capacity = capacity * 1.5
        for i in range(1, steps):
            reduction = min(scenario_b[i], flush_capacity)
            scenario_b[i] -= reduction
            # Over time, it climbs back up slightly
            flush_capacity = max(0, flush_capacity - capacity * 0.2)
            
    elif intervention == InterventionType.INCREASE_FREQUENCY:
        # Headway is halved, meaning throughput doubles. Occupancy decays steadily.
        decay_rate = 0.85
        for i in range(1, steps):
            scenario_b[i] = scenario_b[i] * (decay_rate ** i)
            
    elif intervention == InterventionType.REDIRECT_PASSENGERS:
        # Stop new people entering. Occupancy caps and slightly decays.
        max_allowed = baseline_forecast[0] * 1.1 # Cap near current level
        for i in range(1, steps):
            if scenario_b[i] > max_allowed:
                scenario_b[i] = max_allowed
            max_allowed *= 0.95 # slowly drains out

    # Compute comparison metrics
    peak_a = max(baseline_forecast)
    peak_b = max(scenario_b)
    peak_drop = peak_a - peak_b
    
    # Simple wait time estimation based on Little's Law (Wait = Occupancy / Throughput)
    # Assuming baseline throughput is 50 pax / min
    wait_time_a = peak_a / 50.0 
    
    if intervention == InterventionType.INCREASE_FREQUENCY:
        wait_time_b = peak_b / 100.0 # Throughput doubled
    else:
        wait_time_b = peak_b / 50.0
        
    wait_time_improvement = wait_time_a - wait_time_b
    
    congestion_a = "CRITICAL" if peak_a > capacity * 0.9 else "HIGH"
    congestion_b = "LOW" if peak_b < capacity * 0.5 else "MEDIUM" if peak_b < capacity * 0.8 else "HIGH"
    
    improvement_pct = ((peak_a - peak_b) / max(1, peak_a)) * 100

    metrics = {
        "peak_occupancy_drop": round(peak_drop, 1),
        "wait_time_improvement_mins": round(wait_time_improvement, 1),
        "congestion_a": congestion_a,
        "congestion_b": congestion_b,
        "estimated_improvement_pct": round(improvement_pct, 1)
    }
    
    # Round array
    scenario_b = [round(x, 1) for x in scenario_b]
    
    return scenario_b, metrics
