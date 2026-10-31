# Inventario de assets

Se revisaron archivos versionados en public, src y docs; no existen carpetas adicionales de branding o assets en esta base. No se accedió a Figma: no se suministró un enlace.

| Nombre | Path | Formato | Descripción | Posible uso |
| --- | --- | --- | --- | --- |
| Formance | public/brand/formance.svg | SVG | Marca horizontal original | Resolución e identidad sobre claro; utilizada |
| Formance blanco | public/brand/formance-white.svg | SVG | Marca horizontal blanca original | Portada oscura; utilizada |
| Isotipo | public/brand/isotype.svg | SVG | Símbolo de marca | Portada, marca de agua y variante de sección; utilizado con filtro monocromo blanco |
| Entrenamiento mujer | public/images/training-woman.webp | WebP | Fotografía del producto | Separador futuro |
| Entrenamiento hombre | public/images/training-man.webp | WebP | Fotografía del producto | Separador futuro |
| Onboarding | public/images/onboarding-background.jpg | JPG | Fondo de onboarding | Contexto visual futuro |
| Comida | public/images/meal.png | PNG | Imagen de alimentación | Contexto futuro |
| Perfil y objetivo | docs/e4/screenshots/01-perfil-objetivo.png | PNG | Captura E4 | Fallback futuro, previa revisión |
| Entrenamiento | docs/e4/screenshots/02-entrenamiento.png | PNG | Captura E4 | Fallback futuro, previa revisión |
| Alimentación IA | docs/e4/screenshots/03-alimentacion-ia.png | PNG | Captura E4 | Fallback futuro, previa revisión |
| Peso y progreso | docs/e4/screenshots/04-peso-progreso.png | PNG | Captura E4 | Fallback futuro, previa revisión |
| Reporte IA | docs/e4/screenshots/05-reporte-ia.png | PNG | Captura E4 | Fallback futuro, previa revisión |
| Geist variable | src/app/fonts/GeistVF.woff | WOFF | Fuente local del producto | Heredada por todo el deck |
| Iconos | src/components/ui/Icon.tsx | TSX/SVG | Sistema de iconos del MVP | Disponible para futuras composiciones |

Las capturas E4 no se copiaron ni se montaron en la presentación. Los 12 previews actuales generados están en previews y son resultados de esta etapa, no assets de origen.

## Deck final de 21 escenas

Previews: `docs/presentation/previews/01-cover.png` a `21-closing.png` (nombres descriptivos por escena).

Respaldo público de slide 20: `public/presentation/demo/02-entrenamiento.png`, `03-alimentacion-ia.png`, `04-peso-progreso.png`, `05-reporte-ia.png`. Copias sin modificaciones de `docs/e4/screenshots/`, con registros de demostración; no requieren recaptura ni llamadas a servicios. Se excluyó la captura de perfil por conservar referencias de una cuenta real. Los originales E4 siguen intactos.

Revisado nuevamente: marca horizontal oscura/blanca e isotipo disponibles; no se encontró export aprobado de Figma purple/blue ni mockup. Pendientes concretos en `ASSETS_NEEDED.md`.
