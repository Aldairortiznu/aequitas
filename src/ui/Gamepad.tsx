import { useEffect, useRef, useState } from 'preact/hooks';
import { touchInput } from '../engine/input';
import { getBus } from '../core/bus';

/**
 * Mando táctil (E1.5): cruceta a la izquierda, botones A/B a la derecha.
 * Solo se muestra en dispositivos táctiles y se oculta mientras hay un panel abierto.
 */
function isTouchDevice(): boolean {
  return (
    typeof window !== 'undefined' && (navigator.maxTouchPoints > 0 || 'ontouchstart' in window)
  );
}

export function Gamepad() {
  const [visible, setVisible] = useState(isTouchDevice());
  const [hidden, setHidden] = useState(false);
  const padRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bus = getBus();
    const onOpen = (): void => {
      setHidden(true);
      touchInput.reset();
    };
    const onClose = (): void => setHidden(false);
    bus.on('ui:opened', onOpen);
    bus.on('ui:closed', onClose);
    const onFirstTouch = (): void => setVisible(true);
    window.addEventListener('touchstart', onFirstTouch, { once: true, passive: true });
    return () => {
      bus.off('ui:opened', onOpen);
      bus.off('ui:closed', onClose);
      window.removeEventListener('touchstart', onFirstTouch);
    };
  }, []);

  useEffect(() => {
    const pad = padRef.current;
    if (!pad) return;
    const update = (e: TouchEvent | PointerEvent): void => {
      const r = pad.getBoundingClientRect();
      const t = 'touches' in e ? e.touches[0] : e;
      if (!t) return;
      const x = (t.clientX - r.left) / r.width - 0.5;
      const y = (t.clientY - r.top) / r.height - 0.5;
      const dead = 0.08;
      const dx = Math.abs(x) < dead ? 0 : Math.sign(x) * Math.min(1, Math.abs(x) / 0.35);
      const dy = Math.abs(y) < dead ? 0 : Math.sign(y) * Math.min(1, Math.abs(y) / 0.35);
      touchInput.setAxis(dx, dy);
    };
    const stop = (): void => touchInput.setAxis(0, 0);
    pad.addEventListener('touchstart', update, { passive: true });
    pad.addEventListener('touchmove', update, { passive: true });
    pad.addEventListener('touchend', stop);
    pad.addEventListener('touchcancel', stop);
    return () => {
      pad.removeEventListener('touchstart', update);
      pad.removeEventListener('touchmove', update);
      pad.removeEventListener('touchend', stop);
      pad.removeEventListener('touchcancel', stop);
    };
  }, [visible, hidden]);

  if (!visible || hidden) return null;

  return (
    <div class="gamepad" aria-label="Mando táctil">
      <div class="gamepad__pad" ref={padRef} role="group" aria-label="Cruceta">
        <span class="gamepad__arrow gamepad__arrow--up" />
        <span class="gamepad__arrow gamepad__arrow--down" />
        <span class="gamepad__arrow gamepad__arrow--left" />
        <span class="gamepad__arrow gamepad__arrow--right" />
      </div>
      <div class="gamepad__buttons">
        <button
          type="button"
          class="gamepad__btn gamepad__btn--b"
          aria-label="Cancelar"
          onTouchStart={(e) => {
            e.preventDefault();
            touchInput.press('b');
          }}
          onClick={() => touchInput.press('b')}
        >
          B
        </button>
        <button
          type="button"
          class="gamepad__btn gamepad__btn--a"
          aria-label="Interactuar"
          onTouchStart={(e) => {
            e.preventDefault();
            touchInput.press('a');
          }}
          onClick={() => touchInput.press('a')}
        >
          A
        </button>
        <button
          type="button"
          class="gamepad__btn gamepad__btn--run"
          aria-label="Correr"
          onTouchStart={(e) => {
            e.preventDefault();
            touchInput.setRun(true);
          }}
          onTouchEnd={() => touchInput.setRun(false)}
        >
          ▸▸
        </button>
      </div>
    </div>
  );
}
