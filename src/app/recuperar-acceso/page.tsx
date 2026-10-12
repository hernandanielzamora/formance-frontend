'use client';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase/client';
import { authError } from '@/lib/auth/errors';
import Icon from '@/components/ui/Icon';
export default function RecoverAccess() {
  const [busy, setBusy] = useState(false); const [sent, setSent] = useState(false); const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget); setBusy(true); setError('');
    try { await sendPasswordResetEmail(getFirebaseAuth(), String(data.get('email')).trim()); setSent(true); }
    catch (e) { if ((e as { code?: string }).code === 'auth/user-not-found') setSent(true); else setError(authError(e)); }
    finally { setBusy(false); }
  }
  return <main className="access-page"><Link href="/"><img className="brand" src="/brand/formance.svg" width="180" height="38" alt="Formance" /></Link><section className="access-card"><span className="icon-tile"><Icon name={sent ? 'check' : 'lock'} /></span><h1>{sent ? 'Revisá tu correo' : 'Recuperá tu acceso'}</h1>{sent ? <p role="status">Si el correo tiene una cuenta con contraseña, recibirás un enlace para cambiarla. Revisá también spam.</p> : <><p>Te enviaremos un enlace para elegir una nueva contraseña. Si usás Google, podés acceder directamente con ese botón.</p><form onSubmit={submit}><label>Correo electrónico<input name="email" type="email" autoComplete="email" required placeholder="vos@ejemplo.com" /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="primary-button" disabled={busy}>{busy ? 'Enviando…' : 'Enviar enlace'}<Icon name="arrow" /></button></form></>}<Link className="back-link" href="/login">← Volver al login</Link></section></main>;
}
