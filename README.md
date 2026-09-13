# AEQUITAS: El Retorno del Equilibrio

RPG educativo de derecho colombiano. Temporada 1: «El Año Diez».
**Bellium S.A.S. · Editorial Al Resuelve · Cartagena de Indias.**

El año de la Fractura, cuando la guerra de los grandes dejó al Litoral sin luz, sin jueces y sin Estado, alguien destruyó los registros públicos. Cuatro años después,
un antiguo secretario reabrió la Oficina de Registro con los folios que dice haber salvado
y desde entonces decide quién existe y qué es de quién. Renata, la primera jurista que sale
de la Biblioteca escondida en la ciénaga, va a usar la ley contra quien solo tiene la forma.

Se juega hablando, probando y pactando. No hay armas: cada afirmación del adversario se
contradice con **norma + hecho**, y cada conflicto termina en un acta de conciliación que
el jugador redacta. Donde el pacto es justo, la región reverdece.

## Estado

En construcción (fase F0-F2 del plan). El prototipo anterior está en la rama
`prototipo-2026` y sigue publicado en https://aldairortiznu.github.io/aequitas/ hasta que
el primer lanzamiento sea jugable.

## Desarrollo

```bash
npm install
npm run dev          # http://localhost:5180
npm run check        # lint + tipos + pruebas + validación de contenido
```

Requisitos: Node 22 o superior. Para las pruebas de navegador: `npx playwright install chromium`.

## Estructura

- `docs/design/` — plan maestro, biblia narrativa, mecánicas, currículo jurídico,
  arquitectura, backlog y dirección de arte. Empezar por `00-PLAN-MAESTRO.md`.
- `content/` — contenido del juego (episodios, diálogos, audiencias, pactos, Códice) como
  JSON validado por esquema.
- `src/core/` — lógica pura (sin Phaser ni DOM). `src/engine/` — Phaser. `src/ui/` — Preact.
- `scripts/` — validador de contenido, generador de mapas de prueba, copia autónoma.

## Licencia

Código y contenido © Bellium S.A.S. Todos los derechos reservados hasta que Dirección
defina la licencia de publicación.
