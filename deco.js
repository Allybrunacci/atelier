/* Atelier — decoration: Dot the paint blob, painted splashes, doodles, therapy illustrations and little celebrations.
   Everything here is drawn by code and marked aria-hidden; meaning is always carried by text next to it. */
'use strict';

const r1 = n => Math.round(n * 10) / 10;
// A soft, hand-made closed shape through n wobbly points (Catmull-Rom turned into Bézier curves).
function blobD(cx, cy, r, seed, wob = 0.16, n = 9, ry) {
  const R = rng(String(seed)), pts = [], k = (ry || r) / r;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + (R() - 0.5) * 0.35, rr = r * (1 - wob + R() * wob * 2);
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * k]);
  }
  let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    d += `C${r1(p1[0] + (p2[0] - p0[0]) / 6)} ${r1(p1[1] + (p2[1] - p0[1]) / 6)} ${r1(p2[0] - (p3[0] - p1[0]) / 6)} ${r1(p2[1] - (p3[1] - p1[1]) / 6)} ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return `${d}Z`;
}
const svgOpen = (cls, vb) => `<svg class="${cls}" viewBox="${vb}" aria-hidden="true" focusable="false">`;

/* ---------- Dot ---------- */
const DOT_BODY = blobD(60, 70, 37, 'dot-body', 0.06, 10);
const DOT_HI = blobD(45, 55, 10, 'dot-hi', 0.12, 7);
const DOT_FACES = {
  happy: '<ellipse class="d-ink" cx="48" cy="66" rx="3.6" ry="4.6"/><ellipse class="d-ink" cx="72" cy="66" rx="3.6" ry="4.6"/><circle class="d-hi" cx="49.4" cy="64.2" r="1.3" style="opacity:1"/><circle class="d-hi" cx="73.4" cy="64.2" r="1.3" style="opacity:1"/><path class="d-line" d="M54 77q6 6 12 0"/>',
  calm: '<path class="d-line" d="M43 66q5 4.5 10 0M67 66q5 4.5 10 0"/><path class="d-line" d="M56 78q4 3 8 0"/>',
  proud: '<path class="d-line" d="M43 68q5-6 10 0M67 68q5-6 10 0"/><path class="d-ink" d="M52.5 76q7.5 9 15 0q-7.5 3-15 0z"/>',
  wow: '<ellipse class="d-ink" cx="48" cy="65" rx="4.3" ry="5.6"/><ellipse class="d-ink" cx="72" cy="65" rx="4.3" ry="5.6"/><circle class="d-hi" cx="49.6" cy="62.8" r="1.5" style="opacity:1"/><circle class="d-hi" cx="73.6" cy="62.8" r="1.5" style="opacity:1"/><ellipse class="d-ink" cx="60" cy="80" rx="3.4" ry="4.2"/>',
  sleepy: '<path class="d-line" d="M43 67h10M67 67h10"/><path class="d-line" d="M57 79q3 2 6 0"/><path class="d-line" d="M92 36h7l-7 8h7M102 26h5l-5 6h5"/>',
};
// mood: happy, calm, proud, wow or sleepy. o.wave adds a waving arm, o.brush a paintbrush.
function dotArt(mood = 'happy', cls = '', o = {}) {
  const arms = (o.wave ? '<path class="d-line" d="M25 74q-8-3-10-13"/>' : '<path class="d-line" d="M25 78q-6 3-8 9"/>')
    + (o.brush ? '<path d="M96 80q8-1 11-8" class="d-line"/><path d="M104 79l9-18" stroke="#8C6A4A" stroke-width="3.4" stroke-linecap="round"/><path class="d-paint" d="M112 62q3-9 7-10q1 7-3 11z" fill="#F59AB5"/>' : '<path class="d-line" d="M95 78q6 3 8 9"/>');
  return `${svgOpen(`dot${cls ? ' ' + cls : ''}`, '0 0 120 120')}<ellipse class="d-shadow" cx="60" cy="111" rx="30" ry="4.5"/>
    <g class="dot-body">${arms}
      <ellipse class="d-fill" cx="48" cy="103" rx="8" ry="5"/><ellipse class="d-line" cx="48" cy="103" rx="8" ry="5"/>
      <ellipse class="d-fill" cx="72" cy="103" rx="8" ry="5"/><ellipse class="d-line" cx="72" cy="103" rx="8" ry="5"/>
      <path class="d-fill" d="${DOT_BODY}"/><path class="d-hi" d="${DOT_HI}"/><path class="d-line" d="${DOT_BODY}"/>
      <g transform="rotate(-8 60 36)"><path class="d-beret" d="M29 41C28 29 55 21 80 26C93 29 95 38 86 42C73 47 40 48 29 41Z"/><path class="d-line" d="M62 23q2-5 0-8"/><circle class="d-ink" cx="62" cy="13.5" r="2.4"/></g>
      <ellipse class="d-cheek" cx="40" cy="76" rx="6" ry="3.6"/><ellipse class="d-cheek" cx="80" cy="76" rx="6" ry="3.6"/>
      ${DOT_FACES[mood] || DOT_FACES.happy}</g></svg>`;
}
const EMPTY_MOOD = { warn: 'wow', search: 'wow', image: 'happy', camera: 'happy', users: 'happy', calendar: 'sleepy', money: 'calm', star: 'happy', heart: 'calm', plan: 'proud' };

/* ---------- a painted splash behind the page title ---------- */
function splash(seed) {
  const R = rng(`splash:${seed}`), cls = ['s1', 's2', 's3', 's4', 's5', 's6'];
  for (let i = cls.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [cls[i], cls[j]] = [cls[j], cls[i]]; }
  return `${svgOpen('splash', '0 0 172 124')}
    <path class="${cls[0]}" d="${blobD(116, 52, 44, `${seed}a`, 0.2, 9)}"/>
    <path class="${cls[0]} sw2" d="${blobD(108, 58, 30, `${seed}b`, 0.25, 8)}"/>
    <path class="${cls[1]}" d="${blobD(154, 24, 15, `${seed}c`, 0.25, 7)}"/>
    <path class="${cls[2]}" d="${blobD(70, 22, 10, `${seed}d`, 0.3, 7)}"/>
    <circle class="${cls[1]}" cx="${r1(80 + R() * 10)}" cy="${r1(96 + R() * 8)}" r="5"/><circle class="${cls[2]}" cx="${r1(150 - R() * 8)}" cy="${r1(98 + R() * 6)}" r="3.5"/>
  </svg>`;
}

/* ---------- small doodles ---------- */
const DOODLES = {
  sparkle: '<path d="M12 2.5c.9 4.6 3 6.7 7.6 7.6-4.6.9-6.7 3-7.6 7.6-.9-4.6-3-6.7-7.6-7.6 4.6-.9 6.7-3 7.6-7.6z"/>',
  heart: '<path d="M12 20s-7.5-4.6-9-9.3C2 7.4 4.2 4.5 7.3 4.5c2 0 3.6 1.1 4.7 2.8 1.1-1.7 2.7-2.8 4.7-2.8 3.1 0 5.3 2.9 4.3 6.2-1.5 4.7-9 9.3-9 9.3z"/>',
  swirl: '<path d="M12 12c0-1.5 1.8-2 2.8-1 1.4 1.4.4 4-1.8 4.2-3 .3-5-2.6-4-5.4C10 7 13.5 5.6 16.4 6.6c3.6 1.2 5 5.6 3.2 9"/>',
  squiggle: '<path d="M2 14c3-6 5-6 7 0s4 6 7 0 4-6 6-2"/>',
};
const doodle = (kind, cls = '') => `<svg class="doodle${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${DOODLES[kind] || ''}</svg>`;

