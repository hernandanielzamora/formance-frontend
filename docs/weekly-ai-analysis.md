# Reportes: análisis semanal manual

La [lectura ampliada v2](weekly-ai-insights.md) agrega comparación, tres áreas y
foco de seguimiento a los bloques originales descritos en este documento.

`/app/reportes` incluye `components/reports/WeeklyAnalysis.tsx` separado de métricas
y del historial. La generación solo se inicia al pulsar “Analizar semana con IA”.
Muestra estado inicial, carga, error, límite y resultado con Resumen, Tendencias y
Aspectos a revisar, junto al disclaimer informativo solicitado.

POST `reports/weekly-analysis` usa el cliente API autenticado existente, con
`weekStart` y `timeZone`. No envía identidad en body ni el reporte calculado en el
navegador: el backend lo reconstruye desde los registros propios. No repite la
operación automáticamente. Tiempo máximo de solicitud: 60 segundos después del
control de disponibilidad compartido del backend.

La sección se remonta por cuenta, semana, zona y contenido del reporte. Si cambia
la información recargada, descarta resultado/error local; una respuesta pendiente
del componente anterior no aparece en el nuevo. Las mutaciones existentes de
comida, entrenamiento y peso ya invalidan Reports mediante RTK Query. La sección
se deshabilita mientras se refresca el reporte o si la consulta falló, para evitar
analizar desde una vista pendiente de actualizar.

Recargar la página muestra nuevamente el botón; pulsarlo consulta el endpoint y
recupera caché persistida sin otra generación si los datos relevantes no cambiaron.
No hay llamada automática ni una segunda API de consulta. Un cambio solo en notas
puede descartar la vista local, pero la caché servidor conserva el resultado porque
las notas no se envían al modelo.

Los errores de IA no cambian los datos ni el estado de la consulta del reporte.
Se renderiza texto mediante React, sin HTML generado por IA ni Markdown interpretado.

`test/weekly-analysis.test.cjs` ejecuta el componente real y su callback con un
controlador de hooks y render estático React; comprueba estados, petición, bloques,
errores, cuotas, caché y composición de la pantalla real. Sigue el enfoque VM de
las pruebas existentes y no agrega dependencias. No sustituye una prueba de
interacción en navegador con Firebase/Gemini reales. Backend y frontend mantienen
tests independientes; no requieren importar código del otro repositorio.
