# AEQUITAS — guía para Claude

## Qué es este proyecto

RPG educativo de derecho colombiano (Bellium S.A.S. · Editorial Al Resuelve).
Phaser 3.90 + TypeScript + Vite 7 + Preact. El diseño completo está en `docs/design/`.
Lee `docs/design/00-PLAN-MAESTRO.md` y el ticket asignado (`docs/design/07-backlog-opus.md`)
antes de tocar código. Las decisiones tomadas están en `docs/decisions.md`.

## Reglas

- Un ticket por sesión. Termina con pruebas en verde y un commit con el ID del ticket.
- `src/core` es lógica pura: sin Phaser, sin DOM. Todo motor devuelve `{ state, events }`.
  `engine` (Phaser) y `ui` (Preact) importan `core` y se comunican solo por `src/core/bus.ts`.
  `src/app` conecta las tres capas.
- El contenido vive en `content/` como JSON validado por zod (`src/core/content/schema.ts`).
  Nunca escribas texto de juego en código. Nunca escribas normas jurídicas en código.
- No cambies constantes de balance sin un ticket de balance.
- Texto del juego: español, frases cortas, sin sermones, sin nombres alegóricos. Sigue
  `docs/design/02-narrativa.md` §1 y §12. Máximo tres líneas por globo.
- Toda norma citada en contenido lleva `fechaConsulta` y `revisado: false` hasta que la
  revisión jurídica de Bellium la firme.
- Arte provisional generado por código hasta que llegue el arte final (decisión de F0). El arte
  real se produce con Antigravity + Nano Banana siguiendo `docs/arte/`; el motor lo carga por
  `public/assets/manifest.json` sin cambios de código. No modifiques las claves de textura
  (`char-<id>`, `tiles-<tileset>-<estado>`, `icon-<nombre>`): son el contrato con el arte.
- Antes de cerrar una épica, escribe o actualiza `docs/engine/<sistema>.md`.

## Elenco (aprobado)

Renata Iriarte (protagonista) · Petra Iriarte (su madre, la registradora) ·
Evaristo Moscote «el Registrador» · Pilar (lideresa comunal) · Prudencio (escribano) ·
Gerineldo (magistrado retirado) · Clemencia (rectora) · Nepomuceno (botánico) · Casimiro.
Apellidos solo cuando la trama los usa.

## Comandos

```
npm run dev              # servidor de desarrollo en http://localhost:5180
npm run build            # build de producción en dist/
npm run lint             # eslint
npm run typecheck        # tsc --noEmit
npm test                 # vitest (lógica pura y validador)
npm run test:coverage    # cobertura de src/core (umbral 90 %)
npm run validate:content # valida content/ (esquemas y referencias cruzadas)
npm run e2e              # playwright (humo en navegador; requiere build previo)
npm run check            # lint + typecheck + test + validate:content
npm run standalone       # copia autónoma local en dist-standalone/
npm run assets:scan      # qué arte real existe y qué falta; escribe public/assets/manifest.json
npm run assets:normalize # convierte materia prima (art-src/) al contrato de public/assets/
# Galería de arte: npm run dev y abrir http://localhost:5180/?escena=galeria
npm run gen:maps         # regenera los mapas (gym, ep00, ep01) desde scripts/maps/*.ts
node scripts/dev/probe-ep01.mjs   # sonda de humo del Ep. 1 en Chromium sin cabeza (requiere build)
```

Verificación en navegador: el panel de vista previa de la app no ejecuta `requestAnimationFrame`,
así que el juego se comprueba con Playwright sin cabeza (`npm run e2e` o las sondas de
`scripts/dev/`). Las sondas no deben esperar la promesa de `session.runActions` con un modal
abierto: solo resuelve cuando el modal se cierra.

El puerto 5173 lo usa el prototipo antiguo; este proyecto usa el 5180.

## Ramas

- `desarrollo`: trabajo diario. CI corre en cada push.
- `main`: solo lo publicable. El despliegue a GitHub Pages sale de aquí. Se reemplaza
  con `desarrollo` cuando hay algo jugable (Prólogo + Ep. 1).
- `prototipo-2026`: el prototipo anterior, archivado. No se toca.

## Convenciones

- IDs de contenido en kebab-case con prefijo de episodio: `ep01-acta-marrugo`.
- IDs del Códice: `cp-29`, `cc-1513`, `cco-622`, `cst-23`, `l675-47`, `l472-12`, `t-622-2016`,
  `pr-buena-fe` (principios).
- Protagonista variable (D10): en el contenido, el personaje `renata` es quien juega. Los
  textos usan `{nombre}`, `{apellido}` y formas `{femenino|masculino|neutro}`; la neutra se
  reformula sin marcar género (nunca `-e`). El validador exige tres formas. Ver
  `docs/engine/protagonista.md`.
- Flags: `episodio.nombre` (`gym.bienvenida`). El motor escribe `audiencia.<id>.ganada`,
  `pacto.<id>.firmado` y `pacto.<id>.equilibrio`.
- Mapas Tiled: capas `suelo`, `deco-baja`, `colision`, `deco-alta`, `objetos`; tiles de 16 px.
  Tipos de objeto y propiedades en `src/core/content/schema.ts` (`OBJECT_TYPES`) y en
  `scripts/maps/lib.ts` (constructor `MapBuilder`, índice `T` del tileset estándar).
- Manifiesto de episodio: `codice` son las entradas que Renata ya conoce al empezar ese episodio
  (se desbloquean al iniciar allí o al continuar desde el anterior); `ending.nextEpisode` solo
  si el siguiente existe y está `released` en `content/index.json`. `endEpisode` continúa con el
  estado acumulado o vuelve al título.
- Escenas clave: un nodo de diálogo con `lamina` muestra una ilustración a pantalla completa
  detrás de la caja; se reserva para aperturas, cierres y giros de trama.
- Commits: `feat(E5.2): ui de audiencia` · `content(G-01.3): audiencia marrugo` ·
  `fix(E1.4): compañeros en puertas` · `docs(engine): audiencia`.
- No uses `any`. No desactives reglas de lint sin justificación en el commit.
- Los tests de `core` viven en `tests/core/**`, espejo de `src/core/**`.
