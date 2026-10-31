# Presentación académica Formance

Estado actual: **12 escenas habilitadas**. Slides 01–06: Hernán; 07–12: Nahuel. El mapa agrupa 01–06 bajo Apertura (incluye introducción, objetivos y sistema), y 07–12 bajo Elicitación, siguiendo el esquema condensado. El registro habilitado determina el total del contador público.

## Inicio y rutas

Desde `formance-frontend`: `npm ci` y `npm run dev` (`npm.cmd` en PowerShell con scripts restringidos).

- `/presentacion`: exposición.
- `/presentacion/mapa`: mapa de ensayo agrupado por bloques.
- `/presentacion?debug=1#competencia`: metadata sin tiempos.
- Enlaces estables: `#inicio`, `#equipo`, `#problema`, `#vision-objetivos`, `#alcance-limites`, `#no-contempla`, `#contexto-proceso`, `#tic`, `#competencia`, `#stakeholders`, `#modelo-negocio`, `#sintesis-elicitacion`.

La ruta es directa, sin enlace desde el producto ni autenticación. Mapa/debug son herramientas accesibles por URL; no guardan secretos. Toda la zona está marcada noindex/nofollow.

## Navegación exclusivamente manual

- ArrowRight, Space y PageDown: siguiente.
- ArrowLeft y PageUp: anterior.
- Home / End: primera / última escena habilitada.
- Botones: navegación equivalente, sin vuelta circular.
- Rueda/trackpad: abajo avanza, arriba retrocede. Bloqueo tras navegar hasta completar 650 ms de silencio; los eventos de inercia prolongan ese bloqueo. Deltas pequeños se acumulan hasta 24 px.
- Swipe: izquierda/arriba avanza y derecha/abajo retrocede, desde 60 px en el eje dominante. Taps, multitouch y gestos sobre controles no navegan. Se conserva pinch zoom.

No hay temporizador, cuenta regresiva, cronómetro, autoplay o auto-advance. El paso del tiempo nunca cambia de escena. `durationSeconds`, si existe, es metadata interna y no se renderiza en presentación, mapa o debug.

Cada escena ocupa el viewport sin scroll. El mapa sí tiene scroll habitual. Hash, recarga e historial conservan la posición; un hash inválido vuelve a inicio. Los atajos respetan campos editables y controles enfocados.

`Presentar` solicita fullscreen; Escape o un segundo clic salen. Si la API falta o se rechaza, la presentación continúa con un aviso. El botón circular oculta/muestra el progreso. El sistema de motion respeta reduced motion; entrada de escena de 460 ms, contenido de 560 ms y secuencia completa habitual de 1,1–1,7 s.

## Bloques

| Bloque | Escenas | Estado |
| --- | --- | --- |
| 01 — Apertura (incluye introducción, objetivos y sistema) | 01–06 | Implementado |
| 03 — Elicitación | 07–12 | Implementado |

## Modelo y contenido

`src/presentation/slides.tsx` compone el orden; `block-one.tsx` conserva el equipo y contenido del primer tramo; `elicitation.tsx` contiene 07–12; `blocks.ts` centraliza etiquetas y rangos académicos. Los bloques futuros todavía no se muestran en el mapa; su numeración se definirá cuando se autorice su contenido.

Cada entrada tiene ID único y estable, section, title y render. Opcionales: speaker, notes, theme, enabled y durationSeconds. `enabled: false` la excluye de navegación, mapa y contador. Reordenar el registro modifica el recorrido sin cambiar hashes.

```tsx
{
  id: 'identificador-estable',
  section: presentationBlocks[1].title,
  title: 'Título',
  speaker: 'Nahuel',
  notes: ['Idea central.', 'Aclaración.', 'Transición.'],
  theme: 'light',
  enabled: true,
  render: <BigStatement id="identificador-estable">Contenido</BigStatement>,
}
```

Speakers válidos en types.ts: Hernán, Matías, Nahuel y Diego. Las notas no se renderizan y están incluidas en el frontend: no deben contener secretos. Mapa y debug muestran exclusivamente número, ID, sección, título, speaker y theme, con thumbnail en el mapa.

## Sistema visual y componentes

Geist local, crema, ink/dark green, lima suave, bordes y cards del producto. CSS limitado a esta zona; overrides de html/body condicionados a `.presentation`. Se reutilizan las composiciones aprobadas en las fusiones; no hay slides duplicadas ocultas. Elicitación suma un marcador discreto del bloque y diagramas HTML/CSS sin assets comerciales ni dependencias nuevas.

