"""
Notification Routes for FastAPI backend.
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional, Dict, Any
from app.websocket_manager import ws_manager

router = APIRouter(prefix="/api/notifications", tags=["Notifications & Alerts"])

# In-memory storage seeded with sample notifications
notifications_db: List[Dict[str, Any]] = [
    {
        "id": "notif-1",
        "user_id": "usr-1",
        "title": "Temperature Exceeded Safe Threshold",
        "title_hi": "तापमान सुरक्षित सीमा से अधिक हुआ",
        "message": "Storage Compartment A reached 5.8°C (Safe limit: 0.5°C - 5.5°C). Secondary cooling active.",
        "message_hi": "कम्पार्टमेंट A का तापमान 5.8°C पहुँचा। अतिरिक्त कूलिंग शुरू की गई।",
        "type": "TEMPERATURE",
        "priority": "HIGH",
        "is_read": False,
        "created_at": datetime.utcnow().isoformat(),
        "metadata": {"temp": 5.8, "threshold": 5.5}
    },
    {
        "id": "notif-2",
        "user_id": "usr-1",
        "title": "Battery Reserve Below 30%",
        "title_hi": "बैटरी बैकअप 30% से नीचे",
        "message": "LiFePO4 Storage Battery is at 28%. Hybrid solar/wind priority charging initiated.",
        "message_hi": "LiFePO4 बैटरी 28% पर है। हाइब्रिड सौर/पवन चार्जिंग सक्रिय।",
        "type": "BATTERY",
        "priority": "MEDIUM",
        "is_read": False,
        "created_at": datetime.utcnow().isoformat(),
        "metadata": {"batteryLevel": 28}
    },
    {
        "id": "notif-3",
        "user_id": "usr-1",
        "title": "VAWT Wind Turbine Generation High",
        "title_hi": "पवन चक्की से बिजली उत्पादन तेज",
        "message": "Wind speed 14.2 km/h detected. Generator delivering 4.8 kW clean power to compressor.",
        "message_hi": "हवा की गति 14.2 km/h। 4.8 kW स्वच्छ ऊर्जा कम्प्रेसर को मिल रही है।",
        "type": "SOLAR",
        "priority": "LOW",
        "is_read": True,
        "created_at": datetime.utcnow().isoformat(),
        "metadata": {"windSpeed": 14.2}
    }
]

class CreateNotificationRequest(BaseModel):
    title: str
    title_hi: Optional[str] = None
    message: str
    message_hi: Optional[str] = None
    type: str # TEMPERATURE, HUMIDITY, BATTERY, SOLAR, SECURITY, etc.
    priority: Optional[str] = "INFO" # HIGH, MEDIUM, LOW, INFO
    metadata: Optional[Dict[str, Any]] = None

@router.get("")
async def get_notifications(user_id: str = "usr-1", unread_only: bool = False):
    user_notifs = [n for n in notifications_db if n.get("user_id") == user_id]
    if unread_only:
        user_notifs = [n for n in user_notifs if not n.get("is_read")]
    return {
        "success": True,
        "notifications": user_notifs,
        "total": len(user_notifs),
        "unread_count": sum(1 for n in user_notifs if not n.get("is_read"))
    }

@router.get("/unread-count")
async def get_unread_count(user_id: str = "usr-1"):
    count = sum(1 for n in notifications_db if n.get("user_id") == user_id and not n.get("is_read"))
    return {"unread_count": count}

@router.post("")
async def create_notification(req: CreateNotificationRequest, user_id: str = "usr-1"):
    new_notif = {
        "id": f"notif-{int(datetime.utcnow().timestamp())}",
        "user_id": user_id,
        "title": req.title,
        "title_hi": req.title_hi,
        "message": req.message,
        "message_hi": req.message_hi,
        "type": req.type,
        "priority": req.priority,
        "is_read": False,
        "created_at": datetime.utcnow().isoformat(),
        "metadata": req.metadata or {}
    }
    notifications_db.insert(0, new_notif)

    # Broadcast alert via WebSocket
    await ws_manager.broadcast("NEW_ALERT", new_notif)

    return {"success": True, "notification": new_notif}

@router.patch("/{notification_id}/read")
async def mark_as_read(notification_id: str):
    for n in notifications_db:
        if n["id"] == notification_id:
            n["is_read"] = True
            n["read_at"] = datetime.utcnow().isoformat()
            return {"success": True, "notification": n}
    raise HTTPException(status_code=404, detail="Notification not found")

@router.patch("/read-all")
async def mark_all_as_read(user_id: str = "usr-1"):
    for n in notifications_db:
        if n.get("user_id") == user_id:
            n["is_read"] = True
            n["read_at"] = datetime.utcnow().isoformat()
    return {"success": True, "message": "All notifications marked as read"}

@router.delete("/{notification_id}")
async def delete_notification(notification_id: str):
    global notifications_db
    before_len = len(notifications_db)
    notifications_db = [n for n in notifications_db if n["id"] != notification_id]
    if len(notifications_db) < before_len:
        return {"success": True, "message": "Notification deleted"}
    raise HTTPException(status_code=404, detail="Notification not found")
