/* Atelier — illustrations, part 2: composition, colour, materials, subjects, teaching and wellbeing. */
'use strict';

/* ---------- composition ---------- */
IL.thirds = ['A landscape divided into thirds, with the horizon on the lower line and a tree where two lines cross.', u => {
  let s = Rc(16, 16, 288, 168, { f: '#EAF0F5', s: IG3, r: 4 }) + P('M16 128c50-8 100-10 150-4s100 6 138-2V184H16z', { f: '#B9C9A0' });
  s += P('M112 128v-40', { s: '#6B4E32', w: 6 }) + C(112, 72, 24, { f: '#5E8A45', s: IG, w: 1.2 }) + C(208, 58, 10, { f: '#F2C230', s: 'none' });
  s += P('M112 16v168M208 16v168M16 72h288M16 128h288', { s: IACC, w: 1, x: dash });
  [[112, 72], [208, 72], [112, 128], [208, 128]].forEach(([x, y]) => { s += C(x, y, 4, { f: IACC }); });
  return s + T(160, 198, 'Focal point where the lines cross', 'middle', { s: 12 });
}];
IL.leading = ['A winding path leading from the bottom corner to a small house, guiding the eye to it.', () => {
  let s = Rc(16, 16, 288, 168, { f: '#EEF2E6', s: IG3, r: 4 }) + Ln(16, 84, 304, 84, 1, IG4);
  s += P('M40 184c40-40 120-40 110-70s70-24 70-30', { s: '#C9A87A', w: 22 }) + P('M40 184c40-40 120-40 110-70s70-24 70-30', { s: '#E3CDA6', w: 14 });
  s += P('M222 84V62l16-14 16 14v22z', { f: '#F2F0ED', s: IG, w: 1.6 }) + P('M234 84v-10h8v10', { w: 1.4 });
  return s + Ar(70, 166, 130, 132, IACC) + Ar(154, 112, 206, 88, IACC) + T(160, 198, 'Lines in the picture lead the eye', 'middle', { s: 12 });
}];
IL.thumbs = ['Four small thumbnail sketches of the same scene in three values, with the strongest one ticked.', () => {
  let s = '';
  const comps = [
    x => Rc(x, 40, 64, 46, { f: '#D6D3D8' }) + P(`M${x} 70h64v16h-64z`, { f: '#55515A' }) + C(x + 46, 54, 8, { f: '#FFFFFF' }),
    x => Rc(x, 40, 64, 46, { f: '#8D8892' }) + P(`M${x} 64c20-10 40-10 64 0v22h-64z`, { f: '#2B2A2E' }) + C(x + 18, 54, 7, { f: '#FFFFFF' }),
    x => Rc(x, 40, 64, 46, { f: '#EDEBE8' }) + P(`M${x + 10} 86l12-34 12 34z`, { f: '#2B2A2E' }) + P(`M${x} 78h64v8h-64z`, { f: '#8D8892' }),
    x => Rc(x, 40, 64, 46, { f: '#C9C4CC' }) + P(`M${x} 60h64v26h-64z`, { f: '#8D8892' }) + C(x + 32, 60, 9, { f: '#2B2A2E' }),
  ];
  comps.forEach((f, i) => { const x = 16 + i * 74; s += f(x) + Rc(x, 40, 64, 46, { s: IG, w: 1.2 }) + T(x + 32, 110, i + 1, 'middle'); });
  s += C(122, 63, 40, { s: ISIE, w: 2.5 }) + P('M100 140l10 10 22-24', { s: ISIE, w: 3 });
  return s + T(160, 180, 'Small, quick, three values. Pick the strongest.', 'middle', { s: 12, w: 400 });
}];
IL.balance = ['Symmetrical balance with equal shapes either side, and asymmetrical balance with a large shape near the middle and a small dark one further out.', () => {
  let s = P('M20 130h120M80 130l-10 18h20z', { w: 1.8 }) + Rc(34, 92, 30, 38, { f: '#8D8892' }) + Rc(96, 92, 30, 38, { f: '#8D8892' });
  s += P('M180 130h120M228 130l-10 18h20z', { w: 1.8 }) + Rc(196, 70, 44, 60, { f: '#C9C4CC' }) + C(286, 118, 12, { f: IG });
  return s + T(80, 176, 'Symmetrical', 'middle') + T(240, 176, 'Asymmetrical', 'middle');
}];
IL.notan = ['A notan design: a square split into black and white halves, with shapes cut from one side flipped into the other like a mirror.', () => {
  let s = Rc(60, 20, 100, 160, { f: '#FFFFFF', s: IG, w: 1.2 }) + Rc(160, 20, 100, 160, { f: IG });
  s += P('M160 40c-30 10-40 40-20 60 -20 20-14 50 20 60z', { f: '#FFFFFF' }) + P('M160 40c-30 10-40 40-20 60-20 20-14 50 20 60', { s: IG, w: 1.2 });
  s += P('M160 40c30 10 40 40 20 60 20 20 14 50-20 60z', { f: IG }) + C(110, 60, 10, { f: IG }) + C(210, 60, 10, { f: '#FFFFFF' }) + P('M86 140l20-20 20 20z', { f: IG }) + P('M234 140l-20-20-20 20z', { f: '#FFFFFF' });
  return s + T(160, 198, 'Cut a shape out and flip it across', 'middle', { s: 12 });
}];
IL.viewfinder = ['A card viewfinder held over a scene to choose a crop, with everything outside the window greyed out.', u => {
  let s = Rc(16, 16, 288, 168, { f: '#EAF0F5', r: 4 }) + P('M16 132c60-12 120-12 180-2s80 4 108-6V184H16z', { f: '#B9C9A0' }) + P('M228 130V96l22-18 22 18v34z', { f: '#F2F0ED', s: IG, w: 1.2 }) + P('M84 132v-36', { s: '#6B4E32', w: 6 }) + C(84, 80, 22, { f: '#5E8A45' });
  s += `<defs><mask id="${u}m"><rect width="320" height="200" fill="#fff"/><rect x="120" y="50" width="160" height="110" fill="#000"/></mask></defs>`;
  s += Rc(16, 16, 288, 168, { f: '#3A383F', x: ` mask="url(#${u}m)" opacity=".55"` }) + Rc(120, 50, 160, 110, { s: '#FFFFFF', w: 3 });
  return s + T(200, 186, 'Slide the window to find the best crop', 'middle', { s: 12, c: '#FFFFFF' });
}];

