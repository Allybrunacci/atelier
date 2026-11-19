/* Atelier — the Art therapy tab: hub, activity library and pages, session builder, programs, guides, prompts, glossary and support.
   Wellbeing art for classes, not clinical art therapy: every page keeps that framing and the support lines close by. */
'use strict';

/* ---------- the activity index (every activity file has loaded by now) ---------- */
const AGE_N = { kids: 'Kids', teens: 'Teens', adults: 'Adults', older: 'Older adults' };
const MESS_N = ['', 'Low mess', 'Some mess', 'Messy'];
const DEPTH_N = ['', 'Light and playful', 'Reflective', 'Deeper: take care'];
const MEDIA_N = { draw: 'Drawing', paint: 'Painting', collage: 'Collage', clay: 'Clay', textile: 'Textiles', nature: 'Nature', print: 'Printmaking', words: 'Words', move: 'Movement', mixed: 'Mixed media' };
function guessAges(who) {
  const w = String(who || '').toLowerCase(), all = ['kids', 'teens', 'adults', 'older'];
  if (w.includes('all ages')) return all;
  let m = /ages (\d+) and up/.exec(w);
  if (m) return +m[1] >= 12 ? ['teens', 'adults', 'older'] : all;
  m = /ages (\d+) to (\d+)/.exec(w);
  if (m) return all.filter((k, i) => [[0, 11], [12, 17], [18, 64], [65, 120]][i][0] <= +m[2] && [[0, 11], [12, 17], [18, 64], [65, 120]][i][1] >= +m[1]);
  return all.filter(k => w.includes(k === 'kids' ? 'child' : k === 'older' ? 'older' : k.slice(0, -1)));
}
(function indexTherapy() {
  const meta = typeof THERAPY_META !== 'undefined' ? THERAPY_META : {};
  for (const a of THERAPY) {
    THERAPY_BY[a.id] = a;
    const m = meta[a.id] || {};
    for (const k of ['ages', 'fmt', 'mess', 'media', 'depth']) if (a[k] === undefined && m[k] !== undefined) a[k] = m[k];
    if (!a.ages || !a.ages.length) a.ages = guessAges(a.who);
    if (!a.ages.length) a.ages = ['kids', 'teens', 'adults', 'older'];
    if (!a.fmt) a.fmt = /one-to-one/i.test(a.who) ? (/group/i.test(a.who) ? ['group', 'one'] : ['one']) : ['group'];
    if (!a.mess) a.mess = 1;
    if (!a.depth) a.depth = a.care ? 2 : 1;
    if (!a.media) a.media = ['mixed'];
  }
}());
const TP = typeof TPROMPTS !== 'undefined' ? TPROMPTS : null;
const TG = typeof TGUIDES !== 'undefined' ? TGUIDES : [];
const TGL = typeof TGLOSSARY !== 'undefined' ? TGLOSSARY : [];
const TPR = typeof TPROGRAMS !== 'undefined' ? TPROGRAMS : [];
const TG_BY = Object.fromEntries(TG.map(g => [g.id, g]));
const TPR_BY = Object.fromEntries(TPR.map(p => [p.id, p]));
const themeOf = a => THEME_BY[a.th] || THEMES[0];
const tlist = (arr, tag = 'ul') => `<${tag}>${(arr || []).map(x => `<li>${esc(x)}</li>`).join('')}</${tag}>`;
const lrowLink = (href, ico, title, sub) => `<a class="lrow" href="${href}">${icon(ico)}<span class="t"><b>${title}</b><small>${sub}</small></span>${icon('chev-r', 'go')}</a>`;
const CARE_DEFAULT = 'Invite, never insist: anyone can pass, keep their work private, or take it home. Focus on the making, not on interpreting the art.';
// A view's after() runs on every redraw; this binds its listeners once and unbinds them when the screen changes.
function bindOnce(view, key, bind) {
  if (view[key]) return null;
  const unbind = bind();
  view[key] = true;
  return () => { view[key] = false; unbind(); };
}

/* ---------- support lines (checked on each service’s own website, 19 November 2026) ---------- */
const SUPPORT = [
  { g: 'Right now', items: [
    { n: 'Emergency: police, ambulance, fire', d: 'If someone is in danger or needs urgent help. Stay with them if it’s safe.', tel: '000', em: true },
    { n: 'Lifeline', d: 'Crisis support and suicide prevention, 24 hours.', tel: '13 11 14' },
    { n: 'Suicide Call Back Service', d: 'Counselling for anyone affected by suicide, 24 hours.', tel: '1300 659 467' },
    { n: 'NSW Mental Health Line', d: 'NSW Health advice and referral to mental health services, 24 hours.', tel: '1800 011 511' },
  ] },
  { g: 'Children and young people', items: [
    { n: 'Kids Helpline', d: 'Counselling for young people aged 5 to 25, 24 hours.', tel: '1800 55 1800' },
    { n: 'eheadspace', d: 'Online and phone support for 12 to 25 year olds and their families.', tel: '1800 650 890' },
    { n: 'Parent Line NSW', d: 'Counselling and support for parents and carers.', tel: '1300 1300 52' },
  ] },
  { g: 'Child safety', items: [
    { n: 'Child Protection Helpline (NSW)', d: 'Report concerns that a child or young person is at risk of significant harm, 24 hours.', tel: '13 21 11' },
  ] },
  { g: 'More support', items: [
    { n: 'Beyond Blue', d: 'Support with anxiety, depression and wellbeing, 24 hours.', tel: '1300 22 4636' },
    { n: '13YARN', d: 'Crisis support by and for Aboriginal and Torres Strait Islander people, 24 hours.', tel: '13 92 76' },
    { n: 'QLife', d: 'Peer support for LGBTIQ+ people and their families.', tel: '1800 184 527' },
    { n: 'MensLine Australia', d: 'Support for men with emotional and relationship concerns, 24 hours.', tel: '1300 78 99 78' },
    { n: '1800RESPECT', d: 'Support for anyone affected by sexual, domestic or family violence, 24 hours.', tel: '1800 737 732' },
    { n: 'Griefline', d: 'Support for anyone experiencing grief or loss.', tel: '1300 845 745' },
    { n: 'Butterfly Foundation', d: 'Support with eating disorders and body image.', tel: '1800 33 4673' },
    { n: 'Ageing and Disability Abuse Helpline (NSW)', d: 'Concerns about abuse or neglect of an older person or an adult with disability.', tel: '1800 628 221' },
    { n: 'Carer Gateway', d: 'Support for unpaid carers.', tel: '1800 422 737' },
  ] },
];
const telHref = n => `tel:${n.replace(/\D/g, '')}`;

/* ---------- prompts ---------- */
const PCAT = { self: 'Who I am', feel: 'Feelings', calm: 'Calm', hope: 'Hope', memory: 'Memories', nature: 'Nature', imagine: 'Imagination', people: 'People', gratitude: 'Gratitude', kids: 'For little ones' };
const THU = { n: 0 };
function promptOfDay(n = 0) {
  if (!TP || !TP.draw) return null;
  const flat = Object.keys(TP.draw).flatMap(c => TP.draw[c].map(p => [c, p]));
  return flat.length ? flat[Math.floor(rng(`${today()}#prompt${n}`)() * flat.length)] : null;
}
function usePrompt(text) {
  pickSession({
    title: 'Use this prompt for…', onPick: o => {
      const s = sessionOf(o, true);
      s.note = s.note ? `${s.note}\nPrompt: ${text}` : `Prompt: ${text}`;
      if (!s.topic) s.topic = text;
      save();
      toast(`${icon('check')} Added to ${esc(o.c.name)}, ${fmtDate(o.date)}`);
    },
  });
}

/* ---------- the hub ---------- */
const TOOL_TILES = [
  { href: '#/tool/breathe', art: 'breathe', n: 'Breathe with Dot', d: 'Slow, guided breathing', tint: 'sky' },
  { href: '#/tool/mandala', art: 'draw', n: 'Mandala maker', d: 'Draw with mirrored symmetry', tint: 'pink' },
  { href: '#/tool/scribble', art: 'joy', n: 'Scribble pad', d: 'Free, calm finger drawing', tint: 'butter' },
  { href: '#/tool/wheel', art: 'wheel', n: 'Feelings wheel', d: 'Find words for feelings', tint: 'peach' },
  { href: '#/tool/weather', art: 'weather', n: 'Weather check-in', d: 'How is the room feeling?', tint: 'mint' },
  { href: '#/printables', art: 'print', n: 'Printables', d: 'Mandalas, worksheets and cards', tint: 'lilac' },
];
const tile = t => `<a class="t-tile tint-${t.tint}" href="${t.href}">${themeArt(t.art)}<b>${t.n}</b><small>${t.d}</small></a>`;
VIEWS.therapy = {
  title: 'Art therapy',
  head() { return { deco: true, title: 'Art therapy', sub: 'Wellbeing through making', actions: `<div class="vh-act"><a class="icon-btn" href="#/settings" aria-label="Settings">${icon('cog')}</a></div>` }; },
  render() {
    const pod = promptOfDay(THU.n), favs = Object.keys(S.favs).filter(k => k.startsWith('a:') && THERAPY_BY[k.slice(2)]).sort((a, b) => S.favs[b] - S.favs[a]);
    let h = `<a class="t-help" href="#/support">${icon('phone')}<span>Need support now? Helplines</span>${icon('chev-r')}</a>
      <div class="t-hero"><div><h2>Take a breath</h2><p>A minute or two of slow breathing with Dot, for you or your class.</p><a class="btn primary" href="#/tool/breathe">${icon('wind')} Breathe with Dot</a></div>${dotArt('calm', 'bob')}</div>`;
    if (pod) h += `<div class="sec"><h2>Today’s prompt</h2><a class="link" href="#/prompts/draw">All prompts</a></div>
      <div class="t-note"><p class="kicker">${esc(PCAT[pod[0]] || 'Drawing prompt')}</p><p class="p">${esc(pod[1])}</p>
      <div class="btn-row"><button type="button" class="btn sm" data-act="another">${icon('shuffle', 'sm')} Another</button><button type="button" class="btn sm soft" data-act="usepod">${icon('plus', 'sm')} Use in a class</button></div></div>`;
    h += `<div class="sec"><h2>Calming tools</h2></div><div class="t-grid">${TOOL_TILES.map(tile).join('')}</div>`;
    h += `<div class="sec"><h2>Activities</h2><a class="link" href="#/activities">All ${THERAPY.length}</a></div>
      <div class="t-grid">${THEMES.map(th => { const n = THERAPY.filter(a => a.th === th.id).length; return `<a class="t-tile tint-${th.c}" href="#/activities/${th.id}">${themeArt(th.id)}<b>${esc(th.n)}</b><small>${plural(n, 'activity', 'activities')}</small></a>`; }).join('')}</div>`;
    h += `<div class="sec"><h2>Plan</h2></div><div class="hub">
      <a class="card hub-card" href="#/tplan"><span class="hub-ico k">${icon('plan')}</span><span class="t"><h3>Plan a wellbeing session</h3><p>Check-in, warm-up, activity, reflection and a calm close, timed for your class.</p></span>${icon('chev-r', 'go')}</a>
      ${TPR.length ? `<a class="card hub-card" href="#/programs"><span class="hub-ico p">${icon('calendar')}</span><span class="t"><h3>Programs</h3><p>${plural(TPR.length, 'multi-week program')} to run across a term, ready to add to a class.</p></span>${icon('chev-r', 'go')}</a>` : ''}</div>`;
    h += `<div class="sec"><h2>Learn</h2></div><div class="list">
      ${TG.length ? lrowLink('#/guides', 'book', 'Guides', `${TG.length} short guides: safe spaces, talking about art, big feelings, duty of care and more`) : ''}
      ${TP ? lrowLink('#/prompts', 'chat', 'Prompts and phrases', 'Check-ins, warm-ups, drawing prompts, reflection questions, closings and affirmations') : ''}
      ${TGL.length ? lrowLink('#/glossary', 'info', 'Glossary', `${TGL.length} terms in plain words`) : ''}
      ${lrowLink('#/support', 'phone', 'Support and helplines', 'Who to call, for you or the people you teach')}</div>`;
    if (favs.length) h += `<div class="sec"><h2>Favourites</h2></div>${favs.map(k => actCard(THERAPY_BY[k.slice(2)])).join('')}`;
    h += `<div class="callout care" style="margin-top:28px">${icon('heart')}<div><p>These are wellbeing art activities: making art to feel calmer, express feelings and connect, with no right or wrong results. Art therapy itself is a clinical practice delivered by a qualified art therapist (in Australia, usually a member of ANZACATA).</p>
      <p>${TG_BY['what-is'] ? `<a href="#/guide/what-is">What art therapy is (and isn’t)</a> · ` : ''}<a href="#/support">Support and helplines</a></p></div></div>`;
    return h;
  },
  act: { another: () => { THU.n++; render(); }, usepod: () => { const p = promptOfDay(THU.n); if (p) usePrompt(p[1]); } },
};

