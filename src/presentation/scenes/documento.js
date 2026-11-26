/* Diapositivas que siguen capítulos del documento: 2 · Planteamiento y efectos,
   3 · Justificación, 4.3 · Alcance y 7 · Aspectos administrativos.
   Poco texto en pantalla: la explicación completa va en las notas del expositor. */
import gsap from 'gsap';
import { PROBLEM, SCOPE } from '../../shared/content.js';
import { C, $, $$, fmt } from '../core.js';
import { generateMuzzle } from '../../experience/biometric/muzzle.js';

const EFF_SHORT = ['Robo y pérdidas (abigeato)', 'Pérdidas económicas', 'Errores de trazabilidad', 'Movilización sin control'];
const EFF_WHY = [
  ['Sin una forma confiable de comprobar a quién pertenece un animal, es más difícil demostrar la propiedad o sustentar una denuncia. Entre 2010 y 2023 se denunciaron 33.650 casos de abigeato.', ['r61']],
  ['Cada dato mal anotado o planilla extraviada cuesta. En 2024, la faena clandestina equivalió a poco más de 1,3 millones de animales.', ['r11']],
  ['Sin un historial confiable es difícil asociar a cada animal sus vacunas, movimientos y ventas.', ['r06']],
  ['Con registros dispersos es difícil verificar el origen y el destino de un animal cuando se traslada entre fincas.', ['r06']],
];
const RES_SHORT = ['Identificación no invasiva por el hocico', 'Aplicación web que centraliza el registro', 'Ficha e historial de cada animal', 'Registros con foto, más verificables'];
const MOD_SHORT = ['Registro', 'Identificación', 'Trazabilidad', 'Estadísticas', 'Dashboard'];
const OUT_SHORT = ['Muchos animales a la vez', 'Drones o cámaras fijas', 'Integración con SINIGAN', 'Reemplazar lo oficial', 'App de tienda', 'Entrenar la red', 'Detector automático', 'Uso sin internet'];
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


/** Pequeñas pantallas del celular para cada módulo del alcance (sin textos largos). */
const SCREENS = [
  `<div class="sc sc-reg"><div class="sc-h">Bovinos <i>19</i></div>${['A01', 'A02', 'B07'].map((c, k) => `<div class="sc-row" style="--k:${k}"><span class="sc-av"></span><b>BOV-${c}</b><span class="sc-ph">${'<i></i>'.repeat(5)}</span></div>`).join('')}<span class="sc-fab">+</span></div>`,
  `<div class="sc sc-id"><div class="sc-cam"><canvas width="120" height="120"></canvas><i class="c1"></i><i class="c2"></i><i class="c3"></i><i class="c4"></i><span class="sc-scan"></span></div><div class="sc-res"><b>BOV-A03</b><span>Identificado</span><em>0,94</em></div></div>`,
  `<div class="sc sc-tr"><div class="sc-h">BOV-A03</div>${[['Vacuna', 'ok'], ['Movimiento', 'mv'], ['Venta', 'sl']].map(([e, c], k) => `<div class="sc-ev ${c}" style="--k:${k}"><i></i><b>${e}</b></div>`).join('')}</div>`,
  `<div class="sc sc-st"><div class="sc-h">Identificaciones</div><div class="sc-bars">${[0.5, 0.8, 0.65, 0.95, 0.75].map((v, k) => `<i style="--v:${v};--k:${k}"></i>`).join('')}</div><div class="sc-kpi"><b>0,91</b><span>confianza promedio</span></div></div>`,
  `<div class="sc sc-db">${[['19', 'bovinos'], ['42', 'consultas'], ['3', 'alertas'], ['0,91', 'confianza']].map(([n, l], k) => `<div class="sc-t" style="--k:${k}"><b>${n}</b><span>${l}</span></div>`).join('')}</div>`,
];

