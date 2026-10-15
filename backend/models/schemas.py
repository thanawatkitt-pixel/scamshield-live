from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# ============================================================
# Health Models
# ============================================================
class HealthResponse(BaseModel):
    status: str = "healthy"
    service: str = "ScamShield Live API"
    environment: str = "production"
    version: str = "2.0.0"

# ============================================================
# Link Analysis Models
# ============================================================
class LinkAnalysisRequest(BaseModel):
    url: str = Field(..., description="URL ที่ต้องการตรวจสอบความปลอดภัย", example="https://kbank-verify-alert.top/login")

class LinkAnalysisResponse(BaseModel):
    url: str
    domain: str
    is_safe: bool
    risk_level: str = Field(..., description="SAFE, SUSPICIOUS, DANGEROUS")
    risk_score: int = Field(..., description="คะแนนความเสี่ยง 0-100 (100 = อันตรายสูงสุด)")
    matched_brand: Optional[str] = None
    flags: List[str] = []
    explanation: str
    recommended_action: str

# ============================================================
# Text & SMS Scam Detection Models
# ============================================================
class TextAnalysisRequest(BaseModel):
    text: str = Field(..., description="ข้อความ SMS หรือข้อความแชตที่ต้องการตรวจสอบ", example="คุณได้รับเงินกู้ 50,000 บาท อนุมัติทันที คลิก https://bit.ly/...")
    context: Optional[str] = Field(None, description="บริบทเพิ่มเติม เช่น มาจาก SMS หรือ Line")

class TextAnalysisResponse(BaseModel):
    is_scam: bool
    scam_type: Optional[str] = Field(None, description="ประเภทกลโกง เช่น ปลอมเป็นตำรวจ, เงินกู้หลอกลวง, พัสดุตกค้าง")
    risk_level: str = Field(..., description="LOW, MEDIUM, HIGH, CRITICAL")
    risk_score: int = Field(..., description="0-100")
    red_flags: List[str] = []
    explanation: str
    recommended_action: str

# ============================================================
# Counter-Scam Agent Models
# ============================================================
class CounterScamRequest(BaseModel):
    message: str = Field(..., description="ข้อความล่าสุดที่มิจฉาชีพพูดหรือส่งมา")
    history: Optional[List[Dict[str, str]]] = Field(default_factory=list, description="ประวัติบทสนทนาก่อนหน้า [{'role': 'scammer'|'agent', 'content': '...'}]")
    persona: Optional[str] = Field(default="auntie", description="สไตล์บุคลิก เช่น auntie (ป้าใจดีแกล้งงง), officer (คนตื่นตระหนกแกล้งเช็คข้อมูล)")

class CounterScamResponse(BaseModel):
    reply: str = Field(..., description="ข้อความที่บอทจะตอบกลับเพื่อถ่วงเวลามิจฉาชีพ")
    intent_detected: Optional[str] = Field(None, description="จุดประสงค์ที่มิจฉาชีพกำลังพยายามทำ")
    stalling_tactic: Optional[str] = Field(None, description="กลยุทธ์การถ่วงเวลาที่บอทใช้")

# ============================================================
# Voice Generation (TTS) Models
# ============================================================
class VoiceGenerationRequest(BaseModel):
    text: str = Field(..., description="ข้อความที่ต้องการแปลงเป็นเสียงพูด")
    voice_id: Optional[str] = Field(None, description="ElevenLabs Voice ID (ถ้าไม่ระบุจะใช้ค่า Default)")

class VoiceGenerationResponse(BaseModel):
    audio_base64: str = Field(..., description="ไฟล์เสียงที่แปลงแล้วในรูปแบบ Base64")
    format: str = "mp3"
    voice_id: str

# ============================================================
# Audio Transcription (STT) Models
# ============================================================
class TranscriptionResponse(BaseModel):
    text: str = Field(..., description="ข้อความที่ถอดความได้จากเสียง")
    language: str = "th"
