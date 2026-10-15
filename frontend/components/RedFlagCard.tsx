interface RedFlag {
  text: string;
  reason_th: string;
  severity: "critical" | "warning" | "info";
}

const severityConfig = {
  critical: {
    icon: "🚨",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    label: "อันตราย",
  },
  warning: {
    icon: "⚠️",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    label: "เตือน",
  },
  info: {
    icon: "ℹ️",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    label: "ข้อมูล",
  },
};

export default function RedFlagCard({ flags }: { flags: RedFlag[] }) {
  if (!flags || flags.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
        🚩 Red Flags ที่พบ ({flags.length})
      </h3>
      {flags.map((flag, i) => {
        const s = severityConfig[flag.severity] || severityConfig.warning;
        return (
          <div
            key={i}
            className={`p-4 rounded-xl border ${s.bg} ${s.border} transition-all hover:scale-[1.01]`}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl mt-0.5">{s.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm text-red-300 break-all">
                  &quot;{flag.text}&quot;
                </p>
                <p className="text-sm text-gray-300 mt-1">{flag.reason_th}</p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded border border-white/10 text-gray-400">
                {s.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