/* ---------- therapy illustrations (160 × 110) ---------- */
const heartD = (x, y, s) => `M${x} ${r1(y + 8 * s)}c${r1(-7 * s)} ${r1(-4.6 * s)} ${r1(-11 * s)} ${r1(-8.4 * s)} ${r1(-11 * s)} ${r1(-12.6 * s)}c0 ${r1(-3.6 * s)} ${r1(2.6 * s)} ${r1(-6 * s)} ${r1(5.8 * s)} ${r1(-6 * s)}c${r1(2.3 * s)} 0 ${r1(4.2 * s)} ${r1(1.4 * s)} ${r1(5.2 * s)} ${r1(3.3 * s)}c${r1(1 * s)} ${r1(-1.9 * s)} ${r1(2.9 * s)} ${r1(-3.3 * s)} ${r1(5.2 * s)} ${r1(-3.3 * s)}c${r1(3.2 * s)} 0 ${r1(5.8 * s)} ${r1(2.4 * s)} ${r1(5.8 * s)} ${r1(6 * s)}c0 ${r1(4.2 * s)} ${r1(-4 * s)} ${r1(8 * s)} ${r1(-11 * s)} ${r1(12.6 * s)}z`;
const starD = (x, y, r) => { let d = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r; d += `${i ? 'L' : 'M'}${r1(x + Math.cos(a) * rr)} ${r1(y + Math.sin(a) * rr)}`; } return `${d}Z`; };
const sparkD = (x, y, s) => `M${x} ${r1(y - 9 * s)}c${r1(0.7 * s)} ${r1(3.8 * s)} ${r1(2.4 * s)} ${r1(5.5 * s)} ${r1(6.3 * s)} ${r1(6.3 * s)}c${r1(-3.9 * s)} ${r1(0.8 * s)} ${r1(-5.6 * s)} ${r1(2.5 * s)} ${r1(-6.3 * s)} ${r1(6.3 * s)}c${r1(-0.7 * s)} ${r1(-3.8 * s)} ${r1(-2.4 * s)} ${r1(-5.5 * s)} ${r1(-6.3 * s)} ${r1(-6.3 * s)}c${r1(3.9 * s)} ${r1(-0.8 * s)} ${r1(5.6 * s)} ${r1(-2.5 * s)} ${r1(6.3 * s)} ${r1(-6.3 * s)}z`;
const sunG = (x, y, r) => `<circle class="a-b a-o" cx="${x}" cy="${y}" r="${r}"/>${[0, 1, 2, 3, 4, 5, 6, 7].map(i => { const a = (i * Math.PI) / 4; return `<path class="a-thin" d="M${r1(x + Math.cos(a) * (r + 4))} ${r1(y + Math.sin(a) * (r + 4))}L${r1(x + Math.cos(a) * (r + 9))} ${r1(y + Math.sin(a) * (r + 9))}"/>`; }).join('')}`;
const cloudD = (x, y, s = 1) => `M${x} ${y}q${r1(-14 * s)} 0 ${r1(-14 * s)} ${r1(-12 * s)}q0 ${r1(-13 * s)} ${r1(15 * s)} ${r1(-12 * s)}q${r1(4 * s)} ${r1(-16 * s)} ${r1(22 * s)} ${r1(-14 * s)}q${r1(14 * s)} ${r1(1 * s)} ${r1(17 * s)} ${r1(14 * s)}q${r1(16 * s)} ${r1(-2 * s)} ${r1(17 * s)} ${r1(12 * s)}q${r1(1 * s)} ${r1(12 * s)} ${r1(-14 * s)} ${r1(12 * s)}z`;
const dropD = (x, y, s = 1) => `M${x} ${r1(y - 7 * s)}q${r1(5 * s)} ${r1(6 * s)} ${r1(5 * s)} ${r1(9 * s)}a${r1(5 * s)} ${r1(5 * s)} 0 0 1 ${r1(-10 * s)} 0q0 ${r1(-3 * s)} ${r1(5 * s)} ${r1(-9 * s)}z`;
const leafD = (x, y, len, ang) => { const a = (ang * Math.PI) / 180, ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len, nx = -Math.sin(a) * len * 0.32, ny = Math.cos(a) * len * 0.32, mx = (x + ex) / 2, my = (y + ey) / 2; return `M${r1(x)} ${r1(y)}Q${r1(mx + nx)} ${r1(my + ny)} ${r1(ex)} ${r1(ey)}Q${r1(mx - nx)} ${r1(my - ny)} ${r1(x)} ${r1(y)}Z`; };
const leafG = (x, y, len, ang, cls = 'a-m') => { const a = (ang * Math.PI) / 180; return `<path class="${cls} a-o" d="${leafD(x, y, len, ang)}"/><path class="a-thin" d="M${r1(x)} ${r1(y)}L${r1(x + Math.cos(a) * len * 0.85)} ${r1(y + Math.sin(a) * len * 0.85)}"/>`; };
const flowerG = (x, y, r, cls = 'a-p') => `${[0, 1, 2, 3, 4].map(i => { const a = (i * 2 * Math.PI) / 5 - Math.PI / 2; return `<circle class="${cls} a-o" cx="${r1(x + Math.cos(a) * r)}" cy="${r1(y + Math.sin(a) * r)}" r="${r1(r * 0.78)}"/>`; }).join('')}<circle class="a-b a-o" cx="${x}" cy="${y}" r="${r1(r * 0.62)}"/>`;
const faceG = (x, y, s = 1) => `<circle class="a-dot" cx="${r1(x - 5 * s)}" cy="${y}" r="${r1(1.6 * s)}"/><circle class="a-dot" cx="${r1(x + 5 * s)}" cy="${y}" r="${r1(1.6 * s)}"/><path class="a-thin" d="M${r1(x - 3.5 * s)} ${r1(y + 4.5 * s)}q${r1(3.5 * s)} ${r1(3.5 * s)} ${r1(7 * s)} 0"/>`;
const personG = (x, y, cls) => `<path class="${cls} a-o" d="M${x - 11} ${y + 36}q1-22 11-22q10 0 11 22z"/><circle class="a-w a-o" cx="${x}" cy="${y}" r="9"/>${faceG(x, y + 1, 0.6)}`;

