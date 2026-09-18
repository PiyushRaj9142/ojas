"""
Smart Cold Storage - FastAPI Backend API.
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import os

from app.routes.auth_routes import router as auth_router
from app.routes.notification_routes import router as notification_router
from app.websocket_manager import ws_manager

app = FastAPI(
    title="Smart Cold Storage API",
    description="IoT Telemetry, Alert Notification & OTP Authentication Service",
    version="2.4.0"
)

# Enable CORS for React Native Web & Mobile Dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routes
app.include_router(auth_router)
app.include_router(notification_router)

@app.get("/")
async def root():
    return {
        "service": "Smart Cold Storage IoT & Auth Backend",
        "status": "OPERATIONAL",
        "version": "2.4.0",
        "docs_url": "/docs"
    }

@app.websocket("/ws/alerts")
async def websocket_alerts(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keep-alive loop
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
