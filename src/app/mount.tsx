import { render } from 'preact';
import { App } from '../ui/App';
import type { Session } from './session';

/** Monta la capa DOM de interfaz sobre el canvas. */
export function mountUi(session: Session): void {
  const root = document.getElementById('ui');
  if (!root) throw new Error('No existe el contenedor #ui');
  render(<App session={session} />, root);
}
