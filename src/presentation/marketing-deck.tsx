import type { ReactNode } from 'react';
import { BigStatement, ScreenshotFrame } from '@/components/presentation/Primitives';
import { MotionReveal } from '@/components/presentation/Motion';
import { DemoAccess } from '@/components/presentation/DemoAccess';
import { Domains } from './Domains';
import type { PresentationSlide } from './types';

export const marketingBlocks = [
  { title: '01 — El punto de partida', range: '01–03' },
  { title: '02 — La oportunidad', range: '04–05' },
  { title: '03 — La experiencia', range: '06–07' },
  { title: '04 — Formance en acción', range: '08' },
  { title: '05 — Lo que logramos', range: '09' },
] as const;

function Pitch({ id, label, title, children }: { id: string; label: string; title: ReactNode; children: ReactNode }) {
  return <div className={`p-block p-pitch p-pitch-${id}`}><p className="p-kicker">{label}</p><BigStatement id={id}>{title}</BigStatement>{children}</div>;
}

const team = ['Hernán Zamora', 'Matías Duarte Polanco', 'Diego Caminos Picco', 'Nahuel Isaguirre'];
const productViews = [
  ['01-perfil-objetivo.png', 'Perfil'],
  ['03-alimentacion-ia.png', 'Alimentación'],
  ['04-peso-progreso.png', 'Progreso'],
  ['05-reporte-ia.png', 'Resumen semanal'],
];

