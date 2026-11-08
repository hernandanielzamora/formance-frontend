'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useCachedQuery } from '@/lib/store/hooks';
import { addDays, localDate, monday, dateLabel, type TrainingCalendar } from '@/lib/training-sessions';
import { goals, type Profile } from '@/lib/profile';
import type { Diary } from '@/lib/food';
import type { WeeklyReport, GlanceStatus } from '@/lib/reports';
import type { WeightHistory } from '@/lib/weight';
import Icon from '@/components/ui/Icon';

const number = (value: number | null | undefined, digits = 0) => value == null ? '—' : new Intl.NumberFormat('es-AR', { maximumFractionDigits: digits }).format(value);
const statusLabel: Record<GlanceStatus, string> = { good: 'Bien', ok: 'En camino', attention: 'A revisar', empty: 'Sin datos' };

function Progress({ label, value, target, unit }: { label: string; value: number; target: number | null | undefined; unit: string }) {
  const pct = target ? value / target : 0;
  return <div className="home-progress"><div><span>{label}</span><b>{number(value)}{target ? <small> / {number(target)} {unit}</small> : <small> {unit}</small>}</b></div>
    {target ? <span className={`home-bar${pct > 1.1 ? ' is-over' : ''}`} role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={Math.round(target)} aria-valuenow={Math.round(value)}><span style={{ width: `${Math.min(100, pct * 100)}%` }} /></span> : null}</div>;
}

