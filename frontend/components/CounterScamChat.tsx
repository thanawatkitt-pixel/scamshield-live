"use client";

interface Props {
  extractedInfo: Record<string, string>;
  totalFields?: number;
}

const ALL_EXPECTED_FIELDS = [
  { key: "claimed_name", label: "ชื่อที่แอบอ้าง" },
  { key: "claimed_org", label: "หน่วยงานที่อ้าง" },
  { key: "phone", label: "เบอร์โทรศัพท์" },
  { key: "bank", label: "ธนาคารปลายทาง" },
  { key: "account_number", label: "เลขบัญชีม้า" },
  { key: "amount", label: "ยอดเงินที่เรียกร้อง" },
];

export default function ExtractionProgress({
  extractedInfo,
  totalFields = 6,
}: Props) {
  const count = Object.keys(extractedInfo).length;
  const percent = Math.min(100, Math.round((count / totalFields) * 100));

  return (
    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
          <span>🎯 ข้อมูลมิจฉาชีพที่ดึงได้ (Extracted Evidence)</span>
        </p>
        <span className="text-xs font-mono text-emerald-300">
          {count}/{totalFields} ({percent}%)
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-700"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Extracted items */}
      <div className="flex flex-wrap gap-2">
        {ALL_EXPECTED_FIELDS.map((item) => {
          const val = extractedInfo[item.key];
          if (val) {
            return (
              <span
                key={item.key}
                className="text-xs px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-lg font-mono"
              >
                ✅ {item.label}: <strong className="text-white">{val}</strong>
              </span>
            );
          }
          return (
            <span
              key={item.key}
              className="text-xs px-2.5 py-1 bg-white/5 border border-white/5 text-gray-500 rounded-lg font-mono"
            >
              ⏳ {item.label} (ยังไม่ได้)
            </span>
          );
        })}
      </div>
    </div>
  );
}
