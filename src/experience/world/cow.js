/* =============================================================================
   BOVINO PROCEDURAL DE CUERPO COMPLETO
   · Cuerpo, pecho, ancas, vientre, papada y cuello: campo de distancia (SDF)
     convertido en malla con Surface Nets una sola vez y compartido por la manada.
   · Cabeza: el mismo modelo SDF de la versión académica (cráneo, hocico, fosas
     nasales talladas) con dos niveles de detalle (LOD).
   · Patas articuladas (hombro/cadera, rodilla/corvejón), cola encadenada, orejas,
     párpados y respiración: todo animado por código.
   · Cada animal tiene su propio patrón naso-labial (textura con semilla).
   ============================================================================= */
import * as THREE from 'three';
import { sd, smin, smax, surfaceNets } from './mesher.js';
import { generateMuzzle } from '../biometric/muzzle.js';
import { mulberry32 } from '../../shared/rng.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const { ellipsoid, capsule, roundCone, sphere } = sd;

/* ---------------------------------------------------------------- cabeza -- */
export function headSDF(x, y, z) {
  const ax = Math.abs(x);
  let d = ellipsoid(x, y, z, 0, 0.07, -0.14, 0.108, 0.1, 0.128);
  d = smin(d, ellipsoid(x, y, z, 0, 0.074, -0.075, 0.1, 0.08, 0.11), 0.04);
  d = smin(d, capsule(x, y, z, -0.078, 0.148, -0.205, 0.078, 0.148, -0.205, 0.032), 0.05);
  d = smin(d, roundCone(x, y, z, 0, 0.05, -0.03, 0, 0.026, 0.19, 0.078, 0.056), 0.05);
  d = smin(d, roundCone(x, y, z, 0, -0.02, -0.03, 0, -0.036, 0.18, 0.08, 0.058), 0.05);
  let m = ellipsoid(x, y, z, 0, -0.02, 0.222, 0.088, 0.066, 0.072);
  m = smax(m, z - 0.288, 0.026);
  d = smin(d, m, 0.04);
  d = smin(d, ellipsoid(ax, y, z, 0.066, -0.048, -0.075, 0.05, 0.074, 0.085), 0.045);
  d = smin(d, roundCone(x, y, z, 0, -0.112, -0.12, 0, -0.09, 0.17, 0.058, 0.036), 0.045);
  d = smin(d, ellipsoid(x, y, z, 0, -0.09, 0.205, 0.05, 0.028, 0.05), 0.025);
  d = smin(d, ellipsoid(ax, y, z, 0.1, 0.072, -0.074, 0.042, 0.032, 0.048), 0.03);
  d = smin(d, roundCone(x, y, z, 0, -0.035, -0.21, 0, -0.16, -0.52, 0.1, 0.15), 0.08);
  d = smax(d, -sphere(ax, y, z, 0.119, 0.046, -0.064, 0.021), 0.012);
  d = smax(d, -capsule(ax, y, z, 0.062, -0.07, 0.12, 0.03, -0.074, 0.262, 0.0032), 0.006);
  const a = 0.45, c = Math.cos(a), s = Math.sin(a), lx = ax - 0.047, ly = y + 0.002;
  const rx = lx * c - ly * s, ry = lx * s + ly * c;
  d = smax(d, -ellipsoid(rx, ry, z, 0, 0, 0.292, 0.018, 0.0098, 0.034), 0.008);
  return d;
}
export function muzzleMask(x, y, z) {
  if (z < 0.196) return 0;
  return (x / 0.09) ** 2 + ((y + 0.008) / 0.064) ** 2 < 1 ? 1 : 0;
}
export const NOSTRILS_UV = [[(-0.047 + 0.095) / 0.19, (-0.002 + 0.078) / 0.142], [(0.047 + 0.095) / 0.19, (-0.002 + 0.078) / 0.142]];
/** Centro y semiejes de la región naso-labial en coordenadas de la cabeza. */
export const MUZZLE = { center: new THREE.Vector3(0, -0.01, 0.288), rx: 0.105, ry: 0.085 };

