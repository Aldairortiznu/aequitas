# AEQUITAS: El Retorno del Equilibrio
## Plan de ejecución y biblia de diseño · Temporada 1: «El Año Diez»

**Bellium S.A.S. · Editorial Al Resuelve · Cartagena de Indias**
Versión 1.0 · 12 de septiembre de 2026
Planificado con Claude Fable 5.1 para implementación con Claude Opus.

---

## Qué es este paquete

El plan fase por fase para producir el **juego real** de AEQUITAS (guion, motor, arte,
audio, revisión jurídica y lanzamientos) y los documentos de diseño que ese plan usa
como insumo. Reemplaza al prototipo; de él conserva solo las ideas fundacionales:
la premisa de la Gran Fractura y la Biblioteca de Bellium, cero violencia, justicia
restaurativa, la margarita como emblema y la estética 16-bit solarpunk en Phaser.

## Documentos

| # | Archivo | Qué es | Cuándo se usa |
|---|---------|--------|---------------|
| **0** | `00-PLAN-MAESTRO.md` | **El plan**: fases, roles, compuertas, proceso de guion, calendario, decisiones pendientes | Siempre. Empezar aquí |
| 1 | `01-vision.md` | Visión, pilares, público, qué cambia respecto al prototipo, métricas, riesgos | F0-F1 |
| 2 | `02-narrativa.md` | Biblia narrativa: principios de escritura, mundo, cronología, el Registrador, la Biblioteca, personajes, trama en tres actos, giros, prólogo, guía de voz | F1 (se congela) y en cada sesión de guion |
| 3 | `03-mecanicas.md` | Diseño de sistemas: exploración, Interpelación, Audiencia Dialéctica, Conciliación (Pacto), Reverdecer, Códice, dificultad, pedagogía | F1 (se congela) y F2 |
| 5 | `05-curriculo-juridico.md` | Mapa de conceptos por episodio, banco del Códice, lista de verificación jurídica, puntos que exigen verificación | F1 y en cada revisión jurídica |
| 6 | `06-arquitectura.md` | Stack, estructura del repositorio, flujo de eventos, esquemas de contenido, motores puros, Tiled, rendimiento, pruebas | F0 y F2 |
| 7 | `07-backlog-opus.md` | Tickets por fase con criterios de aceptación, plantilla de `CLAUDE.md`, prompts de arranque para Opus | F0 en adelante |
| 8 | `08-arte-audio.md` | Dirección de arte y audio, paleta, estados del mundo, UI, pipeline, presupuesto de activos | F4 y F6 |
| A | `anexo-A-tratamientos-borrador.md` | Primer borrador de los tratamientos por episodio (evidencias, audiencias, pactos). Insumo de F1, no guion definitivo | F1 |

## Resumen ejecutivo

**El juego.** Renata Iriarte, última egresada de la Escuela de la Biblioteca de Bellium,
sale a un litoral gobernado por Evaristo Moscote, «el Registrador», que reabrió la
Oficina de Registro con los folios que dice haber salvado del Borrado y desde entonces
decide quién existe y qué es de quién. Nueve episodios, un concepto jurídico central
por episodio, un misterio que atraviesa la temporada (quién borró los registros y por
qué) y un reloj (el Año Diez: a los diez años de posesión la tierra se gana por
prescripción, y el Registrador corre contra esa fecha).

**Cómo se juega.** Exploración e investigación; Interpelaciones a los alguaciles con
artículos de la Constitución; la Audiencia Dialéctica, donde cada afirmación del
adversario se contradice con **Norma + Hecho = Alegato**; la Conciliación, donde el
jugador redacta el acta eligiendo cláusulas y debe detectar las nulas; y el
Reverdecer, la transformación visible de cada región según la legitimidad del pacto.

**Cómo se produce.** Fase 0 preparación; Fase 1 biblia congelada y tratamientos;
Fases 2-4 en paralelo (motor, guion del Prólogo y Ep. 1, arte y audio); Fase 5
Lanzamiento 1; Fase 6 un ciclo de cinco semanas por episodio hasta el Lanzamiento 8.
Todo contenido jurídico pasa por revisión de un abogado de Bellium antes de cada
lanzamiento.

## Cómo usar este paquete con Opus

1. Crear el repositorio nuevo `aequitas` y copiar esta carpeta a `docs/design/`.
2. Copiar la plantilla `CLAUDE.md` de `07-backlog-opus.md` a la raíz del repositorio.
3. Resolver las decisiones pendientes de `00-PLAN-MAESTRO.md` §9.
4. Abrir una sesión de Opus por ticket con el prompt de arranque correspondiente
   (`07-backlog-opus.md`, final del documento). Empezar por E0.1.
5. Para el guion, seguir el proceso de `00-PLAN-MAESTRO.md` §5, un paso por sesión.
- `09-formas-de-aprender.md` — catálogo de mecánicas de aprendizaje y minijuegos por episodio, encaje en el motor y orden de construcción (13 sep 2026).
- `10-elementos-distopicos.md` — instituciones reales llevadas un paso más allá: el Sistema, el Parte de las Seis, los sin folio, el pagaré en blanco, la subasta de medianoche, el contrato de existencia, el silencio que borra, el Año Diez, el archivo sumergido, la ciénaga que recuerda y la señal que vuelve (13 sep 2026).
- `11-jugabilidad-y-formato.md` — diagnóstico de jugabilidad, referencias (Pokémon, Zelda, FF Tactics), modo guiado y decisión de formato (15 sep 2026).
- `12-estetica.md` — tres direcciones del arte construido por código (Esmeralda, Litoral, Grabado), comparación con capturas, recomendación y lo que sigue en jugabilidad (15 sep 2026).
