import type { CSSProperties, ReactNode } from 'react';

/** Optional explicit reveal primitive for new slide content. Existing layouts use the same CSS tokens. */
export function MotionReveal({ children, order = 0, variant = 'rise', className = '' }: {
  children: ReactNode; order?: number; variant?: 'rise' | 'converge' | 'line'; className?: string;
}) {
  return <div className={`p-motion-reveal ${className}`} data-motion={variant}
    style={{ '--motion-order': Math.max(0, Math.min(order, 8)) } as CSSProperties}>{children}</div>;
}

/** Prepared chapter variant; not inserted into the 16-slide registry. */
export function SectionTransition({ id, chapter, title, subtitle, accent = 'lime' }: {
  id: string; chapter: string; title: string; subtitle: string; accent?: 'lime' | 'brand';
}) {
  return <div className="p-section-transition" data-accent={accent}>
    <MotionReveal order={0}><img className="p-section-isotype" src="/brand/isotype.svg" alt="" /></MotionReveal>
    <MotionReveal order={1}><p className="p-kicker">{chapter}</p></MotionReveal>
    <MotionReveal order={2}><h1 id={`${id}-title`} className="p-statement">{title}</h1></MotionReveal>
    <MotionReveal order={3}><p className="p-section-subtitle">{subtitle}</p></MotionReveal>
  </div>;
}
