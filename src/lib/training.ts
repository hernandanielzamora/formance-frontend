export type Permissions = { canEdit: boolean; canDelete: boolean };
export type Owned = { ownerId: string; visibility: 'public' | 'private'; permissions: Permissions };
export type Exercise = Owned & { id: string; name: string; muscle: string; equipment: string; instructions: string; tracking: string; version: number };
export type WorkoutEntry = { exerciseId: string; sets: number; repsMin: number; repsMax: number; restSeconds: number; exerciseSnapshot?: {name:string;version:number} };
export type Workout = Owned & { id: string; name: string; focus: string; exercises: WorkoutEntry[]; source: 'catalog' | 'personal'; version: number };
export type RoutineDay = { dayIndex: number; workoutIds: string[]; assignments?: { name: string; assignmentId: string }[] };
export type RoutineTemplate = Owned & { id: string; name: string; description: string; level: string; goals: string[]; rationale: string; recommended: boolean; days: RoutineDay[]; version: number; sourceTemplateId: string | null };
export type Routine = Owned & { id: string; name: string; days: RoutineDay[]; version: number; sourceTemplateId: string | null; goals?: string[]; description?: string; rationale?: string; level?: string };
export type Catalog = { exercises: Exercise[]; workouts: Workout[]; routineTemplates: RoutineTemplate[]; userGoal: string | null };
export const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
export const emptyWeek = (): RoutineDay[] => dayNames.map((_, dayIndex) => ({ dayIndex, workoutIds: [] }));
export function searchText(value: string) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
