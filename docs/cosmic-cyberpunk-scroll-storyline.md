# Cosmic Cyberpunk Scroll Storyline

This document defines the full story flow for the portfolio as a gameplay-like scroll-driven website.

The visitor is not just reading a resume. They are piloting through a small cosmic cyberpunk universe with a cute cat mascot, a spaceship, project planets, skill crystals, mission logs, and a final relay console.

## Core Concept

Title idea:

```txt
Low Chee Fei: Portfolio Voyage
```

Story premise:

```txt
A cute cyberpunk cat pilot travels through a digital universe to assemble Low Chee Fei's developer profile. Each scroll section reveals one part of the journey: identity, origin, skills, experience, projects, and contact.
```

Main character:

- Cute cyberpunk anthropomorphic cat mascot
- Acts as pilot, guide, and emotional anchor
- Travels in a small spaceship
- Reacts to each section with simple animation states

Website world:

- Space as the main stage
- Holographic UI as the content language
- Skills become crystals
- Projects become planets/worlds
- Experience becomes mission records
- Contact becomes a relay transmission

## Narrative Arc

The full page should feel like this:

1. Boot system
2. Launch from origin
3. Identify pilot profile
4. Enter skill asteroid field
5. Break meteor into skill crystals
6. Decode work experience logs
7. Visit project worlds
8. Open final communication relay
9. Send signal / end voyage

## Asset Cast

Primary generated assets:

| Asset | Path | Story Role |
| --- | --- | --- |
| Cat mascot cutout | `/assets/world/mascot/cyber-cat-mascot-cutout.png` | Pilot, guide, emotional reaction |
| Spaceship cutout | `/assets/world/hero/portfolio-spaceship-cutout.png` | Main vehicle through the scroll journey |
| Origin planet cutout | `/assets/world/about/origin-planet-cutout.png` | About section destination |
| Skill crystal cutout | `/assets/world/skills/skill-crystal-cutout.png` | Broken meteor fragments containing skills |
| Project portal ring cutout | `/assets/world/projects/project-portal-ring-cutout.png` | Gateway into each project world |
| Satellite relay cutout | `/assets/world/contact/satellite-relay-cutout.png` | Contact section communication station |
| Wormhole cutout | `/assets/world/transitions/wormhole-transition-cutout.png` | Major section transition / warp jump |
| Black-hole portal cutout | `/assets/world/transitions/black-hole-portal-cutout.png` | Project modal open/close transition |

Use cutout assets for layered animation. Use the non-cutout versions only for static previews, cards, or temporary backgrounds.

## Movie Script Overview

Format:

```txt
SCENE
Scroll range
Assets on screen
Camera / animation direction
Content reveal
Exit transition
```

The site should behave like a silent animated short film controlled by scroll.

The visitor is the camera. The cat is the pilot. The spaceship is the cursor through the universe. Each section is a chapter.

## Scene 00: Cold Open - System Boot

Scroll range:

```txt
Before main scroll / preloader
```

Assets:

```txt
/assets/world/mascot/cyber-cat-mascot-cutout.png
```

Scene direction:

```txt
BLACK SCREEN.
A small cyan loading orbit flickers in the center.
Static scanlines sweep downward.
The cat mascot appears as a low-opacity hologram, half asleep at a tiny console.
It blinks, notices the visitor, and taps the console.
```

Motion:

1. Background fades from black to deep navy.
2. Loading orbit rotates.
3. Mascot scales from 0.92 to 1 with soft opacity.
4. HUD lines draw from center outward.
5. Small particles drift behind the mascot.

Content reveal:

```txt
INITIALIZING VOYAGE
PILOT PROFILE DETECTED
LOW CHEE FEI
SOFTWARE DEVELOPER
```

Exit:

```txt
The cat presses launch.
A white-cyan flash fills the screen.
The flash becomes the Hero starfield.
```

Implementation note:

