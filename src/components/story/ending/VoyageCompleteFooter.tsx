import { PROFILE } from '../../../content';
import { WORLD_ASSETS } from '../../../story/worldAssets';

export default function VoyageCompleteFooter() {
  return (
    <footer className="relative overflow-hidden px-6 py-24 text-center md:px-16">
      <img src={WORLD_ASSETS.spaceship} alt="" aria-hidden data-speed="1.1" className="mx-auto w-24 opacity-40" />
      <p data-anim="words" className="mt-6 font-display text-2xl text-pop-text-main">Voyage complete.</p>
      <p data-anim="fade-up" className="mt-2 text-pop-text-muted">Thanks for exploring Low Chee Fei's developer universe.</p>
      <div data-stagger="0.06" className="mt-6 flex justify-center gap-4 font-mono text-sm">
        <a data-anim="pop" href={PROFILE.social.github} target="_blank" rel="noreferrer">GitHub</a>
        <a data-anim="pop" href={PROFILE.social.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
        <a data-anim="pop" href={`mailto:${PROFILE.email}`}>Email</a>
      </div>
    </footer>
  );
}
