/* Bloque 2 · Fundamentos (John) — el hocico como huella, estado del arte y Y = f(X₁…X₆). */
import gsap from 'gsap';
import { TIMELINE, CORPUS, XVARS } from '../../shared/content.js';
import { C, $, $$, REF } from '../core.js';

const B = 'Fundamentos';
const PROPS = [
  ['Universalidad', 'Todos los bovinos tienen plano naso-labial.', 'Respaldada por la literatura.', 'ok'],
  ['Distintividad', 'El dibujo cambia de un animal a otro: Petersen no encontró dos iguales en más de 350 bovinos.', 'Respaldada por la literatura.', 'ok'],
  ['Permanencia', 'El patrón se mantiene con el tiempo; Petersen vio que el hocico crecía pero el dibujo no cambiaba.', 'No se evalúa: unas semanas no bastan. Se apoya en los estudios históricos.', 'warn'],
  ['Colectabilidad', 'Se puede capturar con facilidad, con una foto.', 'La que más puede fallar en campo (barro, humedad, movimiento): por eso esas condiciones se registran como variables.', 'tie'],
];
const EXTRA = [ // hitos del marco teórico que no están en la cronología base
  { y: 2010, t: 'Pan y Yang', d: 'Aprendizaje por transferencia: aprovechar lo aprendido en una tarea para otra.', ref: 'r45', k: 'tec' },
  { y: 2014, t: 'Razavian et al.', d: 'El vector de una red preentrenada sirve para describir imágenes de tareas muy distintas: base para no entrenar.', ref: 'r55', k: 'tec' },
  { y: 2021, t: 'ISO/IEC 19795-1', d: 'Medidas de error biométrico: falsa coincidencia y falso rechazo.', ref: 'r22', k: 'tec' },
];
const TL = [...TIMELINE, ...EXTRA].sort((a, b) => a.y - b.y || (a.k === 'naso' ? -1 : 1));
const DISCARDED = ['Monitoreo aéreo con drones: no capturan la dermis naso-labial.', 'Aretes de radiofrecuencia (RFID): método físico sujeto a pérdida.', 'Reconocimiento facial exclusivo, sin discriminar el hocico.'];

