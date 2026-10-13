'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/provider';
import { apiRequest } from '@/lib/api/client';
import { getFirebaseAuth } from '@/lib/firebase/client';
import { goals, type Profile } from '@/lib/profile';
import { dayNames, searchText, type Catalog, type Routine, type RoutineTemplate, type Workout, type Exercise } from '@/lib/training';
import DashboardLoading from '@/components/ui/DashboardLoading';
import Icon from '@/components/ui/Icon';
import RoutineEditor from '@/components/training/RoutineEditor';
import WorkoutEditor from '@/components/training/WorkoutEditor';
import ExerciseEditor from '@/components/training/ExerciseEditor';
import EntityActions from '@/components/training/EntityActions';

type Tab = 'templates' | 'mine' | 'workouts' | 'exercises';
export default function TrainingLibrary() {
  const session = useAuth(); const router = useRouter();
  const [catalog, setCatalog] = useState<Catalog | null>(null); const [routines, setRoutines] = useState<Routine[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null); const [tab, setTab] = useState<Tab>('templates');
  const [editor, setEditor] = useState<'routine' | 'workout' | 'exercise' | null>(null); const [source, setSource] = useState<Routine | RoutineTemplate | null>(null);
  const [search, setSearch] = useState(''); const [muscle, setMuscle] = useState(''); const [equipment, setEquipment] = useState('');
  const [goalFilter, setGoalFilter] = useState(''); const [error, setError] = useState(''); const [notice, setNotice] = useState(''); const [busy, setBusy] = useState(false);
  const [loadedUid, setLoadedUid] = useState<string | null>(null);
  const [editingExisting,setEditingExisting] = useState(false);
  const [workoutSource,setWorkoutSource] = useState<Workout | null>(null);
  const [exerciseSource,setExerciseSource] = useState<Exercise | null>(null);
  const [initialWorkoutId, setInitialWorkoutId] = useState<string | undefined>();
  const editorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!editor || !editorRef.current) return;
    editorRef.current.focus({ preventScroll: true });
    editorRef.current.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }, [editor]);
  async function reload() {
    const auth = getFirebaseAuth();
    const uid = auth.currentUser?.uid;
    const [nextCatalog, own] = await Promise.all([apiRequest<Catalog>('training/catalog', {}, auth), apiRequest<{ routines: Routine[]; activeRoutineId: string | null }>('training/routines', {}, auth)]);
    if (auth.currentUser?.uid !== uid) return;
    setCatalog(nextCatalog); setRoutines(own.routines); setActiveId(own.activeRoutineId); setLoadedUid(uid || null);
  }
  useEffect(() => {
    if (session.loading) return;
    if (!session.user) { router.replace('/login'); return; }
    if (!session.identity) return;
    if (!session.identity.emailVerified) { router.replace('/verificar-correo'); return; }
    let cancelled = false;
    async function load() {
      try {
        const profile = await apiRequest<{ profile: Profile | null }>('profile', {}, getFirebaseAuth());
        if (cancelled) return;
        if (!profile.profile?.onboardingCompleted) { router.replace('/onboarding'); return; }
        await reload();
      } catch (e) { if (!cancelled) setError(e instanceof Error ? e.message : 'No pudimos cargar la biblioteca.'); }
    }
    void load(); return () => { cancelled = true; };
  }, [session.loading, session.user, session.identity, router]);
  async function activate(id: string) {
    setBusy(true); setError('');
    try { await apiRequest('training/active-routine', { method: 'PUT', body: JSON.stringify({ routineId: id }) }, getFirebaseAuth()); setActiveId(id); setNotice('Rutina activa actualizada. Esta es tu planificación semanal.'); }
    catch (e) { setError(e instanceof Error ? e.message : 'No pudimos activar la rutina.'); }
    finally { setBusy(false); }
  }
  function edit(value: Routine | RoutineTemplate | null, workoutId?: string, existing = false) { setEditingExisting(existing); setSource(value); setInitialWorkoutId(workoutId); setEditor('routine'); setNotice(''); }
  async function saved() { await reload(); setEditor(null); setTab(editor === 'routine' ? (source?.visibility === 'public' || (!source && session.identity?.role === 'admin') ? 'templates' : 'mine') : editor === 'exercise' ? 'exercises' : 'workouts'); setNotice(editor === 'routine' ? 'Rutina guardada. Podés activarla desde Mis rutinas.' : editor === 'exercise' ? 'Ejercicio guardado. Ya podés agregarlo a un workout.' : 'Workout guardado. Ya podés asignarlo a tus días.'); }
  async function remove(kind: string, item: {id:string;name:string;version:number}) {
    if (!window.confirm(`¿Borrar «${item.name}» de la biblioteca? Sus versiones y referencias históricas se conservarán.`)) return;
    setBusy(true); setError('');
    try { await apiRequest(`training/${kind}/${item.id}`,{method:'DELETE',body:JSON.stringify({expectedVersion:item.version})},getFirebaseAuth()); await reload(); setNotice('Contenido retirado de la biblioteca.'); }
    catch(e){setError(e instanceof Error?e.message:'No se pudo borrar.');} finally{setBusy(false);}
  }
  if (session.error) return <div className="dashboard-error"><p role="alert">{session.error}</p><button onClick={() => window.location.reload()}>Reintentar</button></div>;
  if (!catalog || session.loading || !session.identity || loadedUid !== session.identity.uid) return error ? <div className="dashboard-error"><p role="alert">{error}</p><button onClick={() => window.location.reload()}>Reintentar</button></div> : <DashboardLoading message="Preparando tu biblioteca…" />;
  const goalName = goals.find(([value]) => value === catalog.userGoal)?.[1];
  const visibleExercises = catalog.exercises.filter((e) => (!muscle || e.muscle === muscle) && (!equipment || e.equipment === equipment) && searchText(`${e.name} ${e.muscle} ${e.equipment}`).includes(searchText(search)));
  const visibleWorkouts = catalog.workouts.filter((w) => searchText(`${w.name} ${w.focus}`).includes(searchText(search)));
  return <div className="dashboard-view training-page"><div className="dashboard-topbar"><span>Tu biblioteca de entrenamiento</span><span className="badge">{goalName}</span></div><section className="intro training-intro"><p className="eyebrow">ENTRENAMIENTO</p><h1>Un plan que encaje con vos.</h1><p className="description">Ejercicios que forman workouts. Workouts que distribuís en tu semana.</p></section>{error && <p className="form-error" role="alert">{error}</p>}{notice && <p className="training-notice" role="status">{notice}</p>}
    {editor ? <div ref={editorRef} className="editor-region" tabIndex={-1} aria-label="Editor de entrenamiento">{editor === 'routine' ? <RoutineEditor key={source?.id || 'new'} source={source} workouts={catalog.workouts} initialWorkoutId={initialWorkoutId} editing={editingExisting} onSaved={saved} onCancel={() => setEditor(null)} /> : editor === 'workout' ? <WorkoutEditor source={workoutSource} exercises={catalog.exercises} onSaved={saved} onCancel={() => setEditor(null)} /> : <ExerciseEditor source={exerciseSource} onSaved={saved} onCancel={() => setEditor(null)} />}</div> : <><nav className="training-tabs" aria-label="Secciones de entrenamiento">{([['templates', 'Rutinas base'], ['mine', session.identity?.role === 'admin' ? 'Rutinas de usuarios' : 'Mis rutinas'], ['workouts', 'Workouts'], ['exercises', 'Ejercicios']] as [Tab, string][]).map(([value, label]) => <button key={value} className={tab === value ? 'selected' : ''} aria-pressed={tab === value} onClick={() => { setTab(value); setSearch(''); setError(''); }}>{label}{value === 'mine' && <span>{routines.length}</span>}</button>)}</nav>
    {tab === 'templates' && <><div className="training-context"><Icon name="chart" /><div><strong>Sugerencias para {goalName?.toLowerCase() || 'tu objetivo'}</strong><p>Las etiquetas orientan por enfoque y distribución. Todas las plantillas están disponibles; elegí también según tu experiencia, tiempo y preferencias.</p></div></div><label className="filter-label">Enfoque de la plantilla<select value={goalFilter} onChange={(e) => setGoalFilter(e.target.value)}><option value="">Todos los objetivos</option>{goals.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><div className="training-grid">{catalog.routineTemplates.filter((t) => !goalFilter || t.goals.includes(goalFilter)).map((template) => <article className={`library-card ${template.recommended ? 'recommended' : ''}`} key={template.id}><div className="card-tags"><span className="badge">{template.level}</span>{template.recommended && <span className="recommended-tag">Sugerida para vos</span>}</div><h2>{template.name}</h2><p>{template.description}</p><div className="template-tags">{template.goals.map((goal) => <span key={goal}>{goals.find(([value]) => value === goal)?.[1]}</span>)}</div><details><summary>¿Qué enfoque tiene?</summary><p>{template.rationale}</p><ul>{template.days.filter((d) => d.workoutIds.length).map((day) => <li key={day.dayIndex}>{dayNames[day.dayIndex]} · {day.workoutIds.map((id) => catalog.workouts.find((w) => w.id === id)?.name).join(' + ')}</li>)}</ul><p>Podés mover estos workouts a otros días al personalizar.</p></details><EntityActions permissions={template.permissions} busy={busy} onEdit={() => edit(template,undefined,true)} onDelete={() => void remove('routines',template)} /><button className="primary-button" onClick={() => edit(template)}>Personalizar esta rutina <Icon name="arrow" /></button></article>)}</div><p className="library-footnote">Plantillas iniciales orientativas, sin cargas impuestas. No generan resultados por sí solas ni reemplazan una evaluación individual.</p></>}
    {tab === 'mine' && <><div className="library-toolbar"><p>Elegí una rutina activa o armá una nueva desde cero.</p><button className="primary-button" onClick={() => edit(null)}>+ Crear rutina</button></div>{!routines.length && <div className="empty-library"><Icon name="workout" /><h2>Tu semana empieza acá</h2><p>Personalizá una rutina base o distribuí tus propios workouts.</p><button onClick={() => setTab('templates')}>Explorar rutinas base</button></div>}<div className="training-grid">{routines.map((routine) => <article className="library-card" key={routine.id}><span className="badge">{activeId === routine.id ? 'Rutina activa' : routine.ownerId === session.identity?.uid ? 'Mi rutina' : 'De otro usuario'}</span><h2>{routine.name}</h2><p>{routine.days.filter((d) => d.workoutIds.length).length} días de entrenamiento</p><div className="routine-week-preview">{routine.days.map((day) => <div key={day.dayIndex}><strong>{dayNames[day.dayIndex]}</strong><span>{(day.assignments?.map((a) => a.name) || day.workoutIds.map((id) => catalog.workouts.find((w) => w.id === id)?.name)).join(' + ') || 'Descanso'}</span></div>)}</div><div className="library-actions"><EntityActions permissions={routine.permissions} busy={busy} onEdit={() => edit(routine,undefined,true)} onDelete={() => void remove('routines',routine)} /><button className="primary-button" onClick={() => void activate(routine.id)} disabled={busy || activeId === routine.id}>{activeId === routine.id ? 'Activa' : 'Usar esta rutina'}</button></div></article>)}</div></>}
    {(tab === 'workouts' || tab === 'exercises') && <><div className="library-toolbar"><label className="search-field"><span className="sr-only">Buscar {tab === 'workouts' ? 'workouts' : 'ejercicios'}</span><input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Buscar ${tab === 'workouts' ? 'workouts' : 'ejercicios'}…`} /></label>{tab === 'exercises' && <button className="primary-button" onClick={() => {setExerciseSource(null);setEditor('exercise');}}>+ Crear ejercicio</button>}{tab === 'workouts' && <button className="primary-button" onClick={() => { setWorkoutSource(null); setEditor('workout'); }}>+ Crear workout</button>}</div>{tab === 'exercises' && <div className="library-filters"><label>Grupo muscular<select value={muscle} onChange={(e) => setMuscle(e.target.value)}><option value="">Todos</option>{[...new Set(catalog.exercises.map((e) => e.muscle))].map((value) => <option key={value}>{value}</option>)}</select></label><label>Equipamiento<select value={equipment} onChange={(e) => setEquipment(e.target.value)}><option value="">Todos</option>{[...new Set(catalog.exercises.map((e) => e.equipment))].map((value) => <option key={value}>{value}</option>)}</select></label><p role="status">{visibleExercises.length} ejercicios</p></div>}{tab === 'workouts' ? <div className="training-grid">{visibleWorkouts.map((workout) => <article className="library-card" key={workout.id}><span className="badge">{workout.source === 'personal' ? (workout.ownerId === session.identity?.uid ? 'Mi workout' : 'De otro usuario') : 'Workout compartido'}</span><h2>{workout.name}</h2><p>{workout.focus} · {workout.exercises.length} ejercicios</p><details><summary>Ver ejercicios y series</summary><ol className="workout-detail">{workout.exercises.map((entry, i) => <li key={i}><strong>{catalog.exercises.find((e) => e.id === entry.exerciseId)?.name || entry.exerciseSnapshot?.name || 'Ejercicio archivado'}</strong><span>{entry.sets} series · {entry.repsMin}–{entry.repsMax} reps · {entry.restSeconds} s descanso</span></li>)}</ol></details><EntityActions permissions={workout.permissions} busy={busy} onEdit={() => {setWorkoutSource(workout);setEditor('workout');}} onDelete={() => void remove('workouts',workout)} /><button onClick={() => edit(null, workout.id)}>Asignar en una rutina</button></article>)}</div> : <div className="exercise-grid">{visibleExercises.map((exercise) => <article className="library-card exercise-card" key={exercise.id}><span className="icon-tile"><Icon name="workout" /></span><div><h2>{exercise.name}</h2><p>{exercise.muscle} · {exercise.equipment}</p></div><details><summary>Indicaciones básicas</summary><p>{exercise.instructions}</p></details><EntityActions permissions={exercise.permissions} busy={busy} onEdit={() => {setExerciseSource(exercise);setEditor('exercise');}} onDelete={() => void remove('exercises',exercise)} /></article>)}</div>}{(tab === 'exercises' ? !visibleExercises.length : !visibleWorkouts.length) && <p className="empty-library">No hay resultados con esos filtros.</p>}</>}
    </>}
  </div>;
}
