# Cosmic Cyberpunk Interaction Spec

This document turns the movie-style storyline into buildable UI components, scroll triggers, animation states, and fallback rules.

Related docs:

- `docs/cosmic-cyberpunk-scroll-storyline.md`
- `docs/generated-world-assets.md`
- `docs/scroll-driven-realtime-motion-reference.md`

## Goal

Build the portfolio as a scroll-driven gameplay sequence:

```txt
Boot -> Hero Launch -> Origin Dossier -> Skill Meteor -> Mission Archive -> Project Worlds -> Relay Console -> Ending
```

The implementation should avoid generic `fade-up` repetition. Each section needs its own motion grammar:

- Hero: launch / projection
- About: scan / dossier decrypt
- Skills: meteor break / crystal interaction
- Experience: archive docking / mission log decrypt
- Projects: portal route / modal transition
- Contact: relay console / signal beam

## Existing Systems To Reuse

Current animation engine supports:

```txt
data-anim="fade-up | fade-in | scale | pop | clip | clip-left | chars | words | lines | draw | draw-y"
data-stagger
data-speed
data-float
data-velocity
data-tint
data-zoom-out
```

Current libraries:

- React
- TypeScript
- GSAP
- ScrollTrigger
- Lenis
- Three.js / React Three Fiber
- Devicon

Current data sources:

- `PROFILE`
- `ABOUT`
- `SKILLS`
- `PROJECTS`
- `EXPERIENCE`

## Asset Constants

Create a single constant map so paths are not repeated across components.

```ts
export const WORLD_ASSETS = {
  mascot: '/assets/world/mascot/cyber-cat-mascot-cutout.png',
  mascotTurnaround: '/assets/world/mascot/cyber-cat-turnaround-cutout.png',
  spaceship: '/assets/world/hero/portfolio-spaceship-cutout.png',
  originPlanet: '/assets/world/about/origin-planet-cutout.png',
  skillCrystal: '/assets/world/skills/skill-crystal-cutout.png',
  projectPortal: '/assets/world/projects/project-portal-ring-cutout.png',
  satelliteRelay: '/assets/world/contact/satellite-relay-cutout.png',
  wormhole: '/assets/world/transitions/wormhole-transition-cutout.png',
  blackHole: '/assets/world/transitions/black-hole-portal-cutout.png',
} as const;
```

Recommended file:

```txt
src/story/worldAssets.ts
```

## Component Architecture

Recommended tree:

```txt
src/components/story/
  StoryWorldLayer.tsx
  StoryHUD.tsx
  AnimatedSectionHeading.tsx
  MascotPilot.tsx
  SpaceshipSprite.tsx
  WarpTransition.tsx
  SectionRouteProgress.tsx

src/components/story/about/
  OriginDossier.tsx
  DossierRow.tsx
  ScanBeam.tsx

src/components/story/skills/
  SkillMeteorScene.tsx
  SkillCrystal.tsx
  SkillCrystalDetail.tsx
  LaserBeam.tsx
  SkillOrbit.tsx

src/components/story/experience/
  MissionArchive.tsx
  MissionRecord.tsx
  ArchiveTimeline.tsx

src/components/story/projects/
  ProjectWorldRoute.tsx
  ProjectPortalCard.tsx
  ProjectPortalTransition.tsx

src/components/story/contact/
  RelayConsole.tsx
  SignalBeam.tsx
```

## Global Story Layer

### `StoryWorldLayer`

Purpose:

- Hosts persistent decorative/story assets that move between sections.
- Prevents every section from owning its own unrelated spaceship/mascot copy.

Assets:

```txt
spaceship
mascot
wormhole
blackHole
```

State:

```ts
type StoryAct =
  | 'boot'
  | 'hero'
  | 'about'
  | 'skills'
  | 'experience'
  | 'projects'
  | 'contact'
  | 'end';

type MascotState =
  | 'sleep'
  | 'wave'
  | 'pilot'
  | 'scan'
  | 'alarm'
  | 'aim'
  | 'celebrate'
  | 'archive'
  | 'relay'
  | 'goodbye';
```

Behavior:

