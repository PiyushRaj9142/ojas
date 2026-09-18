"""
Authentication & Real OTP Routes for FastAPI backend.
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from datetime import datetime, timedelta
import os
from typing import Optional, Dict, Any

from app.services.otp_service import (
    validate_phone,
    generate_secure_otp,
    hash_otp,
    get_registered_user,
    OTP_EXPIRY_MINUTES,
    COOLDOWN_SECONDS,
    MAX_ATTEMPTS
)
from app.services.sms_service import get_sms_provider
from app.websocket_manager import ws_manager

router = APIRouter(prefix="/api/auth", tags=["Authentication & Real OTP"])

# In-memory store (or backed by PostgreSQL table otp_verifications)
otp_store: Dict[str, Dict[str, Any]] = {}

class SendOTPRequest(BaseModel):
    phone_number: str = Field(..., description="10-digit Indian mobile number (+91 XXXXXXXXXX)")
    purpose: Optional[str] = Field("LOGIN", description="Purpose of OTP verification")

class VerifyOTPRequest(BaseModel):
    phone_number: str = Field(..., description="10-digit Indian mobile number (+91 XXXXXXXXXX)")
    otp: str = Field(..., min_length=6, max_length=6, description="6-digit OTP code")
    purpose: Optional[str] = Field("LOGIN")

@router.post("/send-otp")
async def send_otp(req: SendOTPRequest):
    try:
        clean_phone = validate_phone(req.phone_number)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    # Validate registered farmer account
    user = get_registered_user(clean_phone)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mobile number is not registered with Smart Cold Storage."
        )

    now = datetime.utcnow()
    existing = otp_store.get(clean_phone)
    if existing:
        last_sent = existing.get("last_sent_at", now)
        elapsed = (now - last_sent).total_seconds()
        if elapsed < COOLDOWN_SECONDS:
            remaining = int(COOLDOWN_SECONDS - elapsed)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Please wait {remaining}s before requesting a new OTP."
            )

    plain_otp = generate_secure_otp()
    hashed = hash_otp(plain_otp, clean_phone)

    otp_store[clean_phone] = {
        "user_id": user["id"],
        "otp_hash": hashed,
        "purpose": req.purpose,
        "expires_at": now + timedelta(minutes=OTP_EXPIRY_MINUTES),
        "attempts": 0,
        "last_sent_at": now,
    }

    # Dispatch via SMS Gateway
    sms_provider = get_sms_provider()
    sms_res = sms_provider.send_otp(clean_phone, plain_otp)

    if not sms_res.get("success"):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=sms_res.get("error", "Unable to send OTP right now. Please try again.")
        )

    # Security event broadcast
    await ws_manager.broadcast("SECURITY_EVENT", {
        "type": "OTP_SENT",
        "phone_masked": f"+91 ******{clean_phone[-4:]}",
        "timestamp": now.isoformat()
    })

    is_prod = os.getenv("OTP_MODE", "").lower() == "production"

    response_data: Dict[str, Any] = {
        "success": True,
        "message": f"OTP sent successfully to +91 ******{clean_phone[-4:]}",
        "cooldown_seconds": COOLDOWN_SECONDS,
        "expires_in_seconds": OTP_EXPIRY_MINUTES * 60,
    }

    # In development mode only, provide debug token
    if not is_prod and sms_res.get("debug_otp"):
        response_data["debug_otp"] = sms_res.get("debug_otp")

    return response_data

@router.post("/verify-otp")
async def verify_otp(req: VerifyOTPRequest):
    try:
        clean_phone = validate_phone(req.phone_number)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    record = otp_store.get(clean_phone)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active OTP found. Please request a new OTP."
        )

    now = datetime.utcnow()
    if now > record["expires_at"]:
        otp_store.pop(clean_phone, None)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP expired. Please request a new OTP."
        )

    if record["attempts"] >= MAX_ATTEMPTS:
        otp_store.pop(clean_phone, None)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Too many attempts. Please request a new OTP."
        )

    entered_hash = hash_otp(req.otp.strip(), clean_phone)

    if entered_hash == record["otp_hash"]:
        # Invalidate OTP immediately upon success
        otp_store.pop(clean_phone, None)

        user = get_registered_user(clean_phone)

        # Notify dashboard
        await ws_manager.broadcast("SECURITY_EVENT", {
            "type": "LOGIN_SUCCESS",
            "phone_masked": f"+91 ******{clean_phone[-4:]}",
            "timestamp": now.isoformat()
        })

        return {
            "success": True,
            "message": "Mobile number verified successfully!",
            "token": f"scs_session_{clean_phone}_{int(now.timestamp())}",
            "user": user
        }

    # Increment attempts on wrong code
    record["attempts"] += 1
    remaining = MAX_ATTEMPTS - record["attempts"]

    if remaining > 0:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid OTP. Please check and try again. ({remaining} attempts remaining)"
        )
    else:
        otp_store.pop(clean_phone, None)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Too many attempts. Please request a new OTP."
        )

@router.post("/resend-otp")
async def resend_otp(req: SendOTPRequest):
    return await send_otp(req)
