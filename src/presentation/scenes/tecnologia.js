/* Bloque 4 · Tecnología y decisiones (John) — cómo funciona, por qué se eligió cada cosa, arquitectura y simulador. */
import gsap from 'gsap';
import { TOOLS } from '../../shared/content.js';
import { C, $, $$, ICON } from '../core.js';

const B = 'Tecnología';
const SIM = `${import.meta.env.BASE_URL}experience/`;
/** Decisiones técnicas con su alternativa descartada y la razón (secciones 5.7, 5.10 y 6.2.3 a 6.2.8 del V27). */
const DECISIONS = [
  { t: 'Usar una red preentrenada sin entrenarla', alt: 'Entrenar una red desde cero o ajustarla (fine-tuning)', why: 'Entrenar desde cero exige miles de imágenes etiquetadas; con 19 animales no es posible. El vector de una red entrenada con ImageNet sirve para describir imágenes de otras tareas. El ajuste fino queda como trabajo futuro.', refs: ['r55', 'r45'] },
  { t: 'ResNet50 como extractor (2048 números)', alt: 'Otras redes como primera opción', why: 'Sus conexiones de atajo permiten redes profundas y es el referente directo de Shojaeipour et al. con cinco imágenes por animal. Se conserva si acierta al menos el 90 % de S1; si no, se prueban EfficientNetV2B0 y ConvNeXtTiny, también sin entrenar.', refs: ['r19', 'r64', 'r30'] },
  { t: 'Similitud coseno y vecino más próximo (1-NN)', alt: 'Un clasificador que haya que entrenar', why: '1-NN no necesita entrenamiento: basta con guardar las fotos de referencia. El coseno mide la semejanza por el ángulo entre vectores. Oliveira et al. lograron 92,7 % con este esquema en 30 vacas.', refs: ['r08', 'r60', 'r41'] },
  { t: 'Umbral θ calibrado con S1 (FMR = 0)', alt: 'Fijar el umbral «a ojo»', why: 'La escala de la similitud cambia según la red y el preprocesamiento. Se elige el menor θ que no acepta ningún par de bovinos distintos de S1; si rechaza más del 10 % de pares del mismo bovino, se usa el umbral de error igual (EER). No se cambia con S2 y S3.', refs: ['r22', 'r27'] },
  { t: 'Recorte del hocico hecho por el usuario', alt: 'Detector automático YOLO', why: 'YOLO no reconoce el hocico bovino de fábrica: quienes lo lograron tuvieron que anotar y entrenar su propio modelo (Lee et al., con 150 imágenes marcadas a mano). Entrenar está fuera del alcance; el usuario ajusta un recuadro y se anota si lo movió.', refs: ['r56', 'r36'] },
  { t: 'Celular a 30 cm, de frente y sin flash', alt: 'Cámaras fijas, drones o fotos sin protocolo', why: 'Lee et al. fotografiaron hocicos con celular a 30 cm. Un protocolo fijo reduce la variación entre tomas; los drones no capturan la dermis naso-labial.', refs: ['r36'] },
  { t: 'Aplicación web adaptable al celular', alt: 'Aplicación móvil nativa', why: 'Funciona en cualquier celular sin instalar nada. HTML Media Capture abre la cámara trasera desde un botón y necesita mucho menos código que controlar la cámara en vivo.', refs: ['r39', 'r71', 'r40'] },
  { t: 'Cinco fotos de referencia por animal', alt: 'Una sola foto o decenas por animal', why: 'Barry et al. observaron que más referencias mejoran el reconocimiento; Shojaeipour et al. y Oliveira et al. trabajaron con cinco, y estudios recientes muestran que pocas fotos por animal pueden bastar.', refs: ['r02', 'r64', 'r41', 'r62'] },
  { t: 'Herramientas gratuitas y servidor sin GPU', alt: 'Servicios de pago o servidor con tarjeta gráfica', why: 'Fáciles de aprender, bien documentadas, compatibles y económicas para fincas pequeñas. Keras con JAX corre en CPU; comparar una foto con 95 vectores es una operación de milisegundos.', refs: ['r05', 'r15', 'r18'] },
];