- This replaces a generic loading screen.
- Keep it short: 1.5s to 2.5s.
- Skip animation under reduced motion and show Hero immediately.

## Global Scroll Behavior

The scroll should feel like a game camera moving through acts.

Use:

- Pinned sections for major scenes
- Scrubbed camera movement
- Holographic UI reveals
- Section-to-section transition effects
- Mascot state changes
- Parallax stars and planets
- Realtime spaceship drift
- Clickable interactive objects

Avoid:

- Every section fading up the same way
- Static cards appearing without context
- Random decorative assets without story purpose
- Heavy motion that blocks readability

## Act 0: System Boot

Purpose:

Introduce the world before the user reaches the hero.

Visual:

- Black/deep-space screen
- Tiny loading orbit
- Cute cat mascot appears as a hologram
- Spaceship cockpit HUD starts up
- Text fragments scan in

Content shown:

```txt
Initializing voyage...
Pilot profile detected
Low Chee Fei
Software Developer
```

Animation:

- Cat mascot wakes up or taps a console
- Orbiting loading dots become small moons
- HUD lines draw in
- Final flash transitions into hero

Implementation:

- Current `Preloader` can become this scene
- Use GSAP timeline
- Use mascot idle/wave pose
- Hide once hero intro begins

## Act 1: Hero - Launch Sequence

Section:

```txt
Hero
```

Story:

The visitor enters the cockpit. The cat pilot starts the spaceship and introduces Low Chee Fei as the mission commander.

Visual:

- Spaceship cockpit or floating spaceship in front of starfield
- Cat mascot inside or beside the cockpit
- Hero text appears as mission identity data
- Background stars slowly move
- Cyber planet visible far away

Assets:

```txt
/assets/world/mascot/cyber-cat-mascot-cutout.png
/assets/world/hero/portfolio-spaceship-cutout.png
/assets/world/transitions/wormhole-transition-cutout.png
```

Movie script:

```txt
EXT. DIGITAL SPACE - HERO ORBIT

The camera opens on a quiet starfield.
The portfolio spaceship floats near the lower-right side of the viewport.
The cat mascot waves from a holographic cockpit bubble.
The engine glow pulses once, then settles into idle.

In front of the ship, holographic typography assembles:
LOW CHEE FEI.
The letters appear as if they are being projected from the ship.
```

Content mapping:

```txt
Low Chee Fei
Software Developer
Bridging Mobile Innovation with Enterprise Solutions
```

Supporting copy:

```txt
Computer Science graduate from Swinburne University, Class of 2025.
Focused on mobile applications, user-centric design, and enterprise systems.
```

Buttons:

```txt
Launch Tour
Download CV
GitHub
LinkedIn
```

Animation beats:

1. Spaceship engine glows.
2. Cat pilot waves or salutes.
3. Name appears with split-text reveal.
4. Title appears as a holographic badge.
5. CTA buttons slide in like cockpit controls.
6. On scroll, the ship accelerates forward.
7. Hero content zooms back and fades into starfield.

Asset choreography:

| Scroll Progress | Asset | Action |
| --- | --- | --- |
| 0% | Mascot | Hologram fades in, small wave loop |
| 0-20% | Spaceship | Drifts gently on x/y, thruster pulses |
| 20-45% | Hero text | Name reveals by chars, title clips upward |
| 45-70% | Buttons | Slide up like cockpit controls |
| 70-100% | Spaceship + text | Camera pushes forward, ship accelerates, text scales down and fades |

Exit shot:

```txt
The spaceship crosses the center of the screen.
The wormhole asset appears ahead as a small glowing ring.
The ring expands until it fills the viewport.
Cut to the Origin World.
```

Scroll transition to next act:

- Stars stretch into short warp lines
- Cockpit HUD collapses into a small navigation pill
- The ship approaches the "Origin World"

## Act 2: About - Origin World Dossier

Section:

```txt
About
```

