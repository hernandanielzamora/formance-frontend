import { Domains } from './Domains';
import { presentationBlocks } from './blocks';
import { BigStatement } from '@/components/presentation/Primitives';
import type { PresentationSlide } from './types';
import type { ReactNode } from 'react';

function BlockScene({ id, eyebrow, title, children }: {
  id: string; eyebrow: string; title: ReactNode; children: ReactNode;
}) {
  return <div className={`p-block p-block-${id}`}>
    <p className="p-kicker">{eyebrow}</p>
    <BigStatement id={id}>{title}</BigStatement>
    {children}
  </div>;
}

const team = [
  ['Hernán Daniel Zamora', 'Project Manager / coordinación'],
  ['Axel Matías Duarte Polanco', 'Integrante'],
  ['Diego Emanuel Caminos Picco', 'Integrante'],
  ['Nahuel Joaquín Isaguirre', 'Integrante'],
];
const scope = ['Perfil y objetivo', 'Rutinas', 'Entrenamiento', 'Alimentación', 'Peso', 'Resumen + IA'];
const exclusions = [
  { title: 'Profesionales', items: ['Entrenador y nutricionista', 'Dashboard profesional', 'Asignación externa de planes'] },
  { title: 'Salud', items: ['Diagnósticos y tratamientos', 'Prescripciones', 'Dietas clínicas'] },
  { title: 'Ecosistema', items: ['Wearables y sensores', 'Gimnasios', 'Integraciones institucionales'] },
  { title: 'Plataforma', items: ['Pagos y suscripciones', 'Red social y chat', 'Gamificación'] },
];

export const teamSlide: PresentationSlide = {
  id: 'equipo', section: presentationBlocks[0].title, title: 'Cuatro personas. Un mismo proyecto.',
  speaker: 'Hernán', durationSeconds: 20,
  notes: [
    'Somos el Grupo 5: Hernán Zamora, Matías Duarte, Diego Caminos y Nahuel Isaguirre.',
    'Mencionar coordinación; no atribuir responsabilidades técnicas no documentadas.',
    'No leer legajos. Pasar al problema que encontramos.',
  ],
  render: <BlockScene id="equipo" eyebrow="EL EQUIPO" title={<>Cuatro personas.<br /><span>Un mismo proyecto.</span></>}>
    <div className="p-team-grid p-motion-stagger">
      {team.map(([name, role], index) => <div className="p-team-member" key={name}>
        <span className="p-domain-number">0{index + 1}</span>
        <div><h2>{name}</h2><p>{role}</p></div>
      </div>)}
    </div>
    <p className="p-block-caption">Grupo N.º 5 · Ingeniería en Software</p>
  </BlockScene>,
};

export const academicSlides: PresentationSlide[] = [
  {
    id: 'vision-objetivos', section: presentationBlocks[1].title,
    title: 'Una misma persona. Una sola visión de su progreso.', speaker: 'Hernán',
    notes: [
      'Qué queremos construir: integrar entrenamiento, alimentación y evolución física con IA como apoyo.',
      'Para personas con actividad física estructurada; prototipo web responsive, no app móvil nativa.',
      'Para qué sirve: registrar, centralizar, comparar y analizar mediante reportes de progreso.',
      'La IA facilita comidas e interpretación; los datos y cálculos estructurados pertenecen al sistema.',
      'No repetir el problema. Pasar al recorrido y su frontera.',
    ],
    render: <BlockScene id="vision-objetivos" eyebrow="VISIÓN Y OBJETIVOS" title={<>Una misma persona.<br /><span>Una sola visión de su progreso.</span></>}>
      <div className="p-vision-content">
        <div className="p-vision-domains"><Domains integrated /></div>
        <div className="p-vision-objectives p-motion-stagger">
          <div className="p-card"><span className="p-objective-purpose">QUÉ QUEREMOS CONSTRUIR</span><h2>Objetivo del proyecto</h2><p>Integrar los tres dominios, con IA como apoyo.</p></div>
          <div className="p-card"><span className="p-objective-purpose">PARA QUÉ LE SIRVE AL USUARIO</span><h2>Objetivo del sistema</h2><p>Registrar → Centralizar<br />→ Comparar → Analizar</p></div>
        </div>
      </div>
    </BlockScene>,
  },
  {
    id: 'alcance-limites', section: presentationBlocks[1].title,
    title: 'Desde el punto de partida hasta la lectura semanal.', speaker: 'Hernán',
    notes: [
      'Alcance: perfil y objetivo, rutinas, entrenamiento, alimentación, peso y resumen con IA.',
      'Frontera: desde registro/acceso y configuración inicial hasta lectura semanal integrada.',
      'La interpretación es asistida; no reemplaza cálculos ni registros del sistema.',
      'No detallar funcionalidades. Conectar con las exclusiones deliberadas.',
    ],
    render: <BlockScene id="alcance-limites" eyebrow="ALCANCE Y LÍMITES" title={<>Desde el punto de partida<br /><span>hasta la lectura semanal.</span></>}>
      <ol className="p-scope-flow p-motion-stagger">
        {scope.map((label, index) => <li className="p-card" key={label}>
          <span className="p-domain-number">0{index + 1}</span><h2>{label}</h2>
          {index < scope.length - 1 && <span className="p-step-arrow" aria-hidden="true">→</span>}
        </li>)}
      </ol>
      <div className="p-boundaries p-scope-boundaries">
        <div><span className="p-domain-number">DESDE</span><p>Configuración inicial.</p></div>
        <div className="p-boundary-line"><span className="p-boundary-track" aria-hidden="true">→</span></div>
        <div><span className="p-domain-number">HASTA</span><p>Resumen semanal integrado<br />+ interpretación asistida.</p></div>
      </div>
    </BlockScene>,
  },
  {
    id: 'no-contempla', section: presentationBlocks[1].title, title: 'También diseñamos lo que Formance no hace.',
    speaker: 'Hernán', durationSeconds: 30,
    notes: [
      'Agrupar exclusiones: profesionales, salud, ecosistema y plataforma.',
      'No incluye asignación profesional de planes ni funciones clínicas.',
      'Acotar también fue una decisión de diseño: preservar un MVP realizable.',
      'Dar paso al futuro bloque de elicitación: entender antes de construir.',
    ],
    render: <BlockScene id="no-contempla" eyebrow="DECISIONES DE ALCANCE" title={<>También diseñamos<br /><span>lo que Formance no hace.</span></>}>
      <div className="p-exclusions p-motion-stagger">
        {exclusions.map(({ title, items }) => <div className="p-card" key={title}>
          <h2>{title}</h2><ul>{items.map(item => <li key={item}>{item}</li>)}</ul>
        </div>)}
      </div>
      <div className="p-block-ending"><p>Acotar también fue una decisión de diseño.</p><span>03 — Elicitación<br />Siguiente → entender antes de construir</span></div>
    </BlockScene>,
  },
];
