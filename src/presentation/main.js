/* =============================================================================
   PRESENTACIÓN DE SUSTENTACIÓN (versión clara y explicada)
   Escenas animadas y clicables organizadas en bloques, con índice (M), notas del
   expositor (N), biblioteca de referencias (R) y citas que abren su fuente.
   Contenido: documento V27 (autoridad académica), redactado de forma sencilla.
   ============================================================================= */
import '../shared/theme.css';
import './presentation.css';
import gsap from 'gsap';
import { loadFonts } from '../shared/fonts.js';
import { Stage3D } from './stage3d.js';
import { $, $$, ICON } from './core.js';
import { initBiblio, openBiblio, closeBiblio, isBiblioOpen } from './biblio.js';
import { APERTURA } from './scenes/apertura.js';
import { FUNDAMENTOS } from './scenes/fundamentos.js';
import { METODOLOGIA } from './scenes/metodologia.js';
import { TECNOLOGIA } from './scenes/tecnologia.js';
import { CIERRE } from './scenes/cierre.js';

const SCENES = [...APERTURA, ...FUNDAMENTOS, ...METODOLOGIA, ...TECNOLOGIA, ...CIERRE];
/** Marca de narración: solo un color por voz (sin nombres) para seguir la línea del relato. */
const SPK_COLOR = { D: '#8a6a4a', J: '#5f7352', DJ: '#c8922e' };
/** Sección del V27 → escena (para los botones «Citada en V27» de la biblioteca). */
const SECTION_SCENE = { '1': 'portada', '2': 'problema', '3': 'problema', '4': 'objetivos', '4.1': 'objetivos', '4.2': 'objetivos', '4.3': 'objetivos', '5': 'metodologia', '5.1': 'paradigmas', '5.2': 'enfoque', '5.3': 'enfoque', '5.4': 'metodologia', '5.5': 'poblacion', '5.6': 'variables', '5.7': 'metodologia', '5.8': 'metodologia', '5.9': 'objetivos', '5.10': 'metodologia', '5.11': 'metodologia', '6': 'estado-arte', '6.1': 'estado-arte', '6.2': 'funcion', '6.2.1': 'contexto', '6.2.2': 'propuesta', '6.2.3': 'funcion', '6.2.4': 'funcion', '6.2.5': 'funcion', '6.2.6': 'funcion', '6.2.7': 'arquitectura', '6.2.8': 'arquitectura', '7': 'objetivos', '7.2': 'objetivos', '7.3': 'objetivos', '8': 'referencias' };

let idx = 0, stage = null, typed = '';
const mounted = new Set();

function build() {
  $('#slides').innerHTML = SCENES.map(s => `<section class="slide" id="s-${s.id}" aria-label="${s.title}"><div class="slide-in">${s.html()}</div></section>`).join('');
  $('#segs').innerHTML = SCENES.map((s, i) => `<i data-i="${i}" style="--c:${SPK_COLOR[s.spk]}" title="${i + 1}. ${s.title}"></i>`).join('');
  $$('#segs i').forEach(el => el.onclick = () => go(+el.dataset.i));
  const blocks = []; SCENES.forEach((s, i) => { let b = blocks.find(x => x.name === s.block); if (!b) blocks.push(b = { name: s.block, items: [] }); b.items.push([s, i]); });
  $('#index').innerHTML = `<div class="idx-in"><div class="spread"><div><div class="eyebrow">Índice · ${SCENES.length} escenas</div><h2>Recorrido de la sustentación</h2></div><button class="btn ghost" data-close>Cerrar <kbd>M</kbd></button></div>
    <div class="idx-blocks">${blocks.map(b => `<div class="idx-b"><h4>${b.name}</h4>${b.items.map(([s, i]) => `<button data-go="${i}"><span class="n">${String(i + 1).padStart(2, '0')}</span><span class="t">${s.title}</span><span class="w" style="--c:${SPK_COLOR[s.spk]}"></span></button>`).join('')}</div>`).join('')}</div></div>`;
  $('#index [data-close]').onclick = () => toggle('#index', false);
  $$('#index [data-go]').forEach(b => b.onclick = () => { toggle('#index', false); go(+b.dataset.go); });
  document.addEventListener('click', e => { const c = e.target.closest('.cite'); if (c) { e.preventDefault(); openBiblio(c.dataset.ref); } });
  initBiblio(sec => { const id = SECTION_SCENE[sec] || SECTION_SCENE[sec.split('.').slice(0, 2).join('.')] || SECTION_SCENE[sec.split('.')[0]]; const i = SCENES.findIndex(s => s.id === id); if (i >= 0) go(i); });
}
function toggle(sel, v) { const el = $(sel); el.classList.toggle('hidden', v === undefined ? !el.classList.contains('hidden') : !v); }