// Manual rehearsal estimates only. Demo takes 8–10 minutes outside the deck.
export const marketingSlides: PresentationSlide[] = [
  {
    id: 'inicio', section: marketingBlocks[0].title, title: 'Formance', speaker: 'Hernán', theme: 'dark', durationSeconds: 20,
    notes: ['Presentamos Formance, un producto funcionando: entrenamiento, alimentación y progreso en un mismo lugar.', 'Saludar en nombre del Grupo 5. No abrir con un índice del trabajo ni explicar tecnologías.'],
    render: <><img className="p-cover-watermark" src="/brand/isotype.svg" alt="" aria-hidden="true" /><div className="p-cover-top"><img src="/brand/isotype.svg" alt="" /><span>GRUPO N.º 5</span></div><div className="p-cover-main"><h1 id="inicio-title"><img src="/brand/formance-white.svg" alt="FORMANCE" /></h1><p>Entrenamiento, alimentación y progreso en un mismo lugar.</p></div><div className="p-cover-bottom"><span>Seminario</span><span>Universidad Siglo 21</span></div></>,
  },
  {
    id: 'equipo', section: marketingBlocks[0].title, title: 'Cuatro personas. Un mismo proyecto.', speaker: 'Hernán', durationSeconds: 15,
    notes: ['Presentar los cuatro nombres en pocos segundos. No leer roles, legajos ni responsabilidades técnicas.', 'Pasar directamente a la situación que vive el usuario.'],
    render: <Pitch id="equipo" label="EL EQUIPO" title={<>Cuatro personas.<br /><span>Un mismo proyecto.</span></>}><div className="p-team-grid p-motion-stagger">{team.map((name, index) => <div className="p-team-member" key={name}><span className="p-domain-number">0{index + 1}</span><h2>{name}</h2></div>)}</div></Pitch>,
  },
  {
    id: 'problema', section: marketingBlocks[0].title, title: 'Muchos datos. Poca integración.', speaker: 'Hernán', durationSeconds: 85,
    notes: ['Una persona puede usar varias herramientas: una para entrenamiento, otra para comidas y otra para peso. El problema no es la falta de aplicaciones, sino la información distribuida.', 'Contar una situación cotidiana: al terminar la semana, tiene datos, pero debe reconstruir qué pasó en cada lugar.', 'La pregunta que buscamos responder es: ¿cómo fue realmente mi semana?', 'El problema existe, pero también existen muchas herramientas que resuelven partes de él. Nahuel les muestra qué encontramos.'],
    render: <Pitch id="problema" label="UNA SITUACIÓN COTIDIANA" title={<>Muchos datos.<br /><span>Poca integración.</span></>}><Domains /><MotionReveal order={7} className="p-pitch-question"><span>La información termina distribuida.</span><p>¿Cómo fue realmente mi semana?</p></MotionReveal></Pitch>,
  },
  {
    id: 'mercado', section: marketingBlocks[1].title, title: 'Buenas herramientas. Experiencias separadas.', speaker: 'Nahuel', durationSeconds: 75,
    notes: ['Reconocer soluciones valiosas: MyFitnessPal, Fitia, YAZIO y Lifesum como referencias en nutrición/peso; Hevy y Strong en entrenamiento.', 'Son ejemplos de foco de experiencia, no categorías excluyentes ni una auditoría actual de todas sus funciones. No afirmar que no existen productos integrados.', 'No mencionar precios, rankings ni funciones no verificadas. No mostrar matrices.', 'La oportunidad que elegimos es conectar el seguimiento personal en una experiencia simple.'],
    render: <Pitch id="mercado" label="EL MERCADO YA RESUELVE PARTES DEL PROBLEMA" title={<>Buenas herramientas.<br /><span>Experiencias separadas.</span></>}><div className="p-pitch-market"><div className="p-market-zone p-card"><span className="p-domain-number">01</span><h2>Nutrición / peso</h2><div className="p-pitch-brands"><span>MyFitnessPal</span><span>Fitia</span><span>YAZIO</span><span>Lifesum</span></div></div><div className="p-market-zone p-card"><span className="p-domain-number">02</span><h2>Entrenamiento</h2><div className="p-pitch-brands"><span>Hevy</span><span>Strong</span></div></div></div><MotionReveal order={8} className="p-pitch-opportunity"><span aria-hidden="true">↗</span><p>La oportunidad estaba en conectarlos.</p></MotionReveal></Pitch>,
  },
  {
    id: 'posicionamiento', section: marketingBlocks[1].title, title: 'Formance acompaña. No reemplaza.', speaker: 'Nahuel', durationSeconds: 60,
    notes: ['Explicar en lenguaje cotidiano: Formance organiza registros y ayuda a interpretarlos. No diagnostica, prescribe ni reemplaza nutricionistas, entrenadores o médicos.', 'Los profesionales mantienen su lugar; el usuario llega con información organizada.', 'Con esa oportunidad definida, diseñamos una experiencia mucho más simple.', 'Ahí encontramos nuestra oportunidad: no reemplazar esas herramientas ni profesionales, sino integrar mejor la experiencia. Diego les muestra la propuesta.'],
    render: <Pitch id="posicionamiento" label="EL LUGAR DE FORMANCE" title={<>Formance acompaña.<br /><span>No reemplaza.</span></>}><div className="p-pitch-care p-motion-stagger"><span>Vos</span><div className="p-pitch-care-brand"><img src="/brand/formance.svg" alt="Formance" /><small>Tu información, organizada</small></div><span>Profesionales</span></div><div className="p-pitch-boundaries p-motion-stagger"><div className="p-card p-pitch-yes"><h2>Formance sí</h2><p>Organiza y centraliza.<br />Muestra evolución.<br />Ayuda a interpretar registros.</p></div><div className="p-card"><h2>Formance no</h2><p>Diagnostica ni prescribe.<br />Reemplaza nutricionistas,<br />entrenadores o médicos.</p></div></div><MotionReveal order={8} className="p-pitch-footnote">Tecnología como herramienta de seguimiento, no como sustituto profesional.</MotionReveal></Pitch>,
  },
  {
    id: 'propuesta', section: marketingBlocks[2].title, title: 'Todo tu progreso. En un solo recorrido.', speaker: 'Diego', durationSeconds: 80,
    notes: ['Partimos del perfil y objetivo. Entrenamiento, alimentación y peso se registran en el mismo lugar y se reúnen en el resumen semanal.', 'El apoyo de IA facilita la interpretación. No es el único diferencial; el valor está en la continuidad del recorrido.', 'No hablar de TO-BE, requerimientos, backend ni UML. Contar qué puede hacer una persona desde su punto de partida.', 'Esa idea se convirtió en una experiencia concreta. Matías les muestra cómo la pensamos desde el usuario.'],
    render: <Pitch id="propuesta" label="LA PROPUESTA" title={<>Todo tu progreso.<br /><span>En un solo recorrido.</span></>}><MotionReveal order={2} className="p-pitch-start"><span>Tu punto de partida</span><strong>Perfil y objetivo</strong></MotionReveal><Domains integrated /><MotionReveal order={8} className="p-pitch-summary"><div><span className="p-domain-number">TU SEMANA, EN PERSPECTIVA</span><h2>Resumen semanal</h2></div><span className="p-pitch-support">+ Apoyo de IA</span></MotionReveal></Pitch>,
  },
  {
    id: 'experiencia', section: marketingBlocks[2].title, title: 'Menos fricción. Más contexto.', speaker: 'Matías', durationSeconds: 65,
    notes: ['Tres pilares: registrar lo que realmente hiciste; alimentación manual o asistida por fotografía; peso, resumen y análisis en un mismo recorrido.', 'En la foto: la herramienta propone, vos revisás y confirmás. La carga manual siempre está disponible.', 'Los datos están asociados a la cuenta del usuario. No prometer exportaciones, cifrado o permisos que el producto no implemente.', 'Preparar la demo con una historia de uso; no volver a enumerar todas las funciones.'],
    render: <Pitch id="experiencia" label="PENSADO DESDE EL USUARIO" title={<>Menos fricción.<br /><span>Más contexto.</span></>}><div className="p-pitch-pillars p-motion-stagger">{[['01', 'Entrenamiento', 'Registrar lo que realmente hiciste.'], ['02', 'Alimentación', 'Manual o asistida por fotografía.'], ['03', 'Progreso', 'Peso + resumen semanal + análisis.']].map(([number, title, copy]) => <div className="p-card" key={title}><span className="p-domain-number">{number}</span><h2>{title}</h2><p>{copy}</p></div>)}</div><div className="p-pitch-rules p-motion-stagger"><p>IA propone → vos confirmás</p><p>Los datos siguen siendo tuyos</p><p>Siempre existe carga manual</p></div></Pitch>,
  },
  {
    id: 'demo', section: marketingBlocks[3].title, title: 'No quedó en una idea. Lo construimos.', speaker: 'Matías', handoffTo: 'Hernán', durationSeconds: 20,
    notes: [
      'Traspaso Matías → Hernán. Hasta acá les mostramos la propuesta. Ahora Hernán les va a mostrar el producto funcionando.',
      'Y lo más importante es que no quedó solamente en una propuesta. Ahora Hernán les muestra Formance funcionando.',
      'HERNÁN · DEMO CENTRAL · 8–10 minutos, fuera del contador de slides. La slide permanece en demo hasta volver y avanzar manualmente al cierre.',
      'FLOW 1 · 1–2 min. Cuenta nueva previamente verificada. Mostrar ingreso/registro sin depender de verificar correo en vivo; onboarding con edad, altura, peso, objetivo y actividad; referencia nutricional y pantalla inicial. Este es el punto de partida de cualquier usuario.',
      'FLOW 2 · 3–4 min. Cambiar a cuenta preparada con historia: planificación, sesión, series, repeticiones y carga. Luego diario, calorías/macros y alimentos. Foto: mostrar un resultado ya guardado. Gemini estima → usuario revisa → usuario confirma. No generar ni consumir cupo para ensayar.',
      'PROGRESO · 1 min. Peso, gráfico e historial. Los registros empiezan a formar una evolución, sin interpretar médicamente los cambios.',
      'RESUMEN · 2–3 min, momento fuerte. Sesiones, series, promedios de alimentación, peso y comparación del reporte. El Balance semanal actual muestra tarjetas, gráficos, Para revisar y Tu próximo paso; abrir el detalle ya guardado para resumen, patrones y aspectos a revisar. Los cálculos los realiza el sistema; Gemini interpreta datos estructurados. Consultar solo resultados existentes y evitar generaciones nuevas.',
      'No abrir código, consolas, logs, despliegues, respuestas API ni Postman salvo pregunta. No usar datos personales reales. Las capturas son registros reales de una versión anterior; el Balance semanal ya fue rediseñado. Si falla la demo, usar la galería sin llamadas externas.',
      'Volver a esta pestaña y avanzar al cierre. No hay auto-advance ni temporizador visible. Reservar 2 min de cierre y 2 min de preguntas: alrededor de 20 min junto con 7 min de introducción y 9 min de demo.',
    ],
    render: <div className="p-pitch p-pitch-demo"><div className="p-pitch-demo-copy"><p className="p-kicker">EL PRODUCTO, FUNCIONANDO</p><BigStatement id="demo">No quedó<br />en una idea.<br /><span>Lo construimos.</span></BigStatement><DemoAccess /></div><div className="p-pitch-product"><MotionReveal order={3} className="p-pitch-product-main"><ScreenshotFrame src="/presentation/demo/02-entrenamiento.png" alt="Vista real de una sesión de entrenamiento en Formance" browser fit="cover" position="top" /><span>Entrenamiento</span></MotionReveal><div className="p-pitch-product-grid p-motion-stagger">{productViews.map(([file, label]) => <figure key={file}><img src={`/presentation/demo/${file}`} alt={`Captura real de Formance: ${label}`} /><figcaption>{label}</figcaption></figure>)}</div></div></div>,
  },
  {
    id: 'cierre', section: marketingBlocks[4].title, title: '¿Logramos el objetivo?', speaker: 'Hernán', theme: 'dark', durationSeconds: 120,
    notes: ['Después de la demo, responder al objetivo con lo que acabamos de mostrar, sin recapitular el documento.', 'Sí: transformamos registros aislados en una experiencia integrada. Centralizar, acompañar y visualizar progreso.', 'Formance no busca reemplazar cómo entrenamos o quién nos acompaña. Busca que entendamos mejor la información que ya generamos.', 'Cerrar en unos 2 minutos y abrir preguntas. Si preguntan por tecnología, requerimientos o proceso, acceder al backup desde /presentacion/mapa o /presentacion/backup; no forma parte del contador principal.'],
    render: <><img className="p-closing-watermark" src="/brand/isotype.svg" alt="" aria-hidden="true" /><Pitch id="cierre" label="LO QUE ACABAMOS DE VER" title={<>¿Logramos<br /><span>el objetivo?</span></>}><MotionReveal order={4} className="p-pitch-answer"><p><strong>Sí:</strong> transformamos registros aislados<br />en una experiencia integrada.</p></MotionReveal><div className="p-pitch-closing-pillars p-motion-stagger"><p>Centralizar</p><p>Acompañar</p><p>Visualizar progreso</p></div><MotionReveal order={7} className="p-pitch-closing-copy">Formance no busca reemplazar cómo entrenamos o quién nos acompaña.<br />Busca que entendamos mejor la información que ya generamos.</MotionReveal><MotionReveal order={8} className="p-pitch-thanks"><img src="/brand/formance-white.svg" alt="Formance" /><p>Gracias. <span>¿Preguntas?</span></p></MotionReveal></Pitch></>,
  },
];
