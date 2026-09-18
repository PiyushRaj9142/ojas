"""
SMS Provider abstraction for Python FastAPI backend.
Supports Fast2SMS, MSG91, Twilio, and Development Mock.
"""

import os
import re
import json
import logging
import urllib.request
import urllib.parse
from typing import Dict, Any, Optional

logger = logging.getLogger("sms_service")

class ISMSProvider:
    name: str = "BaseProvider"
    is_real: bool = False

    def send_otp(self, phone: str, otp: str) -> Dict[str, Any]:
        raise NotImplementedError

    def send_alert(self, phone: str, message: str) -> Dict[str, Any]:
        raise NotImplementedError


class Fast2SMSProvider(ISMSProvider):
    name = "Fast2SMS"
    is_real = True

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("SMS_API_KEY", "")

    def send_otp(self, phone: str, otp: str) -> Dict[str, Any]:
        if not self.api_key:
            return {"success": False, "error": "Fast2SMS API key missing", "provider": self.name}
        try:
            clean_phone = re.sub(r"\D", "", phone)[-10:]
            url = "https://www.fast2sms.com/dev/bulkV2"
            payload = json.dumps({
                "variables_values": otp,
                "route": "otp",
                "numbers": clean_phone
            }).encode("utf-8")

            req = urllib.request.Request(url, data=payload, headers={
                "authorization": self.api_key,
                "Content-Type": "application/json"
            })
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                return {
                    "success": bool(data.get("return")),
                    "provider": self.name,
                    "message_id": data.get("request_id")
                }
        except Exception as e:
            logger.error(f"Fast2SMS dispatch error: {e}")
            return {"success": False, "error": str(e), "provider": self.name}

    def send_alert(self, phone: str, message: str) -> Dict[str, Any]:
        if not self.api_key:
            return {"success": False, "error": "Fast2SMS API key missing", "provider": self.name}
        try:
            clean_phone = re.sub(r"\D", "", phone)[-10:]
            url = "https://www.fast2sms.com/dev/bulkV2"
            payload = json.dumps({
                "message": message,
                "language": "english",
                "route": "q",
                "numbers": clean_phone
            }).encode("utf-8")

            req = urllib.request.Request(url, data=payload, headers={
                "authorization": self.api_key,
                "Content-Type": "application/json"
            })
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                return {"success": bool(data.get("return")), "provider": self.name}
        except Exception as e:
            return {"success": False, "error": str(e), "provider": self.name}


class MSG91Provider(ISMSProvider):
    name = "MSG91"
    is_real = True

    def __init__(self, auth_key: Optional[str] = None, template_id: Optional[str] = None):
        self.auth_key = auth_key or os.getenv("MSG91_AUTH_KEY", "")
        self.template_id = template_id or os.getenv("MSG91_TEMPLATE_ID", "")

    def send_otp(self, phone: str, otp: str) -> Dict[str, Any]:
        if not self.auth_key:
            return {"success": False, "error": "MSG91 Auth Key missing", "provider": self.name}
        try:
            clean_phone = "91" + re.sub(r"\D", "", phone)[-10:]
            url = f"https://control.msg91.com/api/v5/otp?template_id={self.template_id}&mobile={clean_phone}&otp={otp}"
            req = urllib.request.Request(url, method="POST", headers={
                "authkey": self.auth_key,
                "Content-Type": "application/json"
            })
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                return {
                    "success": data.get("type") == "success",
                    "provider": self.name,
                    "message_id": data.get("message")
                }
        except Exception as e:
            logger.error(f"MSG91 error: {e}")
            return {"success": False, "error": str(e), "provider": self.name}


class TwilioProvider(ISMSProvider):
    name = "Twilio"
    is_real = True

    def __init__(self):
        self.account_sid = os.getenv("TWILIO_ACCOUNT_SID", "")
        self.auth_token = os.getenv("TWILIO_AUTH_TOKEN", "")
        self.from_phone = os.getenv("TWILIO_PHONE_NUMBER", "")

    def send_otp(self, phone: str, otp: str) -> Dict[str, Any]:
        if not self.account_sid or not self.auth_token:
            return {"success": False, "error": "Twilio credentials missing", "provider": self.name}
        try:
            import base64
            clean_phone = "+91" + re.sub(r"\D", "", phone)[-10:]
            body = f"Your Smart Cold Storage verification code is: {otp}. Valid for 5 minutes."
            url = f"https://api.twilio.com/2010-04-01/Accounts/{self.account_sid}/Messages.json"

            data = urllib.parse.urlencode({
                "To": clean_phone,
                "From": self.from_phone,
                "Body": body
            }).encode("utf-8")

            auth_str = f"{self.account_sid}:{self.auth_token}"
            b64_auth = base64.b64encode(auth_str.encode("utf-8")).decode("utf-8")

            req = urllib.request.Request(url, data=data, headers={
                "Authorization": f"Basic {b64_auth}",
                "Content-Type": "application/x-www-form-urlencoded"
            })
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                return {"success": bool(data.get("sid")), "provider": self.name, "message_id": data.get("sid")}
        except Exception as e:
            logger.error(f"Twilio error: {e}")
            return {"success": False, "error": str(e), "provider": self.name}


class DevMockSMSProvider(ISMSProvider):
    name = "DevelopmentMockProvider"
    is_real = False

    def send_otp(self, phone: str, otp: str) -> Dict[str, Any]:
        clean_phone = re.sub(r"\D", "", phone)[-10:]
        is_prod = os.getenv("OTP_MODE", "").lower() == "production"

        if not is_prod:
            print(f"\n[DEV SMS SIMULATION] To: +91 {clean_phone} | Verification OTP: {otp}\n")

        return {
            "success": True,
            "provider": self.name,
            "message_id": f"mock-{os.urandom(4).hex()}",
            "debug_otp": otp if not is_prod else None
        }

    def send_alert(self, phone: str, message: str) -> Dict[str, Any]:
        return {"success": True, "provider": self.name}


def get_sms_provider() -> ISMSProvider:
    provider_type = os.getenv("SMS_PROVIDER", "").upper()
    is_prod = os.getenv("OTP_MODE", "").lower() == "production"

    if provider_type == "FAST2SMS" or (is_prod and os.getenv("SMS_API_KEY")):
        return Fast2SMSProvider()
    if provider_type == "MSG91" or (is_prod and os.getenv("MSG91_AUTH_KEY")):
        return MSG91Provider()
    if provider_type == "TWILIO" or (is_prod and os.getenv("TWILIO_ACCOUNT_SID")):
        return TwilioProvider()

    if is_prod:
        return Fast2SMSProvider()

    return DevMockSMSProvider()
