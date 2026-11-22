/* =============================================================================
   FINCA 3D — terreno, cielo, pasto con viento, cercas, corral, zona de captura,
   árboles, establo, bebedero, pacas y montañas lejanas.
   Todo es procedimental (sin modelos descargados) e instanciado cuando se repite.
   ============================================================================= */
import * as THREE from 'three';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { mulberry32 } from '../../shared/rng.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/* ---- Distribución de la finca (metros) ------------------------------------ */
export const LAYOUT = {
  pasture: { x0: -26, x1: 22, z0: -24, z1: 16 },     // potrero cercado
  gate: { x: 22, z0: -3.5, z1: 0.5 },                // portón hacia el corral
  corral: { x0: 26, x1: 38, z0: -10, z1: 4 },        // corral de manejo
  chute: { x: 32, z: 8.5, len: 6 },                  // brete (manga) de captura
  capture: new THREE.Vector3(32, 0, 12.5),           // zona de captura (marca en el suelo)
  shed: { x: 44, z: -4, w: 9, d: 7 },
  spawn: new THREE.Vector3(5, 0, 8),                 // dentro del potrero, junto a la manada
  /** Puertas del potrero (huecos en la cerca): sur, oeste y norte, además del portón al corral. */
  gates: [{ side: 'z1', a: 2, b: 7 }, { side: 'x0', a: -7, b: -2 }, { side: 'z0', a: -6, b: -1 }],
  bounds: 70,
};

/* ---- Relieve: plano en la finca, colinas suaves alrededor ------------------ */
function hash2(x, y) { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); }
function vnoise(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy, s = t => t * t * (3 - 2 * t);
  const a = hash2(ix, iy), b = hash2(ix + 1, iy), c = hash2(ix, iy + 1), d = hash2(ix + 1, iy + 1);
  return (a * (1 - s(fx)) + b * s(fx)) * (1 - s(fy)) + (c * (1 - s(fx)) + d * s(fx)) * s(fy);
}
export function heightAt(x, z) {
  const r = Math.hypot(x - 8, z + 4);
  const flat = Math.min(1, Math.max(0, (r - 46) / 30));
  const n = vnoise(x * 0.035, z * 0.035) * 0.7 + vnoise(x * 0.09, z * 0.09) * 0.3;
  const micro = (vnoise(x * 0.25, z * 0.25) - 0.5) * 0.12;
  return micro * (1 - flat) + flat * flat * (n * 14 + 2);
}

function canvasTex(w, h, draw, repeat = 1, srgb = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat, repeat); t.anisotropy = 4; return t;
}

export class Environment {
  constructor(scene, renderer, quality) {
    this.scene = scene; this.renderer = renderer; this.quality = quality;
    this.time = 0; this.colliders = []; this.segments = [];
    this.uniforms = { uTime: { value: 0 }, uPlayer: { value: new THREE.Vector3() } };
    this.buildSky(); this.buildLights(); this.buildTerrain(); this.buildGrass(); this.buildFences();
    this.buildCaptureZone(); this.buildShed(); this.buildTrees(); this.buildProps(); this.buildMountains(); this.buildPollen();
  }

  buildSky() {
    const sky = new Sky(); sky.scale.setScalar(900); const u = sky.material.uniforms;
    u.turbidity.value = 3.2; u.rayleigh.value = 1.1; u.mieCoefficient.value = 0.004; u.mieDirectionalG.value = 0.82;
    this.sun = new THREE.Vector3().setFromSphericalCoords(1, THREE.MathUtils.degToRad(52), THREE.MathUtils.degToRad(215));
    u.sunPosition.value.copy(this.sun); this.scene.add(sky); this.sky = sky;
    // entorno para reflejos suaves a partir del cielo
    const pm = new THREE.PMREMGenerator(this.renderer); const sc = new THREE.Scene(); const s2 = new Sky(); s2.scale.setScalar(900);
    Object.assign(s2.material.uniforms.sunPosition.value, this.sun); for (const k of ['turbidity', 'rayleigh', 'mieCoefficient', 'mieDirectionalG']) s2.material.uniforms[k].value = u[k].value;
    sc.add(s2); this.scene.environment = pm.fromScene(sc, 0, 1, 1000).texture; this.scene.environmentIntensity = 0.22; pm.dispose();
    this.scene.fog = new THREE.Fog(0xd3ddd0, 110, 420);
  }

  buildLights() {
    const hemi = new THREE.HemisphereLight(0xd6e4ff, 0x4a5a2c, 0.5); this.scene.add(hemi); this.hemi = hemi;
    const sun = new THREE.DirectionalLight(0xffeccc, 3.1); sun.position.copy(this.sun).multiplyScalar(60);
    sun.castShadow = this.quality.shadows;
    const S = this.quality.shadowSize; sun.shadow.mapSize.set(S, S);
    const cam = sun.shadow.camera; cam.left = cam.bottom = -26; cam.right = cam.top = 26; cam.near = 1; cam.far = 160;
    sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; sun.shadow.radius = 3;
    this.scene.add(sun, sun.target); this.sunLight = sun;
  }
  /** La sombra sigue al jugador para conservar resolución cerca de la cámara. */
  followShadow(p) {
    const snap = 2; const cx = Math.round(p.x / snap) * snap, cz = Math.round(p.z / snap) * snap;
    this.sunLight.target.position.set(cx, 0, cz); this.sunLight.position.set(cx, 0, cz).addScaledVector(this.sun, 60);
  }

