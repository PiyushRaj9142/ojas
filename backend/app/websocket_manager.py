"""
WebSocket Manager for Real-time Dashboard Alerts.
"""

from typing import List, Dict, Any
from fastapi import WebSocket
import json
import logging

logger = logging.getLogger("websocket_manager")

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"Client connected. Active count: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"Client disconnected. Active count: {len(self.active_connections)}")

    async def broadcast(self, event_type: str, data: Dict[str, Any]):
        payload = json.dumps({"event": event_type, "data": data})
        for connection in list(self.active_connections):
            try:
                await connection.send_text(payload)
            except Exception as e:
                logger.warning(f"Error sending message to client: {e}")
                self.disconnect(connection)

ws_manager = ConnectionManager()
