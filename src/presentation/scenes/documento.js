/* Diapositivas que siguen capítulos del documento: 3 · Justificación, 4.3 · Alcance
   y 7 · Aspectos administrativos. Poco texto: la explicación va en las notas. */
import gsap from 'gsap';
import { PROBLEM, SCOPE } from '../../shared/content.js';
import { $, $$, fmt } from '../core.js';

const ICO = {
  shield: '<path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
  app: '<rect x="6" y="3" width="12" height="18" rx="2.5"/><path d="M10 18h4"/><path d="M9 8h6M9 11h6M9 14h3"/>',
  trace: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.3 11l7.4-4M8.3 13l7.4 4"/>',
  check: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1"/><path d="M9 13l2 2 4-4"/>',
  reg: '<rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M6.5 16c.6-1.6 1.6-2.4 2.5-2.4s1.9.8 2.5 2.4M14 10h3M14 13h3"/>',
  cam: '<rect x="3" y="7" width="18" height="13" rx="3"/><path d="M8 7l1.5-3h5L16 7"/><circle cx="12" cy="13.5" r="3.6"/>',
  stats: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  dash: '<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="5" rx="1.5"/><rect x="13" y="10" width="8" height="11" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/>',
};
const svg = k => `<svg viewBox="0 0 24 24">${ICO[k]}</svg>`;
const SHORT_EFF = ['Robo y pérdidas', 'Pérdidas económicas', 'Trazabilidad con errores', 'Movilización sin control'];
const SHORT_RES = ['Identificación no invasiva por el hocico', 'Aplicación web que centraliza el registro', 'Ficha e historial de cada animal', 'Registros con foto, más verificables'];
const RES_ICO = ['shield', 'app', 'trace', 'check'];
const MOD_ICO = ['reg', 'cam', 'trace', 'stats', 'dash'];
const MOD_SHORT = ['10 a 20 bovinos con fotos de referencia', 'Foto con el celular → resultado y confianza', 'Vacunas, movimientos y ventas', 'Registrados, identificaciones y confianza', 'Indicadores en un solo panel'];
const OUT_SHORT = ['Muchos animales a la vez', 'Cámaras, drones o sensores', 'Integración oficial con SINIGAN', 'Reemplazar los sistemas oficiales', 'App nativa de tienda', 'Entrenar la red neuronal', 'Detector automático del hocico', 'Uso sin internet'];

/** Tabla 13 (V30) agrupada · valores en pesos colombianos */
const COST_GROUPS = [
  ['Conectividad', 1398400], ['Equipos de cómputo y captura', 1357732], ['Capacitación y bibliografía', 1337025],
  ['Nube y servicios web', 530124], ['Transporte a las fincas', 400000], ['Materiales de campo', 273660], ['Software y modelo', 0],
];
const COST_TOTAL = 5561788, COST_IMP = 264847;
/** Tabla 14 · quincenas 0 (mes 1, Q1) a 15 (mes 8, Q2) */
const GANTT14 = [
  ['Aprobación de la idea', [0]], ['OE1 · Requerimientos', [1, 2, 3]], ['OE2 · Diseño', [3, 4, 5]], ['OE3 · Codificación', [5, 6, 7, 8, 9, 10]],
  ['OE4 · Pruebas', [10, 11, 12, 13]], ['OE5 · Documentación', [12, 13, 14]], ['Entrega y sustentación', [15]],
];
const TEAM = [
  ['JA', 'John Alejandro Piedrahita Muñoz', 'Servidor, base de datos y módulo biométrico', 'J'],
  ['DF', 'Daniel Felipe Colorado Amaya', 'Interfaz web, celular y trabajo de campo', 'D'],
  ['AQ', 'Prof. Alexánder Quintero Quintero', 'Asesor temático', 'A'],
];
const peso = v => '$' + fmt(v);