- Track active act from section midpoint.
- Move spaceship between pre-authored positions.
- Swap mascot state with CSS classes or simple GSAP transforms.
- Keep pointer events disabled except for explicit interactive elements.

Layering:

```txt
z-index -50: WebGL / SceneFallback
z-index -20: global story assets
z-index 0: section background assets
z-index 10: section content
z-index 40: nav / HUD
z-index 80: transitions / modal portal
z-index 100: modals
```

Reduced motion:

- Hide global moving layer.
- Render static section assets only.

## Shared Components

### `AnimatedSectionHeading`

Purpose:

- Replace static `.holo-head` blocks with consistent cinematic headings.

Props:

```ts
type AnimatedSectionHeadingProps = {
  eyebrow: string;
  title: string;
  meta?: string;
  align?: 'left' | 'center';
};
```

Markup rules:

```tsx
<div className="holo-head" data-stagger="0.08">
  <span data-anim="pop">{eyebrow}</span>
  <h2 data-anim="words">{title}</h2>
  {meta && <span data-anim="clip-left">{meta}</span>}
</div>
```

Animation:

- Eyebrow: `pop`
- Title: `words`
- Meta: `clip-left`
- Optional bottom divider: `draw`

Reduced motion:

- Render final text without split animation.

### `WarpTransition`

Purpose:

- Reusable section-to-section transition using wormhole asset.

Asset:

```txt
/assets/world/transitions/wormhole-transition-cutout.png
```

Props:

```ts
type WarpTransitionProps = {
  trigger: string;
  start?: string;
  end?: string;
  direction?: 'in' | 'out';
};
```

GSAP behavior:

```txt
scale: 0.15 -> 2.5
rotate: -8deg -> 12deg
opacity: 0 -> 1 -> 0
filter: blur(8px) -> blur(0) -> blur(12px)
```

Use cases:

- Hero -> About
- Projects -> Contact
- Optional section jumps

Reduced motion:

- Crossfade only.

### `SectionRouteProgress`

Purpose:

- Mini star-map progress indicator.

Data:

```txt
Hero
About
Skills
Experience
Projects
Contact
```

Behavior:

- Current act glows.
- Route line draws with scroll progress.
- Clicking a node scrolls to section using Lenis.

Reduced motion:

- Keep clickable section nav, no route draw animation.

## Scene 00: Boot

Component:

```txt
Preloader -> StoryBootPreloader
```

Assets:

```txt
mascot
```

DOM hooks:

```txt
data-boot
data-boot-mascot
data-boot-line
data-boot-orbit
```

Timeline:

```txt
0.00 mascot opacity 0 -> 1, scale 0.92 -> 1
0.15 orbit draw / rotate
0.30 "INITIALIZING VOYAGE" clip-left
0.55 "PILOT PROFILE DETECTED" clip-left
0.80 "LOW CHEE FEI" chars
1.20 flash overlay opacity 0 -> 1
1.40 preloader display none
```

Exit event:

```ts
window.dispatchEvent(new CustomEvent('story:boot-complete'));
```

Reduced motion:

- Do not render boot preloader.

## Scene 01: Hero Launch

Component:

```txt
HeroLaunch
```

Assets:

```txt
mascot
spaceship
wormhole
```

Content:

- `PROFILE.name`
- `PROFILE.title`
- `PROFILE.headline`
- CTA buttons

Text animation:

```txt
Name: chars
Title/headline: words
Supporting copy: lines
CTA group: staggered pop
```

ScrollTrigger:

```txt
trigger: #hero
start: top top
end: bottom top
scrub: 0.8
pin: desktop only
```

Timeline:

```txt
0.00 spaceship y 20 -> 0, opacity 0 -> 1
0.10 mascot opacity 0 -> 1, rotate -2 -> 0
0.20 name chars reveal
0.35 headline words reveal
0.50 CTA controls pop
0.70 spaceship x/y moves toward center, scale 1 -> 1.15
0.82 hero content scale 1 -> 0.9, opacity 1 -> 0.15
0.90 wormhole scale 0.1 -> 2.4, opacity 0 -> 1
1.00 wormhole opacity 1 -> 0
```

Mobile fallback:

- No pin.
- Static spaceship above/below hero text.
- Name uses simple `words` reveal.

## Scene 02: Origin Dossier

Component:

```txt
OriginDossier
```

Assets:

```txt
originPlanet
mascot
spaceship
```

Data:

- `ABOUT.packet`
- `ABOUT.statement`
- `ABOUT.traits`

Text animation:

```txt
Heading: words
Packet labels: clip-left
Packet values: clip-left with 0.06 stagger
Statement: lines
Traits: pop stagger
```

ScrollTrigger:

```txt
trigger: #about
start: top 80%
end: bottom 35%
scrub: false for text, scrub true for planet parallax
```

Timeline:

```txt
0.00 planet opacity 0 -> 0.45, scale 0.72 -> 1
0.10 scan beam x -120% -> 120%
0.20 profile frame clip-left
0.30 dossier panel clip-left
0.45 packet rows reveal stagger
0.65 statement lines reveal
0.78 traits pop stagger
```

Interactions:

- Hover trait chip: glow and slight lift.
- Hover avatar/profile frame: scan beam reruns once.

Reduced motion:

- Planet rendered static at low opacity.
- Packet rows visible.

## Scene 03: Skill Meteor Scene

Component:

```txt
SkillMeteorScene
```

Assets:

```txt
spaceship
mascot
skillCrystal
```

Data:

- `SKILLS`

Subcomponents:

```txt
LaserBeam
SkillOrbit
SkillCrystal
SkillCrystalDetail
```

Desktop behavior:

- Pinned full-screen scene.
- Meteor break is scrubbed by scroll.
- Skill crystals become interactive after the break completes.

ScrollTrigger:

```txt
trigger: #skills
start: top top
end: +=220%
pin: true
scrub: 1
```

Timeline:

```txt
0.00 spaceship enters from lower-left
0.10 warning HUD appears
0.18 meteor scales 0.5 -> 1, rotates slowly
0.30 ship shake begins
0.38 laser charge ring opacity 0 -> 1, scale 0.4 -> 1
0.48 laser beam fires
0.55 meteor cracks
0.62 meteor fragments fade out
0.66 skill crystals fly out from meteor center
0.82 crystals settle into orbit positions
0.90 heading "DEV STACK RECOVERED" reveals
1.00 interactions enabled
```

Crystal layout:

```ts
const inner = SKILLS.filter((skill) => skill.ring === 'inner');
const outer = SKILLS.filter((skill) => skill.ring === 'outer');
```

`SkillCrystal` props:

```ts
type SkillCrystalProps = {
  skill: Skill;
  index: number;
  ring: 'inner' | 'outer';
  selected: boolean;
  onSelect: (skill: Skill) => void;
};
```

Crystal markup:

```tsx
<button className="skill-crystal" data-skill-id={skill.id}>
  <img src={WORLD_ASSETS.skillCrystal} alt="" />
  <i className={skill.iconClass} aria-hidden />
  <span className="sr-only">{skill.name}</span>
</button>
```

Click behavior:

```txt
1. Pause orbit loop.
2. Selected crystal moves to center and scales up.
3. Crystal rotates Y 0 -> 180.
4. Detail panel fades in on back side.
5. Escape / close restores orbit.
```

Detail content:

```txt
skill.name
skill.category
skill.blurb
Level meter from skill.level
Used in project chips from skill.usedIn
```

Keyboard:

- Skill crystals are buttons.
- Enter/Space opens detail.
- Escape closes detail.

Mobile fallback:

- No pinned meteor sequence.
- Show a short meteor intro at top.
- Render crystals as 2-column flip cards.
- Tap flips card.

Reduced motion:

- Skip meteor break.
- Render skill crystal grid immediately.

## Scene 04: Mission Archive

Component:

```txt
MissionArchive
```

Assets:

```txt
satelliteRelay
spaceship
mascot
```

Data:

- `EXPERIENCE`
- Add one static origin record
- Add one static open-to-work record

Text animation:

```txt
Heading: words
Timeline line: draw-y
Record shell: clip-left
Record title: words
Record body: lines
Skill chips: pop stagger
```

ScrollTrigger:

```txt
trigger: #experience
start: top 75%
end: bottom 40%
```

Timeline:

```txt
0.00 satellite opacity 0 -> 1, rotation -8 -> 0
0.12 spaceship approaches relay
0.25 timeline line draw-y
0.35 record 001 clip-left
0.50 real EXPERIENCE records reveal stagger
0.75 open mission record amber pulse
```

Interactions:

- Hover/focus record: timeline node glows.
- Hover/focus record: satellite light pulses.

Reduced motion:

- Show static timeline.

## Scene 05: Project Worlds

Component:

```txt
ProjectWorldRoute
```

Assets:

```txt
projectPortal
spaceship
blackHole
wormhole
```

Data:

- `PROJECTS`

Desktop behavior:

- Horizontal pinned route.
- Each project is a portal card.
- Project click opens existing `ProjectModal`, but with portal transition.

ScrollTrigger:

```txt
trigger: #projects
start: top top
end: () => '+=' + horizontalDistance
pin: true
scrub: 1
```

Portal card composition:

```txt
Layer 1: screenshot image
Layer 2: projectPortal cutout
Layer 3: scanline/radar overlay
Layer 4: title, subtitle, tags, achievement
```

`ProjectPortalCard` props:

```ts
type ProjectPortalCardProps = {
  project: Project;
  index: number;
  active: boolean;
  onOpen: (project: Project) => void;
};
```

Per-card reveal:

```txt
Portal ring: scale 0.75 -> 1, rotate -12 -> 0
Screenshot: clip circle/scale in
Title: words
Tags: pop stagger
Achievement: glow pulse once
```

Click behavior:

```txt
1. Portal ring spins.
2. blackHole asset scales 0.2 -> 2.2 over clicked card.
3. Background dims.
4. Existing ProjectModal opens.
5. Modal gallery becomes command-center panel.
```

Close behavior:

```txt
1. Modal fades.
2. blackHole reverses.
3. Return focus to clicked project card.
```

Mobile fallback:

- No horizontal pin.
- Vertical project portal cards.
- Portal click still opens modal.

Reduced motion:

- No black-hole transition.
- Modal opens with simple fade/scale.

## Scene 06: Relay Console

Component:

```txt
RelayConsole
```

Assets:

```txt
satelliteRelay
mascot
spaceship
```

Data:

- `PROFILE.email`
- location/status copy

Text animation:

```txt
Heading: words
Coordinate rows: clip-left stagger
Form fields: clip-left stagger
Submit button: pop
```

ScrollTrigger:

```txt
trigger: #contact
start: top 78%
end: bottom 50%
```

Timeline:

```txt
0.00 satellite enters from right, opacity 0 -> 1
0.15 spaceship parks near relay
0.25 mascot appears at console
0.35 coordinate rows reveal
0.50 form fields reveal
0.70 signal rings pulse loop starts
```

Submit interaction:

```txt
1. Prevent default.
2. Validate fields if form is wired.
3. Satellite dish rotates toward viewport.
4. SignalBeam scales from button to top-right.
5. Mascot celebrates.
6. Success message appears.
```

Reduced motion:

- Submit shows success text without beam.

## Scene 07: Ending

Component:

```txt
VoyageCompleteFooter
```

Assets:

```txt
spaceship
mascot
```

Timeline:

```txt
0.00 signal beam fades to star trail
0.15 spaceship scale 1 -> 0.3, y -40, opacity 1 -> 0.2
0.35 mascot hologram wave, opacity 1 -> 0
0.55 footer links clip-up
```

Reduced motion:

- Static footer.

## Text Animation Rules

Do not use the same reveal everywhere.

| Content Type | Animation | Existing API |
| --- | --- | --- |
| Main hero name | Character reveal | `data-anim="chars"` |
| Section title | Word reveal | `data-anim="words"` |
| Section eyebrow | Pop | `data-anim="pop"` |
| Metadata/status | Clip-left | `data-anim="clip-left"` |
| Paragraph/body | Line reveal | `data-anim="lines"` |
| Holographic panels | Clip or clip-left | `data-anim="clip"` / `clip-left` |
| Timeline line | Vertical draw | `data-anim="draw-y"` |
| Route line | Horizontal draw | `data-anim="draw"` |
| Chips/tags | Staggered pop | parent `data-stagger`, child `data-anim="pop"` |
| Asset sprites | Scale/parallax/float | GSAP timeline, `data-speed`, `data-float` |