/* ---------------------------------------------------------------- cuerpo -- */
function bodySDF(x, y, z, hump = 0) {
  const ax = Math.abs(x);
  let d = ellipsoid(x, y, z, 0, 1.02, -0.02, 0.33, 0.35, 0.8);                            // barril
  d = smin(d, ellipsoid(x, y, z, 0, 0.98, 0.56, 0.29, 0.36, 0.36), 0.14);                 // pecho
  d = smin(d, ellipsoid(x, y, z, 0, 1.19, 0.48, 0.24, 0.19, 0.32), 0.12);                  // cruz
  d = smin(d, ellipsoid(x, y, z, 0, 1.1, -0.62, 0.32, 0.3, 0.36), 0.14);                   // ancas
  d = smin(d, sphere(ax, y, z, 0.2, 1.24, -0.48, 0.1), 0.12);                              // huesos de la cadera
  d = smin(d, capsule(x, y, z, 0, 1.22, -0.55, 0, 1.24, -0.96, 0.14), 0.12);               // grupa hacia la cola
  d = smin(d, ellipsoid(x, y, z, 0, 0.8, 0.02, 0.33, 0.25, 0.58), 0.18);                   // vientre
  d = smin(d, roundCone(x, y, z, 0, 1.1, 0.6, 0, 1.17, 0.98, 0.25, 0.16), 0.12);           // cuello
  d = smin(d, ellipsoid(x, y, z, 0, 0.84, 0.78, 0.055, 0.2 + hump * 0.06, 0.22), 0.08);    // papada
  d = smin(d, ellipsoid(ax, y, z, 0.19, 0.82, -0.56, 0.13, 0.3, 0.21), 0.1);               // muslos
  d = smin(d, ellipsoid(ax, y, z, 0.18, 0.8, 0.55, 0.11, 0.24, 0.13), 0.1);                // antebrazos
  if (hump) d = smin(d, ellipsoid(x, y, z, 0, 1.32, 0.52, 0.13, 0.16 * hump, 0.17), 0.1); // giba del cebú
  return d;
}

export const BREEDS = [
  { id: 'bon', name: 'Blanco Orejinegro', coat: [0.86, 0.83, 0.77], ear: [0.08, 0.07, 0.07], pigment: 'pigmentado', horns: true, earLen: 0.15, droop: 0.25, patches: null, dark: [0.18, 0.16, 0.15], hump: 0 },
  { id: 'normando', name: 'Normando', coat: [0.9, 0.87, 0.82], ear: [0.45, 0.22, 0.12], pigment: 'mixto', horns: true, earLen: 0.15, droop: 0.2, patches: [0.48, 0.24, 0.12], dark: [0.42, 0.2, 0.1], hump: 0 },
  { id: 'cebu', name: 'Cebú cruzado', coat: [0.8, 0.79, 0.76], ear: [0.62, 0.61, 0.59], pigment: 'pigmentado', horns: true, earLen: 0.21, droop: 1.0, patches: null, dark: [0.38, 0.38, 0.38], hump: 1 },
  { id: 'romo', name: 'Romosinuano', coat: [0.58, 0.29, 0.15], ear: [0.5, 0.25, 0.12], pigment: 'mixto', horns: false, earLen: 0.14, droop: 0.15, patches: null, dark: [0.4, 0.18, 0.09], hump: 0 },
  { id: 'holstein', name: 'Holstein', coat: [0.93, 0.92, 0.89], ear: [0.06, 0.06, 0.06], pigment: 'mixto', horns: false, earLen: 0.15, droop: 0.2, patches: [0.06, 0.06, 0.06], dark: [0.06, 0.06, 0.06], hump: 0 },
  { id: 'brahman', name: 'Brahman rojo', coat: [0.62, 0.36, 0.22], ear: [0.55, 0.32, 0.2], pigment: 'claro', horns: true, earLen: 0.22, droop: 1.0, patches: null, dark: [0.42, 0.22, 0.13], hump: 1 },
];

