'use client';
import { useEffect, useRef, useState } from 'react';
import { apiRequest, ApiError } from '@/lib/api/client';
import { getFirebaseAuth } from '@/lib/firebase/client';
import { mealTypes, nutrientKeys, nutrientLabels, itemTotals, formatNumber, compressedPhoto, type Food, type FoodItem, type Meal, type FoodCapabilities } from '@/lib/food';

export default function FoodEditor({ initial, copying = false, date, capabilities, onSaved, onClose }: { initial: Meal | null; copying?: boolean; date: string; capabilities: FoodCapabilities; onSaved: () => Promise<void>; onClose: () => void }) {
  const [mode, setMode] = useState<'manual' | 'search' | 'photo'>('manual');
  const [items, setItems] = useState<FoodItem[]>(() => initial?.items.map(item => ({ ...item })) || []);
  const [mealType, setMealType] = useState(initial?.mealType || 'lunch'); const [note, setNote] = useState(initial?.note || '');
  const [query, setQuery] = useState(''); const [results, setResults] = useState<Food[]>([]);
  const [busy, setBusy] = useState(false); const [saving, setSaving] = useState(false); const [error, setError] = useState(''); const [conflict, setConflict] = useState(false);
  const [dirty, setDirty] = useState(copying); const [photo, setPhoto] = useState<{ image: string; mimeType: string } | null>(null);
  const [consent, setConsent] = useState(false); const [suggestions, setSuggestions] = useState<FoodItem[]>([]); const [photoNote, setPhotoNote] = useState('');
  const [manual, setManual] = useState({ name: '', grams: '100', basis: 'per100g', calories: '', protein: '', fat: '', carbohydrates: '' });
  const mealId = useRef(initial && !copying ? initial.id : crypto.randomUUID()); const photoRequest = useRef(crypto.randomUUID());
  const persistedVersion = useRef<number | null>(initial && !copying ? initial.version : null);
  const title = useRef<HTMLHeadingElement>(null);
  useEffect(() => { title.current?.focus({ preventScroll: true }); }, []);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    const navigation = (event: MouseEvent) => { if ((event.target as Element).closest?.('a[href]') && !window.confirm('Tenés una comida sin guardar. ¿Descartar los cambios y salir?')) { event.preventDefault(); event.stopPropagation(); } };
    window.addEventListener('beforeunload', warn); document.addEventListener('click', navigation, true);
    return () => { window.removeEventListener('beforeunload', warn); document.removeEventListener('click', navigation, true); };
  }, [dirty]);
  function add(food: Food) { setItems(rows => [...rows, { ...food, itemId: crypto.randomUUID(), grams: food.grams || 100 }]); setDirty(true); }
  function close() { if (!dirty || window.confirm('¿Descartar los cambios de esta comida?')) onClose(); }
  async function search() {
    setBusy(true); setError('');
    try { const result = await apiRequest<{ foods: Food[] }>(`food/search?q=${encodeURIComponent(query.trim())}`, {}, getFirebaseAuth()); setResults(result.foods); }
    catch (e) { setError(e instanceof Error ? e.message : 'No pudimos buscar alimentos.'); } finally { setBusy(false); }
  }
  async function analyze() {
    if (!photo) return; setBusy(true); setError(''); setSuggestions([]);
    try {
      const result = await apiRequest<{ analysisId: string; items: Food[]; note: string }>('food/analyze', { method: 'POST', body: JSON.stringify({ ...photo, consent, requestId: photoRequest.current }), signal: AbortSignal.timeout(60000) }, getFirebaseAuth());
      setSuggestions(result.items.map(item => ({ ...item, itemId: crypto.randomUUID(), analysisId: result.analysisId }))); setPhotoNote(result.note);
    } catch (e) { setError(e instanceof Error ? e.message : 'No pudimos analizar la foto.'); photoRequest.current = crypto.randomUUID(); }
    finally { setBusy(false); }
  }
  async function save() {
    setSaving(true); setError('');
    const payload = { mealId: mealId.current, localDate: date, timeZone: initial && !copying ? initial.timeZone : Intl.DateTimeFormat().resolvedOptions().timeZone, mealType, note,
      items: items.map(item => item.source === 'usda' ? { itemId: item.itemId, source: item.source, foodId: item.foodId, grams: item.grams } : { itemId: item.itemId, source: item.source, name: item.name, grams: item.grams, basis: item.basis, nutrients: item.nutrients, ...(item.source === 'gemini' ? { analysisId: item.analysisId } : {}) }), ...(persistedVersion.current !== null ? { expectedVersion: persistedVersion.current } : {}) };
    try { const result = await apiRequest<{ meal: Meal }>(`food/meals${persistedVersion.current !== null ? `/${mealId.current}` : ''}`, { method: persistedVersion.current !== null ? 'PUT' : 'POST', body: JSON.stringify(payload) }, getFirebaseAuth()); persistedVersion.current = result.meal.version; setDirty(false); await onSaved(); }
    catch (e) { setError(e instanceof Error ? e.message : 'No pudimos guardar la comida.'); if (e instanceof ApiError && e.status === 409) setConflict(true); } finally { setSaving(false); }
  }
  function editItem(index: number, update: Partial<FoodItem>) { setItems(rows => rows.map((item, i) => i === index ? { ...item, ...update } : item)); setDirty(true); }
  return <section className="training-editor food-editor"><div className="editor-heading"><h2 ref={title} tabIndex={-1}>{initial && !copying ? 'Editar comida' : 'Registrar comida'}</h2><button disabled={busy || saving} onClick={close}>Volver al diario</button></div>
    <div className="food-meal-details"><label>Momento del día<select value={mealType} disabled={saving} onChange={event => { setMealType(event.target.value); setDirty(true); }}>{mealTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><span className="badge">{date}</span></div>
    <nav className="training-tabs" aria-label="Cómo agregar alimentos">{([['manual', 'Carga manual'], ['search', 'Buscar alimentos'], ['photo', 'Desde una foto']] as const).map(([value, label]) => <button key={value} aria-pressed={mode === value} className={mode === value ? 'selected' : ''} onClick={() => { setMode(value); setError(''); }} disabled={busy || saving}>{label}</button>)}</nav>
    {mode === 'manual' && <form className="manual-food-form" onSubmit={event => { event.preventDefault(); const food: Food = { source: 'manual', name: manual.name.trim(), grams: Number(manual.grams), basis: manual.basis as Food['basis'], nutrients: Object.fromEntries(nutrientKeys.map(key => [key, manual[key] === '' ? null : Number(manual[key])])) as Food['nutrients'] }; add(food); setManual({ name: '', grams: '100', basis: 'per100g', calories: '', protein: '', fat: '', carbohydrates: '' }); }}>
      <div className="personal-grid"><label>Nombre del alimento<input required maxLength={120} value={manual.name} onChange={event => setManual({ ...manual, name: event.target.value })} /></label><label>Cantidad consumida (g)<input required type="number" inputMode="decimal" min="0.01" max={10000} step="0.01" value={manual.grams} onChange={event => setManual({ ...manual, grams: event.target.value })} /></label><label>Los valores nutricionales corresponden a<select value={manual.basis} onChange={event => setManual({ ...manual, basis: event.target.value })}><option value="per100g">100 gramos</option><option value="portion">La porción consumida completa</option></select></label></div>
      <p className="food-hint">Los campos vacíos se guardan como datos desconocidos, no como cero.</p><div className="food-nutrients">{nutrientKeys.map(key => <label key={key}>{nutrientLabels[key]}<input type="number" inputMode="decimal" min={0} max={key === 'calories' ? 10000 : 1000} step="0.01" value={manual[key]} onChange={event => setManual({ ...manual, [key]: event.target.value })} /></label>)}</div><button disabled={saving || items.length >= 20}>Agregar alimento</button>
    </form>}
    {mode === 'search' && <div className="food-search"><p className="food-hint">Fuente: USDA FoodData Central. Algunos nombres están en inglés; probá también “rice”, “chicken” o “egg”. Revisá si el alimento es crudo o cocido.</p>{capabilities.usda ? <><form onSubmit={event => { event.preventDefault(); void search(); }}><label>Buscar alimento<input required minLength={2} maxLength={80} value={query} onChange={event => setQuery(event.target.value)} /></label><button disabled={busy}>{busy ? 'Buscando…' : 'Buscar'}</button></form><div className="food-results">{results.map(food => <article key={food.foodId}><div><strong>{food.name}</strong>{food.brand && <small>{food.brand}</small>}<small>{formatNumber(food.nutrients.calories)} kcal por 100 g</small></div><button disabled={saving || items.length >= 20} onClick={() => add({ ...food, grams: 100 })}>Agregar</button></article>)}</div></> : <p role="status">La búsqueda todavía no está habilitada. Podés usar la carga manual.</p>}</div>}
    {mode === 'photo' && <div className="food-photo"><p className="food-hint">La foto genera una estimación. Revisá alimentos, porciones y nutrientes antes de guardar. No detecta con certeza aceites, salsas ni ingredientes ocultos.</p>{capabilities.gemini ? <><label>Foto de tu comida<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy || saving} onChange={async event => { const file = event.target.files?.[0]; setSuggestions([]); setPhoto(null); setPhotoNote(''); setConsent(false); setError(''); if (!file) return; setBusy(true); try { setPhoto(await compressedPhoto(file)); photoRequest.current = crypto.randomUUID(); } catch (e) { setError(e instanceof Error ? e.message : 'No pudimos abrir la foto.'); } finally { setBusy(false); } }} /></label>{photo && <img className="food-photo-preview" src={`data:${photo.mimeType};base64,${photo.image}`} alt="Foto seleccionada para analizar" />}<label className="photo-consent"><input type="checkbox" checked={consent} disabled={busy} onChange={event => setConsent(event.target.checked)} /><span>Acepto enviar esta foto a Google para analizarla. En el nivel gratuito puede usarse para mejorar sus productos. Formance no guarda la imagen.</span></label><button disabled={!photo || !consent || busy} onClick={() => void analyze()}>{busy ? 'Analizando…' : 'Analizar foto'}</button><p className="food-hint">Hasta {capabilities.userDailyLimit} análisis por día, sujeto al cupo disponible. Evitá incluir personas o información privada en la foto.</p>{photoNote && <p className="training-notice" role="status">{photoNote}</p>}{suggestions.length > 0 && <div className="food-suggestions"><h3>Propuesta de la foto</h3><p className="food-hint">Agregá los alimentos que correspondan y ajustá sus datos en la comida.</p>{suggestions.map(food => <article key={food.itemId}><div><strong>{food.name}</strong><small>≈ {food.grams} g · Estimación IA</small></div><button disabled={items.length >= 20 || items.some(item => item.itemId === food.itemId)} onClick={() => { setItems(rows => [...rows, food]); setDirty(true); }}>Agregar a mi comida</button></article>)}</div>}</> : <p role="status">El análisis por foto todavía no está habilitado. Podés registrar la comida manualmente.</p>}</div>}
    <form className="food-save-form" onSubmit={event => { event.preventDefault(); void save(); }}><h3>Alimentos de esta comida ({items.length}/20)</h3>{!items.length && <p className="food-hint">Agregá un alimento para empezar.</p>}
      {items.map((item, index) => <fieldset className="food-item" key={item.itemId} disabled={saving || conflict}><legend>{item.name}</legend><div className="food-item-heading"><span className="badge">{item.source === 'gemini' ? 'Estimación IA · Revisar' : item.source === 'usda' ? 'USDA' : 'Manual'}</span><button type="button" aria-label={`Quitar ${item.name}`} onClick={() => { setItems(rows => rows.filter((_, i) => i !== index)); setDirty(true); }}>Quitar</button></div><div className="personal-grid">{item.source !== 'usda' && <label>Nombre<input required maxLength={120} value={item.name} onChange={event => editItem(index, { name: event.target.value })} /></label>}<label>Cantidad consumida (g)<input required type="number" min="0.01" max={10000} step="0.01" inputMode="decimal" value={item.grams || ''} onChange={event => editItem(index, { grams: Number(event.target.value) })} /></label></div>
        {item.source !== 'usda' && <><p className="food-hint">Valores {item.basis === 'per100g' ? 'por 100 g' : 'para la porción completa'}{item.source === 'gemini' ? ', estimados por IA y editables' : ''}.</p><div className="food-nutrients">{nutrientKeys.map(key => <label key={key}>{nutrientLabels[key]}<input type="number" min={0} max={key === 'calories' ? 10000 : 1000} step="0.01" inputMode="decimal" value={item.nutrients[key] ?? ''} onChange={event => editItem(index, { nutrients: { ...item.nutrients, [key]: event.target.value === '' ? null : Number(event.target.value) } })} /></label>)}</div></>}
        <p className="food-hint">Porción: {formatNumber(itemTotals(item).calories)} kcal · P {formatNumber(itemTotals(item).protein)} g · G {formatNumber(itemTotals(item).fat)} g · C {formatNumber(itemTotals(item).carbohydrates)} g</p>
      </fieldset>)}
      <label>Notas<textarea rows={3} maxLength={1500} value={note} disabled={saving} onChange={event => { setNote(event.target.value); setDirty(true); }} /></label>
      {error && <p className="form-error" role="alert">{error}</p>}{conflict && <p className="food-hint">Volvé al diario y abrí la versión actual antes de editar.</p>}
      <button className="primary-button" disabled={saving || busy || conflict || !items.length}>{saving ? 'Guardando…' : items.some(item => item.source === 'gemini') ? 'Confirmar estimaciones y guardar comida' : 'Guardar comida'}</button>
    </form>
  </section>;
}