/* ---------- the activity library ---------- */
const TF = { q: '', th: '', age: '', fmt: '', time: '', mess: '', depth: '', open: false, p: null };
const TF_GROUPS = [
  ['age', 'Who', [['kids', 'Kids'], ['teens', 'Teens'], ['adults', 'Adults'], ['older', 'Older adults']]],
  ['fmt', 'Class', [['group', 'Group'], ['one', 'One-to-one']]],
  ['time', 'Time', [['s', 'Up to 20 min'], ['m', '25–40 min'], ['l', 'Longer']]],
  ['mess', 'Mess', [['1', 'Low mess only'], ['2', 'Some mess is fine']]],
  ['depth', 'Depth', [['1', 'Light'], ['2', 'Reflective'], ['3', 'Deeper']]],
];
function actMatch(a) {
  const q = TF.q.trim().toLowerCase();
  if (TF.th && a.th !== TF.th) return false;
  if (TF.age && !a.ages.includes(TF.age)) return false;
  if (TF.fmt && !a.fmt.includes(TF.fmt)) return false;
  if (TF.time && !(TF.time === 's' ? a.mins <= 20 : TF.time === 'm' ? a.mins > 20 && a.mins <= 40 : a.mins > 40)) return false;
  if (TF.mess && a.mess > +TF.mess) return false;
  if (TF.depth && a.depth !== +TF.depth) return false;
  if (q && !`${a.n} ${a.sum} ${a.purpose} ${(a.mat || []).join(' ')} ${themeOf(a).n}`.toLowerCase().includes(q)) return false;
  return true;
}
const nFilters = () => ['age', 'fmt', 'time', 'mess', 'depth'].filter(k => TF[k]).length;
function actCard(a) {
  const th = themeOf(a);
  return `<a class="card acard tint-${th.c}" href="#/activity/${a.id}"><span class="art-mini" aria-hidden="true">${actArt(a)}</span><span class="t"><b>${esc(a.n)}${isFav('a:' + a.id) ? ` ${icon('star-fill', 'sm')}` : ''}</b><small>${esc(a.sum)}</small><small>${fmtMins(a.mins)} · ${esc(a.who)}</small></span></a>`;
}
function actList() {
  const hits = THERAPY.filter(actMatch);
  if (!hits.length) return emptyState('search', 'Nothing matches', 'Try fewer filters or another word.', '<button type="button" class="btn" data-act="clear">Clear filters</button>');
  if (TF.th || TF.q.trim()) return hits.map(actCard).join('');
  return THEMES.map(th => { const as = hits.filter(a => a.th === th.id); return as.length ? `<div class="theme-head tint-${th.c}" id="th-${th.id}" style="scroll-margin-top:16px"><div><h2>${esc(th.n)}</h2><p>${esc(th.d)}</p></div>${themeArt(th.id)}</div>${as.map(actCard).join('')}` : ''; }).join('');
}
const actCount = () => { const n = THERAPY.filter(actMatch).length; return n === THERAPY.length ? `All ${n} activities` : `${plural(n, 'activity', 'activities')} match`; };
VIEWS.activities = {
  tab: 'therapy', title: 'Activities',
  head() { return { back: '#/therapy', title: 'Activities', sub: `${THERAPY.length} wellbeing activities for classes` }; },
  render(p) {
    if (p !== TF.p) { TF.p = p; TF.th = THEME_BY[p] ? p : ''; }
    const nf = nFilters();
    return `<div class="search">${icon('search')}<input type="search" id="aq" value="${esc(TF.q)}" placeholder="Search, e.g. clay, worries, calm" aria-label="Search activities"></div>
      <div class="chips scroll" role="group" aria-label="Theme">${chip('All themes', !TF.th, 'data-act="th" data-v=""')}${THEMES.map(th => chip(esc(th.n), TF.th === th.id, `data-act="th" data-v="${th.id}"`)).join('')}</div>
      <details class="more"${TF.open ? ' open' : ''} id="tfd"><summary>${icon('chev-d')} Filters${nf ? ` (${nf} on)` : ''}</summary><div class="t-filters">
        ${TF_GROUPS.map(([k, label, opts]) => `<div><p class="g-l">${label}</p><div class="chips" role="group" aria-label="${label}">${opts.map(([v, l]) => chip(l, TF[k] === v, `data-act="f" data-k="${k}" data-v="${v}"`)).join('')}</div></div>`).join('')}
        ${nf ? '<div><button type="button" class="btn sm ghost" data-act="clear">Clear filters</button></div>' : ''}</div></details>
      <p class="t-count" id="acount" role="status">${actCount()}</p><div id="al">${actList()}</div>`;
  },
  act: {
    th: a => { TF.th = a.dataset.v; redrawActs('[data-act="th"][data-v="' + a.dataset.v + '"]'); },
    f: a => { const k = a.dataset.k; TF[k] = TF[k] === a.dataset.v ? '' : a.dataset.v; redrawActs(`[data-act="f"][data-k="${k}"][data-v="${a.dataset.v}"]`); },
    clear: () => { Object.assign(TF, { q: '', th: '', age: '', fmt: '', time: '', mess: '', depth: '' }); redrawActs('#aq'); },
  },
  after(view) {
    return bindOnce(view, '_acts', () => {
      const f = e => { if (e.target.id === 'aq') { TF.q = e.target.value; $('#al', view).innerHTML = actList(); $('#acount', view).textContent = actCount(); } };
      const t = e => { if (e.target.id === 'tfd') TF.open = e.target.open; };
      view.addEventListener('input', f);
      view.addEventListener('toggle', t, true);
      return () => { view.removeEventListener('input', f); view.removeEventListener('toggle', t, true); };
    });
  },
};
function redrawActs(focusSel) {
  const d = $('#tfd');
  if (d) TF.open = d.open;
  render();
  const el = focusSel && $(focusSel, $('#view'));
  if (el) el.focus({ preventScroll: true });
}

