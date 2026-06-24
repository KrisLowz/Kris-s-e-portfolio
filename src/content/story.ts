import { StoryAct } from '../types';

export const STORY_ACTS: StoryAct[] = [
  { id: 'boot',       label: 'Boot',       sectionId: '',           mascotState: 'sleep',     tint: '#00E5FF' },
  { id: 'hero',       label: 'Launch',     sectionId: 'hero',       mascotState: 'wave',      tint: '#00E5FF' },
  { id: 'about',      label: 'Origin',     sectionId: 'about',      mascotState: 'scan',      tint: '#A855F7' },
  { id: 'skills',     label: 'Forge',      sectionId: 'skills',     mascotState: 'aim',       tint: '#00E5FF' },
  { id: 'experience', label: 'Archive',    sectionId: 'experience', mascotState: 'archive',   tint: '#3BE8B0' },
  { id: 'projects',   label: 'Worlds',     sectionId: 'projects',   mascotState: 'pilot',     tint: '#FF4FD8' },
  { id: 'contact',    label: 'Relay',      sectionId: 'contact',    mascotState: 'relay',     tint: '#FFB347' },
  { id: 'end',        label: 'End',        sectionId: '',           mascotState: 'goodbye',   tint: '#00E5FF' },
];

/** The six acts that map to real on-page sections (drives the nav). */
export const SECTION_ACTS = STORY_ACTS.filter((a) => a.sectionId !== '');
