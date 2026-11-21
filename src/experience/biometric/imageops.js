/* =============================================================================
   OPERACIONES REALES DE PREPROCESAMIENTO (equivalentes a las de OpenCV y Keras)
   Se ejecutan sobre píxeles reales en el navegador: recorte, cambio de tamaño,
   orientación, conversión de color, ecualización de histograma, CLAHE
   (Pizer et al., 1987) y preprocess_input de ResNet50 (Keras, s. f.-b).
   ============================================================================= */

export function canvasOf(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
export function cloneCanvas(src) { const c = canvasOf(src.width, src.height); c.getContext('2d').drawImage(src, 0, 0); return c; }

/** Rotación de 90° (corrección de orientación, como cv2.rotate). */
export function rotate90(src, cw = true) {
  const c = canvasOf(src.height, src.width), x = c.getContext('2d');
  x.translate(c.width / 2, c.height / 2); x.rotate((cw ? 1 : -1) * Math.PI / 2); x.drawImage(src, -src.width / 2, -src.height / 2);
  return c;
}
/** Recorte cuadrado de la región naso-labial (coordenadas en píxeles de la imagen original). */
export function crop(src, box) {
  const s = Math.max(1, Math.round(box.s)), c = canvasOf(s, s);
  c.getContext('2d').drawImage(src, Math.round(box.x), Math.round(box.y), s, s, 0, 0, s, s);
  return c;
}
/** Cambio de tamaño a N×N con interpolación bilineal propia (como cv2.resize INTER_LINEAR). */
export function resizeBilinear(src, N = 224) {
  const sw = src.width, sh = src.height, sd = src.getContext('2d').getImageData(0, 0, sw, sh).data;
  const out = canvasOf(N, N), ox = out.getContext('2d'), od = ox.createImageData(N, N), o = od.data;
  const fx = sw / N, fy = sh / N;
  for (let y = 0; y < N; y++) {
    const sy = Math.min(sh - 1, Math.max(0, (y + 0.5) * fy - 0.5)), y0 = Math.floor(sy), y1 = Math.min(sh - 1, y0 + 1), wy = sy - y0;
    for (let x = 0; x < N; x++) {
      const sx = Math.min(sw - 1, Math.max(0, (x + 0.5) * fx - 0.5)), x0 = Math.floor(sx), x1 = Math.min(sw - 1, x0 + 1), wx = sx - x0;
      const i00 = (y0 * sw + x0) * 4, i01 = (y0 * sw + x1) * 4, i10 = (y1 * sw + x0) * 4, i11 = (y1 * sw + x1) * 4, oi = (y * N + x) * 4;
      for (let c = 0; c < 3; c++) o[oi + c] = (sd[i00 + c] * (1 - wx) + sd[i01 + c] * wx) * (1 - wy) + (sd[i10 + c] * (1 - wx) + sd[i11 + c] * wx) * wy;
      o[oi + 3] = 255;
    }
  }
  ox.putImageData(od, 0, 0); return out;
}
export function getRGB(c) { return c.getContext('2d').getImageData(0, 0, c.width, c.height); }

/** Luminancia como cv2.cvtColor(BGR2GRAY): Y = 0,299 R + 0,587 G + 0,114 B */
export function luminance(img) {
  const d = img.data, n = img.width * img.height, L = new Uint8ClampedArray(n);
  for (let i = 0; i < n; i++) L[i] = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2];
  return L;
}
export function histogram(L) { const h = new Uint32Array(256); for (let i = 0; i < L.length; i++) h[L[i]]++; return h; }

