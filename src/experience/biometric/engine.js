/* =============================================================================
   MOTOR DE COMPARACIÓN Y REGLA DE DECISIÓN (X₅ de V27) — independiente de la UI.
   · Similitud coseno entre vectores normalizados (= producto punto).
   · Puntuación por bovino s_k = máx_j sim(u, v_kj) sobre sus fotos de referencia.
   · Candidato ĉ = argmáx s_k (vecino más próximo, 1-NN).
   · Umbral θ calibrado con las referencias registradas (como V27 con S1):
       θ* = mínimo θ (rejilla 0,001) con FMR(θ) = 0 entre pares de bovinos distintos;
       si θ* rechaza más del 10 % de pares del mismo bovino → θ_EER.
   · Decisión:
       s < θ                       → «no identificado» (en V27: no concluyente por umbral)
       empate a 0,001 con el 2.º  → «no concluyente»  (en V27: no concluyente por empate)
       en otro caso               → «identificado»
   No se añade ningún margen extra que V27 no define.
   ============================================================================= */
export const round3 = x => Math.round(x * 1000) / 1000;
export function dot(a, b) { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[i]; return s; }

/** Referencias planas a partir de los registros. */
export function flatten(records) {
  const out = [];
  for (const r of records) for (const ref of r.refs || []) if (ref.vector) out.push({ recordId: r.id, code: r.code, refId: ref.id, hash: ref.hash, vector: ref.vector, cropId: ref.cropId });
  return out;
}

export const PROVISIONAL_THETA = 0.9;

/** Registros que comparten una misma foto se consideran el mismo animal (registro duplicado). */
function duplicateGroups(records) {
  const parent = new Map(records.map(r => [r.id, r.id])), find = x => parent.get(x) === x ? x : find(parent.get(x)), byHash = new Map();
  for (const r of records) for (const f of r.refs || []) { if (!f.hash) continue; if (byHash.has(f.hash)) parent.set(find(r.id), find(byHash.get(f.hash))); else byHash.set(f.hash, r.id); }
  return id => find(id);
}
export function calibrate(records) {
  const R = flatten(records), G = [], I = [], grp = duplicateGroups(records);
  let skipped = 0;
  for (let a = 0; a < R.length; a++) for (let b = a + 1; b < R.length; b++) {
    if (R[a].hash && R[a].hash === R[b].hash) continue; // la misma foto guardada en dos registros no es un par independiente
    const same = R[a].recordId === R[b].recordId;
    if (!same && grp(R[a].recordId) === grp(R[b].recordId)) { skipped++; continue; } // registro duplicado: ni genuino ni impostor
    (same ? G : I).push(dot(R[a].vector, R[b].vector));
  }
  const res = { duplicatePairs: skipped, genuine: G.length, impostor: I.length, refs: R.length, records: records.filter(r => r.refs?.length).length };
  if (!I.length) return { ...res, theta: PROVISIONAL_THETA, rule: 'θ provisional (se necesitan al menos dos bovinos con referencias)', provisional: true };
  const Is = Float64Array.from(I).sort(), Gs = Float64Array.from(G).sort();
  const countGE = (arr, t) => { let lo = 0, hi = arr.length; while (lo < hi) { const m = (lo + hi) >> 1; if (arr[m] >= t) hi = m; else lo = m + 1; } return arr.length - lo; };
  const FMR = t => countGE(Is, t) / Is.length, FNMR = t => Gs.length ? 1 - countGE(Gs, t) / Gs.length : 0;
  let thetaStar = 1; for (let i = 0; i <= 1000; i++) { const t = i / 1000; if (FMR(t) === 0) { thetaStar = t; break; } }
  let best = 0, bd = 9; for (let i = 0; i <= 1000; i++) { const t = i / 1000, d = Math.abs(FMR(t) - FNMR(t)); if (d < bd) { bd = d; best = t; } }
  const fnmrStar = FNMR(thetaStar), useEER = Gs.length > 0 && fnmrStar > 0.1;
  return {
    ...res, thetaStar, thetaEER: best, fnmrStar, useEER, theta: useEER ? best : thetaStar,
    maxImpostor: Is[Is.length - 1], minGenuine: Gs.length ? Gs[0] : null,
    rule: useEER ? 'θ_EER: θ* rechazaba más del 10 % de pares del mismo bovino' : 'θ* = mín {θ : FMR(θ) = 0}',
  };
}

/** Compara una consulta contra la galería y aplica la regla de decisión. */
export function identify(u, records, cal) {
  const t0 = performance.now();
  const per = new Map();
  for (const r of records) {
    let best = -Infinity, bestRef = null; const sims = [];
    for (const ref of r.refs || []) { if (!ref.vector) continue; const s = dot(u, ref.vector); sims.push(s); if (s > best) { best = s; bestRef = ref; } }
    if (bestRef) per.set(r.id, { record: r, s: best, ref: bestRef, sims });
  }
  const order = [...per.values()].sort((a, b) => b.s - a.s);
  const top = order[0] || null, second = order[1] || null, theta = cal.theta;
  let state = 'vacio';
  if (top) {
    if (top.s < theta) state = 'no-identificado';
    else if (second && round3(top.s) === round3(second.s)) state = 'no-concluyente';
    else state = 'identificado';
  }
  return { state, top, second, order, theta, diff: top && second ? top.s - second.s : null, comparisons: order.reduce((n, o) => n + o.sims.length, 0), ms: performance.now() - t0 };
}

export const STATES = {
  identificado: { title: 'Identificado', tone: 'ok', text: 'La foto coincide con un bovino registrado: su puntuación supera el umbral y no hay empate.' },
  'no-identificado': { title: 'No identificado', tone: 'warn', text: 'No se encontró un bovino que cumpla las condiciones de identificación: ninguna puntuación alcanza el umbral θ.', v27: 'En V27 este caso se registra como «no concluyente» por umbral.' },
  'no-concluyente': { title: 'No concluyente', tone: 'tie', text: 'Dos registros empatan en la puntuación más alta: el sistema no tiene evidencia suficiente para asignar una identidad con seguridad.', v27: 'En V27: «no concluyente» por empate (resolución 0,001).' },
  vacio: { title: 'Sin registros', tone: 'warn', text: 'No hay bovinos registrados con fotos de referencia para comparar.' },
};
