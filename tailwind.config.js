/**
 * Ported from the inline `tailwind.config` that used to live in index.html
 * (loaded via the Tailwind Play CDN). Same tokens — the `pop-*` colors still map
 * to the CSS variables in src/style.css, dark mode is still the `class` strategy,
 * and the blob keyframe is unchanged — so the visual output is identical, but the
 * CSS is now built statically instead of compiled in the browser at runtime.
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'pop-bg': 'var(--bg-primary)',
        'pop-surface': 'var(--bg-surface)',
        'pop-surface-2': 'var(--bg-surface-2)',
        'pop-text-main': 'var(--text-main)',
        'pop-text-muted': 'var(--text-muted)',
        'pop-border': 'var(--border-color)',
        'pop-primary': 'var(--accent-primary)',
        'pop-secondary': 'var(--accent-secondary)',
        'pop-magenta': 'var(--accent-magenta)',
        'pop-amber': 'var(--accent-amber)',
        'pop-teal': 'var(--accent-teal)',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        blob: 'blob 10s infinite',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
