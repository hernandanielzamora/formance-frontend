'use client';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/provider';
import Icon from './Icon';
import { useState } from 'react';
export default function AppSidebar({ current }: { current: 'account' | 'admin' | 'training' | 'food' | 'reports' }) {
  const session = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState('');
  async function logout() {
    setLoggingOut(true); setError('');
    try { await session.logout(); } catch { setError('No pudimos cerrar la sesión. Intentá nuevamente.'); }
    finally { setLoggingOut(false); }
  }
  return <aside className="app-sidebar"><Link className="sidebar-brand" href="/app" aria-label="Formance, mi resumen"><img className="brand" src="/brand/formance.svg" alt="Formance" width="170" height="36" /></Link><nav aria-label="Navegación de la cuenta"><Link className={current === 'account' ? 'nav-active' : ''} href="/app" aria-current={current === 'account' ? 'page' : undefined}><Icon name="grid" />Mi resumen</Link><Link className={current === 'training' ? 'nav-active' : ''} href="/app/entrenamiento" aria-current={current === 'training' ? 'page' : undefined}><Icon name="workout" />Entrenamiento</Link>{session.identity?.role === 'admin' && <Link className={current === 'admin' ? 'nav-active' : ''} href="/admin" aria-current={current === 'admin' ? 'page' : undefined}><Icon name="lock" />Administración</Link>}<Link className={current === 'food' ? 'nav-active' : ''} href="/app/alimentacion" aria-current={current === 'food' ? 'page' : undefined}><Icon name="food" />Alimentación</Link><Link className={current === 'reports' ? 'nav-active' : ''} href="/app/reportes" aria-current={current === 'reports' ? 'page' : undefined}><Icon name="chart" />Reportes</Link></nav><button className="sidebar-logout" disabled={loggingOut} onClick={() => void logout()} aria-label={loggingOut ? 'Cerrando sesi\u00f3n' : 'Cerrar sesi\u00f3n'}><Icon name="logout" /><span>{loggingOut ? 'Saliendo\u2026' : 'Cerrar sesi\u00f3n'}</span></button>{error && <p className="sidebar-error" role="alert">{error}</p>}</aside>;
}
