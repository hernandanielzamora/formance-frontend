'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { sendEmailVerification } from 'firebase/auth';
import { useAuth } from '@/lib/auth/provider';
import { authError } from '@/lib/auth/errors';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';

export default function VerifyEmail() {
  const session = useAuth(); const router = useRouter();
  const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (session.loading) return;
    if (!session.user) router.replace('/login');
    else if (session.identity?.emailVerified) router.replace(session.identity.role === 'admin' ? '/admin' : '/app');
  }, [session.loading, session.user, session.identity, router]);
  async function action(resend: boolean) {
    setBusy(true); setMessage('');
    try {
      if (resend && session.user) { await sendEmailVerification(session.user); setMessage('Enviamos el correo. Revisá también la carpeta de spam.'); }
      else { await session.refresh(); setMessage('Si ya abriste el enlace, tu cuenta se actualizará.'); }
    } catch (e) { setMessage(authError(e)); } finally { setBusy(false); }
  }
  return <main className="access-page"><Link href="/"><img className="brand" src="/brand/formance.svg" width="180" height="38" alt="Formance" /></Link><section className="access-card"><span className="icon-tile"><Icon name="check" /></span><h1>Un último paso:<br />tu correo.</h1><p>Abrí el enlace de verificación que enviamos a <strong>{session.user?.email}</strong>. Después volvé acá para continuar.</p><p>Si no lo encontrás, revisá la carpeta de spam.</p><div className="button-stack"><button className="primary-button" disabled={busy} onClick={() => void action(false)}>{busy ? 'Un momento…' : 'Ya verifiqué mi correo'}<Icon name="arrow" /></button><button disabled={busy} onClick={() => void action(true)}>Reenviar correo</button></div><p role="status">{message || session.error}</p><button onClick={() => void session.logout()}>Usar otra cuenta</button></section></main>;
}
