import React from 'react';
import { SKILLS, PROFILE } from '../constants';
import { Code2, Smartphone, Database } from 'lucide-react';

const About: React.FC = () => {
  return (
    <section id="about" className="py-32 relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          
          <div className="reveal-on-scroll">
            <div className="inline-block px-4 py-1 bg-soft-blue text-blue-700 rounded-full text-sm font-bold mb-4">
              About Me
            </div>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-6">
              Engineering with <br /> <span className="text-pop-primary">Purpose & Precision</span>
            </h2>
            <div className="space-y-6 text-slate-600 text-lg leading-relaxed">
              <p>
                I'm a software developer who believes that great code should be invisible to the user. 
                Whether it's a mobile app or an enterprise ERP, the experience should be fluid, intuitive, and reliable.
              </p>
              <p>
                Currently finishing my degree at <strong>Swinburne University</strong>, I've already helped businesses solve real-world logistic challenges through my award-winning work.
              </p>
            </div>
          </div>

          <div className="grid gap-6 reveal-on-scroll">
            {SKILLS.map((category, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${
                    index === 0 ? 'bg-blue-100 text-blue-600' :
                    index === 1 ? 'bg-purple-100 text-purple-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {index === 0 && <Code2 className="w-5 h-5" />}
                    {index === 1 && <Smartphone className="w-5 h-5" />}
                    {index === 2 && <Database className="w-5 h-5" />}
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">{category.title}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill) => (
                    <span 
                      key={skill} 
                      className="px-3 py-1 text-sm font-medium text-slate-600 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-default"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;