/** Scramble glyphs — deliberately NO letters, so an unlocked position never
 *  coincidentally equals a target letter (keeps the reveal + tests clean). */
const GLYPHS = '!<>-_\\/[]{}=+*^?#$%&@01234789';

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));

/**
 * One frame of a "signal-lock" reveal of `target`. Each non-space character
 * locks to its real value once `progress` passes its left-to-right threshold;
 * otherwise it shows a glyph that churns with `tick`. Spaces are preserved.
 * Pure + deterministic: progress >= 1 returns the exact target.
 */
export function signalLock(target: string, progress: number, tick = 0): string {
  const p = clamp(progress, 0, 1);
  const n = target.length;
  let out = '';
  for (let i = 0; i < n; i++) {
    const ch = target[i];
    if (ch === ' ') {
      out += ' ';
      continue;
    }
    const locked = p >= 1 || p > (i + 1) / (n + 1);
    out += locked ? ch : GLYPHS[Math.abs(i * 31 + tick * 17) % GLYPHS.length];
  }
  return out;
}
