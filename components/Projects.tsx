import React, { useState, useEffect, useRef } from 'react';
import { PROJECTS } from '../constants';
import { Award, Star, ArrowUpRight } from 'lucide-react';
import { Project } from '../types';
import ProjectModal from './ProjectModal';

const Projects: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // 1. Elastic Entrance Animation
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach((el) => observer.observe(el));

    // 2. 3D Tilt Effect Logic
    const handleTilt = (e: MouseEvent) => {
      const card = e.currentTarget as HTMLElement;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -10; // Max rotation deg
      const rotateY = ((x - centerX) / centerX) * 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    };

    const resetTilt = (e: MouseEvent) => {
      const card = e.currentTarget as HTMLElement;
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    };

    const cards = document.querySelectorAll('.glass-card');
    cards.forEach(card => {
      card.addEventListener('mousemove', handleTilt as EventListener);
      card.addEventListener('mouseleave', resetTilt as EventListener);
    });

    return () => {
      observer.disconnect();
      cards.forEach(card => {
        card.removeEventListener('mousemove', handleTilt as EventListener);
        card.removeEventListener('mouseleave', resetTilt as EventListener);
      });
    };
  }, []);

  const openModal = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  return (
    <section id="projects" className="py-32 relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-20 text-center reveal-on-scroll">
          <div className="inline-block px-4 py-1 bg-soft-purple dark:bg-indigo-900 text-purple-700 dark:text-purple-300 rounded-full text-sm font-bold mb-4">
            Featured Work
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-pop-text mb-6">
            Selected Projects
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">
            A curation of my best work in mobile and web development.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10 perspective-1000">
          {PROJECTS.map((project, idx) => (
            <div 
              key={project.id}
              className="reveal-on-scroll glass-card rounded-3xl overflow-hidden flex flex-col h-full cursor-pointer group transition-all duration-100 ease-out"
              onClick={() => openModal(project)}
            >
              {/* Image Area */}
              <div className="relative h-64 overflow-hidden bg-slate-100 dark:bg-slate-800 tilt-card-inner">
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
                  {project.id === 'cinemate' && (
                    <span className="px-3 py-1 bg-white/90 backdrop-blur text-indigo-600 shadow-sm text-xs font-bold rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" /> Grade A
                    </span>
                  )}
                </div>
              </div>

              {/* Content Area */}
              <div className="p-8 flex flex-col flex-1 tilt-card-inner bg-white/50 dark:bg-slate-900/50">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-pop-text mb-1 group-hover:text-pop-primary transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">{project.subtitle}</p>
                  </div>
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 group-hover:bg-pop-primary group-hover:text-white transition-all">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                </div>
                
                <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed flex-1">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2 pt-6 border-t border-slate-100 dark:border-slate-700">
                  {project.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
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

export default Projects;