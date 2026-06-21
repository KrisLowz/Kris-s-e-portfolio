import React from 'react';
import { PROFILE } from '../constants';
import { Send } from 'lucide-react';
import MagneticButton from './MagneticButton';
import MorphBlob from './MorphBlob';
import { emitTransmit } from '../scene/worldEvents';

/**
 * Contact as the RELAY CONSOLE — the form becomes a transmission console you
 * operate: uplink coordinates on one side, holographic transmission channels on
 * the other. No boxy form, no contact card. Hitting "Initiate Transmission"
 * fires the voyage:transmit event so the comms-relay dish answers with a burst.
 */
const Contact: React.FC = () => {
  return (
    <footer id="contact" className="relative overflow-hidden pb-12 pt-28">
      <MorphBlob className="contact-blob" colorVar="--accent-secondary" />
      <div className="mx-auto max-w-5xl px-6">
        <div className="holo-head">
          <span className="holo-head-tag">▸ RELAY CONSOLE</span>
          <h2 className="holo-head-title">SEND A SIGNAL</h2>
          <span className="holo-head-meta">
            <span className="holo-rec" /> Uplink ready · awaiting transmission
          </span>
        </div>

        <div className="contact-holo">
          {/* uplink coordinates */}
          <div className="holo-frame contact-coords" data-anim="fade-up">
            <span className="holo-label">// uplink coordinates</span>
            <a className="holo-row" href={`mailto:${PROFILE.email}`}>
              <span className="holo-label">Email</span>
              <span className="holo-row-val">{PROFILE.email}</span>
            </a>
            <div className="holo-row">
              <span className="holo-label">Base</span>
              <span className="holo-row-val">Petaling Jaya, Selangor</span>
            </div>
            <div className="holo-row">
              <span className="holo-label">Status</span>
              <span className="holo-row-val">
                <span className="holo-status">
                  <span className="dot" /> Available · 2025
                </span>
              </span>
            </div>
          </div>

          {/* transmission console */}
          <form
            className="holo-frame contact-console"
            data-anim="fade-up"
            data-delay="0.1"
            onSubmit={(e) => {
              e.preventDefault();
              emitTransmit(); // the comms relay answers with a signal burst
            }}
          >
            <span className="holo-label">// transmission channels</span>
            <label className="holo-channel">
              <span className="holo-label">Channel // Name</span>
              <input className="holo-input" name="name" type="text" autoComplete="name" placeholder="Identify yourself…" />
            </label>
            <label className="holo-channel">
              <span className="holo-label">Frequency // Email</span>
              <input className="holo-input" name="email" type="email" autoComplete="email" placeholder="you@example.com" />
            </label>
            <label className="holo-channel">
              <span className="holo-label">Payload // Message</span>
              <textarea className="holo-input" name="message" rows={3} placeholder="Tell me about your mission…" />
            </label>
            <MagneticButton className="holo-btn contact-transmit btn-shine">
              ▸ Initiate Transmission <Send className="h-4 w-4" />
            </MagneticButton>
          </form>
        </div>

        <p className="mt-20 text-center text-xs text-pop-text-muted/60">
          © 2025 Low Chee Fei · Charted with ♥ in React &amp; three.js
        </p>
      </div>
    </footer>
  );
};

export default Contact;
