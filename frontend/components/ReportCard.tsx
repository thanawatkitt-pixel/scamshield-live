import Link from "next/link";
import { FileText, ChevronRight } from "lucide-react";
import ThreatBadge from "./ThreatBadge";

interface ReportCardProps {
  reportId: string;
  scamType: string;
  confidence: number;
  threatLevel: "safe" | "suspicious" | "dangerous";
  extractedCount: number;
  date: string;
}

export default function ReportCard({
  reportId,
  scamType,
  confidence,
  threatLevel,
  extractedCount,
  date,
}: ReportCardProps) {
  return (
    <Link href={`/report?id=${reportId}`}>
      <div className="bg-shield-card border border-shield-border hover:border-purple-500/50 rounded-xl p-5 hover:scale-[1.01] transition-all group cursor-pointer shadow-md">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            <span className="text-xs text-gray-500 font-mono">{reportId}</span>
          </div>
          <ThreatBadge level={threatLevel} score={confidence} size="sm" />
        </div>

        <p className="text-sm font-medium text-white mb-1 group-hover:text-purple-300 transition-colors">
          {scamType}
        </p>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
          <div className="flex gap-3 text-xs text-gray-400">
            <span>🎯 {extractedCount} หลักฐาน</span>
            <span>📅 {date}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </Link>
  );
}
