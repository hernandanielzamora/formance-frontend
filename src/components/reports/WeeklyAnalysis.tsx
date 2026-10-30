'use client';
import { useState } from 'react';
import { apiRequest, ApiError } from '@/lib/api/client';
import { getFirebaseAuth } from '@/lib/firebase/client';

// Optional enriched fields keep this frontend compatible with a v1 API during rollout.
type Analysis = { summary: string; trends: string[]; reviewPoints: string[]; comparison?: string;
  insights?: { training: string; nutrition: string; weight: string }; nextWeekFocus?: string[] };
type Result = { analysis: Analysis; fingerprint: string; cached: boolean; generatedAt: string };

export default function WeeklyAnalysis({ weekStart, timeZone, disabled = false }: { weekStart: string; timeZone: string; disabled?: boolean }) {
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function analyze() {
    if (busy || disabled) return;
    setBusy(true); setError(''); setResult(null);
    try {
      setResult(await apiRequest<Result>('reports/weekly-analysis', { method: 'POST',
        body: JSON.stringify({ weekStart, timeZone }), signal: AbortSignal.timeout(60000) }, getFirebaseAuth()));
    } catch (error) {
      setError(error instanceof ApiError && error.status === 429
        ? 'Se alcanzó el límite disponible de análisis semanal. Podés seguir consultando el reporte. Intentá más tarde.'
        : error instanceof Error ? error.message : 'No pudimos generar el análisis. El reporte semanal sigue disponible.');
    } finally { setBusy(false); }
  }
  return <section className="report-section weekly-analysis" aria-labelledby="weekly-analysis-title" aria-busy={busy}>
    <h2 id="weekly-analysis-title">Análisis de la semana con IA</h2>
    <p>Entendé tu semana de entrenamiento, alimentación y peso, comparala con la anterior y encontrá aspectos concretos para revisar.</p>
    <p className="food-hint">Se comparan los mismos días transcurridos y solo los datos disponibles. Cada generación nueva utiliza una solicitud de tu cupo; consultar el análisis guardado no consume otra.</p>
    <button className="primary-button" disabled={busy || disabled} onClick={() => void analyze()}>Analizar semana con IA</button>
    {busy && <p role="status">Analizando los registros de la semana…</p>}
    {error && <p className="form-error" role="alert">{error}</p>}
    {result && <div aria-live="polite" className="weekly-analysis-result">
      <h3>Resumen</h3><p>{result.analysis.summary}</p>
      {result.analysis.comparison && <section className="weekly-comparison" aria-label="Comparación con la semana anterior"><h3>Comparación con la semana anterior</h3><p className="food-hint">Comparación calculada por Formance a partir de los registros disponibles.</p><p>{result.analysis.comparison}</p></section>}
      {result.analysis.insights && <div className="weekly-domain-insights" aria-label="Lectura por área">
        <section><h3>Entrenamiento</h3><p>{result.analysis.insights.training}</p></section>
        <section><h3>Alimentación</h3><p>{result.analysis.insights.nutrition}</p></section>
        <section><h3>Peso y evolución</h3><p>{result.analysis.insights.weight}</p></section>
      </div>}
      <h3>Tendencias</h3><ul>{result.analysis.trends.map((text, index) => <li key={index}>{text}</li>)}</ul>
      <h3>Aspectos a revisar</h3><ul>{result.analysis.reviewPoints.map((text, index) => <li key={index}>{text}</li>)}</ul>
      {result.analysis.nextWeekFocus && <section className="weekly-next-focus" aria-label="Foco para la próxima semana"><h3>Foco para la próxima semana</h3><ol>{result.analysis.nextWeekFocus.map((text, index) => <li key={index}>{text}</li>)}</ol></section>}
      <p className="food-hint">{result.cached ? 'Análisis guardado para estos registros.' : 'Análisis generado para estos registros.'}</p>
    </div>}
    <p className="food-hint">El análisis se genera a partir de los registros cargados por el usuario y tiene carácter informativo. No constituye una recomendación médica, nutricional ni profesional.</p>
  </section>;
}
