# 06 · Arquitectura técnica

## 1. Decisiones de stack

| Capa | Elección | Razón |
|------|----------|-------|
| Motor 2D | **Phaser 3.90** | Web, móvil, maduro, ya conocido por el equipo |
| Lenguaje | **TypeScript 5** (estricto) | Opus produce menos errores con tipos; los esquemas de contenido se derivan de los tipos |
| Empaquetado | **Vite 6** | Rápido, chunks por episodio, PWA con `vite-plugin-pwa` |
| UI de texto | **Preact** en una capa DOM sobre el canvas | Diálogo, Códice, Audiencia y Pacto son interfaces de texto; en DOM son legibles, escalables y accesibles |
| Validación de contenido | **zod** | Un solo origen para tipos y validación en tiempo de carga y en CI |
| Estado | Módulos puros + un bus de eventos (`mitt`) | Los motores de Audiencia y Pacto son funciones puras; Phaser y Preact solo escuchan |
| Mapas | **Tiled** (JSON) | Estándar; capas de objetos para spawns, folios, evidencias, puertas y triggers |
| Sprites | Hojas PNG + JSON (Aseprite) | Exportación directa |
| Audio | Phaser Sound (WebAudio) con OGG y MP3 | Capas por región para Reverdecer |
| Pruebas | **Vitest** (lógica), **Playwright** (humo en navegador) | Los motores puros se prueban sin Phaser |
| CI/CD | GitHub Actions → GitHub Pages | Igual que el prototipo, ya probado |
| Guardado | `localStorage` con versión y migraciones; exportar/importar por código | Sin cuentas ni servidor |
| Analítica | Ninguna | Uso escolar; privacidad por defecto |

## 2. Estructura del repositorio

```
aequitas/
├── CLAUDE.md                     # Convenciones para Opus (plantilla en 07-backlog-opus.md)
├── docs/
│   ├── design/                   # Este paquete + tratamientos + guion por episodio
│   ├── engine/                   # Documentación de cada sistema (la escribe Opus al cerrar cada épica)
│   └── decisions.md              # Acta de decisiones
├── content/                      # CONTENIDO (datos), un directorio por episodio
│   ├── index.json                # Lista de episodios, orden, estado de lanzamiento
│   ├── codice/                   # Entradas del Códice (compartidas entre episodios)
│   ├── ep00/ ep01/ … ep08/
│   │   ├── manifest.json         # Mapas, beats, flags iniciales, hitos de Legitimidad
│   │   ├── dialogues/*.json
│   │   ├── evidence.json
│   │   ├── audiencias/*.json
│   │   ├── pactos/*.json
│   │   ├── consultas.json
│   │   └── maps/*.json           # Exportados de Tiled
│   └── gym/                      # Episodio de prueba sintético
├── public/assets/
│   ├── sprites/ tilesets/ portraits/ illustrations/ ui/ audio/
├── src/
│   ├── main.ts                   # Arranque; registro de escenas; montaje de la capa DOM
│   ├── config.ts                 # Resolución, paleta, constantes
│   ├── core/                     # LÓGICA PURA (sin Phaser, sin DOM)
│   │   ├── content/              # Esquemas zod, tipos, cargador y validador
│   │   ├── flags/                # Almacén de flags con condiciones
│   │   ├── evidence/             # Zurrón y Registro de Voces
│   │   ├── codice/
│   │   ├── audiencia/            # Reductor de estado de la Audiencia
│   │   ├── pacto/                # Evaluador del Pacto y generador de acta
│   │   ├── legitimidad/
│   │   ├── save/                 # Esquema de guardado, migraciones, exportación
│   │   └── bus.ts                # Bus de eventos tipado
│   ├── engine/                   # PHASER
│   │   ├── scenes/               # Boot, Preload, World, Cutscene
│   │   ├── world/                # Cargador de Tiled, jugador, compañeros, patrullas, interactuables, estados de mapa
│   │   └── audio/
│   ├── ui/                       # PREACT (capa DOM)
│   │   ├── DialogueBox, Zurron, Codice, Audiencia, Pacto, Cuaderno, MapaLitoral, Interpelacion, Settings, Gamepad
│   └── app/                      # Orquestación: qué escena/UI abrir ante cada evento del bus
├── scripts/
│   ├── validate-content.ts       # Valida todos los paquetes y las referencias cruzadas
│   └── build-standalone.ts       # Copia autónoma local
├── tests/                        # Vitest (core) y Playwright (humo)
└── .github/workflows/            # ci.yml (lint, test, validate), deploy.yml (Pages)
```

