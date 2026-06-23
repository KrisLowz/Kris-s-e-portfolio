# Generated World Assets

This file tracks the starter visual assets generated for the cosmic cyberpunk portfolio storyline.

## Asset Pack

| Asset | Path | Intended Use |
| --- | --- | --- |
| Cyber cat mascot | `/assets/world/mascot/cyber-cat-mascot.png` | Hero guide, preloader, contact success, story companion |
| Cyber cat mascot cutout | `/assets/world/mascot/cyber-cat-mascot-cutout.png` | Transparent mascot sprite for layering over scenes |
| Cyber cat turnaround cutout | `/assets/world/mascot/cyber-cat-turnaround-cutout.png` | Transparent four-view character sheet for modeling, rigging, and animation reference |
| Portfolio spaceship | `/assets/world/hero/portfolio-spaceship.png` | Hero launch scene, scroll route, section transitions |
| Portfolio spaceship cutout | `/assets/world/hero/portfolio-spaceship-cutout.png` | Transparent spaceship sprite for parallax / travel animation |
| Origin planet | `/assets/world/about/origin-planet.png` | About / Origin World background |
| Origin planet cutout | `/assets/world/about/origin-planet-cutout.png` | Transparent planet asset for parallax placement |
| Skill crystal | `/assets/world/skills/skill-crystal.png` | Skills meteor fragments, clickable skill nodes |
| Skill crystal cutout | `/assets/world/skills/skill-crystal-cutout.png` | Transparent reusable skill crystal sprite |
| Project portal ring | `/assets/world/projects/project-portal-ring.png` | Project world cards, modal entry transition |
| Project portal ring cutout | `/assets/world/projects/project-portal-ring-cutout.png` | Transparent portal ring for project screenshots / planets |
| Satellite relay | `/assets/world/contact/satellite-relay.png` | Contact relay console scene |
| Satellite relay cutout | `/assets/world/contact/satellite-relay-cutout.png` | Transparent relay sprite for Contact |
| Wormhole transition | `/assets/world/transitions/wormhole-transition.png` | Section-to-section warp transition |
| Wormhole transition cutout | `/assets/world/transitions/wormhole-transition-cutout.png` | Transparent wormhole overlay / transition layer |
| Black-hole portal | `/assets/world/transitions/black-hole-portal.png` | Project modal open/close transition |
| Black-hole portal cutout | `/assets/world/transitions/black-hole-portal-cutout.png` | Transparent modal portal transition layer |

## Recommended First Integration

Start with these because they fit existing sections directly:

1. Add `origin-planet.png` as a low-opacity parallax asset in the About section.
2. Add `skill-crystal.png` as the base visual for each skill node.
3. Add `project-portal-ring.png` around project screenshots.
4. Add `satellite-relay.png` beside the Contact form.
5. Use `portfolio-spaceship.png` and `cyber-cat-mascot.png` in the Hero launch scene.

## Section And Scenario Usage

Use the `*-cutout.png` versions for animated layered scenes.

### Preloader / Boot

Asset:

```txt
/assets/world/mascot/cyber-cat-mascot-cutout.png
/assets/world/mascot/cyber-cat-turnaround-cutout.png
```

What happens:

- Mascot appears as a hologram.
- Mascot taps a tiny console.
- Loading orbit spins around the mascot.
- Text reveals: `Initializing voyage`, `Pilot profile detected`, `Low Chee Fei`.
- Scene exits with a cyan-white flash into Hero.
- Use `cyber-cat-turnaround-cutout.png` as a design/modeling reference, not as the main animated in-page sprite.

### Hero / Launch Sequence

Assets:

```txt
/assets/world/hero/portfolio-spaceship-cutout.png
/assets/world/mascot/cyber-cat-mascot-cutout.png
/assets/world/transitions/wormhole-transition-cutout.png
```

What happens:

- Spaceship drifts in front of the starfield.
- Mascot waves as the pilot.
- Low Chee Fei's name and title appear as holographic mission data.
- CTA buttons appear like cockpit controls.
- On scroll, the ship accelerates.
- Wormhole opens ahead of the ship and fills the viewport.

### About / Origin World

Assets:

```txt
/assets/world/about/origin-planet-cutout.png
/assets/world/hero/portfolio-spaceship-cutout.png
/assets/world/mascot/cyber-cat-mascot-cutout.png
```

What happens:

- Wormhole collapses into the Origin World planet.
- Spaceship slows near the planet.
- Mascot activates a scan beam.
- Profile image and dossier panels reveal with clip/scanning transitions.
- Bio rows decrypt one by one.
- Trait chips pop in around the dossier.

### Skills / Meteor Break

Assets:

```txt
/assets/world/hero/portfolio-spaceship-cutout.png
/assets/world/mascot/cyber-cat-mascot-cutout.png
/assets/world/skills/skill-crystal-cutout.png
```

What happens:

- Ship enters an asteroid field.
- A large meteor blocks the route.
- Mascot reacts, then charges a laser.
- Laser breaks meteor into many skill crystals.
- Each crystal uses `skill-crystal-cutout.png` with a Devicon layered inside.
- Crystals orbit in inner and outer rings.
- Clicking a crystal zooms in, flips it, and shows the skill name, category, blurb, level, and used-in project chips.

### Experience / Mission Archive

Assets:

```txt
/assets/world/contact/satellite-relay-cutout.png
/assets/world/hero/portfolio-spaceship-cutout.png
/assets/world/mascot/cyber-cat-mascot-cutout.png
```

What happens:

- Skill crystals align into a star route.
- Route leads to a satellite archive.
- Spaceship docks beside the satellite.
- Mascot connects to the archive.
- Mission records decrypt as timeline logs.
- Hovering a record lights a node or beacon.
- The active/open mission pulses amber.

### Projects / Project Worlds

Assets:

```txt
/assets/world/projects/project-portal-ring-cutout.png
/assets/world/hero/portfolio-spaceship-cutout.png
/assets/world/transitions/black-hole-portal-cutout.png
```

What happens:

- Archive releases three coordinates.
- Each coordinate becomes a project portal ring.
- Horizontal scroll moves the ship from project to project.
- Portal ring frames each project screenshot.
- Tags appear as orbiting chips.
- Award/grade badges pulse when visible.
- Clicking a portal expands the ring and triggers the black-hole portal transition into the project modal.
- Closing the modal reverses the portal pull.

### Contact / Relay Console

Assets:

```txt
/assets/world/contact/satellite-relay-cutout.png
/assets/world/mascot/cyber-cat-mascot-cutout.png
/assets/world/hero/portfolio-spaceship-cutout.png
```

What happens:

- Ship arrives at the final relay station.
- Satellite dish rotates toward the visitor.
- Mascot operates the communication console.
- Contact form fields boot up one by one.
- Signal rings pulse behind the submit button.
- Submit rotates the relay dish and fires a signal beam.
- Mascot celebrates after successful transmission.

### Ending / Voyage Complete

Assets:

```txt
/assets/world/hero/portfolio-spaceship-cutout.png
/assets/world/mascot/cyber-cat-mascot-cutout.png
```

What happens:

- Signal beam fades into a star trail.
- Spaceship flies away into the distance.
- Mascot appears as a small hologram and waves goodbye.
- Footer appears with GitHub, LinkedIn, and email links.

## Asset-To-Section Matrix

| Asset | Boot | Hero | About | Skills | Experience | Projects | Contact | End |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `cyber-cat-mascot-cutout.png` | Yes | Yes | Yes | Yes | Yes | Optional | Yes | Yes |
| `cyber-cat-turnaround-cutout.png` | Reference | Reference | Reference | Reference | Reference | Reference | Reference | Reference |
| `portfolio-spaceship-cutout.png` | Optional | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| `origin-planet-cutout.png` | No | Background hint | Yes | No | No | No | No | No |
| `skill-crystal-cutout.png` | No | No | No | Yes | Transition route | No | No | No |
| `project-portal-ring-cutout.png` | No | No | No | No | Coordinate hint | Yes | No | No |
| `satellite-relay-cutout.png` | No | No | No | No | Yes | No | Yes | No |
| `wormhole-transition-cutout.png` | No | Exit | Entry | Optional | Optional | Exit | No | No |
| `black-hole-portal-cutout.png` | No | No | No | No | No | Modal transition | No | No |

## Notes

- The `*-cutout.png` files are transparent alpha PNGs generated from chroma-key sources.
- The original non-cutout files keep their dark space-style backgrounds and can still be useful as concept previews or background cards.
- The cutouts were validated with transparent corners and alpha channels.
- Glow-heavy assets such as the wormhole and black-hole portal intentionally keep partial alpha pixels around their energy edges.