/** Ecualización global de histograma (algoritmo de cv2.equalizeHist). */
export function equalize(L) {
  const h = histogram(L), n = L.length; let cdf = 0, cdfMin = 0; const lut = new Uint8ClampedArray(256);
  for (let i = 0; i < 256; i++) if (h[i]) { cdfMin = h[i]; break; }
  for (let i = 0; i < 256; i++) { cdf += h[i]; lut[i] = Math.round(((cdf - cdfMin) / Math.max(1, n - cdfMin)) * 255); }
  const out = new Uint8ClampedArray(n); for (let i = 0; i < n; i++) out[i] = lut[L[i]]; return out;
}
/** CLAHE: ecualización adaptativa por mosaicos con límite de contraste e interpolación bilineal. */
export function clahe(L, W, H, tiles = 8, clip = 2.0) {
  const tw = W / tiles, th = H / tiles, maps = [];
  for (let ty = 0; ty < tiles; ty++) for (let tx = 0; tx < tiles; tx++) {
    const hist = new Float64Array(256);
    const x0 = Math.floor(tx * tw), x1 = Math.floor((tx + 1) * tw), y0 = Math.floor(ty * th), y1 = Math.floor((ty + 1) * th), n = Math.max(1, (x1 - x0) * (y1 - y0));
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) hist[L[y * W + x]]++;
    const lim = Math.max(1, clip * n / 256); let ex = 0;
    for (let i = 0; i < 256; i++) if (hist[i] > lim) { ex += hist[i] - lim; hist[i] = lim; }
    const add = ex / 256, map = new Uint8Array(256); let c = 0;
    for (let i = 0; i < 256; i++) { c += hist[i] + add; map[i] = Math.min(255, Math.round(c / n * 255)); }
    maps.push(map);
  }
  const out = new Uint8ClampedArray(W * H);
  for (let y = 0; y < H; y++) {
    const gy = (y + 0.5) / th - 0.5, y0 = Math.max(0, Math.floor(gy)), y1 = Math.min(tiles - 1, y0 + 1), fy = Math.min(1, Math.max(0, gy - y0));
    for (let x = 0; x < W; x++) {
      const gx = (x + 0.5) / tw - 0.5, x0 = Math.max(0, Math.floor(gx)), x1 = Math.min(tiles - 1, x0 + 1), fx = Math.min(1, Math.max(0, gx - x0)), v = L[y * W + x];
      const a = maps[y0 * tiles + x0][v], b = maps[y0 * tiles + x1][v], c = maps[y1 * tiles + x0][v], d = maps[y1 * tiles + x1][v];
      out[y * W + x] = (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
    }
  }
  return out;
}
/** Reemplaza el canal Y en YCrCb y vuelve a RGB (el color se conserva, cambia el contraste). */
export function replaceLuma(img, Lnew) {
  const d = img.data, out = new ImageData(img.width, img.height), o = out.data, n = img.width * img.height;
  for (let i = 0; i < n; i++) {
    const r = d[i * 4], g = d[i * 4 + 1], b = d[i * 4 + 2];
    const Y = 0.299 * r + 0.587 * g + 0.114 * b, Cr = (r - Y) * 0.713 + 128, Cb = (b - Y) * 0.564 + 128, Yn = Lnew[i];
    o[i * 4] = Yn + 1.403 * (Cr - 128); o[i * 4 + 1] = Yn - 0.714 * (Cr - 128) - 0.344 * (Cb - 128); o[i * 4 + 2] = Yn + 1.773 * (Cb - 128); o[i * 4 + 3] = 255;
  }
  return out;
}
export function grayToImage(L, W, H) { const im = new ImageData(W, H); for (let i = 0; i < W * H; i++) { im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = L[i]; im.data[i * 4 + 3] = 255; } return im; }
export function imageToCanvas(im) { const c = canvasOf(im.width, im.height); c.getContext('2d').putImageData(im, 0, 0); return c; }

/** keras.applications.resnet50.preprocess_input (modo «caffe»): RGB→BGR y resta de la media de ImageNet. */
export const IMAGENET_MEAN_BGR = [103.939, 116.779, 123.68];
export function preprocessInput(img) {
  const n = img.width * img.height, t = new Float32Array(n * 3), d = img.data;
  for (let i = 0; i < n; i++) { t[i * 3] = d[i * 4 + 2] - IMAGENET_MEAN_BGR[0]; t[i * 3 + 1] = d[i * 4 + 1] - IMAGENET_MEAN_BGR[1]; t[i * 3 + 2] = d[i * 4] - IMAGENET_MEAN_BGR[2]; }
  const stats = [0, 1, 2].map(c => { let mn = Infinity, mx = -Infinity, s = 0; for (let i = 0; i < n; i++) { const v = t[i * 3 + c]; if (v < mn) mn = v; if (v > mx) mx = v; s += v; } return { min: mn, max: mx, mean: s / n }; });
  return { tensor: t, shape: [img.height, img.width, 3], stats };
}
/** Mapa de un canal del tensor (azul = negativo, cálido = positivo) para visualizar la normalización. */
export function tensorChannelImage(pre, c) {
  const [H, W] = pre.shape, im = new ImageData(W, H), t = pre.tensor;
  for (let i = 0; i < W * H; i++) { const v = Math.max(-1, Math.min(1, t[i * 3 + c] / 128)); const a = Math.abs(v);
    im.data[i * 4] = v > 0 ? 246 * a + 30 * (1 - a) : 30 * (1 - a) + 60 * a; im.data[i * 4 + 1] = v > 0 ? 170 * a + 30 * (1 - a) : 30 * (1 - a) + 110 * a; im.data[i * 4 + 2] = v > 0 ? 60 * a + 28 * (1 - a) : 28 * (1 - a) + 170 * a; im.data[i * 4 + 3] = 255; }
  return im;
}
/** Desenfoque de caja (para simular una toma movida). */
export function boxBlur(c, r = 4) {
  const W = c.width, H = c.height, src = c.getContext('2d').getImageData(0, 0, W, H), d = src.data, tmp = new Float32Array(W * H * 4), out = new ImageData(W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let s0 = 0, s1 = 0, s2 = 0, n = 0; for (let k = -r; k <= r; k++) { const xx = Math.min(W - 1, Math.max(0, x + k)), i = (y * W + xx) * 4; s0 += d[i]; s1 += d[i + 1]; s2 += d[i + 2]; n++; } const o = (y * W + x) * 4; tmp[o] = s0 / n; tmp[o + 1] = s1 / n; tmp[o + 2] = s2 / n; }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let s0 = 0, s1 = 0, s2 = 0, n = 0; for (let k = -Math.round(r / 3); k <= Math.round(r / 3); k++) { const yy = Math.min(H - 1, Math.max(0, y + k)), i = (yy * W + x) * 4; s0 += tmp[i]; s1 += tmp[i + 1]; s2 += tmp[i + 2]; n++; } const o = (y * W + x) * 4; out.data[o] = s0 / n; out.data[o + 1] = s1 / n; out.data[o + 2] = s2 / n; out.data[o + 3] = 255; }
  const r2 = canvasOf(W, H); r2.getContext('2d').putImageData(out, 0, 0); return r2;
}
/** Varianza del laplaciano: indicador simple de nitidez (se usa para «calidad de foto»). */
export function sharpness(L, W, H) {
  let s = 0, s2 = 0, n = 0;
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const i = y * W + x; const v = 4 * L[i] - L[i - 1] - L[i + 1] - L[i - W] - L[i + W]; s += v; s2 += v * v; n++; }
  const m = s / n; return s2 / n - m * m;
}
/**
 * Filtros ILUSTRATIVOS para la escena de ResNet50 (Sobel y Gabor). No son los pesos de la red:
 * muestran el tipo de patrón (bordes, texturas orientadas) que detectan las primeras capas convolucionales.
 */
