import * as THREE from 'three';
import { SKILLS, EXPERIENCE, PROJECTS } from '../constants';

/**
 * Pure mappings from portfolio data (constants.ts) to scene layout. Keeping the
 * geometry math here means the object components stay about rendering, not data.
 */

export interface SkillNodeData {
  id: string;
  name: string;
  position: THREE.Vector3;
}

/**
 * Lay the skills out as an even constellation on a (slightly flattened) sphere
 * around the core, using a deterministic fibonacci distribution so positions are
 * stable across reloads and map 1:1 to the DOM skill ids.
 */
export function buildSkillNodes(radius = 5): SkillNodeData[] {
  const n = SKILLS.length;
  const golden = Math.PI * (3 - Math.sqrt(5));
  return SKILLS.map((skill, i) => {
    const y = n > 1 ? 1 - (i / (n - 1)) * 2 : 0; // 1 → -1
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    return {
      id: skill.id,
      name: skill.name,
      position: new THREE.Vector3(
        Math.cos(theta) * r * radius,
        y * radius * 0.6, // flatten vertically toward a disc
        Math.sin(theta) * r * radius
      ),
    };
  });
}

export interface ExperienceNodeData {
  id: string;
  position: THREE.Vector3;
}

/**
 * Lay the career roles along a diagonal "flight path" in front of the core.
 * A single role reads as an intentional "you are here" marker; more roles
 * string out into a timeline the camera passes.
 */
export function buildExperienceNodes(): ExperienceNodeData[] {
  const n = EXPERIENCE.length;
  if (n === 1) {
    return [{ id: EXPERIENCE[0].id, position: new THREE.Vector3(2.6, 1.3, 1.4) }];
  }
  return EXPERIENCE.map((exp, i) => {
    const t = i / (n - 1);
    return { id: exp.id, position: new THREE.Vector3(-3 + t * 6, 2.6 - t * 5.2, 1.2) };
  });
}

export interface ProjectPanelData {
  id: string;
  image: string;
  position: THREE.Vector3;
}

/**
 * Arrange the projects as floating image panels in a WIDE arc, pushed back and
 * to the periphery so they read as ambient gallery depth behind the glass cards
 * rather than competing with them.
 */
export function buildProjectPanels(radius = 6.5): ProjectPanelData[] {
  const n = PROJECTS.length;
  const spread = 1.9; // total arc (radians) — wide, panels sit toward the sides
  return PROJECTS.map((p, i) => {
    const a = n > 1 ? -spread / 2 + (i / (n - 1)) * spread : 0;
    return {
      id: p.id,
      image: p.image,
      position: new THREE.Vector3(
        Math.sin(a) * radius,
        i % 2 === 0 ? 1.1 : -1.2,
        Math.cos(a) * radius - 3
      ),
    };
  });
}
