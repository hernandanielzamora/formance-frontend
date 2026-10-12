'use client';
import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, GoogleAuthProvider, sendEmailVerification, signInWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase/client';
import { useAuth } from '@/lib/auth/provider';
import { authError } from '@/lib/auth/errors';

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
  return <main className="auth-shell"><section className="auth-story"><Link href="/"><img src="/brand/formance.svg" width="230" height="48" alt="Formance" /></Link><p className="eyebrow">UN PASO MÁS CERCA DE TU OBJETIVO</p><h1>Tu constancia.<br /><span>Tu progreso.</span></h1><p>Uní tus entrenamientos, alimentación y evolución en un mismo lugar.</p><div className="auth-story-bottom">Registrá · Comprendé · Avanzá</div></section><section className="auth-card"><span className="badge">{admin ? 'Administración' : 'Bienvenido a Formance'}</span><h2>{register ? 'Creá tu cuenta' : admin ? 'Acceso de administrador' : 'Volvé a tu progreso'}</h2><p>{register ? 'Empezá a construir tu historial.' : 'Iniciá sesión para continuar.'}</p>
    {forbidden ? <><p role="alert" className="form-error">Esta cuenta no tiene permisos de administrador.</p><button onClick={() => void session.logout()}>Usar otra cuenta</button><Link href="/app">Volver a mi cuenta</Link></> : <>
    <button className="google-button" onClick={google} disabled={busy}>Continuar con Google</button><div className="divider">o con tu correo</div>
    <form onSubmit={submit}>{register && <label>Nombre<input name="name" autoComplete="name" required maxLength={80} /></label>}<label>Correo electrónico<input name="email" type="email" autoComplete="email" required maxLength={254} /></label><label>Contraseña<input name="password" type="password" autoComplete={register ? 'new-password' : 'current-password'} required minLength={register ? 8 : undefined} maxLength={128} /></label>{register && <><small>Usá al menos 8 caracteres.</small><label>Confirmá tu contraseña<input name="confirm" type="password" autoComplete="new-password" required minLength={8} maxLength={128} /></label></>}
    {(error || session.error) && <p className="form-error" role="alert">{error || session.error}</p>}
    <button className="primary-button" disabled={busy}>{busy ? 'Un momento…' : register ? 'Crear cuenta' : 'Iniciar sesión'}</button></form>
    {!admin && <p className="auth-switch">{register ? '¿Ya tenés cuenta?' : '¿Primera vez acá?'} <Link href={register ? '/login' : '/registro'}>{register ? 'Iniciá sesión' : 'Creá tu cuenta'}</Link></p>}
    </>}{!admin && <Link className="admin-link" href="/admin/login">Acceso de administrador</Link>}</section></main>;
}
