/* Atelier — seasonal ideas: celebrations, awareness days and the seasons through the year, each with class projects,
   and workshop plans for the school holidays */
'use strict';

const hasSeasons = () => typeof SEASONS !== 'undefined' && Array.isArray(SEASONS) && SEASONS.length > 0;
const SEASON_AGE = { kids: 'kids', junior: 'junior', teen: 'teen', adult: 'adult' };
const AGE_WORDS = { kids: 'Ages 4–7', junior: 'Ages 8–12', teen: 'Teens', adult: 'Adults' };
const SEASON_ART = { heart: 'feel', gift: 'joy', flower: 'nature', leaf: 'change', sun: 'weather', moon: 'mind', cloud: 'weather', star: 'star', sparkle: 'joy', globe: 'nature', users: 'connect', smile: 'self', hand: 'support', feather: 'hope', palette: 'wheel', brush: 'draw', book: 'guides', school: 'programs' };
const seasonArt = (s, cls = '') => themeArt(SEASON_ART[s.icon] || (s.kind === 'season' ? 'nature' : 'joy'), cls);

/* ---------- dates ---------- */
// Easter Sunday (the Anonymous Gregorian method).
function easterSunday(y) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  return `${y}-${pad(month)}-${pad(day)}`;
}
// The nth weekday (0 = Monday) of a month, or the last one when n is -1.
function nthWeekday(y, m, wd, n) {
  const first = `${y}-${pad(m)}-01`;
  if (n > 0) { const d = addDays(first, ((wd - dow(first) + 7) % 7) + (n - 1) * 7); return d.slice(5, 7) === pad(m) ? d : null; }
  const last = `${y}-${pad(m)}-${pad(daysInMonth(first))}`;
  return addDays(last, -((dow(last) - wd + 7) % 7));
}
// When an occasion falls in year y: { start, end }, or null.
function seasonSpan(s, y) {
  const w = s.when || {};
  if (w.dates) { const d = w.dates[y]; return d && validDate(d) ? { start: d, end: w.days ? addDays(d, w.days - 1) : d } : null; }
  if (w.easter !== undefined) { const d = addDays(easterSunday(y), w.easter); return { start: d, end: d }; }
  if (w.naidoc) { const d = nthWeekday(y, 7, 6, 1); return { start: d, end: addDays(d, 7) }; }
  if (w.nth) { const d = nthWeekday(y, w.nth[0], w.nth[1], w.nth[2]); return d ? { start: d, end: d } : null; }
  if (w.d) {
    const start = `${y}-${w.d}`;
    if (!validDate(start)) return null;
    if (!w.to) return { start, end: start };
    let end = `${w.to < w.d ? y + 1 : y}-${w.to}`;
    if (!validDate(end)) { const m1 = `${end.slice(0, 8)}01`; end = addDays(m1, daysInMonth(m1) - 1); }
    return { start, end };
  }
  return null;
}
// The next time it comes round (or now, if it's on), from day d.
function seasonNext(s, d = today()) {
  const y = +d.slice(0, 4);
  for (const yy of [y - 1, y, y + 1, y + 2]) { const sp = seasonSpan(s, yy); if (sp && sp.end >= d) return sp; }
  return null;
}
function seasonsAhead(days, d = today()) {
  if (!hasSeasons()) return [];
  return SEASONS.map(s => ({ s, sp: seasonNext(s, d) })).filter(x => x.sp && x.sp.start <= addDays(d, days)).sort((a, b) => a.sp.start.localeCompare(b.sp.start) || a.s.n.localeCompare(b.s.n));
}
function whenText(sp) {
  const t = today();
  if (sp.start <= t && sp.end >= t) return sp.start === sp.end ? 'Today' : `On now, until ${fmtDate(sp.end)}`;
  const n = daysBetween(t, sp.start), span = sp.start === sp.end ? fmtDate(sp.start, { long: true }) : `${fmtDate(sp.start, { noDay: true })} to ${fmtDate(sp.end, { noDay: true })}`;
  return `${span} · ${n === 1 ? 'tomorrow' : `in ${n} days`}`;
}
// The next school holidays (between two terms in Settings), if they start within 8 weeks or are on now.
function nextHolidays(d = today()) {
  const ts = sortedTerms();
  for (let i = 0; i < ts.length - 1; i++) {
    const a = addDays(ts[i].end, 1), b = addDays(ts[i + 1].start, -1);
    if (a <= b && b >= d && a <= addDays(d, 56)) return { start: a, end: b };
  }
  return null;
}

