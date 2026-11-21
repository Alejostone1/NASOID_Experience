# Informe de pruebas — NASOID Experience

Fecha: 21-11-2026 · Herramienta: Playwright (Chromium) sobre la versión compilada (`vite build` + `vite preview`) · Script: `tests/e2e.py`

**Resultado: 25/25 comprobaciones superadas · 0 errores de consola.**

El navegador de pruebas no tenía GPU (WebGL por software, SwiftShader). Por eso todo va mucho más lento que en un computador normal: unos 6 cuadros por segundo en calidad baja.

## Presentación (5/5)
| Prueba | Resultado |
|---|---|
| 10 escenas cargan | sí |
| Botones «EXPLORAR SIMULADOR NASOID» → `/experience/` | 3 de 3 |
| Navegación con teclado (→, Inicio) | sí |
| Cifras de V27 presentes (19 bovinos; finca A 7, finca B 12; 95 / 114 / 209 fotos) | sí |
| Vista de celular (390 × 844) | captura `pres_movil.png` |

## Simulador NASOID RANCH (20/20)
| Prueba | Resultado |
|---|---|
| Carga del escenario | 6 s hasta el menú |
| Galería de práctica (ResNet50 + 18 fotos de referencia tomadas en el brete) | 7 registros; 284 s sin GPU, solo la primera visita |
| Calibración del umbral (regla de V27) | θ* = 0,916 con FMR = 0; genuino mínimo 0,921 > θ > impostor máximo 0,915 |
| Movimiento con WASD | 1,76 m |
| Interacción con `E` | menú contextual del bovino |
| Cámara virtual y ajuste de distancia | 30 cm → 50 cm |
| Recorte interactivo (arrastrar el recuadro) | se movió 45 px |
| **Identificado** (BOV-001 fotografiado en el potrero) | s = 0,936 ≥ θ = 0,916; 2.º candidato 0,848 |
| **No identificado** (bovino n.º 8, sin registro) | s = 0,839 < θ; rechazo correcto |
| **No concluyente** (BOV-003 = BOV-007, el mismo animal registrado dos veces, fotografiado en el brete) | empate 0,972 = 0,972 |
| Registrar un bovino nuevo por la interfaz (2 fotos) | registrado |
| Identificar al recién registrado | Identificado (s = 0,993) |
| Editar la ficha | nombre actualizado |
| Historial del animal | registro, referencias, identificación y edición |
| Eliminar un registro | 8 → 7 |
| Persistencia al recargar (IndexedDB) | 7 registros y desafíos conservados |
| Desafíos | los cuatro logrados |
| Reiniciar datos de práctica | galería recreada, desafíos en blanco |
| Vista táctil (390 × 844) | joystick visible |

Las capturas de cada paso quedan en `tests/screens/` al ejecutar las pruebas.

## Errores encontrados y corregidos durante las pruebas
- **Recorte demasiado amplio.** Con frente, cuernos, cielo y pasto dentro del recuadro, ResNet50 confundía animales distintos (impostor máx. 0,961). Ahora el recorte se ciñe al plano naso-labial y la separación es completa: 27/27 en la prueba de vecino más próximo.
- **Registro duplicado y calibración.** Los pares BOV-003/BOV-007 contaban como «impostores» y elevaban el umbral. Ahora, los registros que comparten una misma foto se tratan como el mismo animal al calibrar.
- **Eliminar un registro.** No terminaba porque el aviso de fin de la transacción de IndexedDB se escuchaba demasiado tarde. Corregido.
- **Volver a la finca justo después del resultado.** El guardado del resultado podía cambiar el estado del juego. Ahora se guarda en cuanto aparece.
- **Desborde de la tarjeta del resultado** en pantallas de 1024 × 600. Corregido.

## Observaciones honestas
- Fotografiar en el potrero a un animal cuyas referencias se tomaron en el brete puede dar un falso rechazo, porque cambian la luz y el ángulo del sol. En una prueba, BOV-003 dio 0,825. Es un comportamiento realista: la app lo explica y sugiere usar el brete, como en el protocolo de V27.
- Disparar mientras la cámara enfoca desenfoca la foto a propósito, y eso baja la similitud.
- No se midieron cuadros por segundo con GPU real. No se probó en Safari ni en celulares físicos.
- Los resultados son del **modo práctica** (hocicos generados por computador). No son resultados experimentales de la investigación.

## Cómo repetirlas
```bash
npm install && npm run build && npx vite preview --port 4174 &
pip install playwright && playwright install chromium
python3 tests/e2e.py http://localhost:4174/
```
