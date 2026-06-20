import React from 'react';
import { EXPERIENCE } from '../constants';
import { emitWorldFocus, emitWorldBlur } from '../scene/worldEvents';

const Experience: React.FC = () => {
  return (
    <section id="experience" data-tint="#2dd4bf" className="py-32 relative">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <div data-anim="pop" data-scramble className="inline-block px-4 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-full text-sm font-bold mb-4">
            Career Journey
          </div>
          <h2 data-anim="words" className="text-4xl font-extrabold text-pop-text-main">Experience</h2>
        </div>

        <div className="space-y-8">
          {EXPERIENCE.map((exp, idx) => (
            <div
              key={exp.id}
              data-exp-id={exp.id}
              onMouseEnter={() => emitWorldFocus({ type: 'experience', id: exp.id })}
              onMouseLeave={() => emitWorldBlur({ type: 'experience', id: exp.id })}
              className="group relative pl-8 border-l-2 border-pop-border pb-8 last:pb-0"
            >

              {/* Accent line that draws downward over the static border track */}
              <span data-anim="draw-y" className="absolute -left-[2px] top-0 w-[2px] h-full bg-pop-primary" />

              {/* Dot */}
              <div data-anim="pop" className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-pop-surface border-4 border-pop-border group-hover:border-pop-primary transition-colors z-10" />

              <div data-anim="clip-left" data-tilt="7" className="bg-pop-surface/75 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-pop-border hover:shadow-xl transition-shadow">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-pop-text-main">{exp.role}</h3>
                    <p className="text-pop-primary font-medium">{exp.company}</p>
                  </div>
                  <span className="mt-2 sm:mt-0 px-3 py-1 bg-pop-surface-2 text-pop-text-muted text-xs font-bold rounded-full">
                    {exp.period}
                  </span>
                </div>

                <p className="text-pop-text-muted leading-relaxed mb-4">
                  {exp.description}
                </p>

                <div data-stagger="0.05" className="flex flex-wrap gap-2">
                  {exp.skills.map((skill) => (
                    <span key={skill} data-anim="pop" className="text-xs font-semibold text-pop-text-muted bg-pop-surface-2 px-2 py-1 rounded border border-pop-border">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;