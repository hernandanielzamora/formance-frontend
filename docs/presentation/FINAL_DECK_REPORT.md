# Deck final — 21 escenas

Branch: `feature/final-presentation`. Sin merge, commit ni push.

| Bloque | Slides | Expositor |
| --- | --- | --- |
| 01 Apertura | 01–02 | Hernán |
| 02 Introducción · Objetivos · Sistema | 03–06 | Hernán |
| 03 Elicitación | 07–12 | Nahuel |
| 04 Relevamiento y diagnóstico | 13–15 | Diego |
| 05 Propuesta y requerimientos | 16–19 | Matías |
| 06 Implementación y demo | 20 | Hernán |
| 07 Cierre | 21 | Hernán |

01–12 conservan renders, contenido, orden y motion aprobado; se ajustó solamente su agrupación académica y el total del contador. Se agregaron: relevamiento funcional entre áreas, AS-IS formalizado, diagnóstico causal, TO-BE, reglas de comportamiento, seis grupos RF01–RF19, RNF/modelado CU01–CU11, implementación/demo y cierre. RF/CU siguen los rangos suministrados; la especificación E3 completa no estaba disponible localmente y no se inventaron identificadores ni umbrales.

Slide 20 refleja el repositorio: Next.js/React/TypeScript → Node.js/Express → Cloud Firestore y servicios USDA/Gemini. Firebase Authentication usa el SDK desde la interfaz; el backend valida identidad. La interfaz no consulta Firestore ni los proveedores directamente. Se conserva el diseño cliente–servidor en el prototipo web responsive.

CTA manual `/app` en pestaña nueva. Respaldo mediante diálogo con cuatro capturas E4 originales de registros demo, sin recapturas ni llamadas externas; excluido el perfil con referencias de cuenta real. Cierre con Escape y devolución del foco. Notas privadas incluyen cuenta nueva verificada, recorrido demo y reutilización de resultados IA persistidos. El diálogo bloquea la navegación del deck desde sus interacciones. Las miniaturas del mapa son inertes y tienen un enlace superpuesto para evitar enlaces anidados.

Navegación exclusivamente manual: teclado, controles, rueda con bloqueo de 650 ms de inactividad y swipe. `durationSeconds` permanece como metadata interna; no hay temporizador ni autoavance. Los tiempos y notas no se muestran en la presentación, mapa ni debug, conforme a la revisión vigente. No se modificó funcionalidad del MVP, backend ni configuración de entorno.

Validación:
- `npm.cmd test`: 15/15.
- `npm.cmd run typecheck`: correcto.
- `npm.cmd run build`: correcto.
- Playwright aislado de presentación: 14/14. Incluye las 21 escenas, siete bloques, expositores, hashes/recargas, navegación, motion/reduced motion, ausencia de tiempos/autoavance, CTA y respaldo. Destino `/app` interceptado únicamente durante el test para no ejecutar servicios reales.
- Encaje sin scroll ni recortes de texto en 1920×1080, 1440×900, 1366×768 y 390×844.
- 21 previews generados; nueve nuevos inspeccionados individualmente. Motion global conservado.

Assets Figma purple/blue y mockup no disponibles como exports revisados. Solicitudes concretas en `ASSETS_NEEDED.md`; no bloquean el deck.

Servidor de desarrollo conservado en puerto 3000. Presentación y mapa responden HTTP 200:
- http://localhost:3000/presentacion
- http://localhost:3000/presentacion/mapa
- http://localhost:3000/presentacion#implementacion-demo
- http://localhost:3000/presentacion#cierre
