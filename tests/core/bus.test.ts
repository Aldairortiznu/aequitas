import { afterEach, describe, expect, it, vi } from 'vitest';
import { createBus, getBus, resetBus } from '../../src/core/bus';

describe('bus de eventos', () => {
  afterEach(() => resetBus());

  it('el bus global es único hasta que se reinicia', () => {
    const a = getBus();
    const b = getBus();
    expect(a).toBe(b);
    resetBus();
    expect(getBus()).not.toBe(a);
  });

  it('entrega eventos tipados a los suscriptores', () => {
    const bus = createBus();
    const handler = vi.fn();
    bus.on('ui:toast', handler);
    bus.emit('ui:toast', { text: 'hola', kind: 'ok' });
    expect(handler).toHaveBeenCalledWith({ text: 'hola', kind: 'ok' });
    bus.off('ui:toast', handler);
    bus.emit('ui:toast', { text: 'otra' });
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
