interface Props {
  eyebrow: string;
  title: string;
  meta?: string;
  align?: 'left' | 'center';
}

/** Cinematic heading: eyebrow pops, title reveals by words, meta clips in. */
export default function AnimatedSectionHeading({ eyebrow, title, meta, align = 'left' }: Props) {
  return (
    <div className={align === 'center' ? 'text-center' : 'text-left'}>
      <span data-anim="pop" className="block font-mono text-xs uppercase tracking-[0.3em] text-pop-primary">
        {eyebrow}
      </span>
      <h2 data-anim="words" className="mt-2 font-display text-4xl font-bold text-pop-text-main md:text-5xl">
        {title}
      </h2>
      {meta && (
        <span data-anim="clip-left" className="mt-2 block font-mono text-sm text-pop-text-muted">
          {meta}
        </span>
      )}
    </div>
  );
}
