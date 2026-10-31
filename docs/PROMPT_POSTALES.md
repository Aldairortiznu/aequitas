# Prompt para Antigravity: postales y retratos de AEQUITAS

> **Estado (v0.8):** las seis escenas y los cuatro retratos ya están en el juego. Los
> originales en PNG están en `art-src/postales/` y `art-src/retratos/`. El juego usa
> copias WebP (1600×900 las escenas, 360×480 los retratos) listadas en
> `public/assets/postales/postales.json` y `public/assets/retratos/retratos.json`. Para
> cambiar una imagen, reemplaza el PNG en `art-src/` y genera de nuevo su WebP.

El juego ya trae las seis postales y los cuatro retratos **pintados por código**.
Si se generan ilustraciones con este prompt y se guardan donde se indica, el juego
las usa automáticamente en su lugar (si falta alguna, sigue usando la de código).

---

## Prompt (copiar y pegar en Antigravity)

> Trabaja en el repositorio de AEQUITAS (Phaser 3 + Vite). Genera ilustraciones para
> el juego y guárdalas en el repositorio. No cambies código del juego: solo agrega
> imágenes y actualiza dos archivos JSON.
>
> **Estilo común (todas las imágenes):** pixel art cinematográfico de 16 bits, con
> paleta limitada y luz cálida, al estilo de una aventura gráfica de los 90.
> El mundo es un Caribe colombiano después de una guerra: ruinas cubiertas de
> vegetación, palafitos remendados, zinc oxidado, ríos anchos y manglares. Es un
> mundo herido pero digno, nunca caricaturesco ni cómico: la gente se ve
> trabajadora, cálida y respetable, con pieles morenas, afrodescendientes,
> indígenas y mestizas. El motivo mítico es la **Margarita Dorada**, una flor
> dorada y luminosa que brota del asfalto agrietado. La Orden de Bellium viste
> capas violeta y verde con detalles de bronce, y lleva un tubo dorado de códices
> al hombro y un broche de margarita dorada en el pecho.
> No pongas texto, letras, logotipos ni marcas de agua dentro de las imágenes.
>
> ### 1. Postales (16:9, 1920×1080 PNG, sin bordes)
> Guárdalas en `public/assets/postales/`:
>
> - `leviatan.png` — **El Colapso del Leviatán.** Atardecer rojo y humo. En el río
>   yace derribada la cabeza de piedra de un gigante coronado de laurel (el
>   «Leviatán»: el Estado, sus jueces, escuelas y puentes), medio hundida. Al fondo,
>   torres de una ciudad rota y torres de energía torcidas. En la orilla, una
>   balanza de la justicia caída y una fila de familias desplazadas, en silueta,
>   con sus bultos. Tono solemne, no violento: no hay armas ni sangre.
> - `boveda.png` — **La Bóveda de la Biblioteca, bajo el mar Caribe.** Una sala de
>   piedra sumergida, con rayos de luz que bajan desde la superficie y burbujas.
>   Al centro, una gran compuerta circular de bronce con una margarita dorada
>   grabada que brilla. A los lados, estanterías con cientos de tubos de códices
>   dorados. De espaldas, frente a la compuerta, una figura encapuchada (capa violeta
>   y verde, tubo dorado al hombro), un farolito-dron de latón que flota (Lumen) y
>   un chigüiro (capibara) sentado.
> - `travesia.png` — **La travesía.** Noche de luna llena sobre un río ancho. Una
>   canoa de madera con la figura encapuchada remando, un chigüiro en la proa y el
>   farolito de latón encendido. Pilares de un puente que ya no existe, manglares en
>   silueta, luciérnagas y el reflejo de la luna en el agua.
> - `asamblea.png` — **La víspera.** De noche, la Casa de la Junta de Acción
>   Comunal: madera remendada, techo de zinc, la puerta abierta con luz cálida,
>   guirnalda de bombillos. Vecinos del Caribe llegan a la reunión (una anciana con
>   pañoleta blanca, un campesino con sombrero de paja, una pescadora con gorra,
>   una vendedora con delantal), con respeto y esperanza. Sobre la puerta, un
>   letrero de madera en blanco (sin letras).
> - `margarita.png` — **La Margarita Dorada.** Amanecer en la plaza de un pueblo
>   ribereño restaurado, con banderines de colores. En el centro del asfalto
>   agrietado brota una margarita dorada luminosa. A un lado, la figura de la Orden
>   la mira; un chigüiro y el farolito de latón la acompañan.
> - `siete_puentes.png` — **Siete Puentes.** Un cañón verde entre montañas con
>   bruma. Siete pilares de piedra cruzan el río y se pierden río arriba. Un puente
>   colgante de cuerdas y tablas está roto: cuelga de los dos lados hacia el agua.
>   Garzas volando.
>
> Después, escribe en `public/assets/postales/postales.json`:
> ```json
> { "leviatan": "leviatan.png", "boveda": "boveda.png", "travesia": "travesia.png",
>   "asamblea": "asamblea.png", "margarita": "margarita.png", "siete_puentes": "siete_puentes.png" }
> ```
>
> **Importante:** el tercio inferior de cada imagen queda cubierto por la caja de
> texto del juego. No pongas a los personajes ni el objeto principal ahí:
> deja suelo, agua o camino. El título va arriba a la izquierda, así que deja esa
> zona tranquila (cielo o pared).
>
> ### 2. Retratos de los cuatro Emisarios del Equilibrio (3:4, 600×800 PNG, fondo transparente)
> Pixel art de cuerpo entero, de frente, en pose serena y digna. Todos llevan el
> broche de la Margarita Dorada en el pecho y el tubo dorado de códices al hombro.
> Guárdalos en `public/assets/retratos/`:
>
> - `aurelio.png` — **Aurelio, el Archivista.** Hombre de piel morena clara, barba
>   negra cuidada, gafas redondas, abrigo azul profundo con ribetes dorados, un
>   libro de actas bajo el brazo. Mirada analítica y amable.
> - `valeria.png` — **Valeria, la Cartógrafa.** Mujer afrocaribeña, cabello largo
>   negro, pañoleta roja, aretes dorados, abrigo verde azulado, un mapa enrollado
>   en la mano. Mirada empática y decidida.
> - `kaelen.png` — **Kaelen, Custodio de los números.** Persona andrógina de piel
>   trigueña, cabello corto con un mechón teñido de turquesa, ruana terracota con
>   franja dorada, un libro de cuentas verde. Serena y observadora.
> - `sora.png` — **Sora, Centinela de bronce.** Persona andrógina de piel oscura,
>   capucha violeta, media máscara de bronce sobre los ojos, capa verde con ribetes
>   de bronce. Austera, firme, filosófica.
>
> Después, escribe en `public/assets/retratos/retratos.json`:
> ```json
> { "aurelio": "aurelio.png", "valeria": "valeria.png", "kaelen": "kaelen.png", "sora": "sora.png" }
> ```
>
> Comprueba con `npm run dev` que las escenas se ven en «Escenas de la
> historia» (en el menú) y los retratos en «Nueva partida». Luego haz commit de las
> imágenes y de los dos JSON.

---

## Dónde aparecen en el juego
No se descargan: son escenas detrás del texto, dentro de la historia.

| Escena | Momento |
|---|---|
| `leviatan` | La Biblioteca (la guerra), y el recuerdo de Don Anselmo y de Mamá Tule |
| `boveda` | La Biblioteca (la Orden y la Bóveda) |
| `travesia` | Al llegar a Puerto Garza, y el recuerdo de Nando |
| `asamblea` | Al abrir la audiencia |
| `margarita` | El epílogo del caso, y la leyenda de Mamá Tule |
| `siete_puentes` | El anuncio del capítulo 2 |

Ojo: en los diálogos, la caja de texto tapa el **tercio inferior** de la imagen. Deja lo
importante en los dos tercios de arriba.

Los retratos reemplazan a los sprites en la pantalla «¿Quién viaja a Puerto Garza?».
