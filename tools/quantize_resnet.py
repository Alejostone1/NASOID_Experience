"""Convierte el ResNet50 (Keras, include_top=False, pooling='avg', pesos ImageNet) del paquete npm
idai-shapes-ceramics_resnet50 (licencia ISC) a la entrada 224x224x3 de V27 y cuantiza los pesos.
Uso: python3 -I tools/quantize_resnet.py <carpeta_model_original> <salida> <float16|uint8>"""
import json, sys, os, math
import numpy as np
src, out, mode = sys.argv[1], sys.argv[2], sys.argv[3]
m = json.load(open(os.path.join(src, 'model.json')))
man = m['weightsManifest'][0]
buf = b''.join(open(os.path.join(src, p), 'rb').read() for p in man['paths'])
arr, off, new_w, chunks = [], 0, [], []
for w in man['weights']:
    n = math.prod(w['shape']); a = np.frombuffer(buf, dtype='<f4', count=n, offset=off); off += n * 4
    e = {'name': w['name'], 'shape': w['shape'], 'dtype': 'float32'}
    if len(w['shape']) != 4:  # BN y sesgos (pequeños, con valores grandes como conv1_bn/moving_variance) se dejan en float32
        chunks.append(a.astype('<f4').tobytes())
    elif mode == 'float16':
        chunks.append(a.astype('<f2').tobytes()); e['quantization'] = {'dtype': 'float16', 'original_dtype': 'float32'}
    else:
        lo, hi = float(a.min()), float(a.max()); scale = (hi - lo) / 255 if hi > lo else 1.0
        q = np.clip(np.round((a - lo) / scale), 0, 255).astype(np.uint8)
        chunks.append(q.tobytes()); e['quantization'] = {'dtype': 'uint8', 'min': lo, 'scale': scale, 'original_dtype': 'float32'}
    new_w.append(e)
assert off == len(buf), (off, len(buf))
data = b''.join(chunks); S = 4 * 1024 * 1024; os.makedirs(out, exist_ok=True)
paths = []
for i in range(0, len(data), S):
    p = f'group1-shard{i // S + 1}of{math.ceil(len(data) / S)}.bin'; open(os.path.join(out, p), 'wb').write(data[i:i + S]); paths.append(p)
L = m['modelTopology']['model_config']['config']['layers']; L[0]['config']['batch_input_shape'] = [None, 224, 224, 3]
m['weightsManifest'] = [{'paths': paths, 'weights': new_w}]
m['nasoid'] = {'source': 'npm idai-shapes-ceramics_resnet50@1.0.1 (ISC)', 'architecture': 'ResNet50 include_top=False pooling=avg', 'params': int(sum(math.prod(w['shape']) for w in new_w)), 'input': [224, 224, 3], 'weights': mode}
json.dump(m, open(os.path.join(out, 'model.json'), 'w'))
print(mode, len(data) / 1e6, 'MB', len(paths), 'shards')
