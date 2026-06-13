import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import os
import uuid
from typing import Dict, List, Tuple

def get_mock_shap_values() -> Dict[str, float]:
    """
    Since we don't have a fully trained PyTorch model initialized with real 
    historic data right now, this generates realistic mock SHAP values.
    """
    # Simulate a scenario where crowding is increasing
    return {
        "Friday evening": 0.31,
        "nearby events": 0.22,
        "rain": 0.18,
        "temperature": -0.05,
        "base_commute": 0.10
    }

def generate_plain_english_explanation(shap_values: Dict[str, float], total_forecast_change: float) -> str:
    """
    Generates a deterministic plain-English sentence based on top SHAP contributors.
    """
    # Sort features by absolute impact
    sorted_features = sorted(shap_values.items(), key=lambda item: abs(item[1]), reverse=True)
    top_3 = sorted_features[:3]
    
    direction = "increase" if total_forecast_change > 0 else "decrease"
    
    reasons = []
    for feature, impact in top_3:
        sign = "+" if impact > 0 else ""
        impact_pct = int(impact * 100)
        reasons.append(f"{feature} contributes {sign}{impact_pct}%")
        
    reasons_str = ", ".join(reasons[:-1]) + f", and {reasons[-1]}"
    
    return f"Crowding is expected to {direction} because {reasons_str}."

def generate_shap_chart(shap_values: Dict[str, float], output_dir: str = "static/charts") -> str:
    """
    Generates a matplotlib bar chart of SHAP values and saves it to disk.
    """
    os.makedirs(output_dir, exist_ok=True)
    
    features = list(shap_values.keys())
    impacts = [val * 100 for val in shap_values.values()]
    
    plt.figure(figsize=(10, 6))
    colors = ['#ef4444' if x > 0 else '#3b82f6' for x in impacts]
    
    sns.barplot(x=impacts, y=features, palette=colors)
    plt.title("AI Forecast Feature Importance (SHAP)")
    plt.xlabel("Impact on Occupancy Prediction (%)")
    plt.ylabel("Features")
    
    # Add percentage labels
    for i, v in enumerate(impacts):
        plt.text(v + (1 if v > 0 else -3), i, f"{v:+.1f}%", color='black', va='center')
        
    filename = f"shap_{uuid.uuid4().hex[:8]}.png"
    filepath = os.path.join(output_dir, filename)
    plt.tight_layout()
    plt.savefig(filepath)
    plt.close()
    
    return filepath

def get_explanation_for_forecast(station_id: str, forecast_value: float, baseline_value: float) -> dict:
    """
    Main entrypoint for the XAI module.
    """
    # In production, shap.Explainer(model)(input_data)
    shap_values = get_mock_shap_values()
    
    total_change = forecast_value - baseline_value
    english_text = generate_plain_english_explanation(shap_values, total_change)
    
    chart_path = generate_shap_chart(shap_values)
    
    return {
        "station_id": station_id,
        "shap_values": shap_values,
        "plain_english_explanation": english_text,
        "chart_url": f"/{chart_path}"
    }
