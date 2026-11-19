/* Atelier — printables: mandalas to colour, worksheets, breathing tracers and affirmation cards, drawn as A4 SVG pages.
   Print them, or save or share them as pictures (handy on iPhone, where the share sheet also has Print). */
'use strict';

const PK = '#2B2A2E', PK2 = '#55515A', PK3 = '#8D8892';
const FT = 'font-family="Fraunces, Georgia, serif"', FB = 'font-family="Nunito, Arial, sans-serif"';
const pol = (r, a, cx = 100, cy = 100) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
const P2 = p => `${r1(p[0])} ${r1(p[1])}`;
function svgText(text, x, y, o = {}) {
  const size = o.size || 4.2, max = o.max || 60, lh = o.lh || size * 1.35, words = String(text).split(' '), lines = [];
  let cur = '';
  for (const w of words) { if ((`${cur} ${w}`).trim().length > max && cur) { lines.push(cur); cur = w; } else cur = `${cur} ${w}`.trim(); }
  if (cur) lines.push(cur);
  return `<text x="${x}" y="${y}" text-anchor="${o.anchor || 'middle'}" ${o.serif ? FT : FB} font-size="${size}" font-weight="${o.w || 400}" fill="${o.fill || PK2}">${lines.map((l, i) => `<tspan x="${x}" dy="${i ? lh : 0}">${esc(l)}</tspan>`).join('')}</text>`;
}
function a4(title, sub, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 297" width="210mm" height="297mm"><rect width="210" height="297" fill="#fff"/>
    ${svgText(title, 105, 24, { size: 10, w: 600, serif: true, fill: PK })}${sub ? svgText(sub, 105, 33, { size: 4.4, max: 80 }) : ''}
    ${body}${svgText('Atelier', 105, 290, { size: 3, fill: PK3 })}</svg>`;
}
const inkG = (body, w = 0.9) => `<g fill="none" stroke="${PK}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${body}</g>`;
const lines = (x, y, w, n, gap = 10) => Array.from({ length: n }, (_, i) => `<path d="M${x} ${y + i * gap}h${w}" stroke="${PK3}" stroke-width=".4"/>`).join('');

/* ---------- mandalas (closed shapes only, so they can be coloured in on screen too) ---------- */
function petalD(ra, rb, a, da, cx = 100, cy = 100) { const p0 = pol(ra, a, cx, cy), p1 = pol(rb, a, cx, cy), rm = (ra + rb) / 2; return `M${P2(p0)}Q${P2(pol(rm, a + da, cx, cy))} ${P2(p1)}Q${P2(pol(rm, a - da, cx, cy))} ${P2(p0)}Z`; }
function mandalaG(seed) {
  const R = rng(`mandala:${seed}`), pick = a => a[Math.floor(R() * a.length)], out = [], circ = r => `<circle cx="100" cy="100" r="${r1(r)}"/>`;
  let r = 9 + R() * 3, ring = 0;
  out.push(circ(r));
  out.push(...Array.from({ length: 6 }, (_, k) => `<path d="${petalD(2, r - 1.5, (k * Math.PI) / 3, 0.5)}"/>`));
  const kinds = ['petals', 'dots', 'scallop', 'zigzag', 'spokes', 'leaves'];
  let last = '';
  while (r < 82) {
    let t = pick(kinds);
    if (t === last) t = kinds[(kinds.indexOf(t) + 1) % kinds.length];
    last = t;
    const w = 9 + R() * 7, r2 = Math.min(92, r + w), n = pick([8, 10, 12]) * (r > 38 ? 2 : 1), step = (2 * Math.PI) / n, off = ring % 2 ? step / 2 : 0;
    for (let k = 0; k < n; k++) {
      const a = off + k * step;
      if (t === 'petals') out.push(`<path d="${petalD(r, r2, a, step * 0.42)}"/>`);
      else if (t === 'leaves') out.push(`<path d="${petalD(r + 1, r2 - 1, a, step * 0.3)}"/><path d="M${P2(pol(r + 2, a))}L${P2(pol(r2 - 2, a))}"/>`);
      else if (t === 'dots') { const rm = (r + r2) / 2, rr = Math.max(1.4, Math.min((r2 - r) / 2 - 1.2, (rm * step) / 2 - 1)); out.push(`<circle cx="${r1(pol(rm, a)[0])}" cy="${r1(pol(rm, a)[1])}" r="${r1(rr)}"/>`); }
      else if (t === 'scallop') out.push(`<path d="M${P2(pol(r, a))}Q${P2(pol(r2 + (r2 - r) * 0.6, a + step / 2))} ${P2(pol(r, a + step))}"/>`);
      else if (t === 'spokes') out.push(`<path d="M${P2(pol(r, a))}L${P2(pol(r2, a))}"/>`);
    }
    if (t === 'zigzag') out.push(`<path d="${Array.from({ length: n * 2 }, (_, k) => `${k ? 'L' : 'M'}${P2(pol(k % 2 ? r2 - 1 : r + 1, off + (k * step) / 2))}`).join('')}Z"/>`);
    if (t === 'spokes') out.push(circ((r + r2) / 2));
    r = r2;
    ring++;
    out.push(circ(r));
  }
  const n = pick([24, 32]), step = (2 * Math.PI) / n;
  for (let k = 0; k < n; k++) out.push(`<path d="${petalD(r, 97, k * step, step * 0.38)}"/>`);
  return out.join('');
}
const mandalaSVG = (seed, standalone) => (standalone
  ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="1000" height="1000"><rect width="200" height="200" fill="#fff"/>${inkG(mandalaG(seed), 1)}</svg>`
  : inkG(mandalaG(seed)));

/* ---------- pictures to colour ---------- */
function dotLineG() {
  return inkG(`<path d="M25 78q-6 3-8 9M95 78q6 3 8 9"/><ellipse cx="48" cy="103" rx="8" ry="5"/><ellipse cx="72" cy="103" rx="8" ry="5"/><path d="${DOT_BODY}"/>
    <g transform="rotate(-8 60 36)"><path d="M29 41C28 29 55 21 80 26C93 29 95 38 86 42C73 47 40 48 29 41Z"/><path d="M62 23q2-5 0-8"/><circle cx="62" cy="13.5" r="2.4"/></g>
    <ellipse cx="48" cy="66" rx="3.6" ry="4.6" fill="${PK}"/><ellipse cx="72" cy="66" rx="3.6" ry="4.6" fill="${PK}"/><path d="M54 77q6 6 12 0"/>
    <path d="M14 30l3 6 6 1-5 4 1 6-5-3-5 3 1-6-5-4 6-1z"/><circle cx="104" cy="22" r="5"/><circle cx="108" cy="50" r="3"/>`, 1.6);
}
function butterflyG() {
  const wing = 'M100 96C82 50 40 28 26 48C14 66 40 92 100 100Z M100 104C64 104 34 118 40 140C46 158 80 142 100 110Z';
  const spots = '<circle cx="50" cy="60" r="7"/><circle cx="66" cy="78" r="5"/><circle cx="56" cy="126" r="6"/><ellipse cx="38" cy="50" rx="4" ry="3"/>';
  return inkG(`<path d="${wing}"/>${spots}<g transform="translate(200 0) scale(-1 1)"><path d="${wing}"/>${spots}</g>
    <ellipse cx="100" cy="102" rx="5" ry="24"/><circle cx="100" cy="74" r="6"/><path d="M98 69q-6-16-14-20M102 69q6-16 14-20"/><circle cx="84" cy="48" r="2.5"/><circle cx="116" cy="48" r="2.5"/>`, 1.3);
}
// Pictures for the on-screen colouring tool: id → [name, svg inner, viewBox size]
const COLOUR_PICS = [
  ['mandala-1', 'Mandala: petals', () => mandalaG(1), 200], ['mandala-2', 'Mandala: dots and waves', () => mandalaG(2), 200], ['mandala-3', 'Mandala: stars', () => mandalaG(3), 200],
  ['mandala-4', 'Mandala: leaves', () => mandalaG(4), 200], ['mandala-5', 'Mandala: lace', () => mandalaG(5), 200], ['mandala-6', 'Mandala: sunburst', () => mandalaG(6), 200],
  ['dot', 'Dot the paint blob', () => `<g transform="translate(14 10) scale(1.4)">${dotLineG()}</g>`, 200], ['butterfly', 'Butterfly', () => butterflyG(), 200],
];
const colourPicSVG = id => { const p = COLOUR_PICS.find(x => x[0] === id) || COLOUR_PICS[0]; return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${p[3]} ${p[3]}" width="1000" height="1000"><rect width="${p[3]}" height="${p[3]}" fill="#fff"/>${p[0].startsWith('mandala') ? inkG(p[2](), 1) : p[2]()}</svg>`; };

/* ---------- worksheets ---------- */
function faceGrid() {
  const names = ['Happy', 'Calm', 'Excited', 'Worried', 'Sad', 'Angry', 'Surprised', 'Tired', 'My own:'];
  return names.map((n, i) => { const x = 42 + (i % 3) * 63, y = 78 + Math.floor(i / 3) * 70; return `<circle cx="${x}" cy="${y}" r="24" fill="none" stroke="${PK}" stroke-width=".9"/>${svgText(n, x, y + 34, { size: 5, w: 700, fill: PK })}${i === 8 ? `<path d="M${x - 2} ${y + 36}h26" stroke="${PK3}" stroke-width=".4"/>` : ''}`; }).join('');
}
function monsterG() {
  return inkG(`<path d="M60 230C40 200 40 120 70 90C80 60 92 52 105 52C118 52 130 60 140 90C170 120 170 200 150 230Z"/><path d="M78 74L66 44L90 62M132 74L144 44L120 62"/>
    <circle cx="88" cy="104" r="12"/><circle cx="122" cy="104" r="12"/><circle cx="90" cy="106" r="4" fill="${PK}"/><circle cx="120" cy="106" r="4" fill="${PK}"/>
    <path d="M72 140Q105 120 138 140Q130 178 105 180Q80 178 72 140Z"/><path d="M84 138l4 9 5-11 5 11 5-12 5 12 5-11 5 11 4-9"/>
    <path d="M60 230l-6 12h18zM150 230l6 12h-18z"/><path d="M48 150q-14-6-18 8M162 150q14-6 18 8"/>`, 1.1);
}
function treeG() {
  const tree = inkG(`<path d="M30 214h150"/><path d="M92 214C94 180 96 150 90 128M118 214C116 180 114 150 120 128"/>
    <path d="M90 128C70 112 50 112 36 96M90 128C86 104 72 88 70 66M120 128C126 104 140 90 144 68M120 128C142 114 160 112 174 98M104 128V60"/>
    <path d="M92 214C80 232 60 238 44 250M100 214C98 236 90 250 84 264M110 214C114 236 124 250 132 262M118 214C132 230 152 236 168 246"/>
    ${[[36, 90], [62, 62], [80, 52], [104, 50], [128, 54], [148, 62], [172, 92], [52, 104], [158, 104]].map(([x, y]) => `<path d="${blobD(x, y, 9, `leaf${x}`, 0.15, 7)}"/>`).join('')}
    ${[[70, 84], [134, 82], [104, 78]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5"/>`).join('')}`, 1.1);
  return `<g transform="translate(8 14) scale(.92)">${tree}</g>`
    + svgText('Leaves: people who matter to me', 105, 44, { size: 3.8 })
    + svgText('Fruits: gifts I’ve been given', 198, 64, { size: 3.6, anchor: 'end', max: 16 })
    + svgText('Branches: my hopes and dreams', 198, 118, { size: 3.6, anchor: 'end', max: 18 })
    + svgText('Trunk: what I’m good at', 123, 168, { size: 3.6, anchor: 'start', max: 12 })
    + svgText('Ground: my everyday life', 36, 206, { size: 3.6, anchor: 'start' })
    + svgText('Roots: where I come from', 105, 268, { size: 3.8 })
    + svgText('Based on the Tree of Life approach by Ncazelo Ncube-Mlilo and David Denborough', 105, 277, { size: 2.6, fill: PK3, max: 100 });
}
function bridgeG() {
  return inkG(`<path d="M10 190q22-10 44 0M10 202q22-10 44 0M156 190q22-10 44 0M156 202q22-10 44 0"/><path d="M60 214q45-14 90 0M60 226q45-14 90 0M60 238q45-14 90 0" stroke="${PK3}"/>
    <path d="M10 180H58Q105 110 152 180H200"/><path d="M58 180Q105 124 152 180"/><path d="M70 170v14M84 156v26M105 150v32M126 156v26M140 170v14"/>`, 1)
    + svgText('Where I am now', 34, 260, { size: 4.6, w: 700, fill: PK }) + svgText('Where I’d like to be', 176, 260, { size: 4.6, w: 700, fill: PK }) + svgText('What helps me cross?', 105, 120, { size: 4.6, w: 700, fill: PK });
}
function handG() {
  const fingers = [[46, 130, -22, 'Someone who'], [70, 92, -8, 'listens'], [100, 80, 0, 'makes me'], [130, 90, 8, 'laugh'], [158, 118, 22, 'helps me']];
  return inkG(`<path d="M60 250C48 220 40 196 42 170L34 128Q32 116 42 114Q52 112 56 124L64 150L62 96Q62 84 72 84Q82 84 84 96L88 146L90 80Q90 68 100 68Q110 68 112 80L114 146L120 92Q122 80 132 82Q142 84 140 96L138 154L150 124Q156 112 166 116Q176 120 172 132L160 186Q154 220 142 250Z"/>`, 1.1)
    + fingers.map(([x, y]) => `<path d="M${x - 8} ${y + 22}h16" stroke="${PK3}" stroke-width=".4"/>`).join('') + svgText('Me', 102, 214, { size: 7, w: 700, fill: PK, serif: true })
    + svgText('On each finger, write or draw someone who helps you: family, friends, teachers, pets, or a place.', 105, 270, { size: 4, max: 70 });
}
function weatherSheet() {
  const list = [['sunny', 'Sunny'], ['partly', 'Sun and cloud'], ['cloudy', 'Cloudy'], ['rainy', 'Rainy'], ['stormy', 'Stormy'], ['windy', 'Windy'], ['foggy', 'Foggy'], ['rainbow', 'Rainbow']];
  return list.map(([k, n], i) => { const x = 20 + (i % 4) * 44, y = 50 + Math.floor(i / 4) * 56; return `<rect x="${x}" y="${y}" width="38" height="48" rx="6" fill="none" stroke="${PK3}" stroke-width=".5"/><g transform="translate(${x + 4} ${y + 4}) scale(.375)">${printWx(k)}</g>${svgText(n, x + 19, y + 42, { size: 3.6, w: 700, fill: PK })}`; }).join('')
    + `<rect x="20" y="170" width="170" height="100" rx="8" fill="none" stroke="${PK}" stroke-width=".8"/>` + svgText('Draw your own weather here', 105, 182, { size: 4.2 });
}
function printWx(k) {
  const sun = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${PK}" stroke-width="2"/>${[0, 1, 2, 3, 4, 5, 6, 7].map(i => { const a = (i * Math.PI) / 4; return `<path d="M${r1(x + Math.cos(a) * (r + 3))} ${r1(y + Math.sin(a) * (r + 3))}L${r1(x + Math.cos(a) * (r + 7))} ${r1(y + Math.sin(a) * (r + 7))}" stroke="${PK}" stroke-width="2" stroke-linecap="round"/>`; }).join('')}`;
  const cl = (x, y, s) => `<path d="${cloudD(x, y, s)}" fill="#fff" stroke="${PK}" stroke-width="2"/>`;
  return `<svg viewBox="0 0 80 80" width="80" height="80">${{
    sunny: sun(40, 36, 14), partly: `${sun(50, 26, 10)}${cl(26, 54, 0.8)}`, cloudy: `${cl(20, 44, 0.8)}${cl(34, 54, 0.7)}`,
    rainy: `${cl(22, 38, 0.8)}<path d="M30 48l-4 9M42 48l-4 9M54 48l-4 9" stroke="${PK}" stroke-width="2.4" stroke-linecap="round"/>`,
    stormy: `${cl(22, 36, 0.8)}<path d="M44 40l-8 13h7l-5 11" fill="none" stroke="${PK}" stroke-width="2.4" stroke-linejoin="round"/>`,
    windy: `<path d="M8 26h36a7 7 0 1 0-7-7M8 38h48a7 7 0 1 1-7 7M8 50h24" fill="none" stroke="${PK}" stroke-width="2.4" stroke-linecap="round"/>`,
    foggy: `<path d="M10 24h56M16 36h50M10 48h52M18 60h40" stroke="${PK}" stroke-width="2.4" stroke-linecap="round"/>`,
    rainbow: `<path d="M10 58a30 30 0 0 1 60 0M20 58a20 20 0 0 1 40 0M30 58a10 10 0 0 1 20 0" fill="none" stroke="${PK}" stroke-width="2.4"/>`,
  }[k] || ''}</svg>`;
}
function starBreath() {
  const pts = Array.from({ length: 10 }, (_, i) => pol(i % 2 ? 34 : 78, -Math.PI / 2 + (i * Math.PI) / 5, 105, 150));
  return `<path d="M${pts.map(P2).join('L')}Z" fill="none" stroke="${PK}" stroke-width="1.2" stroke-linejoin="round"/>`
    + pts.map((p, i) => (i % 2 ? '' : `<circle cx="${r1(p[0])}" cy="${r1(p[1])}" r="3" fill="${PK}"/>`)).join('')
    + pts.map((p, i) => { const q = pts[(i + 1) % 10], m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], c = [(m[0] - 105) * 0.25 + m[0], (m[1] - 150) * 0.25 + m[1]]; return svgText(i % 2 ? 'out' : 'in', r1(c[0]), r1(c[1] + 1.5), { size: 4.2, w: 700, fill: PK }); }).join('')
    + svgText('Start at the top. Trace up a side as you breathe in, and down the next as you breathe out. Go all the way around the star.', 105, 258, { size: 4.4, max: 66 });
}
function squareBreath() {
  return `<rect x="45" y="80" width="120" height="120" rx="4" fill="none" stroke="${PK}" stroke-width="1.2"/>${[[45, 80], [165, 80], [165, 200], [45, 200]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="${PK}"/>`).join('')}
    <path d="M70 74h60l-5-4M150 92v80l4-5M140 206H70l5 4M40 180V100l-4 5" fill="none" stroke="${PK2}" stroke-width=".8" stroke-linecap="round"/>`
    + svgText('Breathe in for 4', 105, 72, { size: 5, w: 700, fill: PK }) + `<g transform="rotate(90 178 140)">${svgText('Hold for 4', 178, 140, { size: 5, w: 700, fill: PK })}</g>`
    + svgText('Breathe out for 4', 105, 214, { size: 5, w: 700, fill: PK }) + `<g transform="rotate(-90 32 140)">${svgText('Hold for 4', 32, 140, { size: 5, w: 700, fill: PK })}</g>`
    + svgText('Trace each side slowly with a finger while you count. For little ones, try 3 instead of 4.', 105, 250, { size: 4.4, max: 64 });
}
function tilesG() {
  const R = rng('tiles');
  let s = '';
  for (let i = 0; i < 9; i++) {
    const x = 22 + (i % 3) * 57, y = 46 + Math.floor(i / 3) * 57;
    s += `<rect x="${x}" y="${y}" width="52" height="52" rx="3" fill="none" stroke="${PK}" stroke-width=".8"/>`;
    s += `<path d="M${x + 4} ${r1(y + 8 + R() * 36)}C${r1(x + 18)} ${r1(y + R() * 52)} ${r1(x + 34)} ${r1(y + R() * 52)} ${x + 48} ${r1(y + 8 + R() * 36)}" fill="none" stroke="${PK3}" stroke-width=".7" stroke-dasharray="1.6 1.6"/>`;
  }
  return s + svgText('Fill each part of each square with a different repeating pattern: lines, dots, circles, scales, waves. Go slowly.', 105, 230, { size: 4.4, max: 64 });
}
function jarG() {
  return inkG(`<path d="M66 64h78v16H66z"/><path d="M72 80C52 96 44 120 46 160C48 230 60 262 105 262C150 262 162 230 164 160C166 120 158 96 138 80"/>
    ${[[80, 120, -12], [126, 128, 10], [96, 160, 4], [70, 196, -8], [130, 190, 12], [102, 226, -4]].map(([x, y, r]) => `<rect x="${x - 18}" y="${y - 11}" width="36" height="22" rx="4" transform="rotate(${r} ${x} ${y})"/>`).join('')}`, 1)
    + svgText('Write or draw something you’re grateful for in each note. Add more on scraps of paper.', 105, 52, { size: 4.2, max: 70 });
}
function bodyG() {
  return inkG('<circle cx="105" cy="68" r="22"/><path d="M84 94Q105 88 126 94L150 108Q160 114 156 124L140 158L132 150L140 122L128 116V178L136 252Q137 262 126 262H112L105 196L98 262H84Q73 262 74 252L82 178V116L70 122L78 150L70 158L54 124Q50 114 60 108Z"/>', 1.1)
    + svgText('Colour where you notice feelings in your body, using colours that fit. It’s fine to leave it blank, or draw a feelings creature instead.', 105, 276, { size: 4, max: 74 });
}
function affirmPage(seed) {
  const list = TP && TP.affirm ? TP.affirm.slice() : ['I can take my time.', 'I am learning.', 'Mistakes help me grow.', 'I can ask for help.', 'I am enough.', 'I can be brave.', 'I can rest.', 'I belong here.'];
  const R = rng(`affirm:${seed}`);
  for (let i = list.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [list[i], list[j]] = [list[j], list[i]]; }
  const doodles = [DOODLES.sparkle, DOODLES.heart, DOODLES.swirl, DOODLES.sparkle];
  return list.slice(0, 8).map((t, i) => {
    const x = 12 + (i % 2) * 96, y = 40 + Math.floor(i / 2) * 62;
    return `<rect x="${x}" y="${y}" width="90" height="56" rx="6" fill="none" stroke="${PK3}" stroke-width=".5" stroke-dasharray="2 2"/>${svgText(t, x + 45, y + 26, { size: 5.6, w: 700, fill: PK, max: 22, serif: true })}
      <g transform="translate(${x + 74} ${y + 4}) scale(.55)" fill="none" stroke="${PK}" stroke-width="1.4">${doodles[i % 4]}</g>`;
  }).join('') + svgText('Cut along the dotted lines, then decorate the backs.', 105, 292 - 10, { size: 3.6 });
}
const PRINTABLES = [
  ...[1, 2, 3, 4, 5, 6].map(n => ({ id: `mandala-${n}`, g: 'Colouring', n: `Mandala ${n}`, d: 'A mandala to colour slowly, ring by ring.', svg: () => a4(`Mandala ${n}`, 'Colour slowly, ring by ring. Choose colours that feel good.', `<g transform="translate(15 52) scale(.9)">${mandalaSVG(n)}</g>`), colour: `mandala-${n}` })),
  { id: 'colour-dot', g: 'Colouring', n: 'Dot the paint blob', d: 'Colour in Dot, and give the background a pattern.', svg: () => a4('Dot the paint blob', 'Colour Dot in, then add a background.', `<g transform="translate(15 60) scale(.9)"><g transform="translate(14 10) scale(1.4)">${dotLineG()}</g></g>`), colour: 'dot' },
  { id: 'colour-butterfly', g: 'Colouring', n: 'Butterfly', d: 'A symmetrical butterfly to colour.', svg: () => a4('Butterfly', 'Can you colour both wings to match?', `<g transform="translate(15 58) scale(.9)">${butterflyG()}</g>`), colour: 'butterfly' },
  { id: 'star-breath', g: 'Calm tools', n: 'Star breathing', d: 'Trace a star with a finger while breathing slowly.', svg: () => a4('Star breathing', 'A slow-breathing tracer for any age', starBreath()) },
  { id: 'square-breath', g: 'Calm tools', n: 'Square breathing', d: 'Box breathing to trace: in, hold, out, hold.', svg: () => a4('Square breathing', 'Trace the square as you breathe', squareBreath()) },
  { id: 'pattern-tiles', g: 'Calm tools', n: 'Pattern tiles', d: 'Nine squares to fill with slow, repeating patterns.', svg: () => a4('Pattern tiles', 'Slow, repeating patterns, one square at a time', tilesG()) },
  { id: 'feelings-faces', g: 'Worksheets', n: 'Feelings faces', d: 'Draw a face for each feeling, and one of your own.', svg: () => a4('Feelings faces', 'Draw a face for each feeling', faceGrid()) },
  { id: 'my-weather', g: 'Worksheets', n: 'My weather today', d: 'Circle a weather, or draw your own.', svg: () => a4('My weather today', 'If my feelings were weather today, they would be…', weatherSheet()) },
  { id: 'worry-monster', g: 'Worksheets', n: 'Worry monster', d: 'A hungry monster that eats worries.', svg: () => a4('Worry monster', 'Feed the monster a worry. It’s very good at holding them for you.', `<g transform="translate(0 8)">${monsterG()}</g>`) },
  { id: 'calm-place', g: 'Worksheets', n: 'My calm place', d: 'A frame for a real or imaginary calm place.', svg: () => a4('My calm place', 'A real or imaginary place where I feel calm', `<rect x="20" y="44" width="170" height="170" rx="12" fill="none" stroke="${PK}" stroke-width="1"/>${svgText('In my calm place I can see, hear and smell…', 20, 230, { size: 4.4, anchor: 'start' })}${lines(20, 244, 170, 4)}`) },
  { id: 'tree-of-life', g: 'Worksheets', n: 'Tree of life', d: 'Roots, trunk, branches, leaves and fruits of your life.', svg: () => a4('My tree of life', 'Write or draw in each part of the tree', treeG()) },
  { id: 'bridge', g: 'Worksheets', n: 'Bridge drawing', d: 'From where I am now to where I’d like to be.', svg: () => a4('My bridge', 'Draw where you are, where you’d like to be, and what helps you cross', bridgeG()) },
  { id: 'helping-hand', g: 'Worksheets', n: 'My helping hand', d: 'Five people or things that help me.', svg: () => a4('My helping hand', 'Who helps me?', handG()) },
  { id: 'gratitude-jar', g: 'Worksheets', n: 'Gratitude jar', d: 'Notes for the good things, big and small.', svg: () => a4('My gratitude jar', '', jarG()) },
  { id: 'body-outline', g: 'Worksheets', n: 'Feelings body outline', d: 'Where do you notice feelings? Offer it gently.', care: 'Body-focused activities aren’t comfortable for everyone. Always offer the feelings creature alternative, and never ask people to explain their colours.', svg: () => a4('Where do I notice feelings?', 'Use colours, lines or patterns', bodyG()) },
  { id: 'affirm', g: 'Cards', n: 'Affirmation cards', d: 'Eight kind sentences to cut out and decorate.', svg: () => a4('Affirmation cards', '', affirmPage(PRN.seed)) },
];
const PRN_BY = Object.fromEntries(PRINTABLES.map(p => [p.id, p]));
const PRN = { seed: 1 };

async function svgToPng(svg, w = 1654) {
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' })), img = new Image();
  try {
    await new Promise((res, rej) => { img.onload = res; img.onerror = () => rej(new Error('Couldn’t draw the page.')); img.src = url; });
    const vb = /viewBox="0 0 (\d+) (\d+)"/.exec(svg), h = Math.round(w * (vb ? +vb[2] / +vb[1] : 297 / 210));
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    const g = cv.getContext('2d');
    g.fillStyle = '#fff';
    g.fillRect(0, 0, w, h);
    g.drawImage(img, 0, 0, w, h);
    return await new Promise((res, rej) => cv.toBlob(b => (b ? res(b) : rej(new Error('Couldn’t make the picture.'))), 'image/png'));
  } finally { URL.revokeObjectURL(url); }
}
function printSVG(svg) {
  const root = $('#print-root');
  root.innerHTML = svg;
  document.body.classList.add('printing');
  const done = () => { document.body.classList.remove('printing'); root.innerHTML = ''; window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done);
  try { window.print(); } catch (e) { done(); toast(`${icon('warn')} Printing isn’t available here. Try “Save or share” instead, then print from the share sheet.`, { ms: 7000 }); }
}

VIEWS.printables = {
  tab: 'therapy', title: 'Printables',
  head() { return { back: '#/therapy', title: 'Printables', sub: `${PRINTABLES.length} pages to print, share or colour in here` }; },
  render() {
    const groups = [...new Set(PRINTABLES.map(p => p.g))];
    return groups.map(g => `<div class="sec"><h2>${g}</h2></div><div class="pr-grid">${PRINTABLES.filter(p => p.g === g).map(p => `<a class="pr-tile" href="#/printable/${p.id}"><span class="pv" aria-hidden="true">${p.svg()}</span><b>${esc(p.n)}</b><small class="fine">${esc(p.d)}</small></a>`).join('')}</div>`).join('')
      + `<p class="fine" style="margin-top:16px">${icon('info', 'sm')} On iPhone, “Save or share” opens the share sheet, which has Print, Save Image and Save to Files.</p>`;
  },
};
VIEWS.printable = {
  tab: 'therapy', title: 'Printable',
  head(id) { const p = PRN_BY[id]; return p ? { back: '#/printables', kicker: p.g, title: esc(p.n) } : { back: '#/printables', title: 'Not found' }; },
  render(id) {
    const p = PRN_BY[id];
    if (!p) return emptyState('warn', 'Page not found', '', '<a class="btn" href="#/printables">All printables</a>');
    return `<p class="lead">${esc(p.d)}</p>${p.care ? `<div class="callout care" style="margin-bottom:12px">${icon('heart')}<p>${esc(p.care)}</p></div>` : ''}
      <div class="pr-big" role="img" aria-label="Preview of ${esc(p.n)}">${p.svg()}</div>
      <div class="btn-row"><button type="button" class="btn primary" data-act="print">${icon('print')} Print</button><button type="button" class="btn" data-act="share">${icon('share')} Save or share</button>
      ${p.colour ? `<button type="button" class="btn soft" data-act="colour">${icon('brush')} Colour it in here</button>` : ''}${id === 'affirm' ? `<button type="button" class="btn ghost" data-act="shuffle">${icon('shuffle')} Other sentences</button>` : ''}</div>`;
  },
  act: {
    print: () => printSVG(PRN_BY[UI.param].svg()),
    share: async () => {
      const p = PRN_BY[UI.param];
      toast('Making the picture…', { ms: 20000 });
      try { const b = await svgToPng(p.svg()); const r = await shareFile(b, `${p.n.replace(/[^\w ]+/g, '').replace(/\s+/g, '-').toLowerCase()}.png`, p.n); toast(r === 'downloaded' ? `${icon('check')} Saved to your downloads` : r === 'shared' ? `${icon('check')} Shared` : 'Cancelled'); } catch (e) { toast(`${icon('warn')} ${esc(e.message || 'Couldn’t make the picture.')}`, { ms: 6000 }); }
    },
    colour: () => { COL.pic = PRN_BY[UI.param].colour; go('#/tool/colour'); },
    shuffle: () => { PRN.seed++; render(); },
  },
};
