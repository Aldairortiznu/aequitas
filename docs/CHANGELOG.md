# 📜 REGISTRO DE CAMBIOS — *El Jardín de los Miedos*

> Una entrada por sesión. Lo más reciente arriba. Anota: fecha, qué se hizo,
> decisiones, y dónde quedó para retomar.

---

## Sesión 1 — 2026-06-18
**Fase:** 0 (Planificación) ✅
**Hecho:**
- Definido el concepto: RPG pixel art top-down, 31 reinos = 31 miedos interiores.
- Personajes confirmados: Heroína + **Jerónimo** (perrito viejito sabio, blanco) +
  **Amanda** (perrita joven valiente, blanca).
- Decisiones cerradas: Phaser 3 + Vite, combate en tiempo real, narrativa con NPCs
  guía y reflexiones, puzzles/acertijos (algunos remiten a libros reales),
  guardado de progreso, arte CC0, perspectiva cenital, español.
- Verificado entorno: Node 24.15, npm 11.12, git 2.53, Python 3.11 (todo OK).
- Creados documentos de seguimiento: CONTEXTO.md, PLAN.md, CHANGELOG.md, GDD_NIVELES.md.
- `git init`.

**Decisiones de diseño nuevas:**
- Combate definido como **acción en tiempo real**, con la narrativa profunda llevada
  por diálogos (NPCs + perros + reflexión propia), no por menús de batalla.

**Pendiente / siguiente:** Fase 1 — andamiar proyecto Phaser + Vite y dejar
`npm run dev` corriendo. Hacer primer commit.

**Ajuste posterior (misma sesión):**
- Cambio de alcance: ahora **32 niveles** (cumple 32 años), enmarcados como
  **aprendizajes** (no como miedos): cada reino guarda una sabiduría a conquistar y un
  Guardián que la bloquea. Se añadió un **Prólogo "El Despertar"** (tutorial).
- Tono reforzado: **filosófico y profundo** (estoicismo, Frankl, Jung, budismo),
  acertijos multi-paso y combates que premian usar a Jerónimo (debilidad) y Amanda (Valor).
- `GDD_NIVELES.md` reescrito completo. Actualizados CONTEXTO y PLAN.
