# 07 · Backlog para Opus, `CLAUDE.md` y prompts de arranque

Los tickets están agrupados por fase del plan maestro. Cada ticket se cierra en una
sesión de Opus con sus criterios de aceptación cumplidos, pruebas en verde y un
commit. El orden dentro de cada épica es el orden de ejecución.

---

## Fase F0 · Preparación

### E0 · Andamiaje

| ID | Ticket | Criterios de aceptación |
|----|--------|-------------------------|
| E0.1 | Crear repositorio `aequitas` con Vite + TypeScript estricto + Phaser 3.90 + Preact | `npm run dev` muestra el título sobre fondo de la paleta; `npm run build` genera `dist/` con base relativa |
| E0.2 | Lint, formato, typecheck, Vitest, Playwright | Scripts `lint`, `typecheck`, `test`, `e2e` en verde; un test de ejemplo por herramienta |
| E0.3 | CI (lint + typecheck + test + validate) y despliegue a GitHub Pages desde `main` | PR de prueba pasa CI; Pages sirve el build |
| E0.4 | Esquemas zod de contenido (`06-arquitectura.md` §4) y `scripts/validate-content.ts` con referencias cruzadas | Falla ante un ID inexistente, un flag leído nunca escrito, un mapa o spawn ausente; pasa con `content/gym` mínimo |
| E0.5 | `CLAUDE.md` (plantilla abajo), `docs/` con este paquete, `docs/decisions.md` | Presentes en el repo |
| E0.6 | Copia autónoma local (`scripts/build-standalone.ts`) y lanzador `.bat` | Abre el juego sin conexión desde una carpeta |

## Fase F2 · Motor (vertical slice técnico)

### E1 · Mundo

| ID | Ticket | Criterios de aceptación |
|----|--------|-------------------------|
| E1.1 | Cargador de mapas Tiled con las capas y objetos de la convención (§6) | Carga `gym/maps/plaza.json`; colisiones funcionan; objetos instanciados por tipo |
| E1.2 | Jugador: 8 direcciones, correr, animaciones, cámara con límites y zoom entero | Se mueve sin temblor de píxel; cámara sigue con suavizado |
| E1.3 | Interactuables: NPC, evidencia, folio, puerta con requisito, trigger, atril, mesa | Cada tipo emite su evento en el bus; icono de interacción aparece en rango |
| E1.4 | Compañeros en fila con pathing simple; hablarles abre su diálogo de pista | Tres compañeros siguen sin atascarse en puertas |
| E1.5 | Mando táctil DOM (cruceta y A/B), detección de móvil, orientación | Jugable en Android y iOS en vertical y horizontal; se oculta durante UI |
| E1.6 | Estados de mapa: sustitución de GIDs por tabla y capas `deco-<estado>` | `setMapState("verdor")` cambia el mapa sin recarga |
| E1.7 | Patrullas con ruta y cono de visión; evento `interpelacion` al detectar | Cono visible en modo depuración; detección fiable |

### E2 · Diálogo

| ID | Ticket | Criterios de aceptación |
|----|--------|-------------------------|
| E2.1 | Intérprete de diálogos (nodos, condiciones, opciones, efectos) en `core` | Pruebas: condiciones por flag, evidencia y grupo; efectos encolados |
| E2.2 | Caja de diálogo Preact: retrato, nombre, texto por máquina, opciones, avance por tecla y toque | Legible a 100-160 % de escala; navegable por teclado y lector de pantalla |
| E2.3 | Consultas (pregunta, tres opciones, respuesta, efecto) y «Registrar testimonio» | Ambas rutas escriben en `core` y emiten Legitimidad |

### E3 · Zurrón, Códice, Registro de Voces

| ID | Ticket | Criterios de aceptación |
|----|--------|-------------------------|
| E3.1 | Almacenes de evidencias, testimonios y Códice en `core`, con «usado en» | Pruebas de alta, consulta y persistencia |
| E3.2 | Paneles Preact: Zurrón (por tipo, con Cotejo si Prudencio está), Códice (libros, buscador, glosario), Registro de Voces | Buscador responde < 50 ms con 120 entradas |
| E3.3 | Cuaderno: notas por episodio, repaso de cinco preguntas, acta, exportar certificado como imagen | Imagen PNG generada en canvas con nombre y conceptos |

### E4 · Interpelación