Story:

The spaceship reaches the Origin World. The cat scans the planet and opens Low Chee Fei's identity dossier.

Visual:

- Large soft planet rotating in background
- Holographic ID card
- Avatar scan frame
- Dossier panel with personal bio
- Trait matrix as small glowing chips

Assets:

```txt
/assets/world/about/origin-planet-cutout.png
/assets/world/mascot/cyber-cat-mascot-cutout.png
/assets/world/hero/portfolio-spaceship-cutout.png
```

Movie script:

```txt
EXT. ORIGIN WORLD - LOW ORBIT

The wormhole collapses into a calm violet-blue planet.
The spaceship exits warp and slows near the planet.
The cat leans forward and activates a scanner.
A cyan scan beam sweeps across the planet and becomes the About section frame.

The dossier opens like a translucent glass panel.
```

Content mapping:

```txt
Name: Low Chee Fei
Class: Software Developer
Origin: Swinburne University of Technology, Class of 2025
Base: Petaling Jaya, Selangor
Directive: Make great code invisible - fluid, intuitive, reliable.
```

Bio display:

Use the current profile bio, but split it into scannable pieces:

```txt
Computer Science graduate specializing in Software Development.
Builds mobile applications and enterprise ERP solutions.
Connects user-centric design with robust backend systems.
Solves real-world inefficiencies through technology.
```

Trait matrix:

```txt
Problem Solving
Critical Thinking
Communication
Project Management
Time Management
Teamwork
Adaptability
```

Animation beats:

1. Planet rotates into view.
2. Cat pilot points scanner toward planet.
3. Scan beam passes over profile image.
4. Dossier frame clips open from left to right.
5. Dossier rows decrypt one by one.
6. Trait chips pop in like data fragments.
7. Small orbit rings form around the profile.

Asset choreography:

| Scroll Progress | Asset | Action |
| --- | --- | --- |
| 0-20% | Origin planet | Scales from 0.7 to 1, slow rotation/parallax |
| 10-30% | Spaceship | Enters from right, slows near planet |
| 25-45% | Mascot | Points scanner toward profile area |
| 35-60% | Dossier panel | Clip-left reveal |
| 50-80% | Bio rows | Decrypt line by line |
| 70-100% | Trait chips | Pop into orbit around dossier |

Content staging:

- Put `origin-planet-cutout.png` behind the dossier at low opacity.
- Keep the real profile/bio text in front.
- The asset supports the story; it should not compete with readability.

Scroll transition to next act:

- Dossier closes into a glowing data cube
- Data cube enters ship storage
- Ship receives a warning signal from the skill asteroid field

## Act 3: Skills - Meteor Break / Crystal Forge

Section:

```txt
Skills
```

Story:

The cat pilot enters an asteroid field. A huge meteor blocks the path. The ship cannot avoid it, so the cat fires a laser. The meteor breaks into smaller semi-transparent crystals. Each crystal contains one skill icon.

This is the main gameplay moment.

Visual:

- Pinned full-screen scene
- Spaceship on one side
- Giant meteor ahead
- Laser charging
- Meteor cracks
- Explosion becomes floating skill crystals
- Each crystal contains a tech icon
- Crystals orbit a forge core after breaking apart

Assets:

```txt
/assets/world/hero/portfolio-spaceship-cutout.png
/assets/world/mascot/cyber-cat-mascot-cutout.png
/assets/world/skills/skill-crystal-cutout.png
/assets/world/transitions/wormhole-transition-cutout.png
```

Additional generated/code assets needed:

```txt
Meteor: build with CSS/Three.js geometry or generate later as a cutout.
Laser beam: CSS/SVG/canvas, not image.
Explosion particles: canvas/DOM particles, not image.
Tech icons: existing Devicon classes from SKILLS.
```

Movie script:

