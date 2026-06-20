import React, { useState, useEffect, useRef } from 'react';
import { PROJECTS } from '../constants';
import { Award, Star } from 'lucide-react';
import { Project } from '../types';
import ProjectModal from './ProjectModal';
import { applyTilt } from '../animations';
import { emitWorldFocus, emitWorldBlur } from '../scene/worldEvents';

/**
 * Projects as glowing "portals" floating in the cosmos — a framed viewport into
 * each project with luminous title and tech "moon" tags. Frameless (no card
 * chrome), tilts toward the cursor, fires world:focus so the matching 3D
 * project monolith brightens, and opens the existing ProjectModal on click.
 */
const ProjectsShowcase: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cards = gridRef.current?.querySelectorAll<HTMLElement>('[data-project-card]') ?? [];
    const cleanups = Array.from(cards).map((card) => applyTilt(card, 5));
    return () => cleanups.forEach((fn) => fn());
  }, []);

  const openDetailModal = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  return (
    <section id="projects" data-tint="#c084fc" className="relative overflow-hidden py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="const-heading relative z-10 mb-16 text-center">
          <p
            data-anim="pop"
            data-scramble
            className="mb-3 text-[11px] font-bold uppercase tracking-[0.35em] text-pop-secondary/80"
          >
            Featured Work
          </p>
          <h2 data-anim="words" className="const-title text-4xl font-extrabold text-pop-text-main md:text-5xl">
            Project Portals
          </h2>
          <p data-anim="fade-up" className="mx-auto mt-3 max-w-xl text-sm text-pop-text-muted/80">
            Step through any portal to explore the build.
          </p>
        </div>

        <div ref={gridRef} data-projects-grid className="project-grid grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((project) => (
            <button
              key={project.id}
              type="button"
              data-project-card=""
              data-project-id={project.id}
              onClick={() => openDetailModal(project)}
              onMouseEnter={() => emitWorldFocus({ type: 'project', id: project.id })}
              onMouseLeave={() => emitWorldBlur({ type: 'project', id: project.id })}
              className="project-portal group"
            >
              <div className="portal-frame" data-anim="clip">
                <div className="portal-img-wrap" data-speed="0.86">
                  <img src={project.image} alt={project.title} loading="lazy" className="portal-img" />
                </div>
                <span className="portal-sheen" aria-hidden="true" />
                {project.id === 'trackpoint' && (
                  <span className="portal-badge tilt-pop">
                    <Award className="h-3 w-3" /> Awarded
                  </span>
                )}
                {(project.id === 'cinemate' || project.id === 'splashaquatics') && (
                  <span className="portal-badge tilt-pop">
                    <Star className="h-3 w-3" /> Grade A
                  </span>
                )}
              </div>
              <div className="portal-info tilt-card-inner">
                <h3 className="portal-title const-title">{project.title}</h3>
                <p className="portal-sub">{project.subtitle}</p>
                <div className="portal-moons">
                  {project.tags.map((tag) => (
                    <span key={tag} className="portal-moon">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <ProjectModal project={selectedProject} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
};

export default ProjectsShowcase;
