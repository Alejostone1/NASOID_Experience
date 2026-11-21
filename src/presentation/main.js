/* =============================================================================
   NASOID — PRESENTACIÓN SIMPLIFICADA (10 escenas, fondo claro)
   Contenido tomado del documento V27 (autoridad académica): objetivos,
   metodología, cifras y alcance sin cambios; redacción más sencilla.
   ============================================================================= */
import '../shared/theme.css';
import './presentation.css';
import gsap from 'gsap';
import { loadFonts } from '../shared/fonts.js';
import { PROJECT, CONTEXT, GENERAL_OBJECTIVE, OBJECTIVES, SESSIONS_TABLE, SCOPE, QUESTION } from '../shared/content.js';
import { Stage3D } from './stage3d.js';

const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const SIM = `${import.meta.env.BASE_URL}experience/`;
const SPK = { D: 'Daniel Felipe Colorado Amaya', J: 'John Alejandro Piedrahita Muñoz', DJ: 'Daniel y John' };
const fmt = n => n.toLocaleString('es-CO');
const ICON = {
  tag: '<svg viewBox="0 0 48 48"><path d="M8 10h18l14 14-16 16L10 26z"/><circle cx="17" cy="19" r="3"/></svg>',
  lost: '<svg viewBox="0 0 48 48"><path d="M10 10h16l12 12-14 14L10 22z" stroke-dasharray="4 4"/><path d="M30 34l8 8M38 34l-8 8"/></svg>',
  sheet: '<svg viewBox="0 0 48 48"><rect x="11" y="7" width="26" height="34" rx="3"/><path d="M17 16h14M17 23h14M17 30h8"/></svg>',
  trace: '<svg viewBox="0 0 48 48"><circle cx="10" cy="24" r="4"/><circle cx="38" cy="12" r="4"/><circle cx="38" cy="36" r="4"/><path d="M14 22l20-8M14 26l20 8"/></svg>',
  reg: '<svg viewBox="0 0 48 48"><rect x="9" y="8" width="30" height="32" rx="4"/><path d="M16 18h16M16 25h16M16 32h9"/></svg>',
  cam: '<svg viewBox="0 0 48 48"><rect x="7" y="14" width="34" height="24" rx="4"/><circle cx="24" cy="26" r="7"/><path d="M17 14l3-5h8l3 5"/></svg>',
  ai: '<svg viewBox="0 0 48 48"><circle cx="12" cy="14" r="3"/><circle cx="12" cy="34" r="3"/><circle cx="24" cy="24" r="3"/><circle cx="36" cy="14" r="3"/><circle cx="36" cy="34" r="3"/><path d="M15 15l6 7M15 33l6-7M27 23l6-7M27 25l6 7"/></svg>',
  cmp: '<svg viewBox="0 0 48 48"><rect x="6" y="12" width="14" height="24" rx="3"/><rect x="28" y="12" width="14" height="24" rx="3"/><path d="M21 24h6M24 21v6" /></svg>',
  ok: '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="16"/><path d="M16 24l6 6 11-12"/></svg>',
};