```txt
EXT. ASTEROID FIELD - SKILL SECTOR

The ship exits warp too close to a giant meteor.
The HUD flashes: PATH BLOCKED.
The cat pilot grabs the controls.
The ship cannot dodge.

The cat charges a cyan laser.
The laser fires.
The meteor cracks.
The meteor breaks into many floating crystals.

Inside each crystal, a technology icon flickers online.
The scattered fragments organize into two orbit rings:
core skills inside, extended tools outside.
```

Skill crystals:

Inner ring / core skills:

```txt
HTML5 - Semantic structure under every web UI.
CSS3 - Responsive layouts, styling, and motion.
JavaScript - Interactivity across web projects.
Python - Backend logic, data, and ML glue.
Java - OOP foundation and Android roots.
C++ - Systems-level problem solving.
C# - OOP and .NET coursework.
SQL - Relational queries behind full-stack apps.
```

Outer ring / extended tools:

```txt
Figma - Wireframes and prototypes.
Tailwind CSS - Utility-first styling.
PostgreSQL - Relational data modeling.
Firebase - Realtime sync and auth for TrackPoint.
Kotlin - Primary Android language for TrackPoint.
Flutter - Cross-platform mobile UI.
Android - Native Android app development.
Git - Version control.
VS Code - Daily editor.
```

Scroll animation beats:

1. Ship enters asteroid field.
2. Warning HUD appears: "Path blocked."
3. Giant meteor slowly rotates toward camera.
4. Cat pilot panics for a moment, then locks target.
5. Laser charge ring builds around the ship.
6. On scroll progress, laser fires.
7. Meteor cracks from center outward.
8. Meteor bursts into skill crystals.
9. Crystals float into organized orbit rings.
10. Section title appears: "Dev Stack Recovered."

Asset choreography:

| Scroll Progress | Asset | Action |
| --- | --- | --- |
| 0-15% | Spaceship | Enters from bottom-left, shakes lightly |
| 10-25% | Meteor | Moves from distance to center, blocks route |
| 20-35% | Mascot | Switches from calm to alarmed; warning HUD appears |
| 35-50% | Laser | Charge ring grows around ship nose |
| 50-58% | Laser | Beam fires from ship to meteor |
| 58-70% | Meteor | Cracks, flashes, splits |
| 70-85% | Skill crystals | Many `skill-crystal-cutout.png` instances fly outward |
| 85-100% | Skill crystals | Crystals settle into orbit rings with icons inside |

Crystal layout:

```txt
Inner ring: HTML5, CSS3, JavaScript, Python, Java, C++, C#, SQL
Outer ring: Figma, Tailwind CSS, PostgreSQL, Firebase, Kotlin, Flutter, Android, Git, VS Code
```

Crystal click movie moment:

```txt
The selected crystal detaches from the orbit.
Camera zooms in.
The crystal rotates 180 degrees.
The tech icon glows through the glass.
A back-panel hologram appears with skill detail.
```

Crystal detail panel:

```txt
[Skill name]
[Category]
[Blurb]
Used in: [Project chips]
Level: [meter]
```

Click interaction:

When a user clicks a crystal:

1. Camera zooms into that crystal.
2. Crystal rotates to the back side.
3. Icon moves to front or glows from inside.
4. Back side shows:

```txt
Skill name
Category
Short description
Level indicator
Used in project chips
```

Example:

```txt
Kotlin
Mobile - Language
Primary Android language used to build TrackPoint.
Used in: TrackPoint
Level: 4 / 5
```

Return interaction:

- Click outside or close button
- Crystal rotates back
- Camera returns to orbit view

Mobile fallback:

- Use normal grid of crystal cards
- Each card flips on tap
- Keep meteor break as a short non-pinned animation

Scroll transition to next act:

- Crystals align into a star map
- Star map becomes a route line
- Ship follows the line to the mission archive

Exit shot:

```txt
The crystals stop orbiting and snap into constellation points.
Lines draw between them.
The constellation becomes a navigation route.
The ship follows the route into darkness.
```

