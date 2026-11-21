/* =============================================================================
   MALLADO DE CAMPOS DE DISTANCIA (Surface Nets) — geometría procedural
   Convierte una función de distancia con signo f(x, y, z) en una malla indexada
   con normales calculadas a partir del gradiente del campo.
   ============================================================================= */

/** Primitivas de distancia (Quílez) */
export const sd = {
  ellipsoid(px, py, pz, cx, cy, cz, rx, ry, rz) {
    const x = px - cx, y = py - cy, z = pz - cz;
    const k0 = Math.sqrt((x / rx) ** 2 + (y / ry) ** 2 + (z / rz) ** 2);
    const k1 = Math.sqrt((x / (rx * rx)) ** 2 + (y / (ry * ry)) ** 2 + (z / (rz * rz)) ** 2);
    return k1 < 1e-9 ? -Math.min(rx, ry, rz) : k0 * (k0 - 1) / k1;
  },
  sphere(px, py, pz, cx, cy, cz, r) { return Math.hypot(px - cx, py - cy, pz - cz) - r; },
  capsule(px, py, pz, ax, ay, az, bx, by, bz, r) {
    const pax = px - ax, pay = py - ay, paz = pz - az, bax = bx - ax, bay = by - ay, baz = bz - az;
    const h = Math.max(0, Math.min(1, (pax * bax + pay * bay + paz * baz) / (bax * bax + bay * bay + baz * baz)));
    return Math.hypot(pax - bax * h, pay - bay * h, paz - baz * h) - r;
  },
  /** cono redondeado entre a (radio r1) y b (radio r2) */
  roundCone(px, py, pz, ax, ay, az, bx, by, bz, r1, r2) {
    const bax = bx - ax, bay = by - ay, baz = bz - az, l2 = bax * bax + bay * bay + baz * baz, rr = r1 - r2, a2 = l2 - rr * rr, il2 = 1 / l2;
    const pax = px - ax, pay = py - ay, paz = pz - az, y = pax * bax + pay * bay + paz * baz, z = y - l2;
    const qx = pax * l2 - bax * y, qy = pay * l2 - bay * y, qz = paz * l2 - baz * y, x2 = qx * qx + qy * qy + qz * qz, y2 = y * y * l2, z2 = z * z * l2;
    const k = Math.sign(rr) * rr * rr * x2;
    if (Math.sign(z) * a2 * z2 > k) return Math.sqrt(x2 + z2) * il2 - r2;
    if (Math.sign(y) * a2 * y2 < k) return Math.sqrt(x2 + y2) * il2 - r1;
    return (Math.sqrt(x2 * a2 * il2) + y * rr) * il2 - r1;
  },
};
export function smin(a, b, k) { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25; }
export function smax(a, b, k) { return -smin(-a, -b, k); }

/**
 * Surface Nets sobre una rejilla regular.
 * @returns {{positions: Float32Array, normals: Float32Array, indices: Uint32Array}}
 */