Timing defaults:

```txt
chars stagger: 0.02 - 0.03
words stagger: 0.04 - 0.06
line stagger: 0.08
chip stagger: 0.05 - 0.08
panel duration: 0.9 - 1.2
```

## Section Transition Rules

| Transition | Visual | Implementation |
| --- | --- | --- |
| Boot -> Hero | Flash / HUD startup | Preloader timeline |
| Hero -> About | Wormhole expands | `WarpTransition` |
| About -> Skills | Data cube / warning marker | CSS/GSAP particles |
| Skills -> Experience | Skill crystals form star route | Skill scene timeline |
| Experience -> Projects | Archive releases coordinates | Mission archive timeline |
| Projects -> Contact | Wormhole short jump | `WarpTransition` |
| Contact -> End | Signal beam becomes trail | `SignalBeam` timeline |

## Interaction State Matrix

| Component | Idle | Hover/Focus | Active | Exit |
| --- | --- | --- | --- | --- |
| SkillCrystal | Orbiting / glowing | Lift, brighter icon | Zoomed and flipped | Return to orbit |
| ProjectPortalCard | Portal idle rotation | Scanline pass, ring glow | Black-hole opens modal | Ring settles |
| MissionRecord | Static log | Node glow, record border glow | N/A | Glow fades |
| RelayConsole | Signal rings pulse | Button thruster glow | Signal beam fires | Success state |
| MascotPilot | Act-specific pose | Optional blink/wiggle | Celebrate/alarm/scan | Fade or move with ship |
| WarpTransition | Hidden | N/A | Full-screen transition | Hidden |

## Accessibility Rules

- All clickable assets must be real buttons or links.
- Decorative images use `alt=""` and `aria-hidden="true"`.
- Skill crystals need accessible names from `skill.name`.
- Project portals need accessible names like `Open TrackPoint project`.
- Modal close must restore focus to the opener.
- Escape closes skill detail and project modal.
- Reduced motion must show all content without needing scroll precision.

## Performance Rules

- Use PNG cutouts as `<img>` layers, not CSS background images, when they need transforms.
- Add `loading="lazy"` for below-fold assets except Hero/preloader.
- Use `will-change: transform, opacity` only on active animated layers.
- Avoid animating width, height, top, left after layout.
- Use `transform`, `opacity`, `filter` sparingly.
- Pause ambient loops when sections leave viewport.
- On mobile, disable pinned long scenes and heavy particle effects.

## Build Order

### Phase 1: Replace Generic Reveals

1. Build `AnimatedSectionHeading`.
2. Update Hero/About/Experience/Projects/Contact headings.
3. Replace repeated `fade-up` with `words`, `clip-left`, `lines`, `pop`, `draw`.
4. Tune `revealStart` closer to focused viewport if needed.

### Phase 2: Add Static Asset Layer

1. Add `WORLD_ASSETS`.
2. Add origin planet to About.
3. Add satellite relay to Contact.
4. Add spaceship and mascot to Hero.
5. Add project portal rings around project screenshots.

### Phase 3: Add Section Timelines

1. Build Hero launch timeline.
2. Build Origin dossier scan.
3. Build Mission archive reveal.
4. Build Contact relay reveal.

### Phase 4: Build Interactive Scenes

1. Build `SkillMeteorScene`.
2. Build `SkillCrystal` click/flip.
3. Build project portal black-hole modal transition.
4. Add route progress nav.

### Phase 5: Polish / Fallbacks

1. Add mobile versions.
2. Add reduced-motion fallbacks.
3. Profile asset sizes and frame rate.
4. Clean up stale animation selectors that target old markup.

## Acceptance Checklist

Before considering the interaction system done:

- Hero has a launch moment, not just text reveal.
- About reads like a scanned dossier.
- Skills has a meteor/crystal interaction or a clear fallback.
- Experience reads like mission logs, not generic cards.
- Projects feel like portals/worlds.
- Contact has a relay signal moment.
- Every section has a distinct transition style.
- Keyboard users can operate skill and project interactions.
- Reduced motion still shows all content.
- Mobile does not rely on pinned horizontal scroll for core content.

