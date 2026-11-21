/* =============================================================================
   CONTENIDO ACADÉMICO — extraído del documento V27 (autoridad académica)
   «Desarrollo de un prototipo de sistema de identificación naso-labial en
   bovinos, apoyado en inteligencia artificial» — UCP, 2026.
   Toda cifra de este archivo proviene de V27 o de la matriz V26.
   ============================================================================= */

export const PROJECT = {
  title: 'Desarrollo de un prototipo de sistema de identificación naso-labial en bovinos, apoyado en inteligencia artificial',
  authors: ['Daniel Felipe Colorado Amaya', 'John Alejandro Piedrahita Muñoz'],
  university: 'Universidad Católica de Pereira',
  faculty: 'Facultad de Ciencias Básicas e Ingeniería',
  program: 'Programa de Ingeniería de Sistemas y Telecomunicaciones',
  place: 'Pereira, Risaralda, Colombia', year: 2026,
};

export const CONTEXT = {
  pibNacional: 1.4, pibAgro: 20, pibPecuario: 46, inventario: 29.5, // Fedegán (2025), datos 2024
  abigeato: 33650, abigeatoPeriodo: '2010–2023', deptos: ['Cundinamarca', 'Meta', 'Tolima'], // Semana (2024)
  faenaClandestina: 1.3, // millones de animales en 2024, Fedegán (2025)
};

/** Árbol del problema (sección 2) y respuesta de la justificación (sección 3). */
export const PROBLEM = {
  root: 'Falta de plataformas tecnológicas propias para identificar el ganado en las fincas',
  causes: [
    { t: 'Procesos manuales de identificación', d: 'Hojas de cálculo y planillas físicas: datos mal escritos, cifras equivocadas, información desactualizada.' },
    { t: 'Identificación invasiva del ganado', d: 'Aretes o chips que pueden perderse, dañarse o desprenderse en peleas o al engancharse con cercas.' },
    { t: 'Falsificación de planillas SINIGAN', d: 'Registros en papel vulnerables a alteraciones que ninguna plataforma digital verifica.' },
  ],
  core: 'Baja confiabilidad en la identificación de ganado bovino',
  coreDef: 'La dificultad para reconocer y comprobar con seguridad que un animal corresponde realmente a la identidad que se le ha asignado.',
  effects: [
    { t: 'Mayor vulnerabilidad ante pérdidas y robo (abigeato)', r: 'Identificación no invasiva mediante biometría naso-labial con registro digital' },
    { t: 'Pérdidas económicas por robo, errores de registro y gestión', r: 'Automatización mediante una aplicación web que centraliza el registro' },
    { t: 'Errores en la trazabilidad sanitaria, productiva y comercial', r: 'Módulo de trazabilidad digital: ficha e historial de eventos' },
    { t: 'Limitaciones para controlar la movilización', r: 'Mayor verificabilidad de los registros asociados a planillas SINIGAN' },
  ],
  benefits: ['Reducción de robos', 'Mejor trazabilidad', 'Reducción de pérdidas económicas', 'Aumento de la rentabilidad'],
};

export const QUESTION = '¿En qué medida un prototipo basado en identificación naso-labial y en inteligencia artificial puede identificar individualmente a bovinos previamente registrados, bajo condiciones controladas de captura?';
export const GENERAL_OBJECTIVE = 'Desarrollar un prototipo de sistema de identificación naso-labial en bovinos, apoyado en inteligencia artificial.';
export const OBJECTIVES = [
  { v: 'Definir', t: 'los requerimientos funcionales y no funcionales de la plataforma web adaptable al celular, considerando el registro de bovinos, la captura de fotografías naso-labiales con la cámara del teléfono y la identificación biométrica mediante inteligencia artificial.', fase: '1. Preparación', res: 'Documento de requerimientos' },
  { v: 'Diseñar', t: 'la arquitectura del sistema, sus componentes y las interfaces de usuario, adaptadas a la pantalla del celular, de acuerdo con los requerimientos funcionales de la plataforma.', fase: '2. Construcción', res: 'Documento de diseño' },
  { v: 'Codificar', t: 'los módulos del sistema con base en los requerimientos funcionales y no funcionales, incluyendo el registro de bovinos y la comparación biométrica de fotografías naso-labiales.', fase: '2. Construcción', res: 'Prototipo funcional' },
  { v: 'Realizar', t: 'un proceso de testing que incluya pruebas de sistema y de aceptación, verificando el correcto registro de bovinos y la exactitud de la identificación biométrica.', fase: '3. Recolección de datos y 4. Análisis', res: 'Informe de pruebas' },
  { v: 'Documentar', t: 'el sistema desarrollado, incluyendo manuales técnicos y de usuario sobre su funcionamiento.', fase: '5. Documentación', res: 'Manuales e informe final' },
];

