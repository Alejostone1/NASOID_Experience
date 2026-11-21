/* =============================================================================
   OPERARIO — personaje procedimental (sin modelos externos): caderas, torso,
   cabeza, sombrero aguadeño, brazos y piernas articulados, botas y celular.
   Ciclo de caminar/correr mezclado por velocidad, respiración en reposo y
   pose de fotografía (brazos al frente sosteniendo el celular).
   ============================================================================= */
import * as THREE from 'three';

function capsule(r, len, mat) { const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 6, 12), mat); m.castShadow = true; m.receiveShadow = true; return m; }
function limb(r0, r1, len, mat) { const g = new THREE.CylinderGeometry(r0, r1, len, 12, 2); g.translate(0, -len / 2, 0); const m = new THREE.Mesh(g, mat); m.castShadow = true; return m; }

export class Farmer {
  constructor() {
    this.root = new THREE.Group(); this.root.name = 'operario';
    const shirt = new THREE.MeshStandardMaterial({ color: 0x7d8f63, roughness: 0.85 });
    const vest = new THREE.MeshStandardMaterial({ color: 0xe8e0cc, roughness: 0.9 });
    const jeans = new THREE.MeshStandardMaterial({ color: 0x4a5a74, roughness: 0.9 });
    const skin = new THREE.MeshStandardMaterial({ color: 0xc28d68, roughness: 0.7 });
    const boot = new THREE.MeshStandardMaterial({ color: 0x4a3426, roughness: 0.6 });
    const hatMat = new THREE.MeshStandardMaterial({ color: 0xf1ead8, roughness: 0.8 });
    const band = new THREE.MeshStandardMaterial({ color: 0x1f1d1a, roughness: 0.7 });

    this.hips = new THREE.Group(); this.hips.position.y = 0.95; this.root.add(this.hips);
    const pelvis = capsule(0.15, 0.12, jeans); pelvis.rotation.z = Math.PI / 2; pelvis.scale.set(1, 1, 0.75); this.hips.add(pelvis);
    this.spine = new THREE.Group(); this.spine.position.y = 0.08; this.hips.add(this.spine);
    const torso = capsule(0.17, 0.32, shirt); torso.position.y = 0.3; torso.scale.set(1.08, 1, 0.72); this.spine.add(torso);
    const ruana = capsule(0.178, 0.22, vest); ruana.position.y = 0.36; ruana.scale.set(1.1, 1, 0.76); this.spine.add(ruana);
    const neck = capsule(0.05, 0.06, skin); neck.position.y = 0.6; this.spine.add(neck);
    this.headG = new THREE.Group(); this.headG.position.y = 0.7; this.spine.add(this.headG);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.105, 20, 16), skin); head.scale.set(0.92, 1.05, 1); head.castShadow = true; this.headG.add(head);
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 6), skin); nose.position.set(0, -0.005, 0.1); this.headG.add(nose);
    for (const sx of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), band); e.position.set(sx * 0.035, 0.02, 0.092); this.headG.add(e); }
    // sombrero aguadeño: copa, cinta negra y ala ancha
    const hat = new THREE.Group(); hat.position.y = 0.075; this.headG.add(hat);
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.105, 0.12, 20), hatMat); crown.position.y = 0.06; crown.castShadow = true; hat.add(crown);
    const ribbon = new THREE.Mesh(new THREE.CylinderGeometry(0.106, 0.107, 0.03, 20), band); ribbon.position.y = 0.015; hat.add(ribbon);
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.25, 0.012, 28), hatMat); brim.castShadow = true; hat.add(brim);
    this.hat = hat;

    this.arms = [-1, 1].map(sx => {
      const sh = new THREE.Group(); sh.position.set(sx * 0.21, 0.52, 0); this.spine.add(sh);
      sh.add(limb(0.055, 0.048, 0.3, shirt));
      const el = new THREE.Group(); el.position.y = -0.3; sh.add(el);
      el.add(limb(0.046, 0.04, 0.27, skin));
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), skin); hand.position.y = -0.3; hand.scale.set(0.8, 1.1, 0.6); el.add(hand);
      return { sh, el, sx, hand };
    });
    // celular en la mano derecha
    const phone = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.15, 0.009), new THREE.MeshStandardMaterial({ color: 0x22262a, roughness: 0.3, metalness: 0.5 }));
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.066, 0.138), new THREE.MeshBasicMaterial({ color: 0x9fb7a2 }));
    screen.position.z = -0.0051; screen.rotation.y = Math.PI; phone.add(body, screen);
    phone.position.set(0, -0.34, 0.03); phone.rotation.x = -0.2; this.arms[1].el.add(phone); this.phone = phone; phone.visible = false;

    this.legs = [-1, 1].map(sx => {
      const hip = new THREE.Group(); hip.position.set(sx * 0.1, -0.04, 0); this.hips.add(hip);
      hip.add(limb(0.075, 0.06, 0.45, jeans));
      const knee = new THREE.Group(); knee.position.y = -0.45; hip.add(knee);
      knee.add(limb(0.06, 0.05, 0.42, jeans));
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.24), boot); b.position.set(0, -0.44, 0.04); b.castShadow = true; knee.add(b);
      return { hip, knee };
    });
    this.phase = 0; this.t = 0; this.speed = 0; this.photo = 0; this.radius = 0.32;
  }
  get position() { return this.root.position; }
  update(dt, speed, photo = false) {
    this.t += dt; this.speed = speed;
    this.photo += ((photo ? 1 : 0) - this.photo) * Math.min(1, dt * 6);
    this.phone.visible = this.photo > 0.3;
    const run = THREE.MathUtils.clamp((speed - 2.4) / 2, 0, 1), walk = Math.min(1, speed / 1.2);
    this.phase += dt * (speed / (1.1 + run * 0.5)) * Math.PI;
    const s = Math.sin(this.phase), c = Math.cos(this.phase), amp = 0.5 + run * 0.35;
    this.legs.forEach((L, i) => {
      const ph = i ? -s : s; L.hip.rotation.x = ph * amp * walk;
      L.knee.rotation.x = Math.max(0, (i ? c : -c)) * (0.9 + run * 0.5) * walk + 0.04;
    });
    this.hips.position.y = 0.95 + Math.abs(c) * 0.035 * walk - run * 0.03;
    this.spine.rotation.x = run * 0.18 + walk * 0.04;
    this.spine.rotation.y = s * 0.08 * walk;
    const breathe = Math.sin(this.t * 1.8) * 0.012 * (1 - walk);
    this.spine.position.y = 0.08 + breathe;
    this.arms.forEach((A, i) => {
      const swing = (i ? s : -s) * (0.45 + run * 0.3) * walk;
      const holdX = -1.25, holdZ = A.sx * -0.32;
      A.sh.rotation.x = THREE.MathUtils.lerp(swing, holdX, this.photo);
      A.sh.rotation.z = THREE.MathUtils.lerp(A.sx * 0.08, holdZ, this.photo);
      A.el.rotation.x = THREE.MathUtils.lerp(-0.25 - run * 0.8 * walk - 0.15 * walk, -0.55, this.photo);
    });
    this.headG.rotation.x = -this.photo * 0.15;
  }
}
