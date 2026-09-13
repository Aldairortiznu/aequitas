# 04 · Láminas, interfaz e iconos

## 1. Láminas cinematográficas (16:9)

Las láminas son el **registro cinematográfico** del juego: ilustraciones pintadas a pantalla
completa que abren y cierran cada episodio y que acompañan las conversaciones decisivas.
No son pixel art: son ilustración digital de acabado limpio (pincel visible, sin ruido
fotográfico, sin 3D), con la misma paleta de luz caribeña que el mundo. El motor las usa de
dos maneras, sin cambios de código:

1. **Cinemática** (`content/<ep>/cutscenes/*.json`): secuencia de láminas con subtítulo.
2. **Escena clave de diálogo**: un nodo de diálogo con `"lamina": "<id>"` muestra la lámina a
   pantalla completa detrás de la caja de diálogo mientras dura esa conversación (la lámina
   se mantiene en los nodos siguientes hasta que otro nodo la cambie). Se reserva para aperturas,
   cierres y momentos en que la trama gira: aparece un documento, alguien se allana, se escribe
   un nombre, el Registrador toma nota.

### Reglas de composición

- **Tamaño 1920×1080** (se acepta 960×540). PNG o JPG de calidad 85, menos de 700 KB.
- **Sin texto legible** en ningún cartel, papel ni sello: el juego escribe encima.
- **Tercio inferior tranquilo** (suelo, agua, cielo, sombra): ahí va el subtítulo o la caja de
  diálogo con un degradado oscuro.
- **Planos de cine**: gran plano general para lugares, plano medio para conversaciones, plano
  detalle para documentos. Nunca rostros en primer plano que contradigan los retratos.
- **Personajes reconocibles por silueta y ropa** (moño y morral cruzado de Renata; pañuelo de
  Pilar; camisa blanca y llaves de Marrugo; saco gris y sello de Moscote). Ver las fichas.
- **Luz coherente por lugar**: Ciénaga = verde azulado y lámpara cálida; Altamar = cemento gris,
  cielo blanco de calor, toldos de colores apagados; Puerto Baluarte = luz de tubo, papel y
  dorado apagado.
- **Nada alegórico**: sin auras, rayos de luz divinos, símbolos flotantes ni margaritas
  gigantes. La margarita, cuando aparece, es una planta pequeña en un borde.
- Todas las láminas de un episodio se generan en la misma sesión con la misma descripción de
  estilo, adjuntando la primera aprobada como referencia de las demás.

### Menú

| Id           | Escena                                    | Composición                                                                                                                                                                  | Luz                                              |
| ------------ | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `menu-fondo` | La ciénaga desde el muelle de la estación | Gran plano general: muelle de madera en primer plano, mangles, agua abierta, la estación con paneles solares a la izquierda; sin personajes; tercio inferior en calma (agua) | Amanecer verde azulado con una lámpara encendida |

### Prólogo (`ep00`, cinemática de apertura)

| Id              | Escena                                           | Composición                                                                                                                                                              | Luz                                                |
| --------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| `ep00-lamina-1` | El casco antiguo de Puerto Baluarte bajo el agua | Calle colonial inundada hasta los balcones; un campanario; una canoa lejana; la muralla al fondo                                                                         | Atardecer nublado, ceniza y dorado apagado         |
| `ep00-lamina-2` | El archivo vacío                                 | Pasillo de archivo de la Oficina de Registro: estantes metálicos sin carpetas, agua en el piso reflejando una ventana rota, una carpeta abierta y mojada en primer plano | Luz fría desde la ventana                          |
| `ep00-lamina-3` | La fila ante la ventanilla                       | Personas de espaldas en fila frente a una ventanilla con reja; detrás, un hombre de saco gris sella un papel                                                             | Interior, luz de tubo; el sello es el punto dorado |
| `ep00-lamina-4` | La estación de la ciénaga                        | Estación de investigación entre mangles con paneles solares y una lámpara encendida en una ventana; tanques de agua; muelle                                              | Noche azul verdosa; la lámpara es cálida           |
| `ep00-lamina-5` | Renata en el muelle                              | Renata de espaldas (moño, morral cruzado) en el muelle, mirando el agua abierta; canoa amarrada. Se reutiliza en el cierre del prólogo                                   | Amanecer; primera luz dorada                       |

### Prólogo (`ep00`, escena clave)

| Id                    | Diálogo                       | Composición                                                                                                                                                                       | Luz                          |
| --------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `ep00-lamina-encargo` | `ep00-clemencia` (el encargo) | Plano detalle: sobre la mesa de la rectora, una carta doblada con sello de la Oficina y un anillo de plata con una margarita grabada; al fondo, desenfocada, la mano de Clemencia | Lámpara de mesa, papel crema |

### Episodio 1 (`ep01`)

