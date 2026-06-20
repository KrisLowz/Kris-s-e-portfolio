import React from 'react';
import { SKILLS } from '../constants';
import ConstellationCluster, { ConstNode } from './ConstellationCluster';

/**
 * Skills section in the Living Constellation language — the tech stack as a star
 * map, synced to the 3D skill-stars in the background scene.
 */
const SkillsConstellation: React.FC = () => {
  const nodes: ConstNode[] = SKILLS.map((s) => ({
    id: s.id,
    label: s.name,
    iconClass: s.iconClass,
  }));

  return (
    <section id="skills" data-tint="#a78bfa" className="relative overflow-hidden py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="const-heading relative z-10 mb-6 text-center">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.35em] text-pop-primary/80">
            The Constellation
          </p>
          <h2 className="const-title text-4xl font-extrabold text-pop-text-main md:text-5xl">
            Skills &amp; Stack
          </h2>
          <p className="mt-3 text-sm text-pop-text-muted/80">Hover a star to chart it</p>
        </div>
        <ConstellationCluster nodes={nodes} sync3d gradientId="skills-grad" />
      </div>
    </section>
  );
};

export default SkillsConstellation;
