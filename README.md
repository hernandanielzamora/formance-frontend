# Formance · Frontend

Webapp independiente del seminario, con Next.js App Router, React y TypeScript.
Estado: registro/login con Google o correo, verificación de correo y cierre de sesión.
Rutas: `/registro`, `/login`, `/verificar-correo`, `/app`, `/admin/login` y `/admin`.
El onboarding y las herramientas de gestión se implementarán en los siguientes commits.
El logotipo de Formance se reutiliza del proyecto original.

## Inicio local

Usar Node.js 24 LTS. En PowerShell usar `npm.cmd` si `npm` está bloqueado.

```powershell
Copy-Item .env.example .env.local
npm.cmd ci
npm.cmd run dev
```

No sobrescribir `.env.local` si ya está configurado. Abrir http://localhost:3000.
Iniciar también `formance-backend` en el puerto 4200. Verificación local:
http://localhost:3000/setup.

## Firebase nuevo

Primero crear el proyecto siguiendo el README del backend.
En Configuración del proyecto > Tus apps, registrar una aplicación web; no es necesario
activar Hosting ni Analytics. Copiar estos campos de `firebaseConfig` a `.env.local`:

| Firebase | Variable |
| --- | --- |
| apiKey | NEXT_PUBLIC_FIREBASE_API_KEY |
| authDomain | NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN |
| projectId | NEXT_PUBLIC_FIREBASE_PROJECT_ID |
| appId | NEXT_PUBLIC_FIREBASE_APP_ID |

Usar el mismo projectId que el backend. Comprobar que `localhost` esté autorizado
en Authentication > Configuración > Dominios autorizados. Reiniciar el frontend
después de modificar las variables. La configuración `NEXT_PUBLIC_*` es pública:
jamás colocar una cuenta de servicio, clave privada o clave de IA allí.

El SDK se inicializa bajo demanda y el proyecto puede compilar sin Firebase configurado.
`/setup` comprueba la API e inicializa el SDK, pero NO acredita una conexión remota a Firebase.
Para eso ejecutar `npm.cmd run check:firebase` en el backend. El login real se implementará
mediante la UI de registro/login. Google y Correo/Contraseña deben estar habilitados
en Authentication. El acceso admin requiere un custom claim establecido desde Firebase Admin.

## Estructura

- `src/app`: rutas y estilos.
- `src/lib/firebase/client.ts`: cliente de Authentication, sin acceso directo a Firestore.
- `src/lib/api/client.ts`: solicitudes HTTP, timeout y envío de ID token cuando exista sesión.
- `public/brand`: logotipo de Formance.

```powershell
npm.cmd run build
npm.cmd run typecheck
```

No se incorporan Redux, servicios de Nutrivo, pagos ni IA en esta base.
Variables locales y archivos privados se excluyen de Git. Versionar `package-lock.json`.
Repositorio independiente: https://github.com/hernandanielzamora/formance-frontend.
La base inicial se registra en `main`; `dev` será la rama de integración y cada feature
se desarrollará en una rama creada desde `dev`.

Documentación: https://nextjs.org/docs/app/getting-started/installation
Firebase: https://firebase.google.com/docs/web/setup
