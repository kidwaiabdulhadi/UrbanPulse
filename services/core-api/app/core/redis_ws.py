import redis.asyncio as redis
from fastapi import WebSocket
from typing import List
import json
import asyncio
from app.core.config import settings

redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.pubsub = redis_client.pubsub()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast_local(self, message: dict):
        for connection in self.active_connections:
            await connection.send_json(message)

    async def listen_to_redis(self):
        await self.pubsub.subscribe("crowd_updates")
        async for message in self.pubsub.listen():
            if message['type'] == 'message':
                data = json.loads(message['data'])
                await self.broadcast_local(data)

manager = ConnectionManager()
