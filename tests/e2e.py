"""
Pruebas de extremo a extremo de NASOID Experience en un navegador real (Playwright + Chromium).

Uso:
    npm run build && npx vite preview --port 4174 &
    pip install playwright && playwright install chromium
    python3 tests/e2e.py http://localhost:4174/            # todo
    python3 tests/e2e.py http://localhost:4174/ pres       # solo presentación
    python3 tests/e2e.py http://localhost:4174/ game       # solo simulador

Escribe capturas y tests/screens/report.json. En un equipo sin GPU (WebGL por software)
el simulador va lento; los tiempos de espera son amplios a propósito.
"""
import sys, json, time, os
from playwright.sync_api import sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:4174/'
ONLY = sys.argv[2] if len(sys.argv) > 2 else 'all'
OUT = os.path.join(os.path.dirname(__file__), 'screens'); os.makedirs(OUT, exist_ok=True)
REPORT = {'base': BASE, 'checks': {}, 'errors': [], 'started': time.strftime('%Y-%m-%d %H:%M')}
ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']

def check(name, ok, detail=''):
    REPORT['checks'][name] = {'ok': bool(ok), 'detail': detail}
    print(('PASS ' if ok else 'FAIL ') + name + (' · ' + str(detail) if detail else ''), flush=True)

def focus(pg):
    pg.wait_for_function("document.querySelector('#cam-focus').textContent.includes('✓')", timeout=120000, polling=500)

def shot(pg, name): pg.screenshot(path=os.path.join(OUT, name + '.png'))

def watch(pg, tag):
    pg.on('pageerror', lambda e: REPORT['errors'].append(f'{tag} PAGEERR {e}'))
    pg.on('console', lambda m: REPORT['errors'].append(f'{tag} {m.text}') if m.type == 'error' else None)

def presentation(b):
    pg = b.new_page(viewport={'width': 1440, 'height': 810}); watch(pg, 'pres')
    pg.goto(BASE); pg.wait_for_function('window.NASOID_P', timeout=120000)
    n = pg.evaluate('NASOID_P.count'); check('pres.escenas', n >= 25, n)
    links = pg.eval_on_selector_all('a.btn.amber', 'els => els.map(e => e.getAttribute("href"))')
    check('pres.boton_simulador', len(links) >= 3 and all('experience' in l for l in links), links)
    for i in range(n):
        if i: pg.keyboard.press('ArrowRight')
        pg.wait_for_timeout(2200); shot(pg, f'pres_{i + 1:02d}')
    check('pres.navegacion_teclado', pg.evaluate('NASOID_P.idx') == n - 1)
    txt = pg.eval_on_selector('#slides', 'e => e.textContent')
    check('pres.cifras_v27', all(x in txt for x in ['19', '95', '114', '209', '190', '4.275', 'Finca A · 7', 'Finca B · 12']))
    check('pres.tabla1_metodologia', all(x in txt for x in ['Positivista', 'Cuantitativo', 'Aplicada', 'Correlacional', 'No experimental']))
    pg.keyboard.press('Home'); pg.wait_for_timeout(500); check('pres.home', pg.evaluate('NASOID_P.idx') == 0)
    # interacciones
    pg.evaluate("NASOID_P.go(NASOID_P.ids.indexOf('problema'))"); pg.wait_for_timeout(2000); pg.click('.node.root'); check('pres.arbol_clic', 'causa raíz' in pg.inner_text('#tree-detail').lower())
    pg.evaluate("NASOID_P.go(NASOID_P.ids.indexOf('estado-arte'))"); pg.wait_for_timeout(2000); pg.click('.tl-dot >> nth=5'); t = pg.inner_text('#tl-card'); check('pres.linea_tiempo_clic', len(t) > 20, t[:60])
    pg.click('#tl-card .cite'); pg.wait_for_timeout(600); check('pres.cita_abre_biblioteca', pg.is_visible('#biblio') and pg.query_selector('#biblio .ref.flash') is not None)
    nref = pg.eval_on_selector_all('#biblio .ref', 'e => e.length'); nlinks = pg.eval_on_selector_all('#biblio .ref-links a[href^="http"]', 'e => e.length')
    check('pres.biblioteca_71', nref == 71 and nlinks >= 70, f'{nref} fichas · {nlinks} enlaces reales'); shot(pg, 'pres_biblioteca')
    pg.fill('#biblio [data-q]', 'ResNet'); pg.wait_for_timeout(600); k = pg.eval_on_selector_all('#biblio .ref', 'e => e.length'); check('pres.biblioteca_busqueda', 0 < k < 71, k)
    pg.keyboard.press('Escape'); pg.wait_for_timeout(300)
    pg.evaluate("NASOID_P.go(NASOID_P.ids.indexOf('tabla1'))"); pg.wait_for_timeout(2000); pg.click('.t1-r >> nth=0'); pg.wait_for_timeout(600)
    check('pres.tabla1_porque', 'Interpretativo' in pg.inner_text('.t1-x >> nth=0'))
    pg.keyboard.press('m'); pg.wait_for_timeout(300); check('pres.indice', pg.is_visible('#index')); pg.keyboard.press('Escape')
    pg.keyboard.press('n'); pg.wait_for_timeout(300); check('pres.notas', pg.is_visible('#notes')); pg.keyboard.press('n')
    m = b.new_page(viewport={'width': 390, 'height': 844}); watch(m, 'pres-movil'); m.goto(BASE); m.wait_for_function('window.NASOID_P', timeout=120000); m.wait_for_timeout(2500); shot(m, 'pres_movil'); m.close()
    pg.close()

