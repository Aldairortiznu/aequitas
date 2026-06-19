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

## FASE 4 — Sistema de guardado ⬜
- [ ] Guardar/cargar en localStorage (nivel, vida, progreso, acertijos resueltos)
- [ ] Menú de continuar / nueva partida
- [ ] Puntos de guardado (ej. "hogueras" o "fuentes" en el mapa)

## FASE 5 — Combate en tiempo real ⬜
- [ ] Ataque de la heroína (golpe/hechizo) + hitbox
- [ ] Enemigo "miedo" con IA básica (perseguir, atacar) y barra de vida
- [ ] Vida/daño de la heroína + estado de derrota (reaparecer en último guardado)
- [ ] **Valor de Amanda**: habilidad con cooldown (daño/escudo extra)
- [ ] **Sabiduría de Jerónimo**: revela debilidad del miedo
- [ ] Feedback: partículas, parpadeo, sonidos

## FASE 6 — Sistema de puzzles / acertijos ⬜
- [ ] Tipos de puzzle: recoger luces, placas de presión, orden de símbolos
- [ ] **Acertijos de texto** con respuesta escrita (incluye los de "libros reales")
- [ ] Estado de puzzle persistente (se guarda si se resolvió)

## FASE 7 — Arte y audio 🔧 (adelantada parcialmente)
- [ ] Descargar e integrar packs CC0 (Kenney/LPC) — tilesets verdes, castillos
- [x] Sprites propios frontales: **Abigail, Jerónimo, Amanda** (datos en `src/art/spriteData.js`)
- [ ] Animaciones de caminar (4 direcciones) para los 3 (en Fase 2)
- [ ] Ajustar a Abigail según la foto real (pendiente: la foto no llegó adjunta)
- [ ] Música ambiental + efectos (CC0)
- [ ] Tinte/paleta distinto por reino según el miedo

## FASE 8 — Contenido: prólogo + 32 niveles ⬜
- [ ] Plantilla de nivel reutilizable (mapa + acertijo + Guardián + enseñanza)
- [ ] Prólogo "El Despertar" (tutorial)
- [ ] Implementar niveles por lotes (ej. 1–5, 6–10, …) — ver `GDD_NIVELES.md`
- [ ] Acertijos "de libro real" (niveles 5, 18, 22, 26, 30)
- [ ] Diario de Sabiduría (colección de enseñanzas)
- [ ] Jefe final (Nivel 32: Amor Propio / Aceptación)

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