/* ---------- colour ---------- */
IL.wheel = ['A twelve-part colour wheel: primaries red, yellow and blue, the secondaries between them, and tertiaries in between those.', () => {
  let s = wheelSegs(100, 100, 36, 84, i => HUES[i]);
  [[0, 'P'], [4, 'P'], [8, 'P'], [2, 'S'], [6, 'S'], [10, 'S']].forEach(([i, l]) => { const a = ((i * 30 - 90) * Math.PI) / 180; s += T(f1(100 + Math.cos(a) * 60), f1(104 + Math.sin(a) * 60), l, 'middle', { c: '#FFFFFF', s: 13 }); });
  s += T(204, 60, 'P  Primary', 'start') + T(204, 86, 'S  Secondary', 'start') + T(204, 112, 'Between: tertiary', 'start', { w: 400, s: 12 });
  return s + T(204, 150, 'Opposite colours', 'start', { w: 400, s: 12 }) + T(204, 166, 'are complements', 'start', { w: 400, s: 12 });
}];
IL.hsv = ['Three strips: hue changing colour, value going from light to dark, and saturation going from vivid to grey.', () => {
  let s = '';
  for (let i = 0; i < 10; i++) {
    s += Rc(96 + i * 21, 30, 21, 34, { f: `hsl(${i * 34},70%,52%)` });
    s += Rc(96 + i * 21, 84, 21, 34, { f: `hsl(222,55%,${90 - i * 8.5}%)` });
    s += Rc(96 + i * 21, 138, 21, 34, { f: `hsl(222,${80 - i * 8.6}%,45%)` });
  }
  return s + T(16, 52, 'Hue', 'start') + T(16, 106, 'Value', 'start') + T(16, 160, 'Saturation', 'start') + T(306, 190, 'vivid → greyed', 'end', { s: 12, w: 400 });
}];
IL.schemes = ['Three colour schemes on small colour wheels: complementary opposites, analogous neighbours and a triadic triangle.', () => {
  let s = '';
  const sets = [[[0, 6], 'Complementary'], [[8, 9, 10], 'Analogous'], [[0, 4, 8], 'Triadic']];
  sets.forEach(([on, n], k) => { const cx = 56 + k * 104; s += wheelSegs(cx, 84, 16, 44, i => (on.includes(i) ? HUES[i] : '#E7E3E9')) + T(cx, 158, n, 'middle'); });
  return s;
}];
IL.temp = ['A colour wheel split into warm reds, oranges and yellows and cool greens, blues and violets.', () => {
  let s = wheelSegs(110, 100, 30, 80, i => HUES[i]) + P('M70 26l80 148', { s: IG, w: 2, x: dash });
  return s + T(214, 70, 'Warm: come forward', 'start', { c: ISIE }) + T(214, 96, 'reds, oranges, yellows', 'start', { s: 12, w: 400 }) + T(214, 134, 'Cool: sit back', 'start', { c: IACC }) + T(214, 160, 'greens, blues, violets', 'start', { s: 12, w: 400 });
}];
IL.tints = ['One blue mixed with white to make tints, with black to make shades, and with grey to make tones.', () => {
  let s = '';
  for (let i = 0; i < 9; i++) { const l = 92 - i * 9.5; s += Rc(16 + i * 32, 40, 32, 52, { f: `hsl(224,58%,${l}%)` }); }
  for (let i = 0; i < 9; i++) s += Rc(16 + i * 32, 112, 32, 40, { f: `hsl(224,${58 - i * 6}%,${50 - (i - 4) * 0.5}%)` });
  return s + Rc(144, 40, 32, 52, { s: IG, w: 2 }) + T(16, 32, '+ white: tints', 'start', { s: 12 }) + T(304, 32, '+ black: shades', 'end', { s: 12 }) + T(16, 172, '+ grey: tones (less vivid)', 'start', { s: 12 });
}];
IL.neutrals = ['Pairs of complementary colours mixed together to make browns and greys.', () => {
  let s = '';
  [['#C8352E', '#3E9A4A', '#6B5A45'], ['#2F5DA8', '#E8782F', '#5E5A5C'], ['#F2C230', '#6C3D93', '#8A7A66']].forEach(([a, b, m], i) => {
    const y = 40 + i * 50;
    s += C(40, y, 16, { f: a }) + T(70, y + 5, '+', 'middle', { always: true, s: 18 }) + C(100, y, 16, { f: b }) + T(132, y + 5, '=', 'middle', { always: true, s: 18 }) + Rc(152, y - 16, 60, 32, { f: m, r: 6 });
  });
  return s + T(232, 70, 'Complements', 'start', { s: 12 }) + T(232, 88, 'mix to rich', 'start', { s: 12 }) + T(232, 106, 'neutrals', 'start', { s: 12 });
}];
IL.skin = ['A range of skin tone swatches from light to deep, each mixed from red, yellow, white and touches of blue or brown.', () => {
  let s = '';
  const tones = ['#F6DCC8', '#EBC3A3', '#DDAE8A', '#C98F66', '#A86F4C', '#8A5639', '#6B3F2A', '#4A2C20'];
  tones.forEach((c, i) => { s += Rc(16 + (i % 4) * 74, 30 + Math.floor(i / 4) * 62, 66, 52, { f: c, r: 8 }); });
  return s + T(16, 172, 'Base: red + yellow + white', 'start', { s: 12 }) + T(16, 190, 'Deeper: add burnt umber or a touch of blue', 'start', { s: 12, w: 400 });
}];