def ready(pg): pg.wait_for_function('window.NASOID && NASOID.ready === true', timeout=1200000, polling=2000)

def query(pg, k, tag, chute=False):
    if chute:  # como en el protocolo: el animal inmovilizado en el brete
        pg.evaluate(f'NASOID.api.toggleChute(NASOID.herd.cows[{k}])'); pg.wait_for_function(f'NASOID.herd.cows[{k}].inChute && NASOID.mode==="interact"', timeout=60000); pg.wait_for_timeout(1500)
    pg.evaluate(f'(()=>{{const c=NASOID.herd.cows[{k}]; NASOID.api.openInteract(c); NASOID.api.enterCapture("identify");}})()')
    pg.wait_for_timeout(1500); focus(pg); shot(pg, f'game_camara_{tag}')
    pg.evaluate('void NASOID.api.shutter()'); pg.wait_for_selector('#review [data-accept]', timeout=120000)
    pg.click('#review [data-accept]'); pg.click('#review [data-go]'); pg.wait_for_timeout(1500)
    if pg.query_selector('#an-skip'): pg.click('#an-skip')
    pg.wait_for_selector('#d-badge', timeout=600000); pg.wait_for_timeout(800); shot(pg, f'game_resultado_{tag}')
    badge = pg.inner_text('#d-badge'); body = pg.inner_text('#analysis .result')
    pg.click('[data-a="close"]'); pg.wait_for_timeout(400)
    return badge, body

