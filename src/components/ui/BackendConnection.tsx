'use client';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import { ensureBackendReady, getConnectionState, subscribeConnection } from '@/lib/api/connection';

export default function BackendConnection() {
  const state = useSyncExternalStore(subscribeConnection, getConnectionState, () => 'idle');
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const pathname = usePathname();
  const inDashboard = pathname.startsWith('/app') || pathname === '/admin';
  useEffect(() => { void ensureBackendReady().catch(() => {}); }, []);
  useEffect(() => {
    setDismissed(false);
    if (state !== 'connecting') return;
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => { clearTimeout(timer); setVisible(false); };
  }, [state]);
  const show = !dismissed && (state === 'unavailable' || (state === 'connecting' && visible));
  return <aside className={`backend-connection${inDashboard ? '' : ' above-form'}${show ? ' is-visible' : ''}`} aria-label="Conexión con Formance" aria-hidden={!show}>
    <div role="status" aria-live="polite">{show && (state === 'unavailable' ? <><strong>No pudimos conectar</strong><span>Revisá tu conexión y volvé a intentar.</span></> : <><strong>Estamos preparando tu espacio</strong><span>La primera conexión puede tardar hasta un minuto y medio. Podés quedarte acá.</span></>)}</div>
    {state === 'unavailable' && <button onClick={() => void ensureBackendReady().catch(() => {})}>Reintentar conexión</button>}
    <button className="connection-dismiss" onClick={() => setDismissed(true)}>Ocultar aviso</button>
  </aside>;
}
