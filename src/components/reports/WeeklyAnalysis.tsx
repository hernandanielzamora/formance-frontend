'use client';
import { useState } from 'react';
import Link from 'next/link';
import { apiRequest, ApiError } from '@/lib/api/client';
import { getFirebaseAuth } from '@/lib/firebase/client';
import { formatNumber } from '@/lib/food';
import type { WeeklyReport } from '@/lib/reports';
import { weeklyBalance } from '@/lib/weekly-balance';

type Analysis = { summary: string; trends: string[]; reviewPoints: string[]; comparison?: string;
  insights?: { training: string; nutrition: string; weight: string }; nextWeekFocus?: string[] };
type Result = { analysis: Analysis; fingerprint: string; cached: boolean; generatedAt: string };
const weekdays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

function DailyChart({ report, area }: { report: WeeklyReport; area: 'training' | 'food' | 'weight' }) {
  const labels = { training: 'sesiones completadas', food: 'kcal registradas', weight: 'kg registrados' };
  const values = report.current.days.map(day => area === 'training' ? day.training.totalSessions ? day.training.sessions.completed : null : area === 'food' ? day.food.nutrients.calories.value : day.weight?.weightKg ?? null);
  const known = values.filter((value): value is number => value !== null);
  const max = Math.max(1, ...known);
  // Weight starts at zero so small variations never look like dramatic changes.
  return <figure className={`balance-chart balance-chart-${area}`}>
    <figcaption>{area === 'weight' ? 'Mediciones de la semana' : area === 'food' ? 'Calorías registradas por día' : 'Sesiones completadas por día'}</figcaption>
    <div className="balance-bars" role="img" aria-label={Array.from({ length: 7 }, (_, index) => `${weekdays[index]}: ${index >= values.length ? 'día futuro' : values[index] === null ? 'sin registro' : `${formatNumber(values[index])} ${labels[area]}`}`).join('; ')}>
      {Array.from({ length: 7 }, (_, index) => {
        const value = values[index]; const future = index >= values.length;
        return <div className={`balance-bar-column${future ? ' is-future' : ''}`} key={index} aria-hidden="true">
          <span className="balance-bar-value">{value != null ? formatNumber(value) : '\u00a0'}</span>
          <div className="balance-bar-track">{value != null && value > 0 && <span style={{ height: `${value / max * 100}%` }} />}{!future && value === 0 && <b className="balance-zero">0</b>}{!future && value == null && <b className="balance-missing">—</b>}</div>
          <small>{weekdays[index]}</small>
        </div>;
      })}
    </div>
    <span className="balance-chart-note">{area === 'weight' ? 'Escala desde 0 kg · ' : ''}— sin registro · tenue: día futuro</span>
  </figure>;
}

