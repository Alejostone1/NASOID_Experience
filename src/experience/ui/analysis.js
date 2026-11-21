/* =============================================================================
   ANÁLISIS BIOMÉTRICO ANIMADO — cuatro etapas conectadas a la lógica real:
   A · preparación (recorte y 224 × 224 medidos)        → preprocess.js
   B · características (ResNet50 ejecutándose de verdad) → extractor.js
   C · comparación con la galería (coseno, 1-NN)          → engine.js
   D · resultado con la regla de decisión de V27
   La animación nunca decide nada: solo muestra lo que devolvió el motor.
   ============================================================================= */
import gsap from 'gsap';
import { $, $$, h, esc, show, hide, fmt, sleep } from './dom.js';
import { embed, MODEL_INFO, loadModel, isReady } from '../biometric/extractor.js';
import { identify, STATES } from '../biometric/engine.js';
import { photoURL } from '../biometric/db.js';

const STEPS = [['A', 'Preparando fotografía'], ['B', 'Analizando características'], ['C', 'Comparando con registrados'], ['D', 'Resultado']];

function colorRamp(t) { // marfil → salvia → bosque → ámbar
  const stops = [[246, 242, 232], [180, 199, 160], [79, 122, 69], [200, 146, 46]];
  t = Math.max(0, Math.min(0.999, t)) * (stops.length - 1); const i = Math.floor(t), f = t - i, a = stops[i], b = stops[i + 1];
  return a.map((v, k) => Math.round(v + (b[k] - v) * f));
}
function mapCanvas(map, size) {
  const { data, size: n } = map; let mn = Infinity, mx = -Infinity; for (const v of data) { mn = Math.min(mn, v); mx = Math.max(mx, v); }
  const c = document.createElement('canvas'); c.width = c.height = n; const x = c.getContext('2d'), im = x.createImageData(n, n);
  for (let i = 0; i < n * n; i++) { const t = (data[i] - mn) / ((mx - mn) || 1), [r, g, b] = colorRamp(t); im.data.set([r, g, b, Math.round(40 + 200 * t)], i * 4); }
  x.putImageData(im, 0, 0); const o = document.createElement('canvas'); o.width = o.height = size; const ox = o.getContext('2d'); ox.imageSmoothingEnabled = true; ox.drawImage(c, 0, 0, size, size); return o;
}
function peaks(map, k = 14) {
  const { data, size: n } = map, out = [];
  for (let y = 1; y < n - 1; y++) for (let x = 1; x < n - 1; x++) {
    const v = data[y * n + x]; let isMax = true;
    for (let dy = -1; dy <= 1 && isMax; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && data[(y + dy) * n + x + dx] > v) { isMax = false; break; }
    if (isMax) out.push({ x: (x + 0.5) / n, y: (y + 0.5) / n, v });
  }
  return out.sort((a, b) => b.v - a.v).slice(0, k);
}
function channelsTile(c224) {
  const src = c224.getContext('2d').getImageData(0, 0, 224, 224).data, S = 112, out = document.createElement('canvas'); out.width = S * 3 + 16; out.height = S;
  const x = out.getContext('2d'), mean = [103.939, 116.779, 123.68];
  ['B', 'G', 'R'].forEach((name, ci) => {
    const im = x.createImageData(S, S), srcC = [2, 1, 0][ci];
    for (let yy = 0; yy < S; yy++) for (let xx = 0; xx < S; xx++) { const v = src[((yy * 2) * 224 + xx * 2) * 4 + srcC] - mean[ci]; const g = Math.max(0, Math.min(255, 128 + v)); const o = (yy * S + xx) * 4; im.data[o] = ci === 2 ? g : g * 0.75; im.data[o + 1] = ci === 1 ? g : g * 0.75; im.data[o + 2] = ci === 0 ? g : g * 0.75; im.data[o + 3] = 255; }
    x.putImageData(im, ci * (S + 8), 0);
  });
  return out;
}
const barPos = s => Math.max(0, Math.min(1, (s - 0.5) / 0.5)) * 100;

