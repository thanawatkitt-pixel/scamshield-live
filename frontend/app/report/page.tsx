"use client";
import { useState } from "react";
import Link from "next/link";
import { FileText, Download, Share2, Copy, Check, ShieldAlert, ArrowLeft, ExternalLink, UserX, Landmark, PhoneCall } from "lucide-react";
import ThreatBadge from "@/components/ThreatBadge";

// ข้อมูลรายงานตัวอย่างที่ดึงจากระบบ Counter-Scam & Speech Analyzer
const mockReport = {
  report_id: "SS-20261015-A1B2",
  generated_at: "15 ตุลาคม 2569 เวลา 14:30 น.",
  session_duration: "5 นาที 42 วินาที",

  threat_summary: {
    scam_type: "แก๊งคอลเซ็นเตอร์ — แอบอ้างเจ้าหน้าที่ตำรวจ",
    confidence: 97,
    severity: "dangerous" as const,
    estimated_damage: "150,000 บาท",
    summary:
      "มิจฉาชีพโทรแอบอ้างเป็น พ.ต.อ. สมชาย จากกองปราบปราม อ้างว่าเหยื่อมีคดีฟอกเงิน กดดันให้โอนเงินค่าประกันตัว 150,000 บาท ไปยังบัญชีกสิกรไทย",
  },

  scammer_profile: {
    claimed_name: "พ.ต.อ. สมชาย",
    claimed_org: "กองปราบปราม",
    phone: "094-887-2241",
    bank: "ธนาคารกสิกรไทย",
    account_number: "048-2-71893-5",
    account_name: "นายวิชัย แซ่ลิ้ม",
    amount: "150,000 บาท",
  },

  techniques: [
    {
      name: "แอบอ้างเจ้าหน้าที่ (Authority Impersonation)",
      evidence: "ผม พ.ต.อ. สมชาย จากกองปราบปรามครับ",
    },
    {
      name: "สร้างความกลัว (Fear Manipulation)",
      evidence: "คุณมีคดีเกี่ยวกับการฟอกเงิน ไม่งั้นจะมีหมายจับ",
    },
    {
      name: "กดดันด้วยเวลา (Urgency Pressure)",
      evidence: "ต้องรีบโอนภายใน 1 ชั่วโมง",
    },
    {
      name: "ปฏิเสธการพบตัว (Isolation Tactic)",
      evidence: "ไม่ต้องมาครับ โอนเงินก็พอ",
    },
  ],
};

export default function ReportPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = `[รายงานหลักฐานมิจฉาชีพ - ScamShield Live]
รหัสรายงาน: ${mockReport.report_id}
ประเภท: ${mockReport.threat_summary.scam_type}
เบอร์โทร: ${mockReport.scammer_profile.phone}
ชื่อที่อ้าง: ${mockReport.scammer_profile.claimed_name} (${mockReport.scammer_profile.claimed_org})
บัญชีธนาคาร: ${mockReport.scammer_profile.bank}
เลขบัญชีม้า: ${mockReport.scammer_profile.account_number}
ชื่อบัญชี: ${mockReport.scammer_profile.account_name}
ยอดเงินเรียกร้อง: ${mockReport.scammer_profile.amount}
เวลาสนทนา: ${mockReport.session_duration}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/voice"
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับไปหน้า Voice Analyzer</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-shield-card hover:bg-white/10 border border-shield-border text-gray-300 text-sm font-semibold transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">คัดลอกแล้ว!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>คัดลอกหลักฐาน</span>
              </>
            )}
          </button>
          <a
            href="https://thaipoliceonline.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white text-sm font-bold shadow-lg shadow-red-500/20 transition-all"
          >
            <span>แจ้งความออนไลน์ (ตร.)</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Main Report Card */}
      <div className="p-8 rounded-3xl bg-shield-card border border-shield-border space-y-8 shadow-2xl">
        {/* Report Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-shield-border">
          <div>
            <div className="flex items-center gap-2 text-purple-400 text-xs font-mono mb-1">
              <FileText className="w-4 h-4" />
              <span>REPORT ID: {mockReport.report_id}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              รายงานหลักฐานและวิเคราะห์พฤติการณ์กลโกง
            </h1>
            <p className="text-gray-400 text-xs mt-1">
              สร้างเมื่อ: {mockReport.generated_at} • ระยะเวลาที่บอทถ่วงเวลา: {mockReport.session_duration}
            </p>
          </div>
          <ThreatBadge
            level={mockReport.threat_summary.severity}
            score={mockReport.threat_summary.confidence}
            size="lg"
          />
        </div>

        {/* Threat Summary Banner */}
        <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-red-300">
              🚨 สรุปพฤติการณ์ภัยคุกคาม ({mockReport.threat_summary.scam_type})
            </h3>
            <span className="text-xs font-mono text-red-400">
              ความเสียหายที่ระงับได้: {mockReport.threat_summary.estimated_damage}
            </span>
          </div>
          <p className="text-sm text-gray-200 leading-relaxed">
            {mockReport.threat_summary.summary}
          </p>
        </div>

        {/* Scammer Evidence Profile */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <UserX className="w-5 h-5 text-orange-400" />
            <span>ข้อมูลและบัญชีม้าที่ดึงได้จากมิจฉาชีพ (Extracted Dossier)</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <span className="text-xs text-gray-400">เบอร์โทรศัพท์มิจฉาชีพ</span>
              <div className="text-base font-mono font-bold text-cyan-400 mt-0.5">
                {mockReport.scammer_profile.phone}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <span className="text-xs text-gray-400">ชื่อและตำแหน่งที่แอบอ้าง</span>
              <div className="text-base font-bold text-white mt-0.5">
                {mockReport.scammer_profile.claimed_name} ({mockReport.scammer_profile.claimed_org})
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <span className="text-xs text-gray-400">ธนาคารและเลขบัญชีม้า</span>
              <div className="text-base font-mono font-bold text-red-400 mt-0.5">
                {mockReport.scammer_profile.bank}: {mockReport.scammer_profile.account_number}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <span className="text-xs text-gray-400">ชื่อบัญชีและยอดเงิน</span>
              <div className="text-base font-bold text-emerald-400 mt-0.5">
                {mockReport.scammer_profile.account_name} ({mockReport.scammer_profile.amount})
              </div>
            </div>
          </div>
        </div>

        {/* Techniques Analysis */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-purple-400" />
            <span>เทคนิคจิตวิทยาที่มิจฉาชีพใช้ (Psychological Tactics)</span>
          </h2>
          <div className="space-y-3">
            {mockReport.techniques.map((tech, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="text-sm font-semibold text-purple-300">
                    {tech.name}
                  </div>
                  <div className="text-xs text-gray-300 italic mt-0.5">
                    หลักฐานคำพูด: &ldquo;{tech.evidence}&rdquo;
                  </div>
                </div>
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0 self-start sm:self-center font-mono">
                  ตรวจจับโดย AI
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
