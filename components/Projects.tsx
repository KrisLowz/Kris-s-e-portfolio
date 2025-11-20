import React, { useState } from 'react';
import { PROJECTS } from '../constants';
import { Award, Star, ArrowRight } from 'lucide-react';
import { Project } from '../types';
import ProjectModal from './ProjectModal';

const Projects: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProject(null), 200); // Clear data after animation
  };

  return (
    <section id="projects" className="py-24 bg-slate-100 dark:bg-slate-900/50 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">Featured Projects</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
            A selection of my work demonstrating full-stack capabilities, from award-winning mobile apps to intelligent web platforms.
          </p>
        </div>

        <div className="grid gap-12">
          {PROJECTS.map((project, idx) => (
            <div 
              key={project.id}
              className={`group relative grid md:grid-cols-2 gap-8 items-center p-8 rounded-3xl bg-white dark:bg-brand-surface border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 shadow-lg dark:shadow-none transition-all duration-300 ${idx % 2 === 1 ? 'md:grid-flow-dense' : ''}`}
            >
              {/* Image Side */}
              <div 
                className={`relative overflow-hidden rounded-xl aspect-video shadow-md cursor-pointer ${idx % 2 === 1 ? 'md:col-start-2' : ''}`}
                onClick={() => openModal(project)}
              >
                <div className="absolute inset-0 bg-brand-primary/10 dark:bg-brand-primary/20 mix-blend-multiply dark:mix-blend-overlay z-10 group-hover:bg-transparent transition-all duration-500" />
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 filter grayscale group-hover:grayscale-0"
                />
              </div>

              {/* Content Side */}
              <div className={idx % 2 === 1 ? 'md:col-start-1' : ''}>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{project.title}</h3>
                  {project.id === 'trackpoint' && (
                    <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-500 text-xs font-bold rounded-md flex items-center gap-1 border border-yellow-200 dark:border-yellow-500/30">
                      <Award className="w-3 h-3" /> Award Winner
                    </span>
                  )}
                  {project.id === 'cinemate' && (
                    <span className="px-2 py-1 bg-emerald-100 dark:bg-brand-primary/20 text-emerald-700 dark:text-brand-primary text-xs font-bold rounded-md flex items-center gap-1 border border-emerald-200 dark:border-brand-primary/30">
                      <Star className="w-3 h-3" /> Grade A
                    </span>
                  )}
                </div>
                <p className="text-lg text-brand-primary font-medium mb-4">{project.subtitle}</p>
                
                <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed line-clamp-3">
                  {project.description}
                </p>

                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-300 mb-2 uppercase tracking-wider">Key Achievements</h4>
                  <ul className="space-y-2">
                    {project.achievements.map((ach, i) => (
                      <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-accent flex-shrink-0" />
                        {ach}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                  {project.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 text-xs text-slate-600 dark:text-slate-500 bg-slate-100 dark:bg-slate-900 rounded-full font-mono border border-slate-200 dark:border-transparent">
                      {tag}
                    </span>
                  ))}
                </div>

                <button 
                  onClick={() => openModal(project)}
                  className="text-slate-700 dark:text-slate-300 hover:text-brand-primary dark:hover:text-brand-primary font-semibold flex items-center gap-2 transition-colors group-hover:translate-x-2 duration-300"
                >
                  View Case Study <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Detail Modal */}
      <ProjectModal 
        project={selectedProject} 
        isOpen={isModalOpen} 
        onClose={closeModal} 
      />
    </section>
  );
};

export default Projects;