# Balance semanal

Reemplaza la presentación inicial del análisis semanal por tres tarjetas de entrenamiento, alimentación y peso. Las tarjetas no comparan semanas. Sus métricas, gráficos y señales se derivan del reporte existente, sin llamadas a proveedores ni consumo de cupo.

Cada gráfico muestra los siete días de la semana, distingue cero, falta de registro y días futuros, e incluye valores y una descripción accesible. Las calorías son valores registrados, no ingesta total garantizada; los promedios usan días con datos para cada nutriente. Las barras de peso parten de cero y no interpolan mediciones.

“Para revisar” prioriza sesiones interrumpidas, series con repeticiones/carga desconocidas y nutrientes incompletos o estimados por foto. Las mediciones escasas, fechas aproximadas y áreas sin registros se presentan como información insuficiente. No se califican dieta, adherencia o cambios corporales sin evidencia. El próximo paso enlaza al área correspondiente; los puntos adicionales permanecen en el desplegable.

“Ver detalle del balance” usa el mismo endpoint, caché y cupos al pulsar “Consultar detalle”. Abrir el desplegable no hace solicitudes. Se conservan resultados v1/v2; la comparación textual no se muestra. El nuevo prompt pide textos más breves, pero los análisis ya guardados se reutilizan sin invalidar su huella ni gastar otra generación: pueden conservar su extensión anterior dentro del detalle.

Se retiraron las etiquetas IA de los flujos de reportes, comidas y aviso profesional, así como de los errores del análisis semanal. Se conserva el consentimiento para enviar fotos a Google y las aclaraciones sobre estimaciones. La presentación académica y los identificadores internos conservan sus referencias técnicas.

## Validación

- `npm test`: 18 pruebas, incluidos estados de error/cupo, caché, semanas vacías, ceros y fechas futuras, señales y mediciones insuficientes.
- `npm run typecheck` y `npm run build`.
- `node e2e/weekly-balance/verify.cjs`: componente real con el CSS de la app en Chrome, a 320, 390, 768, 1024 y 1440 px; comprueba desbordes y apertura del detalle por teclado. Capturas en `.auth/weekly-balance/` (ignoradas por Git).
- Backend: 48 pruebas sin llamadas reales al proveedor.

La verificación visual es aislada con datos de muestra; no inicia sesión ni consulta servicios externos.
