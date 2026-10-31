# Motion de la presentación Formance

## Estado inicial

Rama `feature/final-presentation`. Se auditaron registro/tipos, las 16 escenas, componentes, CSS, navegación manual, tests, inventario y previews antes de cambiar código. Existían un fade/translate de 280 ms al montar la escena y una animación básica para screenshots. No había stagger compartido ni transición de salida. El frontend de revisión ya estaba activo en localhost:3000.

Se preservaron contenido académico, orden, IDs, speakers, mapa, debug sin tiempos y las 16 escenas habilitadas. No se agregaron capítulos al registro ni escenas futuras.

## Sistema de motion creado

`src/presentation/motion.css` reúne tokens, keyframes y etapas reutilizables. Se importa después de presentation.css desde el layout exclusivo de presentación.

- Entrada de escena: 460 ms, opacity, translate de 10 px y escala .994.
- Revelado de contenido: 560 ms, desplazamiento de 14 px y escala .996.
- Stagger: 110 ms entre elementos; base configurable con `--motion-base`.
- Conexiones: 400–600 ms; marca de agua: 700 ms.
- Secuencia habitual completa: aproximadamente 1,1–1,55 s. Animaciones finitas, sin loops.

`p-motion-stagger` se aplica a contenedores existentes de cards, listas y nodos. Se limita el escalonado de listas largas para no prolongar indefinidamente la secuencia. Las etapas comunes de los layouts cubren eyebrow, título, contenido principal y conclusión.

`src/components/presentation/Motion.tsx` ofrece MotionReveal con order y variantes rise/converge/line, más SectionTransition para nuevos contenidos. La guía incluye cómo reutilizarlos. No se agregaron dependencias.

## Transición entre slides

`useSceneTransition.ts` aporta un crossfade de snapshots mediante View Transitions API cuando está disponible y la preferencia de movimiento lo permite. Salida de 340 ms con desplazamiento de −10 px; entrada de 440 ms con desplazamiento de 12 px y escala .994. No hay rotaciones, 3D, flips, blur o zoom fuerte.

La transición captura la escena con nombre estable y no clona el DOM accesible. Los controles quedan fuera de la escena animada y siguen disponibles. Un contador de solicitudes descarta callbacks de snapshots anteriores cuando se navega rápidamente. El destino solicitado se mantiene en ref para que varias entradas manuales consecutivas no pierdan pasos durante una captura.

Si la API no existe, la ventana no está visible o reduced motion está activo, se realiza el cambio de estado directamente. La entrada CSS sigue funcionando como fallback cuando corresponde. Recarga y eventos de hash/historial cancelan capturas pendientes y sincronizan el destino.

**Ninguna transición avanza el deck.** Solo una entrada manual solicita un cambio; la finalización de una animación limpia referencias visuales. No hay setTimeout/setInterval, cronómetro, reproducción automática ni tiempos visibles en público/mapa/debug.

## Entrada automática de contenido

El cambio de key de la escena reinicia las animaciones CSS. No requiere clicks internos. Cada entrada termina mostrando toda la escena; después permanece estática hasta que el presentador avance. Las captions y conclusiones se revelan después de los conceptos principales.

Se aplicó a todas las escenas actuales, incluida portada, equipo, objetivos, recorrido, límites, exclusiones y las siete de Elicitación.

## Microanimaciones

- Problema: tres cards separadas con entrada escalonada y trazos SVG simples.
- Formance: cards cercanas con convergencia horizontal de solo 18 px, conexiones y marca posterior. Se conserva el layout aprobado; no se intentó un morph inestable.
- Objetivos: conceptos y proceso secuenciales; las conexiones acompañan la lectura.
- Alcance: seis nodos escalonados en el orden del recorrido.
- Límites: extremo inicial, línea horizontal revelada mediante scaleX y extremo final.
- No contempla: cuatro grupos en secuencia y conclusión posterior.
- Proceso actual: objetivo, flecha, herramientas, flecha y resultado distribuido.
- Competencia: nutrición, fuerza e intersección en etapas distintas.
- Stakeholders: actor principal, marca central y actores alrededor.
- Síntesis: conclusiones 01/02/03 y necesidad de centralización.

