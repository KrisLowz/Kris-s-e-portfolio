import React from 'react';
import { Brain, Users, Clock, MessageCircle, Target, Zap, Briefcase } from 'lucide-react';

const skills = [
  {
    title: 'Problem Solving',
    icon: <Brain className="w-10 h-10 text-pop-primary" />,
    desc: 'Analyzing complex issues to find efficient, scalable solutions.'
  },
  {
    title: 'Critical Thinking',
    icon: <Target className="w-10 h-10 text-purple-500" />,
    desc: 'Evaluating data objectively to make informed technical decisions.'
  },
  {
    title: 'Communication',
    icon: <MessageCircle className="w-10 h-10 text-pink-500" />,
    desc: 'Translating technical concepts for non-technical stakeholders.'
  },
  {
    title: 'Project Mgmt',
    icon: <Briefcase className="w-10 h-10 text-blue-500" />,
    desc: 'Agile methodologies, sprint planning, and backlog management.'
  },
  {
    title: 'Time Mgmt',
    icon: <Clock className="w-10 h-10 text-green-500" />,
    desc: 'Prioritizing tasks effectively to meet strict deployment deadlines.'
  },
  {
    title: 'Teamwork',
    icon: <Users className="w-10 h-10 text-orange-500" />,
    desc: 'Collaborating across cross-functional teams to drive product success.'
  },
  {
    title: 'Adaptability',
    icon: <Zap className="w-10 h-10 text-yellow-500" />,
    desc: 'Quickly learning new stacks (like Flutter/React) as project needs evolve.'
  },
];

const ProfessionalSkills: React.FC = () => {
  return (
    <section className="py-20 relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16 reveal-on-scroll">
           <div className="inline-block px-4 py-1 bg-pop-surface-2 border border-pop-border rounded-full text-xs font-bold mb-4 tracking-wide uppercase text-pop-text-muted">
             Beyond the Code
           </div>
           <h2 className="text-3xl md:text-4xl font-extrabold text-pop-text-main">
             Professional Skills
           </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {skills.map((skill, idx) => (
            <div key={idx} className="skill-card h-48 cursor-pointer reveal-on-scroll">
              <div className="skill-card-inner relative w-full h-full bg-pop-surface border border-pop-border rounded-2xl shadow-sm hover:shadow-lg hover:border-pop-primary transition-all">
                
                {/* Front */}
                <div className="skill-card-front">
                  <div className="mb-4 p-3 bg-pop-surface-2 rounded-full">
                    {skill.icon}
                  </div>
                  <h3 className="font-bold text-pop-text-main">{skill.title}</h3>
                </div>

                {/* Back */}
                <div className="skill-card-back rounded-2xl">
                   <h3 className="font-bold text-pop-primary text-sm mb-2">{skill.title}</h3>
                   <p className="text-xs text-pop-text-muted leading-relaxed">
                     {skill.desc}
                   </p>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProfessionalSkills;