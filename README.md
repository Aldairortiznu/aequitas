# ⚖️ AEQUITAS
### *El Retorno del Equilibrio*

Aventura de rol e **investigación dialéctica** en pixel art. Un mundo postapocalíptico
—lugares y personas **ficticios**— donde rige la **ley colombiana real**: la Constitución
de 1991, el Código Civil y las leyes de conciliación.

Siete años después de la Gran Creciente, un enviado de la **Biblioteca Experimental**
viaja entre refugios y puertos fluviales resolviendo controversias sin violencia penal.
Todo empieza en el caos y la tiranía; a medida que el personaje **aprende, aplica y
enseña** la ley, la gente la adopta y **la sociedad se restablece**: lo ves en el
medidor de *Equilibrio del puerto* y en el propio mapa (vuelve el color, se van los
peajes del Puño, aparecen la balanza pública y los banderines de la Junta).

Iniciativa transmedia de **Bellium S.A.S.** Contenido pedagógico: cada carta del
Códice cita su norma, pero el juego no es asesoría jurídica.

## Capítulo 1 · Puerto Garza — *La lancha de la discordia*
Dos familias se disputan la única lancha del puerto y "El Puño" quiere arreglarlo a golpes.
- **Elige a quien viaja:** Tomás, Valeria, Río o Alex (hombre, mujer y dos personajes
  andróginos), con su historia y un don. Eliges también el trato: *Explorador*,
  *Exploradora* o *Exploradore*.
- **Gánate la confianza** resolviendo los líos del puerto (minijuegos de escucha activa,
  balanza, circuito solar…).
- **Investiga:** testimonios, pruebas y cartas del Códice (27 normas reales).
- **Enseña** lo aprendido a la gente (4 enseñanzas): así se recupera el orden.
- **Audiencia:** contrainterroga, objeta con pruebas o normas; la balanza se equilibra.
- **Acuerdo y acta:** decide, clasifica gastos (necesarios, útiles, voluptuarios),
  ordena el acta y fírmala. Después, recorre el puerto ya en equilibrio.

## Cómo jugar / probar
**En línea:** https://aldairortiznu.github.io/aequitas/ (computador y celular).

Para correrlo en tu equipo necesitas **Node.js 18+**:
```bash
git clone https://github.com/Aldairortiznu/aequitas.git
cd aequitas
npm install
npm run dev
```
Abre **http://localhost:5173** y pulsa una tecla para activar el sonido. Desde el
celular (misma red Wi‑Fi) usa la URL *Network* que muestra Vite: aparecen controles
táctiles (en horizontal flotan sobre el juego; en las pantallas que se manejan tocando
se esconden solos).

**Controles:** flechas/WASD moverse · E hablar/examinar · X acción · I expediente ·
B pista de Lumen · C calma de Tinto · M silencio · Esc menú.

**Atajos de desarrollo** (consola del navegador, solo con `npm run dev`):
```js
__aeq.town({ hero: 'rio', gender: 'n', flags: ['met_fidelina'], cards: ['art2353'], at: [10, 32] })
__aeq.scene('Hearing', {}, { stage: 'audiencia', items: [...], cards: [...] })
__aeq.save()   // la partida en memoria
```

## Estructura
- `src/data/` — contenido: `heroes.js` (personajes), `codex.js` (normas), `speakers.js`
  (voces y aspecto) y `ch1/` (mapa, diálogos, pruebas, audiencia, minijuegos, guion).
- `src/systems/` — guardado, historia (condiciones y objetivos), **orden** (equilibrio
  del puerto), texto con trato, audio generativo, ajustes.
- `src/scenes/` — Menú, Personaje, Pueblo, Audiencia, Acuerdo, Cierre, Cinemáticas,
  Minijuegos (`games/`), Expediente, Diálogo, Cartas…
- `src/art/aequitasArt.js` — todo el arte dibujado por código.
- `docs/AEQUITAS_DISENO.md` — diseño, marco pedagógico, mapa legal y hoja de ruta.

Phaser 3 · Vite · Tone.js · JavaScript. Créditos en `docs/CREDITS.md`.

Cada push a `main` publica el juego en GitHub Pages (GitHub Actions). El prototipo de
septiembre (los exploradores Aurelio, Valeria, Kaelen y Sora) se conserva completo en la
rama `prototipo-septiembre`.