/* ---------- one activity ---------- */
VIEWS.activity = {
  tab: 'therapy', title: 'Activity',
  head(id) {
    const a = THERAPY_BY[id];
    if (!a) return { back: '#/activities', title: 'Not found' };
    return { back: `#/activities/${a.th}`, kicker: esc(themeOf(a).n), title: esc(a.n), actions: `<div class="vh-act">${favBtn('a:' + id)}</div>` };
  },
  render(id) {
    const a = THERAPY_BY[id];
    if (!a) return emptyState('warn', 'Activity not found', 'It may have been renamed in an update.', '<a class="btn" href="#/activities">All activities</a>');
    const th = themeOf(a), sib = THERAPY.filter(x => x.th === a.th), i = sib.indexOf(a), prev = sib[i - 1], next = sib[i + 1];
    const used = Object.entries(S.sessions).filter(([, s]) => (s.tech || []).includes('a:' + id)).map(([k]) => occByKey(k)).filter(Boolean).sort((x, y) => (x.date < y.date ? 1 : -1));
    return `<div class="a-hero tint-${th.c}">${actArt(a)}</div>
      <div class="meta-chips"><span class="pill">${icon('clock', 'sm')} ${fmtMins(a.mins)}</span><span class="pill">${icon('users', 'sm')} ${esc(a.who)}</span>
        <span class="pill">${MESS_N[a.mess] || ''}</span><span class="pill${a.depth === 3 ? ' care' : ''}">${a.depth === 3 ? icon('heart', 'sm') + ' ' : ''}${DEPTH_N[a.depth] || ''}</span>
        ${(a.media || []).map(m => `<span class="pill">${MEDIA_N[m] || esc(m)}</span>`).join('')}</div>
      <div class="doc"><p class="lead" style="margin-top:12px">${esc(a.purpose)}</p>
      <h3>You’ll need</h3>${tlist(a.mat)}
      <h3>Steps</h3>${tlist(a.steps, 'ol')}
      <h3>Things you might say</h3>${tlist(a.prompts)}
      <h3>Adapting it</h3>${tlist(a.adapt)}
      <h3>Reflecting afterwards</h3>${tlist(a.reflect)}
      ${a.care ? `<div class="callout care" style="margin-top:16px">${icon('heart')}<div><p><b>Take care.</b> ${esc(a.care)}</p></div></div>` : ''}
      <div class="callout" style="margin-top:12px">${icon('info')}<p>${CARE_DEFAULT}</p></div></div>
      ${used.length ? `<div class="sec"><h2>Used with</h2></div><div class="list">${used.slice(0, 8).map(o => `<button type="button" class="lrow" data-act="open" data-key="${esc(o.key)}"><span class="sw" style="--c:${o.c.color}"></span><span class="t"><b>${esc(o.c.name)}</b><small>${fmtDate(o.date, { long: true })}</small></span>${icon('chev-r', 'go')}</button>`).join('')}</div>` : ''}
      <div class="btn-row" style="margin-top:24px"><button type="button" class="btn primary" data-act="add">${icon('plus')} Add to a class</button><a class="btn soft" href="#/tplan/${a.id}">${icon('plan')} Plan a session with it</a></div>
      <div class="btn-row" style="justify-content:space-between">${prev ? `<a class="btn ghost" href="#/activity/${prev.id}">${icon('chev-l')} ${esc(prev.n)}</a>` : '<span></span>'}${next ? `<a class="btn ghost" href="#/activity/${next.id}">${esc(next.n)} ${icon('chev-r')}</a>` : ''}</div>`;
  },
  act: { fav: a => toggleFav(a.dataset.k), add: () => addToClass('a:' + UI.param), open: a => openSession(a.dataset.key) },
};

/* ---------- a wellbeing session: check in, warm up, make, reflect, close ---------- */
function therapySheet(p, mins = 60) {
  const prof = [['Arrive and check in', 0.1, 'open'], ['Warm-up', 0.12, 'warm'], ['Make', 0.53, 'make'], ['Reflect and share', 0.15, 'share'], ['Close', 0.1, 'close']];
  const step = mins >= 45 ? 5 : 1, units = Math.max(prof.length, Math.round(mins / step));
  const raw = prof.map(x => x[1] * units), fl = raw.map(r => Math.max(1, Math.floor(r)));
  let left = units - sum(fl);
  raw.map((r, i) => [r - Math.floor(r), i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (left > 0) { fl[i]++; left--; } });
  while (left < 0) { const i = fl.indexOf(Math.max(...fl)); fl[i]--; left++; }
  return prof.map((x, i) => [fl[i] * step, x[0], p[x[2]] || '']);
}
function wellbeingPlan(act, o = {}) {
  const R = rng(`tplan#${act.id}#${o.n || 0}`), pick = arr => (arr && arr.length ? arr[Math.floor(R() * arr.length)] : null);
  const warmOk = TP ? TP.warmup.filter(w => w.mins <= Math.max(3, Math.round((o.mins || 60) * 0.12))) : [];
  const warm = pick(warmOk.length ? warmOk : TP ? TP.warmup : []), close = TP ? pick(TP.closing) : null;
  return {
    kind: 'therapy', from: o.from || 'Wellbeing session', wk: o.wk || 0, t: o.t || act.n, aim: o.aim || act.sum, tech: ['a:' + act.id], act: act.id,
    open: o.open || (TP ? pick(TP.checkin) : 'Invite everyone to choose a colour for how they feel today.'),
    warm: warm ? `${warm.n}. ${warm.d}` : 'A minute of slow, loose scribbling to music.',
    make: `${act.n}. ${act.sum}`,
    share: (act.reflect || []).slice(0, 2).join(' ') || (TP ? pick(TP.reflect) : ''),
    close: o.close || (close ? `${close.n}. ${close.d}` : 'One slow breath together, then pack up.'),
  };
}
const TPL = { mins: 60, age: 'kids', th: 'calm', act: '', fixed: false, n: 0, deep: false, p: null };
function tplActivity() {
  if (TPL.act && THERAPY_BY[TPL.act]) return THERAPY_BY[TPL.act];
  const fits = a => a.th === TPL.th && a.ages.includes(TPL.age) && a.mins <= Math.round(TPL.mins * 0.7) && (TPL.deep || a.depth < 3);
  let pool = THERAPY.filter(fits);
  if (!pool.length) pool = THERAPY.filter(a => a.th === TPL.th && a.ages.includes(TPL.age));
  if (!pool.length) pool = THERAPY.filter(a => a.th === TPL.th);
  if (!pool.length) pool = THERAPY.filter(a => a.ages.includes(TPL.age) && a.depth < 3);
  if (!pool.length) pool = THERAPY;
  return pool[Math.floor(rng(`${TPL.th}|${TPL.age}|${TPL.mins}|${TPL.n}`)() * pool.length)];
}
function runList(p, mins) {
  return `<ul class="run">${therapySheet(p, mins).map(r => `<li><b>${r[0]} min</b><span><em>${esc(r[1])}</em>${esc(r[2])}</span></li>`).join('')}</ul>`;
}
VIEWS.tplan = {
  tab: 'therapy', title: 'Plan a wellbeing session',
  head() { return { back: '#/therapy', title: 'Plan a session', sub: 'A gentle shape for a wellbeing class' }; },
  render(id) {
    if (id !== TPL.p) { TPL.p = id; const a = THERAPY_BY[id]; TPL.act = a ? a.id : ''; TPL.fixed = !!a; if (a) { TPL.th = a.th; if (!a.ages.includes(TPL.age)) TPL.age = a.ages[0]; } }
    const act = tplActivity(), th = themeOf(act), p = wellbeingPlan(act, { n: TPL.n, mins: TPL.mins });
    return `<div class="field"><span class="f-l">Length</span>${seg('mins', [[30, '30 min'], [45, '45 min'], [60, '1 h'], [90, '1 h 30 min']], TPL.mins)}</div>
      <div class="field"><span class="f-l">Who it’s for</span>${seg('age', Object.entries(AGE_N), TPL.age)}</div>
      <div class="field"><span class="f-l">Focus</span><div class="chips">${THEMES.map(t => chip(esc(t.n), TPL.th === t.id, `data-act="th" data-v="${t.id}"`)).join('')}</div></div>
      <label class="check"><input type="checkbox" id="tdeep"${TPL.deep ? ' checked' : ''}><span>Include deeper activities<small>Ones that touch on personal things need more care. Leave this off for most classes.</small></span></label>
      <div class="card plan-card" style="--c:var(--accent);margin-top:12px"><p class="kicker" style="margin:0">Your session · ${fmtMins(TPL.mins)}</p>
        <h3 style="margin:4px 0 2px"><a class="h-link" href="#/activity/${act.id}">${esc(act.n)}</a></h3><p class="fine" style="margin:0 0 4px">${esc(th.n)} · ${fmtMins(act.mins)} · ${esc(act.who)}</p>
        ${runList(p, TPL.mins)}</div>
      <div class="btn-row"><button type="button" class="btn" data-act="shuffle">${icon('shuffle')} Shuffle</button><button type="button" class="btn" data-act="pick">${icon('list')} Choose the activity</button></div>
      <div class="btn-row"><button type="button" class="btn primary grow" data-act="use">${icon('plus')} Add to a class</button></div>`;
  },
  act: {
    th: a => { TPL.th = a.dataset.v; TPL.act = ''; TPL.fixed = false; render(); },
    shuffle: () => { TPL.n++; if (!TPL.fixed) TPL.act = ''; render(); },
    pick: () => {
      const as = THERAPY.filter(a => a.th === TPL.th && a.ages.includes(TPL.age));
      const sh = openSheet(`${sheetHead('Choose the activity', esc(THEME_BY[TPL.th].n))}<div class="list">${(as.length ? as : THERAPY.filter(a => a.th === TPL.th)).map(a => `<button type="button" class="lrow" data-act="choose" data-id="${a.id}"><span class="t"><b>${esc(a.n)}</b><small>${fmtMins(a.mins)} · ${esc(a.sum)}</small></span>${icon('chev-r', 'go')}</button>`).join('')}</div>`,
        { label: 'Choose the activity', act: { choose: b => { TPL.act = b.dataset.id; TPL.fixed = true; sh.close(); render(); } } });
    },
    use: () => {
      const act = tplActivity(), p = wellbeingPlan(act, { n: TPL.n, mins: TPL.mins });
      pickSession({
        title: `Add “${esc(act.n)}” to…`, onPick: o => {
          const s = sessionOf(o, true), before = { plan: s.plan, tech: (s.tech || []).slice(), topic: s.topic };
          p.age = TPL.age;
          s.plan = p;
          s.tech = [...new Set((s.tech || []).concat('a:' + act.id))];
          if (!s.topic) s.topic = act.n;
          save();
          toast(`${icon('check')} Session plan added to ${esc(o.c.name)}, ${fmtDate(o.date)}`, { undo: () => { s.plan = before.plan; s.tech = before.tech; s.topic = before.topic; save(); render(); } });
        },
      });
    },
  },
  after(view) {
    return bindOnce(view, '_tplan', () => {
      const segH = e => { const b = e.target.closest('[data-seg]'); if (!b || !view.contains(b)) return; e.preventDefault(); const k = b.dataset.seg; if (k === 'mins') TPL.mins = +b.dataset.v; if (k === 'age') TPL.age = b.dataset.v; if (!TPL.fixed) TPL.act = ''; render(); };
      const chk = e => { if (e.target.id === 'tdeep') { TPL.deep = e.target.checked; if (!TPL.fixed) TPL.act = ''; render(); } };
      view.addEventListener('click', segH);
      view.addEventListener('change', chk);
      return () => { view.removeEventListener('click', segH); view.removeEventListener('change', chk); };
    });
  },
};

