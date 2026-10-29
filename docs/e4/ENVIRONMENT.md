# Variables y entorno real de E4

Auditoría del 29/10/2026. No se imprimieron claves ni se modificaron valores secretos.
`environment-audit.json` registra únicamente presencia y coherencia de configuración.

Se utilizó el fallback local: frontend `http://localhost:3000`, backend
`http://localhost:4200/api`, conectados a Firebase/USDA/Gemini reales. No se encontraron
manifiestos de preview ni configuración local de proveedor de hosting que permitieran
crear un preview de ambas feature branches; no se cambiaron despliegues existentes.
La verificación local no certifica las variables privadas del hosting.

| Variable | Front/Back | Obligatoria | Configurada localmente | Necesaria en deploy |
|---|---|---|---|---|
| NEXT_PUBLIC_API_URL | Front | Sí para apuntar al backend correcto; fallback localhost | Sí | Sí: API HTTPS del entorno |
| NEXT_PUBLIC_FIREBASE_API_KEY | Front | Sí para Auth | Sí | Sí, pública de Firebase web |
| NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN | Front | Sí para Auth | Sí | Sí; dominio autorizado para popup Google |
| NEXT_PUBLIC_FIREBASE_PROJECT_ID | Front | Sí para Auth | Sí | Sí; mismo proyecto que backend |
| NEXT_PUBLIC_FIREBASE_APP_ID | Front | Sí para Auth | Sí | Sí |
| NODE_ENV | Back | Tiene default development | Sí | production |
| PORT | Back | Tiene default 4200 | Sí | Puerto del proveedor o default compatible |
| FRONTEND_ORIGIN | Back | Sí para CORS correcto; fallback local | Sí | Origen HTTPS exacto, sin path ni barra final |
| FIREBASE_PROJECT_ID | Back | Sí para persistencia; exigida en production | Sí | Sí |
| GOOGLE_APPLICATION_CREDENTIALS | Back | Si usa archivo ADC; puede sustituirse por identidad del entorno | Sí; conexión comprobada | ADC/IAM equivalente; no exponer JSON en frontend |
| USDA_API_KEY | Back | Para búsqueda; manual/foto no la requieren | Sí | Si se ofrece búsqueda |
| GEMINI_API_KEY | Back | Para foto y nuevas interpretaciones semanales | Sí | Sí para funciones IA |
| GEMINI_MODEL | Back | Tiene default admitido | Sí | Configurar/verificar modelo accesible para el proyecto |
| FOOD_AI_USER_DAILY_LIMIT | Back | Default 3 | Sí | Default o valor explícito 3 |
| FOOD_AI_GLOBAL_DAILY_LIMIT | Back | Default 20 | Sí | Default o valor explícito 20 |
| FOOD_AI_GLOBAL_MINUTE_LIMIT | Back | Default 3 | Sí | Default o valor explícito 3 |
| WEEKLY_AI_USER_WEEKLY_LIMIT | Back | Default 2 | No explícita; default efectivo 2 | Default o valor explícito 2 |
| WEEKLY_AI_GLOBAL_DAILY_LIMIT | Back | Default 10 | No explícita; default efectivo 10 | Default o valor explícito 10 |
| WEEKLY_AI_GLOBAL_MINUTE_LIMIT | Back | Default 1 | No explícita; default efectivo 1 | Default o valor explícito 1 |
| E4_BASE_URL | Herramienta | Default localhost:3000 | Default utilizado | Solo si la suite apunta a preview/prod |
| E4_DEMO_WEEK_START | Herramienta | Default fijo 2026-10-05 | Default utilizado | Para la suite, no para la app |
| E4_DEMO_EMAIL | Herramienta | Solo login con contraseña | No requerida: Google UI | Nunca incluir en bundle |
| E4_DEMO_PASSWORD | Herramienta | Solo login con contraseña | No requerida: Google UI | Nunca incluir en bundle/Git |
| E4_CDP_URL | Herramienta | Solo Google en Chrome normal | Usada transitoriamente para login | No es variable de producción |
| E4_PHOTO_PATH | Herramienta | Solo preparación de foto; admite entrada local predeterminada | Entrada local verificada | No es variable de producción |

Para local, preview y producción, `NEXT_PUBLIC_*` se incorpora al build del frontend;
si cambia el backend o Firebase debe reconstruirse el frontend. El backend debe
permitir por CORS el origen exacto de ese frontend. El proyecto Firebase web/backend
coincide en local y Auth/Firestore respondieron realmente. CORS local está alineado.

Las cuotas de la tabla son presupuestos propios de Formance, separados por función.
No sustituyen las cuotas de proyecto/modelo de Google. Se conservaron los defaults
acordados: fotos 3 por usuario/día, 20 global/día y 3 global/minuto; semanal 2 por
usuario/semana analizada, 10 global/día y 1 global/minuto. El caché no consume cuota.