export const FUNDAMENTOS = [
  {
    id: 'propuesta', block: B, title: 'El hocico como huella', spk: 'J', shot: { look: 'muzzle', rel: [0.18, 0.03, 0.62], shift: 0.22, headUp: true, ring: true },
    html: () => `<div class="col">
      <div class="eyebrow" data-a>05 · Nuestra propuesta</div>
      <h2 data-a>El hocico funciona como una <em>huella dactilar</em>.</h2>
      <p class="lead" data-a>El plano naso-labial es la piel sin pelo entre los orificios nasales y el labio superior. Sus «perlas» y surcos forman un patrón propio de cada animal. ${C('r02', 'r33')}</p>
      <div class="eyebrow" data-a style="margin-top:6px">Un rasgo biométrico debe cumplir cuatro propiedades · clic para ver ${C('r23')}</div>
      <div class="props interactive" data-a>${PROPS.map(([t, d, s, tone], i) => `<button class="prop ${tone}" data-i="${i}"><b>${t}</b><span class="d">${d}</span><span class="s">${s}</span></button>`).join('')}</div></div>`,
    mount(root) { $$('.prop', root).forEach(p => p.onclick = () => { const on = p.classList.contains('open'); $$('.prop', root).forEach(x => x.classList.remove('open')); if (!on) p.classList.add('open'); }); },
    notes: { idea: 'El hocico cumple las propiedades de un rasgo biométrico; la permanencia no se evalúa aquí.', guion: ['Petersen, en 1922, tomó huellas nasales con tinta a más de 350 bovinos y no encontró dos iguales.', 'Universalidad y distintividad están respaldadas; la permanencia no se puede probar en semanas; la colectabilidad es la que más falla en campo y por eso registramos barro, luz y movimiento.'] },
  },
  {
    id: 'estado-arte', block: B, title: 'Estado del arte', spk: 'J', wide: true, hide3d: true,
    html: () => {
      const X = i => 3 + i / (TL.length - 1) * 94; // espaciado uniforme en orden cronológico (no proporcional al tiempo)
      return `<div class="sa">
      <div class="sa-head" data-a><div><div class="eyebrow">06 · Estado del arte · un siglo de huellas nasales</div><h2>De la tinta de Petersen (1922) a los <em>vectores</em> de una red preentrenada.</h2></div>
        <div class="seg-toggle interactive"><button class="on" data-v="tl">Línea de tiempo</button><button data-v="corpus">Corpus 2020–2026</button></div></div>
      <div class="sa-view" data-view="tl">
        <div class="tl interactive" data-a><div class="tl-axis"><i></i></div>
          <span class="tl-era" style="left:${X(0)}%;width:${X(TL.findIndex(t => t.y >= 2020)) - X(0)}%">Fundamentos: de la tinta a las redes profundas</span>
          <span class="tl-era late" style="left:${X(TL.findIndex(t => t.y >= 2020))}%;width:${100 - X(TL.findIndex(t => t.y >= 2020)) - 2}%">Aprendizaje profundo aplicado al hocico (2020–2026)</span>
          ${TL.map((t, i) => `<button class="tl-dot ${t.k} ${i % 2 ? 'up' : 'down'}" style="left:${X(i)}%" data-i="${i}"><i></i><span>${t.y}<br><b>${t.t}</b></span></button>`).join('')}</div>
        <div class="tl-legend" data-a><span class="lg naso">Biometría naso-labial</span><span class="lg tec">Técnica que usa el prototipo</span><span class="sub">Orden cronológico (espaciado uniforme). Clic en un punto para ver el detalle y su fuente.</span></div>
        <div class="tl-card panel" id="tl-card" data-a></div>
      </div>
      <div class="sa-view hidden" data-view="corpus">
        <div class="corpus-filter interactive"><button class="on" data-f="all">Todos · ${CORPUS.length}</button><button data-f="corpus">Corpus directo · ${CORPUS.filter(c => c.role === 'corpus').length}</button><button data-f="parcial">Sirven parcialmente · ${CORPUS.filter(c => c.role !== 'corpus').length}</button><button data-f="desc">Descartados</button></div>
        <div class="corpus-grid">${CORPUS.map(c => `<article class="cc ${c.role}" data-role="${c.role}"><div class="cc-top"><b>${c.a}</b><span>${c.y}</span></div><div class="cc-acc">${c.accTxt}</div><p class="cc-how">${c.n ? `${c.n} ${c.unit} · ` : ''}${c.how}</p><p class="cc-note">${c.note}</p>${C(c.id)}</article>`).join('')}
          <article class="cc desc" data-role="desc"><div class="cc-top"><b>Literatura descartada</b></div><ul>${DISCARDED.map(d => `<li>${d}</li>`).join('')}</ul>${C('r58')}</article></div>
        <p class="sub">Las exactitudes <b>no son comparables entre sí</b>: cambian la especie, el número de imágenes por animal y si la red se entrena. La mayoría entrena o ajusta la red; NASOID prueba el camino más sencillo: una red preentrenada usada tal como viene. ${C('r64', 'r36', 'r41')}</p>
      </div></div>`;
    },
    mount(root) {
      const show = i => { const t = TL[i]; $('#tl-card').innerHTML = `<div class="eyebrow">${t.y} · ${t.k === 'naso' ? 'Biometría naso-labial' : 'Técnica que usa el prototipo'}</div><h3>${t.t}</h3><p>${t.d}</p>${C(t.ref)}`; $$('.tl-dot', root).forEach(d => d.classList.toggle('on', +d.dataset.i === i)); gsap.fromTo('#tl-card', { opacity: 0.3, y: 6 }, { opacity: 1, y: 0, duration: 0.35 }); };
      $$('.tl-dot', root).forEach(d => d.onclick = () => show(+d.dataset.i)); show(0);
      $$('.seg-toggle button', root).forEach(b => b.onclick = () => {
        $$('.seg-toggle button', root).forEach(x => x.classList.toggle('on', x === b));
        $$('.sa-view', root).forEach(v => v.classList.toggle('hidden', v.dataset.view !== b.dataset.v));
        if (b.dataset.v === 'corpus') gsap.fromTo($$('.cc', root), { opacity: 0, y: 14 }, { opacity: 1, y: 0, stagger: 0.04, duration: 0.4 });
      });
      $$('.corpus-filter button', root).forEach(b => b.onclick = () => { $$('.corpus-filter button', root).forEach(x => x.classList.toggle('on', x === b)); const f = b.dataset.f; $$('.cc', root).forEach(c => c.classList.toggle('dim', f !== 'all' && (f === 'parcial' ? c.dataset.role !== 'parcial' : c.dataset.role !== f))); });
    },
    enter(root) {
      gsap.fromTo($('.tl-axis i', root), { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 1.6, ease: 'power2.inOut' });
      gsap.fromTo($$('.tl-dot', root), { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, stagger: 0.09, duration: 0.45, delay: 0.3, ease: 'back.out(2)' });
    },
    notes: { idea: 'Línea centenaria; los estudios recientes entrenan redes; NASOID usa una red preentrenada sin entrenar.', guion: ['Petersen (1922) tomó huellas con tinta; Hirsch (1952) las clasificó; Barry (2007) pasó a la imagen digital.', 'Las técnicas que usamos también tienen historia: vecino más próximo (1967), similitud coseno (1975), ImageNet (2009), ResNet (2016).', 'Desde 2020 domina el aprendizaje profundo: Shojaeipour usó ResNet50 con cinco imágenes por animal; Lee fotografió con celular a 30 cm; Oliveira usó vectores, coseno y vecino más próximo con 30 vacas (92,7 %).', 'En «Corpus» se ve cómo clasificamos cada estudio: corpus directo, sirve parcialmente o descartado.'] },
  },
  {
    id: 'funcion', block: B, title: 'Y = f(X₁ … X₆)', spk: 'J', wide: true, hide3d: true,
    html: () => `<div class="col wide">
      <div class="eyebrow" data-a>07 · El sistema como una función · ecuación (1)</div>
      <h2 data-a>Seis etapas <em>X</em> producen una salida <em>Y</em>.</h2>
      <div class="fx interactive" data-a>${XVARS.map((x, i) => `<button class="fx-n" data-i="${i}"><b>${x.x}</b><span>${x.t}</span></button><i class="fx-a"></i>`).join('')}<div class="fx-y"><b>Y</b><span>(ĉ, s, d)</span></div><span class="fx-dot"></span></div>
      <div class="fx-detail panel" id="fx-detail" data-a></div>
      <p class="sub" data-a><b>Y</b> es la variable dependiente: el bovino candidato <b>ĉ</b>, su puntuación de semejanza <b>s</b> y la decisión <b>d</b> («identificado» o «no concluyente»). <b>X₁ a X₆</b> son las variables independientes: las etapas del procesamiento, en el orden en que ocurren.</p></div>`,
    mount(root) {
      const show = i => { const x = XVARS[i]; $('#fx-detail').innerHTML = `<div class="eyebrow">${x.x} · sección ${x.sec} del V27</div><h3>${x.t}</h3><p>${x.d}</p>${C(...x.refs)}`; $$('.fx-n', root).forEach((n, k) => n.classList.toggle('on', k === i)); };
      $$('.fx-n', root).forEach(n => n.onclick = () => show(+n.dataset.i)); show(0);
    },
    enter(root) {
      const dot = $('.fx-dot', root), nodes = $$('.fx-n, .fx-y', root), base = $('.fx', root).getBoundingClientRect();
      const tl = gsap.timeline({ repeat: 2 }); nodes.forEach(n => { const r = n.getBoundingClientRect(); tl.to(dot, { x: r.left - base.left + r.width / 2, y: r.top - base.top + r.height / 2, duration: 0.35, ease: 'power1.inOut', onStart: () => n.classList.add('pulse'), onComplete: () => setTimeout(() => n.classList.remove('pulse'), 250) }); });
    },
    notes: { idea: 'La función ordena el estado del arte, el marco teórico y las variables.', guion: ['X₁ es la foto con el celular; X₂ el preprocesamiento; X₃ el recorte del hocico; X₄ ResNet50; X₅ la comparación con coseno, vecino más próximo y umbral; X₆ la base de datos y la trazabilidad.', 'Y es lo que se mide en campo: si acertó, con qué puntuación y en cuánto tiempo.'] },
  },
];
