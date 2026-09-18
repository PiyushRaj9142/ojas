"""
Secure OTP Engine for FastAPI backend.
"""

import os
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

OTP_EXPIRY_MINUTES = 5
MAX_ATTEMPTS = 5
COOLDOWN_SECONDS = 60

# Registered users in the Smart Cold Storage platform
REGISTERED_FARMERS = {
    "9876543210": {
        "id": "usr-1",
        "name": "Ramesh Patel (रमेश पटेल)",
        "farm_name": "Patel Agro Farms (ग्रीन वैली फार्म्स)",
        "cold_storage_id": "SC-001",
        "location": "Nashik, Maharashtra",
        "total_capacity_kg": 500,
        "language": "en"
    },
    "9812345678": {
        "id": "usr-2",
        "name": "Suresh Kumar (सुरेश कुमार)",
        "farm_name": "Kisan Golden Harvest (किसान फार्म)",
        "cold_storage_id": "SC-002",
        "location": "Pune, Maharashtra",
        "total_capacity_kg": 750,
        "language": "hi"
    },
    "9823456789": {
        "id": "usr-3",
        "name": "Anita Devi (अनिता देवी)",
        "farm_name": "Devi Organic Produce (जैविक फार्म)",
        "cold_storage_id": "SC-003",
        "location": "Baramati, Maharashtra",
        "total_capacity_kg": 600,
        "language": "hinglish"
    },
    "9988776655": {
        "id": "usr-4",
        "name": "Rajesh Patil (राजेश पाटिल)",
        "farm_name": "Patil Cold Chain Units (पाटिल फार्म)",
        "cold_storage_id": "SC-004",
        "location": "Nagpur, Maharashtra",
        "total_capacity_kg": 1000,
        "language": "en"
    },
}

def hash_otp(otp: str, phone: str) -> str:
    """Salted SHA-256 hash of OTP + phone number"""
    salt = phone[-10:]
    return hashlib.sha256((otp + salt).encode("utf-8")).hexdigest()

def generate_secure_otp() -> str:
    """Cryptographically secure 6-digit random number"""
    return f"{secrets.randbelow(900000) + 100000}"

def validate_phone(phone: str) -> str:
    """Validates and normalizes 10-digit Indian phone number"""
    clean = "".join(filter(str.isdigit, phone))
    if len(clean) == 10 and clean[0] in "6789":
        return clean
    if len(clean) > 10 and clean.startswith("91"):
        sub = clean[-10:]
        if len(sub) == 10 and sub[0] in "6789":
            return sub
    raise ValueError("Invalid Indian mobile number. Must be 10 digits starting with 6, 7, 8, or 9.")

def get_registered_user(phone: str) -> Optional[Dict[str, Any]]:
    clean = validate_phone(phone)
    return REGISTERED_FARMERS.get(clean)
