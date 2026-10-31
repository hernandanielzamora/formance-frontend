import type { CSSProperties, ReactNode } from 'react';
export function Slide({ children, id }: {
    children: ReactNode;
    id: string;
}) { return <article className="p-slide" aria-labelledby={`${id}-title`}>{children}</article>; }
export function BigStatement({ children, id }: {
    children: ReactNode;
    id: string;
}) { return <h1 id={`${id}-title`} className="p-statement">{children}</h1>; }
export function SectionIntro({ number, title, children }: {
    number: string;
    title: string;
    children?: ReactNode;
}) { return <div><p className="p-kicker">{number}</p><h2>{title}</h2>{children}</div>; }
export function SplitLayout({ children }: {
    children: ReactNode;
}) { return <div className="p-split">{children}</div>; }
export function MetricCard({ value, label }: {
    value: string;
    label: string;
}) { return <div className="p-card"><strong>{value}</strong><p>{label}</p></div>; }
export function ProcessFlow({ steps }: {
    steps: ReactNode[];
}) { return <ol className="p-flow p-motion-stagger">{steps.map((step, i) => <li className="p-card" key={i}>{step}{i < steps.length - 1 && <span aria-hidden="true"> →</span>}</li>)}</ol>; }
export function Comparison({ before, after }: {
    before: ReactNode;
    after: ReactNode;
}) { return <SplitLayout><div className="p-card">{before}</div><div className="p-card p-accent">{after}</div></SplitLayout>; }
export function QuoteOrProblem({ children }: {
    children: ReactNode;
}) { return <blockquote className="p-quote">{children}</blockquote>; }
export function ArchitectureDiagram({ layers }: {
    layers: {
        title: string;
        detail: string;
    }[];
}) { return <ol className="p-architecture p-motion-stagger">{layers.map(layer => <li className="p-card" key={layer.title}><strong>{layer.title}</strong><p>{layer.detail}</p></li>)}</ol>; }
export type ScreenshotProps = {
    src: string;
    alt: string;
    fit?: 'contain' | 'cover';
    position?: string;
    browser?: boolean;
    callouts?: {
        label: string;
        x: number;
        y: number;
        width?: number;
        height?: number;
    }[];
};
export function ScreenshotFrame({ src, alt, fit = 'contain', position = 'center', browser = false, callouts = [] }: ScreenshotProps) { return <figure className="p-screenshot">{browser && <div className="p-browser" aria-hidden="true">● ● ●</div>}<div className="p-image"><img src={src} alt={alt} style={{ objectFit: fit, objectPosition: position }}/>{callouts.map(c => <span key={c.label} className="p-callout" style={{ left: `${c.x}%`, top: `${c.y}%`, width: c.width ? `${c.width}%` : undefined, height: c.height ? `${c.height}%` : undefined } as CSSProperties}>{c.label}</span>)}</div></figure>; }
export function DemoTransition() { return <div><h2>Formance en acción</h2><a className="p-cta" href="/app" target="_blank" rel="noopener noreferrer">Ver Formance en acción ↗</a><p><a href="/presentacion#cierre">Volver al cierre (cuando esté disponible)</a></p></div>; }
export function DemoFallback({ screenshots = [] }: {
    screenshots?: ScreenshotProps[];
}) { return <div className="p-fallback">{screenshots.length ? screenshots.map(s => <ScreenshotFrame key={s.src} {...s}/>) : <p>Respaldo visual pendiente de selección.</p>}</div>; }
