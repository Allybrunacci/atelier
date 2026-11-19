/* Atelier — drawing tools: the mandala maker (mirrored symmetry), the scribble pad and colouring in.
   Drawings stay in memory while you work and can be saved to Photos or shared. */
'use strict';

const DCOL = [['Plum', '#2E2433'], ['Violet', '#6A45C2'], ['Berry', '#C2416B'], ['Coral', '#F07B5B'], ['Sunshine', '#F5C33B'], ['Leaf', '#3FAE7A'],
  ['Sky', '#3E8FD8'], ['Lilac', '#B79BF2'], ['Blush', '#F59AB5'], ['Peach', '#FFB98A'], ['Mint', '#9EDDBD'], ['White', '#FFFFFF']];
const DSIZES = [['Fine', 2.5], ['Medium', 6], ['Thick', 14]];
const DRW = {
  mandala: { strokes: [], redo: [], color: '#6A45C2', size: 6, soft: false, sym: 8, mirror: true, guides: true },
  scribble: { strokes: [], redo: [], color: '#3E8FD8', size: 14, soft: true, sym: 1, mirror: false, guides: false },
};
const COL = { pic: 'mandala-1', fills: [], redo: [], color: '#F59AB5' };
let drawOff = null;

/* ---------- shared bits ---------- */
const paletteHTML = cur => `<div class="palette" role="group" aria-label="Colour">${DCOL.map(([n, c]) => `<button type="button" class="${c === cur ? 'on' : ''}" style="--c:${c}" data-act="col" data-c="${c}" aria-label="${n}" aria-pressed="${c === cur}"></button>`).join('')}</div>`;
function setPressed(view, sel, on) { $$(sel, view).forEach(b => { const v = b === on; b.classList.toggle('on', v); b.setAttribute('aria-pressed', String(v)); }); }
function toggleBtn(btn, v) { btn.classList.toggle('on', v); btn.setAttribute('aria-pressed', String(v)); }
const canvasSize = wrap => Math.min(1600, Math.round(wrap.getBoundingClientRect().width * Math.min(3, window.devicePixelRatio || 1)));
function blobOf(cv, type = 'image/jpeg', q = 0.92) { return new Promise((res, rej) => cv.toBlob(b => (b ? res(b) : rej(new Error('Couldn’t make the picture.'))), type, q)); }
async function savePicture(cv, meta) {
  if (!PH.ok) { toast(`${icon('warn')} Photos can’t be saved in this browser. Open Atelier in Safari.`, { ms: 6000 }); return; }
  try {
    const id = await addPhotoFile(await blobOf(cv), meta);
    toast(`${icon('check')} Saved to Photos`, { undo: () => go(`#/photo/${id}`), undoLabel: 'Open', ms: 6000 });
  } catch (e) { toast(`${icon('warn')} Couldn’t save it: ${esc(e.message || 'storage may be full')}. Try sharing it instead.`, { ms: 7000 }); }
}
async function sharePicture(cv, name) {
  try { const r = await shareFile(await blobOf(cv), `${name}.jpg`, cap(name)); if (r === 'downloaded') toast(`${icon('check')} Saved to your downloads`); } catch (e) { toast(`${icon('warn')} Couldn’t share it.`); }
}