export function illustrativeMaps(L, W, H) {
  const conv = (k, ks) => { const out = new Float32Array(W * H), r = (ks - 1) / 2; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let s = 0; for (let j = 0; j < ks; j++) for (let i = 0; i < ks; i++) { const yy = Math.min(H - 1, Math.max(0, y + j - r)), xx = Math.min(W - 1, Math.max(0, x + i - r)); s += L[yy * W + xx] * k[j * ks + i]; } out[y * W + x] = s; } return out; };
  const gabor = (theta, lambda = 6, sigma = 2.6, ks = 9) => { const k = new Float32Array(ks * ks), r = (ks - 1) / 2; let m = 0; for (let j = 0; j < ks; j++) for (let i = 0; i < ks; i++) { const x = i - r, y = j - r, xr = x * Math.cos(theta) + y * Math.sin(theta), yr = -x * Math.sin(theta) + y * Math.cos(theta); const v = Math.exp(-(xr * xr + yr * yr) / (2 * sigma * sigma)) * Math.cos(2 * Math.PI * xr / lambda); k[j * ks + i] = v; m += v; } m /= ks * ks; for (let q = 0; q < k.length; q++) k[q] -= m; return k; };
  const sx = conv([-1, 0, 1, -2, 0, 2, -1, 0, 1], 3), sy = conv([-1, -2, -1, 0, 0, 0, 1, 2, 1], 3);
  const sob = new Float32Array(W * H); for (let i = 0; i < W * H; i++) sob[i] = Math.hypot(sx[i], sy[i]);
  const gab = [0, Math.PI / 4, Math.PI / 2, 3 * Math.PI / 4].map(t => conv(gabor(t), 9).map(v => Math.max(0, v)));
  return { sobel: sob, gabor: gab };
}
/** Agrupamiento promedio a S×S (ilustra la reducción espacial 224 → 112 → 56 → 28 → 14 → 7). */
export function avgPool(map, W, H, S) {
  const out = new Float32Array(S * S), bx = W / S, by = H / S;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { let s = 0, n = 0; for (let j = Math.floor(y * by); j < Math.floor((y + 1) * by); j++) for (let i = Math.floor(x * bx); i < Math.floor((x + 1) * bx); i++) { s += map[j * W + i]; n++; } out[y * S + x] = s / Math.max(1, n); }
  return out;
}
export function mapToCanvas(map, W, H, tint = [156, 194, 138]) {
  let mx = 0; for (const v of map) if (v > mx) mx = v; mx = mx || 1;
  const im = new ImageData(W, H); for (let i = 0; i < W * H; i++) { const t = Math.pow(map[i] / mx, 0.8); im.data[i * 4] = 14 + tint[0] * t; im.data[i * 4 + 1] = 22 + tint[1] * t; im.data[i * 4 + 2] = 18 + tint[2] * t; im.data[i * 4 + 3] = 255; }
  return imageToCanvas(im);
}
