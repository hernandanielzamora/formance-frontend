'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/provider';
import { apiRequest } from '@/lib/api/client';
import { getFirebaseAuth } from '@/lib/firebase/client';

export default function Account({ admin = false }: { admin?: boolean }) {
  const session = useAuth(); const router = useRouter();
  const [adminReady, setAdminReady] = useState(false);
  const [adminError, setAdminError] = useState('');
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
  }, [session.loading, session.user, session.identity, admin, router]);
  if (session.error || adminError) return <main className="container"><h1>No pudimos validar tu acceso</h1><p role="alert">{session.error || adminError}</p><button onClick={() => window.location.reload()}>Reintentar</button><button onClick={() => void session.logout()}>Cerrar sesión</button></main>;
  if (session.loading || !session.identity?.emailVerified || (admin && !adminReady)) return <main className="container"><p role="status">Validando tu sesión…</p></main>;
  return <main className="container"><header><Link href="/"><img src="/brand/formance.svg" alt="Formance" width="230" height="48" /></Link><button onClick={() => void session.logout()}>Cerrar sesión</button></header><section className="intro"><p className="eyebrow">{admin ? 'ADMINISTRACIÓN' : 'TU CUENTA'}</p><h1>Hola, {session.user?.displayName || 'bienvenido'}.</h1><p className="description">{admin ? 'Tu acceso administrativo está habilitado. Las herramientas de gestión se incorporarán en los próximos pasos.' : 'Tu cuenta está lista. El próximo paso será configurar tu perfil y objetivo.'}</p><p>{session.identity.email}</p>{session.identity.role === 'admin' && <Link href={admin ? '/app' : '/admin'}>{admin ? 'Ver mi cuenta de usuario' : 'Ir a administración'}</Link>}</section></main>;
}