/* ---------- mandala maker and scribble pad ---------- */
function strokeOn(g, k, W) {
  if (!k || !k.pts.length) return;
  const n = k.sym || 1, c = W / 2, lw = k.s * (W / 360) * (k.soft ? 1.6 : 1), mirrors = k.mir && n > 1 ? [1, -1] : [1];
  g.save();
  g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = k.c; g.fillStyle = k.c; g.lineWidth = lw; g.globalAlpha = k.soft ? 0.3 : 1;
  for (let i = 0; i < n; i++) {
    const a = (i * 2 * Math.PI) / n, cs = Math.cos(a), sn = Math.sin(a);
    for (const m of mirrors) {
      const at = p => { let x = p[0] * W - c; const y = p[1] * W - c; if (m < 0) x = -x; return [c + x * cs - y * sn, c + x * sn + y * cs]; };
      g.beginPath();
      if (k.pts.length === 1) { const [x, y] = at(k.pts[0]); g.arc(x, y, lw / 2, 0, Math.PI * 2); g.fill(); continue; }
      k.pts.forEach((p, j) => { const [x, y] = at(p); if (j) g.lineTo(x, y); else g.moveTo(x, y); });
      g.stroke();
    }
  }
  g.restore();
}
function redrawStrokes(cv, st) { const g = cv.getContext('2d'); g.clearRect(0, 0, cv.width, cv.height); st.strokes.forEach(k => strokeOn(g, k, cv.width)); }
function guidesSVG(st) {
  if (!st.guides || st.sym < 2) return '';
  const n = st.mirror ? st.sym * 2 : st.sym;
  return `<svg class="guides" viewBox="0 0 100 100" aria-hidden="true">${Array.from({ length: n }, (_, i) => { const a = (i * 2 * Math.PI) / n - Math.PI / 2; return `<line x1="50" y1="50" x2="${r1(50 + Math.cos(a) * 50)}" y2="${r1(50 + Math.sin(a) * 50)}"/>`; }).join('')}<circle cx="50" cy="50" r="16"/><circle cx="50" cy="50" r="32"/><circle cx="50" cy="50" r="48"/></svg>`;
}
function drawTool(mode) {
  const st = DRW[mode], mandala = mode === 'mandala';
  return `<p class="lead">${mandala ? 'Draw in one slice and watch it repeat all the way around. Slow, small marks make the prettiest patterns.' : 'Doodle, swirl and scribble with a soft watercolour brush. There’s no wrong way to do it.'}</p>
    <div class="drawtool"><div class="canvas-wrap"><canvas id="cv-base" aria-hidden="true"></canvas>${guidesSVG(st)}<canvas id="cv-live" role="img" aria-label="Drawing space. Draw with your finger."></canvas></div>
    ${paletteHTML(st.color)}
    <div class="chips" style="justify-content:center" role="group" aria-label="Brush">${DSIZES.map(([n, v]) => chip(n, st.size === v, `data-act="size" data-v="${v}"`)).join('')}${chip('Watercolour', st.soft, 'data-act="soft"')}</div>
    ${mandala ? `<div class="chips" style="justify-content:center;margin-top:8px" role="group" aria-label="Symmetry">${[4, 6, 8, 12].map(n => chip(`${n} ways`, st.sym === n, `data-act="sym" data-v="${n}"`)).join('')}${chip(`${icon('mirror')} Mirror`, st.mirror, 'data-act="mirror"')}${chip('Guides', st.guides, 'data-act="guides"')}</div>` : ''}
    <div class="draw-bar"><button type="button" class="btn" data-act="undo"${st.strokes.length ? '' : ' disabled'}>${icon('undo')} Undo</button><button type="button" class="btn" data-act="clear"${st.strokes.length ? '' : ' disabled'}>${icon('eraser')} Clear</button>
      <button type="button" class="btn primary" data-act="save">${icon('download')} Save to Photos</button><button type="button" class="btn ghost" data-act="share">${icon('share')} Share</button></div></div>`;
}
function setupDraw(view, mode) {
  const st = DRW[mode], wrap = $('.canvas-wrap', view);
  if (!wrap) return () => {};
  const base = $('#cv-base', wrap), live = $('#cv-live', wrap);
  let W = 0, cur = null, pid = null;
  const fit = () => { const w = canvasSize(wrap); if (w && w !== W) { W = w; [base, live].forEach(c => { c.width = W; c.height = W; }); redrawStrokes(base, st); } };
  fit();
  const ptOf = e => { const r = live.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; };
  const paintLive = () => { const g = live.getContext('2d'); g.clearRect(0, 0, W, W); strokeOn(g, cur, W); };
  const down = e => { if (pid !== null) return; pid = e.pointerId; try { live.setPointerCapture(pid); } catch (_) { /* fine */ } cur = { c: st.color, s: st.size, soft: st.soft, sym: st.sym, mir: st.mirror, pts: [ptOf(e)] }; paintLive(); e.preventDefault(); };
  const move = e => { if (e.pointerId !== pid || !cur) return; const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : []; (evs.length ? evs : [e]).forEach(ev => cur.pts.push(ptOf(ev))); paintLive(); e.preventDefault(); };
  const up = e => {
    if (e.pointerId !== pid) return;
    pid = null;
    if (cur) { st.strokes.push(cur); st.redo = []; strokeOn(base.getContext('2d'), cur, W); }
    cur = null;
    live.getContext('2d').clearRect(0, 0, W, W);
    syncDrawButtons(view, st);
  };
  live.addEventListener('pointerdown', down);
  live.addEventListener('pointermove', move);
  live.addEventListener('pointerup', up);
  live.addEventListener('pointercancel', up);
  window.addEventListener('resize', fit);
  return () => window.removeEventListener('resize', fit);
}
function syncDrawButtons(view, st) { const u = $('[data-act="undo"]', view), c = $('[data-act="clear"]', view); if (u) u.disabled = !st.strokes.length; if (c) c.disabled = !st.strokes.length; }
function drawActs(mode) {
  const st = () => DRW[mode], view = () => $('#view'), base = () => $('#cv-base', view());
  const guides = () => { const wrap = $('.canvas-wrap', view()), old = $('.guides', wrap); if (old) old.remove(); const s = guidesSVG(st()); if (s) $('#cv-live', wrap).insertAdjacentHTML('beforebegin', s); };
  return {
    col: a => { st().color = a.dataset.c; setPressed(view(), '.palette button', a); },
    size: a => { st().size = +a.dataset.v; setPressed(view(), '[data-act="size"]', a); },
    soft: a => { st().soft = !st().soft; toggleBtn(a, st().soft); },
    sym: a => { st().sym = +a.dataset.v; setPressed(view(), '[data-act="sym"]', a); guides(); },
    mirror: a => { st().mirror = !st().mirror; toggleBtn(a, st().mirror); guides(); },
    guides: a => { st().guides = !st().guides; toggleBtn(a, st().guides); guides(); },
    undo: () => { const k = st().strokes.pop(); if (k) st().redo.push(k); redrawStrokes(base(), st()); syncDrawButtons(view(), st()); },
    clear: () => {
      const old = st().strokes;
      if (!old.length) return;
      st().strokes = [];
      redrawStrokes(base(), st());
      syncDrawButtons(view(), st());
      toast('Cleared', { undo: () => { st().strokes = old; const b = base(); if (b) { redrawStrokes(b, st()); syncDrawButtons(view(), st()); } } });
    },
    save: async () => {
      const cv = exportStrokes(st());
      await savePicture(cv, { kind: 'ref', tags: [mode === 'mandala' ? 'Mandala' : 'Scribble'], title: `${mode === 'mandala' ? 'Mandala' : 'Scribble'}, ${fmtDate(today())}` });
    },
    share: () => sharePicture(exportStrokes(st()), mode),
  };
}
function exportStrokes(st) {
  const W = 1600, cv = document.createElement('canvas');
  cv.width = W; cv.height = W;
  const g = cv.getContext('2d');
  g.fillStyle = '#fff';
  g.fillRect(0, 0, W, W);
  st.strokes.forEach(k => strokeOn(g, k, W));
  return cv;
}
for (const mode of ['mandala', 'scribble']) {
  TOOLS[mode] = {
    n: mode === 'mandala' ? 'Mandala maker' : 'Scribble pad',
    render: () => drawTool(mode),
    act: drawActs(mode),
    after(view) { if (drawOff) drawOff(); drawOff = setupDraw(view, mode); return () => { if (drawOff) { drawOff(); drawOff = null; } }; },
  };
}

