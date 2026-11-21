/* =============================================================================
   ESCENARIO 3D DE LA PRESENTACIÓN — un bovino animado sobre un prado claro.
   Cada escena pide una «toma» (posición de cámara, estado del animal y efectos:
   arete que se cae, región naso-labial resaltada, escaneo).
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
    for (let i = 0; i < g.attributes.position.count; i++) { const x = g.attributes.position.getX(i), z = g.attributes.position.getZ(i), n = Math.sin(x * 0.7) * Math.cos(z * 0.6) * 0.5 + 0.5; col.set([0.22 + 0.05 * n, 0.35 + 0.06 * n, 0.14], i * 3); }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const ground = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 })); ground.receiveShadow = true; s.add(ground);
    this.buildGrass(); this.buildBackdrop();
    // bovino
    this.cow = new Cow(4, this.q); this.cow.root.position.set(0, 0, 0); this.cow.root.rotation.y = -0.5; s.add(this.cow.root);
    this.cow.headPitchTarget = 0.3; this.cow.neckPitchTarget = 0;
    this.addTag(); this.addHighlight();
    this.timer = new THREE.Timer(); this.graze = 0;
    addEventListener('resize', () => this.resize()); this.resize();
    const loop = t => { requestAnimationFrame(loop); this.timer.update(t); this.tick(Math.min(0.05, this.timer.getDelta())); };
    requestAnimationFrame(loop);
  }
  buildGrass() {
    const blade = new THREE.BufferGeometry(); const w = 0.03;
    blade.setAttribute('position', new THREE.Float32BufferAttribute([-w, 0, 0, w, 0, 0, 0, 1, 0.02], 3)); blade.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 0.5, 1], 2)); blade.computeVertexNormals();
    const mat = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.9 }); this.gTime = { value: 0 };
    mat.onBeforeCompile = sh => { sh.uniforms.uTime = this.gTime; sh.vertexShader = 'uniform float uTime;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      vec3 ip = vec3(instanceMatrix[3][0], 0., instanceMatrix[3][2]); transformed.x += sin(uTime*1.6 + ip.x*0.8 + ip.z*0.5) * 0.12 * uv.y * uv.y;`); };
    const N = 14000, m = new THREE.InstancedMesh(blade, mat, N), r = mulberry32(3), m4 = new THREE.Matrix4(), c = new THREE.Color();
    for (let i = 0; i < N; i++) {
      const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 16; const x = Math.cos(a) * d, z = Math.sin(a) * d - 2;
      m4.compose(new THREE.Vector3(x, 0, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, r() * 6, (r() - 0.5) * 0.3)), new THREE.Vector3(1, 0.18 + r() * 0.3, 1)); m.setMatrixAt(i, m4);
      c.setHSL(0.23 + r() * 0.05, 0.45, 0.22 + r() * 0.12); m.setColorAt(i, c);
    }
    m.receiveShadow = true; this.scene.add(m);
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
  addTag() {
    // arete plástico en la oreja izquierda (para la escena del problema)
    const tag = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.06, 0.006), new THREE.MeshStandardMaterial({ color: 0xe6b83a, roughness: 0.5 }));
    tag.position.set(0.09, -0.012, 0); this.cow.ears[0].add(tag); this.tag = tag; this.tagHome = tag.position.clone();
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
    if (o.dropTag) this.dropTag(); else this.resetTag();
  }
  dropTag() {
    const t = this.tag; if (t.parent !== this.cow.ears[0]) return;
    const w = new THREE.Vector3(); t.getWorldPosition(w); this.scene.attach(t);
    gsap.to(t.position, { y: 0.004, duration: 1.1, ease: 'bounce.out', delay: 0.6 }); gsap.to(t.rotation, { x: Math.PI / 2, z: 1.2, duration: 1.1, delay: 0.6 });
  }
  resetTag() { const t = this.tag; if (t.parent === this.cow.ears[0]) return; gsap.killTweensOf(t.position); gsap.killTweensOf(t.rotation); this.cow.ears[0].add(t); t.position.copy(this.tagHome); t.rotation.set(0, 0, 0); }
  tick(dt) {
    this.gTime.value += dt; this.cow.update(dt);
    if (this.want) { // la toma se calcula en el marco del bovino y sigue al hocico si la cabeza se mueve
      const c = this.cow, h = c.heading, f = new THREE.Vector3(Math.sin(h), 0, Math.cos(h)), sd = new THREE.Vector3(Math.cos(h), 0, -Math.sin(h));
      const M = c.muzzleWorld(new THREE.Vector3()), [a, b, d] = this.want.rel;
      const base = this.want.look === 'muzzle' ? M : c.position.clone().add(new THREE.Vector3(0, 1.0, 0)).addScaledVector(f, 0.3);
      const pos = base.clone().addScaledVector(sd, a).add(new THREE.Vector3(0, b, 0)).addScaledVector(f, d);
      const look = base.clone().addScaledVector(sd, this.want.lookOff[0]).add(new THREE.Vector3(0, this.want.lookOff[1], 0)).addScaledVector(f, this.want.lookOff[2]);
      const k = this.snapNext ? 1 : 1 - Math.exp(-dt * 1.8); this.snapNext = false;
      this.camera.position.lerp(pos, k); this.target.lerp(look, k);
    }
    this.camera.lookAt(this.target); this.renderer.render(this.scene, this.camera);
  }
}
