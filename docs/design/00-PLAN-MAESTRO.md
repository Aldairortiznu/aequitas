# 00 · Plan maestro de ejecución

**AEQUITAS: El Retorno del Equilibrio · Temporada 1 «El Año Diez»**
Bellium S.A.S. · Editorial Al Resuelve · 12 de septiembre de 2026

Este documento es el plan de trabajo. Dice qué se hace, en qué orden, quién lo hace,
qué entrega cada fase y qué condición debe cumplirse para pasar a la siguiente. Los
demás documentos del paquete son insumos de este plan.

---

## 1. Principios del plan

1. **El motor se construye una vez; después, cada episodio es contenido.** Todo lo
   que un episodio necesita (mapas, diálogos, evidencias, audiencia, pacto, Códice) se
   describe en paquetes de datos validados por esquema. El código del motor no se
   toca en las fases de contenido salvo por las funciones puntuales listadas por
   episodio en la sección 6.
2. **Dos carriles en paralelo, un punto de encuentro.** Carril A: guion y contenido.
   Carril B: motor y herramientas. Carril C: arte y audio. Convergen en la fase de
   integración de cada lanzamiento.
3. **Nada avanza sin compuerta.** Cada fase tiene una condición de salida verificable.
   Si no se cumple, no se abre la siguiente.
4. **Revisión jurídica obligatoria.** Ninguna norma citada, afirmación de audiencia o
   cláusula de pacto llega a un lanzamiento sin la firma de un abogado de Bellium.
5. **Tono sobrio.** Todo texto pasa el filtro de `02-narrativa.md` §1 antes de
   convertirse en contenido.
6. **Un ticket por sesión de Opus.** Cada sesión de implementación cierra un ticket
   con sus criterios de aceptación y sus pruebas, y termina con un commit.

## 2. Roles

| Rol | Quién | Responsabilidad |
|-----|-------|-----------------|
| **Dirección** | Bellium (Aldair) | Aprueba tratamientos, guiones, arte y lanzamientos. Resuelve decisiones pendientes |
| **Diseño y narrativa (planificación)** | Fable | Sesiones de planificación: biblia, tratamientos, decisiones de diseño, revisión de guiones frente a la biblia |
| **Redacción de guion y contenido** | Opus, bajo la biblia y las plantillas | Escaletas, diálogos, audiencias, pactos, entradas del Códice, conversión a paquetes JSON |
| **Implementación** | Opus | Motor, herramientas, integración, pruebas, despliegue |
| **Revisión jurídica** | Abogado(s) de Bellium designados | Lista de verificación de `05-curriculo-juridico.md` por episodio |
| **Arte** | Por definir (ver decisiones) | Sprites, tilesets, retratos, láminas, UI |
| **Audio** | Por definir | Música y efectos |
| **Playtest** | Estudiantes y equipo de Bellium | Sesiones de prueba por lanzamiento |

## 3. Mapa de fases

```
F0 Preparación (1 sem)
  └► F1 Biblia cerrada y tratamientos (2 sem)
        ├► F2 Motor: vertical slice técnico (4 sem)        [Carril B]
        ├► F3 Guion y contenido: Prólogo + Ep. 1 (3 sem)    [Carril A]
        └► F4 Arte y audio base (4 sem)                     [Carril C]
              └► F5 Integración, playtest y Lanzamiento 1 (3 sem)
                    └► F6 Ciclo por episodio × 7 (5 sem cada uno) → Lanzamientos 2 a 8
                          └► F7 Cierre de temporada y Temporada 2
```

Duración total estimada de la Temporada 1: 12 a 13 meses con un operador de Opus,
un artista de medio tiempo y revisión jurídica semanal. Las fechas de la sección 8
son tentativas.

---

## 4. Fases en detalle

### F0 · Preparación (1 semana)

**Objetivo.** Tener el repositorio, las herramientas y las decisiones que bloquean
todo lo demás.

