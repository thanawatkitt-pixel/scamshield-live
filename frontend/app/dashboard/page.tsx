"use client";
import { useState, useEffect } from "react";
import { TrendingUp, AlertTriangle, Shield, Users, ShieldAlert, DollarSign, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react";
import ReportCard from "@/components/ReportCard";

// จำลองข้อมูลสถิติภาพรวม
const mockStats = {
  total_scams_detected_today: 12847,
  money_saved_thb: 48200000,
  accuracy_percent: 94.7,
  active_users: 3241,
  scams_blocked_this_hour: 534,
};

const mockTrending = [
  {
    rank: 1,
    type: "แอบอ้างเจ้าหน้าที่รัฐ",
    type_en: "Authority Impersonation",
    count: 4521,
    change: +12,
    icon: "👮",
  },
  {
    rank: 2,
    type: "SMS ปลอมธนาคาร",
    type_en: "Bank Phishing SMS",
    count: 3876,
    change: +8,
    icon: "🏦",
  },
  {
    rank: 3,
    type: "หลอกลงทุนผลตอบแทนสูง",
    type_en: "Investment Scam",
    count: 2103,
    change: +23,
    icon: "📈",
  },
  {
    rank: 4,
    type: "หลอกรับพัสดุตกค้าง",
    type_en: "Package Scam",
    count: 1498,
    change: -5,
    icon: "📦",
  },
  {
    rank: 5,
    type: "หลอกรักออนไลน์ (Romance Scam)",
    type_en: "Romance Scam",
    count: 940,
    change: +15,
    icon: "💘",
  },
];

const mockRecentReports = [
  {
    reportId: "SS-20261015-A1B2",
    scamType: "แก๊งคอลเซ็นเตอร์ — แอบอ้างเจ้าหน้าที่ตำรวจกองปราบ",
    confidence: 97,
    threatLevel: "dangerous" as const,
    extractedCount: 5,
    date: "10 นาทีที่แล้ว",
  },
  {
    reportId: "SS-20261015-K882",
    scamType: "เว็บฟิชชิ่งเลียนแบบธนาคาร (kbank-verify-otp.top)",
    confidence: 100,
    threatLevel: "dangerous" as const,
    extractedCount: 3,
    date: "25 นาทีที่แล้ว",
  },
  {
    reportId: "SS-20261015-M411",
    scamType: "SMS แนบลิงก์กู้เงินดอกเบี้ยต่ำผิดกฎหมาย",
    confidence: 88,
    threatLevel: "suspicious" as const,
    extractedCount: 2,
    date: "1 ชั่วโมงที่แล้ว",
  },
  {
    reportId: "SS-20261015-W092",
    scamType: "การตรวจสอบเว็บไซต์ทางการธนาคาร (kasikornbank.com)",
    confidence: 0,
    threatLevel: "safe" as const,
    extractedCount: 0,
    date: "2 ชั่วโมงที่แล้ว",
  },
];

export default function DashboardPage() {
  const [ticker, setTicker] = useState(mockStats.scams_blocked_this_hour);

  useEffect(() => {
    const interval = setInterval(() => {
      setTicker((prev) => prev + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          📊 Community Dashboard
        </h1>
        <p className="text-gray-400 mt-2">
          รายงานสถิติภัยมิจฉาชีพทางไซเบอร์แบบเรียลไทม์ และระบบความปลอดภัยชุมชนประเทศไทย
        </p>
      </div>

      {/* Top 4 Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-shield-card border border-shield-border shadow-md">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>ตรวจจับวันนี้</span>
            <ShieldAlert className="w-5 h-5 text-red-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2">
            {mockStats.total_scams_detected_today.toLocaleString()} เคส
          </div>
          <div className="text-xs text-red-400 mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +14% เทียบกับเมื่อวาน
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-shield-card border border-shield-border shadow-md">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>มูลค่าความเสียหายที่ป้องกันได้</span>
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-2">
            ฿{(mockStats.money_saved_thb / 1_000_000).toFixed(1)} ล้านบาท
          </div>
          <div className="text-xs text-gray-400 mt-1">ประเมินจากมูลค่าเคสที่ถูกยับยั้ง</div>
        </div>

        <div className="p-5 rounded-2xl bg-shield-card border border-shield-border shadow-md">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>ความแม่นยำ AI</span>
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white mt-2">
            {mockStats.accuracy_percent}%
          </div>
          <div className="text-xs text-emerald-400 mt-1">โมเดล ScamShield v2.0</div>
        </div>

        <div className="p-5 rounded-2xl bg-shield-card border border-shield-border shadow-md">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>สกัดกั้นชั่วโมงนี้</span>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
          </div>
          <div className="text-2xl font-extrabold text-cyan-400 mt-2">
            {ticker.toLocaleString()} ครั้ง
          </div>
          <div className="text-xs text-cyan-300 mt-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> อัปเดตแบบเรียลไทม์
          </div>
        </div>
      </div>

      {/* Main Grid: Trending Scams & Recent Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Top Trending (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-shield-card border border-shield-border space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>🔥 5 อันดับรูปแบบกลโกงที่ระบาดหนักที่สุด</span>
            </h2>
            <span className="text-xs text-gray-400 font-mono">เรียงตามความถี่สัปดาห์นี้</span>
          </div>

          <div className="space-y-4">
            {mockTrending.map((item) => (
              <div
                key={item.rank}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-cyan-500/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-mono font-bold">
                        #{item.rank}
                      </span>
                      <h3 className="text-sm font-semibold text-white">{item.type}</h3>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{item.type_en}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold text-white font-mono">
                    {item.count.toLocaleString()} ครั้ง
                  </div>
                  <div
                    className={`text-xs font-mono flex items-center justify-end gap-0.5 ${
                      item.change > 0 ? "text-red-400" : "text-emerald-400"
                    }`}
                  >
                    {item.change > 0 ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {item.change > 0 ? `+${item.change}%` : `${item.change}%`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Recent Reports (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>📋 รายงานล่าสุด (Live)</span>
            </h2>
          </div>

          <div className="space-y-3">
            {mockRecentReports.map((report) => (
              <ReportCard
                key={report.reportId}
                reportId={report.reportId}
                scamType={report.scamType}
                confidence={report.confidence}
                threatLevel={report.threatLevel}
                extractedCount={report.extractedCount}
                date={report.date}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
