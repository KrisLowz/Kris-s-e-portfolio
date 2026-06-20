import React, { useState, useEffect, useRef } from 'react';
import { PROJECTS } from '../constants';
import { Award, Star, ArrowUpRight } from 'lucide-react';
import { Project } from '../types';
import ProjectModal from './ProjectModal';
import SpotlightCard from './SpotlightCard';
import { applyTilt } from '../animations';

const ProjectsShowcase: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 3D pointer tilt per card (gsap quickTo, see animations/tilt.ts).
    const cards = gridRef.current?.querySelectorAll<HTMLElement>('[data-project-card]') ?? [];
    const cleanups = Array.from(cards).map((card) => applyTilt(card));
    return () => cleanups.forEach((fn) => fn());
  }, []);

  const openDetailModal = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  return (
    <section id="projects" data-tint="#c084fc" className="py-32 relative">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="mb-20 text-center">
          <div data-anim="pop" className="inline-block px-4 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-bold mb-4">
            Featured Work
          </div>
          <h2 data-anim="words" className="text-4xl md:text-5xl font-extrabold text-pop-text-main mb-6">
            Selected Projects
          </h2>
          <p data-anim="fade-up" className="text-pop-text-muted max-w-2xl mx-auto text-lg">
            A curation of my best work in mobile and web development. Click any project to view details or screenshots.
          </p>
        </div>

        {/* Projects Grid */}
        <div ref={gridRef} data-projects-grid className="grid md:grid-cols-2 gap-10 [perspective:1200px]">
          {PROJECTS.map((project) => (
            <SpotlightCard
              key={project.id}
              data-project-card=""
              onClick={() => openDetailModal(project)}
              className="rounded-3xl overflow-hidden flex flex-col h-full cursor-pointer group bg-pop-surface/40 border border-pop-border"
            >
                {/* Image Area */}
                <div className="relative h-64 overflow-hidden bg-pop-surface-2 tilt-card-inner">
                  <img
                    src={project.image}
                    alt={project.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  
                  {/* Floating Badge */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    {project.id === 'trackpoint' && (
                      <span className="px-3 py-1 bg-white/90 backdrop-blur text-yellow-600 shadow-sm text-xs font-bold rounded-full flex items-center gap-1">
                        <Award className="w-3 h-3" /> Awarded
                      </span>
                    )}
                    {(project.id === 'cinemate' || project.id === 'splashaquatics') && (
                      <span className="px-3 py-1 bg-white/90 backdrop-blur text-indigo-600 shadow-sm text-xs font-bold rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3" /> Grade A
                      </span>
                    )}
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-8 flex flex-col flex-1 tilt-card-inner">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-pop-text-main mb-1 group-hover:text-pop-primary transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-pop-text-muted font-medium">{project.subtitle}</p>
                    </div>
                    <div className="p-2 bg-pop-surface-2 rounded-full text-pop-text-muted group-hover:bg-pop-primary group-hover:text-white transition-all">
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                  </div>
                  
                  <p className="text-pop-text-muted mb-6 leading-relaxed flex-1">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-6 border-t border-pop-border">
                    {project.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 text-xs font-semibold text-pop-text-muted bg-pop-surface-2 rounded-lg">
                        {tag}
                      </span>
                    ))}
                </div>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </div>

      <ProjectModal 
        project={selectedProject} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </section>
  );
};

export default ProjectsShowcase;