| Actividad | Responsable | Entregable |
|-----------|-------------|------------|
| Crear repositorio nuevo `aequitas` (sin heredar código del prototipo; el prototipo queda archivado como referencia) | Opus | Repo con `main` protegido, GitHub Pages activo |
| Copiar `docs/design/` (este paquete) y `CLAUDE.md` (plantilla en `07-backlog-opus.md`) | Opus | Docs en repo |
| Andamiaje técnico: TypeScript, Vite, Phaser, Preact, Vitest, Playwright, ESLint, Prettier, CI | Opus | `npm run dev` abre una pantalla vacía con el título; `npm test` verde; CI verde |
| Esquemas de contenido y validador (`npm run validate:content`) | Opus | Tipos y validación de paquetes de episodio |
| Resolver las decisiones de la sección 9 | Dirección | Acta de decisiones en `docs/decisions.md` |
| Designar revisor jurídico y calendario semanal de revisión | Dirección | Nombre y horario |
| Instalar Tiled y Aseprite (o la herramienta de arte elegida) | Dirección / Arte | Herramientas listas |

**Compuerta de salida.** Decisiones firmadas; CI verde; revisor jurídico nombrado.

### F1 · Biblia cerrada y tratamientos (2 semanas)

**Objetivo.** Congelar lo que no puede cambiar después (mundo, personajes, trama,
giros, mecánicas) y producir el tratamiento de cada episodio: una página por
episodio, sin diálogos.

| Actividad | Responsable | Entregable |
|-----------|-------------|------------|
| Revisión de `02-narrativa.md` y `03-mecanicas.md` con Dirección; ajustes | Fable + Dirección | Biblia v1.0 (congelada) |
| Tratamiento de los nueve episodios: premisa, conflicto, concepto jurídico, lista de evidencias, esquema de audiencia, esquema de pacto, giro, alcance de producción | Opus (redacta) + Fable (revisa frente a la biblia) | `docs/design/tratamientos/ep0X.md` × 9. El anexo A de este paquete es el primer borrador |
| Validación del mapa de conceptos jurídicos por episodio | Revisión jurídica | `05-curriculo-juridico.md` firmado |
| Plantilla de episodio (qué debe contener un guion para ser implementable) | Fable | `docs/design/plantillas/` (tratamiento, escaleta, escena, audiencia, pacto, entrada de Códice) |
| Lista de activos por episodio (mapas, sprites, retratos, láminas, pistas) derivada de los tratamientos | Opus | `docs/design/activos.md` |

**Compuerta de salida.** Dirección aprueba los nueve tratamientos; revisión jurídica
aprueba el mapa de conceptos; plantillas publicadas.

### F2 · Motor: vertical slice técnico (4 semanas) — Carril B

**Objetivo.** Todos los sistemas del juego funcionando de extremo a extremo con arte
provisional y un «episodio de prueba» sintético, para que el contenido real se
integre sin escribir código nuevo.

Épicas (tickets en `07-backlog-opus.md`): E1 Mundo · E2 Diálogo · E3 Zurrón,
Códice, Registro de Voces y Consultas · E4 Interpelación · E5 Audiencia · E6 Pacto ·
E7 Reverdecer · E8 Guardado y episodios · E9 Cinemáticas · E10 Audio · E11 Ajustes y
accesibilidad · E12 Episodio de prueba.

Orden recomendado: E1 → E2 → E3 → E5 → E6 → E4 → E7 → E8 → E9 → E10 → E11 → E12.
E5 y E6 (los motores puros) pueden desarrollarse antes que E1 si conviene, porque no
dependen de Phaser.

**Compuerta de salida.** El episodio de prueba se juega completo en escritorio y en un
teléfono Android de gama media a 60 fps; cobertura de pruebas de los motores puros
≥ 90 %; validador de contenido integrado en CI; guardado sobrevive a una recarga.

### F3 · Guion y contenido: Prólogo y Episodio 1 (3 semanas) — Carril A

**Objetivo.** Los dos primeros episodios escritos, revisados y convertidos a paquetes
de contenido.

El proceso de guion (sección 5) se ejecuta dos veces, primero para el Prólogo y luego
para el Ep. 1. El Prólogo es corto y sirve para calibrar el proceso.

**Compuerta de salida.** Paquetes `ep00` y `ep01` validados; revisión jurídica
firmada; lectura de mesa aprobada por Dirección.

