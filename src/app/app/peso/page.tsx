'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/provider';
import { useCachedQuery, useDashboardProfile, useApiMutationRequest } from '@/lib/store/hooks';
import { addDays, localDate, dateLabel } from '@/lib/training-sessions';
import { formatNumber } from '@/lib/food';
import type { WeightHistory, WeightMeasurement } from '@/lib/weight';
import WeightChart from '@/components/weight/WeightChart';
import DashboardLoading from '@/components/ui/DashboardLoading';

export default function WeightPage() {
  const session = useAuth();
  const [zone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [from, setFrom] = useState(() => addDays(localDate(), -89)); const [to, setTo] = useState(localDate);
  const [date, setDate] = useState(localDate); const [weight, setWeight] = useState(''); const [note, setNote] = useState('');
  const [editing, setEditing] = useState<WeightMeasurement | null>(null); const [busy, setBusy] = useState(false); const [actionError, setError] = useState(''); const [notice, setNotice] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { setEditing(null); setWeight(''); setNote(''); setDate(localDate()); }, [session.user?.uid]);
  const profile = useDashboardProfile();
  const query = useCachedQuery<WeightHistory>(`weight?from=${from}&to=${to}&timeZone=${encodeURIComponent(zone)}`, profile.ready);
  const data = query.data;
  const error = actionError || profile.error || query.error;
  const request = useApiMutationRequest();
  function refresh() { setError(''); if (profile.error || !profile.data) profile.refresh(); query.refresh(); }
  function reset() { setEditing(null); setWeight(''); setNote(''); setDate(data?.today || localDate()); }
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    try {
      const result = await request<{ measurement: WeightMeasurement }>(`weight/measurements${editing ? `/${editing.localDate}` : ''}`, { method: editing ? 'PUT' : 'POST', body: JSON.stringify({ localDate: date, timeZone: editing?.timeZone || zone, weightKg: Number(weight), note, ...(editing ? { expectedVersion: editing.version } : {}) }) });
      reset(); setNotice('Medición guardada. Los reportes usarán este registro al actualizarse.');
      if (result.measurement.localDate < from || result.measurement.localDate > to) { setFrom(addDays(result.measurement.localDate, -89)); setTo(result.measurement.localDate); }

    } catch (e) { setError(e instanceof Error ? e.message : 'No pudimos guardar la medición.'); }
    finally { setBusy(false); }
  }
  async function remove(item: WeightMeasurement) {
    if (!window.confirm(`¿Quitar la medición de ${formatNumber(item.weightKg)} kg del ${dateLabel(item.localDate)}?`)) return;
    setBusy(true); setError(''); setNotice('');
    try { await request(`weight/measurements/${item.localDate}`, { method: 'DELETE', body: JSON.stringify({ expectedVersion: item.version }) }); if (editing?.id === item.id) reset(); setNotice('Medición retirada del historial.'); }
    catch (e) { setError(e instanceof Error ? e.message : 'No pudimos quitar la medición.'); } finally { setBusy(false); }
  }
  function preset(days: number) { setTo(data?.today || localDate()); setFrom(addDays(data?.today || localDate(), -(days - 1))); setError(''); }
  if (session.error) return <div className="dashboard-error"><p role="alert">{session.error}</p><button onClick={() => void session.refresh()}>Reintentar</button></div>;
  if (!data || !profile.ready || session.loading) return error ? <div className="dashboard-error"><p role="alert">{error}</p><button onClick={() => { setError(''); refresh(); }}>Reintentar</button><button onClick={() => preset(90)}>Volver a últimos 90 días</button></div> : <DashboardLoading message="Preparando tu historial de peso…" />;
  return <div className="dashboard-view weight-page"><div className="dashboard-topbar"><Link className="text-link" href="/app/reportes">← Reportes</Link><span>Tu evolución corporal</span></div><section className="intro"><p className="eyebrow">PESO CORPORAL</p><h1>Tu evolución, registrada.</h1><p className="description">Guardá una medición por día y consultá cómo cambian tus registros en el tiempo.</p></section>
    <section className="weight-entry training-editor" aria-label="Registrar peso"><div className="editor-heading"><h2>{editing ? 'Editar medición' : 'Registrar peso'}</h2>{editing && <button disabled={busy} onClick={reset}>Cancelar edición</button>}</div><form onSubmit={save}><div className="personal-grid"><label>Fecha de medición<input type="date" required max={data.today} value={date} disabled={busy || Boolean(editing)} onChange={event => setDate(event.target.value)} /></label><label>Peso (kg)<input ref={inputRef} type="number" inputMode="decimal" required min={30} max={350} step="0.01" value={weight} disabled={busy} onChange={event => setWeight(event.target.value)} placeholder="Ej. 72,5" /></label></div><label>Nota opcional<textarea rows={2} maxLength={500} value={note} disabled={busy} onChange={event => setNote(event.target.value)} placeholder="Contexto que quieras conservar" /></label><button className="primary-button" disabled={busy}>{busy ? 'Guardando…' : editing ? 'Guardar cambios' : 'Guardar peso'}</button></form><p className="food-hint">Si ya registraste un peso para una fecha, editalo desde el historial. El peso inicial del onboarding se conserva como referencia.</p></section>
    {error && <div role="alert" className="form-error"><p>{error}</p><button disabled={busy} onClick={() => { setError(''); refresh(); }}>Actualizar historial</button></div>}{notice && <p role="status" className="training-notice">{notice}</p>}
    <section className="report-section"><h2>Historial y evolución</h2><div className="weight-range"><div className="inline-actions"><button disabled={busy} onClick={() => preset(30)}>30 días</button><button disabled={busy} onClick={() => preset(90)}>90 días</button><button disabled={busy} onClick={() => preset(365)}>1 año</button></div><label>Desde<input type="date" value={from} max={to} disabled={busy} onChange={event => { if (event.target.value) { setError(''); setFrom(event.target.value); } }} /></label><label>Hasta<input type="date" value={to} min={from} max={data.today} disabled={busy} onChange={event => { if (event.target.value) { setError(''); setTo(event.target.value); } }} /></label></div>
      <div className="report-metrics weight-metrics"><article><h2>Última medición del período</h2><strong>{formatNumber(data.summary.last?.weightKg ?? null)}<small> kg</small></strong><p>{data.summary.last ? dateLabel(data.summary.last.localDate) : 'Sin mediciones'}</p></article><article><h2>Promedio de las mediciones</h2><strong>{formatNumber(data.summary.averageKg)}<small> kg</small></strong><p>{data.summary.count} días registrados</p></article><article><h2>Primera → última del período</h2><strong>{data.summary.changeKg !== null ? `${data.summary.changeKg > 0 ? '+' : ''}${formatNumber(data.summary.changeKg)}` : 'Sin dato'}<small> kg</small></strong><p>{data.summary.count > 1 ? `${dateLabel(data.summary.first!.localDate)} → ${dateLabel(data.summary.last!.localDate)}` : 'Se necesitan al menos dos días con mediciones.'}</p></article></div>
      <WeightChart measurements={data.measurements} />
      {data.initial && <p className="food-hint">Referencia del onboarding: {formatNumber(data.initial.weightKg)} kg · {dateLabel(data.initial.localDate)}.{data.initial.dateInferred ? ' La fecha es aproximada: el registro inicial antiguo no guardaba zona horaria.' : ''} Si hay una medición manual en esa fecha, se utiliza esa medición para el gráfico y los cálculos.</p>}
      {data.measurements.length > 0 && <div className="weight-history">{data.measurements.slice().reverse().map(item => <article key={item.id}><div><h3>{formatNumber(item.weightKg)} kg</h3><p>{dateLabel(item.localDate, { day: 'numeric', month: 'long', year: 'numeric' })} · {item.source === 'onboarding' ? 'Peso inicial' : 'Medición manual'}</p>{item.note && <p className="weight-note">{item.note}</p>}{item.dateInferred && <small>Fecha aproximada del registro inicial</small>}</div>{!item.readOnly && <div className="inline-actions"><button disabled={busy} onClick={() => { setEditing(item); setDate(item.localDate); setWeight(String(item.weightKg)); setNote(item.note); setError(''); inputRef.current?.focus({ preventScroll: true }); inputRef.current?.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); }}>Editar</button><button disabled={busy} className="danger-button" onClick={() => void remove(item)}>Quitar</button></div>}</article>)}</div>}
      <p className="food-hint">Los días sin medición quedan sin dato. El registro de peso no modifica automáticamente tus objetivos de alimentación ni tu rutina.</p>
    </section>
  </div>;
}
