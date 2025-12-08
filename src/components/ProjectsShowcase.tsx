import React, { useState, useEffect } from 'react';
import { PROJECTS } from '../constants';
import { Award, Star, ArrowUpRight } from 'lucide-react';
import { Project } from '../types';
import ProjectModal from './ProjectModal';
import SpotlightCard from './SpotlightCard';

const ProjectsShowcase: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // 3D Tilt Effect Logic for Mouse Movement
    const handleTilt = (e: MouseEvent) => {
      const card = e.currentTarget as HTMLElement;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    };

    const resetTilt = (e: MouseEvent) => {
      const card = e.currentTarget as HTMLElement;
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    };

    const cards = document.querySelectorAll('.tilt-enabled');
    cards.forEach(card => {
      card.addEventListener('mousemove', handleTilt as EventListener);
      card.addEventListener('mouseleave', resetTilt as EventListener);
    });

    return () => {
      cards.forEach(card => {
        card.removeEventListener('mousemove', handleTilt as EventListener);
        card.removeEventListener('mouseleave', resetTilt as EventListener);
      });
    };
  }, []);

  const openDetailModal = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  return (
    <section id="projects" className="py-32 relative">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <div className="mb-20 text-center reveal-on-scroll">
          <div className="inline-block px-4 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-bold mb-4">
            Featured Work
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-pop-text-main mb-6">
            Selected Projects
          </h2>
          <p className="text-pop-text-muted max-w-2xl mx-auto text-lg">
            A curation of my best work in mobile and web development. Click any project to view details or screenshots.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 gap-10 perspective-1000">
          {PROJECTS.map((project) => (
            <SpotlightCard 
              key={project.id}
              onClick={() => openDetailModal(project)}
              className="reveal-on-scroll tilt-enabled rounded-3xl overflow-hidden flex flex-col h-full cursor-pointer group bg-pop-surface/40 border border-pop-border"
            >
                {/* Image Area */}
                <div className="relative h-64 overflow-hidden bg-pop-surface-2 tilt-card-inner">
                  <img 
                    src={project.image} 
                    alt={project.title} 
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