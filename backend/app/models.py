"""
SQLAlchemy ORM models for Smart Cold Storage.
"""

from datetime import datetime
import uuid
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, JSON, Numeric, ForeignKey
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True)
    name = Column(String(128), nullable=False)
    mobile = Column(String(15), unique=True, nullable=False, index=True)
    farm_name = Column(String(128), nullable=False)
    cold_storage_id = Column(String(32), nullable=False)
    location = Column(String(128), nullable=False)
    total_capacity_kg = Column(Numeric, default=500)
    language = Column(String(16), default="en")
    temp_unit = Column(String(8), default="°C")
    weight_unit = Column(String(16), default="kg")
    role = Column(String(32), default="FARMER")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class OTPVerification(Base):
    __tablename__ = "otp_verifications"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(64), ForeignKey("users.id"), nullable=True)
    phone_number = Column(String(15), nullable=False, index=True)
    otp_hash = Column(String(256), nullable=False)
    purpose = Column(String(32), default="LOGIN")
    expires_at = Column(DateTime, nullable=False, index=True)
    attempts = Column(Integer, default=0)
    max_attempts = Column(Integer, default=5)
    verified_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(64), primary_key=True)
    user_id = Column(String(64), ForeignKey("users.id"), nullable=False, default="usr-1", index=True)
    title = Column(String(255), nullable=False)
    title_hi = Column(String(255), nullable=True)
    message = Column(Text, nullable=False)
    message_hi = Column(Text, nullable=True)
    type = Column(String(32), nullable=False) # TEMPERATURE, BATTERY, SOLAR, SECURITY, etc.
    priority = Column(String(16), default="INFO") # HIGH, MEDIUM, LOW, INFO
    is_read = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    read_at = Column(DateTime, nullable=True)
    metadata = Column(JSON, nullable=True)
    action_url = Column(String(255), nullable=True)
