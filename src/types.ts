export interface SkillCategory {
  title: string;
  skills: string[];
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
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