export const SCOPE = {
  modules: [
    { t: 'Registro y gestión de bovinos', d: 'Registrar entre 10 y 20 animales con su información básica y varias fotografías de referencia de la zona naso-labial.' },
    { t: 'Identificación biométrica', d: 'Foto nueva con la cámara del celular, comparación con los registrados mediante IA y resultado con un nivel de confianza.' },
    { t: 'Trazabilidad', d: 'Historial básico de eventos (vacunas, movimientos, ventas) y ficha individual consultable.' },
    { t: 'Estadísticas e informes', d: 'Bovinos registrados, identificaciones realizadas y nivel de confianza promedio.' },
    { t: 'Dashboard', d: 'Panel de indicadores y punto de entrada al resto del sistema.' },
  ],
  out: [
    'Reconocer muchos animales al mismo tiempo en un potrero',
    'Cámaras de vigilancia permanentes, drones o sensores especializados',
    'Integración oficial con SINIGAN (no autentica planillas oficiales)',
    'Sustituir los mecanismos oficiales de identificación',
    'Aplicación móvil nativa en tiendas de aplicaciones',
    'Entrenar o ajustar una red neuronal',
    'Detector automático del hocico (la región se delimita con ayuda del usuario)',
    'Funcionamiento sin conexión a internet',
  ],
};

