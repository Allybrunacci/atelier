/* Atelier — illustrations for techniques, drawn as SVG by code (no images). Part 1: helpers, foundations, shading, perspective. */
'use strict';

const IG = '#2B2A2E', IG2 = '#55515A', IG3 = '#8D8892', IG4 = '#CFCAD2', ITX = '#4A4650', IACC = '#3346A8', ISIE = '#A84B26';
const IL = {};
let ILN = 0, LBL = true;
const f1 = n => Math.round(n * 10) / 10;
const grey = v => `rgb(${v},${v},${v})`;
const T = (x, y, s, a = 'start', o = {}) => (LBL || o.always ? `<text x="${x}" y="${y}" text-anchor="${a}" font-size="${o.s || 13}" font-weight="${o.w || 700}" fill="${o.c || ITX}" font-family="Nunito,system-ui,sans-serif">${s}</text>` : '');
const Ln = (x1, y1, x2, y2, w = 1.5, c = IG, x = '') => `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"${x}/>`;
const P = (d, o = {}) => `<path d="${d}" fill="${o.f || 'none'}" stroke="${o.s || (o.f ? 'none' : IG)}" stroke-width="${o.w || 1.5}" stroke-linecap="round" stroke-linejoin="round"${o.x || ''}/>`;
const C = (cx, cy, r, o = {}) => `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r)}" fill="${o.f || 'none'}" stroke="${o.s || (o.f ? 'none' : IG)}" stroke-width="${o.w || 1.5}"${o.x || ''}/>`;
const E = (cx, cy, rx, ry, o = {}) => `<ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="${o.f || 'none'}" stroke="${o.s || (o.f ? 'none' : IG)}" stroke-width="${o.w || 1.5}"${o.x || ''}/>`;
const Rc = (x, y, w, h, o = {}) => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${o.r || 0}" fill="${o.f || 'none'}" stroke="${o.s || (o.f ? 'none' : IG)}" stroke-width="${o.w || 1.5}"${o.x || ''}/>`;
const stops = s => s.map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}"${op !== undefined ? ` stop-opacity="${op}"` : ''}/>`).join('');
const lgrad = (id, s, x1 = 0, y1 = 0, x2 = 1, y2 = 0) => `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops(s)}</linearGradient>`;
const rgradU = (id, s, cx, cy, r, fx = cx, fy = cy) => `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${cx}" cy="${cy}" r="${r}" fx="${fx}" fy="${fy}">${stops(s)}</radialGradient>`;
const rgrad = (id, s) => `<radialGradient id="${id}">${stops(s)}</radialGradient>`;
function Ar(x1, y1, x2, y2, c = IACC, w = 2) {
  const a = Math.atan2(y2 - y1, x2 - x1), hx = x2 - Math.cos(a) * 9, hy = y2 - Math.sin(a) * 9, px = -Math.sin(a) * 4.5, py = Math.cos(a) * 4.5;
  return Ln(x1, y1, hx, hy, w, c) + `<polygon points="${f1(x2)},${f1(y2)} ${f1(hx + px)},${f1(hy + py)} ${f1(hx - px)},${f1(hy - py)}" fill="${c}"/>`;
}
// A label with a thin line to the thing it names.
function lead(lx, ly, px, py, label, a = 'start') {
  if (!LBL) return '';
  const sx = a === 'start' ? lx - 4 : a === 'end' ? lx + 4 : lx;
  return Ln(sx, ly - 4, px, py, 1, IACC) + C(px, py, 2.2, { f: IACC }) + T(lx, ly, label, a, { s: 12 });
}
function sun(x, y, c = ISIE) {
  let s = C(x, y, 7, { s: c, w: 2 });
  for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4; s += Ln(x + Math.cos(a) * 11, y + Math.sin(a) * 11, x + Math.cos(a) * 15, y + Math.sin(a) * 15, 2, c); }
  return s;
}
// Parallel lines filling a box at an angle (one path), with a little hand-drawn wobble.
function hatchD(x, y, w, h, deg, gap, seed = 7, jit = 0.5) {
  const r = rng(seed), a = (deg * Math.PI) / 180, dx = Math.cos(a), dy = Math.sin(a), nx = -dy, ny = dx, cx = x + w / 2, cy = y + h / 2, R = Math.hypot(w, h) / 2;
  let d = '';
  for (let t = -R; t <= R; t += gap) {
    const j1 = (r() - 0.5) * jit * gap, j2 = (r() - 0.5) * jit * gap, px = cx + nx * t, py = cy + ny * t;
    d += `M${f1(px - dx * R + nx * j1)} ${f1(py - dy * R + ny * j1)}L${f1(px + dx * R + nx * j2)} ${f1(py + dy * R + ny * j2)}`;
  }
  return d;
}
// Dots (one path of round-capped zero-length strokes). dens(x, y) gives 0..1.
function dotsD(x, y, w, h, n, dens, seed = 3) {
  const r = rng(seed);
  let d = '', k = 0;
  for (let i = 0; i < n * 8 && k < n; i++) { const px = x + r() * w, py = y + r() * h; if (r() < dens(px, py)) { d += `M${f1(px)} ${f1(py)}h0`; k++; } }
  return d;
}
const dots = (d, size = 2, c = IG) => `<path d="${d}" stroke="${c}" stroke-width="${size}" stroke-linecap="round" fill="none"/>`;
// Tiny overlapping loops for circulism.
function loopsD(x, y, w, h, n, dens, seed = 5, rad = 3) {
  const r = rng(seed);
  let d = '', k = 0;
  for (let i = 0; i < n * 8 && k < n; i++) {
    const px = x + r() * w, py = y + r() * h;
    if (r() < dens(px, py)) { const q = rad * (0.6 + r() * 0.6); d += `M${f1(px + q)} ${f1(py)}a${f1(q)} ${f1(q)} 0 1 0 ${f1(-2 * q)} 0a${f1(q)} ${f1(q)} 0 1 0 ${f1(2 * q)} 0`; k++; }
  }
  return d;
}
const grain = id => `<filter id="${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -1.4 1.05"/><feComposite in2="SourceGraphic" operator="in"/></filter>`;
const inter = (a, b, c, d) => { const x1 = a[0], y1 = a[1], x2 = b[0], y2 = b[1], x3 = c[0], y3 = c[1], x4 = d[0], y4 = d[1], den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4), t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den; return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)]; };
const pts = a => a.map(p => `${f1(p[0])},${f1(p[1])}`).join(' ');
const poly = (a, o = {}) => `<polygon points="${pts(a)}" fill="${o.f || 'none'}" stroke="${o.s || (o.f ? 'none' : IG)}" stroke-width="${o.w || 1.5}" stroke-linejoin="round"${o.x || ''}/>`;
const dash = ' stroke-dasharray="5 4"';
const HUES = ['#F2C230', '#F0A23A', '#E8782F', '#DD5A2C', '#C8352E', '#A82D5E', '#6C3D93', '#4A4BA0', '#2F5DA8', '#22857F', '#3E9A4A', '#9DBE3C'];
function wheelSegs(cx, cy, r0, r1, fill) {
  let s = '';
  for (let i = 0; i < 12; i++) {
    const a0 = ((i * 30 - 105) * Math.PI) / 180, a1 = (((i + 1) * 30 - 105) * Math.PI) / 180;
    const p = (r, a) => `${f1(cx + Math.cos(a) * r)} ${f1(cy + Math.sin(a) * r)}`;
    s += `<path d="M${p(r1, a0)}A${r1} ${r1} 0 0 1 ${p(r1, a1)}L${p(r0, a1)}A${r0} ${r0} 0 0 0 ${p(r0, a0)}Z" fill="${fill(i)}" stroke="#FFFDF8" stroke-width="1.5"/>`;
  }
  return s;
}