/* ---------- materials and media ---------- */
IL.grades = ['Graphite pencil grades from hard 6H to soft 8B, with the value each one makes.', () => {
  let s = '';
  ['6H', '4H', '2H', 'HB', 'B', '2B', '4B', '6B', '8B'].forEach((g, i) => {
    const x = 16 + i * 32, v = Math.round(214 - i * 22);
    s += Rc(x + 2, 30, 28, 90, { f: grey(v), r: 3 }) + T(x + 16, 140, g, 'middle', { s: 12, always: true });
  });
  return s + T(16, 176, 'Hard: light, crisp', 'start', { s: 12 }) + T(304, 176, 'Soft: dark, smudgy', 'end', { s: 12 });
}];
IL.charcoal = ['Charcoal samples: light grainy vine charcoal, rich black compressed charcoal, fine charcoal pencil lines and a smudged blend.', u => {
  let s = `<defs>${grain(u + 'n')}</defs>`;
  s += P('M20 46c60-8 120 4 180-4', { s: '#7E7A82', w: 18 }) + P('M20 92c60-6 120 6 180-2', { s: '#1E1D22', w: 20 });
  let d = ''; for (let i = 0; i < 9; i++) d += `M20 ${126 + i * 4}l180 ${i % 2 ? 3 : -3}`; s += P(d, { s: IG, w: 1 });
  s += `<defs>${rgrad(u + 'b', [[0, '#2B2A2E', 0.85], [1, '#2B2A2E', 0]])}</defs>` + E(262, 98, 48, 60, { f: `url(#${u}b)` });
  s += Rc(0, 0, 320, 200, { f: '#000', x: ` filter="url(#${u}n)" opacity=".18"` });
  return s + T(206, 50, 'Vine', 'start', { s: 12 }) + T(206, 96, 'Compressed', 'start', { s: 12 }) + T(206, 146, 'Pencil', 'start', { s: 12 }) + T(262, 186, 'Smudged', 'middle', { s: 12 });
}];
IL.ink = ['Pen and ink samples: a line that swells and thins, hatching, stippling and a loose scribble.', u => {
  let s = `<path d="M20 50c40-30 80 30 120 0" stroke="${IG}" stroke-width="1" fill="none"/><path d="M20 52c40-30 80 30 120 0c-40 34-80-26-120 0z" fill="${IG}"/>`;
  s += `<clipPath id="${u}h"><rect x="180" y="24" width="120" height="56" rx="4"/></clipPath><path d="${hatchD(180, 24, 120, 56, -45, 5, 3)}" stroke="${IG}" stroke-width="1" clip-path="url(#${u}h)"/>`;
  s += dots(dotsD(20, 110, 120, 56, 260, x => 0.15 + ((x - 20) / 120) * 0.85, 8), 2);
  const r = rng(2); let sc = 'M184 140'; for (let i = 0; i < 40; i++) sc += `q${f1(r() * 20 - 4)} ${f1(r() * 30 - 15)} ${f1(r() * 6 - 1)} ${f1(r() * 12 - 6)}`; s += P(sc, { w: 0.9 });
  return s + T(80, 90, 'Swelling line', 'middle', { s: 12 }) + T(240, 98, 'Hatching', 'middle', { s: 12 }) + T(80, 186, 'Stippling', 'middle', { s: 12 }) + T(240, 186, 'Scribble', 'middle', { s: 12 });
}];
IL.cplayer = ['Coloured pencil layers: yellow, red and blue overlapping to make new colours, and a burnished patch that’s smooth and shiny.', u => {
  let s = '';
  [['#F2C230', 70, 70, -50], ['#C8352E', 110, 70, 40], ['#2F5DA8', 90, 106, 0]].forEach(([c, x, y, a], i) => {
    s += `<clipPath id="${u}${i}"><circle cx="${x}" cy="${y}" r="40"/></clipPath><path d="${hatchD(x - 40, y - 40, 80, 80, a, 2.6, 4 + i, 0.3)}" stroke="${c}" stroke-width="1.6" clip-path="url(#${u}${i})" style="mix-blend-mode:multiply" opacity=".9"/>`;
  });
  s += `<defs>${rgradU(u + 'b', [[0, '#FFFFFF'], [0.12, '#F07A6E'], [0.6, '#B52F2A'], [1, '#6E1A1E']], 236, 82, 62, 224, 72)}</defs>` + C(244, 94, 50, { f: `url(#${u}b)` });
  return s + T(90, 176, 'Light layers mix', 'middle', { s: 12 }) + T(244, 176, 'Burnished', 'middle', { s: 12 });
}];
IL.pastel = ['Soft pastel strokes smudged into a blend, and an oil pastel patch with lines scratched through to the colour below.', u => {
  let s = `<defs>${grain(u + 'n')}${lgrad(u + 'g', [[0, '#F0A23A'], [0.5, '#DD5A2C'], [1, '#A82D5E']])}</defs>`;
  s += Rc(20, 40, 130, 100, { f: `url(#${u}g)`, r: 10 }) + Rc(20, 40, 130, 100, { f: '#000', r: 10, x: ` filter="url(#${u}n)" opacity=".22"` });
  s += Rc(176, 40, 124, 100, { f: '#F2C230', r: 6 }) + Rc(176, 40, 124, 100, { f: '#2B2A3E', r: 6 });
  s += P('M190 60c20 20 40-20 60 0s30 20 40 0M196 90l20 30 20-30 20 30 20-30M188 128h100', { s: '#F2C230', w: 2.4 });
  return s + T(85, 166, 'Soft pastel, blended', 'middle', { s: 12 }) + T(238, 166, 'Oil pastel, scratched', 'middle', { s: 12 });
}];
IL.wash = ['Three watercolour washes: a flat even blue, a graded wash from dark to light, and a variegated wash from blue into yellow.', u => {
  let s = `<defs>${lgrad(u + 'g', [[0, '#2F5DA8'], [1, '#2F5DA8', 0.05]], 0, 0, 0, 1)}${lgrad(u + 'v', [[0, '#2F5DA8', 0.85], [0.5, '#7FA6C9', 0.7], [1, '#F2C230', 0.85]], 0, 0, 0, 1)}</defs>`;
  s += Rc(16, 26, 88, 120, { f: '#2F5DA8', r: 3, x: ' opacity=".75"' }) + Rc(116, 26, 88, 120, { f: `url(#${u}g)`, r: 3 }) + Rc(216, 26, 88, 120, { f: `url(#${u}v)`, r: 3 });
  return s + T(60, 170, 'Flat', 'middle') + T(160, 170, 'Graded', 'middle') + T(260, 170, 'Variegated', 'middle');
}];
IL.wet = ['Wet-in-wet watercolour with soft, blurred colour blooms beside wet-on-dry shapes with crisp edges.', u => {
  let s = `<defs><filter id="${u}b" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7"/></filter></defs>`;
  s += `<g filter="url(#${u}b)">${C(60, 80, 30, { f: '#C8352E', x: ' opacity=".7"' })}${C(96, 96, 30, { f: '#F2C230', x: ' opacity=".7"' })}${C(76, 120, 28, { f: '#2F5DA8', x: ' opacity=".6"' })}</g>`;
  s += C(214, 80, 28, { f: '#C8352E', x: ' opacity=".6"' }) + C(248, 98, 28, { f: '#F2C230', x: ' opacity=".6"' }) + C(228, 124, 26, { f: '#2F5DA8', x: ' opacity=".55"' });
  return s + T(80, 182, 'Wet-in-wet: soft', 'middle') + T(232, 182, 'Wet-on-dry: crisp', 'middle');
}];
IL.wctex = ['Three watercolour textures: speckles from salt, a soft lifted cloud, and white lines left by a wax resist.', u => {
  let s = Rc(16, 26, 88, 120, { f: '#3A6FA8', r: 3 }) + dots(dotsD(20, 30, 80, 112, 70, () => 1, 3), 3.4, '#BFD3E8');
  s += `<defs>${rgrad(u + 'c', [[0, '#E8EEF4'], [1, '#E8EEF4', 0]])}</defs>` + Rc(116, 26, 88, 120, { f: '#3A6FA8', r: 3 }) + E(160, 74, 34, 20, { f: `url(#${u}c)` }) + E(150, 112, 26, 14, { f: `url(#${u}c)` });
  s += Rc(216, 26, 88, 120, { f: '#2E7F7A', r: 3 }) + P('M226 50c12-10 24 10 36 0s24 10 32 0M226 86c12-10 24 10 36 0s24 10 32 0M226 122c12-10 24 10 36 0s24 10 32 0', { s: '#F4F1EA', w: 3 });
  return s + T(60, 170, 'Salt', 'middle') + T(160, 170, 'Lifting', 'middle') + T(260, 170, 'Wax resist', 'middle');
}];
IL.inkwash = ['Ink diluted into five values from pale grey to black, and a small landscape painted in three of them.', () => {
  let s = '';
  [0.12, 0.3, 0.5, 0.72, 0.95].forEach((o, i) => { s += Rc(16 + i * 36, 30, 32, 40, { f: IG, r: 4, x: ` opacity="${o}"` }); });
  s += P('M200 120c20-30 40-40 60-30s30 0 44 10v40h-104z', { f: IG, x: ' opacity=".22"' }) + P('M200 140c30-20 60-14 104-4v24h-104z', { f: IG, x: ' opacity=".5"' }) + P('M228 160v-40M228 124c-10-8-12-20 0-28 12 8 10 20 0 28z', { f: IG, s: IG, w: 2, x: ' opacity=".95"' });
  return s + T(16, 92, 'Lots of water', 'start', { s: 12 }) + T(196, 92, 'Neat ink', 'end', { s: 12 }) + T(252, 186, 'Light, middle, dark', 'middle', { s: 12 });
}];
IL.acrylic = ['An apple painted in acrylic in three stages: flat block-in, light and shadow, then highlights and details.', u => {
  const apple = (x, f) => P(`M${x} 70c-30-14-54 10-48 40 6 28 28 40 48 32 20 8 42-4 48-32 6-30-18-54-48-40z`, { f });
  let s = `<defs>${rgradU(u + 'a', [[0, '#E2554A'], [0.6, '#B52F2A'], [1, '#6E1A1E']], 160, 96, 60, 150, 86)}${rgradU(u + 'b', [[0, '#FFD9D2'], [0.15, '#E2554A'], [0.6, '#B52F2A'], [1, '#5E1418']], 262, 96, 60, 252, 86)}</defs>`;
  s += apple(56, '#C8352E') + apple(160, `url(#${u}a)`) + E(262, 146, 48, 6, { f: IG, x: ' opacity=".3"' }) + apple(264, `url(#${u}b)`);
  s += P('M56 70q2-12 10-18M160 70q2-12 10-18M264 70q2-12 10-18', { s: '#6B4E32', w: 3 }) + P('M276 56c10-8 20-6 24 0-10 6-18 6-24 0z', { f: '#5E8A45' }) + E(244, 94, 6, 9, { f: '#FFFFFF', x: ' opacity=".85"' });
  return s + T(56, 176, '1 Block in', 'middle', { s: 12 }) + T(160, 176, '2 Light and shadow', 'middle', { s: 12 }) + T(264, 176, '3 Details', 'middle', { s: 12 });
}];
IL.drybrush = ['Dry brush strokes that skip over the paper, used for grass and weathered wood.', () => {
  const r = rng(6);
  let s = '', d = '';
  for (let k = 0; k < 4; k++) for (let i = 0; i < 16; i++) { const y = 34 + k * 14 + i * 0.8; let x = 20; d += `M${x} ${f1(y)}`; while (x < 300) { const len = 6 + r() * 30, gap = r() * 8; d += `h${f1(len)}m${f1(gap)} 0`; x += len + gap; } }
  s += P(d, { s: '#7A5A3A', w: 1.1 });
  let g = ''; for (let i = 0; i < 90; i++) { const x = 20 + r() * 280; g += `M${f1(x)} 186q${f1(r() * 8 - 4)} -20 ${f1(r() * 10 - 5)} ${f1(-26 - r() * 30)}`; }
  return s + P(g, { s: '#5E7A3A', w: 1.4 }) + T(306, 28, 'Weathered wood', 'end', { s: 12 }) + T(306, 120, 'Grass', 'end', { s: 12 });
}];
IL.impasto = ['Thick impasto paint ridges with light and shadow on each stroke, and a palette knife.', () => {
  let s = '';
  [['#2F5DA8', 40], ['#7FA6C9', 70], ['#F4F1EA', 100], ['#F2C230', 130]].forEach(([c, y], i) => {
    s += P(`M24 ${y}c40-18 80 14 120-4s70 10 96-6`, { s: '#2B2A2E', w: 16, x: ' opacity=".25"' }) + P(`M24 ${y - 2}c40-18 80 14 120-4s70 10 96-6`, { s: c, w: 14 }) + P(`M28 ${y - 7}c40-18 80 14 120-4s70 10 92-6`, { s: '#FFFFFF', w: 2, x: ' opacity=".7"' });
  });
  s += `<g transform="rotate(-20 280 160)">${P('M250 150h40l10 8-10 8h-40z', { f: '#C9C4CC', s: IG, w: 1.2 })}${Rc(214, 154, 38, 8, { f: '#6B4E32', r: 3 })}</g>`;
  return s + T(16, 190, 'Thick paint keeps the shape of the stroke', 'start', { s: 12 });
}];
IL.collage = ['A torn-paper collage of a fish made from overlapping coloured and patterned paper pieces.', u => {
  const torn = (pts0, seed) => { const r = rng(seed); return pts0.map(([x, y]) => [x + (r() - 0.5) * 6, y + (r() - 0.5) * 6]); };
  let s = Rc(16, 16, 288, 168, { f: '#DCEBF2', r: 6 }) + `<defs><pattern id="${u}p" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#F2C230"/><circle cx="5" cy="5" r="2" fill="#E8782F"/></pattern><pattern id="${u}s" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#22857F"/><rect width="4" height="8" fill="#3E9A4A"/></pattern></defs>`;
  s += poly(torn([[60, 100], [120, 50], [200, 52], [240, 100], [200, 150], [120, 150]], 3), { f: `url(#${u}p)`, s: '#B98A3A', w: 1 });
  s += poly(torn([[236, 100], [290, 60], [284, 100], [290, 140]], 5), { f: `url(#${u}s)`, s: '#1A6B66', w: 1 });
  s += poly(torn([[120, 80], [160, 60], [180, 100], [150, 130]], 8), { f: '#E8782F', x: ' opacity=".85"' }) + C(92, 92, 6, { f: IG });
  return s;
}];
IL.print = ['Simple printmaking: lines drawn into a foam plate, inked and printed, so the picture comes out reversed with white lines.', () => {
  const leaf = (x, flip, c) => P(`M${x} 150c${flip * 10}-40 ${flip * 40}-80 ${flip * 80}-100c${flip * -2} 40 ${flip * -20} 80 ${flip * -80} 100zM${x} 150l${flip * 70}-90M${x + flip * 30} 112l${flip * -2}-22M${x + flip * 46} 92l${flip * 6}-16M${x + flip * 30} 112l${flip * 22}-4M${x + flip * 50} 86l${flip * 18}-2`, { s: c, w: 2.4 });
  let s = Rc(16, 36, 120, 128, { f: '#D9D6DC', s: IG3, r: 6 }) + leaf(40, 1, IG2);
  s += Rc(184, 36, 120, 128, { f: '#2F5DA8', r: 2 }) + leaf(280, -1, '#F4F1EA');
  return s + Ar(144, 100, 176, 100, IACC) + T(76, 186, 'Plate', 'middle', { s: 12 }) + T(244, 186, 'Print (reversed)', 'middle', { s: 12 });
}];

