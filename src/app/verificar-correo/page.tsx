'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { sendEmailVerification } from 'firebase/auth';
import { useAuth } from '@/lib/auth/provider';
import { authError } from '@/lib/auth/errors';

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
  return <main className="container"><section className="auth-card"><h1>Verificá tu correo</h1><p>Abrí el enlace de verificación que enviamos a {session.user?.email}. Después volvé acá para continuar.</p><button disabled={busy} onClick={() => void action(false)}>Ya verifiqué mi correo</button><button disabled={busy} onClick={() => void action(true)}>Reenviar correo</button><p role="status">{message || session.error}</p><button onClick={() => void session.logout()}>Cerrar sesión</button></section></main>;
}
