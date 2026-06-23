export interface SkillCategory {
  title: string;
  skills: string[];
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