const SCENES = [
  { id: 'nasoid', spk: 'DJ', shot: { rel: [2.3, 0.35, 3.4], look: 'body', lookOff: [0, 0.1, 0.4], shift: 0.24 },
    html: () => `<div class="col">
      <div class="eyebrow">${PROJECT.university} · ${PROJECT.year}</div>
      <h1 class="giant">NASOID</h1>
      <p class="lead">Identificación biométrica naso-labial en bovinos.</p>
      <p class="sub">${PROJECT.title}.</p>
      <div class="authors"><div><b>Daniel Felipe Colorado Amaya</b></div><div><b>John Alejandro Piedrahita Muñoz</b></div><div class="small">${PROJECT.program} · ${PROJECT.faculty}</div></div>
      <div class="row"><a class="btn amber big" href="${SIM}">EXPLORAR SIMULADOR NASOID</a><button class="btn ghost" data-next>Comenzar presentación →</button></div></div>` },
  { id: 'problema', spk: 'D', shot: { rel: [-1.0, 0.25, 1.3], look: 'muzzle', lookOff: [0, 0.05, -0.45], shift: 0.25, dropTag: true },
    html: () => `<div class="col">
      <div class="eyebrow">01 · El problema</div>
      <h2>¿Cómo sabemos, con seguridad, <em>quién es</em> cada animal?</h2>
      <div class="cards4">
        <div class="ic">${ICON.tag}<b>Identificación tradicional</b><span>Aretes, chips y marcas que hay que poner sobre el animal.</span></div>
        <div class="ic">${ICON.lost}<b>Identificadores que se pierden</b><span>Se dañan o desprenden en peleas o al engancharse con las cercas.</span></div>
        <div class="ic">${ICON.sheet}<b>Registros frágiles</b><span>Planillas y hojas de cálculo con datos mal escritos o desactualizados.</span></div>
        <div class="ic">${ICON.trace}<b>Trazabilidad en riesgo</b><span>Sin una identidad confiable se pierde el historial sanitario y comercial.</span></div>
      </div>
      <div class="stats"><div><b>${fmt(CONTEXT.abigeato)}</b><span>casos de abigeato entre ${CONTEXT.abigeatoPeriodo}<small>Semana (2024)</small></span></div><div><b>${String(CONTEXT.inventario).replace('.', ',')} M</b><span>bovinos en el inventario nacional<small>Fedegán (2025)</small></span></div></div></div>` },
  { id: 'propuesta', spk: 'J', shot: { look: 'muzzle', rel: [0.18, 0.03, 0.62], shift: 0.22, headUp: true, ring: true },
    html: () => `<div class="col">
      <div class="eyebrow">02 · Nuestra propuesta</div>
      <h2>El hocico funciona como una <em>huella dactilar</em>.</h2>
      <p class="lead">El plano naso-labial es la piel sin pelo entre los orificios nasales y el labio superior. Sus «perlas» y surcos forman un patrón propio de cada animal.</p>
      <ul class="facts"><li>En 1922, Petersen tomó huellas nasales con tinta a más de 350 bovinos y no encontró dos iguales.</li><li>Fotografiarlo no requiere aretes, cortes ni marcas: es <b>no invasivo</b>.</li></ul>
      <p class="cite">Petersen (1922) · Barry et al. (2007) · Kumar et al. (2017)</p></div>` },
  { id: 'objetivos', spk: 'D', shot: { rel: [4.6, 1.1, 4.4], look: 'body', lookOff: [0, -0.2, 0], shift: 0.3, graze: true }, wide: true,
    html: () => `<div class="col wide">
      <div class="eyebrow">03 · ¿Qué queremos desarrollar?</div>
      <h2>${GENERAL_OBJECTIVE.replace('prototipo', '<em>prototipo</em>')}</h2>
      <ol class="steps5">${OBJECTIVES.map((o, i) => `<li><i>${i + 1}</i><b>${o.v}</b><span>${short(o.t)}</span><small>${o.res}</small></li>`).join('')}</ol></div>` },
  { id: 'funciona', spk: 'J', shot: { rel: [3.2, 0.9, 5.2], look: 'body', lookOff: [0, -0.55, 0], shift: 0.0 }, wide: true,
    html: () => `<div class="col center">
      <div class="eyebrow">04 · ¿Cómo funciona?</div>
      <h2>De una foto a una identidad, en cinco pasos.</h2>
      <div class="flow">${[['reg', 'Registro', 'Cada bovino se registra con varias fotos de su hocico.'], ['cam', 'Fotografía', 'Con el celular, de frente y a unos 30 cm.'], ['ai', 'Análisis', 'La inteligencia artificial resume el hocico en 2048 números.'], ['cmp', 'Comparación', 'Se compara con todos los registrados.'], ['ok', 'Identificación', 'Si la semejanza supera el umbral, se asigna la identidad.']]
        .map(([ic, t, d], i) => `<div class="fnode"><div class="fi">${ICON[ic]}</div><b>${t}</b><span>${d}</span></div>${i < 4 ? '<div class="farrow"></div>' : ''}`).join('')}</div></div>` },
  { id: 'investigacion', spk: 'D', shot: { rel: [4.8, 1.2, 4.2], look: 'body', lookOff: [0, -0.2, 0], shift: 0.32, graze: true }, wide: true,
    html: () => `<div class="col wide">
      <div class="eyebrow">05 · ¿Cómo lo investigaremos?</div>
      <h2>Todos los animales de <em>dos fincas</em>, en tres sesiones.</h2>
      <div class="herds"><div><div class="cows">${'<i></i>'.repeat(7)}</div><b>Finca A · 7 bovinos</b></div><div><div class="cows">${'<i></i>'.repeat(12)}</div><b>Finca B · 12 bovinos</b></div><div class="tot"><b>19</b><span>bovinos en total</span></div></div>
      <div class="sessions">${SESSIONS_TABLE.map(s => `<div class="ses"><div class="sh"><b>${s.s}</b><span>Día ${s.dia} · ${s.franja.split(' ')[0]}</span></div><b>${s.name}</b><span>${s.prop}</span><div class="ph">${s.per} fotos por bovino → <b>${s.total}</b></div></div>`).join('')}</div>
      <div class="totals"><div><b>95</b><span>fotografías de referencia previstas</span></div><div><b>114</b><span>fotografías de prueba previstas</span></div><div><b>209</b><span>en total</span></div></div></div>` },
  { id: 'tecnologia', spk: 'J', shot: { look: 'muzzle', rel: [-0.16, 0.02, 0.5], shift: 0.22, headUp: true, scan: true },
    html: () => `<div class="col">
      <div class="eyebrow">06 · La tecnología</div>
      <h2>Tres ideas, sin fórmulas.</h2>
      <div class="tech">
        <div><b>Procesamiento de imágenes</b><span>Se recorta solo el hocico y se lleva a 224 × 224 píxeles.</span></div>
        <div><b>Inteligencia artificial</b><span>ResNet50, una red ya entrenada con millones de imágenes (ImageNet), se usa <em>tal como viene</em>, sin entrenarla de nuevo. Convierte el hocico en una «huella» de 2048 números.</span></div>
        <div><b>Comparación biométrica</b><span>Se mide qué tan parecida es la huella con las registradas (similitud coseno) y se elige la más cercana. Solo se acepta si supera un umbral fijado con las fotos de registro.</span></div>
      </div>
      <p class="cite">He et al. (2016) · Razavian et al. (2014) · Cover y Hart (1967) · Detalles técnicos: versión académica</p></div>` },
  { id: 'experiencia', spk: 'J', shot: { rel: [1.1, 0.15, 1.5], look: 'muzzle', lookOff: [0, -0.05, -0.5], shift: 0.24, headUp: true },
    html: () => `<div class="col">
      <div class="eyebrow">07 · La experiencia NASOID</div>
      <h2>Ahora, <em>pruébalo</em> tú.</h2>
      <p class="lead">Entra a una finca 3D, acércate a un bovino, fotografía su hocico y observa cómo NASOID lo compara con los animales registrados.</p>
      <div class="states"><span class="s ok">Identificado</span><span class="s warn">No identificado</span><span class="s tie">No concluyente</span></div>
      <p class="sub">El simulador ejecuta de verdad el recorte, ResNet50, la comparación y la regla de decisión en el navegador. Los animales son modelos 3D: es un <b>modo práctica</b>, no un resultado de la investigación.</p>
      <div class="row"><a class="btn amber big" href="${SIM}">EXPLORAR SIMULADOR NASOID</a></div></div>` },
  { id: 'alcance', spk: 'D', shot: { rel: [-4.6, 1.1, 4.6], look: 'body', lookOff: [0, -0.2, 0], shift: 0.32, graze: true }, wide: true,
    html: () => `<div class="col wide">
      <div class="eyebrow">08 · Alcance y conclusiones</div>
      <h2>Lo que hará, lo que <em>no</em> pretende y lo que viene.</h2>
      <div class="scope">
        <div><h4>El prototipo podrá</h4><ul>${SCOPE.modules.slice(0, 4).map(m => `<li><b>${m.t}.</b> ${short(m.d, 90)}</li>`).join('')}</ul></div>
        <div><h4>No pretende</h4><ul>${[0, 1, 2, 3, 5].map(i => `<li>${SCOPE.out[i]}</li>`).join('')}</ul></div>
        <div><h4>Posibilidades futuras</h4><ul><li>Detector automático del hocico.</li><li>Funcionamiento sin conexión.</li><li>Integración con sistemas oficiales de trazabilidad.</li><li>Comprobar la permanencia del patrón a largo plazo.</li></ul></div>
      </div>
      <div class="question"><span>Pregunta que responderá la investigación</span>${QUESTION}</div></div>` },
  { id: 'cierre', spk: 'DJ', shot: { rel: [2.6, 0.2, 4.4], look: 'body', lookOff: [0, -0.35, 0], shift: 0.0, headUp: true }, wide: true,
    html: () => `<div class="col center">
      <div class="eyebrow">NASOID · ${PROJECT.university}</div>
      <h2 class="big">Identificar sin marcar.</h2>
      <p class="lead">Innovación en identificación animal: una foto del hocico, inteligencia artificial y un registro digital confiable.</p>
      <div class="authors center"><b>Daniel Felipe Colorado Amaya</b> · <b>John Alejandro Piedrahita Muñoz</b><div class="small">Gracias</div></div>
      <div class="row center"><a class="btn amber big" href="${SIM}">EXPLORAR SIMULADOR NASOID</a></div></div>` },
];
function short(t, n = 120) { const s = t.replace(/\s+/g, ' '); return s.length > n ? s.slice(0, s.lastIndexOf(' ', n)) + '…' : s; }

