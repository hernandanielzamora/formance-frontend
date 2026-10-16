'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/provider';
import { apiRequest } from '@/lib/api/client';
import { getFirebaseAuth } from '@/lib/firebase/client';
import { dayNames } from '@/lib/training';
import { addDays, monday, localDate, dateLabel, sessionStatus, type TrainingCalendar, type TrainingSession } from '@/lib/training-sessions';
import DashboardLoading from '@/components/ui/DashboardLoading';
import SessionRecorder from '@/components/training/SessionRecorder';
import WorkoutPreview from '@/components/training/WorkoutPreview';
import Icon from '@/components/ui/Icon';

export default function CalendarPage() {
  const auth = useAuth(); const router = useRouter();
  const [week, setWeek] = useState(() => monday(localDate()));
  const [selected, setSelected] = useState(localDate);
  const [calendar, setCalendar] = useState<TrainingCalendar | null>(null);
  const [loadedWeek, setLoadedWeek] = useState('');
  const [loadedUid, setLoadedUid] = useState<string | null>(null);
  const [zone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const [session, setSession] = useState<TrainingSession | null>(null);
  const [retry, setRetry] = useState(0);
  const pendingStart = useRef<{ key: string; id: string } | null>(null);
  const weekRef = useRef<HTMLDivElement>(null);
  useEffect(() => { setSession(null); pendingStart.current = null; }, [auth.user?.uid]);
  useEffect(() => {
    const row = weekRef.current;
    const day = row?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!row || !day) return;
    const left = day.getBoundingClientRect().left - row.getBoundingClientRect().left + row.scrollLeft - (row.clientWidth - day.offsetWidth) / 2;
    row.scrollTo({ left: Math.max(0, left), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }, [selected, session, calendar]);
  useEffect(() => {
    if (auth.loading) return;
    if (!auth.user) { router.replace('/login'); return; }
    if (!auth.identity) return;
    if (!auth.identity.emailVerified) { router.replace('/verificar-correo'); return; }
    let cancelled = false; setError('');
    async function load() {
      try {
        const { profile } = await apiRequest<{ profile: { onboardingCompleted: boolean } | null }>('profile', {}, getFirebaseAuth());
        if (cancelled) return;
        if (!profile?.onboardingCompleted) { router.replace('/onboarding'); return; }
        const result = await apiRequest<TrainingCalendar>(`training/calendar?from=${week}&to=${addDays(week, 6)}&timeZone=${encodeURIComponent(zone)}`, {}, getFirebaseAuth());
        if (!cancelled) { setCalendar(result); setLoadedWeek(week); setLoadedUid(auth.identity!.uid); }
      } catch (e) { if (!cancelled) setError(e instanceof Error ? e.message : 'No pudimos cargar tu calendario.'); }
    }
    void load(); return () => { cancelled = true; };
  }, [auth.loading, auth.user, auth.identity, week, zone, router, retry]);
  function changeWeek(offset: number) { const next = addDays(week, offset); setWeek(next); setSelected(next); }
  function saved(value: TrainingSession) {
    setCalendar(current => current ? { ...current, sessions: [...current.sessions.filter(item => item.id !== value.id), value] } : current);
  }
  async function start(assignmentId: string) {
    if (!calendar?.routine) return;
    setBusy(true); setError('');
    const key = `${calendar.routine.id}:${calendar.routine.version}:${assignmentId}:${selected}`;
    if (pendingStart.current?.key !== key) pendingStart.current = { key, id: crypto.randomUUID() };
    try {
      const result = await apiRequest<{ session: TrainingSession }>('training/sessions', { method: 'POST', body: JSON.stringify({ sessionId: pendingStart.current.id, routineId: calendar.routine.id, routineVersion: calendar.routine.version, assignmentId, localDate: selected, timeZone: zone }) }, getFirebaseAuth());
      pendingStart.current = null; saved(result.session); setSession(result.session); window.scrollTo({ top: 0, behavior: 'instant' });
    } catch (e) { setError(e instanceof Error ? e.message : 'No pudimos iniciar el registro.'); }
    finally { setBusy(false); }
  }
  if (auth.error) return <div className="dashboard-error"><p role="alert">{auth.error}</p><button onClick={() => void auth.refresh()}>Reintentar</button></div>;
  if (!calendar || auth.loading || !auth.identity || loadedUid !== auth.identity.uid) return error ? <div className="dashboard-error"><p role="alert">{error}</p><button onClick={() => setRetry(value => value + 1)}>Reintentar</button></div> : <DashboardLoading message="Preparando tu calendario…" />;
  const days = Array.from({ length: 7 }, (_, index) => addDays(week, index));
  const dayIndex = (new Date(`${selected}T12:00:00Z`).getUTCDay() + 6) % 7;
  const assignments = calendar.routine?.days[dayIndex]?.assignments || [];
  const dailySessions = calendar.sessions.filter(item => item.localDate === selected);
  const loading = loadedWeek !== week;
  return <div className="dashboard-view calendar-page">
    <div className="dashboard-topbar"><Link className="text-link" href="/app/entrenamiento">← Biblioteca</Link><span>{session ? sessionStatus[session.status] : calendar.routine?.name || 'Mi calendario'}</span></div>
    {session ? <SessionRecorder key={session.id} initial={session} onSaved={saved} onClose={() => { setSession(null); window.scrollTo({ top: 0, behavior: 'instant' }); }} /> : <>
      <section className="intro"><p className="eyebrow">MI ENTRENAMIENTO</p><h1>Tu semana, a la vista.</h1><p className="description">{calendar.routine ? `Distribución de tu rutina activa: ${calendar.routine.name}.` : 'Elegí una rutina activa para ver tus días de entrenamiento y descanso.'}</p></section>
      <div className="calendar-toolbar"><div className="week-navigation"><button aria-label="Semana anterior" onClick={() => changeWeek(-7)}>←</button><h2>{dateLabel(week)} – {dateLabel(addDays(week, 6), { day: 'numeric', month: 'short', year: 'numeric' })}</h2><button aria-label="Semana siguiente" onClick={() => changeWeek(7)}>→</button></div><button onClick={() => { setWeek(monday(calendar.today)); setSelected(calendar.today); }}>Hoy</button></div>
      {error && <p role="alert" className="form-error">{error}<button onClick={() => setRetry(value => value + 1)}>Actualizar calendario</button></p>}
      <div ref={weekRef} className="calendar-week" aria-label="Días de la semana" aria-busy={loading}>{days.map((day, index) => {
        const planned = calendar.routine?.days[index]?.assignments || [];
        const logs = loading ? [] : calendar.sessions.filter(item => item.localDate === day);
        return <button key={day} className={`calendar-day ${selected === day ? 'day-selected' : ''} ${day === calendar.today ? 'day-today' : ''}`} aria-pressed={selected === day} aria-label={`${dayNames[index]}, ${dateLabel(day)}, ${planned.length ? `${planned.length} workouts` : calendar.routine ? 'descanso' : 'sin rutina'}`} onClick={() => setSelected(day)}><span className="calendar-day-name">{dayNames[index]}</span><strong>{Number(day.slice(-2))}</strong><span className={`day-kind ${planned.length ? 'day-training' : ''}`}><Icon name={planned.length ? 'workout' : 'check'} />{planned.length ? 'Entrenamiento' : calendar.routine ? 'Descanso' : 'Sin rutina'}</span><span className="day-workouts">{planned.map(item => item.name).join(' + ')}</span><span className="day-log-status">{loading ? 'Cargando…' : logs.length ? `${logs.filter(item => item.status === 'completed').length} completadas · ${logs.filter(item => item.status === 'in_progress').length} en curso${logs.some(item => item.status === 'abandoned') ? ' · Interrumpidas' : ''}` : 'Sin registros'}</span></button>;
      })}</div>
      <p className="calendar-hint">La planificación muestra la versión actual de tu rutina. Los registros conservan lo planificado al crear cada sesión. No tener registros no significa que no hayas entrenado.</p>
      <section className="selected-day" aria-labelledby="selected-day-title"><h2 id="selected-day-title">{dateLabel(selected, { weekday: 'long', day: 'numeric', month: 'long' })}</h2>
        {!calendar.routine && <div className="empty-library"><h3>Tu calendario empieza con una rutina</h3><Link className="primary-button" href="/app/entrenamiento">Elegir una rutina</Link></div>}
        {calendar.routine && !assignments.length && <div className="rest-day"><Icon name="check" /><div><h3>Día de descanso</h3><p>Tu rutina no tiene workouts asignados para este día.</p></div></div>}
        {assignments.map(assignment => {
          const existing = dailySessions.filter(item => item.routineId === calendar.routine?.id && item.routineVersion === calendar.routine?.version && item.assignmentId === assignment.assignmentId);
          const open = existing.find(item => item.status === 'in_progress');
          return <article className="calendar-workout" key={assignment.assignmentId}><div className="calendar-workout-heading"><div><span className="badge">Planificado</span><h3>{assignment.name}</h3><p>{existing.length ? `${existing.length} sesiones registradas` : 'Todavía sin registro'}</p></div>{open ? <button className="primary-button" disabled={busy || loading} onClick={() => setSession(open)}>Continuar registro</button> : <button className="primary-button" disabled={busy || loading || selected > calendar.today} onClick={() => void start(assignment.assignmentId)}>{busy ? 'Preparando…' : existing.length ? 'Registrar otra sesión' : 'Registrar entrenamiento'}</button>}</div><WorkoutPreview assignment={assignment} /></article>;
        })}
        {selected > calendar.today && assignments.length > 0 && <p className="calendar-hint">Podrás registrar estos workouts cuando llegue el día.</p>}
        {loading ? <p role="status">Cargando registros de esta semana…</p> : dailySessions.length > 0 && <div className="session-history"><h3>Registros del día</h3>{dailySessions.map(item => <button key={item.id} className="session-history-item" onClick={() => setSession(item)}><span><strong>{item.workoutSnapshot.name}</strong><small>{sessionStatus[item.status]} · {item.performedEntries.reduce((count, entry) => count + entry.sets.filter(set => set.completed).length, 0)} series realizadas{item.timeZone !== calendar.timeZone ? ` \u00b7 ${item.timeZone}` : ''}</small></span><span>Ver registro →</span></button>)}</div>}
      </section>
    </>}
  </div>;
}
