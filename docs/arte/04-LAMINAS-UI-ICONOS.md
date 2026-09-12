# 04 · Láminas, interfaz e iconos

## 1. Láminas de cinemática (960×540, 16:9)

Estilo: postal pixel art 16-bit, luz caribeña, composición amplia, **sin texto**. El tercio
inferior debe quedar tranquilo (cielo, agua o suelo) porque el juego escribe ahí el subtítulo.
Las láminas del prototipo en `art-src/referencias/` marcan el tono de luz, pero **el elenco y
los símbolos cambiaron**: sin cuatro exploradores, sin flores luminosas, sin túnicas
fantásticas.

### Prólogo (`ep00`)

| Id de archivo | Escena | Composición | Luz |
|---------------|--------|-------------|-----|
| `ep00-lamina-1` | El casco antiguo de Puerto Baluarte bajo el agua | Calle colonial inundada hasta los balcones; un campanario; una canoa lejana; muralla al fondo | Atardecer nublado, tonos ceniza y dorado apagado |
| `ep00-lamina-2` | El archivo vacío | Pasillo de archivo de la Oficina de Registro: estantes metálicos sin carpetas, agua en el piso reflejando una ventana rota, una carpeta abierta y mojada en primer plano | Luz fría desde la ventana |
| `ep00-lamina-3` | La fila ante la ventanilla | Personas de espaldas en fila frente a una ventanilla con reja; detrás, un hombre de saco gris sella un papel; un cartel sin texto legible | Interior, luz de tubo; el sello es el punto dorado |
| `ep00-lamina-4` | La estación de la ciénaga | Estación de investigación entre mangles con paneles solares y una lámpara encendida en una ventana; tanques de agua; muelle | Noche azul verdosa; la lámpara es cálida |
| `ep00-lamina-5` | Renata en el muelle | Renata de espaldas (moño, morral cruzado) en el muelle de la estación, mirando el agua abierta; canoa amarrada | Amanecer; primera luz dorada |

### Cierre del Episodio 1 (`ep01`)

| Id | Escena | Composición |
|----|--------|-------------|
| `ep01-lamina-cierre` | La piscina sembrada | La piscina vacía de Altamar convertida en huerta; vecinos con regaderas; en un borde, unas margaritas pequeñas; al fondo la torre con toldos y ropa tendida | Tarde suave |

### Menú y otros

| Id | Uso |
|----|-----|
| `menu-fondo` | Fondo del menú principal: la ciénaga desde el muelle, sin personajes, tercio inferior en calma |
| `ep00-graduacion` | Retrato de grupo de la cohorte en el herbario (opcional, para el Cuaderno) |

## 2. Retratos: encuadre común

Ver `01-GUIA-NANO-BANANA.md` §2. Se recomienda generar los tres de cada personaje **en una
misma sesión** con el mismo prompt cambiando solo la expresión, y adjuntar el `neutra` como
referencia al generar `tensa` y `cordial`.

## 3. Iconos del mundo (PNG con alfa, píxel exacto)

| Archivo | Tamaño | Qué es |
|---------|--------|--------|
| `hablar.png` | 10×9 | Globo de diálogo con tres puntos; aparece sobre personas y objetos interactuables |
| `documento.png` | 10×12 | Hoja con esquina doblada y líneas; evidencia documental en el suelo |
| `folio.png` | 10×12 | Página con encabezado violeta; folio suelto del Códice |
| `testimonio.png` | 10×10 | Busto pequeño con un globo; marcador de testimonio |
| `alerta.png` | 8×10 | Signo de exclamación dorado; sobre una patrulla que detecta |
| `ojo.png` | 9×6 | Ojo claro; cono de visión activo |

Colores: papel `#f3ead8`, líneas `#cfc2a3`, violeta `#5a3f86`, dorado `#e2b94a`, tinta
`#1b1b1f`. Sin contorno exterior.

## 4. Interfaz (capa DOM)

La interfaz de texto (diálogo, Zurrón, Códice, Audiencia, Pacto, Cuaderno) se construye en
HTML con la estética «papel y tinta»: fondo crema `#f3ead8`, bordes de una línea `#cfc2a3`,
sellos dorados apagados para hitos. No necesita imágenes salvo:

| Archivo | Tamaño | Uso |
|---------|--------|-----|
| `ui/sello-bellium.png` | 64×64 | Sello circular de la Biblioteca (una margarita estilizada en línea, sin brillo) para actas y certificados |
| `ui/sello-oficina.png` | 64×64 | Sello rectangular de la Oficina de Registro (un folio con número), para los documentos del adversario |
| `ui/marco-acta.png` | 320×48 | Orla superior de las actas (motivo de hojas de mangle, muy discreto) |
| `ui/medidor-balanza.png` | 16×16 | Icono del medidor Posición (balanza) |
| `ui/medidor-tension.png` | 16×16 | Icono del medidor Tensión (línea que tiembla) |
| `ui/medidor-credibilidad.png` | 16×16 | Icono del medidor Credibilidad (marca de sello) |

Estos archivos se referencian por URL desde la interfaz; si faltan, la interfaz usa formas
CSS. No requieren normalización: exportar a tamaño exacto.
