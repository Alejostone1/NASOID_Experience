/* =============================================================================
   ESCENARIO 3D DE LA PRESENTACIÓN — un bovino animado sobre un prado claro.
   Cada escena pide una «toma» (posición de cámara, estado del animal y efectos:
   región naso-labial resaltada, escaneo).
   ============================================================================= */
import * as THREE from 'three';
import gsap from 'gsap';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Cow, MUZZLE } from '../experience/world/cow.js';
import { mulberry32 } from '../shared/rng.js';

export class Stage3D {
  constructor(canvas) {
    const lite = matchMedia('(pointer: coarse)').matches;
    this.q = { level: lite ? 'medio' : 'alto' };
    const r = this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    r.setPixelRatio(Math.min(devicePixelRatio, lite ? 1.25 : 1.75)); r.setSize(innerWidth, innerHeight);
    r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 0.95; r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFShadowMap;
    const s = this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(36, innerWidth / innerHeight, 0.05, 2000);
    this.target = new THREE.Vector3(0, 1, 0); this.shift = 0;
    // cielo y luz
    const sky = new Sky(); sky.scale.setScalar(1500); const u = sky.material.uniforms;
    u.turbidity.value = 3; u.rayleigh.value = 1.0; u.mieCoefficient.value = 0.004; u.mieDirectionalG.value = 0.8;
    const sun = new THREE.Vector3().setFromSphericalCoords(1, THREE.MathUtils.degToRad(55), THREE.MathUtils.degToRad(200)); u.sunPosition.value.copy(sun); s.add(sky);
    const pm = new THREE.PMREMGenerator(r); s.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; s.environmentIntensity = 0.3; pm.dispose();
    s.add(new THREE.HemisphereLight(0xeaf0ff, 0x6f6a48, 0.95));
    const d = new THREE.DirectionalLight(0xfff0d8, 2.3); d.position.copy(sun).multiplyScalar(20); d.castShadow = true; d.shadow.mapSize.set(2048, 2048);
    Object.assign(d.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 1, far: 50 }); d.shadow.normalBias = 0.02; s.add(d); this.sunLight = d;
    s.fog = new THREE.Fog(0xdfe5d6, 30, 120);
    // prado
    const g = new THREE.CircleGeometry(60, 96); g.rotateX(-Math.PI / 2); const col = new Float32Array(g.attributes.position.count * 3);
    for (let i = 0; i < g.attributes.position.count; i++) { const x = g.attributes.position.getX(i), z = g.attributes.position.getZ(i), n = Math.sin(x * 0.7) * Math.cos(z * 0.6) * 0.5 + 0.5; col.set([0.16 + 0.05 * n, 0.3 + 0.06 * n, 0.1], i * 3); }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const ground = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 })); ground.receiveShadow = true; s.add(ground);
    this.buildGrass(); this.buildBackdrop(); this.buildLife();
    // bovino
    this.cow = new Cow(4, this.q); this.cow.root.position.set(0, 0, 0); this.cow.root.rotation.y = -0.5; s.add(this.cow.root);
    this.cow.headPitchTarget = 0.3; this.cow.neckPitchTarget = 0;
    this.addHighlight();
    this.timer = new THREE.Timer(); this.graze = 0;
    addEventListener('resize', () => this.resize()); this.resize();
    const loop = t => { requestAnimationFrame(loop); this.timer.update(t); this.tick(Math.min(0.05, this.timer.getDelta())); };
    requestAnimationFrame(loop);
  }
  buildGrass() {
    // hojas curvas de cuatro tramos (sin facetas), más densas junto al bovino, con ráfagas de viento
    const segs = 3, pos = [], uv = [], ind = [];
    for (let i = 0; i <= segs; i++) { const t = i / segs, w = 0.036 * (1 - t * 0.88), bend = t * t * 0.18; pos.push(-w, t, bend, w, t, bend); uv.push(0, t, 1, t); }
    for (let i = 0; i < segs; i++) { const a = i * 2; ind.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    const blade = new THREE.BufferGeometry(); blade.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); blade.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); blade.setIndex(ind);
    blade.setAttribute('normal', new THREE.Float32BufferAttribute(pos.map((_, i) => (i % 3 === 1 ? 1 : 0)), 3));
    const mat = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.85 }); this.gTime = { value: 0 };
    mat.onBeforeCompile = sh => {
      sh.uniforms.uTime = this.gTime;
      sh.vertexShader = 'uniform float uTime; varying float vH;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
        vec3 ip = vec3(instanceMatrix[3][0], 0., instanceMatrix[3][2]); float k = uv.y * uv.y;
        float gust = smoothstep(-0.2, 1.0, sin(uTime * 0.55 - ip.x * 0.18 + ip.z * 0.07));
        float wave = sin(uTime * 1.7 + ip.x * 0.8 + ip.z * 0.5) * (0.4 + gust * 0.8) + sin(uTime * 3.4 + ip.z * 1.3) * 0.12;
        transformed.x += (wave * 0.13 + gust * 0.08) * k; transformed.z += wave * 0.05 * k; vH = uv.y;`);
      sh.fragmentShader = 'varying float vH;\n' + sh.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>\n diffuseColor.rgb *= mix(0.38, 1.05, vH);');
    };
    const N = this.q.level === 'alto' ? 13000 : 9000, m = new THREE.InstancedMesh(blade, mat, N), r = mulberry32(3), m4 = new THREE.Matrix4(), c = new THREE.Color(), q = new THREE.Quaternion(), e = new THREE.Euler();
    for (let i = 0; i < N; i++) {
      const a = r() * Math.PI * 2, d = Math.pow(r(), 0.85) * 14, x = Math.cos(a) * d, z = Math.sin(a) * d - 2;
      const clump = Math.sin(x * 1.3) * Math.cos(z * 1.1) * 0.5 + 0.5;
      e.set((r() - 0.5) * 0.35, r() * 6.28, (r() - 0.5) * 0.35); q.setFromEuler(e);
      m4.compose(new THREE.Vector3(x, 0, z), q, new THREE.Vector3(0.9 + r() * 0.6, 0.2 + r() * 0.32 + clump * 0.16, 1)); m.setMatrixAt(i, m4);
      c.setHSL(0.24 + r() * 0.05 - clump * 0.02, 0.5 + r() * 0.15, 0.18 + r() * 0.08); m.setColorAt(i, c);
    }
    m.receiveShadow = true; m.frustumCulled = false; this.scene.add(m);
    // flores silvestres
    const fg = new THREE.IcosahedronGeometry(0.03, 1), FC = [0xfaf6e8, 0xf2d24b, 0xd9b7e8, 0xf6f0c2], nf = 900, fl = new THREE.InstancedMesh(fg, new THREE.MeshStandardMaterial({ roughness: 0.6 }), nf);
    for (let i = 0; i < nf; i++) { const a = r() * Math.PI * 2, d = 1.2 + Math.sqrt(r()) * 15; m4.compose(new THREE.Vector3(Math.cos(a) * d, 0.16 + r() * 0.24, Math.sin(a) * d - 2), q.identity(), new THREE.Vector3(1, 0.8, 1).multiplyScalar(0.7 + r() * 0.8)); fl.setMatrixAt(i, m4); fl.setColorAt(i, c.set(FC[i % FC.length])); }
    this.scene.add(fl);
  }
  /** Vida de fondo: polen que flota, mariposas que revolotean y nubes que pasan. */
  buildLife() {
    const r = mulberry32(17), dotC = document.createElement('canvas'); dotC.width = dotC.height = 32; const dx = dotC.getContext('2d'), gr = dx.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,250,230,1)'); gr.addColorStop(1, 'rgba(255,250,230,0)'); dx.fillStyle = gr; dx.fillRect(0, 0, 32, 32);
    const NP = 260, pp = new Float32Array(NP * 3); for (let i = 0; i < NP; i++) { pp[i * 3] = (r() - 0.5) * 16; pp[i * 3 + 1] = 0.2 + r() * 3; pp[i * 3 + 2] = (r() - 0.5) * 12 - 1; }
    const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pp, 3));
    this.pollen = new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.045, map: new THREE.CanvasTexture(dotC), transparent: true, depthWrite: false, opacity: 0.85 })); this.pollen.frustumCulled = false; this.scene.add(this.pollen);
    // mariposas: dos alas que aletean y una trayectoria en lazo
    this.butterflies = [];
    const wingG = new THREE.CircleGeometry(0.05, 12, 0, Math.PI); wingG.rotateZ(-Math.PI / 2); wingG.rotateX(-Math.PI / 2);
    [0xf2c94c, 0xf4efe2, 0xe59b4b].forEach((col, i) => {
      const b = new THREE.Group(), wm = new THREE.MeshStandardMaterial({ color: col, side: THREE.DoubleSide, roughness: 0.6 });
      const L = new THREE.Mesh(wingG, wm), R = new THREE.Mesh(wingG, wm); R.scale.x = -1; b.add(L, R); this.scene.add(b);
      this.butterflies.push({ g: b, L, R, a: r() * 6, rad: 2 + r() * 2.5, y: 0.6 + r() * 0.8, sp: 0.25 + r() * 0.2, cx: (i - 1) * 2.5, cz: -1 - r() * 2 });
    });
    // nubes suaves (planos con degradado) que cruzan el cielo
    const cc = document.createElement('canvas'); cc.width = 256; cc.height = 128; const cx = cc.getContext('2d');
    for (let i = 0; i < 14; i++) { const x = 40 + r() * 176, y = 50 + r() * 40, rr = 22 + r() * 30, g2 = cx.createRadialGradient(x, y, 0, x, y, rr); g2.addColorStop(0, 'rgba(255,255,255,0.85)'); g2.addColorStop(1, 'rgba(255,255,255,0)'); cx.fillStyle = g2; cx.fillRect(0, 0, 256, 128); }
    const ct = new THREE.CanvasTexture(cc); this.clouds = [];
    for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(40, 20), new THREE.MeshBasicMaterial({ map: ct, transparent: true, depthWrite: false, fog: false, opacity: 0.75 })); m.position.set(-120 + i * 45, 34 + r() * 14, -150 - r() * 40); this.scene.add(m); this.clouds.push(m); }
  }
  buildBackdrop() {
    // colinas suaves y una cerca al fondo para dar profundidad
    const hills = new THREE.Mesh(new THREE.CylinderGeometry(90, 90, 14, 64, 1, true), new THREE.MeshBasicMaterial({ color: 0xa9bba0, side: THREE.BackSide, fog: false }));
    hills.position.y = 4; const p = hills.geometry.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) > 0) { const a = Math.atan2(p.getZ(i), p.getX(i)); p.setY(i, 2 + Math.sin(a * 3) * 3 + Math.sin(a * 7 + 1) * 1.5); }
    this.scene.add(hills);
    const wood = new THREE.MeshStandardMaterial({ color: 0x8a6b4a, roughness: 0.9 });
    for (let i = -6; i <= 6; i++) { const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 1.3, 7), wood); post.position.set(i * 2.2, 0.65, -7 - Math.abs(i) * 0.15); post.castShadow = true; this.scene.add(post); }
    for (const y of [0.5, 0.95]) { const rail = new THREE.Mesh(new THREE.BoxGeometry(27, 0.09, 0.05), wood); rail.position.set(0, y, -7.4); this.scene.add(rail); }
  }
  addHighlight() {
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.92, 1, 64), new THREE.MeshBasicMaterial({ color: 0xf1b94d, transparent: true, opacity: 0, depthTest: false }));
    ring.scale.set(MUZZLE.rx * 1.08, MUZZLE.ry * 1.08, 1); ring.position.copy(MUZZLE.center).add(new THREE.Vector3(0, 0, 0.012)); ring.renderOrder = 10; this.cow.head.add(ring); this.ring = ring;
    const scan = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.006), new THREE.MeshBasicMaterial({ color: 0xffe6a8, transparent: true, opacity: 0, depthTest: false }));
    scan.position.copy(MUZZLE.center).add(new THREE.Vector3(0, 0, 0.016)); scan.renderOrder = 11; this.cow.head.add(scan); this.scan = scan;
  }
  resize() {
    this.renderer.setSize(innerWidth, innerHeight); this.camera.aspect = innerWidth / innerHeight;
    this.applyShift(); this.camera.updateProjectionMatrix();
  }
  applyShift() {
    const W = innerWidth, H = innerHeight, mobile = W < 820;
    const sx = mobile ? 0 : this.shift * W;
    this.camera.setViewOffset(W, H, -sx, mobile ? H * 0.18 : 0, W, H); this.camera.updateProjectionMatrix();
  }
  /** Toma de cámara y estado del animal para cada escena. */
  shot(o) {
    const c = this.cow;
    this.want = { rel: o.rel || [0.8, 0.1, 1.2], look: o.look || 'muzzle', lookOff: o.lookOff || [0, 0, 0] };
    if (o.fast) this.snapNext = true;
    gsap.to(this, { shift: o.shift ?? 0.22, duration: 1.2, onUpdate: () => this.applyShift() });
    this.graze = o.graze ? 1 : 0;
    c.headPitchTarget = o.graze ? 1.05 : o.headUp ? 0.12 : 0.3; c.neckPitchTarget = o.graze ? 0.62 : o.headUp ? -0.12 : 0; c.chew = o.graze ? 1 : 0;
    gsap.to(this.ring.material, { opacity: o.ring ? 0.95 : 0, duration: 0.6 });
    gsap.killTweensOf(this.scan.position); gsap.to(this.scan.material, { opacity: o.scan ? 0.9 : 0, duration: 0.4 });
    if (o.scan) gsap.fromTo(this.scan.position, { y: MUZZLE.center.y - MUZZLE.ry }, { y: MUZZLE.center.y + MUZZLE.ry, duration: 1.4, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  }
  tick(dt) {
    this.gTime.value += dt; this.cow.update(dt); const T = this.gTime.value;
    // polen, mariposas y nubes
    const P = this.pollen.geometry.attributes.position; for (let i = 0; i < P.count; i++) { P.array[i * 3] += Math.sin(T * 0.3 + i) * 0.0025 + 0.002; P.array[i * 3 + 1] += Math.sin(T * 0.8 + i * 1.7) * 0.0018; if (P.array[i * 3] > 8) P.array[i * 3] = -8; } P.needsUpdate = true;
    for (const b of this.butterflies) { b.a += dt * b.sp; const x = b.cx + Math.cos(b.a) * b.rad, z = b.cz + Math.sin(b.a * 1.6) * b.rad * 0.6, y = b.y + Math.sin(T * 2.1 + b.rad) * 0.25; b.g.lookAt(x, y, z); b.g.position.set(x, y, z); const f = Math.sin(T * 22 + b.rad * 3) * 1.1; b.L.rotation.z = f; b.R.rotation.z = -f; }
    for (const c of this.clouds) { c.position.x += dt * 0.8; if (c.position.x > 150) c.position.x = -150; c.lookAt(this.camera.position); }
    if (this.want) { // la toma se calcula en el marco del bovino y sigue al hocico si la cabeza se mueve
      const c = this.cow, h = c.heading, f = new THREE.Vector3(Math.sin(h), 0, Math.cos(h)), sd = new THREE.Vector3(Math.cos(h), 0, -Math.sin(h));
      const M = c.muzzleWorld(new THREE.Vector3()), [a, b, d] = this.want.rel;
      const base = this.want.look === 'muzzle' ? M : c.position.clone().add(new THREE.Vector3(0, 1.0, 0)).addScaledVector(f, 0.3);
      const pos = base.clone().addScaledVector(sd, a).add(new THREE.Vector3(0, b, 0)).addScaledVector(f, d);
      const look = base.clone().addScaledVector(sd, this.want.lookOff[0]).add(new THREE.Vector3(0, this.want.lookOff[1], 0)).addScaledVector(f, this.want.lookOff[2]);
      const k = this.snapNext ? 1 : 1 - Math.exp(-dt * 1.8); this.snapNext = false;
      this.camera.position.lerp(pos, k); this.target.lerp(look, k);
    }
    this.camera.position.y += Math.sin(T * 0.35) * 0.0008; this.camera.position.x += Math.cos(T * 0.27) * 0.0006;
    this.camera.lookAt(this.target); this.renderer.render(this.scene, this.camera);
  }
}
