import React from 'react';
import { EXPERIENCE } from '../constants';

const Experience: React.FC = () => {
  return (
    <section id="experience" className="py-32 relative">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16 reveal-on-scroll">
          <div className="inline-block px-4 py-1 bg-soft-mint text-teal-700 rounded-full text-sm font-bold mb-4">
            Career Journey
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900">Experience</h2>
        </div>

        <div className="space-y-8">
          {EXPERIENCE.map((exp, idx) => (
            <div key={exp.id} className="reveal-on-scroll group relative pl-8 border-l-2 border-slate-200 hover:border-pop-primary transition-colors pb-8 last:pb-0">
              
              {/* Dot */}
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-slate-200 group-hover:border-pop-primary transition-colors" />

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{exp.role}</h3>
                    <p className="text-pop-primary font-medium">{exp.company}</p>
                  </div>
                  <span className="mt-2 sm:mt-0 px-3 py-1 bg-slate-50 text-slate-500 text-xs font-bold rounded-full">
                    {exp.period}
                  </span>
                </div>
                
                <p className="text-slate-600 leading-relaxed mb-4">
                  {exp.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {exp.skills.map((skill) => (
                    <span key={skill} className="text-xs font-semibold text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100">
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