### F4 · Arte y audio base (4 semanas) — Carril C

**Objetivo.** La guía de estilo y todos los activos del Lanzamiento 1.

| Entregable | Detalle |
|------------|---------|
| Guía de estilo | Paleta, resolución, reglas de sprite y de tileset (`08-arte-audio.md`) |
| Personajes | Renata, Pilar, Clemencia, Nepomuceno, Casimiro, Marrugo, Tomás, Zoraida, 2 estudiantes, 3 vigilantes, 6 vecinos genéricos (sprites de 4 direcciones, caminar e idle) |
| Retratos | 10 retratos con 3 expresiones (neutra, tensa, cordial) |
| Tilesets | Estación de la ciénaga (estado floración); Altamar (cuatro estados) |
| Láminas | 5 del prólogo; 1 de cierre del Ep. 1; fondo de menú |
| UI | Kit de interfaz DOM: diálogo, Zurrón, Códice, Audiencia, Pacto, Cuaderno, mando táctil |
| Audio | 4 pistas (Biblioteca, Altamar con dos capas, Audiencia, Pacto) y 25 efectos |

**Compuerta de salida.** Lista de activos del L1 completa e integrada en el
episodio de prueba sin errores de carga.

### F5 · Integración, playtest y Lanzamiento 1 (3 semanas)

| Semana | Actividad |
|--------|-----------|
| 1 | Integrar `ep00` y `ep01` con arte y audio finales; corregir; lectura de mesa jugada |
| 2 | Playtest con 8-10 estudiantes: métricas de `01-vision.md`; ajuste de números de Audiencia y Pacto; pase de accesibilidad; PWA |
| 3 | Congelación de contenido; revisión jurídica final; página web y textos de tienda; lista de lanzamiento; etiqueta `v1.0.0`; publicación |

**Compuerta de salida.** Lista de «Definición de terminado de un lanzamiento»
(sección 7) completa.

### F6 · Ciclo por episodio (5 semanas por episodio, Episodios 2 a 8)

Cada episodio recorre el mismo ciclo. Los carriles se solapan: mientras el Ep. N está
en integración, el guion del Ep. N+1 ya empezó.

| Semana | Carril A (guion) | Carril B (motor) | Carril C (arte y audio) |
|--------|------------------|------------------|-------------------------|
| 1 | Escaleta y escenas del Ep. N | Función específica del Ep. N (sección 6) | Bocetos de tileset y personajes nuevos |
| 2 | Audiencia, Pacto, Consultas, Códice; revisión jurídica | Pruebas de la función | Tilesets (cuatro estados), sprites |
| 3 | Conversión a paquete; lectura de mesa | Integración del paquete | Retratos, láminas, pista(s) |
| 4 | Correcciones de playtest | Playtest y balance | Correcciones |
| 5 | Congelación | Lanzamiento N | — |

**Compuerta de salida por episodio.** La misma lista de la sección 7.

### F7 · Cierre de temporada

- Guía de Modo Aula por episodio (Editorial Al Resuelve).
- Informe de métricas de la temporada y de precisión jurídica.
- Sesión de planificación de la Temporada 2 (Fable) con los hooks del anexo A.

---

## 5. El proceso de guion (se repite por episodio)

Este proceso convierte un tratamiento de una página en un paquete de contenido
jugable. Cada paso tiene un dueño y un criterio de aceptación.