| Id                        | Uso                           | Composición                                                                                                                                                                                                                                      | Luz                                        |
| ------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ |
| `ep01-lamina-llegada`     | Cinemática de apertura        | Gran plano general desde el agua: tres torres grises a medio construir, una habitada (ropa tendida, toldos, humo de cocina), las otras dos esqueletos de concreto; una canoa llegando en primer plano                                            | Mediodía blanco, cemento y sal             |
| `ep01-lamina-lobby`       | Diálogo `ep01-llegada`        | Plano general interior: el lobby de la torre; a la izquierda, el muro de cientos de carnés colgados con clavos; una fila de personas de espaldas hacia un mostrador; una mujer con pañuelo apoyada en una columna mirando a cámara de lejos      | Luz gris de claraboya                      |
| `ep01-lamina-audiencia`   | Diálogo `ep01-tras-audiencia` | Plano medio: la piscina vacía como anfiteatro, vecinos sentados en los bordes; en el fondo de la piscina, Marrugo de pie con una hoja sellada en la mano y la cabeza baja; Renata de espaldas en primer plano; Pilar mirando a la gente, no a él | Tarde, sombra larga de la torre            |
| `ep01-lamina-cuaderno`    | Diálogo `ep01-cierre`         | Plano detalle: un cuaderno escolar abierto en la primera página sobre una baldosa rota; una mano escribe con lápiz; al lado, la libreta de la partera; un niño descalzo asoma los pies                                                           | Tarde suave, dorada                        |
| `ep01-lamina-registrador` | Diálogo `ep01-registrador`    | Plano medio: la Oficina de Registro de Puerto Baluarte; un hombre de saco gris (Moscote) sentado ante un escritorio con un sello, a contraluz de una ventana con reja; un mensajero de pie con gorra en la mano; archivadores metálicos          | Luz de tubo verdosa y un rectángulo de sol |
| `ep01-lamina-cierre`      | Cinemática de cierre          | La piscina sembrada: el fondo convertido en huerta, vecinos con regaderas, agua corriendo por una manguera; en un borde, margaritas pequeñas; al fondo la torre con toldos y ropa tendida                                                        | Tarde suave                                |

### Otros (opcionales)

| Id                | Uso                                                              |
| ----------------- | ---------------------------------------------------------------- |
| `ep00-graduacion` | Retrato de grupo de la cohorte en el herbario (para el Cuaderno) |

## 2. Retratos: encuadre común

Ver `01-GUIA-NANO-BANANA.md` §2. Se recomienda generar los tres de cada personaje **en una
misma sesión** con el mismo prompt cambiando solo la expresión, y adjuntar el `neutra` como
referencia al generar `tensa` y `cordial`.

## 3. Iconos del mundo (PNG con alfa, píxel exacto)

| Archivo          | Tamaño | Qué es                                                                            |
| ---------------- | ------ | --------------------------------------------------------------------------------- |
| `hablar.png`     | 10×9   | Globo de diálogo con tres puntos; aparece sobre personas y objetos interactuables |
| `documento.png`  | 10×12  | Hoja con esquina doblada y líneas; evidencia documental en el suelo               |
| `folio.png`      | 10×12  | Página con encabezado violeta; folio suelto del Códice                            |
| `testimonio.png` | 10×10  | Busto pequeño con un globo; marcador de testimonio                                |
| `alerta.png`     | 8×10   | Signo de exclamación dorado; sobre una patrulla que detecta                       |
| `ojo.png`        | 9×6    | Ojo claro; cono de visión activo                                                  |

Colores: papel `#f3ead8`, líneas `#cfc2a3`, violeta `#5a3f86`, dorado `#e2b94a`, tinta
`#1b1b1f`. Sin contorno exterior.

## 4. Interfaz (capa DOM)

La interfaz de texto (diálogo, Zurrón, Códice, Audiencia, Pacto, Cuaderno) se construye en
HTML con la estética «papel y tinta»: fondo crema `#f3ead8`, bordes de una línea `#cfc2a3`,
sellos dorados apagados para hitos. No necesita imágenes salvo:

| Archivo                       | Tamaño | Uso                                                                                                       |
| ----------------------------- | ------ | --------------------------------------------------------------------------------------------------------- |
| `ui/sello-bellium.png`        | 64×64  | Sello circular de la Biblioteca (una margarita estilizada en línea, sin brillo) para actas y certificados |
| `ui/sello-oficina.png`        | 64×64  | Sello rectangular de la Oficina de Registro (un folio con número), para los documentos del adversario     |
| `ui/marco-acta.png`           | 320×48 | Orla superior de las actas (motivo de hojas de mangle, muy discreto)                                      |
| `ui/medidor-balanza.png`      | 16×16  | Icono del medidor Posición (balanza)                                                                      |
| `ui/medidor-tension.png`      | 16×16  | Icono del medidor Tensión (línea que tiembla)                                                             |
| `ui/medidor-credibilidad.png` | 16×16  | Icono del medidor Credibilidad (marca de sello)                                                           |

Estos archivos se referencian por URL desde la interfaz; si faltan, la interfaz usa formas
CSS. No requieren normalización: exportar a tamaño exacto.
