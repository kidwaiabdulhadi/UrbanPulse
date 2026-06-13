from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.core.redis_ws import manager

router = APIRouter(prefix="/ws", tags=["websockets"])

@router.websocket("/crowd-updates")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # We don't expect client messages, just keep connection open
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