| ID | Ticket | Criterios de aceptación |
|----|--------|-------------------------|
| E4.1 | Lógica en `core`: afirmación, cuatro artículos, rangos, temporizador opcional | Pruebas de cada rango y de acierto/fallo |
| E4.2 | UI mínima y flujo de detención (fundido, Atril, nota de detención al Zurrón) | Sin pérdida de progreso; la nota existe como evidencia |

### E5 · Audiencia

| ID | Ticket | Criterios de aceptación |
|----|--------|-------------------------|
| E5.1 | Reductor puro `core/audiencia` con todas las acciones, medidores y eventos de `03-mecanicas.md` §4, incluidas afirmaciones «ciertas», maniobras, Objeción, Invocación, fin alternativo y Zurrón global | Cobertura ≥ 90 %; una prueba por regla numérica; fixture del episodio de prueba |
| E5.2 | UI Preact de Audiencia: afirmación actual, navegación, acciones, selector de hecho/norma/combinación, medidores con icono y patrón, retratos y gestos | Usable en 360 px de ancho; acciones por teclado |
| E5.3 | Pistas escalonadas y modo Estudio | Tras dos fallos, pista 1; tercera, pista 2; en Estudio siempre |
| E5.4 | Notas al Cuaderno y «usado en» del Códice | Cada contradicción plena genera nota y marca |
| E5.5 | Estados finales y reintento desde ronda (Tumulto, sesión levantada) y fin irreversible (Ep. 7) | Escenas breves; reintento restaura el estado de ronda |

### E6 · Pacto

| ID | Ticket | Criterios de aceptación |
|----|--------|-------------------------|
| E6.1 | `core/pacto`: evaluación, umbrales, generación del acta | Pruebas de fórmula, nulas firmadas y detectadas, acta con fecha del juego |
| E6.2 | UI Preact: partes (pide/necesita), puntos, cláusulas, marcar nula, firmar, acta | Flujo completo en móvil; acta legible |
| E6.3 | Impugnación posterior y revisión desde Atril | Al firmar con nula: escena, −20 Legitimidad, opción de revisar |
| E6.4 | Pacto sin Audiencia previa y pacto de dos bloques | Configurable por datos |

### E7 · Reverdecer

| ID | Ticket | Criterios de aceptación |
|----|--------|-------------------------|
| E7.1 | `core/legitimidad` con fuentes, topes e hitos | Pruebas de topes y de hitos |
| E7.2 | Hitos → estado de mapa, diálogos ambientales y capas de audio | Cambio visible y audible al cruzar 25/50/75 |
| E7.3 | Mapa del Litoral (Preact) con regiones, estado, próximo lanzamiento | Lee `content/index.json` |

### E8 · Guardado y episodios

| ID | Ticket | Criterios de aceptación |
|----|--------|-------------------------|
| E8.1 | `core/save` con esquema, migraciones, tres ranuras, autoguardado por beat | Prueba de migración desde una versión simulada anterior |
| E8.2 | Exportar/importar por código | Código de ≤ 2 KB; importación valida y rechaza corruptos |
| E8.3 | Carga perezosa de episodios y compuerta por `released` | El episodio no lanzado muestra la fecha estimada |

### E9 · Cinemáticas

| ID | Ticket | Criterios de aceptación |
|----|--------|-------------------------|
| E9.1 | Escena de láminas con texto por máquina, paneo lento, avance por toque, saltable | Cinco láminas del prólogo con imágenes provisionales |

### E10 · Audio

| ID | Ticket | Criterios de aceptación |
|----|--------|-------------------------|
| E10.1 | Música por región con capas sincronizadas y fundidos; efectos por evento del bus | Capas entran sin desfase; volumen por categoría en ajustes |

### E11 · Ajustes y accesibilidad

| ID | Ticket | Criterios de aceptación |
|----|--------|-------------------------|
| E11.1 | Ajustes: modo de dificultad, escala de texto, fuente, volumen, controles, modo Aula, modo lector para lecturas de mesa | Persisten en el guardado; UI DOM navegable por lector de pantalla |
| E11.2 | PWA (manifiesto, service worker, caché de episodios jugados) | Instalable; funciona sin conexión tras la primera carga |

### E12 · Episodio de prueba

