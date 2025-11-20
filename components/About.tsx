import React from 'react';
import { SKILLS, PROFILE } from '../constants';
import { Terminal, Cpu, Database } from 'lucide-react';

const About: React.FC = () => {
  return (
    <section id="about" className="py-24 relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          
          {/* Bio Column */}
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">About Me</h2>
            <div className="space-y-4 text-slate-600 dark:text-slate-400 leading-relaxed">
              <p>
                As a Computer Science graduate from <strong className="text-brand-primary">Swinburne University</strong>, 
                I don't just write code; I engineer solutions.
              </p>
              <p>
                My journey bridges two distinct worlds: the fast-paced innovation of 
                <span className="text-slate-900 dark:text-slate-200 font-medium"> mobile development</span> and the structured reliability of 
                <span className="text-slate-900 dark:text-slate-200 font-medium"> enterprise ERP systems</span>.
              </p>
              <p>
                {PROFILE.bio}
              </p>
            </div>

            <div className="mt-8 p-6 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm dark:shadow-none">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-brand-primary/10 rounded-lg text-brand-primary">
                  <Terminal className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-200 mb-1">Technical Philosophy</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    I believe in "Clean Architecture" and "User-First Design". Whether optimization of a SQL query or animating a UI component, every detail counts.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Skills Column */}
          <div>
            <div className="grid gap-6">
              {SKILLS.map((category, index) => (
                <div key={index} className="bg-white dark:bg-brand-surface border border-slate-200 dark:border-slate-800 p-6 rounded-2xl hover:border-brand-primary/30 dark:hover:border-slate-600 transition-colors group shadow-sm dark:shadow-none">
                  <div className="flex items-center gap-3 mb-4">
                    {index === 0 && <Terminal className="w-5 h-5 text-brand-accent" />}
                    {index === 1 && <Cpu className="w-5 h-5 text-brand-primary" />}
                    {index === 2 && <Database className="w-5 h-5 text-purple-500 dark:text-purple-400" />}
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-200">{category.title}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {category.skills.map((skill) => (
                      <span 
                        key={skill} 
                        className="px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 group-hover:border-brand-primary/30 group-hover:text-brand-dark dark:group-hover:text-white transition-all"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;