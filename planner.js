/* Atelier — the term planner: choose a class, focus, level, age and length, compare three plans, and use one */
'use strict';

const PLAN = { cid: '', focus: 'shading', lvl: 1, age: 'adult', weeks: 8, shown: false, preset: '' };
function planWeeksFor(c) {
  const term = currentTerm();
  if (c && term && c.termsOnly) { const n = occurrences(today() > term.start ? today() : term.start, term.end, c.id).length; if (n >= 4) return Math.min(12, n); }
  return 8;
}
const guessAge = c => { const n = (c ? c.name : '').toLowerCase(); return /adult|grown|senior/.test(n) ? 'adult' : /teen|high|year 1[0-2]|year [7-9]/.test(n) ? 'teen' : /kid|little|junior|child|prep|k-2/.test(n) ? 'kids' : PLAN.age; };
function lessonDetail(w, mins) {
  return `${w.aim ? `<p style="margin:8px 0 4px">${esc(w.aim)}</p>` : ''}<ul class="run">${runSheet(w, mins, w.age).map(r => `<li><b>${r[0]} min</b><span><em>${esc(r[1])}</em>${esc(r[2])}</span></li>`).join('')}</ul>
    ${w.tech.length ? `<p class="fine" style="margin:8px 0 0">${w.tech.map(id => `<a href="${techHref(id)}">${esc(techName(id))}</a>`).join(' · ')}</p>` : ''}`;
}
function weekList(plan, mins, dates = []) {
  return `<ol class="wk-list">${plan.weeks.map((w, i) => `<li><span class="wn">Week<b>${i + 1}</b></span><div><div class="wt">${esc(w.t)}</div><div class="wd">${dates[i] ? `${fmtDate(dates[i])} · ` : ''}${w.tech.map(techName).map(esc).join(', ')}</div>
    <details><summary>Lesson plan (${fmtMins(mins)})</summary>${lessonDetail(w, mins)}</details></div></li>`).join('')}</ol>`;
}
function planText(plan, mins) {
  return `${plan.name}\n${plan.weeks.length} weeks · ${LEVELS[plan.lvl]} · ${(AGES.find(a => a[0] === plan.age) || ['', ''])[1]}\n\n${plan.weeks.map((w, i) => `Week ${i + 1}: ${w.t}\n${runSheet(w, mins, w.age).map(r => `  ${r[0]} min  ${r[1]}: ${r[2]}`).join('\n')}`).join('\n\n')}\n\nMade with Atelier`;
}
// Writes the plan's lessons into a class's next sessions (with undo).
function applyPlan(plan, c) {
  const occs = upcoming(c, plan.weeks.length);
  if (!occs.length) { toast(`${icon('warn')} ${esc(c.name)} has no classes coming up`); return; }
  const clash = occs.filter(o => o.s && (o.s.topic || o.s.plan));
  const go = () => {
    const before = occs.map(o => [o.key, o.s ? JSON.parse(JSON.stringify(o.s)) : null]), isNew = !plan.id;
    occs.forEach((o, i) => { const s = sessionOf(o, true), w = plan.weeks[i]; s.topic = w.t; s.tech = [...new Set((s.tech || []).concat(w.tech))]; s.plan = Object.assign({}, w, { wk: i + 1 }); });
    const id = plan.id || uid();
    S.plans[id] = Object.assign(plan, { id, at: Date.now(), cid: c.id, keys: occs.map(o => o.key), mins: c.mins });
    save();
    render();
    toast(`${icon('check')} Added to ${occs.length < plan.weeks.length ? `the ${plural(occs.length, 'class', 'classes')} scheduled for` : `the next ${plural(occs.length, 'class', 'classes')} of`} ${esc(c.name)}`, {
      ms: 6000, undo: () => { before.forEach(([k, s]) => { if (s) S.sessions[k] = s; else delete S.sessions[k]; }); if (isNew) delete S.plans[id]; save(); render(); },
    });
  };
  if (clash.length) ask({ title: 'Replace planned lessons?', body: `${plural(clash.length, 'class', 'classes')} already ${clash.length === 1 ? 'has' : 'have'} a lesson planned. The new plan replaces the topic and lesson plan; notes, references and artworks stay.`, ok: 'Replace' }).then(y => { if (y) go(); });
  else go();
}
function pickClass(title, onPick) {
  const cls = liveClasses();
  if (!cls.length) { toast('Add a class first'); return; }
  const sh = openSheet(`${sheetHead(title)}<div class="list">${cls.map(c => { const nx = nextOcc(c); return `<button type="button" class="lrow" data-act="p" data-id="${c.id}"><span class="sw" style="--c:${c.color}"></span><span class="t"><b>${esc(c.name)}</b><small>${nx ? `Next ${relDay(nx.date).toLowerCase() === 'today' ? 'today' : fmtDate(nx.date)} · ${fmtMins(c.mins)}` : 'No classes coming up'}</small></span>${icon('chev-r', 'go')}</button>`; }).join('')}</div>`, {
    label: title, act: { p: a => { sh.close(); onPick(S.classes[a.dataset.id]); } },
  });
}

