export type Targets = { calories: number; protein: number; fat: number; carbohydrates: number };
export type Profile = {
  name: string; age: number; sex: 'male' | 'female'; heightCm: number; initialWeightKg: number;
  activity: string; goal: string; targets: Targets; onboardingCompleted: boolean;
};
export const activities = [
  ['sedentary', 'Sedentaria', 'Poco movimiento o trabajo de escritorio.'],
  ['light', 'Ligera', 'Entrenamiento suave de 1 a 3 días por semana.'],
  ['moderate', 'Moderada', 'Actividad o entrenamiento de 3 a 5 días por semana.'],
  ['high', 'Alta', 'Entrenamiento frecuente o trabajo físico.'],
  ['intense', 'Muy alta', 'Actividad física intensa y sostenida.'],
];
export const goals = [
  ['maintain', 'Mantener mi peso', 'Construir constancia y seguir mi evolución.'],
  ['muscle', 'Ganar masa muscular', 'Acompañar mi entrenamiento con un objetivo de crecimiento.'],
  ['recomposition', 'Mejorar mi composición corporal', 'Seguir entrenamiento, alimentación y peso en conjunto.'],
  ['fat_loss', 'Reducir grasa corporal', 'Observar mi evolución hacia un objetivo de reducción.'],
];
