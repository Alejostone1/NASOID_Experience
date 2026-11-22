/* =============================================================================
   SIMULADOR DE IDENTIFICACIÓN NASO-LABIAL
   Orquestador del juego: carga, bucle, estados (menú, exploración, interacción,
   observación, cámara, revisión, análisis), galería de demostración y HUD.
   ============================================================================= */
import '../shared/theme.css';
import './ui/ranch.css';
import * as THREE from 'three';
import gsap from 'gsap';
import { loadFonts } from '../shared/fonts.js';
import { Environment, LAYOUT, heightAt } from './world/environment.js';
import { Herd } from './world/herd.js';
import { Farmer } from './world/farmer.js';
import { Input, PlayerController, CameraRig } from './world/controls.js';
import { PhotoCamera } from './world/photoCamera.js';
import { squareBox, centerBox } from './biometric/preprocess.js';
import { loadModel, isReady, MODEL_INFO } from './biometric/extractor.js';
import * as db from './biometric/db.js';
import { STATE, refresh, onChange, createRecord, addReference, logIdentification, markChallenge } from './state.js';
import { $, $$, h, esc, show, hide, toast, fmt, sleep, shutterSound, confirmDialog } from './ui/dom.js';
import { openReview } from './ui/review.js';
import { runAnalysis } from './ui/analysis.js';
import { initRegistry, openRegistry, closeRegistry, isOpen as registryOpen, rerender as rerenderRegistry, registerForm } from './ui/registry.js';

/* ---------------------------------------------------------------- calidad -- */
const PRESETS = {
  alto: { level: 'alto', dpr: Math.min(devicePixelRatio, 1.75), shadows: true, shadowSize: 2048, grass: 52000, trees: 46, cows: 9 },
  medio: { level: 'medio', dpr: Math.min(devicePixelRatio, 1.25), shadows: true, shadowSize: 1024, grass: 24000, trees: 30, cows: 9 },
  bajo: { level: 'bajo', dpr: 1, shadows: false, shadowSize: 512, grass: 6000, trees: 16, cows: 9 },
};
const params = new URLSearchParams(location.search);
const qKey = params.get('q') || localStorage.getItem('nasoid-quality') || (matchMedia('(pointer: coarse)').matches ? 'medio' : 'alto');
const Q = PRESETS[qKey] || PRESETS.alto;
$('#sel-quality').value = Q.level;

/* ------------------------------------------------------------ renderizado -- */
const canvas = $('#gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Q.dpr); renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.95;
renderer.shadowMap.enabled = Q.shadows; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.05, 1200);
const photoCam = new PhotoCamera(); photoCam.fit(innerWidth, innerHeight);
const seedCam = new PhotoCamera(); // cámara propia de la galería de práctica: nunca toca la cámara que usa el jugador
const timer = new THREE.Timer();

const G = {
  mode: 'loading', cow: null, purpose: 'identify', refRecord: null, identified: new Map(), progress: {},
  env: null, herd: null, farmer: null, ctrl: null, rig: null, input: null, observeA: 0, menuA: 0,
};
window.NASOID = G; // acceso para pruebas automáticas
G.api = {};

function setLoad(f, text) { $('#load-bar').style.width = Math.round(f * 100) + '%'; if (text) $('#load-text').textContent = text; }
const frameYield = () => new Promise(r => requestAnimationFrame(() => r()));

async function boot() {
  await loadFonts?.();
  setLoad(0.05, 'Levantando el terreno, el pasto y las cercas…'); await frameYield();
  G.env = new Environment(scene, renderer, Q);
  setLoad(0.25, 'Modelando los bovinos (cuerpo, cabeza y hocico)…'); await frameYield();
  G.herd = new Herd(scene, Q, G.env, f => setLoad(0.25 + f * 0.55, `Modelando los bovinos… ${Math.round(f * Q.cows)}/${Q.cows}`));
  await G.herd.build();
  G.farmer = new Farmer(); G.farmer.position.copy(LAYOUT.spawn); G.farmer.position.y = heightAt(LAYOUT.spawn.x, LAYOUT.spawn.z); G.farmer.root.rotation.y = Math.PI; scene.add(G.farmer.root);
  G.input = new Input(canvas, $('#joystick'));
  G.ctrl = new PlayerController(G.farmer, G.input, G.env, G.herd);
  G.rig = new CameraRig(camera, G.input);
  G.input.onKey = onKey;
  setLoad(0.85, 'Abriendo el registro de bovinos…');
  await refresh();
  G.progress = await db.getMeta('progress', {});
  initRegistry({ onCaptureRef, onUploadRef, onReset: resetPractice, onUploadRegister });
  bindUI(); renderMission();
  setLoad(1, 'Listo.');
  renderer.compile(scene, camera);
  G.mode = 'menu'; menuCamera(true);
  requestAnimationFrame(loop);
  await sleep(250); gsap.to('#loader', { opacity: 0, duration: 0.6, onComplete: () => hide('#loader') }); show('#menu');
  $('#btn-play').focus();
  backgroundPrep();
}

/* ----------------------------------------------- modelo y galería de práctica */
async function backgroundPrep() {
  const md = $('#st-model-dot'), mt = $('#st-model'), gd = $('#st-gallery-dot'), gt = $('#st-gallery');
  md.className = 'dot busy'; mt.textContent = 'ResNet50: descargando pesos (47 MB, solo la primera vez)…';
  try {
    await loadModel(f => { mt.textContent = `ResNet50: descargando pesos… ${Math.round(f * 100)} %`; });
    md.className = 'dot on'; mt.textContent = `ResNet50 lista · ${MODEL_INFO.backend} · ${fmt(MODEL_INFO.loadMs / 1000, 1)} s`;
  } catch (e) { md.className = 'dot'; mt.textContent = 'No se pudo cargar ResNet50: ' + e.message; console.error(e); return; }
  const seeded = await db.getMeta('seeded');
  if (seeded !== GALLERY_V) {
    gd.className = 'dot busy';
    if (seeded) { await db.resetAll(); G.progress = {}; G.identified.clear(); await refresh(); } // la finca cambió: las referencias viejas ya no corresponden a los renders nuevos
    await seedDemo((i, n) => { gt.textContent = `Galería de práctica: fotografiando referencias ${i}/${n}…`; });
  }
  gd.className = 'dot on'; gt.textContent = `Galería de práctica lista · ${STATE.records.length} registros · θ = ${fmt(STATE.cal.theta)}`;
  G.ready = true; renderMission();
}

/** Versión de la galería de práctica: cambia cuando cambian el modelado o la luz de la finca. */
const GALLERY_V = 5;
const DEMO = [
  { k: 0, code: 'BOV-001', name: 'Lucero' }, { k: 1, code: 'BOV-002', name: 'Canela' }, { k: 2, code: 'BOV-003', name: 'Mariposa' },
  { k: 3, code: 'BOV-004', name: 'Tormenta' }, { k: 4, code: 'BOV-005', name: 'Paloma' }, { k: 5, code: 'BOV-006', name: 'Azucena' },
];
const SHOTS = [{ dist: 0.3, yaw: 0, pitch: 0, head: 0 }, { dist: 0.33, yaw: -7, pitch: 3, head: 4 }, { dist: 0.28, yaw: 6, pitch: -3, head: -5 }];

/** Toma fotos REALES del render: posa al bovino, coloca la cámara, renderiza y copia los píxeles. */
function shoot(cow, p, blur = 0) {
  const saved = { st: cow.state, hp: cow.headPitch, np: cow.neckPitch, hy: cow.headYaw, hpt: cow.headPitchTarget, npt: cow.neckPitchTarget, hyt: cow.headYawTarget, sp: cow.speed, ph: cow.phase };
  G.herd.pose(cow); cow.headYawTarget = THREE.MathUtils.degToRad(p.head || 0);
  cow.headPitch = cow.headPitchTarget; cow.neckPitch = cow.neckPitchTarget; cow.headYaw = cow.headYawTarget; cow.speed = 0; cow.update(1e-4);
  Object.assign(seedCam.params, { dist: p.dist, yaw: p.yaw, pitch: p.pitch, offX: 0, offY: 0 });
  seedCam.fit(innerWidth, innerHeight); seedCam.aim(cow);
  G.env.followShadow(cow.position); fullResolution(); photoLight(true); const fv = G.farmer.root.visible; G.farmer.root.visible = false;
  renderer.render(scene, seedCam.cam); photoLight(false);
  const photo = seedCam.grab(canvas, blur);
  const box = suggestBox(cow, photo, CROP_PAD, seedCam);
  G.farmer.root.visible = fv;
  Object.assign(cow, { state: saved.st, headPitch: saved.hp, neckPitch: saved.np, headYaw: saved.hy, headPitchTarget: saved.hpt, neckPitchTarget: saved.npt, headYawTarget: saved.hyt, speed: saved.sp, phase: saved.ph });
  cow.update(1e-4);
  return { photo, box };
}
function suggestBox(cow, photo, pad = CROP_PAD, cam = photoCam) {
  const pts = cam.project(cow.muzzleCorners(), canvas.width, canvas.height).map(p => ({ x: p.x * photo.width, y: p.y * photo.height }));
  return squareBox(pts, photo.width, photo.height, pad);
}
let CROP_PAD = 0.5; // lado del recuadro = 0,5 × la región proyectada: plano naso-labial entre las fosas nasales (deja fuera frente, cuernos, cielo y pasto)
/** Registro como en la sesión S1 de V27: el animal se fotografía inmovilizado en el brete. */
function inChute(cow, fn) {
  const pos = cow.root.position.clone(), rot = cow.root.rotation.y, was = cow.inChute;
  cow.root.position.set(LAYOUT.chute.x, heightAt(LAYOUT.chute.x, LAYOUT.capture.z - 2.25), LAYOUT.capture.z - 2.25); cow.root.rotation.y = 0; cow.inChute = true;
  cow.root.updateMatrixWorld(true);
  try { return fn(); } finally { cow.root.position.copy(pos); cow.root.rotation.y = rot; cow.inChute = was; cow.root.updateMatrixWorld(true); }
}
async function seedDemo(onStep) {
  const n = DEMO.length * SHOTS.length; let i = 0;
  for (const d of DEMO) {
    const cow = G.herd.cows[d.k]; if (!cow) continue;
    const rec = await createRecord({ code: d.code, name: d.name, sceneCow: d.k, demo: true, breed: cow.breed.name });
    for (const s of SHOTS) { const { photo, box } = inChute(cow, () => shoot(cow, s)); G.env.followShadow(G.farmer.position); renderView(); /* el cuadro que se presenta es la vista del jugador: sin destellos */ await addReference(rec, photo, box, 'render'); onStep(++i, n); await frameYield(); }
  }
  // registro duplicado a propósito: el mismo animal (BOV-003) registrado otra vez como BOV-007
  const src = STATE.records.find(r => r.code === 'BOV-003');
  if (src) {
    const dup = await createRecord({ code: 'BOV-007', name: 'Mariposa (copia)', sceneCow: src.sceneCow, demo: true, breed: src.breed });
    dup.refs = src.refs.map(r => ({ ...r, id: db.uid('ref') })); dup.coverId = src.coverId; dup.status = 'registrado'; dup.note = 'Registro duplicado de práctica';
    await db.putRecord(dup); await db.addEvent({ recordId: dup.id, type: 'registro', text: 'Copia de las referencias de BOV-003 (registro duplicado de práctica)' });
  }
  await db.setMeta('seeded', GALLERY_V); await refresh();
}
async function resetPractice() {
  closeRegistry(); await db.resetAll(); G.identified.clear(); G.progress = {}; await refresh();
  toast('Datos borrados. Creando de nuevo la galería de práctica…'); G.ready = false; renderMission();
  await seedDemo((i, n) => { $('#st-gallery').textContent = `Galería de práctica: fotografiando referencias ${i}/${n}…`; });
  G.ready = true; renderMission(); toast(`Galería lista: ${STATE.records.length} registros · θ = ${fmt(STATE.cal.theta)}`);
}

/* ------------------------------------------------------------------- bucle -- */
function loop(ts) {
  requestAnimationFrame(loop); timer.update(ts); const dt = Math.min(0.05, timer.getDelta());
  adaptResolution(dt); // antes de dibujar: si cambia el tamaño del lienzo no queda un cuadro en blanco
  const p = G.farmer.position;
  G.env.update(dt, p);
  G.herd.update(dt, G.mode === 'explore' ? p : null);
  const sp = G.mode === 'explore' ? G.ctrl.update(dt) : G.mode === 'travel' ? G.travelSpeed : (G.ctrl.vel.multiplyScalar(0.8), 0);
  G.farmer.update(dt, sp, G.mode === 'capture' || G.mode === 'capture-in' || G.mode === 'review');
  G.farmer.root.visible = G.mode !== 'capture';
  if (G.mode === 'menu') menuCamera();
  if (G.mode === 'observe') { G.observeA += dt * 0.35; observeCamera(); }
  if (G.mode === 'capture-in') captureIn(dt); else G.rig.update(dt, p);
  if (G.mode === 'capture') { photoCam.aim(G.cow); updateCameraHud(dt); }
  renderView();
  if (G.mode === 'explore') updatePrompt();
  if ((G.frame = (G.frame || 0) + 1) % 3 === 0 && G.mode !== 'menu') drawMinimap();
}
/** Dibuja lo que el jugador debe ver en este momento (vista del juego o visor del celular). */
function renderView() {
  if (G.mode === 'capture') { const fv = G.farmer.root.visible; G.farmer.root.visible = false; photoLight(true); renderer.render(scene, photoCam.cam); photoLight(false); G.farmer.root.visible = fv; }
  else if (G.mode === 'capture-in') { photoLight(G.camAnim.e > 0.55); renderer.render(scene, camera); photoLight(false); }
  else renderer.render(scene, camera);
}
/** Resolución adaptativa: si el equipo no alcanza ~40 fps al explorar, baja la densidad de píxeles; si sobra, la sube. */
const PERF = { acc: 0, n: 0, dpr: Q.dpr };
function adaptResolution(dt) {
  PERF.acc += dt; PERF.n++; if (PERF.acc < 1.5) return;
  const ms = PERF.acc / PERF.n * 1000; PERF.acc = 0; PERF.n = 0;
  if (!G.ready || (G.mode !== 'explore' && G.mode !== 'menu' && G.mode !== 'travel')) return; // nunca mientras se crea la galería: las fotos se toman a resolución completa
  const next = ms > 25 ? Math.max(0.65, PERF.dpr - 0.15) : ms < 14 ? Math.min(Q.dpr, PERF.dpr + 0.1) : PERF.dpr;
  if (Math.abs(next - PERF.dpr) > 0.01) { PERF.dpr = next; renderer.setPixelRatio(next); }
}
/** Exposición automática del celular: a 30 cm el hocico queda en la sombra de la cabeza; la cámara compensa con más exposición y luz de relleno del cielo. */
const LOOK = { world: null };
function photoLight(on) {
  const e = G.env; if (!LOOK.world) LOOK.world = { hemi: e.hemi.intensity, envI: scene.environmentIntensity, exp: renderer.toneMappingExposure };
  const w = LOOK.world; e.hemi.intensity = on ? 0.85 : w.hemi; scene.environmentIntensity = on ? 0.42 : w.envI; renderer.toneMappingExposure = on ? 1.08 : w.exp;
}
function fullResolution() { if (PERF.dpr !== Q.dpr) { PERF.dpr = Q.dpr; renderer.setPixelRatio(Q.dpr); } }

/* ------------------------------------------------- viaje rápido al bovino -- */
/** Bovino sugerido: el más cercano que aún no se ha identificado (al repetir, pasa al siguiente). */
function nextCow() {
  const p = G.farmer.position, list = G.herd.cows.filter(c => !c.inChute);
  list.sort((a, b) => (G.identified.has(a.k) - G.identified.has(b.k)) || (a.position.distanceTo(p) - b.position.distanceTo(p)));
  const i = list.indexOf(G.lastTravel); return list.length > 1 && i === 0 ? list[1] : list[0];
}
async function goToCow(cow) {
  if (!cow || G.mode !== 'explore') return;
  G.lastTravel = cow; G.mode = 'travel'; setPrompt(''); progress('met');
  const f = new THREE.Vector3(Math.sin(cow.heading), 0, Math.cos(cow.heading)), side = new THREE.Vector3(f.z, 0, -f.x);
  const target = cow.position.clone().addScaledVector(f, 2.3 * cow.scale).addScaledVector(side, 0.5); G.env.resolve(target, 0.3); target.y = heightAt(target.x, target.z);
  G.herd.attend(cow, target.clone()); // se detiene y espera mirando hacia donde llegará el operario
  const from = G.farmer.position.clone(), d = from.distanceTo(target), P = LAYOUT.pasture;
  const inside = v => v.x > P.x0 && v.x < P.x1 && v.z > P.z0 && v.z < P.z1;
  if (!inside(from) || d > 26) { // fuera del potrero: un fundido corto en lugar de atravesar cercas
    await fade(async () => { G.farmer.position.copy(target); G.rig.started = false; });
  } else {
    const dur = THREE.MathUtils.clamp(d / 8, 0.45, 1.8), o = { t: 0 }; G.travelSpeed = Math.min(6.8, d / dur);
    G.input.yaw = Math.atan2(from.x - target.x, from.z - target.z);
    await gsap.to(o, { t: 1, duration: dur, ease: 'power2.inOut', onUpdate: () => {
      G.farmer.position.lerpVectors(from, target, o.t); G.farmer.position.y = heightAt(G.farmer.position.x, G.farmer.position.z);
      G.farmer.root.rotation.y = Math.atan2(target.x - from.x, target.z - from.z);
      G.travelSpeed = Math.sin(o.t * Math.PI) * Math.min(6.8, d / dur * 1.4);
    } });
  }
  G.travelSpeed = 0; G.mode = 'explore'; openInteract(cow);
}


function menuCamera(snap) {
  G.menuA += 0.0009; const c = new THREE.Vector3(-2, 0, -4), a = G.menuA * Math.PI * 2 + 2.2;
  G.rig.setOverride(new THREE.Vector3(c.x + Math.cos(a) * 26, 8.5, c.z + Math.sin(a) * 26), new THREE.Vector3(c.x, 1, c.z), 1.5); if (snap) G.rig.snap();
}
function observeCamera() {
  const c = G.cow, m = c.muzzleWorld(new THREE.Vector3()), mid = c.position.clone().lerp(m, 0.4); mid.y = 1.0;
  const a = G.observeA; G.rig.setOverride(new THREE.Vector3(mid.x + Math.cos(a) * 4.2, 1.9 + Math.sin(a * 0.7) * 0.4, mid.z + Math.sin(a) * 4.2), mid, 2);
}

/* ---------------------------------------------------------- exploración -- */
let promptKey = '';
function setPrompt(html, soft = false, key = html) {
  if (key === promptKey) return; promptKey = key; const el = $('#prompt');
  if (!html) { hide(el); hide('#btn-touch-act'); return; }
  el.className = 'prompt' + (soft ? ' soft' : ''); el.innerHTML = html; show(el);
  $('#btn-touch-act').classList.toggle('hidden', soft);
}
function updatePrompt() {
  const p = G.farmer.position, near = G.herd.nearest(p, G.ctrl.facing);
  G.near = near;
  if (near) {
    const id = G.identified.get(near.k);
    return setPrompt(`<kbd>E</kbd> Interactuar con ${id ? `<b>${esc(id)}</b>` : 'el bovino'}`, false, 'cow' + near.k + (id || ''));
  }
  const dz = Math.hypot(p.x - LAYOUT.capture.x, p.z - LAYOUT.capture.z);
  if (dz < 2.5) return setPrompt('Zona de captura · elige «Llevar al brete» al interactuar con un bovino', true);
  if (!G.progress.met) return setPrompt('<kbd>Q</kbd> ir al bovino más cercano · o camina con <kbd>W A S D</kbd>', true);
  setPrompt('');
}

function onKey(k, e) {
  if (k === 'f' && !e.target.closest?.('input')) return toggleFull();
  if (G.mode === 'menu') { if (k === 'enter') startGame(); return; }
  if (G.mode === 'explore') {
    if (k === 'e' && G.near) return openInteract(G.near);
    if (k === 'q') return goToCow(nextCow());
    if (k === 'r') return registryOpen() ? closeRegistry() : openRegistry();
    if (k === 'h') return openHelp();
    if (k === 'escape') return registryOpen() ? closeRegistry() : !$('#help').classList.contains('hidden') ? hide('#help') : pause();
  } else if (G.mode === 'interact') {
    const acts = $$('#interact [data-act]'); const n = parseInt(k, 10);
    if (n >= 1 && n <= acts.length) acts[n - 1].click();
    if (k === 'escape' || k === 'e') closeInteract();
  } else if (G.mode === 'observe') { if (k === 'escape' || k === 'e') { G.mode = 'interact'; openInteract(G.cow, true); } }
  else if (G.mode === 'capture') {
    if (k === ' ' || k === 'enter') { e.preventDefault(); return shutter(); }
    if (k === 'escape') return exitCapture();
    const step = { arrowleft: ['yaw', -2], arrowright: ['yaw', 2], arrowup: ['pitch', 2], arrowdown: ['pitch', -2], '+': ['dist', -1], '-': ['dist', 1] }[k];
    if (step) { const map = { yaw: '#cam-r-yaw', pitch: '#cam-r-pitch', dist: '#cam-r-dist' }; const el = $(map[step[0]]); el.value = +el.value + step[1]; el.dispatchEvent(new Event('input')); }
  }
}

/* ---------------------------------------------------------- interacción -- */
async function progress(key) { if (G.progress[key]) return; G.progress[key] = Date.now(); await db.setMeta('progress', G.progress); renderMission(); }

function openInteract(cow, silent) {
  G.cow = cow; G.mode = 'interact'; setPrompt(''); document.body.classList.add('interacting');
  G.herd.attend(cow, G.farmer.position); G.ctrl.faceTowards(cow.muzzleWorld(new THREE.Vector3()));
  progress('met');
  // encuadre de tres cuartos: delante del bovino, detrás y al lado del operario
  const m = cow.muzzleWorld(new THREE.Vector3()), pp = G.farmer.position;
  const f = new THREE.Vector3(Math.sin(cow.heading), 0, Math.cos(cow.heading)), rt = new THREE.Vector3(f.z, 0, -f.x);
  const toP = new THREE.Vector3().subVectors(pp, m); const sgn = toP.dot(rt) >= 0 ? 1 : -1;
  const camPos = m.clone().addScaledVector(f, 2.7).addScaledVector(rt, sgn * 1.9); camPos.y = heightAt(camPos.x, camPos.z) + 1.75;
  G.rig.setOverride(camPos, m.clone().lerp(pp, 0.35).setY(1.15), 3);
  const id = G.identified.get(cow.k);
  const el = $('#interact');
  el.innerHTML = `<div class="spread"><div><div class="eyebrow">${cow.inChute ? 'En el brete · zona de captura' : 'Potrero'} · pelaje ${esc(cow.breed.name)}</div><h3>${id ? esc(id) : 'Bovino sin identificar'}</h3></div><button class="btn ghost" data-close>Alejarse <kbd>Esc</kbd></button></div>
    <p class="sub">${id ? 'El sistema ya lo identificó en esta sesión. Puedes volver a comprobarlo.' : 'No lleva identificación visible. Para saber si está registrado, el sistema necesita una foto de su hocico.'}</p>
    <div class="acts">
      <button class="act main" data-act="photo"><b>Fotografiar e identificar <kbd>1</kbd></b><span>Toma la foto del hocico y consulta si está registrado.</span></button>
      <button class="act" data-act="register"><b>Registrar este bovino <kbd>2</kbd></b><span>Crea su ficha y guarda sus fotos de referencia.</span></button>
      <button class="act" data-act="chute"><b>${cow.inChute ? 'Devolver al potrero' : 'Llevar al brete'} <kbd>3</kbd></b><span>${cow.inChute ? 'Libera al animal.' : 'Inmovilízalo en la zona de captura, como en el protocolo.'}</span></button>
      <button class="act" data-act="observe"><b>Observar <kbd>4</kbd></b><span>Rodéalo con la cámara.</span></button>
    </div>`;
  show(el);
  el.querySelector('[data-close]').onclick = closeInteract;
  el.querySelector('[data-act=photo]').onclick = () => enterCapture('identify');
  el.querySelector('[data-act=register]').onclick = () => startRegister(cow);
  el.querySelector('[data-act=chute]').onclick = () => toggleChute(cow);
  el.querySelector('[data-act=observe]').onclick = () => { hide(el); G.mode = 'observe'; G.observeA = Math.atan2(camPos.z - m.z, camPos.x - m.x); setPrompt('Observando · <kbd>Esc</kbd> para volver', true, 'obs'); };
}
function closeInteract() {
  hide('#interact'); document.body.classList.remove('interacting'); if (G.cow && !G.cow.inChute) G.herd.release(G.cow); else if (G.cow) G.cow.state = 'chute';
  G.rig.clearOverride(); G.mode = 'explore'; promptKey = '';
}
async function fade(fn) { const v = h('<div style="position:fixed;inset:0;background:#f6f2e8;z-index:70;opacity:0"></div>'); document.body.append(v); await gsap.to(v, { opacity: 1, duration: 0.45 }); await fn(); await sleep(120); await gsap.to(v, { opacity: 0, duration: 0.55 }); v.remove(); }
async function toggleChute(cow) {
  hide('#interact');
  await fade(async () => {
    if (!cow.inChute) {
      cow.home = cow.position.clone(); cow.inChute = true; cow.state = 'chute'; cow.speed = 0;
      cow.root.position.set(LAYOUT.chute.x, heightAt(LAYOUT.chute.x, LAYOUT.capture.z - 2.25), LAYOUT.capture.z - 2.25); cow.root.rotation.y = 0;
      G.farmer.position.set(LAYOUT.capture.x + 0.2, 0, LAYOUT.capture.z + 0.6); G.farmer.position.y = heightAt(G.farmer.position.x, G.farmer.position.z);
    } else {
      cow.inChute = false; const hm = cow.home || new THREE.Vector3(0, 0, 0); cow.root.position.set(hm.x, heightAt(hm.x, hm.z), hm.z); G.herd.setState(cow, 'idle');
      G.farmer.position.set(hm.x + 2.5, 0, hm.z + 2.5); G.farmer.position.y = heightAt(G.farmer.position.x, G.farmer.position.z);
    }
    cow.update(0.016); G.rig.clearOverride(); G.rig.started = false;
  });
  if (cow.inChute) openInteract(cow); else { G.mode = 'explore'; promptKey = ''; }
}

/* ---------------------------------------------------------------- cámara -- */
/** Transición hacia la cámara del celular: la vista baja por encima del hombro del operario hasta quedar a 30 cm del hocico. */
function captureIn(dt) {
  const A = G.camAnim; A.t = Math.min(1, (performance.now() - A.t0) / (A.dur * 1000)); /* en tiempo real: dura lo mismo en cualquier equipo */ const t = A.t, e = A.e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  photoCam.aim(G.cow);
  // curva: primero detrás del hombro, luego al frente del hocico
  const mid = A.p0.clone().lerp(photoCam.cam.position, 0.5); mid.y += 0.35;
  const a = A.p0.clone().lerp(mid, e), b = mid.clone().lerp(photoCam.cam.position, e); camera.position.lerpVectors(a, b, e);
  camera.quaternion.slerpQuaternions(A.q0, photoCam.cam.quaternion, Math.min(1, e * 1.15));
  camera.fov = THREE.MathUtils.lerp(A.f0, photoCam.cam.fov, e); camera.updateProjectionMatrix();
  G.farmer.root.visible = camera.position.distanceTo(G.farmer.position.clone().setY(G.farmer.position.y + 1.4)) > 0.8 && e < 0.6;
  $('#camera-ui').style.opacity = Math.max(0, (e - 0.55) / 0.45);
  if (t >= 1) { camera.fov = A.f0; camera.updateProjectionMatrix(); G.mode = 'capture'; A.done?.(); }
}
const CAM = { lastChange: 0, focus: 1, checks: [] };
function enterCapture(purpose, rec = null) {
  if (!G.cow) return;
  fullResolution();
  G.purpose = purpose; G.refRecord = rec; hide('#interact'); setPrompt('');
  G.herd.pose(G.cow); G.ctrl.faceTowards(G.cow.muzzleWorld(new THREE.Vector3()));
  Object.assign(photoCam.params, { dist: 0.3, yaw: 0, pitch: 0, offX: 0, offY: 0 });
  $('#cam-r-dist').value = 30; $('#cam-r-yaw').value = 0; $('#cam-r-pitch').value = 0; $('#cam-r-head').value = 0;
  G.cow.headYawTarget = 0; photoCam.fit(innerWidth, innerHeight);
  CAM.focus = 0.2; CAM.lastChange = performance.now(); $('#cam-focus').textContent = 'AF …'; $('#cam-checks').innerHTML = ''; $('#cam-shutter').classList.remove('ready');
  layoutViewfinder(); $('#camera-ui').style.opacity = 0; show('#camera-ui'); G.input.enabled = false; document.body.classList.add('cam');
  if (G.skipCamAnim) { G.mode = 'capture'; $('#camera-ui').style.opacity = 1; }
  else { photoCam.aim(G.cow); G.camAnim = { t: 0, t0: performance.now(), e: 0, dur: 1.1, p0: camera.position.clone(), q0: camera.quaternion.clone(), f0: camera.fov, done: () => { $('#camera-ui').style.opacity = 1; CAM.lastChange = performance.now(); } }; G.mode = 'capture-in'; }
  if (purpose === 'reference' && rec) toast(`Referencia ${rec.refs.length + 1} de ${rec.code}: ubica el hocico y captura.`);
}
function exitCapture(toInteract = true) {
  hide('#camera-ui'); G.input.enabled = true; document.body.classList.remove('cam');
  if (toInteract && G.cow) openInteract(G.cow, true); else { G.mode = 'explore'; G.rig.clearOverride(); }
}
function layoutViewfinder() {
  const r = photoCam.frameRect(innerWidth, innerHeight), f = $('#cam-frame');
  Object.assign(f.style, { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px' });
  $('.cam-mask').style.boxShadow = `inset 0 0 0 0 transparent`;
  $('.cam-mask').style.background = `linear-gradient(#141812e6,#141812e6) left/ ${r.x}px 100% no-repeat, linear-gradient(#141812e6,#141812e6) right/ ${r.x}px 100% no-repeat, linear-gradient(#141812e6,#141812e6) top/ 100% ${r.y}px no-repeat, linear-gradient(#141812e6,#141812e6) bottom/ 100% ${r.y}px no-repeat`;
}
function onCamInput() {
  photoCam.params.dist = $('#cam-r-dist').value / 100; photoCam.params.yaw = +$('#cam-r-yaw').value; photoCam.params.pitch = +$('#cam-r-pitch').value;
  if (G.cow) G.cow.headYawTarget = THREE.MathUtils.degToRad(+$('#cam-r-head').value);
  CAM.lastChange = performance.now(); CAM.focus = Math.min(CAM.focus, 0.45);
}
function updateCameraHud(dt) {
  const since = performance.now() - CAM.lastChange;
  if (since > 250) CAM.focus = Math.min(1, CAM.focus + dt * 1.8);
  const W = innerWidth, H = innerHeight, r = photoCam.frameRect(W, H);
  const pts = photoCam.project(G.cow.muzzleCorners(), W, H), c = pts[4];
  const af = $('#cam-af'); af.style.left = (c.x * 100) + '%'; af.style.top = (c.y * 100) + '%'; af.classList.toggle('locked', CAM.focus > 0.97);
  const cm = photoCam.distance * 100, ang = photoCam.frontalAngle;
  const inFrame = pts.slice(0, 4).every(p => p.x > 0.04 && p.x < 0.96 && p.y > 0.04 && p.y < 0.96 && p.z < 1);
  const big = Math.abs(pts[1].x - pts[0].x) > 0.18;
  const checks = [
    ['dist', cm > 24 && cm < 40, `Distancia ${Math.round(cm)} cm`, cm <= 24 ? 'Aléjate un poco (unos 30 cm)' : 'Acércate (unos 30 cm)'],
    ['front', ang < 12, `De frente · ${Math.round(ang)}°`, 'Gira hacia el frente del hocico'],
    ['frame', inFrame && big, 'Hocico en el encuadre', inFrame ? 'Acércate: el hocico se ve pequeño' : 'Ubica el hocico en el encuadre'],
    ['focus', CAM.focus > 0.97, CAM.focus > 0.97 ? 'Enfocado' : 'Enfocando…', 'Espera a que enfoque'],
  ];
  CAM.checks = checks;
  $('#cam-dist').textContent = `${Math.round(cm)} cm`; $('#cam-ang').textContent = `${Math.round(ang)}°`; $('#cam-focus').textContent = CAM.focus > 0.97 ? 'AF ✓' : 'AF …';
  $('#cam-checks').innerHTML = checks.map(([k, ok, label]) => `<div class="${ok ? 'ok' : ''}">${label}</div>`).join('');
  const bad = checks.find(x => !x[1]); $('#cam-hint').textContent = bad ? bad[3] : 'Todo listo · presiona capturar (Espacio)';
  $('#cam-shutter').classList.toggle('ready', !bad);
}
let shooting = false;
async function shutter() {
  if (shooting || G.mode !== 'capture') return; shooting = true;
  gsap.fromTo('#cam-frame', { scale: 0.965 }, { scale: 1, duration: 0.35, ease: 'back.out(2)' });
  const blur = (1 - CAM.focus) * 6;
  photoCam.aim(G.cow); photoLight(true); G.farmer.root.visible = false; renderer.render(scene, photoCam.cam); photoLight(false);
  const photo = photoCam.grab(canvas, blur), box = suggestBox(G.cow, photo);
  shutterSound(); gsap.fromTo('#cam-flash', { opacity: 0.9 }, { opacity: 0, duration: 0.45 });
  progress('shot');
  await sleep(380); shooting = false;
  hide('#camera-ui'); document.body.classList.remove('cam'); G.mode = 'review'; G.input.enabled = true;
  await reviewFlow(photo, box, { k: G.cow.k });
}
async function onUpload(file, truth = null) {
  const c = await db.blobToCanvas(file), s = Math.min(1, 1600 / Math.max(c.width, c.height));
  const photo = document.createElement('canvas'); photo.width = Math.round(c.width * s); photo.height = Math.round(c.height * s); photo.getContext('2d').drawImage(c, 0, 0, photo.width, photo.height);
  hide('#camera-ui'); document.body.classList.remove('cam'); G.input.enabled = true; G.mode = 'review';
  return reviewFlow(photo, centerBox(photo.width, photo.height, 0.6), truth, true);
}

async function reviewFlow(photo, box, truth, uploaded = false) {
  const purpose = G.purpose, rec = G.refRecord;
  const r = await openReview({ photo, box, purpose: purpose === 'reference' ? 'reference' : 'identify', subtitle: uploaded ? 'Foto subida por ti: ajusta el recuadro sobre el hocico.' : purpose === 'reference' ? `Referencia para ${rec.code}` : '' });
  if (r.action === 'retake') return G.cow && !uploaded ? enterCapture(purpose, rec) : (G.mode = 'explore');
  if (r.action === 'cancel') { if (G.cow && !uploaded) return openInteract(G.cow, true); G.mode = 'explore'; G.rig.clearOverride(); return; }
  if (purpose === 'reference') return saveReference(rec, photo, r, uploaded ? 'subida' : 'render');
  return analyze(photo, r, uploaded ? null : truth);
}

async function analyze(photo, r, truth) {
  if (!STATE.records.some(x => x.refs.length)) { toast('Todavía no hay bovinos registrados con fotos de referencia.'); }
  if (!isReady()) toast('Cargando ResNet50…');
  G.mode = 'analysis'; progress('sent');
  let saving = Promise.resolve();
  const onResult = res => { saving = (async () => { // se guarda en cuanto aparece el resultado, antes de que el usuario elija qué hacer
    await logIdentification(res, { edited: r.edited, sceneCow: truth?.k ?? null });
    if (res.state === 'identificado' && truth) G.identified.set(truth.k, res.top.record.code);
    await progress('result');
    const ch = { identificado: 'ok', 'no-identificado': 'warn', 'no-concluyente': 'tie' }[res.state];
    if (ch && await markChallenge(res.state)) toast('Desafío logrado: ' + { ok: 'Identificado', warn: 'No identificado', tie: 'No concluyente' }[ch]);
    renderMission();
  })(); };
  const out = await runAnalysis({ photo, box: r.box, pre: r.pre, records: STATE.records, cal: STATE.cal, truth, onResult });
  const res = out.result;
  if (out.action === 'retake') return G.cow && truth ? enterCapture('identify') : (G.mode = 'explore');
  if (out.action === 'ficha') { backToWorld(); await saving; return openRegistry(res.top.record.id); }
  if (out.action === 'register') { await saving; return truth ? startRegister(G.cow, { photo, r }) : registerUploaded(photo, r); }
  backToWorld();
}
function backToWorld() { document.body.classList.remove('interacting'); if (G.cow && G.mode !== 'explore') { if (!G.cow.inChute) G.herd.release(G.cow); else G.cow.state = 'chute'; } G.rig.clearOverride(); G.mode = 'explore'; promptKey = ''; }

/* ---------------------------------------------------------------- registro -- */
async function startRegister(cow, first = null) {
  hide('#interact');
  const f = await registerForm(); if (!f) return cow ? openInteract(cow, true) : backToWorld();
  const rec = await createRecord({ ...f, sceneCow: cow ? cow.k : null, breed: cow?.breed.name || '' });
  await markChallenge('registro') && toast('Desafío logrado: Registrar un bovino');
  if (first) { toast('Guardando la foto analizada como primera referencia…'); await addReference(rec, first.photo, first.r.box, 'render', first.r.pre); }
  G.cow = cow; await afterReference(rec);
}
async function saveReference(rec, photo, r, source) {
  G.mode = 'analysis';
  toast(isReady() ? 'Calculando la huella con ResNet50…' : 'Cargando ResNet50 y calculando la huella…');
  await addReference(rec, photo, r.box, source, r.pre);
  await afterReference(rec);
}
async function afterReference(rec) {
  rerenderRegistry(); renderMission();
  const fresh = STATE.records.find(x => x.id === rec.id) || rec;
  const d = $('#dialog');
  d.innerHTML = `<div class="sheet narrow"><div class="eyebrow">Registro ${esc(fresh.code)}</div><h2>${fresh.refs.length ? `Referencia ${fresh.refs.length} guardada` : 'Registro creado'}</h2>
    <p class="note" style="font-size:14px">${fresh.refs.length ? `La huella de 2048 valores quedó guardada. Umbral recalibrado: θ = <b class="mono">${fmt(STATE.cal.theta)}</b> (${esc(STATE.cal.rule)}).` : 'Ahora toma su primera foto de referencia.'} ${fresh.refs.length < 3 ? 'Se recomienda tomar al menos tres fotos cambiando un poco el ángulo.' : ''}</p>
    <div class="row" style="justify-content:flex-end;margin-top:14px">${G.cow ? '<button class="btn primary" data-more>Tomar otra referencia</button>' : '<label class="btn primary">Subir otra foto<input type="file" accept="image/*" hidden data-up /></label>'}<button class="btn" data-end>Terminar</button></div></div>`;
  show(d);
  const close = () => { hide(d); d.innerHTML = ''; };
  d.querySelector('[data-more]')?.addEventListener('click', () => { close(); enterCapture('reference', fresh); });
  d.querySelector('[data-up]')?.addEventListener('change', e => { close(); onUploadRef(fresh, e.target.files[0]); });
  d.querySelector('[data-end]').onclick = () => { close(); G.purpose = 'identify'; G.refRecord = null; G.cow ? (G.mode = 'interact', openInteract(G.cow, true)) : backToWorld(); toast(`${fresh.code} queda con ${fresh.refs.length} foto(s) de referencia.`); };
}
async function registerUploaded(photo, r) {
  const f = await registerForm(); if (!f) return backToWorld();
  const rec = await createRecord({ ...f, sceneCow: null });
  await addReference(rec, photo, r.box, 'subida', r.pre); G.cow = null; await afterReference(rec);
}
function onCaptureRef(rec) {
  const cow = G.herd.cows[rec.sceneCow]; if (!cow) return;
  const f = new THREE.Vector3(Math.sin(cow.heading), 0, Math.cos(cow.heading));
  G.farmer.position.copy(cow.position).addScaledVector(f, 2.4 * cow.scale); G.env.resolve(G.farmer.position, 0.3);
  G.cow = cow; G.mode = 'interact'; openInteract(cow, true); enterCapture('reference', rec);
}
async function onUploadRef(rec, file) { G.purpose = 'reference'; G.refRecord = rec; G.cow = null; await onUpload(file); }
function onUploadRegister() {
  closeRegistry(); const inp = h('<input type="file" accept="image/*" />');
  inp.onchange = async () => { const file = inp.files[0]; if (!file) return; G.purpose = 'register-upload'; G.cow = null;
    const c = await db.blobToCanvas(file), s = Math.min(1, 1600 / Math.max(c.width, c.height)); const photo = document.createElement('canvas'); photo.width = Math.round(c.width * s); photo.height = Math.round(c.height * s); photo.getContext('2d').drawImage(c, 0, 0, photo.width, photo.height);
    const r = await openReview({ photo, box: centerBox(photo.width, photo.height, 0.6), purpose: 'reference', subtitle: 'Foto propia: ajusta el recuadro sobre el hocico.' });
    if (r.action === 'accept') registerUploaded(photo, r); else backToWorld();
  };
  inp.click();
}

/* -------------------------------------------------------------- HUD varios -- */
function renderMission() {
  const P = G.progress, steps = [['met', 'Acércate a un bovino y presiona E'], ['shot', 'Fotografía su hocico'], ['sent', 'Envíala a analizar'], ['result', 'Observa la decisión del sistema']];
  const now = steps.findIndex(s => !P[s[0]]);
  $('#mission-steps').innerHTML = steps.map(([k, t], i) => `<li class="${P[k] ? 'done' : i === now ? 'now' : ''}"><i>${P[k] ? '' : i + 1}</i>${t}</li>`).join('');
  const C = STATE.challenges || {};
  $('#challenges').innerHTML = [['identificado', 'Identificado', 'ok'], ['no-identificado', 'No identificado', 'warn'], ['no-concluyente', 'No concluyente', 'tie'], ['registro', 'Registrar un bovino', 'reg']]
    .map(([k, t, c]) => `<li class="${C[k] ? 'got ' + c : ''}" title="${{ identificado: 'Fotografía a un bovino registrado', 'no-identificado': 'Fotografía a un bovino que no esté registrado', 'no-concluyente': 'Pista: hay un animal registrado dos veces; fotografíalo en el brete, donde se tomaron sus referencias', registro: 'Registra un bovino nuevo con sus fotos' }[k]}">${C[k] ? '✓ ' : ''}${t}</li>`).join('');
}
onChange(() => { renderMission(); rerenderRegistry(); });

const mm = { x0: -30, x1: 50, z0: -28, z1: 26 };
function drawMinimap() {
  const c = $('#minimap'), x = c.getContext('2d'), W = c.width, H = c.height;
  const X = v => (v - mm.x0) / (mm.x1 - mm.x0) * W, Z = v => (v - mm.z0) / (mm.z1 - mm.z0) * H;
  x.clearRect(0, 0, W, H); x.fillStyle = '#e6ead9'; x.fillRect(0, 0, W, H);
  const P = LAYOUT.pasture, C = LAYOUT.corral;
  x.fillStyle = '#cfdcb9'; x.fillRect(X(P.x0), Z(P.z0), X(P.x1) - X(P.x0), Z(P.z1) - Z(P.z0));
  x.strokeStyle = '#8a6a4a'; x.lineWidth = 2; x.strokeRect(X(P.x0), Z(P.z0), X(P.x1) - X(P.x0), Z(P.z1) - Z(P.z0)); x.strokeRect(X(C.x0), Z(C.z0), X(C.x1) - X(C.x0), Z(C.z1) - Z(C.z0));
  x.fillStyle = '#e2cfa5'; x.fillRect(X(LAYOUT.chute.x - 1.1), Z(C.z1), X(1.1) - X(-1.1), Z(LAYOUT.capture.z) - Z(C.z1));
  x.strokeStyle = '#c8922e'; x.lineWidth = 3; x.beginPath(); x.arc(X(LAYOUT.capture.x), Z(LAYOUT.capture.z), 7, 0, 7); x.stroke();
  x.fillStyle = '#b9a98a'; x.fillRect(X(LAYOUT.shed.x - 4.5), Z(LAYOUT.shed.z - 3.5), X(4.5) - X(-4.5), Z(3.5) - Z(-3.5));
  for (const cow of G.herd.cows) { x.fillStyle = G.identified.has(cow.k) ? '#4f7a45' : '#6d5a48'; x.beginPath(); x.ellipse(X(cow.position.x), Z(cow.position.z), 6, 6, 0, 0, 7); x.fill(); }
  const p = G.farmer.position, a = G.farmer.root.rotation.y; x.save(); x.translate(X(p.x), Z(p.z)); x.rotate(-a + Math.PI);
  x.fillStyle = '#c8922e'; x.strokeStyle = '#fff'; x.lineWidth = 2; x.beginPath(); x.moveTo(0, -11); x.lineTo(8, 8); x.lineTo(-8, 8); x.closePath(); x.fill(); x.stroke(); x.restore();
}

function openHelp() {
  const d = $('#help');
  d.innerHTML = `<div class="sheet"><div class="spread"><div><div class="eyebrow">Ayuda</div><h2>Cómo se juega</h2></div><button class="btn ghost" data-x>Cerrar <kbd>Esc</kbd></button></div>
    <div class="help-grid">
      <div><h4>Moverte</h4><ul><li><kbd>W A S D</kbd> o flechas para caminar · <kbd>Shift</kbd> para correr.</li><li>Arrastra con el ratón para girar la cámara; rueda para acercar.</li><li>En pantallas táctiles: joystick a la izquierda y arrastre a la derecha.</li><li><kbd>Q</kbd> ir directo al bovino más cercano (o clic en un bovino del mapa).</li><li><kbd>E</kbd> interactuar · <kbd>R</kbd> registro · <kbd>F</kbd> pantalla completa · <kbd>Esc</kbd> menú.</li></ul></div>
      <div><h4>Identificar</h4><ul><li>Acércate a un bovino y elige <b>Fotografiar e identificar</b>.</li><li>Ajusta distancia (~30 cm), ángulo y altura hasta que todo esté en verde y presiona <kbd>Espacio</kbd>.</li><li>Revisa la foto, ajusta el recorte y pulsa <b>ANALIZAR IDENTIDAD</b>.</li></ul></div>
      <div><h4>Qué es real</h4><p>La foto es una captura real de la escena 3D; el recorte, el cambio de tamaño, ResNet50 (pesos de ImageNet, sin entrenamiento), la similitud coseno, el 1-NN y la calibración del umbral se ejecutan de verdad en tu navegador.</p></div>
      <div><h4>Modo práctica</h4><p>Los bovinos y sus hocicos son modelos 3D con patrones generados por computador, no fotos de animales reales. Los resultados sirven para entender el proceso; <b>no son resultados experimentales</b> de la investigación (la investigación los obtendrá con 19 bovinos reales).</p></div>
    </div></div>`;
  show(d); d.querySelector('[data-x]').onclick = () => hide(d); d.onclick = e => { if (e.target === d) hide(d); };
}
function toggleFull() { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.().catch(() => {}); }
function pause() { G.mode = 'menu'; hide('#hud'); $('#btn-play').textContent = 'Continuar'; show('#menu'); menuCamera(); $('#btn-play').focus(); }
function startGame() {
  hide('#menu'); show('#hud'); G.mode = 'explore'; G.rig.clearOverride(); promptKey = '';
  if (!G.started) { G.started = true; G.input.yaw = Math.atan2(LAYOUT.spawn.x - 1, LAYOUT.spawn.z + 2); toast('Bienvenido a la finca. Pulsa Q para ir directo a un bovino.'); }
  canvas.focus();
}
function bindUI() {
  $('#btn-play').onclick = startGame;
  $('#btn-howto').onclick = openHelp;
  $('#btn-help').onclick = openHelp;
  $('#btn-registry').onclick = () => registryOpen() ? closeRegistry() : openRegistry();
  $('#btn-go').onclick = () => goToCow(nextCow());
  $('#minimap').addEventListener('click', e => { // clic en un bovino del mapa: ir hasta él
    const c = $('#minimap'), b = c.getBoundingClientRect(), mx = (e.clientX - b.left) / b.width * c.width, my = (e.clientY - b.top) / b.height * c.height;
    const X = v => (v - mm.x0) / (mm.x1 - mm.x0) * c.width, Z = v => (v - mm.z0) / (mm.z1 - mm.z0) * c.height;
    let best = null, bd = 18; for (const cow of G.herd.cows) { const d = Math.hypot(X(cow.position.x) - mx, Z(cow.position.z) - my); if (d < bd) { bd = d; best = cow; } }
    if (best) goToCow(best);
  });
  $('#btn-full').onclick = toggleFull; $('#btn-pause').onclick = pause;
  $('#btn-mission-toggle').onclick = e => { const m = $('#mission'); m.classList.toggle('collapsed'); e.target.textContent = m.classList.contains('collapsed') ? 'mostrar' : 'ocultar'; };
  $('#btn-reset').onclick = async () => { if (await confirmDialog('Reiniciar datos de práctica', 'Se borrarán registros, fotos e historial de este navegador y se creará otra vez la galería de demostración.', 'Reiniciar', true)) resetPractice(); };
  $('#sel-quality').onchange = e => { localStorage.setItem('nasoid-quality', e.target.value); location.search = ''; };
  $('#btn-touch-act').onclick = () => G.near && G.mode === 'explore' && openInteract(G.near);
  ['#cam-r-dist', '#cam-r-yaw', '#cam-r-pitch', '#cam-r-head'].forEach(s => $(s).addEventListener('input', onCamInput));
  $('#cam-shutter').onclick = shutter; $('#cam-cancel').onclick = () => exitCapture();
  $('#cam-upload input').onchange = e => { const f = e.target.files[0]; e.target.value = ''; if (f) onUpload(f); };
  canvas.addEventListener('wheel', e => { if (G.mode !== 'capture') return; const el = $('#cam-r-dist'); el.value = +el.value + Math.sign(e.deltaY) * 2; onCamInput(); }, { passive: true });
  let drag = null;
  canvas.addEventListener('pointerdown', e => { if (G.mode === 'capture') drag = { x: e.clientX, y: e.clientY }; });
  addEventListener('pointermove', e => { if (!drag || G.mode !== 'capture') return; const y = $('#cam-r-yaw'), p = $('#cam-r-pitch'); y.value = +y.value - (e.clientX - drag.x) * 0.15; p.value = +p.value + (e.clientY - drag.y) * 0.15; drag = { x: e.clientX, y: e.clientY }; onCamInput(); });
  addEventListener('pointerup', () => { drag = null; });
  addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); photoCam.fit(innerWidth, innerHeight); if (G.mode === 'capture') layoutViewfinder(); });
}

Object.assign(G.api, { goToCow, nextCow, inChute, shoot, suggestBox, setPad: v => { CROP_PAD = v; }, openInteract, enterCapture, shutter, startGame, analyze, seedDemo, refresh, STATE, photoCam, toggleChute, resetPractice });
boot().catch(e => { console.error(e); $('#load-text').textContent = 'Error al cargar: ' + e.message; });