/* ---------- multi-week programs ---------- */
VIEWS.programs = {
  tab: 'therapy', title: 'Programs',
  head() { return { back: '#/therapy', title: 'Programs', sub: 'Multi-week wellbeing programs for a term' }; },
  render() {
    if (!TPR.length) return emptyState('plan', 'No programs yet', 'They’ll appear here after the next update.');
    return `<p class="lead">Each program builds week by week, from feeling settled and safe, to expressing, to celebrating. Add one to a class and each week’s activity and running sheet appear in that class’s sessions.</p>
      ${TPR.map(p => { const th = THEME_BY[p.th] || THEMES[0]; return `<a class="card acard prog-card tint-${th.c}" href="#/program/${p.id}"><span class="art-mini" aria-hidden="true">${icon(th.icon)}</span><span class="t"><b>${esc(p.n)}</b><small>${esc(p.sum)}</small><small class="meta">${plural(p.weeks.length, 'week')} · ${fmtMins(p.mins)} sessions · ${esc(p.for)}</small></span>${icon('chev-r', 'go')}</a>`; }).join('')}`;
  },
};
VIEWS.program = {
  tab: 'therapy', title: 'Program',
  head(id) { const p = TPR_BY[id]; return p ? { back: '#/programs', kicker: 'Program', title: esc(p.n) } : { back: '#/programs', title: 'Not found' }; },
  render(id) {
    const p = TPR_BY[id];
    if (!p) return emptyState('warn', 'Program not found', '', '<a class="btn" href="#/programs">All programs</a>');
    const th = THEME_BY[p.th] || THEMES[0];
    return `<div class="a-hero tint-${th.c}">${themeArt('programs')}</div>
      <div class="meta-chips"><span class="pill">${icon('calendar', 'sm')} ${plural(p.weeks.length, 'week')}</span><span class="pill">${icon('clock', 'sm')} ${fmtMins(p.mins)} sessions</span><span class="pill">${icon('users', 'sm')} ${esc(p.for)}</span></div>
      <p class="lead" style="margin-top:12px">${esc(p.intro)}</p>
      <ol class="weeks tint-${th.c}">${p.weeks.map((w, i) => { const a = THERAPY_BY[w.a]; return `<li><span class="wno" aria-hidden="true">wk<b>${i + 1}</b></span><div><p class="wt" style="margin:0"><span class="vh">Week ${i + 1}: </span>${esc(w.t)}</p>
        ${a ? `<a class="wa" href="#/activity/${a.id}">${icon(themeOf(a).icon, 'sm')} ${esc(a.n)}</a>` : ''}<p class="wd">${esc(w.why)}</p>
        <details class="more"><summary>${icon('chev-d')} Opening and closing</summary><p class="fine" style="margin:0 0 6px"><b>Check-in:</b> ${esc(w.open)}</p><p class="fine" style="margin:0"><b>Close:</b> ${esc(w.close)}</p></details></div></li>`; }).join('')}</ol>
      <div class="btn-row" style="margin-top:20px"><button type="button" class="btn primary grow" data-act="use">${icon('plus')} Use with a class</button></div>
      <p class="fine" style="margin-top:12px">${icon('info', 'sm')} Adds week 1 to the class’s next session, week 2 to the one after, and so on. You can change or undo any of it.</p>`;
  },
  act: { use: () => chooseClassForProgram(TPR_BY[UI.param]) },
};
function chooseClassForProgram(p) {
  if (!p) return;
  const cls = liveClasses();
  if (!cls.length) { toast('Add a class first, then you can add a program to it.'); return; }
  const sh = openSheet(`${sheetHead('Which class?', `${esc(p.n)} · ${plural(p.weeks.length, 'week')}`)}<div class="list">${cls.map(c => { const ups = upcoming(c, p.weeks.length); return `<button type="button" class="lrow" data-act="pick" data-id="${c.id}"><span class="sw" style="--c:${c.color}"></span><span class="t"><b>${esc(c.name)}</b><small>${ups.length ? `From ${fmtDate(ups[0].date, { long: true })}${ups.length < p.weeks.length ? `, only ${ups.length} classes coming up` : ''}` : 'No classes coming up'}</small></span>${icon('chev-r', 'go')}</button>`; }).join('')}</div>`,
    { label: 'Which class?', act: { pick: b => { sh.close(); applyProgram(p, S.classes[b.dataset.id]); } } });
}
async function applyProgram(p, c) {
  const ups = upcoming(c, p.weeks.length);
  if (!ups.length) { toast(`${esc(c.name)} has no classes coming up.`); return; }
  const planned = ups.filter(o => o.s && (o.s.plan || o.s.topic)).length;
  if (planned && !(await ask({ title: 'Replace what’s planned?', body: `${plural(planned, 'of these classes already has', 'of these classes already have')} a topic or plan. The program’s weeks will replace them. You can undo straight after.`, ok: 'Replace', cancel: 'Keep mine' }))) return;
  const before = ups.map(o => { const s = sessionOf(o, true); return [s, { plan: s.plan, tech: (s.tech || []).slice(), topic: s.topic }]; });
  ups.forEach((o, i) => {
    const w = p.weeks[i], a = THERAPY_BY[w.a];
    if (!a) return;
    const s = sessionOf(o, true);
    s.plan = Object.assign(wellbeingPlan(a, { n: i, mins: p.mins, from: p.n, wk: i + 1, t: w.t, aim: w.why, open: w.open, close: w.close }), { age: p.ages[0] });
    s.tech = [...new Set((s.tech || []).filter(x => !x.startsWith('a:')).concat('a:' + a.id))];
    s.topic = w.t;
  });
  save();
  render();
  toast(`${icon('check')} ${esc(p.n)} added to the next ${plural(ups.length, 'class', 'classes')} of ${esc(c.name)}`, { ms: 7000, undo: () => { before.forEach(([s, b]) => Object.assign(s, b)); save(); render(); } });
}

