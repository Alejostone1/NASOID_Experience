/* Bloque 2 · Fundamentos — el hocico como huella, estado del arte y Y = f(X₁…X₆). */
import gsap from 'gsap';
import { TIMELINE, CORPUS, XVARS } from '../../shared/content.js';
import { C, $, $$, REF } from '../core.js';

const B = 'Fundamentos';
const PROPS = [
  ['Universalidad', 'Todos los bovinos tienen plano naso-labial.', 'Respaldada por la literatura.', 'ok'],
  ['Distintividad', 'El dibujo cambia de un animal a otro: Petersen no encontró dos iguales en más de 350 bovinos.', 'Respaldada por la literatura.', 'ok'],
  ['Permanencia', 'El patrón se mantiene con el tiempo; Petersen vio que el hocico crecía pero el dibujo no cambiaba.', 'No la evaluamos: unas semanas no bastan; nos apoyamos en los estudios históricos.', 'warn'],
  ['Colectabilidad', 'Se puede capturar con facilidad, con una foto.', 'La que más puede fallar en campo (barro, humedad, movimiento): por eso registramos esas condiciones como variables.', 'tie'],
];
/** Íconos de trazo (se dibujan al entrar): grupo de hocicos, huellas distintas, reloj de arena y cámara. */
const PICON = [
  '<circle cx="7" cy="14" r="3.4"/><circle cx="17" cy="14" r="3.4"/><circle cx="12" cy="7" r="3.4"/><path d="M5.6 14.4h.01M8.4 14.4h.01M15.6 14.4h.01M18.4 14.4h.01M10.6 7.4h.01M13.4 7.4h.01"/>',
  '<path d="M4 12c0-4.4 3.6-8 8-8s8 3.6 8 8"/><path d="M7 13c0-2.8 2.2-5 5-5s5 2.2 5 5v2"/><path d="M10 14c0-1.1.9-2 2-2s2 .9 2 2v4"/><path d="M7 16v2M17 18v2"/>',
  '<path d="M7 3h10M7 21h10M8 3c0 5 8 5 8 9s-8 4-8 9M16 3c0 5-8 5-8 9s8 4 8 9"/>',
  '<rect x="3" y="7" width="18" height="13" rx="3"/><path d="M8 7l1.5-3h5L16 7"/><circle cx="12" cy="13.5" r="3.6"/>',
];
const PSTAT = ['Respaldada', 'Respaldada', 'Fuera del estudio', 'Se registra'];
/** Estado del arte: solo antecedentes de la biometría naso-labial (las técnicas van en el marco teórico).
 *  Hasta 2019, hitos históricos; desde 2020, los estudios del corpus (Tabla 8). */
const TL = [...TIMELINE.filter(t => t.k === 'naso' && t.y < 2020).map(t => ({ ...t, k: 'naso' })),
  ...CORPUS.map(c => ({ y: c.y, t: c.a, d: `${c.how}${c.n ? ` · ${c.n} ${c.unit}` : ''} (${c.accTxt}).`, ref: c.id, k: 'tec' }))].sort((a, b) => a.y - b.y);
/** Primer porcentaje de la exactitud reportada → contador animado y barra (sin texto nuevo). */
const NUM = /\d+(?:,\d+)?/;
const accVal = t => { const m = t.match(NUM); return m ? Math.min(100, parseFloat(m[0].replace(',', '.'))) : 0; };
const accCount = t => t.replace(NUM, m => `<span class="cnt" data-v="${m.replace(',', '.')}" data-d="${(m.split(',')[1] || '').length}">${m}</span>`);
const DISCARDED = ['Monitoreo aéreo con drones: no capturan la dermis naso-labial.', 'Aretes de radiofrecuencia (RFID): método físico sujeto a pérdida.', 'Reconocimiento facial exclusivo, sin discriminar el hocico.'];