/* ---------- subjects ---------- */
IL.face = ['A front-on face with proportion guidelines: eyes halfway down the head, the nose halfway between eyes and chin, and the mouth a third of the way from nose to chin.', () => {
  let s = E(110, 100, 58, 78, { w: 2 }) + P('M110 22v156', { s: IACC, w: 1, x: dash }) + P('M52 100h116M58 139h104M66 152h88M60 78h100', { s: IACC, w: 1, x: dash });
  s += P('M74 100c8-8 20-8 28 0-8 6-20 6-28 0zM118 100c8-8 20-8 28 0-8 6-20 6-28 0z', { w: 1.6 }) + C(88, 100, 4, { f: IG }) + C(132, 100, 4, { f: IG });
  s += P('M104 108l-6 28c4 4 20 4 24 0l-6-28', { w: 1.4 }) + P('M94 152c10-4 22-4 32 0-10 6-22 6-32 0z', { w: 1.6 }) + P('M52 96c-8 0-10 22 0 40M168 96c8 0 10 22 0 40', { w: 1.6 });
  return s + T(184, 82, 'Brow', 'start', { s: 12 }) + T(184, 104, 'Eyes: halfway', 'start', { s: 12 }) + T(184, 142, 'Nose: halfway again', 'start', { s: 12 }) + T(184, 160, 'Mouth: a third down', 'start', { s: 12 }) + T(184, 124, 'Ears: brow to nose', 'start', { s: 12, w: 400 });
}];
IL.eye = ['A detailed eye: the upper lid casts a shadow on the eyeball, the highlight overlaps the pupil and iris, and the lower lid has thickness.', u => {
  let s = `<defs>${rgradU(u + 'i', [[0, '#3E2A1E'], [0.55, '#7A5A3A'], [1, '#3A2A1E']], 160, 100, 30)}</defs>`;
  s += P('M70 100c30-44 150-44 180 0-30 34-150 34-180 0z', { f: '#F7F4F0', w: 1 }) + C(160, 100, 30, { f: `url(#${u}i)` }) + C(160, 100, 12, { f: '#111' });
  s += P('M70 100c30-44 150-44 180 0', { w: 4.5 }) + P('M74 96c30-30 140-30 172 0', { s: '#6F6B74', w: 8, x: ' opacity=".35"' }) + P('M80 108c40 22 130 22 166-6', { w: 1.6 }) + P('M84 64c40-30 120-30 156 4', { w: 1.2 });
  s += C(170, 90, 6, { f: '#FFFFFF' });
  let l = ''; for (let i = 0; i < 10; i++) { const x = 96 + i * 14, y = 76 - Math.sin((i / 9) * Math.PI) * 10; l += `M${x} ${f1(y)}q${-2 + i * 0.5} -10 ${-4 + i * 1} -16`; } s += P(l, { w: 1.4 });
  return s + lead(300, 40, 176, 90, 'Highlight', 'end') + lead(300, 186, 220, 116, 'Lower lid has thickness', 'end') + lead(20, 186, 74, 102, 'Tear duct');
}];
IL.hand = ['A hand built from simple shapes: a flat box for the palm, fingers in three segments getting shorter, and knuckles in an arc.', () => {
  let s = P('M110 180l-6-70h80l-6 70z', { f: '#F2E2D2', s: IG, w: 1.8 });
  const fingers = [[112, 110, 54, -8], [134, 110, 66, -2], [156, 110, 62, 4], [176, 112, 50, 10]];
  fingers.forEach(([x, y, l, a]) => { const k = [0.42, 0.32, 0.26]; let yy = y, xx = x; k.forEach((f, i) => { const h = l * f, nx = xx + a * f, ny = yy - h; s += P(`M${f1(xx - 8 + i)} ${f1(yy)}L${f1(nx - 7 + i)} ${f1(ny)}L${f1(nx + 7 - i)} ${f1(ny)}L${f1(xx + 8 - i)} ${f1(yy)}z`, { f: '#F2E2D2', s: IG, w: 1.4 }); xx = nx; yy = ny; }); });
  s += P('M104 150l-30-30 8-14 30 26', { f: '#F2E2D2', s: IG, w: 1.6 }) + P('M100 110q44-12 86 4', { s: IACC, w: 1.6, x: dash });
  return s + T(196, 106, 'Knuckles: an arc', 'start', { s: 12, c: IACC }) + T(196, 160, 'Palm: a flat box', 'start', { s: 12 }) + T(16, 40, 'Fingers: 3 parts,', 'start', { s: 12 }) + T(16, 56, 'each shorter', 'start', { s: 12 });
}];
IL.figure = ['A standing figure about eight heads tall, built as a simple mannequin, with the hips at about halfway.', () => {
  let s = '';
  for (let i = 0; i <= 8; i++) s += Ln(54, 12 + i * 22, 66, 12 + i * 22, 1.2, IACC) + (i < 8 ? T(48, 28 + i * 22, i + 1, 'end', { s: 12, c: IACC }) : '');
  s += P('M60 12v176', { s: IACC, w: 1 });
  s += E(160, 23, 9, 11, { f: '#F2E2D2', w: 1.4 }) + P('M160 34v8M138 46h44l-6 50h-32z', { f: '#E7E3E9', s: IG, w: 1.4 }) + P('M144 96h32l4 16h-40z', { f: '#C9C4CC', s: IG, w: 1.4 });
  s += P('M140 48l-10 46 -4 40M180 48l10 46 4 40M150 112l-4 38-2 38M170 112l4 38 2 38', { w: 2.4 }) + C(130, 94, 3, { f: IG }) + C(190, 94, 3, { f: IG }) + C(147, 150, 3, { f: IG }) + C(173, 150, 3, { f: IG });
  return s + Ln(120, 100, 200, 100, 1, ISIE, ' stroke-dasharray="4 3"') + T(206, 104, 'Hips: about halfway', 'start', { s: 12, c: ISIE }) + T(206, 30, 'Adult: 7½–8 heads', 'start', { s: 12 });
}];
IL.animal = ['A cat built from a circle for the head and ovals for the body, then drawn over with a confident outline.', () => {
  let s = C(96, 70, 26, { s: IACC, w: 1.2, x: dash }) + E(170, 116, 60, 36, { s: IACC, w: 1.2, x: dash }) + P('M226 120c30 0 50-30 40-60', { s: IACC, w: 1.2, x: dash });
  s += P('M76 52l-6-28 20 16M110 44l12-22 2 26', { w: 2 }) + P('M72 56c-6 22 8 40 28 40 20 0 30-14 26-34M118 84c20 8 30 0 52-2 40-2 60 14 60 42 0 16-8 26-20 28M120 92c-6 30-4 50 6 56M152 150h10M190 150h12', { w: 2 });
  s += P('M228 124c30-2 46-30 36-62', { w: 2.2 }) + C(88, 66, 2.5, { f: IG }) + C(106, 66, 2.5, { f: IG }) + P('M94 76l3 3 3-3M80 78h-16M80 82l-14 4M110 78h16M110 82l14 4', { w: 1.2 });
  return s + T(16, 186, 'Shapes first (blue), then the outline', 'start', { s: 12 });
}];
IL.tree = ['A tree drawn as clumps of foliage, light on the sunny side and dark on the shadow side, with a cast shadow on the ground.', u => {
  let s = `<defs>${rgradU(u + 'f', [[0, '#A9C98A'], [0.55, '#5E8A45'], [1, '#2F4A26']], 130, 60, 110, 120, 50)}</defs>` + E(196, 180, 90, 8, { f: IG, x: ' opacity=".18"' });
  s += P('M156 182c4-30 2-60-6-80M156 182c6-20 10-36 26-56M150 120l-20-20', { s: '#5A4130', w: 8 });
  [[120, 76, 34], [170, 60, 40], [214, 84, 32], [146, 110, 30], [196, 116, 30]].forEach(([x, y, r]) => { s += C(x, y, r, { f: `url(#${u}f)` }); });
  return s + sun(30, 30) + T(304, 30, 'Clumps, not leaves', 'end', { s: 12 });
}];
IL.sky = ['A sky that is deeper blue at the top and paler near the horizon, with clouds lit on top and shaded underneath, smaller near the horizon.', u => {
  let s = `<defs>${lgrad(u + 's', [[0, '#3E6EA8'], [1, '#D9E6F0']], 0, 0, 0, 1)}${lgrad(u + 'c', [[0, '#FFFFFF'], [0.6, '#F1F1F3'], [1, '#A9AEBA']], 0, 0, 0, 1)}</defs>` + Rc(0, 0, 320, 200, { f: `url(#${u}s)`, r: 10 });
  const cloud = (x, y, k) => P(`M${x} ${y}c${-4 * k} ${-16 * k} ${14 * k} ${-26 * k} ${26 * k} ${-16 * k}c${6 * k} ${-18 * k} ${34 * k} ${-18 * k} ${38 * k} ${2 * k}c${16 * k} ${-6 * k} ${30 * k} ${6 * k} ${26 * k} ${14 * k}z`, { f: `url(#${u}c)` });
  s += cloud(40, 80, 2.2) + cloud(200, 120, 1.3) + cloud(110, 160, 0.8) + cloud(250, 176, 0.6) + P('M0 184h320v16H0z', { f: '#7A8A6A' });
  return s + T(306, 30, 'Lit tops, shaded bases', 'end', { s: 12, c: '#FFFFFF' });
}];
IL.water = ['A post and its reflection directly below it, broken into horizontal bands by ripples.', () => {
  let s = Rc(0, 0, 320, 100, { f: '#E6EEF3', r: 0 }) + Rc(0, 100, 320, 100, { f: '#8FAEC4' }) + P('M0 100h320', { s: '#5E7F96', w: 1.5 });
  s += Rc(150, 34, 16, 66, { f: '#6B4E32' }) + C(222, 40, 12, { f: '#F2C230' });
  for (let i = 0; i < 7; i++) { const y = 104 + i * 10, w = 16 + i * 2; s += Rc(158 - w / 2 + (i % 2 ? 3 : -3), y, w, 6, { f: '#4A3A2A', x: ` opacity="${0.8 - i * 0.07}"` }); }
  let r = ''; for (let i = 0; i < 12; i++) r += `M${20 + (i * 53) % 280} ${110 + (i * 17) % 80}h${20 + (i % 3) * 10}`; s += P(r, { s: '#FFFFFF', w: 2, x: ' opacity=".7"' });
  return s + T(306, 194, 'Reflections drop straight down', 'end', { s: 12, c: '#FFFFFF' });
}];
IL.stilllife = ['A still life of a bottle, an apple and a cup, overlapping at different heights, lit from one side with cast shadows.', u => {
  let s = Ln(8, 160, 312, 160, 1, IG4) + `<defs>${lgrad(u + 'g', [[0, '#2B2A2E', 0.5], [1, '#2B2A2E', 0.04]])}</defs>`;
  s += poly([[108, 160], [140, 160], [230, 176], [190, 178]], { f: `url(#${u}g)` }) + poly([[170, 160], [214, 160], [280, 172], [240, 174]], { f: `url(#${u}g)` });
  s += P('M112 40h16v26c12 6 16 16 16 28v66h-48v-66c0-12 4-22 16-28z', { f: '#D7E3D0', s: IG, w: 1.6 }) + P('M172 120c-14-6-30 6-26 22s20 20 30 16c10 4 26 0 28-16 2-16-14-26-32-22z', { f: '#D9564B', s: IG, w: 1.6 });
  s += P('M206 112h44v40c0 6-4 8-8 8h-28c-4 0-8-2-8-8z', { f: '#F2F0ED', s: IG, w: 1.6 }) + P('M250 122c14 0 14 22 0 22', { w: 1.6 });
  return s + sun(28, 30) + Ar(42, 40, 90, 70, ISIE) + T(160, 194, 'Overlap, vary heights, one light', 'middle', { s: 12 });
}];
IL.drapery = ['A cloth pinned at two points hanging in folds, with shadows inside each fold.', u => {
  let s = `<defs>${lgrad(u + 'g', [[0, '#EDEBE8'], [0.25, '#BDB8C0'], [0.4, '#F7F6F4'], [0.62, '#9A96A0'], [0.8, '#E9E7EA'], [1, '#B6B1BA']])}</defs>`;
  s += P('M60 30c40 60 160 60 200 0v20c-6 50 0 100 14 140H46c14-40 20-90 14-140z', { f: `url(#${u}g)`, s: IG, w: 1.4 });
  s += P('M60 30c40 60 160 60 200 0', { w: 1.6 }) + P('M110 72c-6 40-4 80 4 118M160 80c0 40 2 80 6 110M210 72c6 40 4 80-4 118', { s: IG2, w: 1.2 });
  return s + C(60, 30, 5, { f: ISIE }) + C(260, 30, 5, { f: ISIE }) + T(160, 22, 'Folds hang from the pins', 'middle', { s: 12 });
}];

