/* =============================================================================
   MANADA — comportamiento de cada bovino con una máquina de estados:
   pastar · caminar · descansar/mirar · atender al operario · posar para la foto.
   Cada animal tiene sus propios tiempos, así que nunca se mueven al unísono.
   ============================================================================= */
import * as THREE from 'three';
import { Cow } from './cow.js';
import { LAYOUT, heightAt } from './environment.js';

const P = LAYOUT.pasture;
// la manada pasta cerca de la entrada sur, a pocos pasos del operario
const SPOTS = [[-3, -2], [3, -7], [9, -1], [-8, 3], [1, 2], [10, -9], [-5, -10], [13, 3], [-11, -5]];

export class Herd {
  constructor(scene, quality, env, onProgress) {
    this.scene = scene; this.env = env; this.cows = [];
    this.count = quality.cows;
    this.quality = quality;
    this.onProgress = onProgress;
  }
  /** Construye los bovinos uno a uno (cede el hilo entre ellos para no congelar la carga). */
  async build() {
    for (let k = 0; k < this.count; k++) {
      const cow = new Cow(k, this.quality);
      const [x, z] = SPOTS[k % SPOTS.length];
      cow.root.position.set(x, heightAt(x, z), z); cow.root.rotation.y = cow.rand() * Math.PI * 2;
      cow.state = 'graze'; cow.timer = 3 + cow.rand() * 8; cow.target = null; cow.attend = null;
      cow.headPitchTarget = 1.05; cow.neckPitchTarget = 0.62; cow.chew = 1;
      this.scene.add(cow.root); this.cows.push(cow);
      this.onProgress?.((k + 1) / this.count);
      await new Promise(r => setTimeout(r, 0));
    }
    return this.cows;
  }
  randomTarget(cow) {
    for (let i = 0; i < 20; i++) {
      const x = P.x0 + 3 + cow.rand() * (P.x1 - P.x0 - 6), z = P.z0 + 3 + cow.rand() * (P.z1 - P.z0 - 6);
      if (Math.hypot(x - cow.position.x, z - cow.position.z) < 9 && Math.hypot(x - 1, z + 2) < 15) return new THREE.Vector3(x, 0, z);
    }
    return new THREE.Vector3((P.x0 + P.x1) / 2, 0, (P.z0 + P.z1) / 2);
  }
  setState(cow, s) {
    cow.state = s; const r = cow.rand;
    if (s === 'graze') { cow.timer = 6 + r() * 12; cow.headPitchTarget = 1.05; cow.neckPitchTarget = 0.62; cow.chew = 1; }
    if (s === 'walk') { cow.timer = 12; cow.target = this.randomTarget(cow); cow.headPitchTarget = 0.35; cow.neckPitchTarget = 0.12; cow.chew = 0; }
    if (s === 'idle') { cow.timer = 3 + r() * 6; cow.headPitchTarget = 0.25 + r() * 0.15; cow.neckPitchTarget = -0.05; cow.chew = r() < 0.6 ? 1 : 0; cow.lookT = 0; }
  }
  /** El operario se acerca: el animal se detiene y gira hacia él. */
  attend(cow, playerPos) { cow.state = 'attend'; cow.attend = playerPos; cow.headPitchTarget = 0.28; cow.neckPitchTarget = -0.05; cow.chew = 0; }
  release(cow) { if (cow.state === 'attend' || cow.state === 'pose') this.setState(cow, 'idle'); cow.attend = null; cow.poseYaw = 0; }
  /** Pose de captura: cabeza levantada, de frente, quieta. yaw/pitch los controla el usuario. */
  pose(cow) { cow.state = 'pose'; cow.headPitchTarget = 0.18; cow.neckPitchTarget = -0.12; cow.chew = 0; cow.headYawTarget = 0; cow.speed = 0; }