/** Tabla 1 */
export const METHOD = [
  ['Paradigma', 'Positivista (empírico-analítico)', 'La pregunta se responde con datos medibles: aciertos, errores, porcentajes y tiempos.'],
  ['Enfoque', 'Cuantitativo', 'Datos numéricos o categorías definidas de antemano, analizados con estadística.'],
  ['Tipo según el propósito', 'Aplicada', 'Usa conocimiento existente para resolver un problema concreto.'],
  ['Tipo según la fuente', 'Documental y de campo', 'Revisión de estudios y datos tomados directamente en las fincas.'],
  ['Alcance', 'Correlacional', 'Asociación entre acierto, puntuación y tiempo con las condiciones de captura.'],
  ['Diseño', 'No experimental, mediciones repetidas en tres sesiones', 'Las condiciones de captura se registran tal como ocurren; no se manipulan.'],
  ['Población y muestra', 'Todos los bovinos de dos fincas: 7 (A) y 12 (B), 19 en total', 'El número de animales es pequeño y permite trabajar con todos.'],
];
/** Tabla 3 */
export const PHASES = [
  { n: 1, t: 'Preparación', q: 'Revisión documental, visita de reconocimiento con lista de verificación y definición de requerimientos.', p: 'Requerimientos y protocolo de captura' },
  { n: 2, t: 'Construcción', q: 'Diseño y codificación de la aplicación web y del módulo biométrico con una red preentrenada, sin entrenamiento.', p: 'Prototipo funcional' },
  { n: 3, t: 'Recolección de datos', q: 'Sesión de registro (S1), fijación del umbral con S1 y sesiones de prueba (S2 y S3) en las dos fincas.', p: '209 fotografías previstas (95 de referencia y 114 de prueba)' },
  { n: 4, t: 'Análisis', q: 'Tasa de acierto, falsas coincidencias, falsos rechazos, puntuación de semejanza, tiempos y asociación con condiciones.', p: 'Resultados y conclusiones' },
  { n: 5, t: 'Documentación', q: 'Manual técnico, manual de usuario e informe final.', p: 'Manuales e informe final' },
];
/** Tabla 4 */
export const VARIABLES = [
  { g: 'Dependientes (Y) · resultado', items: [
    ['Resultado de la identificación', 'Categórica (acierto, confusión con otro bovino o no concluyente)', 'Decisión de la aplicación frente al código real del animal.'],
    ['Exactitud (tasa de acierto)', 'Numérica (%)', 'Identificaciones correctas sobre el total de pruebas; por finca, sesión y bovino.'],
    ['Puntuación de semejanza', 'Numérica (similitud coseno, de 0 a 1 en la práctica)', 'Valor del bovino candidato; no es una probabilidad.'],
    ['Tiempo de identificación', 'Numérica (s)', 'Desde que se confirma la foto hasta que aparece el resultado.'],
  ] },
  { g: 'Independientes (X) · bovino', items: [
    ['Código y finca', 'Categórica', 'BOV-A01 a BOV-A07 y BOV-B01 a BOV-B12.'],
    ['Raza, sexo y edad aproximada', 'Categórica y numérica', 'Dato suministrado por el propietario.'],
    ['Color y condición del hocico', 'Categórica', 'Pigmentado, claro o mixto; limpio, con barro o con pasto; húmedo o seco.'],
    ['Comportamiento en la toma', 'Categórica', 'Tranquilo o inquieto.'],
  ] },
  { g: 'Independientes (X) · ambiente', items: [
    ['Sesión, franja horaria y hora', 'Categórica y numérica', 'S1, S2 o S3; mañana o tarde; hora exacta del archivo.'],
    ['Temperatura y humedad relativa', 'Numérica (°C y %)', 'Termohigrómetro digital al inicio y al final de cada sesión.'],
    ['Estado del tiempo e iluminación', 'Categórica', 'Soleado, nublado o lluvioso; luz directa, sombra o luz mixta.'],
  ] },
  { g: 'Independientes (X) · captura', items: [
    ['Dispositivo y resolución', 'Categórica y numérica', 'Modelo del celular y tamaño de la imagen en píxeles.'],
    ['Distancia, ángulo y lugar', 'Categórica', 'Unos 30 cm; toma frontal o inclinada; manga, brete o corral.'],
    ['Calidad de foto y conexión', 'Categórica', 'Apta o no apta; wifi o datos móviles (señal buena, media o baja).'],
    ['Ajuste del recorte', 'Categórica', 'Recuadro aceptado tal como lo propone la guía o ajustado a mano.'],
  ] },
];
/** Tabla 5 */
export const SESSIONS_TABLE = [
  { s: 'S1', name: 'Registro', dia: 1, franja: 'Mañana (7:00 a 10:00)', prop: 'Registrar a cada bovino con sus fotografías de referencia.', per: 5, total: 95 },
  { s: 'S2', name: 'Prueba A', dia: 8, franja: 'Mañana (7:00 a 10:00)', prop: 'Identificar a cada bovino en condiciones parecidas a las del registro.', per: 3, total: 57 },
  { s: 'S3', name: 'Prueba B', dia: 15, franja: 'Tarde (2:00 a 5:00)', prop: 'Identificar a cada bovino con otra luz y otra temperatura.', per: 3, total: 57 },
];
export const PROTOCOL_STEPS = [
  'Al iniciar la sesión, anotar fecha, día del año, estado del tiempo, temperatura y humedad; repetir al terminar.',
  'Ubicar al animal en la manga o el brete y esperar a que esté tranquilo.',
  'Abrir la cámara desde la aplicación y tomar la foto de frente, a unos 30 cm, con la zona naso-labial centrada y sin flash.',
  'Revisar que la imagen esté nítida y ajustar el recuadro. Si el barro o el pasto cubren el patrón, o la foto salió movida, esperar y repetir.',
  'En las pruebas, anotar la decisión (identificado o no concluyente), el candidato, la puntuación, el tiempo y las condiciones de la toma.',
];
/** Tabla 6 */
export const INSTRUMENTS = [
  ['Revisión documental', 'Matriz de antecedentes: autor, año, muestra, técnica y resultado.', '1. Preparación'],
  ['Visita de reconocimiento', 'Lista de verificación: número de animales, lugar de la toma, iluminación y señal.', '1. Preparación'],
  ['Registro fotográfico', 'Ficha de captura con las variables de la Tabla 4 y termohigrómetro digital.', '3. Recolección'],
  ['Pruebas del prototipo', 'Matriz de pruebas: bovino real, decisión, candidato, puntuación, tiempo, conexión y resultado.', '3. Recolección'],
  ['Prueba de aceptación', 'Lista de chequeo de requerimientos (cumple / no cumple).', '3. Recolección'],
];

