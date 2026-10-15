"use client";
import { useState } from "react";
import { Search, Loader2, Trash2, AlertCircle, Sparkles } from "lucide-react";
import { scanMessage } from "@/lib/api";
import ThreatBadge from "@/components/ThreatBadge";
import RedFlagCard from "@/components/RedFlagCard";
import VoicePlayer from "@/components/VoicePlayer";

const examples = [
  "แจ้งเตือนจาก ธ.กสิกรไทย บัญชีของท่านถูกระงับชั่วคราว กรุณายืนยันตัวตนที่ https://kbank-verify.xyz ภายใน 30 นาที",
  "สวัสดีค่ะ ดิฉันเจ้าหน้าที่ DSI แจ้งว่าบัญชีของคุณเกี่ยวข้องกับคดีฟอกเงิน กรุณาติดต่อกลับด่วนที่ 02-xxx-xxxx",
  "🔥 โอกาสสุดท้าย! ลงทุน Forex กับเรา การันตีกำไร 30% ต่อเดือน ฝากขั้นต่ำ 5,000 บาท",
  "KBank: ท่านได้ทำรายการโอนเงิน 1,500.00 บาท เมื่อ 15/10/26 เวลา 12:30 ยอดคงเหลือ 25,432.50 บาท",
];

export default function ScanPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (textToScan?: string) => {
    const text = textToScan || message;
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const data = await scanMessage(text);
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์วิเคราะห์ได้ กรุณาลองใหม่อีกครั้ง");
    }
    setLoading(false);
  };

  const analysis = result?.analysis;
  const voice = result?.voice_warning;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          💬 Message Scanner
        </h1>
        <p className="text-gray-400 mt-2">
          วางข้อความ SMS, LINE, หรือ Email ที่น่าสงสัย — AI จะวิเคราะห์ความเสี่ยงและชี้จุดพิรุธให้ใน 3 วินาที
        </p>
      </div>

      {/* Input Form */}
      <div className="space-y-4">
        <div className="relative">
          <textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="วางข้อความที่ได้รับที่นี่ เช่น 'คุณได้รับสิทธิ์เงินกู้ดอกเบี้ยต่ำ คลิก...'"
            className="w-full p-4 rounded-xl bg-shield-card border border-shield-border focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-white placeholder-gray-500 text-base"
          />
          {message && (
            <button
              onClick={() => setMessage("")}
              className="absolute top-3 right-3 text-gray-400 hover:text-white p-1"
              title="ล้างข้อความ"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Buttons & Example chips */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>ตัวอย่างข้อความทดสอบ:</span>
          </div>
          <button
            onClick={() => handleScan()}
            disabled={loading || !message.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-bold transition-all shadow-md"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>กำลังวิเคราะห์...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>ตรวจสอบข้อความ</span>
              </>
            )}
          </button>
        </div>

        {/* Example Pills */}
        <div className="flex flex-wrap gap-2">
          {examples.map((ex, idx) => (
            <button
              key={idx}
              onClick={() => {
                setMessage(ex);
                handleScan(ex);
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-shield-card hover:bg-white/10 border border-shield-border text-gray-300 transition-colors text-left truncate max-w-xs"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Results */}
      {analysis && (
        <div className="space-y-6 p-6 rounded-2xl bg-shield-card border border-shield-border shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-shield-border">
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">
                ผลการวิเคราะห์
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                {analysis.scam_type_th || "การตรวจสอบข้อความ"}
              </h2>
            </div>
            <ThreatBadge
              level={analysis.threat_level || "safe"}
              score={analysis.threat_score}
              size="lg"
            />
          </div>

          {/* Voice Player */}
          {voice?.script_th && (
            <VoicePlayer
              audioBase64={voice.audio_base64}
              scriptTh={voice.script_th}
            />
          )}

          {/* Summary */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
              คำอธิบาย
            </h3>
            <p className="text-gray-200 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
              {analysis.summary_th}
            </p>
          </div>

          {/* Recommended Action */}
          {analysis.recommended_action_th && (
            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
              <span className="font-bold mr-2">💡 คำแนะนำ:</span>
              {analysis.recommended_action_th}
            </div>
          )}

          {/* Red flags */}
          <RedFlagCard flags={analysis.red_flags || []} />
        </div>
      )}
    </div>
  );
}
