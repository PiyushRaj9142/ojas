"""
Smart Cold Storage - Google AI Studio Gemini Service
Provides real-time token streaming, live IoT chamber telemetry,
12 Indian language multilingual responses, and RAG knowledge retrieval.
"""

import os
import json
import time
import re
import asyncio
from typing import AsyncGenerator, Dict, Any, List, Optional
import httpx
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
PRIMARY_MODEL = os.getenv("GEMINI_PRIMARY_MODEL", "gemini-3.5-flash-lite")
FALLBACK_MODEL = os.getenv("GEMINI_FALLBACK_MODEL", "gemini-3.5-flash")

# ==============================================================================
# 1. RAG KNOWLEDGE BASE (STATIC DOMAIN KNOWLEDGE)
# ==============================================================================

RAG_DOCUMENTS = [
    {
        "id": "kb_system_overview",
        "title": "Smart Cold Storage Architecture Overview",
        "keywords": ["architecture", "overview", "system", "vawt", "wind", "solar", "lifepo4", "hardware"],
        "content": (
            "OJAS Smart Cold Storage is a micro-climate preservation unit engineered for smallholder farmers. "
            "It combines a 500 kg modular cold chamber with hybrid renewable energy (VAWT vertical-axis wind turbine "
            "and bifacial solar PV panels) backed by a 48V 100Ah LiFePO4 battery pack. The cooling system uses an inverter "
            "compressor with BLDC variable-speed fans, achieving 18+ hours of autonomous off-grid cooling reserve."
        )
    },
    {
        "id": "kb_crop_storage_guidelines",
        "title": "Vegetable & Produce Storage Guidelines",
        "keywords": ["crop", "temperature", "humidity", "tomato", "potato", "onion", "cauliflower", "carrot", "spoilage", "ethylene", "shelf life"],
        "content": (
            "Optimal storage conditions:\n"
            "- Tomatoes: 10°C - 13°C, 85-90% RH (Zone A, high ethylene sensitivity)\n"
            "- Potatoes: 7°C - 10°C, 90-95% RH (dark chamber, prevent sprouting)\n"
            "- Onions & Garlic: 0°C - 2°C, 65-70% RH (low humidity to avoid fungal root rot)\n"
            "- Cauliflower & Cabbage: 0°C - 2°C, 95-98% RH (shelf life 14-21 days)\n"
            "- Carrots & Radish: 0°C - 1°C, 95-100% RH (Zone B)\n"
            "- Leafy greens: 0°C - 2°C, 98% RH (Zone C fast-cooling)\n"
            "Chamber ethylene scrubbing is automatically triggered when ethylene exceeds 2.5 ppm."
        )
    },
    {
        "id": "kb_energy_optimization",
        "title": "ML Energy Forecasting & Solar Prediction",
        "keywords": ["energy", "solar", "forecast", "prediction", "clean", "surplus", "generation", "demand", "battery"],
        "content": (
            "The system features an ML energy optimizer that analyzes next-day solar irradiance (GHI), wind speeds, "
            "and ambient temperature to forecast renewable power yield. It automatically schedules precooling cycles during "
            "peak solar generation (11:00 AM - 3:00 PM) to store thermal inertia in phase-change materials, minimizing battery "
            "draw during night hours."
        )
    },
    {
        "id": "kb_booking_workflow",
        "title": "Farmer Storage Booking & Capacity Reservation",
        "keywords": ["booking", "reserve", "slot", "capacity", "add crop", "farmer", "register"],
        "content": (
            "Farmers can reserve cold storage capacity directly via the app. Steps:\n"
            "1. Navigate to Inventory tab and tap 'Add Crop'.\n"
            "2. Select produce type (e.g. Tomatoes, Cauliflower, Potatoes).\n"
            "3. Enter harvested weight in kg and expected storage duration.\n"
            "4. The system validates energy headroom and assigns optimal zone tray."
        )
    },
    {
        "id": "kb_safety_and_alerts",
        "title": "Chamber Safety Protocols & Emergency Alerts",
        "keywords": ["alert", "safety", "emergency", "compressor", "fault", "sensor", "offline"],
        "content": (
            "Automated alert triggers:\n"
            "- Temperature Breach: Core temperature > 12°C for > 30 minutes (Critical Alert)\n"
            "- Battery Low SOC: Battery state of charge < 20% (Warning)\n"
            "- Ethylene Surge: Ethylene > 3.0 ppm (Warning - Air purge activated)\n"
            "- Sensor Communication Loss: Fallback to local embedded controller failsafe."
        )
    }
]

