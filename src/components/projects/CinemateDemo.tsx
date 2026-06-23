import React, { useState } from 'react';
import { recommend, waveformPath, type Recommendation } from './recommender';

const W = 280;
const H = 64;
const SAMPLES = 48;

/** Interactive (seeded) recommender demo shown inside the Cinemate case study. */
export default function CinemateDemo() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<Recommendation | null>(null);

  const run = () => {
    if (input.trim()) setResult(recommend(input));
  };

  return (
    <section data-modal-block>
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-xl font-bold text-pop-text-main">Try the recommender</h3>
        <span className="text-[10px] font-mono uppercase tracking-wider text-pop-text-muted border border-pop-border rounded px-1.5 py-0.5">
          demo · seeded
        </span>
      </div>
      <p className="text-sm text-pop-text-muted mb-4">
        Describe a vibe and Cinemate suggests a film — and reads its sentiment, the way the real system did from reviews.
      </p>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') run();
          }}
          placeholder="e.g. something uplifting but a little tense"
          aria-label="Describe a movie vibe"
          className="flex-1 rounded-lg border border-pop-border bg-pop-surface-2 px-4 py-2.5 text-sm text-pop-text-main placeholder:text-pop-text-muted/60 focus:outline-none focus:border-pop-primary"
        />
        <button
          type="button"
          onClick={run}
          className="px-5 py-2.5 bg-pop-primary text-white font-semibold rounded-lg hover:bg-pop-primary/90 transition-colors text-sm"
        >
          Recommend
        </button>
      </div>

      {result && (
        <div className="mt-5 rounded-2xl border border-pop-border bg-pop-surface-2 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-pop-text-muted">recommended</span>
              <h4 className="text-lg font-bold text-pop-text-main mt-0.5">{result.title}</h4>
              <p className="text-sm text-pop-text-muted mt-1">{result.tagline}</p>
            </div>
            <span className="shrink-0 text-[11px] font-semibold rounded-full px-3 py-1 bg-pop-primary/10 text-pop-primary capitalize">
              {result.mood}
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-pop-text-muted mb-1">
              <span>sentiment</span>
              <span>{result.sentiment > 0.15 ? 'positive' : result.sentiment < -0.15 ? 'negative' : 'neutral'}</span>
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none" className="cinemate-wave">
              <path
                key={`${result.title}:${result.sentiment}`}
                d={waveformPath(result.sentiment, W, H, SAMPLES)}
                fill="none"
                stroke={result.sentiment >= 0 ? 'var(--accent-primary)' : '#f0a3a3'}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      )}
    </section>
  );
}
