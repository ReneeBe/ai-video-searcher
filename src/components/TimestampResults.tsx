import type { QueryResult } from '../types';

interface Props {
  results: QueryResult[];
  onSeek: (seconds: number) => void;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function formatSeconds(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${pad(m)}:${pad(sec)}`;
}

export function TimestampResults({ results, onSeek }: Props) {
  if (results.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      {results.map((result) => (
        <div key={result.id} className="flex flex-col gap-2">
          {/* Query header */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-violet-400">›</span>
            <p className="text-sm font-semibold text-zinc-200">{result.query}</p>
          </div>

          {/* Loading */}
          {result.loading && (
            <div className="flex items-center gap-2 pl-4 text-xs text-zinc-500">
              <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Analyzing video...
            </div>
          )}

          {/* Error */}
          {result.error && (
            <p className="pl-4 text-xs text-red-400">{result.error}</p>
          )}

          {/* Timestamps */}
          {!result.loading && !result.error && (
            <>
              {result.timestamps.length === 0 ? (
                <p className="pl-4 text-xs text-zinc-500">No matching moments found.</p>
              ) : (
                <div className="flex flex-col gap-1.5 pl-4">
                  {result.timestamps.map((ts, i) => (
                    <button
                      key={i}
                      onClick={() => onSeek(ts.seconds)}
                      className="flex items-start gap-3 text-left px-3 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-violet-500/50 transition-all group"
                    >
                      <span className="font-mono text-xs font-bold text-violet-400 group-hover:text-violet-300 shrink-0 mt-0.5 w-10">
                        {ts.timestamp || formatSeconds(ts.seconds)}
                      </span>
                      <span className="text-xs text-zinc-400 group-hover:text-zinc-300 leading-relaxed">
                        {ts.description}
                      </span>
                      <svg
                        className="shrink-0 ml-auto mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-violet-400"
                        width="12" height="12" viewBox="0 0 16 16" fill="currentColor"
                      >
                        <polygon points="3,2 13,8 3,14" />
                      </svg>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="h-px bg-zinc-800 mt-1" />
        </div>
      ))}
    </div>
  );
}
