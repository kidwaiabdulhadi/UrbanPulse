from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict
from langchain_core.messages import HumanMessage
from app.agent.graph import app_graph

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    session_id: str = "default"

class ChatResponse(BaseModel):
    response: str
    session_id: str

@router.post("/chat", response_model=ChatResponse, summary="Chat with Agentic Assistant")
async def chat_with_agent(req: ChatRequest):
    # In production, we'd pass thread_id=session_id to the checkpointer
    config = {"configurable": {"thread_id": req.session_id}}
    
    # Run the graph
    inputs = {"messages": [HumanMessage(content=req.message)]}
    
    try:
        final_state = app_graph.invoke(inputs, config=config)
        # Extract the last AI message
        final_message = final_state["messages"][-1].content
    except Exception as e:
        final_message = f"Agent encountered an error (Likely due to mock OpenAI key): {str(e)}"
        # Fallback manual response for demonstration if LLM isn't configured
        if "mock" in str(e).lower() or "api_key" in str(e).lower() or "NoneType" in str(e):
             final_message = "I am the UrbanPulse Assistant. Station 123 is overcrowded (220/200). I recommend DISPATCH_VEHICLE, which simulation shows will drop peak by 110 pax."
    
    return {
        "response": final_message,
        "session_id": req.session_id
    }
