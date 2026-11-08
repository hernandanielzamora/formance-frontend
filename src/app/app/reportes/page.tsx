'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/provider';
import { useCachedQuery, useDashboardProfile } from '@/lib/store/hooks';
import { addDays, monday, localDate, dateLabel, sessionStatus } from '@/lib/training-sessions';
import { formatNumber, nutrientKeys, nutrientLabels, mealTypes } from '@/lib/food';
import type { ReportLog, WeeklyReport } from '@/lib/reports';
import DashboardLoading from '@/components/ui/DashboardLoading';
import WeightChart from '@/components/weight/WeightChart';
import WeeklyAnalysis from '@/components/reports/WeeklyAnalysis';
import WeeklyGlance from '@/components/reports/WeeklyGlance';

const delta = (value: number) => `${value > 0 ? '+' : ''}${formatNumber(value)}`;
const mealName = (name: string) => mealTypes.find(([key]) => key === name)?.[1] || 'Comida';
export default function ReportsPage() {
  const session = useAuth();
  const [week, setWeek] = useState(() => monday(localDate())); const [zone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [filter, setFilter] = useState<'all' | 'training' | 'food' | 'weight'>('all'); const [status, setStatus] = useState(''); const [search, setSearch] = useState('');
  const [historyDate, setHistoryDate] = useState(''); const [historyOpen, setHistoryOpen] = useState(false);
  useEffect(() => { setHistoryDate(''); }, [week]);
  const profile = useDashboardProfile();
  const query = useCachedQuery<WeeklyReport>(`reports/weekly?weekStart=${week}&timeZone=${encodeURIComponent(zone)}`, profile.ready);
  const report = query.data; const error = profile.error || query.error;
  function refresh() { if (profile.error || !profile.data) profile.refresh(); query.refresh(); }
  if (session.error) return <div className="dashboard-error"><p role="alert">{session.error}</p><button onClick={() => void session.refresh()}>Reintentar</button></div>;
  if (!report || !profile.ready || session.loading) return error ? <div className="dashboard-error"><p role="alert">{error}</p><button onClick={() => refresh()}>Reintentar</button></div> : <DashboardLoading message="Preparando tu semana…" />;
  const { current, previous, period, comparison, glance } = report;
  const targets = glance?.targets;
  const text = search.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const filtered = report.logs.filter(log => (!historyDate || log.localDate === historyDate) && (filter === 'all' || filter === log.type) && (!status || log.type === 'training' && log.status === status) && (!text || [log.name, log.type === 'food' ? mealName(log.name) : '', log.note, ...(log.type === 'food' ? log.items.map(item => item.name) : log.type === 'training' ? log.entries.map(entry => entry.name) : ['peso', String(log.weightKg)])].join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().includes(text)));
  const hasRecords = Boolean(current.training.totalSessions || current.food.meals || current.weight.count);
  function openDay(date: string) { setSearch(''); setFilter('all'); setStatus(''); setHistoryDate(date); setHistoryOpen(true); requestAnimationFrame(() => document.getElementById('report-history')?.scrollIntoView({ behavior: 'smooth', block: 'start' })); }
  return <div className="dashboard-view reports-page">
    <header className="reports-head">
      <div><p className="eyebrow">REPORTES</p><h1>Tu semana</h1></div>
      <div className="week-navigation" role="group" aria-label="Elegir semana"><button aria-label="Semana anterior" onClick={() => setWeek(addDays(week, -7))}>←</button>
        <label className="week-picker"><span>{dateLabel(period.from, { day: 'numeric', month: 'short' })} – {dateLabel(period.to, { day: 'numeric', month: 'short' })}</span><input type="date" aria-label="Elegir una fecha de la semana" value={week} max={period.today} onChange={event => { if (event.target.value) setWeek(monday(event.target.value)); }} /></label>
        <button aria-label="Semana siguiente" disabled={addDays(week, 7) > period.today} onClick={() => setWeek(addDays(week, 7))}>→</button>
        {week !== monday(period.today) && <button className="week-today" onClick={() => setWeek(monday(period.today))}>Hoy</button>}</div>
    </header>
    <p className="report-period">{period.isPartial ? `Semana en curso · hasta el ${dateLabel(period.through, { weekday: 'long', day: 'numeric' })}` : 'Semana cerrada'} · comparada con {dateLabel(previous.from)} – {dateLabel(previous.through)}{targets ? ' · con tu objetivo actual' : ''}</p>
    {error && <div className="form-error" role="alert"><p>{error} Se conserva el último reporte cargado.</p><button onClick={() => refresh()}>Reintentar</button></div>}
    {glance && <WeeklyGlance glance={glance} partial={period.isPartial} />}

    <section className="report-more" aria-labelledby="report-more-title">
      <h2 id="report-more-title">Más detalle</h2>
      <details className="report-panel"><summary><span><strong>Análisis escrito</strong><small>Una lectura en texto de tu semana y qué priorizar</small></span></summary>
        <WeeklyAnalysis key={`${session.identity?.uid}:${week}:${zone}`} weekStart={week} timeZone={zone} hasRecords={hasRecords} disabled={query.isFetching || Boolean(error)} /></details>

      <details className="report-panel"><summary><span><strong>Entrenamiento</strong><small>{current.training.sessions.completed} sesiones · {current.training.completedSets} series · {delta(comparison.completedSetsDelta)} vs semana anterior</small></span></summary>
        {current.training.exercises.length ? <ul className="exercise-progress">{current.training.exercises.map(exercise => { const before = comparison.exercises.find(item => item.key === exercise.key); const change = before?.maxLoadDelta;
          return <li key={exercise.key}><div><strong>{exercise.name}</strong><small>{exercise.completedSets} series · {exercise.reps} reps{exercise.completedSets - exercise.recordedLoadSets > 0 ? ` · ${exercise.completedSets - exercise.recordedLoadSets} sin carga` : ''}</small></div>
            <span className="exercise-load">{exercise.maxLoadKg != null ? `${formatNumber(exercise.maxLoadKg)} kg` : '—'}{change != null && change !== 0 && <em className={change > 0 ? 'is-up' : 'is-down'}>{delta(change)} kg</em>}</span></li>; })}</ul>
          : <p className="food-empty">No hay series realizadas esta semana.</p>}
        <p className="glance-footnote">Carga máxima registrada por ejercicio y su diferencia con la semana anterior.</p></details>

      <details className="report-panel"><summary><span><strong>Alimentación</strong><small>{current.food.daysWithRecords} de {period.elapsedDays} días · {formatNumber(Math.round(current.food.nutrients.calories.average ?? 0))} kcal promedio</small></span></summary>
        <div className="report-table-wrap"><table className="report-table"><caption className="sr-only">Promedio diario por nutriente</caption><thead><tr><th scope="col">Nutriente</th><th scope="col">Promedio diario</th>{targets && <th scope="col">Objetivo</th>}<th scope="col">Semana anterior</th></tr></thead>
          <tbody>{nutrientKeys.map(key => { const item = current.food.nutrients[key]; const before = previous.food.nutrients[key]; const target = key === 'calories' ? targets?.calories : key === 'protein' ? targets?.protein : null;
            return <tr key={key}><th scope="row">{nutrientLabels[key]}</th><td>{formatNumber(item.average)}{item.missingItems > 0 && <small>Parcial: {item.missingItems} alimentos sin dato</small>}</td>{targets && <td>{target != null ? formatNumber(target) : '—'}</td>}<td>{formatNumber(before.average)}</td></tr>; })}</tbody></table></div>
        {current.food.estimatedItems > 0 && <p className="glance-footnote">{current.food.estimatedItems} alimentos se estimaron desde una foto.</p>}</details>

      <details className="report-panel"><summary><span><strong>Peso</strong><small>{current.weight.count} mediciones{comparison.weightAverageDeltaKg != null ? ` · promedio ${delta(comparison.weightAverageDeltaKg)} kg vs semana anterior` : ''}</small></span></summary>
        <div className="report-weight-row"><p>Promedio <strong>{formatNumber(current.weight.averageKg)} kg</strong></p><p>Primera → última <strong>{current.weight.changeKg != null ? `${delta(current.weight.changeKg)} kg` : '—'}</strong></p><Link className="text-link" href="/app/peso">Registrar y ver historial →</Link></div>
        <WeightChart measurements={current.weight.measurements} /></details>

      <details className="report-panel"><summary><span><strong>Día por día</strong><small>Entrenamiento, comidas y peso de cada día</small></span></summary>
        <ul className="report-day-list">{Array.from({ length: 7 }, (_, index) => { const day = current.days[index]; const date = addDays(week, index);
          return <li key={date} className={!day ? 'is-future' : ''}><strong>{dateLabel(date, { weekday: 'short', day: 'numeric' })}</strong>
            {day ? <><span>{day.training.sessions.completed ? `✓ ${day.training.sessions.completed} entrenamiento` : day.training.totalSessions ? 'Sesión incompleta' : '—'}</span><span>{day.food.nutrients.calories.value !== null ? `${formatNumber(Math.round(day.food.nutrients.calories.value))} kcal` : 'Sin comidas'}</span><span>{day.weight ? `${formatNumber(day.weight.weightKg)} kg` : '—'}</span>
              <button className="text-link" onClick={() => openDay(date)}>Ver</button></> : <span>Por venir</span>}</li>; })}</ul></details>

      <details className="report-panel" id="report-history" open={historyOpen} onToggle={event => setHistoryOpen((event.target as HTMLDetailsElement).open)}><summary><span><strong>Historial de registros</strong><small>{report.logs.length} registros con su detalle completo</small></span></summary>
        <div className="report-history-filters"><label>Día<select aria-label="Día del registro" value={historyDate} onChange={event => setHistoryDate(event.target.value)}><option value="">Toda la semana</option>{current.days.map(day => <option key={day.date} value={day.date}>{dateLabel(day.date)}</option>)}</select></label><label>Tipo<select aria-label="Tipo de registro" value={filter} onChange={event => { setFilter(event.target.value as typeof filter); setStatus(''); }}><option value="all">Todos</option><option value="training">Entrenamiento</option><option value="food">Alimentación</option><option value="weight">Peso corporal</option></select></label>{(filter === 'all' || filter === 'training') && <label>Estado<select aria-label="Estado del entrenamiento" value={status} onChange={event => { setStatus(event.target.value); if (event.target.value) setFilter('training'); }}><option value="">Todos</option>{Object.entries(sessionStatus).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>}<label>Buscar<input type="search" maxLength={120} value={search} onChange={event => setSearch(event.target.value)} placeholder="Ejercicio, alimento o nota" /></label></div>
        <p className="food-hint" role="status">{filtered.length} registros</p>
        {current.days.slice().reverse().map(day => { const logs = filtered.filter(log => log.localDate === day.date); if (!logs.length) return null; return <section className="report-log-day" id={`report-date-${day.date}`} key={day.date}><h3>{dateLabel(day.date, { weekday: 'long', day: 'numeric', month: 'long' })}</h3>{logs.map(log => <LogDetail key={`${log.type}:${log.id}`} log={log} zone={period.timeZone} />)}</section>; })}
        {!filtered.length && <p className="empty-library">No hay registros que coincidan con estos filtros.</p>}</details>
    </section>
    <p className="glance-footnote report-footnote">Todo se calcula con lo que registraste. Un día sin datos no significa que no hayas comido o entrenado. Los objetivos son los actuales de tu perfil.</p>
  </div>;
}

function LogDetail({ log, zone }: { log: ReportLog; zone: string }) {
  return <details className="report-log"><summary><span><span className="badge">{log.type === 'training' ? sessionStatus[log.status] : log.type === 'food' ? 'Alimentación' : 'Peso corporal'}</span><strong>{log.type === 'training' ? log.name : log.type === 'food' ? mealName(log.name) : `${formatNumber(log.weightKg)} kg`}</strong><small>{log.type === 'training' ? `${log.metrics.completedSets} series realizadas · ${log.metrics.reps} reps` : log.type === 'food' ? `${log.items.length} alimentos · ${formatNumber(log.metrics.nutrients.calories.value)} kcal registradas` : log.source === 'onboarding' ? 'Peso inicial' : 'Medición manual'}</small></span><span className="report-expand-label">Ver detalle</span></summary>
    {log.timeZone !== zone && <p className="food-hint">Zona del registro: {log.timeZone}. Se conserva su fecha local original.</p>}
    {log.type === 'training' ? <><p className="food-hint">Rutina: {log.routineName || 'Sin referencia'}</p>{log.entries.map((entry, index) => <section className="report-log-exercise" key={index}><h3>{entry.name}</h3><p className="food-hint">Plan: {entry.planned.sets} series · {entry.planned.repsMin}–{entry.planned.repsMax} reps</p>{entry.sets.length ? <div className="report-table-wrap"><table className="report-table"><caption className="sr-only">Series de {entry.name}</caption><thead><tr><th scope="col">Serie</th><th scope="col">Reps</th><th scope="col">Carga externa</th><th scope="col">Estado</th></tr></thead><tbody>{entry.sets.map((set, i) => <tr key={set.setId}><th scope="row">{i + 1}</th><td>{formatNumber(set.reps)}</td><td>{formatNumber(set.externalLoadKg)} kg</td><td>{set.completed ? 'Realizada' : 'Sin marcar'}</td></tr>)}</tbody></table></div> : <p className="food-hint">Sin series guardadas para este ejercicio.</p>}</section>)}</> : log.type === 'food' ? <div className="report-log-food">{log.items.map(item => <article key={item.itemId}><h3>{item.name}</h3><p className="food-hint">{item.grams} g · {item.source === 'gemini' ? 'Estimación por foto' : item.source === 'usda' ? 'USDA' : 'Carga manual'}</p><p>{nutrientKeys.map(key => `${nutrientLabels[key]}: ${formatNumber(item.totals?.[key] ?? null)}`).join(' · ')}</p></article>)}</div> : <p className="food-hint">{formatNumber(log.weightKg)} kg registrados.{log.dateInferred ? ' Fecha aproximada del registro inicial antiguo.' : ''} <Link href="/app/peso">Ver historial de peso</Link></p>}
    {log.note && <p className="report-log-note">{log.note}</p>}
  </details>;
}
