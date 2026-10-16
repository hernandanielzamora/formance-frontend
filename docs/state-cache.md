# Estado y caché de la aplicación

La migración se divide en cinco pasos, aplicados en este cambio:

1. Redux Toolkit y RTK Query, proveedor por cuenta y consultas compartidas de perfil, catálogo y rutinas.
2. Calendario, diario, capacidades de alimentación, peso y reportes con consultas parametrizadas.
3. Mutaciones con invalidación de las consultas afectadas, conservando las validaciones y versiones del backend.
4. Pruebas de deduplicación, navegación, invalidación, aislamiento y cambios de sesión durante peticiones.
5. Menos lecturas de colecciones al listar rutinas y validar ejercicios, workouts y rutinas en el backend.

## Ubicación del estado

- `src/lib/store/api.ts`: transporte, etiquetas y política de actualización.
- `src/lib/store/hooks.ts`: consultas, validación del onboarding y mutaciones para las pantallas.
- `src/lib/store/provider.tsx`: instancia de Redux por cuenta/rol, sin singleton del servidor.
- Firebase Auth mantiene la sesión. No guardamos objetos de Firebase ni tokens en Redux.
- Formularios, filtros, pestañas y registros todavía sin guardar siguen en estado local.
- Las fotos, sus análisis y la búsqueda de alimentos siguen siendo acciones explícitas; no se repiten por navegación, foco ni reconexión.

## Reutilización y actualización

Cada consulta se identifica por UID, rol y ruta completa: las fechas, rangos y zonas horarias forman parte de esa ruta. Los componentes con la misma consulta comparten respuesta y petición en curso. Usamos `currentData` para evitar presentar la fecha anterior mientras cambia el parámetro.

Se conserva la respuesta en memoria hasta diez minutos después de quedar sin suscriptores. Esto es retención, no un plazo de frescura: al montar una pantalla o recuperar el foco, se revalida si la respuesta tiene más de cinco minutos para perfil/biblioteca/capacidades, o más de un minuto para registros/reportes. Al reconectar se revalidan las consultas suscriptas. No hay polling periódico. Recargar el navegador inicia una caché vacía.

Las mutaciones actualizan estos grupos:

| Cambio | Consultas invalidadas |
| --- | --- |
| Onboarding | Perfil, catálogo/recomendaciones, diario/objetivos, peso inicial, reportes |
| Ejercicio, workout o rutina | Catálogo, rutinas, calendario |
| Rutina activa | Rutinas, calendario |
| Sesión o series | Calendario, reportes |
| Comida | Diario, reportes |
| Peso | Historial de peso, reportes |

La invalidación también reconcilia errores de escritura, porque una respuesta perdida puede corresponder a un guardado completado. Nunca reintentamos automáticamente una mutación. Se mantienen los errores 409 para resolver conflictos de versión desde el editor.

Al cambiar de cuenta o permisos se crea otro store. Al desmontarlo se cancelan solicitudes pendientes y se vacían consultas/mutaciones. El transporte verifica que el usuario no cambió mientras se despertaba el backend o se obtenía el token, antes de enviar la operación.

La caché vive sólo en memoria; no persistimos datos privados en localStorage. Los permisos se siguen comprobando en el servidor y las respuestas HTTP conservan `no-store`.

## Consultas de entrenamiento en el backend

`GET /training/catalog` sigue necesitando ejercicios, workouts y plantillas. `GET /training/routines` ya leía solamente rutinas antes de esta migración; ahora además filtra rutinas privadas en Firestore, por propietario para usuarios y todas las privadas para administradores. Si hay una plantilla pública activa se consulta sólo ese documento para conservar el contrato del endpoint.

Crear o editar ejercicios no lee colecciones. Validar workouts consulta sólo ejercicios; validar rutinas consulta workouts y ejercicios, sin volver a cargar la colección de rutinas. No agregamos cachés globales que puedan mezclar permisos entre usuarios.

## Validación

Ejecutar `npm test` y `npm run build` en frontend, y `npm test` en backend. Los tests de caché cuentan peticiones; los del backend inspeccionan las colecciones consultadas y verifican propiedad, administración, archivado y rutinas públicas activas. El ahorro real en documentos facturados depende del tamaño de las colecciones y del uso; no se infiere un porcentaje fijo a partir de estos tests.

En la prueba de navegador con build de producción y API simulada se recorrieron resumen, biblioteca, calendario, alimentación, reportes y peso, volviendo a pantallas ya visitadas. Perfil, catálogo y rutinas tuvieron una sola solicitud cada uno durante esa navegación. También se comprobó el retorno a un día del diario ya consultado, la invalidación tras guardar comida/peso/series, el refresco al recuperar el foco con datos antiguos y el bloqueo de vistas privadas después del logout. Estas pruebas no escribieron en Firebase ni consumieron Gemini.

Referencia: [caché de RTK Query](https://redux.js.org/toolkit/rtk-query/usage/cache-behavior) y [integración con Next.js](https://redux.js.org/usage/nextjs).