Regla de dependencia: `core` no importa nada de `engine` ni de `ui`. `engine` y `ui`
importan `core` y se comunican solo por el bus. `app` conecta.

## 3. Flujo de eventos

```
Phaser World ──(interact:npc)──► app ──► ui.DialogueBox
ui.DialogueBox ──(effect:startAudiencia)──► app ──► core.audiencia.create() ──► ui.Audiencia
ui.Audiencia ──(action)──► core.audiencia.reduce(state, action) ──► (state, events[])
events[] ──► ui (animaciones, notas), core.cuaderno (notas), core.legitimidad, bus
core.audiencia (allanamiento) ──► app ──► ui.Pacto
core.pacto (firmado) ──► core.legitimidad.add() ──► engine.world.setMapState()
```

Los motores puros devuelven siempre `{ state, events }`. Ningún motor puro llama a
la UI ni a Phaser.

## 4. Esquemas de contenido (contrato entre guion y motor)

Se definen en `src/core/content/schema.ts` con zod; aquí, en TypeScript, los
esenciales. El validador rechaza referencias a IDs inexistentes.

```ts
// content/index.json
type ContentIndex = {
  episodes: { id: string; title: string; region: string; released: boolean; eta?: string }[];
};

// content/epXX/manifest.json
type EpisodeManifest = {
  id: string;                     // "ep01"
  title: string;
  region: string;                 // "altamar"
  entry: { map: string; spawn: string };
  maps: string[];
  flagsInit: Record<string, boolean | number | string>;
  beats: Beat[];                  // orquestación del episodio
  legitimidad: { start: number; hitos: { at: number; mapState: MapState }[] };
  party: string[];                // compañeros presentes
  codice: string[];               // entradas desbloqueables aquí
  ending: { cutscene: string; nextEpisode?: string };
};

type Beat = {
  id: string;
  trigger:
    | { type: "enterMap"; map: string }
    | { type: "flag"; flag: string; equals: unknown }
    | { type: "evidence"; id: string }
    | { type: "audienciaWon"; id: string }
    | { type: "pactoSigned"; id: string; minEquilibrio?: number }
    | { type: "interact"; object: string };
  once?: boolean;
  actions: Action[];
};

type Action =
  | { type: "dialogue"; id: string }
  | { type: "cutscene"; id: string }
  | { type: "setFlag"; flag: string; value: unknown }
  | { type: "addEvidence"; id: string }
  | { type: "unlockCodice"; id: string }
  | { type: "registrarVoz"; id: string }
  | { type: "legitimidad"; delta: number }
  | { type: "startAudiencia"; id: string }
  | { type: "startPacto"; id: string }
  | { type: "setMapState"; map: string; state: MapState }
  | { type: "teleport"; map: string; spawn: string }
  | { type: "joinParty"; companion: string }
  | { type: "endEpisode" };

// content/epXX/dialogues/*.json
type Dialogue = { id: string; nodes: DialogueNode[] };
type DialogueNode = {
  id: string;
  speaker: string;                // "renata" | "pilar" | npc id
  portrait?: string;              // "neutra" | "tensa" | "cordial"
  text: string;                   // ≤ 3 líneas
  requires?: Condition[];
  choices?: { text: string; next: string; requires?: Condition[]; effects?: Action[] }[];
  next?: string;
  effects?: Action[];
  consulta?: { question: string; options: { text: string; correct: boolean; reply: string }[]; codice?: string };
  testimonio?: { id: string; nombre: string; hecho: string; fecha: string };
};
type Condition = { flag: string; op: "eq" | "ne" | "gte" | "lte"; value: unknown } | { hasEvidence: string } | { inParty: string };

// content/epXX/evidence.json
type Evidence = {
  id: string; nombre: string;
  tipo: "documento" | "objeto" | "testimonio" | "nota";
  descripcion: string; icono: string;
  autentico: boolean;
  cotejo?: { revela: string };    // texto que muestra Prudencio
};

// content/codice/*.json
type CodiceEntry = {
  id: string;                     // "cp-29", "cc-1513", "cco-622", "l675-47"
  libro: "constitucion" | "civil" | "comercio" | "laboral" | "ph" | "especial" | "jurisprudencia" | "principios";
  referencia: string;             // "Art. 29 C.P."
  titulo: string;
  textoLiteral: string;           // extracto marcado como tal
  enPalabrasSimples: string;      // 2-3 líneas
  usoEnAudiencia: string;         // 1-2 líneas
  ejemplo?: string;
  fechaConsulta: string;          // "2026-10-01" (revisión jurídica)
  etiquetas: string[];
};

// content/epXX/audiencias/*.json
type Audiencia = {
  id: string;
  adversario: { id: string; nombre: string; posicion: number };
  tension: { inicial: number; provocacionPorRonda: number };
  credibilidad: number;           // 3 por defecto
  facultades: { pilar?: number; prudencio?: number; gerineldo?: number };
  rondas: Ronda[];
  invocacion: { afirmacion: string; opciones: string[]; correcta: string };
  final: { allanamiento: string; tumulto: string; sesionLevantada: string };   // ids de diálogo
  finAlternativo?: { tipo: "irreversible"; texto: string };                    // Ep. 7
  zurronGlobal?: boolean;                                                     // Ep. 7
};
type Ronda = { id: string; afirmaciones: Afirmacion[]; maniobra?: Maniobra };
type Afirmacion = {
  id: string; texto: string;
  presionar?: { respuesta: string; revela?: { afirmacion?: string; evidencia?: string } }[];  // secuencia de presiones
  solucion:
    | { tipo: "hecho"; evidencia: string[] }
    | { tipo: "norma"; codice: string[] }
    | { tipo: "combinacion"; evidencia: string[]; codice: string[]; parcial?: { evidencia?: string[]; codice?: string[]; respuesta: string } }
    | { tipo: "cierta"; presionesNecesarias: number; efectoPosicion: number };
  danoPosicion?: number;          // 25 por defecto
  respuestas: { plena: string; parcial?: string; fallida: string };
  nota: string;                   // 2 líneas para el Cuaderno
  repasa?: string;                // id de episodio anterior (regla de autoría 4)
};
type Maniobra = { texto: string; respuestaNorma?: string; costoTension: number; objecionTexto: string };

// content/epXX/pactos/*.json
type Pacto = {
  id: string; titulo: string;
  partes: { id: string; nombre: string; pide: string; necesita: string }[];
  puntos: Punto[];
  acta: { encabezado: string; cierre: string };
  umbral: { ejemplar: 85; solido: 60; fragil: 40 };
};
type Punto = { id: string; pregunta: string; clausulas: Clausula[] };
type Clausula = {
  id: string; texto: string; textoActa: string;
  legal: boolean; nula?: { norma: string; explicacion: string };
  intereses: Record<string, -2 | -1 | 0 | 1 | 2>;
  justicia: 0 | 1 | 2 | 3;
  efectos?: Action[];
};

// Estados de mapa
type MapState = "ceniza" | "brote" | "verdor" | "floracion";

// Guardado
type SaveV1 = {
  version: 1; slot: number; savedAt: string;
  episode: string; map: string; spawn: string; playerName: string;
  flags: Record<string, unknown>;
  evidence: string[]; voces: { id: string; nombre: string; hecho: string; fecha: string }[];
  codice: string[]; codiceUsedIn: Record<string, string[]>;
  legitimidad: Record<string, number>;
  party: string[]; confianza: Record<string, number>;
  pactos: Record<string, { equilibrio: number; clausulas: string[]; impugnado: boolean }>;
  cuaderno: Record<string, { notas: string[]; repaso?: number }>;
  settings: { modo: "estudio" | "normal" | "jurista"; textScale: number; font: "pixel" | "legible"; modoAula: boolean };
};
```

