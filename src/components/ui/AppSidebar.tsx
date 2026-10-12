'use client';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/provider';
import Icon from './Icon';
export default function AppSidebar({ current }: { current: 'account' | 'admin' | 'training' }) {
  const session = useAuth();
  return <aside className="app-sidebar"><Link href="/"><img className="brand" src="/brand/formance.svg" alt="Formance" width="170" height="36" /></Link><nav aria-label="Navegación de la cuenta"><Link className={current === 'account' ? 'nav-active' : ''} href="/app" aria-current={current === 'account' ? 'page' : undefined}><Icon name="grid" />Mi resumen</Link><Link className={current === 'training' ? 'nav-active' : ''} href="/app/entrenamiento" aria-current={current === 'training' ? 'page' : undefined}><Icon name="workout" />Entrenamiento</Link>{session.identity?.role === 'admin' && <Link className={current === 'admin' ? 'nav-active' : ''} href="/admin" aria-current={current === 'admin' ? 'page' : undefined}><Icon name="lock" />Administración</Link>}<span className="sidebar-soon"><Icon name="food" />Alimentación<span className="coming-label">Pronto</span></span><span className="sidebar-soon"><Icon name="chart" />Progreso<span className="coming-label">Pronto</span></span></nav><button onClick={() => void session.logout()}><Icon name="logout" />Cerrar sesión</button></aside>;
}
