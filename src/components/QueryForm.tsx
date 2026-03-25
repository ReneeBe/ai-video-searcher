import { useState } from 'react';

interface Props {
  onQuery: (q: string) => void;
  isLoading: boolean;
}

const SUGGESTIONS = [
  'someone laughing',
  'a close-up of a face',
  'text on screen',
  'a transition or cut',
  'someone speaking',
];

export function QueryForm({ onQuery, isLoading }: Props) {
  const [query, setQuery] = useState('');

  const submit = () => {
    const q = query.trim();
    if (!q || isLoading) return;
    onQuery(q);
    setQuery('');
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Find timestamps where..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        />
        <button
          onClick={submit}
          disabled={!query.trim() || isLoading}
          className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Searching
            </span>
          ) : 'Search'}
        </button>
      </div>

      {/* Suggestions */}
      <div className="flex flex-wrap gap-1.5">
        <span className="text-xs text-zinc-600 self-center">Try:</span>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => { setQuery(s); }}
            className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
