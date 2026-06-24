import { useMotion } from './motion/useMotion';

export default function App() {
  useMotion();
  return (
    <main className="relative min-h-screen bg-pop-bg text-pop-text-main font-sans">
      {/* Story shell is assembled in later tasks. */}
      <div className="flex min-h-screen items-center justify-center font-mono text-pop-text-muted">
        VOYAGE BOOTING…
      </div>
    </main>
  );
}
