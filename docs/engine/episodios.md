# Episodios: manifiesto, beats, fin de episodio y escenas clave

## Manifiesto (`content/<ep>/manifest.json`)

| Campo | Qué hace |
|-------|----------|
| `entry` | Mapa y punto de aparición iniciales. |
| `flagsInit` | Flags del episodio con su valor inicial. Todo flag leído por diálogos o beats debe estar aquí o ser escrito por el motor (`audiencia.<id>.ganada`, `pacto.<id>.firmado`, `pacto.<id>.equilibrio`). |
| `beats` | Disparadores → acciones. Tipos: `episodeStart`, `enterMap`, `interact` (objeto `trigger` del mapa), `flag`, `evidence`, `audienciaWon`, `pactoSigned`. `once: true` los marca en `state.beatsDone`. |
| `legitimidad` | Valor inicial de la región e hitos (`at` → `mapState`). |
| `codice` | Entradas que Renata **ya conoce al empezar aquí**. Se desbloquean en `newGame` y al continuar desde el episodio anterior (unión). Sirve para que un episodio se pueda empezar suelto sin quedarse sin normas. |
| `party` | Compañía inicial; al continuar se une a la que traía. |
| `ending` | `cutscene` de cierre y `nextEpisode` opcional. El validador exige que exista. |

## Fin de episodio (`Session.endEpisode`)

La acción `endEpisode` (normalmente última del beat `pactoSigned` o del beat final):

1. Si `ending.nextEpisode` existe y está `released` en `content/index.json`: carga el
   siguiente episodio y conserva `evidence`, `evidenceCotejada`, `voces`, `codice`,
   `legitimidad` (por región), `party`, `confianza`, `pactos`, `notas`, `beatsDone` y
   `consultasResueltas`. Reinicia `mapStates` (los nombres de mapa se repiten entre
   episodios), suma un día, une `flagsInit` y `codice` del nuevo manifiesto, guarda en la última
   ranura y dispara `episodeStart` + `enterMap`.
2. Si no hay siguiente: detiene el mundo, vuelve a la escena `Title` (el menú DOM se reinicia en
   la lista al recibir `title:ready`) y muestra «Continuará…» o «Fin del episodio».

Pon `save` antes de `endEpisode` en el beat para que el estado final del episodio quede en
disco aunque el jugador cierre durante la transición.

## Mesa de conciliación con condición

Objeto `mesa` con propiedades `pacto`, `requiereFlag` y `textoBloqueo` (opcional). Si el flag
no está en `true`, la interacción solo muestra el toast de bloqueo. En `scripts/maps/lib.ts`:
`mesa(name, tx, ty, pacto, { requiereFlag, textoBloqueo })`.

## Escenas clave (lámina en diálogo)

Un nodo de diálogo con `lamina: "<id>"` hace que `DialogueBox` cubra la pantalla con
`illustrations/<id>.png` (o el provisional de `Session.provisionalLamina`) mientras dura la
conversación; la lámina se hereda por los nodos siguientes hasta que otro nodo declare otra
(`lamina: ""` la retira). `assets:scan` la incluye en la lista de láminas esperadas.

## Sondas y pruebas

- `e2e/ep01.spec.ts`: Episodio 1 completo por la interfaz (audiencia jugada, acta firmada,
  fin de episodio). Los desplazamientos se atajan con `session.runActions`.
- `scripts/dev/probe-ep01.mjs` y `probe-transicion.mjs`: sondas con capturas para revisar
  mapas y flujo tras un `npm run build`. En una sonda nunca se espera la promesa de
  `runActions` cuando la acción abre un modal (solo resuelve al cerrarse): envuélvela en
  `void`.
