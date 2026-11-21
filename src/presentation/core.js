/* Utilidades compartidas por las escenas: citas clicables, formato, iconos. */
import REFS from '../shared/refs.json';
export { REFS };
export const REF = Object.fromEntries(REFS.map(r => [r.id, r]));
export const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const fmt = (n, d = 0) => Number(n).toLocaleString('es-CO', { minimumFractionDigits: d, maximumFractionDigits: d });
export const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
/** Cita clicable (abre la ficha en la biblioteca). */
export const C = (...ids) => `<span class="cites">${ids.map(id => REF[id] ? `<button class="cite" data-ref="${id}" title="${esc(REF[id].apa)}">${esc(REF[id].cite)}</button>` : '').join('')}</span>`;
export function h(html) { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; }
export const ICON = {
  tag: '<svg viewBox="0 0 48 48"><path d="M8 10h18l14 14-16 16L10 26z"/><circle cx="17" cy="19" r="3"/></svg>',
  lost: '<svg viewBox="0 0 48 48"><path d="M10 10h16l12 12-14 14L10 22z" stroke-dasharray="4 4"/><path d="M30 34l8 8M38 34l-8 8"/></svg>',
  sheet: '<svg viewBox="0 0 48 48"><rect x="11" y="7" width="26" height="34" rx="3"/><path d="M17 16h14M17 23h14M17 30h8"/></svg>',
  trace: '<svg viewBox="0 0 48 48"><circle cx="10" cy="24" r="4"/><circle cx="38" cy="12" r="4"/><circle cx="38" cy="36" r="4"/><path d="M14 22l20-8M14 26l20 8"/></svg>',
  reg: '<svg viewBox="0 0 48 48"><rect x="9" y="8" width="30" height="32" rx="4"/><path d="M16 18h16M16 25h16M16 32h9"/></svg>',
  cam: '<svg viewBox="0 0 48 48"><rect x="7" y="14" width="34" height="24" rx="4"/><circle cx="24" cy="26" r="7"/><path d="M17 14l3-5h8l3 5"/></svg>',
  ai: '<svg viewBox="0 0 48 48"><circle cx="12" cy="14" r="3"/><circle cx="12" cy="34" r="3"/><circle cx="24" cy="24" r="3"/><circle cx="36" cy="14" r="3"/><circle cx="36" cy="34" r="3"/><path d="M15 15l6 7M15 33l6-7M27 23l6-7M27 25l6 7"/></svg>',
  cmp: '<svg viewBox="0 0 48 48"><rect x="6" y="12" width="14" height="24" rx="3"/><rect x="28" y="12" width="14" height="24" rx="3"/><path d="M21 24h6M24 21v6"/></svg>',
  ok: '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="16"/><path d="M16 24l6 6 11-12"/></svg>',
  book: '<svg viewBox="0 0 24 24"><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/></svg>',
  grid: '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>',
  notes: '<svg viewBox="0 0 24 24"><path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>',
  full: '<svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
};
