/* =============================================================================
   ESTADO DE LA APLICACIÓN — une almacenamiento, preprocesamiento, extracción y
   calibración. Los componentes visuales leen y escriben a través de aquí.
   ============================================================================= */
import * as db from './biometric/db.js';
import { prepare, pixelHash } from './biometric/preprocess.js';
import { embed } from './biometric/extractor.js';
import { calibrate } from './biometric/engine.js';

const listeners = new Set();
export const STATE = { records: [], cal: null, challenges: {}, session: [] };
export function onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }
function emit() { listeners.forEach(f => f(STATE)); }

let seq = 0;
export async function refresh() {
  const my = ++seq; const records = await db.allRecords();
  if (my !== seq) return STATE; // llegó una actualización más reciente: no pisarla con datos viejos
  STATE.records = records;
  STATE.cal = calibrate(STATE.records);
  STATE.challenges = await db.getMeta('challenges', {});
  emit(); return STATE;
}
export async function markChallenge(key) {
  if (STATE.challenges[key]) return false;
  STATE.challenges[key] = Date.now(); await db.setMeta('challenges', STATE.challenges); emit(); return true;
}

export async function nextCode() {
  const used = new Set(STATE.records.map(r => r.code)); let n = 1;
  while (used.has(`BOV-${String(n).padStart(3, '0')}`)) n++;
  return `BOV-${String(n).padStart(3, '0')}`;
}
export function codeTaken(code, exceptId) { return STATE.records.some(r => r.code.toLowerCase() === code.toLowerCase() && r.id !== exceptId); }

export async function createRecord({ code, name = '', sceneCow = null, demo = false, breed = '' }) {
  const rec = { id: db.uid('bov'), code, name, createdAt: Date.now(), updatedAt: Date.now(), status: 'pendiente', demo, sceneCow, breed, coverId: null, refs: [] };
  await db.putRecord(rec); await db.addEvent({ recordId: rec.id, type: 'registro', text: `Registro creado (${code})` });
  await refresh(); return rec;
}
export async function updateRecord(rec, patch) {
  Object.assign(rec, patch); await db.putRecord(rec);
  await db.addEvent({ recordId: rec.id, type: 'edicion', text: 'Datos de la ficha modificados' }); await refresh();
}
export async function removeRecord(id) { await db.deleteRecord(id); await refresh(); }

/**
 * Procesa una foto y la guarda como referencia biométrica del registro.
 * @returns la referencia creada (con su vector de 2048 valores)
 */
export async function addReference(rec, photo, box, source = 'render', pre = null) {
  const p = pre || prepare(photo, box);
  const emb = await embed(p.input);
  const photoId = await db.putPhoto(await db.canvasToBlob(photo, 'image/jpeg', 0.86));
  const cropId = await db.putPhoto(await db.canvasToBlob(p.input, 'image/jpeg', 0.92));
  const ref = { id: db.uid('ref'), photoId, cropId, vector: emb.vector, hash: pixelHash(p.input), createdAt: Date.now(), source, box };
  rec.refs.push(ref); if (!rec.coverId) rec.coverId = photoId; rec.status = 'registrado';
  await db.putRecord(rec); await db.addEvent({ recordId: rec.id, type: 'referencia', text: `Foto de referencia ${rec.refs.length} guardada` });
  await refresh(); return { ref, emb };
}
export async function removeReference(rec, refId) {
  rec.refs = rec.refs.filter(r => r.id !== refId); if (!rec.refs.length) rec.status = 'pendiente';
  if (!rec.refs.some(r => r.photoId === rec.coverId)) rec.coverId = rec.refs[0]?.photoId || null;
  await db.putRecord(rec); await db.addEvent({ recordId: rec.id, type: 'edicion', text: 'Foto de referencia eliminada' }); await refresh();
}
export async function logIdentification(result, extra = {}) {
  const ev = { recordId: result.state === 'identificado' ? result.top.record.id : null, type: 'identificacion', state: result.state, s: result.top?.s ?? null, theta: result.theta, cand: result.top?.record.code ?? null, ...extra };
  await db.addEvent(ev); STATE.session.unshift({ ...ev, at: Date.now() });
  if (ev.recordId) { const r = STATE.records.find(x => x.id === ev.recordId); if (r) { r.lastSeen = Date.now(); await db.putRecord(r); } }
  emit();
}
export { db };
