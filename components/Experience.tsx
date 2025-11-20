import React from 'react';
import { EXPERIENCE } from '../constants';
import { Briefcase } from 'lucide-react';

const Experience: React.FC = () => {
  return (
    <section id="experience" className="py-24">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-12 text-center">Professional Journey</h2>

        <div className="relative space-y-12">
          {/* Vertical Line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-800 -translate-x-1/2 hidden md:block" />
          <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-800 md:hidden" />

          {EXPERIENCE.map((exp, idx) => (
            <div key={exp.id} className={`relative flex flex-col md:flex-row gap-8 ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
              
              {/* Timeline Dot */}
              <div className="absolute left-4 md:left-1/2 w-8 h-8 bg-slate-50 dark:bg-slate-900 border-4 border-white dark:border-brand-surface rounded-full -translate-x-1/2 flex items-center justify-center z-10 shadow-sm">
                <div className="w-2 h-2 bg-brand-primary rounded-full" />
              </div>

              {/* Content Card */}
              <div className="ml-12 md:ml-0 md:w-1/2">
                <div className={`p-6 bg-white dark:bg-brand-surface border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-brand-primary/50 transition-colors shadow-sm dark:shadow-none ${idx % 2 === 0 ? 'md:mr-8' : 'md:ml-8'}`}>
                  <div className="flex items-center gap-2 mb-2 text-brand-primary">
                    <Briefcase className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">{exp.period}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{exp.role}</h3>
                  <p className="text-lg text-slate-600 dark:text-slate-400 mb-4 font-medium">{exp.company}</p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 leading-relaxed">
                    {exp.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {exp.skills.map((skill) => (
                      <span key={skill} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 rounded-md border border-slate-200 dark:border-slate-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Empty space for opposite side */}
              <div className="md:w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;