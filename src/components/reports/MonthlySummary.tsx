'use client';
import { useCachedQuery } from '@/lib/store/hooks';
import { dateLabel } from '@/lib/training-sessions';
import type { MonthlyReport } from '@/lib/reports';

const number = (value: number | null | undefined, digits = 0) => value == null ? '—' : new Intl.NumberFormat('es-AR', { maximumFractionDigits: digits }).format(value);
const signed = (value: number, digits = 1) => `${value > 0 ? '+' : value < 0 ? '−' : '±'}${number(Math.abs(value), digits)}`;
const toneLabel = { good: 'Bien', mixed: 'Con ajustes', attention: 'A retomar', empty: 'Sin registros' } as const;

// Resumen del mes: números calculados con los registros (sin IA).
export default function MonthlySummary({ month, zone, week, onSelectWeek }: { month: string; zone: string; week: string; onSelectWeek: (week: string) => void }) {
  const query = useCachedQuery<MonthlyReport>(`reports/monthly?month=${month}&timeZone=${encodeURIComponent(zone)}`);
  const data = query.data;
  if (query.error) return <p className="form-error" role="alert">{query.error}</p>;
  if (!data) return <p className="food-hint">Calculando el mes…</p>;
  if (!data.hasRecords) return <p className="food-empty">Todavía no hay registros en {data.label}.</p>;
  const { training: t, nutrition: n, weight: w } = data;
  return <div className="monthly-summary">
    <p className="monthly-headline">{data.summary}{data.period.isPartial ? <small> Mes en curso, hasta el {dateLabel(data.period.through, { day: 'numeric', month: 'long' })}.</small> : null}</p>
    <div className="monthly-tiles">
      <article><span>Entrenamiento</span><strong>{t.planned != null ? <>{t.completedPlanned}<small>/{t.planned}</small></> : t.completed}</strong>
        <p>{t.planned != null ? 'días planificados hechos' : 'sesiones completadas'}{t.abandoned ? ` · ${t.abandoned} interrumpida${t.abandoned > 1 ? 's' : ''}` : ''} · {t.completedSets} series</p></article>
      <article><span>Alimentación</span><strong>{number(n.avgKcal)}<small> kcal</small></strong>
        <p>{n.kcalTarget ? <>promedio{n.kcalPct != null ? ` · ${signed(n.kcalPct * 100, 0)} % vs objetivo` : ''}<br />en objetivo {n.onTargetDays} de {n.daysLogged} días{n.proteinDays != null ? ` · proteína ${n.proteinDays} días` : ''}</> : `${n.daysLogged} días con comidas`}</p></article>
      <article><span>Peso</span><strong>{w.changeKg != null ? <>{signed(w.changeKg)}<small> kg</small></> : number(w.lastKg, 1)}</strong>
        <p>{w.count >= 2 ? `${number(w.firstKg, 1)} → ${number(w.lastKg, 1)} kg · ${w.count} mediciones` : w.count ? 'Una sola medición' : 'Sin mediciones'}</p></article>
    </div>
    {t.progress.length > 0 && <section><h3>Cargas del mes</h3><ul className="exercise-progress">{t.progress.map(item => <li key={item.name}><div><strong>{item.name}</strong><small>{item.sessions} sesiones</small></div>
      <span className="exercise-load">{number(item.firstKg, 1)} → {number(item.lastKg, 1)} kg{item.deltaKg !== 0 && <em className={item.deltaKg > 0 ? 'is-up' : 'is-down'}>{signed(item.deltaKg)} kg</em>}</span></li>)}</ul></section>}
    {n.weekendDelta != null && n.weekendDelta >= .15 && <p className="monthly-pattern">Patrón del mes: los fines de semana comés {number(n.weekendDelta * 100)} % más que entre semana.</p>}
    <section><h3>Semanas</h3><ul className="monthly-weeks">{data.weeks.map(item => <li key={item.weekStart} className={item.weekStart === week ? 'is-selected' : ''}>
      <i className={`week-tone is-${item.tone}`} aria-hidden="true" /><div><strong>{dateLabel(item.weekStart)} – {dateLabel(item.weekEnd)}</strong><small>{toneLabel[item.tone]}{item.isPartial ? ' · en curso' : ''}</small></div>
      <div className="monthly-week-stats"><span>{item.training.planned != null ? `${item.training.completedPlanned}/${item.training.planned}` : item.training.completed} entr.</span><span>{number(item.nutrition.avgKcal)} kcal</span><span>{number(item.weight.avgKg, 1)} kg</span></div>
      {item.weekStart === week ? <b className="monthly-current">Viendo</b> : <button className="text-link" onClick={() => onSelectWeek(item.weekStart)}>Ver</button>}</li>)}</ul></section>
    <p className="glance-footnote">Calculado con tus registros del mes, sin IA. Los objetivos son los actuales de tu perfil.</p>
  </div>;
}
