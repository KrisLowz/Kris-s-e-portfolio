import React, { useState } from 'react';
import { Code2 } from 'lucide-react';
import { SKILLS } from '../constants';
import { emitWorldFocus, emitWorldBlur } from '../scene/worldEvents';

const About: React.FC = () => {
  const [avatarPopped, setAvatarPopped] = useState(false);

  // Tech-stack skills come from the shared SKILLS source so each DOM planet and
  // its 3D constellation star share one id (see constants.ts / SkillNodes).
  const innerRingSkills = SKILLS.filter((s) => s.ring === 'inner');
  const outerRingSkills = SKILLS.filter((s) => s.ring === 'outer');

  const handleAvatarClick = () => {
    setAvatarPopped(true);
    setTimeout(() => setAvatarPopped(false), 500); // Reset animation
  };

  return (
    <section id="about" data-tint="#818cf8" className="py-20 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Text Content */}
          <div data-tilt="3" className="z-10 cosmic-panel p-8 md:p-10">
            <div data-anim="pop" className="inline-block px-4 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-bold mb-4">
              About Me
            </div>
            <h2 data-anim="words" className="text-4xl font-extrabold text-pop-text-main mb-6">
              Engineering with <br /> <span className="text-pop-primary">Purpose & Precision</span>
            </h2>
            <div data-stagger="0.15" className="space-y-6 text-pop-text-muted text-lg leading-relaxed mb-8">
              <p data-anim="fade-up">
                I'm a software developer who believes that great code should be invisible to the user.
                Whether it's a mobile app or website/webpage, the experience should be fluid, intuitive, and reliable.
              </p>
              <p data-anim="fade-up">
                Currently final semester (Internship) of my degree at <strong>Swinburne University of Technology</strong>, I've already helped businesses solve real-world logistic challenges through my award-winning work.
              </p>
            </div>

            {/* Interactive Avatar */}
            <div data-anim="scale" className="flex items-center gap-6 mt-12">
               <div 
                 className={`relative w-24 h-24 cursor-pointer avatar-float ${avatarPopped ? 'pop-effect' : ''}`}
                 onClick={handleAvatarClick}
               >
                 <div className={`absolute -top-10 -right-10 bg-pop-surface shadow-lg border border-pop-border rounded-xl px-3 py-2 text-xs font-bold text-pop-text-main transition-opacity duration-300 ${avatarPopped ? 'opacity-100' : 'opacity-0'}`}>
                   Let's Code! 🚀
                 </div>
                 <img 
                   src="/assets/ME.png" 
                   alt="Avatar" 
                   className="w-full h-full rounded-full border-4 border-pop-surface shadow-xl"
                 />
                 <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-pop-surface rounded-full"></div>
               </div>
               <div>
                 <p className="font-bold text-pop-text-main text-sm">Click me!</p>
                 <p className="text-pop-text-muted text-xs">I love building cool stuff.</p>
               </div>
            </div>
          </div>

          {/* Skills Solar System */}
          <div className="solar-system-container">
            
            {/* Background Text - BOLD & VISIBLE */}
            <h1 className="solar-bg-text">SKILLS</h1>
            
            {/* Sun Core */}
            <div className="sun-core">
              <Code2 className="w-8 h-8 text-white animate-pulse" />
            </div>

            {/* Ring 1 (Inner) */}
            <div className="orbit-ring orbit-ring-1 w-[260px] h-[260px]">
               {innerRingSkills.map((skill, i) => {
                 const count = innerRingSkills.length;
                 const angle = (360 / count) * i;
                 return (
                   <div
                     key={skill.id}
                     data-skill-id={skill.id}
                     onMouseEnter={() => emitWorldFocus({ type: 'skill', id: skill.id })}
                     onMouseLeave={() => emitWorldBlur({ type: 'skill', id: skill.id })}
                     className="planet"
                     style={{
                       width: '44px',
                       height: '44px',
                       transform: `rotate(${angle}deg) translate(130px) rotate(-${angle}deg)`
                     }}
                   >
                     <div className="planet-inner-1 flex items-center justify-center w-full h-full" title={skill.name}>
                       <i className={`${skill.iconClass} text-xl`} />
                     </div>
                   </div>
                 );
               })}
            </div>

            {/* Ring 2 (Outer) */}
            <div className="orbit-ring orbit-ring-2 w-[420px] h-[420px]">
               {outerRingSkills.map((skill, i) => {
                 const count = outerRingSkills.length;
                 const angle = (360 / count) * i;
                 return (
                   <div
                     key={skill.id}
                     data-skill-id={skill.id}
                     onMouseEnter={() => emitWorldFocus({ type: 'skill', id: skill.id })}
                     onMouseLeave={() => emitWorldBlur({ type: 'skill', id: skill.id })}
                     className="planet"
                     style={{
                       width: '50px',
                       height: '50px',
                       transform: `rotate(${angle + 20}deg) translate(210px) rotate(-${angle + 20}deg)`
                     }}
                   >
                     <div className="planet-inner-2 flex items-center justify-center w-full h-full" title={skill.name}>
                       <i className={`${skill.iconClass} text-2xl`} />
                     </div>
                   </div>
                 );
               })}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
