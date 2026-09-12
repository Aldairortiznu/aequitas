import { render } from 'preact';
import { App } from '../ui/App';

/** Monta la capa DOM de interfaz sobre el canvas. */
export function mountUi(): void {
  const root = document.getElementById('ui');
  if (!root) throw new Error('No existe el contenedor #ui');
  render(<App />, root);
}
