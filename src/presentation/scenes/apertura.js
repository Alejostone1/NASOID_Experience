/* Bloque 1 · Apertura (Daniel) — portada, contexto, problema, pregunta, justificación y objetivos. */
import gsap from 'gsap';
import { PROJECT, CONTEXT, PROBLEM, QUESTION, GENERAL_OBJECTIVE, OBJECTIVES } from '../../shared/content.js';
import { C, $, $$, fmt, ICON } from '../core.js';

const SIM = `${import.meta.env.BASE_URL}experience/`;
const B = 'Apertura';
const ACTIVITIES = [
  'Revisión documental, visita de reconocimiento a las fincas y redacción de los requerimientos de cada módulo.',
  'Definición de la arquitectura, del modelo de datos y de las pantallas adaptadas al celular.',
  'Programación de los módulos de registro y gestión, identificación biométrica (ResNet50 preentrenada, sin entrenamiento), trazabilidad, estadísticas y dashboard.',
  'Sesión de registro, fijación del umbral con S1, sesiones de prueba, medición de la tasa de acierto y del tiempo, y prueba de aceptación con lista de chequeo.',
  'Manual técnico, manual de usuario e informe final con las conclusiones.',
];
function counter(el, to, d = 0, dur = 1.8) { const o = { v: 0 }; gsap.to(o, { v: to, duration: dur, ease: 'power2.out', onUpdate: () => { el.textContent = fmt(o.v, d); } }); }