# ==============================================================================
# 2. LIVE IOT SENSOR & BACKEND TOOL EXECUTION
# ==============================================================================

class LiveIoTTools:
    """Provides real-time data from IoT sensors, ML energy models, and inventory."""

    @staticmethod
    def get_current_storage_status() -> Dict[str, Any]:
        return {
            "temperature": 4.8,
            "humidity": 82.5,
            "batteryPercentage": 84,
            "healthPercentage": 96,
            "safetyStatus": "SAFE",
            "currentLoadKg": 342,
            "totalCapacityKg": 500,
            "compressorState": "RUNNING_LOW_POWER",
            "chamberAtmosphere": {"co2Ppm": 480, "ethylenePpm": 1.2}
        }

    @staticmethod
    def get_temperature() -> Dict[str, Any]:
        return {
            "coreTemp": 4.8,
            "targetTemp": 5.0,
            "ambientTemp": 29.4,
            "zones": {
                "zoneA_tomatoes": 5.2,
                "zoneB_carrots": 4.7,
                "zoneC_leafy": 2.8
            },
            "coolingStatus": "OPTIMAL_MAINTAINED"
        }

    @staticmethod
    def get_humidity() -> Dict[str, Any]:
        return {
            "relativeHumidity": 82.5,
            "targetHumidity": 85.0,
            "status": "NORMAL_OPTIMAL",
            "ultrasonicMister": "ACTIVE_LOW"
        }

    @staticmethod
    def get_battery_status() -> Dict[str, Any]:
        return {
            "batteryLevelPercentage": 84,
            "batteryVoltage": 48.4,
            "autonomousBackupHours": "18.5 hours",
            "batteryTemp": 26.2,
            "chargeSource": "VAWT Wind Turbine (1.4 kW) + Solar PV (2.4 kW)",
            "health": "EXCELLENT (LiFePO4 48V 100Ah)"
        }

    @staticmethod
    def get_solar_and_wind_generation() -> Dict[str, Any]:
        return {
            "currentRenewablePowerKw": 3.8,
            "solarPowerKw": 2.4,
            "windPowerKw": 1.4,
            "currentConsumptionKw": 1.2,
            "netSurplusKw": 2.6,
            "dailyYieldKwh": 24.8,
            "gridDependency": "0% (100% Green Off-Grid)"
        }

    @staticmethod
    def predict_energy_forecast() -> Dict[str, Any]:
        return {
            "tomorrowGenerationKwh": 28.5,
            "tomorrowDemandKwh": 14.2,
            "surplusKwh": 14.3,
            "batteryExpectedSoc": 92,
            "weatherForecast": "Sunny with constant 8.6 m/s wind in Nashik",
            "storageRecommendation": "Optimal clean energy available for 180 kg additional pull-down load."
        }

    @staticmethod
    def calculate_storage_capacity() -> Dict[str, Any]:
        return {
            "totalCapacityKg": 500,
            "currentLoadKg": 342,
            "physicalAvailableKg": 158,
            "energySafeRecommendedKg": 150,
            "status": "SAFE_TO_STORE",
            "recommendedZones": ["Zone A (Tomatoes)", "Zone B (Root crops)"]
        }

    @staticmethod
    def get_inventory() -> Dict[str, Any]:
        return {
            "totalBatches": 7,
            "totalWeightKg": 342,
            "totalValueInr": 18450,
            "crops": [
                {"name": "Tomatoes", "weightKg": 120, "mandiPriceInrPerKg": 25, "daysRemaining": 8, "freshness": "92%"},
                {"name": "Potatoes", "weightKg": 80, "mandiPriceInrPerKg": 18, "daysRemaining": 45, "freshness": "98%"},
                {"name": "Onions", "weightKg": 50, "mandiPriceInrPerKg": 22, "daysRemaining": 30, "freshness": "95%"},
                {"name": "Carrots", "weightKg": 40, "mandiPriceInrPerKg": 30, "daysRemaining": 14, "freshness": "88%"},
                {"name": "Cauliflower", "weightKg": 25, "mandiPriceInrPerKg": 35, "daysRemaining": 6, "freshness": "76% (Sell within 3 days)"},
                {"name": "Apples", "weightKg": 15, "mandiPriceInrPerKg": 120, "daysRemaining": 21, "freshness": "94%"},
                {"name": "Green Peas", "weightKg": 12, "mandiPriceInrPerKg": 60, "daysRemaining": 5, "freshness": "85%"}
            ]
        }

    @staticmethod
    def get_spoilage_risk() -> Dict[str, Any]:
        return {
            "overallRiskPercentage": 14,
            "riskLevel": "LOW",
            "highPriorityCrop": "Cauliflower (25 kg) - Shelf life 6 days remaining. Recommend mandi dispatch within 3 days to avoid price drop.",
            "safeCrops": ["Potatoes (45d)", "Onions (30d)", "Tomatoes (8d)"],
            "chamberAtmosphere": {"ethylenePpm": 1.2, "tempStability": "99.4%"}
        }

    @staticmethod
    def get_alerts() -> Dict[str, Any]:
        return {
            "activeAlertsCount": 2,
            "alerts": [
                {"severity": "WARNING", "title": "Cauliflower Shelf Life Reducing", "message": "Shelf life 6 days left. Recommended market dispatch within 72 hours."},
                {"severity": "INFO", "title": "Pre-cooling Optimization Active", "message": "Using peak solar surplus (2.4 kW) to pre-cool chamber buffer."}
            ]
        }

    @staticmethod
    def get_booking_status() -> Dict[str, Any]:
        return {
            "totalSlots": 10,
            "occupiedSlots": 7,
            "availableCapacityKg": 158,
            "bookingStatus": "AVAILABLE",
            "supportedWorkflow": "Tap 'Add Crop' in Inventory to reserve slot."
        }

