# About — "Origin: Assembly" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the About section's content layer as a data-driven "decoded packet" dossier — extract its hardcoded copy into a structured `ABOUT` object and render `About.tsx` from it — as the now-buildable foundation for the Origin: Assembly act.

**Architecture:** Move About's copy out of `About.tsx` into `ABOUT` in `constants.ts` (single source of truth, also feeds the chatbot), guarded by a Vitest integrity test. Rebuild `About.tsx` to render the packet fields + human statement + trait matrix + visual-ID from `ABOUT`, reusing the existing holo CSS classes and the `data-anim` reveal system (a staggered "decode" reveal is the floor). The 3D `AboutAssembly` motion is specced but deferred (needs live visual verification).

**Tech Stack:** React 19 + TypeScript, the existing GSAP `data-anim` reveal engine, Vitest. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-06-23-about-origin-assembly-design.md`. This plan is the **buildable-now** slice; the deferred 3D `AboutAssembly` + planet-ignite are documented at the end, not executed here.

## Global Constraints

- **`ABOUT` is the single source of truth** for About's copy (in `constants.ts`, typed in `types.ts`); `About.tsx` reads from it — no hardcoded dossier strings remain in the component.
- **Values are owner-reviewed drafts** — the `statement` wording and packet field values are drafts (do not invent new facts; use the spec's exact values verbatim).
- **Reuse existing CSS + reveal:** keep the existing holo classes (`holo-head`, `holo-frame`, `about-dossier`, `holo-row`, `holo-label`, `holo-row-val`, `about-block`, `about-log`, `holo-tag-row`, `holo-tag`, `about-id`, `about-avatar`, `holo-status`, …) and the `data-anim` / `data-delay` reveal attributes already in the codebase. Add NO new CSS in this plan.
- **`<section id="about">` MUST be preserved** so the existing `sections.about` scroll trigger and the background `Planet`/`ScanBeam` keep firing.
- **Type-check `npx tsc --noEmit` clean; `npm test` green** (new ABOUT test + existing 22).
- **`@` alias = repo root.** No browser is required for this plan (DOM structure + data are verifiable by tsc + read; animation *feel* is a later browser pass).

---

## File Structure

| File | Responsibility |
|------|----------------|
| `src/types.ts` (modify) | Add `AboutPacketField` interface. |
| `src/constants.ts` (modify) | Add the `ABOUT` object (packet / statement / traits). |
| `src/aboutData.test.ts` (new) | Vitest integrity test for `ABOUT`. |
| `src/components/About.tsx` (modify) | Rebuild to render entirely from `ABOUT` + `PROFILE`. |

---

### Task 1: The `ABOUT` data model + integrity test

**Files:**
- Modify: `src/types.ts`
- Modify: `src/constants.ts`
- Test: `src/aboutData.test.ts`

**Interfaces:**
- Produces: `interface AboutPacketField { label: string; value: string }` and `ABOUT: { packet: AboutPacketField[]; statement: string; traits: string[] }`.

- [ ] **Step 1: Add the type**

In `src/types.ts`, add:
```ts
export interface AboutPacketField {
  label: string;
  value: string;
}
```

- [ ] **Step 2: Add the data**

In `src/constants.ts`, import the type at the top (extend the existing import from `./types`) and add the `ABOUT` export (place it near `PROFILE`):
```ts
export const ABOUT = {
  packet: [
    { label: 'Designation', value: 'Low Chee Fei' },
    { label: 'Classification', value: 'Computer Science Graduate · Software Developer' },
    { label: 'Institution', value: 'Swinburne University of Technology · 2025' },
    { label: 'Base', value: 'Petaling Jaya, Selangor' },
    { label: 'Specialisation', value: 'Mobile Systems × Enterprise Integration' },
    { label: 'Operating Mode', value: 'Builder · Problem-solver · Bridge-maker' },
  ] as AboutPacketField[],
  statement:
    "I graduated in 2025 with one conviction: the best software doesn't live at either end of the stack — it lives in the translation layer between mobile and enterprise. That's where I build.",
  traits: [
    'Problem Solving',
    'Critical Thinking',
    'Communication',
    'Project Mgmt',
    'Time Mgmt',
    'Teamwork',
    'Adaptability',
  ],
};
```
(`AboutPacketField` is imported from `./types` alongside the existing `Project, ExperienceItem, SkillCategory, Skill` import.)

- [ ] **Step 3: Write the failing integrity test**

`src/aboutData.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { ABOUT } from './constants';

