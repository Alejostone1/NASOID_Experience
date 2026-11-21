/* Bloque 3 · Metodología de la investigación (Daniel)
   Explica qué es la metodología, la Tabla 1 (clasificación metodológica) y cada
   decisión con su porqué. Las decisiones y razones son las del V27; las «otras
   opciones» son las categorías generales de los textos de metodología citados en
   el V27 (Hernández-Sampieri y Mendoza, 2018; Ramos, 2015), para mostrar por qué
   no se eligieron. */
import gsap from 'gsap';
import { METHOD, SESSIONS_TABLE, VARIABLES, PROTOCOL_STEPS, INSTRUMENTS, PHASES, OBJECTIVES, ANALYSIS_STEPS } from '../../shared/content.js';
import { C, $, $$, fmt } from '../core.js';

const B = 'Metodología';
const LADDER = [
  ['Paradigma', '¿Desde qué visión del conocimiento investigamos?', 'El conjunto de supuestos sobre qué cuenta como evidencia y qué métodos son válidos.', 'Positivista', 'paradigmas'],
  ['Enfoque', '¿Con qué tipo de datos respondemos?', 'Números y estadística (cuantitativo), significados y relatos (cualitativo) o ambos (mixto).', 'Cuantitativo', 'enfoque'],
  ['Tipo', '¿Para qué investigamos y de dónde salen los datos?', 'Por el propósito: básica o aplicada. Por la fuente: documental, de campo o ambas.', 'Aplicada · documental y de campo', 'enfoque'],
  ['Alcance', '¿Hasta dónde queremos llegar con los resultados?', 'Explorar, describir, relacionar variables (correlacional) o explicar causas.', 'Correlacional', 'enfoque'],
  ['Diseño', '¿Cómo organizamos la recolección de datos?', 'Experimental (se manipulan variables) o no experimental (se observan como ocurren).', 'No experimental · tres sesiones', 'diseno'],
  ['Población y muestra', '¿Con quiénes trabajamos?', 'Todos los casos (población) o una parte de ellos (muestra).', '19 bovinos de dos fincas', 'poblacion'],
  ['Variables', '¿Qué medimos y qué condiciones registramos?', 'Dependientes (el resultado) e independientes (las condiciones).', 'Y: resultado · X: condiciones', 'variables'],
  ['Técnicas e instrumentos', '¿Con qué herramientas recogemos los datos?', 'Revisión documental, observación estructurada, fichas, matrices y listas de chequeo.', 'Fichas, matrices y listas', 'protocolo'],
  ['Análisis', '¿Cómo convertimos los datos en respuestas?', 'Estadística descriptiva y pruebas para comparar o asociar.', 'Exactitud, errores e intervalos', 'analisis'],
];
const ALT = [
  [['Interpretativo', 'busca comprender significados y experiencias de las personas; aquí no se estudian percepciones.'], ['Crítico', 'busca transformar una realidad social con los participantes; aquí se evalúa un prototipo.']],
  [['Cualitativo', 'trabaja con entrevistas o relatos; aquí todo se registra en números o categorías fijas.'], ['Mixto', 'combinaría ambos; la visita a las fincas usa una lista de verificación con datos puntuales, no interpretaciones.']],
  [['Básica', 'busca producir teoría nueva; aquí se usa conocimiento existente para un problema concreto.']],
  [['Solo documental o solo de campo', 'no basta: se necesitan los estudios previos y las fotos tomadas en las fincas.']],
  [['Exploratorio', 'sirve para temas poco estudiados; la identificación naso-labial tiene un siglo de estudios.'], ['Descriptivo', 'solo describiría el acierto; aquí además se busca su relación con las condiciones de captura.'], ['Explicativo', 'probaría causas; no es posible porque las condiciones no se controlan de forma experimental.']],
  [['Experimental', 'exigiría manipular la luz, el barro o la temperatura y asignar condiciones al azar; aquí se registran como ocurren.'], ['Una sola medición (transversal)', 'no permitiría comparar días ni la mañana con la tarde.']],
  [['Muestreo probabilístico', 'con solo 19 animales no tiene sentido sacar una parte: se trabaja con todos.']],
];