let idx = 0, stage = null;
function build() {
  const app = $('#slides');
  app.innerHTML = SCENES.map(s => `<section class="slide" id="s-${s.id}" aria-label="${s.id}">${s.html()}</section>`).join('');
  $('#dots').innerHTML = SCENES.map((s, i) => `<button data-i="${i}" title="${i + 1}"></button>`).join('');
  $$('#dots button').forEach(b => b.onclick = () => go(+b.dataset.i));
  $$('[data-next]').forEach(b => b.onclick = () => go(idx + 1));
}
function go(i) {
  i = Math.max(0, Math.min(SCENES.length - 1, i)); const prev = $$('.slide')[idx], next = $$('.slide')[i], dir = i >= idx ? 1 : -1; idx = i;
  if (prev !== next) gsap.to(prev, { opacity: 0, x: -30 * dir, duration: 0.45, onComplete: () => prev.classList.remove('on') });
  next.classList.add('on'); gsap.fromTo(next, { opacity: 0, x: 30 * dir }, { opacity: 1, x: 0, duration: 0.6, delay: 0.15 });
  gsap.from(next.querySelectorAll('.col > *'), { opacity: 0, y: 16, duration: 0.5, stagger: 0.06, delay: 0.25 });
  stage?.shot(SCENES[i].shot); document.body.classList.toggle('wide', !!SCENES[i].wide);
  $$('#dots button').forEach((b, k) => b.classList.toggle('on', k === i));
  $('#count').textContent = `${String(i + 1).padStart(2, '0')} / ${SCENES.length}`;
  $('#speaker').textContent = SPK[SCENES[i].spk];
  $('#prog').style.width = ((i + 1) / SCENES.length * 100) + '%';
  history.replaceState(null, '', '#' + SCENES[i].id);
}
addEventListener('keydown', e => {
  if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); go(idx + 1); }
  if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); go(idx - 1); }
  if (e.key === 'Home') go(0); if (e.key === 'End') go(SCENES.length - 1);
  if (e.key.toLowerCase() === 'f') document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.().catch(() => {});
  if (e.key.toLowerCase() === 's') location.href = SIM;
});
let tx = null; addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
addEventListener('touchend', e => { if (tx == null) return; const d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 60) go(idx + (d < 0 ? 1 : -1)); tx = null; });

(async () => {
  await loadFonts(); build();
  $('#prev').onclick = () => go(idx - 1); $('#next').onclick = () => go(idx + 1);
  $('#full').onclick = () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.().catch(() => {});
  try { stage = new Stage3D($('#bg')); } catch (e) { console.warn('Sin WebGL: se muestra la presentación sin 3D', e); document.body.classList.add('no3d'); }
  const start = Math.max(0, SCENES.findIndex(s => '#' + s.id === location.hash));
  $$('.slide')[start].classList.add('on'); idx = start; stage?.shot({ ...SCENES[start].shot, fast: true }); go(start);
  gsap.to('#veil', { opacity: 0, duration: 0.8, delay: 0.2, onComplete: () => $('#veil').remove() });
  window.NASOID_P = { go, get idx() { return idx; }, count: SCENES.length };
})();
