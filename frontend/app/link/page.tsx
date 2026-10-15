"use client";
import { useState } from "react";
import { Link2, Loader2, ExternalLink, Globe, ShieldCheck, AlertCircle, Sparkles } from "lucide-react";
import { scanLink } from "@/lib/api";
import ThreatBadge from "@/components/ThreatBadge";
import RedFlagCard from "@/components/RedFlagCard";

const examples = [
  "https://kbank-verify.xyz/login?ref=sms2026",
  "https://scb-alert.top/confirm-account",
  "https://kasikornbank.com.evil-site.xyz/secure",
  "https://kasikornbank.com/personal",
  "https://royalthaipolice.go.th",
];

export default function LinkPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (urlToScan?: string) => {
    const targetUrl = urlToScan || url;
    if (!targetUrl.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const data = await scanLink(targetUrl);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("ไม่สามารถตรวจสอบลิงก์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต");
    }
    setLoading(false);
  };

  const analysis = result?.analysis;
  const urlStruct = result?.url_structure;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          🔗 Link Inspector
        </h1>
        <p className="text-gray-400 mt-2">
          วาง URL ที่แนบมากับข้อความ — ระบบ Whitelist และ Heuristic จะตรวจสอบว่าเป็นเว็บฟิชชิ่งหรือหลอกลวงไหม
        </p>
      </div>

      {/* Input */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Link2 className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="วาง URL ที่ต้องการตรวจ เช่น https://kbank-verify.xyz..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-shield-card border border-shield-border focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-white placeholder-gray-500"
            />
          </div>
          <button
            onClick={() => handleScan()}
            disabled={loading || !url.trim()}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 disabled:opacity-50 text-white font-bold transition-all shadow-md shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>กำลังตรวจ...</span>
              </>
            ) : (
              <span>ตรวจสอบ URL</span>
            )}
          </button>
        </div>

        {/* Examples */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mr-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>ลิงก์ทดสอบ:</span>
          </div>
          {examples.map((ex, idx) => (
            <button
              key={idx}
              onClick={() => {
                setUrl(ex);
                handleScan(ex);
              }}
              className="text-xs px-2.5 py-1 rounded-lg bg-shield-card hover:bg-white/10 border border-shield-border text-gray-300 transition-colors"
            >
              {ex.replace("https://", "")}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Result */}
      {analysis && (
        <div className="space-y-6 p-6 rounded-2xl bg-shield-card border border-shield-border shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-shield-border">
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">
                ผลการตรวจสอบลิงก์
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                {analysis.scam_type_th}
              </h2>
            </div>
            <ThreatBadge
              level={analysis.threat_level || "safe"}
              score={analysis.threat_score}
              size="lg"
            />
          </div>

          {/* Domain Breakdown */}
          {urlStruct && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-400">ชื่อโดเมน (Domain)</div>
                  <div className="font-mono text-sm text-white">{urlStruct.domain}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-400">นามสกุล (TLD)</div>
                  <div className="font-mono text-sm text-cyan-400">{urlStruct.tld || "-"}</div>
                </div>
              </div>
            </div>
          )}

          {/* Explanation */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
              รายละเอียดการประเมิน
            </h3>
            <p className="text-gray-200 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
              {analysis.summary_th}
            </p>
          </div>

          {/* Recommended Action */}
          {analysis.recommended_action_th && (
            <div className={`p-4 rounded-xl border ${
              analysis.threat_level === "safe" 
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-red-500/10 border-red-500/30 text-red-300"
            }`}>
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
