/* =============================================================================
   CÁMARA DEL CELULAR — se coloca frente al hocico del bovino a partir de la
   distancia, el ángulo horizontal y la altura elegidos por el usuario. La foto
   es una captura REAL del render (píxeles del lienzo WebGL), no una imagen fija.
   ============================================================================= */
import * as THREE from 'three';

export const PHOTO = { hfov: 62, aspect: 4 / 3 };

export class PhotoCamera {
  constructor() {
    this.cam = new THREE.PerspectiveCamera(50, 1, 0.02, 400);
    this.params = { dist: 0.3, yaw: 0, pitch: 0, offX: 0, offY: 0 };
    this.focus = 1; this.lastChange = 0;
  }
  /** Región 4:3 centrada en el lienzo (en píxeles CSS) que será la foto. */
  frameRect(W, H) {
    const a = PHOTO.aspect; let w = W, h = W / a; if (h > H) { h = H; w = H * a; }
    return { x: (W - w) / 2, y: (H - h) / 2, w, h };
  }
  /** Ajusta el campo de visión para que la región 4:3 tenga el ángulo de un celular. */
  fit(W, H) {
    const r = this.frameRect(W, H), hf = THREE.MathUtils.degToRad(PHOTO.hfov);
    const vfFrame = 2 * Math.atan(Math.tan(hf / 2) / PHOTO.aspect);
    this.cam.aspect = W / H; this.cam.fov = THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(vfFrame / 2) * H / r.h)); this.cam.updateProjectionMatrix();
  }
  /** Posiciona la cámara frente al hocico del bovino. */
  aim(cow) {
    const p = this.params; cow.root.updateMatrixWorld(true);
    const M = cow.muzzleWorld(new THREE.Vector3());
    const q = new THREE.Quaternion(); cow.head.getWorldQuaternion(q);
    const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(q); fwd.y *= 0.35; fwd.normalize(); // eje del hocico (casi horizontal)
    const up = new THREE.Vector3(0, 1, 0), side = new THREE.Vector3().crossVectors(up, fwd).normalize();
    const dir = fwd.clone().applyAxisAngle(up, THREE.MathUtils.degToRad(p.yaw)).applyAxisAngle(side, THREE.MathUtils.degToRad(-p.pitch));
    this.cam.position.copy(M).addScaledVector(dir, p.dist);
    const look = M.clone().addScaledVector(side, p.offX).addScaledVector(up, p.offY);
    this.cam.up.set(0, 1, 0); this.cam.lookAt(look);
    this.muzzle = M; this.dir = dir; this.fwd = fwd;
  }
  /** Ángulo real entre el eje de la cámara y el eje del hocico (grados). */
  get frontalAngle() { return this.dir ? THREE.MathUtils.radToDeg(this.dir.angleTo(this.fwd)) : 0; }
  /** Distancia real de la lente al centro del hocico (m). */
  get distance() { return this.muzzle ? this.cam.position.distanceTo(this.muzzle) : this.params.dist; }

  /** Proyecta puntos de mundo a píxeles de la foto. */
  project(points, W, H) {
    const r = this.frameRect(W, H);
    return points.map(p => { const v = p.clone().project(this.cam); return { x: ((v.x + 1) / 2 * W - r.x) / r.w, y: ((1 - v.y) / 2 * H - r.y) / r.h, z: v.z }; });
  }
  /**
   * Copia la región 4:3 del lienzo justo después de renderizar (mismo cuadro).
   * @param {number} blurPx desenfoque si se dispara antes de enfocar
   */
  grab(canvas, blurPx = 0, maxW = 1280) {
    const W = canvas.width, H = canvas.height, r = this.frameRect(W, H), s = Math.min(1, maxW / r.w);
    const out = document.createElement('canvas'); out.width = Math.round(r.w * s); out.height = Math.round(r.h * s);
    const x = out.getContext('2d'); if (blurPx > 0.2) x.filter = `blur(${blurPx * s}px)`;
    x.drawImage(canvas, r.x, r.y, r.w, r.h, 0, 0, out.width, out.height); return out;
  }
}
