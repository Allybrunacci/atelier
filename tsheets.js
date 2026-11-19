/* Atelier — teaching worksheets: value and shading, line and texture, colour, and drawing skills, as A4 SVG pages */
'use strict';

/* ---------- shared pieces (all sizes are millimetres on an A4 page) ---------- */
function TS_name(y = 44) {
  return svgText('Name', 20, y, { size: 3.6, anchor: 'start', fill: PK3 }) + `<path d="M32 ${r1(y + 0.6)}h80" stroke="${PK3}" stroke-width=".35"/>`
    + svgText('Date', 124, y, { size: 3.6, anchor: 'start', fill: PK3 }) + `<path d="M135 ${r1(y + 0.6)}h55" stroke="${PK3}" stroke-width=".35"/>`;
}
// A section heading: a small circled number (optional), a bold title and a line of help underneath (or on the right).
function TS_head(n, title, x, y, hint, o = {}) {
  let s = '';
  if (n) s += `<circle cx="${r1(x + 2.6)}" cy="${r1(y - 1.4)}" r="2.6" fill="none" stroke="${PK}" stroke-width=".4"/>${svgText(String(n), r1(x + 2.6), r1(y - 0.25), { size: 3.2, w: 700, fill: PK })}`;
  s += svgText(title, n ? r1(x + 7.4) : x, y, { size: 4.4, w: 700, fill: PK, anchor: 'start' });
  if (hint) s += o.right ? svgText(hint, o.right, y, { size: 3.4, anchor: 'end', fill: PK2, max: 120 }) : svgText(hint, x, r1(y + 5.6), { size: 3.5, anchor: 'start', max: o.max || 96, fill: PK2, lh: 4.6 });
  return s;
}
function TS_arrow(x1, y1, x2, y2, o = {}) {
  const c = o.c || PK2, w = o.w || 0.45, h = o.h || 2, a = Math.atan2(y2 - y1, x2 - x1);
  const b = [x2 - Math.cos(a) * h * 0.8, y2 - Math.sin(a) * h * 0.8];
  const p1 = [x2 - Math.cos(a - 0.42) * h, y2 - Math.sin(a - 0.42) * h], p2 = [x2 - Math.cos(a + 0.42) * h, y2 - Math.sin(a + 0.42) * h];
  return `<path d="M${r1(x1)} ${r1(y1)}L${P2(b)}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}/><path d="M${r1(x2)} ${r1(y2)}L${P2(p1)}L${P2(p2)}Z" fill="${c}"/>`;
}
function TS_sun(x, y, r = 2.8, o = {}) {
  const c = o.c || PK, w = o.w || 0.5;
  let d = '';
  for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4; d += `M${P2(pol(r + 1.2, a, x, y))}L${P2(pol(r + 3, a, x, y))}`; }
  return `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r}" fill="#fff" stroke="${c}" stroke-width="${w}"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
}
// A little sun with an arrow pointing the way its light travels, towards (tx, ty).
function TS_light(sx, sy, tx, ty, o = {}) {
  const r = o.r || 2.8, d = Math.hypot(tx - sx, ty - sy), ux = (tx - sx) / d, uy = (ty - sy) / d, a0 = r + 4.6, a1 = d - (o.gap || 0);
  return TS_sun(sx, sy, r) + (a1 - a0 > 3 ? TS_arrow(sx + ux * a0, sy + uy * a0, sx + ux * a1, sy + uy * a1, { c: PK, w: 0.5, h: 2.2 }) : '');
}
const TS_spark = (x, y, s = 0.3) => `<g transform="translate(${r1(x - 12 * s)} ${r1(y - 12 * s)}) scale(${s})" fill="none" stroke="${PK}" stroke-width="${r1(0.5 / s)}" stroke-linejoin="round">${DOODLES.sparkle}</g>`;
const TS_box = (x, y, w, h, o = {}) => `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}"${o.rx ? ` rx="${o.rx}"` : ''} fill="${o.fill || 'none'}" stroke="${o.c || PK}" stroke-width="${o.w || 0.6}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}/>`;
// A label with a thin leader line to the thing it names, ending in a small dot.
function TS_lab(text, lx, ly, tx, ty, anchor = 'start', o = {}) {
  const sx = anchor === 'end' ? lx + 1.4 : lx - 1.4, sy = ly - 1.2;
  return `<path d="M${r1(sx)} ${r1(sy)}L${r1(tx)} ${r1(ty)}" fill="none" stroke="${PK2}" stroke-width=".3"/><circle cx="${r1(tx)}" cy="${r1(ty)}" r=".7" fill="${PK}"/>${svgText(text, lx, ly, { size: o.size || 3.6, anchor, fill: PK, w: o.w || 600, max: o.max || 40 })}`;
}
// A tip in a soft box, with a sparkle (or another little icon centred at x + 9, y + 8.6) beside the title.
function TS_tip(x, y, w, h, title, text, o = {}) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="none" stroke="${PK3}" stroke-width=".4"/>${o.icon || TS_spark(x + 9, y + 8.6, 0.3)}`
    + svgText(title, x + 17, y + 10, { size: 4, w: 700, fill: PK, anchor: 'start' })
    + svgText(text, x + 17, y + 16, { size: 3.5, anchor: 'start', max: o.max || Math.floor((w - 21) / 1.86), fill: PK2, lh: 4.7 });
}
// How many lines svgText will wrap a text into.
const TS_lineCount = (text, max) => { let n = 0, cur = ''; for (const w of String(text).split(' ')) { if (`${cur} ${w}`.trim().length > max && cur) { n++; cur = w; } else cur = `${cur} ${w}`.trim(); } return n + (cur ? 1 : 0); };
// Numbered steps, each with a small circled number.
function TS_steps(list, x, y, o = {}) {
  const size = o.size || 3.5, lh = o.lh || 4.7, max = o.max || 84, gap = o.gap || 2.4;
  let s = '';
  list.forEach((t, i) => {
    s += `<circle cx="${r1(x + 2.4)}" cy="${r1(y - 1.2)}" r="2.4" fill="none" stroke="${PK2}" stroke-width=".35"/>` + svgText(String(i + 1), r1(x + 2.4), r1(y - 0.1), { size: 3, w: 700, fill: PK2 });
    s += svgText(t, x + 7, r1(y), { size, anchor: 'start', max, fill: PK2, lh });
    y += TS_lineCount(t, max) * lh + gap;
  });
  return s;
}
// Pieces of a closed outline that pass a test, as one path (used for the parts of a line that can be seen).
function TS_runsD(pts, vis, cut, map = p => p) {
  const k = pts.findIndex(p => !vis(p)), seq = k < 0 ? pts.concat([pts[0]]) : pts.slice(k).concat(pts.slice(0, k + 1));
  let d = '', run = [];
  const flush = () => { if (run.length > 1) d += `M${run.map(p => P2(map(p))).join('L')}`; run = []; };
  seq.forEach((p, i) => {
    const q = seq[i - 1];
    if (vis(p)) { if (q && !vis(q)) run.push(cut(q, p)); run.push(p); } else if (q && vis(q)) { run.push(cut(q, p)); flush(); }
  });
  flush();
  return d;
}
// The line on a sphere (seen straight on) where the light has a given strength c: 1 faces the light, 0 is the edge of the shadow.
// L is the direction to the light (x right, y down, z towards you), one unit long.
function TS_isoD(cx, cy, r, L, c, n = 144) {
  const rho = Math.sqrt(1 - c * c), m = Math.hypot(L[0], L[1]), U = [L[1] / m, -L[0] / m, 0];
  const W = [L[1] * U[2] - L[2] * U[1], L[2] * U[0] - L[0] * U[2], L[0] * U[1] - L[1] * U[0]];
  const pts = Array.from({ length: n }, (_, i) => { const t = (i / n) * Math.PI * 2, a = Math.cos(t), b = Math.sin(t); return [0, 1, 2].map(j => c * L[j] + rho * (a * U[j] + b * W[j])); });
  const edge = (q, p) => { const f = q[2] / (q[2] - p[2]), x = q[0] + (p[0] - q[0]) * f, y = q[1] + (p[1] - q[1]) * f, k = Math.hypot(x, y) || 1; return [x / k, y / k, 0]; };
  return TS_runsD(pts, p => p[2] > 0, edge, p => [cx + p[0] * r, cy + p[1] * r]);
}
// An ellipse with the part hidden behind a circle left out.
function TS_ellOutD(ex, ey, rx, ry, cx, cy, r, n = 144) {
  const pts = Array.from({ length: n }, (_, i) => { const t = (i / n) * Math.PI * 2; return [ex + Math.cos(t) * rx, ey + Math.sin(t) * ry]; });
  const vis = p => Math.hypot(p[0] - cx, p[1] - cy) > r;
  const cut = (q, p) => { let a = q, b = p; const va = vis(q); for (let i = 0; i < 24; i++) { const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; if (vis(m) === va) a = m; else b = m; } return va ? a : b; };
  return TS_runsD(pts, vis, cut);
}

/* ---------- value and shading ---------- */
function TS_scale(n, x, y, w, h, words) {
  const bw = w / n;
  let s = TS_box(x, y, w, h, { w: 0.7 });
  for (let i = 1; i < n; i++) s += `<path d="M${r1(x + i * bw)} ${y}v${h}" stroke="${PK}" stroke-width=".45"/>`;
  for (let i = 0; i < n; i++) {
    const cx = r1(x + (i + 0.5) * bw);
    s += svgText(String(i + 1), cx, y + h + 5.5, { size: 3.8, w: 700, fill: PK });
    if (words[i]) s += svgText(words[i], cx, r1(y + h + 9.8), { size: 3.1, fill: PK3 });
  }
  return s;
}
function TS_eye(x, y) {
  return `<g fill="none" stroke="${PK}" stroke-width=".5" stroke-linecap="round"><path d="M${x - 5.5} ${y}Q${x} ${y - 4.8} ${x + 5.5} ${y}Q${x} ${y + 4.8} ${x - 5.5} ${y}Z"/><circle cx="${x}" cy="${y}" r="2"/></g><circle cx="${x}" cy="${y}" r=".8" fill="${PK}"/>`;
}
function TS_valueScale() {
  let s = TS_name();
  s += TS_head(1, 'Five-step value scale', 20, 57, 'Leave box 1 white and make box 5 as dark as you can. Then fill the middle steps evenly.');
  s += TS_scale(5, 20, 68, 170, 30, ['white', 'light grey', 'middle grey', 'dark grey', 'black']);
  s += TS_head(2, 'Nine-step value scale', 20, 122, 'Smaller steps this time. Box 5 is a middle grey, halfway between white and black.');
  s += TS_scale(9, 20, 133, 170, 28, ['white', '', '', '', 'middle grey', '', '', '', 'black']);
  s += TS_head(3, 'Smooth gradient', 20, 185, 'Blend from white to black with no steps or stripes. Build it up in soft layers.');
  s += TS_box(20, 196, 170, 24, { w: 0.7 });
  for (let i = 0; i <= 9; i++) s += `<path d="M${r1(20 + (i * 170) / 9)} 220v2" stroke="${PK3}" stroke-width=".35"/>`;
  s += svgText('white', 20, 226.5, { size: 3.1, anchor: 'start', fill: PK3 }) + svgText('middle grey', 105, 226.5, { size: 3.1, fill: PK3 }) + svgText('black', 190, 226.5, { size: 3.1, anchor: 'end', fill: PK3 });
  s += TS_tip(20, 237, 170, 36, 'Squint test', 'Half-close your eyes and look at your scales from a step back. Squinting hides the detail, so you see only light and dark. Each box should look a clear step darker than the one before.', { icon: TS_eye(29, 245.6) });
  s += svgText('Pencils: HB or 2B for the light and middle greys, 4B to 8B for the darkest.', 37, 267.5, { size: 3.3, anchor: 'start', fill: PK3, max: 90 });
  return s;
}

function TS_sphere() {
  const cx = 106, cy = 100, r = 30, L0 = [-0.55, -0.6, 0.58], m = Math.hypot(...L0), L = L0.map(c => c / m);
  const k2 = Math.hypot(L[0], L[1]), ax = L[0] / k2, ay = L[1] / k2;
  const H = [L[0], L[1], L[2] + 1], kh = Math.hypot(...H), hx = cx + (H[0] / kh) * r, hy = cy + (H[1] / kh) * r;
  const at = (deg, d) => [cx + Math.cos((deg * Math.PI) / 180) * d * r, cy + Math.sin((deg * Math.PI) / 180) * d * r];
  const dash = `fill="none" stroke="${PK2}" stroke-width=".4" stroke-dasharray="1.6 1.2"`;
  let s = TS_name();
  s += TS_light(cx + ax * 58, cy + ay * 58, cx + ax * 35, cy + ay * 35, { r: 3.2 }) + svgText('light source', r1(cx + ax * 58 - 9), r1(cy + ay * 58 + 1.2), { size: 3.4, anchor: 'end', fill: PK2 });
  s += `<path d="${TS_ellOutD(cx + 0.62 * r, cy + 0.93 * r, 0.95 * r, 0.2 * r, cx, cy, r)}" ${dash}/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${PK}" stroke-width=".9"/>`;
  s += [0.5, 0, -0.35].map(c => `<path d="${TS_isoD(cx, cy, r, L, c)}" ${dash}/>`).join('') + `<circle cx="${r1(hx)}" cy="${r1(hy)}" r="3.2" ${dash}/>`;
  const t1 = at(-8, 0.5), t2 = at(22, 0.73), t3 = at(42, 0.91), t4 = at(180, 0.55);
  s += TS_lab('highlight', 58, 84, hx, hy, 'end') + TS_lab('light', 58, 104, t4[0], t4[1] + 2, 'end')
    + TS_lab('half-tone', 146, 95, t1[0], t1[1], 'start') + TS_lab('core shadow', 146, 108, t2[0], t2[1], 'start')
    + TS_lab('reflected light', 146, 120, t3[0], t3[1], 'start') + TS_lab('cast shadow', 146, 140, 138, 129.5, 'start');
  s += TS_head(0, 'Your turn', 20, 160, 'Shade each sphere for its light. Add a cast shadow on the side away from the light.') + TS_spark(46, 157.5, 0.26);
  [[23, -40, 'Light from the right'], [29, -90, 'Light from above'], [35, -140, 'Light from the left']].forEach(([dx, deg, t], i) => {
    const px = 13 + i * 63, py = 172, x = px + dx, y = py + 48, a = (deg * Math.PI) / 180, R = 17;
    s += TS_box(px, py, 58, 90, { rx: 4, c: PK3, w: 0.4 });
    s += `<path d="M${px + 5} ${y + 9}h48" stroke="${PK3}" stroke-width=".4"/><circle cx="${x}" cy="${y}" r="${R}" fill="#fff" stroke="${PK}" stroke-width=".8"/>`;
    s += TS_light(x + Math.cos(a) * 34, y + Math.sin(a) * 34, x + Math.cos(a) * (R + 2.5), y + Math.sin(a) * (R + 2.5));
    s += svgText(t, px + 29, py + 82, { size: 3.6, w: 600, fill: PK });
  });
  s += TS_spark(24, 271, 0.26) + svgText('Remember: reflected light is always darker than anything on the light side.', 30, 272.4, { size: 3.4, anchor: 'start', fill: PK2, max: 120 });
  return s;
}

function TS_forms() {
  const sp = 0.3, cp = Math.sqrt(1 - sp * sp); // seen from a little above, so circles on the table look 0.3 times as tall as they are wide
  const list = [['Sphere', 'Soft, gradual shading. Find the core shadow.'], ['Cube', 'One flat value for each face.'], ['Cylinder', 'Shade in bands down its length.'], ['Cone', 'Bands of tone that meet at the tip.']];
  let s = TS_name();
  list.forEach(([name, hint], i) => {
    const px = 14 + (i % 2) * 95, py = 52 + Math.floor(i / 2) * 116, w = 87, cx = px + 44, by = py + 80;
    let f = '';
    if (i === 0) { const R = 21; f = `<circle cx="${cx}" cy="${r1(by - R * cp)}" r="${R}"/>`; }
    if (i === 1) {
      const e = 15, ps = (32 * Math.PI) / 180, V = (X, Y, Z) => [cx + X * Math.cos(ps) + Z * Math.sin(ps), by - Y * cp + (-X * Math.sin(ps) + Z * Math.cos(ps)) * sp];
      const face = q => `<path d="M${q.map(p => P2(V(...p))).join('L')}Z"/>`;
      f = face([[-e, 2 * e, -e], [e, 2 * e, -e], [e, 2 * e, e], [-e, 2 * e, e]]) + face([[-e, 0, -e], [-e, 0, e], [-e, 2 * e, e], [-e, 2 * e, -e]]) + face([[-e, 0, e], [e, 0, e], [e, 2 * e, e], [-e, 2 * e, e]]);
    }
    if (i === 2) {
      const R = 18, ry = r1(R * sp), ty = r1(by - 40 * cp);
      f = `<path d="M${cx - R} ${ty}V${by}A${R} ${ry} 0 0 0 ${cx + R} ${by}V${ty}A${R} ${ry} 0 0 0 ${cx - R} ${ty}Z"/><ellipse cx="${cx}" cy="${ty}" rx="${R}" ry="${ry}"/>`;
    }
    if (i === 3) {
      const R = 20, b = R * sp, h = 48 * cp, tx = R * Math.sqrt(1 - (b * b) / (h * h)), ty = by - (b * b) / h;
      f = `<path d="M${cx} ${r1(by - h)}L${r1(cx - tx)} ${r1(ty)}A${R} ${r1(b)} 0 1 0 ${r1(cx + tx)} ${r1(ty)}Z"/>`;
    }
    s += TS_box(px, py, w, 110, { rx: 4, c: PK3, w: 0.4 }) + `<path d="M${px + 6} ${by - 2}H${px + w - 6}" stroke="${PK2}" stroke-width=".45"/>`;
    s += `<g fill="#fff" stroke="${PK}" stroke-width=".8" stroke-linejoin="round">${f}</g>`;
    s += TS_light(px + 12, py + 12, px + 25, py + 27);
    s += svgText(name, px + w / 2, py + 97, { size: 4.6, w: 700, fill: PK, serif: true }) + svgText(hint, px + w / 2, py + 103.5, { size: 3.3, fill: PK2 });
  });
  return s;
}

function TS_blending() {
  const strips = [
    ['Graphite: light to dark', 'Start light and press a little harder as you go', ['light', 'dark']],
    ['Graphite: dark to light', 'Start dark, then slowly ease off the pressure', ['dark', 'light']],
    ['Two-colour blend', 'Overlap the colours softly in the middle', ['colour 1', 'colour 2']],
    ['Three-colour blend', 'Blend 1 into 2, then 2 into 3', ['colour 1', 'colour 2', 'colour 3']],
    ['Stippled gradient', 'Dots only, no smudging. More dots for darker', ['few dots', 'many dots']],
  ];
  let s = TS_name();
  strips.forEach(([t, hint, ends], i) => {
    const y = 57 + i * 43, x = 20, w = 170, sy = y + 4, sh = 18, ly = sy + sh + 5;
    s += TS_head(i + 1, t, x, y, hint, { right: x + w });
    s += TS_box(x, sy, w, sh, { w: 0.7, rx: 1.5 });
    if (ends.length === 3) {
      s += `<path d="M105 ${sy}v2M105 ${sy + sh}v-2" stroke="${PK2}" stroke-width=".4"/>`;
      s += svgText(ends[0], x, ly, { size: 3.4, anchor: 'start', fill: PK2, w: 600 }) + svgText(ends[1], 105, ly, { size: 3.4, fill: PK2, w: 600 }) + svgText(ends[2], x + w, ly, { size: 3.4, anchor: 'end', fill: PK2, w: 600 });
      s += TS_arrow(x + 20, ly - 1.2, 88, ly - 1.2) + TS_arrow(122, ly - 1.2, x + w - 20, ly - 1.2);
    } else {
      s += svgText(ends[0], x, ly, { size: 3.4, anchor: 'start', fill: PK2, w: 600 }) + svgText(ends[1], x + w, ly, { size: 3.4, anchor: 'end', fill: PK2, w: 600 });
      s += TS_arrow(x + 24, ly - 1.2, x + w - 24, ly - 1.2);
    }
  });
  s += TS_spark(24, 271, 0.26) + svgText('Tip: rest your hand on a scrap of paper so you don’t smudge your work.', 30, 272.4, { size: 3.4, anchor: 'start', fill: PK2, max: 120 });
  return s;
}

/* ---------- line and texture ---------- */
// Parallel lines at an angle (degrees), clipped to a rectangle.
function TS_hatchD(x, y, w, h, deg, gap) {
  const a = (deg * Math.PI) / 180, dx = Math.cos(a), dy = Math.sin(a), nx = -dy, ny = dx, cx = x + w / 2, cy = y + h / 2, R = Math.hypot(w, h) / 2;
  let d = '';
  for (let t = -Math.floor(R / gap) * gap; t <= R + 1e-9; t += gap) {
    const px = cx + nx * t, py = cy + ny * t;
    let s0 = -R, s1 = R;
    for (const [dd, p0, lo, hi] of [[dx, px, x, x + w], [dy, py, y, y + h]]) {
      if (Math.abs(dd) < 1e-9) { if (p0 < lo || p0 > hi) s1 = s0 - 1; } else { const a1 = (lo - p0) / dd, a2 = (hi - p0) / dd; s0 = Math.max(s0, Math.min(a1, a2)); s1 = Math.min(s1, Math.max(a1, a2)); }
    }
    if (s1 - s0 > 0.3) d += `M${P2([px + dx * s0, py + dy * s0])}L${P2([px + dx * s1, py + dy * s1])}`;
  }
  return d;
}
// A tiny sample of a way of shading, in a small square.
function TS_swatch(kind, x, y, k = 11) {
  const R = rng(kind), a = x + 1.2, b = y + 1.2, w = k - 2.4;
  let d = '', dots = '';
  if (kind === 'hatching') d = TS_hatchD(a, b, w, w, -45, 1.3);
  if (kind === 'cross') d = TS_hatchD(a, b, w, w, -45, 1.5) + TS_hatchD(a, b, w, w, 45, 1.5);
  if (kind === 'contour') for (let i = 0; i < 5; i++) { const yy = b + 0.4 + i * 1.6; d += `M${r1(a)} ${r1(yy)}Q${r1(a + w / 2)} ${r1(yy + 2.6)} ${r1(a + w)} ${r1(yy)}`; }
  if (kind === 'stipple') for (let i = 0; i < 48; i++) dots += `<circle cx="${r1(a + Math.sqrt(R()) * w)}" cy="${r1(b + R() * w)}" r=".28"/>`;
  if (kind === 'scribble') {
    const pts = [];
    let px = a + 1.6, py = b + 1.8, dx = 0.2, dy = 0.08;
    for (let i = 0; i < 150; i++) {
      const th = i * 0.78, rr = 0.9 + 0.45 * R();
      pts.push([px + rr * Math.cos(th), py + rr * Math.sin(th)]);
      px += dx; py += dy;
      if (px > a + w - 1.6 || px < a + 1.6) dx = -dx;
      if (py > b + w - 1.6 || py < b + 1.6) dy = -dy;
    }
    d += `M${pts.map(P2).join('L')}`;
  }
  if (kind === 'circles') for (let i = 0; i < 15; i++) {
    const rr = r1(0.8 + R() * 0.5), px = a + rr + R() * (w - 2 * rr), py = b + rr + R() * (w - 2 * rr);
    d += `M${r1(px + rr)} ${r1(py)}a${rr} ${rr} 0 1 0 ${r1(-2 * rr)} 0a${rr} ${rr} 0 1 0 ${r1(2 * rr)} 0`;
  }
  return `<rect x="${r1(x)}" y="${r1(y)}" width="${k}" height="${k}" rx="1.2" fill="none" stroke="${PK3}" stroke-width=".3"/>`
    + (d ? `<path d="${d}" fill="none" stroke="${PK2}" stroke-width=".3" stroke-linecap="round" stroke-linejoin="round"/>` : '') + (dots ? `<g fill="${PK2}">${dots}</g>` : '');
}
function TS_hatching() {
  const cells = [['Hatching', 'Parallel lines. Closer looks darker.', 'hatching'], ['Cross-hatching', 'Layer lines in new directions.', 'cross'], ['Contour hatching', 'Curved lines that follow the form.', 'contour'],
    ['Stippling', 'Dots only. More dots look darker.', 'stipple'], ['Scribble (scumbling)', 'Small, loose scribbles in layers.', 'scribble'], ['Circulism', 'Tiny overlapping circles, built up.', 'circles']];
  let s = TS_name();
  cells.forEach(([t, hint, kind], i) => {
    const x = 20 + (i % 2) * 88, Y = 59 + Math.floor(i / 2) * 74, w = 82, ly = Y + 55;
    s += TS_swatch(kind, x, Y - 7.5);
    s += svgText(t, x + 14, Y - 2.2, { size: 4.2, w: 700, fill: PK, anchor: 'start' }) + svgText(hint, x + 14, Y + 2.8, { size: 3.3, anchor: 'start', fill: PK2, max: 44 });
    s += TS_box(x, Y + 7, w, 42, { w: 0.6, rx: 1.5 });
    s += svgText('light', x, ly, { size: 3.2, anchor: 'start', fill: PK2, w: 600 }) + svgText('dark', x + w, ly, { size: 3.2, anchor: 'end', fill: PK2, w: 600 }) + TS_arrow(x + 11, ly - 1.1, x + w - 11, ly - 1.1);
  });
  s += TS_spark(24, 271, 0.26) + svgText('Tip: build dark values slowly in layers instead of pressing hard.', 30, 272.4, { size: 3.4, anchor: 'start', fill: PK2, max: 120 });
  return s;
}

function TS_lineWeight() {
  const guide = (x1, x2, y) => `<path d="M${x1} ${r1(y)}H${x2}" stroke="${PK3}" stroke-width=".35" stroke-dasharray=".1 1.6" stroke-linecap="round"/>`;
  let s = TS_name();
  s += TS_head(1, 'Thin to thick', 20, 55, 'Copy each line on its dotted guide. Make the last one swell from thin to thick.');
  [0.3, 0.6, 0.9, 1.2].forEach((w, i) => { const y = 68 + i * 7; s += `<path d="M20 ${y}h36" stroke="${PK}" stroke-width="${w}" stroke-linecap="round"/>` + guide(66, 190, y); });
  s += `<path d="M20 96Q40 95.6 56 95.3A.7 .7 0 0 1 56 96.7Q40 96.4 20 96Z" fill="${PK}"/>` + guide(66, 190, 96);
  s += TS_head(2, 'Light to heavy pressure', 20, 110, 'Fill each box with the same pencil, pressing a little harder each time.');
  ['very light', 'light', 'medium', 'firm', 'heavy'].forEach((t, i) => { const x = 20 + i * 35; s += TS_box(x, 120, 30, 16, { w: 0.5, rx: 1 }) + svgText(`${i + 1} ${t}`, x + 15, 141, { size: 3.3, fill: PK2 }); });
  s += TS_head(3, 'Marks', 20, 155, 'Copy each kind of mark and keep it even all the way along.');
  ['dotted', 'dashed', 'wavy', 'zigzag'].forEach((t, i) => {
    const y = 168 + i * 10;
    s += svgText(t, 20, y + 1.2, { size: 3.3, anchor: 'start', fill: PK2, w: 600 }) + guide(84, 190, y);
    if (i === 0) for (let x = 41; x <= 75; x += 2.6) s += `<circle cx="${r1(x)}" cy="${y}" r=".45" fill="${PK}"/>`;
    if (i === 1) s += `<path d="M40 ${y}H76" stroke="${PK}" stroke-width=".6" stroke-dasharray="3 1.71"/>`;
    if (i === 2) s += `<path d="M${Array.from({ length: 73 }, (_, k) => P2([40 + k * 0.5, y - 1.5 * Math.sin((k * 0.5 * Math.PI) / 3)])).join('L')}" fill="none" stroke="${PK}" stroke-width=".6" stroke-linejoin="round"/>`;
    if (i === 3) s += `<path d="M${Array.from({ length: 13 }, (_, k) => P2([40 + k * 3, y + (k % 2 ? -1.6 : 1.6)])).join('L')}" fill="none" stroke="${PK}" stroke-width=".6" stroke-linejoin="round"/>`;
  });
  s += TS_head(4, 'Vary the weight', 20, 213, 'Redraw the mug in the empty box. Use heavier lines in shadow and where shapes overlap.');
  s += TS_box(20, 223, 80, 54, { c: PK3, w: 0.4, rx: 3 }) + TS_box(110, 223, 80, 54, { c: PK3, w: 0.4, rx: 3 });
  s += svgText('Even lines', 23.5, 229, { size: 3.2, anchor: 'start', fill: PK3 }) + svgText('Your drawing', 113.5, 229, { size: 3.2, anchor: 'start', fill: PK3 });
  s += inkG(`<ellipse cx="56" cy="237" rx="14" ry="3.6"/><ellipse cx="56" cy="237.3" rx="12.4" ry="2.8"/><path d="M42 237V266A14 3.6 0 0 0 70 266V237"/><path d="M70 242C80.5 241.5 82 258 70 260.5M70 246.5C75.5 246.5 76.5 255.5 70 256"/>`, 0.5);
  return s;
}

function TS_textures() {
  const T = [['Wood grain', 'Wavy lines flowing round knots'], ['Fur', 'Short strokes the way it grows'], ['Feathers', 'A shaft with soft, fine barbs'], ['Glass', 'Crisp highlights, see-through'], ['Metal', 'Strong contrast, sharp shine'],
    ['Fabric', 'Soft folds or a woven pattern'], ['Brick', 'Staggered rows, rough edges'], ['Leaves', 'Overlapping shapes and veins'], ['Water', 'Ripples and broken reflections']];
  let s = TS_name();
  T.forEach(([t, hint], i) => {
    const x = 20 + (i % 3) * 58, Y = 56 + Math.floor(i / 3) * 73;
    s += svgText(t, x, Y, { size: 4.2, w: 700, fill: PK, anchor: 'start' }) + svgText(hint, x, Y + 5, { size: 3.2, anchor: 'start', fill: PK2, max: 34 });
    s += TS_box(x, Y + 8.5, 54, 56, { w: 0.6, rx: 1.5 });
  });
  s += TS_spark(24, 274, 0.26) + svgText('Tip: look closely at real things. Notice the size, direction and spacing of the marks.', 30, 275.4, { size: 3.4, anchor: 'start', fill: PK2, max: 120 });
  return s;
}

/* ---------- colour ---------- */
// A ring segment between radii ri and ro, from angle a0 to a1 (radians, clockwise on the page).
function TS_segD(cx, cy, ri, ro, a0, a1) {
  const p = (r, a) => P2(pol(r, a, cx, cy)), big = a1 - a0 > Math.PI ? 1 : 0;
  return `M${p(ro, a0)}A${ro} ${ro} 0 ${big} 1 ${p(ro, a1)}` + (ri > 0 ? `L${p(ri, a1)}A${ri} ${ri} 0 ${big} 0 ${p(ri, a0)}Z` : `L${r1(cx)} ${r1(cy)}Z`);
}
// n equal segments in a ring, the first one centred at the top.
function TS_ring(cx, cy, ri, ro, n = 12, w = 0.6, c = PK) {
  const st = (Math.PI * 2) / n;
  return `<g fill="#fff" stroke="${c}" stroke-width="${w}" stroke-linejoin="round">${Array.from({ length: n }, (_, i) => `<path d="${TS_segD(cx, cy, ri, ro, -Math.PI / 2 + (i - 0.5) * st, -Math.PI / 2 + (i + 0.5) * st)}"/>`).join('')}</g>`;
}
const TS_badge = (k, x, y, r = 2.4) => `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r}" fill="#fff" stroke="${PK2}" stroke-width=".35"/>` + svgText(k, r1(x), r1(y + 1.05), { size: 3, w: 700, fill: PK });
const TS_WHEEL = [['yellow', 'P'], ['yellow-orange', 'T'], ['orange', 'S'], ['red-orange', 'T'], ['red', 'P'], ['red-violet', 'T'], ['violet', 'S'], ['blue-violet', 'T'], ['blue', 'P'], ['blue-green', 'T'], ['green', 'S'], ['yellow-green', 'T']];
function TS_colourWheel() {
  const cx = 105, cy = 112, RL = 16, R0 = 24, R1 = 50, st = Math.PI / 6;
  let s = TS_name() + TS_ring(cx, cy, R0, R1, 12, 0.7) + TS_ring(cx, cy, RL, R0, 12, 0.4, PK2);
  TS_WHEEL.forEach(([name, k], i) => {
    const a = -Math.PI / 2 + i * st, [bx, by] = pol((RL + R0) / 2, a, cx, cy), [lx, ly] = pol(R1 + 4.5, a, cx, cy), c = Math.cos(a);
    s += svgText(k, r1(bx), r1(by + 1.1), { size: 3.2, w: 700, fill: PK2 });
    s += svgText(name, r1(lx), r1(ly + 1.1 + Math.sin(a) * 1.6), { size: 3.2, fill: PK3, anchor: Math.abs(c) < 0.2 ? 'middle' : c > 0 ? 'start' : 'end' });
  });
  s += TS_spark(cx, cy, 0.4);
  s += `<rect x="20" y="176" width="170" height="21" rx="3" fill="none" stroke="${PK3}" stroke-width=".4"/>`;
  [['P', 'primary', 'red, yellow and blue'], ['S', 'secondary', 'two primaries mixed'], ['T', 'tertiary', 'a primary plus a secondary']].forEach(([k, t, h], i) => {
    const x = 26 + i * 56.7;
    s += TS_badge(k, x + 2.4, 183.4) + svgText(t, r1(x + 7), 184.7, { size: 3.8, w: 700, fill: PK, anchor: 'start' }) + svgText(h, r1(x + 7), 190.6, { size: 3.2, fill: PK2, anchor: 'start' });
  });
  s += TS_head(0, 'Try some colour schemes', 20, 211, 'Colour in only the segments each scheme needs.');
  [['Complementary pair', 'Two colours opposite each other'], ['Analogous', 'Three colours side by side'], ['Warm or cool?', 'Colour only the warm half']].forEach(([t, h], i) => {
    const x = 45 + i * 60;
    s += TS_ring(x, 240, 5, 16, 12, 0.45) + svgText(t, x, 264, { size: 3.8, w: 700, fill: PK }) + svgText(h, x, 269.5, { size: 3.2, fill: PK2 });
  });
  return s;
}

function TS_tints() {
  const rows = [['Tints: add white', 'Add a little more white in each box. The colour gets lighter and softer.'], ['Tones: add grey', 'Mix in a little more grey each time. The colour gets duller and calmer.'], ['Shades: add black', 'Add a tiny bit more black each time. The colour gets darker and deeper.']];
  let s = TS_name() + svgText('My colour', 20, 53, { size: 3.6, anchor: 'start', fill: PK3 }) + `<path d="M38 53.6h74" stroke="${PK3}" stroke-width=".35"/>`;
  rows.forEach(([t, hint], i) => {
    const Y = 68 + i * 61, by = Y + 11, bh = 26;
    s += TS_head(i + 1, t, 20, Y, hint);
    s += TS_box(21, by, 26, bh, { w: 0.9, rx: 1 }) + svgText('pure colour', 34, by + bh + 5, { size: 3.2, fill: PK2, w: 600 });
    s += TS_arrow(49.2, by + bh / 2, 54.4, by + bh / 2, { w: 0.4, h: 1.8 });
    for (let k = 0; k < 5; k++) { const x = 56 + k * 27.4; s += TS_box(x, by, 23.4, bh, { w: 0.6, rx: 1 }) + svgText(`+${k + 1}`, r1(x + 11.7), by + bh + 5, { size: 3.4, fill: PK, w: 700 }); }
  });
  s += TS_tip(20, 246, 170, 28, 'Mixing tips', 'For tints, start with white and add the colour bit by bit, as a little colour goes a long way. Black is strong, so add it to shades in tiny amounts.');
  return s;
}

function TS_mixing() {
  const x0 = 17, y0 = 54, hw = 38, hh = 17, c = 23, n = 6, W = hw + n * c, H = hh + n * c;
  let s = TS_name(), d = '';
  for (let i = 1; i < n; i++) d += `M${x0 + hw + i * c} ${y0}V${y0 + H}M${x0} ${y0 + hh + i * c}H${x0 + W}`;
  s += `<path d="${d}" fill="none" stroke="${PK}" stroke-width=".4"/><path d="M${x0 + hw} ${y0}V${y0 + H}M${x0} ${y0 + hh}H${x0 + W}" fill="none" stroke="${PK}" stroke-width=".8"/>` + TS_box(x0, y0, W, H, { w: 0.8 });
  s += `<path d="M${x0} ${y0}L${x0 + hw} ${y0 + hh}" stroke="${PK3}" stroke-width=".35"/>` + svgText('across', x0 + hw - 1.6, y0 + 5.4, { size: 3, anchor: 'end', fill: PK3 }) + svgText('down', x0 + 1.6, y0 + hh - 2, { size: 3, anchor: 'start', fill: PK3 });
  for (let i = 0; i < n; i++) {
    const tx = x0 + hw + i * c + c / 2, sy = y0 + hh + i * c + c / 2;
    s += `<circle cx="${tx}" cy="${y0 + 6.2}" r="3.4" fill="none" stroke="${PK2}" stroke-width=".4"/><path d="M${tx - 8.5} ${y0 + 14}h17" stroke="${PK3}" stroke-width=".35"/>`;
    s += `<circle cx="${x0 + 7}" cy="${sy}" r="3.4" fill="none" stroke="${PK2}" stroke-width=".4"/><path d="M${x0 + 13} ${sy + 2.6}h22" stroke="${PK3}" stroke-width=".35"/>`;
    s += svgText('pure', tx, y0 + hh + i * c + c - 2.4, { size: 3, fill: PK3 });
  }
  s += TS_head(0, 'How to use it', 20, y0 + H + 12) + TS_steps([
    'Write six paints across the top and the same six, in the same order, down the side. Paint a dab of each in its circle.',
    'In each square, mix the paint at the top of its column with the paint at the start of its row, about half and half.',
    'Squares either side of the diagonal mix the same pair. Try more of one paint in one square and more of the other in its partner.',
  ], 20, y0 + H + 19.5, { max: 88 });
  return s;
}

/* ---------- drawing skills ---------- */
const TS_GUIDE = `fill="none" stroke="${PK3}" stroke-width=".35" stroke-dasharray="1.6 1.2"`;
const TS_dot = (p, r = 1.1) => `<circle cx="${r1(p[0])}" cy="${r1(p[1])}" r="${r}" fill="${PK}"/>`;
// A small bold label on a white patch, so guide lines behind it never run through the words.
function TS_tag(text, x, y, o = {}) {
  const size = o.size || 3.2, anchor = o.anchor || 'middle', w = Math.max(String(text).length * size * 0.6 + 2.4, 8);
  const x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w + 0.9 : x - 0.9;
  return `<rect x="${r1(x0)}" y="${r1(y - size * 0.98)}" width="${r1(w)}" height="${r1(size * 1.38)}" fill="#fff"/>` + svgText(text, r1(x), r1(y), { size, anchor, fill: o.fill || PK2, w: o.w || 700 });
}
// Where the line through a and b meets the line through c and d.
function TS_meet(a, b, c, d) {
  const d1 = [b[0] - a[0], b[1] - a[1]], d2 = [d[0] - c[0], d[1] - c[1]], den = d1[0] * d2[1] - d1[1] * d2[0];
  const t = ((c[0] - a[0]) * d2[1] - (c[1] - a[1]) * d2[0]) / den;
  return [a[0] + d1[0] * t, a[1] + d1[1] * t];
}
// The worked example and numbered steps that sit in a panel at the foot of the perspective sheets.
function TS_panel(art, title, steps) {
  return TS_box(14, 216, 182, 62, { rx: 3, c: PK3, w: 0.4 }) + art
    + svgText(title, 108, 226, { size: 4, w: 700, fill: PK, anchor: 'start' }) + TS_steps(steps, 108, 234, { size: 3.3, lh: 4.4, max: 44, gap: 2.2 });
}

function TS_grid() {
  const cols = 7, rows = 8, sq = 25, x0 = 20.5, y0 = 72, W = cols * sq, H = rows * sq;
  let s = TS_name(), d = '', m = '';
  s += svgText('Lightly draw a grid with the same number of squares on your reference picture (smaller squares if the picture is small) and label it the same way. Then copy what you see, one square at a time.', x0, 52, { size: 3.5, anchor: 'start', max: 72, fill: PK2, lh: 4.7 });
  // a little reference picture with its own grid
  for (let i = 1; i < 4; i++) m += `M${r1(167.5 + i * 6.25)} 48.5v15`;
  for (let j = 1; j < 3; j++) m += `M167.5 ${48.5 + j * 5}h25`;
  s += `<path d="${m}" fill="none" stroke="${PK3}" stroke-width=".3"/><path d="M169.5 62L175.5 55L179 58.5L184 53L191 62" fill="none" stroke="${PK2}" stroke-width=".45" stroke-linejoin="round"/><circle cx="171.8" cy="51.8" r="1.4" fill="none" stroke="${PK2}" stroke-width=".45"/>` + TS_box(167.5, 48.5, 25, 15, { rx: 1, c: PK2, w: 0.45 });
  for (let i = 1; i < cols; i++) d += `M${x0 + i * sq} ${y0}V${y0 + H}`;
  for (let j = 1; j < rows; j++) d += `M${x0} ${y0 + j * sq}H${x0 + W}`;
  s += `<path d="${d}" fill="none" stroke="${PK3}" stroke-width=".35"/>` + TS_box(x0, y0, W, H, { c: PK2, w: 0.5 });
  for (let i = 0; i < cols; i++) s += svgText('ABCDEFGH'[i], x0 + i * sq + sq / 2, y0 - 2.4, { size: 3.6, w: 700, fill: PK2 });
  for (let j = 0; j < rows; j++) s += svgText(String(j + 1), r1(x0 - 3.4), r1(y0 + j * sq + sq / 2 + 1.3), { size: 3.6, w: 700, fill: PK2 });
  s += svgText('Print at actual size (100%) so each square is 2.5 cm.', x0 + W, y0 + H + 6, { size: 3.1, anchor: 'end', fill: PK3 });
  return s;
}

function TS_onePoint() {
  const hy = 122, V = [105, hy];
  let s = TS_name(), g = '', f = '';
  [[24, 60, 30, 22], [150, 64, 30, 22], [20, 110, 20, 24], [34, 160, 32, 26], [136, 150, 38, 26], [92, 188, 26, 18]].forEach(([x, y, w, h]) => {
    [[x, y], [x + w, y], [x + w, y + h], [x, y + h]].forEach(c => {
      // skip a corner whose line to the vanishing point would run across the box front
      const px = c[0] + (V[0] - c[0]) * 0.01, py = c[1] + (V[1] - c[1]) * 0.01;
      if (!(px > x && px < x + w && py > y && py < y + h)) g += `M${c[0]} ${c[1]}L${V[0]} ${V[1]}`;
    });
    f += TS_box(x, y, w, h, { fill: '#fff', w: 0.8 });
  });
  s += `<path d="M14 ${hy}H196" stroke="${PK2}" stroke-width=".5"/><path d="${g}" ${TS_GUIDE}/>` + f + TS_dot(V, 1.2);
  s += TS_tag('VP', 105, 110.6) + TS_arrow(105, 112.4, 105, 119.4, { w: 0.35, h: 1.6 }) + TS_tag('horizon line', 196, hy - 2.4, { anchor: 'end' });
  // worked example: a box below the horizon, to the left of its vanishing point
  const ey = 230, E = [80, ey], F = [[30, ey + 13], [50, ey + 13], [50, ey + 29], [30, ey + 29]], B = F.map(p => [E[0] + (p[0] - E[0]) * 0.5, E[1] + (p[1] - E[1]) * 0.5]);
  let art = `<path d="M20 ${ey}H100" stroke="${PK2}" stroke-width=".4"/><path d="M${P2(B[0])}L${P2(E)}M${P2(B[1])}L${P2(E)}M${P2(B[2])}L${P2(E)}" ${TS_GUIDE}/>`;
  art += `<g fill="#fff" stroke="${PK}" stroke-width=".6" stroke-linejoin="round"><path d="M${P2(F[0])}L${P2(B[0])}L${P2(B[1])}L${P2(F[1])}Z"/><path d="M${P2(F[1])}L${P2(B[1])}L${P2(B[2])}L${P2(F[2])}Z"/><path d="M${F.map(P2).join('L')}Z"/></g>` + TS_dot(E, 0.9);
  art += svgText('vanishing point (VP)', 80, ey - 4.2, { size: 3, fill: PK2, w: 600 }) + svgText('horizon line', 20, ey - 2, { size: 3, anchor: 'start', fill: PK2, w: 600 });
  art += svgText('front', 40, ey + 22, { size: 3, fill: PK2 }) + svgText('top', 50, ey + 10.8, { size: 2.8, fill: PK2 }) + svgText('side', 57.5, ey + 16.8, { size: 2.8, fill: PK2 });
  return s + TS_panel(art, 'Finish each box', [
    'Join the corners to the VP. Some guide lines are drawn for you.',
    'Choose how deep the box is. Draw the back edges parallel to the front.',
    'Darken the box, rub out the extra lines and shade the sides.',
  ]);
}

function TS_twoPoint() {
  const hy = 122, V1 = [18, hy], V2 = [192, hy];
  let s = TS_name(), g = '';
  [[105, 138], [105, 184]].forEach(p => { g += `M${P2(p)}L${P2(V1)}M${P2(p)}L${P2(V2)}`; });
  s += `<path d="M14 ${hy}H196" stroke="${PK2}" stroke-width=".5"/><path d="${g}" ${TS_GUIDE}/>`;
  s += [[105, 138, 184], [56, 58, 98], [152, 62, 100]].map(([x, a, b]) => `<path d="M${x} ${a}V${b}" stroke="${PK}" stroke-width=".9" stroke-linecap="round"/>`).join('');
  s += TS_dot(V1, 1.2) + TS_dot(V2, 1.2) + TS_tag('VP 1', 18, hy - 3.4) + TS_tag('VP 2', 192, hy - 3.4) + TS_tag('horizon line', 105, hy - 2.4);
  s += svgText('start here', 105, 190.5, { size: 3, fill: PK3, w: 600 });
  // worked example: one box built from its front edge
  const ey = 230, E1 = [22, ey], E2 = [96, ey], T = [58, ey + 11], Bt = [58, ey + 32];
  const at = x => (p, v) => [x, p[1] + ((v[1] - p[1]) * (x - p[0])) / (v[0] - p[0])];
  const LT = at(44)(T, E1), LB = at(44)(Bt, E1), RT = at(74)(T, E2), RB = at(74)(Bt, E2), K = TS_meet(LT, E2, RT, E1);
  let art = `<path d="M20 ${ey}H98" stroke="${PK2}" stroke-width=".4"/><path d="M${P2(LT)}L${P2(E1)}M${P2(LB)}L${P2(E1)}M${P2(RT)}L${P2(E2)}M${P2(RB)}L${P2(E2)}M${P2(K)}L${P2(E1)}M${P2(K)}L${P2(E2)}" ${TS_GUIDE}/>`;
  art += `<g fill="#fff" stroke="${PK}" stroke-width=".6" stroke-linejoin="round"><path d="M${[T, LT, K, RT].map(P2).join('L')}Z"/><path d="M${[T, LT, LB, Bt].map(P2).join('L')}Z"/><path d="M${[T, RT, RB, Bt].map(P2).join('L')}Z"/></g>`;
  art += `<path d="M${P2(T)}L${P2(Bt)}" stroke="${PK}" stroke-width="1"/>` + TS_dot(E1, 0.9) + TS_dot(E2, 0.9);
  art += svgText('VP 1', 22, ey - 3.2, { size: 3, fill: PK2, w: 700 }) + svgText('VP 2', 96, ey - 3.2, { size: 3, fill: PK2, w: 700 }) + svgText('horizon line', 59, ey - 3.2, { size: 3, fill: PK2, w: 600 });
  art += svgText('front edge', 58, ey + 37.4, { size: 3, fill: PK2, w: 600 });
  return s + TS_panel(art, 'Build each box', [
    'Draw lines from the top and bottom of the edge to both VPs.',
    'Draw a vertical edge on each side, between the guide lines.',
    'Join the top of each side edge to the opposite VP to make the top.',
    'Now try the two edges above the horizon.',
  ]);
}

// Front view of a head: a rounded skull above the eye line and a softer jaw below it.
const TS_JAW = 0.53, TS_CHIN = 0.52;
function TS_headD(cx, top, chin, hw) {
  const ey = (top + chin) / 2, jy = r1(ey + TS_JAW * (chin - ey));
  return `M${cx - hw} ${ey}A${hw} ${ey - top} 0 0 1 ${cx + hw} ${ey}C${cx + hw} ${jy} ${r1(cx + TS_CHIN * hw)} ${chin} ${cx} ${chin}C${r1(cx - TS_CHIN * hw)} ${chin} ${cx - hw} ${jy} ${cx - hw} ${ey}Z`;
}
// Half the width of that head at height y, somewhere below the eye line.
function TS_jawX(cx, ey, chin, hw, y) {
  const P = [[hw, ey], [hw, ey + TS_JAW * (chin - ey)], [TS_CHIN * hw, chin], [0, chin]];
  const bz = (t, k) => (1 - t) ** 3 * P[0][k] + 3 * (1 - t) ** 2 * t * P[1][k] + 3 * (1 - t) * t * t * P[2][k] + t ** 3 * P[3][k];
  let a = 0, b = 1;
  for (let i = 0; i < 40; i++) { const m = (a + b) / 2; if (bz(m, 1) < y) a = m; else b = m; }
  return bz(a, 0);
}
function TS_face() {
  const cx = 105, top = 54, chin = 148, hw = 33, ey = (top + chin) / 2, ny = (ey + chin) / 2, my = ny + (chin - ny) / 3, ew = (2 * hw) / 5;
  const jn = TS_jawX(cx, ey, chin, hw, ny), jm = TS_jawX(cx, ey, chin, hw, my), X = x => cx - hw + x;
  let s = TS_name(), f = '', t = '';
  // guide lines and the five eye widths
  s += `<path d="M${cx} ${top - 3}V${chin + 3}M60 ${ey}H150M${r1(cx - jn - 3)} ${r1(ny)}H150M60 ${r1(my)}H${r1(cx + jm + 3)}" ${TS_GUIDE}/>`;
  for (let k = 0; k <= 5; k++) t += `M${r1(X(k * ew))} ${ey - 1.6}v3.2`;
  t += `M${r1(X(2 * ew))} ${ey - 8.4}v-1.6H${r1(X(3 * ew))}v1.6`;
  s += `<path d="${t}" fill="none" stroke="${PK2}" stroke-width=".35"/>` + TS_tag('one eye', cx, ey - 11.6, { size: 2.9, w: 400 });
  // ears, from the eye line down to the nose line
  const ear = m => {
    const x = v => r1(cx + m * v);
    return `<path d="M${x(hw - 0.2)} ${ey - 0.5}C${x(hw + 6.5)} ${ey - 3} ${x(hw + 8.5)} ${ey + 11} ${x(hw + 5)} ${ey + 17}C${x(hw + 3.2)} ${r1(ny - 3.6)} ${x(jn + 2.6)} ${r1(ny + 0.4)} ${x(jn)} ${r1(ny)}M${x(hw + 2)} ${ey + 3.5}C${x(hw + 5)} ${ey + 4} ${x(hw + 5.6)} ${ey + 11} ${x(hw + 3)} ${ey + 14.5}"/>`;
  };
  f += ear(1) + ear(-1) + `<path d="${TS_headD(cx, top, chin, hw)}"/>`;
  // eyes and brows in the second and fourth eye widths
  [1, 3].forEach(k => {
    const x1 = r1(X(k * ew) + 0.8), x2 = r1(X((k + 1) * ew) - 0.8), xm = r1((x1 + x2) / 2);
    f += `<path d="M${x1} ${ey}Q${xm} ${ey - 4.2} ${x2} ${ey}Q${xm} ${ey + 3.6} ${x1} ${ey}Z"/><circle cx="${xm}" cy="${ey - 0.1}" r="1.8"/><path d="M${r1(x1 - 0.5)} ${ey - 5.2}Q${xm} ${ey - 8.2} ${r1(x2 + 0.5)} ${ey - 5.2}"/>`;
    f += TS_dot([xm, ey - 0.1], 0.7);
  });
  // nose base and mouth
  const n = ny, mo = my;
  f += `<path d="M${cx - 4} ${r1(n - 3.4)}C${cx - 7.4} ${r1(n - 2.2)} ${cx - 7.2} ${r1(n + 0.8)} ${cx - 4.2} ${r1(n + 0.6)}M${cx + 4} ${r1(n - 3.4)}C${cx + 7.4} ${r1(n - 2.2)} ${cx + 7.2} ${r1(n + 0.8)} ${cx + 4.2} ${r1(n + 0.6)}M${cx - 2.4} ${r1(n + 1.3)}Q${cx} ${r1(n + 2.5)} ${cx + 2.4} ${r1(n + 1.3)}"/>`;
  f += `<path d="M${r1(cx - ew)} ${r1(mo)}Q${cx - 6} ${r1(mo - 2.6)} ${cx} ${r1(mo - 1.2)}Q${cx + 6} ${r1(mo - 2.6)} ${r1(cx + ew)} ${r1(mo)}Q${cx} ${r1(mo + 2.4)} ${r1(cx - ew)} ${r1(mo)}Z"/><path d="M${cx - 7} ${r1(mo + 3.6)}Q${cx} ${r1(mo + 5.6)} ${cx + 7} ${r1(mo + 3.6)}"/>`;
  s += `<g fill="none" stroke="${PK}" stroke-width=".5" stroke-linecap="round" stroke-linejoin="round">${f}</g>`;
  // labels
  const L = (text, y, max) => svgText(text, 58, r1(y + 1.2), { size: 3.3, anchor: 'end', fill: PK, w: 600, max, lh: 4.4 });
  const R = (text, y, max) => svgText(text, 152, r1(y + 1.2), { size: 3.3, anchor: 'start', fill: PK, w: 600, max, lh: 4.4 });
  s += L('eyes halfway down the head', ey, 18) + L('mouth a third of the way from nose to chin', my, 22);
  s += R('head is five eyes wide', ey, 24) + R('base of nose halfway from eyes to chin', ny, 22);
  s += TS_lab('ears between the eye and nose lines', 152, r1(ey + 10.5), r1(cx + hw + 6.7), r1(ey + 9.4), 'start', { size: 3.3, max: 22 });
  // practice head
  const t2 = 176, c2 = 270;
  s += TS_head(0, 'Your turn', 20, 162, 'Measure the halfway points with a ruler, draw the guide lines lightly, then add the features.');
  s += `<path d="M${cx} ${t2 - 3}V${c2 + 3}M${cx - hw - 4} ${(t2 + c2) / 2}H${cx + hw + 4}" ${TS_GUIDE}/><path d="${TS_headD(cx, t2, c2, hw)}" fill="none" stroke="${PK}" stroke-width=".5"/>`;
  return s;
}

const TEACH_SHEETS = [
  { id: 'value-scale', g: 'Value and shading', n: 'Value scales', d: 'Five-step and nine-step scales from white to black, plus a smooth gradient.', tech: 'value-scale', svg: () => a4('Value scales', 'Shade from white to black in even steps', TS_valueScale()) },
  { id: 'shading-sphere', g: 'Value and shading', n: 'Shading a sphere', d: 'A labelled guide to light and shadow on a sphere, then three to shade.', tech: 'light-form', svg: () => a4('Shading a sphere', 'See how light falls on a round form, then try it yourself', TS_sphere()) },
  { id: 'basic-forms', g: 'Value and shading', n: 'Light on basic forms', d: 'A sphere, cube, cylinder and cone, all lit from the top left, to shade.', tech: 'shapes', svg: () => a4('Light on basic forms', 'The light comes from the top left. Shade each form and add its cast shadow.', TS_forms()) },
  { id: 'blending', g: 'Value and shading', n: 'Blending and gradients', d: 'Long strips for smooth graphite, colour and stippled gradients.', tech: 'blending', svg: () => a4('Blending and gradients', 'Fill each strip with a smooth change from one end to the other', TS_blending()) },
  { id: 'hatching', g: 'Line and texture', n: 'Hatching practice', d: 'Six boxes to build value with hatching, cross-hatching, stippling and more.', tech: 'hatching', svg: () => a4('Hatching practice', 'Build each box from light to dark using only that kind of mark', TS_hatching()) },
  { id: 'line-weight', g: 'Line and texture', n: 'Line weight and marks', d: 'Thin and thick lines, pressure, marks and a mug to redraw with varied line weight.', tech: 'line-weight', svg: () => a4('Line weight and marks', 'Control your pencil, from the lightest touch to the boldest line', TS_lineWeight()) },
  { id: 'textures', g: 'Line and texture', n: 'Texture library', d: 'Nine boxes for drawing textures, from wood grain and fur to glass and water.', tech: 'textures', svg: () => a4('Texture library', 'Invent marks that look and feel like each surface', TS_textures()) },
  { id: 'colour-wheel', g: 'Colour', n: 'Colour wheel', d: 'A 12-part colour wheel to paint, plus three small wheels for trying colour schemes.', tech: 'colour-wheel', svg: () => a4('Colour wheel', 'Paint the primaries first, then mix the secondaries and tertiaries', TS_colourWheel()) },
  { id: 'tints-shades', g: 'Colour', n: 'Tints, tones and shades', d: 'Mix one colour with white, grey and black, five steps each.', tech: 'tints-shades', svg: () => a4('Tints, tones and shades', 'Start with one pure colour and change it step by step', TS_tints()) },
  { id: 'mixing-chart', g: 'Colour', n: 'Colour mixing chart', d: 'A six by six chart for mixing every pair of six paints.', tech: 'neutrals', svg: () => a4('Colour mixing chart', 'Mix every pair of paints and see what you get', TS_mixing()) },
  { id: 'grid-method', g: 'Drawing skills', n: 'Grid method', d: 'A labelled grid of 2.5 cm squares for copying a picture one square at a time.', tech: 'grid-method', svg: () => a4('Grid method', 'Copy a picture accurately, one square at a time', TS_grid()) },
  { id: 'one-point', g: 'Drawing skills', n: 'One-point perspective', d: 'A horizon line and vanishing point, with box fronts to finish as boxes.', tech: 'one-point', svg: () => a4('One-point perspective', 'Turn each rectangle into a box using the vanishing point', TS_onePoint()) },
  { id: 'two-point', g: 'Drawing skills', n: 'Two-point perspective', d: 'Two vanishing points and three vertical edges to build into boxes.', tech: 'two-point', svg: () => a4('Two-point perspective', 'Build a box from each vertical edge using both vanishing points', TS_twoPoint()) },
  { id: 'face-proportions', g: 'Drawing skills', n: 'Face proportions', d: 'A front-view head with labelled guide lines, then an empty head to practise on.', tech: 'face', svg: () => a4('Face proportions', 'Where the features sit on a face seen from the front', TS_face()) },
];