Los cambios principales son clases y reglas compartidas; no se alteraron los textos académicos para producir el efecto.

## Uso de assets de Figma

Se reutilizaron los SVG originales de marca e isotipo del repositorio. La portada ahora suma una marca de agua muy tenue del isotipo real, con entrada breve y luego estática. Se conserva la base crema/ink/dark green/lima/Geist.

No hay exports purple/blue ni mockups revisados en el repo y no se suministró un archivo/frame Figma. No se inventaron fondos o composiciones. ASSETS_NEEDED.md documenta los dos recursos opcionales con nombre, uso, formato, prioridad y referencia aproximada: composición de bloque purple/blue y mockup futuro de producto.

## Section transitions

SectionTransition queda preparado para chapter, title, subtitle e isotipo, con variantes lime y brand. Se puede combinar con metadata theme dark para un separador oscuro. La variante brand acepta el futuro token `--presentation-section-accent`, con lima como fallback hasta disponer de colores/export revisados. No se agregaron slides separadoras a las 16 existentes.

## Reduced motion

La preferencia cancela animaciones/transiciones en elementos y pseudo-elementos, muestra todas las etapas y deja los trazos SVG completos. El hook omite View Transitions. Mapa y thumbnails permanecen estáticos incluso cuando el sistema permite movimiento. No se oculta contenido ni se pierde navegación.

## Performance

Predominan transform y opacity. Única animación de dibujo: stroke-dashoffset en tres paths SVG pequeños. Las líneas HTML se revelan por scaleX. No se animan dimensiones, sombras, filtros, gradientes o posiciones de layout; el filtro monocromo del isotipo es fijo. No hay librerías pesadas, loops, listeners por card ni duplicación persistente de escenas. View Transitions utiliza snapshots nativos de corta duración.

Se verificó funcionamiento y contención en navegador, no un benchmark de FPS en el proyector físico. Conviene confirmar la percepción de intensidad en la notebook usada durante la defensa.

## Tests

`npm.cmd test`: **15/15 aprobados**. No se ejecutó la suite E4 ni se consumieron APIs del MVP. No hubo cambios en dependencias, lockfiles o .env.local.

## Typecheck

`npm.cmd run typecheck`: aprobado.

## Build

`npm.cmd run build`: aprobado, con las rutas de presentación generadas correctamente.

## Playwright

**11/11 aprobados** contra producción local en Chrome, sin requests externos. Se mantienen orden de 16, hashes, bloques, speakers, mapa/debug sin tiempos, Home/End, teclado, wheel/inercia, swipe y fullscreen fallback.

Se agregaron comprobaciones de motion en cada escena, stagger, finalización natural sin cambiar el hash, navegación rápida con motion activo, fallback sin View Transitions, mapa estático y reduced motion incluyendo SVG. La prueba de reloj simulado confirma que diez minutos transcurridos no producen autoavance.

Se corrigió un overflow inicial de la marca de agua ubicándola dentro del viewport. La comparación de transformación final acepta la matriz identidad del navegador como estado final, en lugar de depender de la representación textual `none`.

## Previews

Se regeneraron los **16 PNG 1920×1080** en docs/presentation/previews y se revisaron individualmente. Representan el estado final completo, usando reduced motion para capturas deterministas. La suite adicional verifica motion activo y su finalización. Sin duplicados u otros archivos nuevos en esa carpeta.

Las 16 escenas pasan contención en 1920×1080, 1440×900 y 1366×768; también se conserva la comprobación 390×844. No se requiere scroll ni se redujeron los tamaños tipográficos de las escenas.

## Pendientes

Revisar intensidad durante el ensayo real y exportar, si se eligen, los recursos opcionales de Figma. No se crearon capítulos futuros. Sin cambios adicionales al MVP ni commit/merge/push.

## Revisión local

Se conservó el servidor dev existente en puerto **3000** y se verificó HTTP 200 para ambas rutas tras compilar los cambios. Sigue ejecutándose.

- Presentación: http://localhost:3000/presentacion
- Mapa: http://localhost:3000/presentacion/mapa
- Continuidad problema → Formance: http://localhost:3000/presentacion#problema

Comando equivalente desde formance-frontend: `npm.cmd run dev -- --hostname 127.0.0.1 --port 3000`.
