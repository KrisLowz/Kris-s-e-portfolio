import { useState, useCallback } from 'react';
import AnimatedSectionHeading from '../AnimatedSectionHeading';
import { SKILLS } from '../../../content';
import { Skill } from '../../../types';
import CrystalButton from './CrystalButton';
import ForgeHoloPanel from './ForgeHoloPanel';

/** The Skills act. Renders an interactive crystal grid; clicking a crystal
 *  opens its focused holo panel. (The cinematic meteor stage is added in the
 *  next task; this grid is the universal fallback + baseline.) */
export default function Forge() {
  const [focused, setFocused] = useState<Skill | null>(null);
  const close = useCallback(() => setFocused(null), []);
  const inner = SKILLS.filter((s) => s.ring === 'inner');
  const outer = SKILLS.filter((s) => s.ring === 'outer');

  return (
    <section id="skills" className="relative px-6 py-28 md:px-16">
      <div className="mx-auto max-w-5xl">
        <AnimatedSectionHeading eyebrow="02 · The Forge" title="Dev stack recovered" meta={`${SKILLS.length} elements`} align="center" />
        <p data-anim="fade-up" className="mt-8 font-mono text-xs uppercase tracking-widest text-pop-primary">Core</p>
        <div data-stagger="0.05" className="mt-3 grid grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-8">
          {inner.map((s) => <div data-anim="pop" key={s.id}><CrystalButton skill={s} onActivate={setFocused} /></div>)}
        </div>
        <p data-anim="fade-up" className="mt-10 font-mono text-xs uppercase tracking-widest text-pop-secondary">Extended</p>
        <div data-stagger="0.05" className="mt-3 grid grid-cols-3 gap-6 sm:grid-cols-5 md:grid-cols-9">
          {outer.map((s) => <div data-anim="pop" key={s.id}><CrystalButton skill={s} onActivate={setFocused} /></div>)}
        </div>
      </div>
      {focused && <ForgeHoloPanel skill={focused} onClose={close} />}
    </section>
  );
}
