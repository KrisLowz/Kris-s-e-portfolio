import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import ForgeStageScene from './ForgeStageScene';
import ForgeHoloPanel from '../../components/ForgeHoloPanel';

export default function ForgeStageInteractive() {
  const [focusedId, setFocusedId] = useState<string | null>(null);
  return (
    <>
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }} style={{ pointerEvents: 'auto' }}>
        <ForgeStageScene onFocus={setFocusedId} focusedId={focusedId} />
      </Canvas>
      {focusedId && <ForgeHoloPanel skillId={focusedId} onClose={() => setFocusedId(null)} />}
    </>
  );
}
