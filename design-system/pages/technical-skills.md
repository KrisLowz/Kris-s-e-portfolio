# Technical Skills — "Meteor Forge" (page design)

> Overrides `design-system/MASTER.md`. The third act of the space journey: after the About planet, the
> camera **turns 90° right** into a new universe where a meteor shatters into the tech-stack crystals.
> Status: **M1 + M2 built.** `src/components/SpaceScene.tsx` is the shared 3D world. The journey is now ONE
> pinned stage with three scroll acts driven by `PHASES = { ABOUT_END: 0.5, TURN_START: 0.62, TURN_END: 0.82 }`:
> About planet (entrance uses `pa = p/ABOUT_END`) → **camera yaws 90° right** (`camera.rotation.y = -turn·π/2`)
> into the skills universe (starfield + nebula at +X, fading in) with a `.skills-intro` title. Fully scrubbed +
> reversible. **M3 built:** the 17 brand-tinted crystals (`TECH_SKILLS`) — **equal-dimension octahedra** in a
> depth-varied grid — each hold a Devicon logo (`makeIconTexture` fetches the SVG via a same-origin blob →
> CanvasTexture, short-name text as the immediate fallback). **v2 meteor cinematic built (scrubbed):** a big
> perturbed-icosahedron meteor hurtles in during the turn (`flyT` 0.66→0.86), then **shatters** (`shatterT`
> 0.86→0.97) — emissive flares, a debris Points burst expands, and the 17 crystals burst from the meteor centre
> out to their grid positions (`lerpVectors`, staggered, arc). Fully reversible. **M4 built:** raycast hover →
> crystal turns more transparent (icon clearer) + lifts/glows; **click → camera zooms to the crystal** (`focusT`
> lerp of `camera.position`/`lookAt`), body goes transparent, others dim, and an HTML **detail card** (badge +
> name + description) rises in (close via backdrop/✕). **Drama (reworked):** the **real 3D cat-ship** (shared
> `buildShip` from `Spaceship3D.tsx`, lit by a follow PointLight) weaves in (`SHIP0..SHIP1`) dodging 3 small
> meteors, swings to **aim at the big meteor** and fires a **bright core + cyan-glow laser** (`beam`+`beamGlow`,
> muzzle + impact flashes, `FIRE0..FIRE1`); the meteor then **breaks into ~15 rock fragments** (`frags`, spin +
> shrink-away) alongside the crystal/debris burst. The old non-rotating `meteorRim` shell was removed (it read as
> a second, static meteor stacked on the spinning one). All scrubbed + reversible. (`Planet3D.tsx` is superseded.)
>
> **Physics rebuild (latest):** the crystals are now **~20% smaller**, **flattened to one plane** (`x=CRYS_DEPTH`),
> and laid out in a bounded grid **below the heading**. Once the shatter settles (`shatterT>0.985`),
> `runCrystalPhysics` takes over: each gem **springs to its home slot**, **collides/bounces** off the others
> (equal-mass impulse, `e=0.6`), and **bounces off screen-edge walls** so nothing overflows. Interaction is
> **tap vs drag**: a quick tap opens the detail card (camera zooms to the gem's *live* position); a press-and-drag
> grabs the gem (lerp-follow with a little swing) and **throws it on release** (velocity carries → bounces
> neighbours). Verified at 1440px: drag follows the cursor, neighbours bounce, gems spring home, 0 off-screen.
>
> **Icons (DONE — real logos render, INSIDE the glass):** each gem's logo is a **3D sprite suspended inside the
> crystal** — drawn before the glass body via renderOrder (glow 0 → icon 1 → body 2 → edges 3), so the
> translucent facets + wireframe edges render over it (reads as embedded in glass, not a sticker on top).
> Texture = the **committed local SVG** (`public/assets/tech-icons/<slug>.svg`) drawn to a CanvasTexture
> (`makeIconTexture`). **The 17 official Devicon SVGs are bundled in the repo** (zero runtime CDN dependency);
> verified in-browser — every gem shows its real brand logo inside the glass, readable, ~0.66 sprite scale,
> body opacity 0.3 so the glass tints without burying it. Root cause of the earlier blank icons: **jsdelivr is
> blocked on some networks**, so the Devicon font + the old jsdelivr `npm run icons` both failed.
> `download-tech-icons.mjs` now falls through GitHub-raw → unpkg → jsdelivr per icon; index.html's Devicon font
> link moved to unpkg. (An earlier HTML-overlay approach read as "in front of" the gem and was replaced.)

## Concept
Coming out of the About planet's landing, the shared camera **yaws 90° to the right** (a real 3D pivot, not a scroll-down) to face a deeper universe. A scroll-scrubbed cinematic plays: the spaceship weaves past small meteors → a **big "undodgeable" meteor** appears → the ship fires and **shatters it into crystal shards**. Each shard is a **faceted, semi-transparent, brand-tinted crystal** with a tech-stack **Devicon icon suspended inside**. There are **two waves**: a *Languages* meteor → 8 language crystals, then a *Tools* meteor → 9 tool crystals (17 total). The meteor = the challenge of mastering the stack; destroying it = command of the craft. Fully reversible (scrub).

## Decisions (locked with the user)
- **17 skills, two waves** (Languages 8 + Tools 9). Each meteor shatters into its wave's crystals.
- **Fully scrubbed** — every beat (dodge, big meteor, fire, shatter, crystal assembly) is tied to scroll position and reversible.
- **Shared 3D camera turn** — the planet and the skills universe live in **one Three.js scene/camera**; the camera yaws 90° right. (Not a CSS card-flip.)
- **Phased build** — v1 = foundation + interactive crystals; v2 = the spaceship/meteor/destruction cinematic that *produces* those crystals.
- **Card content** = skill name + a one-line description (drafted in this doc → goes into a `TECH_SKILLS` constant).
- **Crystal style** = brand-tinted glass (tinted toward each tech's brand color; full-color icon inside).

## Architecture — one shared `SpaceScene`
Refactor the current `Planet3D` into a shared **`SpaceScene`** controller that owns a single renderer / scene / camera / rAF loop / lifecycle (keep all the existing hardening: `forceContextLoss`, `setSize(w,h,false)`, off-screen + tab-hidden pause, `webglcontextlost` → fallback, resize). Each section is an **"act"** (a `THREE.Group`) placed in world space:
- **About act** (the planet + soft-skill constellation) faces the camera at yaw 0.
- **Skills act** (universe + crystals) sits **90° to the right** (e.g. off +X).
- A single **camera yaws 0°→90°** driven by the `Journey` ScrollTrigger progress. Acts fade their detail in/out by camera facing so only the active one is "live" (raycast/labels).

The planet's HTML overlays (soft-skill chips, and the new crystal name/desc cards) keep using `camera.project()` against the live shared camera, so they track correctly through the turn. This shared world also sets up Projects/Contact as future acts.

Still lives inside the existing pinned, scrubbed `Journey` 100svh stage — we extend the scroll timeline with the Skills act (longer pin range). Reduced-motion keeps the no-pin static path.

## v1 — foundation + interactive crystals (build first)
1. **`SpaceScene` refactor** — extract the shared renderer/scene/camera/loop; the planet becomes an act; camera + act state driven by scroll progress. Must preserve the planet's current behavior exactly (spin, constellation, raycast hover, counter-scaled chips).
2. **Universe backdrop** for the skills act — deeper field than About's nebula (distant galaxy band, denser drifting starfield, subtle parallax).
3. **90° camera turn**, scrubbed and reversible.
4. **17 crystal shards** — a faceted crystal mesh (transparent/refractive-look material), **brand-tinted** per skill, with the **Devicon icon on a plane suspended inside** the glass. Arranged in two clusters (Languages / Tools), gently drifting/rotating.
5. **Interactions:**
   - **Hover** (raycast) → that crystal becomes **glassier (lower opacity)** + lifts + rim-glow.
   - **Click** → camera **flies to the shard**, the shard **flips 180°**, back face reveals an HTML **name + one-line description** card; **click-away / close** → camera returns and it flips back.
6. **Fallback** (reduced-motion / no-WebGL / small mobile) — a clean **static grid of icon-crystals + names** (CSS, accessible), plus an `sr-only` list. No scene, no scrub.

## v2 — the cinematic (layered after v1 is solid)
The spaceship enters; weaves past small meteors (scrubbed); the **big Languages meteor** appears → ship fires bullets → meteor **shatters into the 8 language crystals** (the v1 crystals are the fragments, assembled by the explosion); repeat for the **Tools meteor** → 9 tool crystals. Because v1 already owns the crystals + interactions, v2 is purely the dramatic delivery + particle/debris FX.

## Content — the 17 skills (name + one-line)
**Wave 1 — Languages / Core (8):**
- **HTML5** — The semantic, accessible backbone of every interface I build.
- **CSS3** — Layout, motion, and responsive design — where structure becomes experience.
- **JavaScript** — My go-to for interactivity, from DOM logic to async APIs.
- **Python** — My toolkit for backends, scripting, and data-heavy problem solving.
- **Java** — OOP fundamentals and robust application logic from my CS foundation.
- **C++** — Low-level performance and the algorithms that taught me how machines think.
- **C#** — Strongly-typed application development across the .NET ecosystem.
- **SQL** — Designing and querying relational data with precision.

**Wave 2 — Tools / Frameworks (9):**
- **Figma** — Where I prototype and design before a single line of code.
- **Tailwind CSS** — Utility-first styling for fast, consistent, maintainable UIs.
- **PostgreSQL** — Production-grade relational databases for real-world data.
- **Firebase** — Realtime data, auth, and hosting for shipping apps fast.
- **Kotlin** — Modern, expressive Android development.
- **Flutter** — Cross-platform apps from one codebase — my mobile framework of choice.
- **Android** — Native mobile development for the world's biggest platform.
- **Git** — Version control and collaboration: the spine of every project.
- **VS Code** — My daily driver, tuned for speed and flow.

> When built, mirror these into a `TECH_SKILLS` export and update `PORTFOLIO_CONTENT.md` + `SYSTEM_INSTRUCTION` (chatbot) per the content-sync rule in CLAUDE.md.

## Palette / perf
- Skills universe: darker than About (`#04030c`→`#0a0820`), accent stays cyan `#22D3EE` / magenta `#FF2BD6`; crystals carry brand tints.
- One WebGL context (shared) — cheaper than two. Crystals = low-poly faceted geo; icons = small canvas textures (cached). Raycast only the active act. Pause off-screen.
- Devicon (already a CDN global) supplies the brand icons; render each to a cached canvas texture.

## Known risks / open
- The `SpaceScene` refactor must not regress the planet (its constellation interactions are intricate). Verify parity before adding the Skills act.
- "Icon inside glass" legibility — may need a backing plane / reduced crystal opacity so the icon reads.
