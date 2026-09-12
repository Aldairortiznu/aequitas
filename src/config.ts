/**
 * Constantes globales del juego.
 * Los valores de balance (Audiencia, Pacto, Legitimidad) viven en src/core/balance.ts
 * y solo cambian con un ticket de balance.
 */

export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 270;
export const TILE_SIZE = 16;

export const APP_VERSION: string = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : '0.0.0';

/** Paleta base Bellium (docs/design/08-arte-audio.md §3). Valores numéricos para Phaser. */
export const PALETTE = {
  ceniza: [0x1b1b1f, 0x2e2d33, 0x4a4850, 0x6f6c76, 0xa29ea8],
  bellium: [0x3b2a5c, 0x5a3f86, 0x8f6fc0],
  dorado: [0xb8892e, 0xe2b94a, 0xf4dc8a],
  verdes: [0x2f5d3a, 0x4a8a4f, 0x7cc46b, 0xb9e39a],
  aguas: [0x1e6f7a, 0x2bb5b8, 0x8fe0de],
  tierras: [0x7a4b2d, 0xb5773f, 0xd9a66b],
  sal: [0xf2c9d6, 0xe69ab8],
  piel: [0xf1c9a5, 0xc98e5e, 0x8a5a3a, 0x5a3a26],
  papel: [0xf3ead8, 0xeadfc6, 0xcfc2a3],
} as const;

/** Versión CSS de la paleta para textos de Phaser. */
export const CSS = {
  ink: '#1b1b1f',
  paper: '#f3ead8',
  paper2: '#eadfc6',
  muted: '#a29ea8',
  gold: '#e2b94a',
  goldSoft: '#f4dc8a',
  bellium: '#8f6fc0',
  green: '#7cc46b',
} as const;

export const FONTS = {
  mono: '"Courier Prime", "Courier New", Courier, monospace',
  display: '"Newsreader", "Iowan Old Style", Georgia, serif',
  body: '"Atkinson Hyperlegible", "Segoe UI", system-ui, sans-serif',
} as const;

export const TITLE = {
  name: 'AEQUITAS',
  subtitle: 'El Retorno del Equilibrio',
  season: 'Temporada 1 · El Año Diez',
  studio: 'Bellium S.A.S. · Editorial Al Resuelve',
} as const;
