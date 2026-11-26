/* Bloque 4 · Tecnología — cómo funciona, arquitectura y simulador. */
import gsap from 'gsap';
import { TOOLS } from '../../shared/content.js';
import { C, $, $$, ICON } from '../core.js';
import { generateMuzzle } from '../../experience/biometric/muzzle.js';

const B = 'Tecnología';
const SIM = `${import.meta.env.BASE_URL}experience/`;

/** Cinco pasos con una animación propia cada uno (diapositiva «¿Cómo funciona?»). */
const FLOW = [
  ['Registro', 'Registramos cada bovino con cinco fotos de su hocico.', `<span class="fv-reg">${[0, 1, 2, 3, 4].map(k => `<canvas width="56" height="56" style="--k:${k}"></canvas>`).join('')}<em>BOV-003</em></span>`],
  ['Fotografía', 'Con el celular, de frente y a unos 30 cm.', '<span class="fv-cam"><span class="ph"><canvas width="70" height="70"></canvas><i class="c1"></i><i class="c2"></i><i class="c3"></i><i class="c4"></i><span class="flash"></span></span><em>30 cm</em></span>'],
  ['Análisis', 'ResNet50 resume el hocico en 2048 números.', '<span class="fv-ai"><canvas width="54" height="54"></canvas><span class="arrow"></span><span class="bars"></span></span>'],
  ['Comparación', 'Similitud coseno con todos los registrados.', '<span class="fv-cmp"><svg viewBox="0 0 120 90"><line x1="14" y1="78" x2="112" y2="78" class="ax"/><line x1="14" y1="78" x2="14" y2="6" class="ax"/><line class="v1" x1="14" y1="78" x2="100" y2="30"/><line class="v2" x1="14" y1="78" x2="70" y2="10"/><path class="arc" d="M44 62 A 34 34 0 0 0 38 52"/></svg><em>cos</em></span>'],
  ['Decisión', 'Si la semejanza alcanza el umbral θ, se asigna la identidad.', '<span class="fv-dec"><svg viewBox="0 0 120 70"><path class="g-bg" d="M12 62 A 48 48 0 0 1 108 62"/><path class="g-ok" d="M84 22 A 48 48 0 0 1 108 62"/><line class="th" x1="84" y1="22" x2="78" y2="31"/><line class="needle" x1="60" y1="62" x2="60" y2="20"/><circle cx="60" cy="62" r="4"/></svg><em>θ</em></span>'],
];
const FLOW_ANIM = [
  (v, g) => { g.fromTo($$('canvas', v), { x: 0, rotate: 0, opacity: 0 }, { x: k => (k - 2) * 20, rotate: k => (k - 2) * 7, opacity: 1, stagger: 0.08, duration: 0.6, ease: 'back.out(1.6)' }); g.fromTo($('em', v), { opacity: 0, y: 6 }, { opacity: 1, y: 0, delay: 0.6, duration: 0.3 }); },
  (v, g) => { g.fromTo($('.ph', v), { scale: 0.8 }, { scale: 1, duration: 0.5, ease: 'back.out(2)' }); g.fromTo($$('.ph i', v), { scale: 1.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, delay: 0.3 }); g.fromTo($('.flash', v), { opacity: 0 }, { opacity: 0.95, duration: 0.08, delay: 1.0, yoyo: true, repeat: 1 }); },
  (v, g) => { g.fromTo($('canvas', v), { x: 0, opacity: 1 }, { x: -6, duration: 0.4 }); g.fromTo($('.arrow', v), { scaleX: 0 }, { scaleX: 1, duration: 0.4, delay: 0.2, transformOrigin: '0 50%' }); g.fromTo($$('.bars i', v), { scaleY: 0 }, { scaleY: 1, stagger: 0.025, duration: 0.3, delay: 0.5 }); },
  (v, g) => { const v2 = $('.v2', v); g.fromTo(v2, { attr: { x2: 112, y2: 74 } }, { attr: { x2: 92, y2: 26 }, duration: 1.2, ease: 'power2.inOut' }); g.fromTo($('.arc', v), { opacity: 0 }, { opacity: 1, duration: 0.4, delay: 0.8 }); },
  (v, g) => { const n = $('.needle', v); g.fromTo(n, { rotation: -80, svgOrigin: '60 62' }, { rotation: 62, svgOrigin: '60 62', duration: 1.3, ease: 'elastic.out(1, .55)' }); },
];

