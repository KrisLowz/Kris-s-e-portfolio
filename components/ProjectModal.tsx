import React, { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Layers, ExternalLink, Rocket } from 'lucide-react';
import { Project } from '../types';

interface ProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ project, isOpen, onClose }) => {
  // Close on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-brand-surface rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md text-white rounded-full transition-all"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Image Section */}
        <div className="relative h-64 sm:h-80 w-full flex-shrink-0">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-90" />
          <div className="absolute bottom-0 left-0 w-full p-8">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 tracking-tight">{project.title}</h2>
            <p className="text-brand-primary font-medium text-lg md:text-xl">{project.subtitle}</p>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 space-y-10 flex-1 overflow-y-auto custom-scrollbar">
          
          {/* Overview */}
          <section>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Rocket className="w-5 h-5 text-brand-primary" />
              Project Overview
            </h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
              {project.overview}
            </p>
          </section>

          {/* Challenges vs Solutions */}
          <div className="grid md:grid-cols-2 gap-8">
            <section className="bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl border border-red-100 dark:border-red-900/20">
              <div className="flex items-center gap-2 mb-4 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-lg font-bold">The Challenges</h3>
              </div>
              <ul className="space-y-4">
                {project.challenges.map((challenge, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-700 dark:text-slate-300 text-sm">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                    <span className="leading-relaxed">{challenge}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/20">
              <div className="flex items-center gap-2 mb-4 text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="w-5 h-5" />
                <h3 className="text-lg font-bold">The Solutions</h3>
              </div>
              <ul className="space-y-4">
                {project.solutions.map((solution, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-700 dark:text-slate-300 text-sm">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                    <span className="leading-relaxed">{solution}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Tech Stack Grid */}
          <section>
             <div className="flex items-center gap-2 mb-6 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-4">
                <Layers className="w-5 h-5 text-brand-primary" />
                <h3 className="text-xl font-bold">Tech Stack Breakdown</h3>
              </div>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                {project.techStackDetails.map((stack, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-primary/30 transition-colors">
                    <h4 className="text-sm font-bold text-brand-primary mb-3 uppercase tracking-wider">
                      {stack.category}
                    </h4>
                    <ul className="space-y-2">
                      {stack.tools.map((tool, tIdx) => (
                        <li key={tIdx} className="text-sm text-slate-700 dark:text-slate-300 font-medium flex items-center gap-2">
                          <div className="w-1 h-1 bg-slate-400 rounded-full" />
                          {tool}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
          </section>

          {/* External Link Footer */}
          {project.link && (
            <div className="pt-8 mt-8 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-brand-primary text-slate-900 font-bold rounded-xl hover:bg-emerald-400 transition-all hover:shadow-lg hover:shadow-emerald-500/20 flex items-center gap-2"
              >
                Visit Live Project <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;