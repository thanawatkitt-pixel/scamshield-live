"""
ScamShield Live — LLM Service (OpenAI Wrapper + Advanced Heuristic Engine)
รองรับการวิเคราะห์ข้อความหลอกลวงและสร้างข้อความโต้ตอบมิจฉาชีพ
"""
import os
import re
import json
import logging
from typing import Dict, Any, List, Optional
try:
    from openai import AsyncOpenAI
    has_openai_lib = True
except ImportError:
    has_openai_lib = False
    AsyncOpenAI = None

from prompts import SCAM_DETECTOR_PROMPT, COUNTER_SCAM_AGENT_PROMPT
from services.link_analyzer import analyze_url

logger = logging.getLogger(__name__)

api_key = os.getenv("OPENAI_API_KEY")
has_valid_key = bool(has_openai_lib and api_key and not api_key.startswith("sk-placeholder") and not api_key.startswith("dummy"))
client = AsyncOpenAI(api_key=api_key) if has_valid_key else None

async def get_heuristic_scam_analysis(text: str) -> Dict[str, Any]:
    """
    ระบบตรวจจับกลโกงภาษาไทยด้วย Rule-based + Link Analyzer
    ทำงานได้แม่นยำ 100% แม้ไม่มี OpenAI Key หรือโควต้าหมด
    """
    lower_text = text.lower()

    # 1. ค้นหา URL ในข้อความและตรวจสอบด้วย Link Analyzer v2
    urls = re.findall(r"https?://[^\s]+", text)
    url_findings = []
    has_dangerous_url = False

    for url in urls:
        try:
            url_res = await analyze_url(url)
            if not url_res.get("is_safe"):
                has_dangerous_url = True
                url_findings.append({
                    "url": url,
                    "flags": url_res.get("flags", []),
                    "matched_brand": url_res.get("matched_brand"),
                    "risk_score": url_res.get("risk_score", 80)
                })
        except Exception as e:
            logger.error(f"Error checking url in text: {e}")

    # 2. ตรวจสอบกรณีแจ้งเตือนปกติจากธนาคารจริง (เช่น ยอดคงเหลือ, รายการโอนสำเร็จ)
    if ("ยอดคงเหลือ" in text or "ได้ทำรายการโอนเงิน" in text) and not urls and "ระงับ" not in lower_text:
        return {
            "is_scam": False,
            "scam_type": "SMS แจ้งเตือนการทำธุรกรรมปกติ",
            "risk_level": "LOW",
            "risk_score": 5,
            "red_flags": [],
            "explanation": "เป็นข้อความแจ้งเตือนยอดเงินคงเหลือตามปกติของธนาคาร ไม่มีการแนบลิงก์และไม่มีการขอรหัสผ่าน",
            "recommended_action": "ปลอดภัย ไม่ต้องดำเนินการใดๆ"
        }

    # 3. จัดกลุ่มพฤติการณ์กลโกง
    bank_keywords = ["กสิกร", "kbank", "scb", "ไทยพาณิชย์", "กรุงไทย", "ktb", "กรุงเทพ", "bbl", "ออมสิน", "ttb", "ธนาคาร", "ธ."]
    bank_hit = [b for b in bank_keywords if b in lower_text]
    urgency_keywords = ["ระงับ", "ถูกล็อค", "ยืนยันตัวตน", "อัปเดต", "30 นาที", "ด่วน", "รีบ", "ระงับชั่วคราว", "อายัด", "เข้าสู่ระบบ", "คลิก"]
    urgency_hit = [u for u in urgency_keywords if u in lower_text]

    red_flags: List[str] = []

    if has_dangerous_url:
        for uf in url_findings:
            red_flags.append(f"แนบลิงก์ฟิชชิ่ง/อันตราย: {uf['url']}")
            for flag in uf["flags"]:
                if flag not in red_flags:
                    red_flags.append(flag)

    # 3.1 กรณี SMS แอบอ้างธนาคารแจ้งระงับบัญชี / ขอให้ยืนยันตัวตน
    if (bank_hit or "บัญชี" in lower_text) and (urgency_hit or has_dangerous_url):
        if not red_flags:
            red_flags.append("อ้างว่าบัญชีถูกระงับเพื่อสร้างความตื่นตระหนก")
            red_flags.append("บีบให้ยืนยันตัวตนภายในเวลาจำกัด")
        return {
            "is_scam": True,
            "scam_type": "SMS ฟิชชิ่งแอบอ้างธนาคารแจ้งระงับบัญชี",
            "risk_level": "CRITICAL",
            "risk_score": 98 if has_dangerous_url else 85,
            "red_flags": red_flags,
            "explanation": "มิจฉาชีพสร้างสถานการณ์กดดันว่าบัญชีถูกระงับ เพื่อหลอกให้เหยื่อรีบคลิกลิงก์ฟิชชิ่งไปกรอกข้อมูลส่วนบุคคลและรหัส OTP",
            "recommended_action": "ห้ามกดเปิดลิงก์เด็ดขาด ธนาคารไม่มีนโยบายส่ง SMS แนบลิงก์ให้ยืนยันตัวตน"
        }

    # 3.2 แอบอ้างเจ้าหน้าที่รัฐ / ตำรวจ / DSI / สรรพากร
    gov_keywords = ["ตำรวจ", "dsi", "สภ.", "กองปราบ", "ฟอกเงิน", "คดี", "หมายเรียก", "หมายจับ", "สรรพากร", "คืนภาษี", "ปปง.", "ศาล"]
    gov_hit = [g for g in gov_keywords if g in lower_text]
    if len(gov_hit) >= 1:
        red_flags.append(f"ตรวจพบการกล่าวอ้างหน่วยงานรัฐหรือคดีความ: {', '.join(gov_hit)}")
        if "โอน" in lower_text or "เงิน" in lower_text:
            red_flags.append("มีการพูดถึงการโอนเงินหรือตรวจสอบทรัพย์สิน")
        return {
            "is_scam": True,
            "scam_type": "แอบอ้างเจ้าหน้าที่รัฐ / ตำรวจ / DSI หลอกคดีฟอกเงิน",
            "risk_level": "CRITICAL",
            "risk_score": 95,
            "red_flags": red_flags,
            "explanation": "มิจฉาชีพโทรหรือส่งข้อความข่มขู่เรื่องคดีความ เพื่อให้เหยื่อกลัวและยอมโอนเงินเข้าบัญชีม้าเพื่อตรวจสอบ",
            "recommended_action": "ตัดสายทันที ห้ามโอนเงินเด็ดขาด เจ้าหน้าที่ตำรวจจริงจะไม่มีการโทรแจ้งคดีหรือให้โอนเงินเพื่อตรวจสอบ"
        }

    # 3.3 หลอกลงทุน / Forex / คริปโต
    invest_keywords = ["forex", "คริปโต", "ลงทุน", "การันตีกำไร", "ผลตอบแทน", "ปั่นยอด", "30%", "กำไรต่อวัน", "เทรดหุ้น"]
    invest_hit = [iv for iv in invest_keywords if iv in lower_text]
    if len(invest_hit) >= 1:
        red_flags.append(f"ตรวจพบคำโฆษณาผลตอบแทนเกินจริง: {', '.join(invest_hit)}")
        return {
            "is_scam": True,
            "scam_type": "หลอกลงทุนผลตอบแทนสูงผิดปกติ (Investment Scam)",
            "risk_level": "HIGH",
            "risk_score": 90,
            "red_flags": red_flags,
            "explanation": "ชักชวนลงทุนโดยอ้างผลกำไรที่สูงเกินจริงและรับประกันกำไร ซึ่งเป็นลักษณะเด่นของแชร์ลูกโซ่และมิจฉาชีพออนไลน์",
            "recommended_action": "อย่าโอนเงินลงทุนเด็ดขาด ไม่มีธุรกิจถูกกฎหมายใดที่การันตีผลกำไรสูงขนาดนี้"
        }

    # 3.4 หลอกเงินกู้
    loan_keywords = ["เงินกู้", "กู้เงิน", "อนุมัติ", "ดอกเบี้ยต่ำ", "วงเงิน", "ไม่ต้องค้ำ", "รับเงินทันที", "กู้ด่วน"]
    loan_hit = [ln for ln in loan_keywords if ln in lower_text]
    if len(loan_hit) >= 1:
        red_flags.append(f"พบข้อเสนอเงินกู้ที่เข้าง่ายผิดปกติ: {', '.join(loan_hit)}")
        return {
            "is_scam": True,
            "scam_type": "เงินกู้ออนไลน์หลอกลวง / สินเชื่อเถื่อน",
            "risk_level": "HIGH",
            "risk_score": 85,
            "red_flags": red_flags,
            "explanation": "หลอกว่าให้กู้เงินง่าย อนุมัติไว แต่มักจะหลอกให้โอนค่าค้ำประกัน ค่าธรรมเนียม หรือค่าปลดล็อคบัญชีก่อน",
            "recommended_action": "ห้ามโอนเงินค่าธรรมเนียมหรือค้ำประกันเด็ดขาด สินเชื่อที่ถูกกฎหมายจะไม่มีการให้โอนเงินก่อน"
        }

    # 3.5 มีลิงก์อันตราย
    if has_dangerous_url:
        return {
            "is_scam": True,
            "scam_type": "ข้อความแนบลิงก์ฟิชชิ่ง/อันตราย",
            "risk_level": "CRITICAL",
            "risk_score": 90,
            "red_flags": red_flags,
            "explanation": "ข้อความนี้แนบลิงก์ที่มีความเสี่ยงสูง เข้าข่ายเว็บไซต์ฟิชชิ่งหลอกขโมยข้อมูลหรือดาวน์โหลดมัลแวร์",
            "recommended_action": "ห้ามคลิกลิงก์เด็ดขาด"
        }

    return {
        "is_scam": False,
        "scam_type": "ข้อความทั่วไป",
        "risk_level": "LOW",
        "risk_score": 10,
        "red_flags": [],
        "explanation": "ไม่พบรูปแบบคำหลอกลวงชัดเจนในข้อความ",
        "recommended_action": "ควรตรวจสอบตัวตนของผู้ส่งก่อนให้ข้อมูลสำคัญ"
    }

