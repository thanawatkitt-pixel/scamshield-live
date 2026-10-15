"use client";
import { useState, useRef } from "react";
import { Volume2, Play, Pause } from "lucide-react";

interface VoicePlayerProps {
  audioBase64?: string;
  scriptTh: string;
  duration?: number;
}

export default function VoicePlayer({
  audioBase64,
  scriptTh,
  duration,
}: VoicePlayerProps) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioBase64) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(`data:audio/mp3;base64,${audioBase64}`);
      audioRef.current.onended = () => setPlaying(false);
    }

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  return (
    <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-cyan-400" />
          <span className="text-sm font-semibold text-cyan-400">
            เสียงเตือน AI (Voice Alert)
          </span>
          {duration && (
            <span className="text-xs text-gray-500">({duration}s)</span>
          )}
        </div>
        {audioBase64 && (
          <button
            onClick={togglePlay}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold text-xs transition-all"
          >
            {playing ? (
              <>
                <Pause className="w-3.5 h-3.5" /> หยุด
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" /> ฟังเสียง
              </>
            )}
          </button>
        )}
      </div>
      <p className="text-sm text-gray-300 italic">&ldquo;{scriptTh}&rdquo;</p>
    </div>
  );
}
