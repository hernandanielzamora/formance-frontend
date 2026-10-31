import type { ReactNode } from 'react';
import { BigStatement } from '@/components/presentation/Primitives';
import { presentationBlocks } from './blocks';
import type { PresentationSlide } from './types';

function ElicitationScene({ id, eyebrow, title, children }: {
  id: string; eyebrow: string; title: ReactNode; children: ReactNode;
}) {
  return <div className={`p-block p-elicit p-elicit-${id}`}>
    <div className="p-elicit-eyebrow"><span>03 — ELICITACIÓN</span><p className="p-kicker">{eyebrow}</p></div>
    <BigStatement id={id}>{title}</BigStatement>
    {children}
  </div>;
}

const section = presentationBlocks[2].title;
export const elicitationSlides: PresentationSlide[] = [
  {
    id: 'contexto-proceso', section, speaker: 'Nahuel', title: 'El seguimiento ya existe. Pero ocurre por separado.',
    notes: [
      'Actor: persona con actividad física estructurada; necesita seguir entrenamiento, alimentación y evolución física.',
      'Escenario de referencia simulado, sin organización cliente real.',
      'Describir el estado actual: objetivo, registros en herramientas distintas y comparación manual.',
      'No desarrollar diagnóstico. Pasar a las alternativas técnicas analizadas.',
    ],
    render: <ElicitationScene id="contexto-proceso" eyebrow="CONTEXTO Y PROCESO ACTUAL" title={<>El seguimiento ya existe.<br /><span>Pero ocurre por separado.</span></>}>
      <div className="p-context-person"><span className="p-domain-number">ACTOR PRINCIPAL</span><h2>Persona que realiza actividad física estructurada</h2></div>
      <div className="p-current-process"><div className="p-process-end">Objetivo físico</div><span className="p-process-direction" aria-hidden="true">↓</span>
        <div className="p-context-domains p-motion-stagger">{[['Entrenamiento','Herramienta A'],['Alimentación','Herramienta B'],['Peso','Herramienta C']].map(([title,tool]) => <div className="p-card" key={title}><span className="p-domain-number">{tool}</span><h2>{title}</h2></div>)}</div>
        <span className="p-process-direction" aria-hidden="true">↓</span><div className="p-process-end">Comparación manual</div>
      </div>
      <p className="p-elicit-caption">Escenario de referencia simulado · Entrenamiento, alimentación y evolución física.</p>
    </ElicitationScene>,
  },
  {
    id: 'tic', section, speaker: 'Nahuel', title: 'Evaluamos tecnologías antes de elegir una implementación.',
    notes: ['Son alternativas analizadas, no necesariamente el stack final.', 'Distinguir interfaz, backend, persistencia, nutrición e IA.', 'React Native/Expo fue una opción inicial; el prototipo final es web responsive.', 'El stack implementado se mostrará después, en arquitectura.'],
    render: <ElicitationScene id="tic" eyebrow="ALTERNATIVAS TÉCNICAS" title={<>Evaluamos tecnologías<br /><span>antes de elegir una implementación.</span></>}>
      <dl className="p-tech-layers p-motion-stagger">{[
        ['Interfaz','React Native + Expo','Flutter'],
        ['Backend','Node.js + Express',''],
        ['Persistencia','Firebase','PostgreSQL'],
        ['Nutrición','USDA FoodData Central',''],
        ['Inteligencia artificial','Gemini','OpenAI · alternativa analizada'],
      ].map(([layer,first,second]) => <div key={layer}><dt>{layer}</dt><dd><span>{first}</span>{second && <span>{second}</span>}</dd></div>)}</dl>
      <p className="p-elicit-caption"><strong>Evaluación inicial</strong> · Alternativas analizadas, no stack final.</p>
    </ElicitationScene>,
  },
  {
    id: 'competencia', section, speaker: 'Nahuel', title: 'La oportunidad estaba en la intersección.',
    notes: ['No afirmar que no existen aplicaciones integradas.', 'Foto con IA no es un diferencial suficiente por sí solo.', 'La profundidad en fuerza y la nutrición avanzada existen en aplicaciones especializadas.', 'Formance busca integrar ambos mundos con alcance reducido de MVP.'],
    render: <ElicitationScene id="competencia" eyebrow="COMPETENCIA" title={<>La oportunidad estaba<br /><span>en la intersección.</span></>}>
      <div className="p-competition">
        <div className="p-market-zone"><h2>Nutrición / peso</h2><p>MyFitnessPal · Fitia<br />YAZIO · Lifesum</p></div>
        <div className="p-market-zone"><h2>Entrenamiento de fuerza</h2><p>Hevy · Strong</p></div>
        <div className="p-market-intersection"><div className="p-market-bridges" aria-hidden="true"><span>↘</span><span>↙</span></div><div className="p-card"><img src="/brand/formance.svg" alt="Formance"/><p>Entrenamiento estructurado + Alimentación<br />+ Peso + Análisis semanal</p></div></div>
      </div>
      <p className="p-elicit-caption">Integrar ambos mundos, con un alcance de MVP. La fotografía con IA no basta como diferencial.</p>
    </ElicitationScene>,
  },
  {
    id: 'stakeholders', section, speaker: 'Nahuel', title: '¿Quiénes intervienen en este contexto?',
    notes: ['Usuario/Deportista como actor principal.', 'Gestión y operaciones pertenecen al escenario simulado, no al equipo académico.', 'Firebase, USDA y Gemini intervienen en funciones específicas.', 'Protección de datos como marco del contexto, sin entrar en normas específicas.'],
    render: <ElicitationScene id="stakeholders" eyebrow="ACTORES DEL CONTEXTO" title={<>¿Quiénes intervienen<br /><span>en este contexto?</span></>}>
      <div className="p-stakeholder-map">
        <div className="p-stakeholder-primary"><h2>Usuario / Deportista</h2><p>Actor principal</p></div>
        <div className="p-stakeholder-brand"><span aria-hidden="true">↓</span><img src="/brand/formance.svg" alt="Formance"/></div>
        <div className="p-stakeholder-orbit p-motion-stagger">{[
          ['Gestión del servicio','Organización simulada'],
          ['Operaciones / soporte','Acompañamiento del servicio'],
          ['Proveedores tecnológicos','Firebase · USDA · Gemini'],
          ['Marco regulatorio','Protección de datos'],
        ].map(([title,detail]) => <div className="p-card" key={title}><h2>{title}</h2><p>{detail}</p></div>)}</div>
      </div>
    </ElicitationScene>,
  },
  {
    id: 'modelo-negocio', section, speaker: 'Nahuel', title: 'Antes de Formance, el servicio acompaña un proceso fragmentado.',
    notes: ['Escenario organizacional simulado, no empresa cliente real.', 'No confundir la organización con el equipo de desarrollo.', 'Dirección, atención, operaciones y tecnología describen el servicio actual.', 'No presentar PM, frontend, backend o QA como áreas del negocio.'],
    render: <ElicitationScene id="modelo-negocio" eyebrow="ESCENARIO DE REFERENCIA" title={<>Antes de Formance,<br /><span>el servicio acompaña un proceso fragmentado.</span></>}>
      <div className="p-service-areas p-motion-stagger">{[
        ['Dirección y Gestión del Servicio','Orienta al usuario'],
        ['Atención y Soporte al Usuario','Facilita recursos'],
        ['Operaciones del Servicio','Recibe información distribuida'],
        ['Tecnología y Soporte','Seguimiento con herramientas separadas'],
      ].map(([title,action],index) => <div className="p-card" key={title}><span className="p-domain-number">0{index+1}</span><h2>{title}</h2><p>{action}</p></div>)}</div>
      <p className="p-elicit-caption">Áreas del servicio simulado · Organización del servicio, no equipo de desarrollo.</p>
    </ElicitationScene>,
  },
  {
    id: 'sintesis-elicitacion', section, speaker: 'Nahuel', title: 'La elicitación nos dejó tres criterios de diseño.',
    notes: [
      'Centralización: unificar los tres dominios.',
      'Simplicidad: reducir esfuerzo manual y dispersión.',
      'Integración controlada: servicios externos e IA como apoyo, sin reemplazar registros estructurados.',
      'Son criterios derivados del análisis, no una repetición del problema ni nuevos requerimientos.',
      'Cerrar con la base para relevamiento y diagnóstico, sin desarrollarlos todavía.',
    ],
    render: <ElicitationScene id="sintesis-elicitacion" eyebrow="RESULTADO DE LA ELICITACIÓN" title={<>La elicitación nos dejó<br /><span>tres criterios de diseño.</span></>}>
      <ol className="p-summary-findings p-motion-stagger">{[
        ['Centralización','Unificar los tres dominios.'],
        ['Simplicidad','Reducir esfuerzo manual y dispersión.'],
        ['Integración controlada','Servicios externos e IA como apoyo, sin reemplazar los registros estructurados.'],
      ].map(([title,text],index) => <li className="p-card" key={title}><span className="p-domain-number">0{index+1}</span><h2>{title}</h2><p>{text}</p></li>)}</ol>
      <div className="p-summary-result"><span aria-hidden="true">↓</span><strong>Base para el diagnóstico</strong></div>
      <p className="p-elicit-caption p-next-block">Siguiente → Relevamiento y diagnóstico</p>
    </ElicitationScene>,
  },
];
