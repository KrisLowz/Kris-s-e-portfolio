import React from 'react';
import { ArrowRight, Download, Github, Linkedin } from 'lucide-react';
import { PROFILE } from '../constants';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-20 right-0 -z-10 opacity-20">
        <div className="w-96 h-96 bg-brand-primary rounded-full blur-[128px]" />
      </div>
      <div className="absolute bottom-0 left-0 -z-10 opacity-10">
        <div className="w-64 h-64 bg-brand-accent rounded-full blur-[96px]" />
      </div>

      <div className="max-w-6xl mx-auto px-6 w-full">
        <div className="max-w-3xl">
          <div className="inline-block px-3 py-1 mb-6 text-xs font-medium tracking-wider text-brand-primary uppercase bg-brand-primary/10 rounded-full border border-brand-primary/20">
            Available for hire 2025
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-tight mb-6">
            Bridging Mobile <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-accent">
              Innovation
            </span> with <br />
            Enterprise Solutions.
          </h1>
          
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 leading-relaxed max-w-2xl">
            I'm <span className="text-slate-900 dark:text-slate-200 font-semibold">{PROFILE.name}</span>, 
            a software developer specializing in Kotlin and Python. 
            I build award-winning mobile apps and robust web systems that solve real business problems.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <a 
              href="#projects"
              className="px-8 py-4 bg-brand-primary text-slate-900 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-emerald-400 transition-all hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)]"
            >
              View Projects <ArrowRight className="w-4 h-4" />
            </a>
            <button 
              className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg font-semibold text-sm flex items-center gap-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
              onClick={() => alert("This would download the PDF resume.")}
            >
              Download CV <Download className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-12 flex items-center gap-6 text-slate-500 dark:text-slate-500">
            <a href={PROFILE.social.github} className="hover:text-brand-primary transition-colors">
              <Github className="w-6 h-6" />
            </a>
            <a href={PROFILE.social.linkedin} className="hover:text-brand-accent transition-colors">
              <Linkedin className="w-6 h-6" />
            </a>
            <div className="h-px w-12 bg-slate-300 dark:bg-slate-700" />
            <span className="text-sm">Let's connect</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;