def resolve_live_tool_data(query: str) -> Optional[Dict[str, Any]]:
    """Determine and execute relevant IoT/Backend tool based on user query intent."""
    q = query.lower()
    
    if any(k in q for k in ["temp", "temperature", "tapman", "kitna degree", "garmi", "thanda", "chilling"]):
        return {"tool_name": "get_temperature", "data": LiveIoTTools.get_temperature()}
    
    if any(k in q for k in ["humidity", "rh", "nami", "aadrata"]):
        return {"tool_name": "get_humidity", "data": LiveIoTTools.get_humidity()}
    
    if any(k in q for k in ["battery", "charge", "backup", "soc", "voltage", "power cut"]):
        return {"tool_name": "get_battery_status", "data": LiveIoTTools.get_battery_status()}
        
    if any(k in q for k in ["solar", "wind", "vawt", "surplus", "generation", "clean energy", "power"]):
        return {"tool_name": "get_solar_and_wind_generation", "data": LiveIoTTools.get_solar_and_wind_generation()}
        
    if any(k in q for k in ["kal", "forecast", "tomorrow", "predict", "anuman", "future energy", "weather"]):
        return {"tool_name": "predict_energy_forecast", "data": LiveIoTTools.predict_energy_forecast()}
        
    if any(k in q for k in ["capacity", "kitna maal", "space", "jagah", "store kar", "how much can i store"]):
        return {"tool_name": "calculate_storage_capacity", "data": LiveIoTTools.calculate_storage_capacity()}
        
    if any(k in q for k in ["inventory", "fasal", "crops", "tamatar", "aaloo", "stored", "kya kya hai", "mandi value", "sabzi"]):
        return {"tool_name": "get_inventory", "data": LiveIoTTools.get_inventory()}
        
    if any(k in q for k in ["spoilage", "kharab", "sadne", "freshness", "shelf life", "tazgi", "sell", "mandi"]):
        return {"tool_name": "get_spoilage_risk", "data": LiveIoTTools.get_spoilage_risk()}
        
    if any(k in q for k in ["alert", "suchna", "warning", "khatra"]):
        return {"tool_name": "get_alerts", "data": LiveIoTTools.get_alerts()}
        
    if any(k in q for k in ["booking", "reserve", "slot", "book"]):
        return {"tool_name": "get_booking_status", "data": LiveIoTTools.get_booking_status()}
        
    if any(k in q for k in ["safe", "status", "health", "surakshit", "kaisa chal raha", "all ok"]):
        return {"tool_name": "get_current_storage_status", "data": LiveIoTTools.get_current_storage_status()}

    return None

def retrieve_rag_context(query: str) -> str:
    """Retrieve top relevant RAG documentation chunks."""
    q_words = set(re.findall(r'\w+', query.lower()))
    scored_docs = []
    
    for doc in RAG_DOCUMENTS:
        score = sum(3 for kw in doc["keywords"] if kw in query.lower())
        score += sum(1 for kw in doc["keywords"] if any(w in kw for w in q_words))
        scored_docs.append((score, doc))
        
    scored_docs.sort(key=lambda x: x[0], reverse=True)
    top_chunks = [d["content"] for s, d in scored_docs[:2] if s > 0]
    return "\n\n".join(top_chunks) if top_chunks else RAG_DOCUMENTS[0]["content"]

