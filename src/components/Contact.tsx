import React, { useState } from 'react';
import { PROFILE } from '../constants';
import { Mail, Github, Linkedin, Download, Send, Radio, ArrowUpRight } from 'lucide-react';

/* ============================================================================
   Contact — "The Relay". The final stop of the space journey: the comms
   satellite relay where the traveller opens a channel home. Themed-but-calm
   (CSS starfield + floating satellite + signal pulse, NO WebGL). A glass
   "console" holds direct links + a CV download (left) and a working contact
   form (right) wired to Web3Forms (no backend). See design-system/pages/contact.md.
   ============================================================================ */

// ⚠️ Paste your free Web3Forms access key here (get one in ~2 min at https://web3forms.com — enter your email,
// they mail you a key). Until then the form UI works but submissions won't send (it falls back to an email link).
const WEB3FORMS_KEY = 'YOUR_WEB3FORMS_ACCESS_KEY';

type Status = 'idle' | 'sending' | 'success' | 'error';

const inputCls =
  'w-full rounded-xl border border-white/12 bg-[#070512]/70 px-4 py-3 text-[#F5F3FF] placeholder:text-[#6f6a85] outline-none transition-colors focus:border-[#22D3EE]/60 focus:ring-2 focus:ring-[#22D3EE]/25';

