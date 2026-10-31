# Revisión integral y bloque de Elicitación

## Estado inicial encontrado

Auditoría realizada antes de modificar: git status, ramas e historial de 15 commits; registro, tipos, CSS, todos los componentes, rutas, tests, nueve previews y documentación. Rama actual: `feature/final-presentation`, base `35b3b57`. El trabajo de las etapas anteriores seguía sin commit: modificación del layout raíz y archivos nuevos de presentación. Se preservó ese trabajo, sin reset ni cambios en main/dev.

Había nueve escenas en el orden solicitado, con Hernán como speaker y navegación manual funcional. Problema y Formance estaban incorrectamente etiquetados en Apertura. Mapa/debug todavía mostraban duraciones; tres previews tenían numeración histórica distinta del orden real. No se encontraron temporizadores de autoavance.

Se revisó además `../Resumen_Reunion_Profesora_Seminario_Analista.docx`, documento interno de repaso. Confirma fragmentación, escenario organizacional simulado y corrección de la confusión entre negocio y equipo técnico. No se encontró el documento acumulativo E1/E2 completo en el workspace. El contenido preciso de Elicitación se tomó de la solicitud actual; el repaso histórico no se trata como fuente del stack final ni como catálogo competitivo exhaustivo. En particular, la solicitud actual incorpora YAZIO/Lifesum y las alternativas TIC indicadas. No se realizó investigación comercial nueva ni se agregaron afirmaciones sobre exclusividad funcional.

## Cambios realizados a 01–09

Se conservaron las nueve escenas y sus composiciones. Portada intacta, equipo 2×2, problema/resolución visual consecutivos, objetivos diferenciados, alcance por procesos, frontera desde acceso/configuración hasta resumen semanal, cuatro grupos de exclusiones.

El orden ya era correcto; se normalizaron las etiquetas de bloque, sin cambiar IDs o romper deep links. Las dos primeras escenas pertenecen a Apertura y las siguientes siete al bloque 02. El contador se calcula sobre habilitadas; ahora muestra 16 como total.

## Orden definitivo

| Número | ID | Preview |
| --- | --- | --- |
| 01 | inicio | 01-cover.png |
| 02 | equipo | 02-team.png |
| 03 | problema | 03-problem.png |
| 04 | formance | 04-formance.png |
| 05 | objetivo-proyecto | 05-project-objective.png |
| 06 | objetivo-sistema | 06-system-objective.png |
| 07 | alcance | 07-scope.png |
| 08 | limites | 08-boundaries.png |
| 09 | no-contempla | 09-not-in-scope.png |
| 10 | contexto | 10-context.png |
| 11 | proceso-actual | 11-current-process.png |
| 12 | tic | 12-tic.png |
| 13 | competencia | 13-competition.png |
| 14 | stakeholders | 14-stakeholders.png |
| 15 | modelo-negocio | 15-business-model.png |
| 16 | sintesis-elicitacion | 16-elicitation-summary.png |

## Bloques

`src/presentation/blocks.ts` centraliza siete bloques y rangos académicos. Mapa agrupa 2 + 7 + 7 escenas implementadas bajo los tres primeros. Relevamiento/diagnóstico (17–19), propuesta/requerimientos (20–24), demo (25) y cierre (26) aparecen solo como encabezados pendientes, sin enlaces ni escenas. No se crearon slides 17–26.

## Speakers

01–09: Hernán. 10–16: Nahuel. Ambos visibles únicamente como metadata en mapa/debug. Las notas de Nahuel son breves: idea central, aclaración y transición. No se presentan equipo académico, universidad o profesora como stakeholders del negocio.

## Navegación

Se conservaron flechas, Space, PageUp/PageDown, Home/End, botones, rueda/trackpad con bloqueo de 650 ms e inercia y swipe en ambos ejes. No hay autoplay, temporizador, cronómetro o cuenta regresiva. El bloqueo de rueda solo filtra entradas: no programa avances. Las escenas siguen ocupando el viewport sin scroll; mapa mantiene scroll propio. Fullscreen y sus fallbacks permanecen disponibles.

## Eliminación de tiempos visibles

Shell y mapa utilizan `enabledSlides` en lugar de timeline. Se retiraron todos los renderizados de duración, acumulado y total, incluidas referencias al objetivo temporal futuro. Debug muestra número, ID, sección, título, speaker y theme. Mapa muestra los mismos datos más thumbnails y estado de bloques pendientes.

Los valores durationSeconds existentes y helpers de cálculo se conservan internamente por compatibilidad, sin uso en la navegación ni UI. No se asignaron tiempos a las nuevas escenas. La guía actual reemplaza instrucciones anteriores sobre tiempos; los informes previos se mantienen identificados como históricos.

## Slides 10–16

