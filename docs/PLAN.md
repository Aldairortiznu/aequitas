# 🗺️ PLAN MAESTRO — *Reverdecer*

> Roadmap por fases. Cada fase es un objetivo cerrable en una o varias sesiones.
> Marca `[x]` lo completado. Al terminar una sesión, anota en `CHANGELOG.md`.

Leyenda: ⬜ pendiente · 🔧 en curso · ✅ hecho

---

## FASE 0 — Planificación y documentación ✅
- [x] Definir concepto, personajes y tono
- [x] Cerrar decisiones de diseño (combate, arte, perspectiva, guardado)
- [x] Crear docs de seguimiento (CONTEXTO, PLAN, CHANGELOG, GDD_NIVELES)
- [x] git init

## FASE 1 — Andamiaje técnico ✅
- [x] Proyecto Vite + instalar **Phaser 3** (v3.90)
- [x] Estructura de carpetas (`src/scenes`, `src/systems`, `src/data`, `src/entities`)
- [x] `index.html` + `main.js` con config de Phaser (resolución 480x270, pixelArt:true, escalado FIT)
- [x] Escena **Boot** (placeholders) → **Menu** (pantalla de título con hojas y menú)
- [x] Sistema de guardado básico (`systems/save.js`) + escena Placeholder con intro del prólogo
- [x] Verificado `npm run dev` corriendo (Phaser arranca sin errores)
- [x] `.gitignore` + commits

## FASE 2 — Movimiento y mundo base ✅
- [x] Mundo verde generado por código (césped, flores, senderos, árboles, estanque) — `tiles.js`
- [x] Abigail camina en 4 direcciones (frente/espalda + flip) con "pasito" (bob)
- [x] Colisiones con árboles (solo tronco) y agua
- [x] Cámara que sigue a Abigail con límites del mapa
- [x] **Jerónimo y Amanda** la siguen en fila (retardo por historial de posiciones)
- [x] HUD con nombre de zona y controles; Esc vuelve al menú
- Nota: tilemap en Tiled (.tmj) se difiere; el mundo generado por código es suficiente por ahora.

## FASE 3 — Sistema de diálogos ✅
- [x] Caja de diálogo pixel (retrato + nombre + texto con efecto máquina de escribir)
- [x] Soporte para: NPC (Jardinero), Jerónimo, Amanda, reflexión propia (estilos/colores distintos)
- [x] `DialogueScene` que se lanza sobre el mundo (pausa World, resume al cerrar)
- [x] Textos en `src/data/dialogues.js`; intro del prólogo automática; NPC y perros hablables (E)
- [ ] (Pendiente futuro) Diálogos ramificados con opciones — se hará cuando un nivel lo requiera

## FASE 4 — Sistema de guardado ✅
- [x] Guardar/cargar en localStorage (vida, posición, diario, banderas de progreso)
- [x] Menú de continuar / nueva partida (Continuar carga la partida y restaura posición)
- [x] Punto de guardado: **fuente** en el mapa (E para guardar) con burbuja y destello
- [x] Guardado automático al vencer una sombra
- [x] **Diario de Sabiduría** (tecla I): lista de enseñanzas recogidas (DiaryScene)

## FASE 5 — Combate en tiempo real ✅
- [x] Ataque de Abigail (Espacio) con hitbox según orientación + destello `slash`
- [x] Enemigo "sombra" con IA (persigue) y barra de vida; daño por contacto a Abigail
- [x] Vida/daño de Abigail (barra HUD) + derrota → reaparece curada con mensaje
- [x] **Valor de Amanda** (V): +daño y +velocidad por tiempo, con recarga
- [x] **Sabiduría de Jerónimo** (B): revela el núcleo/punto débil; sin ella los golpes rebotan
- [x] Feedback: shake, parpadeo, números flotantes, tinte; tutorial `sombra_aviso` y enseñanza `sombra_vencida`
- [ ] (Pendiente futuro) Sonidos — en Fase 7 (audio)

## FASE 6 — Sistema de puzzles / acertijos ✅ (base)
- [x] **RiddleScene** con 3 tipos: completar (escribir), **ordenar** (frase), elegir (opción)
- [x] Acertijos de "libros reales" con fuente (filosofía/Biblia/literatura), "dónde leer" y pista
- [x] Comparación flexible de respuestas (`systems/text.js`: sin tildes/mayúsculas/signos)
- [x] Atril (pedestal) en el mundo que lanza un acertijo; estado persistente (`save.riddlesSolved`)
- [x] Pantalla de "Aprendizaje" al resolver
- [ ] (Futuro) Otros puzzles de mundo (placas de presión, recoger luces) por nivel en Fase 8

## FASE 7 — Arte y audio 🔧 (adelantada parcialmente)
- [ ] Descargar e integrar packs CC0 (Kenney/LPC) — tilesets verdes, castillos
- [x] Sprites propios frontales: **Abigail, Jerónimo, Amanda** (datos en `src/art/spriteData.js`)
- [ ] Animaciones de caminar (4 direcciones) para los 3 (en Fase 2)
- [ ] Ajustar a Abigail según la foto real (pendiente: la foto no llegó adjunta)
- [ ] Música ambiental + efectos (CC0)
- [x] Tinte/paleta distinto por reino según el bioma (Sesión 10)

## FASE 8 — Contenido: prólogo + 32 niveles 🔧 (plantilla lista)
- [x] **Datos de los 33 reinos** (`src/data/reinos.js`): nombre, aprendizaje, Guardián, enseñanza, color, riddleId
- [x] **Plantilla de reino reutilizable**: el mundo se tematiza por nivel (título, tinte,
      Guardián, acertijo) y abre un **portal** al cumplir los retos → avanza de reino y guarda
- [x] Acertijos "de libro real" enganchados por reino (5,14,18,19,22,26,27,30,31)
- [x] Enseñanzas de sombra y acertijos quedan en el **Diario de Sabiduría**
- [x] **Sistema de biomas** (`biomes.js` + `biomeTextures.js`): 13 biomas con suelo,
      decorados, monstruo, stats y partículas propios; mapa procedural sembrado por nivel
- [x] **Tesoros** coleccionables por reino (orbes de luz que curan y se guardan)
- [ ] Mapas/decorados aún MÁS únicos (estructuras a medida por reino emblemático)
- [ ] Diálogos propios de cada Guardián (ahora usan los genéricos del prólogo)
- [ ] Jefe final especial (Nivel 32: Amor Propio / "abrazar" en vez de atacar)

## FASE 9 — Pulido y cierre ⬜
- [ ] Pantalla de título e intro narrativa
- [ ] Pantalla final / créditos con dedicatoria de cumpleaños 🎂
- [ ] Menú de pausa, ajustes de volumen
- [ ] Balance de dificultad
- [ ] Build de producción (`npm run build`) + cómo compartirlo

---

## Cómo retomar en una sesión nueva (protocolo)
1. Leer `docs/CONTEXTO.md` y este `PLAN.md`.
2. Mirar el último registro en `docs/CHANGELOG.md`.
3. `git log --oneline -5` para ver los últimos commits.
4. Continuar desde la primera casilla ⬜ pendiente.
5. Al terminar: actualizar checklist, escribir entrada en CHANGELOG, commit.