/* ----------------------------------------------------- geometrías comunes -- */
let SHARED = null;
function splitMuzzle(mesh) {
  const { positions: P, normals: N, indices: I } = mesh, nv = P.length / 3, coat = [], muz = [];
  for (let t = 0; t < I.length; t += 3) {
    const a = I[t] * 3, b = I[t + 1] * 3, c = I[t + 2] * 3;
    const mx = (P[a] + P[b] + P[c]) / 3, my = (P[a + 1] + P[b + 1] + P[c + 1]) / 3, mz = (P[a + 2] + P[b + 2] + P[c + 2]) / 3;
    (muzzleMask(mx, my, mz) && N[a + 2] + N[b + 2] + N[c + 2] > 0.9 ? muz : coat).push(I[t], I[t + 1], I[t + 2]);
  }
  const uv = new Float32Array(nv * 2);
  for (let v = 0; v < nv; v++) { uv[v * 2] = (P[v * 3] + 0.095) / 0.19; uv[v * 2 + 1] = (P[v * 3 + 1] + 0.078) / 0.142; }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.BufferAttribute(N, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.setIndex([...coat, ...muz]); g.addGroup(0, coat.length, 0); g.addGroup(coat.length, muz.length, 1); g.computeBoundingSphere();
  return g;
}
function plainGeometry(mesh) {
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(mesh.positions, 3)); g.setAttribute('normal', new THREE.BufferAttribute(mesh.normals, 3));
  g.setIndex(Array.from(mesh.indices)); g.computeBoundingSphere(); return g;
}
function aoFor(g, f, step) {
  const P = g.attributes.position.array, N = g.attributes.normal.array, nv = P.length / 3, ao = new Float32Array(nv);
  for (let v = 0; v < nv; v++) {
    let occ = 0, w = 1;
    for (let i = 1; i <= 4; i++) { const hh = step * i; const d = f(P[v * 3] + N[v * 3] * hh, P[v * 3 + 1] + N[v * 3 + 1] * hh, P[v * 3 + 2] + N[v * 3 + 2] * hh); occ += (hh - d) * w; w *= 0.6; }
    ao[v] = Math.max(0.4, Math.min(1, 1 - occ * (0.13 / step)));
  }
  return ao;
}
function earGeometry(L, W = 0.062, C = 0.03) {
  const nu = 20, nv = 10, pos = [], ind = [];
  for (let i = 0; i <= nu; i++) {
    const u = i / nu, w = W * Math.pow(Math.sin(Math.PI * Math.min(1, u * 0.98 + 0.02)), 0.65) * (1 - 0.3 * u) + 0.012 * (1 - u);
    for (let j = 0; j <= nv; j++) { const v = j / nv * 2 - 1; pos.push(u * L, C * (1 - v * v) * Math.sin(Math.PI * Math.min(1, u * 1.1)) - 0.012 * u * u, v * w); }
  }
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) { const a = i * (nv + 1) + j, b = a + nv + 1; ind.push(a, b, a + 1, b, b + 1, a + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(ind); g.computeVertexNormals(); return g;
}
function hornGeometry() {
  const curve = new THREE.CubicBezierCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.05, 0.02, -0.01), new THREE.Vector3(0.09, 0.07, 0.01), new THREE.Vector3(0.1, 0.12, 0.04));
  const seg = 16, rad = 8, frames = curve.computeFrenetFrames(seg, false), pos = [], col = [], ind = [];
  for (let i = 0; i <= seg; i++) {
    const t = i / seg, p = curve.getPointAt(t), r = 0.017 * Math.pow(1 - t, 0.85) + 0.0015, N = frames.normals[i], B = frames.binormals[i], sh = 0.82 - 0.6 * Math.pow(t, 2.2);
    for (let j = 0; j <= rad; j++) { const a = j / rad * Math.PI * 2; pos.push(p.x + r * (Math.cos(a) * N.x + Math.sin(a) * B.x), p.y + r * (Math.cos(a) * N.y + Math.sin(a) * B.y), p.z + r * (Math.cos(a) * N.z + Math.sin(a) * B.z)); col.push(sh * 0.95, sh * 0.9, sh * 0.78); }
  }
  for (let i = 0; i < seg; i++) for (let j = 0; j < rad; j++) { const a = i * (rad + 1) + j, b = a + rad + 1; ind.push(a, b, a + 1, b, b + 1, a + 1); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(ind); g.computeVertexNormals(); return g;
}
function legGeometry(r0, r1, len) { const g = new THREE.CylinderGeometry(r0, r1, len, 16, 3); g.translate(0, -len / 2, 0); return g; }
/** Pata con perfil anatómico (revolución): músculo arriba, caña delgada y menudillo abultado abajo. */
function shapedLeg(r0, r1, len, muscle, fetlock) {
  const pts = [];
  for (let i = 0; i <= 16; i++) { const t = i / 16; let r = THREE.MathUtils.lerp(r0, r1, Math.pow(t, 0.8)); r *= 1 + muscle * Math.exp(-((t - 0.22) ** 2) / 0.02) + fetlock * Math.exp(-((t - 0.9) ** 2) / 0.004); pts.push(new THREE.Vector2(r, -t * len)); }
  pts.unshift(new THREE.Vector2(0.001, 0)); pts.push(new THREE.Vector2(0.001, -len));
  const g = new THREE.LatheGeometry(pts.reverse(), 18); g.scale(1, 1, 0.82); g.computeVertexNormals(); return g;
}
/** Pezuña hendida: dos mitades con una ranura al frente. */
function hoofGeometry() {
  const half = sx => { const g = new THREE.CylinderGeometry(0.042, 0.058, 0.085, 12, 1, false, sx < 0 ? Math.PI : 0, Math.PI); g.translate(sx * 0.006, -0.042, 0.012); return g; };
  return mergeGeometries([half(-1), half(1)]);
}
function furTexture() {
  const S = 256, c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d');
  x.fillStyle = '#808080'; x.fillRect(0, 0, S, S); const r = mulberry32(99);
  for (let i = 0; i < 2400; i++) { const px = r() * S, py = r() * S, len = 4 + r() * 9, l = 90 + r() * 90; x.strokeStyle = `rgb(${l},${l},${l})`; x.lineWidth = 0.8 + r() * 0.8; x.globalAlpha = 0.5; x.beginPath(); x.moveTo(px, py); x.lineTo(px + (r() - 0.5) * 1.5, py + len); x.stroke(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}

export function buildShared(quality = { level: 'alto' }) {
  if (SHARED) return SHARED;
  const t0 = performance.now();
  const hiStep = quality.level === 'bajo' ? 0.011 : quality.level === 'alto' ? 0.0058 : 0.0072; // cabeza más fina en calidad alta: silueta sin facetas
  const headHi = splitMuzzle(surfaceNets(headSDF, [-0.24, -0.3, -0.56], [0.24, 0.23, 0.33], hiStep));
  const headLo = splitMuzzle(surfaceNets(headSDF, [-0.24, -0.3, -0.56], [0.24, 0.23, 0.33], 0.015));
  const bodyStep = quality.level === 'bajo' ? 0.03 : 0.019; // malla más fina: silueta suave, sin facetas
  const body = plainGeometry(surfaceNets((x, y, z) => bodySDF(x, y, z, 0), [-0.5, 0.42, -1.15], [0.5, 1.5, 1.2], bodyStep));
  const bodyHump = plainGeometry(surfaceNets((x, y, z) => bodySDF(x, y, z, 1), [-0.5, 0.42, -1.15], [0.5, 1.62, 1.2], bodyStep));
  SHARED = {
    headHi, headLo, body, bodyHump,
    aoHeadHi: aoFor(headHi, headSDF, 0.006), aoHeadLo: aoFor(headLo, headSDF, 0.006),
    aoBody: aoFor(body, (x, y, z) => bodySDF(x, y, z, 0), 0.03), aoBodyHump: aoFor(bodyHump, (x, y, z) => bodySDF(x, y, z, 1), 0.03),
    horn: hornGeometry(), fur: furTexture(),
    legUpperF: shapedLeg(0.1, 0.06, 0.46, 0.22, 0), legLowerF: shapedLeg(0.054, 0.044, 0.4, 0.05, 0.22),
    legUpperR: shapedLeg(0.12, 0.062, 0.5, 0.25, 0), legLowerR: shapedLeg(0.054, 0.044, 0.42, 0.05, 0.22),
    joint: new THREE.SphereGeometry(1, 18, 12), hoof: hoofGeometry(),
    tailSeg: legGeometry(0.022, 0.016, 0.13), tuft: (() => { const g = new THREE.SphereGeometry(0.05, 16, 12); g.scale(0.8, 2.2, 0.8); g.translate(0, -0.09, 0); return g; })(),
    eye: new THREE.SphereGeometry(0.0185, 18, 12), lid: new THREE.TorusGeometry(0.0185, 0.0042, 8, 24),
    ms: 0,
  };
  SHARED.ms = performance.now() - t0;
  return SHARED;
}

/* -------------------------------------------------------- color del pelaje -- */
function noise3(x, y, z, seed) { const s = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719 + seed) * 43758.5453; return s - Math.floor(s); }
function smoothNoise(x, y, z, seed) {
  const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z), fx = x - ix, fy = y - iy, fz = z - iz, sm = t => t * t * (3 - 2 * t); let v = 0;
  for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) for (let c = 0; c < 2; c++) v += (a ? sm(fx) : 1 - sm(fx)) * (b ? sm(fy) : 1 - sm(fy)) * (c ? sm(fz) : 1 - sm(fz)) * noise3(ix + a, iy + b, iz + c, seed);
  return v;
}
/** Colores por vértice: pelaje de la raza, manchas con semilla, oscurecimiento natural y oclusión. */
function paint(g, ao, B, seed, part, toWorld) {
  const P = g.attributes.position.array, nv = P.length / 3, C = new Float32Array(nv * 3), w = new THREE.Vector3();
  for (let v = 0; v < nv; v++) {
    let x = P[v * 3], y = P[v * 3 + 1], z = P[v * 3 + 2];
    if (toWorld) { w.set(x, y, z).applyMatrix4(toWorld); }
    const sx = toWorld ? w.x : x, sy = toWorld ? w.y : y, sz = toWorld ? w.z : z; // coordenadas de cuerpo para manchas continuas
    let c = B.coat.slice();
    if (B.patches) {
      const n = smoothNoise(sx * 2.6 + 3, sy * 2.6, sz * 2.6, seed) * 0.7 + smoothNoise(sx * 6, sy * 6, sz * 6 + 5, seed) * 0.3;
      const tt = Math.min(1, Math.max(0, (n - 0.5) / 0.05)); c = c.map((ch, i) => ch * (1 - tt) + B.patches[i] * tt);
    }
    if (part === 'head') {
      const nearMuzzle = Math.max(0, 1 - Math.abs(z - 0.215) / 0.05) * (Math.abs(x) < 0.1 ? 1 : 0);
      const t = Math.min(1, nearMuzzle * 0.8 + (y < -0.1 ? (-0.1 - y) * 1.5 : 0)); c = c.map((ch, i) => ch * (1 - t) + B.dark[i] * t);
      if (z > 0.17) { const e = Math.sqrt((x / 0.09) ** 2 + ((y + 0.008) / 0.064) ** 2); const ring = Math.max(0, 1 - Math.abs(e - 1.05) / 0.22) * Math.min(1, (z - 0.17) / 0.04); c = c.map((ch, i) => ch * (1 - ring * 0.75) + B.dark[i] * 0.6 * ring * 0.75); }
      if (B.id === 'normando') { const eye = Math.hypot(Math.abs(x) - 0.12, y - 0.045, z + 0.06); if (eye < 0.045) c = B.patches.slice(); }
    }
    if (part === 'body') { const belly = Math.max(0, Math.min(1, (0.75 - y) * 2.5)); c = c.map((ch, i) => ch * (1 - belly * 0.25) + B.dark[i] * belly * 0.25); }
    const jitter = 0.94 + 0.12 * noise3(x * 300, y * 300, z * 300, seed), a = ao ? ao[v] : 1;
    const k = 0.8 * jitter * a; C[v * 3] = c[0] * k; C[v * 3 + 1] = c[1] * k; C[v * 3 + 2] = c[2] * k;
  }
  return new THREE.BufferAttribute(C, 3);
}
function withColors(base, colors) {
  const g = new THREE.BufferGeometry();
  for (const k of ['position', 'normal', 'uv']) if (base.attributes[k]) g.setAttribute(k, base.attributes[k]);
  g.setIndex(base.index); g.groups = base.groups; g.boundingSphere = base.boundingSphere; g.setAttribute('color', colors); return g;
}

