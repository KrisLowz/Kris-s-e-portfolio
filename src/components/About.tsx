import React from 'react';
import { ABOUT, PROFILE } from '../constants';

/**
 * About — the "Origin" act rendered as a decoded data packet beamed off the
 * Origin World: a scanned visual-ID, the machine-voice packet fields, the one
 * human statement, and a trait matrix. All copy comes from ABOUT in constants.ts.
 * The packet rows reveal in a stagger (the "decode" feel) via the data-anim engine.
 */
const About: React.FC = () => {
  return (
    <section id="about" data-tint="#818cf8" className="relative overflow-hidden py-28">
      <div className="mx-auto max-w-5xl px-6">
        <div className="holo-head">
          <span className="holo-head-tag">▸ ORIGIN WORLD</span>
          <h2 className="holo-head-title">SUBJECT DOSSIER</h2>
          <span className="holo-head-meta">
            <span className="holo-rec" /> DECODING PACKET…
          </span>
        </div>

        <div className="about-holo">
          {/* scanned visual-ID */}
          <div className="about-id" data-anim="fade-up">
            <div className="holo-frame holo-scan-img about-avatar">
              <img src="/assets/ME.png" alt={PROFILE.name} />
              <span className="about-avatar-label holo-label">Visual ID · Locked</span>
            </div>
            <div>
              <p className="about-id-name">{PROFILE.name.toUpperCase()}</p>
              <span className="holo-status">
                <span className="dot" /> Online · Available 2025
              </span>
            </div>
          </div>

          {/* decoded data packet */}
          <div className="holo-frame about-dossier" data-anim="fade-up" data-delay="0.1">
            {ABOUT.packet.map((f, i) => (
              <div
                className="holo-row"
                key={f.label}
                data-anim="fade-up"
                data-delay={(0.15 + i * 0.06).toFixed(2)}
              >
                <span className="holo-label">{f.label}</span>
                <span className="holo-row-val">{f.value}</span>
              </div>
            ))}

            <div className="about-block about-log">
              <span className="holo-label">// transmission log</span>
              <p>{ABOUT.statement}</p>
            </div>

            <div className="about-block">
              <span className="holo-label">// trait matrix</span>
              <div className="holo-tag-row">
                {ABOUT.traits.map((t) => (
                  <span key={t} className="holo-tag">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
