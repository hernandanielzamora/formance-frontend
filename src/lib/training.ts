export type Exercise = { id: string; name: string; muscle: string; equipment: string; instructions: string; tracking: string; version: number };
export type WorkoutEntry = { exerciseId: string; sets: number; repsMin: number; repsMax: number; restSeconds: number };
export type Workout = { id: string; name: string; focus: string; exercises: WorkoutEntry[]; source: 'catalog' | 'personal'; version: number };
export type RoutineDay = { dayIndex: number; workoutIds: string[]; assignments?: { name: string; assignmentId: string }[] };
export type RoutineTemplate = { id: string; name: string; description: string; level: string; goals: string[]; rationale: string; recommended: boolean; days: RoutineDay[] };
export type Routine = { id: string; name: string; days: RoutineDay[]; version: number; sourceTemplateId: string | null };
export type Catalog = { exercises: Exercise[]; workouts: Workout[]; routineTemplates: RoutineTemplate[]; userGoal: string | null };
export const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
export const emptyWeek = (): RoutineDay[] => dayNames.map((_, dayIndex) => ({ dayIndex, workoutIds: [] }));
export function searchText(value: string) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
