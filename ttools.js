/* Atelier — calming tools: breathe with Dot, the feelings wheel and a weather check-in.
   Nothing personal is saved: the wheel and the check-in tallies only live on screen. */
'use strict';

/* ---------- breathe with Dot ---------- */
const BREATHS = {
  calm: { n: 'Calm breath', d: 'In for 4, out for 6. Longer out-breaths help the body slow down.', who: 'Everyone', ph: [['in', 4], ['out', 6]] },
  balloon: { n: 'Balloon breath', d: 'Blow up a balloon in your tummy, then let it float down. Short and playful.', who: 'Little ones', ph: [['in', 3], ['out', 4]] },
  flower: { n: 'Flower and candle', d: 'Smell the flower, then gently blow out the candle.', who: 'Little ones', ph: [['in', 3, 'Smell the flower'], ['out', 4, 'Blow out the candle']] },
  box: { n: 'Box breathing', d: 'In, hold, out, hold, for 4 each, like tracing the sides of a square.', who: 'Teens and adults', ph: [['in', 4], ['hold', 4], ['out', 4], ['rest', 4]] },
};
const PH_WORD = { in: 'Breathe in', hold: 'Hold', out: 'Breathe out', rest: 'Rest' };
const BR = { running: false, paused: false, t0: 0, acc: 0, raf: 0, done: false, last: '' };
const brPrefs = () => { const b = S.prefs.breath || {}; return { p: BREATHS[b.p] ? b.p : 'calm', mins: [1, 2, 3, 5].includes(b.mins) ? b.mins : 2 }; };
function brStop() { cancelAnimationFrame(BR.raf); Object.assign(BR, { running: false, paused: false, acc: 0, raf: 0, last: '' }); }
function brTick() {
  const view = $('#view'), stage = $('.breathe', view);
  if (!stage || !BR.running) return;
  const pr = brPrefs(), pat = BREATHS[pr.p], cycle = sum(pat.ph.map(x => x[1])), total = pr.mins * 60;
  const el = (BR.paused ? BR.acc : BR.acc + (performance.now() - BR.t0)) / 1000;
  if (el >= total) { brStop(); BR.done = true; render(); return; }
  let t = el % cycle, i = 0;
  while (t >= pat.ph[i][1]) { t -= pat.ph[i][1]; i++; }
  const [kind, secs, word] = pat.ph[i], f = t / secs, ease = x => 0.5 - Math.cos(Math.PI * x) / 2;
  const s = kind === 'in' ? 0.78 + 0.34 * ease(f) : kind === 'out' ? 1.12 - 0.34 * ease(f) : kind === 'hold' ? 1.12 : 0.78;
  if (!reduceMotion()) {
    const dot = $('.dot', stage), halo = $('.halo', stage);
    if (dot) dot.style.transform = `scale(${s.toFixed(3)})`;
    if (halo) halo.style.transform = `scale(${(0.9 + (s - 0.78) * 0.9).toFixed(3)})`;
  }
  const label = word || PH_WORD[kind];
  if (label !== BR.last) { BR.last = label; $('#bphase', stage).textContent = label; }
  $('#bcount', stage).textContent = `${Math.ceil(secs - t)}`;
  $('#bmeter', stage).style.width = `${Math.min(100, (el / total) * 100).toFixed(1)}%`;
  if (!BR.paused) BR.raf = requestAnimationFrame(brTick);
}
TOOLS.breathe = {
  n: 'Breathe with Dot',
  render() {
    const pr = brPrefs(), pat = BREATHS[pr.p];
    if (BR.done) {
      return `<div class="breathe">${dotArt('proud', 'bob')}<p class="phase">Lovely.</p><p class="lead">Notice how your body feels now. Even a minute of slow breathing counts.</p>
        <div class="btn-row" style="justify-content:center"><button type="button" class="btn primary" data-act="again">${icon('repeat')} Go again</button><a class="btn" href="#/therapy">Back to art therapy</a></div></div>`;
    }
    const state = BR.running ? (BR.paused ? 'paused' : 'on') : 'ready';
    return `<div class="breathe"><div class="stage"><span class="ring"></span><span class="halo"></span>${dotArt('calm')}</div>
      <p class="phase" id="bphase" aria-live="polite">${state === 'ready' ? 'Ready when you are' : state === 'paused' ? 'Paused' : BR.last || PH_WORD.in}</p>
      <p class="count" id="bcount" aria-hidden="true">${state === 'ready' ? `${pr.mins} min` : ''}</p>
      <div class="meter" aria-hidden="true"><i id="bmeter"></i></div>
      <div class="btn-row" style="justify-content:center">${state === 'on' ? `<button type="button" class="btn big" data-act="pause">${icon('pause')} Pause</button><button type="button" class="btn big ghost" data-act="stop">Stop</button>`
        : state === 'paused' ? `<button type="button" class="btn big primary" data-act="resume">${icon('play')} Carry on</button><button type="button" class="btn big ghost" data-act="stop">Stop</button>`
        : `<button type="button" class="btn big primary" data-act="start">${icon('play')} Start</button>`}</div></div>
      ${state === 'ready' ? `<div class="sec"><h2>How long</h2></div><div class="chips" role="group" aria-label="How long">${[1, 2, 3, 5].map(m => chip(`${m} min`, pr.mins === m, `data-act="mins" data-v="${m}"`)).join('')}</div>
      <div class="sec"><h2>Way of breathing</h2></div><div class="list pat-list">${Object.entries(BREATHS).map(([k, b]) => `<button type="button" class="lrow${pr.p === k ? ' on' : ''}" data-act="pat" data-v="${k}" aria-pressed="${pr.p === k}"><span class="t"><b>${b.n} · ${b.who}</b><small>${b.d}</small></span>${pr.p === k ? icon('check') : ''}</button>`).join('')}</div>
      <p class="fine" style="margin-top:16px">${icon('info', 'sm')} Breathe gently, never forcing it. If anyone feels dizzy or uncomfortable, let them stop and breathe normally. Some people prefer to keep their eyes open, and that’s fine.</p>` : `<p class="fine" style="text-align:center;margin-top:12px">${esc(pat.n)} · ${pr.mins} min</p>`}`;
  },
  act: {
    start: () => { BR.done = false; Object.assign(BR, { running: true, paused: false, acc: 0, t0: performance.now(), last: '' }); render(); BR.raf = requestAnimationFrame(brTick); },
    pause: () => { BR.acc += performance.now() - BR.t0; BR.paused = true; cancelAnimationFrame(BR.raf); render(); },
    resume: () => { BR.paused = false; BR.t0 = performance.now(); render(); BR.raf = requestAnimationFrame(brTick); },
    stop: () => { brStop(); render(); },
    again: () => { BR.done = false; render(); },
    mins: a => { S.prefs.breath = Object.assign(brPrefs(), { mins: +a.dataset.v }); save(); render(); },
    pat: a => { S.prefs.breath = Object.assign(brPrefs(), { p: a.dataset.v }); save(); render(); },
  },
  after() { return () => { brStop(); BR.done = false; }; },
};