| ID | Ticket | Criterios de aceptación |
|----|--------|-------------------------|
| E12.1 | `content/gym`: un mapa con todos los interactuables, una Audiencia de tres afirmaciones (hecho, norma, combinación, cierta, maniobra), un Pacto de dos puntos, una patrulla, un Atril | Se juega de extremo a extremo; sirve de fixture para todas las pruebas |
| E12.2 | Prueba Playwright de humo: arranque → mundo → diálogo → Audiencia → Pacto → guardar → recargar | Verde en CI |

### E13 · Formas de aprender y minijuegos (`09-formas-de-aprender.md`)

| ID | Ticket | Criterios de aceptación |
|----|--------|-------------------------|
| E13.1 | Marco común de minijuegos: acción `minijuego`, esquema con `tipo` discriminado, `MinijuegoHost` (instrucciones, intentos, pista escalonada, nota final, repetir), flags y Legitimidad por fuente `minijuego` | Un minijuego de prueba en `gym` se abre, se falla, recibe pista, se supera y deja flag y nota |
| E13.2 | Tipo `clasificar` («¿De quién es?») | Reductor puro con pruebas; tarjetas por teclado y táctil; cada error muestra la norma |
| E13.3 | Tipo `testigos` (nombre, trato y fama) | Elige tres testimonios del Registro de Voces; tacha explicada; se usa en el Ep. 1 con Tomás |
| E13.4 | Tipo `repaso` en el Atril | Cinco tarjetas del Códice con repetición espaciada; registro de dominio por entrada; alimenta el certificado |
| E13.5 | Tipo `ordenar` (torre de normas) | Una sola aparición (Prólogo); bloque equivocado explica por qué |
| E13.6 | Tipos `cotejar` y `cuentas` | Documento con segmentos marcables; libro de cuentas fila por fila; valores del juego, tasas como referencia del Códice |
| E13.7 | Tipo `linea-tiempo` | Cuenta de años útil con interrupción y agregación; pregunta final |
| E13.8 | Tipos `balanza` y `redactar` | Lesión enorme por umbral; cláusula por bloques con bloques envenenados y lectura final |
| E13.9 | Tipos `asamblea` y `ventanilla` | Grupos, turnos, quórum y mayoría; peticiones aprobar/negar/devolver con causa |
| E13.10 | Escenas `compuertas` y `buceo` | Puzle con solución jurídica; buceo con aire y folios rescatados que se cotejan |
| E13.11 | Variante `multitud` de la Audiencia | Varios adversarios por turnos, medidor de Tumulto, fin cuando la plaza acepta el proceso |

## Fase F3 y F6 · Contenido (por episodio)

Para cada episodio `epXX`, los tickets siguen el proceso de guion (`00-PLAN-MAESTRO.md`
§5). IDs: `G-XX.1` escaleta, `G-XX.2` escenas, `G-XX.3` audiencia, `G-XX.4` pacto,
`G-XX.5` consultas y Códice, `G-XX.6` revisión jurídica (externo), `G-XX.7` paquete
JSON, `G-XX.8` lectura de mesa (externo), `G-XX.9` congelación. Los mapas en Tiled
(`M-XX.n`) y los activos (`A-XX.n`) se derivan de `docs/design/activos.md`.

## Fase F6 · Funciones de motor por episodio

| ID | Ticket | Criterios de aceptación |
|----|--------|-------------------------|
| F-03.1 | Mecanismos: válvulas y compuertas con orden y estado en flags | Puzle del canal del Ep. 3 |
| F-04.1 | Zonas restringidas para patrullas (detección inmediata) | Sección de la guarnición |
| F-05.1 | Secuencia de asamblea: grupos, argumentos, umbral | Datos en el paquete; sin código específico del episodio |
| F-06.1 | Buceo: medidor de aire, bolsas, corrientes suaves; dial de bóveda | Sin enemigos; reintento al Atril |
| F-06.2 | Reverdecer retroactivo (acción `legitimidad` sobre otra región) | Sinuaco y Tres Bocas suben +15 |
| F-07.1 | Fin alternativo irreversible y Zurrón global (si E5.1 no lo cubrió) | Ep. 7 |
| F-08.1 | Pacto de diez puntos; montaje de epílogo con variantes por hito | Ep. 8 |

## Fase F5 · Lanzamiento 1