  buildTerrain() {
    const S = 240, N = this.quality.level === 'bajo' ? 120 : 200;
    const g = new THREE.PlaneGeometry(S, S, N, N); g.rotateX(-Math.PI / 2);
    const P = g.attributes.position, col = new Float32Array(P.count * 3), c = new THREE.Color();
    const L = LAYOUT;
    for (let i = 0; i < P.count; i++) {
      const x = P.getX(i), z = P.getZ(i), h = heightAt(x, z); P.setY(i, h);
      const n = vnoise(x * 0.12, z * 0.12), n2 = vnoise(x * 0.6, z * 0.6);
      c.setRGB(0.12 + 0.07 * n, 0.26 + 0.09 * n - 0.03 * n2, 0.06 + 0.035 * n2);   // pasto
      const inCorral = x > L.corral.x0 - 0.5 && x < L.corral.x1 + 0.5 && z > L.corral.z0 - 0.5 && z < L.corral.z1 + 0.5;
      const inChute = Math.abs(x - L.chute.x) < 2.6 && z > L.corral.z1 - 0.5 && z < L.capture.z + 3.2;
      const path = Math.exp(-Math.pow((z - (L.gate.z0 + L.gate.z1) / 2 + Math.sin(x * 0.15) * 0.8) / 1.6, 2)) * (x > 12 && x < 27 ? 1 : 0);
      const dirt = Math.max(inCorral ? 0.85 : 0, inChute ? 0.9 : 0, path * 0.7, Math.min(1, Math.hypot(x - L.shed.x, z - L.shed.z) < 7 ? 0.6 : 0));
      if (dirt > 0) { const d = new THREE.Color(0.42 + 0.05 * n2, 0.33 + 0.04 * n2, 0.22); c.lerp(d, dirt * (0.75 + 0.25 * n)); }
      const far = Math.min(1, Math.max(0, (Math.hypot(x - 8, z + 4) - 60) / 40)); c.lerp(new THREE.Color(0.3, 0.38, 0.22), far * 0.5);
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.computeVertexNormals();
    const detail = canvasTex(256, 256, (x, w, h) => {
      x.fillStyle = '#808080'; x.fillRect(0, 0, w, h); const r = mulberry32(3);
      for (let i = 0; i < 5000; i++) { const l = 100 + r() * 70; x.fillStyle = `rgba(${l},${l},${l},0.5)`; x.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 3); }
    }, 60, false);
    const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.96, map: null, bumpMap: detail, bumpScale: 0.6 });
    const ground = new THREE.Mesh(g, m); ground.receiveShadow = true; ground.name = 'terreno'; this.scene.add(ground); this.ground = ground;
  }

  buildGrass() {
    const count = this.quality.grass; if (!count) return;
    // hoja curva de tres tramos: más ancha en la base y doblada hacia la punta
    const blade = new THREE.BufferGeometry(), segs = 4, pos = [], uv = [], ind = [];
    for (let i = 0; i <= segs; i++) { const t = i / segs, w = 0.034 * (1 - t * 0.85), bend = t * t * 0.16; pos.push(-w, t, bend, w, t, bend); uv.push(0, t, 1, t); }
    for (let i = 0; i < segs; i++) { const a = i * 2; ind.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    blade.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); blade.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); blade.setIndex(ind);
    blade.setAttribute('normal', new THREE.Float32BufferAttribute(pos.map((_, i) => (i % 3 === 1 ? 1 : 0)), 3)); // normales hacia arriba: luz suave, sin facetas
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.82, side: THREE.DoubleSide });
    const U = this.uniforms;
    mat.onBeforeCompile = (sh) => {
      sh.uniforms.uTime = U.uTime; sh.uniforms.uPlayer = U.uPlayer;
      sh.vertexShader = 'uniform float uTime; uniform vec3 uPlayer; varying float vH;\n' + sh.vertexShader
        .replace('#include <begin_vertex>', `#include <begin_vertex>
          vec3 ip = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
          float k = uv.y * uv.y;
          float gust = sin(uTime * 0.6 + ip.x * 0.05 + ip.z * 0.03) * 0.5 + 0.5;
          float wave = sin(uTime * 1.8 + ip.x * 0.35 + ip.z * 0.22) * (0.35 + gust * 0.5) + sin(uTime * 3.3 + ip.x * 0.9) * 0.12;
          vec3 toP = ip - uPlayer; float dP = length(toP.xz); float push = smoothstep(1.2, 0.15, dP);
          transformed.x += (wave * 0.16 + 0.05) * k; transformed.z += wave * 0.07 * k;
          transformed.y *= 1.0 - push * 0.55;
          vH = uv.y;`);
      sh.fragmentShader = 'varying float vH;\n' + sh.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
          diffuseColor.rgb *= mix(0.35, 1.0, vH);`);
    };
    const mesh = new THREE.InstancedMesh(blade, mat, count);
    const r = mulberry32(11), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), c = new THREE.Color(), L = LAYOUT;
    const blocked = (x, z) => {
      const inCorral = x > L.corral.x0 - 1 && x < L.corral.x1 + 1 && z > L.corral.z0 - 1 && z < L.capture.z + 4 && x > 24;
      const nearShed = Math.hypot(x - L.shed.x, z - L.shed.z) < 7, onPath = Math.abs(z + 1.5) < 1.6 && x > 12 && x < 27;
      return inCorral || nearShed || onPath;
    };
    let n = 0, tries = 0;
    while (n < count && tries++ < count * 6) {
      // más densidad cerca del centro de la finca, donde se juega
      const rad = Math.sqrt(r()) * 52, ang = r() * Math.PI * 2, x = 2 + Math.cos(ang) * rad * 1.1, z = -3 + Math.sin(ang) * rad * 0.85;
      if (blocked(x, z)) continue;
      const clump = vnoise(x * 0.3, z * 0.3); if (r() > 0.3 + clump * 0.7) continue;
      const s = 0.2 + r() * 0.3 + clump * 0.22;
      e.set((r() - 0.5) * 0.35, r() * Math.PI, (r() - 0.5) * 0.35); q.setFromEuler(e);
      m4.compose(new THREE.Vector3(x, heightAt(x, z), z), q, new THREE.Vector3(0.9 + r() * 0.7, s, 1));
      mesh.setMatrixAt(n, m4);
      const dry = vnoise(x * 0.07 + 9, z * 0.07);
      c.setHSL(0.25 + r() * 0.05 - dry * 0.07, 0.55 + r() * 0.15 - dry * 0.12, 0.17 + r() * 0.07 + dry * 0.05); mesh.setColorAt(n, c);
      n++;
    }
    mesh.count = n; mesh.receiveShadow = true; mesh.frustumCulled = false; this.scene.add(mesh); this.grass = mesh;
    // flores silvestres pequeñas entre el pasto
    const nf = Math.round(count / 30), fg = new THREE.IcosahedronGeometry(0.035, 1); fg.translate(0, 0.02, 0);
    const flowers = new THREE.InstancedMesh(fg, new THREE.MeshStandardMaterial({ roughness: 0.6, emissive: 0x222211 }), nf), FC = [0xfaf6e8, 0xf2d24b, 0xd9b7e8, 0xf6f0c2, 0xe9a44b];
    let m = 0; while (m < nf) { const x = -36 + r() * 88, z = -34 + r() * 66; if (blocked(x, z) || vnoise(x * 0.15, z * 0.15) < 0.45) continue; const h = 0.18 + r() * 0.25; m4.compose(new THREE.Vector3(x, heightAt(x, z) + h, z), q.identity(), new THREE.Vector3(1, 0.8, 1).multiplyScalar(0.8 + r() * 0.7)); flowers.setMatrixAt(m, m4); flowers.setColorAt(m, c.set(FC[Math.floor(r() * FC.length)])); m++; }
    this.scene.add(flowers);
  }

  /* Cercas de madera: postes y travesaños instanciados (potrero, corral y brete). */
  buildFences() {
    const wood = canvasTex(128, 32, (x, w, h) => {
      const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#8a6b4a'); g.addColorStop(0.5, '#9c7b56'); g.addColorStop(1, '#7a5c3d'); x.fillStyle = g; x.fillRect(0, 0, w, h);
      const r = mulberry32(8); for (let i = 0; i < 40; i++) { x.strokeStyle = `rgba(60,40,25,${0.2 + r() * 0.3})`; x.beginPath(); const y = r() * h; x.moveTo(0, y); x.lineTo(w, y + (r() - 0.5) * 3); x.stroke(); }
    });
    this.woodMat = new THREE.MeshStandardMaterial({ map: wood, roughness: 0.85, color: 0xd8c8b0 });
    const posts = [], rails = [];
    const L = LAYOUT;
    const line = (x0, z0, x1, z1, opts = {}) => {
      const len = Math.hypot(x1 - x0, z1 - z0), nP = Math.max(1, Math.round(len / (opts.step || 2.6)));
      for (let i = 0; i <= nP; i++) { const t = i / nP; posts.push([x0 + (x1 - x0) * t, z0 + (z1 - z0) * t, opts.postH || 1.35]); }
      for (const y of opts.rails || [0.45, 0.85, 1.2]) rails.push([x0, z0, x1, z1, y]);
      this.segments.push({ a: new THREE.Vector2(x0, z0), b: new THREE.Vector2(x1, z1), r: 0.25 });
    };
    const P = L.pasture;
    const gapped = (x0, z0, x1, z1, side) => { // tramo con huecos para las puertas de ese lado
      const gs = L.gates.filter(g => g.side === side).sort((a, b) => a.a - b.a), alongX = z0 === z1;
      let from = alongX ? x0 : z0; const to = alongX ? x1 : z1;
      for (const g of gs) { if (alongX) line(from, z0, g.a, z0); else line(x0, from, x0, g.a); this.gate(alongX, alongX ? g.a : x0, alongX ? z0 : g.a, alongX ? g.b : x0, alongX ? z0 : g.b, { z1: -1.75, z0: 1.75, x0: Math.PI - 0.2 }[side]); from = g.b; }
      if (alongX) line(from, z0, to, z0); else line(x0, from, x0, to);
    };
    gapped(P.x0, P.z0, P.x1, P.z0, 'z0'); gapped(P.x0, P.z1, P.x1, P.z1, 'z1'); gapped(P.x0, P.z0, P.x0, P.z1, 'x0');
    line(P.x1, P.z0, P.x1, L.gate.z0); line(P.x1, L.gate.z1, P.x1, P.z1);
    // corral (abierto al portón y al brete)
    const C = L.corral;
    line(C.x0, C.z0, C.x1, C.z0); line(C.x1, C.z0, C.x1, C.z1); line(C.x0, C.z0, C.x0, L.gate.z0); line(C.x0, L.gate.z1, C.x0, C.z1);
    line(C.x0, C.z1, L.chute.x - 1.1, C.z1); line(L.chute.x + 1.1, C.z1, C.x1, C.z1);
    // brete: manga angosta de tablas altas que lleva a la zona de captura
    const bz1 = L.capture.z - 0.9;
    line(L.chute.x - 1.1, C.z1, L.chute.x - 1.1, bz1, { step: 1.2, postH: 1.75, rails: [0.4, 0.75, 1.1, 1.45] });
    line(L.chute.x + 1.1, C.z1, L.chute.x + 1.1, bz1, { step: 1.2, postH: 1.75, rails: [0.4, 0.75, 1.1, 1.45] });
    // corredor del portón (potrero → corral)
    line(L.pasture.x1, L.gate.z0, C.x0, L.gate.z0, { step: 2 }); line(L.pasture.x1, L.gate.z1, C.x0, L.gate.z1, { step: 2 });
    // postes
    const pg = new THREE.CylinderGeometry(0.085, 0.1, 1, 7); pg.translate(0, 0.5, 0);
    const pm = new THREE.InstancedMesh(pg, this.woodMat, posts.length), m4 = new THREE.Matrix4(), r = mulberry32(4);
    posts.forEach(([x, z, h], i) => { m4.compose(new THREE.Vector3(x, heightAt(x, z) - 0.05, z), new THREE.Quaternion().setFromEuler(new THREE.Euler((r() - 0.5) * 0.04, r() * 3, (r() - 0.5) * 0.04)), new THREE.Vector3(1, h, 1)); pm.setMatrixAt(i, m4); });
    pm.castShadow = pm.receiveShadow = true; this.scene.add(pm);
    const rg = new THREE.BoxGeometry(1, 0.1, 0.05);
    const rm = new THREE.InstancedMesh(rg, this.woodMat, rails.length);
    rails.forEach(([x0, z0, x1, z1, y], i) => {
      const len = Math.hypot(x1 - x0, z1 - z0), ang = Math.atan2(z1 - z0, x1 - x0), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
      m4.compose(new THREE.Vector3(cx, heightAt(cx, cz) + y, cz), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -ang), new THREE.Vector3(len, 1, 1)); rm.setMatrixAt(i, m4);
    });
    rm.castShadow = rm.receiveShadow = true; this.scene.add(rm);
  }

  /** Puerta abierta: dos postes altos con travesaño y la hoja girada hacia afuera. */
  gate(alongX, x0, z0, x1, z1, open) {
    const g = new THREE.Group(), w = Math.hypot(x1 - x0, z1 - z0), post = new THREE.CylinderGeometry(0.11, 0.13, 2.1, 10);
    for (const [x, z] of [[x0, z0], [x1, z1]]) { const m = new THREE.Mesh(post, this.woodMat); m.position.set(x, heightAt(x, z) + 1.0, z); m.castShadow = true; g.add(m); }
    const beam = new THREE.Mesh(new THREE.BoxGeometry(alongX ? w + 0.4 : 0.14, 0.14, alongX ? 0.14 : w + 0.4), this.woodMat); beam.position.set((x0 + x1) / 2, heightAt(x0, z0) + 2.05, (z0 + z1) / 2); beam.castShadow = true; g.add(beam);
    const leaf = new THREE.Group(); // hoja de la puerta, abierta 100°
    for (const y of [0.35, 0.75, 1.15]) { const r = new THREE.Mesh(new THREE.BoxGeometry(w * 0.96, 0.09, 0.05), this.woodMat); r.position.set(w * 0.48, y, 0); r.castShadow = true; leaf.add(r); }
    const diag = new THREE.Mesh(new THREE.BoxGeometry(Math.hypot(w * 0.96, 0.8), 0.08, 0.045), this.woodMat); diag.position.set(w * 0.48, 0.75, 0); diag.rotation.z = Math.atan2(0.8, w * 0.96); leaf.add(diag);
    leaf.position.set(x0, heightAt(x0, z0), z0); leaf.rotation.y = open; g.add(leaf);
    this.scene.add(g);
  }

  /* Zona de captura: tarima, marca circular y letrero. */
  buildCaptureZone() {
    const L = LAYOUT, p = L.capture;
    const ring = new THREE.Mesh(new THREE.RingGeometry(1.6, 1.85, 64), new THREE.MeshBasicMaterial({ color: 0xd9a441, transparent: true, opacity: 0.8, depthWrite: false }));
    ring.rotation.x = -Math.PI / 2; ring.position.set(p.x, heightAt(p.x, p.z) + 0.03, p.z); this.scene.add(ring); this.captureRing = ring;
    const pad = new THREE.Mesh(new THREE.CircleGeometry(1.6, 48), new THREE.MeshStandardMaterial({ color: 0xcdbb98, roughness: 1 }));
    pad.rotation.x = -Math.PI / 2; pad.position.set(p.x, heightAt(p.x, p.z) + 0.02, p.z); pad.receiveShadow = true; this.scene.add(pad);
    // letrero
    const sign = canvasTex(512, 256, (x, w, h) => {
      x.fillStyle = '#f4efe3'; x.fillRect(0, 0, w, h); x.strokeStyle = '#5f6f4a'; x.lineWidth = 10; x.strokeRect(5, 5, w - 10, h - 10);
      x.fillStyle = '#3d4a2f'; x.font = '600 54px "IBM Plex Sans", sans-serif'; x.textAlign = 'center'; x.fillText('ZONA DE CAPTURA', w / 2, 112);
      x.font = '400 30px "IBM Plex Sans", sans-serif'; x.fillStyle = '#6b6457'; x.fillText('Foto del hocico a ~30 cm', w / 2, 172);
    }, 1);
    const board = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.9, 0.06), [this.woodMat, this.woodMat, this.woodMat, this.woodMat, new THREE.MeshStandardMaterial({ map: sign, roughness: 0.8 }), this.woodMat]);
    board.position.set(p.x + 3.1, heightAt(p.x + 3.1, p.z + 2) + 1.7, p.z + 2.2); board.rotation.y = -0.5; board.castShadow = true; this.scene.add(board);
    for (const dx of [-0.75, 0.75]) { const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 1.5, 6), this.woodMat); leg.position.set(board.position.x + dx * Math.cos(0.5), board.position.y - 0.9, board.position.z + dx * Math.sin(0.5)); leg.castShadow = true; this.scene.add(leg); }
    // cepo (yugo) al frente del brete donde el animal apoya el cuello
    const yoke = new THREE.Group();
    for (const dx of [-0.95, 0.95]) { const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.11, 2, 8), this.woodMat); post.position.set(dx, 1, 0); post.castShadow = true; yoke.add(post); }
    const top = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.14, 0.16), this.woodMat); top.position.y = 1.95; top.castShadow = true; yoke.add(top);
    yoke.position.set(L.chute.x, heightAt(L.chute.x, p.z - 0.9), p.z - 0.9); this.scene.add(yoke);
  }

  buildShed() {
    const L = LAYOUT.shed, g = new THREE.Group();
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xe9e1cf, roughness: 0.9 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x9c5a3c, roughness: 0.7, metalness: 0.1 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(L.w, 3.2, L.d), wallMat); body.position.y = 1.6; body.castShadow = body.receiveShadow = true; g.add(body);
    const roofShape = new THREE.Shape([new THREE.Vector2(-L.d / 2 - 0.5, 0), new THREE.Vector2(L.d / 2 + 0.5, 0), new THREE.Vector2(0, 1.9)]);
    const roof = new THREE.Mesh(new THREE.ExtrudeGeometry(roofShape, { depth: L.w + 0.8, bevelEnabled: false }), roofMat);
    roof.rotation.y = Math.PI / 2; roof.position.set(-(L.w + 0.8) / 2, 3.2, 0); roof.castShadow = true; g.add(roof);
    const door = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), new THREE.MeshStandardMaterial({ color: 0x6d5338, roughness: 0.9 })); door.position.set(-L.w / 2 - 0.01, 1.3, 0); door.rotation.y = -Math.PI / 2; g.add(door);
    const trim = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.8, 2.8), this.woodMat); trim.position.set(-L.w / 2 - 0.02, 1.4, 0); g.add(trim);
    g.position.set(L.x, heightAt(L.x, L.z), L.z); this.scene.add(g);
    this.colliders.push({ type: 'box', x0: L.x - L.w / 2 - 0.3, x1: L.x + L.w / 2 + 0.3, z0: L.z - L.d / 2 - 0.3, z1: L.z + L.d / 2 + 0.3 });
  }

  /** Copa hecha de varios lóbulos suaves; la normal se mezcla con la del centro de la copa para un sombreado blando. */
  static canopy(lumps, colorFn, r) {
    const parts = [];
    for (const [cx, cy, cz, rad] of lumps) {
      const g = new THREE.IcosahedronGeometry(rad, 3), P = g.attributes.position, N = g.attributes.normal, col = new Float32Array(P.count * 3), v = new THREE.Vector3(), n = new THREE.Vector3(), c = new THREE.Color();
      for (let i = 0; i < P.count; i++) {
        v.fromBufferAttribute(P, i); const k = 1 + (hash2(v.x * 5.1 + cx, v.y * 4.7 + v.z * 3.3 + cz) - 0.5) * 0.18; v.multiplyScalar(k); v.x += cx; v.y += cy; v.z += cz; P.setXYZ(i, v.x, v.y, v.z);
        n.fromBufferAttribute(N, i).lerp(v.clone().sub(new THREE.Vector3(0, cy * 0.9, 0)).normalize(), 0.62).normalize(); N.setXYZ(i, n.x, n.y, n.z);
        colorFn(c, v, r); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
      }
      g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.deleteAttribute('uv'); parts.push(g);
    }
    return parts;
  }
  static trunk(h, r0, r1, branches, r) {
    const parts = [], bark = new THREE.Color(0x5e4838);
    const add = (g) => { if (g.index) g = g.toNonIndexed(); const col = new Float32Array(g.attributes.position.count * 3); for (let i = 0; i < col.length; i += 3) { const k = 0.85 + r() * 0.2; col[i] = bark.r * k; col[i + 1] = bark.g * k; col[i + 2] = bark.b * k; } g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.deleteAttribute('uv'); parts.push(g); };
    const t = new THREE.CylinderGeometry(r1, r0, h, 12, 4); t.translate(0, h / 2, 0);
    { const P = t.attributes.position; for (let i = 0; i < P.count; i++) { const y = P.getY(i) / h; P.setX(i, P.getX(i) + Math.sin(y * 2.4) * 0.12 * y); } t.computeVertexNormals(); }
    add(t);
    for (const [ang, tilt, len, y] of branches) {
      const b = new THREE.CylinderGeometry(r1 * 0.45, r1 * 0.8, len, 8); b.translate(0, len / 2, 0); b.rotateZ(tilt); b.rotateY(ang); b.translate(Math.sin(y * 2.4) * 0.12 * y / h, y, 0); add(b);
    }
    return parts;
  }
  buildTrees() {
    const r = mulberry32(21), spots = [];
    const tryAdd = (x, z) => { if (spots.every(s => Math.hypot(s[0] - x, s[1] - z) > 5.5)) spots.push([x, z]); };
    for (let i = 0; i < 500 && spots.length < this.quality.trees; i++) {
      const a = r() * Math.PI * 2, d = 32 + r() * 46, x = 8 + Math.cos(a) * d * 1.15, z = -4 + Math.sin(a) * d;
      if (x > 20 && x < 52 && z > -14 && z < 20) continue; // despejar corral, brete y establo
      tryAdd(x, z);
    }
    // árboles de sombra dentro del potrero (lejos de las puertas)
    [[-18, -16, 0], [-12, 11, 1], [14, -18, 0]].forEach(([x, z, k]) => spots.push([x, z, k]));
    const g = (cr) => new THREE.Color(cr);
    // tres especies de la región: samán (copa en sombrilla), guayacán amarillo en flor y ciprés
    const SPECIES = [
      { name: 'saman', w: 0.55, build: () => mergeGeometries([...Environment.trunk(2.6, 0.32, 0.2, [[0.3, 0.9, 1.6, 2.1], [2.4, 0.85, 1.5, 2.0], [4.3, 0.95, 1.4, 2.2]], r),
        ...Environment.canopy(Array.from({ length: 16 }, (_, i) => { const a = i / 16 * Math.PI * 2 + r(), d = i % 3 === 0 ? 0.6 : 1.9 + r() * 0.9; return [Math.cos(a) * d, 3.3 + r() * 0.7 - d * 0.12, Math.sin(a) * d, 0.95 + r() * 0.45]; }),
          (c, v) => { const k = THREE.MathUtils.clamp((v.y - 2.6) / 1.8, 0, 1); c.copy(g(0x2f5a26)).lerp(g(0x7ea14a), k * 0.85); c.offsetHSL((hash2(v.x * 2, v.z * 2) - 0.5) * 0.03, 0, (hash2(v.z, v.x) - 0.5) * 0.06); }, r)]) },
      { name: 'guayacan', w: 0.2, build: () => mergeGeometries([...Environment.trunk(2.2, 0.22, 0.14, [[0.8, 0.6, 1.1, 1.7], [3.6, 0.7, 1.0, 1.6]], r),
        ...Environment.canopy(Array.from({ length: 10 }, (_, i) => { const a = i / 10 * Math.PI * 2, d = i < 2 ? 0.3 : 1.1 + r() * 0.5; return [Math.cos(a) * d, 2.9 + r() * 1.1, Math.sin(a) * d, 0.8 + r() * 0.35]; }),
          (c, v) => { const fl = hash2(v.x * 6.3, v.y * 7.1 + v.z * 5.7); c.copy(fl > 0.25 ? g(0xf0c42c) : g(0x6f8f3a)); c.lerp(g(0xfff0a0), THREE.MathUtils.clamp((v.y - 3) / 2, 0, 1) * 0.35); c.offsetHSL(0, 0, (fl - 0.5) * 0.08); }, r)]) },
      { name: 'cipres', w: 0.25, build: () => mergeGeometries([...Environment.trunk(1.2, 0.2, 0.16, [], r),
        ...Environment.canopy(Array.from({ length: 9 }, (_, i) => [Math.sin(i * 2.4) * 0.18, 1.3 + i * 0.62, Math.cos(i * 2.4) * 0.18, 1.05 - i * 0.09]),
          (c, v) => { c.copy(g(0x1f4025)).lerp(g(0x4f7a3c), THREE.MathUtils.clamp((v.x + v.z) * 0.25 + 0.4, 0, 1)); }, r)]) },
    ];
    const pick = () => { let u = r(); for (let i = 0; i < SPECIES.length; i++) { u -= SPECIES[i].w; if (u <= 0) return i; } return 0; };
    const groups = SPECIES.map(() => []); spots.forEach(s => groups[s[2] ?? pick()].push(s));
    const U = this.uniforms, m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
    const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.82 });
    mat.onBeforeCompile = sh => { // la copa se mece con el viento (más arriba, más movimiento)
      sh.uniforms.uTime = U.uTime;
      sh.vertexShader = 'uniform float uTime;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
        vec3 ip = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]); float sw = smoothstep(1.5, 5.0, position.y);
        transformed.x += sin(uTime * 0.9 + ip.x * 0.2 + position.y * 0.6) * 0.07 * sw; transformed.z += cos(uTime * 0.7 + ip.z * 0.2) * 0.05 * sw;`);
    };
    SPECIES.forEach((sp, k) => {
      const list = groups[k]; if (!list.length) return;
      const geo = sp.build(), mesh = new THREE.InstancedMesh(geo, mat, list.length);
      list.forEach(([x, z], i) => { const s = 0.85 + r() * 0.55; m4.compose(new THREE.Vector3(x, heightAt(x, z) - 0.05, z), q.setFromEuler(new THREE.Euler(0, r() * 6.28, 0)), new THREE.Vector3(s, s * (0.9 + r() * 0.25), s)); mesh.setMatrixAt(i, m4); this.colliders.push({ type: 'circle', x, z, r: 0.5 * s }); });
      mesh.castShadow = mesh.receiveShadow = true; this.scene.add(mesh);
    });
  }

  buildProps() {
    const L = LAYOUT;
    // bebedero
    const trough = new THREE.Group();
    const tm = new THREE.MeshStandardMaterial({ color: 0x8c9590, roughness: 0.5, metalness: 0.4 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.55, 0.8), tm); body.position.y = 0.3; body.castShadow = body.receiveShadow = true; trough.add(body);
    const water = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.6), new THREE.MeshStandardMaterial({ color: 0x6f8f9a, roughness: 0.08, metalness: 0.2 })); water.rotation.x = -Math.PI / 2; water.position.y = 0.56; trough.add(water);
    trough.position.set(-12, heightAt(-12, -6), -6); trough.rotation.y = 0.4; this.scene.add(trough);
    this.colliders.push({ type: 'circle', x: -12, z: -6, r: 1.4 });
    // pacas de heno
    const hay = canvasTex(128, 128, (x, w, h) => { x.fillStyle = '#c9b06a'; x.fillRect(0, 0, w, h); const r = mulberry32(2); for (let i = 0; i < 900; i++) { x.strokeStyle = `rgba(${150 + r() * 70},${120 + r() * 60},${50},0.6)`; x.beginPath(); const a = r() * w, b = r() * h; x.moveTo(a, b); x.lineTo(a + (r() - 0.5) * 14, b + (r() - 0.5) * 4); x.stroke(); } }, 1);
    const hm = new THREE.MeshStandardMaterial({ map: hay, roughness: 1 });
    [[40, 5, 0], [41.6, 5.3, 0.4], [40.8, 5.1, 1.2, true]].forEach(([x, z, ry, up]) => {
      const b = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 1.2, 20), hm); b.rotation.set(0, ry, Math.PI / 2); b.position.set(x, heightAt(x, z) + (up ? 2.2 : 0.75), z); b.castShadow = b.receiveShadow = true; this.scene.add(b);
    });
    this.colliders.push({ type: 'circle', x: 40.8, z: 5.1, r: 1.6 });
    // piedras
    const rg = new THREE.DodecahedronGeometry(1, 1), rm = new THREE.MeshStandardMaterial({ color: 0x9a968c, roughness: 0.95, flatShading: true });
    const r = mulberry32(31), rocks = new THREE.InstancedMesh(rg, rm, 26), m4 = new THREE.Matrix4();
    for (let i = 0; i < 26; i++) { let x, z; do { x = -40 + r() * 100; z = -40 + r() * 78; } while (x > 18 && x < 50 && z > -14 && z < 22); const s = 0.15 + r() * 0.45; m4.compose(new THREE.Vector3(x, heightAt(x, z), z), new THREE.Quaternion().setFromEuler(new THREE.Euler(r(), r(), r())), new THREE.Vector3(s * 1.3, s * 0.7, s)); rocks.setMatrixAt(i, m4); }
    rocks.castShadow = rocks.receiveShadow = true; this.scene.add(rocks);
  }

  buildMountains() {
    const g = new THREE.CylinderGeometry(330, 330, 1, 160, 6, true), p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i), yN = p.getY(i) + 0.5, a = Math.atan2(z, x);
      const h = 26 + 34 * (vnoise(a * 3 + 10, 1) * 0.65 + vnoise(a * 9, 4) * 0.35);
      p.setY(i, yN * h - 4);
    }
    g.computeVertexNormals();
    const m = new THREE.MeshStandardMaterial({ color: 0x6f8a62, roughness: 1, side: THREE.BackSide, fog: true });
    const mesh = new THREE.Mesh(g, m); mesh.position.set(8, 0, -4); this.scene.add(mesh);
    const g2 = g.clone(); const p2 = g2.attributes.position; for (let i = 0; i < p2.count; i++) p2.setY(i, p2.getY(i) * 1.5 + 6);
    const far = new THREE.Mesh(g2, new THREE.MeshBasicMaterial({ color: 0xa9bcae, side: THREE.BackSide, fog: false })); far.scale.setScalar(1.45); far.position.copy(mesh.position); this.scene.add(far);
  }

  /** Polen y semillas flotando: dan vida y profundidad al aire. */
  buildPollen() {
    const N = this.quality.level === 'bajo' ? 120 : 360, pos = new Float32Array(N * 3), r = mulberry32(5);
    for (let i = 0; i < N; i++) { pos[i * 3] = (r() - 0.5) * 40; pos[i * 3 + 1] = 0.3 + r() * 4; pos[i * 3 + 2] = (r() - 0.5) * 40; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const dot = canvasTex(32, 32, (x, w) => { const gr = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); gr.addColorStop(0, 'rgba(255,250,230,1)'); gr.addColorStop(1, 'rgba(255,250,230,0)'); x.fillStyle = gr; x.fillRect(0, 0, w, w); });
    this.pollen = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.06, map: dot, transparent: true, depthWrite: false, opacity: 0.8 }));
    this.pollen.frustumCulled = false; this.scene.add(this.pollen);
  }

  update(dt, playerPos) {
    this.time += dt; this.uniforms.uTime.value = this.time;
    if (playerPos) { this.uniforms.uPlayer.value.copy(playerPos); this.followShadow(playerPos); this.pollen.position.set(playerPos.x, 0, playerPos.z); }
    const p = this.pollen.geometry.attributes.position, t = this.time;
    for (let i = 0; i < p.count; i++) { p.array[i * 3] += Math.sin(t * 0.3 + i) * 0.003; p.array[i * 3 + 1] += Math.sin(t * 0.7 + i * 1.3) * 0.002; }
    p.needsUpdate = true;
    if (this.captureRing) this.captureRing.material.opacity = 0.55 + 0.3 * Math.sin(t * 2.2);
  }

  /** Empuja un círculo (x,z,r) fuera de cercas y obstáculos. */
  resolve(pos, radius) {
    const v = new THREE.Vector2(pos.x, pos.z), tmp = new THREE.Vector2();
    for (const s of this.segments) {
      const ab = tmp.copy(s.b).sub(s.a), t = Math.max(0, Math.min(1, v.clone().sub(s.a).dot(ab) / ab.lengthSq()));
      const cp = s.a.clone().addScaledVector(ab, t), d = v.distanceTo(cp), R = radius + s.r;
      if (d < R && d > 1e-5) v.add(v.clone().sub(cp).multiplyScalar((R - d) / d));
    }
    for (const c of this.colliders) {
      if (c.type === 'circle') { const dx = v.x - c.x, dz = v.y - c.z, d = Math.hypot(dx, dz), R = radius + c.r; if (d < R && d > 1e-5) { v.x += dx / d * (R - d); v.y += dz / d * (R - d); } }
      else if (v.x > c.x0 - radius && v.x < c.x1 + radius && v.y > c.z0 - radius && v.y < c.z1 + radius) {
        const pen = [v.x - (c.x0 - radius), (c.x1 + radius) - v.x, v.y - (c.z0 - radius), (c.z1 + radius) - v.y], m = Math.min(...pen), k = pen.indexOf(m);
        if (k === 0) v.x -= m; else if (k === 1) v.x += m; else if (k === 2) v.y -= m; else v.y += m;
      }
    }
    const B = LAYOUT.bounds; v.x = Math.max(-B + 10, Math.min(B, v.x)); v.y = Math.max(-B + 20, Math.min(B - 30, v.y));
    pos.x = v.x; pos.z = v.y;
  }
}
