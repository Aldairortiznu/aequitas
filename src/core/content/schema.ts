import { z } from 'zod';

/**
 * Esquemas de contenido (zod). Son el contrato entre el guion y el motor:
 * docs/design/06-arquitectura.md §4. Todo paquete de episodio se valida contra ellos
 * al cargarse y en CI (scripts/validate-content.ts).
 *
 * Convenciones:
 * - IDs en kebab-case, con prefijo de episodio cuando pertenecen a uno: `ep01-acta-marrugo`.
 * - IDs del Códice: `cp-29`, `cc-1513`, `cco-622`, `cst-23`, `l675-47`, `l472-12`, `t-622-2016`.
 * - Texto de diálogo: máximo tres líneas (~160 caracteres).
 */

export const ID_REGEX = /^[a-z0-9][a-z0-9-]*$/;
export const IdSchema = z.string().regex(ID_REGEX, 'id en kebab-case (a-z, 0-9, guiones)');
export const FlagNameSchema = z
  .string()
  .regex(/^[a-z0-9][a-zA-Z0-9_.-]*$/, 'nombre de flag (letras, números, punto, guion)');

export const MAX_DIALOGUE_TEXT = 220;
export const SOFT_DIALOGUE_TEXT = 160;

export const MapStateSchema = z.enum(['ceniza', 'brote', 'verdor', 'floracion']);
export type MapState = z.infer<typeof MapStateSchema>;

export const FlagValueSchema = z.union([z.string(), z.number(), z.boolean()]);
export type FlagValue = z.infer<typeof FlagValueSchema>;

// ---------------------------------------------------------------------------
// Condiciones y acciones (compartidas por beats, diálogos y cláusulas)
// ---------------------------------------------------------------------------

export const ConditionSchema = z.union([
  z.strictObject({
    flag: FlagNameSchema,
    op: z.enum(['eq', 'ne', 'gte', 'lte']),
    value: FlagValueSchema,
  }),
  z.strictObject({ hasEvidence: IdSchema }),
  z.strictObject({ notEvidence: IdSchema }),
  z.strictObject({ inParty: IdSchema }),
  z.strictObject({ hasCodice: IdSchema }),
]);
export type Condition = z.infer<typeof ConditionSchema>;

export const ActionSchema = z.discriminatedUnion('type', [
  z.strictObject({ type: z.literal('dialogue'), id: IdSchema }),
  z.strictObject({ type: z.literal('cutscene'), id: IdSchema }),
  z.strictObject({ type: z.literal('setFlag'), flag: FlagNameSchema, value: FlagValueSchema }),
  z.strictObject({ type: z.literal('addEvidence'), id: IdSchema }),
  z.strictObject({ type: z.literal('removeEvidence'), id: IdSchema }),
  z.strictObject({ type: z.literal('unlockCodice'), id: IdSchema }),
  z.strictObject({ type: z.literal('registrarVoz'), id: IdSchema }),
  z.strictObject({
    type: z.literal('legitimidad'),
    delta: z.number().int(),
    region: IdSchema.optional(),
    fuente: z.enum(['audiencia', 'pacto', 'consulta', 'testimonio', 'folio', 'evento']).optional(),
  }),
  z.strictObject({ type: z.literal('startAudiencia'), id: IdSchema }),
  z.strictObject({ type: z.literal('startPacto'), id: IdSchema }),
  z.strictObject({ type: z.literal('setMapState'), map: IdSchema, state: MapStateSchema }),
  z.strictObject({ type: z.literal('teleport'), map: IdSchema, spawn: z.string().min(1) }),
  z.strictObject({ type: z.literal('joinParty'), companion: IdSchema }),
  z.strictObject({ type: z.literal('leaveParty'), companion: IdSchema }),
  z.strictObject({ type: z.literal('confianza'), companion: IdSchema, delta: z.number().int() }),
  z.strictObject({ type: z.literal('toast'), text: z.string().min(1).max(120) }),
  z.strictObject({ type: z.literal('save') }),
  z.strictObject({ type: z.literal('endEpisode') }),
]);
export type Action = z.infer<typeof ActionSchema>;

// ---------------------------------------------------------------------------
// Índice, personajes y regiones
// ---------------------------------------------------------------------------

export const EpisodeIndexEntrySchema = z.strictObject({
  id: IdSchema,
  title: z.string().min(1),
  region: IdSchema,
  released: z.boolean(),
  hidden: z.boolean().optional(),
  eta: z.string().optional(),
});

