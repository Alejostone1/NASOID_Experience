/* =============================================================================
   BIBLIOTECA DE REFERENCIAS (71 fuentes del V27, APA 7) — navegable y clicable.
   Cada ficha: referencia APA, enlace oficial real (DOI, arXiv o página de la
   fuente), aporte al proyecto, secciones del V27 donde se cita y ficha de la
   matriz de antecedentes. En el computador (localhost) también abre el PDF de la
   carpeta ReferenciasV21; en la web no se publican los PDF.
   ============================================================================= */
import { REFS, REF, $, $$, h, esc } from './core.js';

const CATS = { NASOLABIAL: 'Naso-labial', TECNOLOGIA: 'Tecnología', ALGORITMO: 'Algoritmos', METODOLOGIA: 'Metodología', BIOMETRIA: 'Biometría', 'IDENTIFICACION ANIMAL': 'Identificación animal', 'ESTADISTICA Y EVALUACION': 'Estadística', 'NORMATIVA Y CONTEXTO': 'Normativa y contexto' };
const LINK = { doi: 'Abrir DOI ↗', arxiv: 'Preprint en arXiv ↗', 'pdf-web': 'PDF en el sitio oficial ↗', url: 'Página de la fuente ↗' };
const LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
let state = { q: '', cat: '' }, onGoSection = null;

export function initBiblio(goSection) { onGoSection = goSection; }
export function isBiblioOpen() { return !$('#biblio').classList.contains('hidden'); }
export function closeBiblio() { $('#biblio').classList.add('hidden'); document.activeElement?.blur?.(); }

function card(r) {
  const f = r.ficha || {};
  const pdf = r.pdf ? (LOCAL ? `<a href="/ReferenciasV21/${encodeURIComponent(r.pdf.file)}" target="_blank" rel="noopener">PDF local ↗</a>` : `<span class="off" title="Los PDF de ReferenciasV21 se abren al ejecutar la presentación en el computador (npm start)">PDF en la versión local</span>`) : '';
  return `<article class="ref" id="ref-${r.id}">
    <div class="ref-top"><b>${esc(r.cite)}</b>${r.pdf?.cat ? `<span class="tag">${CATS[r.pdf.cat] || r.pdf.cat}</span>` : ''}${f.tipo ? `<span class="tag soft">${esc(f.tipo)}</span>` : ''}</div>
    <p class="apa">${esc(r.apa).replace(/(https?:\/\/\S+)/g, '<span class="url">$1</span>')}</p>
    <div class="ref-links">${r.url ? `<a href="${r.url}" target="_blank" rel="noopener">${LINK[r.kind] || 'Abrir ↗'}</a>` : ''}${pdf}</div>
    ${f.aporte ? `<p class="aporte"><span>Aporte al proyecto</span>${esc(f.aporte)}</p>` : ''}
    <div class="secs"><span>Citada en V27</span>${r.sections.map(s => `<button data-sec="${s.num}" title="${esc(s.title)}">${s.num}</button>`).join('')}</div>
    ${f.abstract ? `<details><summary>Ficha de la matriz de antecedentes</summary><dl><dt>Resumen</dt><dd>${esc(f.abstract)}</dd>${f.palabras ? `<dt>Palabras clave</dt><dd>${esc(f.palabras)}</dd>` : ''}${f.vi?.length ? `<dt>Var. independientes</dt><dd>${f.vi.map(esc).join(' · ')}</dd>` : ''}${f.vd ? `<dt>Var. dependiente</dt><dd>${esc(f.vd)}</dd>` : ''}</dl></details>` : ''}
  </article>`;
}
function list() {
  const q = state.q.toLowerCase();
  return REFS.filter(r => (!state.cat || r.pdf?.cat === state.cat) && (!q || (r.apa + ' ' + (r.ficha?.abstract || '') + ' ' + (r.ficha?.palabras || '')).toLowerCase().includes(q)));
}
function render(focus) {
  const root = $('#biblio'), items = list();
  const cats = Object.entries(CATS).map(([k, v]) => [k, v, REFS.filter(r => r.pdf?.cat === k).length]).filter(x => x[2]);
  root.innerHTML = `<div class="bib-head">
      <div><div class="eyebrow">Capítulo 8 · Referencias bibliográficas · APA 7</div><h2>Biblioteca de referencias</h2>
      <p class="sub">${REFS.length} fuentes del documento V27. Cada enlace abre la fuente real (DOI, arXiv o página oficial).</p></div>
      <button class="btn ghost" data-close>Cerrar <kbd>R</kbd></button></div>
    <div class="bib-tools"><input type="search" placeholder="Buscar autor, título o tema…" value="${esc(state.q)}" data-q />
      <div class="chips"><button class="chip-f ${!state.cat ? 'on' : ''}" data-cat="">Todas · ${REFS.length}</button>${cats.map(([k, v, n]) => `<button class="chip-f ${state.cat === k ? 'on' : ''}" data-cat="${k}">${v} · ${n}</button>`).join('')}</div></div>
    <div class="bib-list">${items.map(card).join('') || '<p class="sub">Sin resultados.</p>'}</div>
    <div class="bib-foot">${items.length} de ${REFS.length} · Las fichas combinan la referencia del V27 con la matriz de antecedentes.</div>`;
  root.querySelector('[data-close]').onclick = closeBiblio;
  const q = root.querySelector('[data-q]');
  q.oninput = () => { state.q = q.value; clearTimeout(q._t); q._t = setTimeout(() => { render(); const n = $('#biblio [data-q]'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 200); };
  q.onkeydown = e => e.stopPropagation();
  $$('[data-cat]', root).forEach(b => b.onclick = () => { state.cat = b.dataset.cat; render(); });
  $$('[data-sec]', root).forEach(b => b.onclick = () => { closeBiblio(); onGoSection?.(b.dataset.sec); });
  if (focus) { const el = $('#ref-' + focus, root); if (el) { el.scrollIntoView({ block: 'center' }); el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 1800); } }
}
export function openBiblio(focusId) {
  if (focusId) { state.q = ''; state.cat = ''; }
  $('#biblio').classList.remove('hidden'); render(focusId);
}
export { REF };