describe('ABOUT data', () => {
  it('has a non-empty packet with label+value on every field', () => {
    expect(ABOUT.packet.length).toBeGreaterThan(0);
    for (const f of ABOUT.packet) {
      expect(f.label.trim().length, JSON.stringify(f)).toBeGreaterThan(0);
      expect(f.value.trim().length, JSON.stringify(f)).toBeGreaterThan(0);
    }
  });

  it('has a non-empty human statement', () => {
    expect(ABOUT.statement.trim().length).toBeGreaterThan(0);
  });

  it('has a non-empty trait list', () => {
    expect(ABOUT.traits.length).toBeGreaterThan(0);
    for (const t of ABOUT.traits) expect(t.trim().length, t).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 4: Run to verify it fails, then passes**

Run: `npm test`
Expected: FAIL first (if you write the test before the data) — then, with the data added, PASS. (If you added the data in Step 2 already, the test passes on first run; that's acceptable for a pure-data task — the test still guards future edits.) Then `npx tsc --noEmit` clean.

- [ ] **Step 5: Commit**

```bash
git add src/types.ts src/constants.ts src/aboutData.test.ts
git commit -m "feat(about): structured ABOUT data (packet/statement/traits) + integrity test"
```

---

### Task 2: Rebuild `About.tsx` from `ABOUT`

**Files:**
- Modify: `src/components/About.tsx`

**Interfaces:**
- Consumes: `ABOUT` (Task 1), `PROFILE` (existing, has `name`).

- [ ] **Step 1: Replace the component body**

Replace the entire contents of `src/components/About.tsx` with:
```tsx
import React from 'react';
import { ABOUT, PROFILE } from '../constants';

/**
 * About — the "Origin" act rendered as a decoded data packet beamed off the
 * Origin World: a scanned visual-ID, the machine-voice packet fields, the one
 * human statement, and a trait matrix. All copy comes from ABOUT in constants.ts.
 * The packet rows reveal in a stagger (the "decode" feel) via the data-anim engine.
 */
const About: React.FC = () => {
  return (
    <section id="about" data-tint="#818cf8" className="relative overflow-hidden py-28">
      <div className="mx-auto max-w-5xl px-6">
        <div className="holo-head">
          <span className="holo-head-tag">▸ ORIGIN WORLD</span>
          <h2 className="holo-head-title">SUBJECT DOSSIER</h2>
          <span className="holo-head-meta">
            <span className="holo-rec" /> DECODING PACKET…
          </span>
        </div>

        <div className="about-holo">
          {/* scanned visual-ID */}
          <div className="about-id" data-anim="fade-up">
            <div className="holo-frame holo-scan-img about-avatar">
              <img src="/assets/ME.png" alt={PROFILE.name} />
              <span className="about-avatar-label holo-label">Visual ID · Locked</span>
            </div>
            <div>
              <p className="about-id-name">{PROFILE.name.toUpperCase()}</p>
              <span className="holo-status">
                <span className="dot" /> Online · Available 2025
              </span>
            </div>
          </div>

          {/* decoded data packet */}
          <div className="holo-frame about-dossier" data-anim="fade-up" data-delay="0.1">
            {ABOUT.packet.map((f, i) => (
              <div
                className="holo-row"
                key={f.label}
                data-anim="fade-up"
                data-delay={(0.15 + i * 0.06).toFixed(2)}
              >
                <span className="holo-label">{f.label}</span>
                <span className="holo-row-val">{f.value}</span>
              </div>
            ))}

            <div className="about-block about-log">
              <span className="holo-label">// transmission log</span>
              <p>{ABOUT.statement}</p>
            </div>

            <div className="about-block">
              <span className="holo-label">// trait matrix</span>
              <div className="holo-tag-row">
                {ABOUT.traits.map((t) => (
                  <span key={t} className="holo-tag">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
```

- [ ] **Step 2: Type-check + tests**

Run: `npx tsc --noEmit` (clean) then `npm test` (23 passing — ABOUT test + the 22 existing).

- [ ] **Step 3: Verify (code-level — no browser needed)**

Re-read `About.tsx` and confirm: it imports `ABOUT` + `PROFILE`; renders all 6 packet rows from `ABOUT.packet` (each with `holo-label` + `holo-row-val`), the `ABOUT.statement` in the transmission-log block, all `ABOUT.traits` as `holo-tag`s, and the visual-ID with `PROFILE.name`; `<section id="about">` and the `data-tint`/holo classes are intact; no dossier strings are hardcoded anymore. (The reveal *feel* is confirmed in a later browser pass.)

- [ ] **Step 4: Commit**

```bash
git add src/components/About.tsx
git commit -m "feat(about): render dossier as data-driven decoded packet from ABOUT"
```

---

## Self-Review

**Spec coverage (buildable-now slice):**
- `ABOUT` data model (packet/statement/traits) + integrity → Task 1. ✓
- Decoded-packet dossier rendered from data, statement as the human line, trait matrix, visual-ID, `id="about"` preserved → Task 2. ✓
- *Deferred (documented below, not executed):* the 3D `AboutAssembly` motion + planet ignite; the scramble/scan decode polish.

**Placeholder scan:** No TBD/TODO. Task 1 ships the complete `ABOUT` values verbatim from the spec; Task 2 ships the complete component. The owner-review of `statement`/fields is a content sign-off (a Global Constraint), not a code placeholder. The "decode feel" is an explicit later browser pass, not a vague gap.

**Type consistency:** `AboutPacketField` (Task 1) is the element type of `ABOUT.packet`, consumed in Task 2's `.map`. `ABOUT.statement` (string) and `ABOUT.traits` (string[]) match their Task 2 usage. `PROFILE.name` exists in the current `constants.ts`.

---

## Deferred — the 3D assembly (next browser-tuning pass, NOT this plan)

Build `src/scene/objects/AboutAssembly.tsx`, mounted in `SceneRoot` (shared canvas; no pointer interaction). N iridescent crystal fragments (shared geometry + `createIridescent`, theme-aware via `useThemeColors`) with seeded scattered start positions; per frame, position = `lerp(scattered, ABOUT_PLANET, assemble)` with `assemble = smoothstep(sections.about, 0.05, 0.5)` and opacity = `assemble * (1 - smoothstep(sections.about, 0.6, 0.95))`. Drive an emissive/brightness "ignite" bump on the existing `Planet.tsx` as `assemble → 1`. Pure `sections.about`-driven, reversible, split GPU/world disposal (the 2b resize lesson). Then tune framing + the dossier decode animation by eye. Owner: confirm the `statement` + packet values.
