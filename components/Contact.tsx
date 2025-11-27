import React from 'react';
import { PROFILE } from '../constants';
import { Mail, MapPin, Send, MessageSquare } from 'lucide-react';
import MagneticButton from './MagneticButton';

const Contact: React.FC = () => {
  return (
    <footer id="contact" className="relative pt-32 pb-10">
      <div className="max-w-5xl mx-auto px-6">
        
        <div className="bg-pop-primary rounded-[3rem] p-10 md:p-16 text-white relative overflow-hidden shadow-2xl reveal-on-scroll">
          {/* Decor */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-900 opacity-20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 grid md:grid-cols-2 gap-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-bold mb-6">
                <MessageSquare className="w-3 h-3" /> Let's Chat
              </div>
              <h2 className="text-4xl font-extrabold mb-6 leading-tight">
                Have an idea? <br/> Let's build it together.
              </h2>
              <p className="text-indigo-100 mb-8 text-lg">
                I'm currently available for freelance projects and full-time roles.
              </p>
              
              <div className="space-y-4">
                <a href={`mailto:${PROFILE.email}`} className="flex items-center gap-3 text-indigo-100 hover:text-white transition-colors">
                  <div className="p-2 bg-white/10 rounded-full">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span className="font-medium">{PROFILE.email}</span>
                </a>
                <div className="flex items-center gap-3 text-indigo-100">
                  <div className="p-2 bg-white/10 rounded-full">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span className="font-medium">Melbourne, Australia</span>
                </div>
              </div>
            </div>

            <form className="bg-white p-8 rounded-3xl text-slate-800 shadow-xl" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Name</label>
                  <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-pop-primary/50 transition-all" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                  <input type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-pop-primary/50 transition-all" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Message</label>
                  <textarea rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-pop-primary/50 transition-all" placeholder="Tell me about your project..."></textarea>
                </div>
                <MagneticButton className="w-full py-4 bg-pop-dark text-white font-bold rounded-xl hover:bg-black transition-colors flex justify-center items-center gap-2">
                  Send Message <Send className="w-4 h-4" />
                </MagneticButton>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-16 text-center text-slate-400 text-sm font-medium">
          <p>&copy; 2025 Low Chee Fei. Designed with ♥ and React.</p>
        </div>
      </div>
    </footer>
  );
};

export default Contact;