export const mealTypes = [['breakfast', 'Desayuno'], ['lunch', 'Almuerzo'], ['snack', 'Merienda'], ['dinner', 'Cena'], ['extra', 'Extras']] as const;
export const nutrientLabels = { calories: 'Calorías (kcal)', protein: 'Proteínas (g)', fat: 'Grasas (g)', carbohydrates: 'Carbohidratos (g)' };
export const nutrientKeys = ['calories', 'protein', 'fat', 'carbohydrates'] as const;
export type Nutrients = Record<typeof nutrientKeys[number], number | null>;
export type Food = { itemId?: string; source: 'manual' | 'usda' | 'gemini'; name: string; grams: number; basis: 'per100g' | 'portion'; nutrients: Nutrients; foodId?: number; analysisId?: string; brand?: string | null; totals?: Nutrients; estimated?: boolean };
export type FoodItem = Food & { itemId: string };
export type Meal = { id: string; version: number; localDate: string; timeZone: string; mealType: string; note: string; items: FoodItem[] };
export type Diary = { meals: Meal[]; totals: Record<typeof nutrientKeys[number], { value: number; complete: boolean }>; targets: Nutrients | null; today: string };
export type FoodCapabilities = { usda: boolean; gemini: boolean; userDailyLimit: number };
export function itemTotals(item: Food): Nutrients { return Object.fromEntries(nutrientKeys.map(key => [key, item.nutrients[key] === null ? null : Math.round(item.nutrients[key]! * (item.basis === 'per100g' ? item.grams / 100 : 1) * 100) / 100])) as Nutrients; }
export const formatNumber = (value: number | null) => value === null ? 'Sin dato' : new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 }).format(value);
export async function compressedPhoto(file: File): Promise<{ image: string; mimeType: string }> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 15 * 1024 * 1024) throw new Error('Usá una foto JPG, PNG o WebP de hasta 15 MB.');
  const bitmap = await createImageBitmap(file);
  try {
    const ratio = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height)); const canvas = document.createElement('canvas'); canvas.width = Math.round(bitmap.width * ratio); canvas.height = Math.round(bitmap.height * ratio);
    const context = canvas.getContext('2d'); if (!context) throw new Error('No pudimos preparar la imagen.');
    context.fillStyle = '#fff'; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const result = canvas.toDataURL('image/jpeg', 0.75).split(',')[1]; if (result.length > 1333336) throw new Error('La foto sigue siendo demasiado grande. Probá otra más pequeña.');
    return { image: result, mimeType: 'image/jpeg' };
  } finally { bitmap.close(); }
}
