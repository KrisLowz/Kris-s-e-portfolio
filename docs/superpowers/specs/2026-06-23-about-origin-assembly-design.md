# About — "Origin: Assembly" Design Spec

**Date:** 2026-06-23
**Topic:** Rebuild the About section as the "Origin" act — crystal fragments scroll-assemble into the Origin core while a decoded-data-packet dossier resolves alongside.
**Status:** Approved in brainstorming. Build split: data + DOM packet buildable/verifiable now; the 3D assembly + fine visual tuning deferred until a working browser is available.

---

## Context — why

About is the second region of the "One Living World" journey (Hero → **About** → Skills → …). The owner is extending the immersive interactive-3D treatment, section by section, that the Skills "Forge" established. About is the **calm inverse of the Skills smash**: instead of a planet shattering into crystal shards, scattered crystal fragments **magnetise together into the Origin core**. This also creates a deliberate through-line — *About assembles crystals into a core → Skills ruptures a planet back into crystals* — one material, one continuous story.

Today About is a DOM "Subject Dossier" (`About.tsx`) plus a background `Planet` + `ScanBeam` (the voyage-era Origin World). This spec keeps the planet, replaces the dossier presentation with a **decoded data packet**, and adds the **scroll-driven assembly**.

Interaction model (decided): **scroll-driven, no pointer game** — distinct from Skills' playable toy, and the safest to build well without live visual verification.

---

## The concept

As `sections.about` scrolls 0 → 1:
- **Entering (0 → ~0.5):** a field of iridescent crystal fragments drifts in scattered, then **converges** onto the Origin planet's position; the planet **ignites** (brightens) as the assembly locks.
- **Centred (~0.5):** core assembled and glowing; the decoded-packet dossier is fully resolved/readable.
- **Leaving (~0.5 → 1):** fragments disperse / fade as the region hands off toward Skills.

All of it is a **pure function of `sections.about`** (reversible — scroll back and it disassembles), the same proven pattern as the Phase 1 smash and the 2c hand-off.

---

## Content / data model

Extract the dossier's currently-hardcoded content out of `About.tsx` into a structured `ABOUT` object in `src/constants.ts` (single source of truth; also improves the chatbot). DRAFT values — owner reviews the statement + any field:

```ts
export interface AboutPacketField { label: string; value: string; }
export const ABOUT = {
  packet: [
    { label: 'Designation',    value: 'Low Chee Fei' },
    { label: 'Classification', value: 'Computer Science Graduate · Software Developer' },
    { label: 'Institution',    value: 'Swinburne University of Technology · 2025' },
    { label: 'Base',           value: 'Petaling Jaya, Selangor' },
    { label: 'Specialisation', value: 'Mobile Systems × Enterprise Integration' },
    { label: 'Operating Mode', value: 'Builder · Problem-solver · Bridge-maker' },
  ] as AboutPacketField[],
  // The one human, first-person line (owner to confirm wording):
  statement:
    "I graduated in 2025 with one conviction: the best software doesn't live at either end of the stack — it lives in the translation layer between mobile and enterprise. That's where I build.",
  traits: ['Problem Solving', 'Critical Thinking', 'Communication', 'Project Mgmt', 'Time Mgmt', 'Teamwork', 'Adaptability'],
};
```

Every value above is true/derivable from the existing About content + `PROFILE`. `Base` keeps the real location (Petaling Jaya, Selangor) rather than the storyline's "Kuala Lumpur."

---

## The decoded-packet dossier (DOM)

Rebuild `About.tsx` to render from `ABOUT` as a **decoded data packet**:
- A monospace readout of the `packet` fields — `LABEL` (muted, uppercase) → `value` — that **decode/resolve in** as About enters (scramble-to-settle or a scan-line reveal, timed to assembly progress; a simple staggered reveal is the floor, the scramble is polish).
- The **human `statement`** as the one non-machine, first-person line (the voice of the person, distinct from the packet's machine voice).
- The **trait matrix** (the 7 `traits`) as tags, as today.
- Keep the scanned visual-ID (`/assets/ME.png`) and the holo framing/classes that already exist.

The dossier stays the **readable substance**; the 3D assembly is the cinematic backdrop behind/around it.

---

## The 3D assembly (deferred visual)

A new background scene object **`src/scene/objects/AboutAssembly.tsx`**, mounted in `SceneRoot` (the shared canvas — *not* a separate interactive canvas, since there's no pointer interaction). Reuses Phase 1 building blocks:
- N iridescent crystal fragments (shared geometry + `createIridescent`, theme-aware via `useThemeColors`).
- Each fragment has a seeded scattered start position; its live position = `lerp(scattered, coreTarget, assemble)` where `assemble = smoothstep(sections.about, 0.05, 0.5)` and fragments fade/disperse via `1 - smoothstep(sections.about, 0.6, 0.95)`. Converge target = the Origin planet position (`ABOUT_PLANET` in `SceneRoot`).
- **`Planet.tsx` ignite:** drive a brightness/emissive bump on the existing planet as `assemble` → 1 (the core "locks").

Pure `sections.about`-driven, reversible, GPU-disposed on unmount (the resize-safe split-disposal lesson from 2b applies).

---

## Architecture / integration

- **Reuse:** `Planet.tsx` (the core), `createIridescent` (fragment material), `useThemeColors`, `getSectionProgress().about`, the `SceneRoot` mount pattern, the existing holo CSS classes for the dossier.
- **New:** `ABOUT` data (constants/types), the rebuilt `About.tsx`, `AboutAssembly.tsx`.
- **Unchanged:** `ScanBeam`, the rest of the scene, the Skills Forge work.
- The dossier DOM and the 3D assembly are independent units linked only by reading the same `sections.about` progress — testable/buildable separately.

---

## Build split

- ✅ **Now (buildable + verifiable without a browser):**
  1. `ABOUT` data model in `types.ts` + `constants.ts`, with a Vitest integrity test (packet non-empty, traits non-empty, statement present).
  2. Rebuild `About.tsx` to render from `ABOUT` (decoded-packet structure + statement + traits + visual-ID). Type-checks; structure verifiable by reading; the *decode animation feel* is browser-tuned later.
- ⏸ **Deferred (needs eyes):** `AboutAssembly.tsx` motion + `Planet` ignite; fine-tuning the dossier's decode animation. Specced here; built when a browser is back.

---

## Verification

- `npx tsc --noEmit` clean; `npm test` green (new `ABOUT` integrity test + existing 22).
- Read-through of the rebuilt `About.tsx` confirms it renders all `ABOUT` fields, the statement, the traits, and the visual-ID, with `id="about"` intact (so `sections.about` keeps firing).
- When a browser returns: scroll through About and confirm fragments assemble into the igniting core and disperse on exit; the packet decodes in; reversible on scroll-back.

---

## Open decisions (owner)

1. **Confirm the `statement` wording** and any `packet` field (these are drafts).
2. **Decode animation style** for the packet — scramble-to-settle vs scan-line reveal vs simple stagger — best chosen once it can be seen; simple stagger is the safe default to ship first.
