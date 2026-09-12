# ⚖️ AEQUITAS: El Retorno del Equilibrio
## *Dossier Maestro de Diseño, Arquitectura y Guía de Arranque en Frío*
**Bellium S.A.S. · Editorial Al Resuelve (Cartagena de Indias, Colombia)**

---

## 📌 1. Ficha Técnica y Estado del Proyecto

* **Título Oficial:** AEQUITAS: El Retorno del Equilibrio
* **Género:** RPG Dialéctico / Aventura de Jurisprudencia Restaurativa (16-bit Retro Solarpunk & Botánico)
* **Motor & Tecnologías:** Phaser 3.90.0 · Vite 5.4 · JavaScript ES Modules · Web Audio API · HTML5 / CSS3 Responsive Virtual Gamepad
* **Repositorio GitHub Oficial:** [https://github.com/Aldairortiznu/aequitas](https://github.com/Aldairortiznu/aequitas)
* **Despliegue Web Público (Multi-dispositivo):** [https://aldairortiznu.github.io/aequitas/](https://aldairortiznu.github.io/aequitas/)
* **Ubicaciones Locales:**
  * Código fuente de desarrollo: `C:\Users\Aldai\.gemini\antigravity\scratch\aequitas-repo`
  * Compilación local autónoma: `C:\Users\Aldai\Documents\AEQUITAS_Piloto`
  * Lanzador Windows para un solo clic: `C:\Users\Aldai\Documents\JUGAR_AEQUITAS.bat`
* **Historial y Proyecto Base:** Código derivado e independizado de [https://github.com/Aldairortiznu/reverdecer](https://github.com/Aldairortiznu/reverdecer) (restaurado 100% a su estado original de Abigail y los 32 reinos).

---

## 🌿 2. Filosofía, Tesis y Manifiesto de Diseño

### A. La Premisa Narrativa
Tras la «Gran Fractura», las instituciones formales del Estado colapsaron en el Caribe colombiano y las tierras altas. Al extinguirse la memoria de las leyes, la sociedad retrocedió a un estado feudal donde caudillos de facto impusieron su voluntad mediante la fuerza bruta, el despojo de tierras y el secuestro de recursos vitales (cauces de agua y caminos).

En este escenario, la **Gran Biblioteca Experimental de Bellium** sobrevivió oculta entre bóvedas subterráneas, fuentes solares y enredaderas bioluminiscentes. Una comitiva de cuatro juristas y cartógrafos emprende una expedición por las colonias para **restablecer el orden social y la certidumbre basándose en la Constitución Política de Colombia de 1991, el Código Civil y el Código de Comercio**.

### B. Cero Violencia Punitiva · Cero Armas de Fuego · Cero Mascotas
1. **Sin armas letales:** No existen espadas de sangre, pistolas ni justicia por mano propia. La única "munición" son los **Alegatos Jurídicos**: argumentos fundamentados en el derecho formal que desarman la soberbia del detractor.
2. **Justicia Restaurativa:** El objetivo no es asesinar ni encarcelar al adversario, sino desmontar sus cláusulas nulas y lograr que se allane al pacto colectivo.
3. **El Florecimiento de Bellium:** Al suscribir un acuerdo legítimo, brota del concreto y de la tierra la **Margarita Dorada de Bellium** (`bellium_flower`), símbolo viviente de que la justicia devuelve la fertilidad a la comunidad.
4. **Enfoque 100% Humano:** Se eliminaron las mascotas acompañantes (Jerónimo y Amanda del prototipo anterior). La expedición está conformada exclusivamente por los exploradores académicos y juristas de la Biblioteca.

---

## 👥 3. Los Cuatro Exploradores (Roster Jugable)

Cada jugador puede elegir libremente con quién jugar en la pantalla de inicio. El motor asigna el sprite real, la insignia en el HUD, el diálogo inicial personalizado y una **habilidad pasiva mecánica única**:

### 1. 📜 Aurelio — *El Archivista Errante*
* **Especialidad:** Debido Proceso & Códice Civil (**Art. 29 C.P.**).
* **Perfil:** Erudito con gafas doradas, túnica púrpura real de Bellium y zurrón de cuero con los códices originales.
* **Pasiva Mecánica en Juego:** *Mayor Alcance Procesal*. Su proyectil de Alegato Jurídico tiene un tamaño incrementado (`alegatoScale: 2.0`, +33%) e inflige mayor impacto dialéctico (daño 25), ideal para mantener a raya la arbitrariedad a distancia.

### 2. 💧 Valeria — *La Cartógrafa de Aguas*
* **Especialidad:** Propiedad Horizontal & Servidumbres Legales (**Ley 675 de 2001 / Art. 919 C.C.**).
* **Perfil:** Agrimensora con cinta verde, brújula de latón al pecho y tubo porta-planos. Defensora de que los cauces de agua son bienes de uso común.
* **Pasiva Mecánica en Juego:** *Agilidad Topográfica*. Se desplaza un **+20% más rápido** por el mapa (`SPEED * 1.20`), permitiendo una exploración ágil y esquiva fluida frente a proyectiles arbitrarios.

### 3. ⚖️ Kaelen — *El Custodio de la Balanza*
* **Especialidad:** Títulos Valores & Erradicación de la Usura (**Código de Comercio, Arts. 622 y 884**).
* **Perfil:** Custodio de túnica grafito y porte solemne. Porta la balanza dorada para anular pagarés en blanco y contratos abusivos.
* **Pasiva Mecánica en Juego:** *Convicción Mercantil Rápida*. Su habilidad de **Dignidad Constitucional (`V`)** tiene un enfriamiento reducido a **7.5 segundos** (frente a los 11s estándar), permitiéndole entrar en trance dialéctico con alta frecuencia.

### 4. 🏛️ Sora — *La Centinela Constitucional*
* **Especialidad:** Derechos Fundamentales & Dignidad Humana (**Arts. 1 y 4 C.P. — Norma de Normas**).
* **Perfil:** Defensora encubierta con media máscara de bronce y báculo de madera solar. Su palabra frena cualquier decreto tiránico.
* **Pasiva Mecánica en Juego:** *Inviolabilidad Moral*. Posee **130 puntos de resistencia moral** (vida máxima ampliada) y una proyección de alegato balanceada (`scale: 1.7`), convirtiéndola en el baluarte más resistente del equipo.

> **Compañeros Dinámicos:** Los 3 exploradores que no elijas te siguen en formación de marcha en fila india. Al acercarte a ellos y pulsar `E`, ofrecen consejos procesales sobre el conflicto del territorio actual.

---

## 🎬 4. El Prólogo Cinemático en 5 Actos (`IntroScene.js`)

Inspirado en las aperturas de **Mega Man X4** y **The Legend of Zelda**, con arte botánico 16-bit, zoom Ken Burns, máquina de escribir con clics procedurales y arpegios armónicos de arpa:

1. **Acto I: La Gran Fractura y el Silencio de la Ley**  
   *Arte:* `intro_1_fractura.jpg` (Palacio de justicia neoclásico en ruinas invadido por enredaderas al atardecer caribeño).  
   *Guión:* «Hubo un tiempo en que la paz no dependía del calibre de un arma, sino de la fuerza invisible de una palabra compartida: la Ley. Tras la Gran Fractura, las instituciones cayeron y se extinguió la certeza jurídica. Los acuerdos fueron rasgados, los acueductos comunales fueron secuestrados y los débiles fueron expulsados al desierto. En el yermo, la arbitrariedad se coronó como soberana.»

2. **Acto II: El Códice que no Ardió**  
   *Arte:* `intro_2_codice.jpg` (La Constitución sobre atril de cedro vivo, balanza de bronce, vidrieras y margaritas).  
   *Guión:* «Sin embargo, la justicia aguardaba en silencio bajo las raíces. En un atril de cedro vivo, los sabios preservaron intacto el Códice Supremo: la Constitución de 1991, los principios del Debido Proceso y las normas de convivencia civil. Allí estaba escrito que la dignidad humana es innegociable y que nadie puede ser despojado sin ser escuchado.»

3. **Acto III: El Santuario de Bellium**  
   *Arte:* `intro_3_biblioteca.jpg` (Bóvedas subterráneas con fuentes luminosas y flora bioluminiscente).  
   *Guión:* «Oculta tras manantiales cristalinos y murallas de flora bioluminiscente, la Biblioteca formó a una estirpe única de juristas y botánicos. Comprendieron que la tierra y la sociedad comparten una misma verdad: cuando la arbitrariedad envenena el cauce, todo muere; cuando la equidad devuelve el orden, la vida florece con esplendor.»

4. **Acto IV: La Comitiva de los Cuatro Restauradores**  
   *Arte:* `intro_4_exploradores.jpg` (Retrato monumental de Aurelio, Valeria, Kaelen y Sora mirando al valle al amanecer).  
   *Guión:* «Hoy, cuatro juristas han jurado marchar hacia las colonias para devolver el orden social: Aurelio, archivista del Debido Proceso; Valeria, cartógrafa de aguas y servidumbres; Kaelen, custodio de la balanza comercial; y Sora, centinela de la dignidad humana.»

5. **Acto V: El Retorno del Equilibrio**  
   *Arte:* `intro_5_concilio.jpg` (Asamblea comunal firmando el pacto con margaritas doradas brotando en el piso).  
   *Guión:* «Su mandato no es castigar con violencia: es legitimar nuevos pactos comunales y reconciliar a los sobrevivientes. Y la naturaleza sellará cada acuerdo: donde una controversia sea resuelta bajo la equidad, la legendaria Margarita Dorada de Bellium brotará del suelo como testimonio de paz. Toma tu zurrón. Elige a tu explorador. El equilibrio está en tus manos.»

---

## 🗺️ 5. Mapa de Capítulos y Dilemas Jurídicos (Roadmap)

| Cap. | Distrito / Territorio | Antagonista / Detractor | Conflicto Jurídico | Fundamento Legal Colombiano |
| :---: | :--- | :--- | :--- | :--- |
| **0** | **La Gran Biblioteca Experimental** | El Eco del Caos Olvidado | Decretos arbitrarios de facto vs. Principio de Legalidad | **Art. 4 C.P.** (Constitución como Norma de Normas). |
| **1** | **Torre Ceniza** | Prefecto Muro-Ciego | Desalojo sumario de Doña Inés y Mateo sin asamblea ni defensa | **Art. 29 C.P.** & **Ley 675 de 2001** (Debido proceso en P.H.). |
| **2** | **El Embarcadero Fluvial** | Silas el Especulador | Cobro usurario de pagarés firmados en blanco sin carta de instrucciones | **Art. 622 y 884 Código de Comercio** (Límite de usura). |
| **3** | **Las Terrazas Agrarias** | Don Robustiano el Acaparador | Cierre arbitrario del canal de riego comunal alegando propiedad privada | **Art. 919 Código Civil** (Servidumbre legal de acueducto). |
| **4** | **El Santuario de la Margarita** | La Sombra de la Discordia | Redacción final del Gran Pacto Social de Convivencia | **Arts. 1 y 22 C.P.** (Estado Social de Derecho y Derecho a la Paz). |

---

## 🏗️ 6. Arquitectura del Código Fuente

El repositorio está organizado de forma modular sobre Vite + Phaser 3:

```text
aequitas-repo/
├── .github/workflows/deploy.yml   # Despliegue automático CI/CD a GitHub Pages
├── public/assets/intro/           # 6 ilustraciones maestras optimizadas (WebP/JPG ~80-110KB)
│   ├── intro_1_fractura.jpg
│   ├── intro_2_codice.jpg
│   ├── intro_3_biblioteca.jpg
│   ├── intro_4_exploradores.jpg
│   ├── intro_5_concilio.jpg
│   └── menu_bg.jpg
├── src/
│   ├── main.js                    # Arranque del juego y registro de escenas Phaser
│   ├── config.js                  # Paleta Bellium, resolución (480x270), constantes de exploradores
│   ├── art/
│   │   ├── spriteData.js          # Definición en píxeles (PAL) de los 4 exploradores y antagonistas
│   │   ├── characters.js          # Horneado de texturas de personajes con guardas null-safe
│   │   ├── tiles.js               # Suelos y decorados básicos
│   │   └── biomeTextures.js       # Fondos y texturas por bioma
│   ├── data/
│   │   ├── dialogues.js           # Diálogos contextuales y getIntroConvo(explorerKey)
│   │   ├── legalCases.js          # Banco de casos jurídicos colombianos
│   │   ├── bookRiddles.js         # Preguntas de selección múltiple del Atril
│   │   └── reinos.js              # Capítulos, colores de ambiente y enseñanzas
│   ├── scenes/
│   │   ├── BootScene.js           # Preload de imágenes y horneado de texturas
│   │   ├── IntroScene.js          # Prólogo cinematográfico en 5 actos estilo Mega Man / Zelda
│   │   ├── MenuScene.js           # Menú principal con fondo botánico y selector interactivo
│   │   ├── WorldScene.js          # Gameplay principal, comitiva, combate dialéctico y HUD
│   │   ├── DialogueScene.js       # Cuadro de diálogo con avatar del explorador
│   │   ├── DiaryScene.js          # Códice de la Ley y memoria de pactos
│   │   └── RiddleScene.js         # Atril de resolución de dilemas jurídicos
│   └── systems/
│       ├── audio.js               # Sintetizador procedural Web Audio API (cero dependencias MP3)
│       └── save.js                # Sistema de guardado en localStorage
├── index.html                     # Shell botánico con mando táctil ergonómico para móviles
├── vite.config.js                 # Configuración de empaquetado Vite con base './'
└── JUGAR_AEQUITAS.bat             # Lanzador Windows local con servidor web automático
```

---

## 📱 7. Sistema de Control Dual (Móvil y Teclado)

| Acción | Control en Teclado (PC) | Mando Táctil (Celular Vertical) | Mando Táctil (Celular Horizontal) |
| :--- | :---: | :---: | :---: |
| **Moverse** | `W, A, S, D` o Flechas | D-Pad en cruz (`▲`, `◀`, `▼`, `▶`) | D-Pad translúcido flotante izquierdo |
| **Alegato Jurídico** | `Barra Espaciadora` | Botón dorado `[⚡ ALEGATO]` | Botón flotante derecho `[ALEGATO]` |
| **Hablar / Atril / Guardar** | `E` | Botón `[💬 HABLAR / CASO]` | Botón flotante derecho `[HABLAR]` |
| **Dignidad Constitucional** | `V` | Botón `[🛡️ V DIGNIDAD]` | Botón flotante `[DIGNIDAD]` |
| **Control de Legalidad** | `B` | Botón `[📜 B LEGALIDAD]` | Botón flotante `[LEGALIDAD]` |
| **Códice de la Ley** | `I` | Botón `[📖 I CÓDICE]` | Botón flotante `[CÓDICE]` |
| **Pausar / Volver** | `Escape` | Tap en esquina superior | Tap en esquina superior |

---

## ❄️ 8. Guía de Arranque en Frío (Para Retomar en Otra Sesión)

Cuando abras una nueva sesión de trabajo y quieras continuar el proyecto sin perder un minuto:

### Paso 1: Ubicación del Directorio de Trabajo
El código fuente actualizado reside en:
```bash
cd "C:\Users\Aldai\.gemini\antigravity\scratch\aequitas-repo"
```

### Paso 2: Levantar el Servidor de Desarrollo Local
Para probar cambios en vivo en tu navegador en `http://localhost:5173/`:
```bash
npm run dev
# o para previsualizar la compilación final:
npm run preview
```

### Paso 3: Compilar y Desplegar a Producción (GitHub Pages)
Cada vez que hagas mejoras y quieras que se vean en celulares y la nube:
```bash
# 1. Compilar bundle optimizado
npm run build

# 2. Guardar cambios en git
git add .
git commit -m "feat: [descripción de la mejora]"

# 3. Enviar a GitHub (GitHub Actions compilará y desplegará en ~35 segundos)
git push origin main
```
*URL en vivo:* `https://aldairortiznu.github.io/aequitas/`

### Paso 4: Actualizar la Copia Autónoma en Documentos
Si deseas actualizar la carpeta ejecutable local sin necesidad de internet:
```bash
python -c "
import shutil, os
src = r'C:\Users\Aldai\.gemini\antigravity\scratch\aequitas-repo\dist'
dest = r'C:\Users\Aldai\Documents\AEQUITAS_Piloto'
shutil.copytree(src, dest, dirs_exist_ok=True)
print('Actualizado en:', dest)
"
```

---

## 🚀 9. Próximos Pasos Recomendados para la Siguiente Sesión

1. **Diseño de Mapas de los Capítulos 1, 2 y 3:**  
   Diseñar los biomas de *Torre Ceniza* (arquitectura colonial agrietada), *El Embarcadero Fluvial* (palafitos, muelles de madera y barcazas) y *Las Terrazas Agrarias* (canales de agua secuestrados con compuertas).
2. **Sistema de Evidencias y Códice Acumulativo:**  
   Permitir que el jugador recoja pruebas documentales en el terreno (p. ej. el "Edicto sin firma", el "Pagaré sin instrucciones") para usarlas directamente en el diálogo contra el detractor.
3. **Música Ambiental Procedural por Bioma:**  
   Expandir `src/systems/audio.js` con una pista instrumental procedural continua de baja intensidad para cada distrito (modo arpa y campanas).
4. **Cinemática de Cierre del Capítulo:**  
   Mostrar una postal ilustrada cada vez que la Margarita Dorada florece y se firma el acta de conciliación con la comunidad.
