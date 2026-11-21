/* Tipografías locales (sin depender de servicios externos) */
import fr400 from '@fontsource/fraunces/files/fraunces-latin-400-normal.woff2?url';
import fr600 from '@fontsource/fraunces/files/fraunces-latin-600-normal.woff2?url';
import ps400 from '@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-400-normal.woff2?url';
import ps500 from '@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-500-normal.woff2?url';
import ps600 from '@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-600-normal.woff2?url';
import psx400 from '@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-ext-400-normal.woff2?url';
import pm400 from '@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-400-normal.woff2?url';
import pm500 from '@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2?url';
import pmx400 from '@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-ext-400-normal.woff2?url';

const faces = [
  ['Fraunces', fr400, 400], ['Fraunces', fr600, 600],
  ['IBM Plex Sans', ps400, 400], ['IBM Plex Sans', ps500, 500], ['IBM Plex Sans', ps600, 600], ['IBM Plex Sans', psx400, 400, 'U+0100-024F, U+1E00-1EFF'],
  ['IBM Plex Mono', pm400, 400], ['IBM Plex Mono', pm500, 500], ['IBM Plex Mono', pmx400, 400, 'U+0100-024F, U+1E00-1EFF'],
];
for (const [family, url, weight, range] of faces) {
  try { const f = new FontFace(family, `url(${url}) format('woff2')`, { weight: String(weight), style: 'normal', display: 'swap', ...(range ? { unicodeRange: range } : {}) }); f.load().then(ff => document.fonts.add(ff)).catch(() => {}); } catch { /* sin FontFace */ }
}
export function loadFonts() { return Promise.race([document.fonts?.ready, new Promise(r => setTimeout(r, 1500))]); }
