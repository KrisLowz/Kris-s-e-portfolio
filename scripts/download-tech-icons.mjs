// Downloads the tech-skill logos (Devicon SVGs) into public/assets/tech-icons/ so they load
// same-origin at runtime (no CDN dependency, full colour, reliable). Runs via `npm run icons` and
// automatically after `npm install` (postinstall). Idempotent — skips files that already exist, and
// never fails the install (offline just means the runtime falls back to the icon font, then text).
// Requires Node 18+ (uses global fetch).
import { writeFile, mkdir, access } from 'node:fs/promises';

const BASE = 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/';
// slug (local filename) -> Devicon SVG path (colourful "original" variants where available)
const ICONS = {
  html5: 'html5/html5-original.svg',
  css3: 'css3/css3-original.svg',
  javascript: 'javascript/javascript-original.svg',
  python: 'python/python-original.svg',
  java: 'java/java-original.svg',
  cplusplus: 'cplusplus/cplusplus-original.svg',
  csharp: 'csharp/csharp-original.svg',
  azuresqldatabase: 'azuresqldatabase/azuresqldatabase-original.svg',
  figma: 'figma/figma-original.svg',
  tailwindcss: 'tailwindcss/tailwindcss-original.svg',
  postgresql: 'postgresql/postgresql-original.svg',
  firebase: 'firebase/firebase-plain.svg',
  kotlin: 'kotlin/kotlin-original.svg',
  flutter: 'flutter/flutter-original.svg',
  android: 'android/android-original.svg',
  git: 'git/git-original.svg',
  vscode: 'vscode/vscode-original.svg',
};

const dir = 'public/assets/tech-icons';
await mkdir(dir, { recursive: true });

let ok = 0;
for (const [slug, path] of Object.entries(ICONS)) {
  const file = `${dir}/${slug}.svg`;
  try { await access(file); ok++; continue; } catch { /* not present yet — fetch it */ }
  try {
    const res = await fetch(BASE + path);
    if (!res.ok) {
      console.warn('  ✗', slug, '->', res.status);
      continue;
    }
    await writeFile(`${dir}/${slug}.svg`, await res.text(), 'utf8');
    console.log('  ✓', slug);
    ok++;
  } catch (e) {
    console.warn('  ✗', slug, '->', e.message);
  }
}
console.log(`\nDone — ${ok}/${Object.keys(ICONS).length} logos saved to ${dir}/`);
if (ok < Object.keys(ICONS).length) console.log('(Any that failed will fall back to the Devicon font, then text, at runtime.)');