export const TECNOLOGIA = [
  {
    id: 'funciona', block: B, title: '¿Cómo funciona?', spk: 'J', shot: { rel: [3.2, 0.9, 5.2], look: 'body', lookOff: [0, -0.55, 0], shift: 0 }, wide: true,
    html: () => `<div class="col center">
      <div class="eyebrow" data-a>09 · ¿Cómo funciona?</div>
      <h2 data-a>De una foto a una identidad, en cinco pasos.</h2>
      <div class="flow" data-a>${[['reg', 'Registro', 'Cada bovino se registra con cinco fotos de su hocico.'], ['cam', 'Fotografía', 'Con el celular, de frente y a unos 30 cm.'], ['ai', 'Análisis', 'ResNet50 resume el hocico en 2048 números.'], ['cmp', 'Comparación', 'Similitud coseno con todos los registrados.'], ['ok', 'Decisión', 'Si la semejanza alcanza el umbral θ, se asigna la identidad.']]
        .map(([ic, t, d], i) => `<div class="fnode"><div class="fi">${ICON[ic]}</div><b>${t}</b><span>${d}</span></div>${i < 4 ? '<div class="farrow"></div>' : ''}`).join('')}</div>
      <div class="decide" data-a><span class="s ok">s ≥ θ · identificado</span><span class="s warn">s &lt; θ · no concluyente (no registrado)</span><span class="s tie">empate · no concluyente</span></div></div>`,
    enter(root) { gsap.fromTo($$('.fnode', root), { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.18, duration: 0.5 }); gsap.fromTo($$('.farrow', root), { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', stagger: 0.18, duration: 0.4, delay: 0.3 }); },
    notes: { idea: 'Registro, foto, análisis, comparación y decisión con umbral.', guion: ['Cada animal se registra con cinco fotos. Para identificarlo se toma una foto nueva, ResNet50 la convierte en 2048 números, se compara con todos los registrados y, si la semejanza alcanza el umbral, se asigna la identidad.'] },
  },
  {
    id: 'decisiones', block: B, title: '¿Por qué elegimos…?', spk: 'J', wide: true, hide3d: true,
    html: () => `<div class="col wide">
      <div class="eyebrow" data-a>10 · Decisiones técnicas · clic en cada tarjeta para ver la alternativa descartada</div>
      <h2 data-a>Cada elección tiene una <em>razón</em> y una alternativa descartada.</h2>
      <div class="dec interactive" data-a>${DECISIONS.map((d, i) => `<button class="dc" data-i="${i}"><div class="dc-in"><div class="dc-f"><small>Decisión ${i + 1}</small><b>${d.t}</b><span class="flip-hint">ver por qué ↻</span></div><div class="dc-b"><small>Se descartó</small><b>${d.alt}</b><p>${d.why}</p></div></div></button>`).join('')}</div>
      <div class="dec-refs" id="dec-refs" data-a><span class="sub">Fuentes de la decisión seleccionada aparecerán aquí.</span></div></div>`,
    mount(root) { $$('.dc', root).forEach(b => b.onclick = () => { b.classList.toggle('flip'); $('#dec-refs').innerHTML = `<span class="sub">Fuentes · ${DECISIONS[+b.dataset.i].t}:</span> ${C(...DECISIONS[+b.dataset.i].refs)}`; }); },
    enter(root) { gsap.fromTo($$('.dc', root), { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, stagger: 0.06, duration: 0.4 }); },
    notes: { idea: 'Ninguna decisión es arbitraria: cada una tiene su alternativa y su fuente.', guion: ['No entrenamos redes porque con 19 animales no es posible; usamos ResNet50 preentrenada, que tiene respaldo en Shojaeipour.', 'Coseno y vecino más próximo porque no requieren entrenamiento. El umbral se calibra con S1 y no se toca después.', 'El recorte lo hace el usuario porque un detector automático exigiría anotar y entrenar. Web y no app nativa para que funcione en cualquier celular.'] },
  },
  {
    id: 'arquitectura', block: B, title: 'Arquitectura y herramientas', spk: 'J', wide: true, hide3d: true,
    html: () => `<div class="col wide">
      <div class="eyebrow" data-a>6.2.7 y 6.2.8 · Arquitectura cliente-servidor · clic en cada herramienta</div>
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
      <div class="eyebrow" data-a>11 · Demostración</div>
      <h2 data-a>Ahora, <em>pruébalo</em> tú.</h2>
      <p class="lead" data-a>Entra a una finca 3D, acércate a un bovino, fotografía su hocico y observa cómo NASOID lo compara con los animales registrados.</p>
      <div class="decide" data-a><span class="s ok">Identificado</span><span class="s warn">No identificado</span><span class="s tie">No concluyente</span></div>
      <p class="sub" data-a>El simulador ejecuta de verdad el recorte, ResNet50 (pesos de ImageNet, sin entrenamiento), la similitud coseno, el vecino más próximo y el umbral calibrado con la regla del V27. Los animales son modelos 3D: es un <b>modo práctica</b>, no un resultado de la investigación.</p>
      <div class="row" data-a><a class="btn amber big" href="${SIM}">EXPLORAR SIMULADOR NASOID</a></div></div>`,
    notes: { idea: 'Pasar a la demostración en vivo.', guion: ['En el simulador se camina por una finca, se fotografía el hocico de un bovino y se ve cómo el sistema lo analiza y decide.'] },
  },
];
