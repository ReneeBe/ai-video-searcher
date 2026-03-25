import { useRef, useState } from 'react';
import type { Phase, UploadedFile, QueryResult } from './types';
import { useSessionKey } from './hooks/useSessionKey';
import { uploadVideo, waitForFile, queryTimestamps } from './lib/gemini';
import { VideoDropzone } from './components/VideoDropzone';
import { VideoPlayer } from './components/VideoPlayer';
import { UploadProgress } from './components/UploadProgress';
import { QueryForm } from './components/QueryForm';
import { TimestampResults } from './components/TimestampResults';

export default function App() {
  const [apiKey, setApiKey] = useSessionKey();
  const [phase, setPhase] = useState<Phase>('setup');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [localVideoUrl, setLocalVideoUrl] = useState<string | null>(null);
  const [results, setResults] = useState<QueryResult[]>([]);
  const [anyLoading, setAnyLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFile = async (file: File) => {
    if (!apiKey.trim()) return;
    setError(null);
    setLocalVideoUrl(URL.createObjectURL(file));
    setPhase('upload');
    setUploadProgress(0);

    try {
      const uploaded = await uploadVideo(apiKey, file, setUploadProgress);
      setPhase('processing');
      await waitForFile(apiKey, uploaded.name);
      setUploadedFile(uploaded);
      setPhase('ready');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
      setPhase('setup');
    }
  };

  const handleQuery = async (query: string) => {
    if (!uploadedFile || anyLoading) return;

    const id = crypto.randomUUID();
    const newResult: QueryResult = { id, query, timestamps: [], loading: true, error: null };
    setResults((prev) => [newResult, ...prev]);
    setAnyLoading(true);

    try {
      const timestamps = await queryTimestamps(apiKey, uploadedFile, query);
      setResults((prev) =>
        prev.map((r) => r.id === id ? { ...r, timestamps, loading: false } : r)
      );
    } catch (e) {
      setResults((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, loading: false, error: e instanceof Error ? e.message : 'Query failed' } : r
        )
      );
    } finally {
      setAnyLoading(false);
    }
  };

  const handleSeek = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play();
    }
  };

  const handleReset = () => {
    setPhase('setup');
    setUploadedFile(null);
    setLocalVideoUrl(null);
    setResults([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            AI Video Searcher
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Upload a video, then search for any moment using plain English.
          </p>
        </div>

        {/* API Key — always shown if not in ready state with a file */}
        {(phase === 'setup') && (
          <div className="mb-6 flex flex-col gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-400">Gemini API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIza..."
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
              <p className="text-xs text-zinc-600">Stored in session only — cleared when you close the tab.</p>
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-950/50 border border-red-900 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            {apiKey.trim() && (
              <VideoDropzone onFile={handleFile} />
            )}

            {!apiKey.trim() && (
              <div className="flex flex-col items-center gap-2 py-6 text-zinc-600">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <p className="text-xs">Enter your Gemini API key to get started</p>
              </div>
            )}
          </div>
        )}

        {/* Upload / Processing progress */}
        {(phase === 'upload' || phase === 'processing') && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <UploadProgress
              progress={uploadProgress}
              phase={phase === 'upload' ? 'uploading' : 'processing'}
            />
          </div>
        )}

        {/* Ready state */}
        {phase === 'ready' && localVideoUrl && (
          <div className="flex flex-col gap-5">
            {/* Video player */}
            <VideoPlayer ref={videoRef} src={localVideoUrl} />

            {/* Query */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-zinc-200">Search for moments</p>
                <button
                  onClick={handleReset}
                  className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  ← Upload new video
                </button>
              </div>
              <QueryForm onQuery={handleQuery} isLoading={anyLoading} />
            </div>

            {/* Results */}
            {results.length > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <TimestampResults results={results} onSeek={handleSeek} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
