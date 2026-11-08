import Link from 'next/link';
import type { GlanceStatus, WeeklyGlance as Glance } from '@/lib/reports';
import { dateLabel } from '@/lib/training-sessions';

const number = (value: number | null | undefined, digits = 0) => value == null ? '—' : new Intl.NumberFormat('es-AR', { maximumFractionDigits: digits }).format(value);
const signed = (value: number, digits = 1) => `${value > 0 ? '+' : value < 0 ? '−' : '±'}${number(Math.abs(value), digits)}`;
const letters = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const statusLabel: Record<GlanceStatus, string> = { good: 'Bien', ok: 'En camino', attention: 'A revisar', empty: 'Sin datos' };
const trainingStates = { done: 'entrenado', extra: 'entrenamiento extra', partial: 'sesión incompleta', missed: 'planificado y sin hacer', rest: 'descanso', today: 'planificado para hoy', future: 'por venir' } as const;
const foodStates = { on: 'en objetivo', over: 'sobre el objetivo', under: 'debajo del objetivo', logged: 'registrado', missing: 'sin registro', future: 'por venir' } as const;

function Status({ value }: { value: GlanceStatus }) {
  return <span className={`glance-status is-${value}`}>{statusLabel[value]}</span>;
}

function TrainingCard({ data }: { data: Glance['training'] }) {
  const main = data.planned != null ? <>{data.completedPlanned}<small>/{data.planned}</small></> : data.completed;
  return <article className="glance-card">
    <header><h3>Entrenamiento</h3><Status value={data.status} /></header>
    <strong className="glance-value">{main}</strong>
    <span className="glance-unit">{data.planned != null ? 'días planificados hechos' : 'sesiones completadas'}</span>
    <ol className="glance-dots" aria-label="Entrenamiento por día">{data.days.map((day, index) =>
      <li key={index} className={`is-${day.state}`} title={`${letters[index]}: ${trainingStates[day.state]}`}><span aria-hidden="true">{day.state === 'done' || day.state === 'extra' ? '✓' : day.state === 'missed' ? '✕' : day.state === 'partial' ? '½' : ''}</span><small>{letters[index]}</small><b className="sr-only">{trainingStates[day.state]}</b></li>)}</ol>
    {data.records.length ? <ul className="glance-records">{data.records.slice(0, 2).map(item => <li key={item.name}><span>{item.name}</span><b>{number(item.maxLoadKg, 1)} kg <em>{signed(item.deltaKg)}</em></b></li>)}
      {data.records.length > 2 && <li className="glance-more">+{data.records.length - 2} ejercicios con más carga</li>}</ul>
      : <p className="glance-note">{data.completedSets} series realizadas{data.abandoned ? ` · ${data.abandoned} interrumpida${data.abandoned > 1 ? 's' : ''}` : ''}</p>}
  </article>;
}

function NutritionCard({ data }: { data: Glance['nutrition'] }) {
  const max = Math.max(data.kcalTarget ?? 0, ...data.days.map(day => day.kcal ?? 0)) * 1.05 || 1;
  const pct = data.kcalPct;
  return <article className="glance-card">
    <header><h3>Alimentación</h3><Status value={data.status} /></header>
    <strong className="glance-value">{number(data.avgKcal)}<small> kcal</small></strong>
    <span className="glance-unit">{data.kcalTarget ? <>promedio · objetivo {number(data.kcalTarget)}{pct != null && <em className={Math.abs(pct) <= .1 ? 'is-on' : 'is-off'}> {signed(pct * 100, 0)} %</em>}</> : 'promedio diario registrado'}</span>
    <div className="glance-bars" role="img" aria-label={data.days.map((day, i) => `${letters[i]}: ${day.kcal == null ? foodStates[day.state] : `${number(day.kcal)} kcal, ${foodStates[day.state]}`}`).join('; ')}>
      {data.kcalTarget && <i className="glance-target" style={{ bottom: `${data.kcalTarget / max * 100}%` }} aria-hidden="true" />}
      {data.days.map((day, i) => <div key={i} className={`is-${day.state}`} aria-hidden="true"><span style={{ height: day.kcal ? `${day.kcal / max * 100}%` : undefined }} /><small>{letters[i]}</small></div>)}
    </div>
    <p className="glance-note">{data.kcalTarget ? `En objetivo ${data.onTargetDays} de ${data.daysLogged} días` : `${data.daysLogged} de ${data.elapsed} días con comidas`}{data.proteinTarget && data.avgProtein != null ? ` · proteína ${number(data.avgProtein)}/${number(data.proteinTarget)} g` : ''}</p>
  </article>;
}

