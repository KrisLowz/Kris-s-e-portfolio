import React, { useState, useEffect, useRef } from 'react';
import { PROJECTS } from '../constants';
import { Award, Star, ArrowUpRight } from 'lucide-react';
import { Project } from '../types';
import ProjectModal from './ProjectModal';
import { applyTilt, gsap, ScrollTrigger, CONFIG } from '../animations';
import { emitWorldFocus, emitWorldBlur } from '../scene/worldEvents';

/**
 * Projects as PINNED, HORIZONTAL, scroll-driven WORLD DOSSIERS: scrolling locks
 * the section and travels the worlds sideways through space (GSAP pin + scrub),
 * each image parallaxing within its holographic scan-frame. Each panel is a
 * holographic dossier (visual feed, clearance, stack signature), not a card. On
 * mobile / reduced motion it falls back to a normal vertical stack.
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
          <span className="holo-head-tag">▸ PROJECT WORLDS</span>
          <h2 className="holo-head-title mt-3 !text-left">
            WORLD
            <br />
            DOSSIERS
          </h2>
          <p className="mt-5 max-w-xs text-sm text-pop-text-muted/80">
            Keep scrolling — travel sideways and scan each world. Access a dossier to dive in.
          </p>
          <div className="proj-scroll-hint mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-pop-primary">
            Scan <span aria-hidden="true">→</span>
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
              className="project-portal group block w-full text-left"
            >
              <div className="portal-frame holo-frame holo-scan-img">
                <div className="portal-img-wrap">
                  <img src={project.image} alt={project.title} loading="lazy" className="portal-img" />
                </div>
                <span className="proj-feed-tag holo-label">Visual Feed · Live</span>
                {project.id === 'trackpoint' ? (
                  <span className="proj-clearance">
                    <Award className="h-3 w-3" /> Awarded
                  </span>
                ) : (
                  <span className="proj-clearance">
                    <Star className="h-3 w-3" /> Clearance · A
                  </span>
                )}
              </div>

              <div className="proj-dossier">
                <div className="proj-dossier-head">
                  <div>
                    <span className="holo-label">// designation</span>
                    <h3 className="proj-title">{project.title}</h3>
                    <p className="proj-sub">{project.subtitle}</p>
                  </div>
                  <span className="holo-btn">
                    Access <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
                <span className="holo-label">// stack signature</span>
                <div className="holo-tag-row mt-2">
                  {project.tags.map((tag) => (
                    <span key={tag} className="holo-tag">
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
          <span className="holo-label">// end of dossiers</span>
          <p className="holo-head-title mt-3 !text-left" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}>
            LOG CLOSED.
          </p>
          <a href="#contact" className="holo-btn mt-5">
            ▸ Open relay
          </a>
        </div>
      </div>

      <ProjectModal project={selectedProject} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
};

export default ProjectsShowcase;
