/* Bloque 5 · Cierre — cierre y referencias. */
import gsap from 'gsap';
import { PROJECT, QUESTION } from '../../shared/content.js';
import { $, $$, REFS } from '../core.js';
import { openBiblio } from '../biblio.js';

const B = 'Cierre';
const SIM = `${import.meta.env.BASE_URL}experience/`;

export const CIERRE = [
  {
    id: 'cierre', block: B, title: 'Cierre', spk: 'DJ', shot: { rel: [2.6, 0.2, 4.4], look: 'body', lookOff: [0, -0.35, 0], shift: 0, headUp: true }, wide: true,
    html: () => `<div class="col center">
      <div class="eyebrow" data-a>${PROJECT.university}</div>
      <h2 class="big" data-a>Identificar sin marcar.</h2>
      <p class="lead" data-a>Una foto del hocico, una red preentrenada y un registro digital confiable para saber quién es cada animal.</p>
      <div class="question" data-a><span>Nuestra investigación responderá</span>${QUESTION}</div>
      <div class="thanks" data-a><b>Gracias</b><span>Al profesor <b>Alexander Quintero</b>, por su asesoría en Fundamentos de Investigación durante la elaboración del documento.</span></div>
      <div class="row center" data-a><a class="btn amber big" href="${SIM}">EXPLORAR EL SIMULADOR</a><button class="btn" onclick="NASOID_P.go(NASOID_P.count-1)">Referencias</button></div></div>`,
    enter(root) { gsap.fromTo($('.question', root), { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.6, delay: 0.8, ease: 'power2.inOut' }); gsap.fromTo($('.thanks b', root), { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, delay: 1.8, ease: 'back.out(1.6)' }); },
    notes: { idea: 'Cerrar con la idea central y agradecer.', guion: ['Proponemos identificar sin marcar: una foto del hocico, inteligencia artificial y un registro confiable.', 'Agradecemos al profesor Alexander Quintero por su acompañamiento. Quedamos atentos a sus preguntas.'] },
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
