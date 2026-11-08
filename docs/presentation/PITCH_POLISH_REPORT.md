# Pulido del pitch final

Rama: `feature/presentation-polish`. Se conservan los 9 slides, sus IDs, expositores y tiempos de ensayo.

| # | Antes | Ahora |
| --- | --- | --- |
| 03 | Tres tarjetas prolijas | Datos desparramados: tarjetas giradas, cada una en “otra app” (gimnasio, calorías, notas) |
| 04 | Dos zonas de marcas | “Buenas apps. Cada una por su lado.”: islas que se conectan en Formance |
| 05 | “Formance sí / Formance no” | “Tu información, organizada. Para vos y para quien te acompaña.”: Vos → Formance → tu profesional. Los límites quedan en notes para preguntas |
| 06 | Resumen semanal + Apoyo de IA | Todo se junta en “Tu semana, en 10 segundos” + “una IA que te lo explica” |
| 07 | Pilares y reglas en texto | **“Tu semana, en 10 segundos”**: réplica animada de la lectura real (semana del 2/11 de la cuenta demo) |
| 08 | Capturas de una versión anterior | Capturas actuales con datos de demostración; principal: la lectura semanal |
| 09 | “¿Logramos el objetivo?” | “Registrá. Entendé. Mejorá.” manteniendo “Objetivo cumplido” y ¿Preguntas? |

## Movimiento

- Transición entre escenas: la anterior sale en 220 ms y la nueva entra desde los 150 ms; ya no se superponen textos.
- Cada animación cuenta algo: el problema se desordena, el mercado se conecta, el posicionamiento avanza de izquierda a derecha y la lectura se arma (días que se marcan, barras hasta la línea del objetivo, el peso que se dibuja, logros y foco).
- Todas son finitas y nunca avanzan de slide. Con movimiento reducido, todo aparece quieto y completo.

## Validación

`npm test`, `npm run typecheck`, `npm run build` y Playwright de presentación 16/16 (encaje a 1920×1080, 1440×900,
1366×768 y 390×844, teclado, rueda, swipe, galería, reduced motion y secuencias). Previews regeneradas en `previews/`.
Los números de la slide 07 coinciden con la cuenta demo: 4/4 entrenamientos, 2.755 kcal (objetivo 2.596),
en objetivo 5 de 7 días, proteína 6 de 7 días, 78,6 kg (−0,4 kg).
