import AnimatedSectionHeading from '../AnimatedSectionHeading';
import { SKILLS } from '../../../content';
import { WORLD_ASSETS } from '../../../story/worldAssets';
import { Skill } from '../../../types';

function Crystal({ skill }: { skill: Skill }) {
  return (
    <div data-anim="pop" className="group relative grid place-items-center">
      <img src={WORLD_ASSETS.skillCrystal} alt="" aria-hidden className="w-20 opacity-90 transition group-hover:opacity-100" />
      <i className={`${skill.iconClass} absolute text-2xl`} aria-hidden />
      <span className="mt-1 font-mono text-[10px] text-pop-text-muted">{skill.name}</span>
    </div>
  );
}

export default function SkillField() {
  const inner = SKILLS.filter((s) => s.ring === 'inner');
  const outer = SKILLS.filter((s) => s.ring === 'outer');
  return (
    <section id="skills" className="relative px-6 py-28 md:px-16">
      <div className="mx-auto max-w-5xl">
        <AnimatedSectionHeading eyebrow="02 · The Forge" title="Dev stack recovered" meta={`${SKILLS.length} elements`} align="center" />
        <p data-anim="fade-up" className="mt-8 font-mono text-xs uppercase tracking-widest text-pop-primary">Core</p>
        <div data-stagger="0.05" className="mt-3 grid grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-8">
          {inner.map((s) => <Crystal key={s.id} skill={s} />)}
        </div>
        <p data-anim="fade-up" className="mt-10 font-mono text-xs uppercase tracking-widest text-pop-secondary">Extended</p>
        <div data-stagger="0.05" className="mt-3 grid grid-cols-3 gap-6 sm:grid-cols-5 md:grid-cols-9">
          {outer.map((s) => <Crystal key={s.id} skill={s} />)}
        </div>
      </div>
    </section>
  );
}