/* ---------- feelings wheel ---------- */
const FEELINGS = [
  { n: 'Happy', c: '#FFE29A', w: ['Joyful', 'Proud', 'Grateful', 'Excited', 'Playful', 'Content'] },
  { n: 'Calm', c: '#BFE8D2', w: ['Peaceful', 'Relaxed', 'Safe', 'Settled', 'Hopeful', 'Cosy'] },
  { n: 'Loved', c: '#F7C6D3', w: ['Cared for', 'Connected', 'Included', 'Valued', 'Trusted', 'Comforted'] },
  { n: 'Surprised', c: '#FFD3B5', w: ['Amazed', 'Curious', 'Confused', 'Shocked', 'Startled', 'Wondering'] },
  { n: 'Angry', c: '#F6B0A4', w: ['Frustrated', 'Annoyed', 'Jealous', 'Fed up', 'Grumpy', 'Irritated'] },
  { n: 'Worried', c: '#DCCBFA', w: ['Nervous', 'Unsure', 'Overwhelmed', 'Stressed', 'Scared', 'Uneasy'] },
  { n: 'Sad', c: '#C4E0F6', w: ['Lonely', 'Disappointed', 'Hurt', 'Left out', 'Homesick', 'Low'] },
  { n: 'Tired', c: '#E2DBE6', w: ['Drained', 'Bored', 'Flat', 'Sleepy', 'Foggy', 'Worn out'] },
];
const FW = { sel: -1 };
function wheelSVG() {
  const R = 150, r0 = 44, n = FEELINGS.length, cx = 160, cy = 160;
  const pt = (rad, a) => `${r1(cx + Math.cos(a) * rad)} ${r1(cy + Math.sin(a) * rad)}`;
  let s = '';
  FEELINGS.forEach((f, i) => {
    const a0 = -Math.PI / 2 + (i * 2 * Math.PI) / n, a1 = a0 + (2 * Math.PI) / n, am = (a0 + a1) / 2;
    const d = `M${pt(r0, a0)}L${pt(R, a0)}A${R} ${R} 0 0 1 ${pt(R, a1)}L${pt(r0, a1)}A${r0} ${r0} 0 0 0 ${pt(r0, a0)}Z`;
    const lx = cx + Math.cos(am) * ((R + r0) / 2 + 6), ly = cy + Math.sin(am) * ((R + r0) / 2 + 6);
    s += `<path class="slice${FW.sel === i ? ' on' : ''}" d="${d}" style="fill:${f.c}" role="button" tabindex="0" aria-pressed="${FW.sel === i}" aria-label="${f.n}" data-act="fam" data-i="${i}"/>
      <text x="${r1(lx)}" y="${r1(ly + 4)}" text-anchor="middle" style="font-size:15px">${f.n}</text>`;
  });
  return `<svg class="wheel" viewBox="0 0 320 320" role="group" aria-label="Feelings wheel">${s}<circle class="hub-c" cx="${cx}" cy="${cy}" r="${r0 - 4}"/>
    ${typeof dotArt === 'function' ? dotArt(FW.sel >= 0 ? 'calm' : 'happy').replace(/^<svg[^>]*>/, `<g transform="translate(${cx - 30} ${cy - 32}) scale(.5)">`).replace(/<\/svg>$/, '</g>') : ''}</svg>`;
}
TOOLS.wheel = {
  n: 'Feelings wheel',
  render() {
    const f = FEELINGS[FW.sel];
    return `<p class="lead">Tap the feeling that’s closest, then find a word that fits even better. There are no wrong answers, and feelings can change.</p>
      ${wheelSVG()}
      <div class="chips" style="justify-content:center;margin-top:8px" role="group" aria-label="Feelings">${FEELINGS.map((x, i) => chip(x.n, FW.sel === i, `data-act="fam" data-i="${i}"`)).join('')}</div>
      ${f ? `<div class="card" style="margin-top:16px;background:${f.c};color:#2E2433;border-color:transparent"><h3 style="color:#2E2433">${f.n}</h3><p style="margin:0 0 8px">Words that might fit:</p>
        <div class="feel-words">${f.w.map(w => `<span class="pill" style="background:#FFFDF9;color:#2E2433;font-size:14px;padding:6px 12px">${w}</span>`).join('')}</div></div>
        <div class="sec"><h2>Ideas for making</h2></div><div class="card"><ul class="doc" style="margin:0;padding-left:22px"><li>Draw “${f.n.toLowerCase()}” as a colour, a line or a shape.</li><li>If it were weather, what weather would it be?</li><li>Make a little creature that feels ${f.w[0].toLowerCase()}. What would help it?</li></ul></div>` : ''}
      <p class="fine" style="margin-top:16px">${icon('lock', 'sm')} Nothing here is saved. Use it with your class on the big screen, or pass the phone around.</p>`;
  },
  act: { fam: a => { const i = +a.dataset.i; FW.sel = FW.sel === i ? -1 : i; render(); } },
  after(view) {
    return bindOnce(view, '_wheel', () => {
      const k = e => { const s = e.target.closest && e.target.closest('.slice'); if (s && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); FW.sel = FW.sel === +s.dataset.i ? -1 : +s.dataset.i; render(); const again = $(`.slice[data-i="${s.dataset.i}"]`, view); if (again) again.focus(); } };
      view.addEventListener('keydown', k);
      return () => view.removeEventListener('keydown', k);
    });
  },
};

