import Link from "next/link";
import { Shield, ArrowRight, Zap, CheckCircle2, AlertTriangle, Users } from "lucide-react";

const features = [
  {
    href: "/scan",
    icon: "💬",
    title: "Message Scanner",
    desc: "วิเคราะห์ SMS, LINE, Email ว่าเป็น Scam หรือไม่ พร้อมชี้จุดอันตราย",
    color: "from-blue-500 to-cyan-500",
    glow: "hover:shadow-blue-500/20",
  },
  {
    href: "/link",
    icon: "🔗",
    title: "Link Inspector",
    desc: "ตรวจสอบ URL ว่าเป็น Phishing หรือเว็บปลอมเลียนแบบธนาคารไหม (v2 Whitelist)",
    color: "from-purple-500 to-pink-500",
    glow: "hover:shadow-purple-500/20",
  },
  {
    href: "/voice",
    icon: "📞",
    title: "Voice Analyzer & Bot",
    desc: "วิเคราะห์สายโทรคอลเซ็นเตอร์ + มี AI แกล้งคุยถ่วงเวลามิจฉาชีพดึงข้อมูลบัญชีม้า",
    color: "from-orange-500 to-red-500",
    glow: "hover:shadow-orange-500/20",
  },
  {
    href: "/dashboard",
    icon: "📊",
    title: "Community Dashboard",
    desc: "สถิติภัยกลโกงออนไลน์ทั่วประเทศ แจ้งเตือนมิจฉาชีพแบบเรียลไทม์",
    color: "from-emerald-500 to-teal-500",
    glow: "hover:shadow-emerald-500/20",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center pt-12 pb-8">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Shield className="w-20 h-20 text-cyan-400" />
            <div className="absolute inset-0 w-20 h-20 bg-cyan-400/20 rounded-full blur-xl" />
          </div>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
          รู้ทันมิจฉาชีพใน{" "}
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            3 วินาที
          </span>
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
          เกราะป้องกันภัยไซเบอร์ด้วย AI ตรวจจับ SMS หลอกลวง, ลิงก์ฟิชชิ่งเลียนแบบธนาคาร, และคอลเซ็นเตอร์แบบครบวงจร
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/scan"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold transition-all shadow-lg shadow-cyan-500/25"
          >
            <span>เริ่มตรวจสอบข้อความ</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/link"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-shield-card hover:bg-white/5 border border-shield-border text-white font-semibold transition-all"
          >
            <span>ตรวจสอบลิงก์ URL</span>
          </Link>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className={`group p-6 rounded-2xl bg-shield-card border border-shield-border hover:border-cyan-500/40 transition-all hover:-translate-y-1 shadow-lg ${f.glow}`}
          >
            <div className="flex items-center gap-4 mb-4">
              <span className="text-3xl p-3 rounded-xl bg-white/5 border border-white/10">
                {f.icon}
              </span>
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                  {f.title}
                </h3>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
          </Link>
        ))}
      </section>

      {/* Stats Section */}
      <section className="p-8 rounded-2xl bg-gradient-to-b from-shield-card to-shield-dark border border-shield-border">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-cyan-400">99.4%</div>
            <div className="text-sm text-gray-400 mt-1">ความแม่นยำในการตรวจจับฟิชชิ่ง</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-blue-400">&lt; 1.5 วินาที</div>
            <div className="text-sm text-gray-400 mt-1">ความเร็วในการวิเคราะห์แบบ Real-time</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400">100+ โดเมน</div>
            <div className="text-sm text-gray-400 mt-1">Whitelist หน่วยงานและธนาคารไทยจริง</div>
          </div>
        </div>
      </section>
    </div>
  );
}
