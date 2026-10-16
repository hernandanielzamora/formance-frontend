# Auditoría responsive — 16 de octubre de 2026

## Cambios

- Inicio: entrenamiento, alimentación y evolución enlazan a sus módulos disponibles.
  En móvil los enlaces de 44 px se ubican debajo de cada descripción.
- Calendario: preview visible de ejercicios en su orden, series, rango de repeticiones
  y descanso. Utiliza los snapshots de la rutina activa recibidos en el calendario;
  consultar el plan no inicia sesiones ni requiere peticiones adicionales.
- Los días futuros permiten consultar el preview, pero mantienen el registro deshabilitado.
  Los descansos y las rutinas antiguas sin detalle tienen estados explícitos.
- Ajuste de línea para nombres, correos y descripciones largos en dashboard, acceso
  y onboarding, sin ocultar el contenido con un recorte global.

## Verificación

Chrome automatizado con datos simulados y servicios interceptados. No se escribieron
datos en Firebase ni se consumieron cuotas de Gemini/USDA. Se verificó también el
build de producción, interacción táctil emulada y preferencia de movimiento reducido.

| Pantallas | Anchos comprobados en px |
|---|---|
| Inicio, login, registro, recuperar acceso, login admin, setup | 320, 360, 390, 580, 768, 800, 801, 1024, 1440 |
| Perfil, biblioteca y navegación persistente | 320, 360, 390, 580, 768, 800, 801, 1024, 1440 |
| Calendario con preview | 320, 360, 390, 580, 768, 800, 801, 1024, 1440 |
| Registro de series, editores y onboarding | 320, 390, 768, 1440, según el formulario |
| Diario de comidas | 320, 390, 768, 1024, 1440 |
| Peso y gráfico | 320, 390, 580, 768, 1024, 1440 |
| Reportes e historial | 320, 390, 768, 1440 |
| Administración y verificación de correo | 320, 390, 768, 801, 1440; horizontal 844 × 390 |

Se comprobó ausencia de scroll horizontal de página; las filas semanales y tablas
conservan su desplazamiento interno. Se revisó la ubicación de la navegación móvil
y su persistencia al cambiar de pantalla. Pruebas adicionales con nombres sin espacios
y notas largas reprodujeron los desbordes del calendario y confirmaron la corrección.

Flujos ejercitados: iniciar sesión simulada, pasos del onboarding, abrir editores,
ver preview sin crear registros, iniciar/guardar/retomar/finalizar entrenamiento,
conservar carga cero, consultar sesiones cerradas, días futuros, descansos y ausencia
de rutina; comida manual, edición, búsqueda y foto simuladas con consentimiento,
duplicado y archivo; CRUD de peso, selección del gráfico, filtros de logs, semanas
vacías y recuperación tras error de reporte.

Controles de compilación: `npm test` (4 frontend, 20 backend) y `npm run build`
del frontend. La emulación no sustituye una comprobación en Safari/iOS o Android
físicos; tampoco verifica la configuración de credenciales del despliegue público.
