"use client";
import { useState } from "react";
import { ShieldAlert, TrendingUp, DollarSign, Users, ExternalLink, AlertTriangle, CheckCircle } from "lucide-react";

const stats = [
  { label: "ตรวจจับและบล็อกภัยคุกคาม", value: "14,820 ครั้ง", icon: ShieldAlert, color: "text-red-400" },
  { label: "มูลค่าความเสียหายที่ป้องกันได้", value: "฿48.6M", icon: DollarSign, color: "text-emerald-400" },
  { label: "ผู้ใช้งานที่ได้รับการปกป้อง", value: "32,500+ คน", icon: Users, color: "text-cyan-400" },
  { label: "อัตราความแม่นยำในการตรวจจับ", value: "99.4%", icon: TrendingUp, color: "text-blue-400" },
];

const scamTypes = [
  { name: "แก๊งคอลเซ็นเตอร์อ้างเป็นตำรวจ / DSI / สรรพากร", percent: 42, count: "6,224 เคส", color: "bg-red-500" },
  { name: "SMS แนบลิงก์กู้เงินด่วน / แจ้งบัญชีธนาคารถูกระงับ", percent: 28, count: "4,150 เคส", color: "bg-orange-500" },
  { name: "หลอกลงทุนผลตอบแทนสูง / Forex / คริปโต", percent: 18, count: "2,668 เคส", color: "bg-purple-500" },
  { name: "งานออนไลน์สำรองจ่าย / ปั่นยอดวิว", percent: 12, count: "1,778 เคส", color: "bg-blue-500" },
];

const recentReports = [
  {
    time: "2 นาทีที่แล้ว",
    type: "Phishing Link",
    target: "kbank-verify-otp.top",
    status: "อันตรายสูง",
    tag: "🔴 อันตราย",
  },
  {
    time: "8 นาทีที่แล้ว",
    type: "Call Center",
    target: "082-xxx-4192 (อ้างเป็นร้อยเวร สภ.เมือง)",
    status: "บล็อกแล้ว",
    tag: "🛡️ บล็อกแล้ว",
  },
  {
    time: "15 นาทีที่แล้ว",
    type: "SMS Scam",
    target: "คุณได้รับวงเงิน 50,000 คลิก...",
    status: "ฟิชชิ่ง",
    tag: "⚠️ หลอกลวง",
  },
  {
    time: "24 นาทีที่แล้ว",
    type: "Legitimate URL",
    target: "kasikornbank.com",
    status: "ปลอดภัย (Whitelist)",
    tag: "🟢 ปลอดภัย",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          📊 Community Dashboard
        </h1>
        <p className="text-gray-400 mt-2">
          ศูนย์รวมข้อมูลและสถิติภัยมิจฉาชีพออนไลน์ในประเทศไทยแบบเรียลไทม์
        </p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-shield-card border border-shield-border shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{s.label}</span>
                <Icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div className="text-2xl font-extrabold text-white mt-2">
                {s.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Scam Breakdown & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Scam Types breakdown (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-shield-card border border-shield-border space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>🚨 สถิติประเภทกลโกงยอดนิยม (เดือนนี้)</span>
          </h2>
          <div className="space-y-5">
            {scamTypes.map((st, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-200 font-medium">{st.name}</span>
                  <span className="text-gray-400 font-mono">{st.count} ({st.percent}%)</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${st.color}`}
                    style={{ width: `${st.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Live Reports Feed */}
        <div className="p-6 rounded-2xl bg-shield-card border border-shield-border space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center justify-between">
            <span>⚡ รายงานล่าสุด</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </h2>
          <div className="space-y-3">
            {recentReports.map((r, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs space-y-1"
              >
                <div className="flex justify-between text-gray-400">
                  <span>{r.type}</span>
                  <span>{r.time}</span>
                </div>
                <div className="font-mono text-gray-200 truncate">{r.target}</div>
                <div className="text-[11px] font-semibold text-cyan-400 pt-0.5">
                  {r.tag}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
