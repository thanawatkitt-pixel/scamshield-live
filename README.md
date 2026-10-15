# 🛡️ ScamShield Live

> **AI-Powered Real-time Scam Detection & Counter-Scam Agent for Thailand**  
> นวัตกรรมป้องกันภัยไซเบอร์สำหรับคนไทย: ตรวจจับ SMS หลอกลวง, ลิงก์ฟิชชิ่งเลียนแบบธนาคาร, และ AI ถ่วงเวลามิจฉาชีพเพื่อดึงหลักฐานบัญชีม้า  
> *พัฒนาขึ้นสำหรับการแข่งขัน Hackathon 2026*

---

## 🌐 Live Production Links

* **🚀 Production Backend API:** [https://scamshield-live-api.onrender.com](https://scamshield-live-api.onrender.com)
* **📖 Interactive API Documentation (Swagger UI):** [https://scamshield-live-api.onrender.com/docs](https://scamshield-live-api.onrender.com/docs)
* **❤️ API Health Status:** [https://scamshield-live-api.onrender.com/health](https://scamshield-live-api.onrender.com/health)
* **🐙 GitHub Repository:** [https://github.com/thanawatkitt-pixel/scamshield-live](https://github.com/thanawatkitt-pixel/scamshield-live)

---

## 🎯 ปัญหาที่เราแก้ไข (Problem Statement)
ภัยคุกคามจากแก๊งคอลเซ็นเตอร์, SMS แนบลิงก์ปลอมระงับบัญชี, และเว็บฟิชชิ่งเลียนแบบธนาคารไทย สร้างความเสียหายให้คนไทยหลายหมื่นล้านบาทต่อปี ประชาชนส่วนใหญ่โดยเฉพาะผู้สูงอายุตกเป็นเหยื่อเพราะขาดเครื่องมือตรวจสอบแบบเรียลไทม์

**ScamShield Live** ออกแบบมาเพื่อให้ผู้ใช้งาน:
1. **รู้ทันใน 3 วินาที:** วางข้อความหรือ URL เพื่อประเมินความเสี่ยงได้ทันที
2. **ระบบ Whitelist สกัดเว็บปลอม:** ป้องกันการกดลิงก์ที่แอบอ้างธนาคารไทย (เช่น `kbank-verify.xyz`)
3. **AI Counter-Scam Agent:** เปลี่ยนจาก "เหยื่อ" เป็น "ผู้ล่า" ถ่วงเวลามิจฉาชีพและหลอกล่อดึงข้อมูลบัญชีม้าส่งให้ตำรวจไซเบอร์

---

## 🚀 ฟีเจอร์หลัก (Key Features)

| โมดูล | รายละเอียดการทำงาน |
|---|---|
| **💬 Message Scanner (`/scan`)** | ตรวจจับข้อความ SMS / LINE หลอกลวง พร้อมชี้จุดพิรุธ (Red Flags) และแนะนำวิธีปฏิบัติตัวทันที |
| **🔗 Link Inspector (`/link`)** | ตรวจสอบ URL ด้วย Whitelist หน่วยงานและธนาคารไทยจริง (v2) สกัดจับ Brand Typosquatting และโดเมนเสี่ยงสูง |
| **📞 Voice Analyzer (`/voice`)** | วิเคราะห์บทสนทนาสายโทรศัพท์คอลเซ็นเตอร์ ถอดความเสียงเป็นข้อความ |
| **🤖 Counter-Scam Agent (`/voice`)** | แชตบอท AI สวมบทบาท "คุณป้าใจดี" แกล้งงงขั้นตอนเพื่อถ่วงเวลาและดึงข้อมูลบัญชีม้า |
| **📋 Report Viewer (`/report`)** | สรุปสำนวนหลักฐานคดี (Dossier) พร้อมปุ่มคัดลอก และปุ่มส่งข้อมูลแจ้งความออนไลน์กับตำรวจไซเบอร์ |
| **📊 Community Dashboard (`/dashboard`)** | แดชบอร์ดสถิติภัยออนไลน์แบบเรียลไทม์ 5 อันดับกลโกงยอดนิยมในไทย |

---

## 🏗️ สถาปัตยกรรมระบบ (System Architecture)

```
┌─────────────────────────────────────────────────────────────┐
│                 Frontend (Next.js 14 + Tailwind)            │
│       Pages: Home, /scan, /link, /voice, /dashboard, /report │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / REST API
┌──────────────────────────────▼──────────────────────────────┐
│                 Backend API (FastAPI on Render)             │
│            CORS Enabled • Python 3.12 • Async Uvicorn       │
└──────┬───────────────────────┬───────────────────────┬──────┘
       │                       │                       │
┌──────▼──────┐         ┌──────▼──────┐         ┌──────▼──────┐
│    Link     │         │   AI Text   │         │  Voice TTS  │
│  Analyzer   │         │   & LLM     │         │ & Whisper   │
│ (Whitelist) │         │ (Heuristic) │         │ (ElevenLabs)│
└─────────────┘         └─────────────┘         └─────────────┘
```

---

## 🛠️ Tech Stack

* **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons
* **Backend:** FastAPI, Python 3.12, Uvicorn, Pydantic, HTTPX
* **AI & Security:** OpenAI API (GPT-4o-mini & Whisper), ElevenLabs Voice AI, Custom Thai Cyber Heuristic Engine
* **Cloud & DevOps:** GitHub CI/CD, Render Cloud Web Service, Standalone Next.js

---

## 💻 วิธีการรันโปรเจกต์ในเครื่อง (Local Setup)

### 1. รัน Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
เปิดเบราว์เซอร์ไปที่: `http://localhost:3000`

### 2. รัน Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
เปิด Interactive Docs ไปที่: `http://localhost:8000/docs`

---

## 📡 สรุป API Endpoints สำคัญ

| Method | Endpoint | รายละเอียด |
|---|---|---|
| `GET` | `/health` | ตรวจสอบสถานะการทำงานของเซิร์ฟเวอร์ (Uptime) |
| `POST` | `/api/scan/message` | ตรวจสอบข้อความ SMS และแชตหลอกลวง |
| `POST` | `/api/scan/link` | ตรวจสอบความปลอดภัยของ URL / เว็บฟิชชิ่ง |
| `POST` | `/api/scan/voice/transcript` | วิเคราะห์บทสนทนาสายโทรศัพท์ |
| `POST` | `/api/counter-scam/turn` | ประมวลผลบทสนทนาถ่วงเวลามิจฉาชีพ |
| `POST` | `/api/generate-voice` | สังเคราะห์เสียงพูดแจ้งเตือน (ElevenLabs) |

---

## 👥 ผู้พัฒนา (Team)
* **Thanawat (Tha)** — Creator & Developer
* พัฒนาขึ้นสำหรับการแข่งขัน Hackathon เพื่อสร้างสังคมไซเบอร์ไทยที่ปลอดภัย 🇹🇭
