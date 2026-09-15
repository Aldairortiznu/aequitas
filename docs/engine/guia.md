# Modo guiado

Ajuste `guia` (activado por defecto). Cuatro piezas, todas por datos:

## Objetivos

`manifest.objetivos`: lista ordenada de `{ id, texto, hecho: Condition[], destino?: { mapa, objeto } }`.
El objetivo activo es el primero cuyas condiciones `hecho` no se cumplen (`src/core/objetivos.ts`).
Los objetivos anteriores cuentan como hechos aunque se resuelvan en otro orden. `texto` admite
plantillas (`{nombre}`, formas de tratamiento). El validador exige que `destino.mapa` exista y
que `destino.objeto` esté en la capa `objetos` de ese mapa, y revisa los flags de `hecho`.

- HUD: el objetivo activo se muestra bajo los contadores; al tocarlo abre el Cuaderno.
- Cuaderno: lista completa con los hechos tachados y un botón «Ir» junto al activo.

## Marcador en el mundo

`Session.emitObjetivo()` publica `world:objetivo` con el destino del activo cada vez que cambia
el estado. `WorldScene.setObjetivo` pone una flecha dorada (`icon-objetivo`) sobre el objeto
si está en el mapa actual; si está en otro mapa, sobre la puerta cuyo `map` es el destino (o
cualquier puerta de salida). Una evidencia ya recogida no se marca.

## Viaje rápido

`Session.viajar(mapa?)` teletransporta a la entrada del mapa (spawn `entrada`, `inicio` o el
de entrada del episodio). El panel Mapa lista los lugares del episodio con «Ir» y ofrece «Ir
al objetivo». Solo con `guia` activado.

## Letreros y pistas de control

- Objeto de mapa `letrero` (propiedad `texto`): al interactuar muestra su texto. En
  `scripts/maps/lib.ts`: `letrero(name, tx, ty, texto)`.
- `Session.pistaDeControl(id)`: tres avisos (`mover`, `zurron`, `atril`) una sola vez por
  instalación (`settings.pistasVistas`), emitidos 3,2 s después del aviso que los provoca para
  no taparlo.

Pruebas: `e2e/guia.spec.ts`; sonda `scripts/dev/probe-guia.mjs`.
