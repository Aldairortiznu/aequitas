import Phaser from 'phaser';

/**
 * Entrada unificada: teclado (Phaser) y mando táctil (DOM) escriben en el mismo estado.
 * La escena consulta `readInput()` una vez por cuadro.
 */
export interface InputFrame {
  dx: number; // -1..1
  dy: number; // -1..1
  run: boolean;
  interact: boolean; // flanco de subida
  cancel: boolean; // flanco de subida
}

interface TouchState {
  dx: number;
  dy: number;
  run: boolean;
  pressed: Set<'a' | 'b'>;
}

const touch: TouchState = { dx: 0, dy: 0, run: false, pressed: new Set() };

/** Lo llama el mando táctil DOM. */
export const touchInput = {
  setAxis(dx: number, dy: number): void {
    touch.dx = Math.max(-1, Math.min(1, dx));
    touch.dy = Math.max(-1, Math.min(1, dy));
  },
  setRun(v: boolean): void {
    touch.run = v;
  },
  press(b: 'a' | 'b'): void {
    touch.pressed.add(b);
  },
  reset(): void {
    touch.dx = 0;
    touch.dy = 0;
    touch.run = false;
    touch.pressed.clear();
  },
};

export interface KeyMap {
  up: Phaser.Input.Keyboard.Key[];
  down: Phaser.Input.Keyboard.Key[];
  left: Phaser.Input.Keyboard.Key[];
  right: Phaser.Input.Keyboard.Key[];
  run: Phaser.Input.Keyboard.Key[];
  interact: Phaser.Input.Keyboard.Key[];
  cancel: Phaser.Input.Keyboard.Key[];
  /** Pulsaciones registradas por evento (no por sondeo), con su instante: sobreviven a un
   *  keydown+keyup en el mismo cuadro y se pueden descartar si ocurrieron con un panel abierto. */
  pressed: Map<'interact' | 'cancel', number>;
}

export function createKeyMap(scene: Phaser.Scene): KeyMap | null {
  const kb = scene.input.keyboard;
  if (!kb) return null;
  const K = Phaser.Input.Keyboard.KeyCodes;
  const keys = (...codes: number[]): Phaser.Input.Keyboard.Key[] =>
    codes.map((c) => kb.addKey(c, false));
  const pressed = new Map<'interact' | 'cancel', number>();
  const map: KeyMap = {
    up: keys(K.W, K.UP),
    down: keys(K.S, K.DOWN),
    left: keys(K.A, K.LEFT),
    right: keys(K.D, K.RIGHT),
    run: keys(K.SHIFT),
    interact: keys(K.E, K.ENTER),
    cancel: keys(K.ESC, K.BACKSPACE),
    pressed,
  };
  for (const k of map.interact) k.on('down', () => pressed.set('interact', performance.now()));
  for (const k of map.cancel) k.on('down', () => pressed.set('cancel', performance.now()));
  return map;
}

function anyDown(keys: Phaser.Input.Keyboard.Key[]): boolean {
  return keys.some((k) => k.isDown);
}

/**
 * Lee la entrada del cuadro. `ignoreBefore`: las pulsaciones anteriores a ese instante
 * (performance.now) se descartan; sirve para no reaccionar a la tecla que cerró un panel.
 */
export function readInput(map: KeyMap | null, ignoreBefore = 0): InputFrame {
  let dx = 0;
  let dy = 0;
  let run = touch.run;
  let interact = touch.pressed.has('a');
  let cancel = touch.pressed.has('b');
  touch.pressed.clear();
  if (map) {
    if (anyDown(map.left)) dx -= 1;
    if (anyDown(map.right)) dx += 1;
    if (anyDown(map.up)) dy -= 1;
    if (anyDown(map.down)) dy += 1;
    run = run || anyDown(map.run);
    const ti = map.pressed.get('interact');
    const tc = map.pressed.get('cancel');
    interact = interact || (ti !== undefined && ti >= ignoreBefore);
    cancel = cancel || (tc !== undefined && tc >= ignoreBefore);
    map.pressed.clear();
  }
  if (dx === 0 && dy === 0) {
    dx = touch.dx;
    dy = touch.dy;
  }
  return { dx, dy, run, interact, cancel };
}
