# Defensa de producto · Formance

Rama: `feature/marketing-defense`. Checkpoint aprobado: `24b819f` en `dev`, con árbol limpio antes de empezar. No fue necesario otro commit de checkpoint. El registro original de 21 slides se conserva completo en `src/presentation/academic-deck.tsx`; sus 21 previews están en `previews-academic/`.

Antes: 21 slides en siete bloques, con objetivos, alcance, elicitación, organización, diagnóstico, requisitos, tecnologías y demo. Ahora: nueve slides de producto; el contenido académico queda fuera del recorrido principal.

| # | ID / contenido | Expositor |
| --- | --- | --- |
| 01 | `inicio` · Formance | Hernán |
| 02 | `equipo` · Cuatro personas, un proyecto | Hernán |
| 03 | `problema` · Muchos datos, poca integración | Hernán |
| 04 | `mercado` · Herramientas y oportunidad | Nahuel |
| 05 | `posicionamiento` · Acompaña, no reemplaza profesionales | Nahuel |
| 06 | `propuesta` · Un solo recorrido | Diego |
| 07 | `experiencia` · Tres pilares y reglas de uso | Matías |
| 08 | `demo` · Producto real y CTA | Matías → Hernán |
| 09 | `cierre` · Objetivo logrado y preguntas | Hernán |

Introducción estimada: siete minutos. Demo de Hernán: ocho a diez minutos fuera del deck; cierre de dos minutos y preguntas para rondar veinte. Las notes, disponibles en el mapa, incluyen los pases orales y los recorridos de usuario nuevo, cuenta preparada, entrenamiento, alimentación, fotografía, progreso y Balance semanal actual. Sin temporizadores ni avance automático.

`/presentacion/backup` reúne seis temas: stack actual, arquitectura, requerimientos funcionales, casos de uso, RNF y AS-IS / diagnóstico. `/presentacion/mapa` los separa del recorrido 01–09. Se conservan branding, tipografía, componentes, controles, teclado, rueda, swipe, fullscreen, View Transitions y Motion 5; solo cambian composiciones, contenido y secuencias de entrada. Los hashes anteriores resuelven a sus equivalentes de producto.

Las nueve previews nuevas están en `docs/presentation/previews/`, con los nombres 01-cover a 09-closing pedidos. La transición y la galería reutilizan cinco capturas reales existentes; corresponden a una versión anterior, por lo que la captura histórica de reportes no muestra el rediseño reciente del Balance semanal. Esta diferencia está aclarada en notes. No se fabricaron capturas ni se consumieron APIs para actualizarlas.

Validación: `npm test` (21/21), `npm run typecheck`, `npm run build` y Playwright de presentación (16/16). Se verificaron orden, speakers, contador, hashes, CTA y cinco respaldos, mapa y backup, fullscreen y errores recuperables, teclado/historial, rueda/inercia, swipe, reduced motion, secuencias finitas y navegación rápida. Encaje de las nueve escenas a 1920×1080, 1440×900, 1366×768 y 390×844. Las pruebas bloquean APIs y solicitudes externas; no se ejecutó el smoke de producción.

Servidor local de producción conservado en el puerto 3100:

- Presentación: http://localhost:3100/presentacion
- Mapa y notes: http://localhost:3100/presentacion/mapa
- Backup: http://localhost:3100/presentacion/backup

Para repetir Playwright con este servidor activo en PowerShell: `$env:PRESENTATION_REUSE_SERVER='1'` y `node e2e/e4/node_modules/@playwright/test/cli.js test --config=e2e/presentation/playwright.config.cjs`. Sin esa variable, el runner inicia su propio servidor de prueba.