## Act 4: Experience - Mission Record Archive

Section:

```txt
Experience
```

Story:

The ship docks beside an old satellite archive. The cat connects the ship to the archive and retrieves Low Chee Fei's mission records.

Visual:

- Satellite archive station
- Mission log terminal
- Vertical or orbital timeline path
- Records appear as encrypted flight logs
- Completed records glow blue/green
- Current/open status glows amber

Assets:

```txt
/assets/world/contact/satellite-relay-cutout.png
/assets/world/hero/portfolio-spaceship-cutout.png
/assets/world/mascot/cyber-cat-mascot-cutout.png
```

Movie script:

```txt
EXT. MISSION ARCHIVE SATELLITE - DEEP SPACE

The skill constellation route ends at an old relay-like archive.
The satellite relay floats in silence.
The spaceship docks beside it.
The cat connects a holographic cable.
The archive wakes up and projects Low Chee Fei's mission records.
```

Content mapping:

Record 001:

```txt
2022
Began the journey
Computer Science at Swinburne University
Foundation in software development
```

Record 002:

```txt
Jan - March 2023
Intern - ERP Consultant
ONE ERP SOLUTIONS SDN BHD
Contributed to Oracle JD Edwards ERP implementation lifecycle.
Skills: Oracle JDE, Database Management, Client Communication
```

Record 003:

```txt
2025 / Now
Open to new missions
Available for full-time roles and freelance work.
```

Animation beats:

1. Satellite archive fades in from darkness.
2. Ship docks with a magnetic lock.
3. Cat plugs in a cable or taps a console.
4. Timeline line draws downward.
5. Each mission record decrypts with scanlines.
6. Hovering a record lights the matching node in the timeline.
7. Active "Open to new missions" record pulses softly.

Asset choreography:

| Scroll Progress | Asset | Action |
| --- | --- | --- |
| 0-20% | Satellite relay | Fades in from darkness, rotates slowly |
| 15-35% | Spaceship | Approaches and docks beside satellite |
| 30-45% | Mascot | Taps console / connects archive |
| 40-60% | Timeline path | Draws from top to bottom |
| 50-85% | Mission records | Each record clips open and decrypts |
| 80-100% | Active record | Amber pulse indicates availability |

Content staging:

- Use the satellite relay as the archive visual here, even though it returns later as Contact relay.
- Differentiate it with color: Experience archive uses teal/blue; Contact relay uses cyan/amber.

Scroll transition to next act:

- Archive releases three coordinates
- Coordinates become project planets
- Ship jumps to the project galaxy

## Act 5: Projects - Project Worlds

Section:

```txt
Projects
```

Story:

The ship enters a galaxy of project worlds. Each planet is a real project. The visitor scrolls horizontally through the worlds and can open a dossier for each one.

Visual:

- Pinned horizontal section
- Project planets or portal frames
- Spaceship travels along a route line
- Each project has a holographic dossier panel
- Project screenshots are "surface scans"

Assets:

```txt
/assets/world/projects/project-portal-ring-cutout.png
/assets/world/hero/portfolio-spaceship-cutout.png
/assets/world/transitions/black-hole-portal-cutout.png
/assets/world/transitions/wormhole-transition-cutout.png
```

Movie script:

```txt
EXT. PROJECT GALAXY - HORIZONTAL ROUTE

The archive releases three glowing coordinates.
Each coordinate becomes a project portal ring.
The spaceship enters a horizontal flight path.
As the visitor scrolls, the ship moves from world to world.

Each portal opens enough to reveal a project screenshot as a scanned planet surface.
```

Project world 1:

```txt
TrackPoint
Sales Performance Tracker
Kotlin, Firebase, Android, Google Maps API
Awarded Best Project on Display at ICT Tradeshow 2025
```

Planet identity:

- Logistics planet
- GPS route lines around surface
- Delivery markers orbiting it
- Gold award ring around the planet

