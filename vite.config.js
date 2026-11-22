import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import fs from 'node:fs';

/** En el computador sirve los PDF de la carpeta de referencias (no se publican en la web).
 *  Busca ../ReferenciasV21, ../../ReferenciasV21 o ../Referencias (carpeta junto al proyecto). */
function localReferences() {
  const dir = ['../ReferenciasV21', '../../ReferenciasV21', '../Referencias'].map(p => resolve(import.meta.dirname, p)).find(p => fs.existsSync(p));
  const mw = (req, res, next) => {
    if (!dir) return next();
    const file = resolve(dir, decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, ''));
    if (!file.startsWith(dir) || !fs.existsSync(file)) return next();
    res.setHeader('Content-Type', 'application/pdf'); fs.createReadStream(file).pipe(res);
  };
  return { name: 'local-references', configureServer(s) { s.middlewares.use('/ReferenciasV21', mw); }, configurePreviewServer(s) { s.middlewares.use('/ReferenciasV21', mw); } };
}

export default defineConfig({
  base: '/',
  plugins: [localReferences()],
  build: {
    target: 'es2020', chunkSizeWarningLimit: 3000,
    rollupOptions: { input: { main: resolve(import.meta.dirname, 'index.html'), experience: resolve(import.meta.dirname, 'experience/index.html') } },
  },
  server: { port: 5174 },
});
