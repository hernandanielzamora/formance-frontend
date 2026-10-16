'use client';
import { useEffect, useRef, useState } from 'react';
import { apiRequest, ApiError } from '@/lib/api/client';
import { getFirebaseAuth } from '@/lib/firebase/client';
import { dateLabel, sessionStatus, type TrainingSession, type LoggedSet } from '@/lib/training-sessions';

import { useApiMutationRequest } from '@/lib/store/hooks';

export default function SessionRecorder({ initial, onSaved, onClose }: { initial: TrainingSession; onSaved: (session: TrainingSession) => void; onClose: () => void }) {
  const request = useApiMutationRequest();
  const [session, setSession] = useState(initial);
  const [entries, setEntries] = useState(() => initial.performedEntries.map((entry, index) => ({ ...entry, sets: entry.sets.length || initial.status !== 'in_progress' ? entry.sets : Array.from({ length: initial.workoutSnapshot.entries[index].planned.sets }, (_, order) => ({ setId: crypto.randomUUID(), order, reps: null, externalLoadKg: null, completed: false })) })));
  const [note, setNote] = useState(initial.note); const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [notice, setNotice] = useState('');
  const [conflict, setConflict] = useState(false); const title = useRef<HTMLHeadingElement>(null);
  const closed = session.status !== 'in_progress';
  useEffect(() => { title.current?.focus({ preventScroll: true }); }, []);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    const navigation = (event: MouseEvent) => {
      const anchor = (event.target as Element).closest?.('a[href]');
      if (anchor && !window.confirm('Tenés series sin guardar. ¿Salir y descartar esos cambios?')) { event.preventDefault(); event.stopPropagation(); }
    };
    window.addEventListener('beforeunload', warn); document.addEventListener('click', navigation, true);
    return () => { window.removeEventListener('beforeunload', warn); document.removeEventListener('click', navigation, true); };
  }, [dirty]);
  function change(entryIndex: number, setIndex: number, update: Partial<LoggedSet>) {
    setEntries(rows => rows.map((entry, index) => index === entryIndex ? { ...entry, sets: entry.sets.map((set, i) => i === setIndex ? { ...set, ...update } : set) } : entry));
    setDirty(true); setNotice('');
  }
  function close() { if (!dirty || window.confirm('Tenés series sin guardar. ¿Salir y descartar esos cambios?')) onClose(); }
  async function save(status: TrainingSession['status']) {
    if (status === 'abandoned' && !window.confirm('¿Interrumpir esta sesión? Se conservarán las series guardadas y no podrás seguir editándola.')) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const result = await request<{ session: TrainingSession }>(`training/sessions/${session.id}`, { method: 'PUT', body: JSON.stringify({ expectedVersion: session.version, status, note, performedEntries: entries }) });
      setSession(result.session); setEntries(result.session.performedEntries); setDirty(false); setNotice(status === 'in_progress' ? 'Series guardadas. Podés continuar más tarde.' : 'Sesión registrada en tu historial.'); onSaved(result.session);
    } catch (e) { setError(e instanceof Error ? e.message : 'No pudimos guardar la sesión.'); if (e instanceof ApiError && e.status === 409) setConflict(true); }
    finally { setBusy(false); }
  }
  async function reload() {
    if (dirty && !window.confirm('¿Cargar la versión guardada y descartar los cambios locales?')) return;
    setBusy(true);
    try { const result = await apiRequest<{ session: TrainingSession }>(`training/sessions/${session.id}`, {}, getFirebaseAuth()); setSession(result.session); setEntries(result.session.performedEntries); setNote(result.session.note); setDirty(false); setConflict(false); setError(''); onSaved(result.session); }
    catch (e) { setError(e instanceof Error ? e.message : 'No pudimos cargar la sesión.'); }
    finally { setBusy(false); }
  }
  const completedSets = entries.reduce((count, entry) => count + entry.sets.filter(set => set.completed).length, 0);
  return <section className="session-recorder training-editor" aria-label="Registro de entrenamiento">
    <div className="editor-heading"><div><p className="eyebrow">{dateLabel(session.localDate, { weekday: 'long', day: 'numeric', month: 'long' })}</p><h2 ref={title} tabIndex={-1}>{session.workoutSnapshot.name}</h2></div><button disabled={busy} onClick={close}>Volver al calendario</button></div>
    <p>{sessionStatus[session.status]} · {completedSets} series realizadas. Registrá la carga externa en kg; dejá el campo vacío si no la mediste. Para ejercicios sin carga externa podés usar 0 kg.</p>
    <form onSubmit={event => { event.preventDefault(); void save('in_progress'); }}>
      {session.workoutSnapshot.entries.map((entry, entryIndex) => <fieldset className="logged-exercise" key={entry.entryId} disabled={closed || busy || conflict}>
        <legend>{entry.exerciseName}</legend><p className="set-prescription">Plan: {entry.planned.sets} series · {entry.planned.repsMin}–{entry.planned.repsMax} reps · {entry.planned.restSeconds} s de descanso</p>
        <div className="set-column-labels" aria-hidden="true"><span>Serie</span><span>Reps</span><span>Carga (kg)</span><span>Hecha</span></div>
        {entries[entryIndex].sets.map((set, setIndex) => <div className={`logged-set ${set.completed ? 'set-done' : ''}`} key={set.setId}>
          <span className="set-number">{setIndex + 1}</span>
          <label><span className="sr-only">Repeticiones, serie {setIndex + 1} de {entry.exerciseName}</span><input type="number" inputMode="numeric" min={1} max={1000} step={1} value={set.reps ?? ''} required={set.completed} onChange={event => change(entryIndex, setIndex, { reps: event.target.value === '' ? null : Number(event.target.value) })} /></label>
          <label><span className="sr-only">Carga externa en kg, serie {setIndex + 1} de {entry.exerciseName}</span><input type="number" inputMode="decimal" min={0} max={1000} step="0.01" value={set.externalLoadKg ?? ''} placeholder="—" onChange={event => change(entryIndex, setIndex, { externalLoadKg: event.target.value === '' ? null : Number(event.target.value) })} /></label>
          <label className="set-check"><span className="sr-only">Serie {setIndex + 1} de {entry.exerciseName} realizada</span><input type="checkbox" checked={set.completed} onChange={event => change(entryIndex, setIndex, { completed: event.target.checked })} /></label>
        </div>)}
        {!closed && <button type="button" disabled={entries[entryIndex].sets.length >= 30} onClick={() => { setEntries(rows => rows.map((row, index) => index === entryIndex ? { ...row, sets: [...row.sets, { setId: crypto.randomUUID(), order: row.sets.length, reps: null, externalLoadKg: null, completed: false }] } : row)); setDirty(true); }}>+ Agregar serie</button>}
      </fieldset>)}
      <label>Notas de la sesión<textarea maxLength={1500} rows={3} value={note} disabled={closed || busy || conflict} onChange={event => { setNote(event.target.value); setDirty(true); }} /></label>
      {error && <p role="alert" className="form-error">{error}</p>}{notice && <p role="status" className="training-notice">{notice}</p>}
      {conflict && <button type="button" disabled={busy} onClick={() => void reload()}>Cargar versión guardada</button>}
      {!closed && <><div className="session-actions"><button type="submit" disabled={busy || conflict}>{busy ? 'Guardando…' : 'Guardar series'}</button><button className="primary-button" type="button" disabled={busy || conflict || !completedSets} onClick={event => { if (event.currentTarget.form?.reportValidity()) void save('completed'); }}>Finalizar entrenamiento</button></div><button className="danger-button session-interrupt" type="button" disabled={busy || conflict} onClick={() => void save('abandoned')}>Interrumpir sesión</button></>}
      <p className="save-state" role="status">{dirty ? 'Cambios sin guardar' : 'Registro guardado'}{closed ? ' · Sesión cerrada' : ''}</p>
    </form>
  </section>;
}