Dossier focus:

```txt
Modernized paper-based sales and logistics tracking for HuaChang Growmax.
Real-time GPS tracking.
Offline-capable mobile workflow.
Firebase realtime sync.
```

Project world 2:

```txt
Cinemate
Movie Recommendation System
Python, Django, JavaScript, TMDB API, NLP
Grade A for technical complexity and user experience
```

Planet identity:

- Cinema planet
- Floating film strips
- Sentiment particles
- Recommendation constellation

Dossier focus:

```txt
Movie recommendations based on emotional tone and sentiment analysis.
TMDB metadata.
NLP review analysis.
Cold-start onboarding quiz.
```

Project world 3:

```txt
Splash Aquatics
Online Aquarium Store
Python, Flask, JavaScript, CSS, MySQL
Distinction grade from Managing Software Project
```

Planet identity:

- Aquatic planet
- Bubble rings
- Fish-tank builder hologram
- Compatibility check nodes

Dossier focus:

```txt
E-commerce platform for aquarium enthusiasts.
Fish tank builder.
Compatibility recommendations.
Inventory and delivery workflow improvements.
```

Scroll animation beats:

1. Project galaxy title appears.
2. Ship enters horizontal route.
3. Each project planet approaches as user scrolls.
4. Planet rotates while its dossier panel clips open.
5. Screenshot scan slides across the project image.
6. Tags appear as orbiting chips.
7. Award/grade badge pulses when visible.
8. Outro panel says "Project route complete."

Asset choreography:

| Scroll Progress | Asset | Action |
| --- | --- | --- |
| 0-15% | Project portal rings | Three rings appear as distant coordinates |
| 15-30% | Spaceship | Enters route line |
| 30-55% | TrackPoint portal | Ring expands, screenshot scan reveals, award badge pulses |
| 55-75% | Cinemate portal | Ring rotates, sentiment particles drift, Grade A badge appears |
| 75-90% | Splash Aquatics portal | Ring opens with bubble-like scan, Distinction badge appears |
| 90-100% | Route line | Points toward Contact relay |

Project card composition:

```txt
Layer 1: project screenshot
Layer 2: project-portal-ring-cutout.png
Layer 3: scanline overlay
Layer 4: title / tags / achievement
```

Click interaction:

When clicking a project:

1. Portal ring expands.
2. Camera moves through planet atmosphere.
3. Modal opens as a project command center.
4. Screenshots appear as gallery panels.
5. Challenges and solutions display as mission reports.

Project click movie moment:

```txt
The project portal ring spins up.
The black-hole portal appears in the center.
The screenshot stretches inward as if pulled by gravity.
The modal opens after the portal fills the screen.
```

Project modal content structure:

```txt
Overview
Challenge
Solution
Tech Stack
Screenshots
Achievements
```

Modal close:

- Black-hole pull or reverse portal
- Return to project route

Modal asset use:

```txt
Open: black-hole-portal-cutout.png scales from 0.2 to 2.2 and fades in.
Modal content appears after the center goes dark.
Close: black-hole reverses, then project route returns.
```

Mobile fallback:

- Vertical planet cards
- Tap opens same modal
- Keep scan overlay and badge animation

Scroll transition to next act:

- Project route line leads to a distant relay station
- Ship leaves project galaxy
- Cat receives signal: "Contact channel available"

## Act 6: Contact - Relay Console

Section:

```txt
Contact
```

Story:

The voyage ends at a communication relay station. The cat opens the final channel so visitors can send a signal to Low Chee Fei.

Visual:

- Satellite dish / relay station
- Holographic form console
- Signal rings
- Cat mascot at communication controls
- Message beam points into space

Assets:

```txt
/assets/world/contact/satellite-relay-cutout.png
/assets/world/mascot/cyber-cat-mascot-cutout.png
/assets/world/hero/portfolio-spaceship-cutout.png
```