/* ---------- teaching ---------- */
IL.sketchbook = ['An open sketchbook with small studies: a cup, an eye, a tree, thumbnails and notes.', () => {
  let s = P('M20 40c40-10 90-10 140 4v140c-50-14-100-14-140-4z', { f: '#FBF8F1', s: IG, w: 1.4 }) + P('M160 44c50-14 100-14 140-4v140c-40-10-90-10-140 4z', { f: '#FBF8F1', s: IG, w: 1.4 }) + P('M160 44v140', { s: IG3, w: 1 });
  s += E(70, 80, 20, 6, { w: 1.2 }) + P('M50 80v28a20 6 0 0 0 40 0V80', { w: 1.2 }) + P('M110 70c10-12 30-12 40 0-10 10-30 10-40 0z', { w: 1.2 }) + C(130, 70, 5, { f: IG });
  s += P('M60 160v-24M60 140c-14-4-14-24 0-26 14 2 14 22 0 26z', { w: 1.2 }) + Rc(100, 120, 24, 18, { w: 1 }) + Rc(130, 120, 24, 18, { w: 1 }) + Rc(100, 144, 24, 18, { w: 1 });
  return s + P('M180 70h90M180 84h70M180 98h84M180 130h90M180 144h60', { s: IG3, w: 1.6 }) + P('M190 160c20-20 40 10 60-6', { w: 1.2 });
}];
IL.mastercopy = ['Two frames: a swirling landscape painting on the left and a simplified pencil study of it on the right.', () => {
  let s = Rc(16, 30, 136, 120, { f: '#2A3F7A', s: '#8A6A3A', w: 5 }) + P('M24 60c20-20 40 10 60-6s40-10 56 6M24 86c24-14 46 8 70-4s30-6 50 4', { s: '#E9D77A', w: 3 }) + C(118, 54, 10, { f: '#F2D34A' }) + P('M48 150c4-40 10-70 16-90 6 20 10 50 14 90z', { f: '#1E3A24' }) + P('M16 130c40-10 90-12 136-4v24H16z', { f: '#3E5A8A' });
  s += Rc(168, 30, 136, 120, { f: '#FBF8F1', s: IG3, w: 2 }) + P('M176 60c20-20 40 10 60-6s40-10 56 6M176 86c24-14 46 8 70-4s30-6 50 4', { w: 1.2 }) + C(270, 54, 10, { w: 1.2 }) + P('M200 150c4-40 10-70 16-90 6 20 10 50 14 90z', { w: 1.2 }) + P('M168 130c40-10 90-12 136-4', { w: 1.2 });
  return s + T(84, 172, 'Original', 'middle', { s: 12 }) + T(236, 172, 'Your study', 'middle', { s: 12 });
}];
IL.critique = ['Two speech bubbles around a small artwork: a glow for what worked and a grow for what to try next.', () => {
  let s = Rc(126, 70, 68, 60, { f: '#FBF8F1', s: '#8A6A3A', w: 4 }) + P('M136 118c10-20 20-30 28-20s18 0 22-10', { w: 1.6 }) + C(176, 86, 6, { f: '#F2C230' });
  s += P('M20 30h90a10 10 0 0 1 10 10v36a10 10 0 0 1-10 10H60l-14 14 2-14H20a10 10 0 0 1-10-10V40a10 10 0 0 1 10-10z', { f: '#FBF0D9', s: '#8A5A00', w: 1.4 });
  s += P('M210 110h90a10 10 0 0 1 10 10v36a10 10 0 0 1-10 10h-28l2 14-14-14h-50a10 10 0 0 1-10-10v-36a10 10 0 0 1 10-10z', { f: '#E7EAF8', s: IACC, w: 1.4 });
  return s + T(64, 64, 'Glow', 'middle', { s: 16, c: '#8A5A00', always: true }) + T(256, 144, 'Grow', 'middle', { s: 16, c: IACC, always: true });
}];
IL.demo = ['Three steps of teaching: I do (the teacher demonstrates), we do (together), you do (students on their own).', () => {
  const person = (x, y, k, c) => C(x, y, 8 * k, { f: c }) + P(`M${x - 12 * k} ${y + 34 * k}c0-14 ${6 * k}-22 ${12 * k}-22s${12 * k} 8 ${12 * k} 22z`, { f: c });
  let s = person(50, 70, 1.3, IACC) + Rc(74, 60, 34, 44, { f: '#FBF8F1', s: IG, w: 1.4 }) + P('M80 92l8-12 6 8 8-14', { w: 1.4 });
  s += person(150, 70, 1.3, IACC) + person(180, 80, 1, ISIE);
  s += person(266, 76, 1.1, ISIE) + Rc(284, 70, 26, 32, { f: '#FBF8F1', s: IG, w: 1.4 });
  return s + Ar(112, 100, 132, 100, IG3) + Ar(204, 100, 236, 100, IG3) + T(70, 150, 'I do', 'middle') + T(164, 150, 'We do', 'middle') + T(274, 150, 'You do', 'middle');
}];
IL.pattern = ['Six tiles of patterns: stripes, dots, scales, waves, checks and spirals.', u => {
  let s = '';
  const tile = (i, inner) => { const x = 16 + (i % 3) * 98, y = 16 + Math.floor(i / 3) * 86; return `<clipPath id="${u}${i}"><rect x="${x}" y="${y}" width="90" height="78" rx="6"/></clipPath><g clip-path="url(#${u}${i})">${inner(x, y)}</g>${Rc(x, y, 90, 78, { r: 6, w: 1.2 })}`; };
  s += tile(0, (x, y) => P(hatchD(x, y, 90, 78, 90, 9, 2, 0), { w: 3 }));
  s += tile(1, (x, y) => { let d = ''; for (let i = 0; i < 6; i++) for (let j = 0; j < 5; j++) d += `M${x + 8 + i * 15 + (j % 2) * 7} ${y + 8 + j * 16}h0`; return dots(d, 7); });
  s += tile(2, (x, y) => { let d = ''; for (let j = 0; j < 6; j++) for (let i = -1; i < 7; i++) { const cx = x + i * 16 + (j % 2) * 8, cy = y + j * 14; d += `M${cx} ${cy}a8 8 0 0 0 16 0`; } return P(d, { w: 1.4 }); });
  s += tile(3, (x, y) => { let d = ''; for (let j = 0; j < 7; j++) d += `M${x} ${y + 6 + j * 12}q11-8 22 0t22 0 22 0 22 0 22 0`; return P(d, { w: 1.6 }); });
  s += tile(4, (x, y) => { let d = ''; for (let j = 0; j < 7; j++) for (let i = 0; i < 8; i++) if ((i + j) % 2) d += `M${x + i * 12} ${y + j * 12}h12v12h-12z`; return P(d, { f: IG }); });
  s += tile(5, (x, y) => { let d = ''; for (const [cx, cy] of [[x + 24, y + 22], [x + 66, y + 22], [x + 45, y + 56]]) { d += `M${cx} ${cy}`; for (let a = 0; a < 18; a++) { const r = 1 + a * 0.9, t = a * 0.9; d += `L${f1(cx + Math.cos(t) * r)} ${f1(cy + Math.sin(t) * r)}`; } } return P(d, { w: 1.4 }); });
  return s;
}];
IL.mixedages = ['The same apple at three levels of challenge: a simple outline, a shaded drawing and a detailed rendering.', u => {
  let s = `<defs>${rgradU(u + 'a', [[0, '#FFFFFF'], [0.4, '#C9C5CB'], [0.85, '#57535C'], [1, '#6A6670']], 266, 92, 58, 256, 82)}</defs>`;
  const apple = (x, o) => P(`M${x} 70c-30-14-54 10-48 40 6 28 28 40 48 32 20 8 42-4 48-32 6-30-18-54-48-40z`, o);
  s += apple(56, { w: 2.4 }) + apple(160, { f: '#D7D3DA', w: 1.6 }) + `<clipPath id="${u}c"><path d="M160 70c-30-14-54 10-48 40 6 28 28 40 48 32 20 8 42-4 48-32 6-30-18-54-48-40z"/></clipPath><path d="${hatchD(160, 60, 60, 90, -50, 4, 2)}" stroke="${IG}" stroke-width="1" clip-path="url(#${u}c)"/>`;
  s += apple(264, { f: `url(#${u}a)`, w: 1 }) + E(264, 146, 44, 5, { f: IG, x: ' opacity=".3"' });
  return s + P('M56 70q2-12 10-18M160 70q2-12 10-18M264 70q2-12 10-18', { s: '#6B4E32', w: 3 }) + T(56, 176, 'Support', 'middle', { s: 12 }) + T(160, 176, 'Core', 'middle', { s: 12 }) + T(264, 176, 'Stretch', 'middle', { s: 12 });
}];

