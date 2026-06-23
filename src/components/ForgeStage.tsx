import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { SKILLS } from '../constants';
import { shouldRenderScene } from '../scene/capability';
import ForgeStageScene from '../scene/forge/ForgeStageScene';
import ForgeHoloPanel from './ForgeHoloPanel';

/** The Skills act — an interactive "Forge" stage on capable desktops, a readable
 *  grid otherwise. Keeps id="skills" so existing scroll triggers + the background
 *  smash keep firing. */
export default function ForgeStage() {
  const [interactive] = useState(shouldRenderScene);
  const [focusedId, setFocusedId] = useState<string | null>(null);

  if (!interactive) {
    return (
      <section id="skills" className="relative py-24 px-6 max-w-5xl mx-auto">
        <h2 className="text-3xl font-display mb-8 text-pop-text-main">Dev Stack</h2>
        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {SKILLS.map((s) => (
            <li key={s.id} className="rounded-lg border border-pop-surface/40 p-3">
              <div className="flex items-center gap-2">
                <i className={s.iconClass} aria-hidden />
                <span className="font-medium text-pop-text-main">{s.name}</span>
              </div>
              <p className="text-xs text-pop-text-muted mt-1">{s.category}</p>
              <p className="text-sm text-pop-text-muted mt-1">{s.blurb}</p>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section id="skills" className="relative" style={{ minHeight: '220vh' }}>
      <div className="sticky top-0 h-screen w-full">
        <Canvas camera={{ position: [0, 0, 8], fov: 50 }} style={{ pointerEvents: 'auto' }}>
          <ForgeStageScene onFocus={setFocusedId} focusedId={focusedId} />
        </Canvas>
        {focusedId && <ForgeHoloPanel skillId={focusedId} onClose={() => setFocusedId(null)} />}
      </div>
    </section>
  );
}