Primitives.tsx reúne Slide, BigStatement, SectionIntro, SplitLayout, MetricCard, ProcessFlow, Comparison, QuoteOrProblem, ArchitectureDiagram, ScreenshotFrame, DemoTransition y DemoFallback. ScreenshotFrame soporta fit/position, browser opcional y callouts/highlights porcentuales. Las primitivas de demo y arquitectura siguen preparadas pero no están montadas en el deck.

Para assets: revisar ASSETS_FOUND.md antes de exportar; colocar nuevos recursos públicos en public y documentarlos. No se copiaron screenshots E4 al contenido público. No se necesitan nuevos assets para Elicitación.

## Validación y previews

```sh
npm test
npm run typecheck
npm run build
npm ci --prefix e2e/e4
node e2e/e4/node_modules/@playwright/test/cli.js test --config=e2e/presentation/playwright.config.cjs
```

La suite reutiliza solo el paquete Playwright de E4, sin sus credenciales, helpers ni pruebas. Necesita Chrome instalado. Inicia un servidor de producción local en 3100; ejecutar build antes y no levantar dev simultáneamente durante la validación. Contexto sin sesión, requests externos bloqueados y ausencia de intentos verificada. No ejecuta APIs del MVP ni la suite E4.

Genera 12 PNG 1920×1080 en docs/presentation/previews, numerados según el orden actual, y comprueba también 1440×900, 1366×768 y 390×844. Valida hashes, orden, bloques, speakers, ausencia de tiempos visibles, viewport, rueda, swipe y control manual. Ver CONTENT_CLEANUP_REPORT.md para la limpieza vigente. REVIEW_AND_ELICITATION_REPORT.md, SETUP_REPORT.md y BLOCK_01_REPORT.md son informes históricos; MOTION_REPORT.md conserva la documentación técnica aprobada.

## Motion reutilizable

`src/presentation/motion.css` centraliza tokens, keyframes, secuencias y reduced motion; se importa después de los estilos de layout. `.p-motion-stagger` aplicado a un contenedor escalona sus hijos a intervalos de 110 ms, desde `--motion-base` (3 por defecto). Las cabeceras y conclusiones de los layouts existentes tienen etapas compartidas; no se escribieron animaciones distintas por slide.

`MotionReveal` permite definir explícitamente `order` (0–8), `variant` (rise/converge/line) y className para contenido futuro. `SectionTransition` prepara chapter, title, subtitle y el isotipo real, con variante lime o brand. No se agregó ninguna section slide al registro. Para un capítulo oscuro, usar metadata `theme: 'dark'`; la variante brand espera un export/color de Figma revisado y actualmente usa lima como fallback.

```tsx
<MotionReveal order={2}>Contenido principal</MotionReveal>
<div className="p-motion-stagger">{/* cards o nodos */}</div>
```

Al entrar se reproduce una secuencia finita, sin clicks internos, loops o autoavance. View Transitions aporta crossfade de snapshots entre cambios manuales cuando está disponible; CSS mantiene la entrada suave cuando la API falta. No se duplica contenido accesible ni se usan timers JS para navegar. Las entradas rápidas descartan snapshots anteriores y conservan el último destino solicitado. Hash/recarga siguen funcionando.

Mapa y reduced motion muestran el contenido completo sin animaciones. SVG y pseudo conexiones también respetan la preferencia. La portada reutiliza el isotipo como una marca de agua muy tenue; no se inventaron fondos purple/blue. Ver ASSETS_NEEDED.md y MOTION_REPORT.md.

## Regla de no repetición

Antes de agregar una nueva slide:

1. Identificar qué idea nueva aporta.
2. Comprobar que no fue explicada anteriormente.
3. Si repite contenido, fusionarla o convertirla en una conclusión nueva.
4. Cada escena debe avanzar la narrativa.

**Preferir menos slides con ideas distintas antes que muchas slides que reformulan el mismo concepto.**

Cada escena debe plantear una pregunta, introducir un concepto, mostrar evidencia, explicar una decisión, comparar alternativas, mostrar una consecuencia, cerrar un bloque o conectar con el siguiente. Un subtítulo del documento académico no justifica por sí solo otra slide. Mantener headline fuerte, poco texto, apoyo visual y explicación oral.

Esta regla rige también para Relevamiento, Diagnóstico, Propuesta, Requerimientos, Arquitectura, Demo y Cierre. Esos bloques no se desarrollan en esta etapa.

La secuencia actual aporta, en orden: identificación del proyecto; equipo; fragmentación; visión y objetivos diferenciados; recorrido y frontera; exclusiones deliberadas; estado actual del usuario; alternativas técnicas; oportunidad competitiva; actores; organización del servicio; criterios de diseño derivados de la elicitación.

Los hashes históricos de escenas fusionadas se normalizan al equivalente actual mediante hash-aliases.ts. Son compatibilidad de enlaces, no escenas adicionales ni entradas del mapa.
