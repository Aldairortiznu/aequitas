# Acta de decisiones

Decisiones de Dirección (Bellium) que fijan el rumbo del proyecto. Cada entrada lleva
fecha, decisión y consecuencia. Las decisiones pendientes están al final.

## 2026-09-12

| #   | Decisión                                                                                                                                                                                                | Consecuencia                                                                                                                 |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| D1  | El juego real se construye desde cero; del prototipo solo se conserva la premisa (Gran Fractura, Biblioteca, cero violencia, justicia restaurativa, margarita, estética 16-bit).                        | Repositorio nuevo en `C:\Users\Aldai\Documents\Bellium\aequitas`; el prototipo queda archivado en la rama `prototipo-2026`.  |
| D2  | Se reutiliza el repositorio GitHub `Aldairortiznu/aequitas` y la URL pública.                                                                                                                           | `main` seguirá mostrando el prototipo hasta que haya algo jugable; el trabajo va en `desarrollo`.                            |
| D3  | Elenco nuevo con ecos de _Cien años de soledad_, sin copiar personajes: Renata Iriarte, Petra Iriarte, Evaristo Moscote «el Registrador», Pilar, Prudencio, Gerineldo, Clemencia. Apellidos opcionales. | Toda la biblia y el contenido usan estos nombres.                                                                            |
| D4  | Arte provisional generado por código (paleta definitiva) hasta que exista arte final.                                                                                                                   | E1 hornea sprites y tiles en el arranque; la ruta de producción de arte final sigue pendiente.                               |
| D5  | La web pública se reemplaza solo cuando el vertical slice (Prólogo + Ep. 1) sea jugable.                                                                                                                | Despliegue a Pages únicamente desde `main`.                                                                                  |
| D6  | Tono sobrio en todo el texto: nada obvio, alegórico ni cursi.                                                                                                                                           | Regla de escritura en `docs/design/02-narrativa.md` §1; filtro en revisión de guion.                                         |
| D7  | Stack fijado: Phaser 3.90, Vite 7, TypeScript 5.9, Preact 10, zod 4, Vitest 4, Playwright, ESLint 9.                                                                                                    | Versiones ancladas en `package.json`; no subir de versión mayor sin ticket.                                                  |
| D8  | Dos registros visuales: el mundo en pixel art 16-bit; las láminas (aperturas, cierres y conversaciones decisivas) en ilustración pintada cinematográfica 16:9.                                          | Nodo de diálogo con `lamina`; lista y composición en `docs/arte/04-LAMINAS-UI-ICONOS.md`; el arte se produce en Antigravity. |
| D9  | Cada episodio se puede empezar por separado (Códice base en el manifiesto) y, al terminar, continúa con el estado acumulado si el siguiente está publicado; si no, vuelve al título.                    | `manifest.codice`, `session.endEpisode()`; `nextEpisode` solo apunta a episodios existentes.                                 |
| D10 | Protagonistas seleccionables: Renata, Ramiro, Ariel, Cruz y un personaje personalizado; todos Iriarte. Tratamiento femenino, masculino o neutro; el neutro se reformula sin marcar género.              | `Jugador` en el estado; plantillas `{nombre}` y `{f                                                                          | m   | n}` en el contenido; creador con piezas por código; arte por capas pendiente. |

## Pendientes

| Decisión                          | Opciones                                                          | Recomendación                                                         |
| --------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------------- |
| Ruta de producción del arte final | Pixel artist comisionado; generación asistida con limpieza; mixto | Mixto: personajes comisionados, tiles y láminas generados y limpiados |
| Audio                             | Compositor chiptune; generación con edición                       | Compositor para temas principales; generación para efectos            |
| Revisor jurídico                  | Un abogado fijo con suplente; rotación                            | Un abogado fijo, una hora semanal                                     |
| Cadencia por episodio             | 5 o 6 semanas                                                     | 5 con margen cada dos episodios                                       |
| Idiomas                           | Solo español                                                      | Solo español en la Temporada 1                                        |
| Analítica                         | Ninguna; local anónima                                            | Ninguna                                                               |
