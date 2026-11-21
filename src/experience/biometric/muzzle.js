/* =============================================================================
   TEXTURA PROCEDURAL DEL PLANO NASO-LABIAL (una distinta por bovino, con semilla)
   Patrón de «perlas» poligonales separadas por surcos, más alargadas hacia los
   bordes, con surco central (filtrum). Se generan dos mapas: color y relieve.
   Es una representación visual sintética del rasgo, no una fotografía real.
   ============================================================================= */
import { mulberry32 } from '../../shared/rng.js';

export const PIGMENT = {
  pigmentado: { bead: [96, 88, 92], groove: [22, 20, 22], label: 'Pigmentado' },
  claro: { bead: [172, 122, 116], groove: [112, 72, 70], label: 'Claro' },
  mixto: { bead: [150, 112, 108], groove: [52, 42, 44], label: 'Mixto' },
};

function valueNoise(rng, gw = 8) {
  const g = new Float32Array((gw + 1) * (gw + 1)).map(() => rng());
  return (x, y) => { // x,y se envuelven a [0,1)
    x -= Math.floor(x); y -= Math.floor(y);
    const fx = x * gw, fy = y * gw, ix = Math.min(gw - 1, Math.floor(fx)), iy = Math.min(gw - 1, Math.floor(fy)), tx = fx - ix, ty = fy - iy;
    const s = t => t * t * (3 - 2 * t), a = g[iy * (gw + 1) + ix], b = g[iy * (gw + 1) + ix + 1], c = g[(iy + 1) * (gw + 1) + ix], d = g[(iy + 1) * (gw + 1) + ix + 1];
    return (a * (1 - s(tx)) + b * s(tx)) * (1 - s(ty)) + (c * (1 - s(tx)) + d * s(tx)) * s(ty);
  };
}

/**
 * @param {number} seed   semilla del bovino
 * @param {string} pigment pigmentado | claro | mixto
 * @param {string} condition limpio | barro | pasto
 */