/** Estaciones del recorrido de una foto por nuestra arquitectura (posición 0–1 sobre la pista). */
const STATIONS = [
  { t: 'Next.js', tool: 'Next.js', x: 0.03, what: 'En el celular: guía la captura a unos 30 cm, toma la foto y permite ajustar el recorte del hocico antes de enviarla.',
    viz: '<span class="v-phone"><canvas data-img="" width="120" height="120"></canvas><i class="v-crop"></i></span>',
    anim: (v, g) => g.fromTo($('.v-crop', v), { scale: 1.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, delay: 0.7, ease: 'power3.out' }) },
  { t: 'FastAPI', tool: 'FastAPI', x: 0.19, what: 'Recibe la foto con su recorte por REST y coordina cada paso del procesamiento.',
    viz: '<span class="v-req"><b>POST</b> /identificar<em>imagen + recorte</em></span>',
    anim: (v, g) => g.fromTo($('.v-req', v), { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, delay: 0.6, ease: 'power3.out' }) },
  { t: 'OpenCV', tool: 'OpenCV', x: 0.35, what: 'Lee y orienta la imagen, la recorta, la lleva a 224 × 224 píxeles y aplica CLAHE para resaltar perlas y surcos.',
    viz: '<span class="v-stack"><canvas data-img="" width="80" height="80"></canvas><canvas data-img="gray" width="80" height="80"></canvas><canvas data-img="eq" width="80" height="80"></canvas></span>',
    anim: (v, g) => g.fromTo($$('canvas', v), { x: 0, rotateY: 0 }, { x: (k) => k * 22, rotateY: -18, stagger: 0.25, duration: 0.7, delay: 0.6, ease: 'power2.out' }) },
  { t: 'Keras 3 · JAX', tool: 'Keras 3', x: 0.52, what: 'ResNet50 preentrenada con ImageNet, sin entrenamiento adicional, convierte el hocico en un vector de 2048 valores; JAX hace el cálculo en CPU.',
    viz: '<span class="v-net">' + [1, 0.86, 0.72, 0.58, 0.44].map((s, k) => `<i style="--s:${s};--k:${k}"></i>`).join('') + '<b>2048</b></span>',
    anim: (v, g) => { g.fromTo($$('.v-net i', v), { opacity: 0.25 }, { opacity: 1, stagger: 0.18, duration: 0.3, delay: 0.6, yoyo: true, repeat: 1 }); g.fromTo($('.v-net b', v), { opacity: 0, x: -10 }, { opacity: 1, x: 0, delay: 1.6, duration: 0.4 }); } },
  { t: 'NumPy · SciPy', tool: 'NumPy y SciPy', x: 0.69, what: 'Compara el vector con los de la galería por similitud coseno, elige el vecino más próximo (1-NN) y lo contrasta con el umbral θ.',
    viz: '<span class="v-cmp"><span class="vec"></span><span class="sims"><i style="--v:.42"></i><i style="--v:.55"></i><i class="best" style="--v:.93"></i><i style="--v:.48"></i><u></u></span></span>',
    anim: (v, g) => { g.fromTo($$('.vec i', v), { scaleY: 0 }, { scaleY: 1, stagger: 0.015, duration: 0.3, delay: 0.5 }); g.fromTo($$('.sims i', v), { scaleX: 0 }, { scaleX: 1, stagger: 0.12, duration: 0.5, delay: 1.0, ease: 'power3.out' }); } },
  { t: 'PostgreSQL', tool: 'PostgreSQL', x: 0.86, what: 'Guarda fichas, vectores de referencia, sesiones de captura, identificaciones e historial de cada animal.',
    viz: '<span class="v-db"><span class="cyl"></span><span class="rows"><i></i><i></i><i class="new"></i></span></span>',
    anim: (v, g) => g.fromTo($('.rows .new', v), { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, delay: 0.8, ease: 'back.out(2)' }) },
  { t: 'Respuesta', tool: 'Next.js', x: 0.99, what: 'El resultado vuelve al celular y queda en la ficha: identificado, no identificado o no concluyente.',
    viz: '<span class="v-res"><i class="ok"></i><i class="warn"></i><i class="tie"></i></span>',
    anim: (v, g) => g.fromTo($$('.v-res i', v), { scale: 0 }, { scale: 1, stagger: 0.2, duration: 0.5, delay: 0.6, ease: 'back.out(3)' }) },
];

