# Materia prima de arte

Aquí se guardan las imágenes tal como salen del generador o de Aseprite, organizadas por tipo.
Los archivos definitivos se producen con `npm run assets:normalize` y viven en `public/assets/`.
Ver `docs/arte/01-GUIA-NANO-BANANA.md`.

- `sprites/<id>/down-0.png … up-3.png` (16 cuadros) o `sprites/<id>.png` (hoja 4×4)
- `tilesets/<region>-<estado>/NN-descripcion.png` (hasta 64 celdas) o `tilesets/<region>-<estado>.png`
- `portraits/<id>-<expresion>.png`
- `illustrations/<id>.png`
- `icons/<nombre>.png`
- `referencias/` láminas del prototipo (tono de luz), no del elenco actual
