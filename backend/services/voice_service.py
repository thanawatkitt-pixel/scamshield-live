"""
ScamShield Live — Voice Service (ElevenLabs TTS Wrapper)
แปลงข้อความเป็นเสียงพูดภาษาไทยสำหรับ Counter-Scam Agent
"""
import os
import base64
import logging
from typing import Dict, Any, Optional
import httpx

logger = logging.getLogger(__name__)

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
DEFAULT_VOICE_ID = os.getenv("ELEVENLABS_VOICE_ID", "OYTbf65OHHFELVut7v2H")
DEFAULT_MODEL_ID = os.getenv("ELEVENLABS_MODEL_ID", "eleven_v3")

async def generate_speech(text: str, voice_id: Optional[str] = None) -> Dict[str, Any]:
    """
    แปลงข้อความเป็นเสียงพูดผ่าน ElevenLabs API
    คืนค่า base64 ของไฟล์ mp3
    """
    selected_voice_id = voice_id or DEFAULT_VOICE_ID
    api_key = os.getenv("ELEVENLABS_API_KEY")

    if not api_key:
        logger.warning("ELEVENLABS_API_KEY not set. Generating silent placeholder.")
        # สร้าง 0.5s silent mp3 header base64 เพื่อป้องกันแอปพังเวลา Demo
        dummy_mp3_base64 = "SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAFAAAAZgADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMD////////////////////////////////////////////////AAAA"
        return {
            "audio_base64": dummy_mp3_base64,
            "format": "mp3",
            "voice_id": selected_voice_id
        }

    url = f"https://api.elevenlabs.io/v1/text-to-speech/{selected_voice_id}"
    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": api_key,
    }
    payload = {
        "text": text,
        "model_id": DEFAULT_MODEL_ID,
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.8
        }
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, json=payload, headers=headers)
            
            # หาก model eleven_v3 ใช้ไม่ได้ ให้ลอง eleven_multilingual_v2
            if response.status_code == 400 and DEFAULT_MODEL_ID == "eleven_v3":
                payload["model_id"] = "eleven_multilingual_v2"
                response = await client.post(url, json=payload, headers=headers)

            response.raise_for_status()
            audio_bytes = response.content
            audio_base64 = base64.b64encode(audio_bytes).decode("utf-8")

            return {
                "audio_base64": audio_base64,
                "format": "mp3",
                "voice_id": selected_voice_id
            }
    except Exception as e:
        logger.error(f"Error calling ElevenLabs API: {e}")
        # fallback dummy audio
        return {
            "audio_base64": "SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAFAAAAZgADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMD////////////////////////////////////////////////AAAA",
            "format": "mp3",
            "voice_id": selected_voice_id
        }
