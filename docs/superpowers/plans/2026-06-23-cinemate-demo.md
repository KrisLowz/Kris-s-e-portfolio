# Cinemate Live Demo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an interactive "try the recommender" mini-tool to the Cinemate case study — type a movie vibe → seeded recommendation + an animated sentiment waveform.

**Architecture:** A pure, unit-tested brain (`cinemateDemo.ts`: `recommend` + `waveformPath`), a thin React view (`CinemateDemo.tsx`), wired into `ProjectModal` only for the Cinemate project. No 3D, no deps, no API.

**Tech Stack:** React 19 + TypeScript, inline SVG, a small CSS keyframe, Vitest.

**Spec:** `docs/superpowers/specs/2026-06-23-cinemate-demo-design.md`. Almost all buildable + verifiable now; only the waveform's motion *feel* is browser-tuned.

## Global Constraints
- Pure logic in `cinemateDemo.ts` (no React/DOM); the view is thin. No `Math.random` (waveform jitter is a deterministic function of index + sentiment) so it's reproducible/testable.
- Clearly labelled **demo · seeded** — evokes the real Python/Django/TMDB/NLP system, never impersonates it; calls no API.
- Render only for `project.id === 'cinemate'`, as a `data-modal-block` (inherits the modal's stagger reveal).
- Reuse existing `pop-*` theme classes; the only new CSS is one waveform keyframe in `src/style.css`.
- Type-check `npx tsc --noEmit` clean; `npm test` green (new tests + existing 25). `@` alias = repo root.

---

## File Structure
| File | Responsibility |
|------|----------------|
| `src/components/projects/cinemateDemo.ts` (new) | Pure: `Recommendation`, `recommend`, `waveformPath`, mood table. |
| `src/components/projects/cinemateDemo.test.ts` (new) | Vitest for both functions. |
| `src/components/projects/CinemateDemo.tsx` (new) | The input → result + SVG waveform view. |
| `src/style.css` (modify) | One `cinemate-draw` keyframe. |
| `src/components/ProjectModal.tsx` (modify) | Render `<CinemateDemo />` for cinemate. |

---

### Task 1: The brain — `cinemateDemo.ts` + tests (TDD)

- [ ] **Step 1: Write the failing test** — `src/components/projects/cinemateDemo.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { recommend, waveformPath } from './cinemateDemo';

describe('recommend', () => {
  it('maps an uplifting vibe to a positive pick', () => {
    const r = recommend('something uplifting and warm');
    expect(r.mood).toBe('uplifting');
    expect(r.title).toBe('The Intouchables');
    expect(r.sentiment).toBeGreaterThan(0);
  });
  it('maps a tense vibe to a negative pick', () => {
    const r = recommend('a tense, gripping thriller');
    expect(r.mood).toBe('tense');
    expect(r.sentiment).toBeLessThan(0);
  });
  it('is case-insensitive', () => {
    expect(recommend('DARK and GRITTY').mood).toBe('dark');
  });
  it('first-listed mood wins when a vibe spans moods', () => {
    expect(recommend('uplifting but tense').mood).toBe('uplifting');
  });
  it('falls back to a default when nothing matches', () => {
    const r = recommend('zxcv qwer');
    expect(r.title).toBe('Everything Everywhere All at Once');
  });
});

describe('waveformPath', () => {
  it('is deterministic', () => {
    expect(waveformPath(0.5, 100, 40, 20)).toBe(waveformPath(0.5, 100, 40, 20));
  });
  it('starts with M and has samples-1 segments', () => {
    const p = waveformPath(0.5, 100, 40, 20);
    expect(p.startsWith('M ')).toBe(true);
    expect(p.split(' L ').length).toBe(20); // 1 M-point + 19 L-points
  });
  it('spreads more at the extremes than at neutral', () => {
    const range = (s: number) => {
      const ys = waveformPath(s, 100, 40, 40).replace('M ', '').split(' L ').map((p) => parseFloat(p.split(',')[1]));
      return Math.max(...ys) - Math.min(...ys);
    };
    expect(range(1)).toBeGreaterThan(range(0));
  });
});
```

- [ ] **Step 2: Run — expect FAIL** (`npm test`; module not found).

- [ ] **Step 3: Implement** — `src/components/projects/cinemateDemo.ts`:
```ts
export interface Recommendation {
  title: string;
  tagline: string;
  mood: string;
  sentiment: number; // -1..1
}

interface MoodEntry {
  mood: string;
  keywords: string[];
  title: string;
  tagline: string;
  sentiment: number;
}

/** Ordered: first mood whose keyword appears (as a substring) wins. */
const MOODS: MoodEntry[] = [
  { mood: 'uplifting', keywords: ['uplifting', 'feel-good', 'feelgood', 'feel good', 'happy', 'heartwarming', 'hopeful', 'inspiring', 'wholesome'], title: 'The Intouchables', tagline: 'An unlikely friendship that leaves you lighter than you started.', sentiment: 0.9 },
  { mood: 'funny', keywords: ['funny', 'comedy', 'laugh', 'hilarious', 'witty', 'quirky'], title: 'The Grand Budapest Hotel', tagline: 'Whimsical, fast, and endlessly charming.', sentiment: 0.7 },
  { mood: 'romantic', keywords: ['romance', 'romantic', 'love', 'sweet'], title: 'Before Sunrise', tagline: 'Two strangers, one night, all conversation.', sentiment: 0.6 },
  { mood: 'mind-bending', keywords: ['mind-bending', 'mindbending', 'cerebral', 'sci-fi', 'scifi', 'twist', 'clever', 'thoughtful'], title: 'Arrival', tagline: 'A sci-fi that rewires how you think about time.', sentiment: 0.3 },
  { mood: 'epic', keywords: ['epic', 'adventure', 'action', 'thrilling', 'grand', 'sweeping'], title: 'Mad Max: Fury Road', tagline: 'Two hours of relentless, gorgeous chaos.', sentiment: 0.2 },
  { mood: 'tense', keywords: ['tense', 'suspense', 'thriller', 'edge', 'gripping', 'intense', 'nerve'], title: 'Prisoners', tagline: 'A slow burn that tightens until you forget to breathe.', sentiment: -0.4 },
  { mood: 'dark', keywords: ['dark', 'gritty', 'crime', 'bleak', 'brutal', 'grim'], title: 'No Country for Old Men', tagline: 'Cold, exact, and quietly terrifying.', sentiment: -0.7 },
  { mood: 'sad', keywords: ['sad', 'cry', 'emotional', 'melancholy', 'heartbreak', 'tearjerker', 'grief'], title: 'Manchester by the Sea', tagline: 'Quiet grief, handled with devastating care.', sentiment: -0.8 },
];

const POS = ['good', 'great', 'love', 'fun', 'nice', 'warm', 'bright', 'hope', 'joy'];
const NEG = ['bad', 'hate', 'cold', 'cry', 'scary', 'fear', 'grim', 'bleak'];

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));

export function recommend(input: string): Recommendation {
  const text = input.toLowerCase();
  for (const m of MOODS) {
    if (m.keywords.some((k) => text.includes(k))) {
      return { title: m.title, tagline: m.tagline, mood: m.mood, sentiment: m.sentiment };
    }
  }
  let s = 0;
  for (const w of POS) if (text.includes(w)) s += 0.25;
  for (const w of NEG) if (text.includes(w)) s -= 0.25;
  return {
    title: 'Everything Everywhere All at Once',
    tagline: 'Chaotic, tender, and unlike anything else.',
    mood: 'eclectic',
    sentiment: clamp(s, -1, 1),
  };
}

/** Deterministic SVG path: positive = smooth low-frequency; negative = jagged high-frequency. */
export function waveformPath(sentiment: number, width: number, height: number, samples: number): string {
  const s = clamp(sentiment, -1, 1);
  const mid = height / 2;
  const amp = (0.1 + Math.abs(s) * 0.6) * (height / 2);
  const freq = s >= 0 ? 1.2 : 3.5 + Math.abs(s) * 3;
  const jitter = s < 0 ? Math.abs(s) * 0.35 : 0;
  const pts: string[] = [];
  for (let i = 0; i < samples; i++) {
    const t = i / (samples - 1);
    const x = t * width;
    const j = jitter * Math.sin(i * 12.9898) * (height / 2) * 0.4; // deterministic jagged term
    const y = mid - Math.sin(t * Math.PI * 2 * freq) * amp - j;
    pts.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return 'M ' + pts.join(' L ');
}
```

- [ ] **Step 4: Run — expect PASS** (`npm test`) then `npx tsc --noEmit` clean.
- [ ] **Step 5: Commit** — `git add src/components/projects/cinemateDemo.ts src/components/projects/cinemateDemo.test.ts && git commit -m "feat(cinemate): seeded recommender + sentiment waveform (pure, tested)"`

---

### Task 2: The view — `CinemateDemo.tsx` + waveform keyframe

- [ ] **Step 1: Create** `src/components/projects/CinemateDemo.tsx`:
```tsx
import React, { useState } from 'react';
import { recommend, waveformPath, type Recommendation } from './cinemateDemo';

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
          onKeyDown={(e) => { if (e.key === 'Enter') run(); }}
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
```

- [ ] **Step 2: Add the keyframe** to `src/style.css` (append near the end):
```css
/* Cinemate demo — draw the sentiment waveform in on each new result */
.cinemate-wave path {
  stroke-dasharray: 1200;
  stroke-dashoffset: 1200;
  animation: cinemate-draw 1.1s ease forwards;
}
@keyframes cinemate-draw {
  to { stroke-dashoffset: 0; }
}
```

- [ ] **Step 3: Type-check** — `npx tsc --noEmit` clean.
- [ ] **Step 4: Commit** — `git add src/components/projects/CinemateDemo.tsx src/style.css && git commit -m "feat(cinemate): recommender demo UI + waveform draw-in"`

---

### Task 3: Wire into `ProjectModal`

- [ ] **Step 1: Import + render** — in `src/components/ProjectModal.tsx`, add `import CinemateDemo from './projects/CinemateDemo';` near the other imports, and inside the content `<div className="p-8 space-y-10 flex-1">`, immediately AFTER the Overview `</section>` (the one rendering `project.overview`), add:
```tsx
{project.id === 'cinemate' && <CinemateDemo />}
```
(`CinemateDemo`'s root is `<section data-modal-block>`, so it joins the stagger reveal automatically.)

- [ ] **Step 2: Type-check + tests** — `npx tsc --noEmit` clean; `npm test` green.
- [ ] **Step 3: Commit** — `git add src/components/ProjectModal.tsx && git commit -m "feat(cinemate): mount the recommender demo in the Cinemate dossier"`

---

## Self-Review
- **Spec coverage:** `recommend` + `waveformPath` + mood table (Task 1) ✓; the demo UI + waveform + demo label (Task 2) ✓; conditional mount in the case study (Task 3) ✓; honesty label ✓; deferred = waveform motion polish (one CSS keyframe shipped; finer feel later). 
- **Placeholder scan:** complete code in every step; film set is an owner-tweakable draft (a content decision, not a code gap).
- **Type consistency:** `Recommendation`/`recommend`/`waveformPath` names match Task 1 → 2; `CinemateDemo` default export matches the Task 3 import.

## Deferred (browser)
Fine-tune the waveform motion (e.g. continuous oscillation vs the draw-in) and the panel's exact spacing once a browser is available. Owner: tweak film picks/taglines in `cinemateDemo.ts` to taste.