function go(i) {
  i = Math.max(0, Math.min(SCENES.length - 1, i)); const slides = $$('.slide'), prev = slides[idx], next = slides[i], dir = i >= idx ? 1 : -1, s = SCENES[i];
  if (prev !== next) { SCENES[idx].leave?.(prev); gsap.to(prev, { opacity: 0, x: -24 * dir, duration: 0.35, onComplete: () => prev.classList.remove('on') }); }
  idx = i; next.classList.add('on'); next.scrollTop = 0;
  if (!mounted.has(s.id)) { mounted.add(s.id); s.mount?.(next); }
  gsap.fromTo(next, { opacity: 0, x: 24 * dir }, { opacity: 1, x: 0, duration: 0.55, delay: 0.1 });
  gsap.fromTo($$('[data-a]', next), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.55, stagger: 0.07, delay: 0.2, ease: 'power2.out' });
  setTimeout(() => s.enter?.(next), 250); reveal(next);
  if (stage) stage.shot(s.shot || { rel: [4.6, 1.1, 4.4], look: 'body', lookOff: [0, -0.2, 0], shift: 0.34, graze: true });
  document.body.classList.toggle('wide', !!(s.wide || !s.shot)); document.body.classList.toggle('hide3d', !!s.hide3d);
  $$('#segs i').forEach((el, k) => { el.classList.toggle('on', k === i); el.classList.toggle('done', k < i); });
  $('#count').textContent = `${String(i + 1).padStart(2, '0')} / ${SCENES.length}`;
  const sp = $('#speaker'); sp.style.setProperty('--c', SPK_COLOR[s.spk]); sp.classList.remove('beat'); void sp.offsetWidth; sp.classList.add('beat');
  $('#block').textContent = s.block;
  renderNotes();
  history.replaceState(null, '', '#' + s.id);
}
/** Animación común: el título entra palabra por palabra y el énfasis se subraya. */
function reveal(root) {
  $$('h1, h2', root).forEach(h => {
    if (!h.dataset.split) { h.dataset.split = 1; const walk = n => [...n.childNodes].forEach(c => { if (c.nodeType === 3) { const f = document.createDocumentFragment(); c.textContent.split(/(\s+)/).forEach(w => { if (!w) return; if (/^\s+$/.test(w)) f.append(w); else { const sp = document.createElement('span'); sp.className = 'wd'; sp.textContent = w; f.append(sp); } }); c.replaceWith(f); } else if (c.nodeType === 1 && c.tagName !== 'BUTTON') walk(c); }); walk(h); }
    gsap.fromTo($$('.wd', h), { opacity: 0, y: '0.45em', rotateX: -60 }, { opacity: 1, y: 0, rotateX: 0, duration: 0.6, stagger: 0.045, delay: 0.25, ease: 'power3.out' });
  });
  $$('h2 em, h1 em', root).forEach(e => { e.classList.remove('swept'); setTimeout(() => e.classList.add('swept'), 900); });
}
function renderNotes() {
  const s = SCENES[idx], n = s.notes || {}, nx = SCENES[idx + 1];
  $('#notes').innerHTML = `<div class="spread"><span class="spk-dot" style="--c:${SPK_COLOR[s.spk]}"></span><button class="link" data-x>cerrar (N)</button></div>
    <h4>${s.title}</h4>${n.idea ? `<p class="idea">${n.idea}</p>` : ''}${(n.guion || []).map(g => `<p>${g}</p>`).join('')}
    ${nx ? `<p class="next">Siguiente: ${nx.title}${nx.spk !== s.spk ? ` <span class="spk-dot" style="--c:${SPK_COLOR[nx.spk]}"></span>` : ''}</p>` : ''}`;
  $('#notes [data-x]').onclick = () => toggle('#notes', false);
}

addEventListener('keydown', e => {
  const k = e.key;
  if (k === 'Escape' && isBiblioOpen()) return closeBiblio();
  if (e.target.closest('input, textarea, select')) return;
  if (k === 'Escape') { if (isBiblioOpen()) return closeBiblio(); toggle('#index', false); toggle('#notes', false); return; }
  if (['ArrowRight', 'PageDown', ' '].includes(k)) { e.preventDefault(); go(idx + 1); }
  else if (['ArrowLeft', 'PageUp'].includes(k)) { e.preventDefault(); go(idx - 1); }
  else if (k === 'Home') go(0); else if (k === 'End') go(SCENES.length - 1);
  else if (/^\d$/.test(k)) { typed += k; clearTimeout(go._t); go._t = setTimeout(() => { typed = ''; }, 1500); }
  else if (k === 'Enter' && typed) { go(parseInt(typed, 10) - 1); typed = ''; }
  else if (k.toLowerCase() === 'm') toggle('#index');
  else if (k.toLowerCase() === 'r') { e.preventDefault(); isBiblioOpen() ? closeBiblio() : openBiblio(); }
  else if (k.toLowerCase() === 'n') toggle('#notes');
  else if (k.toLowerCase() === 'f') full();
  else if (k.toLowerCase() === 's') location.href = `${import.meta.env.BASE_URL}experience/`;
});
let tx = null; addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
addEventListener('touchend', e => { if (tx == null || e.target.closest('.interactive, #biblio, #index')) return; const d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 70) go(idx + (d < 0 ? 1 : -1)); tx = null; });
function full() { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.().catch(() => {}); }

(async () => {
  await loadFonts(); build();
  $('#prev').onclick = () => go(idx - 1); $('#next').onclick = () => go(idx + 1);
  $('#b-index').innerHTML = ICON.grid; $('#b-index').onclick = () => toggle('#index');
  $('#b-refs').innerHTML = ICON.book + '<span>Referencias</span>'; $('#b-refs').onclick = () => openBiblio();
  $('#b-notes').innerHTML = ICON.notes; $('#b-notes').onclick = () => toggle('#notes');
  $('#b-full').innerHTML = ICON.full; $('#b-full').onclick = full;
  try { stage = new Stage3D($('#bg')); } catch (e) { console.warn('Sin WebGL: presentación sin fondo 3D', e); document.body.classList.add('no3d'); }
  const start = Math.max(0, SCENES.findIndex(s => '#' + s.id === location.hash));
  idx = start; $$('.slide')[start].classList.add('on'); stage?.shot({ ...(SCENES[start].shot || {}), fast: true }); go(start);
  gsap.to('#veil', { opacity: 0, duration: 0.8, delay: 0.2, onComplete: () => $('#veil').remove() });
  window.NASOID_P = { go, get idx() { return idx; }, count: SCENES.length, ids: SCENES.map(s => s.id) };
})();
