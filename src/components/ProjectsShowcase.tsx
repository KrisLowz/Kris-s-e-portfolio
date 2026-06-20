import React, { useState, useEffect, useRef } from 'react';
import { PROJECTS } from '../constants';
import { Award, Star, ArrowUpRight } from 'lucide-react';
import { Project } from '../types';
import ProjectModal from './ProjectModal';
import { applyTilt, gsap, ScrollTrigger, CONFIG } from '../animations';
import { emitWorldFocus, emitWorldBlur } from '../scene/worldEvents';

/**
 * Projects as a PINNED, HORIZONTAL, scroll-DRIVEN gallery: scrolling down locks
 * the section and travels the project portals sideways through space in
 * real-time (GSAP pin + scrub). Each image parallaxes within its frame as the
 * panel crosses the viewport (containerAnimation). On mobile / reduced motion it
 * falls back to a normal vertical grid.
 */
const ProjectsShowcase: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const cards = section.querySelectorAll<HTMLElement>('[data-project-card]');
    const tiltCleanups = Array.from(cards).map((c) => applyTilt(c, 5));

    if (CONFIG.reducedMotion || CONFIG.isMobile) {
      return () => tiltCleanups.forEach((fn) => fn());
    }

    section.classList.add('horizontal');
    const ctx = gsap.context(() => {
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

      const scrollTween = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => '+=' + distance(),
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Per-panel image parallax WITHIN the moving track (depth on real scroll).
      section.querySelectorAll<HTMLElement>('.portal-img-wrap').forEach((img) => {
        gsap.fromTo(
          img,
          { xPercent: -10 },
          {
            xPercent: 10,
            ease: 'none',
            scrollTrigger: {
              trigger: img,
              containerAnimation: scrollTween,
              start: 'left right',
              end: 'right left',
              scrub: true,
            },
          }
        );
      });
    }, section);

    ScrollTrigger.refresh();

    return () => {
      tiltCleanups.forEach((fn) => fn());
      ctx.revert();
      section.classList.remove('horizontal');
    };
  }, []);

  const openDetailModal = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  return (
    <section id="projects" ref={sectionRef} data-tint="#c084fc" className="proj-section relative">
      <div ref={trackRef} className="proj-track">
        {/* Intro panel */}
        <div className="proj-panel proj-intro">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.35em] text-pop-secondary/80">
            Featured Work
          </p>
          <h2 className="const-title text-5xl font-extrabold leading-[1.05] text-pop-text-main md:text-6xl">
            Project
            <br />
            Portals
          </h2>
          <p className="mt-5 max-w-xs text-sm text-pop-text-muted/80">
            Keep scrolling — travel sideways through the work. Click any portal to step inside.
          </p>
          <div className="proj-scroll-hint mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-pop-primary">
            Scroll <span aria-hidden="true">→</span>
          </div>
        </div>

        {PROJECTS.map((project) => (
          <div className="proj-panel" key={project.id}>
            <button
              type="button"
              data-project-card=""
              data-project-id={project.id}
              onClick={() => openDetailModal(project)}
              onMouseEnter={() => emitWorldFocus({ type: 'project', id: project.id })}
              onMouseLeave={() => emitWorldBlur({ type: 'project', id: project.id })}
              className="project-portal group"
            >
              <div className="portal-frame">
                <div className="portal-img-wrap">
                  <img src={project.image} alt={project.title} loading="lazy" className="portal-img" />
                </div>
                <span className="portal-sheen" aria-hidden="true" />
                {project.id === 'trackpoint' && (
                  <span className="portal-badge">
                    <Award className="h-3 w-3" /> Awarded
                  </span>
                )}
                {(project.id === 'cinemate' || project.id === 'splashaquatics') && (
                  <span className="portal-badge">
                    <Star className="h-3 w-3" /> Grade A
                  </span>
                )}
              </div>
              <div className="portal-info">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="portal-title const-title">{project.title}</h3>
                    <p className="portal-sub">{project.subtitle}</p>
                  </div>
                  <span className="portal-enter">
                    <ArrowUpRight className="h-5 w-5" />
                  </span>
                </div>
                <div className="portal-moons">
                  {project.tags.map((tag) => (
                    <span key={tag} className="portal-moon">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          </div>
        ))}

        {/* Outro panel */}
        <div className="proj-panel proj-outro">
          <p className="const-title text-3xl font-extrabold text-pop-text-main md:text-4xl">
            End of the
            <br />
            mission log.
          </p>
          <a href="#contact" className="waypoint-link mt-4 inline-flex items-center gap-1">
            Send a signal <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>

      <ProjectModal project={selectedProject} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
};

export default ProjectsShowcase;
