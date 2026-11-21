# NASOID Experience — arquitectura

Segunda versión independiente de NASOID. No comparte archivos con `NASOID_Sustentacion` (la versión académica): solo se copiaron, y luego se adaptaron, el mallador SDF, la textura procedimental del hocico, las operaciones de imagen y los datos de V27.

```
NASOID_Experience/
├── index.html                      presentación de sustentación (27 escenas, 5 bloques)
├── experience/index.html           NASOID RANCH (ruta /experience)
├── public/models/resnet50/         ResNet50 en formato TensorFlow.js (float16, 47 MB)
├── src/shared/                     tema claro, fuentes, datos de V27, generador con semilla
├── src/presentation/               motor (main.js), escenas por bloque (scenes/), biblioteca (biblio.js), escenario 3D, estilos
├── src/experience/
│   ├── main.js                     orquestador: carga, bucle, estados del juego, galería de práctica
│   ├── state.js                    une almacenamiento, preprocesamiento, extracción y calibración
│   ├── world/                      finca, bovinos, manada, operario, controles, cámara del celular
│   ├── biometric/                  motor biométrico (sin interfaz)
│   └── ui/                         revisión/recorte, análisis animado, registro, utilidades
├── tools/quantize_resnet.py        conversión del modelo
└── tests/e2e.py                    pruebas con Playwright en navegador real
```

## Motor biométrico (independiente de la interfaz)

| Etapa | Archivo | Qué hace |
|---|---|---|
| Captura | `world/photoCamera.js` | Coloca una cámara de celular (62° horizontales, foto 4:3) frente al hocico según distancia, ángulo, altura y giro de la cabeza; copia los píxeles reales del lienzo WebGL. |
| Delimitación (X₃) | `main.js · suggestBox` + `ui/review.js` | Propone un recuadro proyectando la región naso-labial del modelo 3D sobre la foto; el usuario puede moverlo y cambiar su tamaño. |
| Preprocesamiento (X₂) | `biometric/preprocess.js` | Recorte, cambio de tamaño bilineal a 224 × 224, nitidez (varianza del laplaciano) y brillo. |
| Extracción (X₄) | `biometric/extractor.js` | ResNet50 de Keras, `include_top=False`, `pooling='avg'`, pesos de ImageNet, sin entrenamiento. `preprocess_input` (BGR menos la media de ImageNet). Vector de 2048 valores normalizado. Backend WebGL, con alternativa WASM y CPU. |
| Almacenamiento (X₆) | `biometric/db.js` | IndexedDB: registros, fotos (JPEG), vectores (Float32Array), historial y metadatos. Persiste al recargar. |
| Comparación (X₅) | `biometric/engine.js` | Coseno, mejor puntuación por bovino `s_k = máx_j`, vecino más próximo. |
| Umbral | `biometric/engine.js · calibrate` | Regla de V27 sobre las referencias registradas: θ* = mínimo θ (rejilla 0,001) con FMR = 0; si θ* rechaza más del 10 % de pares genuinos, θ_EER. Se recalibra cada vez que cambia la galería. Las copias de la misma foto en dos registros no cuentan como par. |
| Decisión | `biometric/engine.js · identify` | `s < θ` → no identificado; empate a 0,001 con el segundo → no concluyente; en otro caso → identificado. |
| Presentación | `ui/analysis.js` | Anima lo que devolvió el motor (no decide nada). |

### Origen y verificación del modelo
- Paquete npm `idai-shapes-ceramics_resnet50@1.0.1` (Instituto Arqueológico Alemán, licencia ISC). Declara pesos de ImageNet con `include_top=false` y `pooling='avg'`.
- Comprobado: 176 capas con los nombres de Keras (`conv1_conv` … `avg_pool`) y 23 587 712 parámetros, la cifra exacta de ResNet50 sin la parte superior. `conv1_bn/moving_variance` llega a 83 614, un valor típico de los pesos de Keras para ImageNet.
- `tools/quantize_resnet.py` cambia la entrada a 224 × 224 × 3 y guarda los núcleos de convolución en float16 (BN y sesgos en float32). Coseno medio entre las salidas float32 y float16: 1,00000. La versión uint8 se descartó (coseno 0,42).
- No se pudo comparar contra los pesos originales de Keras porque el entorno de desarrollo no tenía acceso a storage.googleapis.com.

### Por qué el recorte es ajustado
Con un recuadro amplio (frente, cuernos, cielo, pasto), los vectores de animales distintos se parecían más que los del mismo animal (impostor máx. 0,961 frente a genuino mín. 0,788). Con el recuadro sobre el plano naso-labial entre las fosas nasales (lado = 0,5 × la región proyectada), en 27 fotos de 9 animales girados al azar respecto al sol: genuino mín. 0,881, impostor máx. 0,909, acierto 1-NN dejando una fuera 27/27. Esto coincide con V27: se compara la región naso-labial recortada, no la cabeza.

## Mundo 3D
- **Finca** (`world/environment.js`): terreno con relieve, pasto instanciado con viento (sombreador), cercas y corral instanciados, brete con cepo, zona de captura, establo, bebedero, pacas, piedras, árboles instanciados, montañas, cielo físico (Sky) con entorno PMREM, niebla y polen.
- **Bovinos** (`world/cow.js`): cuerpo SDF mallado una vez y compartido; cabeza SDF de la versión académica con dos niveles de detalle; patas articuladas con marcha de paso lateral; cola encadenada; orejas, párpados, respiración y masticación. Seis pelajes ilustrativos. Cada animal tiene su propio patrón naso-labial (semilla): tamaño de perlas, surcos, alargamiento y manchas de pigmento.
- **Manada** (`world/herd.js`): estados *pastar*, *caminar*, *descansar/mirar*, *atender*, *posar* y *brete*, con tiempos propios por animal, separación entre animales y curiosidad hacia el operario.
- **Operario** (`world/farmer.js`): personaje procedimental con sombrero aguadeño, ciclo de caminar/correr y pose de fotografía con celular.
- **Controles** (`world/controls.js`): WASD/flechas, Shift, ratón (arrastrar/rueda), joystick táctil, cámara en tercera persona con colisiones simples. No se usó un motor de física (Rapier): las colisiones necesarias son círculos y segmentos, y añadirlo no mejoraba la interacción.
- **Calidad**: Alta/Media/Baja (resolución, sombras, cantidad de pasto y árboles, malla de la cabeza). LOD en las cabezas, instanciado en pasto, cercas, árboles y piedras, y carga diferida de TensorFlow.js y de ResNet50.

## Galería de práctica
En la primera visita se fotografían en vivo (desde la escena) tres referencias de seis bovinos (BOV-001 … BOV-006) y se calculan sus vectores con ResNet50. BOV-007 es una copia deliberada de BOV-003, es decir, el mismo animal registrado dos veces: así se puede practicar el caso «no concluyente». Los bovinos 7, 8 y 9 del potrero no están registrados. Todo se puede borrar o reiniciar.

## Diferencias con V27 (declaradas en la interfaz)
- V27 registra como «no concluyente» tanto `s < θ` como el empate. Aquí se muestran por separado (*No identificado* y *No concluyente*) y la tarjeta del resultado aclara la correspondencia.
- V27 usa 5 fotos de referencia por animal; la práctica usa 3 para que sea ágil (la ficha lo indica).
- V27 corre ResNet50 en un servidor con Keras 3 y JAX; aquí corre en el navegador con TensorFlow.js y los mismos pesos y preprocesamiento.
- Los hocicos son texturas generadas por computador, no fotografías de bovinos: es un **modo práctica** y sus cifras no son resultados de la investigación.
