# Protagonista seleccionable (D10)

La historia es siempre la de «Iriarte», hija o hijo de la registradora Petra Iriarte. Lo que
se elige al empezar es el cuerpo, el nombre de pila y el tratamiento gramatical.

## Modelo

`src/core/jugador.ts`:

```ts
interface Jugador {
  preset: 'renata' | 'ramiro' | 'ariel' | 'cruz' | 'custom';
  nombre: string; // nombre de pila; el apellido es siempre Iriarte
  tratamiento: 'f' | 'm' | 'n';
  custom?: LookPersonalizado; // solo con preset 'custom'
}
```

- `GameState.jugador` lo guarda; `GameState.playerName` se conserva igual a `jugador.nombre`
  por compatibilidad. Los guardados anteriores se migran a Renata/femenino en `migrate`.
- Presets y nombres por defecto en `PRESETS`; `jugadorDesdePreset(id)` construye uno.
- `Session.jugador`, `Session.ctx` y `Session.t(texto)` exponen el contexto de plantillas.

## Plantillas de texto (`src/core/texto/plantilla.ts`)

| Marca                 | Resultado                               |
| --------------------- | --------------------------------------- |
| `{nombre}`            | nombre de pila elegido                  |
| `{apellido}`          | `Iriarte`                               |
| `{nombreCompleto}`    | `Renata Iriarte`                        |
| `{fem\|masc\|neutro}` | una de tres formas según el tratamiento |

Reglas de escritura:

- La forma neutra se **reformula** con palabras realmente neutras (`joven`, `jurista`,
  `quien viene de la Biblioteca`, `le doy la bienvenida`). Nunca `-e` (`bienvenide`).
- Siempre tres formas; el validador rechaza dos, variables desconocidas y llaves sin cerrar
  en cualquier archivo del episodio (diálogos, cinemáticas, consultas, pruebas, audiencias,
  pactos, manifiesto).
- En el contenido, el id de personaje `renata` **designa a quien juega**. La caja de diálogo
  muestra `jugador.nombre` y el retrato del preset elegido (o el provisional del aspecto
  personalizado).

Dónde se expande: `DialogueBox` (texto, opciones, consultas, testimonio), `CutsceneView`,
`AudienciaView` y `PactoView` (definición completa con `expandirObjeto`), Zurrón y Voces
(`session.t`), toasts, notas del Cuaderno y acta guardada (`Session`).

## Aspecto

- Presets: texturas `char-renata`, `char-ramiro`, `char-ariel`, `char-cruz` (reales si
  existen en `public/assets/sprites/`, provisionales si no) y retratos
  `portraits/<preset>-<expresion>.png`.
- Personalizado: `lookDesdePersonalizado(custom)` → `bakeCharacterLook(scene, 'char-custom',
look)` en `WorldScene`; el retrato se genera del sprite (`portraitSrc` con id `custom`;
  `invalidatePortrait('custom')` al empezar o cargar). El creador del menú dibuja la vista
  previa con `renderLook` sin Phaser.
- Arte real por capas para el creador: pendiente (`docs/arte/02-FICHAS-PERSONAJES.md` §
  «Creador de personaje»).

## Menú

`src/ui/NuevaPartida.tsx`: paso «¿Quién es Iriarte?» (cuatro tarjetas + Personalizado) →
creador (piel, pelo, colores, accesorio, vista previa) → nombre y tratamiento → `newGame`.
`?ep=<id>` en la URL fuerza el episodio (uso en pruebas).

## Pruebas

`tests/core/texto/plantilla.test.ts` y `e2e/protagonista.spec.ts` (Ramiro y personalizado).
