/* =============================================================================
   EXTRACCIÓN DE CARACTERÍSTICAS (X₄ de V27) — ResNet50 REAL en el navegador.
   · Arquitectura Keras ResNet50, include_top=False, pooling='avg' (23 587 712
     parámetros), pesos de ImageNet, SIN entrenamiento ni ajuste.
   · Origen de los pesos: paquete npm «idai-shapes-ceramics_resnet50» (ISC),
     convertido a entrada 224 × 224 × 3 y a float16 (tools/quantize_resnet.py).
   · Entrada: preprocess_input de Keras (RGB→BGR y resta de la media de ImageNet).
   · Salida: vector de 2048 valores, normalizado (‖v‖ = 1).
   Además devuelve dos mapas de activación reales (capas conv2 y conv4) que la
   interfaz usa para mostrar «qué está mirando» la red.
   ============================================================================= */
let tf = null, model = null, loading = null;
export const MODEL_INFO = { name: 'ResNet50 (ImageNet, sin entrenamiento)', dims: 2048, input: 224, backend: '', loadMs: 0, bytes: 0 };

export function isReady() { return !!model; }

export function loadModel(onProgress = () => {}) {
  if (loading) return loading;
  loading = (async () => {
    const t0 = performance.now();
    tf = await import('@tensorflow/tfjs');
    let ok = false;
    try { ok = await tf.setBackend('webgl'); } catch { ok = false; }
    if (!ok) {
      try {
        const wasm = await import('@tensorflow/tfjs-backend-wasm');
        const simd = (await import('@tensorflow/tfjs-backend-wasm/dist/tfjs-backend-wasm-simd.wasm?url')).default;
        const plain = (await import('@tensorflow/tfjs-backend-wasm/dist/tfjs-backend-wasm.wasm?url')).default;
        const thr = (await import('@tensorflow/tfjs-backend-wasm/dist/tfjs-backend-wasm-threaded-simd.wasm?url')).default;
        wasm.setWasmPaths({ 'tfjs-backend-wasm.wasm': plain, 'tfjs-backend-wasm-simd.wasm': simd, 'tfjs-backend-wasm-threaded-simd.wasm': thr });
        ok = await tf.setBackend('wasm');
      } catch { ok = false; }
    }
    if (!ok) await tf.setBackend('cpu');
    await tf.ready(); MODEL_INFO.backend = tf.getBackend();
    const url = `${import.meta.env.BASE_URL}models/resnet50/model.json`;
    const base = await tf.loadLayersModel(url, { onProgress: f => onProgress(f) });
    // salidas: dos mapas intermedios (para visualizar) + el vector final (avg_pool)
    model = tf.model({ inputs: base.inputs, outputs: [base.getLayer('conv2_block3_out').output, base.getLayer('conv4_block6_out').output, base.outputs[0]] });
    tf.tidy(() => { model.predict(tf.zeros([1, 224, 224, 3])); }); // calentamiento (compila los sombreadores)
    MODEL_INFO.loadMs = performance.now() - t0;
    return MODEL_INFO;
  })();
  return loading;
}

/**
 * @param {HTMLCanvasElement} c224 recorte de 224 × 224 (RGB)
 * @returns vector normalizado, norma original, mapas de activación y tiempos
 */
export async function embed(c224) {
  if (!model) await loadModel();
  const t0 = performance.now();
  const [a, b, v] = tf.tidy(() => {
    const x = tf.browser.fromPixels(c224).toFloat();
    const bgr = x.reverse(-1).sub(tf.tensor1d([103.939, 116.779, 123.68])); // preprocess_input (modo «caffe»)
    const [m2, m4, out] = model.predict(bgr.expandDims(0));
    return [m2.mean(-1).squeeze(), m4.mean(-1).squeeze(), out.squeeze()];
  });
  const [early, deep, raw] = await Promise.all([a.data(), b.data(), v.data()]);
  a.dispose(); b.dispose(); v.dispose();
  const ms = performance.now() - t0;
  let n = 0; for (let i = 0; i < raw.length; i++) n += raw[i] * raw[i]; n = Math.sqrt(n) || 1;
  const vector = new Float32Array(raw.length); for (let i = 0; i < raw.length; i++) vector[i] = raw[i] / n;
  return { vector, norm: n, ms, maps: { early: { data: early, size: 56 }, deep: { data: deep, size: 14 } }, backend: MODEL_INFO.backend };
}
