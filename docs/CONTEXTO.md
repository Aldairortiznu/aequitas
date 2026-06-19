# 🌱 CONTEXTO DEL PROYECTO — *Reverdecer* (La travesía de Abigail)

> **Lee este archivo PRIMERO al iniciar cualquier sesión.** Resume qué es el juego,
> las decisiones tomadas y dónde retomar. Mantenerlo actualizado al final de cada sesión.

---

## 1. Qué es

RPG pixel art (vista cenital / top-down) hecho con **Phaser 3 + Vite**.
Una heroína recorre un **prólogo + 32 reinos verdes** (32 = la edad que cumple). Cada
reino guarda un **aprendizaje** que ella debe conquistar; lo bloquea un **Guardián**
(monstruo = la ilusión o miedo). Vence con combate en tiempo real + acertijo, y gana
una enseñanza. Para salvar el mundo debe atravesar sus aprendizajes hasta el Amor Propio.

Inspiración tonal: *El caballero de la armadura oxidada* (Robert Fisher) — desarmar
la "armadura" capa por capa mediante autoconocimiento.

## 2. Personajes

- **Abigail** — la heroína protagonista.
- **Jerónimo** 🐕 — perrito blanco **viejito y sabio**. Da pistas en puzzles y revela
  la debilidad de cada miedo. Voz calmada, reflexiva.
- **Amanda** 🐶 — perrita blanca **joven y valiente**. Da **Valor** (impulso/poder extra)
  en combate. Voz entusiasta, alentadora.
- **NPCs guía** — personajes que ella encuentra por los reinos y la orientan con diálogos.

## 3. Decisiones de diseño (CERRADAS)

| Tema | Decisión |
|------|----------|
| Motor | Phaser 3 |
| Build / dev server | Vite |
| Lenguaje | JavaScript (ES modules) |
| Perspectiva | Cenital / top-down (estilo Zelda/Pokémon) |
| Combate | **Acción en tiempo real** (moverse, atacar, esquivar) |
| Narrativa | Diálogos con NPCs guía + reflexiones con Jerónimo y Amanda + reflexiones propias |
| Puzzles | Acertijos; algunos llevan a **buscar respuestas en libros reales** del mundo físico |
| Guardado | Sí — progreso persistente (localStorage; archivo de save) |
| Arte | Packs **CC0** (Kenney / LPC) personalizados + sprites propios para heroína y perros |
| Mapas | Editor **Tiled** (.tmj) cargados en Phaser |
| Niveles | Prólogo + 32 reinos de **aprendizajes** (32 = la edad que cumple) |
| Tono | Filosófico y profundo; acertijos y combates exigentes pero entretenidos |
| Estética | Mucho verde: plantas, castillos, paraísos, jardines |
| Idioma del juego | Español **latino / neutro** (trato de "tú", sin modismos de España) |

## 4. Estructura de carpetas (objetivo)

```
JardinDeLosMiedos/
├── docs/
│   ├── CONTEXTO.md      ← este archivo (leer primero)
│   ├── PLAN.md          ← roadmap por fases, paso a paso
│   ├── CHANGELOG.md     ← qué se hizo en cada sesión
│   └── GDD_NIVELES.md   ← los 31 niveles: miedo, jefe, acertijo, enseñanza
├── public/
│   └── assets/          ← sprites, tiles, audio (CC0)
├── src/
│   ├── main.js          ← arranque Phaser
│   ├── scenes/          ← Boot, Menu, World, Combat, Dialogue, etc.
│   ├── systems/         ← save, dialogue, combat, puzzle, input
│   ├── data/
│   │   ├── levels.js    ← datos de los 31 niveles
│   │   └── dialogues.js ← textos de diálogos/enseñanzas
│   └── entities/        ← Heroina, Jeronimo, Amanda, Enemy, NPC
├── index.html
├── package.json
└── vite.config.js
```

## 5. Cómo correr el proyecto (cuando exista)

```bash
cd JardinDeLosMiedos
npm install      # solo la primera vez
npm run dev      # abre el dev server (Vite) en el navegador
```

## 6. Estado actual

- **Fase actual:** Fase 0 (planificación) — COMPLETADA la documentación.
- **Siguiente paso:** Fase 1 — andamiaje del proyecto Phaser + Vite.
- Ver detalle y checklist en `PLAN.md`. Ver historial en `CHANGELOG.md`.
