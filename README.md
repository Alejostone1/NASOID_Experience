# NASOID Experience

Segunda versión, independiente, de la sustentación del proyecto **NASOID: identificación biométrica naso-labial en bovinos** (Universidad Católica de Pereira, 2026). Autores: Daniel Felipe Colorado Amaya y John Alejandro Piedrahita Muñoz.

Tiene dos partes:

| Ruta | Qué es |
|---|---|
| `/` | **Presentación simplificada**: 10 escenas con fondo claro y un bovino 3D animado. Usa los mismos datos de V27, explicados sin tecnicismos. |
| `/experience/` | **NASOID RANCH — Biometric Experience**: finca 3D tipo videojuego. Caminas con un operario, te acercas a un bovino, fotografías su hocico y ves cómo NASOID lo identifica. |

La versión académica (`NASOID_Sustentacion`) no se modificó.

## Ejecutar

Requisitos: Node.js 20 o superior.

```bash
npm install
npm start            # compila y abre http://localhost:4174
# o, para desarrollo:
npm run dev          # http://localhost:5174
```

El simulador necesita un servidor (no funciona abriendo el HTML con doble clic) porque descarga el modelo ResNet50 desde `public/models/resnet50/`, que pesa 47 MB y queda en caché después de la primera visita.

## Cómo se juega

| Acción | Teclado y ratón | Táctil |
|---|---|---|
| Caminar / correr | `W A S D` o flechas / `Shift` | joystick izquierdo |
| Girar la cámara / acercar | arrastrar / rueda | arrastrar a la derecha |
| Interactuar con un bovino | `E` (luego `1` a `4`) | botón `E` |
| Capturar la foto | `Espacio` | botón obturador |
| Registro de bovinos | `R` | botón «Registro» |
| Ayuda · pantalla completa · menú | `H` · `F` · `Esc` | botones superiores |

Recorrido: acércate a un bovino → **Fotografiar e identificar** → ajusta distancia (~30 cm), ángulo y altura hasta que todo quede en verde → captura → revisa y recorta → **ANALIZAR IDENTIDAD** → el análisis pasa por cuatro etapas (preparación, características, comparación y resultado).

Desafíos: lograr los tres resultados (Identificado, No identificado y No concluyente) y registrar un bovino nuevo.

## Qué es real y qué es práctica

**Se ejecuta de verdad en el navegador:**
- la captura (píxeles del render 3D o una foto que subas);
- el recorte y el cambio de tamaño a 224 × 224;
- ResNet50 con pesos de ImageNet, sin entrenamiento, con `include_top=False`, `pooling='avg'` y `preprocess_input`;
- la similitud coseno, el vecino más próximo (1-NN), la calibración del umbral con la regla de V27 y la regla de decisión;
- el registro persistente (IndexedDB).

**Modo práctica:** los bovinos y sus hocicos son modelos 3D con patrones generados por computador. Las cifras que aparecen sirven para entender el proceso y **no son resultados experimentales** de la investigación. La interfaz lo indica con la etiqueta discreta «Modo práctica».

Más detalles en [`docs/architecture.md`](docs/architecture.md) y [`docs/testing.md`](docs/testing.md).

## Datos de práctica
En la primera visita se crea una galería con seis bovinos registrados, cada uno con tres fotos tomadas en el brete. Además hay un registro duplicado (BOV-007 = BOV-003) para practicar el caso «no concluyente», y tres bovinos que no están registrados. Para reiniciarla: menú → «Reiniciar datos de práctica», o el botón del mismo nombre en el Registro.

## Despliegue
Proyecto Vite multipágina (`vercel.json` incluido). Se publica como proyecto separado del original, por ejemplo con un repositorio `NASOID_Experience` conectado a Vercel.

## Créditos técnicos
three.js, GSAP, TensorFlow.js y las fuentes Fraunces e IBM Plex. Los pesos de ResNet50 provienen del paquete npm `idai-shapes-ceramics_resnet50` (DAI, licencia ISC), convertidos con `tools/quantize_resnet.py`.
