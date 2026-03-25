import { useRef, useState } from 'react';

interface Props {
  onFile: (file: File) => void;
}

const ACCEPTED = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/mpeg'];

export function VideoDropzone({ onFile }: Props) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!ACCEPTED.includes(file.type)) {
      alert('Please upload a video file (MP4, WebM, MOV, AVI)');
      return;
    }
    onFile(file);
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      }}
      className={`relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-12 cursor-pointer transition-all duration-200 ${
        dragging
          ? 'border-violet-500 bg-violet-500/10'
          : 'border-zinc-700 hover:border-zinc-500 bg-zinc-900/50 hover:bg-zinc-800/50'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />

      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${dragging ? 'bg-violet-500/20' : 'bg-zinc-800'}`}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={dragging ? '#a78bfa' : '#71717a'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      </div>

      <div className="text-center">
        <p className="font-semibold text-zinc-200">Drop a video here</p>
        <p className="text-sm text-zinc-500 mt-1">or click to browse · MP4, WebM, MOV, AVI</p>
      </div>
    </div>
  );
}
