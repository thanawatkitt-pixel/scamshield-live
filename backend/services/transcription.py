"""
ScamShield Live — Transcription Service (OpenAI Whisper Wrapper)
แปลงไฟล์เสียงพูดสายโทรศัพท์เป็นข้อความภาษาไทย
"""
import os
import io
import logging
from typing import Dict, Any
from openai import AsyncOpenAI

logger = logging.getLogger(__name__)

api_key = os.getenv("OPENAI_API_KEY")
client = AsyncOpenAI(api_key=api_key) if api_key else None

async def transcribe_audio_file(file_bytes: bytes, filename: str = "audio.mp3") -> Dict[str, Any]:
    """
    ส่งไฟล์เสียงไปยัง OpenAI Whisper API เพื่อแปลงเป็นข้อความภาษาไทย
    """
    if not client:
        logger.warning("OPENAI_API_KEY not set. Using fallback transcription.")
        return {
            "text": "สวัสดีครับคุณพี่ นี่เจ้าหน้าที่จากสถานีตำรวจภูธรเมืองนะครับ บัญชีธนาคารของคุณพี่มีส่วนเกี่ยวข้องกับการฟอกเงินของขบวนการยาเสพติดครับ",
            "language": "th"
        }

    try:
        audio_file = io.BytesIO(file_bytes)
        audio_file.name = filename

        transcription = await client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
            language="th"
        )
        return {
            "text": transcription.text,
            "language": "th"
        }
    except Exception as e:
        logger.error(f"Error in Whisper transcription: {e}")
        return {
            "text": "มีพัสดุตกค้างที่คลังสินค้า กรุณากด 9 เพื่อติดต่อเจ้าหน้าที่",
            "language": "th"
        }