Movie script:

```txt
EXT. FINAL RELAY STATION - EDGE OF GALAXY

The spaceship arrives at a brighter communication relay.
The cat hops onto the console.
The satellite dish rotates toward the visitor.
The contact form appears as a transmission panel.
```

Content mapping:

```txt
Email: horuslow0218@gmail.com
Base: Petaling Jaya, Selangor
Status: Available
```

Form fields:

```txt
Name
Email
Message
Initiate Transmission
```

Animation beats:

1. Relay station rotates into view.
2. Cat mascot lands the ship.
3. Form console boots up.
4. Input fields appear one by one.
5. Signal rings pulse behind submit button.
6. On submit, satellite dish rotates.
7. Beam fires into the sky.
8. Cat celebrates or gives thumbs up.

Asset choreography:

| Scroll Progress | Asset | Action |
| --- | --- | --- |
| 0-20% | Satellite relay | Enters from right, rotates toward center |
| 15-35% | Spaceship | Parks near relay, thruster fades down |
| 25-45% | Mascot | Moves/appears near console |
| 35-65% | Form console | Fields clip open one by one |
| 55-80% | Signal rings | Pulse behind submit area |
| Submit | Satellite relay | Dish rotates and fires signal beam |
| Submit | Mascot | Celebrates / success pose |

Content staging:

- Keep the relay asset to one side of the form on desktop.
- On mobile, place it above the form as a small animated header visual.

Success state:

```txt
Signal sent.
Transmission channel remains open.
```

Scroll ending:

- Ship flies away into starfield
- Final footer appears softly
- Small cat mascot waves goodbye

## Final End Scene

Purpose:

Give closure instead of abruptly ending after the form.

Visual:

- Small spaceship moving into the distance
- Starfield settles
- Cat mascot hologram waves
- Footer text appears

Assets:

```txt
/assets/world/hero/portfolio-spaceship-cutout.png
/assets/world/mascot/cyber-cat-mascot-cutout.png
```

Movie script:

```txt
EXT. QUIET STARFIELD - VOYAGE COMPLETE

The relay beam fades into a thin star trail.
The spaceship slowly flies away from the camera.
The cat mascot appears as a small hologram and waves goodbye.
The final footer settles into place.
```

Final copy:

```txt
Voyage complete.
Thanks for exploring Low Chee Fei's developer universe.
```

Footer:

```txt
Low Chee Fei
React and three.js portfolio
GitHub
LinkedIn
Email
```

Asset choreography:

| Moment | Asset | Action |
| --- | --- | --- |
| After Contact | Spaceship | Moves toward horizon, scales down |
| After Contact | Mascot | Small wave loop, then fades |
| Footer reveal | Text | Soft fade / clip-up, no heavy motion |

## Section-To-Section Transition Map

```txt
Boot -> Hero
System startup flash

Hero -> About
Use wormhole-transition-cutout.png.
Small ring ahead of ship grows full-screen, then collapses into Origin World.

About -> Skills
Dossier data cube becomes asteroid warning marker.
No generated asset required; use CSS/Three.js particles.

Skills -> Experience
Use skill-crystal-cutout.png instances.
Crystals align into star map route.

Experience -> Projects
Use satellite-relay-cutout.png.
Mission archive releases three project coordinates.

Projects -> Contact
Use project-portal-ring-cutout.png and wormhole-transition-cutout.png.
Project route becomes relay signal path.

Contact -> End
Signal beam becomes final star trail
```

## Complete Asset Cue Sheet

