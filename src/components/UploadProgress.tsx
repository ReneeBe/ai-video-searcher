import { useEffect, useState } from 'react';

interface Props {
  progress: number; // 0-100
  phase: 'uploading' | 'processing';
}

const UPLOAD_MESSAGES = [
  'Beaming your video into the cloud ✨',
  'Feeding bytes to the AI gods 🤖',
  'Packaging pixels for transport 📦',
  'Uploading at ludicrous speed 🚀',
  'Almost there, hold tight 🎬',
];

const PROCESSING_MESSAGES = [
  'Gemini is watching your video 👁️',
  'Analyzing every frame 🎞️',
  'Teaching AI about your content 🧠',
  'Crunching visual data 💫',
  'Nearly ready to search 🔍',
];

export function UploadProgress({ progress, phase }: Props) {
  const [msgIndex, setMsgIndex] = useState(0);
  const messages = phase === 'uploading' ? UPLOAD_MESSAGES : PROCESSING_MESSAGES;

  useEffect(() => {
    setMsgIndex(0);
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [phase, messages.length]);

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      {/* Animated ring */}
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r="40" fill="none" stroke="#27272a" strokeWidth="8" />
          <circle
            cx="48" cy="48" r="40"
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 40}`}
            strokeDashoffset={`${2 * Math.PI * 40 * (1 - (phase === 'processing' ? 0.75 : progress / 100))}`}
            className="shimmer"
            style={{
              stroke: 'url(#grad)',
              transition: 'stroke-dashoffset 0.4s ease',
              animation: phase === 'processing' ? 'pulse-ring 1.5s ease-in-out infinite' : 'none',
            }}
          />
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-mono font-bold text-sm text-white">
            {phase === 'processing' ? '···' : `${progress}%`}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xs">
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full shimmer transition-all duration-300"
            style={{ width: phase === 'processing' ? '100%' : `${progress}%` }}
          />
        </div>
      </div>

      {/* Message */}
      <p className="text-sm text-zinc-400 text-center transition-all duration-500">
        {messages[msgIndex]}
      </p>
    </div>
  );
}
