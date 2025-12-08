import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertTriangle, Layers, ExternalLink, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import { Project } from '../types';

interface ProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ project, isOpen, onClose }) => {
  const [isGalleryMode, setIsGalleryMode] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      // Reset to details page when modal closes
      setIsGalleryMode(false);
      setCurrentImageIndex(0);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Reset gallery mode when project changes
  useEffect(() => {
    setIsGalleryMode(false);
    setCurrentImageIndex(0);
  }, [project?.id]);

  const nextImage = () => {
    if (project?.screenshots) {
      setCurrentImageIndex((prev) => (prev + 1) % project.screenshots!.length);
    }
  };

  const prevImage = () => {
    if (project?.screenshots) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? project.screenshots!.length - 1 : prev - 1
      );
    }
  };

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-pop-text-main/20 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-pop-surface rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col custom-scrollbar">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-pop-surface/80 hover:bg-pop-surface text-pop-text-main rounded-full shadow-lg transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Screenshot Gallery View */}
        {isGalleryMode && project.screenshots && project.screenshots.length > 0 ? (
          <div className="flex flex-col h-full">
            {/* Gallery Header */}
            <div className="p-6 border-b border-pop-border flex justify-between items-center pr-16">
              <h3 className="text-2xl font-bold text-pop-text-main">Screenshots</h3>
              <button
                onClick={() => setIsGalleryMode(false)}
                className="px-4 py-2 bg-pop-primary text-white font-semibold rounded-lg hover:bg-pop-primary/90 transition-colors text-sm"
              >
                Back to Details
              </button>
            </div>

            {/* Gallery Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
              {/* Main Image - Responsive Frame Display */}
              {/* Web projects - wider, shorter */}
              {(project.id === 'cinemate' || project.id === 'splashaquatics') ? (
                <div className="w-full max-w-3xl rounded-2xl overflow-hidden bg-pop-surface-2 flex items-center justify-center border-2 border-pop-border" style={{height: '450px'}}>
                  <img
                    src={project.screenshots[currentImageIndex]}
                    alt={`Screenshot ${currentImageIndex + 1}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                /* Mobile projects - narrower, taller */
                <div className="w-80 rounded-2xl overflow-hidden bg-pop-surface-2 flex items-center justify-center border-2 border-pop-border" style={{height: '700px'}}>
                  <img
                    src={project.screenshots[currentImageIndex]}
                    alt={`Screenshot ${currentImageIndex + 1}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {/* Navigation Controls */}
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={prevImage}
                  className="p-3 rounded-full bg-pop-primary text-white hover:bg-pop-primary/90 transition-all hover:scale-110"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <div className="text-pop-text-muted font-semibold">
                  {currentImageIndex + 1} / {project.screenshots.length}
                </div>

                <button
                  onClick={nextImage}
                  className="p-3 rounded-full bg-pop-primary text-white hover:bg-pop-primary/90 transition-all hover:scale-110"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Thumbnail Strip */}
              <div className="w-full flex gap-2 overflow-x-auto pb-4 justify-center flex-wrap">
                {project.screenshots.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`flex-shrink-0 h-16 w-20 rounded-lg overflow-hidden border-2 transition-all ${
                      currentImageIndex === idx
                        ? 'border-pop-primary scale-105'
                        : 'border-pop-border opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={project.screenshots[idx]}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Header Image Section */}
            <div className="relative h-64 sm:h-80 w-full flex-shrink-0">
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 w-full p-8 text-white">
                <h2 className="text-3xl md:text-5xl font-extrabold mb-2 tracking-tight">{project.title}</h2>
                <p className="font-medium text-lg opacity-90">{project.subtitle}</p>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8 space-y-10 flex-1">
              
              {/* Screenshots Button - if screenshots exist */}
              {project.screenshots && project.screenshots.length > 0 && (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      setIsGalleryMode(true);
                      setCurrentImageIndex(0);
                    }}
                    className="flex items-center gap-3 px-6 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-lg font-semibold transition-colors w-fit"
                  >
                    <ImageIcon className="w-5 h-5" />
                    View Screenshots ({project.screenshots.length})
                  </button>
                  {/* Mini Thumbnails */}
                  <div className="flex gap-2">
                    {project.screenshots.slice(0, 4).map((_, idx) => (
                      <div
                        key={idx}
                        className="h-12 w-16 rounded-md overflow-hidden border border-blue-200 dark:border-blue-900/50 hover:border-blue-400 cursor-pointer transition-all hover:scale-105"
                        onClick={() => {
                          setIsGalleryMode(true);
                          setCurrentImageIndex(idx);
                        }}
                      >
                        <img
                          src={project.screenshots[idx]}
                          alt={`Screenshot ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {project.screenshots.length > 4 && (
                      <div className="h-12 w-16 rounded-md bg-pop-surface-2 border border-blue-200 dark:border-blue-900/50 flex items-center justify-center text-xs font-semibold text-pop-text-muted">
                        +{project.screenshots.length - 4}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Overview */}
              <section>
                <h3 className="text-xl font-bold text-pop-text-main mb-4">Overview</h3>
                <p className="text-pop-text-muted leading-relaxed text-lg">
                  {project.overview}
                </p>
              </section>

              {/* Challenges vs Solutions */}
              <div className="grid md:grid-cols-2 gap-8">
                <section className="bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-100 dark:border-red-900/30">
                  <div className="flex items-center gap-2 mb-4 text-red-600 dark:text-red-400">
                    <AlertTriangle className="w-5 h-5" />
                    <h3 className="text-lg font-bold">The Challenge</h3>
                  </div>
                  <ul className="space-y-4">
                    {project.challenges.map((challenge, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-pop-text-muted text-sm font-medium">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                        <span className="leading-relaxed">{challenge}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                  <div className="flex items-center gap-2 mb-4 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="w-5 h-5" />
                    <h3 className="text-lg font-bold">The Solution</h3>
                  </div>
                  <ul className="space-y-4">
                    {project.solutions.map((solution, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-pop-text-muted text-sm font-medium">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                    <span className="leading-relaxed">{solution}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Tech Stack Grid */}
          <section>
             <div className="flex items-center gap-2 mb-6 border-b border-pop-border pb-4">
                <Layers className="w-5 h-5 text-pop-primary" />
                <h3 className="text-xl font-bold text-pop-text-main">Tech Stack</h3>
              </div>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                {project.techStackDetails.map((stack, idx) => (
                  <div key={idx} className="p-4 bg-pop-surface-2 rounded-xl border border-pop-border">
                    <h4 className="text-xs font-bold text-pop-text-muted mb-3 uppercase tracking-widest">
                      {stack.category}
                    </h4>
                    <ul className="space-y-2">
                      {stack.tools.map((tool, tIdx) => (
                        <li key={tIdx} className="text-sm text-pop-text-main font-bold flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-pop-primary rounded-full" />
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
            <div className="pt-8 mt-8 border-t border-pop-border flex justify-end">
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-pop-primary text-white font-bold rounded-xl shadow-lg shadow-pop-primary/30 hover:bg-pop-primary/90 transition-colors flex items-center gap-2"
              >
                View Live Project <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectModal;