import Link from 'next/link';
import { backupSlides } from '@/presentation/backup-deck';
import { Slide } from '@/components/presentation/Primitives';

export default function BackupPage() {
  return <main className="p-backup"><div className="p-backup-heading"><div><p className="p-kicker">SOLO PARA PREGUNTAS</p><h1>Backup académico</h1><p>Fuera del recorrido y del contador de la presentación principal.</p></div><Link href="/presentacion/mapa">Volver al mapa →</Link></div><nav className="p-backup-nav" aria-label="Temas de respaldo">{backupSlides.map(slide => <a key={slide.id} href={`#${slide.id}`}>{slide.title}</a>)}</nav>{backupSlides.map(slide => <section key={slide.id} id={slide.id} className="p-backup-topic" aria-label={slide.title}><div className="p-backup-topic-heading"><h2>{slide.title}</h2><a href="#">Volver a temas ↑</a></div><div className="p-backup-stage" data-theme="light"><Slide id={slide.id}>{slide.render}</Slide></div></section>)}<Link className="p-cta" href="/presentacion#cierre">Volver al cierre →</Link></main>;
}
