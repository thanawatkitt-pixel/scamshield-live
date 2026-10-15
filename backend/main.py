"""
ScamShield Live — FastAPI Backend Server
ระบบตรวจจับกลโกงคอลเซ็นเตอร์, SMS แนบลิงก์ปลอม, และ Counter-Scam AI Agent
"""
import os
import sys
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# เพิ่ม directory ของ backend เข้า sys.path เพื่อรองรับทั้งการรันจาก root หรือ backend folder
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

load_dotenv()

from models.schemas import (
    HealthResponse,
    LinkAnalysisRequest,
    LinkAnalysisResponse,
    TextAnalysisRequest,
    TextAnalysisResponse,
    CounterScamRequest,
    CounterScamResponse,
    VoiceGenerationRequest,
    VoiceGenerationResponse,
    TranscriptionResponse
)
from services.link_analyzer import analyze_url
from services.llm_service import analyze_scam_text, generate_counter_response
from services.voice_service import generate_speech
from services.transcription import transcribe_audio_file

app = FastAPI(
    title="ScamShield Live API",
    description="Real-time Scam Detection & Counter-Scam Agent for Thailand (Hackathon Edition)",
    version="2.0.0"
)

# ============================================================
# CORS Middleware
# ============================================================
cors_origins_env = os.getenv("CORS_ORIGINS", "*")
origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()] or ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# Endpoints
# ============================================================

# 1. Root / Welcome
@app.get("/", tags=["Info"])
async def root():
    return {
        "project": "ScamShield Live",
        "description": "ระบบตรวจจับกลโกงมิจฉาชีพและ AI ผู้ช่วยถ่วงเวลาคอลเซ็นเตอร์",
        "documentation": "/docs",
        "health": "/health",
        "endpoints": [
            "POST /api/analyze-link",
            "POST /api/analyze-text",
            "POST /api/transcribe",
            "POST /api/counter-scam",
            "POST /api/generate-voice"
        ]
    }

# 2. Health Check (สำหรับ Render & Monitoring)
@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    return HealthResponse(
        status="healthy",
        service="ScamShield Live API",
        environment=os.getenv("APP_ENV", "production"),
        version="2.0.0"
    )

# 3. ตรวจสอบลิงก์ฟิชชิ่ง / เว็บหลอกลวง (v2 with Whitelist)
@app.post("/api/analyze-link", response_model=LinkAnalysisResponse, tags=["Security"])
async def check_link(payload: LinkAnalysisRequest):
    try:
        result = await analyze_url(payload.url)
        return LinkAnalysisResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Link analysis failed: {str(e)}")

# 4. วิเคราะห์ข้อความ SMS / Chat หาเจตนากลโกง
@app.post("/api/analyze-text", response_model=TextAnalysisResponse, tags=["AI Analysis"])
async def check_text(payload: TextAnalysisRequest):
    try:
        result = await analyze_scam_text(payload.text, payload.context)
        return TextAnalysisResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text analysis failed: {str(e)}")

# 5. ถอดความเสียงการโทร (Whisper STT)
@app.post("/api/transcribe", response_model=TranscriptionResponse, tags=["Voice & Audio"])
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        content = await file.read()
        result = await transcribe_audio_file(content, filename=file.filename or "audio.mp3")
        return TranscriptionResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

# 6. Counter-Scam Agent (สร้างคำตอบโต้ตอบและถ่วงเวลามิจฉาชีพ)
@app.post("/api/counter-scam", response_model=CounterScamResponse, tags=["Counter-Scam"])
async def counter_scam(payload: CounterScamRequest):
    try:
        result = await generate_counter_response(
            message=payload.message,
            history=payload.history,
            persona=payload.persona or "auntie"
        )
        return CounterScamResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Counter-scam generation failed: {str(e)}")

# 7. สังเคราะห์เสียงพูด (ElevenLabs TTS)
@app.post("/api/generate-voice", response_model=VoiceGenerationResponse, tags=["Voice & Audio"])
async def text_to_speech(payload: VoiceGenerationRequest):
    try:
        result = await generate_speech(payload.text, payload.voice_id)
        return VoiceGenerationResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voice generation failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
