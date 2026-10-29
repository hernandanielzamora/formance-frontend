# Capturas oficiales para la Entrega 4

Fecha de preparación: 29/10/2026. Semana fija: **05/10/2026–11/10/2026**;
comparación: 28/09/2026–04/10/2026. Peso: rango 28/09/2026–11/10/2026.

Son pantallas reales del frontend local conectado a Express y Firebase reales.
La identidad se autenticó por la UI con Google; no se simularon Auth, Firestore,
respuestas HTTP ni resultados de Gemini. Las actividades/consumos/mediciones de demo
son ficticios identificados en notas y/o `demoData`. El perfil y las referencias
existentes se conservaron; no se afirma que un usuario haya realizado esas actividades.
El nombre y correo de la cuenta se ocultan en la figura 1 mediante etiquetas explícitas
de redacción. No se incluyen UID, tokens ni credenciales en las imágenes.

## Figura 1 — Perfil y objetivo del usuario

Archivo: [01-perfil-objetivo.png](screenshots/01-perfil-objetivo.png). Ruta `/app`.
Se muestran objetivo físico, referencias iniciales, calorías y macronutrientes
persistidos. La consulta del perfil no equivale a edición posterior del onboarding.

**Pie recomendado:** Figura 1. Consulta del perfil, objetivo físico y referencias
nutricionales del usuario, con identidad oculta para la presentación. Pantalla real
de Formance utilizada en el caso de demostración funcional. Elaboración propia.

## Figura 2 — Planificación y registro del entrenamiento

Archivo: [02-entrenamiento.png](screenshots/02-entrenamiento.png).
Ruta `/app/entrenamiento/calendario`, vista SessionRecorder de una sesión guardada
del lunes 5 de octubre. Se ven prescripción y cuatro ejercicios con sus series,
repeticiones y cargas. Es un registro simulado persistido, no una sesión inventada
en el navegador. El calendario completo no está desplegado en esta captura.

**Pie recomendado:** Figura 2. Consulta del plan y registro de una sesión de
entrenamiento mediante series, repeticiones y carga. Pantalla real de Formance
con datos simulados para demostración funcional. Elaboración propia.

## Figura 3 — Registro alimentario con asistencia de IA

Archivo: [03-alimentacion-ia.png](screenshots/03-alimentacion-ia.png).
Ruta `/app/alimentacion`, fecha 05/10/2026. Totales y metas del día; comidas manuales
simuladas y una comida en Extras con origen **Estimación IA**. Esta última proviene
de una generación real de Gemini sobre una fotografía real de referencia; se revisó
la propuesta y se corrigió la cantidad del primer alimento antes de guardar.

**Pie recomendado:** Figura 3. Registro alimentario con cálculo de calorías y
macronutrientes y asistencia mediante inteligencia artificial. Pantalla real de
Formance con registros de demostración y una estimación real por fotografía,
sin representar consumo real. Elaboración propia.

La fotografía utilizada fue descargada para la prueba desde
[Unsplash](https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1000&q=85).
Se guarda como entrada privada en `.auth/inputs/meal.jpg`, no como archivo público
ni fotografía atribuida al usuario. No se usó una ilustración o una imagen generada.

## Figura 4 — Evolución corporal

Archivo: [04-peso-progreso.png](screenshots/04-peso-progreso.png). Ruta `/app/peso`.
Ocho fechas medidas en el rango, última referencia, promedio, variación, gráfico
y las dos mediciones más recientes del historial. Las oscilaciones son ficticias;
no demuestran pérdida de grasa ni resultado clínico.

**Pie recomendado:** Figura 4. Seguimiento de peso corporal mediante indicadores,
gráfico de evolución e historial de mediciones. Pantalla real de Formance con
datos simulados para demostración funcional. Elaboración propia.

## Figura 5 — Reporte semanal integrado y análisis con IA

Archivo: [05-reporte-ia.png](screenshots/05-reporte-ia.png). Ruta `/app/reportes`.
Muestra semana/comparación, indicadores de entrenamiento, alimentación y peso,
junto con Resumen, Tendencias, Aspectos a revisar y disclaimer. La interpretación
fue generada realmente por Gemini y esta captura la recupera de Firestore mediante
`cached: true`; no usa texto agregado para la imagen. Los valores del reporte son
calculados por el backend, no por el modelo.

**Pie recomendado:** Figura 5. Resumen semanal integrado y análisis asistido por
inteligencia artificial a partir de los registros del usuario. Pantalla real de
Formance con datos simulados para demostración funcional y una interpretación
real de Gemini recuperada de caché. Elaboración propia.

## Mapeo académico

No se recuperó la especificación de la Entrega 3 en el workspace. Las búsquedas
de Formance, Seminario y Entrega 3 en Google Drive tampoco identificaron ese documento.
Se conserva `PENDIENTE DE MAPEO` en vez de reutilizar los IDs propuestos en la auditoría.

