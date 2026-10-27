// Vibración del celular (golpes, daño, logros). Se apaga en Ajustes; en
// navegadores sin soporte (iPhone, computadora) simplemente no hace nada.
import { getSetting } from './settings.js';

export function vibrate(pattern) {
  try {
    if (getSetting('vibration') === false) return;
    if (navigator.vibrate) navigator.vibrate(pattern);
  } catch (e) { /* nada */ }
}
