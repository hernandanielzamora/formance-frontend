import { ArchitectureDiagram, BigStatement } from '@/components/presentation/Primitives';
import { academicDeck } from './academic-deck';
import type { PresentationSlide } from './types';

function retained(id: string): PresentationSlide {
  const slide = academicDeck.find(slide => slide.id === id);
  if (!slide) throw new Error(`Missing academic slide: ${id}`);
  return slide;
}

export const backupSlides: PresentationSlide[] = [
  { id: 'stack', section: 'Backup académico', title: 'Stack tecnológico', render: <div className="p-block"><p className="p-kicker">RESPALDO · IMPLEMENTACIÓN ACTUAL</p><BigStatement id="stack">Stack tecnológico</BigStatement><ArchitectureDiagram layers={[
    { title: 'Interfaz web', detail: 'Next.js · React · TypeScript. Aplicación web responsive.' },
    { title: 'API', detail: 'Node.js · Express. Validación, cálculos y acceso a datos.' },
    { title: 'Identidad y persistencia', detail: 'Firebase Authentication · Cloud Firestore.' },
    { title: 'Servicios externos', detail: 'USDA FoodData Central para búsqueda nutricional · Gemini para estimaciones por foto e interpretación semanal.' },
  ]} /></div> },
  { id: 'arquitectura', section: 'Backup académico', title: 'Arquitectura', render: <div className="p-block"><p className="p-kicker">RESPALDO · CLIENTE Y SERVIDOR</p><BigStatement id="arquitectura">Cómo se conectan las piezas</BigStatement><ArchitectureDiagram layers={[
    { title: 'Usuario → frontend', detail: 'El usuario registra y revisa. Firebase Authentication entrega su identidad al cliente.' },
    { title: 'Frontend → API', detail: 'La API verifica el token y los permisos; valida entradas y calcula las métricas del reporte.' },
    { title: 'API → datos y proveedores', detail: 'Firestore conserva registros privados. USDA aporta información nutricional; Gemini recibe los datos necesarios para estimar o interpretar.' },
    { title: 'Resultado → usuario', detail: 'Las propuestas por foto se revisan antes de confirmar. El resumen numérico es calculado por el sistema; la interpretación semanal usa caché y cupos.' },
  ]} /></div> },
  retained('requerimientos-funcionales'),
  { id: 'casos-de-uso', section: 'Backup académico', title: 'Casos de uso', render: <div className="p-block"><p className="p-kicker">RESPALDO · USUARIO / DEPORTISTA</p><BigStatement id="casos-de-uso">Del acceso al seguimiento</BigStatement><div className="p-final-cards">{[
    ['Acceder y configurar', 'Registro, autenticación, perfil, objetivo y referencias iniciales.'],
    ['Planificar y entrenar', 'Rutinas, ejercicios, sesiones y detalle de series realizadas.'],
    ['Registrar alimentación', 'Carga manual, búsqueda de alimentos y revisión de estimaciones por foto antes de confirmar.'],
    ['Consultar el progreso', 'Peso, historial, reporte semanal y análisis de los registros.'],
  ].map(([title, text]) => <div className="p-card" key={title}><h2>{title}</h2><p>{text}</p></div>)}</div><p className="p-block-caption">Síntesis de los recorridos documentados en CU01–CU11; no asigna una numeración nueva a los casos.</p></div> },
  { ...retained('requisitos-modelado'), title: 'RNF · calidad y modelado' },
  { ...retained('as-is'), title: 'AS-IS / diagnóstico', render: <>{retained('as-is').render}<div className="p-backup-diagnosis">{retained('diagnostico').render}</div></> },
];
