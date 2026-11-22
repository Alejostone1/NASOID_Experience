/* =============================================================================
   OPERARIO — personaje procedimental (sin modelos externos), modelado con
   perfiles de revolución y cápsulas de alta resolución para un acabado suave:
   camisa a cuadros, jean, cinturón, botas de caña, carriel, sombrero aguadeño
   con ala curva, rostro con cejas y bigote, y manos con pulgar.
   Ciclo de caminar/correr mezclado por velocidad, respiración en reposo y
   pose de fotografía (brazos al frente sosteniendo el celular).
   ============================================================================= */
import * as THREE from 'three';

const SEG = 24;
function mesh(g, mat, cast = true) { const m = new THREE.Mesh(g, mat); m.castShadow = cast; m.receiveShadow = true; return m; }
/** Sólido de revolución a partir de pares [radio, altura]. */
function lathe(profile, mat, seg = SEG) { return mesh(new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), seg), mat); }
/** Segmento de extremidad que cuelga desde su articulación: perfil con músculo. */
function limb(r0, r1, len, mat, bulge = 0.12) {
  const pts = []; for (let i = 0; i <= 10; i++) { const t = i / 10, r = THREE.MathUtils.lerp(r0, r1, t) * (1 + Math.sin(Math.PI * Math.min(1, t * 1.25)) * bulge); pts.push([Math.max(0.001, r), -t * len]); }
  pts.unshift([0.001, 0.0]); pts.push([0.001, -len]);
  const m = lathe(pts.reverse(), mat, 20); return m;
}
function ball(r, mat, sx = 1, sy = 1, sz = 1, seg = 24) { const m = mesh(new THREE.SphereGeometry(r, seg, Math.round(seg * 0.75)), mat); m.scale.set(sx, sy, sz); return m; }
function plaid() {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  x.fillStyle = '#6f8558'; x.fillRect(0, 0, 128, 128);
  x.globalAlpha = 0.55; x.fillStyle = '#3d4f33'; for (let i = 0; i < 128; i += 32) { x.fillRect(i, 0, 12, 128); x.fillRect(0, i, 128, 12); }
  x.globalAlpha = 0.35; x.fillStyle = '#e9e0c8'; for (let i = 18; i < 128; i += 32) { x.fillRect(i, 0, 3, 128); x.fillRect(0, i, 128, 3); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 2); t.anisotropy = 4; return t;
}