def game(b):
    pg = b.new_page(viewport={'width': 1280, 'height': 720}); watch(pg, 'game')
    t = time.time(); pg.goto(BASE + 'experience/?q=bajo'); pg.wait_for_selector('#menu:not(.hidden)', timeout=300000)
    check('game.carga_escenario', True, f'{time.time() - t:.0f} s hasta el menú'); shot(pg, 'game_menu')
    t = time.time(); ready(pg)
    cal = pg.evaluate('JSON.stringify(NASOID.api.STATE.cal)'); cal = json.loads(cal)
    nrec = pg.evaluate('NASOID.api.STATE.records.length')
    check('game.galeria_practica', nrec == 7, f'{nrec} registros · θ = {cal["theta"]} · {cal["rule"]} · ResNet50+galería en {time.time() - t:.0f} s')
    check('game.calibracion_fmr0', cal.get('useEER') is False and cal['minGenuine'] > cal['theta'] > cal['maxImpostor'] - 0.0011, cal)
    pg.click('#btn-play'); pg.wait_for_timeout(800)
    # movimiento
    p0 = pg.evaluate('({...NASOID.farmer.position})'); pg.keyboard.down('w'); t = time.time()
    while time.time() - t < 40:
        pg.wait_for_timeout(1000); p1 = pg.evaluate('({...NASOID.farmer.position})')
        if abs(p1['x'] - p0['x']) + abs(p1['z'] - p0['z']) > 1.5: break
    pg.keyboard.up('w'); d = abs(p1['x'] - p0['x']) + abs(p1['z'] - p0['z']); check('game.movimiento_wasd', d > 1.5, f'{d:.2f} m'); shot(pg, 'game_caminar')
    f0 = pg.evaluate('NASOID.frame'); pg.wait_for_timeout(5000); fps = (pg.evaluate('NASOID.frame') - f0) / 5; REPORT['fps_swiftshader_bajo'] = fps
    # interacción por teclado
    pg.evaluate('(()=>{const c=NASOID.herd.cows[1], m=c.muzzleWorld(new c.position.constructor()), h=c.heading; NASOID.farmer.position.set(m.x+Math.sin(h)*1.1,0,m.z+Math.cos(h)*1.1); NASOID.ctrl.faceTowards(m);})()')
    pg.wait_for_timeout(2500); pg.keyboard.press('e'); pg.wait_for_timeout(1500)
    check('game.interaccion_E', pg.is_visible('#interact'), pg.evaluate('NASOID.mode')); shot(pg, 'game_interaccion')
    pg.keyboard.press('1'); pg.wait_for_timeout(2500); check('game.camara_virtual', pg.is_visible('#camera-ui'))
    before = pg.inner_text('#cam-dist'); pg.evaluate("(()=>{const e=document.querySelector('#cam-r-dist'); e.value=50; e.dispatchEvent(new Event('input'));})()"); pg.wait_for_timeout(2500)
    after = pg.inner_text('#cam-dist'); check('game.ajuste_distancia', before != after, f'{before} → {after}'); shot(pg, 'game_camara_lejos')
    pg.evaluate("(()=>{const e=document.querySelector('#cam-r-dist'); e.value=30; e.dispatchEvent(new Event('input'));})()"); pg.wait_for_timeout(1000); focus(pg)
    pg.keyboard.press('Space'); pg.wait_for_selector('#review [data-accept]', timeout=120000); shot(pg, 'game_revision')
    pg.click('#review [data-edit]'); pg.wait_for_timeout(500)
    box = pg.query_selector('#rv-box').bounding_box(); pg.mouse.move(box['x'] + box['width'] / 2, box['y'] + box['height'] / 2); pg.mouse.down(); pg.mouse.move(box['x'] + box['width'] / 2 + 40, box['y'] + box['height'] / 2 + 10, steps=4); pg.mouse.up()
    box2 = pg.query_selector('#rv-box').bounding_box(); check('game.recorte_interactivo', abs(box2['x'] - box['x']) > 10, f"{box['x']:.0f} → {box2['x']:.0f}"); shot(pg, 'game_recorte')
    pg.click('#review [data-reset]'); pg.click('#review [data-editdone]'); pg.click('#review [data-x]'); pg.wait_for_timeout(600)
    pg.keyboard.press('Escape'); pg.wait_for_timeout(500)
    # tres estados
    for k, tag, want, ch in [(0, 'registrado', 'Identificado', False), (7, 'no_registrado', 'No identificado', False), (2, 'duplicado_brete', 'No concluyente', True)]:
        badge, body = query(pg, k, tag, ch); check(f'game.estado_{tag}', badge.strip() == want, f'{badge} · ' + body.replace('\n', ' ')[:260])
    # registro de un bovino nuevo (el 9.º del potrero) por la interfaz
    pg.evaluate('NASOID.api.openInteract(NASOID.herd.cows[8])'); pg.wait_for_timeout(800); pg.keyboard.press('2'); pg.wait_for_selector('#dialog [name=code]')
    code = pg.input_value('#dialog [name=code]'); pg.fill('#dialog [name=name]', 'Prueba'); pg.click('#dialog button.primary'); pg.wait_for_timeout(1500)
    for i in range(2):
        if i: pg.click('#dialog [data-more]'); pg.wait_for_timeout(2500)
        else: pg.wait_for_selector('#dialog [data-more]', timeout=60000); pg.click('#dialog [data-more]'); pg.wait_for_timeout(2500)
        focus(pg); pg.evaluate('void NASOID.api.shutter()'); pg.wait_for_selector('#review [data-accept]', timeout=120000); pg.click('#review [data-accept]'); pg.click('#review [data-go]')
        pg.wait_for_selector('#dialog [data-more]', timeout=600000)
    pg.click('#dialog [data-end]'); pg.wait_for_timeout(800)
    rec = json.loads(pg.evaluate(f'JSON.stringify(NASOID.api.STATE.records.filter(r=>r.code==="{code}").map(r=>({{n:r.refs.length,s:r.status,name:r.name}})))'))
    check('game.registro_nuevo', rec and rec[0]['n'] == 2 and rec[0]['s'] == 'registrado', rec)
    pg.keyboard.press('Escape'); pg.wait_for_timeout(500)
    pg.evaluate('NASOID.api.toggleChute(NASOID.herd.cows[2])'); pg.wait_for_function('!NASOID.herd.cows[2].inChute && NASOID.mode==="explore"', timeout=60000); pg.wait_for_timeout(1500)
    badge, body = query(pg, 8, 'recien_registrado'); check('game.identifica_recien_registrado', badge.strip() == 'Identificado' and code in body, badge)
    # ficha: editar y eliminar
    pg.keyboard.press('r'); pg.wait_for_selector('#registry .rec'); shot(pg, 'game_registro')
    pg.click(f'#registry .rec:has-text("{code}")'); pg.wait_for_selector('#registry [data-form]')
    pg.fill('#registry [name=name]', 'Prueba editada'); pg.click('#registry [data-form] button'); pg.wait_for_timeout(800)
    check('game.editar_ficha', pg.evaluate(f'NASOID.api.STATE.records.find(r=>r.code==="{code}").name') == 'Prueba editada'); shot(pg, 'game_ficha')
    hist = pg.inner_text('#registry .hist'); check('game.historial', 'Identificado' in hist and 'referencia' in hist, hist.replace('\n', ' | ')[:200])
    pg.click('#registry [data-del]'); pg.click('#dialog [data-ok]'); pg.wait_for_timeout(2500)
    try: pg.wait_for_function('NASOID.api.STATE.records.length === 7', timeout=30000); ok = True
    except Exception: ok = False
    check('game.eliminar_registro', ok, pg.evaluate('NASOID.api.STATE.records.length'))
    # persistencia
    pg.reload(); pg.wait_for_selector('#menu:not(.hidden)', timeout=300000); pg.wait_for_function('window.NASOID && NASOID.api.STATE.records.length > 0', timeout=120000, polling=1000)
    n = pg.evaluate('NASOID.api.STATE.records.length'); ch = pg.evaluate('JSON.stringify(NASOID.api.STATE.challenges)')
    check('game.persistencia_recarga', n == 7, f'{n} registros · desafíos {ch}')
    check('game.desafios', all(k in ch for k in ['identificado', 'no-identificado', 'no-concluyente', 'registro']), ch)
    # reinicio
    ready(pg); pg.evaluate('NASOID.api.resetPractice()'); pg.wait_for_timeout(3000); ready(pg)
    check('game.reinicio_datos', pg.evaluate('NASOID.api.STATE.records.length') == 7 and pg.evaluate('JSON.stringify(NASOID.api.STATE.challenges)') == '{}')
    pg.close()
    m = b.new_page(viewport={'width': 390, 'height': 844}, has_touch=True, is_mobile=True); watch(m, 'game-movil')
    m.goto(BASE + 'experience/?q=bajo'); m.wait_for_selector('#menu:not(.hidden)', timeout=300000); m.wait_for_timeout(1000); shot(m, 'game_movil_menu')
    m.click('#btn-play'); m.wait_for_timeout(2500); shot(m, 'game_movil_hud'); check('game.responsive_joystick', m.is_visible('#joystick')); m.close()

with sync_playwright() as p:
    b = p.chromium.launch(args=ARGS)
    t0 = time.time()
    if ONLY in ('all', 'pres'): presentation(b)
    if ONLY in ('all', 'game'): game(b)
    b.close()
REPORT['seconds'] = round(time.time() - t0)
REPORT['errors'] = [e for e in REPORT['errors'] if 'GPU stall' not in e and 'GL Driver' not in e]
ok = sum(c['ok'] for c in REPORT['checks'].values()); REPORT['summary'] = f"{ok}/{len(REPORT['checks'])} comprobaciones superadas · {len(REPORT['errors'])} errores de consola"
json.dump(REPORT, open(os.path.join(OUT, 'report.json'), 'w'), ensure_ascii=False, indent=2)
print(REPORT['summary']); [print('  ', e) for e in REPORT['errors'][:15]]
