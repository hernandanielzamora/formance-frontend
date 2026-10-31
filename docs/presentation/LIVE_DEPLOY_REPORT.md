# Publicación de la presentación final

Fecha: 31/10/2026.

## Branch estable publicada

`feature/final-presentation`, pusheada a origin. Versión aprobada consolidada mediante merge explícito en `1a67d920fd1b40bba6ff955788b89fb789716e69`; ajuste del smoke en `52f3844`. Rama que publica por la integración Git existente: `dev`, indicada por el usuario.

## Commit publicado

Publicado en producción mediante Vercel: `da56b4eccbc7d37fef4988af8942d8b4515a46d1` (`dev`). Su árbol coincide con la rama estable validada. El informe posterior se guarda en la rama estable como documentación, sin nuevo cambio funcional del sitio.

## Estrategia de deploy

1. Auditoría de árbol limpio, ramas, log y remoto GitHub; sin descartar cambios.
2. Validación en experimento: 15 tests, typecheck, build y 16 Playwright correctos. Se completó el respaldo con la quinta captura E4 original.
3. Merge `--no-ff` del experimento a estable; repetición de los mismos controles en estable y push exclusivamente de esa rama.
4. Vercel generó Preview correctamente desde la rama estable. El acceso público estaba protegido por login de Vercel. El usuario autorizó explícitamente validar el build local y publicar por `dev`, con smoke posterior en producción.
5. Smoke de producción local: 2/2. Merge trazable de estable a dev, sin conflictos; su árbol es idéntico al validado. Push de dev mediante la integración Git ya configurada; sin CLI, cambio de proyecto, dominio ni variables de Vercel.

No se necesitó rama release: `origin/dev` estaba exactamente en la base del trabajo (`35b3b57f1888e9eb5895d9a4b68bc6a923bf9883`). Los commits agregados se limitan a presentación, su infraestructura, pruebas, assets y documentación. `main` no se modificó. No se pusheó la rama experimental.

Restauración: tag local `presentation-before-live-2026-10-31` en la base previa de dev, también preservada en el historial remoto. Checkpoint anterior al polish: `bbc72453727c6eb7901afdf5fcd8d3e80338c234`. Motion 5 aprobado: `f96abd8`.

## URL producción

https://formance-frontend.vercel.app

## URL presentación

https://formance-frontend.vercel.app/presentacion

## URL mapa

https://formance-frontend.vercel.app/presentacion/mapa

## Preview utilizado

https://formance-frontend-git-featu-1dc11a-hernandanielzamoras-projects.vercel.app

Deployment inicial: https://vercel.com/hernandanielzamoras-projects/formance-frontend/3w6dvkoyVmi6kscvY3XoGShxCzoA (commit `1a67d92`, estado success en GitHub). La protección redirige a Vercel Login; no se afirma que haya pasado un smoke público. La excepción fue autorizada por el usuario antes de pushear dev.

## Tests

`npm.cmd test`: 15/15, en experimento y estable.

## Typecheck

`npm.cmd run typecheck`: correcto, en experimento y estable.

## Build

`npm.cmd run build`: correcto, en experimento y estable. `.env.local` no se modificó ni se publicó. No se imprimieron secretos.

## Playwright

Suite de presentación: 16/16, en experimento y estable. Incluye 21 slides, siete bloques, metadata privada, navegación manual, rueda con bloqueo, swipe, teclado, deep links, motion finito, navegación rápida, fallback de View Transitions, reduced motion, CTA y cinco capturas. Los tiempos no generan navegación.

Smoke sobre el build de producción local: 2/2. Incluye fullscreen real, portada, login y redirección anónima del CTA a login.

## Smoke tests live

**Aprobados: 2/2 sobre la URL pública de producción** (`26.2 s`). Deployment `5MzYssoqrYh98ao8uGhAkjJhnk4u`, confirmado success por Vercel en GitHub a las 23:21:53 UTC del 31/10/2026:
https://vercel.com/hernandanielzamoras-projects/formance-frontend/5MzYssoqrYh98ao8uGhAkjJhnk4u

Verificados públicamente:
- `/` y `/login`: HTTP 200 y contenido visible.
- `/presentacion`: HTTP 200, carga de assets/logos y 21 escenas disponibles.
- `/presentacion/mapa`: 21 tarjetas, siete bloques y enlace a la slide 20.
- Hashes `#problema`, `#competencia`, `#diagnostico`, `#requerimientos-funcionales`, `#implementacion-demo` y `#cierre`; permanecen estables al finalizar las animaciones.
- ArrowRight, ArrowLeft, Space, Home, End, wheel y entrada/salida real de fullscreen.
- Viewport móvil 390×844, contenido sin scroll y reduced motion sin animaciones.
- Cinco imágenes de respaldo cargadas y navegación del diálogo; Escape cierra correctamente.
- Sin requests externos ni errores de JavaScript durante la verificación de presentación.
- CTA abre el producto real y redirige una sesión anónima a `/login`.

La actualización observable de la URL canónica después del push confirmó el flujo de producción desde `dev`. No se modificó la configuración interna de Vercel ni se afirmó acceso a sus variables privadas.

Comando reproducible en PowerShell:

```powershell
$env:PRESENTATION_LIVE_URL='https://formance-frontend.vercel.app'
node e2e/e4/node_modules/@playwright/test/cli.js test --config e2e/presentation/live.config.cjs
```

## CTA demo

Destino relativo `/app`, pestaña nueva, apertura únicamente mediante click. Smoke anónimo local y de producción aprobado: redirige al login existente. No se cambió autenticación. El flujo autenticado `/app` conserva byte a byte su código y providers; no se utilizó una sesión real autenticada en el smoke, por lo que no se afirma una validación de cuenta en producción.

## Fallback

Cinco capturas E4 en `public/presentation/demo`, revisadas por el test; apertura manual, navegación interna y Escape con devolución de foco. Perfil con nombre/correo previamente redactados; conserva referencias del original, sin presentarlas como datos sintéticos. Sin recaptura ni consumo de IA.

## Cambios al MVP

**Sin cambios funcionales intencionales al MVP**.

Comparación contra dev previo: sin diferencias en `src/lib`, módulos de aplicación, login/onboarding, componentes auth/UI/food/training/reports/weight, CSS del producto, dependencias ni configuración Next. Única infraestructura compartida: layout raíz delega los mismos providers a `ProductProviders`, que los omite solo en `/presentacion` y subrutas para evitar bootstrap del MVP allí. Fuera de esas rutas conserva el orden y componentes originales.

No había `vercel.json`, `.vercel`, middleware/proxy ni workflows locales de deploy. Se mantuvieron headers, rutas y variables existentes. No se inspeccionaron valores de variables privadas del hosting. No se modificó ni desplegó backend, Gemini, USDA, Firestore, cuotas o endpoints. El smoke bloquea escrituras y llamadas de IA.