/* ---------- colouring in: tap a space to fill it ---------- */
const CL = { key: '', W: 0, labels: null, walls: 0 };
function loadImg(svg) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' })), img = new Image();
    img.onload = () => { res(img); setTimeout(() => URL.revokeObjectURL(url), 1000); };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('Couldn’t load the picture.')); };
    img.src = url;
  });
}
// Lines become walls; every space between them gets its own number (scanline flood fill).
function labelSpaces(data, W) {
  const N = W * W, lab = new Int32Array(N), stack = new Int32Array(N);
  for (let i = 0, j = 0; i < N; i++, j += 4) lab[i] = (data[j] * 0.3 + data[j + 1] * 0.59 + data[j + 2] * 0.11) < 150 ? 0 : -1;
  let next = 1;
  for (let s = 0; s < N; s++) {
    if (lab[s] !== -1) continue;
    let sp = 0;
    stack[sp++] = s;
    while (sp) {
      const p = stack[--sp], y = (p / W) | 0;
      let x = p - y * W;
      while (x > 0 && lab[y * W + x - 1] === -1) x--;
      let upOpen = false, downOpen = false;
      for (; x < W && lab[y * W + x] === -1; x++) {
        const i = y * W + x;
        lab[i] = next;
        if (y > 0) { const u = i - W; if (lab[u] === -1) { if (!upOpen && sp < N) { stack[sp++] = u; upOpen = true; } } else upOpen = false; }
        if (y < W - 1) { const d = i + W; if (lab[d] === -1) { if (!downOpen && sp < N) { stack[sp++] = d; downOpen = true; } } else downOpen = false; }
      }
    }
    next++;
  }
  return { lab, n: next };
}
const hexRGBA = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
function paintFills(fill) {
  if (!CL.labels) return;
  const W = CL.W, g = fill.getContext('2d'), img = g.createImageData(W, W), d = img.data, col = new Int32Array(CL.labels.n).fill(-1), rgb = [];
  COL.fills.forEach(f => { const x = Math.min(W - 1, Math.max(0, Math.round(f.x * W))), y = Math.min(W - 1, Math.max(0, Math.round(f.y * W))), l = CL.labels.lab[y * W + x]; if (l > 0) { col[l] = rgb.length; rgb.push(hexRGBA(f.c)); } });
  const lab = CL.labels.lab;
  for (let i = 0, j = 0; i < W * W; i++, j += 4) { const k = lab[i] > 0 ? col[lab[i]] : -1; if (k >= 0) { const c = rgb[k]; d[j] = c[0]; d[j + 1] = c[1]; d[j + 2] = c[2]; d[j + 3] = 255; } }
  g.putImageData(img, 0, 0);
}
async function prepareColouring(view) {
  const wrap = $('.canvas-wrap', view);
  if (!wrap) return;
  const fill = $('#cv-fill', wrap), line = $('#cv-line', wrap), W = Math.min(1200, canvasSize(wrap)), key = `${COL.pic}@${W}`;
  [fill, line].forEach(c => { c.width = W; c.height = W; });
  const img = await loadImg(colourPicSVG(COL.pic));
  if (!document.contains(line)) return;
  const g = line.getContext('2d');
  g.fillStyle = '#fff';
  g.fillRect(0, 0, W, W);
  g.drawImage(img, 0, 0, W, W);
  const data = g.getImageData(0, 0, W, W);
  if (CL.key !== key) { CL.labels = labelSpaces(data.data, W); CL.W = W; CL.key = key; }
  const d = data.data;
  for (let j = 0; j < d.length; j += 4) { const lum = d[j] * 0.3 + d[j + 1] * 0.59 + d[j + 2] * 0.11; d[j + 3] = Math.max(0, Math.min(255, Math.round((255 - lum) * 1.4))); d[j] = 43; d[j + 1] = 42; d[j + 2] = 46; }
  g.putImageData(data, 0, 0);
  paintFills(fill);
  wrap.classList.remove('loading');
}
TOOLS.colour = {
  n: 'Colour it in',
  render() {
    return `<p class="lead">Pick a colour, then tap a space to fill it. Tap again with another colour to change it.</p>
      <div class="chips scroll" role="group" aria-label="Picture">${COLOUR_PICS.map(([id, n]) => chip(esc(n), COL.pic === id, `data-act="pic" data-v="${id}"`)).join('')}</div>
      <div class="drawtool"><div class="canvas-wrap loading"><canvas id="cv-fill" role="img" aria-label="Colouring page. Tap a space to colour it."></canvas><canvas id="cv-line" aria-hidden="true" style="pointer-events:none"></canvas></div>
      ${paletteHTML(COL.color)}
      <div class="draw-bar"><button type="button" class="btn" data-act="undo"${COL.fills.length ? '' : ' disabled'}>${icon('undo')} Undo</button><button type="button" class="btn" data-act="clear"${COL.fills.length ? '' : ' disabled'}>${icon('eraser')} Clear</button>
        <button type="button" class="btn primary" data-act="save">${icon('download')} Save to Photos</button><button type="button" class="btn ghost" data-act="share">${icon('share')} Share</button></div></div>
      <p class="fine" style="margin-top:12px">${icon('print', 'sm')} Prefer paper? <a href="#/printables">Print the pages</a> instead.</p>`;
  },
  act: {
    pic: a => { if (COL.pic !== a.dataset.v) { COL.pic = a.dataset.v; COL.fills = []; COL.redo = []; } render(); },
    col: a => { COL.color = a.dataset.c; setPressed($('#view'), '.palette button', a); },
    undo: () => { COL.fills.pop(); const f = $('#cv-fill'); if (f) paintFills(f); syncColourButtons(); },
    clear: () => { const old = COL.fills; COL.fills = []; const f = $('#cv-fill'); if (f) paintFills(f); syncColourButtons(); toast('Cleared', { undo: () => { COL.fills = old; const f2 = $('#cv-fill'); if (f2) paintFills(f2); syncColourButtons(); } }); },
    save: () => savePicture(exportColouring(), { kind: 'ref', tags: ['Colouring'], title: `${(COLOUR_PICS.find(p => p[0] === COL.pic) || [0, 'Colouring'])[1]}, ${fmtDate(today())}` }),
    share: () => sharePicture(exportColouring(), 'colouring'),
  },
  after(view) {
    if (drawOff) drawOff();
    const fill = $('#cv-fill', view);
    let busy = false;
    const tap = e => {
      if (!CL.labels || busy) return;
      const r = fill.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height, W = CL.W;
      let px = Math.round(x * W), py = Math.round(y * W), l = CL.labels.lab[py * W + px];
      for (let rad = 1; l <= 0 && rad <= 6; rad++) for (const [dx, dy] of [[rad, 0], [-rad, 0], [0, rad], [0, -rad]]) { const q = (py + dy) * W + px + dx; if (l <= 0 && q >= 0 && q < W * W && CL.labels.lab[q] > 0) { l = CL.labels.lab[q]; px += dx; py += dy; } }
      if (l <= 0) return;
      busy = true;
      COL.fills.push({ x: px / W, y: py / W, c: COL.color });
      COL.redo = [];
      paintFills(fill);
      syncColourButtons();
      busy = false;
    };
    fill.addEventListener('pointerup', tap);
    const fit = () => prepareColouring(view).catch(() => toast(`${icon('warn')} Couldn’t load the picture.`));
    fit();
    const onResize = () => { if (Math.min(1200, canvasSize($('.canvas-wrap', view) || fill)) !== CL.W) fit(); };
    window.addEventListener('resize', onResize);
    drawOff = () => window.removeEventListener('resize', onResize);
    return () => { if (drawOff) { drawOff(); drawOff = null; } };
  },
};
function syncColourButtons() { const v = $('#view'), u = $('[data-act="undo"]', v), c = $('[data-act="clear"]', v); if (u) u.disabled = !COL.fills.length; if (c) c.disabled = !COL.fills.length; }
function exportColouring() {
  const fill = $('#cv-fill'), line = $('#cv-line'), W = fill ? fill.width : 1000, cv = document.createElement('canvas');
  cv.width = W; cv.height = W;
  const g = cv.getContext('2d');
  g.fillStyle = '#fff';
  g.fillRect(0, 0, W, W);
  if (fill) g.drawImage(fill, 0, 0);
  if (line) g.drawImage(line, 0, 0);
  return cv;
}
