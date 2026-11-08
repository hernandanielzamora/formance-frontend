'use client';
import { useState } from 'react';
import { apiRequest, ApiError } from '@/lib/api/client';
import { getFirebaseAuth } from '@/lib/firebase/client';

type Analysis = { headline: string; wins: string[]; improvements: string[]; focus: string; trend?: string; detail: { training: string; nutrition: string; weight: string } };
type Result = { analysis: Analysis; fingerprint: string; cached: boolean; generatedAt: string };
const areas = [['training', 'Entrenamiento'], ['nutrition', 'Alimentación'], ['weight', 'Peso']] as const;

// Lectura en lenguaje natural sobre la lectura calculada. Solo se pide al pulsar el botón.
export default function WeeklyAnalysis({ weekStart, timeZone, hasRecords, disabled = false }: { weekStart: string; timeZone: string; hasRecords: boolean; disabled?: boolean }) {
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function analyze() {
    if (busy || disabled || !hasRecords) return;
    setBusy(true); setError('');
    try {
      setResult(await apiRequest<Result>('reports/weekly-analysis', { method: 'POST', body: JSON.stringify({ weekStart, timeZone }), signal: AbortSignal.timeout(60000) }, getFirebaseAuth()));
    } catch (error) {
      setError(error instanceof ApiError && error.status === 429 ? 'Llegaste al límite de análisis de esta semana. El resumen sigue disponible; probá más tarde.'
        : error instanceof Error ? error.message : 'No pudimos preparar el análisis. El resumen sigue disponible.');
    } finally { setBusy(false); }
  }
  const analysis = result?.analysis;
  return <div className="coach-analysis" aria-live="polite" aria-busy={busy}>
    {!analysis && <div className="coach-intro"><p>Un texto que interpreta esta semana: qué pasó, por qué y qué priorizar, con el contexto de tus últimas 4 semanas. Para ver los números del mes completo, abrí “Resumen del mes”.<small>Para prepararla se envían a Google tus registros y las notas de entrenamientos y comidas de las últimas 4 semanas, sin tu nombre ni tu email.</small></p>
      <button className="primary-button" disabled={busy || disabled || !hasRecords} onClick={() => void analyze()}>{busy ? 'Preparando análisis…' : 'Generar análisis'}</button></div>}
    {error && <p className="form-error" role="alert">{error}</p>}
    {analysis && <div className="coach-result">
      <p className="coach-headline">{analysis.headline}</p>
      <div className="coach-columns"><div><h4>Bien</h4><ul>{analysis.wins.map(text => <li key={text}>{text}</li>)}</ul></div><div><h4>A mejorar</h4><ul>{analysis.improvements.map(text => <li key={text}>{text}</li>)}</ul></div></div>
      {analysis.trend && <p className="coach-trend"><b>Últimas 4 semanas:</b> {analysis.trend}</p>}
      <p className="coach-focus"><b>Foco:</b> {analysis.focus}</p>
      <dl className="coach-detail">{areas.map(([key, label]) => <div key={key}><dt>{label}</dt><dd>{analysis.detail[key]}</dd></div>)}</dl>
      <p className="glance-footnote">{result.cached ? 'Análisis guardado para estos registros.' : 'Análisis preparado para estos registros.'} Es orientativo y no reemplaza a un profesional.</p>
    </div>}
  </div>;
}
