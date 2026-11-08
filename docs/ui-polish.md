# Recorrido de UI/UX para la presentación final

Objetivo: que cada pantalla responda primero “¿qué está pasando?” y deje el detalle a un toque,
con la misma estructura en desktop y mobile.

| Pantalla | Cambio |
| --- | --- |
| Mi resumen (`/app`) | Tablero de **hoy** (workout del día, calorías/proteína contra el objetivo, último peso) y **esta semana** (titular, estados y foco de la lectura semanal). Reutiliza las consultas de calendario, diario, peso y reportes, por lo que la navegación posterior usa caché. |
| Navegación mobile | Etiquetas cortas (Inicio, Entrenar, Comidas, Progreso, Admin) sin cortes de palabra; Admin al final. |
| Aviso profesional | Siempre visible en una línea; el texto completo se despliega. |
| Alimentación | Encabezado “Hoy”, totales con barra contra el objetivo (en objetivo / faltan / % sobre), tarjeta de comida con nombre del plato y kcal, acciones compactas; “Extras” solo si tiene registros. |
| Peso | Resumen y gráfico primero, formulario en una fila, historial plegado y en filas compactas; gráfico legible en mobile. |
| Entrenamiento | Encabezado compacto con “Ver mi semana”, plantillas filtradas por el objetivo del perfil por defecto, acciones de edición pequeñas. |
| Calendario | Si el workout ya se registró: estado “✓ Completado”, “Ver registro” primero y el plan plegado. |

Medición (capturas con la historia de demostración, alto total de la página):

| Pantalla | Mobile antes → después | Desktop antes → después |
| --- | --- | --- |
| Mi resumen | 2.192 → 1.704 px | 1.222 → 1.023 px |
| Entrenamiento | 7.201 → 2.604 px | 3.449 → 1.451 px |
| Alimentación | 3.865 → 2.265 px | 2.007 → 1.301 px |
| Peso | 6.530 → 1.726 px | 4.598 → 1.493 px |
| Reportes | 10.339 → 2.815 px | 5.981 → 1.712 px |
