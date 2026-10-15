# 🛡️ ScamShield Live API

> ระบบตรวจจับกลโกงคอลเซ็นเตอร์, SMS แนบลิงก์ฟิชชิ่ง, และ Counter-Scam AI Agent ถ่วงเวลามิจฉาชีพแบบ Real-time  
> พัฒนาขึ้นสำหรับการแข่งขัน Hackathon (Thailand)

---

## 🚀 Features

1. **Link Analyzer v2 (Whitelist + Heuristic)**: ตรวจจับลิงก์ปลอม หลอกลวง ลิงก์เลียนแบบธนาคาร (Typosquatting) พร้อมระบบ Whitelist สำหรับหน่วยงานไทย
2. **Text & SMS Scam Detection**: วิเคราะห์ข้อความด้วย OpenAI LLM เพื่อจำแนกประเภทกลโกง, ประเมินคะแนนความเสี่ยง (0-100), พร้อมคำแนะนำทันที
3. **Counter-Scam Baiting Agent**: จำลองการคุยถ่วงเวลามิจฉาชีพ (เช่น บทบาทคุณป้าสายตาไม่ดี) เพื่อขัดขวางและดึงข้อมูลบัญชีม้า
4. **Voice Transcription (Whisper STT)**: ถอดความเสียงสนทนาทางโทรศัพท์เป็นข้อความภาษาไทย
5. **Voice Synthesis (ElevenLabs TTS)**: แปลงข้อความตอบโต้ของบอทเป็นเสียงพูดภาษาไทยสมจริง

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | API Information |
| `GET` | `/health` | Health Check for Render & uptime monitoring |
| `POST` | `/api/analyze-link` | ตรวจสอบความปลอดภัยของ URL |
| `POST` | `/api/analyze-text` | ตรวจสอบข้อความ SMS / Chat |
| `POST` | `/api/transcribe` | แปลงไฟล์เสียงโทรศัพท์เป็นข้อความ (Whisper) |
| `POST` | `/api/counter-scam` | บอทโต้ตอบถ่วงเวลามิจฉาชีพ |
| `POST` | `/api/generate-voice` | สังเคราะห์เสียงพูดตอบกลับ (ElevenLabs) |

Swagger UI Interactive Docs: `https://<YOUR-RENDER-URL>/docs`

---

## 🛠️ Environment Variables

ตั้งค่าตัวแปรเหล่านี้ใน **Render Dashboard -> Environment Variables**:

| Variable | Description | Example / Default |
|---|---|---|
| `OPENAI_API_KEY` | OpenAI API Key (สำหรับ LLM & Whisper) | `sk-...` |
| `ELEVENLABS_API_KEY` | ElevenLabs API Key (สำหรับสังเคราะห์เสียง) | `xi_...` |
| `ELEVENLABS_VOICE_ID` | รหัสเสียง ElevenLabs | `OYTbf65OHHFELVut7v2H` |
| `ELEVENLABS_MODEL_ID` | โมเดลเสียง ElevenLabs | `eleven_v3` หรือ `eleven_multilingual_v2` |
| `CORS_ORIGINS` | อนุญาต Frontend Origins | `*` |
| `APP_ENV` | สภาพแวดล้อมระบบ | `production` |

---

## 💻 Local Development

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
เปิดบราวเซอร์ไปที่: `http://localhost:8000/docs`
