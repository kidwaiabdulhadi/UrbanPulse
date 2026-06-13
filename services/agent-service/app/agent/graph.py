from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from typing import Literal
from langchain_core.messages import HumanMessage, AIMessage

from app.agent.state import AgentState
from app.agent.tools import fetch_current_occupancy, fetch_forecast_and_shap, run_counterfactual_simulation, query_knowledge_base
from app.core.config import settings

# In a real environment, we'd use ChatOpenAI(model="gpt-4o", api_key=settings.OPENAI_API_KEY)
# For this scaffold, we mock the LLM wrapper if the key is dummy
llm = ChatOpenAI(model="gpt-3.5-turbo", api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY != "sk-mock-key" else None

tools = [fetch_current_occupancy, fetch_forecast_and_shap, run_counterfactual_simulation, query_knowledge_base]

def situation_agent(state: AgentState):
    """Analyzes the current situation."""
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are the Situation Analysis Agent. Use tools to fetch occupancy and forecasts. Summarize the situation concisely."),
        MessagesPlaceholder(variable_name="messages"),
    ])
    if llm:
        chain = prompt | llm.bind_tools(tools)
        response = chain.invoke(state)
        return {"messages": [response]}
    else:
        # Mock Response
        return {"messages": [AIMessage(content="Station 123 is currently overcrowded (220/200). Forecast shows 250 pax due to Friday rain.")]}

def recommendation_agent(state: AgentState):
    """Generates recommendations."""
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are the Recommendation Agent. Use the simulation tool to propose interventions like DISPATCH_VEHICLE."),
        MessagesPlaceholder(variable_name="messages"),
    ])
    if llm:
        chain = prompt | llm.bind_tools(tools)
        response = chain.invoke(state)
        return {"messages": [response]}
    else:
        return {"messages": [AIMessage(content="I recommend DISPATCH_VEHICLE. Simulation shows peak drops by 110 pax and wait times improve by 2.2 mins.")]}

# Define the graph
workflow = StateGraph(AgentState)

workflow.add_node("SituationAgent", situation_agent)
workflow.add_node("RecommendationAgent", recommendation_agent)
workflow.add_node("tools", ToolNode(tools))

workflow.set_entry_point("SituationAgent")
workflow.add_edge("SituationAgent", "RecommendationAgent")
workflow.add_edge("RecommendationAgent", END)

# Compile
app_graph = workflow.compile()
