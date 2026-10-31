# Motion 5 — revisión

Checkpoint estable: `bbc72453727c6eb7901afdf5fcd8d3e80338c234`, branch `feature/final-presentation`. Se validó antes del commit: 15 tests, typecheck, build y 14 Playwright correctos.

Experimento: `experiment/presentation-motion-5`. Mantiene las 21 escenas, siete bloques, expositores y navegación manual.

## Auditoría narrativa

| Slides | Idea propia verificada |
| --- | --- |
| 01 / 02 | Identidad del proyecto / equipo |
| 03 / 04 | Problema / visión y objetivos |
| 05 / 06 | Frontera del recorrido / exclusiones deliberadas |
| 07 / 08 / 09 | Contexto a relevar / alternativas técnicas / oportunidad competitiva |
| 10 / 11 / 12 | Actores / áreas del servicio simulado / criterios derivados de elicitación |
| 13 / 14 / 15 | Traspasos de información / AS-IS formal / diagnóstico causal |
| 16 / 17 / 18 / 19 | Transformación TO-BE / reglas / RF agrupados / calidad y modelado |
| 20 / 21 | Implementación real y demo / cierre |

Cambios de contenido limitados a 07 y 16. En 07 se retiró la cadena objetivo→herramientas→comparación manual y se mantuvieron actor, tres dimensiones y escenario simulado; la explicación pasó a notes. La 14 conserva el proceso completo. La 16 contrasta registros separados/reconstrucción/lectura fragmentada con registro centralizado/resumen/lectura integrada. IA como apoyo final. 11 y 12 conservadas: describen estructura organizacional y criterios de diseño, respectivamente. Los demás textos ya son breves o conservan conceptos académicos necesarios.

## Motion experimental

Capa independiente `motion-5.css`, sin dependencias nuevas. Entradas de 20–36 px, escala leve, snapshots direccionales y cancelación de transiciones ante navegación rápida. En 03→04 los tres dominios comparten identidad visual; convergen antes de la marca y los objetivos. Secuencias propias en 05–10 y 13–21: conexiones, direcciones de exclusión, contexto radial, acento causal, transformación AS-IS→TO-BE, arquitectura por capas/proveedores/CTA y cierre oscuro con isotipo original. Sin loops, filtros animados ni cambio de slide por animación. Mapa estático y reduced motion muestran el estado final completo.

Figma: inventario revisado; siguen faltando exports purple/blue aprobados. Se reutilizó únicamente el isotipo existente, sin bloquear el experimento.

## Comparación

Los 21 previews estables quedan preservados en el checkpoint; los experimentales se regeneran en el mismo directorio de esta rama. Para comparar código: `git diff feature/final-presentation...experiment/presentation-motion-5 -- src/presentation src/components/presentation`.

Una vez guardado el experimento, volver a la versión estable con `git switch feature/final-presentation`; regresar con `git switch experiment/presentation-motion-5`. No se resetea ni sobrescribe el checkpoint. Para reproducir en cualquiera de las ramas: `npm.cmd run dev -- --port 3000`.

Validación experimental: `npm.cmd test` 15/15; `npm.cmd run typecheck` y `npm.cmd run build` correctos; Playwright 16/16. Se verificaron las 21 escenas, encaje en cuatro viewports, teclado/rueda/swipe, navegación rápida, fallback de View Transitions, reduced motion completo, CTA/respaldo, iteraciones finitas, estado final visible y hash estable al terminar naturalmente cada secuencia. Sin llamadas a APIs del MVP. Los 21 previews fueron regenerados; 15 resultaron idénticos y seis reflejan cambios de contenido o acentos finales. Revisados visualmente 04, 05, 07, 16, 20 y 21, además de 11/12 durante la auditoría.

Compatibilidad: `#contexto-proceso` permanece en 07; el alias histórico `#proceso-actual` ahora dirige al AS-IS de 14.

Servidor experimental conservado: http://localhost:3000/presentacion y http://localhost:3000/presentacion/mapa.
