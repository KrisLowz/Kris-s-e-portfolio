import React from 'react';
import { EXPERIENCE } from '../constants';
import { emitWorldFocus, emitWorldBlur } from '../scene/worldEvents';

/**
 * Experience as a holographic MISSION RECORD — each role a decrypted flight-log
 * entry (designation, period, status) instead of a timeline card. The single
 * real role is bracketed by an origin record and a "standby" record awaiting
 * orders. Hovering a real record fires world:focus so the matching 3D beacon
 * ignites.
 */
const Experience: React.FC = () => {
  return (
    <section id="experience" data-tint="#2dd4bf" className="relative overflow-hidden py-28">
      <div className="mx-auto max-w-2xl px-6">
        <div className="holo-head">
          <span className="holo-head-tag">▸ FLIGHT LOG</span>
          <h2 className="holo-head-title">MISSION RECORD</h2>
          <span className="holo-head-meta">
            <span className="holo-rec" /> CHRONOLOGICAL UPLINK
          </span>
        </div>

        <div className="mlog">
          {/* origin */}
          <article className="holo-frame mlog-rec" data-anim="fade-up">
            <div className="mlog-head">
              <span className="holo-label">LOG 001 · 2022</span>
              <span className="holo-status complete">
                <span className="dot" /> Complete
              </span>
            </div>
            <h3 className="mlog-title">Began the journey</h3>
            <p className="mlog-desc">
              Computer Science at Swinburne University — laying the foundations.
            </p>
          </article>

          {/* real roles */}
          {EXPERIENCE.map((exp, i) => (
            <article
              key={exp.id}
              data-exp-id={exp.id}
              onMouseEnter={() => emitWorldFocus({ type: 'experience', id: exp.id })}
              onMouseLeave={() => emitWorldBlur({ type: 'experience', id: exp.id })}
              className="holo-frame mlog-rec"
              data-anim="fade-up"
            >
              <div className="mlog-head">
                <span className="holo-label">
                  LOG {String(i + 2).padStart(3, '0')} · {exp.period}
                </span>
                <span className="holo-status complete">
                  <span className="dot" /> Complete
                </span>
              </div>
              <h3 className="mlog-title">{exp.role}</h3>
              <p className="mlog-org">{exp.company}</p>
              <p className="mlog-desc">{exp.description}</p>
              <div className="holo-tag-row">
                {exp.skills.map((s) => (
                  <span key={s} className="holo-tag">
                    {s}
                  </span>
                ))}
              </div>
            </article>
          ))}

          {/* standby — open to new missions */}
          <article className="holo-frame mlog-rec active" data-anim="fade-up">
            <div className="mlog-head">
              <span className="holo-label">LOG ··· · 2025 / NOW</span>
              <span className="holo-status standby">
                <span className="dot" /> Standby
              </span>
            </div>
            <h3 className="mlog-title">Open to new missions</h3>
            <p className="mlog-desc">
              Available for full-time roles &amp; freelance — let&apos;s chart the next waypoint.
            </p>
            <a href="#contact" className="holo-btn">
              ▸ Make contact
            </a>
          </article>
        </div>
      </div>
    </section>
  );
};

export default Experience;
