/* Bloque 3 · Metodología de la investigación
   Explica qué es la metodología, la Tabla 1 (clasificación metodológica) y cada
   decisión con su porqué. Las decisiones y razones son las del V27; las «otras
   opciones» son las categorías generales de los textos de metodología citados en
   el V27 (Hernández-Sampieri y Mendoza, 2018; Ramos, 2015), para mostrar por qué
   no se eligieron. */
import gsap from 'gsap';
import { METHOD, VARIABLES } from '../../shared/content.js';
import { C, $, $$, fmt } from '../core.js';

const B = 'Metodología';
/** Íconos de trazo para cada escalón de la metodología. */
const LICON = [
  '<circle cx="12" cy="12" r="3"/><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/>',
  '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>',
  '<circle cx="6" cy="17" r="3"/><circle cx="18" cy="7" r="3"/><path d="M8.5 15l7-6"/>',
  '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="M8 15h.01M12 15h.01M16 15h.01"/>',
  '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M3 20c.8-3.4 3.2-5 6-5s5.2 1.6 6 5M15 15.5c2.6-.4 4.8 1 5.5 4"/>',
  '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
  '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h3"/>',
  '<path d="M18 4H6l6 8-6 8h12"/>',
];
const LADDER = [
  ['Paradigma', '¿Desde qué visión del conocimiento investigamos?', 'El conjunto de supuestos sobre qué cuenta como evidencia y qué métodos son válidos.', 'Positivista', 'Nuestra pregunta se responde con hechos medibles: si el sistema acertó, con qué puntuación y en cuánto tiempo. El resultado no depende de nuestra opinión.'],
  ['Enfoque', '¿Con qué tipo de datos respondemos?', 'Números y estadística (cuantitativo), significados y relatos (cualitativo) o ambos (mixto).', 'Cuantitativo', '«En qué medida» pide un número: registramos todo en cifras o en categorías fijadas antes de ir al campo y lo analizamos con estadística.'],
  ['Tipo', '¿Para qué investigamos y de dónde salen los datos?', 'Por el propósito: básica o aplicada. Por la fuente: documental, de campo o ambas.', 'Aplicada · documental y de campo', 'Usamos conocimiento que ya existe para un problema concreto, y combinamos los estudios previos con las fotos que tomamos en las fincas.'],
  ['Alcance', '¿Hasta dónde queremos llegar con los resultados?', 'Explorar, describir, relacionar variables (correlacional) o explicar causas.', 'Correlacional', 'Además de medir el acierto, buscamos si se asocia con la luz, el estado del hocico, la franja horaria o la señal. No probamos causas porque no controlamos esas condiciones.'],
  ['Diseño', '¿Cómo organizamos la recolección de datos?', 'Experimental (se manipulan variables) o no experimental (se observan como ocurren).', 'No experimental · tres sesiones', 'No manipulamos la luz ni el barro: los registramos. Fotografiamos a los mismos animales en tres sesiones (días 1, 8 y 15) y fijamos el umbral solo con la primera, para que la prueba sea limpia.'],
  ['Población y muestra', '¿Con quiénes trabajamos?', 'Todos los casos (población) o una parte de ellos (muestra).', '19 bovinos de dos fincas', 'Son pocos animales (7 y 12), así que no sacamos una muestra: trabajamos con todos. Por eso valoramos el prototipo, pero no generalizamos al país.'],
  ['Variables', '¿Qué medimos y qué condiciones registramos?', 'Dependientes (el resultado) e independientes (las condiciones).', 'Y: resultado · X: condiciones', 'Medimos el resultado, la exactitud, la puntuación y el tiempo; registramos las condiciones del bovino, del ambiente y de la captura.'],
  ['Técnicas e instrumentos', '¿Con qué herramientas recogemos los datos?', 'Revisión documental, observación estructurada, fichas, matrices y listas de chequeo.', 'Fichas, matrices y listas', 'Seguimos el mismo protocolo en cada toma (celular a 30 cm, de frente, sin flash) y lo anotamos en la ficha de captura, la matriz de pruebas y la lista de chequeo.'],
  ['Análisis', '¿Cómo convertimos los datos en respuestas?', 'Estadística descriptiva y pruebas para comparar o asociar.', 'Exactitud, errores e intervalos', 'Con las 95 fotos de registro fijamos el umbral; con las 114 de prueba medimos aciertos, falsas coincidencias y falsos rechazos, con intervalos de confianza y la prueba de Wilcoxon para mañana frente a tarde.'],
];
const ALT = [
  [['Interpretativo', 'busca comprender significados y experiencias de las personas; nosotros no estudiamos percepciones.'], ['Crítico', 'busca transformar una realidad social con los participantes; nosotros evaluamos un prototipo.']],
  [['Cualitativo', 'trabaja con entrevistas o relatos; nosotros registramos todo en números o categorías fijas.'], ['Mixto', 'combinaría ambos; en la visita a las fincas usamos una lista de verificación con datos puntuales, no interpretaciones.']],
  [['Básica', 'busca producir teoría nueva; nosotros usamos conocimiento existente para un problema concreto.']],
  [['Solo documental o solo de campo', 'no basta: necesitamos los estudios previos y las fotos que tomamos en las fincas.']],
  [['Exploratorio', 'sirve para temas poco estudiados; la identificación naso-labial tiene un siglo de estudios.'], ['Descriptivo', 'solo describiría el acierto; además buscamos su relación con las condiciones de captura.'], ['Explicativo', 'probaría causas; no es posible porque no controlamos las condiciones de forma experimental.']],
  [['Experimental', 'exigiría manipular la luz, el barro o la temperatura y asignar condiciones al azar; nosotros las registramos como ocurren.'], ['Una sola medición (transversal)', 'no permitiría comparar días ni la mañana con la tarde.']],
  [['Muestreo probabilístico', 'con solo 19 animales no tiene sentido sacar una parte: trabajamos con todos.']],
];

