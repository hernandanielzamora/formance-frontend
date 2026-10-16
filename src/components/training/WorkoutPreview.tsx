import type { CalendarAssignment } from '@/lib/training-sessions';

export default function WorkoutPreview({ assignment }: { assignment: CalendarAssignment }) {
  const exercises = assignment.exercises || [];
  if (!exercises.length) return <p className="calendar-hint">Esta planificación no tiene un detalle de ejercicios disponible. Revisá el workout desde la biblioteca.</p>;
  return <section className="workout-preview" aria-label={`Ejercicios planificados de ${assignment.name}`}>
    <p className="workout-preview-summary">{exercises.length} ejercicios · {exercises.reduce((total, exercise) => total + exercise.sets, 0)} series planificadas</p>
    <ol>{exercises.map((exercise, index) => <li key={exercise.entryId || `${exercise.exerciseId}-${index}`}>
      <div className="preview-exercise-name"><span aria-hidden="true">{index + 1}</span><div><strong>{exercise.exerciseName || exercise.exerciseSnapshot?.name || 'Ejercicio sin nombre'}</strong>{(exercise.muscle || exercise.equipment) && <small>{[exercise.muscle, exercise.equipment].filter(Boolean).join(' · ')}</small>}</div></div>
      <dl><div><dt>Series</dt><dd>{exercise.sets}</dd></div><div><dt>Repeticiones</dt><dd>{exercise.repsMin === exercise.repsMax ? exercise.repsMin : `${exercise.repsMin}–${exercise.repsMax}`}</dd></div><div><dt>Descanso</dt><dd>{exercise.restSeconds} s</dd></div></dl>
    </li>)}</ol>
    <p className="calendar-hint">Plan de tu rutina actual. Abrí el registro para cargar las series realizadas.</p>
  </section>;
}