export const RegionSchema = z.strictObject({
  id: IdSchema,
  nombre: z.string().min(1),
  episodio: IdSchema.optional(),
});

export const ContentIndexSchema = z.strictObject({
  version: z.number().int().positive(),
  episodes: z.array(EpisodeIndexEntrySchema).min(1),
  regiones: z.array(RegionSchema).min(1),
});
export type ContentIndex = z.infer<typeof ContentIndexSchema>;

export const PersonajeSchema = z.strictObject({
  id: IdSchema,
  nombre: z.string(), // vacío solo para el narrador
  rol: z.enum(['protagonista', 'companero', 'adversario', 'biblioteca', 'secundario', 'sistema']),
  retratos: z.array(z.enum(['neutra', 'tensa', 'cordial'])).optional(),
  sprite: z.string().optional(),
  facultad: z.enum(['convocarTestigo', 'cotejo', 'objecion']).optional(),
});
export type Personaje = z.infer<typeof PersonajeSchema>;
export const PersonajesSchema = z.array(PersonajeSchema);

// ---------------------------------------------------------------------------
// Manifiesto y beats
// ---------------------------------------------------------------------------

export const BeatTriggerSchema = z.discriminatedUnion('type', [
  z.strictObject({ type: z.literal('episodeStart') }),
  z.strictObject({ type: z.literal('enterMap'), map: IdSchema }),
  z.strictObject({ type: z.literal('flag'), flag: FlagNameSchema, equals: FlagValueSchema }),
  z.strictObject({ type: z.literal('evidence'), id: IdSchema }),
  z.strictObject({ type: z.literal('audienciaWon'), id: IdSchema }),
  z.strictObject({
    type: z.literal('pactoSigned'),
    id: IdSchema,
    minEquilibrio: z.number().optional(),
  }),
  z.strictObject({ type: z.literal('interact'), object: z.string().min(1) }),
]);
export type BeatTrigger = z.infer<typeof BeatTriggerSchema>;

export const BeatSchema = z.strictObject({
  id: IdSchema,
  trigger: BeatTriggerSchema,
  requires: z.array(ConditionSchema).optional(),
  once: z.boolean().optional(),
  actions: z.array(ActionSchema).min(1),
});
export type Beat = z.infer<typeof BeatSchema>;

export const LegitimidadConfigSchema = z.strictObject({
  start: z.number().int().min(0).max(100),
  hitos: z
    .array(z.strictObject({ at: z.number().int().min(0).max(100), mapState: MapStateSchema }))
    .min(1),
});

export const EpisodeManifestSchema = z.strictObject({
  id: IdSchema,
  title: z.string().min(1),
  region: IdSchema,
  entry: z.strictObject({ map: IdSchema, spawn: z.string().min(1) }),
  maps: z.array(IdSchema).min(1),
  flagsInit: z.record(FlagNameSchema, FlagValueSchema).default({}),
  beats: z.array(BeatSchema),
  legitimidad: LegitimidadConfigSchema,
  party: z.array(IdSchema).default([]),
  /** Entradas del Códice que Renata ya conoce al empezar el episodio (base para empezar aquí). */
  codice: z.array(IdSchema).default([]),
  ending: z.strictObject({
    cutscene: IdSchema.optional(),
    nextEpisode: IdSchema.optional(),
  }),
});
export type EpisodeManifest = z.infer<typeof EpisodeManifestSchema>;

// ---------------------------------------------------------------------------
// Diálogo, consultas y testimonios
// ---------------------------------------------------------------------------

export const TestimonioSchema = z.strictObject({
  id: IdSchema,
  nombre: z.string().min(1),
  hecho: z.string().min(1).max(200),
  fecha: z.string().min(1),
});
export type Testimonio = z.infer<typeof TestimonioSchema>;

export const DialogueChoiceSchema = z.strictObject({
  text: z.string().min(1).max(90),
  next: IdSchema.optional(),
  requires: z.array(ConditionSchema).optional(),
  effects: z.array(ActionSchema).optional(),
});

export const DialogueNodeSchema = z.strictObject({
  id: IdSchema,
  speaker: IdSchema,
  portrait: z.enum(['neutra', 'tensa', 'cordial']).optional(),
  text: z.string().min(1).max(MAX_DIALOGUE_TEXT),
  requires: z.array(ConditionSchema).optional(),
  choices: z.array(DialogueChoiceSchema).min(2).max(4).optional(),
  next: IdSchema.optional(),
  effects: z.array(ActionSchema).optional(),
  consulta: IdSchema.optional(),
  testimonio: TestimonioSchema.optional(),
});
export type DialogueNode = z.infer<typeof DialogueNodeSchema>;

