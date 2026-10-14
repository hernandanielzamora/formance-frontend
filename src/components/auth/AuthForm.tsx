'use client';
import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, GoogleAuthProvider, sendEmailVerification, signInWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase/client';
import { useAuth } from '@/lib/auth/provider';
import { authError } from '@/lib/auth/errors';
import Image from 'next/image';
import PasswordInput from './PasswordInput';
import Icon from '@/components/ui/Icon';

export default function AuthForm({ mode = 'login', admin = false }: { mode?: 'login' | 'register'; admin?: boolean }) {
  const register = mode === 'register';
  const router = useRouter();
  const session = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (busy || session.loading || !session.identity) return;
    if (admin && session.identity.role !== 'admin') return;
    router.replace(session.identity.emailVerified ? (session.identity.role === 'admin' ? '/admin' : '/app') : '/verificar-correo');
  }, [session.identity, session.loading, busy, admin, router]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setBusy(true);
    const data = new FormData(event.currentTarget);
    const email = String(data.get('email')).trim();
    const password = String(data.get('password'));
    try {
      const auth = getFirebaseAuth();
      if (register) {
        if (password !== data.get('confirm')) throw { code: 'password-mismatch' };
        const name = String(data.get('name')).trim();
        if (!name || name.length > 80) throw { code: 'invalid-name' };
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(credential.user, { displayName: name });
        await sendEmailVerification(credential.user);
      } else await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      const code = (e as { code?: string }).code;
      setError(code === 'password-mismatch' ? 'Las contraseñas no coinciden.' : code === 'invalid-name' ? 'Ingresá tu nombre (hasta 80 caracteres).' : authError(e));
    } finally { setBusy(false); }
  }
  async function google() {
    setBusy(true); setError('');
    try {
      const provider = new GoogleAuthProvider(); provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(getFirebaseAuth(), provider);
    } catch (e) { setError(authError(e)); } finally { setBusy(false); }
  }
  const forbidden = admin && session.identity?.role === 'user';
  return <main className="auth-shell"><section className="auth-story"><Image className="auth-background" src="/images/training-woman.webp" alt="" fill sizes="(max-width: 800px) 100vw, 50vw" preload /><Link className="auth-brand" href="/"><img src="/brand/formance-white.svg" width="190" height="40" alt="Formance" /></Link><div className="auth-story-copy"><p className="eyebrow">UN PASO MÁS CERCA DE TU OBJETIVO</p><h1>Tu constancia.<br /><span>Tu progreso.</span></h1><p>Cada pequeño paso cuenta. Empezá por definir el tuyo.</p></div><div className="auth-story-bottom"><span className="status-dot" /> FORMANCE · HECHO PARA VOS</div></section><section className="auth-card"><Link className="back-link" href="/">← Volver al inicio</Link><span className="badge">{admin ? 'Administración' : register ? 'TU PUNTO DE PARTIDA' : 'QUÉ BUENO VERTE DE NUEVO'}</span><h2>{register ? 'Creá tu cuenta' : admin ? 'Acceso de administrador' : 'Volvé a tu progreso'}</h2><p>{register ? 'Tu objetivo empieza con el primer paso.' : 'Ingresá y seguí desde donde lo dejaste.'}</p>
    {forbidden ? <><p role="alert" className="form-error">Esta cuenta no tiene permisos de administrador.</p><button onClick={() => void session.logout()}>Usar otra cuenta</button><Link href="/app">Volver a mi cuenta</Link></> : <>
    <button className="google-button" onClick={google} disabled={busy || session.loading}><span className="google-mark" aria-hidden="true">G</span>Continuar con Google</button><div className="divider">o con tu correo</div>
    <form onSubmit={submit} aria-busy={busy}>{register && <label>Nombre<input name="name" autoComplete="name" required maxLength={80} placeholder="¿Cómo te llamás?" /></label>}<label>Correo electrónico<input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="vos@ejemplo.com" /></label><PasswordInput name="password" label="Contraseña" register={register} />{register && <PasswordInput name="confirm" label="Confirmá tu contraseña" register confirm />}
    {!register && <Link className="forgot-link" href="/recuperar-acceso">Olvidé mi contraseña</Link>}
    {(error || session.error) && <p className="form-error" role="alert">{error || session.error}</p>}
    {session.error && <div className="inline-actions"><button type="button" onClick={() => void session.refresh().catch((e) => setError(authError(e)))}>Reintentar conexión</button>{session.user && <button type="button" onClick={() => void session.logout()}>Usar otra cuenta</button>}</div>}
    <button className="primary-button" disabled={busy || session.loading}>{busy ? 'Un momento…' : register ? 'Crear cuenta' : 'Iniciar sesión'}{!busy && <Icon name="arrow" />}</button></form>
    {!admin && <p className="auth-switch">{register ? '¿Ya tenés cuenta?' : '¿Primera vez acá?'} <Link href={register ? '/login' : '/registro'}>{register ? 'Iniciá sesión' : 'Creá tu cuenta'}</Link></p>}
    </>}{!admin && <Link className="admin-link" href="/admin/login">Acceso de administrador</Link>}</section></main>;
}
