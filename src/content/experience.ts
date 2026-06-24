import { ExperienceItem } from '../types';

export const EXPERIENCE: ExperienceItem[] = [
  {
    id: 'one-erp',
    role: 'Intern - ERP Consultant',
    company: 'ONE ERP SOLUTIONS SDN BHD',
    period: 'Jan - March 2023',
    description: 'Contributed to the implementation lifecycle of Oracle JD Edwards (JDE) ERP systems.',
    skills: ['Oracle JDE', 'Database Management', 'Client Communication'],
  },
];

/** Experience rendered as a flight log: origin → real roles → open-to-work. */
export const MISSION_RECORDS: ExperienceItem[] = [
  {
    id: 'origin-2022',
    role: 'Began the journey',
    company: 'Swinburne University of Technology',
    period: '2022',
    description: 'Started Computer Science — foundation in software development.',
    skills: [],
  },
  ...EXPERIENCE,
  {
    id: 'open-to-work',
    role: 'Open to new missions',
    company: 'Available now',
    period: '2025 / Now',
    description: 'Available for full-time roles and freelance work.',
    skills: [],
  },
];