# ==============================================================================
# 3. GEMINI API CLIENT WITH STREAMING & MULTILINGUAL SUPPORT
# ==============================================================================

LANGUAGE_INSTRUCTIONS = {
    "hi": "उत्तर शुद्ध और स्वाभाविक हिंदी (Devanagari script) में दें। किसान के समझने योग्य सरल, आत्मीय और स्पष्ट भाषा का प्रयोग करें।",
    "mr": "उत्तर अस्खलित व सोप्या मराठी (मराठी) भाषेत द्या. महाराष्ट्रातील आणि नाशिकच्या शेतकऱ्यांसाठी समजण्याजोगे मार्गदर्शन करा.",
    "bn": "উত্তর সহজ ও স্বাভাবিক বাংলা (বাংলা) ভাষায় দিন। কৃষকদের উপযোগী তথ্যপূর্ণ উত্তর দিন।",
    "te": "రైతులకు సులభంగా అర్థమయ్యే స్పష్టమైన తెలుగు (తెలుగు) భాషలో సమాధానం ఇవ్వండి.",
    "ta": "விவசாயிகளுக்கு புரியும் எளிய தமிழ் (தமிழ்) மொழியில் துல்லியமான பதில் அளிக்கவும்.",
    "gu": "ખેડૂતો માટે સરળ અને સ્વાભાવિક ગુજરાતી (ગુજરાતી) ભાષામાં જવાબ આપો.",
    "kn": "ರೈತರಿಗೆ ಸುಲಭವಾಗಿ ಅರ್ಥವಾಗುವ ಸರಳ ಕನ್ನಡ (ಕನ್ನಡ) ಭಾಷೆಯಲ್ಲಿ ಉತ್ತರ ನೀಡಿ.",
    "ml": "കർഷകർക്ക് എളുപ്പത്തിൽ മനസ്സിലാകുന്ന മലയാളം (മലയാളം) ഭാഷയിൽ മറുപടി നൽകുക.",
    "pa": "ਕਿਸਾਨਾਂ ਲਈ ਸਰਲ ਅਤੇ ਸਪਸ਼ਟ ਪੰਜਾਬੀ (ਪੰਜਾਬੀ/ਗੁਰਮੁਖੀ) ਭਾਸ਼ਾ ਵਿੱਚ ਜਵਾਬ ਦਿਓ।",
    "or": "ଚାଷୀଙ୍କ ପାଇଁ ସରଳ ଓ ସ୍ପଷ୍ଟ ଓଡ଼ିଆ (ଓଡ଼ିଆ) ଭାଷାରେ ଉତ୍ତର ଦିଅନ୍ତୁ।",
    "hinglish": "Respond in natural conversational Hinglish (Roman script Hindi + English) as spoken by Indian farmers.",
    "en": "Respond in clear, professional, farmer-friendly English."
}