| ID | Ticket |
|----|--------|
| L1.1 | Integración de `ep00` y `ep01` con activos finales |
| L1.2 | Sesión de playtest: guion de sesión, formulario, recolección de métricas |
| L1.3 | Balance de constantes de Audiencia y Pacto según playtest |
| L1.4 | Pase de accesibilidad y rendimiento en tres dispositivos |
| L1.5 | Página web, notas de lanzamiento, etiqueta `v1.0.0`, copia autónoma |

---

## Plantilla de `CLAUDE.md` para el repositorio

```markdown
# AEQUITAS — guía para Claude

## Qué es este proyecto
RPG educativo de derecho colombiano (Bellium S.A.S.). Phaser 3 + TypeScript + Vite +
Preact. El diseño completo está en `docs/design/`. Lee `00-PLAN-MAESTRO.md` y el
ticket asignado antes de tocar código.

## Reglas
- Un ticket por sesión. Termina con pruebas en verde y un commit con el ID del ticket.
- `src/core` es lógica pura: sin Phaser, sin DOM. Todo motor devuelve `{ state, events }`.
- El contenido vive en `content/` como JSON validado por zod. Nunca escribas texto de
  juego en código. Nunca escribas normas jurídicas en código.
- No cambies constantes de balance sin un ticket de balance.
- Texto del juego: español, frases cortas, sin sermones, sin nombres alegóricos. Sigue
  `docs/design/02-narrativa.md` §1 y §12.
- Toda norma citada en contenido lleva `fechaConsulta` y pasa por revisión jurídica.
- Antes de cerrar una épica, escribe o actualiza `docs/engine/<sistema>.md`.

## Comandos
npm run dev · npm run build · npm run lint · npm run typecheck · npm test ·
npm run validate:content · npm run e2e · npm run standalone

## Convenciones
- IDs de contenido en kebab-case con prefijo de episodio: `ep01-acta-marrugo`.
- IDs del Códice: `cp-29`, `cc-1513`, `cco-622`, `cst-23`, `l675-47`, `l472-12`, `t-622-2016`.
- Commits: `feat(E5.2): ui de audiencia` · `content(G-01.3): audiencia marrugo` ·
  `fix(E1.4): compañeros en puertas`.
- No uses `any`. No desactives reglas de lint sin justificación en el commit.
```

---

## Prompts de arranque para Opus

### Sesión de motor (F0 y F2)

```
Estás en el repositorio `aequitas`. Lee `CLAUDE.md`, `docs/design/00-PLAN-MAESTRO.md`
(§1, §4 F2) y `docs/design/06-arquitectura.md`. Vamos a cerrar el ticket <ID> de
`docs/design/07-backlog-opus.md`.

1. Resume en cinco líneas qué vas a construir y qué pruebas lo demostrarán.
2. Implementa. Respeta la separación core / engine / ui.
3. Ejecuta lint, typecheck, test y validate:content. Corrige hasta verde.
4. Si el ticket cierra una épica, escribe `docs/engine/<sistema>.md`.
5. Commit con el formato de CLAUDE.md. Informa qué quedó fuera y por qué.
No abras tickets adicionales. No cambies constantes de balance.
```

### Sesión de guion (F3 y F6, paso N del proceso)

```
Estás en el repositorio `aequitas`. Lee `docs/design/02-narrativa.md` completo,
`docs/design/03-mecanicas.md` §4 y §5, el tratamiento `docs/design/tratamientos/epXX.md`
y la plantilla `docs/design/plantillas/<paso>.md`. Vamos a producir el paso <paso>
del episodio XX (ticket G-XX.n).

Reglas: tono sobrio (narrativa §1), muestras de voz (§12), máximo tres líneas por
globo, cada norma con su entrada del Códice, cada afirmación con una solución plena.
Entrega el archivo en `docs/design/guion/epXX/<paso>.md` y, si el paso es 7, el
paquete JSON en `content/epXX/` con el validador en verde. Marca con [REVISAR] toda
norma cuya numeración no puedas confirmar.
```

### Sesión de integración y lanzamiento (F5 y semana 3-5 de F6)

```
Lee `docs/design/00-PLAN-MAESTRO.md` §7 (definición de terminado de un lanzamiento).
Recorre la lista punto por punto para el lanzamiento <N>. Para cada punto, muestra la
evidencia (comando, captura, prueba) o el ticket que lo bloquea. No marques nada como
hecho sin evidencia.
```