- Contexto: persona con actividad física estructurada y tres dominios; escenario simulado explícito, sin organización cliente real.
- Proceso actual: objetivo → tres herramientas separadas → comparación manual/información distribuida. Sin desarrollar diagnóstico.
- TIC: capas de alternativas analizadas, label Evaluación inicial y advertencia explícita de que no es el stack final. React Native/Expo, Flutter, Node/Express, Firebase, PostgreSQL, USDA, Gemini y OpenAI según la solicitud.
- Competencia: nutrición/peso y fuerza convergen en Formance; nombres de productos como texto, sin logos comerciales. Diferencial planteado como integración de alcance reducido, no exclusividad de fotografía con IA ni ausencia de otras apps integradas.
- Stakeholders: usuario principal, gestión simulada, operaciones/soporte, proveedores y marco de protección de datos. Sin afirmaciones legales específicas.
- Modelo de servicio: cuatro áreas organizacionales solicitadas y proceso fragmentado. Sin organigrama de PM/frontend/backend/QA.
- Síntesis: información generada → distribuida → comparación manual; centralización como necesidad y transición visual a diagnóstico, sin crear ese bloque.

Se mantuvo Geist y la paleta existente. Marcador 03 — Elicitación, diagramas HTML/CSS, líneas, conexiones y cards; transición uniforme existente con reduced motion. No se añadieron dependencias, fotos, avatares ni assets comerciales.

## Previews

16 PNG actuales 1920×1080 en `docs/presentation/previews/`, revisados individualmente. Se regeneraron los anteriores con contador 16. Se eliminaron exclusivamente `02-problem.png`, `03-formance.png` y `04-team.png` después de crear sus reemplazos correctamente numerados. Sin tocar assets E4.

Se validaron las 16 escenas completas en 1920×1080, 1440×900 y 1366×768; también en 390×844. Comprobaciones de límites de texto/cards, no solo del contenedor recortado. Competencia, proceso actual y áreas organizacionales se revisaron visualmente.

## Tests

`npm.cmd test`: **15/15 aprobados**, sin suite E4. Los tests existentes utilizan sus fixtures locales.

## Typecheck

`npm.cmd run typecheck`: aprobado.

## Build

`npm.cmd run build`: aprobado. `/presentacion` y `/presentacion/mapa` se generan correctamente. Sin modificaciones adicionales al MVP, .env.local, dependencias o lockfiles.

## Playwright

**8/8 aprobados** contra producción local, reutilizando únicamente el paquete Playwright de E4, sin credenciales ni helpers del MVP. Además, las nueve escenas se validaron por separado antes de incorporar Elicitación (4 pruebas de viewport aprobadas).

La suite comprueba 16 habilitadas, orden exacto, 16 hashes y recarga, bloques 2/7/7 y pendientes, Hernán/Nahuel, theme, ausencia de tiempos visibles en presentación/mapa/debug, Home/End, avance secuencial, teclado, historial, progreso, fullscreen fallback, wheel/inercia, swipe y multitouch. El reloj simulado verifica ausencia de autoavance tras diez minutos.

Requests externos bloqueados y ausencia de intentos comprobada en cada prueba. No se consumieron Gemini, USDA, Firebase writes ni APIs del backend. La suite E4 completa no se ejecutó.

## Archivos principales

Nuevos: `src/presentation/blocks.ts`, `elicitation.tsx` y este informe.

Actualizados: registro, metadata de bloques en block-one, filtro enabledSlides en tipos, render de debug, página del mapa, CSS de mapa/Elicitación, pruebas, previews, README e identificación de informes históricos. La infraestructura de providers y el layout raíz de etapas anteriores no se alteraron en esta continuación.

## Pendientes

Contrastar el contenido con el documento acumulativo completo cuando esté disponible; ensayo oral de ambos speakers; desarrollo de bloques 04–07 solo cuando se autorice. No se necesita export adicional de Figma. No se hizo commit, merge o push.

## Servidor local de revisión

Servidor Next.js de desarrollo iniciado y dejado ejecutándose en segundo plano, puerto **3000**, PID inicial **11284**. Se comprobó respuesta HTTP 200 en ambas rutas desde una invocación posterior al arranque.

- Presentación: http://localhost:3000/presentacion
- Mapa: http://localhost:3000/presentacion/mapa
- Slide directa: http://localhost:3000/presentacion#competencia

Comando equivalente desde formance-frontend: `npm.cmd run dev -- --hostname 127.0.0.1 --port 3000`.

Logs y metadata de proceso locales, ignorados por git: `.auth/presentation-dev.stdout.log`, `.auth/presentation-dev.stderr.log`, `.auth/presentation-server.json`. No se mataron procesos externos. El servidor de revisión no se cerró al finalizar.
