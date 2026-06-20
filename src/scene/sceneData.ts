import * as THREE from 'three';
import { SKILLS } from '../constants';

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