const TART = {
  calm: () => `<path class="a-thin" d="M24 92q56-14 112 0M40 101q40-8 80 0"/><ellipse class="a-w a-o" cx="80" cy="82" rx="28" ry="10"/><ellipse class="a-m a-o" cx="80" cy="66" rx="20" ry="8.5"/><ellipse class="a-b a-o" cx="81" cy="52" rx="12.5" ry="6.5"/>${leafG(110, 34, 32, -28)}${faceG(80, 82, 0.7)}`,
  worry: () => `${sunG(122, 30, 10)}<path class="a-w a-o" d="${cloudD(62, 64, 1.15)}"/>${faceG(80, 54, 0.8)}<path class="a-s a-o" d="${dropD(62, 84)}"/><path class="a-s a-o" d="${dropD(80, 94, 0.9)}"/><path class="a-p a-o" d="${heartD(99, 80, 0.55)}"/>`,
  feel: () => `<path class="a-p a-o" d="${heartD(64, 34, 1.5)}"/><path class="a-e a-o" d="${heartD(108, 54, 1.05)}" transform="rotate(12 108 60)"/><path class="a-l a-o" d="${heartD(40, 70, 0.8)}" transform="rotate(-14 40 74)"/><path class="a-thin" d="M118 30l6-6M124 38h8M88 92l4 8M28 50l-6-4"/>`,
  self: () => `<rect class="a-e a-o" x="66" y="78" width="12" height="26" rx="5"/><ellipse class="a-w a-o" cx="72" cy="48" rx="28" ry="32"/><ellipse class="a-l" cx="72" cy="48" rx="20" ry="24"/>${faceG(72, 46, 1.1)}<path class="a-b a-o" d="${sparkD(112, 30, 1.4)}"/><path class="a-p a-o" d="${sparkD(122, 62, 0.8)}"/>`,
  connect: () => `<path class="a-thin" d="M48 66q16 8 32 0q16 8 32 0"/>${personG(40, 44, 'a-p')}${personG(80, 40, 'a-b')}${personG(120, 44, 'a-m')}<path class="a-p a-o" d="${heartD(80, 8, 0.45)}"/>`,
  mind: () => `<path d="M80 18a36 36 0 1 1-27 12" fill="none" stroke="var(--il-ink)" stroke-width="7" stroke-linecap="round" opacity=".85"/><circle class="a-b a-o" cx="80" cy="54" r="9"/><circle class="a-dot" cx="46" cy="96" r="2.5"/><circle class="a-dot" cx="58" cy="100" r="2"/><circle class="a-dot" cx="120" cy="22" r="2.4"/>${leafG(80, 46, 14, -110)}`,
  senses: () => `<path class="a-e a-o" d="M58 100q-12-20-6-40l2-26q1-6 6-6t5 6l1 22l2-30q1-6 6-6t5 6l0 30l3-26q1-6 6-6t5 6l-1 30l4-20q2-6 7-5t4 7l-6 32q-4 20-22 26z"/><circle class="a-dot" cx="72" cy="72" r="2"/><circle class="a-dot" cx="82" cy="80" r="2"/><circle class="a-dot" cx="90" cy="70" r="2"/><path class="a-thin" d="M114 40q6 4 0 8t0 8M124 34q6 4 0 8t0 8"/><circle class="a-l a-o" cx="128" cy="88" r="10"/>`,
  nature: () => `${sunG(126, 28, 11)}${leafG(28, 92, 62, -42)}${leafG(60, 98, 44, -70, 'a-s')}${flowerG(106, 72, 9)}<path class="a-thin" d="M106 82v22"/>`,
  joy: () => `<path class="a-b a-o" d="${(() => { let d = ''; for (let i = 0; i < 16; i++) { const a = (i * Math.PI) / 8, rr = i % 2 ? 26 : 34; d += `${i ? 'L' : 'M'}${r1(80 + Math.cos(a) * rr)} ${r1(56 + Math.sin(a) * rr)}`; } return `${d}Z`; })()}"/>${faceG(80, 54, 1.3)}<rect class="a-p a-o" x="24" y="22" width="9" height="9" rx="2" transform="rotate(20 28 26)"/><circle class="a-m a-o" cx="134" cy="88" r="6"/><circle class="a-s a-o" cx="30" cy="88" r="5"/><path class="a-l a-o" d="${sparkD(134, 26, 1)}"/><path class="a-thin" d="M118 96q4-6 8 0t8 0"/>`,
  hope: () => `<path d="M28 96a52 52 0 0 1 104 0" fill="none" stroke="var(--il-pink)" stroke-width="7" stroke-linecap="round"/><path d="M40 96a40 40 0 0 1 80 0" fill="none" stroke="var(--il-sun)" stroke-width="7" stroke-linecap="round"/><path d="M52 96a28 28 0 0 1 56 0" fill="none" stroke="var(--il-mint)" stroke-width="7" stroke-linecap="round"/><path class="a-e a-o" d="M66 84h28l-4 22h-20z"/><path class="a-thin" d="M80 84v-22"/>${leafG(80, 66, 16, -150)}${leafG(80, 62, 18, -30)}`,
  change: () => `<path class="a-l a-o" d="M40 98Q44 50 96 20Q108 40 92 62Q74 88 40 98Z"/><path class="a-thin" d="M40 98Q70 64 94 26M60 78l-10-6M70 66l-8-10M80 54l-4-10M68 72l14 2M78 60l14 0"/><path class="a-p a-o" d="M118 70q-14-14-4-20q10 0 4 20z"/><path class="a-b a-o" d="M118 70q14-14 4-20q-10 0-4 20z"/><path class="a-thin" d="M118 70v6M104 92q6-6 2-10t4-10" stroke-dasharray="2 5"/>`,
  breathe: () => `<circle cx="80" cy="56" r="46" fill="none" stroke="var(--il-grape)" stroke-width="3" stroke-dasharray="6 7"/><circle cx="80" cy="56" r="34" class="a-s"/>${dotArt('calm', '', {}).replace(/^<svg[^>]*>/, '<g transform="translate(52 26) scale(.48)">').replace(/<\/svg>$/, '</g>')}`,
  draw: () => `${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<ellipse class="${i % 2 ? 'a-p' : 'a-b'} a-o" cx="80" cy="34" rx="7" ry="15" transform="rotate(${i * 45} 80 56)"/>`).join('')}<circle class="a-m a-o" cx="80" cy="56" r="9"/><path class="a-e a-o" d="M118 96l22-40l6 3l-22 40z"/><path class="a-dot" d="M118 96l1-8l5 3z"/>`,
  wheel: () => `${['a-p', 'a-e', 'a-b', 'a-m', 'a-s', 'a-l'].map((c, i) => { const a0 = (i * Math.PI) / 3 - Math.PI / 2, a1 = a0 + Math.PI / 3; return `<path class="${c} a-o" d="M80 56L${r1(80 + Math.cos(a0) * 46)} ${r1(56 + Math.sin(a0) * 46)}A46 46 0 0 1 ${r1(80 + Math.cos(a1) * 46)} ${r1(56 + Math.sin(a1) * 46)}Z"/>`; }).join('')}<circle class="a-w a-o" cx="80" cy="56" r="12"/>${faceG(80, 55, 0.6)}`,
  weather: () => `${sunG(100, 40, 16)}<path class="a-w a-o" d="${cloudD(52, 80, 1.1)}"/><path d="M22 100q10-8 20 0" fill="none" stroke="var(--il-sky)" stroke-width="5" stroke-linecap="round"/>${faceG(70, 70, 0.7)}`,
  print: () => `<path class="a-w a-o" d="M50 10h46l14 14v76h-60z"/><path class="a-thin" d="M96 10v14h14"/>${[0, 1, 2, 3, 4, 5].map(i => `<ellipse class="${i % 2 ? 'a-p' : 'a-l'} a-o" cx="80" cy="44" rx="4.5" ry="10" transform="rotate(${i * 60} 80 56)"/>`).join('')}<circle class="a-b a-o" cx="80" cy="56" r="5"/><path class="a-thin" d="M62 84h36M62 92h24"/>`,
  programs: () => `<rect class="a-w a-o" x="36" y="20" width="88" height="80" rx="10"/><path class="a-l a-o" d="M36 30a10 10 0 0 1 10-10h68a10 10 0 0 1 10 10v8h-88z"/><path class="a-thin" d="M56 14v12M104 14v12"/>${[0, 1, 2, 3, 4, 5].map(i => `<path class="${['a-p', 'a-b', 'a-m'][i % 3]} a-o" d="${heartD(54 + (i % 3) * 26, 52 + Math.floor(i / 3) * 24, 0.5)}"/>`).join('')}`,
  guides: () => `<path class="a-w a-o" d="M80 30q-20-12-46-8v70q26-4 46 8z"/><path class="a-l a-o" d="M80 30q20-12 46-8v70q-26-4-46 8z"/><path class="a-thin" d="M80 30v70M44 40q14-2 26 4M44 52q14-2 26 4M90 44q12-6 26-4M90 56q12-6 26-4"/><path class="a-b a-o" d="${sparkD(132, 22, 1)}"/>`,
  prompts: () => `<path class="a-w a-o" d="M30 24h80a12 12 0 0 1 12 12v32a12 12 0 0 1-12 12h-52l-18 16v-16h-10a12 12 0 0 1-12-12v-32a12 12 0 0 1 12-12z"/><path class="a-thin" d="M40 44h62M40 56h44"/><path class="a-e a-o" d="M116 92l22-38l6 3l-22 38z"/>`,
  support: () => `<path class="a-e a-o" d="M30 84q14-6 28 0l18 6q6 2 4 8t-8 4l-18-4"/><path class="a-e a-o" d="M130 84q-14-6-28 0"/><path class="a-p a-o" d="${heartD(80, 26, 1.7)}"/><path class="a-thin" d="M116 22l6-6M124 30h8"/>`,
  checkin: () => `${['a-p', 'a-b', 'a-m', 'a-s'].map((c, i) => `<rect class="${c} a-o" x="${34 + i * 24}" y="${30 + (i % 2) * 8}" width="20" height="48" rx="6" transform="rotate(${-8 + i * 5} ${44 + i * 24} 60)"/>`).join('')}<path class="a-thin" d="M30 96q50-10 100 0"/>`,
  glossary: () => `<rect class="a-l a-o" x="44" y="18" width="72" height="84" rx="8"/><path class="a-w a-o" d="M54 18v84"/><text x="88" y="70" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="32" font-weight="700" fill="var(--il-ink)">Aa</text>`,
  star: () => `<path class="a-b a-o" d="${starD(80, 56, 38)}"/>${faceG(80, 58, 1)}<path class="a-p a-o" d="${sparkD(128, 24, 1)}"/>`,
};
function themeArt(key, cls = '') {
  const f = TART[key] || TART.star;
  return `${svgOpen(`tart${cls ? ' ' + cls : ''}`, '0 0 160 110')}<path class="a-t" d="${blobD(80, 58, 48, `bg:${key}`, 0.14, 9, 44)}" opacity=".9"/>${f()}</svg>`;
}

/* ---------- pretty scenes for the main screens' headers (160 × 120) ---------- */
const FACE = (x, y, s = 1) => `<circle class="a-dot" cx="${r1(x - 6 * s)}" cy="${y}" r="${r1(2.2 * s)}"/><circle class="a-dot" cx="${r1(x + 6 * s)}" cy="${y}" r="${r1(2.2 * s)}"/>`
  + `<path class="a-thin" d="M${r1(x - 4 * s)} ${r1(y + 5 * s)}q${r1(4 * s)} ${r1(4.5 * s)} ${r1(8 * s)} 0"/><ellipse cx="${r1(x - 10 * s)}" cy="${r1(y + 4.5 * s)}" rx="${r1(3.4 * s)}" ry="${r1(2.2 * s)}" fill="#FF8CB5" opacity=".8"/><ellipse cx="${r1(x + 10 * s)}" cy="${r1(y + 4.5 * s)}" rx="${r1(3.4 * s)}" ry="${r1(2.2 * s)}" fill="#FF8CB5" opacity=".8"/>`;
const SPK = (x, y, s, cls = 'a-b') => `<path class="${cls} a-o" d="${sparkD(x, y, s)}"/>`;
const pencilG = (x, y, len, ang, cls) => `<g transform="translate(${x} ${y}) rotate(${ang})"><rect class="${cls} a-o" x="0" y="-5.5" width="${len}" height="11" rx="2"/><path class="a-wd a-o" d="M${len} -5.5L${len + 13} 0L${len} 5.5Z"/><path class="a-dot" d="M${len + 8.5} -1.9L${len + 13} 0L${len + 8.5} 1.9Z"/><rect class="a-p a-o" x="-7" y="-5.5" width="8" height="11" rx="3"/></g>`;
const brushG = (x, y, len, ang, tip = 'a-p') => `<g transform="translate(${x} ${y}) rotate(${ang})"><rect class="a-wd a-o" x="0" y="-3.5" width="${len}" height="7" rx="3.5"/><rect class="a-w a-o" x="${len - 2}" y="-4.5" width="10" height="9" rx="1.5"/><path class="${tip} a-o" d="M${len + 8} -4.5Q${len + 22} -3 ${len + 26} 0Q${len + 22} 3 ${len + 8} 4.5Z"/></g>`;
const butterflyMini = (x, y, s = 1, c = 'a-l') => `<g transform="translate(${x} ${y}) scale(${s})"><path class="${c} a-o" d="M0 0C-6 -14 -18 -14 -16 -4C-15 2 -6 2 0 0Z M0 0C6 -14 18 -14 16 -4C15 2 6 2 0 0Z"/><path class="a-p a-o" d="M0 1C-4 8 -12 10 -11 4C-10 1 -4 1 0 1Z M0 1C4 8 12 10 11 4C10 1 4 1 0 1Z"/><path class="a-ink" d="M0 -6V5M0 -6q-3-5-6-6M0 -6q3-5 6-6"/></g>`;
const SCENES = {
  today: () => `<path style="fill:var(--il-sky-l)" class="a-o" d="${blobD(92, 64, 52, 'sc-today', 0.12, 9, 48)}"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => { const a = (i * Math.PI) / 5; return `<path class="a-ink" d="M${r1(106 + Math.cos(a) * 27)} ${r1(42 + Math.sin(a) * 27)}L${r1(106 + Math.cos(a) * 34)} ${r1(42 + Math.sin(a) * 34)}"/>`; }).join('')}
    <circle class="a-b a-o" cx="106" cy="42" r="21"/>${FACE(106, 41, 1)}
    <path class="a-w a-o" d="M30 92c0-18 18-30 40-30 22 0 36 11 36 24 0 9-8 12-16 10-7-1-12 4-8 10 3 6-3 11-13 11-22 0-39-10-39-25z"/>
    <circle style="fill:var(--il-sky-l)" class="a-o" cx="48" cy="100" r="5"/><circle class="a-p a-o" cx="45" cy="84" r="6"/><circle class="a-s a-o" cx="59" cy="75" r="6"/><circle class="a-m a-o" cx="74" cy="76" r="6"/><circle class="a-l a-o" cx="86" cy="86" r="5.5"/>
    ${brushG(74, 116, 34, -52, 'a-e')}${flowerG(140, 98, 6.5, 'a-p')}<path class="a-ink" d="M140 105v12"/>${SPK(24, 34, 1.1)}${SPK(146, 74, 0.7, 'a-p')}`,
  calendar: () => `<path style="fill:var(--il-grape-l)" class="a-o" d="${blobD(84, 66, 54, 'sc-cal', 0.12, 9, 46)}"/>
    ${[['--il-red', 52], ['--il-orange', 43], ['--il-sun', 34], ['--il-mint', 25], ['--il-sky', 16]].map(([c, r]) => `<path d="M${84 - r} 100a${r} ${r} 0 0 1 ${2 * r} 0" fill="none" stroke="var(${c})" stroke-width="9.4"/>`).join('')}
    <path class="a-ink" d="M27.3 100a56.7 56.7 0 0 1 113.4 0M72.3 100a11.7 11.7 0 0 1 23.4 0"/>
    <path class="a-w a-o" d="${cloudD(30, 110, 0.82)}"/>${FACE(43, 99, 0.55)}<path class="a-w a-o" d="${cloudD(116, 110, 0.82)}"/>${FACE(129, 99, 0.55)}
    <path class="a-b a-o" d="${starD(138, 26, 9)}"/>${SPK(30, 30, 1, 'a-p')}<circle class="a-m a-o" cx="112" cy="16" r="3.5"/>`,
  classes: () => `<path style="fill:var(--il-mint-l)" class="a-o" d="${blobD(84, 64, 54, 'sc-cls', 0.12, 9, 48)}"/>
    <path class="a-wd a-o" d="M58 116L76 22h8L64 116zM110 116L92 22h-8l20 94z"/><path class="a-wd a-o" d="M82 92v24h5V92z"/>
    <rect class="a-w a-o" x="48" y="30" width="72" height="54" rx="3" transform="rotate(-2 84 57)"/>
    <path class="a-m a-o" d="M53 78q14-20 28-8q12-14 34 2v6H53z" transform="rotate(-2 84 57)"/><circle class="a-b a-o" cx="102" cy="44" r="8"/><path class="a-p a-o" d="${heartD(70, 44, 0.75)}"/>
    <rect class="a-wd a-o" x="44" y="84" width="80" height="7" rx="2"/>
    <rect class="a-s a-o" x="126" y="82" width="24" height="30" rx="4"/>${pencilG(129, 82, 22, -100, 'a-e')}${pencilG(138, 82, 26, -84, 'a-l')}${pencilG(146, 82, 20, -70, 'a-m')}
    ${SPK(26, 40, 1)}${SPK(132, 22, 0.75, 'a-p')}`,
  photos: () => `<path style="fill:var(--il-pink-l)" class="a-o" d="${blobD(86, 64, 54, 'sc-ph', 0.12, 9, 48)}"/>
    <g transform="rotate(-10 62 60)"><rect class="a-w a-o" x="36" y="26" width="52" height="62" rx="3"/><rect style="fill:var(--il-sky-l)" class="a-o" x="42" y="32" width="40" height="40"/><path class="a-m a-o" d="M42 72l12-16 8 9 8-12 12 19z"/><circle class="a-b a-o" cx="72" cy="42" r="5"/></g>
    <g transform="rotate(9 106 66)"><rect class="a-w a-o" x="80" y="34" width="52" height="62" rx="3"/><rect style="fill:var(--il-sun-l)" class="a-o" x="86" y="40" width="40" height="40"/>${flowerG(106, 58, 6, 'a-p')}<path class="a-ink" d="M106 64v14"/></g>
    <rect x="44" y="18" width="30" height="11" rx="2" style="fill:var(--il-mint-l)" class="a-o" transform="rotate(-18 59 23)"/><rect x="98" y="26" width="30" height="11" rx="2" style="fill:var(--il-grape-l)" class="a-o" transform="rotate(12 113 31)"/>
    <rect class="a-l a-o" x="118" y="90" width="34" height="24" rx="5"/><circle class="a-w a-o" cx="135" cy="102" r="7.5"/><circle class="a-dot" cx="135" cy="102" r="3"/><rect class="a-b a-o" x="141" y="86" width="8" height="5" rx="1.5"/>
    <path class="a-p a-o" d="${heartD(28, 86, 0.6)}"/>${SPK(24, 50, 0.8, 'a-b')}`,
  ideas: () => `<path style="fill:var(--il-orange-l)" class="a-o" d="${blobD(84, 64, 54, 'sc-id', 0.12, 9, 48)}"/>
    ${[-160, -130, -100, -80, -50, -20].map(d => { const a = (d * Math.PI) / 180; return `<path class="a-ink" d="M${r1(80 + Math.cos(a) * 34)} ${r1(48 + Math.sin(a) * 34)}L${r1(80 + Math.cos(a) * 42)} ${r1(48 + Math.sin(a) * 42)}"/>`; }).join('')}
    <path class="a-b a-o" d="M62 66a26 26 0 1 1 36 0c-4 4-6 8-6 13H68c0-5-2-9-6-13z"/>${FACE(80, 50, 0.9)}
    <rect class="a-w a-o" x="67" y="79" width="26" height="8" rx="2"/><rect class="a-w a-o" x="69" y="87" width="22" height="8" rx="2"/><path class="a-dot" d="M74 95h12l-3 5h-6z"/>
    ${pencilG(104, 112, 34, -38, 'a-s')}${SPK(32, 36, 1.1, 'a-p')}${SPK(136, 30, 0.8, 'a-l')}<circle class="a-m a-o" cx="36" cy="88" r="5"/>`,
  therapy: () => `<path style="fill:var(--il-grape-l)" class="a-o" d="${blobD(84, 62, 54, 'sc-th', 0.12, 9, 48)}"/>
    <path class="a-ink" d="M72 80Q66 60 54 44M80 80V28M88 80Q96 62 108 46"/>${leafG(66, 64, 16, -150, 'a-g')}${leafG(82, 56, 15, -30, 'a-g')}${leafG(96, 66, 15, -40, 'a-g')}
    ${flowerG(54, 40, 7.5, 'a-p')}${flowerG(80, 26, 8, 'a-s')}${flowerG(108, 42, 7.5, 'a-e')}
    <path class="a-e a-o" d="M62 86h36l-5 28H67z"/><rect class="a-e a-o" x="57" y="78" width="46" height="11" rx="3"/>${FACE(80, 98, 0.65)}
    ${butterflyMini(134, 74, 0.9)}<path class="a-r a-o" d="${heartD(28, 70, 0.6)}"/>${SPK(140, 26, 0.9)}${SPK(26, 30, 0.7, 'a-m')}`,
  earnings: () => `<path style="fill:var(--il-mint-l)" class="a-o" d="${blobD(84, 64, 54, 'sc-earn', 0.12, 9, 48)}"/>
    <path class="a-p a-o" d="M44 72c0-20 18-32 40-32 18 0 30 8 35 20h7v16h-8c-3 8-10 14-18 16v10h-10v-8H76v8H66v-11c-13-4-22-12-22-19z"/>
    <rect class="a-dot" x="76" y="44" width="16" height="4" rx="2"/><circle class="a-dot" cx="104" cy="64" r="2.6"/><ellipse class="a-w a-o" cx="125" cy="68" rx="4" ry="6"/><path class="a-thin" d="M44 70q-10 2-8 10"/><ellipse cx="96" cy="74" rx="5" ry="3" fill="#FF5C9A" opacity=".7"/>
    ${[[34, 30], [118, 28], [140, 102]].map(([x, y], i) => `<circle class="a-b a-o" cx="${x}" cy="${y}" r="${[9, 7, 8][i]}"/><path class="a-thin" d="M${x} ${y - 4}v8"/>`).join('')}${SPK(64, 22, 0.9, 'a-s')}`,
};
function headerArt(name) {
  const s = SCENES[name];
  return s ? `${svgOpen('tart scene', '0 0 160 120')}${s()}</svg>` : splash(name);
}

/* ---------- a picture for every activity, from what it’s made with ---------- */
const MOTIFS = {
  draw: p => `<path class="a-ink" d="M30 86c10-22 22 10 34-8s20-18 26 2" opacity=".9"/>${pencilG(50, 84, 52, -38, p[0])}${pencilG(62, 92, 52, -28, p[1])}${pencilG(76, 98, 48, -16, p[2])}`,
  paint: p => `<path class="a-w a-o" d="M36 66c0-20 20-34 44-34 24 0 40 12 40 28 0 10-9 13-18 11-7-2-12 4-9 11 3 7-3 12-14 12-24 0-43-12-43-28z"/>
    <circle style="fill:var(--tb, #fff)" class="a-o" cx="56" cy="76" r="5.5"/><circle class="${p[0]} a-o" cx="52" cy="58" r="6.5"/><circle class="${p[1]} a-o" cx="67" cy="47" r="6.5"/><circle class="${p[2]} a-o" cx="84" cy="46" r="6.5"/><circle class="${p[3]} a-o" cx="99" cy="54" r="6"/>${brushG(92, 100, 34, -48, p[0])}`,
  collage: p => `<rect class="${p[0]} a-o" x="34" y="34" width="40" height="32" rx="2" transform="rotate(-12 54 50)"/><path class="${p[1]} a-o" d="M70 30l34 10-12 30z"/><rect class="${p[2]} a-o" x="56" y="58" width="44" height="30" rx="2" transform="rotate(8 78 73)"/>
    <circle class="a-w a-o" cx="112" cy="84" r="7"/><circle class="a-w a-o" cx="126" cy="76" r="7"/><path class="a-w a-o" d="M117 80l-24-30 4-2 25 28M121 80l-30-22 3-3 31 21"/>`,
  clay: p => `<path class="${p[0]} a-o" d="M42 58c0 22 16 38 36 38s36-16 36-38c-8 6-22 9-36 9s-28-3-36-9z"/><ellipse class="${p[0]} a-o" cx="78" cy="58" rx="36" ry="9"/><ellipse style="fill:#2E2433;opacity:.18" cx="78" cy="59" rx="26" ry="5.5"/><path class="a-thin" d="M54 78q8 6 18 7M88 85q10-2 16-8"/>
    <circle class="${p[1]} a-o" cx="124" cy="92" r="10"/><path d="M28 96q6-10 14-4t14-2" fill="none" stroke="var(--il-ink)" stroke-width="9" stroke-linecap="round"/><path d="M28 96q6-10 14-4t14-2" fill="none" stroke="var(${CLS_VAR[p[2]]})" stroke-width="5" stroke-linecap="round"/>`,
  textile: p => `<circle class="${p[0]} a-o" cx="66" cy="64" r="26"/><path class="a-thin" d="M44 54q22-6 44 4M42 66q24-8 48 2M46 78q20-8 40 0M58 40q-8 22 2 48M74 40q10 20 0 48"/>
    <path d="M90 74q16 4 22 14t-6 18" fill="none" stroke="var(--il-ink)" stroke-width="2" stroke-dasharray="4 3"/><path class="a-w a-o" d="M100 40l26 34-3 2-26-34z"/><circle class="a-w a-o" cx="99" cy="40" r="3"/>${SPK(124, 32, 0.8, p[1])}`,
  nature: p => `${leafG(36, 96, 50, -44, 'a-g')}${leafG(72, 100, 36, -80, 'a-m')}${flowerG(108, 52, 9, p[0])}<path class="a-ink" d="M108 62v38"/>${leafG(108, 84, 14, -30, 'a-g')}<ellipse class="${p[2]} a-o" cx="128" cy="98" rx="12" ry="7"/>`,
  print: p => `<rect class="a-wd a-o" x="44" y="22" width="22" height="26" rx="6"/><rect class="${p[0]} a-o" x="34" y="46" width="42" height="14" rx="3"/>
    ${[[96, 40], [116, 58], [92, 74], [118, 92]].map(([x, y], i) => `<path class="${p[(i + 1) % 4]} a-o" d="${i % 2 ? heartD(x, y - 8, 0.62) : starD(x, y, 9)}"/>`).join('')}<path class="a-thin" d="M44 76q10 8 26 2" stroke-dasharray="3 4"/>`,
  words: p => `<rect class="a-w a-o" x="36" y="26" width="56" height="70" rx="5"/>${[38, 50, 62, 74].map(y => `<path class="a-thin" d="M46 ${y}h36"/>`).join('')}${[34, 46, 58, 70, 82].map(y => `<circle class="a-w a-o" cx="36" cy="${y}" r="3"/>`).join('')}
    <path class="${p[0]} a-o" d="M98 26h38a8 8 0 0 1 8 8v16a8 8 0 0 1-8 8h-20l-10 9v-9h-8a8 8 0 0 1-8-8V34a8 8 0 0 1 8-8z"/><path class="a-dot" d="M108 42h4v4h-4zM118 42h4v4h-4zM128 42h4v4h-4z"/>${pencilG(84, 104, 40, -32, p[1])}`,
  move: p => `<path d="M24 80c16-30 30 20 48-6s28-30 44-6 22 8 26-6" fill="none" stroke="var(--il-ink)" stroke-width="12" stroke-linecap="round"/><path d="M24 80c16-30 30 20 48-6s28-30 44-6 22 8 26-6" fill="none" stroke="var(${CLS_VAR[p[0]]})" stroke-width="8" stroke-linecap="round"/>
    <g class="a-ink"><path d="M58 28v26M58 28l14 4v22M90 34v22"/></g><ellipse class="${p[1]} a-o" cx="54" cy="56" rx="6" ry="4.5" transform="rotate(-20 54 56)"/><ellipse class="${p[1]} a-o" cx="68" cy="56" rx="6" ry="4.5" transform="rotate(-20 68 56)"/><ellipse class="${p[2]} a-o" cx="86" cy="58" rx="6" ry="4.5" transform="rotate(-20 86 58)"/>`,
  mixed: p => `<path class="${p[3]} a-o" d="${blobD(112, 82, 16, 'splat', 0.3, 8)}"/><circle class="${p[3]} a-o" cx="134" cy="66" r="4"/><circle class="${p[3]} a-o" cx="96" cy="104" r="3"/>
    ${pencilG(52, 50, 40, -100, p[0])}${brushG(66, 52, 26, -78, p[1])}${pencilG(80, 52, 36, -64, p[2])}<path class="a-s a-o" d="M40 50h50l-6 52H46z"/><path class="a-thin" d="M44 62h42" opacity=".6"/>`,
};
const MOTIF_ORDER = ['a-p', 'a-b', 'a-m', 'a-s', 'a-l', 'a-e', 'a-g'];
// Extra versions of the most common materials, so a long list of activities doesn't repeat one picture.
const MOTIF_MORE = {
  draw: [
    p => `<rect class="a-w a-o" x="36" y="26" width="70" height="72" rx="6"/>${[46, 58, 70, 82, 94].map(x => `<circle class="a-w a-o" cx="${x}" cy="26" r="3.4"/>`).join('')}
      ${flowerG(60, 56, 7, p[0])}<path class="a-ink" d="M60 63v22"/>${leafG(60, 78, 10, -30, 'a-g')}<path class="${p[1]} a-o" d="${heartD(88, 58, 0.55)}"/><path class="a-thin" d="M76 88q8-6 16 0t16 0"/>
      <g transform="translate(110 100) rotate(-58)"><rect class="${p[2]} a-o" x="0" y="-6" width="40" height="12" rx="3"/><path class="${p[2]} a-o" d="M40 -6L52 -2V2L40 6Z"/><path class="a-thin" d="M10 -6v12M30 -6v12"/></g>`,
    p => `<path d="M28 72c10-30 40-30 36 0s-30 26-16 6 50-34 56-10-20 30-6 22 26-18 30-26" fill="none" stroke="var(--il-ink)" stroke-width="10" stroke-linecap="round"/>
      <path d="M28 72c10-30 40-30 36 0s-30 26-16 6 50-34 56-10-20 30-6 22 26-18 30-26" fill="none" stroke="var(${CLS_VAR[p[0]]})" stroke-width="6" stroke-linecap="round"/>
      ${pencilG(150, 22, 26, 122, p[1])}<path class="${p[2]} a-o" d="${starD(42, 30, 8)}"/>`,
  ],
  paint: [
    p => `${[[46, p[0]], [80, p[1]], [114, p[2]]].map(([x, c]) => `<rect class="a-w a-o" x="${x - 15}" y="56" width="30" height="38" rx="6"/><path class="${c} a-o" d="M${x - 15} 66h30v20a8 8 0 0 1-8 8h-14a8 8 0 0 1-8-8z"/><rect class="${c} a-o" x="${x - 17}" y="50" width="34" height="9" rx="3"/>`).join('')}
      ${brushG(84, 74, 34, -76, p[3])}<path class="${p[0]} a-o" d="${dropD(30, 104, 0.8)}"/><path class="${p[2]} a-o" d="${dropD(130, 104, 0.8)}"/>`,
    p => `<rect class="a-w a-o" x="28" y="40" width="104" height="52" rx="7"/>${[0, 1, 2, 3, 4, 5].map(i => `<rect class="${p[i % p.length]} a-o" x="${36 + i * 15}" y="48" width="12" height="15" rx="3"/>`).join('')}
      <rect class="a-w a-o" x="36" y="70" width="88" height="14" rx="3"/><path d="M44 77q10-5 20 0t20 0" fill="none" stroke="var(${CLS_VAR[p[1]]})" stroke-width="5" stroke-linecap="round" opacity=".7"/>${brushG(96, 106, 40, -24, p[0])}`,
  ],
  mixed: [
    p => `<path class="a-w a-o" d="M48 98V60q0-6 6-6h20q6 0 6 6v38z"/><rect class="${p[0]} a-o" x="54" y="42" width="20" height="13" rx="2"/><path class="${p[0]} a-o" d="M60 42l4-12 4 12z"/><rect class="${p[1]} a-o" x="52" y="68" width="24" height="18" rx="3"/>
      <circle class="${p[2]} a-o" cx="102" cy="86" r="10"/><circle class="${p[3]} a-o" cx="120" cy="66" r="8"/><circle class="${p[4]} a-o" cx="126" cy="94" r="7"/><circle class="a-w a-o" cx="104" cy="46" r="10"/><circle class="a-dot" cx="107" cy="49" r="4.5"/>`,
  ],
};
// A small symbol for each theme, tucked into a corner of the activity picture.
const BADGES = {
  calm: c => leafG(-8, 6, 18, -40, 'a-g'),
  worry: () => `<path class="a-w a-o" d="${cloudD(-6, 8, 0.45)}"/>`,
  feel: c => `<path class="${c} a-o" d="${heartD(0, -6, 0.62)}"/>`,
  self: () => `<path class="a-b a-o" d="${starD(0, 0, 9)}"/>`,
  connect: c => `<path class="${c} a-o" d="${heartD(-5, -6, 0.45)}"/><path class="a-p a-o" d="${heartD(6, -2, 0.45)}"/>`,
  mind: () => '<path d="M0 -8a8 8 0 1 1-6 3" fill="none" stroke="var(--il-ink)" stroke-width="3.4" stroke-linecap="round"/>',
  senses: c => `<circle class="${c} a-o" cx="0" cy="0" r="6"/><path class="a-thin" d="M10 -6q4 3 0 6t0 6"/>`,
  nature: () => flowerG(0, 0, 5, 'a-p'),
  joy: () => `<path class="a-b a-o" d="${(() => { let d = ''; for (let i = 0; i < 12; i++) { const a = (i * Math.PI) / 6, rr = i % 2 ? 5 : 9; d += `${i ? 'L' : 'M'}${r1(Math.cos(a) * rr)} ${r1(Math.sin(a) * rr)}`; } return `${d}Z`; })()}"/>`,
  hope: () => '<path d="M-10 4a10 10 0 0 1 20 0" fill="none" stroke="var(--il-pink)" stroke-width="3.4"/><path d="M-6 4a6 6 0 0 1 12 0" fill="none" stroke="var(--il-sun)" stroke-width="3.4"/>',
  change: () => '<path class="a-l a-o" d="M-8 8Q-6 -6 8 -10Q10 -2 4 4Q-2 8 -8 8Z"/>',
};
const CLS_VAR = { 'a-p': '--il-pink', 'a-b': '--il-sun', 'a-m': '--il-mint', 'a-s': '--il-sky', 'a-l': '--il-grape', 'a-e': '--il-orange', 'a-g': '--il-lime' };
function motifArt(media, seed, cls = '', theme = '') {
  const R = rng(`motif:${seed}`), pal = MOTIF_ORDER.slice();
  for (let i = pal.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [pal[i], pal[j]] = [pal[j], pal[i]]; }
  const ms = [MOTIFS[media] || MOTIFS.mixed].concat(MOTIF_MORE[media] || []), m = ms[Math.floor(R() * ms.length)], flip = R() < 0.5;
  const dots = [0, 1, 2].map(() => `<circle class="${pal[4 + Math.floor(R() * 3)]} a-o" cx="${r1(18 + R() * 124)}" cy="${r1(R() < 0.5 ? 10 + R() * 14 : 92 + R() * 12)}" r="${r1(2.4 + R() * 2)}"/>`).join('');
  const left = R() < 0.5, spark = SPK(left ? r1(20 + R() * 14) : r1(128 + R() * 14), r1(16 + R() * 18), 0.75 + R() * 0.3, pal[5]);
  const badge = BADGES[theme] ? `<g transform="translate(${left ? 140 : 20} ${r1(20 + R() * 10)})">${BADGES[theme](pal[6])}</g>` : '';
  return `${svgOpen(`tart${cls ? ' ' + cls : ''}`, '0 0 160 110')}<path class="a-t" d="${blobD(80, 58, 50, `bg:${seed}`, 0.14, 9, 44)}"/>${dots}
    <g${flip ? ' transform="translate(160 0) scale(-1 1)"' : ''}>${m(pal)}</g>${spark}${badge}</svg>`;
}
const actArt = (a, cls = '') => motifArt((a.media && a.media[0]) || 'mixed', a.id, cls, a.th);

/* ---------- a little burst of paint when a class is ticked ---------- */
const BURST_COLOURS = ['#F59AB5', '#FFD66B', '#8FD6B0', '#8CC4EE', '#B79BF2', '#FFB98A'];
function celebrate(x, y) {
  if (reduceMotion() || !document.body) return;
  const b = document.createElement('div');
  b.className = 'burst';
  b.setAttribute('aria-hidden', 'true');
  b.style.left = `${Math.round(x)}px`;
  b.style.top = `${Math.round(y)}px`;
  let h = '';
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + Math.random() * 0.4, d = 24 + Math.random() * 26;
    h += `<i style="--c:${BURST_COLOURS[i % BURST_COLOURS.length]};--x:${r1(Math.cos(a) * d)}px;--y:${r1(Math.sin(a) * d)}px;--r:${Math.round(Math.random() * 180)}deg"></i>`;
  }
  b.innerHTML = h;
  document.body.append(b);
  setTimeout(() => b.remove(), 800);
}
const celebrateAt = el => { if (!el || !el.getBoundingClientRect) return; const r = el.getBoundingClientRect(); celebrate(r.left + r.width / 2, r.top + r.height / 2); };
