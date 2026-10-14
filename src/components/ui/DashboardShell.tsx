'use client';
import { usePathname } from 'next/navigation';
import AppSidebar from './AppSidebar';

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname === '/admin' || pathname === '/app' || pathname.startsWith('/app/');
  if (!isDashboard) return children;
  const current = pathname === '/admin' ? 'admin' : pathname.startsWith('/app/entrenamiento') ? 'training' : pathname.startsWith('/app/alimentacion') ? 'food' : 'account';
  return <div className="dashboard app-shell">
    <a className="skip-link" href="#dashboard-content">Ir al contenido</a>
    <AppSidebar current={current} />
    <main id="dashboard-content" className="dashboard-content" tabIndex={-1}>{children}</main>
  </div>;
}
