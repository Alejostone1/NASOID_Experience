/* =============================================================================
   REGISTRO DE BOVINOS (X₆) — inventario, ficha, edición, referencias,
   historial y eliminación. Todo se guarda en IndexedDB y persiste al recargar.
   ============================================================================= */
import { $, $$, h, esc, show, hide, fmt, fdate, toast, confirmDialog } from './dom.js';
import { STATE, refresh, updateRecord, removeRecord, removeReference, codeTaken, nextCode, createRecord, db } from '../state.js';

let ctx = null; // { onLocate(rec), onCaptureRef(rec), onUploadRef(rec), onReset(), onUploadRegister() }
let view = { mode: 'list', id: null, q: '' };

export function initRegistry(callbacks) { ctx = callbacks; }
export function isOpen() { return !$('#registry').classList.contains('hidden'); }
export function closeRegistry() { hide('#registry'); }
export async function openRegistry(id = null) { view = { mode: id ? 'ficha' : 'list', id, q: view.q }; await render(); show('#registry'); }
export async function rerender() { if (isOpen()) await render(); }

async function render() {
  const root = $('#registry');
  if (view.mode === 'ficha') return renderFicha(root, STATE.records.find(r => r.id === view.id));
  const recs = STATE.records.filter(r => !view.q || (r.code + ' ' + r.name).toLowerCase().includes(view.q.toLowerCase()));
  root.innerHTML = `<div class="dr-head"><div class="spread"><div class="eyebrow">Inventario · ${STATE.records.length} registros</div><button class="btn ghost" data-close>Cerrar <kbd>R</kbd></button></div>
      <h2>Registro de bovinos</h2><div class="small">Umbral actual θ = <b class="mono">${fmt(STATE.cal?.theta)}</b> · ${STATE.cal?.refs || 0} fotos de referencia</div></div>
    <div class="dr-tools"><input type="search" placeholder="Buscar por código o nombre" value="${esc(view.q)}" data-q /><button class="btn" data-upreg title="Registrar un bovino con una foto propia">+ Con foto propia</button></div>
    <div class="dr-list">${recs.length ? '' : '<p class="small" style="padding:8px">No hay registros. Acércate a un bovino y elige «Registrar este bovino».</p>'}</div>
    <div class="dr-foot"><span>${db.storage?.persistent === false ? 'Sin almacenamiento persistente en este navegador' : 'Guardado en este navegador (IndexedDB)'}</span><button class="link" data-reset>Reiniciar datos de práctica</button></div>`;
  const list = $('.dr-list', root);
  for (const r of recs) {
    const url = await db.photoURL(r.coverId);
    const el = h(`<button class="rec"><img src="${url}" alt="" /><div><b>${esc(r.code)}${r.name ? ' · ' + esc(r.name) : ''}</b><small>${r.refs.length} foto${r.refs.length === 1 ? '' : 's'} de referencia · ${fdate(r.createdAt)}</small></div><span class="st ${r.status === 'pendiente' ? 'pend' : ''}">${r.status === 'pendiente' ? 'Pendiente' : 'Registrado'}</span></button>`);
    if (r.demo) el.querySelector('small').innerHTML += ' · <span class="st demo">demostración</span>';
    el.onclick = () => { view = { ...view, mode: 'ficha', id: r.id }; render(); };
    list.append(el);
  }
  root.querySelector('[data-close]').onclick = closeRegistry;
  const q = root.querySelector('[data-q]'); q.oninput = () => { view.q = q.value; clearTimeout(q._t); q._t = setTimeout(() => render().then(() => { const n = $('#registry [data-q]'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }), 250); };
  root.querySelector('[data-reset]').onclick = async () => { if (await confirmDialog('Reiniciar datos de práctica', 'Se borrarán todos los registros, fotos e historial guardados en este navegador y se volverá a crear la galería de demostración.', 'Reiniciar', true)) ctx.onReset(); };
  root.querySelector('[data-upreg]').onclick = () => ctx.onUploadRegister();
}

async function renderFicha(root, r) {
  if (!r) { view.mode = 'list'; return render(); }
  const evs = await db.events(r.id), cover = await db.photoURL(r.coverId);
  const refs = await Promise.all(r.refs.map(async x => ({ ...x, url: await db.photoURL(x.cropId) })));
  root.innerHTML = `<div class="dr-head"><div class="spread"><button class="link" data-back>← Inventario</button><button class="btn ghost" data-close>Cerrar</button></div>
      <div class="eyebrow" style="margin-top:10px">Ficha del animal</div><h2>${esc(r.code)}${r.name ? ' · ' + esc(r.name) : ''}</h2>
      <div class="row"><span class="st ${r.status === 'pendiente' ? 'pend' : ''}">${r.status === 'pendiente' ? 'Pendiente de fotos' : 'Registrado'}</span>${r.demo ? '<span class="st demo">demostración</span>' : ''}</div></div>
    <div></div>
    <div class="dr-list" style="padding:4px 22px 18px">
      ${cover ? `<img class="ficha-cover" src="${cover}" alt="foto del registro" />` : '<div class="ficha-cover" style="display:grid;place-items:center;color:#cfd3c4">Sin foto</div>'}
      <form class="ficha-form" data-form>
        <label class="field">Código único<input name="code" value="${esc(r.code)}" required maxlength="16" /></label>
        <label class="field">Nombre (opcional)<input name="name" value="${esc(r.name)}" maxlength="40" placeholder="Ej.: Lucero" /></label>
        <div class="row"><button class="btn primary" type="submit">Guardar cambios</button></div>
      </form>
      <div class="kv" style="grid-template-columns:1fr 1fr">
        <div><small>Fecha de registro</small><span style="font-size:13px">${fdate(r.createdAt)}</span></div>
        <div><small>Identificador interno</small><span class="mono" style="font-size:12px">${esc(r.id)}</span></div>
        ${r.breed ? `<div><small>Pelaje (modelo 3D)</small><span style="font-size:13px">${esc(r.breed)}</span></div>` : ''}
        <div><small>Última identificación</small><span style="font-size:13px">${r.lastSeen ? fdate(r.lastSeen) : '—'}</span></div>
      </div>
      <div class="sec-title">Fotografías biométricas de referencia · ${r.refs.length} <span style="text-transform:none;letter-spacing:0">(el protocolo usa 5 por animal)</span></div>
      <div class="refs">${refs.map(x => `<div><img src="${x.url}" alt="" title="${fdate(x.createdAt)}" /><button data-delref="${x.id}" title="Eliminar referencia">×</button></div>`).join('') || '<span class="small">Aún no tiene fotos.</span>'}</div>
      <div class="row" style="margin-top:10px">
        ${r.sceneCow != null ? '<button class="btn" data-capref>Fotografiar en la finca</button>' : ''}
        <label class="btn">Subir foto<input type="file" accept="image/*" hidden data-upref /></label>
      </div>
      ${r.sceneCow != null ? '<p class="note">«Fotografiar en la finca» te lleva junto al animal de este registro (atajo del modo práctica).</p>' : ''}
      <div class="sec-title">Historial</div>
      <div class="hist">${evs.map(e => `<div><span>${esc(evText(e))}</span><span class="small">${fdate(e.at)}</span></div>`).join('') || '<span class="small">Sin eventos.</span>'}</div>
      <div class="sec-title">Zona de peligro</div>
      <button class="btn danger" data-del>Eliminar registro</button>
    </div><div></div>`;
  root.querySelector('[data-back]').onclick = () => { view.mode = 'list'; render(); };
  root.querySelector('[data-close]').onclick = closeRegistry;
  root.querySelector('[data-form]').onsubmit = async e => {
    e.preventDefault(); const f = new FormData(e.target), code = String(f.get('code')).trim().toUpperCase(), name = String(f.get('name')).trim();
    if (!code) return toast('El código no puede quedar vacío.');
    if (codeTaken(code, r.id)) return toast(`El código ${code} ya existe.`);
    await updateRecord(r, { code, name }); toast('Ficha actualizada.'); render();
  };
  $$('[data-delref]', root).forEach(b => b.onclick = async () => { if (await confirmDialog('Eliminar referencia', 'La foto dejará de usarse para comparar y el umbral se recalibrará.', 'Eliminar', true)) { await removeReference(r, b.dataset.delref); render(); } });
  root.querySelector('[data-capref]')?.addEventListener('click', () => { closeRegistry(); ctx.onCaptureRef(r); });
  root.querySelector('[data-upref]').onchange = e => { const f = e.target.files[0]; if (f) { closeRegistry(); ctx.onUploadRef(r, f); } };
  root.querySelector('[data-del]').onclick = async () => { if (await confirmDialog(`Eliminar ${r.code}`, 'Se eliminarán el registro, sus fotos de referencia y su historial. No se puede deshacer.', 'Eliminar', true)) { await removeRecord(r.id); toast(`${r.code} eliminado.`); view.mode = 'list'; render(); } };
}
function evText(e) {
  if (e.type === 'identificacion') return `Identificado (s = ${fmt(e.s)}, θ = ${fmt(e.theta)})`;
  return e.text || e.type;
}

/** Formulario de registro. Devuelve {code, name} o null. */
export async function registerForm(suggestedName = '') {
  const code = await nextCode();
  return new Promise(res => {
    const d = $('#dialog');
    d.innerHTML = `<div class="sheet narrow"><div class="eyebrow">Nuevo registro</div><h2>Registrar bovino</h2>
      <p class="note" style="font-size:14px">Después tomarás sus fotos de referencia del hocico. Con una basta para empezar; se recomiendan tres desde ángulos un poco distintos (el protocolo usa cinco).</p>
      <form data-f><label class="field">Código único<input name="code" value="${code}" required maxlength="16" /></label>
      <label class="field">Nombre (opcional)<input name="name" value="${esc(suggestedName)}" maxlength="40" placeholder="Ej.: Canela" /></label>
      <div class="row" style="justify-content:flex-end;margin-top:12px"><button type="button" class="btn" data-no>Cancelar</button><button class="btn primary">Continuar a las fotos</button></div></form></div>`;
    show(d); d.querySelector('[name=name]').focus();
    const close = v => { hide(d); d.innerHTML = ''; res(v); };
    d.querySelector('[data-no]').onclick = () => close(null);
    d.querySelector('[data-f]').onsubmit = e => {
      e.preventDefault(); const f = new FormData(e.target), c = String(f.get('code')).trim().toUpperCase();
      if (codeTaken(c)) { toast(`El código ${c} ya existe.`); return; }
      close({ code: c, name: String(f.get('name')).trim() });
    };
  });
}
export { createRecord, refresh };