/* ---------- wellbeing ---------- */
IL.mandala = ['A mandala of rings of petals, dots and arcs radiating from the centre.', () => {
  let s = '';
  const cx = 160, cy = 100;
  for (let ring = 0; ring < 4; ring++) {
    const n = 8 + ring * 4, r = 18 + ring * 20, c = ['#A82D5E', '#E8782F', '#22857F', '#4A4BA0'][ring];
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r; s += E(x, y, 7, 3.5, { f: c, x: ` transform="rotate(${f1((a * 180) / Math.PI)} ${f1(x)} ${f1(y)})" opacity=".85"` }); }
    s += C(cx, cy, r + 10, { s: IG3, w: 0.8 });
  }
  return s + C(cx, cy, 8, { f: '#F2C230' });
}];
IL.breath = ['Breathing lines: a line that rises with each breath in and falls with each breath out, repeated in calm colours.', () => {
  let s = '';
  ['#4A4BA0', '#22857F', '#3E9A4A', '#9DBE3C', '#2F5DA8'].forEach((c, i) => { let d = `M16 ${50 + i * 24}`; for (let k = 0; k < 6; k++) d += `q24 ${-26 + i * 2} 48 0`; s += P(d, { s: c, w: 3 }); });
  return s + T(16, 30, 'Breathe in: up. Breathe out: down.', 'start', { s: 12 });
}];
IL.weather = ['Inner weather: a sun, a cloud and rain, to show how someone feels today.', () => {
  let s = sun(70, 70, '#E8A23A') + C(70, 70, 14, { f: '#F2C230', s: 'none' });
  s += P('M150 90c-4-16 14-26 26-16 6-18 34-18 38 2 16-6 30 6 26 14z', { f: '#D9DCE3', s: IG3, w: 1.2 }) + P('M240 130c-4-16 14-26 26-16 6-18 34-18 38 2 16-6 30 6 26 14z', { f: '#9AA3B2', s: IG3, w: 1.2, x: ' transform="translate(-60 0)"' });
  s += P('M196 150l-6 14M212 150l-6 14M228 150l-6 14M204 172l-6 14M220 172l-6 14', { s: '#2F5DA8', w: 2.4 });
  return s;
}];
IL.treelife = ['A tree of life: roots for where you come from, a trunk for what holds you up, and branches and leaves for hopes and dreams.', () => {
  let s = P('M160 150c-4-30-4-60 0-90', { s: '#6B4E32', w: 14 }) + P('M160 150c-20 10-40 14-70 18M160 150c0 14 6 26 4 36M160 150c20 10 44 14 74 20M160 152c-10 16-24 24-40 32M160 152c12 16 28 24 44 30', { s: '#8A6A4A', w: 4 });
  [[120, 60], [160, 40], [200, 60], [140, 80], [186, 84], [104, 90], [218, 92]].forEach(([x, y], i) => { s += C(x, y, 18, { f: ['#3E9A4A', '#9DBE3C', '#22857F'][i % 3], x: ' opacity=".85"' }); });
  return s + T(306, 40, 'Hopes', 'end', { s: 12 }) + T(306, 120, 'Strengths', 'end', { s: 12 }) + T(306, 186, 'Roots', 'end', { s: 12 });
}];
IL.bridge = ['A bridge from where I am now on the left to where I want to be on the right, over a river.', () => {
  let s = P('M0 140h70v60H0zM250 140h70v60h-70z', { f: '#B9C9A0' }) + Rc(70, 160, 180, 40, { f: '#8FAEC4' });
  s += P('M60 140c40-60 160-60 200 0', { s: '#8A6A4A', w: 6 }) + P('M70 140h180', { s: '#8A6A4A', w: 4 });
  for (let i = 0; i < 9; i++) { const x = 80 + i * 20, y = 140 - Math.sin((i / 8) * Math.PI) * 44; s += Ln(x, 140, x, f1(y), 2, '#8A6A4A'); }
  return s + C(30, 124, 8, { f: ISIE }) + sun(290, 40) + T(16, 186, 'Now', 'start', { c: '#FFFFFF' }) + T(304, 186, 'Hoped for', 'end', { c: '#FFFFFF' });
}];