function illus(id, big) {
  const e = IL[id] || IL.marks;
  LBL = !!big;
  const u = `il${++ILN}`;
  return `<svg viewBox="0 0 320 200" ${big ? `role="img" aria-label="${esc(e[0])}"` : 'aria-hidden="true"'} focusable="false">${e[1](u)}</svg>`;
}

/* ---------- foundations ---------- */
IL.marks = ['Nine kinds of marks: dots, dashes, zigzags, loops, scribbles, tapered strokes, hatching, crosses and a pressure line from light to heavy.', u => {
  let s = '';
  const cells = [[16, 16], [116, 16], [216, 16], [16, 80], [116, 80], [216, 80], [16, 144], [116, 144], [216, 144]], r = rng(9);
  const [a, b, c, d, e, f, g, h, i] = cells;
  s += dots(dotsD(a[0] + 4, a[1] + 4, 80, 40, 40, () => 1, 2), 3);
  let dd = ''; for (let k = 0; k < 4; k++) for (let j = 0; j < 5; j++) dd += `M${b[0] + 4 + j * 17} ${b[1] + 8 + k * 11}h9`; s += P(dd, { w: 2 });
  let z = `M${c[0] + 4} ${c[1] + 40}`; for (let j = 0; j < 8; j++) z += `L${c[0] + 14 + j * 10} ${c[1] + (j % 2 ? 40 : 8)}`; s += P(z, { w: 1.8 });
  let l = `M${d[0] + 6} ${d[1] + 28}`; for (let j = 0; j < 6; j++) l += `c6 -18 18 -18 12 0s-6 18 2 0`; s += P(l, { w: 1.6 });
  let sc = `M${e[0] + 6} ${e[1] + 24}`; for (let j = 0; j < 26; j++) sc += `L${f1(e[0] + 6 + r() * 76)} ${f1(e[1] + 6 + r() * 36)}`; s += P(sc, { w: 1.1 });
  for (let j = 0; j < 4; j++) s += `<path d="M${f[0] + 6} ${f[1] + 8 + j * 11}q40 -6 80 0" stroke="${IG}" stroke-width="${0.6 + j * 1.3}" fill="none" stroke-linecap="round"/>`;
  s += `<clipPath id="${u}c"><rect x="${g[0] + 4}" y="${g[1] + 4}" width="80" height="40"/></clipPath><path d="${hatchD(g[0] + 4, g[1] + 4, 80, 40, -55, 6, 3)}" stroke="${IG}" stroke-width="1.1" clip-path="url(#${u}c)"/>`;
  let x = ''; for (let k = 0; k < 3; k++) for (let j = 0; j < 5; j++) { const cx = h[0] + 12 + j * 16, cy = h[1] + 10 + k * 13; x += `M${cx - 4} ${cy - 4}l8 8M${cx + 4} ${cy - 4}l-8 8`; } s += P(x, { w: 1.4 });
  s += `<defs>${lgrad(u + 'p', [[0, '#2B2A2E', 0.15], [1, '#2B2A2E', 1]])}</defs><path d="M${i[0] + 6} ${i[1] + 26}q40 -14 80 0" stroke="url(#${u}p)" stroke-width="9" fill="none" stroke-linecap="round"/>`;
  return s;
}];
IL.lineweight = ['A cup drawn with thin lines on its lit side and heavier lines in shadow and where it overlaps a saucer.', u => {
  let s = E(150, 160, 84, 16, { w: 1.2 }) + P('M66 160q0 14 84 16 84 -2 84 -16', { w: 3.2 });
  s += E(150, 54, 52, 14, { w: 1.2 }) + P('M98 54q2 80 22 98', { w: 1.1 }) + P('M202 54q-2 80 -22 98', { w: 4 }) + P('M120 152q30 10 60 0', { w: 4.2 });
  s += P('M200 76c34 -4 40 40 -4 52', { w: 4.4 }) + P('M200 88c20 0 22 24 -2 30', { w: 2 });
  s += sun(28, 30) + T(16, 196, 'Thin where light hits', 'start', { s: 12 }) + T(304, 196, 'Heavy in shadow and overlaps', 'end', { s: 12 });
  return s;
}];
IL.contour = ['A leaf drawn as one slow continuous line, including its veins.', () => {
  const d = 'M40 160C70 120 110 60 200 40c40 -8 70 -6 84 2c-10 20 -30 70 -90 104c-40 22 -100 24 -150 16c30 -8 60 -24 84 -44c-20 2 -40 -6 -52 -16c22 4 44 2 62 -8c-14 -6 -24 -18 -30 -30c18 8 34 12 50 10c-6 -12 -8 -26 -6 -40c10 14 20 24 34 28c4 -14 12 -26 24 -36c-2 14 0 26 4 38c40 -10 70 -40 82 -70';
  return P(d, { w: 2 }) + T(16, 30, 'One unbroken line, eyes on the subject', 'start', { s: 12 });
}];
IL.gesture = ['Three quick figures, each started with a curved line of action.', () => {
  let s = '';
  const figs = [[60, 'M48 40Q70 100 52 170'], [160, 'M140 44Q190 90 150 170'], [262, 'M290 40Q230 110 270 170']];
  for (const [x, a] of figs) s += P(a, { s: IACC, w: 4, x: ' opacity=".55"' });
  s += C(50, 34, 10) + P('M50 44Q64 80 56 106M56 106l-16 62M56 106l20 60M54 58l-26 30M54 58l30 18', { w: 2 });
  s += C(146, 38, 10) + P('M148 48Q172 80 162 110M162 110l-26 56M162 110l14 58M152 60l-30 -14M154 62l34 26', { w: 2 });
  s += C(286, 34, 10) + P('M282 44Q252 80 262 110M262 110l-24 58M262 110l22 56M272 58l24 -26M270 60l-40 14', { w: 2 });
  return s + T(160, 194, 'Line of action first, then the shapes', 'middle', { s: 12 });
}];
IL.shapes = ['Basic shapes turned into objects: a sphere into an apple, a box into a house, a cylinder into a cup and a cone into a tree.', () => {
  let s = '';
  s += C(42, 70, 26, { s: IACC, w: 1.2, x: dash }) + P('M42 46c-24 -6 -30 20 -26 34 6 20 20 22 26 16 6 6 22 4 26 -16 4 -14 -2 -40 -26 -34', { w: 2 }) + P('M42 46q2 -8 8 -12', { w: 2 });
  s += P('M100 60h40v40h-40zM100 60l14 -12h40l-14 12M154 48v40l-14 12', { s: IACC, w: 1.2, x: dash }) + P('M100 100V60l20 -22 20 22v40zM140 60l14 -12M154 48v40l-14 12M114 100V82h12v18', { w: 2 });
  s += E(196, 50, 22, 7, { s: IACC, w: 1.2, x: dash }) + P('M174 50v44a22 7 0 0 0 44 0V50', { s: IACC, w: 1.2, x: dash }) + P('M174 50v44a22 7 0 0 0 44 0V50M218 62c16 0 16 22 0 22', { w: 2 }) + E(196, 50, 22, 7, { w: 2 });
  s += P('M270 30l-26 74h52z', { s: IACC, w: 1.2, x: dash }) + P('M270 30l-18 30h8l-14 26h10l-12 18h52l-12 -18h10l-14 -26h8zM266 104v14h8v-14', { w: 2 });
  s += T(42, 140, 'Sphere', 'middle') + T(127, 140, 'Box', 'middle') + T(196, 140, 'Cylinder', 'middle') + T(270, 140, 'Cone', 'middle');
  return s + T(160, 180, 'See the simple shape first, then add the detail', 'middle', { s: 12, w: 400 });
}];
IL.sighting = ['Measuring with a pencil at arm’s length: the cup’s height is one unit and the bottle is two and a half units tall.', () => {
  let s = P('M120 40h20v26c14 8 18 18 18 30v74h-56v-74c0 -12 4 -22 18 -30z', { w: 2 }) + P('M180 120h50v50h-50zM230 132c14 0 14 26 0 26', { w: 2 });
  s += P('M84 120v50M80 120h8M80 170h8', { s: IACC, w: 2 }) + P('M84 40v80', { s: IACC, w: 2, x: ' stroke-dasharray="3 3"' }) + P('M80 40h8M80 70h8M80 95h8', { s: IACC, w: 2 });
  s += T(76, 150, '1', 'end', { c: IACC }) + T(76, 100, '2½', 'end', { c: IACC });
  s += P('M262 30v120l-5 12v-132zM258 30h8v-8h-8z', { f: '#E8C66A', s: IG, w: 1.2 }) + Rc(254, 118, 16, 8, { f: ISIE, r: 3 });
  return s + T(262, 186, 'Thumb marks the unit', 'middle', { s: 12 }) + T(16, 22, 'Arm straight, one eye closed', 'start', { s: 12 });
}];
IL.negative = ['A chair left white while the spaces between its legs and rails are shaded in.', u => {
  const chair = 'M110 20h100v20h-8v50h20v14h-14v76h-10v-76h-76v76h-10v-76h-14v-14h20v-50h-8z';
  let s = `<defs><mask id="${u}m"><rect x="60" y="10" width="200" height="176" fill="#fff"/><path d="${chair}" fill="#000"/></mask></defs>`;
  s += Rc(60, 10, 200, 176, { f: '#6E6A73', x: ` mask="url(#${u}m)"` }) + P(chair, { w: 1.5 });
  return s + T(160, 197, 'Draw the shapes between, not the chair', 'middle', { s: 12 });
}];
IL.grid = ['A reference photo of a bird with a three-by-three grid, copied square by square onto paper with a matching grid.', u => {
  const bird = (x, y, k, o) => P(`M${x + 20 * k} ${y + 70 * k}c10 -30 40 -40 60 -30c10 -14 30 -16 36 -4l14 2-12 8c4 30 -24 50 -60 46l-20 14 4 -16c-12 -2 -20 -10 -22 -20z`, o);
  const gridD = x0 => { let g = ''; for (let i = 1; i < 3; i++) g += `M${x0 + i * 40} 30v120M${x0} ${30 + i * 40}h120`; return g; };
  let s = Rc(16, 30, 120, 120, { f: '#DCE6EE', s: IG3 }) + bird(16, 30, 1, { f: '#7A6A58', s: IG, w: 1.2 }) + P(gridD(16), { s: IACC, w: 1 });
  s += Rc(184, 30, 120, 120, { f: '#fff', s: IG3 }) + P(gridD(184), { s: IACC, w: 1 });
  s += `<clipPath id="${u}h"><rect x="184" y="30" width="80" height="120"/></clipPath><g clip-path="url(#${u}h)">${bird(184, 30, 1, { w: 1.8 })}</g>`;
  return s + Ar(142, 90, 178, 90, IACC) + T(76, 172, 'Reference', 'middle') + T(244, 172, 'Your drawing', 'middle');
}];