| Paso | Qué se produce | Quién | Se acepta cuando |
|------|----------------|-------|------------------|
| 1. Escaleta | Lista numerada de beats (10-15) con lugar, personajes, propósito dramático y propósito pedagógico de cada uno | Opus redacta; Fable revisa | Cada beat tiene los dos propósitos y ninguno dura más de 90 s sin decisión del jugador |
| 2. Escenas | Diálogos por beat en el formato de escena (personaje, gesto, texto, opciones, efectos) | Opus | Cumple `02-narrativa.md` §1 y §12; máximo 3 líneas por globo; máximo 12 globos sin acción |
| 3. Audiencia | Afirmaciones con solución plena, parciales, distractores, respuestas del adversario, maniobras, momento de Invocación | Opus | Cumple las reglas de autoría de `03-mecanicas.md` §4; una afirmación repasa un episodio anterior |
| 4. Pacto | Puntos, cláusulas con legalidad, intereses y justicia; texto del acta | Opus | Cada punto tiene al menos una cláusula nula verosímil y una válida y justa |
| 5. Consultas y Códice | 4-6 Consultas; entradas del Códice con texto literal, palabras simples, uso en Audiencia | Opus | Toda norma usada en Audiencia o Pacto tiene entrada |
| 6. Revisión jurídica | Lista de verificación firmada; correcciones | Abogado de Bellium | Firma |
| 7. Paquete | Conversión a JSON del episodio; `npm run validate:content` | Opus | Validador en verde; toda evidencia usada existe en un mapa; todo flag leído se escribe en algún lado |
| 8. Lectura de mesa | Dirección juega el episodio en «modo lector» (motor con arte provisional) | Dirección | Aprobación o lista de cambios |
| 9. Congelación | Etiqueta del paquete | Opus | Ningún cambio salvo correcciones de playtest |

Plantillas (a crear en F1): `tratamiento.md`, `escaleta.md`, `escena.md`,
`audiencia.md`, `pacto.md`, `codice.md`. Cada plantilla lleva un ejemplo tomado del
Prólogo.

Reglas de sesión con Opus para guion: una sesión por paso y por episodio; la sesión
empieza leyendo la biblia, el tratamiento y la plantilla del paso; termina con el
archivo en `docs/design/guion/epXX/` y un commit.

## 6. Funciones de motor específicas por episodio

Lo único que se programa después del Lanzamiento 1. Todo lo demás es contenido.

| Ep. | Función | Tamaño |
|-----|---------|--------|
| 2 | Afirmación «cierta» que se resuelve presionando (ya soportada por el motor si E5 lo contempla; verificar) | Pequeño |
| 3 | Puzle de compuertas (tres válvulas, turnos); Conciliación en dos bloques | Mediano |
| 4 | Sección de sigilo (patrullas con cono de visión ya existen; se añade «zona restringida») | Pequeño |
| 5 | Secuencia de asamblea de trabajadores (diálogo con cinco grupos y umbral) | Mediano |
| 6 | Buceo (medidor de aire, bolsas de aire, válvulas); dial de bóveda; Reverdecer retroactivo de otras regiones | Grande |
| 7 | Audiencia con condición de fin alternativa (texto y reintento sin pista); Zurrón global de temporada en Audiencia | Mediano |
| 8 | Pacto de diez puntos sin Audiencia; montaje de epílogo con variantes por hito | Mediano |

## 7. Definición de terminado

**De un guion (paso 9 de la sección 5).** Escaleta, escenas, Audiencia, Pacto,
Consultas y Códice completos; revisión jurídica firmada; lectura de mesa aprobada.

**De una función de motor.** Criterios de aceptación del ticket cumplidos; pruebas
unitarias de la lógica pura; prueba de humo en navegador; sin regresiones en el
episodio de prueba; documentación en `docs/engine/`.

**De un activo.** Cumple la guía de estilo; nombre y ruta según convención; integrado
sin error de carga; peso dentro del presupuesto.

**De un lanzamiento.**
- [ ] Paquete(s) de episodio validados y congelados
- [ ] Revisión jurídica final firmada
- [ ] Playtest con al menos 8 personas y métricas dentro de rango
- [ ] Sin errores de consola en escritorio, Android y iOS
- [ ] Guardados del lanzamiento anterior migran sin pérdida
- [ ] Pase de accesibilidad (escalado de texto, lector de pantalla en UI DOM, contraste)
- [ ] PWA instalable y funcional sin conexión
- [ ] Etiqueta de versión, notas de lanzamiento, página actualizada
- [ ] Copia autónoma local regenerada

## 8. Calendario tentativo

Supone inicio el lunes 21 de septiembre de 2026, un operador de Opus a tiempo
completo, arte de medio tiempo y pausa de fin de año.