export const METODOLOGIA = [
  {
    id: 'metodologia', block: B, title: '¿Qué es la metodología?', spk: 'D', wide: true, hide3d: true,
    html: () => `<div class="col wide">
      <div class="eyebrow" data-a>07 · Metodología de la investigación · capítulo 5 del V27</div>
      <h2 data-a>La metodología es el <em>plan</em> para responder la pregunta con evidencia.</h2>
      <p class="lead" data-a>Antes de tomar una sola foto decidimos, en orden, desde dónde miramos el problema, qué datos recogemos, con quiénes, con qué instrumentos y cómo los analizamos. Cada escalón responde una pregunta. ${C('r20', 'r54')}</p>
      <div class="ladder interactive" data-a><span class="ladder-pin"></span>${LADDER.map(([t, q], i) => `<button class="step" data-i="${i}" style="--i:${i}"><span class="s-ic"><svg viewBox="0 0 24 24">${LICON[i]}</svg></span><span class="n">${i + 1}</span><b>${t}</b><span class="q">${q}</span></button>`).join('')}</div>
      <div class="ladder-out panel" id="ladder-out" data-a></div></div>`,
    mount(root) {
      const pin = $('.ladder-pin', root);
      const show = (i, quick) => {
        const [t, q, d, ours, why] = LADDER[i], st = $$('.step', root)[i], L = $('.ladder', root);
        $('#ladder-out').innerHTML = `<div class="lo"><div class="lo-badge"><svg viewBox="0 0 24 24">${LICON[i]}</svg><b>${i + 1}</b></div><div><div class="eyebrow">${i + 1} · ${t}</div><h3>${q}</h3><p>${d}</p></div><div class="ours"><small>En nuestro proyecto</small><b>${ours}</b><p class="why">${why}</p></div></div>`;
        $$('.step', root).forEach((s, k) => { s.classList.toggle('on', k === i); s.classList.toggle('done', k < i); });
        gsap.to(pin, { x: st.offsetLeft + st.offsetWidth / 2 - 9, y: st.offsetTop - L.clientTop - 12, duration: quick === true ? 0 : 0.5, ease: 'back.out(1.8)' });
        if (!quick || quick === 'tour') gsap.to(pin, { scale: quick === 'tour' ? 0.85 : 1, duration: 0.2 });
        if (!quick) { gsap.fromTo('#ladder-out .lo > div', { opacity: 0, y: 12 }, { opacity: 1, y: 0, stagger: 0.12, duration: 0.4 }); gsap.fromTo('#ladder-out .lo-badge', { scale: 0.5, rotate: -20 }, { scale: 1, rotate: 0, duration: 0.6, ease: 'back.out(2.2)' }); gsap.fromTo('#ladder-out .lo-badge path, #ladder-out .lo-badge circle, #ladder-out .lo-badge rect', { strokeDasharray: 80, strokeDashoffset: 80 }, { strokeDashoffset: 0, duration: 0.9, delay: 0.15 }); gsap.fromTo('#ladder-out .why', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.9, delay: 0.25, ease: 'power2.out' }); }
        this._i = i;
      };
      this._show = show; requestAnimationFrame(() => show(0, true));
      $$('.step', root).forEach(s => s.onclick = () => show(+s.dataset.i));
      root.addEventListener('keydown', e => { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); show(Math.max(0, Math.min(8, (this._i || 0) + (e.key === 'ArrowUp' ? 1 : -1)))); } });
    },
    enter(root) {
      gsap.fromTo($$('.step', root), { opacity: 0, y: 40, scaleY: 0.6, transformOrigin: '50% 100%' }, { opacity: 1, y: 0, scaleY: 1, stagger: 0.07, duration: 0.55, ease: 'power3.out' });
      // la marca «sube» la escalera y vuelve al primer escalón
      const tl = gsap.timeline({ delay: 0.8 }); LADDER.forEach((_, i) => tl.call(() => this._show(i, 'tour'), null, i * 0.16)); tl.call(() => this._show(0), null, LADDER.length * 0.16 + 0.5);
    },
    notes: { idea: 'La metodología es una escalera de decisiones; cada una responde una pregunta.', guion: ['El capítulo 5 explica cómo vamos a responder la pregunta. No es un trámite: cada decisión condiciona qué datos recogemos y qué podemos concluir.', 'Primero el paradigma, luego el enfoque, el tipo, el alcance, el diseño, la población, las variables, los instrumentos y el análisis.'] },
  },
  {
    id: 'tabla1', block: B, title: 'Tabla 1 · Clasificación metodológica', spk: 'D', wide: true, hide3d: true,
    html: () => `<div class="col wide">
      <div class="eyebrow" data-a>Tabla 1 · Clasificación metodológica del proyecto · clic en cada fila</div>
      <h2 data-a>Siete decisiones que tomamos y la <em>razón</em> de cada una.</h2>
      <div class="t1 interactive" data-a>
        <div class="t1-h"><span>Elemento</span><span>Decisión</span><span>Razón principal (V27)</span></div>
        ${METHOD.map(([e, d, r], i) => `<button class="t1-r" data-i="${i}"><span class="e">${e}</span><span class="d">${d}</span><span class="r">${r}</span><span class="plus">+</span></button>
          <div class="t1-x" data-x="${i}">${ALT[i] ? `<div class="eyebrow">Otras opciones posibles y por qué no las elegimos</div>${ALT[i].map(([a, w]) => `<p><b>${a}:</b> ${w}</p>`).join('')}` : ''}</div>`).join('')}
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
        <button class="para chosen"><span class="badge">Lo adoptamos</span><b>Positivista</b><small>empírico-analítico</small><span class="pd">Estudia los hechos de forma objetiva: observación, medición y análisis estadístico.</span><span class="pw">Conocemos el desempeño del prototipo midiendo cuántas fotos identifica bien y en qué condiciones. El resultado no depende de nuestra opinión.</span></button>
        <button class="para"><b>Interpretativo</b><small>comprensivo</small><span class="pd">Busca comprender significados y experiencias desde el punto de vista de las personas.</span><span class="pw">No lo adoptamos: nuestra pregunta no indaga percepciones, sino aciertos y tiempos medibles.</span></button>
        <button class="para"><b>Crítico</b><small>socio-crítico</small><span class="pd">Busca transformar una realidad social con la participación de la comunidad.</span><span class="pw">No lo adoptamos: evaluamos el desempeño de un prototipo, no una transformación social.</span></button>
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
        <div class="eta-c"><small>Enfoque</small><b>Cuantitativo</b><p>Recogemos datos numéricos con instrumentos estructurados, con un plan definido antes de entrar al campo, y los analizamos con estadística.</p></div>
        <div class="eta-c"><small>Tipo según el propósito</small><b>Aplicada</b><p>Usamos conocimiento existente (biometría naso-labial e IA) para resolver un problema concreto; no buscamos producir teoría nueva.</p></div>
        <div class="eta-c"><small>Tipo según la fuente</small><b>Documental y de campo</b><p>Combinamos estudios, normas y cifras del sector con las fotografías y condiciones que registramos en las fincas.</p></div>
      </div>
      <div class="eyebrow" data-a style="margin-top:6px">Alcance · ¿hasta dónde llegan las conclusiones? · clic en cada nivel</div>
      <div class="scale interactive" data-a>${[['Exploratorio', 'Examina un tema poco estudiado.', false], ['Descriptivo', 'Describe cómo es o cómo se manifiesta algo: por ejemplo, la tasa de acierto.', false], ['Correlacional', 'Buscamos la asociación entre variables: ¿el acierto, la puntuación y el tiempo se asocian con la luz, el estado del hocico, la franja horaria o la señal? Ejemplo: ¿se acierta menos con el hocico sucio que con el hocico limpio?', true], ['Explicativo', 'Prueba causas. No lo alcanzamos: no controlamos las condiciones de forma experimental, así que no tomaremos una asociación como prueba de causa.', false]].map(([t, d, on], i) => `<button class="lvl ${on ? 'ours' : ''}" data-i="${i}" data-d="${d}"><span>${t}</span></button>`).join('')}<div class="lvl-pin"></div></div>
      <div class="scale-out panel" id="scale-out" data-a></div>
      <p class="sub" data-a>Como la muestra es pequeña, trataremos las asociaciones como hallazgos exploratorios del estudio. ${C('r20')}</p></div>`,
    mount(root) { const show = b => { $('#scale-out').innerHTML = `<b>${b.textContent}</b>${b.classList.contains('ours') ? ' <span class="chip">nuestro alcance</span>' : ''}<p>${b.dataset.d}</p>`; $$('.lvl', root).forEach(x => x.classList.toggle('on', x === b)); }; $$('.lvl', root).forEach(b => b.onclick = () => show(b)); show($('.lvl.ours', root)); },
    enter(root) { const pin = $('.lvl-pin', root), t = $('.lvl.ours', root), s = $('.scale', root); gsap.fromTo(pin, { left: 0 }, { left: t.offsetLeft + t.offsetWidth / 2 - s.clientLeft, duration: 1.4, ease: 'power3.inOut', delay: 0.3 }); },
    notes: { idea: 'Cuantitativo porque todo se mide; correlacional porque buscamos asociaciones, no causas.', guion: ['Es aplicada porque usamos conocimiento existente para un problema concreto, y documental y de campo porque combinamos estudios con fotos tomadas en las fincas.', 'El alcance es correlacional: además de calcular qué tan acertado es el prototipo, veremos si el acierto se asocia con las condiciones de captura.', 'No llega a explicativo porque no controlamos esas condiciones.'] },
  },
  {
    id: 'poblacion', block: B, title: 'Población y muestra', spk: 'D', wide: true, shot: { rel: [3.2, 0.7, 4.4], look: 'body', lookOff: [0, -0.2, 0], shift: 0.34, graze: true },
    html: () => `<div class="col wide">
      <div class="eyebrow" data-a>5.5 · Población y muestra</div>
      <h2 data-a>No elegimos una parte: trabajamos con <em>todos</em>.</h2>
      <div class="herds" data-a><div><div class="pen"><div class="cows">${'<i><svg viewBox="0 0 44 30"><g class="cw"><path class="lg l1" d="M12 20v8M16 20v8M28 20v8M32 20v8"/><rect x="8" y="8" width="28" height="14" rx="7"/><circle class="sp" cx="17" cy="13" r="3.2"/><circle class="sp" cx="27" cy="16" r="2.4"/><path class="tl" d="M8 12c-3 1-4 5-3 8"/><g class="hd"><ellipse cx="38" cy="10" rx="5" ry="5.6"/><ellipse class="mz" cx="40.5" cy="13" rx="3" ry="2.3"/><path class="ear" d="M34 6l-3-2 1 4M42 6l3-2-1 4"/><circle class="ey" cx="39" cy="9" r=".9"/></g></g></svg></i>'.repeat(7)}</div></div><b>Finca A · 7 bovinos</b></div><div><div class="pen b"><div class="cows b">${'<i><svg viewBox="0 0 44 30"><g class="cw"><path class="lg l1" d="M12 20v8M16 20v8M28 20v8M32 20v8"/><rect x="8" y="8" width="28" height="14" rx="7"/><circle class="sp" cx="17" cy="13" r="3.2"/><circle class="sp" cx="27" cy="16" r="2.4"/><path class="tl" d="M8 12c-3 1-4 5-3 8"/><g class="hd"><ellipse cx="38" cy="10" rx="5" ry="5.6"/><ellipse class="mz" cx="40.5" cy="13" rx="3" ry="2.3"/><path class="ear" d="M34 6l-3-2 1 4M42 6l3-2-1 4"/><circle class="ey" cx="39" cy="9" r=".9"/></g></g></svg></i>'.repeat(12)}</div></div><b>Finca B · 12 bovinos</b></div><div class="tot"><b class="num19">19</b><span>bovinos, sin excluir por raza, sexo o edad</span></div></div>
      <div class="design" data-a>
        <div><b>Población</b><p>Bovinos de fincas ganaderas que no cuentan con una plataforma tecnológica propia para identificar a sus animales.</p></div>
        <div><b>Fincas por conveniencia</b><p>Las elegimos según nuestro acceso y la autorización de los propietarios. Dos fincas nos permiten observar el prototipo en dos entornos de manejo, espacio y luz.</p></div>
        <div><b>Límite honesto</b><p>Con dos fincas y 19 animales, los resultados sirven para valorar el prototipo, pero no los generalizamos a todo el ganado del país.</p></div>
        <div><b>Ética</b><p>Tomamos las fotos sin tocar al animal, durante su manejo habitual y con autorización de los propietarios; usamos la información solo con fines académicos.</p></div>
      </div></div>`,
    enter(root) { gsap.fromTo($$('.pen', root), { opacity: 0, scaleY: 0.6 }, { opacity: 1, scaleY: 1, transformOrigin: '50% 100%', stagger: 0.2, duration: 0.6, ease: 'power3.out' }); gsap.fromTo($$('.cows i', root), { x: -90, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.07, duration: 0.9, delay: 0.3, ease: 'power2.out', onStart() { this.targets()[0]?.classList.add('walk'); }, onComplete() { this.targets()[0]?.classList.remove('walk'); } }); $$('.cows i', root).forEach((c, k) => { c.classList.add('walk'); setTimeout(() => c.classList.remove('walk'), 1200 + k * 70); }); const el = $('.num19', root), o = { v: 0 }; gsap.to(o, { v: 19, duration: 1.6, delay: 0.8, onUpdate: () => { el.textContent = Math.round(o.v); } }); },
    notes: { idea: 'Población pequeña: se toma completa; fincas por conveniencia; no se generaliza.', guion: ['La finca A tiene 7 bovinos y la B tiene 12: 19 en total. Como son pocos, no se selecciona una muestra: se trabaja con todos.', 'Las fincas se eligen por conveniencia. Por eso los resultados valoran el prototipo pero no se generalizan al país.'] },
  },
  {
    id: 'variables', block: B, title: 'Variables del estudio', spk: 'D', wide: true, hide3d: true,
    html: () => `<div class="col wide">
      <div class="eyebrow" data-a>5.6 · Variables · Tabla 4 · clic en cada grupo</div>
      <h2 data-a>Lo que <em>medimos</em> (Y) y las condiciones que <em>registramos</em> (X).</h2>
      <div class="vars interactive" data-a>
        <div class="vars-tabs">${VARIABLES.map((g, i) => `<button data-i="${i}" class="${i ? 'x' : 'y'}">${g.g}</button>`).join('')}</div>
        <div class="vars-body" id="vars-body"></div>
      </div>
      <p class="sub" data-a>Con el análisis correlacional buscamos la asociación entre las independientes (X) y las dependientes (Y). Los antecedentes muestran que estas condiciones influyen: la luz del día y el movimiento son retos de campo, y Lee et al. fijaron 30 cm para reducir la variación. ${C('r34', 'r36')}</p></div>`,
    mount(root) {
      const show = i => { const g = VARIABLES[i]; $('#vars-body').innerHTML = g.items.map(([v, t, f]) => `<div class="var"><b>${v}</b><span class="t">${t}</span><span class="f">${f}</span></div>`).join(''); gsap.fromTo($$('#vars-body .var'), { opacity: 0, y: 10 }, { opacity: 1, y: 0, stagger: 0.06, duration: 0.3 }); $$('.vars-tabs button', root).forEach((b, k) => b.classList.toggle('on', k === i)); };
      $$('.vars-tabs button', root).forEach(b => b.onclick = () => show(+b.dataset.i)); show(0);
    },
    enter(root) { gsap.fromTo($$('.vars-tabs button', root), { opacity: 0, x: -24 }, { opacity: 1, x: 0, stagger: 0.1, duration: 0.45, delay: 0.3 }); },
    notes: { idea: 'Y es el resultado; X son las condiciones del bovino, del ambiente y de la captura.', guion: ['Las dependientes son el resultado de cada identificación, la exactitud, la puntuación de semejanza y el tiempo.', 'Las independientes describen al bovino (raza, hocico), al ambiente (sesión, temperatura, luz) y la captura (celular, distancia, calidad, recorte).'] },
  },
];
