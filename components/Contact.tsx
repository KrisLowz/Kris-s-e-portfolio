import React from 'react';
import { PROFILE } from '../constants';
import { Mail, MapPin } from 'lucide-react';

const Contact: React.FC = () => {
  return (
    <footer id="contact" className="bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 pt-20 pb-10 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">Let's Work Together</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md">
              I'm currently looking for opportunities to apply my skills in software development. 
              Whether you have a question or just want to say hi, I'll try my best to get back to you!
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300">
                <div className="w-10 h-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-transparent rounded-full flex items-center justify-center text-brand-primary shadow-sm dark:shadow-none">
                  <Mail className="w-5 h-5" />
                </div>
                <a href={`mailto:${PROFILE.email}`} className="hover:text-brand-primary dark:hover:text-white transition-colors">
                  {PROFILE.email}
                </a>
              </div>
              <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300">
                <div className="w-10 h-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-transparent rounded-full flex items-center justify-center text-brand-primary shadow-sm dark:shadow-none">
                  <MapPin className="w-5 h-5" />
                </div>
                <span>Melbourne, Australia / Remote</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-brand-surface p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg dark:shadow-none">
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-2">Name</label>
                <input type="text" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-brand-primary transition-colors placeholder-slate-400 dark:placeholder-slate-600" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-2">Email</label>
                <input type="email" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-brand-primary transition-colors placeholder-slate-400 dark:placeholder-slate-600" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-400 mb-2">Message</label>
                <textarea rows={4} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-brand-primary transition-colors placeholder-slate-400 dark:placeholder-slate-600" placeholder="Hello, I'd like to discuss..."></textarea>
              </div>
              <button className="w-full bg-brand-primary text-slate-900 font-bold py-3 rounded-lg hover:bg-emerald-400 transition-colors shadow-md hover:shadow-lg">
                Send Message
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 dark:text-slate-500 text-sm">
          <p>&copy; 2025 Low Chee Fei. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-800 dark:hover:text-slate-300">Privacy Policy</a>
            <a href="#" className="hover:text-slate-800 dark:hover:text-slate-300">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Contact;