export class Farmer {
  constructor() {
    this.root = new THREE.Group(); this.root.name = 'operario';
    const M = (o) => new THREE.MeshStandardMaterial(o);
    const shirt = M({ map: plaid(), roughness: 0.9 });
    const jeans = M({ color: 0x3f5170, roughness: 0.92 });
    const skin = M({ color: 0xbf8a64, roughness: 0.62 });
    const boot = M({ color: 0x4a3122, roughness: 0.55 });
    const sole = M({ color: 0x241a14, roughness: 0.8 });
    const leather = M({ color: 0x7a4f2c, roughness: 0.6 });
    const hatMat = M({ color: 0xf0e8d2, roughness: 0.85, side: THREE.DoubleSide });
    const dark = M({ color: 0x1d1a17, roughness: 0.7 });
    const hair = M({ color: 0x2a211b, roughness: 0.9 });
    const white = M({ color: 0xf4f1ea, roughness: 0.4 });

    /* caderas y piernas */
    this.hips = new THREE.Group(); this.hips.position.y = 0.96; this.root.add(this.hips);
    const pelvis = lathe([[0.001, -0.1], [0.13, -0.09], [0.165, -0.02], [0.16, 0.06], [0.001, 0.07]], jeans); pelvis.scale.z = 0.74; this.hips.add(pelvis);
    const belt = mesh(new THREE.TorusGeometry(0.158, 0.022, 10, 32), leather); belt.rotation.x = Math.PI / 2; belt.scale.set(1, 0.74, 1); belt.position.y = 0.06; this.hips.add(belt);
    const buckle = mesh(new THREE.BoxGeometry(0.055, 0.04, 0.012), M({ color: 0xc9b27a, roughness: 0.3, metalness: 0.7 })); buckle.position.set(0, 0.06, 0.122); this.hips.add(buckle);

    /* torso: perfil de cintura a hombros */
    this.spine = new THREE.Group(); this.spine.position.y = 0.08; this.hips.add(this.spine);
    const torso = lathe([[0.001, -0.02], [0.152, -0.02], [0.158, 0.1], [0.172, 0.26], [0.19, 0.4], [0.18, 0.5], [0.12, 0.56], [0.06, 0.585], [0.001, 0.59]], shirt, 32);
    torso.scale.z = 0.7; this.spine.add(torso);
    const collar = mesh(new THREE.TorusGeometry(0.062, 0.016, 8, 24), shirt); collar.rotation.x = Math.PI / 2 - 0.25; collar.position.set(0, 0.585, 0.008); this.spine.add(collar);
    for (let i = 0; i < 4; i++) { const b = ball(0.007, white, 1, 1, 0.5, 8); b.position.set(0, 0.48 - i * 0.12, 0.13 - (i === 0 ? 0.005 : 0)); this.spine.add(b); }
    // carriel cruzado (bolso antioqueño de cuero)
    const strap = mesh(new THREE.TorusGeometry(0.24, 0.011, 6, 40, Math.PI * 1.15), leather); strap.rotation.set(0, 0, 2.2); strap.scale.z = 0.72; strap.position.set(0.02, 0.27, 0); this.spine.add(strap);
    const bag = mesh(new THREE.CapsuleGeometry(0.06, 0.08, 6, 16), leather); bag.rotation.z = Math.PI / 2; bag.scale.set(1, 1, 0.5); bag.position.set(-0.2, 0.02, -0.01); bag.rotation.y = Math.PI / 2; this.spine.add(bag);

    /* cuello y cabeza */
    const neck = mesh(new THREE.CylinderGeometry(0.046, 0.054, 0.1, 16), skin); neck.position.y = 0.62; this.spine.add(neck);
    this.headG = new THREE.Group(); this.headG.position.y = 0.72; this.spine.add(this.headG);
    const head = ball(0.1, skin, 0.9, 1.06, 0.98, 32); this.headG.add(head);
    const jaw = ball(0.08, skin, 0.95, 0.75, 0.95, 24); jaw.position.set(0, -0.05, 0.012); this.headG.add(jaw);
    const nose = mesh(new THREE.ConeGeometry(0.018, 0.04, 12), skin); nose.rotation.x = Math.PI / 2 + 0.25; nose.position.set(0, -0.008, 0.104); this.headG.add(nose);
    for (const sx of [-1, 1]) {
      const ear = ball(0.022, skin, 0.5, 1, 0.8, 12); ear.position.set(sx * 0.092, 0.0, -0.005); this.headG.add(ear);
      const eyeW = ball(0.013, white, 1, 0.8, 0.6, 12); eyeW.position.set(sx * 0.034, 0.022, 0.087); this.headG.add(eyeW);
      const pupil = ball(0.007, dark, 1, 1, 0.6, 10); pupil.position.set(sx * 0.034, 0.022, 0.094); this.headG.add(pupil);
      const brow = mesh(new THREE.CapsuleGeometry(0.006, 0.026, 4, 8), hair); brow.rotation.set(0, 0, Math.PI / 2 + sx * 0.12); brow.position.set(sx * 0.035, 0.045, 0.09); this.headG.add(brow);
    }
    const mus = mesh(new THREE.CapsuleGeometry(0.01, 0.05, 4, 10), hair); mus.rotation.z = Math.PI / 2; mus.position.set(0, -0.035, 0.1); this.headG.add(mus);
    const hairBack = ball(0.102, hair, 0.92, 0.9, 0.98, 24); hairBack.position.set(0, 0.012, -0.012); hairBack.scale.z = 0.95; this.headG.add(hairBack); hairBack.renderOrder = -1;
    // sombrero aguadeño: copa con hendidura, cinta negra y ala que sube suavemente en el borde
    const hat = new THREE.Group(); hat.position.y = 0.072; this.headG.add(hat);
    const crown = lathe([[0.001, 0.0], [0.106, 0.0], [0.1, 0.03], [0.088, 0.11], [0.075, 0.14], [0.05, 0.148], [0.001, 0.15]], hatMat, 32); hat.add(crown);
    const dent = ball(0.05, hatMat, 1.2, 0.25, 0.7, 16); dent.position.y = 0.15; hat.add(dent);
    const ribbon = mesh(new THREE.CylinderGeometry(0.104, 0.107, 0.03, 32, 1, true), dark); ribbon.position.y = 0.017; hat.add(ribbon);
    const brimPts = []; for (let i = 0; i <= 12; i++) { const t = i / 12, r = 0.1 + t * 0.16; brimPts.push([r, Math.pow(t, 2.4) * 0.035]); }
    for (let i = 12; i >= 0; i--) { const t = i / 12, r = 0.1 + t * 0.16; brimPts.push([r, Math.pow(t, 2.4) * 0.035 - 0.008]); }
    const brim = lathe(brimPts, hatMat, 40); brim.position.y = 0.002; hat.add(brim);
    this.hat = hat;

    /* brazos: manga, antebrazo, puño doblado, mano con pulgar */
    this.arms = [-1, 1].map(sx => {
      const sh = new THREE.Group(); sh.position.set(sx * 0.2, 0.5, 0); this.spine.add(sh);
      sh.add(ball(0.062, shirt, 1, 1, 0.9, 20));
      sh.add(limb(0.058, 0.048, 0.29, shirt, 0.1));
      const el = new THREE.Group(); el.position.y = -0.29; sh.add(el);
      const cuff = mesh(new THREE.TorusGeometry(0.047, 0.014, 8, 20), shirt); cuff.rotation.x = Math.PI / 2; cuff.position.y = -0.03; el.add(cuff);
      el.add(limb(0.042, 0.034, 0.26, skin, 0.14));
      const hand = new THREE.Group(); hand.position.y = -0.27; el.add(hand);
      hand.add(ball(0.038, skin, 0.85, 1.15, 0.55, 16));
      const thumb = mesh(new THREE.CapsuleGeometry(0.012, 0.03, 4, 8), skin); thumb.position.set(-sx * 0.028, 0.005, 0.016); thumb.rotation.z = -sx * 0.5; hand.add(thumb);
      return { sh, el, sx, hand };
    });
    // celular en la mano derecha
    const phone = new THREE.Group();
    const body = mesh(new THREE.BoxGeometry(0.075, 0.15, 0.009), M({ color: 0x22262a, roughness: 0.3, metalness: 0.5 }));
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.066, 0.138), new THREE.MeshBasicMaterial({ color: 0x9fb7a2 }));
    screen.position.z = -0.0051; screen.rotation.y = Math.PI; phone.add(body, screen);
    phone.position.set(0, -0.32, 0.03); phone.rotation.x = -0.2; this.arms[1].el.add(phone); this.phone = phone; phone.visible = false;

    /* piernas: jean con rodilla y botas de caña */
    this.legs = [-1, 1].map(sx => {
      const hip = new THREE.Group(); hip.position.set(sx * 0.09, -0.04, 0); this.hips.add(hip);
      hip.add(limb(0.078, 0.058, 0.46, jeans, 0.08));
      const knee = new THREE.Group(); knee.position.y = -0.46; hip.add(knee);
      knee.add(ball(0.058, jeans, 1, 1, 1, 16));
      knee.add(limb(0.057, 0.047, 0.3, jeans, 0.05));
      const shaft = lathe([[0.001, -0.47], [0.052, -0.47], [0.054, -0.36], [0.058, -0.24], [0.062, -0.22], [0.001, -0.22]], boot, 20); knee.add(shaft);
      const foot = mesh(new THREE.CapsuleGeometry(0.048, 0.13, 8, 16), boot); foot.rotation.x = Math.PI / 2; foot.scale.set(1, 1, 0.7); foot.position.set(0, -0.455, 0.055); knee.add(foot);
      const so = mesh(new THREE.BoxGeometry(0.1, 0.022, 0.25), sole); so.position.set(0, -0.495, 0.05); knee.add(so);
      const heel = mesh(new THREE.BoxGeometry(0.08, 0.04, 0.06), sole); heel.position.set(0, -0.49, -0.045); knee.add(heel);
      return { hip, knee };
    });
    this.phase = 0; this.t = 0; this.speed = 0; this.photo = 0; this.radius = 0.32;
  }
  get position() { return this.root.position; }
  update(dt, speed, photo = false) {
    this.t += dt; this.speed = speed;
    this.photo += ((photo ? 1 : 0) - this.photo) * Math.min(1, dt * 6);
    this.phone.visible = this.photo > 0.3;
    const run = THREE.MathUtils.clamp((speed - 3.6) / 2.4, 0, 1), walk = Math.min(1, speed / 1.2);
    this.phase += dt * (speed / (1.25 + run * 0.6)) * Math.PI;
    const s = Math.sin(this.phase), c = Math.cos(this.phase), amp = 0.5 + run * 0.35;
    this.legs.forEach((L, i) => {
      const ph = i ? -s : s; L.hip.rotation.x = ph * amp * walk;
      L.knee.rotation.x = Math.max(0, (i ? c : -c)) * (0.9 + run * 0.5) * walk + 0.04;
    });
    this.hips.position.y = 0.96 + Math.abs(c) * 0.035 * walk - run * 0.03;
    this.hips.rotation.y = s * 0.06 * walk;
    this.spine.rotation.x = run * 0.18 + walk * 0.04;
    this.spine.rotation.y = -s * 0.12 * walk;
    const breathe = Math.sin(this.t * 1.8) * 0.01 * (1 - walk);
    this.spine.position.y = 0.08 + breathe;
    this.headG.rotation.y = s * 0.05 * walk + Math.sin(this.t * 0.4) * 0.08 * (1 - walk) * (1 - this.photo);
    this.arms.forEach((A, i) => {
      const swing = (i ? s : -s) * (0.45 + run * 0.3) * walk;
      const holdX = -1.25, holdZ = A.sx * -0.32;
      A.sh.rotation.x = THREE.MathUtils.lerp(swing, holdX, this.photo);
      A.sh.rotation.z = THREE.MathUtils.lerp(A.sx * 0.1, holdZ, this.photo);
      A.el.rotation.x = THREE.MathUtils.lerp(-0.25 - run * 0.8 * walk - 0.15 * walk, -0.55, this.photo);
    });
    this.headG.rotation.x = -this.photo * 0.15;
  }
}