export const DialogueSchema = z.strictObject({
  id: IdSchema,
  nodes: z.array(DialogueNodeSchema).min(1),
});
export type Dialogue = z.infer<typeof DialogueSchema>;

export const ConsultaSchema = z.strictObject({
  id: IdSchema,
  pregunta: z.string().min(1).max(MAX_DIALOGUE_TEXT),
  opciones: z
    .array(
      z.strictObject({
        texto: z.string().min(1).max(120),
        correcta: z.boolean(),
        respuesta: z.string().min(1).max(MAX_DIALOGUE_TEXT),
      }),
    )
    .length(3),
  codice: IdSchema.optional(),
});
export type Consulta = z.infer<typeof ConsultaSchema>;
export const ConsultasSchema = z.array(ConsultaSchema);

// ---------------------------------------------------------------------------
// Evidencias y Códice
// ---------------------------------------------------------------------------

export const EvidenceSchema = z.strictObject({
  id: IdSchema,
  nombre: z.string().min(1).max(60),
  tipo: z.enum(['documento', 'objeto', 'testimonio', 'nota']),
  descripcion: z.string().min(1).max(300),
  icono: z.string().min(1),
  autentico: z.boolean().default(true),
  cotejo: z.strictObject({ revela: z.string().min(1).max(300) }).optional(),
});
export type Evidence = z.infer<typeof EvidenceSchema>;
export const EvidencesSchema = z.array(EvidenceSchema);

export const CODICE_ID_REGEX = /^(cp|cc|cco|cst|l\d+|d\d+|cgp|t|c|su|pr)-[a-z0-9-]+$/;
export const CodiceEntrySchema = z.strictObject({
  id: z
    .string()
    .regex(CODICE_ID_REGEX, 'id del Códice: cp-29, cc-1513, l675-47, t-622-2016, pr-buena-fe'),
  libro: z.enum([
    'constitucion',
    'civil',
    'comercio',
    'laboral',
    'ph',
    'especial',
    'jurisprudencia',
    'principios',
  ]),
  referencia: z.string().min(1).max(60),
  titulo: z.string().min(1).max(80),
  textoLiteral: z.string().min(1),
  esExtracto: z.boolean().default(false),
  enPalabrasSimples: z.string().min(1).max(400),
  usoEnAudiencia: z.string().min(1).max(240),
  ejemplo: z.string().max(300).optional(),
  fechaConsulta: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'fecha YYYY-MM-DD'),
  revisado: z.boolean().default(false),
  etiquetas: z.array(z.string().min(1)).default([]),
});
export type CodiceEntry = z.infer<typeof CodiceEntrySchema>;
export const CodiceFileSchema = z.array(CodiceEntrySchema);

// ---------------------------------------------------------------------------
// Audiencia
// ---------------------------------------------------------------------------

export const AfirmacionSolucionSchema = z.discriminatedUnion('tipo', [
  z.strictObject({ tipo: z.literal('hecho'), evidencia: z.array(IdSchema).min(1) }),
  z.strictObject({ tipo: z.literal('norma'), codice: z.array(z.string()).min(1) }),
  z.strictObject({
    tipo: z.literal('combinacion'),
    evidencia: z.array(IdSchema).min(1),
    codice: z.array(z.string()).min(1),
    parcial: z
      .strictObject({
        evidencia: z.array(IdSchema).optional(),
        codice: z.array(z.string()).optional(),
        respuesta: z.string().min(1).max(MAX_DIALOGUE_TEXT),
      })
      .optional(),
  }),
  z.strictObject({
    tipo: z.literal('cierta'),
    presionesNecesarias: z.number().int().min(1).max(4),
    efectoPosicion: z.number().int().min(0),
  }),
]);

