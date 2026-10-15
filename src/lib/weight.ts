export type WeightMeasurement = { id: string; localDate: string; timeZone: string; weightKg: number; note: string; source: 'manual' | 'onboarding'; version: number; readOnly: boolean; dateInferred: boolean };
export type WeightSummary = { count: number; first: WeightMeasurement | null; last: WeightMeasurement | null; averageKg: number | null; changeKg: number | null; measurements: WeightMeasurement[] };
export type WeightHistory = { from: string; to: string; today: string; initial: WeightMeasurement | null; measurements: WeightMeasurement[]; summary: WeightSummary };
