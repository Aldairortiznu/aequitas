# Lanzamiento 1 · Prólogo y Episodio 1 (L1.5)

Estado: **preparado, sin publicar**. Se publica cuando el arte de los bloques A a D esté
integrado y el playtest haya cerrado el balance (decisión D5). Fecha prevista: 27 de
noviembre de 2026.

## Lista de salida

- [x] Prólogo y Episodio 1 jugables de principio a fin (e2e verde en escritorio y móvil).
- [x] Protagonistas seleccionables (D10) y tratamiento en los textos.
- [x] Pase automático de accesibilidad sin violaciones; pendientes manuales en
      `accesibilidad-L1.md`.
- [x] Métricas de playtest exportables desde el Cuaderno; formulario publicado.
- [ ] Revisión jurídica firmada (dossier publicado; 31 normas pendientes).
- [ ] Arte: Renata (retratos listos; sprite en regeneración), elenco del Ep. 1, tilesets
      Altamar y Ciénaga, láminas del Ep. 1 y del menú.
- [ ] Playtest con 6 a 8 personas y ajuste de balance (L1.3).
- [ ] Pruebas manuales en tres dispositivos (lector de pantalla, táctil, texto 160 %).
- [ ] Etiqueta `v1.0.0`, `main` reemplazado por `desarrollo`, despliegue a GitHub Pages,
      copia autónoma (`npm run standalone`) adjunta a la publicación.

## Enlaces de trabajo

| Qué                                             | Dónde                                                                |
| ----------------------------------------------- | -------------------------------------------------------------------- |
| Dossier de avance                               | https://claude.ai/code/artifact/e0c0dcc3-b710-4ff3-aadd-c80057979d20 |
| Revisión jurídica (decisiones compartidas)      | https://claude.ai/code/artifact/bea66ed6-ec79-4174-ae95-917c7bbbc93d |
| Formulario de playtest (respuestas compartidas) | https://claude.ai/code/artifact/864203bf-8946-4024-8513-095f4086e905 |
| Guion de la sesión de playtest                  | `docs/lanzamiento/playtest-L1.md`                                    |

## Notas de lanzamiento (borrador para la página y las redes)

**AEQUITAS: El Retorno del Equilibrio · Lanzamiento 1**

El primer tramo del juego educativo de Bellium sobre derecho colombiano: el Prólogo en la
Ciénaga y el Episodio 1 en el Conjunto Altamar.

- Juega como Iriarte, jurista de la Biblioteca: elige entre Renata, Ramiro, Ariel, Cruz o
  crea tu personaje.
- Aprende haciendo: Consultas de vecinos, Audiencias donde un hecho y una norma desmontan
  una afirmación, y Pactos donde redactas el acta y detectas cláusulas nulas.
- Temas del tramo: supremacía de la Constitución, personalidad jurídica y nombre,
  propiedad horizontal (Ley 675 de 2001), debido proceso y tutela contra particulares.
- 31 normas en el Códice, con texto literal y explicación en palabras simples, revisadas
  por abogados de Bellium.
- Funciona en el navegador, en computador y en teléfono; guarda en el dispositivo y permite
  exportar la partida por código.

Próximo episodio: _Firmado en blanco_ (Tres Bocas): títulos valores e intereses.

## Cómo publicar (cuando la lista esté completa)

```bash
npm run check && npm run build && npm run e2e
git checkout main && git reset --hard desarrollo && git push --force-with-lease origin main
git tag -a v1.0.0 -m "Lanzamiento 1: Prólogo y Episodio 1" && git push origin v1.0.0
npm run standalone   # dist-standalone/ → comprimir y adjuntar a la publicación de GitHub
```

El flujo `deploy.yml` publica en GitHub Pages desde `main` automáticamente.
