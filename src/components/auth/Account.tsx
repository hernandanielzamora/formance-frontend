'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/provider';
import { apiRequest } from '@/lib/api/client';
import { getFirebaseAuth } from '@/lib/firebase/client';
import { type Profile, goals } from '@/lib/profile';
import Icon from '@/components/ui/Icon';

export default function Account({ admin = false }: { admin?: boolean }) {
  const session = useAuth(); const router = useRouter();
  const [adminReady, setAdminReady] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [profile, setProfile] = useState<Profile | null>(null);
  useEffect(() => {
    if (session.loading) return;
    if (!session.user) { router.replace(admin ? '/admin/login' : '/login'); return; }
    if (!session.identity) return;
    if (!session.identity.emailVerified) { router.replace('/verificar-correo'); return; }
    if (admin && session.identity.role !== 'admin') { router.replace('/admin/login'); return; }
    if (admin) {
      let active = true;
      apiRequest('admin/session', {}, getFirebaseAuth()).then(() => { if (active) setAdminReady(true); }).catch(() => { if (active) setAdminError('No se pudo validar el acceso administrativo.'); });
      return () => { active = false; };
    }
    let active = true;
    apiRequest<{ profile: Profile | null }>('profile', {}, getFirebaseAuth()).then((result) => {
      if (!active) return;
      if (!result.profile?.onboardingCompleted) router.replace('/onboarding');
      else setProfile(result.profile);
    }).catch(() => { if (active) setAdminError('No se pudo cargar tu perfil.'); });
    return () => { active = false; };
  }, [session.loading, session.user, session.identity, admin, router]);
  if (session.error || adminError) return <main className="container"><h1>No pudimos validar tu acceso</h1><p role="alert">{session.error || adminError}</p><button onClick={() => window.location.reload()}>Reintentar</button><button onClick={() => void session.logout()}>Cerrar sesión</button></main>;
  if (session.loading || !session.identity?.emailVerified || (admin && !adminReady) || (!admin && !profile)) return <main className="loading-screen" role="status"><span className="spinner" /><span>Preparando tu espacio…</span></main>;
  const name = profile?.name || session.user?.displayName || 'bienvenido';
  return <main className="dashboard"><aside className="app-sidebar"><Link href="/"><img className="brand" src="/brand/formance.svg" alt="Formance" width="170" height="36" /></Link><nav aria-label="Navegación de la cuenta"><Link className="nav-active" href={admin ? '/admin' : '/app'} aria-current="page"><Icon name={admin ? 'lock' : 'grid'} />{admin ? 'Administración' : 'Mi resumen'}</Link>{session.identity.role === 'admin' && <Link href={admin ? '/app' : '/admin'}><Icon name={admin ? 'user' : 'lock'} />{admin ? 'Mi perfil personal' : 'Administración'}</Link>}{(['workout', 'food', 'chart'] as const).map((icon, i) => <span className="sidebar-soon" key={icon}><Icon name={icon} />{['Entrenamiento', 'Alimentación', 'Progreso'][i]}<span className="coming-label">Pronto</span></span>)}</nav><button onClick={() => void session.logout()}><Icon name="logout" />Cerrar sesión</button></aside><div className="dashboard-content"><div className="dashboard-topbar"><span>{admin ? 'Tu espacio de administración' : 'Tu punto de partida, en perspectiva'}</span><div className="account-chip"><span className="avatar" aria-hidden="true">{name.charAt(0).toUpperCase()}</span><span>{session.identity.email}</span></div></div><section className="intro"><p className="eyebrow">{admin ? 'ADMINISTRACIÓN' : 'MI RESUMEN'}</p><h1>Hola, {name.split(' ')[0]}.</h1><p className="description">{admin ? 'Tu acceso está habilitado. Desde acá construiremos las herramientas para gestionar Formance.' : 'Este es el punto de partida de tu progreso.'}</p></section>
    {admin ? <><section className="profile-banner"><div><h2>Tu perfil también tiene un lugar</h2><p>Configurá tu objetivo personal o consultá tus referencias iniciales.</p></div><Link className="primary-button" href="/app">Ir a mi perfil <Icon name="arrow" /></Link></section><section className="module-next"><span className="icon-tile"><Icon name="workout" /></span><div><span className="coming-label">Próximamente</span><h2>Biblioteca de ejercicios y rutinas</h2><p>El próximo módulo permitirá preparar ejercicios y rutinas base para los usuarios.</p></div></section></> : profile && <><section className="profile-banner"><div><p className="eyebrow">TU OBJETIVO</p><h2>{goals.find(([value]) => value === profile.goal)?.[1]}</h2><p>Perfil configurado · {profile.age} años · {profile.heightCm} cm</p></div><span className="badge">Punto de partida listo</span></section><section className="cards" aria-label="Referencias de tu perfil"><article><span className="number"><Icon name="chart" /></span><h2>Peso inicial</h2><p className="metric-value">{profile.initialWeightKg} <small>kg</small></p><p>Tu primera referencia para el historial.</p></article><article><span className="number"><Icon name="food" /></span><h2>Objetivo diario</h2><p className="metric-value">{profile.targets.calories} <small>kcal</small></p><p>Referencia definida durante el onboarding.</p></article><article><span className="number"><Icon name="grid" /></span><h2>Macronutrientes diarios</h2><p>Proteínas <strong>{profile.targets.protein} g</strong><br />Grasas <strong>{profile.targets.fat} g</strong><br />Carbohidratos <strong>{profile.targets.carbohydrates} g</strong></p><p>Objetivos orientativos.</p></article></section><section className="module-next" style={{ marginTop: 25 }}><span className="icon-tile"><Icon name="workout" /></span><div><span className="coming-label">Próximamente</span><h2>El siguiente paso: tu entrenamiento</h2><p>Sumaremos ejercicios y rutinas base para que puedas elegir según tu objetivo.</p></div></section></>}
  </div></main>;
}
