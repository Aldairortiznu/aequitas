# Arte de AEQUITAS · guía para producción con Nano Banana en Antigravity

Esta carpeta contiene todo lo que un agente de diseño (Antigravity con Nano Banana, o una
persona con Aseprite) necesita para producir el arte del juego **sin tocar el código**. El
motor carga automáticamente cualquier archivo que cumpla el contrato y usa arte provisional
para lo que falte, así que el arte puede llegar pieza a pieza y verse en el juego de inmediato.

| Documento                        | Qué contiene                                                                                                                     |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `01-GUIA-NANO-BANANA.md`         | El contrato técnico (nombres, tamaños, rejillas, paleta), el flujo de trabajo paso a paso, reglas de prompt y control de calidad |
| `02-FICHAS-PERSONAJES.md`        | Ficha de diseño y prompts de cada personaje: sprite de 16×24 y retratos de 96×96                                                 |
| `03-FICHAS-REGIONES.md`          | Índice semántico del tileset (64 celdas), fichas de las regiones con sus cuatro estados y lista de decorados                     |
| `04-LAMINAS-UI-ICONOS.md`        | Láminas de cinemática (composición y texto), iconos e interfaz                                                                   |
| `PROMPT-ARRANQUE-ANTIGRAVITY.md` | Texto para pegar en Antigravity al empezar una sesión de arte                                                                    |

## Cómo llega el arte al juego (resumen)

1. El agente genera la imagen y la deja en `art-src/<tipo>/…` (materia prima, cualquier tamaño).
2. Ejecuta `npm run assets:normalize -- --tipo <tipo> --id <id> …` (o la variante `--carpeta`).
   El script reduce con vecino más cercano, aplica la paleta, recorta el alfa y escribe el
   archivo definitivo en `public/assets/…` con el nombre exacto que el motor espera.
3. El mismo script actualiza `public/assets/manifest.json`. El juego lee ese manifiesto al
   arrancar y carga solo lo que existe; lo demás sigue siendo provisional.
4. `npm run dev` y abrir `http://localhost:5180/?escena=galeria` para ver todos los activos
   (dorado = real, gris = provisional). O jugar y verlos en su contexto.
5. `npm run assets:scan` imprime la lista de lo que falta, en orden.

Prioridad de producción para el primer lanzamiento (Prólogo + Episodio 1, ya jugables):

1. **Elenco del Prólogo y del Episodio 1**, sprite + 3 retratos cada uno: Renata → Ramiro, Ariel y Cruz (protagonistas alternativos, D10) → Pilar →
   Marrugo → Nepomuceno → Clemencia → Casimiro → Tomás → Zoraida → Eladio → estudiante y
   estudiante-2 → alguacil → vigilante → vecino-1 … vecino-4 → Moscote (solo retratos y láminas
   por ahora).
2. **Tilesets** `altamar` y `cienaga`, cuatro estados cada uno, con la disposición estándar de
   `03-FICHAS-REGIONES.md`.
3. **Láminas cinematográficas** (`04-LAMINAS-UI-ICONOS.md` §1): `menu-fondo`, las cinco del
   prólogo, `ep00-lamina-encargo`, y las seis del Episodio 1 (`llegada`, `lobby`, `audiencia`,
   `cuaderno`, `registrador`, `cierre`).
4. Iconos del mundo y piezas de interfaz (sellos, orla de acta, medidores).

`npm run assets:scan` imprime exactamente qué falta. Todo lo que no exista se ve provisional
en el juego, así que el orden se puede alterar sin romper nada.
