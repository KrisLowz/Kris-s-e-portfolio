# Cinemate Live Demo — Design Spec

**Date:** 2026-06-23
**Topic:** An interactive "try the recommender" mini-tool inside the Cinemate project case study — type a movie vibe, get a seeded recommendation + an animated sentiment waveform.
**Status:** Approved in brainstorming. Almost entirely buildable + unit-testable now (pure logic + DOM); only the waveform's *motion* polish is browser-tuned.

---

## Context — why

The Cinemate project is a sentiment-analysis-driven movie recommender (Python/Django/TMDB/NLP). The storyline's standout idea — flagged in the earlier review as the single best one — is to let a visitor **experience** it: type a vibe, watch a recommendation + sentiment appear. An interactive proof beats any written description. This is a self-contained DOM/logic feature (no 3D), so it's the highest-value thing buildable while the 3D verification browser is unavailable.

It lives inside `ProjectModal` (the project case-study modal), shown only for `project.id === 'cinemate'`, as one more `data-modal-block` section (inheriting the existing staggered reveal). It is clearly labelled a **demo · seeded responses** — it evokes the real system, it does not impersonate the live app or call any API.

---

## Architecture

- **`src/components/projects/cinemateDemo.ts`** (pure, no React/DOM) — the testable brain:
  - `interface Recommendation { title: string; tagline: string; mood: string; sentiment: number }`
  - `recommend(input: string): Recommendation` — lowercases input, matches the first mood whose keywords appear, returns that film + base sentiment + mood label; falls back to a default film (sentiment nudged by a tiny positive/negative lexicon).
  - `waveformPath(sentiment: number, width: number, height: number, samples: number): string` — a deterministic SVG path string; **positive → smooth, low-frequency, higher baseline; negative → jagged, high-frequency**. Pure function of its args.
- **`src/components/projects/CinemateDemo.tsx`** — the UI: a labelled text input + "Recommend" action, a result card (title + tagline + mood chip), and an inline SVG `<path>` from `waveformPath`, with a light CSS animation (gentle oscillation / draw-in). Local React state only; no external deps.
- **`src/components/ProjectModal.tsx`** (modify) — inside the content section, render `{project.id === 'cinemate' && <CinemateDemo />}` wrapped in a `data-modal-block` so it reveals with the rest.

The brain (`cinemateDemo.ts`) and the view (`CinemateDemo.tsx`) are separate units: the brain is fully testable; the view is thin.

---

## The seeded brain (data)

A mood table (in `cinemateDemo.ts`), each: keywords → film + tagline + base sentiment. DRAFT set (owner may swap titles to taste):

| Mood | Keywords (any match) | Film | Tagline | Sentiment |
|------|----------------------|------|---------|-----------|
| uplifting | uplifting, feel-good, feelgood, happy, heartwarming, hopeful, inspiring, wholesome | The Intouchables | "An unlikely friendship that leaves you lighter than you started." | +0.9 |
| funny | funny, comedy, laugh, hilarious, light, witty, quirky | The Grand Budapest Hotel | "Whimsical, fast, and endlessly charming." | +0.7 |
| romantic | romance, romantic, love, sweet, date | Before Sunrise | "Two strangers, one night, all conversation." | +0.6 |
| mind-bending | mind-bending, mindbending, cerebral, sci-fi, scifi, twist, clever, thoughtful | Arrival | "A sci-fi that rewires how you think about time." | +0.3 |
| epic | epic, adventure, action, thrilling, grand, sweeping | Mad Max: Fury Road | "Two hours of relentless, gorgeous chaos." | +0.2 |
| tense | tense, suspense, thriller, edge, gripping, intense, nerve | Prisoners | "A slow burn that tightens until you forget to breathe." | −0.4 |
| dark | dark, gritty, crime, bleak, brutal, grim | No Country for Old Men | "Cold, exact, and quietly terrifying." | −0.7 |
| sad | sad, cry, emotional, melancholy, heartbreak, tearjerker, grief | Manchester by the Sea | "Quiet grief, handled with devastating care." | −0.8 |

**Default** (no mood keyword matches): `Everything Everywhere All at Once` — "Chaotic, tender, and unlike anything else." Sentiment = small positive/negative lexicon scan of the input, clamped to [−1, 1], else 0.

Mood matching is ordered (first hit wins); the table order above is the priority. If a vibe spans moods (e.g. "uplifting but tense"), the earlier-listed mood wins — documented, deterministic, good enough for a demo.

---

## Sentiment waveform

`waveformPath` maps `sentiment ∈ [−1, 1]` to an SVG path over `samples` points across `width`, centered vertically in `height`:
- **Amplitude** grows toward the extremes (calm-flat near 0 reads as "neutral").
- **Smoothness:** positive → a single low-frequency sine (smooth crests); negative → higher frequency + a deterministic per-sample jitter (jagged). Frequency/jitter scale with `|sentiment|` and the sign of `sentiment`.
- Deterministic (no `Math.random` — jitter is a fixed function of the sample index + sentiment), so it's reproducible and testable.

The component animates the rendered path with a light CSS transform/stroke animation; the **animation feel is the only browser-tuned part** — the path itself is pure and tested.

---

## Build split

- ✅ **Now (buildable + verifiable):** `cinemateDemo.ts` (`recommend` + `waveformPath`) with Vitest tests (keyword→film/mood/sentiment sign; default fallback; `waveformPath` determinism + valid structure); `CinemateDemo.tsx`; the `ProjectModal` wiring. `tsc` + tests are the gates.
- ⏸ **Deferred (browser):** fine-tune the waveform's motion and the panel's exact look/spacing.

---

## Verification

- `npx tsc --noEmit` clean; `npm test` green (new cinemateDemo tests + existing 25).
- Read-through: `ProjectModal` renders `<CinemateDemo />` only for `cinemate`, inside a `data-modal-block`; `CinemateDemo` wires the input to `recommend` and renders the result + an SVG path from `waveformPath`; the demo is labelled as seeded.
- When a browser returns: open the Cinemate dossier, type a few vibes, confirm sensible recommendations + the waveform shifting smooth↔jagged with sentiment.

---

## Open decisions (owner)

1. **Film picks / taglines** — swap any to taste (they're drafts).
2. **Waveform motion** — exact animation style finalised in the browser pass.