export default function Home({ profile }: { profile: Profile }) {
  const [zone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [today] = useState(localDate); const week = monday(today);
  // Mismas rutas que calendario, alimentación y peso: comparten caché al navegar.
  const calendar = useCachedQuery<TrainingCalendar>(`training/calendar?from=${week}&to=${addDays(week, 6)}&timeZone=${encodeURIComponent(zone)}`);
  const diary = useCachedQuery<Diary>(`food/diary?date=${today}&timeZone=${encodeURIComponent(zone)}`);
  const weights = useCachedQuery<WeightHistory>(`weight?from=${addDays(today, -89)}&to=${today}&timeZone=${encodeURIComponent(zone)}`);
  const report = useCachedQuery<WeeklyReport>(`reports/weekly?weekStart=${week}&timeZone=${encodeURIComponent(zone)}`);
  const index = (new Date(`${today}T12:00:00Z`).getUTCDay() + 6) % 7;
  const assignments = calendar.data?.routine?.days[index]?.assignments || [];
  const sessions = calendar.data?.sessions.filter(item => item.localDate === today) || [];
  const done = sessions.some(item => item.status === 'completed');
  const targets = diary.data?.targets || profile.targets;
  const kcal = diary.data?.totals.calories.value ?? 0; const protein = diary.data?.totals.protein.value ?? 0;
  const last = weights.data?.measurements.at(-1); const glance = report.data?.glance;
  const firstName = profile.name.split(' ')[0];
  return <div className="dashboard-view home">
    <section className="home-intro"><p className="eyebrow">{dateLabel(today, { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}</p><h1>Hola, {firstName}.</h1>
      <p className="home-goal"><span>Objetivo</span>{goals.find(([value]) => value === profile.goal)?.[1]} · {number(targets.calories)} kcal · {number(targets.protein)} g de proteína</p></section>

    <section aria-labelledby="home-today"><h2 id="home-today" className="home-section-title">Hoy</h2>
      <div className="home-today">
        <article className={`home-card${done ? ' is-done' : ''}`}><header><span className="icon-tile"><Icon name="workout" /></span><h3>Entrenamiento</h3></header>
          {!calendar.data ? <p className="home-muted">Cargando…</p> : !calendar.data.routine ? <><p className="home-big">Sin rutina activa</p><Link className="primary-button small" href="/app/entrenamiento">Elegir una rutina</Link></>
            : assignments.length ? <><p className="home-big">{assignments.map(item => item.name).join(' + ')}</p><p className="home-muted">{done ? '✓ Completado hoy' : sessions.length ? 'Sesión en curso' : `Según ${calendar.data.routine.name}`}</p>
              <Link className={`primary-button small${done ? ' secondary' : ''}`} href="/app/entrenamiento/calendario">{done ? 'Ver registro' : sessions.length ? 'Continuar' : 'Registrar entrenamiento'}</Link></>
            : <><p className="home-big">Día de descanso</p><p className="home-muted">{done ? '✓ Igual entrenaste hoy' : 'Recuperar también es parte del plan.'}</p><Link className="text-link" href="/app/entrenamiento/calendario">Ver la semana →</Link></>}
        </article>
        <article className="home-card"><header><span className="icon-tile"><Icon name="food" /></span><h3>Comidas</h3></header>
          {!diary.data ? <p className="home-muted">Cargando…</p> : <><Progress label="Calorías" value={kcal} target={targets.calories} unit="kcal" /><Progress label="Proteína" value={protein} target={targets.protein} unit="g" />
            <p className="home-muted">{diary.data.meals.length ? `${diary.data.meals.length} ${diary.data.meals.length === 1 ? 'comida registrada' : 'comidas registradas'}` : 'Todavía no registraste comidas hoy.'}</p>
            <Link className="primary-button small" href="/app/alimentacion">Registrar comida</Link></>}
        </article>
        <article className="home-card"><header><span className="icon-tile"><Icon name="chart" /></span><h3>Peso</h3></header>
          {!weights.data ? <p className="home-muted">Cargando…</p> : last ? <><p className="home-big">{number(last.weightKg, 1)} <small>kg</small></p>
            <p className="home-muted">{last.localDate === today ? 'Medido hoy' : `Última medición: ${dateLabel(last.localDate, { weekday: 'long', day: 'numeric' })}`}{weights.data.summary.changeKg != null ? ` · ${weights.data.summary.changeKg > 0 ? '+' : ''}${number(weights.data.summary.changeKg, 1)} kg en 90 días` : ''}</p></>
            : <p className="home-muted">Sin mediciones todavía.</p>}
          {weights.data && <Link className={`primary-button small${last?.localDate === today ? ' secondary' : ''}`} href="/app/peso">{last?.localDate === today ? 'Ver evolución' : 'Registrar peso'}</Link>}
        </article>
      </div>
    </section>

    <section aria-labelledby="home-week"><div className="home-section-head"><h2 id="home-week" className="home-section-title">Esta semana</h2><Link className="text-link" href="/app/reportes">Ver reporte completo →</Link></div>
      {!glance ? <p className="home-muted">Preparando tu semana…</p> : <Link href="/app/reportes" className={`home-week is-${glance.headline.tone}`}>
        <div><strong>{glance.headline.title}</strong><p>{glance.headline.text}</p></div>
        {glance.headline.tone !== 'empty' && <ul className="home-chips">
          <li className={`is-${glance.training.status}`}><span>Rutina</span><b>{glance.training.planned != null ? `${glance.training.completedPlanned}/${glance.training.planned}` : `${glance.training.completed} sesiones`}</b><em>{statusLabel[glance.training.status]}</em></li>
          <li className={`is-${glance.nutrition.status}`}><span>{glance.nutrition.kcalTarget ? 'Días en objetivo' : 'Comidas'}</span><b>{glance.nutrition.kcalTarget ? `${glance.nutrition.onTargetDays}/${glance.nutrition.daysLogged} días` : `${glance.nutrition.daysLogged} días`}</b><em>{statusLabel[glance.nutrition.status]}</em></li>
          <li className={`is-${glance.weight.status}`}><span>Peso</span><b>{glance.weight.deltaKg != null ? `${glance.weight.deltaKg > 0 ? '+' : ''}${number(glance.weight.deltaKg, 1)} kg` : glance.weight.avgKg != null ? `${number(glance.weight.avgKg, 1)} kg` : '—'}</b><em>{statusLabel[glance.weight.status]}</em></li>
        </ul>}
      </Link>}
      {glance?.focus && <p className="home-focus"><span>Foco:</span> {glance.focus.text}</p>}
    </section>
    <p className="home-profile">Perfil: {profile.age} años · {profile.heightCm} cm · peso inicial {number(profile.initialWeightKg, 1)} kg · objetivos diarios: {number(targets.calories)} kcal, {number(targets.protein)} g proteínas, {number(targets.fat)} g grasas, {number(targets.carbohydrates)} g carbohidratos.</p>
  </div>;
}
