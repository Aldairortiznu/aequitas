# Prueba lateral (`?escena=lateral`)

Escena de herramienta montada el 15 de septiembre de 2026 para que Dirección viera la torre
de Altamar en vista lateral antes de decidir el formato del mundo (ver
`docs/design/11-jugabilidad-y-formato.md` §6 y `docs/design/13-referentes-y-dinamica.md`).
No toca el contenido ni la sesión.

- **Abrir:** `http://localhost:5180/?escena=lateral` (o `&estilo=esmeralda|litoral|grabado`).
  En el servidor de red local, `http://192.168.1.24:4173/?escena=lateral`.
- **Controles:** flechas o A/D para moverse; espacio, W o arriba para saltar (un toque da un
  salto corto; mantener, uno largo); arriba/abajo en las escaleras; E o Enter para hablar y
  leer; Shift para correr. En pantalla táctil, botones en DOM (◀ ▶ a la izquierda, E ▲ a la
  derecha).
- **Recorrido:** hablar con Pilar en el lobby → subir por los barriles al estante alto y
  recoger el acta → escalera de la derecha al piso 2 → la puerta cerrada cede con el acta →
  escalera de la izquierda al piso 3 → cruzar el hueco de la losa → escalera de la derecha a
  la azotea → válvula del tanque. Al final se muestran tiempo, saltos y caídas.
- **Código:** `src/engine/scenes/LateralScene.ts` (nivel por código, físicas arcade con
  gravedad, escaleras con tile superior de un solo sentido, puerta por documento, fondo con
  paralaje) y `src/engine/scenes/lateralUi.ts` (interfaz DOM: objetivo, cifras, mensajes,
  mando táctil, final).
- **Sonda:** `node scripts/dev/shot-lateral.mjs [estilo] [--movil]` recorre el nivel con
  teclado (o en perfil móvil), comprueba caminar, saltar, acta, puerta, escalera y válvula,
  y deja capturas en `test-results/lateral/`.
