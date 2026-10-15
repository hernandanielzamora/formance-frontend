# Formance · Frontend

## Reportes

`/app/reportes`: resumen semanal con comparación del mismo período anterior,
sesiones/series/carga externa, nutrición, peso y completitud. Historial filtrable por
día, tipo, estado y texto con detalle de series, comidas y mediciones. No realiza llamadas
a IA. La interpretación de la semana mediante IA queda pendiente.

`/app/peso`: registro diario en kg, edición y archivo, nota opcional, gráfico
interactivo e historial por fechas. Conserva el peso inicial del onboarding.
Los promedios usan solo fechas con mediciones y no completan días vacíos.

## Alimentación

`/app/alimentacion`: diario por fecha y momento del día, totales frente a objetivos,
registro manual por 100 g o por porción, búsqueda USDA y estimación editable desde
foto con Gemini. Se puede editar, duplicar y quitar comidas. Los nutrientes sin
datos se distinguen de cero; las fotos requieren consentimiento antes de enviar.
Las claves van exclusivamente en el `.env` del backend. La interfaz funciona
con carga manual cuando los proveedores no están configurados.

## Entrenamiento

`/app/entrenamiento`: rutinas base ordenadas según el objetivo, rutinas propias,
workouts y ejercicios buscables por nombre, grupo muscular y equipamiento.
Se pueden crear workouts, copiar plantillas, editar la distribución semanal
y elegir una rutina activa. Días vacíos indican descanso. Las sugerencias no
restringen otras plantillas. El diseño usa tarjetas en desktop y una columna
con navegación táctil en móvil.
La rutina activa abre `/app/entrenamiento/calendario`: semana de lunes a domingo,
entrenamientos y descansos, selección de fecha e historial diario. Desde un workout
se registra una sesión con repeticiones, carga externa en kg y series realizadas.
Se puede guardar parcialmente, retomar, finalizar o interrumpir. El guardado es
explícito; los registros cerrados son de solo lectura. No se registran días futuros.
La API conserva snapshots de la planificación y distingue 0 kg de carga no registrada.
Los reportes semanales están disponibles; la adherencia histórica queda pendiente.
Ejercicios, workouts y rutinas se leen y guardan en Firebase a través de la API.
Crear está disponible para todos. Editar/borrar se habilita según permisos del
servidor: propietario o administrador. El admin también ve contenido personal
de otros usuarios. El borrado requiere confirmación y conserva el historial.

Webapp independiente del seminario, con Next.js App Router, React y TypeScript.
Estado: registro/login con Google o correo, verificación de correo y cierre de sesión.
Rutas: `/registro`, `/login`, `/verificar-correo`, `/app`, `/admin/login` y `/admin`.
El onboarding `/onboarding` adapta el recorrido de Nutrivo: datos personales (cm/kg),
actividad, objetivo y revisión editable de calorías/macros. Se guarda mediante la API;
al acceder a `/app`, las cuentas sin perfil completo se dirigen al onboarding.
El admin entra a `/admin` y puede abrir su perfil personal para completar el mismo recorrido.
Las herramientas de gestión se implementarán en los siguientes commits.
El logotipo de Formance se reutiliza del proyecto original.

## Diseño y experiencia

Identidad con Geist local, fondos claros y acentos verde lima. Portada con recorrido de
registro y fotografías originales del proyecto anterior. Recursos reutilizados:
`public/brand` (logos), `public/images` (fotografías e ilustraciones de Nutrivo) y
`src/app/fonts/GeistVF.woff` (fuente del dashboard original).
No se descargan fuentes ni imágenes de servicios externos.

Registro/login incluyen mostrar contraseña, recuperación en `/recuperar-acceso`,
estados de carga y acceso administrativo separado. El onboarding muestra el paso
actual y un resumen antes de confirmar. Las funciones pendientes se identifican
como próximas y no presentan botones sin acción. Las vistas se adaptan a móvil
y respetan `prefers-reduced-motion`.

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
