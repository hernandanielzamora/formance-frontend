'use client';
import { useState, type FormEvent } from 'react';
import { apiRequest } from '@/lib/api/client';
import { getFirebaseAuth } from '@/lib/firebase/client';
import { dayNames, emptyWeek, type RoutineDay, type Routine, type RoutineTemplate, type Workout } from '@/lib/training';

export default function RoutineEditor({ source, workouts, initialWorkoutId, onSaved, onCancel }: { source: Routine | RoutineTemplate | null; workouts: Workout[]; initialWorkoutId?: string; onSaved: () => Promise<void>; onCancel: () => void }) {
  const editing = source && 'sourceTemplateId' in source;
  const [name, setName] = useState(source ? `${source.name}${editing ? '' : ' · mi versión'}` : '');
  const [days, setDays] = useState<RoutineDay[]>(source ? source.days.map((d) => ({ dayIndex: d.dayIndex, workoutIds: [...d.workoutIds] })) : emptyWeek().map((d) => ({ ...d, workoutIds: d.dayIndex === 0 && initialWorkoutId ? [initialWorkoutId] : [] })));
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  function changeDay(index: number, ids: string[]) { setDays((week) => week.map((day) => day.dayIndex === index ? { ...day, workoutIds: ids } : day)); }
  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    const payload = { name, days, sourceTemplateId: source ? ('sourceTemplateId' in source ? source.sourceTemplateId : source.id) : null, ...(editing ? { expectedVersion: source.version } : {}) };
    try {
      await apiRequest(`training/routines${editing ? `/${source.id}` : ''}`, { method: editing ? 'PUT' : 'POST', body: JSON.stringify(payload) }, getFirebaseAuth());
      await onSaved();
    } catch (e) { setError(e instanceof Error ? e.message : 'No pudimos guardar la rutina.'); }
    finally { setBusy(false); }
  }
  const sessionCount = days.reduce((count, day) => count + day.workoutIds.length, 0);
  return <section className="training-editor" aria-label="Editor de rutina"><div className="editor-heading"><div><p className="eyebrow">TU SEMANA, A TU MANERA</p><h2>{editing ? 'Editar mi rutina' : 'Armar mi rutina'}</h2></div><button type="button" disabled={busy} onClick={onCancel}>Cancelar</button></div><p>Elegí los días que te resulten cómodos. Un día vacío queda como descanso; podés combinar hasta tres workouts por día.</p><form onSubmit={save} aria-busy={busy}><label>Nombre de la rutina<input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} required placeholder="Ej. Mi rutina de tres días" /></label><div className="week-grid">{days.map((day) => <article className={`day-card ${day.workoutIds.length ? 'has-workout' : ''}`} key={day.dayIndex}><h3>{dayNames[day.dayIndex]}</h3>{!day.workoutIds.length && <p className="rest-label">Descanso</p>}{day.workoutIds.map((id, slot) => <div className="day-assignment" key={`${id}-${slot}`}><span>{workouts.find((w) => w.id === id)?.name || 'Workout no disponible'}</span><div><button type="button" disabled={busy || slot === 0} aria-label={`Subir ${workouts.find((w) => w.id === id)?.name} del ${dayNames[day.dayIndex]}`} onClick={() => { const ids = [...day.workoutIds]; [ids[slot - 1], ids[slot]] = [ids[slot], ids[slot - 1]]; changeDay(day.dayIndex, ids); }}>↑</button><button type="button" disabled={busy} aria-label={`Quitar workout ${slot + 1} del ${dayNames[day.dayIndex]}`} onClick={() => changeDay(day.dayIndex, day.workoutIds.filter((_, i) => i !== slot))}>×</button></div></div>)}{day.workoutIds.length < 3 && <label className="day-add"><span className="sr-only">Agregar workout al {dayNames[day.dayIndex]}</span><select disabled={busy} value="" onChange={(e) => { if (e.target.value) changeDay(day.dayIndex, [...day.workoutIds, e.target.value]); }}><option value="">+ Agregar workout</option>{workouts.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select></label>}</article>)}</div><div className="editor-summary"><span>{sessionCount} workouts · {days.filter((d) => d.workoutIds.length).length} días de entrenamiento</span><span>Los cambios no afectan registros de sesiones anteriores.</span></div>{error && <p role="alert" className="form-error">{error}</p>}<button className="primary-button" disabled={busy || !sessionCount}>{busy ? 'Guardando…' : 'Guardar mi rutina'}</button></form></section>;
}