| Hito | Fecha estimada |
|------|----------------|
| F0 completa | 25 sep 2026 |
| F1 completa (biblia y tratamientos) | 9 oct 2026 |
| F2, F3 y F4 completas | 6 nov 2026 |
| **Lanzamiento 1 (Prólogo + Ep. 1)** | **27 nov 2026** |
| Lanzamiento 2 (Ep. 2) | 29 ene 2027 |
| Lanzamiento 3 (Ep. 3) | 5 mar 2027 |
| Lanzamiento 4 (Ep. 4) | 9 abr 2027 |
| Lanzamiento 5 (Ep. 5) | 14 may 2027 |
| Lanzamiento 6 (Ep. 6) | 25 jun 2027 |
| Lanzamiento 7 (Ep. 7) | 30 jul 2027 |
| **Lanzamiento 8 (Ep. 8, final)** | **3 sep 2027** |

## 9. Decisiones pendientes (con recomendación)

| Decisión | Opciones | Recomendación |
|----------|----------|---------------|
| Elenco | (a) Nombres nuevos de la biblia; (b) reutilizar Aurelio, Valeria, Kaelen y Sora del prototipo | (a). Los nombres del prototipo no tienen raíz caribeña y el diseño ya no es de cuatro seleccionables |
| Protagonista | (a) Renata fija, renombrable; (b) elegir entre dos presentaciones (mujer/hombre) con el mismo guion | (a) para el L1; (b) es posible más adelante con costo de arte y de redacción en español |
| Arte | (a) Pixel artist comisionado; (b) generación asistida con limpieza manual en Aseprite; (c) mixto: personajes comisionados, tiles y láminas generados y limpiados | (c). Los personajes son lo que más se ve y lo más difícil de generar con consistencia |
| Audio | (a) Compositor chiptune; (b) generación con edición | (a) para los temas principales; (b) para efectos |
| Revisión jurídica | Un abogado fijo o rotación | Un abogado fijo con suplente; una hora semanal fija |
| Cadencia | 5 semanas por episodio o 6 | 5 con margen de una semana cada dos episodios |
| Título | Mantener «AEQUITAS: El Retorno del Equilibrio» | Mantener; añadir subtítulo de temporada «El Año Diez» |
| Idiomas | Solo español | Solo español en la Temporada 1; arquitectura preparada para más |
| Analítica | Ninguna, o local anónima | Ninguna por defecto; el Cuaderno exportable sirve como evidencia de aprendizaje |

## 10. Riesgos del plan

| Riesgo | Señal temprana | Respuesta |
|--------|----------------|-----------|
| El motor se sigue tocando en fases de contenido | Tickets de motor abiertos durante F6 fuera de la sección 6 | Congelar; mover a la lista de la temporada siguiente |
| La revisión jurídica se vuelve cuello de botella | Más de una semana sin firma | Segundo revisor; revisar por lotes (Códice primero, Audiencia después) |
| Arte insuficiente para cuatro estados de tileset | Un tileset tarda más de una semana | Reducir a tres estados (ceniza, verdor, floración) |
| Texto excesivo en móvil | Playtest: abandono en diálogos largos | Recortar con la regla de 12 globos; mover exposición a Consultas |
| Precisión jurídica cuestionada públicamente | Comentarios de docentes | Nota de versión con corrección; el Códice cita texto literal y fecha de consulta |
| Dependencia de un solo operador de Opus | Ausencias | Documentación de motor y CLAUDE.md permiten que otra persona retome |

## 11. Anexos del paquete

- `01-vision.md` — visión y pilares.
- `02-narrativa.md` — biblia narrativa (a congelar en F1).
- `03-mecanicas.md` — diseño de sistemas (a congelar en F1).
- `05-curriculo-juridico.md` — mapa de conceptos y lista de verificación jurídica.
- `06-arquitectura.md` — arquitectura técnica y esquemas de contenido.
- `07-backlog-opus.md` — tickets por fase, `CLAUDE.md` y prompts de arranque.
- `08-arte-audio.md` — dirección de arte y audio.
- `anexo-A-tratamientos-borrador.md` — primer borrador de los tratamientos por
  episodio, insumo de F1. No es guion definitivo.