export const FUNDAMENTOS = [
  {
    id: 'propuesta', block: B, title: 'El hocico como huella', spk: 'J', shot: { look: 'muzzle', rel: [0.18, 0.03, 0.62], shift: 0.22, headUp: true, ring: true },
    html: () => `<div class="col">
      <div class="eyebrow" data-a>6.2.2 · Marco teórico · biometría naso-labial</div>
      <h2 data-a>El hocico funciona como una <em>huella dactilar</em>.</h2>
      <p class="lead" data-a>Sus «perlas» y surcos forman un patrón propio de cada animal. ${C('r02', 'r33')}</p>
      <div class="eyebrow" data-a style="margin-top:6px">Cuatro propiedades de un rasgo biométrico · clic para ver ${C('r23')}</div>
      <div class="props interactive" data-a>${PROPS.map(([t, d, s, tone], i) => `<button class="prop ${tone}" data-i="${i}"><span class="p-ic"><svg viewBox="0 0 24 24">${PICON[i]}</svg></span><span class="p-tx"><span class="p-top"><b>${t}</b><em class="p-st">${PSTAT[i]}</em></span><span class="d">${d}</span><span class="s">${s}</span></span><span class="p-glow"></span></button>`).join('')}</div></div>`,
    enter(root) {
      const cards = $$('.prop', root);
      gsap.fromTo(cards, { opacity: 0, y: 26, rotateX: -25, scale: 0.94 }, { opacity: 1, y: 0, rotateX: 0, scale: 1, stagger: 0.14, duration: 0.7, delay: 0.35, ease: 'back.out(1.5)', clearProps: 'transform' });
      $$('.p-ic path, .p-ic circle, .p-ic rect', root).forEach((el, i) => { const L = el.getTotalLength ? el.getTotalLength() : 60; gsap.fromTo(el, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: 1.1, delay: 0.6 + (i % 6) * 0.08 + Math.floor(i / 6) * 0.1, ease: 'power2.out' }); });
      gsap.fromTo($$('.p-st', root), { opacity: 0, x: 10 }, { opacity: 1, x: 0, stagger: 0.14, duration: 0.5, delay: 1.2 });
      // recorrido: cada tarjeta brilla una vez, en orden
      cards.forEach((c, i) => setTimeout(() => { c.classList.remove('lit'); void c.offsetWidth; c.classList.add('lit'); }, 1700 + i * 420));
    },
    leave(root) { $$('.prop', root).forEach(c => c.classList.remove('lit')); },
    mount(root) {
      $$('.prop', root).forEach(p => {
        p.onclick = () => { const on = p.classList.contains('open'); $$('.prop', root).forEach(x => x.classList.remove('open')); if (!on) { p.classList.add('open'); gsap.fromTo($('.s', p), { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.35 }); } };
        p.onpointermove = e => { const r = p.getBoundingClientRect(); p.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%'); p.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%'); };
      });
    },
    notes: { idea: 'El hocico cumple las propiedades de un rasgo biométrico; la permanencia no se evalúa aquí.', guion: ['Petersen, en 1922, tomó huellas nasales con tinta a más de 350 bovinos y no encontró dos iguales.', 'Universalidad y distintividad están respaldadas; la permanencia no se puede probar en semanas; la colectabilidad es la que más falla en campo y por eso registramos barro, luz y movimiento.'] },
  },
  {
    id: 'estado-arte', block: B, title: 'Estado del arte', spk: 'J', wide: true, hide3d: true,
    html: () => {
      const X = i => 3 + i / (TL.length - 1) * 94; // espaciado uniforme en orden cronológico (no proporcional al tiempo)
      return `<div class="sa">
      <div class="sa-head" data-a><div><div class="eyebrow">6.1 · Estado del arte · un siglo de huellas nasales</div><h2>De la tinta de Petersen (1922) a los <em>vectores</em> de una red preentrenada.</h2></div>
        <div class="seg-toggle interactive"><button class="on" data-v="tl">Línea de tiempo</button><button data-v="corpus">Corpus 2020–2026</button></div></div>
      <div class="sa-view" data-view="tl">
        <div class="tl interactive" data-a><div class="tl-axis"><i></i></div>
          <span class="tl-era" style="left:${X(0)}%;width:${X(TL.findIndex(t => t.y >= 2020)) - X(0)}%">De la tinta a la imagen digital</span>
          <span class="tl-era late" style="left:${X(TL.findIndex(t => t.y >= 2020))}%;width:${100 - X(TL.findIndex(t => t.y >= 2020)) - 2}%">Aprendizaje profundo aplicado al hocico (2020–2026)</span>
          ${TL.map((t, i) => `<button class="tl-dot ${t.k} ${i % 2 ? 'up' : 'down'}" style="left:${X(i)}%" data-i="${i}"><i></i><span>${t.y}<br><b>${t.t}</b></span></button>`).join('')}</div>
        <div class="tl-legend" data-a><span class="lg naso">Antecedentes históricos</span><span class="lg tec">Corpus 2020–2026 (Tabla 8)</span><span class="sub">Orden cronológico (espaciado uniforme). Clic en un punto para ver el detalle y su fuente.</span></div>
        <div class="tl-card panel" id="tl-card" data-a></div>
      </div>
      <div class="sa-view hidden" data-view="corpus">
        <div class="corpus-filter interactive"><button class="on" data-f="all">Todos · ${CORPUS.length}</button><button data-f="corpus">Corpus directo · ${CORPUS.filter(c => c.role === 'corpus').length}</button><button data-f="parcial">Sirven parcialmente · ${CORPUS.filter(c => c.role !== 'corpus').length}</button><button data-f="desc">Descartados</button></div>
        <div class="corpus-grid">${CORPUS.map(c => `<article class="cc ${c.role}" data-role="${c.role}"><div class="cc-top"><b>${c.a}</b><span>${c.y}</span></div><div class="cc-acc">${accCount(c.accTxt)}</div><div class="cc-bar"><i style="--v:${accVal(c.accTxt)}"></i></div><p class="cc-how">${c.n ? `${c.n} ${c.unit} · ` : ''}${c.how}</p><p class="cc-note">${c.note}</p>${C(c.id)}</article>`).join('')}
          <article class="cc desc" data-role="desc"><div class="cc-top"><b>Literatura descartada</b></div><ul>${DISCARDED.map(d => `<li>${d}</li>`).join('')}</ul>${C('r58')}</article></div>
        <p class="sub">Las exactitudes <b>no son comparables entre sí</b>: cambian la especie, el número de imágenes por animal y si la red se entrena. La mayoría entrena o ajusta la red; nosotros probamos el camino más sencillo: una red preentrenada usada tal como viene. ${C('r64', 'r36', 'r41')}</p>
      </div></div>`;
    },
    mount(root) {
      const show = i => { const t = TL[i]; $('#tl-card').innerHTML = `<div class="eyebrow">${t.y} · ${t.k === 'naso' ? 'Antecedente histórico' : 'Corpus 2020–2026'}</div><h3>${t.t}</h3><p>${t.d}</p>${C(t.ref)}`; $$('.tl-dot', root).forEach(d => d.classList.toggle('on', +d.dataset.i === i)); gsap.fromTo('#tl-card', { opacity: 0.3, y: 6 }, { opacity: 1, y: 0, duration: 0.35 }); };
      $$('.tl-dot', root).forEach(d => d.onclick = () => show(+d.dataset.i)); show(0);
      const count = cards => cards.forEach(c => {
        const n = $('.cnt', c), bar = $('.cc-bar i', c);
        if (n) { const v = +n.dataset.v, d = +n.dataset.d, o = { v: 0 }; gsap.to(o, { v, duration: 1.3, ease: 'power2.out', onUpdate: () => { n.textContent = o.v.toFixed(d).replace('.', ','); } }); }
        if (bar) gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 1.3, ease: 'power3.out', delay: 0.1 });
      });
      const filter = f => {
        const all = $$('.cc', root), keep = all.filter(c => f === 'all' || c.dataset.role === f);
        gsap.killTweensOf(all);
        all.forEach(c => { c.style.display = keep.includes(c) ? '' : 'none'; });
        gsap.fromTo(keep, { opacity: 0, y: 24, rotateX: -35, scale: 0.94 }, { opacity: 1, y: 0, rotateX: 0, scale: 1, stagger: 0.06, duration: 0.55, ease: 'back.out(1.4)', clearProps: 'transform' });
        count(keep);
      };
      $$('.seg-toggle button', root).forEach(b => b.onclick = () => {
        $$('.seg-toggle button', root).forEach(x => x.classList.toggle('on', x === b));
        $$('.sa-view', root).forEach(v => v.classList.toggle('hidden', v.dataset.view !== b.dataset.v));
        if (b.dataset.v === 'corpus') filter($('.corpus-filter button.on', root).dataset.f);
        else this.enter(root);
      });
      $$('.corpus-filter button', root).forEach(b => b.onclick = () => { $$('.corpus-filter button', root).forEach(x => x.classList.toggle('on', x === b)); filter(b.dataset.f); });
    },
    enter(root) {
      gsap.fromTo($('.tl-axis i', root), { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', duration: 1.6, ease: 'power2.inOut' });
      gsap.fromTo($$('.tl-dot', root), { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, stagger: 0.09, duration: 0.45, delay: 0.3, ease: 'back.out(2)' });
      gsap.fromTo($$('.tl-era', root), { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.2, stagger: 0.5, delay: 0.5, ease: 'power2.out' });
      $$('.tl-dot', root).forEach((d, i) => setTimeout(() => { d.classList.remove('ping'); void d.offsetWidth; d.classList.add('ping'); }, 1700 + i * 110));
    },
    notes: { idea: 'Línea centenaria; los estudios recientes entrenan redes; nosotros usamos una red preentrenada sin entrenar.', guion: ['Petersen (1922) tomó huellas con tinta; Hirsch (1952) las clasificó; Barry (2007) pasó a la imagen digital.', 'Desde 2020 domina el aprendizaje profundo: Shojaeipour usó ResNet50 con cinco imágenes por animal; Lee fotografió con celular a 30 cm; Oliveira usó vectores, coseno y vecino más próximo con 30 vacas (92,7 %).', 'En «Corpus» se ve cómo clasificamos cada estudio: corpus directo, sirve parcialmente o descartado.'] },
  },
  {
    id: 'funcion', block: B, title: 'Y = f(X₁ … X₆)', spk: 'J', wide: true, hide3d: true,
    html: () => `<div class="col wide">
      <div class="eyebrow" data-a>6 · Marco de referencia · el sistema como una función</div>
      <h2 data-a>Seis etapas <em>X</em> producen una salida <em>Y</em>.</h2>
      <div class="fx interactive" data-a>${XVARS.map((x, i) => `<button class="fx-n" data-i="${i}"><b>${x.x}</b><span>${x.t}</span></button><i class="fx-a"></i>`).join('')}<div class="fx-y"><b>Y</b><span>(ĉ, s, d)</span></div><span class="fx-dot"></span></div>
      <div class="fx-detail panel" id="fx-detail" data-a></div></div>`,
    mount(root) {
      const show = i => { const x = XVARS[i]; $('#fx-detail').innerHTML = `<div class="eyebrow">${x.x} · sección ${x.sec}</div><h3>${x.t}</h3><p>${x.d}</p>${C(...x.refs)}`; $$('.fx-n', root).forEach((n, k) => n.classList.toggle('on', k === i)); };
      $$('.fx-n', root).forEach(n => n.onclick = () => show(+n.dataset.i)); show(0);
    },
    enter(root) {
      const dot = $('.fx-dot', root), nodes = $$('.fx-n, .fx-y', root), base = $('.fx', root).getBoundingClientRect();
      const tl = gsap.timeline({ repeat: 2 }); nodes.forEach(n => { const r = n.getBoundingClientRect(); tl.to(dot, { x: r.left - base.left + r.width / 2, y: r.top - base.top + r.height / 2, duration: 0.35, ease: 'power1.inOut', onStart: () => n.classList.add('pulse'), onComplete: () => setTimeout(() => n.classList.remove('pulse'), 250) }); });
    },
    notes: { idea: 'La función ordena el estado del arte, el marco teórico y las variables.', guion: ['Y es la variable dependiente: el bovino candidato ĉ, su puntuación de semejanza s y la decisión d (identificado o no concluyente). X₁ a X₆ son las variables independientes: las etapas del procesamiento, en el orden en que ocurren.', 'X₁ es la foto con el celular; X₂ el preprocesamiento; X₃ el recorte del hocico; X₄ ResNet50; X₅ la comparación con coseno, vecino más próximo y umbral; X₆ la base de datos y la trazabilidad.', 'Y es lo que se mide en campo: si acertó, con qué puntuación y en cuánto tiempo.'] },
  },
];
