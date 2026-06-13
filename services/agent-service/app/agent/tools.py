from langchain_core.tools import tool
from typing import Dict, Any
from app.rag.retrieve import retrieve_context

@tool
def fetch_current_occupancy(station_id: str) -> str:
    """Fetches the current occupancy and capacity for a given transit station."""
    # Mocking external API call
    return f"Station {station_id} current occupancy is 220. Capacity is 200. Status: OVERCROWDED."

@tool
def fetch_forecast_and_shap(station_id: str) -> str:
    """Fetches the 60-minute AI forecast and the SHAP explainability reasons for the forecast."""
    # Mocking external API call to ai-inference
    return "Forecast for next 60m: 250 passengers. Reason (SHAP): Friday evening (+31%), Rain (+18%)."

@tool
def run_counterfactual_simulation(station_id: str, intervention_type: str) -> str:
    """
    Runs a digital twin simulation for a specific intervention. 
    Valid interventions: DISPATCH_VEHICLE, INCREASE_FREQUENCY, REDIRECT_PASSENGERS.
    """
    if intervention_type == "DISPATCH_VEHICLE":
        return "Simulation Result: Peak drops by 110 pax. Wait times improve by 2.2 mins. Congestion lowers to HIGH."
    return f"Simulation Result for {intervention_type}: Peak drops by 40 pax."

@tool
def query_knowledge_base(query: str) -> str:
    """Searches the ChromaDB vector database for official transit procedures, emergency guidelines, and capacity policies matching the query."""
    return retrieve_context(query)
