"""
ScamShield Live — Link Analyzer Service v2
ตรวจสอบ URL ด้วย heuristic + whitelist + typosquatting detection
"""
import re
from urllib.parse import urlparse
from typing import Dict, Any, List, Optional
import httpx

# ============================================================
# Whitelist — โดเมนจริงที่ปลอดภัย
# ============================================================
LEGITIMATE_DOMAINS_FLAT = {
    "kasikornbank.com",
    "kbank.com",
    "scb.co.th",
    "krungthai.com",
    "ktb.co.th",
    "bangkokbank.com",
    "bbl.co.th",
    "krungsri.com",
    "ttbbank.com",
    "gsb.or.th",
    "rd.go.th",
    "royalthaipolice.go.th",
    "dsi.go.th",
    "amlo.go.th",
    "shopee.co.th",
    "lazada.co.th",
    "grab.com",
    "line.me",
    "google.com",
    "facebook.com",
    "thaipoliceonline.com",
}

# โดเมนจริงสำหรับเปรียบเทียบแบรนด์
LEGITIMATE_DOMAINS_MAP = {
    "kasikornbank": ["kasikornbank.com", "kbank.com"],
    "kbank": ["kasikornbank.com", "kbank.com"],
    "scb": ["scb.co.th"],
    "krungthai": ["krungthai.com", "ktb.co.th"],
    "ktb": ["krungthai.com", "ktb.co.th"],
    "bangkokbank": ["bangkokbank.com", "bbl.co.th"],
    "krungsri": ["krungsri.com"],
    "ttb": ["ttbbank.com"],
    "gsb": ["gsb.or.th"],
    "revenue": ["rd.go.th"],
    "police": ["royalthaipolice.go.th", "thaipoliceonline.com"],
    "dsi": ["dsi.go.th"],
    "amlo": ["amlo.go.th"],
    "shopee": ["shopee.co.th", "shopee.com"],
    "lazada": ["lazada.co.th", "lazada.com"],
    "line": ["line.me"],
}

# TLDs ที่มักพบบ่อยในเว็บฟิชชิ่ง
SUSPICIOUS_TLDS = {
    ".xyz", ".top", ".club", ".work", ".loan", ".cfd", ".buzz", ".cam",
    ".rest", ".fit", ".tk", ".ml", ".ga", ".cf", ".gq", ".icu", ".monster",
    ".shop", ".site", ".online"
}

# บริการย่อลิงก์ยอดนิยม
URL_SHORTENERS = {
    "bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "rb.gy", "shorturl.at"
}

# คำล่อลวงที่น่าสงสัยใน Path
SUSPICIOUS_PATH_KEYWORDS = [
    "login", "verify", "secure", "update", "refund", "claim", "wallet",
    "otp", "police", "tax", "line-add", "confirm", "free-gift"
]

def extract_domain(url: str) -> str:
    """สกัดชื่อ host / domain จาก url ให้สะอาด"""
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
    parsed = urlparse(url)
    netloc = parsed.netloc.lower()
    # ตัด port ออกหากมี
    if ":" in netloc:
        netloc = netloc.split(":")[0]
    # ตัด www.
    if netloc.startswith("www."):
        netloc = netloc[4:]
    return netloc

def is_domain_in_whitelist(domain: str) -> bool:
    """เช็คว่า domain อยู่ใน whitelist หรือเป็น subdomain ของ whitelist หรือไม่"""
    if domain in LEGITIMATE_DOMAINS_FLAT:
        return True
    for legit in LEGITIMATE_DOMAINS_FLAT:
        if domain.endswith("." + legit):
            return True
    return False

def check_brand_impersonation(domain: str) -> Optional[str]:
    """ตรวจว่ามีชื่อแบรนด์ดังฝังอยู่ในโดเมนที่ไม่ใช่ของจริงหรือไม่ (Typosquatting / Spoofing)"""
    for brand, legit_domains in LEGITIMATE_DOMAINS_MAP.items():
        if brand in domain:
            # ตรวจสอบว่าเป็นโดเมนจริงของแบรนด์นี้หรือไม่
            is_real = False
            for legit in legit_domains:
                if domain == legit or domain.endswith("." + legit):
                    is_real = True
                    break
            if not is_real:
                return brand
    return None