export const AfirmacionSchema = z.strictObject({
  id: IdSchema,
  texto: z.string().min(1).max(MAX_DIALOGUE_TEXT),
  presionar: z
    .array(
      z.strictObject({
        respuesta: z.string().min(1).max(MAX_DIALOGUE_TEXT),
        revela: z
          .strictObject({
            afirmacion: IdSchema.optional(),
            evidencia: IdSchema.optional(),
          })
          .optional(),
      }),
    )
    .max(3)
    .optional(),
  solucion: AfirmacionSolucionSchema,
  danoPosicion: z.number().int().min(1).optional(),
  derechoFundamental: z.boolean().optional(),
  /** Evidencia falsa que sostiene la afirmación; el Cotejo de Prudencio la expone. */
  documentoFalso: IdSchema.optional(),
  respuestas: z.strictObject({
    plena: z.string().min(1).max(MAX_DIALOGUE_TEXT),
    parcial: z.string().min(1).max(MAX_DIALOGUE_TEXT).optional(),
    fallida: z.string().min(1).max(MAX_DIALOGUE_TEXT),
  }),
  nota: z.string().min(1).max(240),
  repasa: IdSchema.optional(),
  oculta: z.boolean().optional(),
});
export type Afirmacion = z.infer<typeof AfirmacionSchema>;

export const ManiobraSchema = z.strictObject({
  id: IdSchema,
  texto: z.string().min(1).max(MAX_DIALOGUE_TEXT),
  respuestaNorma: z.string().optional(),
  costoTension: z.number().int().min(0),
  objecionTexto: z.string().min(1).max(MAX_DIALOGUE_TEXT),
  tras: IdSchema.optional(),
});

export type Maniobra = z.infer<typeof ManiobraSchema>;

export const RondaSchema = z.strictObject({
  id: IdSchema,
  titulo: z.string().max(60).optional(),
  afirmaciones: z.array(AfirmacionSchema).min(1),
  maniobra: ManiobraSchema.optional(),
});

export type Ronda = z.infer<typeof RondaSchema>;

export const AudienciaSchema = z.strictObject({
  id: IdSchema,
  titulo: z.string().min(1).max(80),
  adversario: z.strictObject({
    id: IdSchema,
    nombre: z.string().min(1),
    posicion: z.number().int().min(10),
    medidor: z.string().max(20).optional(),
  }),
  tension: z.strictObject({
    inicial: z.number().int().min(0).max(100),
    provocacionPorRonda: z.number().int().min(0).default(5),
  }),
  credibilidad: z.number().int().min(1).max(5).default(3),
  facultades: z
    .strictObject({
      pilar: z.number().int().min(0).optional(),
      prudencio: z.number().int().min(0).optional(),
      gerineldo: z.number().int().min(0).optional(),
    })
    .default({}),
  rondas: z.array(RondaSchema).min(1),
  invocacion: z
    .strictObject({
      afirmacion: IdSchema,
      opciones: z.array(z.string()).length(4),
      correcta: z.string(),
    })
    .optional(),
  final: z.strictObject({
    allanamiento: IdSchema,
    tumulto: IdSchema,
    sesionLevantada: IdSchema,
  }),
  finAlternativo: z
    .strictObject({ tipo: z.literal('irreversible'), texto: z.string().min(1) })
    .optional(),
  zurronGlobal: z.boolean().optional(),
});
export type Audiencia = z.infer<typeof AudienciaSchema>;

// ---------------------------------------------------------------------------
// Pacto
// ---------------------------------------------------------------------------

export const InteresSchema = z.union([
  z.literal(-2),
  z.literal(-1),
  z.literal(0),
  z.literal(1),
  z.literal(2),
]);

export const ClausulaSchema = z
  .strictObject({
    id: IdSchema,
    texto: z.string().min(1).max(160),
    textoActa: z.string().min(1).max(400),
    legal: z.boolean(),
    nula: z
      .strictObject({ norma: z.string().min(1), explicacion: z.string().min(1).max(300) })
      .optional(),
    intereses: z.record(IdSchema, InteresSchema),
    justicia: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
    efectos: z.array(ActionSchema).optional(),
  })
  .refine((c) => c.legal === !c.nula, {
    message: 'una cláusula nula debe llevar `nula` y una válida no',
  });
export type Clausula = z.infer<typeof ClausulaSchema>;

export const PuntoSchema = z.strictObject({
  id: IdSchema,
  pregunta: z.string().min(1).max(160),
  bloque: z.string().max(60).optional(),
  clausulas: z.array(ClausulaSchema).min(2).max(4),
});

export type Punto = z.infer<typeof PuntoSchema>;

export const PactoSchema = z.strictObject({
  id: IdSchema,
  titulo: z.string().min(1).max(80),
  partes: z
    .array(
      z.strictObject({
        id: IdSchema,
        nombre: z.string().min(1),
        pide: z.string().min(1).max(160),
        necesita: z.string().min(1).max(160),
      }),
    )
    .min(2),
  puntos: z.array(PuntoSchema).min(1).max(12),
  acta: z.strictObject({
    encabezado: z.string().min(1),
    cierre: z.string().min(1),
  }),
  region: IdSchema.optional(),
});
export type Pacto = z.infer<typeof PactoSchema>;