const ContactRow: React.FC<{ href: string; icon: React.ReactNode; label: string; sub: string; external?: boolean }> = ({
  href,
  icon,
  label,
  sub,
  external,
}) => (
  <a
    href={href}
    {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
    className="group flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 transition-colors hover:border-[#22D3EE]/40 hover:bg-white/[0.06]"
  >
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#22D3EE]/12 text-[#22D3EE]">{icon}</span>
    <span className="min-w-0">
      <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#8b86a6]">{sub}</span>
      <span className="block truncate text-sm font-semibold text-[#e9e6f6]">{label}</span>
    </span>
    <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-[#6f6a85] transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#22D3EE]" />
  </a>
);

const Contact: React.FC = () => {
  const [status, setStatus] = useState<Status>('idle');

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (WEB3FORMS_KEY.startsWith('YOUR_')) {
      setStatus('error'); // key not configured yet → show the email fallback
      return;
    }
    setStatus('sending');
    const data = new FormData(form);
    data.append('access_key', WEB3FORMS_KEY);
    data.append('subject', 'New transmission from your portfolio');
    try {
      const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: data });
      const json = await res.json();
      if (json.success) {
        setStatus('success');
        form.reset();
      } else setStatus('error');
    } catch {
      setStatus('error');
    }
  };

  const backToLaunch = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer id="contact" aria-labelledby="contact-heading" className="relative overflow-hidden bg-[#05030f] pt-20 pb-8 sm:pt-28 sm:pb-10">
      {/* ---- calm space backdrop ---- */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_16%,#0e0b22_0%,#06051a_46%,#03020c_100%)]" />
      <div aria-hidden="true" className="about-starfield contact-twinkle pointer-events-none absolute inset-0 opacity-70" />
      {/* satellite relay, drifting, emitting signal pulses (desktop only — decorative) */}
      <div className="pointer-events-none absolute -top-6 right-[-6%] hidden w-[34vw] max-w-[440px] sm:block lg:right-[3vw]">
        <div className="contact-satellite relative">
          <span className="signal-ring absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#22D3EE]/40" />
          <span className="signal-ring delay absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#FF2BD6]/30" />
          <img
            src="/assets/world/contact/satellite-relay-cutout.png"
            alt=""
            aria-hidden="true"
            draggable={false}
            className="relative w-full select-none object-contain drop-shadow-[0_0_60px_rgba(34,211,238,0.22)]"
          />
        </div>
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        {/* ---- header (placeholder until the shared section-header style lands) ---- */}
        <p className="proj-reveal inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.28em] text-[#22D3EE]">
          <Radio className="h-4 w-4" /> Transmit // Contact
        </p>
        <h2 id="contact-heading" className="proj-reveal mt-3 max-w-3xl font-display text-5xl font-extrabold leading-[1.05] text-[#F5F3FF] sm:text-7xl">
          Open a channel
        </h2>
        <p className="proj-reveal mt-5 max-w-xl text-lg text-[#A8A3C2]">
          Got a project or a role in mind? Send a transmission — or hail me directly.
        </p>

        {/* ---- the comms console ---- */}
        <div className="reveal-dir from-bottom mt-14 grid overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)] backdrop-blur-xl md:grid-cols-2">
          {/* left — direct frequencies + CV */}
          <div className="flex flex-col gap-6 p-8 sm:p-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#22D3EE]/80">Direct frequencies</p>
              <p className="mt-2 text-[#cfcbe4]">Prefer to reach out yourself? Pick a channel.</p>
            </div>
            <div className="space-y-3">
              <ContactRow href={`mailto:${PROFILE.email}`} icon={<Mail className="h-4 w-4" />} sub="Email" label={PROFILE.email} />
              <ContactRow href={PROFILE.social.github} external icon={<Github className="h-4 w-4" />} sub="GitHub" label="KrisLowz" />
              <ContactRow href={PROFILE.social.linkedin} external icon={<Linkedin className="h-4 w-4" />} sub="LinkedIn" label="lowcheefei" />
            </div>
            <a
              href={PROFILE.cv}
              target="_blank"
              rel="noreferrer"
              className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#22D3EE] to-[#7C5CFF] px-6 py-3.5 text-sm font-bold text-[#05030f] transition-transform duration-300 hover:-translate-y-0.5"
            >
              <Download className="h-4 w-4" /> Download CV
            </a>
          </div>

          {/* right — the form */}
          <div className="border-t border-white/10 bg-[#0a0814]/50 p-8 sm:p-10 md:border-l md:border-t-0">
            {status === 'success' ? (
              <div role="status" aria-live="polite" className="flex h-full min-h-[300px] flex-col items-center justify-center text-center">
                <div className="text-5xl">📡</div>
                <p className="mt-4 font-display text-2xl font-extrabold text-[#F5F3FF]">Transmission received</p>
                <p className="mt-2 max-w-xs text-[#A8A3C2]">Thanks for reaching out — I&apos;ll get back to you soon.</p>
                <button onClick={() => setStatus('idle')} className="mt-6 text-sm font-bold text-[#22D3EE] hover:underline">
                  Send another →
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                {/* honeypot — bots tick it, Web3Forms rejects those */}
                <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
                <div>
                  <label htmlFor="c-name" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.16em] text-[#8b86a6]">Name</label>
                  <input id="c-name" name="name" type="text" required placeholder="Your name" className={inputCls} />
                </div>
                <div>
                  <label htmlFor="c-email" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.16em] text-[#8b86a6]">Email</label>
                  <input id="c-email" name="email" type="email" required placeholder="you@example.com" className={inputCls} />
                </div>
                <div>
                  <label htmlFor="c-msg" className="mb-1.5 block text-xs font-bold uppercase tracking-[0.16em] text-[#8b86a6]">Message</label>
                  <textarea id="c-msg" name="message" rows={4} required placeholder="Tell me about your project or role…" className={`${inputCls} resize-none`} />
                </div>
                {status === 'error' && (
                  <p role="alert" className="text-sm text-[#ff9b9b]">
                    Couldn&apos;t send right now — email me directly at{' '}
                    <a href={`mailto:${PROFILE.email}`} className="font-semibold text-[#22D3EE] underline">{PROFILE.email}</a>.
                  </p>
                )}
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#22D3EE]/50 bg-[#22D3EE]/12 px-6 py-3.5 text-sm font-bold text-[#dffaff] transition-colors hover:bg-[#22D3EE]/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === 'sending' ? (
                    'Transmitting…'
                  ) : (
                    <>
                      Send transmission <Send className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ---- footer ---- */}
        <div className="proj-reveal mt-12 flex flex-col items-center gap-5 border-t border-white/10 pt-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-sm text-[#7d7896]">© 2026 Low Chee Fei · Built with React + Three.js.</p>
          <div className="flex items-center gap-3">
            <a href={PROFILE.social.github} target="_blank" rel="noreferrer" aria-label="GitHub" className="grid h-9 w-9 place-items-center rounded-full border border-white/12 text-[#C3BFD6] transition-colors hover:border-[#22D3EE]/50 hover:text-white">
              <Github className="h-4 w-4" />
            </a>
            <a href={PROFILE.social.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="grid h-9 w-9 place-items-center rounded-full border border-white/12 text-[#C3BFD6] transition-colors hover:border-[#22D3EE]/50 hover:text-white">
              <Linkedin className="h-4 w-4" />
            </a>
            <button onClick={backToLaunch} className="ml-1 inline-flex items-center gap-1.5 rounded-full border border-white/12 px-4 py-2 text-xs font-bold text-[#C3BFD6] transition-colors hover:border-[#22D3EE]/50 hover:text-white">
              ↑ Back to launch
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Contact;
