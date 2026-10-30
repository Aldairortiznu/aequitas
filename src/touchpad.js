// Controles táctiles en HTML (fuera del canvas), estilo consola.
// Movimiento con JOYSTICK (palanca) analógico; acciones con botones rotulados
// con la MISMA letra que se oprime en PC (X, E, B, C, I, ESC).
//
// En VERTICAL viven en una consola debajo del juego, con un panel de estado
// legible entre los dos; en HORIZONTAL flotan translúcidos sobre el juego a
// pantalla completa (ver index.html).
//
// Los botones cambian de rótulo según la pantalla («Seguir» en un diálogo,
// «Presentar» en la audiencia...) y se atenúan los que ahí no hacen nada.
//
// Puente al juego: los botones EMITEN los eventos de teclado de cada escena
// (keydown-X, -E, -I, -B, -C, -ESC y flechas), así funcionan en el mundo,
// los menús, los diálogos y los retos sin tocar la lógica. El movimiento del
// joystick va por window.__padVec (lo leen el pueblo y los minijuegos de movimiento).

import { vibrate } from './systems/haptics.js';
import { fmt as fmtName } from './systems/text.js';

// Qué hace cada botón en cada pantalla. null = no hace nada ahí (se atenúa).
// joy: rótulo de la palanca (null = no se usa).
const SEGUIR = { joy: null, X: 'Seguir', E: 'Seguir', B: null, C: null, I: null, ESC: null };
const ELEGIR = { joy: 'Elegir', X: 'Aceptar', E: null, B: null, C: null, I: null, ESC: 'Volver' };
const CONTEXT = {
  Town: { joy: 'Caminar', X: 'Acción', E: 'Hablar', B: 'Pista', C: 'Tinto', I: 'Expediente', ESC: 'Menú' },
  Hearing: { joy: 'Frases', X: 'Presentar', E: 'Preguntar', B: 'Pista', C: 'Calma', I: null, ESC: 'Menú' },
  Dialogue: SEGUIR,
  Card: SEGUIR,
  Lesson: SEGUIR,
  Cinematic: { ...SEGUIR, ESC: 'Saltar' },
  Postcard: { ...SEGUIR, ESC: 'Saltar' },
  Menu: { ...ELEGIR, ESC: null },
  Character: { ...ELEGIR, X: 'Comenzar' },
  Settings: { ...ELEGIR, E: 'Cambiar' },
  Pause: ELEGIR,
  Album: { ...ELEGIR, X: 'Ver' },
  CaseFile: { ...ELEGIR, joy: 'Pestañas', X: 'Cerrar', ESC: 'Cerrar' },
  Interview: { ...ELEGIR, joy: 'Elegir', ESC: 'Salir' },
  Resolution: { ...ELEGIR, ESC: null },
  CaseClosed: { ...ELEGIR, ESC: null },
  Minigame: { joy: 'Mover', X: 'Acción', E: null, B: null, C: null, I: null, ESC: 'Salir' },
};

// Lo que dice el panel de estado (vertical) fuera del pueblo.
const TIPS = {
  Dialogue: 'Toca la pantalla o X para seguir.',
  Cinematic: 'Toca la pantalla o X para seguir · ESC salta la escena.',
  Postcard: 'Toca la pantalla o X para seguir.',
  Card: 'Una carta nueva para tu Códice. X para guardarla.',
  Lesson: 'Así funciona la ley en este caso. X para seguir.',
  Hearing: 'Si una frase no cuadra: E pregunta, X presenta una prueba. La palanca cambia de frase.',
  Resolution: 'Elige con la palanca y X, o toca la opción.',
  Menu: 'Elige con la palanca y X, o toca la opción.',
  Character: 'Elige a quien viaja con la palanca. X para comenzar.',
  CaseFile: 'La palanca cambia de pestaña. ESC para cerrar.',
  Interview: 'Elige un tema con la palanca y X, o tócalo.',
  Minigame: 'Toca o usa la palanca y X.',
  Album: 'Elige una escena para volver a verla.',
  Settings: 'Ajusta con la palanca. ESC para volver.',
  Pause: 'Elige con la palanca y X.',
  CaseClosed: 'Elige con la palanca y X.',
};

