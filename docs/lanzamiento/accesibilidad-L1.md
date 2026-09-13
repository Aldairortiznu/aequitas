# Pase de accesibilidad y rendimiento (L1.4)

Fecha: 12 de septiembre de 2026 · build `desarrollo` · herramienta: axe-core 4 sobre
Playwright (`node scripts/dev/axe.mjs`, requiere `npm run build`).

## Accesibilidad automática (WCAG 2.1 AA + buenas prácticas)

16 pantallas analizadas: título, selector de protagonista, creador de personaje, nombre y
tratamiento, cinemática, diálogo sobre lámina, mundo y HUD, los cinco paneles, Audiencia
(con y sin cajón de normas), Pacto e Interpelación. **Resultado: 0 violaciones.**

Corregido en este pase:

| Problema                                                            | Dónde                              | Arreglo                                                            |
| ------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------ |
| `user-scalable=no` impedía ampliar                                  | `index.html`                       | se permite el zoom del navegador                                   |
| Contenido fuera de regiones y sin `h1`                              | página                             | `#ui` es `main`; `h1` oculto visualmente; `#game` es `application` |
| Medidor sin nombre accesible                                        | HUD                                | `aria-label="Legitimidad de la región"`                            |
| Contraste 4.2:1 en etiquetas pequeñas                               | etiquetas mono en todas las vistas | `--muted` pasa de `#6f6c76` a `#5b5862` (5.6:1 sobre papel)        |
| `tablist` con un botón de cierre dentro; `listbox` con `li` sin rol | paneles                            | `tablist` propio; `li role="none"`; chips como `group`             |
| Marcas de credibilidad con `aria-label` sin rol                     | Audiencia                          | `role="img"`                                                       |
| Etiqueta de versión sobre el papel de la Audiencia (contraste)      | App                                | se oculta bajo cualquier modal                                     |
| Orden de encabezados en paneles                                     | Zurrón, Códice, Cuaderno           | `h2`/`h3`                                                          |

## Pendiente manual (necesita dispositivos y personas)

- [ ] Lector de pantalla (NVDA en Windows, VoiceOver en iOS): el diálogo lee texto y
      opciones en orden; la Audiencia anuncia la afirmación actual y los medidores.
- [ ] Navegación solo con teclado en Audiencia y Pacto (Tab llega a cada cajón y botón).
- [ ] Modo lector de mesa: escala de texto 160 % en un teléfono de 360 px sin cortes.
- [ ] Mando táctil en Android de gama media y en iPhone: cruceta y botones no tapan el
      diálogo; la interacción con objetos funciona sin teclado.
- [ ] `prefers-reduced-motion`: sin paneo de láminas ni máquina de escribir acelerada.

## Rendimiento (Chromium sin cabeza, servidor local)

| Perfil              | Canvas listo | Título listo | Mundo desde «Empezar» | Transferencia        | Heap JS |
| ------------------- | ------------ | ------------ | --------------------- | -------------------- | ------- |
| Escritorio 1280×720 | 1,6 s        | 1,7 s        | 0,8 s                 | 617 KB (76 recursos) | 23 MB   |
| Móvil 360×740       | 0,8 s        | 0,8 s        | 0,8 s                 | 617 KB               | 23 MB   |

Build: 2,3 MB en `dist/` (JS 1,67 MB sin comprimir, de los cuales Phaser 1,2 MB; 332 KB
gzip). Sin arte real todavía; cada sprite real añade ~3 KB y cada lámina 150 a 600 KB.

Pendiente manual: fotogramas por segundo en un Android de gama media con el mapa de la
torre (46 filas) y tres compañeros; temperatura tras 20 minutos.

## Cómo repetir

```bash
npm run build
node scripts/dev/axe.mjs
node scripts/dev/perf.mjs
```