export const TECNOLOGIA = [
  {
    id: 'funciona', block: B, title: '¿Cómo funciona?', spk: 'J', shot: { rel: [3.2, 0.9, 5.2], look: 'body', lookOff: [0, -0.55, 0], shift: 0 }, wide: true,
    html: () => `<div class="col center">
      <div class="eyebrow" data-a>6.2.3 a 6.2.6 · Marco teórico · ¿cómo funciona?</div>
      <h2 data-a>De una foto a una identidad, en cinco pasos.</h2>
      <div class="flow2 interactive" data-a>
        <div class="f2-track"><i class="f2-fill"></i><span class="f2-dot"></span></div>
        ${FLOW.map(([t, d, viz], i) => `<button class="f2" data-i="${i}"><span class="f2-n">${i + 1}</span><span class="f2-viz">${viz}</span><b>${t}</b><span class="f2-d">${d}</span></button>`).join('')}
      </div>
      <div class="decide" data-a><span class="s ok">s ≥ θ · identificado</span><span class="s warn">s &lt; θ · no concluyente (no registrado)</span><span class="s tie">empate · no concluyente</span></div></div>`,
    mount(root) {
      const seeds = [3, 3, 3, 3, 3], thumbs = $$('.fv-reg canvas, .fv-cam canvas, .fv-ai canvas', root);
      thumbs.forEach((c, k) => c.getContext('2d').drawImage(generateMuzzle(c.dataset.seed ? +c.dataset.seed : 3, 'pigmentado', 'limpio', 96).color, 0, 0, c.width, c.height));
      const r = (k => () => (k = (k * 16807) % 2147483647) / 2147483647)(11);
      $$('.fv-ai .bars', root).forEach(v => { v.innerHTML = Array.from({ length: 24 }, () => `<i style="--h:${(0.2 + r() * 0.8).toFixed(2)}"></i>`).join(''); });
      $$('.f2', root).forEach(b => b.onclick = () => { this._auto = false; this._act(root, +b.dataset.i); });
    },
    _act(root, i) {
      this._i = i; const cards = $$('.f2', root);
      cards.forEach((c, k) => { c.classList.toggle('on', k === i); c.classList.toggle('done', k < i); });
      const pct = i / (FLOW.length - 1) * 100; gsap.to($('.f2-fill', root), { width: pct + '%', duration: 0.7, ease: 'power2.inOut' }); gsap.to($('.f2-dot', root), { left: pct + '%', duration: 0.7, ease: 'power2.inOut' });
      FLOW_ANIM[i]($('.f2-viz', cards[i]), gsap);
      $$('.decide .s', root).forEach(x => x.classList.toggle('lit', i === 4 && x.classList.contains('ok')));
    },
    _loop(root) { clearTimeout(this._tm); if (!this._auto || !root.isConnected) return; this._act(root, ((this._i ?? -1) + 1) % FLOW.length); this._tm = setTimeout(() => this._loop(root), 2600); },
    enter(root) {
      this._auto = true; this._i = -1;
      gsap.fromTo($$('.f2', root), { y: 40, opacity: 0, rotateX: -30 }, { y: 0, opacity: 1, rotateX: 0, stagger: 0.12, duration: 0.7, ease: 'back.out(1.5)', clearProps: 'transform' });
      gsap.fromTo($$('.decide .s', root), { opacity: 0, y: 10 }, { opacity: 1, y: 0, stagger: 0.12, delay: 0.9, duration: 0.4 });
      clearTimeout(this._tm); this._tm = setTimeout(() => this._loop(root), 1100);
    },
    leave() { clearTimeout(this._tm); },
    notes: { idea: 'Registro, foto, análisis, comparación y decisión con umbral.', guion: ['Cada animal se registra con cinco fotos. Para identificarlo se toma una foto nueva, ResNet50 la convierte en 2048 números, se compara con todos los registrados y, si la semejanza alcanza el umbral, se asigna la identidad.'] },
  },
  {
    id: 'arquitectura', block: B, title: 'Arquitectura y herramientas', spk: 'J', wide: true, hide3d: true,
    html: () => `<div class="col wide">
      <div class="eyebrow" data-a>6.2.7 y 6.2.8 · La arquitectura que diseñamos · clic en cada herramienta</div>
      <h2 data-a>El celular solo necesita un <em>navegador</em> y la cámara.</h2>
      <div class="p3d interactive" data-a>
        <div class="p3d-lanes"><span style="--a:0;--b:1">Cliente · celular</span><span style="--a:1;--b:6">Servidor · sin GPU</span><span style="--a:6;--b:7">Datos</span></div>
        <div class="p3d-screen">${STATIONS.map((st, i) => `<div class="slot" data-i="${i}" style="--x:${st.x};--tx:${st.x < 0.1 ? -18 : st.x > 0.9 ? -82 : -50}%"><span class="vz">${st.viz}</span></div>`).join('')}</div>
        <div class="board">
          <svg class="track" viewBox="0 0 1000 120" preserveAspectRatio="none"><path id="trk" d="M30 102 C 150 92, 230 112, 340 102 S 540 92, 660 102 S 860 112, 975 102"/><path class="trk-on" pathLength="1" d="M30 102 C 150 92, 230 112, 340 102 S 540 92, 660 102 S 860 112, 975 102"/></svg>
          ${STATIONS.map((st, i) => `<button class="st" data-i="${i}" style="--x:${st.x}"><span class="plinth"><span class="top"><b>${st.t}</b></span><span class="front"></span></span></button>`).join('')}
          <span class="token"><canvas width="48" height="48"></canvas></span>
        </div>
        <div class="p3d-ctl"><button class="ibtn" id="p3d-play" title="Pausar o reanudar"><svg viewBox="0 0 24 24"><path d="M8 5v14M16 5v14"/></svg></button><div class="p3d-steps">${STATIONS.map((_, i) => `<i data-i="${i}"></i>`).join('')}</div></div>
      </div>
      <div class="tool-out panel" id="tool-out" data-a></div>
      <p class="sub" data-a>Comunicación REST entre el celular y el servidor; todo el procesamiento corre en CPU con herramientas gratuitas. ${C('r14', 'r65')}</p></div>`,
    mount(root) {
      // imágenes reales del recorrido: un hocico generado, su versión en gris y con contraste ecualizado
      const src = generateMuzzle(3, 'pigmentado', 'limpio', 160).color;
      const paintC = (c, f) => { const x = c.getContext('2d'); x.drawImage(src, 0, 0, c.width, c.height); if (!f) return; const d = x.getImageData(0, 0, c.width, c.height), a = d.data; let lo = 255, hi = 0; for (let i = 0; i < a.length; i += 4) { const g = a[i] * 0.299 + a[i + 1] * 0.587 + a[i + 2] * 0.114; a[i] = a[i + 1] = a[i + 2] = g; lo = Math.min(lo, g); hi = Math.max(hi, g); } if (f === 'eq') for (let i = 0; i < a.length; i += 4) { const v = (a[i] - lo) / (hi - lo + 1e-6); a[i] = a[i + 1] = a[i + 2] = Math.pow(v, 0.8) * 255; } x.putImageData(d, 0, 0); };
      $$('canvas[data-img]', root).forEach(c => paintC(c, c.dataset.img)); paintC($('.token canvas', root));
      // vector de 2048 valores (se muestran 32) y similitudes con la galería
      const r = (k => () => (k = (k * 16807) % 2147483647) / 2147483647)(7);
      $$('.vec', root).forEach(v => { v.innerHTML = Array.from({ length: 32 }, () => `<i style="--h:${(0.15 + r() * 0.85).toFixed(2)}"></i>`).join(''); });
      const show = i => {
        const t = TOOLS.find(x => x.t === STATIONS[i].tool);
        $('#tool-out').innerHTML = `<div class="to"><div><div class="eyebrow">${t.o}</div><h3>${STATIONS[i].t}</h3><p>${STATIONS[i].what}</p></div><div><small>Alternativa descartada</small><b>${t.alt}</b>${C(t.ref)}</div></div>`;
        gsap.fromTo('#tool-out .to > div', { opacity: 0, y: 8 }, { opacity: 1, y: 0, stagger: 0.08, duration: 0.35 });
      };
      this._run = { show, i: -1, playing: true };
      $$('.st', root).forEach(b => b.onclick = () => { this._run.playing = false; this._go(root, +b.dataset.i); setPlay(); });
      $$('.p3d-steps i', root).forEach(b => b.onclick = () => { this._run.playing = false; this._go(root, +b.dataset.i); setPlay(); });
      const setPlay = () => { $('#p3d-play', root).innerHTML = this._run.playing ? '<svg viewBox="0 0 24 24"><path d="M8 5v14M16 5v14"/></svg>' : '<svg viewBox="0 0 24 24"><path d="M7 5l12 7-12 7z"/></svg>'; };
      $('#p3d-play', root).onclick = () => { this._run.playing = !this._run.playing; setPlay(); if (this._run.playing) this._loop(root); };
    },
    /** Mueve la ficha (la foto) por la pista hasta la estación i y anima lo que hace esa herramienta. */
    _go(root, i) {
      const R = this._run, path = $('#trk', root), board = $('.board', root), tok = $('.token', root), L = path.getTotalLength(), bw = board.clientWidth, bh = board.clientHeight;
      const from = R.i < 0 ? 0 : STATIONS[R.i].x, to = STATIONS[i].x, o = { u: from };
      gsap.killTweensOf(o);
      gsap.to(o, { u: to, duration: R.i < 0 ? 0.01 : 0.9, ease: 'power2.inOut', onUpdate: () => { const p = path.getPointAtLength(L * o.u); tok.style.transform = `translate(${p.x / 1000 * bw - 24}px, ${p.y / 120 * bh - 24}px) translateZ(30px) rotateX(-40deg)`; } });
      $('.trk-on', root).style.strokeDashoffset = String(1 - to);
      R.i = i; $$('.st', root).forEach((s, k) => { s.classList.toggle('on', k === i); s.classList.toggle('done', k < i); }); $$('.p3d-steps i', root).forEach((s, k) => s.classList.toggle('on', k === i));
      $$('.slot', root).forEach((x, k) => x.classList.toggle('on', k === i)); const viz = $('.vz', $$('.slot', root)[i]);
      gsap.fromTo(viz, { opacity: 0, y: 16, scale: 0.85 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, delay: 0.55, ease: 'back.out(1.6)', clearProps: 'opacity,transform' });
      STATIONS[i].anim?.(viz, gsap); R.show(i);
    },
    _loop(root) {
      clearTimeout(this._tm); const R = this._run; if (!R.playing || !root.isConnected) return;
      this._go(root, (R.i + 1) % STATIONS.length); this._tm = setTimeout(() => this._loop(root), 3200);
    },
    enter(root) {
      this._run.i = -1; this._run.playing = true;
      gsap.fromTo($('.board', root), { rotateX: 68, opacity: 0 }, { rotateX: 40, opacity: 1, duration: 1.2, ease: 'power3.out' });
      gsap.fromTo($$('.st', root), { y: -60, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.09, duration: 0.6, delay: 0.3, ease: 'bounce.out' });
      clearTimeout(this._tm); this._tm = setTimeout(() => this._loop(root), 1400);
    },
    leave() { clearTimeout(this._tm); },
    notes: { idea: 'Seguir la foto por cada herramienta: así funciona nuestro prototipo por dentro.', guion: ['Next.js en el celular toma la foto y el recorte; FastAPI la recibe; OpenCV la prepara; Keras con JAX obtiene el vector con ResNet50; NumPy lo compara; PostgreSQL guarda el resultado y el historial.', 'No se necesita tarjeta gráfica. Cada herramienta tiene una alternativa descartada, documentada en la Tabla 12.'] },
  },
  {
    id: 'experiencia', block: B, title: 'El simulador', spk: 'J', shot: { rel: [1.1, 0.15, 1.5], look: 'muzzle', lookOff: [0, -0.05, -0.5], shift: 0.24, headUp: true },
    html: () => `<div class="col">
      <div class="eyebrow" data-a>Demostración</div>
      <h2 data-a>Ahora, <em>pruébalo</em> tú.</h2>
      <p class="lead" data-a>Construimos una finca 3D para mostrarlo: acércate a un bovino, fotografía su hocico y observa cómo el sistema lo compara con los animales registrados.</p>
      <div class="decide" data-a><span class="s ok">Identificado</span><span class="s warn">No identificado</span><span class="s tie">No concluyente</span></div>
      <p class="sub" data-a>Los animales son modelos 3D: es un <b>modo práctica</b>, no un resultado de la investigación.</p>
      <div class="row" data-a><a class="btn amber big" href="${SIM}">EXPLORAR EL SIMULADOR</a></div></div>`,
    enter(root) { gsap.fromTo($$('.decide .s', root), { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, stagger: 0.25, duration: 0.5, delay: 0.6, ease: 'back.out(2.2)' }); gsap.fromTo($('.btn.amber', root), { boxShadow: '0 0 0 0 rgba(200,146,46,.6)' }, { boxShadow: '0 0 0 18px rgba(200,146,46,0)', duration: 1.4, repeat: 2, delay: 1.4 }); },
    notes: { idea: 'Pasar a la demostración en vivo.', guion: ['En el simulador se camina por una finca, se fotografía el hocico de un bovino y se ve cómo el sistema lo analiza y decide.'] },
  },
];
