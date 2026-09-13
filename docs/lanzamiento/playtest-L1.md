# Playtest del Lanzamiento 1 (L1.2)

Objetivo: comprobar, con personas reales, tres cosas antes de publicar el Prólogo y el
Episodio 1: (1) que se entiende qué hay que hacer sin ayuda, (2) que las mecánicas
jurídicas enseñan lo que dicen enseñar, (3) que el balance de la Audiencia y del Pacto ni
frustra ni regala.

## Participantes

Seis a ocho personas, en sesiones individuales o de a dos:

| Perfil                                         | Cuántas | Por qué                                             |
| ---------------------------------------------- | ------- | --------------------------------------------------- |
| Estudiantes de derecho (1.º a 4.º semestre)    | 3       | público principal del juego                         |
| Abogado o docente de Bellium                   | 2       | validan que lo jurídico sea correcto y no simplista |
| Personas sin formación jurídica (16 a 40 años) | 2       | miden la legibilidad y el tono                      |
| Alguien que no juega videojuegos               | 1       | controles, mando táctil, ritmo                      |

Dispositivos: al menos una sesión en computador con teclado, una en un teléfono Android
de gama media y una en un iPhone. Navegador del propio participante.

## Sesión (60 minutos)

1. **Antes (5 min).** Explica solo esto: «Es un juego sobre derecho colombiano. No hay
   forma de perder de verdad. Piensa en voz alta.» No expliques controles ni mecánicas.
2. **Prólogo (15 min).** Observa: ¿lee las láminas o las salta? ¿Entiende que la Audiencia
   simulada es un ensayo? ¿Cuántos intentos para contradecir la afirmación combinada?
3. **Episodio 1 hasta la convocatoria (20 min).** Observa: ¿encuentra la oficina, el piso 4
   y a Zoraida sin ayuda? ¿Se pierde en la torre? ¿Habla con los vecinos o los ignora?
4. **Audiencia y Acta (15 min).** Si a los 20 minutos no ha convocado, usa el atajo:
   abre la consola y ejecuta `__aequitas.session.runActions([{type:'setFlag',flag:'ep01.convocada',value:true}])`.
   Observa: ¿usa Presionar? ¿Descubre la afirmación oculta? ¿Cuántas cláusulas nulas
   detecta sin pista? ¿Firma una nula?
5. **Después (5 min).** El participante abre el Cuaderno, pulsa «Copiar métricas de la
   sesión» y pega el resultado en el formulario. Luego responde el formulario.

Quien observa no ayuda salvo bloqueo total (más de 3 minutos sin avanzar); anota el minuto
y la causa de cada bloqueo.

## Qué se mide

- **Comprensión**: tres preguntas de contenido en el formulario (¿quién elige al
  administrador?, ¿se puede cortar el agua como sanción?, ¿qué es la tutela contra
  particulares?). Meta: 2 de 3 correctas en el 80 % de participantes.
- **Usabilidad**: escala de 1 a 5 en cinco afirmaciones (sabía qué hacer; entendí la
  Audiencia; el texto se leía bien; los controles respondían; volvería a jugar). Meta:
  promedio ≥ 4 en cuatro de cinco.
- **Balance** (métricas exportadas): contradicciones fallidas por Audiencia (meta: ≤ 4),
  tumultos (meta: ≤ 1), pistas usadas, cláusulas nulas firmadas (meta: ≤ 1), minutos por
  tramo.
- **Tono**: pregunta abierta «¿hubo algo que te pareció ridículo, cursi o sermoneador?».
  Cualquier respuesta afirmativa se revisa línea por línea (regla D6).

## Formulario

Publicado como página con respuestas compartidas (Claude las lee directamente):
ver el enlace en `docs/lanzamiento/NOTAS-L1.md` §Playtest. La misma página funciona sin
conexión copiando el resumen al final.

## Después del playtest (L1.3)

Con las métricas y el formulario se ajustan las constantes de `src/core/balance.ts`
(daño por contradicción, tensión, pistas) y las posiciones de los adversarios en los
archivos de audiencia. Cada cambio de balance lleva su ticket y se registra en
`docs/decisions.md`.
