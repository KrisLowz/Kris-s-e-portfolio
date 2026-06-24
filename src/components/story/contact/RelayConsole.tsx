import { useState } from 'react';
import AnimatedSectionHeading from '../AnimatedSectionHeading';
import { PROFILE } from '../../../content';
import { WORLD_ASSETS } from '../../../story/worldAssets';

export default function RelayConsole() {
  const [sent, setSent] = useState(false);
  return (
    <section id="contact" className="relative overflow-hidden px-6 py-28 md:px-16">
      <img src={WORLD_ASSETS.satelliteRelay} alt="" aria-hidden data-float
        className="pointer-events-none absolute right-[6%] top-16 w-64 opacity-30" />
      <div className="relative z-10 mx-auto max-w-2xl">
        <AnimatedSectionHeading eyebrow="05 · Relay Console" title="Open a channel" meta={PROFILE.status} />
        <dl data-stagger="0.06" className="mt-6 grid gap-2 font-mono text-sm sm:grid-cols-3">
          <div data-anim="clip-left"><dt className="text-pop-text-muted">Email</dt><dd>{PROFILE.email}</dd></div>
          <div data-anim="clip-left"><dt className="text-pop-text-muted">Base</dt><dd>{PROFILE.location}</dd></div>
          <div data-anim="clip-left"><dt className="text-pop-text-muted">Status</dt><dd className="text-pop-teal">Available</dd></div>
        </dl>
        {sent ? (
          <p className="mt-8 rounded-lg border border-pop-primary/50 p-4 font-mono text-pop-primary">Signal sent. Transmission channel remains open.</p>
        ) : (
          <form data-stagger="0.06" className="mt-8 flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
            <input data-anim="clip-left" required placeholder="Name" className="rounded border border-pop-border bg-pop-surface px-3 py-2" />
            <input data-anim="clip-left" required type="email" placeholder="Email" className="rounded border border-pop-border bg-pop-surface px-3 py-2" />
            <textarea data-anim="clip-left" required placeholder="Message" rows={4} className="rounded border border-pop-border bg-pop-surface px-3 py-2" />
            <button data-anim="pop" type="submit" className="self-start rounded-full bg-pop-primary px-5 py-2 font-mono text-sm text-black">Initiate Transmission →</button>
          </form>
        )}
      </div>
    </section>
  );
}