export default function WeeklyAnalysis({ weekStart, timeZone, report, disabled = false }: { weekStart: string; timeZone: string; report: WeeklyReport; disabled?: boolean }) {
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const balance = weeklyBalance(report);
  const { training, food, weight } = report.current;
  async function analyze() {
    if (busy || disabled || !balance.hasRecords) return;
    setBusy(true); setError('');
    try {
      setResult(await apiRequest<Result>('reports/weekly-analysis', { method: 'POST',
        body: JSON.stringify({ weekStart, timeZone }), signal: AbortSignal.timeout(60000) }, getFirebaseAuth()));
    } catch (error) {
      setError(error instanceof ApiError && error.status === 429
        ? 'Se alcanzó el límite disponible de análisis semanal. Podés seguir consultando el balance y el reporte. Intentá más tarde.'
        : error instanceof Error ? error.message : 'No pudimos obtener el detalle. Tu balance sigue disponible.');
    } finally { setBusy(false); }
  }
  const cards = [
    { area: 'training' as const, label: 'Entrenamiento', value: String(training.sessions.completed), unit: 'sesiones completadas', bullets: [`${training.completedSets} series realizadas`, `${training.sessions.in_progress} sesiones en curso`] },
    { area: 'food' as const, label: 'Alimentación', value: formatNumber(food.nutrients.calories.average), unit: `kcal / día con datos${food.nutrients.calories.missingItems ? ' · parcial' : ''}`, bullets: [`${food.daysWithRecords} de ${report.period.elapsedDays} días con comidas`, `Proteínas: ${formatNumber(food.nutrients.protein.average)} g / día con datos${food.nutrients.protein.missingItems ? ' · parcial' : ''}`] },
    { area: 'weight' as const, label: 'Peso', value: formatNumber(weight.averageKg), unit: 'kg · promedio registrado', bullets: [`${weight.count} ${weight.count === 1 ? 'día' : 'días'} con medición`, weight.count < 2 ? 'Sin datos suficientes para ver evolución' : 'El peso no indica por sí solo cambios de grasa o músculo'] },
  ];
  return <section className="report-section weekly-analysis" aria-labelledby="weekly-analysis-title">
    <div className="balance-heading"><div><p className="eyebrow">LO CLAVE DE TUS REGISTROS</p><h2 id="weekly-analysis-title">Balance semanal</h2></div><span className="balance-period">{report.period.isPartial ? 'Semana en curso' : 'Semana cerrada'}</span></div>
    <p className="balance-intro">Tu semana de un vistazo: qué registraste y qué conviene revisar.</p>
    {!balance.hasRecords ? <div className="balance-empty"><h3>Empezá por un registro</h3><p>Cargá una sesión, una comida o una medición para ver tu balance.</p><Link className="text-link" href="/app/entrenamiento/calendario">Registrar entrenamiento →</Link></div> : <>
      <div className="balance-cards">{cards.map(card => {
        const signal = balance.points.find(point => point.area === card.label);
        return <article className="balance-card" key={card.area}>
          <div className="balance-card-heading"><h3>{card.label}</h3><span className={`balance-status ${signal?.tone ?? 'neutral'}`}>{signal?.tone === 'attention' ? '! Revisar' : signal ? '· Faltan datos' : 'Registrado'}</span></div>
          <strong className="balance-value">{card.value}</strong><span className="balance-unit">{card.unit}</span>
          <DailyChart report={report} area={card.area} />
          <ul className="balance-metrics">{card.bullets.map(text => <li key={text}>{text}</li>)}</ul>
          {signal && <p className={`balance-card-signal ${signal.tone}`}>{signal.title}</p>}
        </article>;
      })}</div>
      <div className="balance-actions-grid">
        <section className={`balance-review${balance.points.some(point => point.tone === 'attention') ? ' has-attention' : ''}`} aria-labelledby="balance-review-title">
          <h3 id="balance-review-title">Para revisar</h3>
          {balance.points.length ? <ul>{balance.points.slice(0, 3).map(point => <li key={`${point.area}:${point.title}`}><span className={`balance-point-icon ${point.tone}`} aria-hidden="true">{point.tone === 'attention' ? '!' : 'i'}</span><div><strong>{point.title}</strong><p>{point.detail}</p></div></li>)}</ul> : <p>No detectamos datos incompletos en los registros disponibles. Esto no evalúa el cumplimiento de tu objetivo.</p>}
        </section>
        <section className="balance-next" aria-labelledby="balance-next-title"><span className="balance-next-icon" aria-hidden="true">→</span><h3 id="balance-next-title">Tu próximo paso</h3><p>{balance.next?.action ?? 'Mantené el criterio de registro para poder seguir tu evolución.'}</p>{balance.next && <Link className="text-link" href={balance.next.href}>Ir a {balance.next.area.toLowerCase()} →</Link>}</section>
      </div>
      <p className="balance-data-note">Los gráficos muestran solo lo registrado. Un día sin datos no significa que no hayas comido o entrenado.</p>
      <details className="balance-detail"><summary>Ver detalle del balance <span aria-hidden="true">+</span></summary>
        {balance.points.length > 3 && <section><h3>Otros puntos para revisar</h3><ul>{balance.points.slice(3).map(point => <li key={point.title}><strong>{point.title}.</strong> {point.detail} {point.action}</li>)}</ul></section>}
        <p>Profundizá en la lectura de tus registros y en el foco para tu próximo seguimiento.</p>
        <button className="primary-button" disabled={busy || disabled} onClick={() => void analyze()}>{busy ? 'Preparando detalle…' : result ? 'Volver a consultar detalle' : 'Consultar detalle'}</button>
        <p className="food-hint">Consultar un detalle guardado no usa otra solicitud. Uno nuevo está sujeto al cupo disponible.</p>
        <div aria-live="polite" aria-busy={busy}>{busy && <p role="status">Analizando los registros de la semana…</p>}{error && <p className="form-error" role="alert">{error}</p>}
        {result && <div className="weekly-analysis-result">
          <h3>Resumen</h3><p>{result.analysis.summary}</p>
          {result.analysis.insights && <>{Object.entries(result.analysis.insights).map(([key, text]) => <section key={key}><h3>{key === 'training' ? 'Entrenamiento' : key === 'nutrition' ? 'Alimentación' : 'Peso y evolución'}</h3><p>{text}</p></section>)}</>}
          <h3>Patrones observados</h3><ul>{result.analysis.trends.map((text, index) => <li key={index}>{text}</li>)}</ul>
          <h3>Aspectos a revisar</h3><ul>{result.analysis.reviewPoints.map((text, index) => <li key={index}>{text}</li>)}</ul>
          {result.analysis.nextWeekFocus && <><h3>Foco para la próxima semana</h3><ul>{result.analysis.nextWeekFocus.map((text, index) => <li key={index}>{text}</li>)}</ul></>}
          <p className="food-hint">{result.cached ? 'Detalle guardado para estos registros.' : 'Detalle preparado para estos registros.'}</p>
        </div>}</div>
      </details>
    </>}
    <p className="food-hint balance-disclaimer">Este balance es informativo y se basa en tus registros. No constituye una recomendación médica, nutricional ni profesional.</p>
  </section>;
}