/**
 * @param {object} o  photo, box, pre (de review), records, cal, truth (modo práctica)
 * @returns {Promise<{result, emb, action}>}
 */
export function runAnalysis(o) {
  return new Promise(async resolve => {
    const root = $('#analysis'); let speed = 1;
    root.innerHTML = `<div class="an-wrap">
      <div class="an-steps">${STEPS.map(([k, t]) => `<div data-s="${k}"><b>ETAPA ${k}</b>${t}</div>`).join('')}</div>
      <div class="an-body" id="an-body"></div>
      <div class="an-foot"><span id="an-status">Iniciando…</span><button class="link" id="an-skip">Acelerar animación</button></div></div>`;
    show(root);
    $('#an-skip').onclick = () => { speed = 4; gsap.globalTimeline.timeScale(4); $('#an-skip').remove(); };
    const W = ms => sleep(ms / speed), status = t => { $('#an-status').textContent = t; };
    const step = k => $$('.an-steps div', root).forEach(d => { const i = 'ABCD'.indexOf(d.dataset.s), j = 'ABCD'.indexOf(k); d.classList.toggle('on', i === j); d.classList.toggle('done', i < j); });
    const body = $('#an-body');
    const stage = html => { const old = body.firstElementChild; const el = h(`<div class="an-stage">${html}</div>`); body.append(el); if (old) gsap.to(old, { opacity: 0, x: -40, duration: 0.4, onComplete: () => old.remove() }); gsap.from(el, { opacity: 0, x: 40, duration: 0.5 }); return el; };

    // ---------- A · preparación
    step('A'); status('Recortando la región naso-labial y llevándola a 224 × 224 píxeles…');
    const A = stage(`<div><h3 class="an-title">Preparando la fotografía</h3><p class="an-sub">Se recorta solo el hocico, se lleva al tamaño que espera la red (224 × 224) y se ajustan los colores como en el entrenamiento original de ResNet50 (BGR menos la media de ImageNet).</p></div>
      <div class="prep-row">
        <div class="dark-tile" id="a1"><span class="tile-cap">Foto recibida · ${o.photo.width} × ${o.photo.height}</span></div>
        <div class="dark-tile" id="a2"><span class="tile-cap">Recorte · ${Math.round(o.box.s)} px</span></div>
        <div class="dark-tile" id="a3"><span class="tile-cap">224 × 224</span></div>
        <div class="dark-tile" id="a4" style="display:grid;place-items:center"><span class="tile-cap">B · G · R − media ImageNet</span></div>
      </div>
      <div class="timings"><span>recorte ${fmt(o.pre.times.recorte, 1)} ms</span><span>cambio de tamaño ${fmt(o.pre.times.resize, 1)} ms</span><span>nitidez ${fmt(o.pre.quality.sharpness, 0)}</span><span>brillo ${fmt(o.pre.quality.brightness, 0)}</span></div>`);
    const p1 = o.photo.cloneNode ? document.createElement('canvas') : null; p1.width = o.photo.width; p1.height = o.photo.height;
    const px = p1.getContext('2d'); px.drawImage(o.photo, 0, 0); px.strokeStyle = '#f1c76b'; px.lineWidth = Math.max(3, o.photo.width / 220); px.strokeRect(o.box.x, o.box.y, o.box.s, o.box.s);
    $('#a1', A).prepend(p1); await W(500);
    const c2 = o.pre.crop; c2.style.cssText = ''; $('#a2', A).prepend(c2); gsap.from(c2, { scale: 0.3, opacity: 0, duration: 0.6 }); await W(600);
    const c3 = document.createElement('canvas'); c3.width = c3.height = 224; c3.getContext('2d').drawImage(o.pre.input, 0, 0); c3.style.imageRendering = 'pixelated'; $('#a3', A).prepend(c3); gsap.from(c3, { opacity: 0, duration: 0.5 }); await W(500);
    const c4 = channelsTile(o.pre.input); c4.style.cssText = 'width:92%;height:auto'; $('#a4', A).prepend(c4); gsap.from(c4, { opacity: 0, y: 10, duration: 0.5 }); await W(900);

    // ---------- B · características (ResNet50 real)
    step('B'); status(isReady() ? 'ResNet50 está procesando la imagen…' : 'Cargando ResNet50 (solo la primera vez)…');
    const B = stage(`<div class="feat-row">
        <div class="dark-tile" id="b1"><span class="tile-cap" id="b-cap">entrada 224 × 224</span><canvas id="b-ov" width="448" height="448" style="position:absolute;inset:0"></canvas></div>
        <div style="display:grid;align-content:start;gap:12px">
          <div><h3 class="an-title">Analizando características</h3><p class="an-sub">ResNet50 (preentrenada con ImageNet, sin entrenamiento nuevo) recorre la imagen capa por capa. Las zonas cálidas son las que más activan la red; los puntos son los máximos de una capa profunda. Al final, todo el hocico queda resumido en <b>2048 números</b>: su huella.</p></div>
          <div class="mini-title">Huella del hocico · 2048 valores reales</div><div class="fp" id="b-fp"></div>
          <div class="timings" id="b-t"><span>${esc(MODEL_INFO.name)}</span></div>
        </div></div>`);
    const base = document.createElement('canvas'); base.width = base.height = 224; base.getContext('2d').drawImage(o.pre.input, 0, 0); $('#b1', B).prepend(base);
    if (!isReady()) await loadModel(f => status(`Cargando ResNet50… ${Math.round(f * 100)} %`));
    status('ResNet50 está procesando la imagen…');
    const emb = await embed(o.pre.input);
    const heat = mapCanvas(emb.maps.early, 448); heat.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;mix-blend-mode:screen;opacity:0'; $('#b1', B).append(heat);
    gsap.to(heat, { opacity: 0.85, duration: 0.9 }); $('#b-cap', B).textContent = 'activación de la capa conv2 (real)';
    await W(900);
    const ov = $('#b-ov', B), ctx = ov.getContext('2d'), pk = peaks(emb.maps.deep, 14).map(p => ({ x: p.x * 448, y: p.y * 448 }));
    const links = []; pk.forEach((p, i) => { pk.map((q, j) => ({ j, d: Math.hypot(p.x - q.x, p.y - q.y) })).filter(e => e.j !== i).sort((a, b) => a.d - b.d).slice(0, 2).forEach(e => { if (i < e.j) links.push([p, pk[e.j]]); }); });
    const anim = { t: 0 };
    gsap.to(anim, { t: 1, duration: 1.4, onUpdate: () => {
      ctx.clearRect(0, 0, 448, 448); ctx.lineWidth = 1.6; ctx.strokeStyle = 'rgba(251,236,190,.85)';
      links.forEach(([a, b], i) => { const f = Math.max(0, Math.min(1, anim.t * links.length * 0.7 - i * 0.5)); if (f <= 0) return; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f); ctx.stroke(); });
      pk.forEach((p, i) => { const f = Math.min(1, anim.t * pk.length - i * 0.6); if (f <= 0) return; ctx.fillStyle = 'rgba(241,199,107,.95)'; ctx.beginPath(); ctx.arc(p.x, p.y, 5 * f, 0, 7); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 1.5; ctx.stroke(); });
    } });
    $('#b-cap', B).textContent = 'activación conv2 + máximos de conv4 (reales)';
    const fp = $('#b-fp', B); let vmax = 0; for (const v of emb.vector) vmax = Math.max(vmax, v);
    fp.innerHTML = Array.from(emb.vector, v => { const [r, g, b] = colorRamp(Math.sqrt(v / vmax)); return `<i style="background:rgb(${r},${g},${b})"></i>`; }).join('');
    gsap.from($$('i', fp).filter((_, i) => i % 8 === 0), { opacity: 0, duration: 0.4, stagger: 0.002 });
    $('#b-t', B).innerHTML += `<span>inferencia ${fmt(emb.ms, 0)} ms · ${esc(emb.backend)}</span><span>‖v‖ = ${fmt(emb.norm, 2)} → normalizado a 1</span>`;
    await W(2300);

    // ---------- C · comparación
    step('C'); const res = identify(emb.vector, o.records, o.cal);
    status(`Comparando con ${res.order.length} bovinos registrados (${res.comparisons} fotos de referencia)…`);
    const C = stage(`<div><h3 class="an-title">Comparando con los animales registrados</h3><p class="an-sub">La huella se compara con cada foto de referencia (similitud coseno). Cada bovino conserva su mejor puntuación y se ordenan de mayor a menor. La línea ámbar es el umbral θ = ${fmt(res.theta)}.</p></div>
      <div class="gal" id="c-gal"></div>`);
    const gal = $('#c-gal', C);
    const byId = new Map(res.order.map(x => [x.record.id, x]));
    const ordered = o.records.filter(r => byId.has(r.id));
    for (const r of ordered) {
      const x = byId.get(r.id), url = await photoURL(x.ref.cropId);
      gal.append(h(`<div class="gcard" data-id="${r.id}"><img src="${url}" alt=""><div class="nm">${esc(r.code)}<span>${fmt(x.s)}</span></div><div class="small" style="margin-top:-4px">${esc(r.name || '—')}</div><div class="gbar"><i></i><span class="th" style="left:${barPos(res.theta)}%"></span></div></div>`));
    }
    gsap.from($$('.gcard', gal), { opacity: 0, y: 14, duration: 0.35, stagger: 0.05 }); await W(500);
    for (const card of $$('.gcard', gal)) { const x = byId.get(card.dataset.id); gsap.to($('.gbar i', card), { width: barPos(x.s) + '%', duration: 0.5 }); if (x.s >= res.theta) card.classList.add('over'); await W(110); }
    await W(500);
    // reordenar por puntuación (animación FLIP)
    const first = new Map($$('.gcard', gal).map(c => [c, c.getBoundingClientRect()]));
    res.order.forEach(x => gal.append(gal.querySelector(`[data-id="${x.record.id}"]`)));
    $$('.gcard', gal).forEach(c => { const a = first.get(c), b = c.getBoundingClientRect(); gsap.from(c, { x: a.left - b.left, y: a.top - b.top, duration: 0.8, ease: 'power3.inOut' }); });
    await W(900);
    if (res.top) gal.querySelector(`[data-id="${res.top.record.id}"]`).classList.add('top');
    if (res.state === 'no-concluyente') gal.querySelector(`[data-id="${res.second.record.id}"]`).classList.add('top');
    status(`Comparación terminada en ${fmt(res.ms, 2)} ms.`); await W(1400);

    // ---------- D · resultado
    step('D'); const S = STATES[res.state];
    const qURL = o.pre.input.toDataURL('image/jpeg', 0.9), rURL = res.top ? await photoURL(res.top.ref.cropId) : '';
    const truth = o.truth ? judge(res, o.truth, o.records) : null;
    const D = stage(`<div class="result">
        <div class="dark-tile" style="aspect-ratio:1"><img src="${qURL}" alt="consulta"><span class="tile-cap">Fotografía de consulta</span></div>
        <div class="dark-tile" style="aspect-ratio:1">${res.state === 'no-identificado' ? `<div style="display:grid;place-items:center;height:100%;color:#cfd3c4;font-size:14px;padding:20px;text-align:center">Ningún registro alcanza el umbral</div>` : `<img src="${rURL}" alt="referencia">`}<span class="tile-cap">${res.state === 'no-identificado' ? 'Sin coincidencia' : 'Referencia de ' + esc(res.top.record.code)}</span></div>
        <div>
          <span class="badge-state ${S.tone}" id="d-badge">${S.title}</span>
          <h3 class="an-title" style="margin-top:12px">${res.state === 'identificado' ? esc(res.top.record.code) + (res.top.record.name ? ' · ' + esc(res.top.record.name) : '') : res.state === 'no-concluyente' ? esc(res.top.record.code) + ' = ' + esc(res.second.record.code) : 'Bovino no reconocido'}</h3>
          <p class="an-sub" style="margin-bottom:6px">${S.text}</p>
          <div class="kv">
            <div><small>Similitud (s)</small><b>${fmt(res.top?.s)}</b></div><div><small>Umbral (θ)</small><b>${fmt(res.theta)}</b></div>
            <div><small>2.º candidato</small><b style="font-size:15px">${res.second ? esc(res.second.record.code) + ' · ' + fmt(res.second.s) : '—'}</b></div><div><small>Diferencia</small><b>${fmt(res.diff)}</b></div>
          </div>
          ${S.v27 ? `<div class="note">${S.v27}</div>` : ''}
          <div class="note">La puntuación mide semejanza, no probabilidad. θ se calibró con las ${o.cal.refs} fotos de referencia registradas (${esc(o.cal.rule)}).</div>
          ${truth ? `<div class="truth"><b>Verificación del modo práctica:</b> ${truth}</div>` : ''}
          <div class="row" style="margin-top:14px" id="d-acts">
            <button class="btn primary" data-a="close">Volver a la finca</button>
            <button class="btn" data-a="retake">Repetir captura</button>
            ${res.state === 'identificado' ? '<button class="btn" data-a="ficha">Ver ficha</button>' : ''}
            ${res.state !== 'identificado' ? '<button class="btn" data-a="register">Registrar este bovino</button>' : ''}
          </div>
        </div></div>`);
    gsap.from($('#d-badge', D), { scale: 0.6, opacity: 0, duration: 0.5, ease: 'back.out(2)' });
    gsap.globalTimeline.timeScale(1);
    status(res.state === 'identificado' ? 'Identificación registrada en el historial del animal.' : 'Resultado registrado en el historial de la sesión.');
    $$('[data-a]', D).forEach(b => b.onclick = () => { hide(root); root.innerHTML = ''; resolve({ result: res, emb, action: b.dataset.a }); });
    $('[data-a="close"]', D).focus();
    o.onResult?.(res, emb);
  });
}

