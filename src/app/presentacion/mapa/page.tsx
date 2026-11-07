import Link from 'next/link';
import { slides } from '@/presentation/slides';
import { enabledSlides } from '@/presentation/types';
import { marketingBlocks } from '@/presentation/marketing-deck';
import { backupSlides } from '@/presentation/backup-deck';
import { Slide } from '@/components/presentation/Primitives';

export default function MapPage() {
  const active = enabledSlides(slides);
  return <main className="p-map">
    <p className="p-kicker">HERRAMIENTA DE ENSAYO</p><h1>Mapa de la presentación</h1><p>9 slides principales · Demo en vivo · Navegación manual</p>
    <div className="p-map-main" aria-label="Presentación principal"><h2 className="p-map-section-title">Presentación principal · 01–09</h2>{marketingBlocks.map(block => {
      const entries = active.map((slide, index) => ({ slide, index })).filter(({ slide }) => slide.section === block.title);
      return <section className="p-map-block" key={block.title} aria-label={block.title}>
        <div className="p-map-block-heading"><h2>{block.title}</h2><span>{block.range}</span></div>
        <div className="p-map-grid">{entries.map(({ slide, index }) => <div className="p-map-card" key={slide.id}>
          <div className="p-thumbnail" aria-hidden="true" inert><div className="p-thumbnail-stage" data-theme={slide.theme ?? 'light'}><Slide id={slide.id}>{slide.render}</Slide></div></div>
          <h3 id={`map-${slide.id}`}>{String(index + 1).padStart(2, '0')} · {slide.title}</h3><p>{slide.speaker}{slide.handoffTo && ` → ${slide.handoffTo}`} · {slide.theme ?? 'light'}</p>
          <a className="p-map-link" aria-labelledby={`map-${slide.id}`} href={`/presentacion#${slide.id}`} />
          {!!slide.notes?.length && <details className="p-map-notes"><summary>Notas del presentador</summary><ul>{slide.notes.map((note, index) => <li key={index}>{note}</li>)}</ul></details>}
        </div>)}</div>
      </section>;
    })}</div>
    <section className="p-map-backup" aria-label="Backup académico"><h2 className="p-map-section-title">Backup académico</h2><p>Para preguntas. No forma parte de las nueve slides.</p><nav aria-label="Acceso al backup">{backupSlides.map(slide => <Link className="p-backup-map-link" key={slide.id} href={`/presentacion/backup#${slide.id}`}>{slide.title} ↗</Link>)}</nav></section>
  </main>;
}