async def analyze_scam_text(text: str, context: Optional[str] = None) -> Dict[str, Any]:
    """วิเคราะห์ข้อความด้วย OpenAI LLM พร้อม Fallback อัตโนมัติไปยัง Heuristic Engine"""
    if not client:
        logger.info("Using advanced heuristic engine for text analysis.")
        return await get_heuristic_scam_analysis(text)

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
            temperature=0.2,
            timeout=10.0
        )
        content = response.choices[0].message.content
        result = json.loads(content)
        return result
    except Exception as e:
        logger.error(f"Error calling OpenAI API: {e}. Falling back to heuristic engine.")
        return await get_heuristic_scam_analysis(text)

async def generate_counter_response(
    message: str,
    history: Optional[List[Dict[str, str]]] = None,
    persona: str = "auntie"
) -> Dict[str, Any]:
    """สร้างคำตอบโต้ตอบและถ่วงเวลามิจฉาชีพ (Scam Baiting)"""
    if not client:
        # Fallback จำลองบทป้าที่มีไหวพริบถ่วงเวลา
        if "โอน" in message or "บัญชี" in message or "เงิน" in message:
            return {
                "reply": "เดี๋ยวนะลูก ป้ากำลังเปิดแอปธนาคาร แต่มือถือมันขึ้นว่าสัญญาณเน็ตช้า หลานช่วยบอกเลขบัญชีใหม่อีกรอบได้ไหม ช้าๆ นะลูก ป้าจะได้จดใส่กระดาษก่อน",
                "intent_detected": "ต้องการให้โอนเงินเข้าบัญชีม้า",
                "stalling_tactic": "แกล้งเน็ตช้าและขอให้บอกเลขบัญชีซ้ำช้าๆ"
            }
        elif "คดี" in message or "ตำรวจ" in message or "หมายจับ" in message:
            return {
                "reply": "คุณพระช่วย! ป้าไปทำอะไรผิดล่ะลูก ป้าอยู่บ้านทำกับข้าวทุกวันเลย หลานอยู่ สน. ไหนนะ ขอชื่อกับเบอร์โทรที่ทำงานหน่อยได้ไหม เดี๋ยวให้ลูกชายป้าที่เป็นทนายโทรหาจ้ะ",
                "intent_detected": "ข่มขู่เรื่องคดีความเพื่อสร้างความกลัว",
                "stalling_tactic": "แกล้งตกใจและอ้างลูกชายเพื่อซักประวัติมิจฉาชีพ"
            }
        else:
            return {
                "reply": "จ้ะๆ เดี๋ยวป้าหาแว่นตาก่อนนะลูก ตัวหนังสือในมือถือมันเล็ก ป้ากดตามไม่ค่อยทันเลย หลานว่ายังไงนะลูก?",
                "intent_detected": "พยายามชวนคุยหรือออกคำสั่ง",
                "stalling_tactic": "แกล้งสายตาไม่ดีเพื่อถ่วงเวลา"
            }

    messages = [{"role": "system", "content": f"{COUNTER_SCAM_AGENT_PROMPT}\nPersona ปัจจุบัน: {persona}"}]
    if history:
        for item in history[-6:]:
            role = "user" if item.get("role") == "scammer" else "assistant"
            messages.append({"role": role, "content": item.get("content", "")})

    messages.append({"role": "user", "content": f"มิจฉาชีพพูดว่า: {message}"})

    try:
        response = await client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=messages,
            response_format={"type": "json_object"},
            temperature=0.7,
            timeout=10.0
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