export const DOCUMENTO = {
  justificacion: {
    id: 'justificacion', title: 'Justificación', spk: 'D', wide: true, shot: { rel: [4.2, 1.0, 4.6], look: 'body', lookOff: [0, -0.2, 0], shift: 0.36, graze: true },
    html: () => `<div class="col wide js-col">
      <div class="eyebrow" data-a>3 · Justificación de la investigación</div>
      <h2 data-a>Cada efecto del problema tiene una <em>respuesta</em>.</h2>
      <div class="js interactive" data-a>
        ${PROBLEM.effects.map((e, i) => `<button class="js-row" data-i="${i}" title="${e.t}"><span class="js-eff"><small>Efecto</small>${SHORT_EFF[i]}</span><span class="js-arr"><i></i></span><span class="js-res"><span class="js-ic">${svg(RES_ICO[i])}</span>${SHORT_RES[i]}</span></button>`).join('')}
        <svg class="js-lines" aria-hidden="true"></svg>
        <div class="js-goal"><small>Objetivo</small>Alta confiabilidad en la identificación</div>
      </div>
      <div class="js-ben" data-a><span class="eyebrow">Beneficios esperados</span>${PROBLEM.benefits.map(b => `<span class="chip">${b}</span>`).join('')}</div></div>`,
    mount(root) {
      const draw = () => {
        const box = $('.js', root), B = box.getBoundingClientRect(), g = $('.js-goal', root).getBoundingClientRect(), svgEl = $('.js-lines', root);
        if (getComputedStyle(svgEl).display === 'none') return;
        const gx = g.left - B.left, gy = g.top - B.top + g.height / 2;
        let d = ''; $$('.js-res', root).forEach(r => { const R = r.getBoundingClientRect(), x = R.right - B.left, y = R.top - B.top + R.height / 2; d += `M${x},${y} C${x + 36},${y} ${gx - 36},${gy} ${gx},${gy} `; });
        svgEl.setAttribute('viewBox', `0 0 ${B.width} ${B.height}`); svgEl.innerHTML = `<path d="${d}"/>`;
        const p = svgEl.querySelector('path'), L = p.getTotalLength(); gsap.fromTo(p, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: 1.4, delay: 1.6, ease: 'power2.inOut' });
      };
      this._draw = draw; addEventListener('resize', () => root.classList.contains('on') && draw());
      $$('.js-row', root).forEach(r => r.onclick = () => { $$('.js-row', root).forEach(x => x.classList.toggle('on', x === r)); });
    },
    enter(root) {
      const rows = $$('.js-row', root);
      gsap.fromTo($$('.js-eff', root), { opacity: 0, x: -24 }, { opacity: 1, x: 0, stagger: 0.18, duration: 0.5, delay: 0.3 });
      gsap.fromTo($$('.js-arr i', root), { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', stagger: 0.18, duration: 0.45, delay: 0.7, ease: 'power2.out' });
      gsap.fromTo($$('.js-res', root), { opacity: 0, rotateY: -70 }, { opacity: 1, rotateY: 0, stagger: 0.18, duration: 0.6, delay: 0.95, ease: 'back.out(1.6)' });
      gsap.fromTo($('.js-goal', root), { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.7, delay: 2.4, ease: 'back.out(2)' });
      gsap.fromTo($$('.js-ben .chip', root), { opacity: 0, y: 10 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.4, delay: 2.9 });
      rows.forEach(r => r.classList.remove('on'));
      setTimeout(() => this._draw?.(), 200);
    },
    notes: { idea: 'La justificación responde, uno por uno, a los cuatro efectos del árbol del problema.', guion: ['Frente al robo y las pérdidas, proponemos una identificación no invasiva por el hocico con registro digital; entre 2010 y 2023 se denunciaron 33.650 casos de abigeato.', 'Frente a las pérdidas por errores de registro, una aplicación web que centraliza el registro de los bovinos.', 'Frente a los errores de trazabilidad, una ficha con el historial de vacunas, movimientos y ventas.', 'Frente al control débil de la movilización, registros respaldados por una foto, más verificables. No reemplazamos SINIGAN: lo complementamos.', 'Todo apunta a una alta confiabilidad en la identificación. La reducción de robos o el aumento de la rentabilidad son beneficios esperados de una futura implementación; el prototipo no pretende demostrarlos por sí solo.'] },
  },

  alcance: {
    id: 'alcance', title: 'Alcance', spk: 'D', wide: true, shot: { rel: [3.4, 0.8, 4.4], look: 'body', lookOff: [0, -0.2, 0], shift: 0.36, graze: true },
    html: () => `<div class="col wide al-col">
      <div class="eyebrow" data-a>4.3 · Alcance</div>
      <h2 data-a>Lo que el prototipo <em>sí</em> hace y lo que no.</h2>
      <div class="al-tags" data-a><span>Prototipo académico</span><span>Web adaptable al celular</span><span>10 a 20 bovinos</span></div>
      <div class="al" data-a>
        <div class="al-in"><div class="al-h"><i class="ok"></i>Dentro · cinco módulos</div>
          <div class="al-phone"><div class="al-screen">${SCOPE.modules.map((m, i) => `<button class="al-m" data-i="${i}"><span class="al-ic">${svg(MOD_ICO[i])}</span><b>${m.t}</b><span class="al-d">${MOD_SHORT[i]}</span></button>`).join('')}</div></div></div>
        <div class="al-out"><div class="al-h"><i class="no"></i>Fuera del alcance</div>
          <ul>${OUT_SHORT.map(o => `<li><span>${o}</span></li>`).join('')}</ul></div>
      </div></div>`,
    mount(root) { $$('.al-m', root).forEach(m => m.onclick = () => { const on = m.classList.contains('on'); $$('.al-m', root).forEach(x => x.classList.remove('on')); if (!on) m.classList.add('on'); }); },
    enter(root) {
      gsap.fromTo($$('.al-tags span', root), { opacity: 0, y: -10 }, { opacity: 1, y: 0, stagger: 0.12, duration: 0.4, delay: 0.3 });
      gsap.fromTo($('.al-phone', root), { opacity: 0, y: 30, rotateX: 25 }, { opacity: 1, y: 0, rotateX: 0, duration: 0.8, delay: 0.4, ease: 'power3.out' });
      gsap.fromTo($$('.al-m', root), { opacity: 0, x: -20, scale: 0.92 }, { opacity: 1, x: 0, scale: 1, stagger: 0.14, duration: 0.5, delay: 0.8, ease: 'back.out(1.7)' });
      gsap.fromTo($$('.al-ic', root), { scale: 0, rotate: -40 }, { scale: 1, rotate: 0, stagger: 0.14, duration: 0.5, delay: 0.9, ease: 'back.out(3)' });
      const lis = $$('.al-out li', root);
      gsap.fromTo(lis, { opacity: 0, y: 8 }, { opacity: 1, y: 0, stagger: 0.08, duration: 0.4, delay: 1.4 });
      lis.forEach(l => l.classList.remove('x')); lis.forEach((l, i) => setTimeout(() => l.classList.add('x'), 1900 + i * 110));
      $$('.al-m', root).forEach(x => x.classList.remove('on'));
    },
    notes: { idea: 'Es un prototipo académico, web y adaptable al celular; no reemplaza los sistemas oficiales.', guion: ['Dentro del alcance hay cinco módulos: registro y gestión de entre 10 y 20 bovinos, identificación biométrica con la cámara del celular y un nivel de confianza, trazabilidad con la ficha y el historial, estadísticas e informes, y un dashboard que reúne los indicadores.', 'Quedan fuera: reconocer muchos animales a la vez, cámaras o drones, la integración oficial con SINIGAN, una app nativa, entrenar la red, un detector automático del hocico y el uso sin internet.'] },
  },

  administrativos: {
    id: 'administrativos', title: 'Aspectos administrativos', spk: 'DJ', wide: true, hide3d: true,
    html: () => `<div class="col wide ad-col">
      <div class="eyebrow" data-a>7 · Aspectos administrativos</div>
      <h2 data-a>Dos estudiantes, un asesor y <em>ocho meses</em> de trabajo.</h2>
      <div class="ad" data-a>
        <div class="ad-left">
          <div class="ad-team">${TEAM.map(([ini, n, r, k]) => `<div class="ad-p ${k}"><span class="ad-av">${ini}</span><div><b>${n}</b><span>${r}</span></div></div>`).join('')}</div>
          <div class="ad-cost panel"><div class="ad-tot"><small>Costo total estimado · Tabla 13</small><b class="ad-num" data-to="${COST_TOTAL}">$0</b><span>Incluye ${peso(COST_IMP)} de imprevistos (5 %) · sin mano de obra</span></div>
            <div class="ad-bars">${COST_GROUPS.map(([g, v]) => `<div class="ad-bar"><span>${g}</span><div><i style="--w:${(v / COST_GROUPS[0][1] * 100).toFixed(1)}%"></i></div><b>${v ? peso(v) : '$0'}</b></div>`).join('')}</div></div>
        </div>
        <div class="ad-gantt panel"><div class="eyebrow">Cronograma por meses · Tabla 14</div>
          <div class="gt"><div class="gt-h"><span></span><div class="gt-m">${Array.from({ length: 8 }, (_, m) => `<span><b>Mes </b>${m + 1}</span>`).join('')}</div></div>
            ${GANTT14.map(([t, q], r) => `<div class="gt-r${r === GANTT14.length - 1 ? ' last' : ''}"><span class="gt-t">${t}</span><div class="gt-track">${Array.from({ length: 16 }, (_, k) => `<i class="${q.includes(k) ? 'on' : ''}" style="--k:${k}"></i>`).join('')}</div></div>`).join('')}</div></div>
      </div></div>`,
    enter(root) {
      gsap.fromTo($$('.ad-p', root), { opacity: 0, y: 16 }, { opacity: 1, y: 0, stagger: 0.12, duration: 0.5, delay: 0.3 });
      gsap.fromTo($$('.ad-av', root), { scale: 0 }, { scale: 1, stagger: 0.12, duration: 0.5, delay: 0.4, ease: 'back.out(3)' });
      const n = $('.ad-num', root), o = { v: 0 }; gsap.to(o, { v: +n.dataset.to, duration: 2, delay: 0.6, ease: 'power2.out', onUpdate: () => { n.textContent = peso(Math.round(o.v)); } });
      gsap.fromTo($$('.ad-bar i', root), { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', stagger: 0.1, duration: 0.9, delay: 0.8, ease: 'power3.out' });
      $$('.gt-r', root).forEach((r, i) => gsap.fromTo($$('i.on', r), { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, transformOrigin: '0 50%', stagger: 0.05, duration: 0.35, delay: 0.9 + i * 0.28, ease: 'power2.out' }));
    },
    notes: { idea: 'Quiénes hacen el proyecto, cuánto cuesta y en cuánto tiempo.', guion: ['Alejandro se encarga del servidor, la base de datos y el módulo biométrico; Daniel, de la interfaz web, el celular y el trabajo de campo. Los dos participan en los cinco objetivos y revisan el trabajo del otro.', 'Nuestro asesor temático es el profesor Alexánder Quintero Quintero, por su formación en instrumentación, redes y servicios telemáticos y gerencia de proyectos.', 'El costo total estimado es de $5.561.788, unos $695.000 al mes: lo que más pesa es la conectividad, el uso de los equipos y la capacitación. El software y la red preentrenada no cuestan.', 'El cronograma tiene ocho meses por quincenas: aprobación de la idea, los cinco objetivos en cascada con un pequeño traslape, y la entrega y sustentación en la última quincena.'] },
  },
};
