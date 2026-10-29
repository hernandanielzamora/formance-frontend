'use client';
import { useState } from 'react';
import { apiRequest, ApiError } from '@/lib/api/client';
import { getFirebaseAuth } from '@/lib/firebase/client';

type Analysis = { summary: string; trends: string[]; reviewPoints: string[] };
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
    <p>Generá una interpretación de tus registros de entrenamiento, alimentación y peso de esta semana.</p>
    <button className="primary-button" disabled={busy || disabled} onClick={() => void analyze()}>Analizar semana con IA</button>
    {busy && <p role="status">Analizando los registros de la semana…</p>}
    {error && <p className="form-error" role="alert">{error}</p>}
    {result && <div aria-live="polite" className="weekly-analysis-result">
      <h3>Resumen</h3><p>{result.analysis.summary}</p>
      <h3>Tendencias</h3><ul>{result.analysis.trends.map((text, index) => <li key={index}>{text}</li>)}</ul>
      <h3>Aspectos a revisar</h3><ul>{result.analysis.reviewPoints.map((text, index) => <li key={index}>{text}</li>)}</ul>
      <p className="food-hint">{result.cached ? 'Análisis guardado para estos registros.' : 'Análisis generado para estos registros.'}</p>
    </div>}
    <p className="food-hint">El análisis se genera a partir de los registros cargados por el usuario y tiene carácter informativo. No constituye una recomendación médica, nutricional ni profesional.</p>
  </section>;
}