export const METODOLOGIA = [
  {
    id: 'metodologia', block: B, title: '¿Qué es la metodología?', spk: 'D', wide: true, hide3d: true,
    html: () => `<div class="col wide">
      <div class="eyebrow" data-a>08 · Metodología de la investigación · capítulo 5 del V27</div>
      <h2 data-a>La metodología es el <em>plan</em> para responder la pregunta con evidencia.</h2>
      <p class="lead" data-a>Antes de tomar una sola foto hay que decidir, en orden, desde dónde se mira el problema, qué datos se recogen, con quiénes, con qué instrumentos y cómo se analizan. Cada escalón responde una pregunta. ${C('r20', 'r54')}</p>
      <div class="ladder interactive" data-a>${LADDER.map(([t, q], i) => `<button class="step" data-i="${i}" style="--i:${i}"><span class="n">${i + 1}</span><b>${t}</b><span class="q">${q}</span></button>`).join('')}</div>
      <div class="ladder-out panel" id="ladder-out" data-a></div></div>`,
    mount(root) {
      const show = i => { const [t, q, d, ours, go] = LADDER[i]; $('#ladder-out').innerHTML = `<div class="lo"><div><div class="eyebrow">${i + 1} · ${t}</div><h3>${q}</h3><p>${d}</p></div><div class="ours"><small>En NASOID</small><b>${ours}</b><button class="link" onclick="NASOID_P.go(NASOID_P.ids.indexOf('${go}'))">Ver explicación →</button></div></div>`; $$('.step', root).forEach((s, k) => s.classList.toggle('on', k === i)); };
      $$('.step', root).forEach(s => s.onclick = () => show(+s.dataset.i)); show(0);
    },
    enter(root) { gsap.fromTo($$('.step', root), { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: 0.07, duration: 0.5, ease: 'power2.out' }); },
    notes: { idea: 'La metodología es una escalera de decisiones; cada una responde una pregunta.', guion: ['El capítulo 5 explica cómo vamos a responder la pregunta. No es un trámite: cada decisión condiciona qué datos recogemos y qué podemos concluir.', 'Primero el paradigma, luego el enfoque, el tipo, el alcance, el diseño, la población, las variables, los instrumentos y el análisis.'] },
  },
  {
    id: 'tabla1', block: B, title: 'Tabla 1 · Clasificación metodológica', spk: 'D', wide: true, hide3d: true,
    html: () => `<div class="col wide">
      <div class="eyebrow" data-a>Tabla 1 · Clasificación metodológica del proyecto · clic en cada fila</div>
      <h2 data-a>Siete decisiones y la <em>razón</em> de cada una.</h2>
      <div class="t1 interactive" data-a>
        <div class="t1-h"><span>Elemento</span><span>Decisión</span><span>Razón principal (V27)</span></div>
        ${METHOD.map(([e, d, r], i) => `<button class="t1-r" data-i="${i}"><span class="e">${e}</span><span class="d">${d}</span><span class="r">${r}</span><span class="plus">+</span></button>
          <div class="t1-x" data-x="${i}">${ALT[i] ? `<div class="eyebrow">Otras opciones posibles y por qué no se eligieron</div>${ALT[i].map(([a, w]) => `<p><b>${a}:</b> ${w}</p>`).join('')}` : ''}</div>`).join('')}
      </div>
      <p class="sub" data-a>Fuente de la tabla: V27. Las «otras opciones» son las categorías generales de los textos de metodología ${C('r20', 'r54')}</p></div>`,
    mount(root) { $$('.t1-r', root).forEach(r => r.onclick = () => { const x = $(`[data-x="${r.dataset.i}"]`, root), open = r.classList.toggle('open'); gsap.to(x, { height: open ? 'auto' : 0, opacity: open ? 1 : 0, duration: 0.35 }); }); },
    enter(root) { gsap.fromTo($$('.t1-r', root), { opacity: 0, x: -20 }, { opacity: 1, x: 0, stagger: 0.08, duration: 0.45, delay: 0.2 }); },
    notes: { idea: 'La Tabla 1 resume el capítulo: decisión y razón. Al abrir cada fila mostramos qué otras opciones existían.', guion: ['Paradigma positivista porque la pregunta se responde con datos medibles. Enfoque cuantitativo porque todo se registra en números o categorías definidas.', 'Investigación aplicada, documental y de campo. Alcance correlacional: queremos saber si el acierto se asocia con las condiciones de captura.', 'Diseño no experimental con tres sesiones: no manipulamos la luz ni el barro. Y trabajamos con los 19 bovinos porque son pocos.'] },
  },
  {
    id: 'paradigmas', block: B, title: 'Paradigma de investigación', spk: 'D', wide: true, shot: { rel: [3.8, 0.9, 4.6], look: 'body', lookOff: [0, -0.2, 0], shift: 0.34 },
    html: () => `<div class="col wide">
      <div class="eyebrow" data-a>5.1 · Paradigma · clic en cada tarjeta</div>
      <h2 data-a>¿Qué cuenta como <em>evidencia</em>?</h2>
      <p class="lead" data-a>Un paradigma es el conjunto de supuestos que orienta una investigación: qué se entiende por conocimiento, qué cuenta como evidencia y qué métodos son válidos. ${C('r54')}</p>
      <div class="paras interactive" data-a>
        <button class="para chosen"><span class="badge">Se adopta</span><b>Positivista</b><small>empírico-analítico</small><span class="pd">Estudia los hechos de forma objetiva: observación, medición y análisis estadístico.</span><span class="pw">El desempeño del prototipo se conoce midiendo cuántas fotos identifica bien y en qué condiciones. El resultado no depende de la opinión de los investigadores.</span></button>
        <button class="para"><b>Interpretativo</b><small>comprensivo</small><span class="pd">Busca comprender significados y experiencias desde el punto de vista de las personas.</span><span class="pw">No se adopta: la pregunta no indaga percepciones, sino aciertos y tiempos medibles.</span></button>
        <button class="para"><b>Crítico</b><small>socio-crítico</small><span class="pd">Busca transformar una realidad social con la participación de la comunidad.</span><span class="pw">No se adopta: se evalúa el desempeño de un prototipo, no una transformación social.</span></button>
      </div></div>`,
    mount(root) { $$('.para', root).forEach(p => p.onclick = () => p.classList.toggle('open')); },
    enter(root) { gsap.fromTo($$('.para', root), { rotateY: -25, opacity: 0 }, { rotateY: 0, opacity: 1, stagger: 0.12, duration: 0.6 }); setTimeout(() => $('.para.chosen', root).classList.add('open'), 900); },
    notes: { idea: 'Positivista: la verdad del proyecto la dan las mediciones.', guion: ['Los paradigmas más reconocidos son el positivista, el interpretativo y el crítico.', 'Elegimos el positivista porque nuestra pregunta se responde con datos observables y medibles: si identificó al animal correcto, con qué puntuación y en cuánto tiempo.'] },
  },
  {
    id: 'enfoque', block: B, title: 'Enfoque, tipo y alcance', spk: 'D', wide: true, hide3d: true,
    html: () => `<div class="col wide">
      <div class="eyebrow" data-a>5.2 y 5.3 · Enfoque, tipo y alcance</div>
      <h2 data-a>Cuantitativo, aplicado y <em>correlacional</em>.</h2>
      <div class="eta" data-a>
        <div class="eta-c"><small>Enfoque</small><b>Cuantitativo</b><p>Datos numéricos con instrumentos estructurados, un plan definido antes de entrar al campo y análisis estadístico.</p></div>
        <div class="eta-c"><small>Tipo según el propósito</small><b>Aplicada</b><p>Usa conocimiento existente (biometría naso-labial e IA) para resolver un problema concreto; no busca producir teoría nueva.</p></div>
        <div class="eta-c"><small>Tipo según la fuente</small><b>Documental y de campo</b><p>Estudios, normas y cifras del sector + fotografías y condiciones registradas directamente en las fincas.</p></div>
      </div>
      <div class="eyebrow" data-a style="margin-top:6px">Alcance · ¿hasta dónde llegan las conclusiones? · clic en cada nivel</div>
      <div class="scale interactive" data-a>${[['Exploratorio', 'Examina un tema poco estudiado.', false], ['Descriptivo', 'Describe cómo es o cómo se manifiesta algo: por ejemplo, la tasa de acierto.', false], ['Correlacional', 'Busca la asociación entre variables: ¿el acierto, la puntuación y el tiempo se asocian con la luz, el estado del hocico, la franja horaria o la señal? Ejemplo: ¿se acierta menos con el hocico sucio que con el hocico limpio?', true], ['Explicativo', 'Prueba causas. No se alcanza: las condiciones no se controlan experimentalmente, así que una asociación no se tomará como prueba de causa.', false]].map(([t, d, on], i) => `<button class="lvl ${on ? 'ours' : ''}" data-i="${i}" data-d="${d}"><span>${t}</span></button>`).join('')}<div class="lvl-pin"></div></div>
      <div class="scale-out panel" id="scale-out" data-a></div>
      <p class="sub" data-a>Como la muestra es pequeña, las asociaciones se tratarán como hallazgos exploratorios del estudio. ${C('r20')}</p></div>`,
    mount(root) { const show = b => { $('#scale-out').innerHTML = `<b>${b.textContent}</b>${b.classList.contains('ours') ? ' <span class="chip">alcance de NASOID</span>' : ''}<p>${b.dataset.d}</p>`; $$('.lvl', root).forEach(x => x.classList.toggle('on', x === b)); }; $$('.lvl', root).forEach(b => b.onclick = () => show(b)); show($('.lvl.ours', root)); },
    enter(root) { const pin = $('.lvl-pin', root), t = $('.lvl.ours', root), s = $('.scale', root); gsap.fromTo(pin, { left: 0 }, { left: t.offsetLeft + t.offsetWidth / 2 - s.clientLeft, duration: 1.4, ease: 'power3.inOut', delay: 0.3 }); },
    notes: { idea: 'Cuantitativo porque todo se mide; correlacional porque buscamos asociaciones, no causas.', guion: ['Es aplicada porque usamos conocimiento existente para un problema concreto, y documental y de campo porque combinamos estudios con fotos tomadas en las fincas.', 'El alcance es correlacional: además de calcular qué tan acertado es el prototipo, veremos si el acierto se asocia con las condiciones de captura.', 'No llega a explicativo porque no controlamos esas condiciones.'] },
  },
  {
    id: 'diseno', block: B, title: 'Diseño de investigación', spk: 'D', wide: true, shot: { rel: [4.4, 1.0, 4.6], look: 'body', lookOff: [0, -0.2, 0], shift: 0.34, graze: true },
    html: () => `<div class="col wide">
      <div class="eyebrow" data-a>5.4 · Diseño</div>
      <h2 data-a>No experimental, con <em>mediciones repetidas</em> en tres sesiones.</h2>
      <div class="cal interactive" data-a><div class="cal-axis"></div>${Array.from({ length: 15 }, (_, d) => `<span class="day" style="left:${d / 14 * 100}%">${d + 1}</span>`).join('')}
        ${SESSIONS_TABLE.map(s => `<button class="ses-pin ${s.s}" style="left:${(s.dia - 1) / 14 * 100}%"><b>${s.s}</b><span>${s.name}</span><small>Día ${s.dia} · ${s.franja.split(' ')[0]}</small><em>${s.total} fotos</em></button>`).join('')}</div>
      <div class="design" data-a>
        <div><b>No experimental</b><p>La luz, la temperatura, el estado del hocico o la señal no se manipulan: se registran tal como se presentan en cada sesión.</p></div>
        <div><b>Mediciones repetidas</b><p>Los mismos 19 animales en tres sesiones permiten comparar días y franjas horarias (mañana frente a tarde).</p></div>
        <div class="key"><b>Evaluación limpia</b><p>Toda la configuración (preprocesamiento, red y umbral θ) se fija con las fotos de S1. Las de S2 y S3 <b>no se usan para ajustar nada</b>: ajustar con los datos de prueba inflaría los resultados. ${C('r27', 'r03')}</p></div>
      </div></div>`,
    enter(root) { gsap.fromTo($('.cal-axis', root), { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 1 }); gsap.fromTo($$('.ses-pin', root), { y: -30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.35, duration: 0.6, delay: 0.6, ease: 'bounce.out' }); },
    notes: { idea: 'Observamos sin manipular; repetimos la medición; ajustamos solo con S1.', guion: ['El diseño es no experimental porque no manipulamos la luz ni el barro; los registramos.', 'Hay tres sesiones con los mismos animales: S1 el día 1 para registrar, S2 el día 8 en la mañana y S3 el día 15 en la tarde para probar.', 'Lo más importante: el umbral y la configuración se fijan solo con S1. Así la prueba es limpia.'] },
  },
  {
    id: 'poblacion', block: B, title: 'Población y muestra', spk: 'D', wide: true, shot: { rel: [3.2, 0.7, 4.4], look: 'body', lookOff: [0, -0.2, 0], shift: 0.34, graze: true },
    html: () => `<div class="col wide">
      <div class="eyebrow" data-a>5.5 · Población y muestra</div>
      <h2 data-a>No se elige una parte: se trabaja con <em>todos</em>.</h2>
      <div class="herds" data-a><div><div class="cows">${'<i></i>'.repeat(7)}</div><b>Finca A · 7 bovinos</b></div><div><div class="cows b">${'<i></i>'.repeat(12)}</div><b>Finca B · 12 bovinos</b></div><div class="tot"><b class="num19">19</b><span>bovinos, sin excluir por raza, sexo o edad</span></div></div>
      <div class="design" data-a>
        <div><b>Población</b><p>Bovinos de fincas ganaderas que no cuentan con una plataforma tecnológica propia para identificar a sus animales.</p></div>
        <div><b>Fincas por conveniencia</b><p>Se eligen según el acceso de los autores y la autorización de los propietarios. Dos fincas permiten observar el prototipo en dos entornos de manejo, espacio y luz.</p></div>
        <div><b>Límite honesto</b><p>Con dos fincas y 19 animales, los resultados sirven para valorar el prototipo, pero no se generalizan a todo el ganado del país.</p></div>
        <div><b>Ética</b><p>Las fotos se toman sin tocar al animal, durante su manejo habitual y con autorización de los propietarios; la información se usa solo con fines académicos.</p></div>
      </div></div>`,
    enter(root) { gsap.fromTo($$('.cows i', root), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, stagger: 0.05, duration: 0.35, ease: 'back.out(2.5)' }); const el = $('.num19', root), o = { v: 0 }; gsap.to(o, { v: 19, duration: 1.2, delay: 0.4, onUpdate: () => { el.textContent = Math.round(o.v); } }); },
    notes: { idea: 'Población pequeña: se toma completa; fincas por conveniencia; no se generaliza.', guion: ['La finca A tiene 7 bovinos y la B tiene 12: 19 en total. Como son pocos, no se selecciona una muestra: se trabaja con todos.', 'Las fincas se eligen por conveniencia. Por eso los resultados valoran el prototipo pero no se generalizan al país.'] },
  },
  {
    id: 'variables', block: B, title: 'Variables del estudio', spk: 'D', wide: true, hide3d: true,
    html: () => `<div class="col wide">
      <div class="eyebrow" data-a>5.6 · Variables · Tabla 4 · clic en cada grupo</div>
      <h2 data-a>Lo que se <em>mide</em> (Y) y las condiciones que se <em>registran</em> (X).</h2>
      <div class="vars interactive" data-a>
        <div class="vars-tabs">${VARIABLES.map((g, i) => `<button data-i="${i}" class="${i ? 'x' : 'y'}">${g.g}</button>`).join('')}</div>
        <div class="vars-body" id="vars-body"></div>
      </div>
      <p class="sub" data-a>El análisis correlacional busca la asociación entre las independientes (X) y las dependientes (Y). Los antecedentes muestran que estas condiciones influyen: la luz del día y el movimiento son retos de campo, y Lee et al. fijaron 30 cm para reducir la variación. ${C('r34', 'r36')}</p></div>`,
    mount(root) {
      const show = i => { const g = VARIABLES[i]; $('#vars-body').innerHTML = g.items.map(([v, t, f]) => `<div class="var"><b>${v}</b><span class="t">${t}</span><span class="f">${f}</span></div>`).join(''); gsap.fromTo($$('#vars-body .var'), { opacity: 0, y: 10 }, { opacity: 1, y: 0, stagger: 0.06, duration: 0.3 }); $$('.vars-tabs button', root).forEach((b, k) => b.classList.toggle('on', k === i)); };
      $$('.vars-tabs button', root).forEach(b => b.onclick = () => show(+b.dataset.i)); show(0);
    },
    notes: { idea: 'Y es el resultado; X son las condiciones del bovino, del ambiente y de la captura.', guion: ['Las dependientes son el resultado de cada identificación, la exactitud, la puntuación de semejanza y el tiempo.', 'Las independientes describen al bovino (raza, hocico), al ambiente (sesión, temperatura, luz) y la captura (celular, distancia, calidad, recorte).'] },
  },
  {
    id: 'protocolo', block: B, title: 'Protocolo e instrumentos', spk: 'D', shot: { look: 'muzzle', rel: [0.5, 0.05, 0.9], lookOff: [0, 0, -0.2], shift: 0.3, headUp: true }, wide: true,
    html: () => `<div class="col wide">
      <div class="eyebrow" data-a>5.7 y 5.8 · Protocolo de captura, técnicas e instrumentos</div>
      <h2 data-a>Cada toma sigue los <em>mismos pasos</em>.</h2>
      <div class="proto" data-a>
        <ol class="psteps">${PROTOCOL_STEPS.map((p, i) => `<li><i>${i + 1}</i><span>${p}</span></li>`).join('')}</ol>
        <div class="pfacts"><div><b>30 cm</b><span>de frente, sin flash ${C('r36')}</span></div><div><b>3–5 min</b><span>por bovino; ~35 min en la finca A y ~1 h en la B</span></div><div><b>≤ 10 s</b><span>requisito por identificación con buena señal (28,3 ms solo del modelo) ${C('r38')}</span></div><div><b>5 fotos</b><span>de referencia por animal ${C('r64', 'r41')}</span></div></div>
      </div>
      <div class="instr" data-a><div class="eyebrow">Tabla 6 · Técnicas e instrumentos</div>${INSTRUMENTS.map(([t, i, f]) => `<div class="ins"><b>${t}</b><span>${i}</span><small>${f}</small></div>`).join('')}</div></div>`,
    enter(root) { gsap.fromTo($$('.psteps li', root), { opacity: 0, x: -20 }, { opacity: 1, x: 0, stagger: 0.12, duration: 0.45 }); },
    notes: { idea: 'Un protocolo estandarizado reduce la variación entre tomas.', guion: ['Se anotan las condiciones, se ubica al animal en el brete, se toma la foto de frente a 30 cm y sin flash, se revisa y se ajusta el recorte, y se anota la decisión.', 'Todos los instrumentos son estructurados: matriz de antecedentes, lista de verificación, ficha de captura, matriz de pruebas y lista de chequeo.'] },
  },
  {
    id: 'fases', block: B, title: 'Fases y objetivos', spk: 'D', wide: true, hide3d: true,
    html: () => `<div class="col wide">
      <div class="eyebrow" data-a>5.9 · Fases del proyecto · modelo en cascada</div>
      <h2 data-a>Cada fase entrega un producto que <em>alimenta</em> la siguiente.</h2>
      <div class="cascade" data-a>${PHASES.map((p, i) => `<div class="cas" style="--i:${i}"><div class="cas-n">${p.n}</div><div class="cas-b"><b>${p.t}</b><span>${p.q}</span><em>→ ${p.p}</em><small>${OBJECTIVES.filter(o => o.fase.includes(String(p.n))).map(o => 'OE' + (OBJECTIVES.indexOf(o) + 1)).join(' · ')}</small></div></div>`).join('')}</div>
      <p class="sub" data-a><b>¿Por qué cascada?</b> Porque el alcance del prototipo es pequeño y está definido, y sus fases coinciden con los objetivos específicos. Al cierre de cada fase se hace una revisión antes de continuar. ${C('r50')}</p></div>`,
    enter(root) { gsap.fromTo($$('.cas', root), { opacity: 0, x: -40, y: -10 }, { opacity: 1, x: 0, y: 0, stagger: 0.25, duration: 0.6, ease: 'power3.out' }); },
    notes: { idea: 'Cinco fases en cascada, alineadas con los cinco objetivos.', guion: ['Preparación, construcción, recolección de datos, análisis y documentación.', 'Elegimos cascada porque el alcance es pequeño y definido; cada fase cierra con una revisión.'] },
  },
  {
    id: 'analisis', block: B, title: 'Análisis de la información', spk: 'D', wide: true, hide3d: true,
    html: () => `<div class="col wide">
      <div class="eyebrow" data-a>5.10 · Análisis de la información · clic en cada paso</div>
      <h2 data-a>De 209 fotos a una <em>respuesta</em> medible.</h2>
      <div class="an5 interactive" data-a>${ANALYSIS_STEPS.map((s, i) => `<button class="an" data-i="${i}"><i>${i + 1}</i><b>${s.t}</b><span>${s.d}</span></button>`).join('')}</div>
      <div class="nums" data-a>
        <div><b data-to="95">0</b><span>fotos de referencia (S1) para fijar el umbral</span></div>
        <div><b data-to="190">0</b><span>pares del mismo bovino (G)</span></div>
        <div><b data-to="4275">0</b><span>pares de bovinos distintos (I)</span></div>
        <div><b data-to="114">0</b><span>fotos de prueba (S2 y S3) para medir la exactitud</span></div>
        <div><b>5,3 %</b><span>acertar al azar entre 19 bovinos (1/19)</span></div>
      </div>
      <p class="sub" data-a>Errores que se cuentan: <b>falsa coincidencia</b> (se asigna a otro bovino) y <b>falso rechazo</b> (responde «no concluyente» aunque está registrado). Intervalo de confianza remuestreando bovinos completos y prueba de Wilcoxon para mañana frente a tarde; p &lt; 0,05 como apoyo, no como prueba definitiva. ${C('r22', 'r13', 'r69', 'r68')}</p></div>`,
    mount(root) { $$('.an', root).forEach(b => b.onclick = () => { $$('.an', root).forEach(x => x.classList.toggle('open', x === b && !b.classList.contains('open'))); }); },
    enter(root) { $$('[data-to]', root).forEach(el => { const o = { v: 0 }; gsap.to(o, { v: +el.dataset.to, duration: 1.6, ease: 'power2.out', onUpdate: () => { el.textContent = fmt(o.v); } }); }); },
    notes: { idea: 'Primero se ajusta con S1, luego se mide con S2 y S3; se reportan errores, intervalos y asociaciones.', guion: ['Con las 95 fotos de S1 se fija el umbral: 190 pares de un mismo bovino y 4.275 de bovinos distintos. Se elige el menor umbral que no confunde a ningún par distinto.', 'Con las 114 fotos de prueba se mide la exactitud, las falsas coincidencias y los falsos rechazos, por finca, sesión y bovino.', 'Como referencia, acertar al azar entre 19 bovinos sería un 5,3 %.'] },
  },
];
