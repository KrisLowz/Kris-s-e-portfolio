import React from 'react';

/**
 * About as an in-world SUBJECT DOSSIER — the bio beamed off the Origin World as
 * a holographic readout: a scanned visual-ID, decrypted dossier fields, a
 * transmission log, and the soft skills as a "trait matrix". No paragraph
 * column, no avatar button — a hologram, not a card.
 */
const TRAITS = [
  'Problem Solving',
  'Critical Thinking',
  'Communication',
  'Project Mgmt',
  'Time Mgmt',
  'Teamwork',
  'Adaptability',
];

const About: React.FC = () => {
  return (
    <section id="about" data-tint="#818cf8" className="relative overflow-hidden py-28">
      <div className="mx-auto max-w-5xl px-6">
        <div className="holo-head">
          <span className="holo-head-tag">▸ ORIGIN WORLD</span>
          <h2 className="holo-head-title">SUBJECT DOSSIER</h2>
          <span className="holo-head-meta">
            <span className="holo-rec" /> DECRYPTING TRANSMISSION…
          </span>
        </div>

        <div className="about-holo">
          {/* scanned visual-ID */}
          <div className="about-id" data-anim="fade-up">
            <div className="holo-frame holo-scan-img about-avatar">
              <img src="/assets/ME.png" alt="Low Chee Fei" />
              <span className="about-avatar-label holo-label">Visual ID · Locked</span>
            </div>
            <div>
              <p className="about-id-name">LOW CHEE FEI</p>
              <span className="holo-status">
                <span className="dot" /> Online · Available 2025
              </span>
            </div>
          </div>

          {/* decrypted dossier */}
          <div className="holo-frame about-dossier" data-anim="fade-up" data-delay="0.1">
            <div className="holo-row">
              <span className="holo-label">Class</span>
              <span className="holo-row-val">Software Developer</span>
            </div>
            <div className="holo-row">
              <span className="holo-label">Origin</span>
              <span className="holo-row-val">Swinburne University of Technology · Class of 2025</span>
            </div>
            <div className="holo-row">
              <span className="holo-label">Base</span>
              <span className="holo-row-val">Petaling Jaya, Selangor</span>
            </div>
            <div className="holo-row">
              <span className="holo-label">Directive</span>
              <span className="holo-row-val">
                Make great code invisible — fluid, intuitive, reliable.
              </span>
            </div>

            <div className="about-block about-log">
              <span className="holo-label">// transmission log</span>
              <p>
                A software developer who believes great code should be invisible to the user.
                Currently finishing an internship at Swinburne — already shipping award-winning work
                that solves real-world logistics problems across mobile and enterprise systems.
              </p>
            </div>

            <div className="about-block">
              <span className="holo-label">// trait matrix</span>
              <div className="holo-tag-row">
                {TRAITS.map((t) => (
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
