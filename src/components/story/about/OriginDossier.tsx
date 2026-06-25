import AnimatedSectionHeading from '../AnimatedSectionHeading';
import { ABOUT } from '../../../content';
import { WORLD_ASSETS } from '../../../story/worldAssets';
import ScanBeam from './ScanBeam';

export default function OriginDossier() {
  return (
    <section id="about" className="relative overflow-hidden px-6 py-28 md:px-16">
      <ScanBeam />
      <img src={WORLD_ASSETS.originPlanet} alt="" aria-hidden data-speed="0.85"
        className="pointer-events-none absolute -right-20 top-10 w-[28rem] opacity-25" />
      <div className="relative z-10 mx-auto max-w-4xl">
        <AnimatedSectionHeading eyebrow="01 · Origin World" title="Identity dossier" meta="Scanned profile" />
        <dl data-stagger="0.06" className="mt-10 grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {ABOUT.packet.map((f) => (
            <div data-anim="clip-left" key={f.label} className="border-b border-pop-border pb-2">
              <dt className="font-mono text-[10px] uppercase tracking-widest text-pop-text-muted">{f.label}</dt>
              <dd className="text-pop-text-main">{f.value}</dd>
            </div>
          ))}
        </dl>
        <p data-anim="lines" className="mt-8 max-w-2xl text-lg text-pop-text-main">{ABOUT.statement}</p>
        <ul data-stagger="0.05" className="mt-8 flex flex-wrap gap-2">
          {ABOUT.traits.map((t) => (
            <li data-anim="pop" key={t} className="rounded-full border border-pop-border px-3 py-1 font-mono text-xs text-pop-text-muted">{t}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
