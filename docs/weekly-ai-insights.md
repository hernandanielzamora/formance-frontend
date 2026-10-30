# Lectura semanal ampliada

Rama `feature/weekly-ai-insights`. La sección de Reportes conserva botón manual,
carga/error/cuota, resumen, tendencias, puntos de revisión y disclaimer. Agrega:

1. Comparación con la semana anterior.
2. Tarjetas de Entrenamiento, Alimentación y Peso y evolución.
3. Foco para la próxima semana: hasta tres acciones de seguimiento/revisión.

Los datos siguen viniendo del backend autenticado. El modelo interpreta métricas
calculadas, no las recalcula. El bloque de comparación identifica explícitamente
que su texto/cifras se calculan por Formance, para evitar errores de redacción numérica
del modelo. La UI aclara que se comparan días equivalentes y que
una nueva generación usa cupo; leer el análisis guardado no gasta otra generación.

Los campos nuevos son opcionales en el cliente para tolerar una API v1 durante
despliegue escalonado. No se muestran encabezados vacíos si llega el formato anterior.
La nueva API v2 los exige y valida. Texto renderizado por React, sin HTML del modelo.
Las tres tarjetas se apilan en pantallas menores de 1000 px; el texto largo puede
ocupar varias pantallas y no se recorta para ajustarlo a las capturas históricas E4.

Se mantienen claves, endpoint y cuotas. El cambio de contrato/objetivo/datos cambia
la huella servidor; por eso el primer análisis de v2 necesita una nueva generación
manual dentro del cupo ya existente. No se limpian ni resetean cuotas.

Las pruebas de componente cubren todos los bloques, caché/errores y compatibilidad
con el formato anterior; no generan llamadas externas reales.

La figura E4 histórica conserva su recibo v1: el caso 05 de esa suite se omite si
el recibo no corresponde a v2, antes de consumir una generación. No se sobreescriben
las PNG oficiales para adaptar un texto más largo al encuadre anterior.
Validación real explícita, una generación máxima y luego caché, desde el frontend:
`node e2e/e4/verify-insights.cjs`. Requiere sesión real local y cupo semanal disponible;
no se incluye en `npm test`. Su recibo/resultado/preview quedan privados en `.auth`,
y la evidencia sin identidad se escribe en `docs/weekly-insights-verification.json`.

Verificación de la rama: 15 pruebas frontend aprobadas, typecheck y build correctos.
Se comprobó la respuesta real y todos los bloques en navegador, caché después de
recarga y comparación numérica coincidente con el reporte. La validación usa solo
una nueva generación semanal; no genera fotos ni reinicia cupos.
