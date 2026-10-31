> Documento histórico. La organización y política vigentes se describen en [REVIEW_AND_ELICITATION_REPORT.md](REVIEW_AND_ELICITATION_REPORT.md): 16 escenas, bloques académicos y ningún tiempo visible en mapa/debug.

# Bloque 01 — Grupo, introducción, objetivos y sistema

## Estado y alcance

Completado en `feature/final-presentation`. Exactamente nueve escenas habilitadas. Se conservaron los renders de inicio, problema y formance y su sistema visual aprobado. No se modificaron PresentationShell, navegación, fullscreen, mapa, debug ni primitivas base. El mapa incorpora las nuevas escenas automáticamente desde el registro de datos.

No se agregaron escenas de elicitación, competencia, relevamiento, diagnóstico, requerimientos, arquitectura, demo o cierre. La última escena contiene únicamente una transición visual sin enlace ni acción automática.

## Orden, speaker y tiempo

Todas las escenas están a cargo de **Hernán**. Matías, Diego y Nahuel se presentan en equipo sin asignarles responsabilidades técnicas adicionales.

| Orden | ID | Duración | Acumulado |
| --- | --- | --- | --- |
| 1 | inicio | 0:20 | 0:20 |
| 2 | equipo | 0:20 | 0:40 |
| 3 | problema | 0:35 | 1:15 |
| 4 | formance | 0:25 | 1:40 |
| 5 | objetivo-proyecto | 0:35 | 2:15 |
| 6 | objetivo-sistema | 0:30 | 2:45 |
| 7 | alcance | 0:35 | 3:20 |
| 8 | limites | 0:25 | 3:45 |
| 9 | no-contempla | 0:30 | 4:15 |

La tabla solicitada suma **255 segundos = 4:15**, no 4:00. Se respetaron sus valores individuales. El total no supera 4:15; para ajustarlo a cuatro minutos exactos habría que recortar 15 segundos durante el ensayo.

## Contenido y decisiones

- Equipo: nombres completos proporcionados, coordinación de Hernán y tres integrantes. Composición 2×2 sin fotos ni avatares; Grupo N.º 5 · Ingeniería en Software.
- Problema: notas aclaran fragmentación de información, sin afirmar ausencia de aplicaciones.
- Formance: oportunidad de integrar tres dominios, conservando el diseño aprobado.
- Objetivo del proyecto: registrar, integrar e interpretar; el contexto de actividad física estructurada y la asistencia de IA para comidas/análisis quedan en las notas. No se presenta como app móvil nativa.
- Objetivo del sistema: ProcessFlow existente para registrar, centralizar, comparar y analizar; aclaración sobre datos/cálculos del sistema y asistencia de IA.
- Alcance: seis pasos numerados, conectados y con resumen + IA como destino. Se distribuyen en más filas en pantallas menores.
- Límites: desde acceso, configuración y objetivo hasta resumen semanal e interpretación asistida; recorrido intermedio explícito.
- Exclusiones: cuatro grupos y frase de decisión de diseño. Transición discreta a 03 — Elicitación sin crear esa escena.

Cada escena tiene notas breves para idea, aclaración, precaución y transición. Se utiliza la transición uniforme existente, sin clicks adicionales ni nuevas animaciones. El contenido procede de la solicitud; no se inventaron funcionalidades o responsabilidades, ni se alteraron decisiones documentales E1–E4.

## Archivos de esta continuación

- Nuevo `src/presentation/block-one.tsx`: seis escenas nuevas y sus layouts de contenido.
- `src/presentation/slides.tsx`: conserva los renders aprobados, actualiza metadata y compone el orden de nueve escenas.
- `src/presentation/presentation.css`: estilos adicionales limitados a los nuevos layouts; ajustes responsive sin modificar estilos de las escenas existentes.
- `e2e/presentation/presentation.spec.cjs`: orden exacto, metadata, deep links, nueve previews y verificación geométrica de contenido.
- README actualizado; informe presente; nueve previews en la carpeta existente.

Los cambios del layout raíz y otros archivos de infraestructura que aún aparecen en git status pertenecen a la etapa anterior sin commit. No se modificaron en esta continuación. Sin cambios en MVP, providers, API client, .env.local, dependencias o lockfiles. Sin commit, merge o push.

## Previews

PNG 1920×1080 generados desde el build de producción, sin servicios externos. Nombres históricos conservados; la numeración de archivos no representa el orden del deck.

- `01-cover.png` — inicio.
- `04-team.png` — equipo.
- `02-problem.png` — problema.
- `03-formance.png` — formance.
- `05-project-objective.png` — objetivo-proyecto.
- `06-system-objective.png` — objetivo-sistema.
- `07-scope.png` — alcance.
- `08-boundaries.png` — limites.
- `09-not-in-scope.png` — no-contempla.

Todos se abrieron y revisaron individualmente. Los anteriores se regeneran para actualizar el contador a nueve, manteniendo su composición. Se corrigió un desborde móvil de no-contempla reduciendo espacios, sin quitar contenido.

## Validaciones

- `npm.cmd test`: 15/15 aprobados.
- `npm.cmd run typecheck`: aprobado.
- `npm.cmd run build`: aprobado.
- Playwright de presentación: 6/6 aprobados, reutilizando solo el paquete de E4. No se ejecutó la suite E4.
- Verificación de las nueve escenas en 1920×1080, 1440×900, 1366×768 y 390×844: sin scroll ni contenido fuera del viewport.
- Mapa: nueve entradas en orden, Hernán, duración individual, acumulado y total 4:15.
- Deep links y recarga de cada escena; End llega a no-contempla; avance secuencial, teclado, historial, progreso y fallback fullscreen.
- Requests externos bloqueados y ausencia de intentos comprobada en cada prueba. No se consumió Gemini, Firebase, USDA ni backend.

## Pendiente

Ensayo oral para confirmar tiempos, aprobación del contenido académico y construcción posterior de elicitación únicamente cuando se solicite. Este bloque no requiere assets nuevos de Figma.

## Actualización — navegación exclusivamente manual

Se agregó rueda/trackpad con bloqueo de 650 ms de silencio tras cada avance; la inercia prolonga el bloqueo. Los deltas pequeños se acumulan con un umbral de 24 px. Swipe horizontal/vertical de al menos 60 px permite avanzar hacia izquierda/arriba y retroceder hacia derecha/abajo. Taps, multitouch y controles interactivos no disparan navegación por gesto. Se mantiene pinch zoom. No se introdujeron dependencias.

`durationSeconds` sigue siendo únicamente metadata de estimación; no hay temporizador, setInterval, setTimeout ni auto-advance en la presentación. La rueda no modifica el scroll habitual del mapa. Las slides conservan su viewport completo sin scroll.

Validación posterior: 15 tests existentes, typecheck y build aprobados; 8/8 Playwright aprobados. Incluyen reloj simulado de diez minutos sin cambio de escena, ráfagas de wheel e inercia, sentido inverso, teclado y controles existentes, swipe real mediante eventos táctiles de Chrome, taps y multitouch. Sin requests externos ni APIs del MVP. Sin commit, merge o push.
