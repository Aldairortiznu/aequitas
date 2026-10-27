// Controles táctiles en HTML (fuera del canvas), estilo consola antigua.
// Movimiento con JOYSTICK (palanca) analógico; acciones con botones clásicos
// rotulados con la MISMA letra que se oprime en PC (X, E, I, B, C, ESC).
//
// En VERTICAL viven en una consola sólida debajo del juego; en HORIZONTAL
// flotan translúcidos sobre el juego a pantalla completa (ver index.html).
//
// Puente al juego: los botones EMITEN los eventos de teclado de cada escena
// (keydown-X, -E, -I, -B, -C, -ESC y flechas), así funcionan en el mundo,
// los menús, los diálogos y los retos sin tocar la lógica. El movimiento del
// joystick va por window.__padVec (lo leen el pueblo y los minijuegos de movimiento).

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
  // keyup: necesario para los retos que se MANTIENEN pulsados (respiración,
  // regar, soltar). Sin esto, en celular el "holding" quedaba siempre activo.
  const emitUp = (name) => {
    try {
      game.scene.getScenes(true).forEach((s) => {
        if (s.input && s.input.keyboard) s.input.keyboard.emit('keyup-' + name);
      });
    } catch (e) { /* nada */ }
  };

  // ---------------------------------------------------------- Joystick (palanca)
  const joy = document.createElement('div');
  joy.id = 'joy';
  const thumb = document.createElement('div');
  thumb.id = 'joy-thumb';
  joy.appendChild(thumb);

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
    if (dir !== lastDir && now - lastNav > 160) { emit(dir); lastDir = dir; lastNav = now; }
  };

  const moveThumb = (clientX, clientY) => {
    const r = joy.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const R = r.width * 0.42;
    let dx = clientX - cx;
    let dy = clientY - cy;
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
  };

  joy.addEventListener('pointerdown', (e) => { e.preventDefault(); joyId = e.pointerId; joy.setPointerCapture(e.pointerId); moveThumb(e.clientX, e.clientY); });
  joy.addEventListener('pointermove', (e) => { if (e.pointerId === joyId) { e.preventDefault(); moveThumb(e.clientX, e.clientY); } });
  joy.addEventListener('pointerup', (e) => { if (e.pointerId === joyId) resetThumb(); });
  joy.addEventListener('pointercancel', () => resetThumb());
  joy.addEventListener('lostpointercapture', () => resetThumb());

  // ----------------------------------------------------- Botones de acción (keycap)
  const btns = document.createElement('div');
  btns.id = 'btns';
  // [letra, sub, color, keyEvent, extra]
  // AEQUITAS: E habla/examina (en audiencia, "Preguntar"), X confirma o
  // actúa (en audiencia, "Presentar"), I abre el Expediente, B pide una pista
  // a Lumen y C invoca la calma de Tinto.
  const defs = [
    ['I', 'Expediente', '#c48a3a', 'I', ''],
    ['B', 'Pista', '#caa24b', 'B', ''],
    ['C', 'Calma', '#3a8aa6', 'C', ''],
    ['', '', '', '', 'spacer'],
    ['E', 'Hablar', '#3a7ac4', 'E', ''],
    ['', '', '', '', 'spacer'],
    ['', '', '', '', 'spacer'],
    ['X', 'Acción', '#2f8a7a', 'X', 'big'],
  ];
  defs.forEach(([label, sub, color, key, extra]) => {
    if (extra === 'spacer') { btns.appendChild(document.createElement('div')); return; }
    const b = document.createElement('div');
    b.className = 'btn' + (extra === 'big' ? ' big' : '');
    b.style.setProperty('--c', color);
    b.innerHTML = `<span>${label}</span>${sub ? `<small>${sub}</small>` : ''}`;
    b.addEventListener('pointerdown', (e) => { e.preventDefault(); emit(key); });
    // Soltar el botón → keyup (para los retos de mantener pulsado).
    const up = (e) => { e.preventDefault(); emitUp(key); };
    b.addEventListener('pointerup', up);
    b.addEventListener('pointercancel', up);
    b.addEventListener('pointerleave', up);
    btns.appendChild(b);
  });

  // ---------------------------------------------------------- Botón menú (ESC)
  const menu = document.createElement('div');
  menu.id = 'b-menu'; menu.className = 'btn';
  menu.style.setProperty('--c', '#9aa790');
  menu.innerHTML = '<span>ESC</span>';
  menu.addEventListener('pointerdown', (e) => { e.preventDefault(); emit('ESC'); });

  pad.appendChild(joy);
  pad.appendChild(btns);
  pad.appendChild(menu);

  // Si la página pierde el foco / se oculta (overlay, teclado, cambio de app),
  // se suelta el joystick para que la heroína no quede "caminando sola".
  document.addEventListener('visibilitychange', () => { if (document.hidden) resetThumb(); });
  window.addEventListener('blur', resetThumb);

  // Según la pantalla: en el pueblo y en los retos de moverse se ve todo; en las
  // que se manejan tocando (menús, personaje, diálogos, cartas, cinemáticas,
  // audiencia, acuerdo, cierre y minijuegos de botones) se esconden palanca y
  // botones para no tapar el texto ni la interfaz. Esos se avanzan tocando.
  const TAP = new Set(['Menu', 'Character', 'Settings', 'CaseClosed', 'Resolution', 'Hearing', 'CaseFile', 'Interview', 'Pause', 'Dialogue', 'Card', 'Cinematic']);
  const sync = () => {
    let tap = false;
    try {
      const act = game.scene.getScenes(true);
      const top = act[act.length - 1];
      const key = top && top.scene.key;
      if (TAP.has(key)) tap = true;
      if (key === 'Minigame') tap = !(top.def && top.def.pad);
    } catch (e) { /* nada */ }
    pad.classList.toggle('tap-only', tap);
  };
  setInterval(sync, 200);

  const refresh = () => { try { game.scale.refresh(); } catch (e) { /* nada */ } };
  window.addEventListener('orientationchange', () => setTimeout(refresh, 250));
  window.addEventListener('resize', refresh);
}
