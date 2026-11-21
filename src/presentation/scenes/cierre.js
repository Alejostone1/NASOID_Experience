/* Bloque 5 · Cierre — alcance y limitaciones, cronograma, cierre y referencias. */
import gsap from 'gsap';
import { SCOPE, LIMITATIONS, GANTT, PROJECT, QUESTION } from '../../shared/content.js';
import { $, $$, REFS } from '../core.js';
import { openBiblio } from '../biblio.js';

const B = 'Cierre';
const SIM = `${import.meta.env.BASE_URL}experience/`;
const MONTHS = 8;

export const CIERRE = [
  {
    id: 'alcance', block: B, title: 'Alcance y limitaciones', spk: 'D', wide: true, hide3d: true,
    html: () => `<div class="col wide">
      <div class="eyebrow" data-a>4.3 · Alcance · y limitaciones declaradas en el V27</div>
      <h2 data-a>Lo que hará, lo que <em>no</em> pretende y sus límites.</h2>
      <div class="scope" data-a>
        <div><h4>El prototipo podrá</h4><ul>${SCOPE.modules.map(m => `<li><b>${m.t}.</b> ${m.d}</li>`).join('')}</ul></div>
        <div><h4>No pretende</h4><ul>${SCOPE.out.map(o => `<li>${o}</li>`).join('')}</ul></div>
      </div>
      <div class="eyebrow" data-a>Limitaciones · clic para leer</div>
      <div class="lims interactive" data-a>${LIMITATIONS.map(l => `<button class="lim"><b>${l.t}</b><span>${l.d}</span><small>sección ${l.sec}</small></button>`).join('')}</div></div>`,
    mount(root) { $$('.lim', root).forEach(b => b.onclick = () => b.classList.toggle('open')); },
    enter(root) { gsap.fromTo($$('.lim', root), { opacity: 0, y: 12 }, { opacity: 1, y: 0, stagger: 0.04, duration: 0.35 }); },
    notes: { idea: 'Ser honestos con los límites fortalece la propuesta.', guion: ['El prototipo registra entre 10 y 20 animales, identifica con una foto del celular, guarda la trazabilidad básica y muestra estadísticas.', 'No reconoce muchos animales a la vez, no se integra con SINIGAN y no entrena redes.', 'Entre las limitaciones: muestra pequeña, ImageNet no contiene hocicos y la puntuación no es una probabilidad.'] },
  },
  {
    id: 'cronograma', block: B, title: 'Cronograma', spk: 'D', wide: true, hide3d: true,
    html: () => `<div class="col wide">
      <div class="eyebrow" data-a>7.3 · Cronograma · Tabla 14 · ocho meses por quincenas</div>
      <h2 data-a>Ocho meses, de la idea al <em>informe final</em>.</h2>
      <div class="gantt" data-a>
        <div class="g-head"><span></span>${Array.from({ length: MONTHS }, (_, m) => `<span>Mes ${m + 1}</span>`).join('')}</div>
        ${GANTT.map(g => `<div class="g-row"><span class="g-t">${g.t}</span><div class="g-track">${Array.from({ length: MONTHS * 2 }, (_, q) => `<i class="${g.q.includes(q) ? 'on' : ''}"></i>`).join('')}</div></div>`).join('')}
      </div>
      <p class="sub" data-a>Las sesiones de captura (S1, S2 y S3) se hacen dentro del objetivo 4, en dos semanas por finca. Entre un objetivo y el siguiente hay un pequeño traslape: la revisión al cierre de cada fase.</p></div>`,
    enter(root) { gsap.fromTo($$('.g-track i.on', root), { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', stagger: 0.04, duration: 0.25, ease: 'power2.out' }); },
    notes: { idea: 'Plan de ocho meses en cascada con traslapes de revisión.', guion: ['Aprobación de la idea, requerimientos, diseño, codificación —la fase más larga—, pruebas con las tres sesiones y documentación.'] },
  },
  {
    id: 'cierre', block: B, title: 'Cierre', spk: 'DJ', shot: { rel: [2.6, 0.2, 4.4], look: 'body', lookOff: [0, -0.35, 0], shift: 0, headUp: true }, wide: true,
    html: () => `<div class="col center">
      <div class="eyebrow" data-a>NASOID · ${PROJECT.university}</div>
      <h2 class="big" data-a>Identificar sin marcar.</h2>
      <p class="lead" data-a>Una foto del hocico, una red preentrenada y un registro digital confiable para saber quién es cada animal.</p>
      <div class="question" data-a><span>La investigación responderá</span>${QUESTION}</div>
      <div class="thanks" data-a><b>Gracias</b><span>Daniel Felipe Colorado Amaya · John Alejandro Piedrahita Muñoz</span><span>Al profesor <b>Alexander Quintero</b>, por su asesoría en Fundamentos de Investigación durante la elaboración del documento.</span></div>
      <div class="row center" data-a><a class="btn amber big" href="${SIM}">EXPLORAR SIMULADOR NASOID</a><button class="btn" onclick="NASOID_P.go(NASOID_P.count-1)">Referencias</button></div></div>`,
    notes: { idea: 'Cerrar con la idea central y agradecer.', guion: ['NASOID propone identificar sin marcar: una foto del hocico, inteligencia artificial y un registro confiable.', 'Agradecemos al profesor Alexander Quintero por su acompañamiento. Quedamos atentos a sus preguntas.'] },
  },
  {
    id: 'referencias', block: B, title: 'Referencias', spk: 'DJ', wide: true, hide3d: true,
    html: () => {
      const kinds = { doi: 0, arxiv: 0, url: 0, 'pdf-web': 0 }; REFS.forEach(r => { kinds[r.kind] = (kinds[r.kind] || 0) + 1; });
      return `<div class="col wide">
      <div class="eyebrow" data-a>Capítulo 8 · Referencias bibliográficas · APA 7</div>
      <h2 data-a><em>${REFS.length}</em> fuentes, todas con su enlace real.</h2>
      <div class="refstats" data-a><div><b>${kinds.doi}</b><span>con DOI</span></div><div><b>${(kinds.url || 0) + (kinds['pdf-web'] || 0)}</b><span>páginas y documentos oficiales</span></div><div><b>${kinds.arxiv || 0}</b><span>preprints (arXiv)</span></div></div>
      <div class="refcloud interactive" data-a>${REFS.map(r => `<button class="cite big" data-ref="${r.id}">${r.cite}</button>`).join('')}</div>
      <div class="row" data-a><button class="btn primary big" id="open-bib">Abrir la biblioteca completa <kbd>R</kbd></button></div></div>`;
    },
    mount(root) { $('#open-bib', root).onclick = () => openBiblio(); },
    enter(root) { gsap.fromTo($$('.refcloud .cite', root), { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, stagger: 0.012, duration: 0.3 }); },
    notes: { idea: 'Todas las fuentes son consultables desde aquí.', guion: ['Cada referencia abre su ficha con el enlace real (DOI o página oficial) y las secciones del documento donde se cita.'] },
  },
];
