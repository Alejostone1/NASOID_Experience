/* Bloque 4 · Tecnología — cómo funciona, arquitectura y simulador. */
import gsap from 'gsap';
import { TOOLS } from '../../shared/content.js';
import { C, $, $$, ICON } from '../core.js';

const B = 'Tecnología';
const SIM = `${import.meta.env.BASE_URL}experience/`;

export const TECNOLOGIA = [
  {
    id: 'funciona', block: B, title: '¿Cómo funciona?', spk: 'J', shot: { rel: [3.2, 0.9, 5.2], look: 'body', lookOff: [0, -0.55, 0], shift: 0 }, wide: true,
    html: () => `<div class="col center">
      <div class="eyebrow" data-a>08 · ¿Cómo funciona?</div>
      <h2 data-a>De una foto a una identidad, en cinco pasos.</h2>
      <div class="flow" data-a>${[['reg', 'Registro', 'Registramos cada bovino con cinco fotos de su hocico.'], ['cam', 'Fotografía', 'Con el celular, de frente y a unos 30 cm.'], ['ai', 'Análisis', 'ResNet50 resume el hocico en 2048 números.'], ['cmp', 'Comparación', 'Similitud coseno con todos los registrados.'], ['ok', 'Decisión', 'Si la semejanza alcanza el umbral θ, se asigna la identidad.']]
        .map(([ic, t, d], i) => `<div class="fnode"><div class="fi">${ICON[ic]}</div><b>${t}</b><span>${d}</span></div>${i < 4 ? '<div class="farrow"></div>' : ''}`).join('')}</div>
      <div class="decide" data-a><span class="s ok">s ≥ θ · identificado</span><span class="s warn">s &lt; θ · no concluyente (no registrado)</span><span class="s tie">empate · no concluyente</span></div></div>`,
    enter(root) { gsap.fromTo($$('.fnode', root), { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.18, duration: 0.5 }); gsap.fromTo($$('.farrow', root), { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', stagger: 0.18, duration: 0.4, delay: 0.3 }); },
    notes: { idea: 'Registro, foto, análisis, comparación y decisión con umbral.', guion: ['Cada animal se registra con cinco fotos. Para identificarlo se toma una foto nueva, ResNet50 la convierte en 2048 números, se compara con todos los registrados y, si la semejanza alcanza el umbral, se asigna la identidad.'] },
  },
  {
    id: 'arquitectura', block: B, title: 'Arquitectura y herramientas', spk: 'J', wide: true, hide3d: true,
    html: () => `<div class="col wide">
      <div class="eyebrow" data-a>6.2.7 y 6.2.8 · La arquitectura que diseñamos · clic en cada herramienta</div>
      <h2 data-a>El celular solo necesita un <em>navegador</em> y la cámara.</h2>
      <div class="arch interactive" data-a>
        <div class="lane"><small>Cliente · celular</small>${TOOLS.filter(t => t.layer === 'cliente').map(t => `<button class="tool" data-t="${t.t}">${t.t}</button>`).join('')}</div>
        <div class="pipe"><span class="pkt"></span></div>
        <div class="lane"><small>Servidor · sin GPU</small>${TOOLS.filter(t => t.layer === 'servidor').map(t => `<button class="tool" data-t="${t.t}">${t.t}</button>`).join('')}</div>
        <div class="pipe"><span class="pkt"></span></div>
        <div class="lane"><small>Datos</small>${TOOLS.filter(t => t.layer === 'datos').map(t => `<button class="tool" data-t="${t.t}">${t.t}</button>`).join('')}</div>
      </div>
      <div class="tool-out panel" id="tool-out" data-a></div>
      <p class="sub" data-a>Recorrido: foto y recorte en el navegador → FastAPI → OpenCV prepara la imagen → Keras con JAX obtiene el vector con ResNet50 → NumPy lo compara con los vectores de PostgreSQL → la respuesta vuelve al celular y queda en la ficha. Comunicación REST. ${C('r14', 'r65')}</p></div>`,
    mount(root) { const show = name => { const t = TOOLS.find(x => x.t === name); $('#tool-out').innerHTML = `<div class="to"><div><div class="eyebrow">${t.o}</div><h3>${t.t}</h3><p>${t.f}</p></div><div><small>Alternativa descartada</small><b>${t.alt}</b>${C(t.ref)}</div></div>`; $$('.tool', root).forEach(b => b.classList.toggle('on', b.dataset.t === name)); }; $$('.tool', root).forEach(b => b.onclick = () => show(b.dataset.t)); show('FastAPI'); },
    enter(root) { $$('.pkt', root).forEach((p, i) => gsap.fromTo(p, { left: '0%' }, { left: '100%', duration: 1.1, repeat: -1, ease: 'power1.inOut', delay: i * 0.55 })); },
    leave(root) { gsap.killTweensOf($$('.pkt', root)); },
    notes: { idea: 'Cliente liviano, procesamiento en el servidor, todo con herramientas gratuitas.', guion: ['Next.js en el celular; FastAPI, OpenCV, Keras con JAX y NumPy en el servidor; PostgreSQL para los datos.', 'No se necesita tarjeta gráfica. Cada herramienta tiene una alternativa descartada, documentada en la Tabla 12.'] },
  },
  {
    id: 'experiencia', block: B, title: 'La experiencia NASOID', spk: 'J', shot: { rel: [1.1, 0.15, 1.5], look: 'muzzle', lookOff: [0, -0.05, -0.5], shift: 0.24, headUp: true },
    html: () => `<div class="col">
      <div class="eyebrow" data-a>09 · Demostración</div>
      <h2 data-a>Ahora, <em>pruébalo</em> tú.</h2>
      <p class="lead" data-a>Construimos una finca 3D para mostrarlo: acércate a un bovino, fotografía su hocico y observa cómo NASOID lo compara con los animales registrados.</p>
      <div class="decide" data-a><span class="s ok">Identificado</span><span class="s warn">No identificado</span><span class="s tie">No concluyente</span></div>
      <p class="sub" data-a>El simulador ejecuta de verdad el recorte, ResNet50 (pesos de ImageNet, sin entrenamiento), la similitud coseno, el vecino más próximo y el umbral calibrado con la regla del V27. Los animales son modelos 3D: es un <b>modo práctica</b>, no un resultado de la investigación.</p>
      <div class="row" data-a><a class="btn amber big" href="${SIM}">EXPLORAR SIMULADOR NASOID</a></div></div>`,
    enter(root) { gsap.fromTo($$('.decide .s', root), { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, stagger: 0.25, duration: 0.5, delay: 0.6, ease: 'back.out(2.2)' }); gsap.fromTo($('.btn.amber', root), { boxShadow: '0 0 0 0 rgba(200,146,46,.6)' }, { boxShadow: '0 0 0 18px rgba(200,146,46,0)', duration: 1.4, repeat: 2, delay: 1.4 }); },
    notes: { idea: 'Pasar a la demostración en vivo.', guion: ['En el simulador se camina por una finca, se fotografía el hocico de un bovino y se ve cómo el sistema lo analiza y decide.'] },
  },
];
