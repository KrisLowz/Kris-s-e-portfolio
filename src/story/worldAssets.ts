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

export type WorldAssetKey = keyof typeof WORLD_ASSETS;
