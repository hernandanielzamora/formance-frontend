import type { Routine, WorkoutEntry } from './training';
export type LoggedSet = { setId: string; order: number; reps: number | null; externalLoadKg: number | null; completed: boolean };
export type TrainingSession = {
  id: string; version: number; routineId: string; routineVersion: number; routineName: string;
  assignmentId: string; workoutId: string; workoutVersion: number; localDate: string; timeZone: string;
  startedAt: string; finishedAt: string | null; status: 'in_progress' | 'completed' | 'abandoned'; note: string;
  workoutSnapshot: { name: string; entries: { entryId: string; exerciseId: string; exerciseName: string; tracking: string; planned: { sets: number; repsMin: number; repsMax: number; restSeconds: number } }[] };
  performedEntries: { entryId: string; exerciseId: string; sets: LoggedSet[] }[];
};
export type CalendarAssignment = { assignmentId: string; workoutId: string; workoutVersion: number; name: string; exercises?: (WorkoutEntry & { entryId?: string; exerciseName?: string; muscle?: string; equipment?: string })[] };
export type CalendarRoutine = Omit<Routine, 'days'> & { days: { dayIndex: number; workoutIds: string[]; assignments?: CalendarAssignment[] }[] };
export type TrainingCalendar = { routine: CalendarRoutine | null; sessions: TrainingSession[]; today: string; timeZone: string };
export const sessionStatus = { in_progress: 'En curso', completed: 'Completada', abandoned: 'Interrumpida' };
// Dates are calendar values, never instants in the browser's timezone.
export function addDays(value: string, days: number) {
  const date = new Date(`${value}T12:00:00Z`); date.setUTCDate(date.getUTCDate() + days); return date.toISOString().slice(0, 10);
}
export function monday(value: string) { return addDays(value, -((new Date(`${value}T12:00:00Z`).getUTCDay() + 6) % 7)); }
export function localDate() {
  const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function dateLabel(value: string, options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }) {
  return new Intl.DateTimeFormat('es-AR', { ...options, timeZone: 'UTC' }).format(new Date(`${value}T12:00:00Z`));
}