export function initTouchPad(game) {
  const pad = document.getElementById('pad');
  if (!pad) return;
  window.__domPad = true;
  window.__padVec = { x: 0, y: 0 };

  const emit = (name) => {
    try {
      game.scene.getScenes(true).forEach((s) => {
        if (s.input && s.input.keyboard) s.input.keyboard.emit('keydown-' + name);
      });
    } catch (e) { /* nada */ }
  };
  // keyup: necesario para los retos que se MANTIENEN pulsados.
  const emitUp = (name) => {
    try {
      game.scene.getScenes(true).forEach((s) => {
        if (s.input && s.input.keyboard) s.input.keyboard.emit('keyup-' + name);
      });
    } catch (e) { /* nada */ }
  };

  // ---------------------------------------------------------- Joystick (palanca)
  const joyWrap = document.createElement('div');
  joyWrap.id = 'joy-wrap';
  const joy = document.createElement('div');
  joy.id = 'joy';
  joy.innerHTML = '<i class="n"></i><i class="s"></i><i class="w"></i><i class="e"></i>';
  const thumb = document.createElement('div');
  thumb.id = 'joy-thumb';
  joy.appendChild(thumb);
  const joyLabel = document.createElement('div');
  joyLabel.className = 'cap';
  joyWrap.appendChild(joy);
  joyWrap.appendChild(joyLabel);

  let joyId = null;
  let lastDir = null;
  let lastNav = 0;
  const DEAD = 0.28;

  const setVec = (nx, ny) => {
    const mag = Math.hypot(nx, ny);
    if (mag < DEAD) { window.__padVec = { x: 0, y: 0 }; lastDir = null; return; }
    window.__padVec = { x: nx, y: ny };
    // Navegación discreta de menús: emite una flecha al entrar a una zona.
    const dir = Math.abs(nx) > Math.abs(ny) ? (nx < 0 ? 'LEFT' : 'RIGHT') : (ny < 0 ? 'UP' : 'DOWN');
    const now = performance.now ? performance.now() : Date.now();
    if (dir !== lastDir && now - lastNav > 160) { emit(dir); lastDir = dir; lastNav = now; vibrate(5); }
  };

  const moveThumb = (clientX, clientY) => {
    const r = joy.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const R = r.width * 0.36;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const d = Math.hypot(dx, dy) || 1;
    const cl = Math.min(d, R);
    const nx = (dx / d) * (cl / R);
    const ny = (dy / d) * (cl / R);
    thumb.style.transform = `translate(calc(-50% + ${nx * R}px), calc(-50% + ${ny * R}px))`;
    setVec(nx, ny);
  };
  const resetThumb = () => {
    thumb.style.transform = 'translate(-50%, -50%)';
    window.__padVec = { x: 0, y: 0 };
    lastDir = null;
    joyId = null;
    joy.classList.remove('on');
  };

  joy.addEventListener('pointerdown', (e) => { e.preventDefault(); joyId = e.pointerId; joy.setPointerCapture(e.pointerId); joy.classList.add('on'); moveThumb(e.clientX, e.clientY); });
  joy.addEventListener('pointermove', (e) => { if (e.pointerId === joyId) { e.preventDefault(); moveThumb(e.clientX, e.clientY); } });
  joy.addEventListener('pointerup', (e) => { if (e.pointerId === joyId) resetThumb(); });
  joy.addEventListener('pointercancel', () => resetThumb());
  joy.addEventListener('lostpointercapture', () => resetThumb());

  // ----------------------------------------------------- Botones de acción
  // Rombo: C arriba, B a la izquierda, X (grande) a la derecha, E abajo.
  // Los más usados (X y E) quedan donde descansa el pulgar.
  const btns = document.createElement('div');
  btns.id = 'btns';
  const KEYS = {};
  const makeBtn = (key, color, cls) => {
    const b = document.createElement('div');
    b.className = 'btn ' + cls;
    b.style.setProperty('--c', color);
    b.innerHTML = `<span>${key === 'ESC' ? '☰' : key === 'I' ? '📁' : key}</span><small></small>`;
    b.addEventListener('pointerdown', (e) => { e.preventDefault(); b.classList.add('down'); vibrate(10); emit(key); });
    // Soltar el botón → keyup (para los retos de mantener pulsado).
    const up = (e) => { e.preventDefault(); b.classList.remove('down'); emitUp(key); };
    b.addEventListener('pointerup', up);
    b.addEventListener('pointercancel', up);
    b.addEventListener('pointerleave', up);
    KEYS[key] = b;
    return b;
  };
  btns.appendChild(makeBtn('C', '#3a8aa6', 'k-c'));
  btns.appendChild(makeBtn('B', '#c9962e', 'k-b'));
  btns.appendChild(makeBtn('X', '#2f8a6a', 'k-x big'));
  btns.appendChild(makeBtn('E', '#3a6ac4', 'k-e'));

  // Botones de sistema (como Select/Start): Expediente y Menú.
  const sys = document.createElement('div');
  sys.id = 'sys';
  sys.appendChild(makeBtn('I', '#c48a3a', 'pill k-i'));
  sys.appendChild(makeBtn('ESC', '#9a8ab0', 'pill k-esc'));

  // ---------------------------------------------------------- Panel de estado
  // Solo en vertical: lo que pasa ahora, en letra grande (ver index.html).
  const band = document.getElementById('band');

  // Tocar el panel durante un diálogo es como tocar la pantalla: sigue.
  if (band) band.addEventListener('pointerdown', (e) => { if (window.__dlg) { e.preventDefault(); vibrate(8); emit('X'); } });

  pad.appendChild(joyWrap);
  pad.appendChild(sys);
  pad.appendChild(btns);

  // Si la página pierde el foco, se suelta el joystick.
  document.addEventListener('visibilitychange', () => { if (document.hidden) resetThumb(); });
  window.addEventListener('blur', resetThumb);

  // Vertical: el pueblo esconde su HUD dentro del juego y lo muestra el panel.
  const portraitQ = window.matchMedia('(pointer: coarse) and (orientation: portrait)');
  const setPortrait = () => { window.__portraitHud = portraitQ.matches; };
  setPortrait();
  if (portraitQ.addEventListener) portraitQ.addEventListener('change', setPortrait);

  // ------------------------------------------------------------ contexto
  let lastKey = null;
  let lastBand = '';
  const label = (b, t) => {
    b.classList.toggle('off', t == null);
    const small = b.querySelector('small');
    const txt = t == null ? '' : t;
    if (small.textContent !== txt) small.textContent = txt;
  };
  const applyContext = (key, top) => {
    let ctx = CONTEXT[key] || CONTEXT.Town;
    if (key === 'Minigame' && top && top.def && !top.def.pad) ctx = { ...ctx, joy: 'Elegir' };
    ['X', 'E', 'B', 'C', 'I', 'ESC'].forEach((k) => label(KEYS[k], ctx[k]));
    joyWrap.classList.toggle('off', ctx.joy == null);
    joyLabel.textContent = ctx.joy || '';
  };
  const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const renderBand = (key, top) => {
    if (!band) return;
    let html;
    const h = window.__hud;
    const d = window.__dlg;
    if (d && ['Dialogue', 'Cinematic'].includes(key)) {
      // El diálogo, en grande: retrato, nombre y texto. Tocar el panel = seguir.
      const face = d.portrait ? `<img src="${d.portrait}" alt="">` : '';
      html = `<div class="dlg n${d.n % 2}">${face ? `<div class="face">${face}</div>` : ''}<div>`
        + (d.name ? `<div class="who" style="color:${d.color}">${esc(d.name)}</div>` : '')
        + `<div class="say${d.name ? '' : ' narr'}">${esc(d.text)}</div></div></div>`
        + '<div class="next">▼ toca aquí o X para seguir</div>';
    } else if (key === 'Hearing' && window.__stmt && top && top.cross) {
      // La frase que se discute, grande, con lo que se puede hacer con ella.
      const st = window.__stmt;
      html = `<div class="who" style="color:${st.color}">${esc(st.who)} <span class="idx">· frase ${st.idx} de ${st.total}${st.solved ? ' · ✓ resuelta' : ''}</span></div>`
        + `<div class="say${st.solved ? ' ok' : ''}">«${esc(st.text)}»</div>`
        + '<div class="tip">¿No cuadra? <b>E</b> pregunta · <b>X</b> presenta una prueba o una carta. La palanca cambia de frase.</div>';
    } else if (key === 'Town' && h) {
      const col = h.order >= 80 ? '#8fd694' : h.order >= 60 ? '#e3b04b' : h.order >= 40 ? '#e8a04b' : '#e8604b';
      html = `<div class="myst">❓ ${esc(h.myst)}</div>`
        + `<div class="obj">▸ ${esc(h.obj)}</div>`
        + `<div class="meta"><span class="bar"><i style="width:${h.order}%;background:${col}"></i></span><b>${Math.round(h.order)}%</b> ${esc(h.level)}`
        + `<span class="chips"><span>🤝 ${h.trust}/3</span><span>📁 ${h.ev}</span><span>📜 ${h.cards}</span></span></div>`
        + (h.last ? `<div class="last"><b>✦ Lo último que descubriste</b>${esc(h.last.a)}</div>` : '');
    } else {
      let title = '';
      if (key === 'Minigame' && top && top.def) title = top.def.name;
      if (key === 'Hearing' && top && top.R) title = top.R.title || 'Audiencia';
      // En un minijuego, sus propias instrucciones (con el nombre de quien juega).
      const tip = key === 'Minigame' && top && top.def && top.def.how ? fmtName(top.def.how) : TIPS[key] || '';
      html = (title ? `<div class="obj">${esc(title)}</div>` : '') + `<div class="tip">${esc(tip)}</div>`;
    }
    if (!(d && ['Dialogue', 'Cinematic'].includes(key))) html += '<div class="rot">↻ Gira el celular para ver el juego más grande</div>';
    if (html !== lastBand) { band.innerHTML = html; lastBand = html; }
  };

  // Escena de arriba: la que recibe los toques.
  const sync = () => {
    let key = null;
    let top = null;
    try {
      const act = game.scene.getScenes(true);
      top = act[act.length - 1];
      key = top && top.scene.key;
    } catch (e) { /* nada */ }
    // En horizontal, en las pantallas que se manejan tocando, los controles
    // se apartan para no tapar el texto (ESC sigue).
    let tap = key !== 'Town';
    if (key === 'Minigame') tap = !(top.def && top.def.pad);
    pad.classList.toggle('tap-only', tap);
    if (key !== lastKey) { applyContext(key, top); lastKey = key; }
    // «Hablar» brilla cuando hay alguien cerca.
    KEYS.E.classList.toggle('lit', key === 'Town' && !!window.__canTalk);
    renderBand(key, top);
  };
  setInterval(sync, 200);
  sync();

  const refresh = () => { try { game.scale.refresh(); } catch (e) { /* nada */ } };
  window.addEventListener('orientationchange', () => setTimeout(refresh, 250));
  window.addEventListener('resize', refresh);
}
