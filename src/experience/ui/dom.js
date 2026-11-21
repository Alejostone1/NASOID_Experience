export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export function h(html) { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; }
export function esc(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
export const fmt = (x, d = 3) => (x == null || !isFinite(x)) ? '—' : x.toLocaleString('es-CO', { minimumFractionDigits: d, maximumFractionDigits: d });
export const fdate = t => new Date(t).toLocaleString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
export function toast(msg, ms = 2800) { const el = h(`<div class="toast">${esc(msg)}</div>`); $('#toasts').append(el); setTimeout(() => el.remove(), ms); }
export function show(el) { (typeof el === 'string' ? $(el) : el).classList.remove('hidden'); }
export function hide(el) { (typeof el === 'string' ? $(el) : el).classList.add('hidden'); }
export function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
/** Sonido del obturador sintetizado (sin archivos). */
let actx = null;
export function shutterSound() {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const n = actx.sampleRate * 0.09, b = actx.createBuffer(1, n, actx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3) * (i < n * 0.15 || i > n * 0.5 ? 1 : 0.3);
    const s = actx.createBufferSource(), g = actx.createGain(); g.gain.value = 0.25; s.buffer = b; s.connect(g).connect(actx.destination); s.start();
  } catch { /* sin audio */ }
}
export function confirmDialog(title, text, okLabel = 'Confirmar', danger = false) {
  return new Promise(res => {
    const d = $('#dialog'); d.innerHTML = `<div class="sheet narrow"><h2>${esc(title)}</h2><p class="note" style="font-size:14px">${esc(text)}</p><div class="row" style="justify-content:flex-end;margin-top:16px"><button class="btn" data-no>Cancelar</button><button class="btn ${danger ? 'danger' : 'primary'}" data-ok>${esc(okLabel)}</button></div></div>`;
    show(d); const close = v => { hide(d); d.innerHTML = ''; res(v); };
    d.querySelector('[data-ok]').onclick = () => close(true); d.querySelector('[data-no]').onclick = () => close(false);
    d.querySelector('[data-ok]').focus();
  });
}
