import React from 'react';
import { PROFILE } from '../constants';
import { Mail, MapPin, Send, Radio } from 'lucide-react';
import MagneticButton from './MagneticButton';

/**
 * Contact as a "transmission console" — frameless luminous contact nodes and a
 * glowing signal form. No solid card; everything floats in the cosmos.
 */
const Contact: React.FC = () => {
  return (
    <footer id="contact" className="relative overflow-hidden pb-12 pt-28">
      <div className="mx-auto max-w-5xl px-6">
        <div className="const-heading relative z-10 mb-14 text-center">
          <p
            data-anim="pop"
            data-scramble
            className="mb-3 text-[11px] font-bold uppercase tracking-[0.35em] text-pop-primary/80"
          >
            Transmission
          </p>
          <h2 data-anim="words" className="const-title text-4xl font-extrabold text-pop-text-main md:text-5xl">
            Send a Signal
          </h2>
          <p data-anim="fade-up" className="mt-3 text-sm text-pop-text-muted/80">
            Open for full-time roles &amp; freelance missions.
          </p>
        </div>

        <div className="grid items-start gap-12 md:grid-cols-2">
          <div data-anim="fade-up" className="space-y-6">
            <a href={`mailto:${PROFILE.email}`} className="contact-node group">
              <span className="contact-icon">
                <Mail className="h-5 w-5" />
              </span>
              <span>
                <span className="contact-label">Email</span>
                <span className="contact-value">{PROFILE.email}</span>
              </span>
            </a>
            <div className="contact-node">
              <span className="contact-icon">
                <MapPin className="h-5 w-5" />
              </span>
              <span>
                <span className="contact-label">Based in</span>
                <span className="contact-value">Petaling Jaya, Selangor</span>
              </span>
            </div>
            <div className="contact-node">
              <span className="contact-icon online">
                <Radio className="h-5 w-5" />
              </span>
              <span>
                <span className="contact-label">Status</span>
                <span className="contact-value">Available · 2025</span>
              </span>
            </div>
          </div>

          <form
            data-anim="fade-up"
            data-delay="0.15"
            className="console"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="console-field">
              <label htmlFor="c-name">Name</label>
              <input id="c-name" name="name" type="text" autoComplete="name" placeholder="Your name" />
            </div>
            <div className="console-field">
              <label htmlFor="c-email">Email</label>
              <input
                id="c-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
              />
            </div>
            <div className="console-field">
              <label htmlFor="c-msg">Message</label>
              <textarea id="c-msg" name="message" rows={3} placeholder="Tell me about your mission..." />
            </div>
            <MagneticButton className="transmit-btn btn-shine">
              Transmit <Send className="h-4 w-4" />
            </MagneticButton>
          </form>
        </div>

        <div data-anim="fade-up" className="mt-20 text-center text-xs text-pop-text-muted/60">
          <p>© 2025 Low Chee Fei · Charted with ♥ in React &amp; three.js</p>
        </div>
      </div>
    </footer>
  );
};

export default Contact;
