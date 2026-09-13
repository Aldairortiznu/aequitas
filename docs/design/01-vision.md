# 01 · Visión

## Logline

Nueve años después de que alguien borrara todos los registros del país para salvar a los
pobres de sus deudas, una joven jurista sale de una biblioteca escondida para devolverle
la ley a un litoral gobernado por el hombre que se quedó con la única copia.

## La promesa de experiencia

En una frase: **sentir que un argumento bien fundado puede cambiar el mundo, y verlo
florecer**.

El jugador llega a lugares donde la arbitrariedad se disfraza de orden. Investiga, habla
con la gente, recoge documentos y testimonios, lee el Códice y entra a la Audiencia con
un zurrón lleno de hechos y normas. Cada afirmación del adversario tiene un hueco; el
jugador lo encuentra combinando **la norma correcta con el hecho correcto**. Cuando el
adversario se allana, no se le castiga: se sienta a la mesa y se redacta un pacto. Si el
pacto es legal y justo, la Margarita Dorada brota y el mapa reverdece. Si el jugador deja
pasar una cláusula nula, el pacto se impugna y el mundo lo recuerda.

Y por debajo de todo, una pregunta que no se responde hasta el final: ¿quién borró la
memoria del país, y qué tiene que ver la madre de Renata con eso?

## Pilares de diseño

1. **El argumento es el arma.** Nada golpea, nada dispara. Todo conflicto se resuelve
   hablando, probando y pactando. El fracaso no es «morir»: es que la conversación
   colapse en tumulto.
2. **Norma + Hecho = Alegato.** El silogismo jurídico es la mecánica central. El juego
   enseña a razonar como jurista sin decirlo: premisa mayor (la norma), premisa menor
   (el hecho probado), conclusión (la contradicción del adversario).
3. **La forma no es el fondo.** El antagonista tiene sellos, actas, certificados y
   tribunales. Todo es falso porque nada tiene legitimidad. El juego entrena a distinguir
   legalidad de apariencia legal.
4. **Restaurar, no vencer.** Cada adversario tiene razones y un lugar en el pacto final.
   El jugador que humilla o excluye obtiene pactos frágiles; el que restaura obtiene
   floración plena.
5. **El mundo responde.** Legitimidad por región, mapas que cambian de ceniza a flor,
   NPC que cambian de discurso, música que gana capas. El progreso se ve y se oye.
6. **Caribe real, sin caricatura.** Nombres con raíz, instituciones verosímiles,
   adversarios con razones que un jurista podría defender de buena fe, dolor sin
   espectáculo. Nada alegórico: ningún nombre «significa» algo, ningún símbolo aparece
   sin una causa creíble dentro del mundo.
7. **Un episodio, un concepto, una herida.** Cada lanzamiento enseña un área del derecho
   colombiano a través de un conflicto humano concreto y avanza la trama central con un
   giro.

## Público

- **Primario:** estudiantes de derecho de primeros semestres y de últimos años de
  colegio en Colombia (16-24 años). Móvil primero.
- **Secundario:** comunidades y clientes de Bellium (copropietarios, administradores de
  propiedad horizontal, pequeños comerciantes) que necesitan entender sus derechos.
- **Terciario:** docentes que quieran usar el juego en aula (Modo Aula con guía de
  discusión por episodio, publicable por Editorial Al Resuelve).

## Qué cambia respecto al prototipo y por qué

| Prototipo | Juego real | Por qué |
|-----------|-----------|---------|
| Cuatro exploradores seleccionables con pasivas numéricas | Una protagonista con arco (Renata) y tres compañeros que se ganan, cada uno con una Facultad narrativa | Una trama que atrape necesita un punto de vista, secretos personales y pérdida. Los compañeros ganados son hitos emocionales y de lanzamiento |
| Antagonistas sueltos por capítulo | Un antagonista de temporada (el Registrador) y adversarios por episodio que son piezas de su sistema | La escalada y el misterio requieren un sistema enemigo coherente, no una galería |
| Combate de proyectiles «alegato» | Audiencia Dialéctica por turnos + Interpelaciones rápidas en el mapa | La proyectil-mecánica no enseña nada; el silogismo sí. Las Interpelaciones conservan tensión en la exploración sin violencia |
| Acertijos de opción múltiple en un atril | Consultas diegéticas (NPC que piden consejo) + Cuaderno de repaso opcional | La evaluación se integra al mundo, no lo interrumpe |
| Sin cierre mecánico del capítulo | Conciliación con redacción de acta y control de legalidad | Es la práctica real de Bellium y la tesis del juego: justicia restaurativa |
| Texto en canvas 480x270 | Mundo en canvas 480x270; texto en capa DOM | Un juego de texto jurídico exige legibilidad, escalado de fuente y accesibilidad |
| Todo en un bundle | Episodios como paquetes JSON lazy-loaded, validados por esquema | Permite lanzar por episodio sin tocar el motor y que Opus agregue contenido con seguridad |

## Métricas de éxito (por lanzamiento)

- Tasa de finalización del episodio ≥ 60 % de quienes inician la Audiencia.
- Precisión media en Audiencia entre 55 % y 75 % (ni trivial ni frustrante).
- ≥ 80 % de jugadores identifican correctamente la cláusula nula del pacto en el primer
  intento hacia el Episodio 3 (curva de aprendizaje real).
- Retención entre lanzamientos: ≥ 40 % de quienes terminaron el episodio N inician N+1.
- Cero incidentes de precisión jurídica reportados tras revisión de Bellium.

## Riesgos principales

| Riesgo | Mitigación |
|--------|-----------|
| Exceso de texto para móvil | Frases cortas, bloques de máximo 3 líneas, UI DOM con escalado, ritmo de escena ≤ 90 s sin interacción |
| Precisión jurídica | Revisión jurídica obligatoria por episodio; el Códice cita texto literal; ninguna cifra de tasas o salarios se codifica en duro (se usan «la Tasa del Códice», «el Mínimo del Códice») |
| Costo de arte | Estados de tileset por paleta (ceniza/brote/verdor/floración) reutilizan geometría; presupuesto por episodio en `08-arte-audio.md` |
| Fatiga de fórmula por episodio | Cada episodio altera el patrón: Ep 3 doble pacto, Ep 5 huelga, Ep 6 buceo y sin adversario humano, Ep 7 el jugador argumenta contra su propia compañera, Ep 8 pacto grande sin audiencia |
| Alcance | Vertical slice primero (Prólogo + Ep 1) con todos los sistemas; nada nuevo de motor después del Lanzamiento 1 salvo lo listado por episodio |

## Núcleo pedagógico (Dirección, 13 de septiembre de 2026)

> **Legitimar el orden en una sociedad colapsada.** El aprendizaje del juego no es teórico ni
> enciclopédico: se da en el marco de que, para restaurar el equilibrio, el personaje comienza
> a legitimar nuevamente un orden social con las comunidades y sobrevivientes, basado en la
> ley colombiana. El jugador aprende en la medida en que comprueba, caso a caso, cómo el
> derecho no es un estorbo burocrático, sino la herramienta más poderosa para darle orden,
> previsibilidad y dignidad a una sociedad fragmentada por el desastre.

Esta frase manda sobre cualquier mecánica: si una mecánica no le permite al jugador
comprobar eso en un caso concreto, no entra.
