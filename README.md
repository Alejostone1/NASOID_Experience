<div align="center">

# Identificación biométrica naso-labial en bovinos

**Sustentación interactiva y simulador 3D de un prototipo que reconoce a cada bovino por el patrón de su hocico, con inteligencia artificial y sin marcarlo.**

Universidad Católica de Pereira · Ingeniería de Sistemas y Telecomunicaciones · 2026
Curso Fundamentos de Investigación · Asesor: Prof. Alexander Quintero

[![Ver la presentación](https://img.shields.io/badge/▶_Ver_la_presentación-5f7352?style=for-the-badge)](https://nasoid-experience.vercel.app/)
[![Abrir el simulador](https://img.shields.io/badge/🐄_Abrir_el_simulador-c8922e?style=for-the-badge)](https://nasoid-experience.vercel.app/experience/)

![three.js](https://img.shields.io/badge/three.js-r187-000?logo=threedotjs&logoColor=white)
![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-ResNet50-ff6f00?logo=tensorflow&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-3-88ce02?logo=greensock&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)
![IndexedDB](https://img.shields.io/badge/IndexedDB-persistente-4a5a2c)
![Vercel](https://img.shields.io/badge/Vercel-desplegado-000?logo=vercel&logoColor=white)

<br>

<img src="docs/screens/pres-portada.jpg" alt="Portada de la presentación con el bovino 3D" width="100%">

</div>

---

## Contenido

1. [¿Qué es?](#qué-es)
2. [La presentación](#la-presentación)
3. [El simulador](#el-simulador)
4. [Qué se ejecuta de verdad](#qué-se-ejecuta-de-verdad)
5. [Cómo está construido](#cómo-está-construido)
6. [Ejecutar en local](#ejecutar-en-local)
7. [Pruebas](#pruebas)
8. [Créditos](#créditos)

---

## ¿Qué es?

El proyecto propone identificar a cada bovino por su **plano naso-labial**, la piel sin pelo entre los orificios nasales y el labio superior. Sus «perlas» y surcos forman un patrón propio de cada animal, como una huella dactilar. Basta una foto tomada con el celular: el animal no se marca ni se manipula.

Este repositorio reúne dos experiencias web que comparten el mismo modelo 3D del bovino:

| | Ruta | Para qué sirve |
|---|---|---|
| 🎬 | [`/`](https://nasoid-experience.vercel.app/) | **Presentación de sustentación**: 21 escenas animadas y clicables, en el orden del documento y adaptadas al celular, con un bovino 3D de fondo, una biblioteca de 71 referencias con enlaces reales y notas del expositor. |
| 🐄 | [`/experience/`](https://nasoid-experience.vercel.app/experience/) | **Simulador**: una finca 3D donde caminas con un operario, llevas un bovino al brete, fotografías su hocico y ves cómo el sistema lo identifica con ResNet50. Todo corre en el navegador. |

---

## La presentación

Sigue el orden de los capítulos del documento: **Planteamiento del problema · Justificación · Objetivos y alcance · Metodología · Marco de referencia · Aspectos administrativos**, y cierra con la demostración y las referencias. Cada escena tiene animaciones de entrada, elementos clicables y citas que abren su fuente, con poco texto en pantalla: la explicación completa está en las notas del expositor (`N`).

<table>
<tr>
<td width="50%"><img src="docs/screens/pres-contexto.jpg" alt="Contexto"><br><b>Contexto.</b> Cifras del sector ganadero con barras y contadores animados.</td>
<td width="50%"><img src="docs/screens/pres-problema.jpg" alt="Árbol del problema"><br><b>Árbol del problema.</b> Raíz, problema central y efectos; cada nodo se abre al hacer clic.</td>
</tr>
<tr>
<td><img src="docs/screens/pres-justificacion.jpg" alt="Justificación"><br><b>Justificación.</b> Cada efecto del árbol con su respuesta, todas hacia el objetivo de alta confiabilidad.</td>
<td><img src="docs/screens/pres-estado-arte.jpg" alt="Línea de tiempo"><br><b>Estado del arte.</b> Línea de tiempo de 1922 a 2026, navegable punto por punto.</td>
</tr>
<tr>
<td><img src="docs/screens/pres-corpus.jpg" alt="Corpus"><br><b>Corpus 2020–2026.</b> Estudios filtrables con su exactitud animada.</td>
<td><img src="docs/screens/pres-metodologia.jpg" alt="Escalera metodológica"><br><b>Metodología.</b> Una escalera en 3D: cada escalón explica una decisión de investigación.</td>
</tr>
<tr>
<td><img src="docs/screens/pres-tabla1.jpg" alt="Tabla 1"><br><b>Tabla 1.</b> Cada fila recorre las opciones posibles y se detiene en la que elegimos, con su razón.</td>
<td><img src="docs/screens/pres-alcance.jpg" alt="Alcance"><br><b>Alcance.</b> Los cinco módulos del prototipo y lo que queda fuera, tachado al entrar.</td>
</tr>
<tr>
<td><img src="docs/screens/pres-funciona.jpg" alt="Cómo funciona"><br><b>¿Cómo funciona?</b> Registro, foto, análisis, comparación y decisión, cada paso con su animación.</td>
<td><img src="docs/screens/pres-administrativos.jpg" alt="Aspectos administrativos"><br><b>Aspectos administrativos.</b> Equipo, costos de la Tabla 13 y cronograma de la Tabla 14 animado.</td>
</tr>
<tr>
<td><img src="docs/screens/pres-propuesta.jpg" alt="Marco teórico"><br><b>Marco teórico.</b> Las cuatro propiedades del rasgo biométrico, con el hocico resaltado en 3D.</td>
<td><img src="docs/screens/pres-biblioteca.jpg" alt="Biblioteca"><br><b>Biblioteca.</b> 71 referencias en APA 7, con búsqueda, filtros y enlaces DOI o arXiv.</td>
</tr>
</table>

**En el celular.** Todas las escenas se reacomodan en una sola columna, sin desbordes, también en horizontal y en tableta:

<p align="center"><img src="docs/screens/pres-movil.jpg" alt="Presentación en el celular" width="760"></p>

### La arquitectura, en movimiento

Una foto del hocico recorre cada herramienta del sistema y en cada estación se ve lo que esa herramienta hace con ella.

<div align="center"><img src="docs/screens/arquitectura.gif" alt="Recorrido de la foto por la arquitectura" width="90%"></div>

### Atajos

| Tecla | Acción | | Tecla | Acción |
|:-:|---|---|:-:|---|
| `←` `→` | Avanzar o retroceder | | `N` | Notas del expositor |
| `M` | Índice de escenas | | `F` | Pantalla completa |
| `R` | Biblioteca de referencias | | `S` | Ir al simulador |

---

## El simulador

<div align="center"><img src="docs/screens/sim-explorar.jpg" alt="La finca 3D del simulador" width="100%"></div>

Una finca con potrero, corral, brete y establo. Hay árboles de la región (samán, guayacán amarillo y ciprés), pasto que se mece con el viento y nueve bovinos de seis razas que pastan, caminan y miran al operario. Todo está modelado por código, sin archivos 3D externos.

### Del potrero a la identidad

<div align="center"><img src="docs/screens/simulador.gif" alt="Recorrido completo en el simulador" width="90%"></div>
<br>

<table>
<tr>
<td width="33%"><img src="docs/screens/sim-interaccion.jpg" alt="Interacción"><br><b>1 · Acércate.</b> Con <kbd>Q</kbd> el operario va directo al bovino más cercano.</td>
<td width="33%"><img src="docs/screens/sim-brete.jpg" alt="Brete"><br><b>2 · Llévalo al brete.</b> El animal queda inmovilizado en la zona de captura, como en el protocolo.</td>
<td width="33%"><img src="docs/screens/sim-visor.jpg" alt="Visor"><br><b>3 · Fotografía.</b> La guía pide unos 30 cm, de frente, con el hocico en el encuadre y enfocado.</td>
</tr>
<tr>
<td><img src="docs/screens/sim-recorte.jpg" alt="Recorte"><br><b>4 · Recorta.</b> El recorte del hocico se ajusta a mano antes de enviarlo.</td>
<td><img src="docs/screens/sim-analisis.jpg" alt="Análisis"><br><b>5 · Análisis.</b> Preparación, extracción de características, comparación y decisión.</td>
<td><img src="docs/screens/sim-resultado.jpg" alt="Resultado"><br><b>6 · Resultado.</b> Identificado, no identificado o no concluyente, con la puntuación y el umbral.</td>
</tr>
</table>

### Los tres resultados posibles

<table>
<tr>
<td width="33%"><img src="docs/screens/sim-resultado.jpg" alt="Identificado"><br><b>Identificado.</b> La similitud supera el umbral θ y no hay empate.</td>
<td width="33%"><img src="docs/screens/sim-res-no-identificado.jpg" alt="No identificado"><br><b>No identificado.</b> Ningún registro alcanza θ: el bovino no está en la galería.</td>
<td width="33%"><img src="docs/screens/sim-res-no-concluyente.jpg" alt="No concluyente"><br><b>No concluyente.</b> Dos registros empatan; el sistema no se arriesga a elegir.</td>
</tr>
</table>

<table>
<tr>
<td width="50%"><img src="docs/screens/sim-menu.jpg" alt="Menú"><br><b>Menú.</b> Calidad gráfica, instrucciones y la galería de práctica, que se prepara en segundo plano.</td>
<td width="50%"><img src="docs/screens/sim-registro.jpg" alt="Registro"><br><b>Registro.</b> Fichas de cada bovino, fotos de referencia e historial. Se pueden crear, editar y eliminar, y todo queda guardado en el navegador.</td>
</tr>
</table>

### Controles

| Acción | Teclado y ratón | Táctil |
|---|---|---|
| Caminar · correr | `W A S D` o flechas · `Shift` | joystick |
| Ir al bovino más cercano | `Q` o clic en un bovino del minimapa | botón «Ir a un bovino» |
| Interactuar | `E`, y luego `1` a `4` | botón `E` |
| Capturar | `Espacio` | obturador |
| Registro · ayuda · pantalla completa | `R` · `H` · `F` | botones superiores |

**Desafíos:** obtener los tres resultados posibles y registrar un bovino nuevo.

---

## Qué se ejecuta de verdad

```mermaid
flowchart LR
    A[📷 Foto del hocico<br>render 3D o archivo] --> B[✂️ Recorte<br>224 × 224]
    B --> C[🧠 ResNet50<br>ImageNet, sin entrenar]
    C --> D[🔢 Vector de<br>2048 valores]
    D --> E[📐 Similitud coseno<br>contra la galería]
    E --> F{1-NN y umbral θ}
    F -->|s ≥ θ| G[✅ Identificado]
    F -->|s < θ| H[⚠️ No identificado]
    F -->|empate| I[⚖️ No concluyente]
```

| Paso | En el navegador |
|---|---|
| Captura | Píxeles reales del render 3D a la resolución completa, o una foto que subas. |
| Preprocesamiento | Recorte de la región naso-labial y cambio de tamaño a 224 × 224. |
| Características | **ResNet50** con pesos de ImageNet, `include_top=False`, `pooling='avg'` y `preprocess_input`, en TensorFlow.js (WebGL, luego WASM y luego CPU). |
| Comparación | Similitud coseno y vecino más próximo (1-NN). |
| Umbral | θ\* = el menor θ con cero falsas coincidencias (FMR = 0) en la galería, en una rejilla de 0,001. Excluye los pares que comparten foto. |
| Decisión | Si s < θ, no identificado; si hay empate a 0,001, no concluyente; en otro caso, identificado. |
| Registro | Fichas, referencias e historial en IndexedDB. |

> **Modo práctica.** Los bovinos y sus hocicos son modelos 3D con patrones generados por computador. Las cifras sirven para entender el proceso y **no son resultados experimentales** de la investigación, que se obtendrán con 19 bovinos reales. La interfaz lo indica con una etiqueta discreta.

---

## Cómo está construido

```text
├── index.html                 presentación (21 escenas)
├── experience/index.html      simulador
├── src/
│   ├── presentation/
│   │   ├── main.js            motor de escenas, índice, notas, teclado
│   │   ├── stage3d.js         fondo 3D: bovino, pasto, flores, polen, mariposas y nubes
│   │   ├── biblio.js          biblioteca de 71 referencias
│   │   └── scenes/            apertura · documento (justificación, alcance, administrativos) · metodología · fundamentos · tecnología · cierre
│   ├── experience/
│   │   ├── world/             finca, bovinos, operario, cámara del celular, manada
│   │   ├── biometric/         recorte, ResNet50, motor de decisión, IndexedDB
│   │   └── ui/                análisis animado, revisión y recorte, registro
│   └── shared/                contenido académico, referencias, tema y fuentes
├── public/models/resnet50/    pesos de ResNet50 en float16 (~46 MB, se guardan en caché)
├── tools/quantize_resnet.py   conversión de los pesos
└── tests/e2e.py               pruebas de extremo a extremo con Playwright
```

Algunos detalles técnicos:

- **Bovinos procedurales.** El cuerpo y la cabeza se generan con funciones de distancia y *Surface Nets*. Las patas tienen perfil anatómico, las pezuñas son hendidas y el cuello es una malla flexible que se dobla con una curva de Bézier al pastar. Cada hocico tiene un patrón propio generado con semilla.
- **Operario.** Está modelado con perfiles de revolución: camisa a cuadros, carriel, botas de caña y sombrero aguadeño. Sus animaciones de caminar, correr y fotografiar se mezclan según la velocidad.
- **Cámara del celular.** Al pulsar `1`, la vista baja por encima del hombro del operario hasta quedar a 30 cm del hocico. La foto aplica exposición automática para que el hocico no quede en sombra.
- **Fluidez.** La resolución se ajusta sola según los cuadros por segundo, sin parpadeos. La galería de práctica se fotografía con una cámara propia, sin interferir con la del jugador.

Más detalle en [`docs/architecture.md`](docs/architecture.md) y [`docs/testing.md`](docs/testing.md).

---

## Ejecutar en local

Requiere **Node.js 20** o superior.

```bash
npm install
npm start          # compila y abre http://localhost:4174
npm run dev        # modo desarrollo en http://localhost:5174
```

El simulador necesita un servidor, no funciona abriendo el HTML con doble clic, porque descarga los pesos de ResNet50. La primera visita tarda unos segundos más y luego quedan en caché.

**Datos de práctica.** En la primera visita se crea una galería de seis bovinos registrados, con tres fotos en el brete cada uno. Incluye un registro duplicado para practicar el caso «no concluyente» y tres bovinos sin registrar. Se reinicia desde el menú o desde el Registro.

**Despliegue.** Es un proyecto Vite multipágina e incluye `vercel.json`. Cada `push` a `main` se publica en Vercel.

---

## Pruebas

```bash
npm start                                         # en una terminal
python3 tests/e2e.py http://localhost:4174/ pres  # presentación: 22 comprobaciones (incluye celular, horizontal y tableta)
python3 tests/e2e.py http://localhost:4174/ game  # simulador: 19 comprobaciones
```

Las pruebas recorren lo mismo que haría una persona:

- **Presentación:** navegación, índice, notas, árbol del problema, filtros del corpus, escalera metodológica, Tabla 1, biblioteca y vista móvil.
- **Simulador:** carga de la finca, calibración del umbral con FMR = 0, movimiento, viaje rápido con `Q`, cámara, recorte, los tres resultados posibles, registro, edición, historial, eliminación, persistencia tras recargar y desafíos.

---

## Créditos

**Autores:** Daniel Felipe Colorado Amaya y John Alejandro Piedrahita Muñoz.
**Asesor:** Prof. Alexander Quintero, curso Fundamentos de Investigación, Universidad Católica de Pereira.

**Herramientas:** [three.js](https://threejs.org), [GSAP](https://gsap.com), [TensorFlow.js](https://www.tensorflow.org/js) y [Vite](https://vite.dev). Fuentes: Fraunces e IBM Plex.
**Pesos de ResNet50:** paquete npm `idai-shapes-ceramics_resnet50` (DAI, licencia ISC), convertidos a float16 con `tools/quantize_resnet.py`.

<div align="center"><br><img src="docs/screens/pres-cierre.jpg" alt="Cierre" width="80%"><br><sub>Proyecto académico · Universidad Católica de Pereira · 2026</sub></div>