| Figura | Funcionalidad | RF | Caso de uso | Problema que demuestra resolver |
|---|---|---|---|---|
| 1 | Consulta de perfil, objetivo y referencias | PENDIENTE DE MAPEO | PENDIENTE DE MAPEO | Centralizar el punto de partida y objetivo |
| 2 | Plan y registro de entrenamiento | PENDIENTE DE MAPEO | PENDIENTE DE MAPEO | Diferenciar lo planificado de lo registrado y conservar series/cargas |
| 3 | Diario nutricional y fotografía con IA | PENDIENTE DE MAPEO | PENDIENTE DE MAPEO | Facilitar un registro revisable con porciones y nutrientes |
| 4 | Peso e historial | PENDIENTE DE MAPEO | PENDIENTE DE MAPEO | Consultar mediciones y cambios en el tiempo |
| 5 | Resumen integrado e interpretación semanal | PENDIENTE DE MAPEO | PENDIENTE DE MAPEO | Reunir entrenamiento, alimentación y peso para interpretar registros disponibles |

## Composición y revisión visual

Las cinco imágenes son PNG **1440×1000**, escala 1, tema light, locale es-AR.
Playwright espera sesión/datos/fuentes y falla ante errores, contenido ausente,
semanas distintas o cambios en el reporte antes de consultar la IA.

`e2e/e4/composition.css` ajusta únicamente la composición de captura: espacios,
columnas, tipografía, SessionRecorder en dos columnas, diario en cinco grupos con
Extras ampliado, gráfico compacto y métricas/IA lado a lado. No modifica la app
de producción, valores, notas ni texto generado. El reporte omite el encabezado
redundante y tabs en esta vista; las tablas detalladas permanecen fuera del encuadre.
En peso se muestran las dos entradas más recientes para evitar cortar la fila
siguiente; el gráfico conserva las ocho fechas. En perfil se omite el aviso global
fuera del foco de la captura. El disclaimer específico de IA permanece completo.

Se revisaron los PNG individualmente con visualización local. No tienen loaders,
errores, herramientas de desarrollo, credenciales ni identidad de contacto visible.
La preparación consumió **1 generación real de foto + 1 semanal**; regenerar las
capturas usa el resultado semanal cacheado y no consume generaciones adicionales.

## Reproducir las cinco capturas

Con frontend/backend locales iniciados y la sesión `.auth/e4.json` vigente, desde
`formance-frontend`:

```powershell
npm.cmd --prefix e2e/e4 ci
npm.cmd --prefix e2e/e4 test
```

Configuración privada opcional: `.env.e4.local`, usando
`e2e/e4/settings.example.env` como referencia. Semana explícita:

```dotenv
E4_DEMO_WEEK_START=2026-10-05
E4_BASE_URL=http://localhost:3000
```

La suite no crea registros ni analiza nuevas fotos. Exige un recibo privado de
preparación real `.auth/e4-receipt.json`, verifica la huella del reporte y exige
`cached: true` al pulsar analizar. Si cambia el dataset, se detiene; no se debe
regenerar IA para obtener una captura distinta sin revisar el presupuesto.

### Autenticación

Correo/contraseña demo, si la cuenta tiene ese proveedor:

```powershell
# E4_DEMO_EMAIL y E4_DEMO_PASSWORD en .env.e4.local; nunca en Git ni en comandos públicos.
npm.cmd --prefix e2e/e4 run login
```

Para Google se utilizó Chrome normal con perfil separado `.auth/chrome` y depuración
local en el puerto 9222. Abrir explícitamente esa ventana, completar la UI de Google
y ejecutar `login.cjs` con `E4_CDP_URL=http://localhost:9222` guarda `storageState`
incluyendo IndexedDB, necesario para Firebase Auth. Esta conexión reutiliza una
sesión real, sin custom tokens ni bypass de autenticación. No compartir el perfil,
storageState, inspección o recibo privados. `.auth/` está excluido de Git.

### Preparación inicial, no ejecutar para recapturar

`inspect.cjs` lee datos reales sin imprimir identidad. Backend `scripts/e4-seed-demo.js`
usa esa identidad privada para un dry-run del generador existente y solo carga datos
ausentes con `--apply`, conservando perfil/registros y marca simulada. `prepare.cjs`
realiza el flujo de escrituras y las dos generaciones autorizadas. **No volver a
ejecutarlo como prueba rutinaria**: la suite de captura es la operación reutilizable.
`scripts/e4-verify-demo.js` comprueba documentos/contadores reales sin generar IA.

## Nota técnica para E4

La solución fue inicialmente evaluada como aplicación móvil con React Native + Expo.
Durante la implementación del prototipo se reutilizó y adaptó una base web responsive
existente desarrollada con Next.js/React, manteniendo la arquitectura cliente-servidor,
backend, persistencia e integraciones definidas.

Prototipo verificado: Next.js/React/TypeScript → Node.js/Express → Firebase
Authentication + Firestore; USDA y Gemini invocados por el backend. Esta nota aclara
el prototipo de E4 y no modifica retrospectivamente los documentos académicos previos.