VIEWS.plan = {
  tab: 'ideas', title: 'Plan a term',
  head(p) {
    const sp = S.plans[p];
    if (sp) return { back: '#/ideas', kicker: 'Saved plan', title: esc(sp.name), actions: `<div class="vh-act"><button type="button" class="icon-btn" data-act="share" aria-label="Share plan as text">${icon('share')}</button><button type="button" class="icon-btn" data-act="delplan" aria-label="Delete plan">${icon('trash')}</button></div>` };
    return { back: '#/ideas', title: 'Plan a term', sub: 'Pick a focus and get three different week-by-week plans, each lesson timed for your class.' };
  },
  render(p) {
    const sp = S.plans[p];
    if (sp) {
      const c = S.classes[sp.cid], mins = c ? c.mins : sp.mins || 60, dates = (sp.keys || []).map(k => { const o = occByKey(k); return o ? o.date : ''; });
      return `<p class="facts"><span>${icon('plan')}${esc(sp.opt)}</span><span>${icon('target')}${LEVELS[sp.lvl]}</span><span>${icon('users')}${(AGES.find(a => a[0] === sp.age) || ['', ''])[1]}</span>${c ? `<span>${swatch(c.color)}<a href="#/class/${c.id}">${esc(c.name)}</a></span>` : ''}</p>
        ${weekList(sp, mins, dates)}<div class="btn-row"><button type="button" class="btn primary" data-act="useagain">${icon('plus')} Use for a class</button><button type="button" class="btn" data-act="share">${icon('share')} Share as text</button></div>`;
    }
    const [a, b] = p.split('/');
    if (p !== PLAN.preset) {
      PLAN.preset = p;
      if (a === 'new' && S.classes[b]) { PLAN.cid = b; PLAN.weeks = planWeeksFor(S.classes[b]); PLAN.age = guessAge(S.classes[b]); PLAN.shown = false; }
      if (a === 'focus' && FOCUS_BY[b]) { PLAN.focus = b; PLAN.shown = false; }
    }
    if (PLAN.cid && !S.classes[PLAN.cid]) PLAN.cid = '';
    const c = S.classes[PLAN.cid], f = FOCUS_BY[PLAN.focus], term = currentTerm();
    const termN = c && term ? occurrences(today() > term.start ? today() : term.start, term.end, c.id).length : 0;
    let h = `<label class="field"><span class="f-l">For which class?</span><select id="pcls"><option value="">Not for a class yet</option>${liveClasses().map(x => `<option value="${x.id}"${x.id === PLAN.cid ? ' selected' : ''}>${esc(x.name)}</option>`).join('')}</select>
        ${c ? `<small class="f-h">${fmtMins(c.mins)} classes${term && termN ? ` · ${plural(termN, 'class', 'classes')} left in ${esc(term.name)}` : ''}</small>` : ''}</label>
      <div class="field"><span class="f-l">Focus</span><div class="chips">${FOCUS.map(x => chip(esc(x.n), PLAN.focus === x.id, `data-act="focus" data-f="${x.id}"`)).join('')}</div><small class="f-h">${esc(f.d)}</small></div>
      <div class="field"><span class="f-l">Level</span>${seg('plvl', [[1, 'Beginner'], [2, 'Some experience'], [3, 'Confident']], PLAN.lvl)}</div>
      <div class="field"><span class="f-l">Age group</span>${seg('page', AGES, PLAN.age)}</div>
      <div class="field"><span class="f-l">Number of weeks</span><div class="stepper"><button type="button" data-act="wk" data-v="-1" aria-label="Fewer weeks">${icon('minus')}</button><output aria-live="polite">${PLAN.weeks} weeks</output><button type="button" data-act="wk" data-v="1" aria-label="More weeks">${icon('plus')}</button></div></div>
      <button type="button" class="btn primary big block" data-act="show">${icon('sparkle')} ${PLAN.shown ? 'Update the options' : 'Show plan options'}</button>`;
    if (PLAN.shown) {
      const mins = c ? c.mins : 60, dates = c ? upcoming(c, PLAN.weeks).map(o => o.date) : [];
      h += `<div id="opts" style="scroll-margin-top:16px"><div class="sec"><h2>Three options</h2></div><p class="sec-intro">Open any week to see its lesson plan, timed for ${fmtMins(mins)}${c ? '' : ' (choose a class to fit its length and dates)'}.</p>
        ${Object.keys(OPTION_INFO).map((k, i) => { const plan = makePlan({ focus: PLAN.focus, weeks: PLAN.weeks, lvl: PLAN.lvl, age: PLAN.age, opt: k }), [n, d, col] = OPTION_INFO[k]; return `<div class="card opt" style="--c:${col}"><p class="kicker" style="margin:0">Option ${i + 1}</p><h3>${n}</h3><p class="fine" style="margin:0">${d}</p>${weekList(plan, mins, dates)}
          <div class="btn-row"><button type="button" class="btn primary" data-act="apply" data-o="${k}">${c ? `Use for ${esc(c.name)}` : 'Use for a class'}</button><button type="button" class="btn" data-act="saveplan" data-o="${k}">Save for later</button></div></div>`; }).join('')}</div>`;
    }
    return h;
  },
  act: {
    focus: a => { PLAN.focus = a.dataset.f; render(); },
    wk: a => { PLAN.weeks = clamp(PLAN.weeks + +a.dataset.v, 4, 12); render(); },
    show: () => { PLAN.shown = true; render(); const el = $('#opts'); if (el) el.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' }); },
    apply: a => {
      const plan = makePlan({ focus: PLAN.focus, weeks: PLAN.weeks, lvl: PLAN.lvl, age: PLAN.age, opt: a.dataset.o }), c = S.classes[PLAN.cid];
      if (c) applyPlan(plan, c); else pickClass('Use this plan for…', x => applyPlan(plan, x));
    },
    saveplan: a => {
      const plan = makePlan({ focus: PLAN.focus, weeks: PLAN.weeks, lvl: PLAN.lvl, age: PLAN.age, opt: a.dataset.o }), id = uid(), c = S.classes[PLAN.cid];
      S.plans[id] = Object.assign(plan, { id, at: Date.now(), cid: '', keys: [], mins: c ? c.mins : 60 });
      save();
      toast(`${icon('check')} Saved to Ideas`, { undo: () => { delete S.plans[id]; save(); render(); } });
    },
    useagain: () => { const sp = S.plans[UI.param]; pickClass('Use this plan for…', c => { const copy = JSON.parse(JSON.stringify(sp)); if (sp.cid && sp.cid !== c.id) delete copy.id; applyPlan(sp.cid && sp.cid !== c.id ? copy : sp, c); }); },
    share: async () => {
      const sp = S.plans[UI.param], txt = planText(sp, (S.classes[sp.cid] || {}).mins || sp.mins || 60);
      try { if (navigator.share) { await navigator.share({ title: sp.name, text: txt }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
      try { await navigator.clipboard.writeText(txt); toast(`${icon('copy')} Copied. Paste it into Notes or a message.`); } catch (e) { toast('Couldn’t share from this browser'); }
    },
    delplan: () => {
      const sp = S.plans[UI.param];
      delete S.plans[sp.id];
      save();
      go('#/ideas');
      toast(`${icon('trash')} Plan deleted (lessons already added to classes stay)`, { undo: () => { S.plans[sp.id] = sp; save(); render(); } });
    },
  },
  after(view) {
    const segs = e => { const b = e.target.closest('[data-seg]'); if (!b) return; if (b.dataset.seg === 'plvl') PLAN.lvl = +b.dataset.v; else if (b.dataset.seg === 'page') PLAN.age = b.dataset.v; else return; render(); };
    const sel = e => { if (e.target.id === 'pcls') { PLAN.cid = e.target.value; const c = S.classes[PLAN.cid]; if (c) { PLAN.weeks = planWeeksFor(c); PLAN.age = guessAge(c); } render(); } };
    view.addEventListener('click', segs);
    view.addEventListener('change', sel);
    return () => { view.removeEventListener('click', segs); view.removeEventListener('change', sel); };
  },
};
