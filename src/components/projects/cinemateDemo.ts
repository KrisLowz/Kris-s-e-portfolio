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