export const APERTURA = [
  {
    id: 'nasoid', block: B, title: 'NASOID', spk: 'DJ', shot: { rel: [2.3, 0.35, 3.4], look: 'body', lookOff: [0, 0.1, 0.4], shift: 0.24 },
    html: () => `<div class="col">
      <div class="eyebrow" data-a>${PROJECT.university} · ${PROJECT.year}</div>
      <h1 class="giant" data-a>NASOID</h1>
      <p class="lead" data-a>Identificación biométrica naso-labial en bovinos, apoyada en inteligencia artificial.</p>
      <div class="authors" data-a><div><b>Daniel Felipe Colorado Amaya</b></div><div><b>John Alejandro Piedrahita Muñoz</b></div>
        <div class="small">${PROJECT.program} · ${PROJECT.faculty}</div>
        <div class="small">Fundamentos de Investigación · Asesor: <b>Prof. Alexander Quintero</b></div></div>
      <div class="row" data-a><a class="btn amber big" href="${SIM}">EXPLORAR SIMULADOR NASOID</a><button class="btn ghost" onclick="NASOID_P.go(1)">Comenzar →</button></div>
      <p class="hint" data-a>← → para avanzar · <kbd>M</kbd> índice · <kbd>R</kbd> referencias · <kbd>N</kbd> notas</p></div>`,
    notes: { idea: 'Presentarnos, presentar el proyecto y decir qué vamos a mostrar.', guion: ['Buenos días. Somos Daniel Colorado y John Piedrahita, de Ingeniería de Sistemas y Telecomunicaciones.', 'NASOID es un prototipo para reconocer a cada bovino por la huella de su hocico, con una foto del celular e inteligencia artificial.', 'Vamos a recorrer el problema, lo que dice la literatura, cómo lo vamos a investigar —la metodología— y la tecnología, y al final lo verán funcionar en un simulador.'] },
  },
  {
    id: 'contexto', block: B, title: 'La ganadería en cifras', spk: 'D', shot: { rel: [3.6, 0.8, 4.2], look: 'body', lookOff: [0, -0.2, 0], shift: 0.3, graze: true }, wide: true,
    html: () => `<div class="col wide">
      <div class="eyebrow" data-a>Contexto · Colombia, 2024</div>
      <h2 data-a>Un hato de <em>29,5 millones</em> de animales que debe poder identificarse uno por uno.</h2>
      <div class="ctx" data-a>
        <div class="bars">${[['PIB nacional', CONTEXT.pibNacional], ['PIB agropecuario', CONTEXT.pibAgro], ['PIB pecuario', CONTEXT.pibPecuario]].map(([l, v]) => `<div class="bar-row"><span>${l}</span><div class="bar"><i data-w="${v}"></i></div><b class="mono">${fmt(v, v < 10 ? 1 : 0)} %</b></div>`).join('')}
          <p class="cap">Aporte de la ganadería bovina en 2024 ${C('r11')}</p></div>
        <div class="figs"><div><b class="num" data-to="${CONTEXT.abigeato}">0</b><span>casos de abigeato denunciados entre 2010 y 2023 ${C('r61')}</span></div>
          <div><b class="num">1,3 M</b><span>animales en faena clandestina en 2024 ${C('r11')}</span></div>
          <div><b class="num">29,5 M</b><span>bovinos en el inventario nacional ${C('r11')}</span></div></div>
      </div>
      <p class="sub" data-a>Existen sistemas oficiales (SINIGAN, Ley 914 de 2004 y Ley 1659 de 2013), pero muchas fincas no tienen una plataforma propia para apoyar y verificar la identificación. Las cifras de abigeato solo recogen casos denunciados y no dependen únicamente de fallas de identificación. ${C('r06', 'r07')}</p></div>`,
    enter(root) { $$('.bar i', root).forEach(b => gsap.fromTo(b, { width: 0 }, { width: b.dataset.w + '%', duration: 1.4, ease: 'power3.out' })); $$('[data-to]', root).forEach(el => counter(el, +el.dataset.to)); },
    notes: { idea: 'La ganadería pesa en la economía y el robo de ganado es real.', guion: ['Según Fedegán, en 2024 la ganadería bovina aportó el 1,4 % del PIB nacional, el 20 % del agropecuario y el 46 % del pecuario, con 29,5 millones de animales.', 'Entre 2010 y 2023 se denunciaron 33.650 casos de abigeato.', 'Hay sistemas oficiales, pero muchas fincas no tienen una plataforma propia para verificar quién es cada animal.'] },
  },
  {
    id: 'problema', block: B, title: 'Árbol del problema', spk: 'D', wide: true, shot: { rel: [-4.6, 1.2, 4.6], look: 'body', lookOff: [0, -0.2, 0], shift: 0.34, graze: true, dropTag: true },
    html: () => `<div class="tree-wrap">
      <div class="tree-head" data-a><div class="eyebrow">01 · El problema · haz clic en cada parte del árbol</div><h2>¿Por qué es difícil saber <em>quién es</em> cada animal?</h2></div>
      <div class="tree interactive" data-a>
        <svg class="tree-lines"></svg>
        <div class="t-row effects">${PROBLEM.effects.map((e, i) => `<button class="node eff" data-k="e${i}"><small>Efecto</small>${e.t}</button>`).join('')}</div>
        <div class="t-row"><button class="node core" data-k="core"><small>Problema central</small>${PROBLEM.core}</button></div>
        <div class="t-row causes">${PROBLEM.causes.map((c, i) => `<button class="node cau" data-k="c${i}"><small>Causa</small>${c.t}</button>`).join('')}</div>
        <div class="t-row"><button class="node root" data-k="root"><small>Causa raíz</small>${PROBLEM.root}</button></div>
      </div>
      <div class="tree-detail panel" data-a id="tree-detail"></div></div>`,
    mount(root) {
      const info = {
        root: ['Causa raíz', PROBLEM.root, 'Sin una plataforma propia, cada finca depende de procesos manuales y de marcas físicas.'],
        core: ['Problema central', PROBLEM.core, PROBLEM.coreDef],
        ...Object.fromEntries(PROBLEM.causes.map((c, i) => [`c${i}`, ['Causa', c.t, c.d]])),
        ...Object.fromEntries(PROBLEM.effects.map((e, i) => [`e${i}`, ['Efecto', e.t, `<b>Respuesta del proyecto:</b> ${e.r}.`]])),
      };
      const show = k => { const [a, b, c] = info[k]; $('#tree-detail').innerHTML = `<div class="eyebrow">${a}</div><h3>${b}</h3><p>${c}</p>`; $$('.node', root).forEach(n => n.classList.toggle('on', n.dataset.k === k)); };
      $$('.node', root).forEach(n => n.onclick = () => show(n.dataset.k)); show('core');
      const draw = () => {
        const svg = $('.tree-lines', root), T = $('.tree', root).getBoundingClientRect(), c = n => { const r = n.getBoundingClientRect(); return [r.left - T.left + r.width / 2, r.top - T.top, r.bottom - T.top]; };
        const core = c($('.core', root)), rt = c($('.root', root)); let d = '';
        $$('.eff', root).forEach(n => { const p = c(n); d += `M${core[0]},${core[1]} C${core[0]},${(core[1] + p[2]) / 2} ${p[0]},${(core[1] + p[2]) / 2} ${p[0]},${p[2]} `; });
        $$('.cau', root).forEach(n => { const p = c(n); d += `M${core[0]},${core[2]} C${core[0]},${(core[2] + p[1]) / 2} ${p[0]},${(core[2] + p[1]) / 2} ${p[0]},${p[1]} M${p[0]},${p[2]} C${p[0]},${(p[2] + rt[1]) / 2} ${rt[0]},${(p[2] + rt[1]) / 2} ${rt[0]},${rt[1]} `; });
        svg.setAttribute('viewBox', `0 0 ${T.width} ${T.height}`); svg.innerHTML = `<path d="${d}"/>`;
        const p = svg.querySelector('path'), L = p.getTotalLength(); gsap.fromTo(p, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.out' });
      };
      this._draw = draw; addEventListener('resize', () => root.classList.contains('on') && draw());
    },
    enter(root) { setTimeout(() => this._draw?.(), 450); gsap.fromTo($$('.node', root), { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, stagger: 0.05, duration: 0.5, delay: 0.3, ease: 'back.out(1.6)' }); },
    notes: { idea: 'Raíz: no hay plataforma propia. Centro: baja confiabilidad en la identificación. Arriba: los efectos.', guion: ['Las causas son los procesos manuales, la identificación invasiva —aretes que se pierden— y planillas que se pueden alterar.', 'Eso produce el problema central: baja confiabilidad para comprobar que un animal es quien se dice que es.', 'Los efectos son el robo, las pérdidas, los errores de trazabilidad y el control débil de la movilización. Al hacer clic en cada efecto se ve la respuesta que plantea el proyecto.'] },
  },
  {
    id: 'pregunta', block: B, title: 'Pregunta de investigación', spk: 'D', shot: { look: 'muzzle', rel: [0.9, 0.12, 1.4], lookOff: [0, -0.05, -0.5], shift: 0.24, headUp: true },
    html: () => `<div class="col">
      <div class="eyebrow" data-a>02 · La pregunta que guía todo · pasa el cursor por las palabras resaltadas</div>
      <p class="question-big interactive" data-a>¿<span class="kw" data-tip="«En qué medida» pide un número: por eso el enfoque es cuantitativo y se mide la tasa de acierto.">En qué medida</span> un <span class="kw" data-tip="Un prototipo: una primera versión funcional, no un producto comercial.">prototipo</span> basado en identificación naso-labial y en inteligencia artificial puede <span class="kw" data-tip="Identificar es «uno a muchos»: averiguar de quién es la foto entre todos los registrados (Y = ĉ, s, d).">identificar individualmente</span> a bovinos <span class="kw" data-tip="Solo los que tienen fotos de referencia guardadas (sesión S1). Si no está registrado, debe responder «no concluyente».">previamente registrados</span>, bajo <span class="kw" data-tip="Celular a unos 30 cm, de frente, sin flash, en manga o brete: el protocolo de captura.">condiciones controladas de captura</span>?</p>
      <div class="kw-out panel" id="kw-out" data-a><span class="sub">Cada parte de la pregunta explica una decisión del proyecto.</span></div></div>`,
    mount(root) { $$('.kw', root).forEach(k => { const f = () => { $('#kw-out').innerHTML = `<b>${k.textContent}</b><p>${k.dataset.tip}</p>`; $$('.kw', root).forEach(x => x.classList.toggle('on', x === k)); }; k.onmouseenter = f; k.onclick = f; }); },
    notes: { idea: 'La pregunta define el enfoque (cuantitativo) y lo que se mide.', guion: [QUESTION, '«En qué medida» exige medir; «previamente registrados» define la galería; «condiciones controladas» define el protocolo de captura.'] },
  },
  {
    id: 'justificacion', block: B, title: 'Justificación', spk: 'D', shot: { rel: [2.6, 0.5, 3.4], look: 'body', lookOff: [0, 0, 0.3], shift: 0.3 }, wide: true,
    html: () => `<div class="col wide">
      <div class="eyebrow" data-a>03 · ¿Por qué vale la pena?</div>
      <h2 data-a>A cada efecto del problema, una <em>respuesta</em>.</h2>
      <div class="pairs interactive" data-a>${PROBLEM.effects.map((e, i) => `<button class="pair" data-i="${i}"><span class="p-from">${e.t}</span><span class="p-arrow">→</span><span class="p-to">${e.r}</span></button>`).join('')}</div>
      <div class="benefits" data-a><span class="eyebrow">Beneficios esperados</span>${PROBLEM.benefits.map(b => `<span class="chip">${b}</span>`).join('')}</div>
      <p class="sub" data-a>Son beneficios <b>potenciales</b>: el proyecto no pretende demostrar por sí solo una reducción del abigeato o un aumento de la rentabilidad (limitación declarada en V27).</p></div>`,
    enter(root) { gsap.fromTo($$('.p-to', root), { opacity: 0, x: -20 }, { opacity: 1, x: 0, stagger: 0.25, duration: 0.6, delay: 0.6 }); },
    notes: { idea: 'La justificación responde a cada efecto del árbol.', guion: ['Frente al robo: identificación no invasiva con registro digital. Frente a las pérdidas: una aplicación web que centraliza el registro.', 'Frente a los errores de trazabilidad: ficha e historial. Frente a la movilización: registros más verificables.', 'Son beneficios esperados; el proyecto no demuestra por sí solo que baje el abigeato.'] },
  },
  {
    id: 'objetivos', block: B, title: 'Objetivos', spk: 'D', shot: { rel: [4.6, 1.1, 4.4], look: 'body', lookOff: [0, -0.2, 0], shift: 0.32, graze: true }, wide: true,
    html: () => `<div class="col wide">
      <div class="eyebrow" data-a>04 · ¿Qué queremos desarrollar? · haz clic en cada objetivo</div>
      <h2 data-a>${GENERAL_OBJECTIVE.replace('prototipo', '<em>prototipo</em>')}</h2>
      <ol class="steps5 interactive" data-a>${OBJECTIVES.map((o, i) => `<li><button data-i="${i}"><i>${i + 1}</i><b>${o.v}</b><span>${o.t.split(',')[0]}…</span></button></li>`).join('')}</ol>
      <div class="obj-detail panel" id="obj-detail" data-a></div></div>`,
    mount(root) {
      const show = i => { const o = OBJECTIVES[i]; $('#obj-detail').innerHTML = `<div class="od"><div><div class="eyebrow">Objetivo específico ${i + 1}</div><p><b>${o.v}</b> ${o.t}</p></div><div><small>Fase</small><b>${o.fase}</b><small>Actividades</small><span>${ACTIVITIES[i]}</span><small>Resultado</small><b>${o.res}</b></div></div>`; $$('.steps5 button', root).forEach((b, k) => b.classList.toggle('on', k === i)); };
      $$('.steps5 button', root).forEach(b => b.onclick = () => show(+b.dataset.i)); show(0);
    },
    notes: { idea: 'Un objetivo general y cinco específicos, uno por fase del proyecto (Tabla 7).', guion: ['Definir requerimientos, diseñar la arquitectura, codificar los módulos, hacer pruebas de sistema y de aceptación, y documentar.', 'Cada objetivo corresponde a una fase del modelo en cascada y deja un producto verificable.'] },
  },
];
