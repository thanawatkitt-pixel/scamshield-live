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

# ============================================================
# Frontend Aliases & Rich Responses (/api/scan/*)
# ============================================================

@app.post("/api/scan/message", tags=["Frontend Bridge"])
async def scan_message_bridge(data: dict):
    message = data.get("message", "")
    analysis_res = await analyze_scam_text(message)
    
    # แปลงระดับความเสี่ยงเป็นระดับที่ frontend ใช้ (safe, suspicious, dangerous)
    risk_level = analysis_res.get("risk_level", "LOW").lower()
    if risk_level in ["critical", "high"]:
        threat_level = "dangerous"
    elif risk_level == "medium":
        threat_level = "suspicious"
    else:
        threat_level = "safe"

    red_flags = [
        {"text": flag, "reason_th": "พบรูปแบบข้อความน่าสงสัย", "severity": "critical" if threat_level == "dangerous" else "warning"}
        for flag in analysis_res.get("red_flags", [])
    ]
    if not red_flags and threat_level != "safe":
        red_flags.append({"text": message[:50] + "...", "reason_th": analysis_res.get("explanation", ""), "severity": "warning"})

    return {
        "analysis": {
            "threat_level": threat_level,
            "threat_score": analysis_res.get("risk_score", 0),
            "scam_type_th": analysis_res.get("scam_type") or "ข้อความทั่วไป",
            "summary_th": analysis_res.get("explanation", ""),
            "recommended_action_th": analysis_res.get("recommended_action", ""),
            "red_flags": red_flags
        },
        "voice_warning": {
            "audio_base64": None,
            "script_th": analysis_res.get("recommended_action", "")
        }
    }

@app.post("/api/scan/link", tags=["Frontend Bridge"])
async def scan_link_bridge(data: dict):
    url = data.get("url", "")
    link_res = await analyze_url(url)
    
    risk_level = link_res.get("risk_level", "SAFE").lower()
    if risk_level == "dangerous":
        threat_level = "dangerous"
    elif risk_level == "suspicious":
        threat_level = "suspicious"
    else:
        threat_level = "safe"

    red_flags = [
        {"text": flag, "reason_th": "ตรวจพบความผิดปกติของลิงก์", "severity": "critical" if threat_level == "dangerous" else "warning"}
        for flag in link_res.get("flags", [])
    ]

    return {
        "analysis": {
            "threat_level": threat_level,
            "threat_score": link_res.get("risk_score", 0),
            "scam_type_th": f"ฟิชชิ่ง / เลียนแบบแบรนด์ ({link_res.get('matched_brand')})" if link_res.get("matched_brand") else "ลิงก์ต้องสงสัย",
            "summary_th": link_res.get("explanation", ""),
            "recommended_action_th": link_res.get("recommended_action", ""),
            "red_flags": red_flags
        },
        "url_structure": {
            "domain": link_res.get("domain", ""),
            "is_ip": False,
            "tld": "." + link_res.get("domain", "").split(".")[-1] if "." in link_res.get("domain", "") else ""
        }
    }

@app.post("/api/scan/voice/transcript", tags=["Frontend Bridge"])
async def scan_voice_transcript_bridge(data: dict):
    transcript = data.get("transcript", "")
    analysis_res = await analyze_scam_text(transcript, context="บทสนทนาจากการโทรศัพท์")
    
    risk_level = analysis_res.get("risk_level", "LOW").lower()
    if risk_level in ["critical", "high"]:
        threat_level = "dangerous"
    elif risk_level == "medium":
        threat_level = "suspicious"
    else:
        threat_level = "safe"

    return {
        "analysis": {
            "threat_level": threat_level,
            "threat_score": analysis_res.get("risk_score", 0),
            "scam_type_th": analysis_res.get("scam_type") or "สายโทรคอลเซ็นเตอร์หลอกลวง",
            "summary_th": analysis_res.get("explanation", ""),
            "recommended_action_th": analysis_res.get("recommended_action", ""),
            "red_flags": [
                {"text": flag, "reason_th": "ตรวจพบคำพูดกดดันหรือหลอกล่อ", "severity": "critical"}
                for flag in analysis_res.get("red_flags", [])
            ]
        }
    }

@app.post("/api/counter-scam/start", tags=["Frontend Bridge"])
async def start_counter_scam_bridge(scam_type: str = "general"):
    return {
        "session_id": "session_" + os.urandom(4).hex(),
        "status": "ready",
        "agent_greeting": "สวัสดีค่ะ มีเรื่องอะไรให้ป้าช่วยไหมลูก พอดีโทรศัพท์ป้าจอมันไม่ค่อยดีจ้ะ"
    }

@app.post("/api/counter-scam/turn", tags=["Frontend Bridge"])
async def counter_scam_turn_bridge(data: dict):
    message = data.get("scammer_message", "")
    conv_history = data.get("conversation_history", [])
    history_formatted = [
        {"role": "scammer" if item.get("speaker") == "scammer" else "assistant", "content": item.get("text", "")}
        for item in conv_history
    ]
    res = await generate_counter_response(message=message, history=history_formatted)
    
    return {
        "reply": res.get("reply", ""),
        "intent_detected": res.get("intent_detected", "พยายามเร่งรัดให้โอนเงิน"),
        "stalling_tactic": res.get("stalling_tactic", "แกล้งงงขั้นตอน"),
        "extracted_info": data.get("extracted_info", {})
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
