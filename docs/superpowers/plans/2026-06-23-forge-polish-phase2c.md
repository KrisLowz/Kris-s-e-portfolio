# The Forge Stage — Polish (Phase 2c, part 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tighten the interactive Skills stage with three non-/low-visual quality fixes: make the holo info-panel keyboard-accessible (Escape + `role="dialog"`), make the crystals recolour live with the light/dark theme toggle, and delete the now-dead `HoloSkills` component.

**Architecture:** Small, surgical edits to existing files. The accessibility and theme fixes follow patterns already established elsewhere in the codebase (`useThemeColors` is how every other scene object recolours; dialog semantics are standard ARIA). No new dependencies, no new systems.

**Tech Stack:** React 19 + TypeScript, three `~0.184`, `@react-three/fiber`, the existing `useThemeColors` hook.

**This is Phase 2c — part 1 (the code-verifiable polish).** Two heavily-visual 2c items are intentionally deferred to a later pass that requires live browser verification: **streak-to-Experience continuity** (crystals fly toward the Experience beacon as the dwell ends) and **mobile/reduced-motion tap-to-inspect parity** (the DOM fallback grid showing holo info on tap). They are NOT in this plan.

## Global Constraints

- **Theme colours come from `useThemeColors()`** (the established hook — stable `THREE.Color` instances lerped per frame); it must be called INSIDE the Canvas (it uses `useFrame`). `ForgeStageScene` is inside the Canvas, so this is valid. The fixed `GOLD` accent stays a module constant.
- **`SKILLS.length` stays 17;** no data changes.
- **Type-check `npx tsc --noEmit` clean; `npm test` green** (22 tests; these edits shouldn't touch tested logic — confirm).
- **Deleting `HoloSkills.tsx` must leave no dangling import** — `tsc` is the gate (it errors on any unresolved import).
- **Do not regress Phase 2a/2b behaviour:** hover bloom + label, click-to-inspect, grab/throw physics, and the resize-safe disposal all keep working.
- **`@` alias = repo root.**

---

## File Structure

| File | Responsibility |
|------|----------------|
| `src/components/ForgeHoloPanel.tsx` (modify) | Add dialog semantics + Escape-to-close + focus the close control on open. |
| `src/scene/forge/ForgeStageScene.tsx` (modify) | Swap the one-shot `readThemeColors()` for `useThemeColors()` so crystals recolour on theme toggle. |
| `src/components/HoloSkills.tsx` (delete) | Dead since 2a (replaced by `ForgeStage`). Remove it. |

---

### Task 1: Make the holo panel keyboard-accessible

**Files:**
- Modify: `src/components/ForgeHoloPanel.tsx`

**Interfaces:**
- Unchanged public API: `ForgeHoloPanel({ skillId, onClose }: { skillId: string; onClose: () => void })`.

- [ ] **Step 1: Add Escape-to-close + dialog semantics + focus-on-open**

In `ForgeHoloPanel.tsx`:
- Import `useEffect`, `useRef` from `react`.
- Add an Escape-key listener that calls `onClose`:
```tsx
useEffect(() => {
  const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
  window.addEventListener('keydown', onKey);
  return () => window.removeEventListener('keydown', onKey);
}, [onClose]);
```
- Give the readable content container dialog semantics and a label tied to the skill name. On the inner content `<div>` (the one holding the name/category/blurb/signal bar), add: `role="dialog"`, `aria-modal="true"`, `aria-label={skill.name}`. (Keep it `pointer-events-none` for layout, but the dialog role + label is what assistive tech needs.)
- Make the close affordance focusable and focus it on open so keyboard users land on it. The existing full-screen backdrop is a `<button aria-label="Close">`; add a ref and focus it on mount:
```tsx
const closeRef = useRef<HTMLButtonElement>(null);
useEffect(() => { closeRef.current?.focus(); }, []);
```
and put `ref={closeRef}` on that backdrop `<button>`. Keep its existing `onClick={onClose}` and `pointer-events-auto`.

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Verify (code-level, no browser needed)**

Re-read the file and confirm: an `Escape` keydown calls `onClose`; the dialog `<div>` has `role="dialog"`, `aria-modal`, and `aria-label={skill.name}`; the backdrop button receives focus on open and still closes on click; the keydown listener is removed on unmount. (Browser confirmation of focus ring / screen-reader announcement is a later live pass.)

- [ ] **Step 4: Commit**

```bash
git add src/components/ForgeHoloPanel.tsx
git commit -m "feat(forge): holo panel a11y — Escape, role=dialog, focus on open"
```

---

### Task 2: Crystals recolour with the theme toggle

**Files:**
- Modify: `src/scene/forge/ForgeStageScene.tsx`

**Interfaces:**
- Consumes: `useThemeColors` from `../hooks/useThemeColors` (the same hook `Forge.tsx` and every scene object uses).

- [ ] **Step 1: Replace the one-shot colour read with the live theme hook**

In `ForgeStageScene.tsx`:
- Add `import { useThemeColors } from '../hooks/useThemeColors';`.
- DELETE the local `readThemeColors()` function and the `const colors = useMemo(() => readThemeColors(), [])` line.
- Add `const theme = useThemeColors();` near the top of the component body.
- Change the materials memo to use the live theme colours:
```tsx
const mats = useMemo(
  () => SKILLS.map(() => createIridescent(theme.primary, theme.secondary, GOLD)),
  [theme]
);
```
`useThemeColors()` returns a STABLE object whose `THREE.Color` instances are lerped in place each frame, so the materials are created once and their shader uniforms (which reference those Color instances) recolour automatically — exactly how `Forge.tsx:43-49` works. `GOLD` stays the module constant. Leave the disposal effects (`[mats, geo]` and `[world]`) and everything else unchanged.

- [ ] **Step 2: Type-check + tests**

Run: `npx tsc --noEmit` (clean) then `npm test` (22 passing — unaffected).

- [ ] **Step 3: Verify (code-level)**

Confirm `readThemeColors` is fully removed (no dangling reference), `useThemeColors()` is called inside the component (which renders inside the Canvas), and `mats` depends on the stable `theme`. This mirrors the proven `Forge.tsx` pattern, so the crystals will lerp colour on toggle the same way the background scene does. (Visual confirmation of the toggle is a later live pass.)

- [ ] **Step 4: Commit**

```bash
git add src/scene/forge/ForgeStageScene.tsx
git commit -m "feat(forge): crystals recolour live with theme toggle (useThemeColors)"
```

---

### Task 3: Delete the dead HoloSkills component

**Files:**
- Delete: `src/components/HoloSkills.tsx`

**Interfaces:** none — it is imported nowhere since 2a swapped it for `ForgeStage` in `App.tsx`.

- [ ] **Step 1: Confirm it's unreferenced, then delete**

First grep to be safe:
```bash
grep -rn "HoloSkills" src/ || echo "no references"
```
Expected: no references in `src/` (the 2a swap removed the `App.tsx` import). If any reference remains, STOP and report it — do not delete until it's unreferenced.
Then delete the file:
```bash
git rm src/components/HoloSkills.tsx
```

- [ ] **Step 2: Type-check + tests**

Run: `npx tsc --noEmit` (clean — proves nothing imported it) then `npm test` (22 passing).

- [ ] **Step 3: Commit**

```bash
git commit -m "chore(forge): remove dead HoloSkills component (replaced by ForgeStage)"
```

---

## Self-Review

**Spec coverage (2c part 1):**
- Panel keyboard a11y (Escape, role=dialog, focus) → Task 1. ✓
- Crystals recolour on theme toggle → Task 2 (swap to `useThemeColors`). ✓
- Retire `HoloSkills` → Task 3 (grep-guarded delete). ✓
- *Explicitly deferred (need live browser):* streak-to-Experience continuity; mobile tap-to-inspect parity. Documented in the header.

**Placeholder scan:** No TBD/TODO. Each task has concrete code and an exact verification. The "verify (code-level)" steps are honest about what can/can't be confirmed without a browser this session.

**Type consistency:** `useThemeColors()` returns `ThemeColors` with `.primary`/`.secondary` (`THREE.Color`), matching `createIridescent(a,b,c)`'s params — same call shape as `Forge.tsx`. `ForgeHoloPanel`'s public props are unchanged, so its `ForgeStageInteractive` call site is unaffected.

---

## Notes for the deferred 2c visual pass (when browser verification is available)
- **Streak-to-Experience:** as `sections.skills` → 1 (sticky dwell ending), apply an attractor force on the matter bodies toward a screen-projected "exit" point (top, toward Experience) and fade the crystals, so the stage hands off to the next region with no hard cut.
- **Fallback parity:** make each DOM grid item in the `!interactive` branch expand/show its holo info (category/blurb/usedIn/level) on tap, so mobile gets the substance too.
- **Owner action:** still pending — verify the 17 skill `level` values in `constants.ts`.
