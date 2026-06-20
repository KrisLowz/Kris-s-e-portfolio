import React, { useState } from 'react';
import { Brain, Target, MessageCircle, Briefcase, Clock, Users, Zap } from 'lucide-react';
import ConstellationCluster, { ConstNode } from './ConstellationCluster';

// Soft skills, reintegrated as a "how I work" trait constellation.
const TRAITS: ConstNode[] = [
  { id: 'trait-problem', label: 'Problem Solving', icon: <Brain /> },
  { id: 'trait-critical', label: 'Critical Thinking', icon: <Target /> },
  { id: 'trait-comm', label: 'Communication', icon: <MessageCircle /> },
  { id: 'trait-pm', label: 'Project Mgmt', icon: <Briefcase /> },
  { id: 'trait-time', label: 'Time Mgmt', icon: <Clock /> },
  { id: 'trait-team', label: 'Teamwork', icon: <Users /> },
  { id: 'trait-adapt', label: 'Adaptability', icon: <Zap /> },
];

/**
 * About in the Living Constellation language: a frameless luminous bio readout
 * (soft scrim for legibility, no card), a glowing avatar "portal", and a "How I
 * Work" trait constellation reintegrating the old soft skills.
 */
const About: React.FC = () => {
  const [popped, setPopped] = useState(false);

  return (
    <section id="about" data-tint="#818cf8" className="relative overflow-hidden py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Frameless bio readout */}
          <div className="about-readout relative z-10">
            <p
              data-anim="pop"
              data-scramble
              className="mb-3 text-[11px] font-bold uppercase tracking-[0.35em] text-pop-primary/80"
            >
              About Me
            </p>
            <h2
              data-anim="words"
              className="const-title mb-6 text-4xl font-extrabold leading-tight text-pop-text-main md:text-5xl"
            >
              Engineering with <br />
              <span className="text-gradient-flow bg-gradient-to-r from-pop-primary via-pop-secondary to-pop-primary bg-clip-text text-transparent">
                Purpose &amp; Precision
              </span>
            </h2>
            <div
              data-stagger="0.15"
              className="mb-8 max-w-xl space-y-5 text-lg leading-relaxed text-pop-text-muted"
            >
              <p data-anim="fade-up">
                I'm a software developer who believes that great code should be invisible to the
                user. Whether it's a mobile app or a website, the experience should be fluid,
                intuitive, and reliable.
              </p>
              <p data-anim="fade-up">
                Currently in my final semester (Internship) at{' '}
                <strong className="text-pop-text-main">Swinburne University of Technology</strong>,
                I've already helped businesses solve real-world logistics challenges through my
                award-winning work.
              </p>
            </div>

            <div data-anim="scale" className="flex items-center gap-5">
              <button
                type="button"
                onClick={() => {
                  setPopped(true);
                  setTimeout(() => setPopped(false), 500);
                }}
                className={`about-portal ${popped ? 'popped' : ''}`}
                aria-label="Low Chee Fei avatar"
              >
                <img src="/assets/ME.png" alt="Low Chee Fei" />
              </button>
              <div>
                <p className="text-sm font-bold text-pop-text-main">Low Chee Fei</p>
                <p className="text-xs text-pop-text-muted">Class of 2025 · Swinburne</p>
              </div>
            </div>
          </div>

          {/* "How I work" trait constellation */}
          <div className="relative">
            <p className="mb-2 text-center text-[11px] font-bold uppercase tracking-[0.35em] text-pop-secondary/70">
              How I Work
            </p>
            <ConstellationCluster nodes={TRAITS} gradientId="traits-grad" density={2.4} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
