/* Atelier — reference tools: put a grid over a photo, see its values (light and dark) in 2 to 5 tones, find its
   colours, and flip it to check a drawing. Save the result to Photos, share it, or print a grid-method sheet. */
'use strict';

const RT = { look: 'colour', tones: 3, squint: 0, shift: 0, grid: false, n: 4, labels: true, diag: false, gcol: 'dark', fx: false, fy: false, pn: 6, pal: false };
const RTC = { id: '', w: 0, h: 0, base: null, lum: null, pal: null, palKey: '' };
// sRGB → perceived lightness (CIE L*, 0 to 1), so the value steps look even.
const LIN = Array.from({ length: 256 }, (_, i) => { const c = i / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
const lstar = y => (y > 0.008856 ? 116 * Math.cbrt(y) - 16 : 903.3 * y) / 100;

async function rtLoad(id) {
  if (RTC.id === id && RTC.base) return true;
  const blob = (await imgGet(`${id}:f`).catch(() => null)) || (await imgGet(`${id}:t`).catch(() => null));
  if (!blob) return false;
  const img = await decodeImage(blob), k = Math.min(1, 1200 / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * k)), h = Math.max(1, Math.round(img.naturalHeight * k));
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const g = cv.getContext('2d', { willReadFrequently: true });
  g.drawImage(img, 0, 0, w, h);
  const base = g.getImageData(0, 0, w, h), px = base.data, lum = new Float32Array(w * h);
  for (let i = 0, j = 0; j < lum.length; i += 4, j++) lum[j] = lstar(0.2126 * LIN[px[i]] + 0.7152 * LIN[px[i + 1]] + 0.0722 * LIN[px[i + 2]]);
  Object.assign(RTC, { id, w, h, base, lum, pal: null, palKey: '' });
  return true;
}
function boxBlur(src, w, h, r) {
  const tmp = new Float32Array(w * h), out = new Float32Array(w * h), n = 2 * r + 1;
  for (let y = 0; y < h; y++) {
    const row = y * w;
    let acc = 0;
    for (let x = -r; x <= r; x++) acc += src[row + clamp(x, 0, w - 1)];
    for (let x = 0; x < w; x++) { tmp[row + x] = acc / n; acc += src[row + Math.min(w - 1, x + r + 1)] - src[row + Math.max(0, x - r)]; }
  }
  for (let x = 0; x < w; x++) {
    let acc = 0;
    for (let y = -r; y <= r; y++) acc += tmp[clamp(y, 0, h - 1) * w + x];
    for (let y = 0; y < h; y++) { out[y * w + x] = acc / n; acc += tmp[Math.min(h - 1, y + r + 1) * w + x] - tmp[Math.max(0, y - r) * w + x]; }
  }
  return out;
}
// The photo as N flat tones, from its own darkest to lightest (ignoring the odd stray pixel).
function rtValues() {
  const { w, h } = RTC, n = w * h, r = Math.round((RT.squint * Math.max(w, h)) / 600);
  let L = RTC.lum;
  if (r > 0) L = boxBlur(boxBlur(L, w, h, r), w, h, r);
  const hist = new Uint32Array(256);
  for (let i = 0; i < n; i++) hist[Math.min(255, Math.max(0, Math.round(L[i] * 255)))]++;
  const pct = q => { let c = 0; const t = q * n; for (let i = 0; i < 256; i++) { c += hist[i]; if (c >= t) return i / 255; } return 1; };
  const lo = pct(0.02), hi = Math.max(lo + 0.05, pct(0.98)), N = RT.tones, shift = RT.shift / 100;
  const greys = Array.from({ length: N }, (_, k) => Math.round(18 + (237 * k) / (N - 1)));
  const out = new Uint8ClampedArray(n * 4);
  for (let i = 0, j = 0; i < n; i++, j += 4) {
    const v = (L[i] - lo) / (hi - lo) - shift, k = Math.floor(clamp(v, 0, 0.9999) * N), gv = greys[k];
    out[j] = gv; out[j + 1] = gv; out[j + 2] = gv; out[j + 3] = 255;
  }
  return new ImageData(out, w, h);
}
function rtGrey() {
  const { w, h, lum } = RTC, out = new Uint8ClampedArray(w * h * 4);
  for (let i = 0, j = 0; i < lum.length; i++, j += 4) { const g = Math.round(lum[i] * 255); out[j] = g; out[j + 1] = g; out[j + 2] = g; out[j + 3] = 255; }
  return new ImageData(out, w, h);
}
// The main colours: k-means on a sample of the photo's pixels, biggest share first.
function rtPalette(k) {
  const { w, h, base } = RTC, px = base.data, n = w * h, step = Math.max(1, Math.floor(n / 6000)), pts = [];
  for (let i = 0; i < n; i += step) { const j = i * 4; pts.push([px[j], px[j + 1], px[j + 2]]); }
  const d2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2, R = rng(`pal:${RTC.id}:${k}`);
  const cs = [pts[Math.floor(R() * pts.length)].slice()];
  while (cs.length < k) {
    const ds = pts.map(p => Math.min(...cs.map(c => d2(p, c)))), tot = sum(ds);
    if (!tot) break;
    let r = R() * tot, i = 0;
    while (i < ds.length - 1 && (r -= ds[i]) > 0) i++;
    cs.push(pts[i].slice());
  }
  const asg = new Int32Array(pts.length);
  for (let it = 0; it < 12; it++) {
    for (let i = 0; i < pts.length; i++) { let best = 0, bd = Infinity; for (let c = 0; c < cs.length; c++) { const d = d2(pts[i], cs[c]); if (d < bd) { bd = d; best = c; } } asg[i] = best; }
    const acc = cs.map(() => [0, 0, 0, 0]);
    for (let i = 0; i < pts.length; i++) { const a = acc[asg[i]]; a[0] += pts[i][0]; a[1] += pts[i][1]; a[2] += pts[i][2]; a[3]++; }
    acc.forEach((a, c) => { if (a[3]) cs[c] = [a[0] / a[3], a[1] / a[3], a[2] / a[3]]; });
  }
  const counts = new Array(cs.length).fill(0);
  for (let i = 0; i < pts.length; i++) counts[asg[i]]++;
  return cs.map((c, i) => ({ rgb: c.map(v => Math.round(v)), share: counts[i] / pts.length })).filter(x => x.share > 0.004).sort((a, b) => b.share - a.share);
}
const hexOf = rgb => `#${rgb.map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
const valueWord = rgb => { const l = lstar(0.2126 * LIN[rgb[0]] + 0.7152 * LIN[rgb[1]] + 0.0722 * LIN[rgb[2]]); return l > 0.72 ? 'Light' : l < 0.36 ? 'Dark' : 'Middle'; };
const warmCool = rgb => { const [r, , b] = rgb, sp = Math.max(...rgb) - Math.min(...rgb); return sp < 24 ? 'neutral' : r > b + 12 ? 'warm' : b > r + 12 ? 'cool' : 'neutral'; };

/* ---------- drawing ---------- */
const RT_OFF = document.createElement('canvas');
function rtDraw(cv, o = {}) {
  const { w, h } = RTC, src = RT.look === 'values' ? rtValues() : RT.look === 'grey' ? rtGrey() : RTC.base;
  cv.width = w;
  cv.height = h;
  RT_OFF.width = w;
  RT_OFF.height = h;
  RT_OFF.getContext('2d').putImageData(src, 0, 0);
  const g = cv.getContext('2d');
  g.save();
  g.setTransform(RT.fx ? -1 : 1, 0, 0, RT.fy ? -1 : 1, RT.fx ? w : 0, RT.fy ? h : 0);
  g.drawImage(RT_OFF, 0, 0);
  g.restore();
  if (RT.grid || o.grid) rtGrid(g, w, h);
}
const rtRows = () => Math.max(1, Math.ceil(RTC.h / (RTC.w / RT.n) - 0.001));
function rtGrid(g, w, h) {
  const n = RT.n, cell = w / n, rows = rtRows(), lw = Math.max(1, Math.round(Math.max(w, h) / 450));
  g.strokeStyle = RT.gcol === 'light' ? 'rgba(255,255,255,.92)' : RT.gcol === 'red' ? 'rgba(226,32,56,.92)' : 'rgba(30,22,36,.85)';
  g.lineWidth = lw;
  g.beginPath();
  for (let i = 1; i < n; i++) { const x = Math.round(i * cell) + 0.5; g.moveTo(x, 0); g.lineTo(x, h); }
  for (let j = 1; j < rows; j++) { const y = Math.round(j * cell) + 0.5; g.moveTo(0, y); g.lineTo(w, y); }
  g.stroke();
  if (RT.diag) {
    g.lineWidth = Math.max(1, lw * 0.6);
    g.setLineDash([lw * 4, lw * 4]);
    g.beginPath();
    for (let i = 0; i < n; i++) for (let j = 0; j < rows; j++) { const x0 = i * cell, y0 = j * cell, x1 = Math.min(w, x0 + cell), y1 = Math.min(h, y0 + cell); g.moveTo(x0, y0); g.lineTo(x1, y1); g.moveTo(x1, y0); g.lineTo(x0, y1); }
    g.stroke();
    g.setLineDash([]);
  }
  if (RT.labels) {
    const fs = clamp(Math.round(cell * 0.2), 11, 40);
    g.font = `800 ${fs}px Nunito, Arial, sans-serif`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    const tag = (t, x, y) => { const pw = fs * (t.length > 1 ? 1.9 : 1.5), ph = fs * 1.35; g.fillStyle = 'rgba(255,255,255,.9)'; dRound(g, x - pw / 2, y - ph / 2, pw, ph, ph / 2); g.fill(); g.fillStyle = '#2E2433'; g.fillText(t, x, y + fs * 0.06); };
    // Columns are lettered and rows numbered, like a map: square B3.
    for (let i = 0; i < n; i++) tag(colName(i), i * cell + cell / 2, fs * 0.95);
    for (let j = 0; j < rows; j++) tag(String(j + 1), fs * 1.05, Math.min(h - fs, j * cell + cell / 2));
  }
}
const colName = j => (j < 26 ? String.fromCharCode(65 + j) : String.fromCharCode(65 + Math.floor(j / 26) - 1) + String.fromCharCode(65 + (j % 26)));
const rtWhat = () => [RT.look === 'values' ? `${RT.tones} values` : RT.look === 'grey' ? 'greyscale' : '', RT.grid ? `${RT.n} × ${rtRows()} grid` : '', RT.fx || RT.fy ? 'flipped' : ''].filter(Boolean).join(', ') || 'copy';
const rtBlob = (o = {}) => { const cv = document.createElement('canvas'); rtDraw(cv, o); return new Promise((res, rej) => cv.toBlob(b => (b ? res(b) : rej(new Error('Couldn’t make the picture.'))), 'image/jpeg', 0.9)); };
// An A4 grid-method sheet: the reference with its grid at the top, and an empty grid to draw in below.
function rtSheet() {
  const p = pageCanvas(DOCK.W), g = p.g, n = RT.n, rows = rtRows(), ar = RTC.h / RTC.w, title = (S.photos[RTC.id] && S.photos[RTC.id].title) || 'Grid method';
  dDecor(g, `rt:${RTC.id}`);
  dText(g, 'Grid method', 105, 20, dFont(600, 7.4, true), DOCK.ink, 'center');
  dText(g, `${title}: copy one square at a time, matching the letters and numbers.`, 105, 27, dFont(400, 3.4), DOCK.ink2, 'center');
  let iw = 118, ih = iw * ar;
  if (ih > 96) { ih = 96; iw = ih / ar; }
  const cv = document.createElement('canvas');
  rtDraw(cv, { grid: true });
  const ix = (210 - iw) / 2, iy = 33;
  g.drawImage(cv, ix, iy, iw, ih);
  g.strokeStyle = DOCK.ink;
  g.lineWidth = 0.4;
  g.strokeRect(ix, iy, iw, ih);
  const top = iy + ih + 10, avH = 282 - top - 6, cellsH = RTC.h / (RTC.w / n), cs = Math.min(176 / n, avH / cellsH), gw = cs * n, gh = cs * cellsH, gx = (210 - gw) / 2, gy = top + 4;
  g.lineWidth = 0.35;
  g.strokeStyle = '#8D8892';
  g.beginPath();
  for (let i = 1; i < n; i++) { g.moveTo(gx + i * cs, gy); g.lineTo(gx + i * cs, gy + gh); }
  for (let j = 1; j < rows; j++) { if (j * cs < gh) { g.moveTo(gx, gy + j * cs); g.lineTo(gx + gw, gy + j * cs); } }
  g.stroke();
  g.strokeStyle = DOCK.ink;
  g.lineWidth = 0.5;
  g.strokeRect(gx, gy, gw, gh);
  for (let i = 0; i < n; i++) dText(g, colName(i), gx + i * cs + cs / 2, gy - 1.6, dFont(800, 3), DOCK.ink3, 'center');
  for (let j = 0; j < rows; j++) if (j * cs < gh) dText(g, String(j + 1), gx - 2.4, gy + j * cs + Math.min(cs, gh - j * cs) / 2 + 1, dFont(800, 3), DOCK.ink3, 'right');
  dText(g, 'Atelier', 105, 290, dFont(600, 2.9), DOCK.ink3, 'center');
  return p.cv;
}

/* ---------- the screen ---------- */
VIEWS.reftool = {
  tab: 'ideas', title: 'Reference tools',
  head(id) { const p = S.photos[id]; return { deco: !p, back: p ? `#/photo/${id}` : '#/ideas', kicker: p ? 'Reference tools' : '', title: p ? esc(p.title || 'Untitled photo') : 'Reference tools', sub: p ? '' : 'Grids, values and colours for any photo' }; },
  render(id) {
    const p = S.photos[id];
    if (!p) {
      const ids = photoIds('ref').concat(photoIds('art'));
      return `<p class="lead">Choose a photo to put a grid over it, see its light and dark values, find its colours, or flip it.</p>
        <div class="btn-row" style="margin-top:0"><button type="button" class="btn primary" data-act="new">${icon('camera')} A photo from your phone</button></div>
        ${ids.length ? `<div class="sec"><h2>Your photos</h2></div><div class="pgrid">${ids.map(x => photoTile(x, { href: `#/reftool/${x}`, cap: '' })).join('')}</div>` : ''}
        <div class="card flat" style="margin-top:20px"><p class="kicker" style="margin:0 0 6px">Good for teaching</p><ul class="doc" style="margin:0;padding-left:20px"><li><a href="#/technique/grid-method">Grid method</a>: copy a picture square by square.</li><li><a href="#/technique/notan">Notan</a> and <a href="#/technique/value-scale">value</a>: see the big shapes of light and dark.</li><li><a href="#/technique/schemes">Colour schemes</a>: find a photo’s palette to mix from.</li></ul></div>`;
    }
    const pal = RT.pal && RTC.id === id && RTC.pal ? RTC.pal : null;
    return `<div class="rt-stage" id="rts"><canvas id="rtc" role="img" aria-label="${esc(`${p.title || 'Photo'}, ${rtWhat()}`)}"></canvas><p class="fine rt-wait">Opening the photo…</p></div>
      <div class="rt-panel">
        <div class="field"><span class="f-l">Look</span>${seg('look', [['colour', 'Colour'], ['grey', 'Greyscale'], ['values', 'Values']], RT.look)}</div>
        ${RT.look === 'values' ? `<div class="field"><span class="f-l">Tones</span>${seg('tones', [[2, '2'], [3, '3'], [4, '4'], [5, '5']], RT.tones)}<small class="f-h">Two tones is a notan. Three or more show the main values.</small></div>
          <label class="field"><span class="f-l">Squint (blur the details)</span><input type="range" name="squint" min="0" max="10" step="1" value="${RT.squint}"></label>
          <label class="field"><span class="f-l">Lighter or darker</span><input type="range" name="shift" min="-25" max="25" step="1" value="${RT.shift}"></label>` : ''}
        <div class="field"><span class="f-l">Grid</span><div class="row wrap">${chip(`${icon('grid')} ${RT.grid ? 'Grid on' : 'Grid off'}`, RT.grid, 'data-act="grid"')}
          ${RT.grid ? `<div class="stepper" role="group" aria-label="Squares across"><button type="button" data-act="n" data-v="-1" aria-label="Fewer squares">${icon('minus')}</button><output aria-live="polite">${RT.n} across</output><button type="button" data-act="n" data-v="1" aria-label="More squares">${icon('plus')}</button></div>` : ''}</div>
          ${RT.grid ? `<div class="chips" style="margin-top:8px">${chip('Letters and numbers', RT.labels, 'data-act="labels"')}${chip('Diagonals', RT.diag, 'data-act="diag"')}</div><div style="margin-top:8px">${seg('gcol', [['dark', 'Dark lines'], ['light', 'Light lines'], ['red', 'Red lines']], RT.gcol)}</div>` : ''}</div>
        <div class="field"><span class="f-l">Flip</span><div class="chips">${chip(`${icon('mirror')} Flip across`, RT.fx, 'data-act="fx"')}${chip(`${icon('flip')} Upside down`, RT.fy, 'data-act="fy"')}</div><small class="f-h">Flipping shows mistakes in a drawing that your eye has got used to.</small></div>
        <div class="field"><span class="f-l">Colours</span>${pal ? `${seg('pn', [[4, '4'], [6, '6'], [8, '8']], RT.pn)}<div class="swatch-list">${pal.map(c => `<button type="button" class="swatch-row" data-act="copy" data-hex="${hexOf(c.rgb)}" aria-label="Copy ${hexOf(c.rgb)}"><i style="background:${hexOf(c.rgb)}" aria-hidden="true"></i><span class="t"><b>${hexOf(c.rgb)}</b><small>${valueWord(c.rgb)} value, ${warmCool(c.rgb)}</small></span><span class="s-amt">${Math.round(c.share * 100)}%</span></button>`).join('')}</div>` : `<div><button type="button" class="btn soft" data-act="pal">${icon('palette')} Find the colours</button></div>`}</div>
      </div>
      <div class="btn-row"><button type="button" class="btn primary" data-act="save">${icon('image')} Save to Photos</button><button type="button" class="btn" data-act="share">${icon('share')} Share</button><button type="button" class="btn" data-act="sheet">${icon('print')} Grid sheet</button><button type="button" class="btn ghost" data-act="reset">Start again</button></div>`;
  },
  act: {
    new: async () => { const ids = await importPhotos({ kind: 'ref' }); if (ids.length) go(`#/reftool/${ids[0]}`); },
    grid: () => { RT.grid = !RT.grid; render(); },
    n: a => { RT.n = clamp(RT.n + +a.dataset.v, 2, 16); render(); },
    labels: () => { RT.labels = !RT.labels; render(); },
    diag: () => { RT.diag = !RT.diag; render(); },
    fx: () => { RT.fx = !RT.fx; render(); },
    fy: () => { RT.fy = !RT.fy; render(); },
    pal: () => { if (!RTC.base) return; RTC.pal = rtPalette(RT.pn); RT.pal = true; render(); },
    copy: async a => { const hex = a.dataset.hex; try { await navigator.clipboard.writeText(hex); toast(`${icon('copy')} ${hex} copied`); } catch (e) { toast(hex); } },
    reset: () => { Object.assign(RT, { look: 'colour', tones: 3, squint: 0, shift: 0, grid: false, n: 4, labels: true, diag: false, gcol: 'dark', fx: false, fy: false, pal: false }); render(); },
    save: async a => {
      if (!RTC.base) return;
      a.disabled = true;
      try {
        const p = S.photos[UI.param], b = await rtBlob(), what = rtWhat();
        const id = await addPhotoFile(b, { kind: 'ref', title: `${p.title || 'Reference'} (${what})`, tags: (p.tags || []).slice(), note: `Made with reference tools from “${p.title || 'a reference photo'}”.` });
        toast(`${icon('check')} Saved to Photos`, { undo: () => deletePhoto(id, () => render(), 'Copy removed'), undoLabel: 'Remove' });
      } catch (e) { toast(`${icon('warn')} ${esc(e.message || 'Couldn’t save the picture.')}`, { ms: 6000 }); } finally { a.disabled = false; }
    },
    share: async () => {
      if (!RTC.base) return;
      const p = S.photos[UI.param], b = await rtBlob(), r = await shareFile(b, `${(p.title || 'reference').replace(/[^\w\- ]+/g, '').trim() || 'reference'} (${rtWhat()}).jpg`, p.title || 'Reference');
      if (r === 'downloaded') toast(`${icon('download')} Saved to your downloads`);
    },
    sheet: () => { if (RTC.base) openGridSheet(); },
  },
  after(view, id) {
    if (!S.photos[id]) return null;
    let live = true, raf = 0;
    const draw = () => { const cv = $('#rtc', view); if (cv && RTC.id === id && RTC.base) { rtDraw(cv); const w = $('.rt-wait', view); if (w) w.remove(); } };
    rtLoad(id).then(ok => {
      if (!live) return;
      if (!ok) { const w = $('.rt-wait', view); if (w) w.textContent = 'This photo couldn’t be opened.'; return; }
      if (RT.pal && !RTC.pal) { RTC.pal = rtPalette(RT.pn); render(); return; }
      draw();
    }).catch(() => {});
    const seg2 = e => {
      const b = e.target.closest('[data-seg]');
      if (!b) return;
      const k = b.dataset.seg, v = b.dataset.v;
      if (k === 'look') RT.look = v; else if (k === 'tones') RT.tones = +v; else if (k === 'gcol') RT.gcol = v; else if (k === 'pn') { RT.pn = +v; RTC.pal = RTC.base ? rtPalette(RT.pn) : null; } else return;
      render();
    };
    const slide = e => { const n = e.target.name; if (n !== 'squint' && n !== 'shift') return; RT[n] = +e.target.value; cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); };
    view.addEventListener('click', seg2);
    view.addEventListener('input', slide);
    return () => { live = false; cancelAnimationFrame(raf); view.removeEventListener('click', seg2); view.removeEventListener('input', slide); };
  },
};
function openGridSheet() {
  if (!RT.grid) { RT.grid = true; render(); }
  const cv = rtSheet(), url = cv.toDataURL('image/png');
  const sh = openSheet(`${sheetHead('Grid method sheet', `${RT.n} × ${rtRows()} squares on A4`)}<div class="pr-big"><img src="${url}" alt="The grid method sheet: the photo with its grid, and an empty grid below"></div>
    <div class="btn-row"><button type="button" class="btn primary" data-act="print">${icon('print')} Print</button><button type="button" class="btn" data-act="share">${icon('share')} Save or share</button></div>
    <p class="fine">Change the number of squares with the grid buttons, then make the sheet again.</p>`, {
    label: 'Grid method sheet',
    act: {
      print: () => printHTML(`<img src="${url}" alt="">`),
      share: async () => { const b = await new Promise(res => cv.toBlob(res, 'image/png')); const r = await shareFile(b, 'grid-method-sheet.png', 'Grid method sheet'); if (r === 'downloaded') toast(`${icon('download')} Saved to your downloads`); },
    },
  });
  return sh;
}
// Prints any markup on its own (pictures fill the page width).
function printHTML(html) {
  const root = $('#print-root');
  root.innerHTML = html;
  document.body.classList.add('printing');
  const done = () => { document.body.classList.remove('printing'); root.innerHTML = ''; window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done);
  try { window.print(); } catch (e) { done(); toast(`${icon('warn')} Printing isn’t available here. Try “Save or share”, then print from the share sheet.`, { ms: 7000 }); }
}
