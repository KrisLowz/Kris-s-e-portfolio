import React from 'react';
import { Code2 } from 'lucide-react';
import { CONFIG } from '../animations';

/**
 * Branded loading overlay. The intro timeline (animations/intro.ts) drives and
 * removes it via the data-pl-* hooks. Rendered nothing when reduced motion is on
 * so the page is immediately usable. Markup uses the existing pop-* theme tokens
 * so it matches light/dark automatically.
 */
const Preloader: React.FC = () => {
  if (CONFIG.reducedMotion || !CONFIG.toggles.preloader) return null;

  return (
    <div
      id="preloader"
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-pop-bg"
    >
      <div className="flex items-center gap-3 mb-6">
        <div
          data-pl-logo
          className="p-3 bg-pop-primary text-white rounded-2xl shadow-lg shadow-pop-primary/30"
        >
          <Code2 className="w-7 h-7" />
        </div>
        <span
          data-pl-word
          className="text-2xl font-extrabold tracking-tight text-pop-text-main"
        >
          Low<span className="text-pop-primary">.dev</span>
        </span>
      </div>
      <div className="w-48 h-[3px] bg-pop-surface-2 rounded-full overflow-hidden">
        <div data-pl-bar className="h-full w-full bg-gradient-to-r from-pop-primary to-pop-secondary" />
      </div>
    </div>
  );
};

export default Preloader;
