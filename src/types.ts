export interface SkillCategory {
  title: string;
  skills: string[];
}

export interface AboutPacketField {
  label: string;
  value: string;
}

export interface Skill {
  id: string;
  name: string;
  iconClass: string;
  ring: 'inner' | 'outer';
  /** Short grouping shown on the holo panel, e.g. "Mobile · Language". */
  category: string;
  /** One-line human truth about the skill. */
  blurb: string;
  /** PROJECTS ids where this was used (may be empty). */
  usedIn: string[];
  /** Signal-strength 1–5 (honest, owner-reviewed). */
  level: 1 | 2 | 3 | 4 | 5;
}

export interface TechStackItem {
  category: string;
  tools: string[];
}

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  image: string;
  screenshots?: string[];
  achievements: string[];
  overview: string;
  challenges: string[];
  solutions: string[];
  techStackDetails: TechStackItem[];
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
  skills: string[];
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export type StoryActId =
  | 'boot' | 'hero' | 'about' | 'skills'
  | 'experience' | 'projects' | 'contact' | 'end';

export type MascotState =
  | 'sleep' | 'wave' | 'pilot' | 'scan' | 'alarm'
  | 'aim' | 'celebrate' | 'archive' | 'relay' | 'goodbye';

export interface StoryAct {
  id: StoryActId;
  /** Short label shown in the route-progress nav. */
  label: string;
  /** DOM id of the section element this act maps to (empty for boot/end). */
  sectionId: string;
  /** Mascot pose for this act. */
  mascotState: MascotState;
  /** Accent hue (hex) used for tinting this act. */
  tint: string;
}