// ---------------------------------------------------------------------------
// Interpelaciones (banco global)
// ---------------------------------------------------------------------------

export const InterpelacionSchema = z.strictObject({
  id: IdSchema,
  articulo: z.string(),
  texto: z.string().min(1).max(MAX_DIALOGUE_TEXT),
  opciones: z.array(z.string()).length(4),
  acierto: z.string().min(1).max(300),
  fallo: z.string().min(1).max(300),
});
export type Interpelacion = z.infer<typeof InterpelacionSchema>;
export const InterpelacionesSchema = z.array(InterpelacionSchema);

// ---------------------------------------------------------------------------
// Cinemáticas (láminas)
// ---------------------------------------------------------------------------

export const CutsceneSchema = z.strictObject({
  id: IdSchema,
  laminas: z
    .array(
      z.strictObject({
        imagen: z.string().min(1),
        texto: z.string().min(1).max(400),
        duracionMs: z.number().int().min(0).optional(),
      }),
    )
    .min(1),
  musica: z.string().optional(),
  saltable: z.boolean().default(true),
});
export type Cutscene = z.infer<typeof CutsceneSchema>;

// ---------------------------------------------------------------------------
// Mapas de Tiled (subconjunto que usa el motor)
// ---------------------------------------------------------------------------

export const TiledPropertySchema = z.object({
  name: z.string(),
  type: z.string().optional(),
  value: z.unknown(),
});

export const TiledObjectSchema = z
  .object({
    id: z.number().int(),
    name: z.string(),
    type: z.string().optional(),
    class: z.string().optional(),
    x: z.number(),
    y: z.number(),
    width: z.number().optional(),
    height: z.number().optional(),
    polyline: z.array(z.object({ x: z.number(), y: z.number() })).optional(),
    properties: z.array(TiledPropertySchema).optional(),
  })
  .loose();
export type TiledObject = z.infer<typeof TiledObjectSchema>;

export const TiledLayerSchema = z
  .object({
    name: z.string(),
    type: z.enum(['tilelayer', 'objectgroup', 'imagelayer', 'group']),
    data: z.array(z.number().int()).optional(),
    objects: z.array(TiledObjectSchema).optional(),
    visible: z.boolean().optional(),
    properties: z.array(TiledPropertySchema).optional(),
  })
  .loose();

export const TiledMapSchema = z
  .object({
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    tilewidth: z.literal(16),
    tileheight: z.literal(16),
    layers: z.array(TiledLayerSchema).min(1),
    tilesets: z
      .array(
        z
          .object({
            firstgid: z.number().int().positive(),
            name: z.string(),
          })
          .loose(),
      )
      .min(1),
    properties: z.array(TiledPropertySchema).optional(),
  })
  .loose();
export type TiledMap = z.infer<typeof TiledMapSchema>;

export const REQUIRED_TILE_LAYERS = ['suelo', 'colision'] as const;
export const OBJECT_LAYER = 'objetos';
export const OBJECT_TYPES = [
  'spawn',
  'npc',
  'evidence',
  'folio',
  'door',
  'trigger',
  'atril',
  'mesa',
  'patrol',
  'mecanismo',
] as const;
export type ObjectType = (typeof OBJECT_TYPES)[number];

/** Devuelve el tipo de un objeto de Tiled (compatible con `type` y `class`). */
export function tiledObjectType(o: TiledObject): string {
  return (o.class ?? o.type ?? '').trim();
}

/** Devuelve una propiedad de Tiled como texto, o undefined. */
export function tiledProp(
  o: { properties?: { name: string; value: unknown }[] },
  name: string,
): string | undefined {
  const p = o.properties?.find((x) => x.name === name);
  if (p === undefined || p.value === undefined || p.value === null) return undefined;
  return String(p.value);
}

// ---------------------------------------------------------------------------
// Paquete de episodio completo (en memoria)
// ---------------------------------------------------------------------------

export interface EpisodePackage {
  manifest: EpisodeManifest;
  dialogues: Record<string, Dialogue>;
  evidence: Record<string, Evidence>;
  audiencias: Record<string, Audiencia>;
  pactos: Record<string, Pacto>;
  consultas: Record<string, Consulta>;
  cutscenes: Record<string, Cutscene>;
  maps: Record<string, TiledMap>;
}