/* ---------- shading and tone ---------- */
IL.value = ['A nine-step value scale from white to black above a smooth gradient.', u => {
  let s = `<defs>${lgrad(u + 'g', [[0, '#FFFFFF'], [1, '#1E1D22']])}</defs>`;
  for (let i = 0; i < 9; i++) s += Rc(16 + i * 32, 40, 32, 64, { f: grey(Math.round(252 - (i * 222) / 8)), s: IG3, w: 0.6 }) + T(32 + i * 32, 32, i + 1, 'middle', { s: 12 });
  s += Rc(16, 122, 288, 32, { f: `url(#${u}g)`, s: IG3, w: 0.6 });
  return s + T(16, 178, 'Lightest', 'start') + T(304, 178, 'Darkest', 'end');
}];
IL.sphere = ['A sphere lit from the upper left showing highlight, light, core shadow, reflected light, cast shadow and the dark occlusion shadow where it touches the table.', u => {
  let s = `<defs>${rgradU(u + 's', [[0, '#FFFFFF'], [0.18, '#EFEDEA'], [0.45, '#BDB9BF'], [0.64, '#86828B'], [0.77, '#3D3A43'], [0.9, '#5E5A64'], [1, '#4C4952']], 118, 74, 87, 112, 68)}${rgrad(u + 'c', [[0, '#2B2A2E', 0.7], [0.65, '#2B2A2E', 0.28], [1, '#2B2A2E', 0]])}</defs>`;
  s += Ln(8, 152, 312, 152, 1, IG4) + E(200, 155, 86, 14, { f: `url(#${u}c)` }) + E(142, 151.5, 28, 3.5, { f: IG, x: ' opacity=".75"' }) + C(140, 96, 56, { f: `url(#${u}s)` });
  s += sun(28, 28) + Ar(42, 40, 92, 66, ISIE);
  s += lead(214, 40, 121, 77, 'Highlight') + lead(214, 70, 160, 92, 'Light') + lead(214, 100, 172, 113, 'Core shadow') + lead(214, 126, 185, 120, 'Reflected light') + lead(238, 186, 238, 158, 'Cast shadow') + lead(40, 186, 130, 152, 'Occlusion shadow');
  return s;
}];
IL.hatch = ['Four squares of hatching, from widely spaced lines on the left to tightly packed lines on the right.', u => {
  let s = '';
  [10, 6.5, 4.2, 2.6].forEach((g, i) => { const x = 16 + i * 74; s += `<clipPath id="${u}${i}"><rect x="${x}" y="30" width="66" height="76" rx="4"/></clipPath><path d="${hatchD(x, 30, 66, 76, -50, g, 11 + i)}" stroke="${IG}" stroke-width="1.2" clip-path="url(#${u}${i})"/>`; });
  return s + Ar(16, 128, 300, 128, IACC) + T(16, 150, 'Light', 'start') + T(304, 150, 'Dark', 'end') + T(160, 184, 'Same direction, closer lines = darker tone', 'middle', { s: 12, w: 400 });
}];
IL.crosshatch = ['Four squares showing one, two, three and four layers of cross-hatching in different directions.', u => {
  let s = '';
  const angs = [-50, 40, 0, 90];
  for (let i = 0; i < 4; i++) {
    const x = 16 + i * 74;
    s += `<clipPath id="${u}${i}"><rect x="${x}" y="30" width="66" height="76" rx="4"/></clipPath><g clip-path="url(#${u}${i})">`;
    for (let k = 0; k <= i; k++) s += `<path d="${hatchD(x, 30, 66, 76, angs[k], 6, 20 + i * 4 + k)}" stroke="${IG}" stroke-width="1.1"/>`;
    s += '</g>' + T(x + 33, 128, `${i + 1} layer${i ? 's' : ''}`, 'middle', { s: 12 });
  }
  return s + T(160, 178, 'Add a new direction for each darker value', 'middle', { s: 12, w: 400 });
}];
IL.stipple = ['Three squares of stippling from sparse to dense dots, and a sphere stippled more densely on its shadow side.', u => {
  let s = '';
  [0.08, 0.3, 0.75].forEach((v, i) => { s += dots(dotsD(16, 24 + i * 56, 60, 44, Math.round(v * 260), () => 1, 5 + i), 2.2); });
  const cx = 210, cy = 96, r = 66;
  s += dots(dotsD(cx - r, cy - r, 2 * r, 2 * r, 900, (x, y) => { const dd = Math.hypot(x - cx, y - cy); if (dd > r) return 0; const l = Math.hypot(x - (cx - 30), y - (cy - 30)) / (r * 1.7); return Math.min(1, Math.max(0.02, l * l * 1.6)); }, 9), 2.1);
  return s + E(cx + 26, cy + r + 4, 56, 8, { f: IG, x: ' opacity=".18"' }) + T(46, 196, 'More dots = darker', 'middle', { s: 12 });
}];
IL.circulism = ['Shading built from tiny overlapping circles, light to dark, and an egg shaded with them.', () => {
  let s = '';
  [0.12, 0.35, 0.8].forEach((v, i) => { s += P(loopsD(16, 24 + i * 56, 60, 44, Math.round(v * 140), () => 1, 7 + i, 3), { w: 0.8 }); });
  const cx = 212, cy = 98;
  s += P(loopsD(140, 26, 150, 150, 560, (x, y) => { const q = ((x - cx) / 56) ** 2 + ((y - cy) / 72) ** 2; if (q > 1) return 0; const l = Math.hypot(x - (cx - 26), y - (cy - 34)) / 130; return Math.min(1, 0.04 + l * l * 2.4); }, 13, 3.2), { w: 0.75 });
  return s + E(cx, cy, 56, 72, { w: 1 }) + T(46, 196, 'Small, light, overlapping loops', 'middle', { s: 12 });
}];
IL.blend = ['A gradient drawn in pencil layers, the same gradient blended smooth, and a paper blending stump.', u => {
  let s = `<defs>${lgrad(u + 'g', [[0, '#FFFFFF'], [1, '#2A292E']])}</defs><clipPath id="${u}c"><rect x="16" y="30" width="220" height="44" rx="4"/></clipPath><g clip-path="url(#${u}c)">`;
  for (let i = 0; i < 6; i++) s += `<path d="${hatchD(16 + i * 37, 30, 37 + 4, 44, -60 + (i % 2) * 20, 9 - i * 1.3, 30 + i, 0.8)}" stroke="${IG}" stroke-width="1.1"/>`;
  s += '</g>' + Rc(16, 96, 220, 44, { f: `url(#${u}g)`, r: 4 });
  s += `<g transform="rotate(-35 280 100)">${P('M272 40h16v100l-8 20-8 -20z', { f: '#EFE8DA', s: IG, w: 1.4 })}${P('M272 140l8 20 8 -20', { f: '#8D8892', s: IG, w: 1 })}</g>`;
  return s + T(16, 24, 'Pencil layers', 'start', { s: 12 }) + T(16, 160, 'Blended', 'start', { s: 12 }) + T(160, 190, 'Blend gently, then lift highlights with an eraser', 'middle', { s: 12, w: 400 });
}];
IL.contourhatch = ['Curved hatching lines that wrap around a cylinder and a sphere, closer together on the shadow side.', () => {
  let s = E(80, 40, 40, 10) + P('M40 40v116a40 10 0 0 0 80 0V40');
  for (let i = 0; i < 12; i++) { const y = 54 + i * 9.5; s += P(`M${40 + 4} ${y}a40 10 0 0 0 ${76} 0`, { w: 0.9 }); }
  for (let i = 0; i < 10; i++) { const x = 92 + i * 3; s += P(`M${x} ${44 + i}V${162}`, { w: 0.8 }); }
  const cx = 220, cy = 100, r = 62;
  s += C(cx, cy, r);
  for (let i = -6; i <= 6; i++) { const y = cy + i * 9; const rx = Math.sqrt(Math.max(0, r * r - (y - cy) ** 2)); if (rx < 6) continue; s += P(`M${f1(cx - rx)} ${y}a${f1(rx)} ${f1(rx * 0.28)} 0 0 0 ${f1(2 * rx)} 0`, { w: 0.9 }); }
  for (let i = 0; i < 8; i++) { const a = -0.15 + i * 0.12, rx = r * Math.sin(a + 0.5); s += P(`M${cx} ${cy - r}a${f1(Math.abs(rx))} ${r} 0 0 1 0 ${2 * r}`, { w: 0.8 }); }
  return s + T(160, 194, 'Lines follow the surface, like bands around the form', 'middle', { s: 12, w: 400 });
}];
IL.subtract = ['Paper toned dark with charcoal, with a pear shape lifted out in light tones using an eraser.', u => {
  let s = `<defs>${grain(u + 'n')}${rgradU(u + 'l', [[0, '#F4F1EC'], [0.5, '#BDB8B0'], [1, '#504C55', 0]], 140, 100, 70, 126, 84)}</defs>`;
  s += Rc(16, 16, 250, 168, { f: '#3A383F', r: 6 }) + Rc(16, 16, 250, 168, { f: '#000', x: ` filter="url(#${u}n)" opacity=".5"` });
  s += P('M140 44c14 0 18 14 16 26 22 10 34 40 26 64-8 22-30 30-50 26-24-4-40-26-34-52 4-18 16-30 26-36-2-14 2-28 16-28z', { f: `url(#${u}l)` });
  s += P('M286 150c-16 4-26 -6-22 -18 4 -12 22 -16 30 -6 8 10 4 20-8 24z', { f: '#9C969F', s: IG, w: 1.2 }) + Ar(266, 130, 194, 98, '#FFFFFF');
  return s + T(16, 198, 'Tone the paper, then lift out the lights', 'start', { s: 12 });
}];
IL.cast = ['A cube and a sphere lit from the left, with cast shadows that are darkest where they touch and soften with distance.', u => {
  let s = `<defs>${lgrad(u + 'g', [[0, '#2B2A2E', 0.7], [1, '#2B2A2E', 0.08]])}${lgrad(u + 'f', [[0, '#2B2A2E', 0.65], [1, '#2B2A2E', 0.05]])}${rgradU(u + 's', [[0, '#FFFFFF'], [0.5, '#C9C5CB'], [0.8, '#57535C'], [1, '#6A6670']], 196, 92, 60, 190, 86)}</defs>`;
  s += Ln(8, 160, 312, 160, 1, IG4);
  s += poly([[60, 160], [100, 160], [180, 182], [118, 182]], { f: `url(#${u}g)` }) + poly([[40, 104], [80, 104], [100, 90], [60, 90]], { f: '#F2F0ED', s: IG, w: 1.2 }) + poly([[40, 104], [80, 104], [80, 160], [40, 160]], { f: '#C6C2C8', s: IG, w: 1.2 }) + poly([[80, 104], [100, 90], [100, 146], [80, 160]], { f: '#6F6B74', s: IG, w: 1.2 });
  s += E(262, 168, 52, 10, { f: `url(#${u}f)` }) + E(214, 159.5, 18, 3, { f: IG, x: ' opacity=".8"' }) + C(214, 124, 36, { f: `url(#${u}s)` });
  s += sun(22, 26) + Ar(34, 36, 60, 60, ISIE);
  return s + lead(150, 40, 96, 162, 'Darkest where it touches') + lead(296, 120, 296, 166, 'Softer further away', 'end');
}];
IL.chiaro = ['A pear lit by a single candle against a deep dark background, so the light side glows and the shadow side melts into the dark.', u => {
  let s = `<defs>${rgradU(u + 'b', [[0, '#5A4A3A'], [0.4, '#2A2420'], [1, '#121114']], 70, 120, 220)}${rgradU(u + 'p', [[0, '#F6E7C8'], [0.35, '#C9A46A'], [0.62, '#5C4630'], [0.85, '#1E1A17'], [1, '#141215']], 150, 110, 80, 140, 100)}${rgrad(u + 'f', [[0, '#FFF5C8'], [0.5, '#F7C04A'], [1, '#F7C04A', 0]])}</defs>`;
  s += Rc(0, 0, 320, 200, { f: `url(#${u}b)`, r: 10 });
  s += Rc(54, 120, 20, 50, { f: '#E9DFCB' }) + E(64, 108, 14, 22, { f: `url(#${u}f)` }) + P('M64 96c-6 8-6 16 0 22 6-6 6-14 0-22z', { f: '#FFE9A0' });
  s += P('M190 48c12 0 16 12 14 22 22 10 34 42 24 68-8 22-32 30-52 26-26-4-42-28-34-54 4-18 16-30 28-36-2-14 4-26 20-26z', { f: `url(#${u}p)` }) + E(196, 168, 54, 6, { f: '#000', x: ' opacity=".5"' });
  return s + T(16, 192, 'One strong light, deep darks', 'start', { s: 12, c: '#EDE6DA' });
}];
IL.textures = ['Four texture samples: wood grain, fur, shiny metal and clear glass.', u => {
  let s = '';
  const box = (i, inner) => { const x = 16 + i * 74; return `<clipPath id="${u}${i}"><rect x="${x}" y="30" width="66" height="76" rx="6"/></clipPath><g clip-path="url(#${u}${i})">${inner(x)}</g>${Rc(x, 30, 66, 76, { r: 6, s: IG3, w: 0.8 })}`; };
  s += box(0, x => { let d = ''; for (let k = 0; k < 12; k++) d += `M${x} ${36 + k * 6}c16 ${k % 3 ? 4 : -4} 30 ${k % 2 ? -6 : 6} 66 0`; return P(d, { s: '#6B4E32', w: 1.2 }) + E(x + 40, 70, 7, 4, { s: '#6B4E32', w: 1.4 }); });
  s += box(1, x => { const r = rng(4); let d = ''; for (let k = 0; k < 170; k++) { const px = x + r() * 66, py = 30 + r() * 76; d += `M${f1(px)} ${f1(py)}q2 6 ${f1(1 + r() * 2)} ${f1(8 + r() * 5)}`; } return P(d, { s: '#5C4A3C', w: 1 }); });
  s += box(2, x => `<defs>${lgrad(u + 'm', [[0, '#3E3C44'], [0.3, '#F7F7F7'], [0.42, '#8A8790'], [0.6, '#2D2B31'], [0.75, '#D9D7DC'], [1, '#55525A']])}</defs>${Rc(x, 30, 66, 76, { f: `url(#${u}m)` })}`);
  s += box(3, x => Rc(x, 30, 66, 76, { f: '#EEF3F6' }) + P(`M${x + 18} 40h30v58h-30z`, { s: '#7A8D99', w: 1.2 }) + P(`M${x + 22} 46v40`, { s: '#FFFFFF', w: 4 }) + P(`M${x + 42} 50v20`, { s: '#A9BAC4', w: 2 }));
  return s + T(49, 128, 'Wood', 'middle') + T(123, 128, 'Fur', 'middle') + T(197, 128, 'Metal', 'middle') + T(271, 128, 'Glass', 'middle') + T(160, 176, 'Texture comes from the marks you choose', 'middle', { s: 12, w: 400 });
}];

/* ---------- perspective and space ---------- */
IL.p1 = ['One-point perspective: a road and a box whose edges all lead to a single vanishing point on the horizon.', () => {
  const vp = [160, 78];
  let s = Ln(8, 78, 312, 78, 1.2, IACC) + C(vp[0], vp[1], 3.5, { f: ISIE });
  s += P(`M30 198L${vp[0]} ${vp[1]}M290 198L${vp[0]} ${vp[1]}`, { w: 1.6 }) + P(`M160 198L${vp[0]} ${vp[1]}`, { w: 1.4, x: ' stroke-dasharray="10 9"' });
  const f = [[40, 112], [96, 112], [96, 160], [40, 160]], k = 0.38, b = f.map(([x, y]) => [x + (vp[0] - x) * k, y + (vp[1] - y) * k]);
  s += P(f.map((p, i) => `M${f1(p[0])} ${f1(p[1])}L${f1(vp[0])} ${vp[1]}`).join(''), { s: IACC, w: 0.8, x: dash });
  s += poly([f[0], f[1], b[1], b[0]], { f: '#F2F0ED', w: 1.4 }) + poly([f[1], b[1], b[2], f[2]], { f: '#B9B5BC', w: 1.4 }) + poly(f, { f: '#E3E0E5', w: 1.6 });
  return s + T(312, 70, 'Horizon line (eye level)', 'end', { s: 12 }) + T(160, 64, 'Vanishing point', 'middle', { s: 12, c: ISIE });
}];
IL.p2 = ['Two-point perspective: a box seen from its corner, with edges going to two vanishing points on the horizon.', () => {
  const v1 = [12, 70], v2 = [308, 70], t = [160, 96], b = [160, 168];
  const L = (p, v, k) => [p[0] + (v[0] - p[0]) * k, p[1] + (v[1] - p[1]) * k];
  const tl = L(t, v1, 0.34), bl = L(b, v1, 0.34), tr = L(t, v2, 0.3), br = L(b, v2, 0.3), back = inter(tl, v2, tr, v1);
  let s = Ln(4, 70, 316, 70, 1.2, IACC) + C(v1[0], v1[1], 3.5, { f: ISIE }) + C(v2[0], v2[1], 3.5, { f: ISIE });
  s += P(`M${t[0]} ${t[1]}L${v1[0]} ${v1[1]}M${b[0]} ${b[1]}L${v1[0]} ${v1[1]}M${t[0]} ${t[1]}L${v2[0]} ${v2[1]}M${b[0]} ${b[1]}L${v2[0]} ${v2[1]}`, { s: IACC, w: 0.8, x: dash });
  s += poly([t, tl, back, tr], { f: '#F2F0ED', w: 1.4 }) + poly([t, tl, bl, b], { f: '#D9D6DC', w: 1.4 }) + poly([t, tr, br, b], { f: '#8F8B94', w: 1.4 });
  return s + T(12, 58, 'VP 1', 'start', { s: 12, c: ISIE }) + T(308, 58, 'VP 2', 'end', { s: 12, c: ISIE }) + T(160, 196, 'Vertical edges stay vertical', 'middle', { s: 12, w: 400 });
}];
IL.p3 = ['Three-point perspective: a tall building seen from below, its sides tapering up towards a third vanishing point.', () => {
  const v1 = [8, 176], v2 = [312, 176], v3 = [160, -120], b = [160, 170], top = [160, 34];
  const L = (p, v, k) => [p[0] + (v[0] - p[0]) * k, p[1] + (v[1] - p[1]) * k];
  const bl = L(b, v1, 0.36), br = L(b, v2, 0.36), tl = inter(top, v1, bl, v3), tr = inter(top, v2, br, v3);
  let s = Ln(4, 176, 316, 176, 1.2, IACC) + C(v1[0], v1[1], 3.5, { f: ISIE }) + C(v2[0], v2[1], 3.5, { f: ISIE });
  s += P(`M${f1(bl[0])} ${f1(bl[1])}L${f1(tl[0] + (tl[0] - bl[0]) * 0.6)} ${f1(tl[1] + (tl[1] - bl[1]) * 0.6)}M${f1(br[0])} ${f1(br[1])}L${f1(tr[0] + (tr[0] - br[0]) * 0.6)} ${f1(tr[1] + (tr[1] - br[1]) * 0.6)}`, { s: IACC, w: 0.8, x: dash });
  s += poly([b, bl, tl, top], { f: '#D9D6DC', w: 1.4 }) + poly([b, br, tr, top], { f: '#8F8B94', w: 1.4 });
  for (let i = 1; i < 6; i++) { const k = i / 6; const a = L(b, top, k), l = inter(a, v1, bl, tl), r = inter(a, v2, br, tr); s += P(`M${f1(l[0])} ${f1(l[1])}L${f1(a[0])} ${f1(a[1])}L${f1(r[0])} ${f1(r[1])}`, { w: 0.8 }); }
  return s + Ar(160, 30, 160, 8, ISIE) + T(170, 16, 'Third VP high above', 'start', { s: 12, c: ISIE });
}];
IL.atmos = ['Layers of hills that get paler, bluer and less detailed as they go into the distance.', u => {
  let s = `<defs>${lgrad(u + 's', [[0, '#C9DAEB'], [1, '#F4F1EA']], 0, 0, 0, 1)}</defs>` + Rc(0, 0, 320, 200, { f: `url(#${u}s)`, r: 10 });
  s += P('M0 96c40-20 70-26 110-12s70 6 100-10 70-14 110 4V200H0z', { f: '#C3CCDA' }) + P('M0 120c30-14 70-20 110-6s80 10 120-8 60-6 90 2V200H0z', { f: '#93A0B6' });
  s += P('M0 146c40-12 80-14 130-2s90 6 120-6 50-2 70 4V200H0z', { f: '#5F6E7E' }) + P('M0 172c50-10 90-8 140 0s110 4 180-6V200H0z', { f: '#3C4330' });
  for (let i = 0; i < 6; i++) { const x = 20 + i * 18; s += P(`M${x} 180l6-22 6 22z`, { f: '#2C3326' }); }
  return s + T(312, 30, 'Far: paler, cooler, softer', 'end', { s: 12 }) + T(312, 194, 'Near: darker, warmer, detailed', 'end', { s: 12, c: '#F4F1EA' });
}];
IL.overlap = ['Three trees showing depth: the front one overlaps, the others are smaller and higher up the page.', () => {
  const tree = (x, y, k, f) => P(`M${x} ${y}v${-40 * k}`, { s: '#6B4E32', w: 6 * k }) + C(x, y - 54 * k, 26 * k, { f, s: IG, w: 1.2 });
  let s = Ln(8, 120, 312, 120, 1, IG4) + tree(250, 126, 0.55, '#A9C08D') + tree(196, 148, 0.8, '#7FA05E') + tree(130, 192, 1.25, '#4E7A3A');
  return s + T(20, 40, 'Overlap', 'start', { c: IACC }) + T(292, 56, 'Smaller and higher', 'end', { c: IACC }) + Ar(84, 44, 104, 96, IACC) + Ar(268, 62, 252, 80, IACC);
}];
IL.foreshort = ['A cylinder pointing towards the viewer: the far end is small, and the near end is large and overlaps the rest.', () => {
  let s = '';
  const seg = [[60, 50, 12], [96, 72, 20], [140, 100, 30], [196, 132, 44]];
  s += P('M60 38L196 88M60 62L196 176', { w: 1.2, x: dash, s: IACC });
  seg.forEach(([x, y, r], i) => { s += E(x, y, r * 0.8, r, { f: grey(230 - i * 22), w: 1.4 }); });
  s += E(196, 132, 35, 44, { f: '#EDEBE8', w: 2 });
  return s + T(20, 26, 'Far end: small', 'start', { s: 12 }) + T(300, 190, 'Near end: big and in front', 'end', { s: 12 });
}];
IL.ellipse = ['A glass showing ellipses that are thin near eye level and rounder further below it.', () => {
  let s = Ln(8, 40, 312, 40, 1.2, IACC) + T(312, 32, 'Eye level', 'end', { s: 12, c: IACC });
  const ys = [[44, 3], [84, 10], [124, 17], [168, 24]];
  ys.forEach(([y, ry]) => { s += E(160, y, 62, ry, { w: 1.2, x: y === 44 || y === 168 ? '' : dash }); });
  s += P('M98 44V168M222 44V168', { w: 1.6 });
  return s + T(20, 120, 'Rounder further from eye level', 'start', { s: 12 });
}];