function WeightCard({ data }: { data: Glance['weight'] }) {
  const values = data.points.map(point => point.kg); const min = Math.min(...values); const max = Math.max(...values); const span = Math.max(.6, max - min);
  const path = data.points.map((point, i) => `${i ? 'L' : 'M'}${data.points.length === 1 ? 50 : i / (data.points.length - 1) * 100},${36 - (point.kg - min) / span * 28 - 4}`).join(' ');
  return <article className="glance-card">
    <header><h3>Peso</h3><Status value={data.status} /></header>
    <strong className="glance-value">{number(data.avgKg, 1)}<small> kg</small></strong>
    <span className="glance-unit">{data.deltaKg != null ? <>promedio · <em className={data.aligned ? 'is-on' : 'is-off'}>{signed(data.deltaKg)} kg</em> vs semana anterior</> : data.count ? 'promedio de la semana' : 'sin mediciones'}</span>
    {data.points.length > 0 && <svg className="glance-spark" viewBox="0 0 100 40" preserveAspectRatio="none" role="img" aria-label={data.points.map(point => `${dateLabel(point.date)}: ${number(point.kg, 1)} kg`).join('; ')}>
      <path d={path} vectorEffect="non-scaling-stroke" />{data.points.map((point, i) => <circle key={point.date} cx={data.points.length === 1 ? 50 : i / (data.points.length - 1) * 100} cy={36 - (point.kg - min) / span * 28 - 4} r="1.6" vectorEffect="non-scaling-stroke" />)}
    </svg>}
    <p className="glance-note">{data.count} {data.count === 1 ? 'medición' : 'mediciones'}{data.aligned === true ? ' · en línea con tu objetivo' : data.aligned === false ? ' · en dirección opuesta a tu objetivo' : ''}</p>
  </article>;
}

export default function WeeklyGlance({ glance, partial }: { glance: Glance; partial: boolean }) {
  const { headline } = glance;
  return <section className="weekly-glance" aria-labelledby="glance-title">
    <div className={`glance-headline is-${headline.tone}`}>
      <p className="eyebrow">{partial ? 'TU SEMANA HASTA HOY' : 'TU SEMANA EN 10 SEGUNDOS'}</p>
      <h2 id="glance-title">{headline.title}</h2>
      <p>{headline.text}</p>
    </div>
    {headline.tone !== 'empty' && <>
      <div className="glance-cards"><TrainingCard data={glance.training} /><NutritionCard data={glance.nutrition} /><WeightCard data={glance.weight} /></div>
      <div className="glance-lists">
        <section className="glance-list is-wins" aria-labelledby="glance-wins"><h3 id="glance-wins">Lo que hiciste bien</h3>
          {glance.wins.length ? <ul>{glance.wins.map(item => <li key={item.text}><span aria-hidden="true">✓</span>{item.text}</li>)}</ul> : <p>Esta semana todavía no hay logros claros. ¡Vamos por el próximo registro!</p>}</section>
        <section className="glance-list is-improve" aria-labelledby="glance-improve"><h3 id="glance-improve">Dónde mejorar</h3>
          {glance.improvements.length ? <ul>{glance.improvements.map(item => <li key={item.text}><span aria-hidden="true">!</span><div>{item.text}{item.action && <small>{item.action}</small>}</div></li>)}</ul> : <p>Nada importante para corregir. Sostené lo que estás haciendo.</p>}</section>
      </div>
      {glance.focus && <Link className="glance-focus" href={glance.focus.href}><span className="eyebrow">{partial ? 'FOCO PARA LO QUE QUEDA' : 'FOCO PARA LA PRÓXIMA SEMANA'}</span><strong>{glance.focus.text}</strong><span aria-hidden="true" className="glance-focus-arrow">→</span></Link>}
    </>}
    {headline.tone === 'empty' && <div className="glance-empty-actions"><Link className="primary-button" href="/app/entrenamiento/calendario">Registrar entrenamiento</Link><Link className="primary-button secondary" href="/app/alimentacion">Registrar comida</Link></div>}
  </section>;
}