/** Etapas de la función Y = f(X1..X6) */
export const XVARS = [
  { x: 'X₁', k: 'x1', t: 'Adquisición fotográfica', d: 'Cámara trasera del celular, unos 30 cm, toma frontal y sin flash.', sec: '6.2.3', refs: ['r71', 'r36'] },
  { x: 'X₂', k: 'x2', t: 'Preprocesamiento', d: 'OpenCV: lectura, orientación, recorte, cambio de tamaño y normalización del contraste.', sec: '6.2.4', refs: ['r47', 'r43'] },
  { x: 'X₃', k: 'x3', t: 'Delimitación naso-labial', d: 'Captura guiada y recorte manual o semiautomático en la pantalla.', sec: '6.2.4', refs: ['r64', 'r36'] },
  { x: 'X₄', k: 'x4', t: 'Extracción de características', d: 'ResNet50 preentrenada con Keras 3 y JAX, sin entrenamiento.', sec: '6.2.5', refs: ['r19', 'r55'] },
  { x: 'X₅', k: 'x5', t: 'Comparación vectorial', d: 'Similitud coseno, vecino más próximo (1-NN) y umbral de decisión.', sec: '6.2.6', refs: ['r08', 'r22'] },
  { x: 'X₆', k: 'x6', t: 'Registros y trazabilidad', d: 'Arquitectura web, base de datos, consulta de referencias e historial.', sec: '6.2.7', refs: ['r14', 'r65'] },
];

