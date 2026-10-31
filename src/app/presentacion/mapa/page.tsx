import { slides } from '@/presentation/slides';
import { enabledSlides } from '@/presentation/types';
import { presentationBlocks } from '@/presentation/blocks';
import { Slide } from '@/components/presentation/Primitives';

export default function MapPage() {
  const active = enabledSlides(slides);
  return <main className="p-map">
    <p className="p-kicker">HERRAMIENTA DE ENSAYO</p>
    <h1>Mapa de la presentación</h1>
    <p>{active.length} escenas habilitadas · Navegación manual</p>
    {presentationBlocks.map(block => {
      const entries = active.map((slide, index) => ({ slide, index }))
        .filter(({ slide }) => slide.section === block.title);
      return <section className="p-map-block" key={block.title} aria-label={block.title}>
        <div className="p-map-block-heading"><h2>{block.title}</h2><span>{block.range}{!entries.length && ' · Pendiente'}</span></div>
        {!!entries.length && <div className="p-map-grid">{entries.map(({ slide, index }) =>
          <div className="p-map-card" key={slide.id}>
            <div className="p-thumbnail" aria-hidden="true" inert><div className="p-thumbnail-stage" data-theme={slide.theme ?? 'light'}><Slide id={slide.id}>{slide.render}</Slide></div></div>
            <h3 id={`map-${slide.id}`}>{String(index + 1).padStart(2, '0')} · {slide.title}</h3>
            <p>{slide.id} · {slide.speaker ?? 'Sin asignar'} · {slide.theme ?? 'light'}</p>
            <p>{slide.section}</p>
            <a className="p-map-link" aria-labelledby={`map-${slide.id}`} href={`/presentacion#${slide.id}`} />
          </div>
        )}</div>}
      </section>;
    })}
  </main>;
}
