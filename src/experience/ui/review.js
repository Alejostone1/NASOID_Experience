/* =============================================================================
   REVISIÓN DE LA FOTO — Aceptar · Repetir · Recortar (recuadro interactivo).
   El recuadro inicial se calcula proyectando la región naso-labial del modelo 3D
   sobre la foto (o se centra si la foto fue subida). El usuario puede moverlo y
   cambiar su tamaño; el recorte de 224 × 224 se actualiza en vivo.
   ============================================================================= */
import { $, h, esc, show, hide, fmt } from './dom.js';
import { prepare, clampBox } from '../biometric/preprocess.js';

export function openReview({ photo, box, purpose = 'identify', subtitle = '' }) {
  return new Promise(resolve => {
    const root = $('#review'); const suggested = { ...box }; let cur = { ...box }, editing = false, step = 1;
    const W = photo.width, H = photo.height;
    const done = v => { hide(root); root.innerHTML = ''; removeEventListener('keydown', onKey, true); resolve(v); };
    const onKey = e => { if (e.key === 'Escape') { e.stopPropagation(); done({ action: 'cancel' }); } };
    addEventListener('keydown', onKey, true);

    function render() {
      const goLabel = purpose === 'identify' ? 'ANALIZAR IDENTIDAD' : 'GUARDAR REFERENCIA';
      root.innerHTML = `<div class="sheet">
        <div class="spread"><div><div class="eyebrow">${step === 1 ? 'Paso 4 · Revisión' : 'Paso 5 · Enviar'}</div><h2>${step === 1 ? 'Revisa la fotografía' : purpose === 'identify' ? 'Lista para identificar' : 'Lista para guardar'}</h2>${subtitle ? `<div class="small">${esc(subtitle)}</div>` : ''}</div>
          <button class="btn ghost" data-x>Cerrar <kbd>Esc</kbd></button></div>
        <div class="review-grid">
          <div class="photo-stage" id="rv-stage"><canvas class="photo" id="rv-photo"></canvas>
            <div class="crop-box" id="rv-box"><span class="lbl">región naso-labial</span>${editing ? '<span class="h" id="rv-h"></span>' : ''}</div></div>
          <div class="side-card">
            <div class="mini-title">Recorte que se enviará (224 × 224)</div>
            <canvas id="rv-crop" width="224" height="224"></canvas>
            <div id="rv-q"></div>
            ${step === 1 ? (editing
              ? `<p class="note">Arrastra el recuadro para moverlo y el círculo de la esquina para cambiar su tamaño. Debe incluir las dos fosas nasales y el labio superior.</p>
                 <div class="row"><button class="btn" data-reset>Recorte sugerido</button><button class="btn primary" data-editdone>Listo</button></div>`
              : `<div class="row"><button class="btn" data-retake>Repetir</button><button class="btn" data-edit>Recortar</button><button class="btn primary" data-accept>Aceptar</button></div>`)
            : `<button class="btn amber big" data-go style="justify-content:center">${goLabel}</button>
               <div class="row"><button class="link" data-back>Cambiar recorte</button><button class="link" data-retake>Repetir la foto</button></div>`}
          </div>
        </div></div>`;
      show(root);
      const cv = $('#rv-photo', root); cv.width = W; cv.height = H; cv.getContext('2d').drawImage(photo, 0, 0);
      layout(); preview();
      root.querySelector('[data-x]').onclick = () => done({ action: 'cancel' });
      root.querySelector('[data-retake]')?.addEventListener('click', () => done({ action: 'retake' }));
      root.querySelector('[data-edit]')?.addEventListener('click', () => { editing = true; render(); });
      root.querySelector('[data-editdone]')?.addEventListener('click', () => { editing = false; render(); });
      root.querySelector('[data-reset]')?.addEventListener('click', () => { cur = { ...suggested }; layout(); preview(); });
      root.querySelector('[data-accept]')?.addEventListener('click', () => { step = 2; render(); });
      root.querySelector('[data-back]')?.addEventListener('click', () => { step = 1; editing = true; render(); });
      root.querySelector('[data-go]')?.addEventListener('click', () => done({ action: 'accept', box: cur, pre: prepare(photo, cur), edited: Math.abs(cur.x - suggested.x) + Math.abs(cur.s - suggested.s) > 2 }));
      if (editing) bindDrag();
      (root.querySelector('[data-go]') || root.querySelector('[data-accept]') || root.querySelector('[data-editdone]'))?.focus();
    }
    function scale() { return $('#rv-photo', root).getBoundingClientRect().width / W; }
    function layout() { const k = scale(), b = $('#rv-box', root); Object.assign(b.style, { left: cur.x * k + 'px', top: cur.y * k + 'px', width: cur.s * k + 'px', height: cur.s * k + 'px' }); }
    function preview() {
      const p = prepare(photo, cur); $('#rv-crop', root).getContext('2d').drawImage(p.input, 0, 0);
      const q = p.quality;
      $('#rv-q', root).innerHTML = `<div class="qrow"><span>Nitidez</span><b class="${q.sharpOk ? 'ok' : 'no'}">${q.sharpOk ? 'nítida' : 'borrosa'} · ${fmt(q.sharpness, 0)}</b></div>
        <div class="qrow"><span>Luz</span><b class="${q.lightOk ? 'ok' : 'no'}">${q.lightOk ? 'adecuada' : q.brightness < 45 ? 'oscura' : 'sobreexpuesta'}</b></div>
        <div class="qrow"><span>Recorte</span><b>${Math.round(cur.s)} px → 224 px</b></div>`;
    }
    function bindDrag() {
      const b = $('#rv-box', root), hd = $('#rv-h', root); let mode = null, sx = 0, sy = 0, start = null;
      const down = (e, m) => { e.preventDefault(); e.stopPropagation(); mode = m; sx = e.clientX; sy = e.clientY; start = { ...cur }; b.setPointerCapture(e.pointerId); };
      b.addEventListener('pointerdown', e => down(e, e.target === hd ? 'size' : 'move'));
      b.addEventListener('pointermove', e => {
        if (!mode) return; const k = scale(), dx = (e.clientX - sx) / k, dy = (e.clientY - sy) / k;
        cur = mode === 'move' ? clampBox({ x: start.x + dx, y: start.y + dy, s: start.s }, W, H) : clampBox({ x: start.x, y: start.y, s: start.s + Math.max(dx, dy) }, W, H);
        layout(); preview();
      });
      b.addEventListener('pointerup', () => { mode = null; });
    }
    addEventListener('resize', () => root.innerHTML && layout(), { once: true });
    render();
  });
}
