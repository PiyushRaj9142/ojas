"""
Smart Cold Storage - AI Assistant & Translation Routes
Provides SSE streaming, non-streaming completions, live tools, and dynamic translations.
"""

from fastapi import APIRouter, HTTPException, Query, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from app.services.gemini_service import GeminiService, PRIMARY_MODEL, FALLBACK_MODEL, LiveIoTTools

router = APIRouter(prefix="/api/ai", tags=["AI & Multilingual Service"])

class ChatRequest(BaseModel):
    query: str
    language: Optional[str] = None
    conversation_id: Optional[str] = "conv_default"
    history: Optional[List[Dict[str, Any]]] = []

class TranslateRequest(BaseModel):
    text: str
    target_language: str = "hi"  # 'en' | 'hi' | 'hinglish'

class ToolExecutionRequest(BaseModel):
    tool_name: str
    params: Optional[Dict[str, Any]] = {}

@router.get("/health")
async def ai_health():
    return {
        "status": "OPERATIONAL",
        "service": "Google Gemini 3.5 LLM Service",
        "primary_model": PRIMARY_MODEL,
        "fallback_model": FALLBACK_MODEL,
        "streaming_supported": True,
        "multilingual": ["en", "hi", "hinglish"]
    }

@router.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    """
    Stream AI responses token-by-token using Server-Sent Events (SSE).
    """
    if not request.query or not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    async def event_generator():
        async for chunk_json_str in GeminiService.stream_chat(request.query, request.history, request.language):
            yield f"data: {chunk_json_str}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            "Access-Control-Allow-Origin": "*"
        }
    )

@router.post("/chat")
async def chat_complete(request: ChatRequest):
    """
    Standard non-streaming AI response endpoint.
    """
    if not request.query or not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    response = await GeminiService.generate_response(request.query, request.history, request.language)
    return {
        "success": True,
        "data": response
    }

@router.post("/translate")
async def translate_text(request: TranslateRequest):
    """
    Dynamic translation endpoint for dynamic content using Gemini.
    """
    if not request.text:
        return {"translated_text": ""}
        
    translated = await GeminiService.translate_text(request.text, request.target_language)
    return {
        "original": request.text,
        "translated": translated,
        "target_language": request.target_language
    }

@router.post("/tools")
async def execute_tool(request: ToolExecutionRequest):
    """
    Directly execute an IoT / ML / Inventory tool.
    """
    tool_map = {
        "get_current_storage_status": LiveIoTTools.get_current_storage_status,
        "get_temperature": LiveIoTTools.get_temperature,
        "get_humidity": LiveIoTTools.get_humidity,
        "get_battery_status": LiveIoTTools.get_battery_status,
        "get_solar_and_wind_generation": LiveIoTTools.get_solar_and_wind_generation,
        "predict_energy_forecast": LiveIoTTools.predict_energy_forecast,
        "calculate_storage_capacity": LiveIoTTools.calculate_storage_capacity,
        "get_inventory": LiveIoTTools.get_inventory,
        "get_spoilage_risk": LiveIoTTools.get_spoilage_risk,
        "get_alerts": LiveIoTTools.get_alerts,
        "get_booking_status": LiveIoTTools.get_booking_status,
    }

    func = tool_map.get(request.tool_name)
    if not func:
        raise HTTPException(status_code=404, detail=f"Tool '{request.tool_name}' not found")

    result = func()
    return {
        "tool_name": request.tool_name,
        "result": result
    }
