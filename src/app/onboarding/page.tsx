'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/provider';
import { getFirebaseAuth } from '@/lib/firebase/client';
import { apiRequest } from '@/lib/api/client';
import { useCachedQuery, useApiMutationRequest } from '@/lib/store/hooks';
import { activities, goals, type Profile, type Targets } from '@/lib/profile';

export default function Onboarding() {
  const session = useAuth(); const router = useRouter();
  const [ready, setReady] = useState(false); const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const [draft, setDraft] = useState({ name: '', age: '', sex: '', heightCm: '', initialWeightKg: '', activity: '', goal: '' });
  const [targets, setTargets] = useState<Targets | null>(null);
  const profileQuery = useCachedQuery<{ profile: Profile | null }>('profile');
  const request = useApiMutationRequest();
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (ready) titleRef.current?.focus(); }, [step, ready]);
  useEffect(() => {
    if (session.loading) return;
    if (!session.user) { router.replace('/login'); return; }
    if (!session.identity) return;
    if (!session.identity.emailVerified) { router.replace('/verificar-correo'); return; }
    if (!profileQuery.data) return;
    if (profileQuery.data.profile?.onboardingCompleted) { router.replace('/app'); return; }
    if (!ready) { setDraft(d => ({ ...d, name: session.user?.displayName || '' })); setReady(true); }
  }, [session.loading, session.user, session.identity, router, profileQuery.data, ready]);
  function field(key: keyof typeof draft, value: string) { setDraft((d) => ({ ...d, [key]: value })); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('');
    if (step < 2) { setStep(step + 1); return; }
    setBusy(true);
    const personal = { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, ...draft, name: draft.name.trim(), age: Number(draft.age), heightCm: Number(draft.heightCm), initialWeightKg: Number(draft.initialWeightKg) };
    try {
      if (step === 2) {
        const result = await apiRequest<Targets>('profile/onboarding/preview', { method: 'POST', body: JSON.stringify(personal) }, getFirebaseAuth());
        setTargets({ calories: result.calories, protein: result.protein, fat: result.fat, carbohydrates: result.carbohydrates }); setStep(3);
      } else {
        await request('profile/onboarding', { method: 'PUT', body: JSON.stringify({ ...personal, targets }) });
        router.replace('/app');
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'No pudimos guardar tu perfil.'); }
    finally { setBusy(false); }
  }
  if (session.error || (!ready && (error || profileQuery.error))) return <main className="container"><p role="alert">{error || profileQuery.error || session.error}</p><button onClick={() => window.location.reload()}>Reintentar</button><button onClick={() => void session.logout()}>Cerrar sesión</button></main>;
  if (!ready) return <main className="container"><p role="status">Cargando tu perfil…</p></main>;
  const titles = ['Conozcamos tu punto de partida', '¿Cómo es tu actividad habitual?', '¿Qué querés lograr?', 'Tu referencia inicial'];
  return <main className="container onboarding"><header><img src="/brand/formance.svg" width="230" height="48" alt="Formance" /><button onClick={() => void session.logout()}>Cerrar sesión</button></header><section className="onboarding-card"><p className="eyebrow">PASO {step + 1} DE 4</p><div className="step-track" aria-label={`Paso ${step + 1} de 4`}>{titles.map((_, index) => <span key={index} className={index <= step ? 'active' : ''} />)}</div><div className="step-labels">{['Sobre vos', 'Actividad', 'Objetivo', 'Referencia'].map((label, index) => <span key={label} className={index === step ? 'active' : ''} aria-current={index === step ? 'step' : undefined}>{label}</span>)}</div><h1 ref={titleRef} tabIndex={-1}>{titles[step]}</h1><form onSubmit={submit} aria-busy={busy}>
    {step === 0 && <><p>Estos datos nos ayudan a preparar una referencia inicial. Usamos centímetros y kilogramos.</p><div className="personal-grid"><label>Nombre<input value={draft.name} onChange={(e) => field('name', e.target.value)} required maxLength={80} autoComplete="name" /></label><label>Edad<input type="number" value={draft.age} onChange={(e) => field('age', e.target.value)} required min={18} max={100} /><small>Disponible a partir de los 18 años.</small></label><label>Sexo para el cálculo<select value={draft.sex} onChange={(e) => field('sex', e.target.value)} required><option value="">Seleccioná una opción</option><option value="male">Masculino</option><option value="female">Femenino</option></select></label><label>Altura (cm)<input type="number" step="0.1" value={draft.heightCm} onChange={(e) => field('heightCm', e.target.value)} min={100} max={230} required /></label><label>Peso inicial (kg)<input type="number" step="0.1" value={draft.initialWeightKg} onChange={(e) => field('initialWeightKg', e.target.value)} min={30} max={250} required /></label></div></>}
    {(step === 1 || step === 2) && <fieldset className="option-list"><legend>{step === 1 ? 'Nivel de actividad' : 'Objetivo físico'}</legend>{(step === 1 ? activities : goals).map(([value, label, description]) => <label className="option-card" key={value}><input type="radio" name="choice" value={value} checked={(step === 1 ? draft.activity : draft.goal) === value} onChange={() => field(step === 1 ? 'activity' : 'goal', value)} required /><span><strong>{label}</strong><small>{description}</small></span></label>)}</fieldset>}
    {step === 3 && targets && <><div className="review-summary"><span>{draft.name}</span><span>{draft.age} años</span><span>{draft.heightCm} cm</span><span>{draft.initialWeightKg} kg</span><strong>{goals.find(([value]) => value === draft.goal)?.[1]}</strong></div><p>Una estimación orientativa basada en tus datos y objetivo. Podés editarla antes de confirmar; no reemplaza una evaluación profesional.</p><div className="personal-grid">{(['calories', 'protein', 'fat', 'carbohydrates'] as const).map((key) => <label key={key}>{{ calories: 'Calorías (kcal/día)', protein: 'Proteínas (g/día)', fat: 'Grasas (g/día)', carbohydrates: 'Carbohidratos (g/día)' }[key]}<input type="number" value={targets[key]} min={key === 'calories' ? 800 : 0} max={{ calories: 6000, protein: 400, fat: 300, carbohydrates: 1000 }[key]} required onChange={(e) => setTargets({ ...targets, [key]: Number(e.target.value) })} /></label>)}</div><p>Guardaremos también tu peso inicial para comenzar el historial.</p></>}
    {error && <p className="form-error" role="alert">{error}</p>}<div className="onboarding-actions">{step > 0 && <button type="button" disabled={busy} onClick={() => setStep(step - 1)}>Atrás</button>}<button className="primary-button" disabled={busy}>{busy ? 'Un momento…' : step === 3 ? 'Confirmar y empezar' : 'Continuar'}</button></div>
  </form></section></main>;
}
