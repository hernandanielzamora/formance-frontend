import type { CSSProperties, ReactNode } from 'react';
import { BigStatement, ScreenshotFrame } from '@/components/presentation/Primitives';
import { MotionReveal } from '@/components/presentation/Motion';
import { DemoAccess } from '@/components/presentation/DemoAccess';
import { Domains } from './Domains';
import { WeekGlanceDemo } from './WeekGlanceDemo';
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
  ['01-perfil-objetivo.png', 'Inicio'],
  ['02-entrenamiento.png', 'Entrenamiento'],
  ['03-alimentacion-ia.png', 'Alimentación'],
  ['04-peso-progreso.png', 'Peso'],
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
    notes: ['Una persona que entrena en serio suele usar una app para el gimnasio, otra para las calorías y anota el peso en el celular. El problema no es la falta de aplicaciones: la información queda desparramada.', 'Contar una situación cotidiana: al terminar la semana tiene datos, pero tiene que reconstruir qué pasó en cada lugar.', 'La pregunta que buscamos responder es: ¿cómo fue realmente mi semana?', 'El mercado ya resuelve partes de esto. Nahuel les muestra qué encontramos.'],
    render: <Pitch id="problema" label="UNA SITUACIÓN COTIDIANA" title={<>Muchos datos.<br /><span>Poca integración.</span></>}><div className="p-scattered"><Domains /><div className="p-scattered-sources" aria-hidden="true"><span>App del gimnasio</span><span>App de calorías</span><span>Notas del celular</span></div></div><MotionReveal order={7} className="p-pitch-question"><span>Cada dato en un lugar distinto.</span><p>¿Cómo fue realmente mi semana?</p></MotionReveal></Pitch>,
  },

  {
    id: 'mercado', section: marketingBlocks[1].title, title: 'Buenas apps. Cada una por su lado.', speaker: 'Nahuel', durationSeconds: 75,
    notes: ['Reconocer soluciones valiosas: MyFitnessPal, Fitia, YAZIO y Lifesum en nutrición y peso; Hevy y Strong en entrenamiento. Son referencias de foco, no una auditoría de todas sus funciones.', 'Cada una resuelve muy bien su parte. Lo que falta es una vista que conecte las tres y te diga cómo fue tu semana.', 'No mencionar precios, rankings ni funciones no verificadas. No decir que no existen productos integrados.', 'Ahí está nuestra oportunidad: conectar el seguimiento en una experiencia simple.'],
    render: <Pitch id="mercado" label="EL MERCADO YA RESUELVE PARTES DEL PROBLEMA" title={<>Buenas apps.<br /><span>Cada una por su lado.</span></>}><div className="p-islands"><div className="p-island p-card"><span className="p-domain-number">01</span><h2>Nutrición y peso</h2><div className="p-pitch-brands"><span>MyFitnessPal</span><span>Fitia</span><span>YAZIO</span><span>Lifesum</span></div></div><div className="p-island-link" aria-hidden="true"><i /><i /></div><div className="p-island-hub"><img src="/brand/formance.svg" alt="Formance" /><small>conecta las tres</small></div><div className="p-island-link is-right" aria-hidden="true"><i /><i /></div><div className="p-island p-card"><span className="p-domain-number">02</span><h2>Entrenamiento</h2><div className="p-pitch-brands"><span>Hevy</span><span>Strong</span></div></div></div><MotionReveal order={8} className="p-pitch-opportunity"><span aria-hidden="true">↗</span><p>La oportunidad: una sola vista de tu semana.</p></MotionReveal></Pitch>,
  },

  {
    id: 'posicionamiento', section: marketingBlocks[1].title, title: 'Tu información, organizada. Para vos y para quien te acompaña.', speaker: 'Nahuel', durationSeconds: 60,
    notes: ['Formance ordena lo que ya registrás y te devuelve una lectura clara de tu semana. Si trabajás con un entrenador o nutricionista, llegás a la consulta con todo resumido.', 'Mensaje positivo: acompaña tu proceso. Si preguntan por límites: Formance no diagnostica, no prescribe ni reemplaza a nutricionistas, entrenadores o médicos; organiza registros y ayuda a interpretarlos.', 'Con esa oportunidad definida, diseñamos una experiencia mucho más simple. Diego les muestra la propuesta.'],
    render: <Pitch id="posicionamiento" label="EL LUGAR DE FORMANCE" title={<>Tu información, organizada.<br /><span>Para vos y para quien te acompaña.</span></>}><div className="p-care-flow"><div className="p-care-node p-motion-step" style={{ '--step': 0 } as CSSProperties}><span>01</span><strong>Vos</strong><small>Registrás lo que hacés y comés</small></div><i className="p-care-arrow" style={{ '--step': 1 } as CSSProperties} aria-hidden="true" /><div className="p-care-node is-brand p-motion-step" style={{ '--step': 2 } as CSSProperties}><img src="/brand/formance.svg" alt="Formance" /><small>Ordena todo y te muestra tu semana</small></div><i className="p-care-arrow" style={{ '--step': 3 } as CSSProperties} aria-hidden="true" /><div className="p-care-node p-motion-step" style={{ '--step': 4 } as CSSProperties}><span>02</span><strong>Tu entrenador o nutricionista</strong><small>Recibe tu progreso resumido</small></div></div><MotionReveal order={8} className="p-pitch-footnote">Formance acompaña tu proceso: suma claridad, no reemplaza a nadie.</MotionReveal></Pitch>,
  },

  {
    id: 'propuesta', section: marketingBlocks[2].title, title: 'Todo tu progreso. En un solo recorrido.', speaker: 'Diego', durationSeconds: 80,
    notes: ['Partimos del perfil y objetivo. Entrenamiento, alimentación y peso se registran en el mismo lugar y se reúnen en el resumen semanal.', 'El apoyo de IA facilita la interpretación. No es el único diferencial; el valor está en la continuidad del recorrido.', 'No hablar de TO-BE, requerimientos, backend ni UML. Contar qué puede hacer una persona desde su punto de partida.', 'Esa idea se convirtió en una experiencia concreta. Matías les muestra cómo la pensamos desde el usuario.'],
    render: <Pitch id="propuesta" label="LA PROPUESTA" title={<>Todo tu progreso.<br /><span>En un solo recorrido.</span></>}><MotionReveal order={2} className="p-pitch-start"><span>Tu punto de partida</span><strong>Perfil y objetivo</strong></MotionReveal><Domains integrated /><MotionReveal order={8} className="p-pitch-summary"><div><span className="p-domain-number">TODO SE JUNTA EN</span><h2>Tu semana, en 10 segundos</h2></div><span className="p-pitch-support">+ tu foco para la semana que viene</span></MotionReveal></Pitch>,
  },
  {
    id: 'experiencia', section: marketingBlocks[2].title, title: 'Tu semana, en 10 segundos.', speaker: 'Matías', durationSeconds: 65,
    notes: ['Este es el corazón del producto. Al abrir tus reportes ves en segundos qué pasó: si cumpliste tu rutina, si comiste en objetivo y cómo se movió tu peso.', 'Abajo, lo que hiciste bien y dónde mejorar, con un solo foco para la semana siguiente. Si querés más detalle, está a un toque; no es lo primero que ves.', 'Registrar es simple: manual o con una foto. La IA propone y vos confirmás; los números los calcula el sistema con tus registros.', 'Los datos de esta slide son los de la cuenta de demostración que van a ver en vivo. Preparar el pase a la demo.'],
    render: <Pitch id="experiencia" label="LO QUE VE CADA USUARIO" title={<>Tu semana,<br /><span>en 10 segundos.</span></>}><WeekGlanceDemo /><div className="p-pitch-rules p-motion-stagger"><p>Registro manual o con una foto</p><p>La IA propone, vos confirmás</p><p>Calculado con tus propios datos</p></div></Pitch>,
  },

  {
    id: 'demo', section: marketingBlocks[3].title, title: 'No quedó en una idea. Lo construimos.', speaker: 'Matías', handoffTo: 'Hernán', durationSeconds: 20,
    notes: [
      'Traspaso Matías → Hernán. Lo que acaban de ver no es un diseño: es la app real. Hernán les muestra Formance funcionando.',
      'Y lo más importante es que no quedó solamente en una propuesta. Ahora Hernán les muestra Formance funcionando.',
      'HERNÁN · DEMO CENTRAL · 8–10 minutos, fuera del contador de slides. La slide permanece en demo hasta volver y avanzar manualmente al cierre.',
      'FLOW 1 · 1–2 min. Cuenta nueva previamente verificada. Mostrar ingreso/registro sin depender de verificar correo en vivo; onboarding con edad, altura, peso, objetivo y actividad; referencia nutricional y pantalla inicial. Este es el punto de partida de cualquier usuario.',
      'FLOW 2 · 3–4 min. Cambiar a cuenta preparada con historia: planificación, sesión, series, repeticiones y carga. Luego diario, calorías/macros y alimentos. Foto: mostrar un resultado ya guardado. Gemini estima → usuario revisa → usuario confirma. No generar ni consumir cupo para ensayar.',
      'PROGRESO · 1 min. Peso, gráfico e historial. Los registros empiezan a formar una evolución, sin interpretar médicamente los cambios.',
      'RESUMEN · 2–3 min, momento fuerte. Empezar en Mi resumen (hoy y esta semana) y pasar a Reportes: semana del 2/11 = la mejor (4/4, récords, −0,4 kg). Abrir el calendario de semanas y mostrar la del 19/10 en naranja (viaje). En Más detalle: Resumen del mes de octubre y el Análisis escrito ya generado. Los cálculos los realiza el sistema; Gemini interpreta datos estructurados y las notas. Usar análisis ya guardados para no gastar cupo.',
      'No abrir código, consolas, logs, despliegues, respuestas API ni Postman salvo pregunta. La cuenta usa datos de demostración. Las capturas de respaldo son de la versión actual con esos mismos datos: si falla la demo, usar la galería sin llamadas externas.',
      'Volver a esta pestaña y avanzar al cierre. No hay auto-advance ni temporizador visible. Reservar 2 min de cierre y 2 min de preguntas: alrededor de 20 min junto con 7 min de introducción y 9 min de demo.',
    ],
    render: <div className="p-pitch p-pitch-demo"><div className="p-pitch-demo-copy"><p className="p-kicker">EL PRODUCTO, FUNCIONANDO</p><BigStatement id="demo">No quedó<br />en una idea.<br /><span>Lo construimos.</span></BigStatement><DemoAccess /></div><div className="p-pitch-product"><MotionReveal order={3} className="p-pitch-product-main"><ScreenshotFrame src="/presentation/demo/05-reporte-ia.png" alt="Formance: tu semana en 10 segundos" browser fit="cover" position="top" /><span>Tu semana en 10 segundos</span></MotionReveal><div className="p-pitch-product-grid p-motion-stagger">{productViews.map(([file, label]) => <figure key={file}><img src={`/presentation/demo/${file}`} alt={`Captura de Formance con datos de demostración: ${label}`} /><figcaption>{label}</figcaption></figure>)}</div></div></div>,
  },
  {
    id: 'cierre', section: marketingBlocks[4].title, title: 'Registrá. Entendé. Mejorá.', speaker: 'Hernán', theme: 'dark', durationSeconds: 120,
    notes: ['Después de la demo, responder al objetivo con lo que acabamos de mostrar, sin recapitular el documento.', 'Sí: transformamos registros aislados en una experiencia integrada. Todo en un lugar, tu semana en 10 segundos y tu progreso a la vista.', 'Formance no busca reemplazar cómo entrenamos o quién nos acompaña. Busca que entendamos mejor la información que ya generamos.', 'Cerrar en unos 2 minutos y abrir preguntas. Si preguntan por tecnología, requerimientos o proceso, acceder al backup desde /presentacion/mapa o /presentacion/backup; no forma parte del contador principal.'],
    render: <><img className="p-closing-watermark" src="/brand/isotype.svg" alt="" aria-hidden="true" /><Pitch id="cierre" label="LO QUE ACABAMOS DE VER" title={<>Registrá. Entendé.<br /><span>Mejorá.</span></>}><MotionReveal order={4} className="p-pitch-answer"><p><strong>Objetivo cumplido:</strong> transformamos registros aislados<br />en una experiencia integrada.</p></MotionReveal><div className="p-pitch-closing-pillars p-motion-stagger"><p>Todo en un lugar</p><p>Tu semana en 10 segundos</p><p>Tu progreso, a la vista</p></div><MotionReveal order={7} className="p-pitch-closing-copy">Para que entiendas mejor la información que ya generás, semana a semana.</MotionReveal><MotionReveal order={8} className="p-pitch-thanks"><img src="/brand/formance-white.svg" alt="Formance" /><p>Gracias. <span>¿Preguntas?</span></p></MotionReveal></Pitch></>,
  },

];