/** Compara el resultado con la verdad conocida del modo práctica (qué vaca se fotografió). */
function judge(res, truth, records) {
  const mine = records.filter(r => r.sceneCow === truth.k && r.refs?.length).map(r => r.code);
  const name = `el bovino n.º ${truth.k + 1} del potrero`;
  if (res.state === 'identificado') {
    if (res.top.record.sceneCow === truth.k) return `fotografiaste a ${name}, que está registrado como ${esc(res.top.record.code)}. Identificación correcta.`;
    if (res.top.record.sceneCow == null) return `fotografiaste a ${name}; el registro ${esc(res.top.record.code)} se creó con una foto subida, así que no se puede verificar.`;
    return `fotografiaste a ${name}, ${mine.length ? 'registrado como ' + mine.join(', ') : 'que no está registrado'}. Esto es una <b>falsa coincidencia</b>: el sistema lo confundió con ${esc(res.top.record.code)}.`;
  }
  if (res.state === 'no-identificado') return mine.length ? `fotografiaste a ${name}, que sí está registrado como ${mine.join(', ')}: es un <b>falso rechazo</b>. Sus fotos de referencia se tomaron en el brete: la luz del potrero cambia la toma. Prueba «Llevar al brete» y una foto frontal, a ~30 cm y bien enfocada.` : `fotografiaste a ${name}, que no está registrado. Rechazo correcto: puedes registrarlo ahora.`;
  if (res.state === 'no-concluyente') {
    const a = res.top.record, b = res.second.record;
    if (a.sceneCow === truth.k && b.sceneCow === truth.k) return `${esc(a.code)} y ${esc(b.code)} son el mismo animal registrado dos veces (registro duplicado). Por eso empatan y el sistema no se arriesga a elegir.`;
    return `fotografiaste a ${name}; el empate entre ${esc(a.code)} y ${esc(b.code)} impide decidir.`;
  }
  return '';
}