/** Tabla 8 — corpus de estudios (2020 en adelante) */
export const CORPUS = [
  { id: 'r34', a: 'Kusakunniran et al.', y: 2020, n: 431, unit: 'búfalos', acc: 95, accTxt: 'cerca de 95 %', how: 'Cascada + segmentación; BoHOG y LBP con SVM', role: 'parcial', note: 'Método clásico; luz del día y movimiento como retos de campo.' },
  { id: 'r64', a: 'Shojaeipour et al.', y: 2021, n: 300, unit: 'bovinos', acc: 99.11, accTxt: '99,11 %', how: 'YOLOv3 + ResNet50 con transferencia, 5 imágenes por animal', role: 'corpus', note: 'Referente directo para ResNet50 y las 5 fotos de referencia; entrena el detector y ajusta la red.' },
  { id: 'r38', a: 'G. Li et al.', y: 2022, n: 268, unit: 'bovinos', acc: 98.7, accTxt: '98,7 % · 28,3 ms/imagen', how: '59 modelos CNN; 4.923 imágenes', role: 'parcial', note: 'Guía la elección de arquitecturas y el tiempo de inferencia.' },
  { id: 'r36', a: 'Lee et al.', y: 2023, n: 336, unit: 'bovinos', acc: 97.0, accTxt: '97,0 %', how: 'Celular a 30 cm; YOLOv8 + EfficientNetV2; 9.230 imágenes', role: 'corpus', note: 'Referente del protocolo de captura con celular, distancia y sesiones repetidas.' },
  { id: 'r37', a: 'D. Li et al.', y: 2024, n: null, unit: '', acc: 95.74, accTxt: '95,74 %', how: 'Rostro + hocico + arete; SOLO, FaceNet, PP-OCRv4', role: 'parcial', note: 'Solución multirrasgo de alta complejidad; referente de contraste.' },
  { id: 'r10', a: 'Ermetin y Kahramanlı Örnek', y: 2025, n: 11, unit: 'búfalos', acc: 99.88, accTxt: 'hasta 99,88 %', how: 'AlexNet, SqueezeNet, GoogLeNet, ResNet101; 4.263 imágenes', role: 'parcial', note: 'Otra especie y muchas imágenes por animal: no comparable con cinco fotos.' },
  { id: 'r62', a: 'Sereewatanapong et al.', y: 2025, n: 300, unit: 'bovinos', acc: 98.8, accTxt: '98,80 % y 100 % (37 bovinos)', how: 'Red prototípica de dos ramas con LBP de color; 5 a 7 imágenes', role: 'parcial', note: 'Pocas fotos por animal pueden bastar, pero entrena una red.' },
  { id: 'r03', a: 'BC et al.', y: 2026, n: 249, unit: 'bovinos', acc: 97.3, accTxt: '> 91 % con 1 imagen; 97,3 % con 8', how: 'Conjunto abierto; CNN–ViT y MegaDescriptor-L; galería y umbral', role: 'parcial', note: 'Preprint: referente del umbral de rechazo y de separar ajuste y prueba.' },
  { id: 'r17', a: 'Han et al.', y: 2026, n: 658, unit: 'bovinos', acc: 97.87, accTxt: '97,87 %', how: 'Red siamesa MobileViT + EMA; umbral 0,5; 31.312 imágenes', role: 'parcial', note: 'Exactitud baja a cerca de 86 % con ángulos > 60° u oclusión > 40 %.' },
  { id: 'r41', a: 'Oliveira et al.', y: 2026, n: 30, unit: 'vacas', acc: 92.7, accTxt: '92,7 %', how: 'Embeddings CNN normalizados, coseno y 1-NN; 5 por animal', role: 'corpus', note: 'Referente más cercano al procesamiento del prototipo; estudio preliminar.' },
];
/** Cronología (sección 6.1 y marco teórico) */
export const TIMELINE = [
  { y: 1922, t: 'Petersen', d: 'Huella nasal con tinta en más de 350 bovinos: no encontró dos iguales; el dibujo no cambiaba al crecer.', ref: 'r46', k: 'naso' },
  { y: 1952, t: 'Hirsch et al.', d: 'Clasificación por tipos de arco y crestas para ubicar una huella en un archivo grande.', ref: 'r21', k: 'naso' },
  { y: 1967, t: 'Cover y Hart', d: 'Regla del vecino más próximo (1-NN).', ref: 'r08', k: 'tec' },
  { y: 1975, t: 'Salton et al.', d: 'Modelo de espacio vectorial y similitud coseno.', ref: 'r60', k: 'tec' },
  { y: 1987, t: 'Pizer et al.', d: 'Ecualización adaptativa de histograma y CLAHE.', ref: 'r47', k: 'tec' },
  { y: 1998, t: 'LeCun et al.', d: 'Redes convolucionales aplicadas al reconocimiento de documentos.', ref: 'r35', k: 'tec' },
  { y: 2007, t: 'Barry et al.', d: 'De la tinta a la imagen digital: PCA en un grupo pequeño de bovinos.', ref: 'r02', k: 'naso' },
  { y: 2009, t: 'Deng et al.', d: 'ImageNet: base de imágenes para preentrenar redes.', ref: 'r09', k: 'tec' },
  { y: 2016, t: 'He et al.', d: 'Redes residuales (ResNet), ganadoras de ILSVRC 2015.', ref: 'r19', k: 'tec' },
  { y: 2020, t: 'Kusakunniran et al.', d: 'Descriptores de textura y SVM; cerca de 95 % con 431 búfalos.', ref: 'r34', k: 'naso' },
  { y: 2021, t: 'Shojaeipour et al.', d: 'YOLOv3 + ResNet50 con 5 imágenes por animal (99,11 %).', ref: 'r64', k: 'naso' },
  { y: 2023, t: 'Lee et al.', d: 'Celular a 30 cm, cuatro momentos de captura (97,0 %).', ref: 'r36', k: 'naso' },
  { y: 2026, t: 'Oliveira et al.', d: 'Embeddings, coseno y 1-NN con 30 vacas (92,7 %).', ref: 'r41', k: 'naso' },
];
/** Tabla 10 */
export const TECHNIQUES = [
  ['Red neuronal convolucional', 'LeCun et al., 1998', 'Filtros que detectan patrones locales', 'Base del extractor', 'r35'],
  ['ImageNet', 'Deng et al., 2009; Russakovsky et al., 2015', 'Millones de imágenes etiquetadas', 'Origen de los pesos de ResNet50', 'r09'],
  ['Red residual (ResNet50)', 'He et al., 2016', 'Conexiones de atajo para redes profundas', 'Vector de 2048 valores', 'r19'],
  ['Aprendizaje por transferencia', 'Pan y Yang, 2010', 'Aprovechar lo aprendido en otra tarea', 'Reutilizar pesos sin reentrenar', 'r45'],
  ['Características preentrenadas', 'Razavian et al., 2014', 'El vector de una red preentrenada describe imágenes', 'Justifica no entrenar', 'r55'],
  ['CLAHE', 'Pizer et al., 1987', 'Realce local sin amplificar el ruido', 'Realce opcional de surcos', 'r47'],
  ['Similitud coseno', 'Salton et al., 1975', 'Semejanza por el ángulo entre vectores', 'Consulta vs. referencias', 'r60'],
  ['Vecino más próximo (1-NN)', 'Cover y Hart, 1967', 'Identidad del ejemplo más parecido', 'Selección del candidato', 'r08'],
  ['Umbral y errores biométricos', 'ISO/IEC, 2021', 'Falsa coincidencia y falso rechazo', 'Decisión y evaluación', 'r22'],
  ['Detector YOLO (descartado)', 'Redmon et al., 2016', 'Detección en una sola pasada', 'No se usa: exigiría anotar y entrenar', 'r56'],
];
/** Tabla 11 */
export const ENTITIES = [
  ['Finca', 'Nombre, municipio y propietario', 'Separar resultados de A y B'],
  ['Bovino', 'Código (BOV-A01…BOV-B12), raza, sexo, edad aproximada y color del hocico', 'Ficha individual'],
  ['Fotografía', 'Ruta, sesión, fecha, hora, coordenadas del recorte y condiciones', 'Respaldo de cada registro'],
  ['Vector de referencia', 'Vector de 2048 valores normalizado y foto de origen (S1)', 'Galería de comparación'],
  ['Sesión de captura', 'S1, S2 o S3; finca, fecha, franja, temperatura y humedad', 'Organizar campo y análisis'],
  ['Identificación', 'Foto de consulta, candidato, puntuación, decisión, umbral y tiempo', 'Medir el desempeño'],
  ['Evento de trazabilidad', 'Bovino, tipo (vacuna, movimiento, venta, identificación), fecha y observación', 'Historial del animal'],
  ['Usuario', 'Nombre, rol y credenciales', 'Controlar el acceso'],
];
/** Tabla 12 */
export const TOOLS = [
  { t: 'Next.js', o: 'ZEIT (hoy Vercel), 2016', f: 'Interfaz web adaptable: fichas, guía de captura, recorte y resultados', alt: 'Aplicación móvil nativa', ref: 'r26', layer: 'cliente' },
  { t: 'FastAPI', o: 'S. Ramírez, 2019', f: 'API que recibe fotos y coordina el procesamiento', alt: 'Servidor en Node.js', ref: 'r53', layer: 'servidor' },
  { t: 'OpenCV', o: 'G. Bradski en Intel (1998); versión pública en 2000', f: 'Lectura, orientación, recorte, tamaño y CLAHE', alt: 'Procesamiento en el navegador', ref: 'r44', layer: 'servidor' },
  { t: 'Keras 3', o: 'Primera versión en marzo de 2015', f: 'Carga y ejecución de ResNet50 preentrenada', alt: 'PyTorch o TensorFlow directo', ref: 'r05', layer: 'servidor' },
  { t: 'JAX', o: 'Google Research', f: 'Motor de cálculo de Keras en CPU', alt: 'Servidor con GPU', ref: 'r15', layer: 'servidor' },
  { t: 'NumPy y SciPy', o: 'Harris et al. (2020); Virtanen et al. (2020)', f: 'Similitud coseno, 1-NN y análisis estadístico', alt: 'JAX o bases de datos vectoriales', ref: 'r18', layer: 'servidor' },
  { t: 'PostgreSQL', o: 'POSTGRES, U. de California en Berkeley, desde 1986', f: 'Fichas, vectores, sesiones, identificaciones e historial', alt: 'Base de datos vectorial', ref: 'r65', layer: 'datos' },
];
/** Tabla 13 */
export const COSTS = {
  items: [
    { r: 'Transporte', d: 'Pasajes de bus en Pereira para asesorías y reuniones (dos estudiantes, dos viajes al mes)', q: '64 pasajes', u: 3600, total: 230400 },
    { r: 'Transporte', d: 'Desplazamientos a las fincas: visita y tres sesiones en cada una (valor estimado)', q: '16 viajes', u: 25000, total: 400000 },
    { r: 'Capacitaciones', d: 'Suscripción anual Platzi Expert (USD 199), una por estudiante', q: '2', u: 650730, total: 1301460 },
    { r: 'Arrendamiento', d: 'Servidor en la nube (VPS 2 núcleos, 4 GB, USD 24/mes), mes 4 a 8', q: '5 meses', u: 78480, total: 392400 },
    { r: 'Computadores', d: 'Depreciación de dos portátiles, 8 meses al 20 % anual sobre $4.599.000', q: '2', u: 613200, total: 1226400 },
    { r: 'Internet', d: 'Plan hogar de 500 Mbps, uno por estudiante, ocho meses', q: '16 meses', u: 84900, total: 1358400 },
  ],
  subtotal: 4909060, contingency: 245453, total: 5154513, trm: 3270, monthly: 644000,
};
/** Tabla 14 — índices de quincena (0 = Mes 1 Q1 … 15 = Mes 8 Q2), leídos del sombreado del documento */
export const GANTT = [
  { t: 'Aprobación de la idea', q: [0] },
  { t: 'OE1 · Definir los requerimientos', q: [1, 2, 3] },
  { t: 'OE2 · Diseñar la arquitectura, componentes e interfaces', q: [3, 4, 5] },
  { t: 'OE3 · Codificar los módulos del sistema', q: [5, 6, 7, 8, 9, 10] },
  { t: 'OE4 · Pruebas de sistema y de aceptación (incluye S1, S2, S3)', q: [10, 11, 12, 13] },
  { t: 'OE5 · Documentar el sistema', q: [12, 13, 14, 15] },
];
/** Pasos del análisis (sección 5.10) */
export const ANALYSIS_STEPS = [
  { t: 'Ajuste con S1', d: 'Solo con las 95 fotos de registro: se prueban ResNet50, EfficientNetV2B0 y ConvNeXtTiny (sin entrenar), con y sin CLAHE. Se conserva ResNet50 sin CLAHE si acierta al menos el 90 % de S1; se fija θ.' },
  { t: 'Medición del desempeño', d: 'Con la configuración fija se procesan las 114 fotos de S2 y S3: exactitud, falsas coincidencias, falsos rechazos, semejanza y tiempo; matriz de confusión.' },
  { t: 'Resultados por bovino', d: 'Las seis fotos de un animal no son independientes: IC 95 % remuestreando bovinos completos (Field y Welsh, 2007).' },
  { t: 'Animal no registrado', d: 'Se retira por turnos cada bovino y se envían sus seis pruebas; lo correcto es «no concluyente». Se reporta como simulación.' },
  { t: 'Condiciones de captura', d: 'Tablas de contingencia por condición; mañana (S2) frente a tarde (S3) con Wilcoxon de rangos con signo; temperatura y humedad solo descriptivas.' },
];
/** Limitaciones declaradas en V27 */
export const LIMITATIONS = [
  { t: 'Muestra pequeña y por conveniencia', d: 'Dos fincas y 19 bovinos: los resultados valoran el prototipo, pero no se generalizan a todo el ganado del país.', sec: '5.5' },
  { t: 'Asociaciones exploratorias', d: 'El alcance es correlacional: una asociación con las condiciones de captura no se tomará como prueba de causa.', sec: '5.3' },
  { t: 'ImageNet no contiene hocicos', d: 'El vector de ResNet50 es un buen candidato, no una huella garantizada: su capacidad para distinguir bovinos debe comprobarse con datos.', sec: '6.2.5' },
  { t: 'Recorte semiautomático', d: 'No se construye un detector del hocico: el usuario ajusta el recuadro y se anota si hubo que moverlo.', sec: '6.2.4' },
  { t: 'Posible sesgo de S1', d: 'Las cinco fotos de registro se toman el mismo día y pueden parecerse más entre sí que las de días distintos.', sec: '6.2.6' },
  { t: 'Precisión estadística limitada', d: 'Con 114 fotos de prueba no se pueden medir tasas de error muy bajas; con 19 animales el intervalo de confianza será amplio.', sec: '5.10' },
  { t: 'Prueba de no registrado simulada', d: 'Los animales retirados sí participaron en el ajuste con S1: se presenta como simulación, no como prueba con animales nuevos.', sec: '5.10' },
  { t: 'Permanencia no evaluada', d: 'Unas pocas semanas no bastan para saber si el patrón se mantiene a largo plazo; se apoya en los estudios históricos.', sec: '6.2.2' },
  { t: 'Puntuación ≠ probabilidad', d: 'Un 0,85 no significa 85 % de seguridad. La regla 1-NN pierde exactitud a medida que se registran más animales.', sec: '6.2.6' },
  { t: 'Requiere conexión', d: 'La identificación necesita internet en el momento de la consulta; no hay funcionamiento sin conexión en esta versión.', sec: '4.3' },
  { t: 'Sin integración oficial', d: 'No se integra con SINIGAN ni autentica planillas; complementa, no reemplaza, los sistemas oficiales.', sec: '4.3' },
  { t: 'Beneficios potenciales', d: 'No se pretende demostrar por sí solo una reducción del abigeato o un aumento de la rentabilidad.', sec: '3' },
];
/** Inconsistencias encontradas en la auditoría (se conserva V27 como autoridad). */
export const INCONSISTENCIES = [
  'V27 incluye el capítulo «1 Introducción» en la tabla de contenido, pero la sección no tiene texto.',
  'La matriz V26 (ficha 49, Pressman) menciona «modelo incremental»; V27 (sección 5.9) define el modelo en cascada. Se usa cascada.',
  'La matriz V26 indica que sus 71 fichas corresponden a la bibliografía del V25; V27 también tiene 71 referencias y coinciden una a una.',
  'V27 (sección 7.1) conserva el marcador «[nombre del profesor]» para el asesor temático.',
  'V27 define como «no concluyente» el empate en la puntuación más alta; no define un margen mínimo de diferencia adicional, por lo que no se inventa uno: el empate se evalúa a la resolución de 0,001 usada para Θ.',
];