  update(dt, player) {
    for (const cow of this.cows) {
      if (cow.inChute) { cow.speed = 0; cow.update(dt); continue; } // en el brete: quieto, fuera de las reglas del potrero
      cow.timer -= dt; const pos = cow.position;
      let desired = 0, turnTo = null;
      if (cow.state === 'graze') {
        desired = Math.sin(cow.t * 0.4) > 0.85 ? 0.18 : 0; // pasos cortos mientras pasta
        if (cow.timer < 0) this.setState(cow, cow.rand() < 0.55 ? 'walk' : 'idle');
      } else if (cow.state === 'walk') {
        const d = Math.hypot(cow.target.x - pos.x, cow.target.z - pos.z);
        desired = d > 1 ? 0.75 : 0; turnTo = cow.target;
        if (d < 1 || cow.timer < 0) this.setState(cow, 'graze');
      } else if (cow.state === 'idle') {
        cow.lookT += dt; cow.headYawTarget = Math.sin(cow.lookT * 0.6 + cow.k) * 0.5;
        if (cow.timer < 0) this.setState(cow, cow.rand() < 0.6 ? 'graze' : 'walk');
      } else if (cow.state === 'attend') {
        turnTo = cow.attend; desired = 0;
        const loc = cow.root.worldToLocal(cow.attend.clone()); cow.headYawTarget = THREE.MathUtils.clamp(Math.atan2(loc.x, loc.z), -0.6, 0.6);
      } else if (cow.state === 'pose') { desired = 0; }
      // curiosidad: si el operario pasa cerca, levanta la cabeza y lo mira
      if (player && (cow.state === 'graze' || cow.state === 'idle')) {
        const dp = pos.distanceTo(player);
        if (dp < 4.5) { const loc = cow.root.worldToLocal(player.clone()); if (loc.z > 0) { cow.headYawTarget = THREE.MathUtils.clamp(Math.atan2(loc.x, loc.z), -0.55, 0.55); if (cow.state === 'graze' && dp < 3) { cow.headPitchTarget = 0.3; cow.neckPitchTarget = 0; } } }
      }
      // giro suave hacia el objetivo
      if (turnTo) {
        const want = Math.atan2(turnTo.x - pos.x, turnTo.z - pos.z); let dh = want - cow.root.rotation.y;
        dh = Math.atan2(Math.sin(dh), Math.cos(dh)); const rate = cow.state === 'attend' ? 1.2 : 0.8;
        const turn = THREE.MathUtils.clamp(dh, -rate * dt, rate * dt); cow.root.rotation.y += turn;
        if (cow.state === 'attend' && Math.abs(dh) > 0.15) desired = Math.max(desired, 0.12); // pasito para girar
        if (Math.abs(dh) > 1.2 && cow.state === 'walk') desired *= 0.3;
      }
      // separación entre animales y respeto al operario
      for (const o of this.cows) {
        if (o === cow || o.inChute) continue; const dx = pos.x - o.position.x, dz = pos.z - o.position.z, d = Math.hypot(dx, dz);
        if (d < 2.2 && d > 1e-3) { pos.x += dx / d * (2.2 - d) * 0.5 * Math.min(1, dt * 4); pos.z += dz / d * (2.2 - d) * 0.5 * Math.min(1, dt * 4); }
      }
      if (player && cow.state === 'walk') { const ahead = new THREE.Vector3(Math.sin(cow.heading), 0, Math.cos(cow.heading)); const tp = player.clone().sub(pos); if (tp.length() < 2.4 && tp.dot(ahead) > 0) desired = 0; }
      cow.speed += (desired - cow.speed) * Math.min(1, dt * 2.5);
      if (cow.speed > 0.01 && cow.state !== 'pose') { pos.x += Math.sin(cow.heading) * cow.speed * dt; pos.z += Math.cos(cow.heading) * cow.speed * dt; }
      pos.x = THREE.MathUtils.clamp(pos.x, P.x0 + 1.6, P.x1 - 1.6); pos.z = THREE.MathUtils.clamp(pos.z, P.z0 + 1.6, P.z1 - 1.6);
      pos.y = heightAt(pos.x, pos.z);
      cow.update(dt);
    }
  }
  /** Colisiones del jugador con los animales (dos círculos por bovino: pecho y ancas). */
  resolvePlayer(p, r) {
    for (const c of this.cows) {
      const f = new THREE.Vector3(Math.sin(c.heading), 0, Math.cos(c.heading));
      for (const off of [0.55, -0.45, 1.25]) {
        const cx = c.position.x + f.x * off * c.scale, cz = c.position.z + f.z * off * c.scale, R = r + (off > 1 ? 0.25 : 0.55) * c.scale;
        const dx = p.x - cx, dz = p.z - cz, d = Math.hypot(dx, dz); if (d < R && d > 1e-4) { p.x += dx / d * (R - d); p.z += dz / d * (R - d); }
      }
    }
  }
  /** Bovino más cercano frente al jugador, si está a distancia de interacción. */
  nearest(p, facing, maxD = 3.2) {
    let best = null, bd = maxD;
    for (const c of this.cows) {
      const head = c.muzzleWorld(new THREE.Vector3()), d = Math.min(Math.hypot(head.x - p.x, head.z - p.z), Math.hypot(c.position.x - p.x, c.position.z - p.z) - 0.6);
      if (d < bd) { const to = new THREE.Vector3(c.position.x - p.x, 0, c.position.z - p.z).normalize(); if (!facing || to.dot(facing) > -0.2) { bd = d; best = c; } }
    }
    return best;
  }
}
