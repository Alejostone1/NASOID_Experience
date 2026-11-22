/* =============================================================================
   CONTROLES Y CÁMARA EN TERCERA PERSONA
   Teclado (WASD / flechas, Shift para correr), ratón (arrastrar para girar la
   cámara, rueda para acercar) y pantallas táctiles (joystick virtual + arrastre).
   ============================================================================= */
import * as THREE from 'three';
import { heightAt } from './environment.js';

export class Input {
  constructor(canvas, joystickEl) {
    this.keys = new Set(); this.yaw = 2.6; this.pitch = 0.32; this.dist = 6.2; this.enabled = true;
    this.joy = new THREE.Vector2(); this.drag = null; this.onKey = null;
    addEventListener('keydown', e => {
      if (e.target.closest?.('input, textarea, select')) return;
      const k = e.key.toLowerCase(); this.keys.add(k);
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
      this.onKey?.(k, e);
    });
    addEventListener('keyup', e => this.keys.delete(e.key.toLowerCase()));
    addEventListener('blur', () => this.keys.clear());
    canvas.addEventListener('pointerdown', e => { if (e.pointerType === 'touch' && e.clientX < innerWidth * 0.4) return; this.drag = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: 0 }; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', e => {
      if (!this.drag || this.drag.id !== e.pointerId || !this.enabled) return;
      const dx = e.clientX - this.drag.x, dy = e.clientY - this.drag.y; this.drag.x = e.clientX; this.drag.y = e.clientY; this.drag.moved += Math.abs(dx) + Math.abs(dy);
      this.yaw -= dx * 0.0055; this.pitch = THREE.MathUtils.clamp(this.pitch + dy * 0.004, 0.05, 1.1);
    });
    const end = e => { if (this.drag?.id === e.pointerId) this.drag = null; };
    canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('wheel', e => { if (!this.enabled) return; this.dist = THREE.MathUtils.clamp(this.dist * (1 + Math.sign(e.deltaY) * 0.08), 3.2, 11); e.preventDefault(); }, { passive: false });
    if (joystickEl) this.bindJoystick(joystickEl);
  }
  bindJoystick(el) {
    const knob = el.querySelector('.knob'); let id = null, cx = 0, cy = 0;
    el.addEventListener('pointerdown', e => { id = e.pointerId; const r = el.getBoundingClientRect(); cx = r.left + r.width / 2; cy = r.top + r.height / 2; el.setPointerCapture(id); move(e); });
    const move = e => { if (e.pointerId !== id) return; const R = 46; let dx = e.clientX - cx, dy = e.clientY - cy; const d = Math.hypot(dx, dy); if (d > R) { dx *= R / d; dy *= R / d; } this.joy.set(dx / R, dy / R); knob.style.transform = `translate(${dx}px, ${dy}px)`; };
    el.addEventListener('pointermove', move);
    const up = e => { if (e.pointerId !== id) return; id = null; this.joy.set(0, 0); knob.style.transform = ''; };
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  }
  /** Dirección de movimiento deseada en el plano (relativa a la cámara). */
  moveVector() {
    if (!this.enabled) return new THREE.Vector2();
    const k = this.keys; let x = 0, y = 0;
    if (k.has('w') || k.has('arrowup')) y += 1; if (k.has('s') || k.has('arrowdown')) y -= 1;
    if (k.has('a') || k.has('arrowleft')) x -= 1; if (k.has('d') || k.has('arrowright')) x += 1;
    x += this.joy.x; y -= this.joy.y;
    const v = new THREE.Vector2(x, y); if (v.length() > 1) v.normalize(); return v;
  }
  get running() { return this.keys.has('shift') || this.joy.length() > 0.95; }
}

/** Mueve al personaje con aceleración, giro suave y colisiones. */
export class PlayerController {
  constructor(farmer, input, env, herd) { this.f = farmer; this.input = input; this.env = env; this.herd = herd; this.vel = new THREE.Vector3(); this.facing = new THREE.Vector3(0, 0, 1); this.lock = false; }
  update(dt) {
    const mv = this.lock ? new THREE.Vector2() : this.input.moveVector(), yaw = this.input.yaw;
    const fwd = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw)), right = new THREE.Vector3(-fwd.z, 0, fwd.x);
    const want = fwd.multiplyScalar(mv.y).add(right.multiplyScalar(mv.x));
    const max = this.input.running ? 6.8 : 3.2;
    want.multiplyScalar(max * Math.min(1, mv.length()));
    this.vel.lerp(want, 1 - Math.exp(-dt * 10));
    const p = this.f.position; p.addScaledVector(this.vel, dt);
    this.env.resolve(p, this.f.radius); this.herd?.resolvePlayer(p, this.f.radius);
    p.y = heightAt(p.x, p.z);
    const sp = Math.hypot(this.vel.x, this.vel.z);
    if (sp > 0.15) { this.facing.set(this.vel.x, 0, this.vel.z).normalize(); const target = Math.atan2(this.facing.x, this.facing.z); let d = target - this.f.root.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); this.f.root.rotation.y += d * (1 - Math.exp(-dt * 10)); }
    else this.facing.set(Math.sin(this.f.root.rotation.y), 0, Math.cos(this.f.root.rotation.y));
    return sp;
  }
  faceTowards(v) { this.f.root.rotation.y = Math.atan2(v.x - this.f.position.x, v.z - this.f.position.z); }
}

/** Cámara que sigue al personaje; puede pasar a un encuadre fijo (interacción/captura). */
export class CameraRig {
  constructor(camera, input) { this.cam = camera; this.input = input; this.focus = new THREE.Vector3(); this.override = null; this.blend = 0; this.cur = new THREE.Vector3(); this.curLook = new THREE.Vector3(); }
  setOverride(pos, look, speed = 3) { this.override = { pos: pos.clone(), look: look.clone() }; this.speed = speed; }
  clearOverride() { this.override = null; }
  update(dt, target) {
    const i = this.input; this.focus.lerp(new THREE.Vector3(target.x, target.y + 1.55, target.z), 1 - Math.exp(-dt * 10));
    const off = new THREE.Vector3(Math.sin(i.yaw) * Math.cos(i.pitch), Math.sin(i.pitch), Math.cos(i.yaw) * Math.cos(i.pitch)).multiplyScalar(i.dist);
    const follow = this.focus.clone().add(off); follow.y = Math.max(follow.y, heightAt(follow.x, follow.z) + 0.4);
    const k = 1 - Math.exp(-dt * (this.override ? this.speed : 6));
    const wantPos = this.override ? this.override.pos : follow, wantLook = this.override ? this.override.look : this.focus;
    if (!this.started) { this.cur.copy(wantPos); this.curLook.copy(wantLook); this.started = true; }
    this.cur.lerp(wantPos, k); this.curLook.lerp(wantLook, k);
    this.cam.position.copy(this.cur); this.cam.lookAt(this.curLook);
  }
  snap() { if (this.override) { this.cur.copy(this.override.pos); this.curLook.copy(this.override.look); } }
}
