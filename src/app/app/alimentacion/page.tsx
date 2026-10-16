'use client';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth/provider';
import { useCachedQuery, useDashboardProfile, useApiMutationRequest } from '@/lib/store/hooks';
import { addDays, localDate, dateLabel } from '@/lib/training-sessions';
import { mealTypes, nutrientKeys, nutrientLabels, formatNumber, type Diary, type FoodCapabilities, type Meal } from '@/lib/food';
import DashboardLoading from '@/components/ui/DashboardLoading';
import FoodEditor from '@/components/food/FoodEditor';

export default function FoodPage() {
  const session = useAuth();
  const [date, setDate] = useState(localDate);
  const [actionError, setError] = useState(''); const [notice, setNotice] = useState('');
  const [editor, setEditor] = useState<{ initial: Meal | null; copying: boolean } | null>(null); const [busy, setBusy] = useState(false);
  const [zone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone); const editorRef = useRef<HTMLDivElement>(null);
  useEffect(() => { setEditor(null); }, [session.user?.uid]);
  useEffect(() => { setError(''); setNotice(''); }, [date]);
  useEffect(() => {
    if (!editor || !editorRef.current) return; editorRef.current.focus({ preventScroll: true }); editorRef.current.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }, [editor]);
  const profile = useDashboardProfile();
  const query = useCachedQuery<Diary>(`food/diary?date=${date}&timeZone=${encodeURIComponent(zone)}`, profile.ready);
  const available = useCachedQuery<FoodCapabilities>('food/capabilities', profile.ready);
  const diary = query.data; const capabilities = available.data;
  const error = actionError || profile.error || query.error || available.error;
  const request = useApiMutationRequest();
  function refresh() { setError(''); if (profile.error || !profile.data) profile.refresh(); query.refresh(); available.refresh(); }
  async function remove(meal: Meal) {
    if (!window.confirm('¿Quitar esta comida del diario?')) return; setBusy(true); setError('');
    try { await request(`food/meals/${meal.id}`, { method: 'DELETE', body: JSON.stringify({ expectedVersion: meal.version }) }); setNotice('Comida retirada del diario.'); }
    catch (e) { setError(e instanceof Error ? e.message : 'No pudimos quitar la comida.'); } finally { setBusy(false); }
  }
  if (session.error) return <div className="dashboard-error"><p role="alert">{session.error}</p><button onClick={() => void session.refresh()}>Reintentar</button></div>;
  if (!diary || !capabilities || !profile.ready || session.loading) return error ? <div className="dashboard-error"><p role="alert">{error}</p><button onClick={() => refresh()}>Reintentar</button></div> : <DashboardLoading message="Preparando tu diario de comidas…" />;
  return <div className="dashboard-view food-page"><div className="dashboard-topbar"><span>Tu alimentación, día a día</span><span>{dateLabel(date, { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
    <section className="intro"><p className="eyebrow">ALIMENTACIÓN</p><h1>Un registro a tu medida.</h1><p className="description">Buscá alimentos, registralos manualmente o revisá una estimación desde una foto.</p></section>
    {editor ? <div className="editor-region" ref={editorRef} tabIndex={-1}><FoodEditor initial={editor.initial} copying={editor.copying} date={date} capabilities={capabilities} onClose={() => setEditor(null)} onSaved={async () => { setEditor(null); setNotice('Comida guardada en tu diario.'); }} /></div> : <>
      <div className="food-diary-toolbar"><div className="week-navigation"><button aria-label="Día anterior" onClick={() => setDate(addDays(date, -1))}>←</button><label><span className="sr-only">Fecha del diario</span><input type="date" value={date} onChange={event => { if (event.target.value) setDate(event.target.value); }} /></label><button aria-label="Día siguiente" onClick={() => setDate(addDays(date, 1))}>→</button><button onClick={() => setDate(diary.today)}>Hoy</button></div><button className="primary-button" disabled={date > diary.today || busy} onClick={() => setEditor({ initial: null, copying: false })}>+ Registrar comida</button></div>
      {error && <p className="form-error" role="alert">{error}<button onClick={() => refresh()}>Actualizar diario</button></p>}{notice && <p className="training-notice" role="status">{notice}</p>}
      <section className="food-daily-totals" aria-label="Totales registrados del día">{nutrientKeys.map(key => <article key={key}><h2>{nutrientLabels[key]}</h2><strong>{formatNumber(diary.totals[key].value)}</strong><p>{diary.totals[key].complete ? 'Total registrado' : 'Total parcial: faltan datos'}{diary.targets?.[key] != null ? ` · Objetivo ${formatNumber(diary.targets[key])}` : ''}</p></article>)}</section>
      <p className="food-hint">Los totales incluyen solamente lo registrado. Las porciones de fotos son estimaciones y los campos desconocidos no se cuentan como cero.</p>
      {date > diary.today && <p className="food-hint">Podrás registrar comidas cuando llegue este día.</p>}
      <div className="food-meal-groups">{mealTypes.map(([type, label]) => { const meals = diary.meals.filter(meal => meal.mealType === type); return <section key={type} aria-label={label}><h2>{label}</h2>{!meals.length ? <p className="food-empty">Todavía sin registros.</p> : meals.map(meal => <article className="food-meal-card" key={meal.id}><ul>{meal.items.map(item => <li key={item.itemId}><div><strong>{item.name}</strong><small>{item.grams} g · {item.source === 'gemini' ? 'Estimación IA' : item.source === 'usda' ? 'USDA' : 'Manual'}</small></div><span>{formatNumber(item.totals?.calories ?? null)} kcal</span></li>)}</ul>{meal.note && <p>{meal.note}</p>}<div className="library-actions"><button disabled={busy} onClick={() => setEditor({ initial: meal, copying: false })}>Editar</button><button disabled={busy || date > diary.today} onClick={() => setEditor({ initial: meal, copying: true })}>Duplicar</button><button className="danger-button" disabled={busy} onClick={() => void remove(meal)}>Quitar</button></div></article>)}</section>; })}</div>
    </>}
  </div>;
}
