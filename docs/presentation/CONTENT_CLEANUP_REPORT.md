# Limpieza narrativa

## Slides anteriores

16.

## Slides finales

12, sin duplicados ocultos. Orden: inicio, equipo, problema, vision-objetivos, alcance-limites, no-contempla, contexto-proceso, tic, competencia, stakeholders, modelo-negocio, sintesis-elicitacion.

## Fusiones realizadas

- Formance + objetivo del proyecto + objetivo del sistema → visión y objetivos, diferenciando qué construir y para qué sirve al usuario.
- Alcance + límites → recorrido completo y frontera desde configuración inicial hasta resumen semanal e interpretación asistida.
- Contexto + proceso actual → actor, escenario simulado y herramientas separadas hasta la comparación manual.

Se conservaron los conceptos académicos en contenido visual y notas breves. Portada, equipo, problema, exclusiones, TIC, competencia y stakeholders mantienen sus composiciones. El modelo organizacional se enfoca en las áreas del servicio.

## Síntesis modificada

Ahora presenta tres criterios: centralización, simplicidad e integración controlada. Cierra con Base para el diagnóstico, sin volver a definir el problema ni desarrollar ese bloque.

README establece la regla de no repetición para todas las escenas futuras. Mapa: 01–06 bajo Apertura y 07–12 bajo Elicitación, según el esquema condensado solicitado. Speakers: Hernán y Nahuel, respectivamente. Los siete hashes antiguos se normalizan al equivalente nuevo sin agregar slides.

El motion y MOTION_REPORT.md permanecen intactos; las fusiones reutilizan clases y secuencias existentes. Se adaptaron solamente layouts de contenido y tiempos relativos del stagger mediante la variable ya disponible.

## Tests

15/15 aprobados. Sin suite E4, consumo de APIs externas ni cambios adicionales al MVP.

## Typecheck

Aprobado.

## Build

Aprobado.

## Playwright

13/13 aprobados: 12 escenas, orden, mapa, speakers, debug sin tiempos, hashes nuevos y compatibilidad, Home/End, rueda, teclado, swipe, motion, reduced motion y ausencia de autoavance. Contenido completo en 1920×1080, 1440×900, 1366×768 y 390×844; se ajustaron espacios de la síntesis en móvil.

Se generaron y revisaron individualmente los 12 PNG definitivos; previews obsoletos eliminados, screenshots E4 intactos. No se agregaron bloques futuros ni se hizo commit/merge/push.

## Revisión local

Servidor dev conservado en puerto 3000:

- http://localhost:3000/presentacion
- http://localhost:3000/presentacion/mapa

Comando equivalente: `npm.cmd run dev -- --hostname 127.0.0.1 --port 3000`.