/* ================================================================== Cow == */
export class Cow {
  /** @param {number} k índice del animal en la finca (semilla de pelaje y hocico) */
  constructor(k, quality) {
    const S = buildShared(quality), B = BREEDS[(k * 5 + 2) % BREEDS.length], seed = (k + 1) * 3.17;
    this.k = k; this.breed = B; this.seed = seed; this.quality = quality;
    this.root = new THREE.Group(); this.root.name = `bovino-${k}`;
    this.body = new THREE.Group(); this.root.add(this.body);
    const coatMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.86, bumpMap: S.fur, bumpScale: 0.6 });
    this.coatMat = coatMat;
    const bodyG = B.hump ? S.bodyHump : S.body;
    const bm = new THREE.Mesh(withColors(bodyG, paint(bodyG, B.hump ? S.aoBodyHump : S.aoBody, B, seed, 'body')), coatMat);
    bm.castShadow = bm.receiveShadow = true; this.body.add(bm); this.bodyMesh = bm;

    // patas: grupos pivote (hombro/cadera) → rodilla/corvejón → casco
    const legC = new THREE.MeshStandardMaterial({ color: new THREE.Color().setRGB(...(B.id === 'holstein' ? [0.78, 0.77, 0.74] : B.coat.map(v => v * 0.78))), roughness: 0.88, bumpMap: S.fur, bumpScale: 0.4 });
    const hoofM = new THREE.MeshStandardMaterial({ color: 0x2b2420, roughness: 0.6 });
    this.legs = [];
    for (const [sx, front] of [[-1, true], [1, true], [-1, false], [1, false]]) {
      const hip = new THREE.Group(); hip.position.set(sx * 0.19, front ? 0.86 : 0.9, front ? 0.55 : -0.58); this.body.add(hip);
      const up = new THREE.Mesh(front ? S.legUpperF : S.legUpperR, legC); hip.add(up);
      const knee = new THREE.Group(); knee.position.y = front ? -0.46 : -0.5; hip.add(knee);
      const kj = new THREE.Mesh(S.joint, legC); kj.scale.setScalar(front ? 0.058 : 0.062); knee.add(kj);
      const lo = new THREE.Mesh(front ? S.legLowerF : S.legLowerR, legC); knee.add(lo);
      const hoof = new THREE.Mesh(S.hoof, hoofM); hoof.position.y = front ? -0.4 : -0.42; knee.add(hoof);
      [up, lo, hoof, kj].forEach(m => { m.castShadow = true; m.receiveShadow = true; });
      this.legs.push({ hip, knee, front, sx, len: front ? 0.86 : 0.92 });
    }
    // cola
    this.tail = []; let parent = this.body; const tailBase = new THREE.Group(); tailBase.position.set(0, 1.26, -1.0); tailBase.rotation.x = -0.35; this.body.add(tailBase); parent = tailBase;
    for (let i = 0; i < 6; i++) { const seg = new THREE.Group(); if (i) seg.position.y = -0.13; parent.add(seg); const m = new THREE.Mesh(S.tailSeg, legC); m.castShadow = true; seg.add(m); this.tail.push(seg); parent = seg; }
    const tuft = new THREE.Mesh(S.tuft, new THREE.MeshStandardMaterial({ color: new THREE.Color().setRGB(...B.dark), roughness: 0.95 })); tuft.position.y = -0.12; parent.add(tuft);

    // cuello y cabeza
    this.neck = new THREE.Group(); this.neck.position.set(0, 1.16, 0.84); this.body.add(this.neck);
    this.head = new THREE.Group(); this.head.position.set(0, 0.07, 0.5); this.head.rotation.x = 0.3; this.neck.add(this.head);
    this.muzzleMat = new THREE.MeshPhysicalMaterial({ roughness: 0.62, clearcoat: 0.12, clearcoatRoughness: 0.55, bumpScale: 0.55, envMapIntensity: 0.25 });
    const hiG = withColors(S.headHi, paint(S.headHi, S.aoHeadHi, B, seed, 'head')), loG = withColors(S.headLo, paint(S.headLo, S.aoHeadLo, B, seed, 'head'));
    this.lod = new THREE.LOD();
    const hi = new THREE.Mesh(hiG, [coatMat, this.muzzleMat]), lo = new THREE.Mesh(loG, [coatMat, this.muzzleMat]);
    hi.castShadow = lo.castShadow = true; hi.receiveShadow = lo.receiveShadow = true;
    this.lod.addLevel(hi, 0); this.lod.addLevel(lo, quality.level === 'bajo' ? 7 : 13); this.head.add(this.lod);
    this.headHi = hi;
    const eyeMat = new THREE.MeshPhysicalMaterial({ color: 0x0d0907, roughness: 0.08, clearcoat: 1 });
    const lidMat = new THREE.MeshStandardMaterial({ color: new THREE.Color().setRGB(...B.dark).multiplyScalar(0.8), roughness: 0.8 });
    this.lids = [-1, 1].map(sx => {
      const e = new THREE.Mesh(S.eye, eyeMat); e.position.set(sx * 0.116, 0.046, -0.063); e.scale.set(1, 0.82, 1.12); this.head.add(e);
      const lid = new THREE.Mesh(S.lid, lidMat); lid.position.copy(e.position); lid.position.x += sx * 0.004; lid.rotation.y = sx * Math.PI / 2; lid.scale.set(1.12, 0.86, 1); this.head.add(lid); return lid;
    });
    const earOuter = new THREE.MeshStandardMaterial({ color: new THREE.Color().setRGB(...B.ear), roughness: 0.85, side: THREE.DoubleSide });
    const eg = earGeometry(B.earLen);
    this.ears = [-1, 1].map(sx => { const g = new THREE.Group(); g.position.set(sx * 0.118, 0.115, -0.17); g.scale.x = sx; const m = new THREE.Mesh(eg, earOuter); m.castShadow = true; g.add(m); g.rotation.set(0, 0.35, -0.25 - B.droop * 0.85); g.userData.base = g.rotation.z; this.head.add(g); return g; });
    if (B.horns) { const hm = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.45 }); [-1, 1].forEach(sx => { const h = new THREE.Mesh(S.horn, hm); h.position.set(sx * 0.082, 0.162, -0.205); h.scale.set(sx * 0.8, 0.8, 0.8); h.castShadow = true; this.head.add(h); }); }

    // patrón naso-labial propio
    this.setMuzzle('limpio');
    // estado de animación
    const r = mulberry32(k * 101 + 7);
    this.rand = r; this.t = r() * 100; this.phase = r(); this.speed = 0; this.turn = 0;
    this.headPitch = 0.3; this.headPitchTarget = 0.3; this.neckPitch = 0; this.neckPitchTarget = 0; this.headYaw = 0; this.headYawTarget = 0;
    this.chew = 0; this.blink = 0; this.nextBlink = 2 + r() * 4; this.earTwitch = [0, 0]; this.tailSwat = 0;
    this.scale = 0.94 + r() * 0.12; this.root.scale.setScalar(this.scale);
    this.radius = 0.75 * this.scale;
  }
  setMuzzle(condition) {
    const size = this.quality.level === 'bajo' ? 384 : 512;
    const tex = generateMuzzle(this.k + 1, this.breed.pigment, condition, size, NOSTRILS_UV);
    const cm = new THREE.CanvasTexture(tex.color); cm.colorSpace = THREE.SRGBColorSpace; cm.anisotropy = 8;
    const bm = new THREE.CanvasTexture(tex.bump); bm.anisotropy = 8;
    this.muzzleMat.map?.dispose(); this.muzzleMat.bumpMap?.dispose();
    this.muzzleMat.map = cm; this.muzzleMat.bumpMap = bm; this.muzzleMat.needsUpdate = true;
    this.muzzleCanvas = tex.color; this.condition = condition;
  }
  /** Punto del mundo del centro del hocico (para cámaras y recorte). */
  muzzleWorld(out = new THREE.Vector3()) { this.root.updateMatrixWorld(true); return out.copy(MUZZLE.center).applyMatrix4(this.head.matrixWorld); }
  /** Esquinas de la región naso-labial en coordenadas de mundo. */
  muzzleCorners() {
    this.root.updateMatrixWorld(true); const m = this.head.matrixWorld, c = MUZZLE.center, pts = [];
    for (const [dx, dy] of [[-1, -1], [1, -1], [1, 1], [-1, 1], [0, 0]]) pts.push(new THREE.Vector3(c.x + dx * MUZZLE.rx, c.y + dy * MUZZLE.ry, c.z).applyMatrix4(m));
    return pts;
  }
  get position() { return this.root.position; }
  get heading() { return this.root.rotation.y; }

  update(dt) {
    this.t += dt; const t = this.t, sp = this.speed;
    // marcha (paso lateral: posterior izq., anterior izq., posterior der., anterior der.)
    const stride = 1.15; this.phase = (this.phase + dt * sp / stride) % 1;
    const walk = Math.min(1, sp / 0.5);
    const offs = [0.25, 0.75, 0, 0.5];
    this.legs.forEach((L, i) => {
      const ph = (this.phase + offs[i]) * Math.PI * 2, swing = Math.sin(ph) * 0.42 * walk, lift = Math.max(0, Math.cos(ph)) * walk;
      L.hip.rotation.x = swing + (L.front ? 0 : 0.08);
      L.knee.rotation.x = L.front ? lift * 0.9 : -lift * 0.75 - 0.12;
    });
    this.body.position.y = Math.abs(Math.sin(this.phase * Math.PI * 4)) * 0.025 * walk;
    this.body.rotation.z = Math.sin(this.phase * Math.PI * 2) * 0.025 * walk;
    // respiración
    const br = 1 + Math.sin(t * 1.5) * 0.008; this.bodyMesh.scale.set(br, 1 + (br - 1) * 0.6, 1);
    // cuello y cabeza (suavizado)
    const k = 1 - Math.exp(-dt * 2.6);
    this.neckPitch += (this.neckPitchTarget - this.neckPitch) * k; this.headPitch += (this.headPitchTarget - this.headPitch) * k; this.headYaw += (this.headYawTarget - this.headYaw) * (1 - Math.exp(-dt * 3));
    this.neck.rotation.set(this.neckPitch, this.headYaw * 0.55, 0);
    this.head.rotation.set(this.headPitch + Math.sin(t * 6.2) * 0.02 * this.chew, this.headYaw * 0.45, Math.sin(t * 6.2) * 0.012 * this.chew);
    this.neck.position.y = 1.16 - Math.max(0, this.neckPitch) * 0.12;
    // parpadeo
    this.nextBlink -= dt; if (this.nextBlink < 0) { this.blink = 1; this.nextBlink = 2.5 + this.rand() * 5; }
    this.blink = Math.max(0, this.blink - dt * 7); const lidS = 0.86 - 0.5 * Math.sin(this.blink * Math.PI);
    this.lids.forEach(l => l.scale.y = lidS);
    // orejas: espasmos ocasionales y giro hacia sonidos
    this.ears.forEach((e, i) => {
      if (this.rand() < dt * 0.25) this.earTwitch[i] = 1;
      this.earTwitch[i] = Math.max(0, this.earTwitch[i] - dt * 2.5);
      e.rotation.z = e.userData.base + Math.sin(t * 22) * 0.18 * this.earTwitch[i] + Math.sin(t * 0.7 + i) * 0.04;
      e.rotation.y = 0.35 + Math.sin(t * 0.4 + i * 2) * 0.12;
    });
    // cola: vaivén y golpes contra moscas
    if (this.rand() < dt * 0.18) this.tailSwat = 1; this.tailSwat = Math.max(0, this.tailSwat - dt * 1.2);
    this.tail.forEach((s, i) => { s.rotation.z = Math.sin(t * 1.3 - i * 0.5) * (0.06 + 0.25 * this.tailSwat) * (i + 1) * 0.3; s.rotation.x = 0.06 + walk * 0.05 + (i === 0 ? 0 : 0.04); });
  }
}
