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
  return <aside className="app-sidebar"><Link className="sidebar-brand" href="/app" aria-label="Formance, mi resumen"><img className="brand" src="/brand/formance.svg" alt="Formance" width="170" height="36" /></Link><nav aria-label="Navegación de la cuenta">{([['account', '/app', 'grid', 'Mi resumen', 'Inicio'], ['training', '/app/entrenamiento', 'workout', 'Entrenamiento', 'Entrenar'], ['food', '/app/alimentacion', 'food', 'Alimentación', 'Comidas'], ['reports', '/app/reportes', 'chart', 'Reportes', 'Progreso'], ...(session.identity?.role === 'admin' ? [['admin', '/admin', 'lock', 'Administración', 'Admin']] : [])] as const).map(([key, href, icon, label, short]) => <Link key={key} className={current === key ? 'nav-active' : ''} href={href} aria-current={current === key ? 'page' : undefined}><Icon name={icon as Parameters<typeof Icon>[0]['name']} /><span className="nav-label">{label}</span><span className="nav-short" aria-hidden="true">{short}</span></Link>)}</nav><button className="sidebar-logout" disabled={loggingOut} onClick={() => void logout()} aria-label={loggingOut ? 'Cerrando sesi\u00f3n' : 'Cerrar sesi\u00f3n'}><Icon name="logout" /><span>{loggingOut ? 'Saliendo\u2026' : 'Cerrar sesi\u00f3n'}</span></button>{error && <p className="sidebar-error" role="alert">{error}</p>}</aside>;
}
