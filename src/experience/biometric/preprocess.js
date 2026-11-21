/* =============================================================================
   PREPROCESAMIENTO (X₂/X₃ de V27): recorte de la región naso-labial, cambio de
   tamaño a 224 × 224 y medidas de calidad de la toma (nitidez y luz).
   La conversión a BGR y la resta de la media de ImageNet (preprocess_input)
   se aplican al crear el tensor, en extractor.js.
   ============================================================================= */
import { crop, resizeBilinear, getRGB, luminance } from './imageops.js';

/** Recorta y lleva a 224 × 224 midiendo cada paso. */
export function prepare(photo, box) {
  const t = {}; let a = performance.now();
  const c = crop(photo, box); t.recorte = performance.now() - a; a = performance.now();
  const r = resizeBilinear(c, 224); t.resize = performance.now() - a;
  return { crop: c, input: r, times: t, quality: quality(r) };
}

/** Nitidez (varianza del laplaciano) y brillo medio sobre la imagen de 224 px. */
export function quality(c) {
  const im = getRGB(c), L = luminance(im), W = c.width, H = c.height; let s = 0, s2 = 0, n = 0, mean = 0;
  for (let i = 0; i < L.length; i++) mean += L[i]; mean /= L.length;
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    const i = y * W + x, lap = 4 * L[i] - L[i - 1] - L[i + 1] - L[i - W] - L[i + W]; s += lap; s2 += lap * lap; n++;
  }
  const sharp = s2 / n - (s / n) ** 2;
  return { sharpness: sharp, brightness: mean, sharpOk: sharp > 60, lightOk: mean > 45 && mean < 215 };
}

/** Huella corta de los píxeles para reconocer la MISMA foto guardada dos veces. */
export function pixelHash(c) {
  const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let h = 2166136261;
  for (let i = 0; i < d.length; i += 37) { h ^= d[i]; h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(16);
}

/** Propuesta de recuadro cuadrado alrededor de puntos proyectados (en píxeles). */
export function squareBox(points, W, H, pad = 1.12) {
  const xs = points.map(p => p.x), ys = points.map(p => p.y);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  let s = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) * pad;
  s = Math.max(48, Math.min(s, W, H));
  return clampBox({ x: cx - s / 2, y: cy - s / 2, s }, W, H);
}
/** Recuadro cuadrado {x, y, s} dentro de la imagen. */
export function clampBox(b, W, H) {
  const s = Math.max(32, Math.min(b.s, W, H)); const x = Math.max(0, Math.min(W - s, b.x)), y = Math.max(0, Math.min(H - s, b.y));
  return { x, y, s };
}
export function centerBox(W, H, f = 0.6) { const s = Math.min(W, H) * f; return { x: (W - s) / 2, y: (H - s) / 2, s }; }
