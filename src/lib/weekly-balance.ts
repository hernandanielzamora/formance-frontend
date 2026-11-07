import type { WeeklyReport } from './reports';

export type BalancePoint = { area: string; title: string; detail: string; action: string; href: string; tone: 'attention' | 'info' };

// Signals describe recorded facts, never adherence or a health assessment.
export function weeklyBalance(report: WeeklyReport) {
  const { training, food, weight } = report.current;
  const points: BalancePoint[] = [];
  const add = (area: string, title: string, detail: string, action: string, href: string, tone: BalancePoint['tone'] = 'attention') => points.push({ area, title, detail, action, href, tone });
  if (training.sessions.abandoned) add('Entrenamiento', `${training.sessions.abandoned} ${training.sessions.abandoned === 1 ? 'sesión interrumpida' : 'sesiones interrumpidas'}`, 'El estado indica una interrupción; puede haber series realizadas.', 'Revisá esas sesiones y comprobá que su estado refleje lo que hiciste.', '/app/entrenamiento/calendario');
  if (training.setsWithoutRecordedLoad) add('Entrenamiento', `${training.setsWithoutRecordedLoad} ${training.setsWithoutRecordedLoad === 1 ? 'serie con datos incompletos' : 'series con datos incompletos'}`, 'Faltan repeticiones o carga para calcular su volumen externo.', 'Completá las repeticiones y cargas que conozcas; una carga de 0 kg también es válida.', '/app/entrenamiento/calendario');
  const missingNutrients = Object.values(food.nutrients).filter(item => item.missingItems > 0).length;
  if (missingNutrients) add('Alimentación', `${missingNutrients} ${missingNutrients === 1 ? 'nutriente con datos incompletos' : 'nutrientes con datos incompletos'}`, 'Los totales de esos nutrientes representan solo una parte de lo registrado.', 'Revisá los alimentos con nutrientes vacíos y completá los valores que conozcas.', '/app/alimentacion');
  else if (food.estimatedItems) add('Alimentación', `${food.estimatedItems} ${food.estimatedItems === 1 ? 'alimento estimado' : 'alimentos estimados'} por foto`, 'Las porciones y los valores estimados pueden necesitar ajustes.', 'Revisá las porciones y los ingredientes de las comidas cargadas por foto.', '/app/alimentacion');
  if (weight.measurements.some(item => item.dateInferred)) add('Peso', 'Hay fechas de peso aproximadas', 'Una fecha aproximada puede ubicar una medición en otra semana.', 'Revisá las fechas de tus mediciones antes de interpretar su evolución.', '/app/peso', 'info');
  else if (weight.count === 1) add('Peso', 'Una sola medición', 'Permite ver un valor, pero no la evolución dentro de la semana.', 'Registrá tus próximas mediciones en condiciones similares para poder observar la evolución.', '/app/peso', 'info');
  if (!training.totalSessions) add('Entrenamiento', 'Sin sesiones registradas', 'No permite evaluar tu entrenamiento; no significa que no hayas entrenado.', 'Cargá las sesiones que hayas realizado para incluirlas en el balance.', '/app/entrenamiento/calendario', 'info');
  if (!food.daysWithRecords) add('Alimentación', 'Sin comidas registradas', 'No permite evaluar lo consumido.', 'Registrá tus comidas para poder revisar los nutrientes de la semana.', '/app/alimentacion', 'info');
  if (!weight.count) add('Peso', 'Sin mediciones', 'No hay datos de peso para esta semana.', 'Cuando vuelvas a medir tu peso, guardá el valor y la fecha.', '/app/peso', 'info');
  return { points, next: points[0] ?? null, hasRecords: Boolean(training.totalSessions || food.meals || weight.count) };
}
