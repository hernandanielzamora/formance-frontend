'use client';

import { useState } from 'react';
import { apiRequest } from '@/lib/api/client';
import { getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase/client';

export default function Setup() {
  const [status, setStatus] = useState('Sin verificar.');
  const [busy, setBusy] = useState(false);
  async function check() {
    setBusy(true);
    try {
      const health = await apiRequest<{ status: string; service: string }>('health');
      if (health.status !== 'ok' || health.service !== 'formance-backend') throw new Error('Respuesta de API inesperada.');
      if (isFirebaseConfigured()) {
        getFirebaseAuth();
        setStatus('API conectada y SDK de Firebase inicializado. Verificá el acceso real con check:firebase en el backend.');
      } else setStatus('API conectada. Falta completar la configuración pública de Firebase en .env.local.');
    } catch {
      setStatus('No se pudo completar la verificación. Revisá que la API esté iniciada y las variables de entorno estén configuradas.');
    } finally { setBusy(false); }
  }
  return <main className="container"><h1>Configuración local</h1><p>Herramienta temporal de desarrollo. El login y los permisos se implementarán en el paso 2.</p><button onClick={check} disabled={busy}>{busy ? 'Verificando…' : 'Verificar conexión'}</button><p role="status">{status}</p><a href="/">Volver a Formance</a></main>;
}