export function surfaceNets(f, bmin, bmax, h) {
  const nx = Math.ceil((bmax[0] - bmin[0]) / h) + 1, ny = Math.ceil((bmax[1] - bmin[1]) / h) + 1, nz = Math.ceil((bmax[2] - bmin[2]) / h) + 1;
  const F = new Float32Array(nx * ny * nz);
  for (let k = 0; k < nz; k++) { const z = bmin[2] + k * h; for (let j = 0; j < ny; j++) { const y = bmin[1] + j * h; let o = nx * (j + ny * k); for (let i = 0; i < nx; i++) F[o++] = f(bmin[0] + i * h, y, z); } }
  const idx = (i, j, k) => i + nx * (j + ny * k);
  const cx = nx - 1, cy = ny - 1, cz = nz - 1, cellV = new Int32Array(cx * cy * cz).fill(-1);
  const pos = [];
  const corner = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]];
  const edges = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
  const vals = new Float32Array(8);
  let nv = 0;
  for (let k = 0; k < cz; k++) for (let j = 0; j < cy; j++) for (let i = 0; i < cx; i++) {
    let mask = 0;
    for (let c = 0; c < 8; c++) { const v = F[idx(i + corner[c][0], j + corner[c][1], k + corner[c][2])]; vals[c] = v; if (v < 0) mask |= 1 << c; }
    if (mask === 0 || mask === 255) continue;
    let sx = 0, sy = 0, sz = 0, n = 0;
    for (const [a, b] of edges) {
      const va = vals[a], vb = vals[b];
      if ((va < 0) === (vb < 0)) continue;
      const t = va / (va - vb), A = corner[a], B = corner[b];
      sx += A[0] + (B[0] - A[0]) * t; sy += A[1] + (B[1] - A[1]) * t; sz += A[2] + (B[2] - A[2]) * t; n++;
    }
    pos.push(bmin[0] + (i + sx / n) * h, bmin[1] + (j + sy / n) * h, bmin[2] + (k + sz / n) * h);
    cellV[i + cx * (j + cy * k)] = nv++;
  }
  const cid = (i, j, k) => cellV[i + cx * (j + cy * k)];
  const ind = [];
  const quad = (a, b, c, d, flip) => { if (a < 0 || b < 0 || c < 0 || d < 0) return; if (flip) ind.push(a, d, c, a, c, b); else ind.push(a, b, c, a, c, d); };
  for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const v0 = F[idx(i, j, k)] < 0;
    if (i < cx && j > 0 && k > 0 && j < ny && k < nz) { const v1 = F[idx(i + 1, j, k)] < 0; if (v0 !== v1) quad(cid(i, j - 1, k - 1), cid(i, j, k - 1), cid(i, j, k), cid(i, j - 1, k), !v0); }
    if (j < cy && i > 0 && k > 0) { const v1 = F[idx(i, j + 1, k)] < 0; if (v0 !== v1) quad(cid(i - 1, j, k - 1), cid(i - 1, j, k), cid(i, j, k), cid(i, j, k - 1), !v0); }
    if (k < cz && i > 0 && j > 0) { const v1 = F[idx(i, j, k + 1)] < 0; if (v0 !== v1) quad(cid(i - 1, j - 1, k), cid(i, j - 1, k), cid(i, j, k), cid(i - 1, j, k), !v0); }
  }
  const P = new Float32Array(pos), N = new Float32Array(P.length), e = h * 0.5;
  for (let v = 0; v < nv; v++) {
    let x = P[v * 3], y = P[v * 3 + 1], z = P[v * 3 + 2];
    let gx = f(x + e, y, z) - f(x - e, y, z), gy = f(x, y + e, z) - f(x, y - e, z), gz = f(x, y, z + e) - f(x, y, z - e);
    let gl = Math.hypot(gx, gy, gz) || 1; gx /= gl; gy /= gl; gz /= gl;
    // un paso de Newton para proyectar el vértice sobre la superficie
    const d = f(x, y, z); x -= d * gx; y -= d * gy; z -= d * gz; P[v * 3] = x; P[v * 3 + 1] = y; P[v * 3 + 2] = z;
    gx = f(x + e, y, z) - f(x - e, y, z); gy = f(x, y + e, z) - f(x, y - e, z); gz = f(x, y, z + e) - f(x, y, z - e); gl = Math.hypot(gx, gy, gz) || 1;
    N[v * 3] = gx / gl; N[v * 3 + 1] = gy / gl; N[v * 3 + 2] = gz / gl;
  }
  // Orientación consistente: cada triángulo debe mirar hacia el gradiente (hacia afuera)
  const I = new Uint32Array(ind);
  for (let t = 0; t < I.length; t += 3) {
    const a = I[t] * 3, b = I[t + 1] * 3, c = I[t + 2] * 3;
    const ux = P[b] - P[a], uy = P[b + 1] - P[a + 1], uz = P[b + 2] - P[a + 2], vx = P[c] - P[a], vy = P[c + 1] - P[a + 1], vz = P[c + 2] - P[a + 2];
    const fx = uy * vz - uz * vy, fy = uz * vx - ux * vz, fz = ux * vy - uy * vx;
    const nx2 = N[a] + N[b] + N[c], ny2 = N[a + 1] + N[b + 1] + N[c + 1], nz2 = N[a + 2] + N[b + 2] + N[c + 2];
    if (fx * nx2 + fy * ny2 + fz * nz2 < 0) { const tmp = I[t + 1]; I[t + 1] = I[t + 2]; I[t + 2] = tmp; }
  }
  return { positions: P, normals: N, indices: I };
}