export function generateMuzzle(seed, pigment = 'pigmentado', condition = 'limpio', size = 640, nostrils = []) {
  const rng = mulberry32(seed * 7919 + 13), W = size, H = size;
  // rasgos individuales del animal: tamaño de las perlas, ancho de los surcos, alargamiento
  // y mapa de pigmentación (manchas grandes claras/oscuras propias de cada hocico)
  const ind = { scale: 0.68 + 0.72 * rng(), groove: 0.06 + 0.07 * rng(), stretch: 0.3 + 1.3 * rng(), blot: 0.15 + 0.7 * rng(), blotGrid: 2 + Math.floor(rng() * 4), tone: 0.82 + 0.36 * rng(), warm: (rng() - 0.5) * 0.25 };
  const cell = size / 36 / ind.scale, gw = Math.ceil(W / cell) + 2, gh = Math.ceil(H / cell) + 2, seeds = [];
  for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) seeds.push([(i - 1 + 0.15 + 0.7 * rng()) * cell, (j - 1 + 0.15 + 0.7 * rng()) * cell, 0.7 + 0.6 * rng(), rng()]);
  const low = valueNoise(rng, 6), mid = valueNoise(rng, 18), mixMask = valueNoise(rng, 4), blotMask = valueNoise(rng, ind.blotGrid);
  const P = PIGMENT[pigment] || PIGMENT.pigmentado;
  const colorC = document.createElement('canvas'); colorC.width = W; colorC.height = H;
  const bumpC = document.createElement('canvas'); bumpC.width = W; bumpC.height = H;
  const ci = colorC.getContext('2d').createImageData(W, H), bi = bumpC.getContext('2d').createImageData(W, H), cd = ci.data, bd = bi.data;
  for (let y = 0; y < H; y++) {
    const v = y / H;
    for (let x = 0; x < W; x++) {
      const u = x / W;
      // anisotropía: cerca de los bordes y del labio las perlas se alargan (crestas)
      const cxn = (u - 0.5) * 2, edge = Math.min(1, Math.abs(cxn) * 1.15);
      const stretchY = 1 + ind.stretch * edge * edge, warp = (low(u, v) - 0.5) * cell * 1.2;
      const px = x + warp, py = (y - H / 2) / stretchY + H / 2 + warp * 0.6;
      const gi = Math.floor(px / cell) + 1, gj = Math.floor(py / cell) + 1;
      let f1 = 1e9, f2 = 1e9, sh = 1, tone = 0.5;
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
        const s = seeds[(gj + dj) * gw + gi + di]; if (!s) continue;
        const dx = px - s[0], dy = py - s[1], d = Math.sqrt(dx * dx + dy * dy) * s[2];
        if (d < f1) { f2 = f1; f1 = d; sh = s[2]; tone = s[3]; } else if (d < f2) f2 = d;
      }
      const e = f2 - f1, grooveW = cell * ind.groove;
      const groove = e < grooveW ? 1 - e / grooveW : 0;
      let h = Math.min(1, e / (cell * 0.5)); h = Math.pow(h, 0.6) * (0.8 + 0.2 * mid(u, v));
      // filtrum: surco central vertical en la mitad inferior
      const phil = Math.exp(-Math.pow((u - 0.5) / 0.012, 2)) * Math.max(0, Math.min(1, (v - 0.48) * 4));
      h *= 1 - 0.85 * phil;
      // poros
      const pore = (f1 < cell * 0.07 && tone > 0.6) ? 1 : 0;
      let col;
      // manchas de pigmento: en «mixto» dominan; en los demás aparecen como islas del tono contrario
      const bm = blotMask(u * 0.999, v * 0.999);
      const mixT = pigment === 'mixto' ? Math.max(0, Math.min(1, (mixMask(u, v) * 0.5 + bm * 0.5 - 0.5 + ind.blot * 0.3) * 4))
        : pigment === 'pigmentado' ? Math.max(0, Math.min(1, (bm - 1 + ind.blot * 0.55) * 5))
        : 1 - Math.max(0, Math.min(1, (bm - 1 + ind.blot * 0.55) * 5));
      const bead = mixT === null ? P.bead : lerp3(PIGMENT.pigmentado.bead, PIGMENT.claro.bead, mixT);
      const grv = mixT === null ? P.groove : lerp3(PIGMENT.pigmentado.groove, PIGMENT.claro.groove, mixT);
      const shade = 0.82 + 0.3 * (tone - 0.5) + 0.12 * (low(u * 1.7, v * 1.7) - 0.5);
      col = bead.map((b, i) => (b * shade * ind.tone * (i === 0 ? 1 + ind.warm : i === 2 ? 1 - ind.warm : 1)) * (1 - groove) + grv[i] * groove);
      if (pore) col = col.map(c => c * 0.7);
      col = col.map(c => c * (1 - 0.55 * phil));
      // borde (transición con la piel con pelo)
      // fosas nasales: interior oscuro y borde húmedo
      for (const [nu, nv] of nostrils) { const dn = Math.hypot((u - nu) / 0.075, ((1 - v) - nv) / 0.06); if (dn < 1.25) { const t = Math.max(0, Math.min(1, (1.25 - dn) / 0.45)); col = col.map(c => c * (1 - 0.85 * t)); } }
      let hb = 255 * (0.18 + 0.82 * h * (1 - groove * 0.9));
      // condición del hocico
      if (condition !== 'limpio') {
        const n = valueNoise; // reutilizar ruido de baja frecuencia
        const m = condition === 'barro' ? mud(u, v, low, mid) : grass(u, v, seed);
        if (m > 0) {
          const mc = condition === 'barro' ? [96 + 20 * mid(u, v), 70 + 12 * mid(u, v), 44] : [86, 112, 48];
          col = col.map((c, i) => c * (1 - m) + mc[i] * m);
          hb = hb * (1 - m) + (condition === 'barro' ? 150 + 60 * mid(u * 3, v * 3) : 230) * m;
        }
      }
      const o = (y * W + x) * 4;
      cd[o] = col[0]; cd[o + 1] = col[1]; cd[o + 2] = col[2]; cd[o + 3] = 255;
      bd[o] = bd[o + 1] = bd[o + 2] = hb; bd[o + 3] = 255;
    }
  }
  colorC.getContext('2d').putImageData(ci, 0, 0); bumpC.getContext('2d').putImageData(bi, 0, 0);
  return { color: colorC, bump: bumpC };
}
function lerp3(a, b, t) { return a.map((v, i) => v * (1 - t) + b[i] * t); }
function mud(u, v, low, mid) {
  const n = low(u * 2.3 + 0.3, v * 2.1) * 0.7 + mid(u * 1.3, v * 1.1) * 0.3;
  const zone = Math.max(0, 1 - Math.hypot((u - 0.58) / 0.42, (v - 0.32) / 0.32));
  const t = n * 0.9 + zone * 0.6 - 0.62;
  return Math.max(0, Math.min(0.92, t * 5));
}
function grass(u, v, seed) {
  // briznas: segmentos finos con orientación pseudoaleatoria
  const r = mulberry32(seed * 31 + 5); let m = 0;
  for (let k = 0; k < 14; k++) {
    const cx = 0.2 + 0.6 * r(), cy = 0.2 + 0.6 * r(), a = r() * Math.PI, len = 0.08 + 0.12 * r();
    const dx = u - cx, dy = v - cy, along = dx * Math.cos(a) + dy * Math.sin(a), across = -dx * Math.sin(a) + dy * Math.cos(a);
    if (Math.abs(along) < len && Math.abs(across) < 0.006) m = Math.max(m, 0.9 * (1 - Math.abs(along) / len * 0.4));
  }
  return m;
}
