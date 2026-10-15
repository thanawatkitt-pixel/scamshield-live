"use client";
import { useState } from "react";
import { Phone, Loader2, Bot, Send, User, Sparkles, AlertCircle, ShieldAlert } from "lucide-react";
import { scanVoiceTranscript, startCounterScam, counterScamTurn } from "@/lib/api";
import ThreatBadge from "@/components/ThreatBadge";
import RedFlagCard from "@/components/RedFlagCard";

const exampleTranscript = `CALLER: สวัสดีครับ ผม พ.ต.อ. สมชาย จากกองปราบปรามครับ
RECEIVER: สวัสดีค่ะ มีอะไรคะ?
CALLER: คุณมีคดีเกี่ยวกับการฟอกเงิน ต้องดำเนินการด่วนครับ
RECEIVER: เหรอคะ ดิฉันไม่รู้เรื่องเลยค่ะ
CALLER: ต้องโอนเงินค่าประกันตัว 150,000 บาท มาที่บัญชีกสิกร 048-2-71893-5 ชื่อ นายวิชัย แซ่ลิ้ม`;

interface ChatMessage {
  speaker: "scammer" | "ai";
  text: string;
  strategy?: string;
  intent?: string;
}

export default function VoicePage() {
  const [tab, setTab] = useState<"analyze" | "counter">("analyze");

  // Analyze state
  const [transcript, setTranscript] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Counter-Scam state
  const [sessionId, setSessionId] = useState("");
  const [scammerInput, setScammerInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      speaker: "ai",
      text: "สวัสดีจ้ะ มีธุระอะไรกับป้าเหรอลูก พอดีกำลังทำกับข้าวอยู่จ้ะ",
      strategy: "เปิดบทสนทนาแบบคุณป้าใจดี",
    },
  ]);
  const [counterLoading, setCounterLoading] = useState(false);

  const handleAnalyze = async (textToScan?: string) => {
    const text = textToScan || transcript;
    if (!text.trim()) return;
    setAnalyzing(true);
    setAnalysisResult(null);
    setError(null);
    try {
      const data = await scanVoiceTranscript(text);
      setAnalysisResult(data);
    } catch (err) {
      console.error(err);
      setError("ไม่สามารถวิเคราะห์เสียงสนทนาได้");
    }
    setAnalyzing(false);
  };

  const handleCounterSend = async () => {
    if (!scammerInput.trim() || counterLoading) return;
    const userText = scammerInput;
    setScammerInput("");

    const newHistory: ChatMessage[] = [
      ...chatHistory,
      { speaker: "scammer", text: userText },
    ];
    setChatHistory(newHistory);
    setCounterLoading(true);

    try {
      const turnData = await counterScamTurn({
        session_id: sessionId || "session_demo",
        scam_type: "call_center",
        scammer_message: userText,
        conversation_history: newHistory.map((m) => ({
          speaker: m.speaker,
          text: m.text,
        })),
      });

      setChatHistory([
        ...newHistory,
        {
          speaker: "ai",
          text: turnData.reply,
          strategy: turnData.stalling_tactic,
          intent: turnData.intent_detected,
        },
      ]);
    } catch (err) {
      console.error(err);
      setChatHistory([
        ...newHistory,
        {
          speaker: "ai",
          text: "เดี๋ยวนะลูก ป้าหาแว่นตาไม่เจอ พูดอีกรอบซิเมื่อกี้ว่าใครนะ?",
          strategy: "แกล้งสายตาไม่ดี",
        },
      ]);
    }
    setCounterLoading(false);
  };

  const analysis = analysisResult?.analysis;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          📞 Voice Analyzer & Counter-Scam
        </h1>
        <p className="text-gray-400 mt-2">
          ระบบวิเคราะห์สายโทรศัพท์คอลเซ็นเตอร์ และ AI Agent ถ่วงเวลามิจฉาชีพ
        </p>
      </div>

      {/* Tabs */}
      <div className="flex p-1 rounded-xl bg-shield-card border border-shield-border">
        <button
          onClick={() => setTab("analyze")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            tab === "analyze"
              ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
              : "text-gray-400 hover:text-white"
          }`}
        >
          📊 วิเคราะห์บทสนทนา (Voice Analyzer)
        </button>
        <button
          onClick={() => setTab("counter")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            tab === "counter"
              ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
              : "text-gray-400 hover:text-white"
          }`}
        >
          🤖 บอทถ่วงเวลามิจฉาชีพ (Counter-Scam)
        </button>
      </div>

      {/* Tab 1: Analyze */}
      {tab === "analyze" && (
        <div className="space-y-6">
          <div className="space-y-3">
            <textarea
              rows={6}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="วางข้อความที่ถอดเสียงจากการสนทนา หรือคลิกตัวอย่างด้านล่าง..."
              className="w-full p-4 rounded-xl bg-shield-card border border-shield-border focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 text-white placeholder-gray-500 text-sm font-mono"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => {
                  setTranscript(exampleTranscript);
                  handleAnalyze(exampleTranscript);
                }}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-shield-card hover:bg-white/10 border border-shield-border text-cyan-400 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>โหลดตัวอย่างบทสนทนาคอลเซ็นเตอร์</span>
              </button>
              <button
                onClick={() => handleAnalyze()}
                disabled={analyzing || !transcript.trim()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 disabled:opacity-50 text-white font-bold transition-all shadow-md"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>กำลังประมวลผล...</span>
                  </>
                ) : (
                  <span>วิเคราะห์บทสนทนา</span>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {analysis && (
            <div className="space-y-6 p-6 rounded-2xl bg-shield-card border border-shield-border shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-shield-border">
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider">
                    ผลการตรวจจับสายโทร
                  </div>
                  <h2 className="text-xl font-bold text-white mt-1">
                    {analysis.scam_type_th}
                  </h2>
                </div>
                <ThreatBadge
                  level={analysis.threat_level || "dangerous"}
                  score={analysis.threat_score}
                  size="lg"
                />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  สรุปใจความ
                </h3>
                <p className="text-gray-200 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                  {analysis.summary_th}
                </p>
              </div>

              {analysis.recommended_action_th && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300">
                  <span className="font-bold mr-2">🚨 คำแนะนำเร่งด่วน:</span>
                  {analysis.recommended_action_th}
                </div>
              )}

              <RedFlagCard flags={analysis.red_flags || []} />
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Counter-Scam Simulator */}
      {tab === "counter" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-300 text-sm flex items-start gap-3">
            <Bot className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <span className="font-bold">Persona ปัจจุบัน: &quot;คุณป้าใจดีแต่ขี้ลืม&quot;</span>
              <p className="text-xs text-orange-200/80 mt-1">
                บอทจะแกล้งทำตามขั้นตอนช้าๆ ขอให้พูดซ้ำ และดึงข้อมูลมิจฉาชีพเพื่อถ่วงเวลา
              </p>
            </div>
          </div>

          {/* Chat Window */}
          <div className="h-96 overflow-y-auto p-4 rounded-2xl bg-shield-card border border-shield-border space-y-4">
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${
                  msg.speaker === "scammer" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.speaker === "ai" && (
                  <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-orange-400" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] p-3.5 rounded-2xl text-sm ${
                    msg.speaker === "scammer"
                      ? "bg-red-500/20 border border-red-500/30 text-red-200 rounded-tr-none"
                      : "bg-shield-dark border border-shield-border text-gray-200 rounded-tl-none"
                  }`}
                >
                  <div className="text-[10px] uppercase font-bold mb-1 opacity-60">
                    {msg.speaker === "scammer" ? "มิจฉาชีพ" : "AI Counter-Agent"}
                  </div>
                  <p className="leading-relaxed">{msg.text}</p>
                  {msg.strategy && (
                    <div className="mt-2 text-[11px] text-cyan-400 border-t border-white/5 pt-1">
                      💡 กลยุทธ์: {msg.strategy}
                    </div>
                  )}
                </div>
                {msg.speaker === "scammer" && (
                  <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-red-400" />
                  </div>
                )}
              </div>
            ))}
            {counterLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-orange-400 animate-spin" />
                </div>
                <div className="p-3 rounded-2xl bg-shield-dark border border-shield-border text-xs text-gray-400">
                  AI กำลังคิดคำตอบเนียนๆ...
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={scammerInput}
              onChange={(e) => setScammerInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCounterSend()}
              placeholder="ลองพิมพ์คำขู่ของมิจฉาชีพ เช่น 'ถ้าไม่โอนจะออกหมายจับเดี๋ยวนี้!'"
              className="flex-1 px-4 py-3 rounded-xl bg-shield-card border border-shield-border focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 text-white placeholder-gray-500 text-sm"
            />
            <button
              onClick={handleCounterSend}
              disabled={counterLoading || !scammerInput.trim()}
              className="px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-slate-950 font-bold transition-all shadow-md shrink-0 flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>ส่ง</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