/* ---------- weather check-in ---------- */
const WEATHERS = [
  ['sunny', 'Sunny', 'butter'], ['partly', 'Sun and cloud', 'sky'], ['cloudy', 'Cloudy', 'lilac'], ['rainy', 'Rainy', 'sky'],
  ['stormy', 'Stormy', 'lilac'], ['windy', 'Windy', 'mint'], ['foggy', 'Foggy', 'peach'], ['rainbow', 'Rainbow', 'pink'],
];
function wxArt(k) {
  const sun = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" style="fill:#FFD66B" class="a-o"/>${[0, 1, 2, 3, 4, 5, 6, 7].map(i => { const a = (i * Math.PI) / 4; return `<path class="a-thin" d="M${r1(x + Math.cos(a) * (r + 3))} ${r1(y + Math.sin(a) * (r + 3))}L${r1(x + Math.cos(a) * (r + 7))} ${r1(y + Math.sin(a) * (r + 7))}"/>`; }).join('')}`;
  const cloud = (x, y, s, fill = 'var(--card)') => `<path class="a-o" style="fill:${fill}" d="${cloudD(x, y, s)}"/>`;
  const body = {
    sunny: sun(40, 30, 13),
    partly: `${sun(48, 22, 10)}${cloud(28, 48, 0.75)}`,
    cloudy: `${cloud(22, 42, 0.8, '#E2DBE6')}${cloud(36, 50, 0.7)}`,
    rainy: `${cloud(24, 36, 0.8)}<path d="M30 44l-4 8M42 44l-4 8M54 44l-4 8" stroke="#5B9BD5" stroke-width="3" stroke-linecap="round"/>`,
    stormy: `${cloud(24, 34, 0.8, '#C9C0D2')}<path d="M42 38l-8 12h7l-5 10" fill="none" stroke="#E7A000" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"/>`,
    windy: '<path class="a-ink" d="M10 22h34a7 7 0 1 0-7-7M10 32h46a7 7 0 1 1-7 7M10 42h22"/>',
    foggy: '<path class="a-ink" d="M10 18h50M16 28h44M10 38h46M18 48h36" stroke-dasharray="1 0"/>',
    rainbow: '<path d="M12 50a28 28 0 0 1 56 0" fill="none" stroke="#F59AB5" stroke-width="6" stroke-linecap="round"/><path d="M20 50a20 20 0 0 1 40 0" fill="none" stroke="#FFD66B" stroke-width="6" stroke-linecap="round"/><path d="M28 50a12 12 0 0 1 24 0" fill="none" stroke="#8FD6B0" stroke-width="6" stroke-linecap="round"/>',
  }[k] || '';
  return `<svg class="tart" viewBox="0 0 80 60" aria-hidden="true" focusable="false">${body}</svg>`;
}
const WX = { n: {} };
TOOLS.weather = {
  n: 'Weather check-in',
  render() {
    const total = sum(Object.values(WX.n));
    return `<p class="lead">“If your feelings today were weather, what would they be?” Everyone picks one, out loud or by pointing. Any weather is welcome.</p>
      <div class="wx-grid">${WEATHERS.map(([k, n, t]) => `<button type="button" class="wx tint-${t}" data-act="wx" data-k="${k}" aria-label="${n}${WX.n[k] ? `, ${WX.n[k]} so far` : ''}">${wxArt(k)}<span>${n}</span>${WX.n[k] ? `<span class="n" aria-hidden="true">${WX.n[k]}</span>` : ''}</button>`).join('')}</div>
      <p class="t-count" role="status">${total ? `${plural(total, 'person has', 'people have')} checked in` : 'Tap a weather for each person, or use it on your own.'}</p>
      ${total ? `<div class="btn-row"><button type="button" class="btn" data-act="wxundo">${icon('undo')} Undo last</button><button type="button" class="btn ghost" data-act="wxreset">Start again</button></div>` : ''}
      <div class="sec"><h2>Talking about it</h2></div><div class="card"><ul class="doc" style="margin:0;padding-left:22px"><li>“Thanks for sharing your weather. It can change through the day.”</li><li>“What might help on a rainy day?” (only if they’d like to say)</li><li>“Let’s make something that fits today’s weather.”</li></ul></div>
      <p class="fine" style="margin-top:16px">${icon('lock', 'sm')} Not saved anywhere, and no names. It just helps you read the room before you start.</p>`;
  },
  act: {
    wx: a => { const k = a.dataset.k; WX.n[k] = (WX.n[k] || 0) + 1; (WX.log = WX.log || []).push(k); render(); const b = $(`.wx[data-k="${k}"]`); if (b) b.focus(); },
    wxundo: () => { const k = (WX.log || []).pop(); if (k && WX.n[k]) WX.n[k]--; render(); },
    wxreset: () => { WX.n = {}; WX.log = []; render(); },
  },
};
