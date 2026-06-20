import React from 'react';
import { EXPERIENCE } from '../constants';
import { emitWorldFocus, emitWorldBlur } from '../scene/worldEvents';

/**
 * Experience as a "flight path" through space: a glowing trajectory line with
 * waypoint stars, each role a frameless luminous readout. The single real role
 * is bracketed by a faint origin and a glowing "future" waypoint so the path
 * reads as a complete journey. Hovering a real waypoint fires world:focus so
 * the matching 3D experience node lights up.
 */
const Experience: React.FC = () => {
  return (
    <section id="experience" data-tint="#2dd4bf" className="relative overflow-hidden py-28">
      <div className="mx-auto max-w-2xl px-6">
        <div className="const-heading relative z-10 mb-14 text-center">
          <p
            data-anim="pop"
            data-scramble
            className="mb-3 text-[11px] font-bold uppercase tracking-[0.35em] text-pop-secondary/80"
          >
            Flight Log
          </p>
          <h2 data-anim="words" className="const-title text-4xl font-extrabold text-pop-text-main md:text-5xl">
            Trajectory
          </h2>
        </div>

        <div className="flight-path relative">
          {/* Origin */}
          <div className="flight-waypoint faint relative pb-14 pl-12">
            <span className="waypoint-star sm" data-anim="pop" />
            <div data-anim="fade-up" className="waypoint-readout">
              <p className="waypoint-period">2022</p>
              <h3 className="mt-2 text-lg font-bold text-pop-text-main">Began the journey</h3>
              <p className="mt-1 leading-relaxed text-pop-text-muted">
                Computer Science at Swinburne University — laying the foundations.
              </p>
            </div>
          </div>

          {/* Real roles */}
          {EXPERIENCE.map((exp) => (
            <div
              key={exp.id}
              data-exp-id={exp.id}
              onMouseEnter={() => emitWorldFocus({ type: 'experience', id: exp.id })}
              onMouseLeave={() => emitWorldBlur({ type: 'experience', id: exp.id })}
              className="flight-waypoint group relative pb-14 pl-12"
            >
              <span className="waypoint-star" data-anim="pop" />
              <div data-anim="fade-up" className="waypoint-readout">
                <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="const-title text-xl font-bold text-pop-text-main md:text-2xl">
                    {exp.role}
                  </h3>
                  <span className="waypoint-period">{exp.period}</span>
                </div>
                <p className="mb-3 font-semibold text-pop-primary">{exp.company}</p>
                <p className="mb-4 leading-relaxed text-pop-text-muted">{exp.description}</p>
                <div className="flex flex-wrap gap-2">
                  {exp.skills.map((s) => (
                    <span key={s} className="waypoint-tag">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Future */}
          <div className="flight-waypoint future relative pl-12">
            <span className="waypoint-star pulse" data-anim="pop" />
            <div data-anim="fade-up" className="waypoint-readout">
              <p className="waypoint-period present">2025 · Now</p>
              <h3 className="mt-2 text-lg font-bold text-pop-text-main">Open to new missions</h3>
              <p className="mt-1 leading-relaxed text-pop-text-muted">
                Available for full-time roles &amp; freelance — let's chart the next waypoint.
              </p>
              <a href="#contact" className="waypoint-link mt-3 inline-flex items-center gap-1">
                Make contact <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;