async def analyze_url(url: str) -> Dict[str, Any]:
    """
    วิเคราะห์ URL อย่างละเอียด
    คืนค่าผลการประเมินความเสี่ยงและเหตุผล
    """
    cleaned_url = url.strip()
    domain = extract_domain(cleaned_url)
    parsed = urlparse(cleaned_url if cleaned_url.startswith(("http://", "https://")) else "https://" + cleaned_url)
    
    flags: List[str] = []
    risk_score = 0
    matched_brand = None

    # 1. เช็ค Whitelist ก่อนเลย
    if is_domain_in_whitelist(domain):
        return {
            "url": cleaned_url,
            "domain": domain,
            "is_safe": True,
            "risk_level": "SAFE",
            "risk_score": 0,
            "matched_brand": None,
            "flags": ["โดเมนอยู่ใน Whitelist ที่ได้รับการรับรองความปลอดภัย"],
            "explanation": f"โดเมน {domain} เป็นเว็บไซต์ทางการของหน่วยงาน/บริการจริงที่ปลอดภัย",
            "recommended_action": "สามารถเข้าใช้งานได้ตามปกติอย่างปลอดภัย"
        }

    # 2. ตรวจสอบ IP Address
    ip_pattern = r"^(\d{1,3}\.){3}\d{1,3}$"
    if re.match(ip_pattern, domain):
        flags.append("ใช้หมายเลข IP Address แทนชื่อโดเมน")
        risk_score += 40

    # 3. ตรวจสอบการแอบอ้างชื่อแบรนด์ / ธนาคาร / หน่วยงานรัฐ (Brand Spoofing)
    impersonated = check_brand_impersonation(domain)
    if impersonated:
        matched_brand = impersonated
        flags.append(f"ตรวจพบการแอบอ้างชื่อแบรนด์/หน่วยงาน '{impersonated}' บนโดเมนที่ไม่ใช่ของจริง")
        risk_score += 65

    # 4. ตรวจสอบ TLD ที่มีความเสี่ยงสูง
    for tld in SUSPICIOUS_TLDS:
        if domain.endswith(tld):
            flags.append(f"ใช้นามสกุลโดเมนความเสี่ยงสูง ({tld}) ซึ่งมักพบในเว็บฟิชชิ่ง")
            risk_score += 25
            break

    # 5. ตรวจสอบบริการย่อลิงก์
    if domain in URL_SHORTENERS:
        flags.append("เป็นบริการย่อลิงก์ (URL Shortener) อาจใช้เพื่อปิดบังปลายทางที่แท้จริง")
        risk_score += 30

    # 6. ตรวจสอบคำต้องสงสัยใน Path
    path_lower = parsed.path.lower()
    for kw in SUSPICIOUS_PATH_KEYWORDS:
        if kw in path_lower:
            flags.append(f"มีคำล่อลวงต้องสงสัยใน URL path: '{kw}'")
            risk_score += 15
            break

    # 7. ตรวจสอบความยาวของชื่อโดเมนและจำนวน Subdomain ที่ซับซ้อนผิดปกติ
    if len(domain.split(".")) > 3:
        flags.append("โครงสร้าง Subdomain ซับซ้อนผิดปกติ")
        risk_score += 10

    # สรุปผล
    risk_score = min(risk_score, 100)
    if risk_score >= 60:
        risk_level = "DANGEROUS"
        is_safe = False
        explanation = f"ตรวจพบความเสี่ยงสูงมาก ({risk_score}/100) โดเมนนี้มีพฤติกรรมเข้าข่ายเว็บไซต์หลอกลวง/ฟิชชิ่ง"
        recommended_action = "ห้ามกดเปิดลิงก์ ห้ามกรอกรหัสผ่าน หรือดาวน์โหลดไฟล์ใดๆ เด็ดขาด"
    elif risk_score >= 30:
        risk_level = "SUSPICIOUS"
        is_safe = False
        explanation = f"ตรวจพบความผิดปกติบางประการ ({risk_score}/100) ลิงก์นี้มีความน่าสงสัย"
        recommended_action = "ควรตรวจสอบที่มาอย่างละเอียดก่อนเปิดใช้งาน ไม่ควรกดผ่าน SMS ที่ไม่น่าไว้ใจ"
    else:
        risk_level = "SAFE"
        is_safe = True
        explanation = "ไม่พบพฤติกรรมหลอกลวงที่ชัดเจนจาก Heuristic แต่ควรระมัดระวังหากผู้ส่งไม่คุ้นเคย"
        recommended_action = "เข้าชมได้ แต่ควรหลีกเลี่ยงการเปิดเผยข้อมูลส่วนบุคคลหรือรหัสผ่าน"

    return {
        "url": cleaned_url,
        "domain": domain,
        "is_safe": is_safe,
        "risk_level": risk_level,
        "risk_score": risk_score,
        "matched_brand": matched_brand,
        "flags": flags,
        "explanation": explanation,
        "recommended_action": recommended_action
    }