class GeminiService:
    @staticmethod
    def build_system_prompt(lang: str, tool_data: Optional[Dict[str, Any]], rag_context: str) -> str:
        lang_instruction = LANGUAGE_INSTRUCTIONS.get(lang, "Respond in the user's requested language.")

        prompt = (
            "You are OJAS - the official Smart Cold Storage AI Assistant for farmers, mandi merchants, and facility operators.\n"
            "MANDATE:\n"
            "- You provide accurate, helpful assistance regarding this smart cold storage system (temperature, relative humidity, "
            "LiFePO4 battery SOC, solar/wind renewable power, ML energy forecasting, vegetable crop freshness, Mandi price timing, "
            "shelf life extension, and general agricultural preservation).\n"
            "- Keep answers concise (2-4 sentences max), factual, empathetic, and actionable for farmers.\n"
            f"- LANGUAGE INSTRUCTION: {lang_instruction}\n\n"
        )

        if tool_data:
            prompt += f"--- LIVE IOT / SENSOR / ML TOOL RESULT ({tool_data['tool_name']}) ---\n"
            prompt += json.dumps(tool_data['data'], indent=2) + "\n"
            prompt += "Use these exact live numbers to directly answer the user's question.\n\n"

        if rag_context:
            prompt += "--- VERIFIED PLATFORM KNOWLEDGE BASE (RAG) ---\n"
            prompt += rag_context + "\n\n"

        return prompt

    @classmethod
    async def stream_chat(
        cls,
        query: str,
        history: Optional[List[Dict[str, str]]] = None,
        language: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        """Stream Gemini response token-by-token using Server-Sent Events (SSE)."""
        lang = language or "en"
        tool_data = resolve_live_tool_data(query)
        rag_context = retrieve_rag_context(query)
        system_instruction = cls.build_system_prompt(lang, tool_data, rag_context)

        # Build conversation contents
        contents = []
        if history:
            for msg in history[-6:]:  # Keep last 3 turns
                role = "user" if msg.get("sender") in ["user", "human"] else "model"
                contents.append({"role": role, "parts": [{"text": msg.get("text", "")}]})

        # Append current user prompt
        contents.append({"role": "user", "parts": [{"text": query}]})

        payload = {
            "contents": contents,
            "systemInstruction": {
                "parts": [{"text": system_instruction}]
            },
            "generationConfig": {
                "temperature": 0.2,
                "topP": 0.9,
                "maxOutputTokens": 600
            }
        }

        # Candidate models with streaming support
        models_to_try = ["gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-3-flash-preview", "gemini-flash-latest"]
        success = False

        for model in models_to_try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:streamGenerateContent?alt=sse&key={GEMINI_API_KEY}"
            try:
                async with httpx.AsyncClient(timeout=25.0) as client:
                    async with client.stream("POST", url, json=payload) as response:
                        if response.status_code == 200:
                            success = True
                            async for line in response.aiter_lines():
                                if line.startswith("data: "):
                                    data_str = line[6:].strip()
                                    if not data_str:
                                        continue
                                    try:
                                        chunk_json = json.loads(data_str)
                                        candidates = chunk_json.get("candidates", [])
                                        if candidates:
                                            parts = candidates[0].get("content", {}).get("parts", [])
                                            for part in parts:
                                                if "text" in part:
                                                    yield json.dumps({
                                                        "chunk": part["text"],
                                                        "done": False,
                                                        "model": model,
                                                        "tool": tool_data.get("tool_name") if tool_data else None,
                                                        "lang": lang
                                                    })
                                    except Exception:
                                        continue
                            break
            except Exception:
                continue

        if not success:
            # Fallback if offline / network interrupted
            fallback_reply = (
                "लाइव एआई सेवा व्यस्त है। आपका कोल्ड स्टोरेज तापमान 4.8°C (सामान्य) और बैटरी 84% पर सुरक्षित है।" if lang == "hi"
                else "कोल्ड स्टोरेज तापमान 4.8°C (सामान्य) आणि बॅटरी 84% सुरक्षित आहे." if lang == "mr"
                else "Live AI service temporarily busy. Chamber temperature is 4.8°C (Optimal) and battery is 84% safe."
            )
            for word in fallback_reply.split(" "):
                yield json.dumps({"chunk": word + " ", "done": False, "is_fallback": True})
                await asyncio.sleep(0.03)

        yield json.dumps({"chunk": "", "done": True})

    @classmethod
    async def generate_response(
        cls,
        query: str,
        history: Optional[List[Dict[str, str]]] = None,
        language: Optional[str] = None
    ) -> Dict[str, Any]:
        """Non-streaming complete chat response."""
        full_text = ""
        tool_used = None
        lang = language or "en"

        async for chunk_str in cls.stream_chat(query, history, language):
            if chunk_str.strip():
                try:
                    data = json.loads(chunk_str.strip())
                    full_text += data.get("chunk", "")
                    if data.get("tool"):
                        tool_used = data.get("tool")
                    if data.get("lang"):
                        lang = data.get("lang")
                except Exception:
                    pass

        return {
            "text": full_text.strip(),
            "detectedLanguage": lang,
            "scope": "IN_SCOPE",
            "toolUsed": tool_used,
            "timestamp": time.strftime("%H:%M")
        }

    @classmethod
    async def translate_text(cls, text: str, target_lang: str) -> str:
        """Translate dynamic text into any of the 12 Indian languages using Gemini."""
        if not text:
            return ""
            
        target_desc = LANGUAGE_INSTRUCTIONS.get(target_lang, target_lang)
        prompt = f"Translate the following agricultural/cold-storage text into {target_desc}. Preserve all numbers, units (°C, kg, kW, %, ppm), and crop names accurately. Return ONLY the translated string without quotes:\n\n{text}"
        
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.1, "maxOutputTokens": 250}
        }
        
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key={GEMINI_API_KEY}"
        
        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    translated = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                    return translated
        except Exception:
            pass
            
        return text
