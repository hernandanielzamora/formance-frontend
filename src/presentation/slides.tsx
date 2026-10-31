import { finalSlides } from './final-deck';
import { Domains } from './Domains';
import { elicitationSlides } from './elicitation';
import { presentationBlocks } from './blocks';
import { teamSlide, academicSlides } from './block-one';
import { BigStatement } from '@/components/presentation/Primitives';
import type { PresentationSlide } from './types';
const openingSlides: PresentationSlide[] = [
    { id: 'inicio', section: presentationBlocks[0].title, title: 'Formance', speaker: 'Hernán', durationSeconds: 20, notes: ['Saludar y presentar el proyecto.', 'No explicar funcionalidades todavía.', 'Pasar rápidamente al equipo.'], theme: 'dark', render: <><img className="p-cover-watermark" src="/brand/isotype.svg" alt="" aria-hidden="true"/><div className="p-cover-top"><img src="/brand/isotype.svg" alt=""/><span>DEFENSA FINAL · GRUPO N.º 5</span></div><div className="p-cover-main"><h1 id="inicio-title"><img src="/brand/formance-white.svg" alt="FORMANCE"/></h1><p>Sistema de información para el seguimiento integral de entrenamiento, alimentación y progreso físico</p></div><div className="p-cover-bottom"><span>Seminario de Práctica de Analista en Software</span><span>Universidad Siglo 21</span></div></> },
    { id: 'problema', section: presentationBlocks[1].title, title: 'Muchos datos. Poca integración.', speaker: 'Hernán', durationSeconds: 35, notes: ['Entrenamiento en una herramienta, alimentación en otra y peso en otra.', 'Problema = fragmentación, no falta de aplicaciones.', 'No entrar en arquitectura. Conectar con la integración.'], render: <><p className="p-kicker">EL PUNTO DE PARTIDA</p><BigStatement id="problema">Muchos datos.<br /><span>Poca integración.</span></BigStatement><Domains /></> },

];

// Preserve the approved opening visuals; insert the team before the problem.
export const slides: PresentationSlide[] = [
  openingSlides[0], teamSlide, openingSlides[1], ...academicSlides, ...elicitationSlides, ...finalSlides,
];
