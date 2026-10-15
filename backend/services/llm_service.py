"""
ScamShield Live — LLM Service (OpenAI Wrapper)
รองรับการวิเคราะห์ข้อความหลอกลวงและสร้างข้อความโต้ตอบมิจฉาชีพ
"""
import os
import json
import logging
from typing import Dict, Any, List, Optional
from openai import AsyncOpenAI
from prompts import SCAM_DETECTOR_PROMPT, COUNTER_SCAM_AGENT_PROMPT

logger = logging.getLogger(__name__)

api_key = os.getenv("OPENAI_API_KEY")
client = AsyncOpenAI(api_key=api_key) if api_key else None

def get_fallback_scam_analysis(text: str) -> Dict[str, Any]:
    """Fallback ในกรณีที่ยังไม่ได้ใส่ OpenAI API Key หรือโควต้าหมด เพื่อให้ Demo ไม่ล่ม"""
    keywords = ["โอน", "ตำรวจ", "พัสดุ", "ภาษี", "ธนาคาร", "กู้", "รางวัล", "otp", "คลิก"]
    hit_keywords = [kw for kw in keywords if kw in text.lower()]
    is_suspicious = len(hit_keywords) >= 1

    if is_suspicious:
        return {
            "is_scam": True,
            "scam_type": "ข้อความเข้าข่ายหลอกลวง (Keyword Matched)",
            "risk_level": "HIGH",
            "risk_score": 75,
            "red_flags": [f"พบคำกระตุ้นความโลภหรือความกลัว: {', '.join(hit_keywords)}"],
            "explanation": "ตรวจพบรูปแบบข้อความต้องสงสัยที่มีลักษณะเร่งรัดหรือเสนอผลประโยชน์เกินจริง",
            "recommended_action": "อย่ากดลิงก์หรือโอนเงินเด็ดขาด ตรวจสอบกับหน่วยงานต้นสังกัดโดยตรง"
        }
    return {
        "is_scam": False,
        "scam_type": None,
        "risk_level": "LOW",
        "risk_score": 10,
        "red_flags": [],
        "explanation": "ไม่พบรูปแบบคำหลอกลวงชัดเจนในข้อความ",
        "recommended_action": "ควรตรวจสอบตัวตนของผู้ส่งก่อนให้ข้อมูลสำคัญ"
    }

async def analyze_scam_text(text: str, context: Optional[str] = None) -> Dict[str, Any]:
    """วิเคราะห์ข้อความด้วย OpenAI LLM (Structured JSON)"""
    if not client:
        logger.warning("OPENAI_API_KEY is not set. Using rule-based fallback.")
        return get_fallback_scam_analysis(text)

    prompt_content = f"ข้อความที่ต้องตรวจสอบ:\n\"\"\"{text}\"\"\""
    if context:
        prompt_content += f"\nบริบทที่มา: {context}"

    try:
        response = await client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=[
                {"role": "system", "content": SCAM_DETECTOR_PROMPT},
                {"role": "user", "content": prompt_content}
            ],
            response_format={"type": "json_object"},
            temperature=0.2
        )
        content = response.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        logger.error(f"Error calling OpenAI API: {e}")
        return get_fallback_scam_analysis(text)

async def generate_counter_response(
    message: str,
    history: Optional[List[Dict[str, str]]] = None,
    persona: str = "auntie"
) -> Dict[str, Any]:
    """สร้างคำตอบโต้ตอบและถ่วงเวลามิจฉาชีพ (Scam Baiting)"""
    if not client:
        return {
            "reply": "จ้ะๆ เดี๋ยวป้าหาแว่นตาก่อนนะลูก ตัวหนังสือในมือถือมันเล็ก ป้ากดเลขตามไม่ค่อยทันเลย หลานเอ๊ย อยู่สถานีไหนนะ?",
            "intent_detected": "พยายามเร่งรัดให้ทำรายการหรือโอนเงิน",
            "stalling_tactic": "แกล้งสายตาไม่ดีและขอให้พูดซ้ำ"
        }

    messages = [{"role": "system", "content": f"{COUNTER_SCAM_AGENT_PROMPT}\nPersona ปัจจุบัน: {persona}"}]
    if history:
        for item in history[-6:]:  # นำมา 6 เทิร์นล่าสุด
            role = "user" if item.get("role") == "scammer" else "assistant"
            messages.append({"role": role, "content": item.get("content", "")})

    messages.append({"role": "user", "content": f"มิจฉาชีพพูดว่า: {message}"})

    try:
        response = await client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=messages,
            response_format={"type": "json_object"},
            temperature=0.7
        )
        content = response.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        logger.error(f"Error generating counter response: {e}")
        return {
            "reply": "เดี๋ยวนะลูก ป้ากำลังเปิดกระเป๋าตังค์ สัญญาณตรงนี้ไม่ค่อยดีเลย หลานช่วยพูดชื่อร้อยเวรใหม่อีกทีซิ?",
            "intent_detected": "ต้องการข้อมูลทางการเงิน",
            "stalling_tactic": "ขอให้พูดทวนชื่อเพื่อถ่วงเวลา"
        }