export const DOCUMENTO = {
  planteamiento: {
    id: 'planteamiento', title: 'Planteamiento del problema', spk: 'D', wide: true, shot: { rel: [-4.2, 1.1, 4.6], look: 'body', lookOff: [0, -0.2, 0], shift: 0.36, graze: true },
    html: () => `<div class="col wide pl-col">
      <div class="eyebrow" data-a>2 · Planteamiento del problema</div>
      <h2 data-a>Planteamiento del <em>problema</em></h2>
      <div class="pl" data-a>
        <div class="pl-vis" aria-hidden="true"><svg viewBox="0 0 220 190">
          <path class="pl-cow" d="M60 70c-14-4-30-2-38 8 10 4 22 6 34 4M160 70c14-4 30-2 38 8-10 4-22 6-34 4M62 58c10-24 86-24 96 0 8 22 8 54-2 78-6 14-20 26-46 26s-40-12-46-26c-10-24-10-56-2-78z"/>
          <ellipse class="pl-muz" cx="110" cy="140" rx="32" ry="20"/><circle class="pl-n" cx="98" cy="140" r="4"/><circle class="pl-n" cx="122" cy="140" r="4"/><circle class="pl-eye" cx="88" cy="92" r="4"/><circle class="pl-eye" cx="132" cy="92" r="4"/>
          <g class="pl-tag"><path d="M190 80l12 4v20l-12 4z"/><text x="194" y="97">012</text></g>
          <g class="pl-q"><circle cx="110" cy="34" r="20"/><text x="110" y="42">?</text></g></svg>
          <div class="pl-id"><span>Identidad asignada</span><b class="pl-code">BOV-012</b></div></div>
        <div class="pl-card"><small>Problema central</small><b class="pl-core">Baja confiabilidad en la identificación de ganado bovino</b>
          <p>No es fácil comprobar con seguridad que un animal corresponde realmente a la identidad que se le asignó.</p>
          <div class="pl-facts"><span><b>29,5 M</b> bovinos en Colombia</span><span><b>Sin</b> plataforma propia en muchas fincas</span></div>${C('r11', 'r06', 'r07')}</div>
      </div></div>`,
    enter(root) {
      const paths = $$('.pl-vis path, .pl-vis ellipse, .pl-vis circle', root);
      paths.forEach(p => { const L = p.getTotalLength ? p.getTotalLength() : 100; gsap.fromTo(p, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: 1.4, delay: 0.3, ease: 'power2.out' }); });
      const tag = $('.pl-tag', root), q = $('.pl-q', root), code = $('.pl-code', root);
      gsap.set(tag, { rotation: 0, y: 0, opacity: 1, transformOrigin: '190px 80px' }); gsap.set(q, { scale: 0, transformOrigin: '110px 34px' }); code.textContent = 'BOV-012'; code.classList.remove('lost');
      this._tl?.kill(); const tl = this._tl = gsap.timeline({ delay: 1.4 });
      tl.to(tag, { rotation: 14, duration: 0.25, yoyo: true, repeat: 3, ease: 'sine.inOut' })
        .to(tag, { y: 120, rotation: 70, opacity: 0, duration: 0.9, ease: 'power2.in' })
        .to({ v: 0 }, { v: 1, duration: 0.8, ease: 'none', onUpdate: () => { code.textContent = 'BOV-' + String(Math.floor(Math.random() * 900 + 100)); }, onComplete: () => { code.textContent = 'BOV-¿?'; code.classList.add('lost'); } })
        .to(q, { scale: 1, duration: 0.6, ease: 'back.out(3)' }, '+=0.7');
      gsap.fromTo($('.pl-card', root), { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.7, delay: 0.5 });
      gsap.fromTo($('.pl-core', root), { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.2, delay: 0.9, ease: 'power2.inOut' });
      gsap.fromTo($$('.pl-facts span', root), { opacity: 0, y: 10 }, { opacity: 1, y: 0, stagger: 0.15, duration: 0.45, delay: 2.2 });
    },
    notes: { idea: 'El problema central: baja confiabilidad para comprobar que un animal es quien se dice que es.', guion: ['En Colombia hay 29,5 millones de bovinos y la ganadería aporta el 46 % del PIB pecuario; identificar a cada animal es clave para el control sanitario, la comercialización y la prevención del abigeato.', 'Existen sistemas oficiales como SINIGAN, pero muchas fincas no tienen una plataforma tecnológica propia para apoyar y verificar la identificación: dependen de planillas, aretes que se pierden y registros en papel que se pueden alterar.', 'Eso produce el problema central: la baja confiabilidad en la identificación, es decir, la dificultad para comprobar con seguridad que un animal corresponde a la identidad que se le asignó.'] },
  },

  efectos: {
    id: 'efectos', title: 'Efectos del problema', spk: 'D', wide: true, hide3d: true,
    html: () => `<div class="col wide ef-col">
      <div class="eyebrow" data-a>2 · Planteamiento del problema · efectos · clic en cada uno</div>
      <h2 data-a>Lo que provoca el <em>problema</em>.</h2>
      <div class="ef interactive" data-a>
        <div class="ef-core"><small>Problema central</small><b>Baja confiabilidad en la identificación</b><span class="ef-ring"></span></div>
        <svg class="ef-lines" aria-hidden="true"></svg>
        <div class="ef-list">${EFF_SHORT.map((t, i) => `<button class="ef-i" data-i="${i}"><i>${i + 1}</i><b>${t}</b></button>`).join('')}</div>
      </div>
      <div class="ef-why panel" id="ef-why" data-a></div></div>`,
    mount(root) {
      const show = i => { $$('.ef-i', root).forEach((b, k) => b.classList.toggle('on', k === i)); $$('.ef-lines path', root).forEach((p, k) => p.classList.toggle('on', k === i)); $('#ef-why').innerHTML = `<div class="eyebrow">Efecto ${i + 1}</div><h3>${PROBLEM.effects[i].t}</h3><p>${EFF_WHY[i][0]}</p>${C(...EFF_WHY[i][1])}`; gsap.fromTo('#ef-why > *', { opacity: 0, y: 8 }, { opacity: 1, y: 0, stagger: 0.06, duration: 0.35 }); };
      this._show = show; $$('.ef-i', root).forEach(b => b.onclick = () => { clearInterval(this._auto); show(+b.dataset.i); });
      const draw = () => {
        const box = $('.ef', root), B = box.getBoundingClientRect(), c = $('.ef-core', root).getBoundingClientRect(), svgEl = $('.ef-lines', root);
        if (getComputedStyle(svgEl).display === 'none') return [];
        const x0 = c.right - B.left, y0 = c.top - B.top + c.height / 2;
        svgEl.setAttribute('viewBox', `0 0 ${B.width} ${B.height}`);
        svgEl.innerHTML = $$('.ef-i', root).map(b => { const r = b.getBoundingClientRect(), x = r.left - B.left, y = r.top - B.top + r.height / 2; return `<path d="M${x0},${y0} C${x0 + 60},${y0} ${x - 60},${y} ${x},${y}"/>`; }).join('');
        return $$('path', svgEl);
      };
      this._draw = draw; addEventListener('resize', () => root.classList.contains('on') && draw());
    },
    enter(root) {
      clearInterval(this._auto);
      gsap.fromTo($('.ef-core', root), { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7, delay: 0.3, ease: 'back.out(1.8)' });
      gsap.fromTo($$('.ef-i', root), { opacity: 0, y: 16 }, { opacity: 0, y: 16 });
      setTimeout(() => {
        const paths = this._draw?.() || [], items = $$('.ef-i', root);
        items.forEach((it, i) => {
          const p = paths[i];
          if (p) { const L = p.getTotalLength(); gsap.fromTo(p, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: 0.6, delay: i * 0.35, ease: 'power2.out' }); }
          gsap.to(it, { opacity: 1, y: 0, duration: 0.5, delay: 0.35 + i * 0.35, ease: 'back.out(1.6)' });
        });
        this._show(0); let k = 0; this._auto = setInterval(() => { if (!root.classList.contains('on')) return clearInterval(this._auto); k = (k + 1) % 4; this._show(k); }, 3800);
      }, 500);
    },
    leave() { clearInterval(this._auto); },
    notes: { idea: 'Cada efecto nace del problema central; son cuatro y se relacionan con la justificación.', guion: ['Primero, la mayor vulnerabilidad ante pérdidas y robo: sin forma de comprobar la propiedad, es más difícil denunciar o recuperar un animal. Entre 2010 y 2023 hubo 33.650 denuncias de abigeato.', 'Segundo, las pérdidas económicas por robo, errores de registro y gestión.', 'Tercero, los errores en la trazabilidad sanitaria, productiva y comercial: vacunas, movimientos y ventas mal asociados.', 'Cuarto, las limitaciones para controlar la movilización: es difícil verificar origen y destino.'] },
  },

  justificacion: {
    id: 'justificacion', title: 'Justificación', spk: 'D', wide: true, hide3d: true,
    html: () => `<div class="col wide jf-col">
      <div class="eyebrow" data-a>3 · Justificación · clic en cada tarjeta para girarla</div>
      <h2 data-a>Cada efecto tiene una <em>respuesta</em>.</h2>
      <div class="jf interactive" data-a>
        <div class="jf-cards">${EFF_SHORT.map((t, i) => `<button class="jf-c" data-i="${i}"><span class="jf-in"><span class="jf-f"><small>Efecto ${i + 1}</small><b>${t}</b><em>↻</em></span><span class="jf-b"><small>Respuesta</small><b>${RES_SHORT[i]}</b></span></span></button>`).join('')}</div>
        <svg class="jf-lines" aria-hidden="true"></svg>
        <div class="jf-goal"><small>Objetivo</small><b>Alta confiabilidad en la identificación</b><span class="jf-fill"><i></i></span></div>
      </div>
      <div class="js-ben" data-a><span class="eyebrow">Beneficios esperados</span>${PROBLEM.benefits.map(b => `<span class="chip">${b}</span>`).join('')}</div></div>`,
    mount(root) {
      $$('.jf-c', root).forEach(c => c.onclick = () => c.classList.toggle('flip'));
      const draw = () => {
        const box = $('.jf', root), B = box.getBoundingClientRect(), g = $('.jf-goal', root).getBoundingClientRect(), svgEl = $('.jf-lines', root);
        if (getComputedStyle(svgEl).display === 'none') return [];
        const gx = g.left - B.left + g.width / 2, gy = g.top - B.top;
        svgEl.setAttribute('viewBox', `0 0 ${B.width} ${B.height}`);
        svgEl.innerHTML = $$('.jf-c', root).map(c => { const r = c.getBoundingClientRect(), x = r.left - B.left + r.width / 2, y = r.bottom - B.top; return `<path d="M${x},${y} C${x},${(y + gy) / 2} ${gx},${(y + gy) / 2} ${gx},${gy}"/>`; }).join('') + '<circle class="jf-dot" r="6"/>';
        return $$('path', svgEl);
      };
      this._draw = draw; addEventListener('resize', () => root.classList.contains('on') && draw());
    },
    enter(root) {
      const cards = $$('.jf-c', root), fill = $('.jf-fill i', root);
      cards.forEach(c => c.classList.remove('flip')); gsap.set(fill, { scaleX: 0 }); gsap.killTweensOf(cards);
      gsap.fromTo(cards, { opacity: 0, y: 40, rotateX: -50 }, { opacity: 1, y: 0, rotateX: 0, stagger: 0.12, duration: 0.6, delay: 0.25, ease: 'back.out(1.5)', clearProps: 'transform' });
      gsap.fromTo($('.jf-goal', root), { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.6, delay: 0.6, ease: 'back.out(2)' });
      gsap.fromTo($$('.js-ben .chip', root), { opacity: 0, scale: 0.6 }, { opacity: 0, scale: 0.6 });
      setTimeout(() => {
        const paths = this._draw?.() || [], dot = $('.jf-dot', root), tl = gsap.timeline();
        paths.forEach(p => { const L = p.getTotalLength(); gsap.set(p, { strokeDasharray: L, strokeDashoffset: L }); });
        cards.forEach((c, i) => {
          tl.call(() => c.classList.add('flip'), null, i * 1.1);
          const p = paths[i];
          if (p) {
            const L = p.getTotalLength(), o = { t: 0 };
            tl.to(p, { strokeDashoffset: 0, duration: 0.6, ease: 'power1.inOut' }, i * 1.1 + 0.35)
              .to(o, { t: 1, duration: 0.6, ease: 'power1.inOut', onStart: () => gsap.set(dot, { opacity: 1 }), onUpdate: () => { const pt = p.getPointAtLength(o.t * L); dot.setAttribute('cx', pt.x); dot.setAttribute('cy', pt.y); }, onComplete: () => gsap.set(dot, { opacity: 0 }) }, i * 1.1 + 0.35);
          }
          tl.to(fill, { scaleX: (i + 1) / cards.length, duration: 0.4, ease: 'power2.out' }, i * 1.1 + 0.95);
        });
        tl.call(() => $('.jf-goal', root).classList.add('lit'))
          .to($$('.js-ben .chip', root), { opacity: 1, scale: 1, stagger: 0.1, duration: 0.45, ease: 'back.out(2.4)' });
      }, 1100);
      $('.jf-goal', root).classList.remove('lit');
    },
    notes: { idea: 'La justificación responde, uno por uno, a los cuatro efectos.', guion: ['Frente al robo y las pérdidas, una identificación no invasiva por el hocico con registro digital.', 'Frente a las pérdidas por errores de registro, una aplicación web que centraliza el registro de los bovinos.', 'Frente a los errores de trazabilidad, una ficha con el historial de vacunas, movimientos y ventas.', 'Frente al control débil de la movilización, registros respaldados por una foto, más verificables. No reemplazamos SINIGAN: lo complementamos.', 'Todo apunta a una alta confiabilidad en la identificación. La reducción de robos o el aumento de la rentabilidad son beneficios esperados de una futura implementación; el prototipo no pretende demostrarlos por sí solo.'] },
  },

  alcance: {
    id: 'alcance', title: 'Alcance', spk: 'D', wide: true, hide3d: true,
    html: () => `<div class="col wide ap-col">
      <div class="eyebrow" data-a>4.3 · Alcance · clic en cada módulo</div>
      <h2 data-a>Un prototipo web, en el <em>celular</em>.</h2>
      <div class="al-tags" data-a><span>Prototipo académico</span><span>Se abre en el navegador</span><span>10 a 20 bovinos</span></div>
      <div class="ap interactive" data-a>
        <div class="ap-mods">${SCOPE.modules.map((m, i) => `<button class="ap-m" data-i="${i}"><i>${i + 1}</i><span><b>${MOD_SHORT[i]}</b><small>${m.t}</small></span><u></u></button>`).join('')}</div>
        <div class="ap-phone"><div class="ap-notch"></div><div class="ap-scr">${SCREENS.map((h, i) => `<div class="ap-s" data-i="${i}">${h}</div>`).join('')}</div></div>
        <div class="ap-out"><div class="al-h"><i class="no"></i>No incluye</div><div class="ap-chips">${OUT_SHORT.map(o => `<span>${o}</span>`).join('')}</div></div>
      </div></div>`,
    mount(root) {
      const cv = $('.sc-id canvas', root); if (cv) cv.getContext('2d').drawImage(generateMuzzle(5, 'pigmentado', 'limpio', 160).color, 0, 0, cv.width, cv.height);
      const show = i => {
        this._i = i;
        $$('.ap-m', root).forEach((b, k) => { b.classList.toggle('on', k === i); });
        $$('.ap-s', root).forEach((s, k) => { s.classList.toggle('on', k === i); if (k !== i) { gsap.killTweensOf(s); gsap.set(s, { opacity: 0 }); } });
        const s = $$('.ap-s', root)[i];
        gsap.fromTo(s, { opacity: 0, y: 18, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'power2.out' });
        gsap.fromTo($$('.sc-row, .sc-ev, .sc-t, .sc-bars i, .sc-res, .sc-fab', s), { opacity: 0, y: 10 }, { opacity: 1, y: 0, stagger: 0.08, duration: 0.35, delay: 0.15 });
        if (i === 3) gsap.fromTo($$('.sc-bars i', s), { scaleY: 0 }, { scaleY: 1, transformOrigin: '50% 100%', stagger: 0.08, duration: 0.5, delay: 0.2, ease: 'back.out(1.6)' });
        if (i === 1) { gsap.fromTo($('.sc-scan', s), { top: '8%' }, { top: '88%', duration: 0.9, repeat: 1, yoyo: true, ease: 'sine.inOut' }); gsap.fromTo($('.sc-res', s), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4, delay: 1.7, ease: 'back.out(2)' }); }
        const bar = $$('.ap-m u', root)[i]; gsap.killTweensOf($$('.ap-m u', root)); gsap.set($$('.ap-m u', root), { scaleX: 0 });
        if (this._autoOn) gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 3, ease: 'none', transformOrigin: '0 50%' });
      };
      this._show = show;
      $$('.ap-m', root).forEach(b => b.onclick = () => { this._autoOn = false; clearInterval(this._auto); show(+b.dataset.i); });
    },
    enter(root) {
      clearInterval(this._auto); this._autoOn = true;
      gsap.fromTo($$('.al-tags span', root), { opacity: 0, y: -10 }, { opacity: 1, y: 0, stagger: 0.12, duration: 0.4, delay: 0.3 });
      gsap.fromTo($('.ap-phone', root), { opacity: 0, y: 40, rotate: -6 }, { opacity: 1, y: 0, rotate: 0, duration: 0.9, delay: 0.3, ease: 'back.out(1.4)' });
      gsap.fromTo($$('.ap-m', root), { opacity: 0, x: -24 }, { opacity: 1, x: 0, stagger: 0.1, duration: 0.45, delay: 0.5, ease: 'power2.out' });
      gsap.fromTo($$('.ap-chips span', root), { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, stagger: 0.07, duration: 0.4, delay: 1.1, ease: 'back.out(2.5)' });
      setTimeout(() => $$('.ap-chips span', root).forEach((c, i) => setTimeout(() => c.classList.add('x'), i * 90)), 1700);
      $$('.ap-chips span', root).forEach(c => c.classList.remove('x'));
      this._show(0); let k = 0;
      this._auto = setInterval(() => { if (!root.classList.contains('on') || !this._autoOn) return clearInterval(this._auto); k = (k + 1) % 5; this._show(k); }, 3000);
    },
    leave() { clearInterval(this._auto); },
    notes: { idea: 'Es un prototipo académico, web y adaptable al celular; no reemplaza los sistemas oficiales.', guion: ['El usuario abre la aplicación en el navegador del celular, toma la foto del hocico y obtiene la identificación.', 'Tiene cinco módulos: registro y gestión de entre 10 y 20 bovinos con fotos de referencia; identificación biométrica con la cámara y un nivel de confianza; trazabilidad con la ficha y el historial de vacunas, movimientos y ventas; estadísticas e informes; y un dashboard que reúne los indicadores.', 'No incluye reconocer muchos animales a la vez, drones o cámaras fijas, la integración oficial con SINIGAN, reemplazar los sistemas oficiales, una app de tienda, entrenar la red, un detector automático del hocico ni el uso sin internet.'] },
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
