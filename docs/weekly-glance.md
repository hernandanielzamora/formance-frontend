# Reportes: tu semana de un vistazo

`/app/reportes` abre con la lectura que calcula el backend (`report.glance`, ver
`formance-backend/docs/weekly-glance.md`). No hay cálculos de negocio en el cliente.

1. **Titular** con tono (bien / mixto / a revisar) y una línea: qué salió bien y qué ajustar.
2. **Tres tarjetas** con estado: entrenamiento (días planificados hechos, día por día, récords
   de carga), alimentación (promedio contra el objetivo actual, barras diarias con la línea del
   objetivo, proteína) y peso (promedio, diferencia con la semana anterior y mini gráfico).
3. **Lo que hiciste bien / Dónde mejorar** (hasta 3 cada uno, con la acción sugerida).
4. **Foco** de la próxima semana, con enlace a la pantalla donde se actúa.

“Más detalle” agrupa, plegado por defecto: análisis escrito (IA, a pedido y con cupo),
ejercicios con su carga máxima y diferencia, nutrientes frente al objetivo, peso con gráfico,
día por día e historial filtrable. Un solo pie de página aclara que todo se calcula con lo
registrado y que los objetivos son los actuales.

Los estados de cada día se distinguen por forma y texto accesible, no solo por color
(entrenado ✓, salteado ✕, incompleto ½, hoy y futuro con borde punteado).

Validación: `npm test` (componentes reales con datos de muestra), `npm run typecheck`,
`npm run build` y capturas a 390 y 1440 px con la API local en memoria.

## Análisis escrito (v4)

Al pulsar “Generar análisis”, el backend arma el contexto de las **últimas 4 semanas**
(constancia, calorías, proteína y peso por semana), la **evolución de la carga máxima** de los
ejercicios principales y las **notas** de entrenamientos (4 semanas) y comidas (semana
analizada). El panel avisa que esos datos se envían a Google sin nombre ni email. La respuesta
agrega “Últimas 4 semanas” al titular, logros, mejoras, foco y detalle por área.
