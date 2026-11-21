/* =============================================================================
   ALMACENAMIENTO LOCAL (IndexedDB) — registros de bovinos, fotografías,
   referencias biométricas (vectores de 2048 valores) e historial de eventos.
   Persiste al recargar. Si el navegador no permite IndexedDB (modo privado
   estricto), se usa memoria y se avisa.
   ============================================================================= */
const DB_NAME = 'nasoid-experience', VERSION = 1;
let dbp = null, memory = null;

function req(r) { return new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); }
function open() {
  if (dbp) return dbp;
  dbp = new Promise((res) => {
    if (!('indexedDB' in self)) { memory = mem(); return res(null); }
    const r = indexedDB.open(DB_NAME, VERSION);
    r.onupgradeneeded = () => {
      const db = r.result;
      if (!db.objectStoreNames.contains('records')) db.createObjectStore('records', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('photos')) db.createObjectStore('photos', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('events')) { const s = db.createObjectStore('events', { keyPath: 'id', autoIncrement: true }); s.createIndex('recordId', 'recordId'); }
      if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta', { keyPath: 'key' });
    };
    r.onsuccess = () => res(r.result);
    r.onerror = () => { memory = mem(); res(null); };
  });
  return dbp;
}
function mem() { return { records: new Map(), photos: new Map(), events: new Map(), meta: new Map(), seq: 1 }; }
async function tx(store, mode, fn) {
  const db = await open();
  if (!db) return fn(null);
  const t = db.transaction(store, mode), s = t.objectStore(store);
  // escuchar el fin de la transacción ANTES de trabajar: si termina primero, no se pierde el evento
  const done = new Promise((res, rej) => { t.oncomplete = res; t.onerror = () => rej(t.error); t.onabort = () => rej(t.error); });
  const out = await fn(s);
  await done;
  return out;
}
export const storage = { get persistent() { return !memory; } };
export function uid(prefix = 'id') { return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`; }

export async function allRecords() {
  const list = await tx('records', 'readonly', s => s ? req(s.getAll()) : [...memory.records.values()]);
  return list.sort((a, b) => a.code.localeCompare(b.code, 'es', { numeric: true }));
}
export async function getRecord(id) { return tx('records', 'readonly', s => s ? req(s.get(id)) : memory.records.get(id)); }
export async function putRecord(rec) { rec.updatedAt = Date.now(); return tx('records', 'readwrite', s => s ? req(s.put(rec)) : memory.records.set(rec.id, rec)); }
export async function deleteRecord(id) {
  const rec = await getRecord(id); if (!rec) return;
  const photoIds = new Set([rec.coverId, ...rec.refs.flatMap(r => [r.photoId, r.cropId])].filter(Boolean));
  const others = (await allRecords()).filter(r => r.id !== id);
  for (const o of others) for (const pid of [o.coverId, ...o.refs.flatMap(r => [r.photoId, r.cropId])]) photoIds.delete(pid); // fotos compartidas (registro duplicado)
  await tx('photos', 'readwrite', s => { for (const p of photoIds) s ? s.delete(p) : memory.photos.delete(p); });
  await tx('records', 'readwrite', s => s ? req(s.delete(id)) : memory.records.delete(id));
  await tx('events', 'readwrite', async s => {
    if (!s) { for (const [k, e] of memory.events) if (e.recordId === id) memory.events.delete(k); return; }
    const keys = await req(s.index('recordId').getAllKeys(id)); keys.forEach(k => s.delete(k));
  });
}
export async function putPhoto(blob, id = uid('foto')) { await tx('photos', 'readwrite', s => s ? req(s.put({ id, blob })) : memory.photos.set(id, { id, blob })); return id; }
export async function getPhoto(id) { if (!id) return null; const r = await tx('photos', 'readonly', s => s ? req(s.get(id)) : memory.photos.get(id)); return r?.blob || null; }
export async function addEvent(ev) { ev.at = ev.at || Date.now(); return tx('events', 'readwrite', s => s ? req(s.add(ev)) : (ev.id = memory.seq++, memory.events.set(ev.id, ev))); }
export async function events(recordId) {
  const all = await tx('events', 'readonly', s => s ? (recordId ? req(s.index('recordId').getAll(recordId)) : req(s.getAll())) : [...memory.events.values()].filter(e => !recordId || e.recordId === recordId));
  return all.sort((a, b) => b.at - a.at);
}
export async function getMeta(key, def = null) { const r = await tx('meta', 'readonly', s => s ? req(s.get(key)) : memory.meta.get(key)); return r ? r.value : def; }
export async function setMeta(key, value) { return tx('meta', 'readwrite', s => s ? req(s.put({ key, value })) : memory.meta.set(key, { key, value })); }
export async function resetAll() {
  for (const st of ['records', 'photos', 'events', 'meta']) await tx(st, 'readwrite', s => s ? req(s.clear()) : memory[st].clear());
}

/** URL de objeto en caché para mostrar fotos guardadas. */
const urlCache = new Map();
export async function photoURL(id) {
  if (!id) return '';
  if (urlCache.has(id)) return urlCache.get(id);
  const b = await getPhoto(id); if (!b) return '';
  const u = URL.createObjectURL(b); urlCache.set(id, u); return u;
}
export function canvasToBlob(c, type = 'image/jpeg', q = 0.9) { return new Promise(res => c.toBlob(res, type, q)); }
export async function blobToCanvas(blob) {
  const bmp = await createImageBitmap(blob); const c = document.createElement('canvas'); c.width = bmp.width; c.height = bmp.height; c.getContext('2d').drawImage(bmp, 0, 0); bmp.close?.(); return c;
}