## 5. Motores puros (especificación mínima)

### `core/audiencia`

- `create(def: Audiencia, ctx: { evidence: string[]; codice: string[]; party: string[] }): AudienciaState`
- `reduce(state, action): { state; events }` con acciones `presionar`, `presentarHecho`,
  `presentarNorma`, `fundamentar`, `facultad`, `invocar`, `objetar`, `siguiente`,
  `anterior`.
- Eventos: `contradiccion:plena|parcial|fallida`, `posicion`, `tension`,
  `credibilidad`, `maniobra`, `objecion`, `nota`, `allanamiento`, `tumulto`,
  `sesionLevantada`, `finAlternativo`.
- Reglas numéricas en `03-mecanicas.md` §4; todas parametrizables por constantes en
  `config.ts` para balance.
- Pruebas: una por regla de autoría y una por cada transición de estado; fixture con
  el episodio de prueba.

### `core/pacto`

- `evaluate(def: Pacto, elegidas: Record<puntoId, clausulaId>, marcadasNulas: string[]): { equilibrio; desglose; nulasFirmadas; nulasDetectadas; resultado }`
- `renderActa(def, elegidas, fecha): string`
- Pruebas: fórmula de Equilibrio, umbrales, impugnación.

### `core/legitimidad`

- `add(region, delta, fuente)` con topes por fuente (Consultas máx. 18, etc.) y
  cálculo de hito; emite `hito` cuando cambia el estado de mapa.

