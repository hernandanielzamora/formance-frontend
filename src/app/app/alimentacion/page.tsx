'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/provider';
import { apiRequest } from '@/lib/api/client';
import { getFirebaseAuth } from '@/lib/firebase/client';
import { addDays, localDate, dateLabel } from '@/lib/training-sessions';
import { mealTypes, nutrientKeys, nutrientLabels, formatNumber, type Diary, type FoodCapabilities, type Meal } from '@/lib/food';
import DashboardLoading from '@/components/ui/DashboardLoading';
import FoodEditor from '@/components/food/FoodEditor';

export default function FoodPage() {
  const session = useAuth(); const router = useRouter();
  const [date, setDate] = useState(localDate); const [diary, setDiary] = useState<Diary | null>(null); const [capabilities, setCapabilities] = useState<FoodCapabilities | null>(null);
  const [loaded, setLoaded] = useState(''); const [error, setError] = useState(''); const [notice, setNotice] = useState(''); const [retry, setRetry] = useState(0);
  const [editor, setEditor] = useState<{ initial: Meal | null; copying: boolean } | null>(null); const [busy, setBusy] = useState(false);
  const [zone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone); const editorRef = useRef<HTMLDivElement>(null);
  async function reload() {
    const uid = getFirebaseAuth().currentUser?.uid;
    const [result, available] = await Promise.all([apiRequest<Diary>(`food/diary?date=${date}&timeZone=${encodeURIComponent(zone)}`, {}, getFirebaseAuth()), apiRequest<FoodCapabilities>('food/capabilities', {}, getFirebaseAuth())]);
    if (getFirebaseAuth().currentUser?.uid !== uid) return;
    setDiary(result); setCapabilities(available); setLoaded(`${uid}:${date}`);
  }
  useEffect(() => { setEditor(null); }, [session.user?.uid]);
  useEffect(() => {
    if (!editor || !editorRef.current) return; editorRef.current.focus({ preventScroll: true }); editorRef.current.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }, [editor]);
  useEffect(() => {
    if (session.loading) return;
    if (!session.user) { router.replace('/login'); return; }
    if (!session.identity) return;
    if (!session.identity.emailVerified) { router.replace('/verificar-correo'); return; }
    let active = true; setError(''); setNotice('');
    async function load() {
      try {
        const { profile } = await apiRequest<{ profile: { onboardingCompleted: boolean } | null }>('profile', {}, getFirebaseAuth());
        if (!active) return; if (!profile?.onboardingCompleted) { router.replace('/onboarding'); return; }
        const [data, available] = await Promise.all([apiRequest<Diary>(`food/diary?date=${date}&timeZone=${encodeURIComponent(zone)}`, {}, getFirebaseAuth()), apiRequest<FoodCapabilities>('food/capabilities', {}, getFirebaseAuth())]);
        if (active) { setDiary(data); setCapabilities(available); setLoaded(`${session.identity!.uid}:${date}`); }
      } catch (e) { if (active) setError(e instanceof Error ? e.message : 'No pudimos cargar el diario.'); }
    }
    void load(); return () => { active = false; };
  }, [session.loading, session.user, session.identity, date, zone, router, retry]);
  async function remove(meal: Meal) {
    if (!window.confirm('¿Quitar esta comida del diario?')) return; setBusy(true); setError('');
    try { await apiRequest(`food/meals/${meal.id}`, { method: 'DELETE', body: JSON.stringify({ expectedVersion: meal.version }) }, getFirebaseAuth()); await reload(); setNotice('Comida retirada del diario.'); }
    catch (e) { setError(e instanceof Error ? e.message : 'No pudimos quitar la comida.'); } finally { setBusy(false); }
  }
  if (session.error) return <div className="dashboard-error"><p role="alert">{session.error}</p><button onClick={() => void session.refresh()}>Reintentar</button></div>;
  if (!diary || !capabilities || session.loading || loaded !== `${session.identity?.uid}:${date}`) return error ? <div className="dashboard-error"><p role="alert">{error}</p><button onClick={() => setRetry(value => value + 1)}>Reintentar</button></div> : <DashboardLoading message="Preparando tu diario de comidas…" />;
  return <div className="dashboard-view food-page"><div className="dashboard-topbar"><span>Tu alimentación, día a día</span><span>{dateLabel(date, { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
    <section className="intro"><p className="eyebrow">ALIMENTACIÓN</p><h1>Un registro a tu medida.</h1><p className="description">Buscá alimentos, registralos manualmente o revisá una estimación desde una foto.</p></section>
    {editor ? <div className="editor-region" ref={editorRef} tabIndex={-1}><FoodEditor initial={editor.initial} copying={editor.copying} date={date} capabilities={capabilities} onClose={() => setEditor(null)} onSaved={async () => { await reload(); setEditor(null); setNotice('Comida guardada en tu diario.'); }} /></div> : <>
      <div className="food-diary-toolbar"><div className="week-navigation"><button aria-label="Día anterior" onClick={() => setDate(addDays(date, -1))}>←</button><label><span className="sr-only">Fecha del diario</span><input type="date" value={date} onChange={event => { if (event.target.value) setDate(event.target.value); }} /></label><button aria-label="Día siguiente" onClick={() => setDate(addDays(date, 1))}>→</button><button onClick={() => setDate(diary.today)}>Hoy</button></div><button className="primary-button" disabled={date > diary.today || busy} onClick={() => setEditor({ initial: null, copying: false })}>+ Registrar comida</button></div>
      {error && <p className="form-error" role="alert">{error}<button onClick={() => setRetry(value => value + 1)}>Actualizar diario</button></p>}{notice && <p className="training-notice" role="status">{notice}</p>}
      <section className="food-daily-totals" aria-label="Totales registrados del día">{nutrientKeys.map(key => <article key={key}><h2>{nutrientLabels[key]}</h2><strong>{formatNumber(diary.totals[key].value)}</strong><p>{diary.totals[key].complete ? 'Total registrado' : 'Total parcial: faltan datos'}{diary.targets?.[key] != null ? ` · Objetivo ${formatNumber(diary.targets[key])}` : ''}</p></article>)}</section>
      <p className="food-hint">Los totales incluyen solamente lo registrado. Las porciones de fotos son estimaciones y los campos desconocidos no se cuentan como cero.</p>
      {date > diary.today && <p className="food-hint">Podrás registrar comidas cuando llegue este día.</p>}
      <div className="food-meal-groups">{mealTypes.map(([type, label]) => { const meals = diary.meals.filter(meal => meal.mealType === type); return <section key={type} aria-label={label}><h2>{label}</h2>{!meals.length ? <p className="food-empty">Todavía sin registros.</p> : meals.map(meal => <article className="food-meal-card" key={meal.id}><ul>{meal.items.map(item => <li key={item.itemId}><div><strong>{item.name}</strong><small>{item.grams} g · {item.source === 'gemini' ? 'Estimación IA' : item.source === 'usda' ? 'USDA' : 'Manual'}</small></div><span>{formatNumber(item.totals?.calories ?? null)} kcal</span></li>)}</ul>{meal.note && <p>{meal.note}</p>}<div className="library-actions"><button disabled={busy} onClick={() => setEditor({ initial: meal, copying: false })}>Editar</button><button disabled={busy || date > diary.today} onClick={() => setEditor({ initial: meal, copying: true })}>Duplicar</button><button className="danger-button" disabled={busy} onClick={() => void remove(meal)}>Quitar</button></div></article>)}</section>; })}</div>
    </>}
  </div>;
}