/* ---------- guides ---------- */
VIEWS.guides = {
  tab: 'therapy', title: 'Guides',
  head() { return { back: '#/therapy', title: 'Guides', sub: 'Running wellbeing art with care' }; },
  render() {
    if (!TG.length) return emptyState('book', 'Guides are on their way', 'They’ll appear here after the next update.');
    return `<div class="list">${TG.map(g => lrowLink(`#/guide/${g.id}`, ICON_OK(g.icon), esc(g.n), esc(g.sum))).join('')}</div>
      <div class="list" style="margin-top:16px">${TP && TP.talk ? lrowLink('#/prompts/talk', 'chat', 'Talking about art: what to say', 'Helpful phrases, and ones to avoid') : ''}${TGL.length ? lrowLink('#/glossary', 'info', 'Glossary', `${TGL.length} terms in plain words`) : ''}</div>`;
  },
};
const ICON_OK = id => (document.getElementById(`i-${id}`) ? id : 'book');
VIEWS.guide = {
  tab: 'therapy', title: 'Guide',
  head(id) { const g = TG_BY[id]; return g ? { back: '#/guides', kicker: 'Guide', title: esc(g.n) } : { back: '#/guides', title: 'Not found' }; },
  render(id) {
    const g = TG_BY[id];
    if (!g) return emptyState('warn', 'Guide not found', '', '<a class="btn" href="#/guides">All guides</a>');
    const i = TG.indexOf(g), prev = TG[i - 1], next = TG[i + 1];
    const say = (arr, cls, lab) => (arr && arr.length ? `<ul class="say-list">${arr.map(x => `<li class="${cls}"><span class="lab">${lab}</span><span>${esc(x)}</span></li>`).join('')}</ul>` : '');
    return `<p class="lead">${esc(g.sum)}</p><div class="doc">${g.secs.map(s => `<h3>${esc(s.h)}</h3>${(s.p || []).map(x => `<p>${esc(x)}</p>`).join('')}${s.li ? tlist(s.li) : ''}${say(s.say, 'try', 'Try')}${say(s.avoid, 'avoid', 'Avoid')}`).join('')}</div>
      ${id === 'big-feelings' || id === 'duty-of-care' ? `<div class="btn-row"><a class="btn soft" href="#/support">${icon('phone')} Support and helplines</a></div>` : ''}
      <div class="btn-row" style="justify-content:space-between;margin-top:24px">${prev ? `<a class="btn ghost" href="#/guide/${prev.id}">${icon('chev-l')} ${esc(prev.n)}</a>` : '<span></span>'}${next ? `<a class="btn ghost" href="#/guide/${next.id}">${esc(next.n)} ${icon('chev-r')}</a>` : ''}</div>`;
  },
};

/* ---------- prompt banks ---------- */
const PKINDS = [['checkin', 'Check-ins'], ['warmup', 'Warm-ups'], ['draw', 'Drawing prompts'], ['reflect', 'Reflection'], ['closing', 'Closings'], ['affirm', 'Affirmations'], ['talk', 'Talking about art']];
const PST = { dc: '', n: 0 };
function promptPool(kind) {
  if (!TP) return [];
  if (kind === 'draw') return PST.dc ? (TP.draw[PST.dc] || []) : Object.values(TP.draw).flat();
  if (kind === 'warmup' || kind === 'closing') return (TP[kind] || []).map(x => `${x.n}. ${x.d}`);
  if (kind === 'talk') return (TP.talk || []).map(x => x.try);
  return TP[kind] || [];
}
VIEWS.prompts = {
  tab: 'therapy', title: 'Prompts and phrases',
  head() { return { back: '#/therapy', title: 'Prompts and phrases', sub: 'For opening, warming up, making, reflecting and closing' }; },
  render(kind) {
    if (!TP) return emptyState('chat', 'Prompts are on their way', 'They’ll appear here after the next update.');
    const k = PKINDS.some(x => x[0] === kind) ? kind : 'checkin', pool = promptPool(k), pick = pool.length ? pool[Math.floor(rng(`${today()}|${k}|${PST.dc}|${PST.n}`)() * pool.length)] : '';
    let h = `<div class="chips scroll" role="group" aria-label="Kind of prompt">${PKINDS.map(([v, l]) => `<a class="chip${v === k ? ' on' : ''}" href="#/prompts/${v}"${v === k ? ' aria-current="page"' : ''}>${l}</a>`).join('')}</div>`;
    if (k === 'draw') h += `<div class="chips" style="margin:4px 0 8px">${chip('All', !PST.dc, 'data-act="dc" data-v=""')}${Object.keys(TP.draw).map(c => chip(esc(PCAT[c] || cap(c)), PST.dc === c, `data-act="dc" data-v="${c}"`)).join('')}</div>`;
    if (pick && k !== 'talk') h += `<div class="t-note" style="margin-top:16px"><p class="kicker">Pick one for me</p><p class="p">${esc(pick)}</p><div class="btn-row"><button type="button" class="btn sm" data-act="another">${icon('shuffle', 'sm')} Another</button>${k === 'draw' ? `<button type="button" class="btn sm soft" data-act="use" data-t="${esc(pick)}">${icon('plus', 'sm')} Use in a class</button>` : ''}</div></div>`;
    if (k === 'talk') h += `<div class="card" style="margin-top:12px">${TP.talk.map(x => `<div class="talk"><ul class="say-list" style="margin:0"><li class="avoid"><span class="lab">Avoid</span><span>${esc(x.avoid)}</span></li><li class="try"><span class="lab">Try</span><span>${esc(x.try)}</span></li></ul><p class="why">${esc(x.why)}</p></div>`).join('')}</div>`;
    else if (k === 'warmup' || k === 'closing') h += `<div class="list" style="margin-top:16px">${TP[k].map(x => `<div class="lrow"><span class="t"><b>${esc(x.n)}${x.mins ? ` · ${x.mins} min` : ''}</b><small>${esc(x.d)}</small></span></div>`).join('')}</div>`;
    else h += `<div class="card" style="margin-top:16px"><ol class="doc" style="margin:0">${pool.map(x => `<li>${esc(x)}</li>`).join('')}</ol></div>`;
    if (k === 'affirm') h += `<div class="btn-row"><a class="btn soft" href="#/printable/affirm">${icon('print')} Print affirmation cards</a></div>`;
    return h;
  },
  act: { another: () => { PST.n++; render(); }, dc: a => { PST.dc = a.dataset.v; render(); }, use: a => usePrompt(a.dataset.t) },
};

/* ---------- glossary ---------- */
const GQ = { q: '' };
const glossList = () => { const q = GQ.q.trim().toLowerCase(), hits = TGL.filter(x => !q || `${x.t} ${x.d}`.toLowerCase().includes(q)).sort((a, b) => a.t.localeCompare(b.t)); return hits.length ? `<dl class="gloss">${hits.map(x => `<dt>${esc(x.t)}</dt><dd>${esc(x.d)}</dd>`).join('')}</dl>` : '<p class="fine">Nothing matches.</p>'; };
VIEWS.glossary = {
  tab: 'therapy', title: 'Glossary',
  head() { return { back: '#/therapy', title: 'Glossary', sub: `${TGL.length} terms in plain words` }; },
  render() { return TGL.length ? `<div class="search">${icon('search')}<input type="search" id="gq" value="${esc(GQ.q)}" placeholder="Search terms" aria-label="Search the glossary"></div><div class="card" id="gl">${glossList()}</div>` : emptyState('info', 'Glossary on its way', 'It’ll appear here after the next update.'); },
  after(view) { return bindOnce(view, '_gloss', () => { const f = e => { if (e.target.id === 'gq') { GQ.q = e.target.value; $('#gl', view).innerHTML = glossList(); } }; view.addEventListener('input', f); return () => view.removeEventListener('input', f); }); },
};

/* ---------- support and helplines ---------- */
VIEWS.support = {
  tab: 'therapy', title: 'Support and helplines',
  head() { return { back: '#/therapy', title: 'Support and helplines', sub: 'Free Australian services. Tap a number to call.' }; },
  render() {
    return `<div class="callout warn">${icon('warn')}<div><p><b>If someone is in immediate danger, call 000.</b> Stay with them if it’s safe, and keep things calm and simple.</p></div></div>
      ${SUPPORT.map(grp => `<div class="sec"><h2>${grp.g}</h2></div><div class="list support">${grp.items.map(x => `<a class="lrow${x.em ? ' emerg' : ''}" href="${telHref(x.tel)}">${icon('phone')}<span class="t"><b>${esc(x.n)}</b><small>${esc(x.d)}</small></span><span class="num">${x.tel}</span></a>`).join('')}</div>`).join('')}
      <p class="fine" style="margin-top:16px">Numbers were checked on each service’s own website in November 2026. Some services aren’t open around the clock: check their websites for hours, chat and text options.</p>
      ${TG_BY['big-feelings'] ? `<div class="list" style="margin-top:16px">${lrowLink('#/guide/big-feelings', 'heart', 'When feelings get big', 'What to do in class')}${TG_BY['duty-of-care'] ? lrowLink('#/guide/duty-of-care', 'shield', 'Child safety and duty of care', 'Disclosures, reporting and Working with Children Checks') : ''}</div>` : ''}`;
  },
};

/* ---------- tools: shared screen (the tools register themselves in ttools.js, tdraw.js and tprint.js) ---------- */
const TOOLS = {};
VIEWS.tool = {
  tab: 'therapy', title: 'Tool',
  head(name) { const t = TOOLS[name]; return t ? Object.assign({ back: '#/therapy', kicker: 'Calming tool', title: t.n }, t.head ? t.head() : {}) : { back: '#/therapy', title: 'Not found' }; },
  render(name) { const t = TOOLS[name]; return t ? t.render() : emptyState('warn', 'Tool not found', '', '<a class="btn" href="#/therapy">Art therapy</a>'); },
  act: new Proxy({}, { get: (o, k) => { const t = TOOLS[UI.param]; return t && t.act ? t.act[k] : undefined; } }),
  after(view, name) { const t = TOOLS[name]; return t && t.after ? t.after(view) : null; },
};
