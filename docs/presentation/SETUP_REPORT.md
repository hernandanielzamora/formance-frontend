> Documento histórico. La organización y política vigentes se describen en [REVIEW_AND_ELICITATION_REPORT.md](REVIEW_AND_ELICITATION_REPORT.md): 16 escenas, bloques académicos y ningún tiempo visible en mapa/debug.

# Informe de setup — Presentación final

> Informe histórico de la infraestructura inicial. Estado actual: nueve escenas, todas a cargo de Hernán, total 4:15. Ver [BLOCK_01_REPORT.md](BLOCK_01_REPORT.md) para la continuación académica y sus validaciones.

## Branch

`feature/final-presentation`, creada desde `dev` en `35b3b57` (Merge enhanced weekly AI insights into dev). La base incluye la verificación E4 de `d5687d6` y los últimos insights. Se revisaron status, ramas e historial antes de cambiar archivos; árbol inicial limpio. No se modificaron las referencias de main/dev ni se hizo merge, commit o push.

## Arquitectura

App Router: layout propio `/presentacion` y `/presentacion/mapa`. Modelo tipado y datos separados del shell, con primitivas reutilizables. Única adaptación compartida: el layout raíz delega sus mismos providers y controles a ProductProviders, que omite su montaje exclusivamente en `/presentacion` y descendientes. Así no se monta autenticación, Redux, conexión al backend o dashboard en esta zona. Las demás rutas conservan la misma composición de providers. No se modificaron servicios ni funcionalidades del MVP.

## Archivos agregados

- `src/app/presentacion/layout.tsx`, `page.tsx`, `mapa/page.tsx`.
- `src/components/presentation/ProductProviders.tsx`, `PresentationShell.tsx`, `Primitives.tsx`.
- `src/presentation/types.ts`, `slides.tsx`, `presentation.css`.
- `e2e/presentation/playwright.config.cjs`, `presentation.spec.cjs`.
- `docs/presentation/README.md`, `ASSETS_FOUND.md`, `ASSETS_NEEDED.md`, `SETUP_REPORT.md` y tres PNG en `previews/`.

Archivo compartido modificado: `src/app/layout.tsx`. Sin cambios en package.json, lockfiles ni .env.local.

## Componentes

PresentationShell, Slide, SectionIntro, BigStatement, SplitLayout, MetricCard, ProcessFlow, Comparison, ScreenshotFrame (browser opcional, crop, object-position y callouts/highlights), QuoteOrProblem, ArchitectureDiagram, PresentationControls, ProgressIndicator, DemoTransition y DemoFallback. Las primitivas de demo y arquitectura quedan disponibles sin montar nuevas slides ni contenido definitivo.

## Navegación

Controles discretos, atajos solicitados, límites sin wrap y foco visible. Los atajos respetan campos editables, enlaces y botones enfocados. Progreso ocultable. Las escenas no usan scroll; el mapa sí permite desplazamiento como herramienta de ensayo.

## Fullscreen

Solicitud explícita desde Presentar. Escape y un segundo clic permiten salir. API ausente o rechazada muestra aviso sin impedir navegación. La ruta ocupa el viewport incluso sin fullscreen.

## Hash/deep links

IDs estables: inicio, problema, formance. Historial con pushState, sincronización hashchange/popstate, recarga y URL directa. Hash inválido vuelve a inicio. Los IDs futuros, incluido cierre, aún no existen.

## Debug

`?debug=1` muestra ID, sección, speaker, duración, número, acumulado y total. El mapa muestra esa metadata y thumbnails del contenido. Las notas no se renderizan. Mapa y debug son herramientas accesibles por URL, no áreas con control de acceso; metadata robots noindex/nofollow en toda esta zona.

## Sistema visual

Geist local, fondo crema, ink, lima suave, cards y bordes del producto. Portada oscura con marca original. Transición uniforme de 280 ms con reduced motion. Safe area con clamp; composición validada en escritorio y móvil. Diagramas conceptuales, sin datos de usuario ni métricas inventadas.

## Tokens

Aliases locales presentation-bg, surface, ink, muted, accent, border y dark-bg referencian los tokens existentes. Overrides oscuros locales para contraste; colores secundarios de diagramas alineados con los del producto. CSS aislado, salvo reglas de html/body condicionadas a la presencia de `.presentation` para evitar scroll y gutter.

## Assets encontrados

Tres SVG originales de marca, cuatro imágenes del producto, cinco capturas E4, fuente Geist e iconografía existente. Inventario individual en ASSETS_FOUND.md. Marca blanca y oscura utilizadas; isotipo real en portada con filtro monocromo. No se recreó ningún logo ni se publicaron capturas E4.

## Assets faltantes

Ninguno bloquea estas tres escenas. ASSETS_NEEDED.md documenta el estado. Figma no fue consultado porque no se suministró enlace; no se inventaron exports, fondos o mockups.

## Slides creadas

1. `inicio`: portada dark con título, subtítulo y datos académicos solicitados (35 s).
2. `problema`: Muchos datos. Poca integración. (40 s).
3. `formance`: Una misma persona. Una sola visión de su progreso. (40 s).

Total preliminar: 1:55. Hernán, Matías y Nahuel asignados como metadata provisional; Diego está preparado en el modelo. Objetivo futuro: 18–20 minutos incluyendo demo. No se creó contenido académico adicional ni se modificaron decisiones E1–E4.

## Screenshots

`previews/01-cover.png`, `02-problem.png`, `03-formance.png`: PNG 1920×1080, capturados desde producción y revisados individualmente. Sin indicador de desarrollo de Next.js. Se verificó que las tres escenas no desborden en 1920×1080, 1440×900, 1366×768 y 390×844.

## Tests

`npm.cmd test`: 15/15 aprobados. Suite de presentación Playwright: 2/2 aprobados; cubre rutas, controles, atajos, recarga, deep links, historial, hash inválido, mapa, progreso, metadata y fallback fullscreen. Bloquea requests externos y verifica que no se intenten: sin Gemini, USDA, Firebase o backend. Reutiliza únicamente los paquetes Playwright declarados en e2e/e4; no ejecuta su suite ni carga credenciales. Chrome instalado. En este entorno Windows fue necesario ejecutar el navegador fuera del sandbox para que sus procesos terminen correctamente.

## Typecheck

`npm.cmd run typecheck`: aprobado.

## Build

`npm.cmd run build`: aprobado; incluye las dos rutas nuevas como páginas estáticas. Inicialmente faltaban dependencias locales Redux y Playwright; se restauraron las ya declaradas, sin dependencias nuevas ni cambios al lockfile.

## Decisiones pendientes

Aprobación visual de las tres escenas, speakers y tiempos definitivos; contenido posterior sección por sección; selección de capturas para demo y fallback; posible export de Figma. El enlace de regreso a cierre está preparado en DemoTransition pero su destino se implementará cuando se autorice esa slide. La entrada y salida real de fullscreen depende del navegador/proyector; los fallbacks se verifican automáticamente.
