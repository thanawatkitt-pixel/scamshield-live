interface ThreatBadgeProps {
  level: "safe" | "suspicious" | "dangerous";
  score?: number;
  size?: "sm" | "md" | "lg";
}

const config = {
  safe: {
    label: "ปลอดภัย",
    emoji: "🟢",
    bg: "bg-emerald-500/20",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    glow: "glow-green",
  },
  suspicious: {
    label: "น่าสงสัย",
    emoji: "🟡",
    bg: "bg-yellow-500/20",
    text: "text-yellow-400",
    border: "border-yellow-500/30",
    glow: "threat-pulse-yellow",
  },
  dangerous: {
    label: "อันตราย!",
    emoji: "🔴",
    bg: "bg-red-500/20",
    text: "text-red-400",
    border: "border-red-500/30",
    glow: "threat-pulse-red",
  },
};

const sizes = {
  sm: "px-3 py-1 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-lg",
};

export default function ThreatBadge({
  level,
  score,
  size = "md",
}: ThreatBadgeProps) {
  const c = config[level] || config.safe;
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border font-bold ${c.bg} ${c.text} ${c.border} ${c.glow} ${sizes[size]}`}
    >
      <span>{c.emoji}</span>
      <span>{c.label}</span>
      {score !== undefined && (
        <span className="opacity-80 font-mono text-xs">({score}/100)</span>
      )}
    </div>
  );
}