| Scene | Asset | Enter | Main Action | Exit |
| --- | --- | --- | --- | --- |
| Boot | Cat mascot | Hologram fade-in | Taps console | Flash into Hero |
| Hero | Spaceship | Drifts in from bottom/right | Thruster idle, then launch | Enters wormhole |
| Hero | Cat mascot | Appears in cockpit / beside ship | Wave / pilot pose | Shrinks with ship |
| Hero -> About | Wormhole | Starts small ahead of ship | Expands to full-screen | Collapses into planet |
| About | Origin planet | Scales up behind content | Slow parallax rotation | Fades behind data cube |
| About | Cat mascot | Appears as scanner operator | Points scanner | Returns to ship |
| Skills | Spaceship | Exits warp | Shakes, aims laser | Moves behind skill orbit |
| Skills | Skill crystal | Bursts from meteor | Orbits with tech icons | Aligns into star route |
| Experience | Satellite relay | Fades in from darkness | Archive wakes up | Releases coordinates |
| Projects | Project portal ring | Appears as coordinate | Frames screenshot/project world | Expands on click |
| Project modal | Black-hole portal | Opens from portal center | Pulls user into modal | Reverses on close |
| Projects -> Contact | Wormhole | Opens at route end | Short warp jump | Reveals relay |
| Contact | Satellite relay | Rotates into view | Signal rings pulse | Fires beam on submit |
| Contact | Cat mascot | Appears at console | Operates relay / celebrates | Waves in ending |
| End | Spaceship | Leaves relay | Flies into distance | Fades into starfield |

## Mascot State Map

```txt
Boot: waking up / tapping console
Hero: waving / piloting
About: scanning profile
Skills: alarmed -> aiming -> firing laser -> celebrating
Experience: reading archive logs
Projects: navigating project planets
Contact: operating relay console
End: waving goodbye
```

## Main Interaction Map

Skill crystal:

```txt
Click -> zoom in -> rotate to back -> show skill details
```

Project planet:

```txt
Click -> portal open -> project modal -> screenshot gallery
```

Mission record:

```txt
Hover -> timeline node glows -> background beacon activates
```

Contact submit:

```txt
Submit -> relay beam fires -> mascot celebrates
```

Navigation:

```txt
Section indicator behaves like a mini star map
Current section planet glows
Scroll progress draws the route line
```

## Recommended Information Display

Keep content readable and short in the main scroll. Use modals or flips for deeper details.

Main scroll:

- Name
- Title
- Short bio
- Skill names and blurbs
- Experience summary
- Project title, tags, achievement
- Contact details

On click / expand:

- Full project overview
- Challenges
- Solutions
- Tech stack details
- Screenshot gallery
- Skill usage in projects

## Technical Implementation Notes

Use existing stack:

- React
- TypeScript
- GSAP
- ScrollTrigger
- Lenis
- Three.js / React Three Fiber

Suggested scene components:

```txt
src/components/story/
  StoryShell.tsx
  MascotPilot.tsx
  StoryHUD.tsx
  SectionPortalTransition.tsx

src/components/story/skills/
  SkillMeteorScene.tsx
  SkillCrystal.tsx
  SkillCrystalDetail.tsx

src/components/story/projects/
  ProjectPlanetRoute.tsx
  ProjectPlanet.tsx
  ProjectPortalModal.tsx

src/components/story/contact/
  RelayConsole.tsx
  SignalBeam.tsx
```

Suggested data model:

```ts
type StoryAct = {
  id: string;
  label: string;
  mascotState: string;
  tint: string;
  transitionIn: string;
  transitionOut: string;
};
```

## Build Priority

Phase 1:

- Rewrite section animation choreography
- Add animated headings
- Add section transitions
- Add mascot as static or simple animated image

Phase 2:

- Build Skills meteor break scene
- Add skill crystal click/flip interaction
- Improve Projects as planet route

Phase 3:

- Add spaceship and mascot 3D/2D animation
- Add Contact relay beam
- Add final end scene

Phase 4:

- Add polish: soundless HUD feedback, particles, scanlines, better route progress

## Quality Rule

Every animation must either:

- reveal important information,
- explain the journey,
- give feedback to interaction,
- or transition between acts.

If it does none of those, remove it.