/* ---------- screens ---------- */
const seasonCard = x => `<a class="card acard tint-${x.s.tint || 'butter'}" href="#/season/${x.s.id}"><span class="art-mini">${seasonArt(x.s)}</span><span class="t"><small>${esc(whenText(x.sp))}</small><b>${esc(x.s.n)}</b><small>${plural(x.s.ideas.length, 'class idea')}</small></span>${icon('chev-r', 'go')}</a>`;
VIEWS.seasons = {
  tab: 'ideas', title: 'Seasonal ideas',
  head() { return { deco: true, back: '#/ideas', title: 'Seasonal ideas', sub: 'Celebrations, special days and seasons' }; },
  render() {
    if (!hasSeasons()) return emptyState('leaf', 'Seasonal ideas are on their way', 'They’ll appear here after the next update.');
    const t = today(), all = SEASONS.map(s => ({ s, sp: seasonNext(s, t) })).filter(x => x.sp).sort((a, b) => a.sp.start.localeCompare(b.sp.start) || a.s.n.localeCompare(b.s.n));
    const soon = all.filter(x => x.sp.start <= addDays(t, 60)), later = all.filter(x => x.sp.start > addDays(t, 60)), hol = nextHolidays(t);
    let h = `<p class="lead">Class projects for celebrations, awareness days and the seasons in Australia, for every age. Tap one to plan it for a class.</p>`;
    if (hol && typeof HOLIDAY_WORKSHOPS !== 'undefined') h += `<a class="card acard tint-sky" href="#/workshops"><span class="art-mini">${themeArt('programs')}</span><span class="t"><small>School holidays · ${hol.start <= t ? `on now, until ${fmtDate(hol.end)}` : `${fmtDate(hol.start, { noDay: true })} to ${fmtDate(hol.end, { noDay: true })}`}</small><b>Holiday workshops</b><small>${plural(HOLIDAY_WORKSHOPS.length, 'workshop plan')}</small></span>${icon('chev-r', 'go')}</a>`;
    if (soon.length) h += `<div class="sec"><h2>Coming up</h2></div>${soon.map(seasonCard).join('')}`;
    let last = '';
    if (later.length) h += '<div class="sec"><h2>Later on</h2></div>';
    for (const x of later) {
      const m = x.sp.start.slice(0, 7);
      if (m !== last) { last = m; h += `<p class="daylbl">${fmtMonth(`${m}-01`)}</p>`; }
      h += seasonCard(x);
    }
    if (typeof HOLIDAY_WORKSHOPS !== 'undefined' && !hol) h += `<div class="sec"><h2>School holidays</h2></div><a class="card acard tint-sky" href="#/workshops"><span class="art-mini">${themeArt('programs')}</span><span class="t"><b>Holiday workshops</b><small>${plural(HOLIDAY_WORKSHOPS.length, 'workshop plan')} for half days and longer</small></span>${icon('chev-r', 'go')}</a>`;
    return h;
  },
};
VIEWS.season = {
  tab: 'ideas', title: 'Seasonal idea',
  head(id) {
    const s = hasSeasons() && SEASON_BY[id];
    if (!s) return { back: '#/seasons', title: 'Not found' };
    const sp = seasonNext(s);
    return { back: '#/seasons', kicker: sp ? esc(whenText(sp)) : '', title: esc(s.n) };
  },
  render(id) {
    const s = hasSeasons() && SEASON_BY[id];
    if (!s) return emptyState('warn', 'Not found', '', '<a class="btn" href="#/seasons">Seasonal ideas</a>');
    let h = `<div class="theme-head tint-${s.tint || 'butter'}" style="margin-top:8px"><div><p>${esc(s.blurb)}</p></div>${seasonArt(s)}</div>`;
    if (s.note) h += `<div class="callout care" style="margin-top:12px">${icon('heart')}<p>${esc(s.note)}</p></div>`;
    h += s.ideas.map((x, i) => ideaCard(x, `data-i="${i}"`)).join('');
    return h;
  },
  act: { plan: a => { const s = SEASON_BY[UI.param], x = s && s.ideas[+a.dataset.i]; if (x) planIdea(x, `Seasonal idea · ${s.n}`); } },
};
function ideaCard(x, attrs) {
  const list = (arr, tag = 'ul') => `<${tag}>${arr.map(v => `<li>${esc(v)}</li>`).join('')}</${tag}>`;
  return `<div class="card idea"><h3>${esc(x.t)}</h3><div class="meta-chips">${x.ages.map(a => `<span class="pill">${AGE_WORDS[a] || esc(a)}</span>`).join('')}<span class="pill">${icon('clock', 'sm')} ${fmtMins(x.mins)}</span></div>
    <p>${esc(x.sum)}</p><div class="doc"><h4>You’ll need</h4>${list(x.mat)}<h4>Steps</h4>${list(x.steps || [], 'ol')}</div>
    ${x.tip ? `<div class="callout" style="margin-top:8px">${icon('bulb')}<p>${esc(x.tip)}</p></div>` : ''}
    ${(x.tech || []).filter(t => TECH_BY[t]).length ? `<div class="chips" style="margin-top:10px">${x.tech.filter(t => TECH_BY[t]).map(t => `<a class="chip" href="#/technique/${t}">${esc(TECH_BY[t].n)}</a>`).join('')}</div>` : ''}
    <div class="btn-row"><button type="button" class="btn soft" data-act="plan" ${attrs}>${icon('plus')} Plan it for a class</button></div></div>`;
}
// Puts a project into a class session as its lesson, with a running sheet.
function planIdea(x, from) {
  pickSession({
    title: `Plan “${esc(x.t)}” for…`, onPick: o => {
      const s = sessionOf(o, true), before = { plan: s.plan, topic: s.topic, tech: (s.tech || []).slice() };
      s.plan = x.parts ? { kind: 'workshop', from, t: x.t, aim: x.sum, tech: x.tech || [], parts: x.parts } : { kind: 'season', from, t: x.t, aim: x.sum, tech: x.tech || [], warm: x.warm, demo: x.demo, practice: x.practice, make: x.make, share: x.share, age: SEASON_AGE[x.ages[0]] || 'adult' };
      s.topic = x.t;
      s.tech = [...new Set((s.tech || []).concat(x.tech || []))];
      save();
      toast(`${icon('check')} Planned for ${esc(o.c.name)}, ${fmtDate(o.date)}`, { undo: () => { Object.assign(s, before); save(); render(); } });
    },
  });
}
VIEWS.workshops = {
  tab: 'ideas', title: 'Holiday workshops',
  head() { return { back: '#/seasons', title: 'Holiday workshops', sub: 'Half days and longer, for the school holidays' }; },
  render() {
    if (typeof HOLIDAY_WORKSHOPS === 'undefined') return emptyState('leaf', 'Workshops are on their way', 'They’ll appear here after the next update.');
    const hol = nextHolidays();
    return `${hol ? `<p class="lead">The next school holidays: ${fmtDate(hol.start, { long: true })} to ${fmtDate(hol.end, { long: true })}.</p>` : '<p class="lead">Plans for longer sessions in the school holidays. Add your school terms in Settings to see when the next holidays are.</p>'}
      ${HOLIDAY_WORKSHOPS.map(w => `<a class="card acard tint-sky" href="#/workshop/${w.id}"><span class="art-mini">${themeArt('programs')}</span><span class="t"><b>${esc(w.t)}</b><small>${w.ages.map(a => AGE_WORDS[a] || a).join(', ')} · ${fmtMins(w.mins)}</small><small>${esc(w.sum)}</small></span>${icon('chev-r', 'go')}</a>`).join('')}`;
  },
};
VIEWS.workshop = {
  tab: 'ideas', title: 'Workshop',
  head(id) { const w = typeof HOLIDAY_WORKSHOPS !== 'undefined' && HOLIDAY_WORKSHOPS.find(x => x.id === id); return w ? { back: '#/workshops', kicker: `Holiday workshop · ${fmtMins(w.mins)}`, title: esc(w.t) } : { back: '#/workshops', title: 'Not found' }; },
  render(id) {
    const w = typeof HOLIDAY_WORKSHOPS !== 'undefined' && HOLIDAY_WORKSHOPS.find(x => x.id === id);
    if (!w) return emptyState('warn', 'Not found', '', '<a class="btn" href="#/workshops">Workshops</a>');
    return `<p class="lead">${esc(w.sum)}</p><div class="meta-chips">${w.ages.map(a => `<span class="pill">${AGE_WORDS[a] || esc(a)}</span>`).join('')}<span class="pill">${icon('clock', 'sm')} ${fmtMins(w.mins)}</span></div>
      <div class="card flat plan-card" style="--c:var(--il-sky);margin-top:16px"><ul class="run">${w.parts.map(p => `<li><b>${p[0]} min</b><span><em>${esc(p[1])}</em>${esc(p[2])}</span></li>`).join('')}</ul></div>
      <div class="doc"><h3>You’ll need</h3><ul>${w.mat.map(m => `<li>${esc(m)}</li>`).join('')}</ul></div>
      ${(w.tech || []).filter(t => TECH_BY[t]).length ? `<div class="chips">${w.tech.filter(t => TECH_BY[t]).map(t => `<a class="chip" href="#/technique/${t}">${esc(TECH_BY[t].n)}</a>`).join('')}</div>` : ''}
      <div class="btn-row" style="margin-top:20px"><button type="button" class="btn primary" data-act="oneoff">${icon('plus')} Make it a one-off class</button><button type="button" class="btn soft" data-act="plan">Add to a class</button></div>`;
  },
  act: {
    plan: () => { const w = HOLIDAY_WORKSHOPS.find(x => x.id === UI.param); if (w) planIdea(w, 'Holiday workshop'); },
    oneoff: () => {
      const w = HOLIDAY_WORKSHOPS.find(x => x.id === UI.param), hol = nextHolidays();
      if (!w) return;
      openClassEditor(null, {
        open: true, date: hol && hol.start > today() ? hol.start : today(), preset: { name: w.t, kind: 'group', mins: w.mins, rep: { type: 'once' } },
        then: c => { const o = nextOcc(c); if (!o) return; const s = sessionOf(o, true); s.plan = { kind: 'workshop', from: 'Holiday workshop', t: w.t, aim: w.sum, tech: w.tech || [], parts: w.parts }; s.topic = w.t; s.tech = (w.tech || []).slice(); save(); },
      });
    },
  },
};
// For Today: the nearest occasion starting in the next three weeks.
function seasonForToday() {
  const t = today(), x = seasonsAhead(21, t).filter(y => y.sp.start >= t)[0];
  return x ? `<a class="card acard tint-${x.s.tint || 'butter'}" href="#/season/${x.s.id}"><span class="art-mini">${seasonArt(x.s)}</span><span class="t"><small>Coming up · ${esc(whenText(x.sp))}</small><b>${esc(x.s.n)}</b><small>${plural(x.s.ideas.length, 'class idea')}</small></span>${icon('chev-r', 'go')}</a>` : '';
}