### `core/save`

- `save(slot, state)`, `load(slot)`, `migrate(raw): SaveV1`, `exportCode(state): string`,
  `importCode(code): state`. Migraciones registradas por versión; prueba que todo
  guardado de la versión N-1 migra.

### `core/content`

- `loadEpisode(id)` con `import()` dinámico del paquete; validación zod; caché.
- `validateAll()` para el script de CI: referencias cruzadas (evidencias usadas en
  audiencias existen; entradas del Códice referenciadas existen; flags leídos se
  escriben; mapas referenciados existen; spawns existen en el mapa).

## 6. Convenciones de Tiled

- Tamaño de tile: 16 px. Resolución lógica 480×270, escala entera.
- Capas: `suelo`, `deco-baja`, `colision` (capa de tiles con propiedad `solid`),
  `deco-alta` (se dibuja sobre el jugador), `objetos`.
- Objetos (capa `objetos`) con `type`: `spawn` (name), `npc` (id, dialogue,
  facing), `evidence` (id), `folio` (codice), `door` (target map, spawn, requires),
  `trigger` (beat), `atril`, `mesa`, `patrol` (polyline, rank), `mecanismo` (kind).
- Estados de mapa: un tileset por región con cuatro columnas de variantes
  (`ceniza`, `brote`, `verdor`, `floracion`) y una tabla de equivalencia de GIDs;
  el motor sustituye GIDs al cambiar de estado. Decorados por estado en capas
  `deco-<estado>` que se activan/desactivan.

## 7. Rendimiento y presupuesto

| Presupuesto | Valor |
|-------------|-------|
| Carga inicial (motor + UI + prólogo) | ≤ 3 MB comprimidos |
| Paquete de episodio (datos + mapas + arte + audio) | ≤ 6 MB |
| Cuadros por segundo en Android de gama media (2023) | 60 estables en mundo; UI DOM sin jank |
| Tiempo de arranque en 4G | ≤ 4 s hasta el menú |
| Memoria | ≤ 200 MB en móvil |

Técnicas: atlas por región, audio en capas cortas en bucle, `import()` por episodio,
descarga de texturas al cambiar de región, PWA con caché de episodios jugados.

## 8. Pruebas y calidad

- `npm run lint`, `npm run typecheck`, `npm test` (Vitest), `npm run validate:content`,
  `npm run e2e` (Playwright: arranque, prólogo hasta la primera Audiencia, guardar y
  recargar).
- CI en cada PR; despliegue a Pages solo desde `main` con etiqueta.
- Cobertura mínima de `core`: 90 %.
- Playtest manual por lanzamiento (lista en `00-PLAN-MAESTRO.md` §7).

## 9. Versionado y lanzamientos

- Semántico por lanzamiento: `v1.0.0` (L1), `v1.1.0` (L2), … Correcciones `v1.1.x`.
- `content/index.json` marca `released` por episodio; el mapa del Litoral lee `eta`.
- Cada lanzamiento incluye migración de guardado si el esquema cambió.
- Copia autónoma local (`scripts/build-standalone.ts`) genera la carpeta ejecutable sin
  conexión y el lanzador `.bat`.
