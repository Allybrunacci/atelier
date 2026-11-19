/* Atelier — classes: the list, each class's page (history, artworks, students, earnings) and the class editor */
'use strict';

const nextColour = () => { const used = liveClasses().map(c => c.color); return (PIGMENTS.find(p => !used.includes(p[1])) || PIGMENTS[liveClasses().length % PIGMENTS.length])[1]; };

/* ---------- the list ---------- */
VIEWS.classes = {
  title: 'Classes',
  head() {
    const cls = liveClasses(), n = sum(cls.map(c => (c.kind === 'group' ? regulars(c).length : 1)));
    return { title: 'Classes', sub: cls.length ? `${plural(cls.length, 'class', 'classes')} · ${plural(n, 'student')}` : '', actions: '<div class="vh-act"><a class="icon-btn" href="#/settings" aria-label="Settings">' + icon('cog') + '</a></div>' };
  },
  render() {
    const cls = liveClasses(), arch = Object.values(S.classes).filter(c => c.archived);
    let h = cls.length ? cls.map(classCard).join('') : emptyState('users', 'No classes yet', 'Add each class once with how often it repeats, and the calendar fills itself in.', `<button type="button" class="btn primary big" data-act="add">${icon('plus')} Add your first class</button>`);
    if (arch.length) h += `<details class="more" style="margin-top:24px"><summary>${icon('chev-d')} Archived (${arch.length})</summary><div class="list">${arch.map(c => `<div class="lrow"><span class="sw" style="--c:${c.color}"></span><a class="t" href="#/class/${c.id}" style="color:inherit;text-decoration:none"><b>${esc(c.name)}</b><small>${kindLabel(c)} · history kept</small></a><button type="button" class="btn sm" data-act="unarchive" data-id="${c.id}">Restore</button></div>`).join('')}</div></details>`;
    return h + (cls.length ? `<button type="button" class="fab" data-act="add">${icon('plus')} New class</button>` : '');
  },
  act: {
    add: () => openClassEditor(null, { open: true }),
    unarchive: a => { const c = S.classes[a.dataset.id]; c.archived = false; save(); render(); toast(`${icon('undo')} ${esc(c.name)} is back on the calendar`); },
  },
};
function classCard(c) {
  const nx = nextOcc(c);
  return `<a class="card cls-card" href="#/class/${c.id}" style="--c:${c.color}"><span class="sbar"></span><span class="in">
    <h3>${esc(c.name)}</h3><span class="meta">${kindLabel(c)} · ${repeatText(c, true)}, ${fmtTime(c.time)} · ${payText(c)}</span>
    <span class="next" style="display:block">${nx ? `Next: ${relDay(nx.date)}, ${fmtTime(nx.time)}${nx.s && nx.s.topic ? ` · ${esc(nx.s.topic)}` : ''}` : 'No more classes scheduled'}</span></span></a>`;
}

/* ---------- one class ---------- */
const CLS = { tab: 'history', who: '', more: 12 };
VIEWS.class = {
  tab: 'classes', title: 'Class',
  head(id) {
    const c = S.classes[id];
    if (!c) return { title: 'Class not found', back: '#/classes' };
    return { back: '#/classes', kicker: kindLabel(c), title: esc(c.name), sub: `${repeatText(c)} · ${fmtSpan(c.time, c.mins)}`, actions: `<div class="vh-act"><button type="button" class="icon-btn" data-act="edit" aria-label="Edit class">${icon('edit')}</button></div>` };
  },
  render(id) {
    const c = S.classes[id];
    if (!c) return emptyState('warn', 'This class has been deleted', '', '<a class="btn" href="#/classes">Back to classes</a>');
    if (CLS.id !== id) Object.assign(CLS, { id, tab: 'history', who: '', more: 12 });
    const t = today(), nx = c.archived ? null : nextOcc(c), term = currentTerm();
    let h = `<div class="class-band" style="--c:${c.color}"></div><p class="facts"><span>${icon('money')}${payText(c)}</span>${c.place ? `<span>${icon('pin')}${esc(c.place)}</span>` : ''}${c.archived ? `<span>${icon('archive')}Archived</span>` : ''}</p>`;
    if (c.note) h += `<p class="lead">${esc(c.note)}</p>`;
    if (nx) h += `<p class="daylbl">Next class</p>${sessRow(nx, { date: true })}`;
    if (!c.archived) h += `<div class="btn-row"><button type="button" class="btn sm" data-act="extra">${icon('plus', 'sm')} Add an extra class</button><a class="btn sm ghost" href="#/plan/new/${c.id}">${icon('plan', 'sm')} Plan a term</a></div>`;
    const tabs = [['history', 'History'], ['art', 'Artworks'], ...(c.kind === 'group' ? [['students', 'Students']] : []), ['money', 'Earnings']];
    h += `<div style="margin:24px 0 16px">${seg('ctab', tabs, CLS.tab)}</div>`;

    if (CLS.tab === 'history') {
      const ups = upcoming(c, 4).filter(o => !nx || o.key !== nx.key);
      if (ups.length) h += `<p class="daylbl">Coming up</p>${ups.map(o => sessRow(o, { date: true })).join('')}`;
      const past = occurrences(firstDate(c), addDays(t, 0), c.id, true).filter(o => o.date < t || (o.s && o.s.done)).reverse();
      if (!past.length) h += `<p class="fine" style="margin-top:16px">Past classes will show here with their references, artworks and notes.</p>`;
      else {
        h += `<p class="daylbl">Past classes</p><div class="card timeline">${past.slice(0, CLS.more).map(o => tlItem(o)).join('')}</div>`;
        if (past.length > CLS.more) h += `<div class="btn-row"><button type="button" class="btn block" data-act="moretl">Show earlier classes (${past.length - CLS.more})</button></div>`;
      }
    } else if (CLS.tab === 'art') {
      const all = classArt(c), sts = c.kind === 'group' ? c.students.filter(st => all.some(a => a.who === st.id)) : [];
      if (sts.length) h += `<div class="chips scroll" style="margin-bottom:8px">${chip('Everyone', !CLS.who, 'data-act="who" data-id=""')}${sts.map(st => chip(esc(st.name || 'Student'), CLS.who === st.id, `data-act="who" data-id="${st.id}"`)).join('')}</div>`;
      const shown = all.filter(a => !CLS.who || a.who === CLS.who);
      h += shown.length ? `<div class="pgrid">${shown.map(a => photoTile(a.photo, { href: `#/photo/${a.photo}`, cap: `${fmtDate(a.d, { noDay: true })}${a.title ? ` · ${a.title}` : ''}` })).join('')}</div>` : '<p class="fine">No artwork photos yet. Add them from a class’s page in the calendar after each lesson.</p>';
      const refs = classRefs(c);
      h += `<div class="sec"><h2>References used</h2></div>${refs.length ? `<div class="pgrid">${refs.map(r => photoTile(r.id, { href: `#/photo/${r.id}`, cap: r.n > 1 ? `${r.n} times · last ${fmtDate(r.last, { noDay: true })}` : fmtDate(r.last, { noDay: true }) })).join('')}</div>` : '<p class="fine">References you add to this class’s sessions show here, so you can see what you’ve used before.</p>'}`;
    } else if (CLS.tab === 'students') {
      const regs = regulars(c), past = c.students.filter(st => !regs.includes(st)), done = doneSessions(c);
      const line = st => {
        const tot = done.filter(s => s.d >= (st.from || '') && (!st.to || s.d <= st.to)), here = tot.filter(s => isHere(s, st)).length, arts = classArt(c).filter(a => a.who === st.id).length;
        return `<div class="lrow"><span class="t"><b>${esc(st.name || 'Student')}</b><small>${st.type === 'term' ? '<span class="pill term">Term</span>' : `<span class="pill casual">${st.from && st.from === st.to ? 'Drop-in' : 'Casual'}</span>`} ${money(rateOf(c, st))} a class${tot.length ? ` · came to ${here} of ${tot.length}` : ''}${arts ? ` · ${plural(arts, 'artwork')}` : ''}${st.from && st.from === st.to ? ` · ${fmtDate(st.from)}` : st.to ? ` · left ${fmtDate(st.to)}` : ''}</small></span></div>`;
      };
      h += regs.length ? `<div class="list">${regs.map(line).join('')}</div>` : '<p class="fine">No students yet.</p>';
      if (past.length) h += `<details class="more" style="margin-top:12px"><summary>${icon('chev-d')} Past students and drop-ins (${past.length})</summary><div class="list">${past.map(line).join('')}</div></details>`;
      h += `<div class="btn-row"><button type="button" class="btn" data-act="edit">${icon('edit')} Edit students and rates</button></div>`;
    } else {
      const sumFor = (a, b) => round2(sum(doneBetween(a, b).filter(x => x.s.c === c.id).map(x => x.amt)));
      const mon = mondayOf(t), done = doneSessions(c);
      const cards = [['This week', sumFor(mon, addDays(mon, 6))], ['This month', sumFor(monthStart(t), addDays(addMonths(t, 1), -1))], ...(term && t >= term.start ? [[esc(term.name), sumFor(term.start, term.end)]] : []), [`Financial year ${finYearName(t)}`, sumFor(finYearStart(t), finYearEnd(t))], ['All time', round2(sum(done.map(amountOf)))]];
      h += `<div class="stats">${cards.map(([l, n]) => `<div class="card"><div class="n">${money(n)}</div><div class="l">${l}</div></div>`).join('')}<div class="card"><div class="n">${done.length}</div><div class="l">Classes taught</div></div></div>`;
      if (done.length) h += `<p class="fine" style="margin-top:12px">Average ${money(sum(done.map(amountOf)) / done.length)} a class.</p>`;
    }
    return h;
  },
  act: Object.assign({}, SESS_ACTS, {
    edit: () => openClassEditor(S.classes[UI.param]),
    extra: () => openExtra(S.classes[UI.param]),
    who: a => { CLS.who = a.dataset.id; render(); },
    moretl: () => { CLS.more += 20; render(); },
  }),
  after(view) {
    const f = e => { const b = e.target.closest('[data-seg="ctab"]'); if (b) { CLS.tab = b.dataset.v; render(); } };
    view.addEventListener('click', f);
    return () => view.removeEventListener('click', f);
  },
};
const firstDate = c => versions(c).map(v => (v.from && v.from > v.start ? v.from : v.start)).concat(Object.keys(c.extra)).sort()[0] || c.start;
const doneSessions = c => Object.values(S.sessions).filter(s => s.c === c.id && s.done);
function classArt(c) {
  const out = [];
  for (const s of Object.values(S.sessions)) if (s.c === c.id) for (const a of s.art || []) if (S.photos[a.photo]) out.push(Object.assign({ d: s.d }, a));
  return out.sort((a, b) => b.d.localeCompare(a.d));
}
function classRefs(c) {
  const m = new Map();
  for (const s of Object.values(S.sessions)) if (s.c === c.id) for (const id of s.refs || []) if (S.photos[id]) { const r = m.get(id) || { id, n: 0, last: '' }; r.n++; if (s.d > r.last) r.last = s.d; m.set(id, r); }
  return [...m.values()].sort((a, b) => b.last.localeCompare(a.last));
}
function tlItem(o) {
  const s = o.s || {}, refs = (s.refs || []).filter(id => S.photos[id]), art = (s.art || []).filter(a => S.photos[a.photo]);
  const status = o.cancelled ? '<span class="pill">Cancelled</span>' : s.done ? `<span class="pill ok">${icon('check', 'sm')} ${money(amountOf(s))}</span>` : '<span class="pill warn">Not ticked</span>';
  const who = id => { const st = o.c.students.find(x => x.id === id); return st ? st.name : id === 'all' ? 'Whole class' : ''; };
  const techs = (s.tech || []).map(techName).filter(n => !s.topic || n.toLowerCase() !== s.topic.trim().toLowerCase());
  return `<div class="tl"><div class="tl-h"><button type="button" class="btn ghost sm" style="padding:0;min-height:44px;color:var(--ink)" data-act="open" data-key="${esc(o.key)}"><b>${fmtDate(o.date, { long: true })}</b></button>${status}</div>
    ${s.topic || techs.length ? `<p class="tl-sub">${esc(s.topic || '')}${s.topic && techs.length ? ' · ' : ''}${techs.map(esc).join(', ')}</p>` : ''}
    ${refs.length ? `<p class="tl-lbl">References</p><div class="thumbs">${refs.map(id => photoTile(id, { href: `#/photo/${id}`, cap: '' })).join('')}</div>` : ''}
    ${art.length ? `<p class="tl-lbl">Artworks</p><div class="thumbs">${art.map(a => photoTile(a.photo, { href: `#/photo/${a.photo}`, cap: a.title || who(a.who) })).join('')}</div>` : ''}
    ${s.note ? `<p class="fine" style="margin:8px 0 0">${esc(s.note.length > 160 ? s.note.slice(0, 157) + '…' : s.note)}</p>` : ''}</div>`;
}
// One extra class, outside the usual pattern.
function openExtra(c, date) {
  const sh = openSheet(`${sheetHead(`Extra ${esc(c.name)} class`)}<div class="two"><label class="field"><span class="f-l">Date</span><input type="date" name="d" value="${date || today()}"></label><label class="field"><span class="f-l">Start time</span><input type="time" name="t" value="${c.time}"></label></div><div class="btn-row end"><button type="button" class="btn ghost" data-close>Cancel</button><button type="button" class="btn primary" data-act="ok">Add class</button></div>`, {
    label: 'Add an extra class', cls: 'small',
    act: {
      ok: () => {
        const d = $('[name=d]', sh.el).value, t = $('[name=t]', sh.el).value;
        if (!validDate(d) || !validTime(t)) { toast(`${icon('warn')} Choose a date and a time`); return; }
        if (c.extra[d] !== undefined) { toast(`${icon('warn')} There’s already an extra class that day`); return; }
        c.extra[d] = t;
        save();
        sh.close();
        render();
        toast(`${icon('check')} Extra class added for ${fmtDate(d)} at ${fmtTime(t)}`);
      },
    },
  });
}

/* ---------- adding and editing a class ---------- */
const LENGTHS = [30, 45, 60, 90, 120];
function draftCount(d, from, to) {
  const v = versions(d).pop(), end = seriesEnd(v);
  let n = 0;
  for (let x = from; x <= to && (!end || x <= end); x = addDays(x, 1)) if (ruleHits(v, x) && !d.skip[x]) n++;
  return n + Object.keys(d.extra).filter(x => x >= from && x <= to).length;
}
const schedSig = c => JSON.stringify([c.start, c.time, c.mins, c.rep, !!c.termsOnly]);
function openClassEditor(c, opts = {}) {
  const isNew = !c;
  const d = fixClass(c ? JSON.parse(JSON.stringify(c)) : { id: uid(), name: '', kind: 'group', start: opts.date || today(), time: '16:00', mins: 60, color: nextColour(), students: [] });
  if (isNew) d.rep.days = [dow(d.start)];
  const orig = c ? schedSig(c) : '';
  let err = '', scope = 'from', from = today(), fee = '', feeTerm = (currentTerm() || {}).id || '';
  const hasPast = c && occurrences(firstDate(c), addDays(today(), -1), c.id, true).length > 0;

  const tpl = () => {
    const r = d.rep, sd = D(d.start).getUTCDate(), wd = DAY_LONG[dow(d.start)];
    const regs = d.students.filter(st => !(st.from && st.from === st.to) && !st.to), past = d.students.filter(st => !regs.includes(st));
    let b = err ? `<p class="err" role="alert" style="margin:0 0 12px">${err}</p>` : '';
    b += `<label class="field"><span class="f-l">Class name</span><input name="name" value="${esc(d.name)}" placeholder="e.g. Tuesday teens, or Lily’s lessons" autocomplete="off" maxlength="60"></label>
      <div class="field"><span class="f-l">Type of class</span>${seg('kind', [['private', 'Private'], ['group', 'Group']], d.kind)}</div>`;
    if (d.kind === 'private') b += `<label class="field"><span class="f-l">Student’s name (optional)</span><input name="pname" value="${esc((d.students[0] || {}).name || '')}" autocomplete="off"></label>`;
    b += `<div class="field"><span class="f-l">Colour</span><div class="swatches" role="radiogroup" aria-label="Colour">${PIGMENTS.map(([n, col]) => `<button type="button" role="radio" aria-checked="${d.color === col}" aria-label="${n}" class="${d.color === col ? 'on' : ''}" style="--c:${col}" data-act="col" data-c="${col}">${icon('check')}</button>`).join('')}</div></div>
      <label class="field"><span class="f-l">Where (optional)</span><input name="place" value="${esc(d.place)}" placeholder="e.g. Community hall, or online" autocomplete="off"></label>

      <h3 class="form-sec">When</h3>
      <div class="two"><label class="field"><span class="f-l">${isNew ? 'First class' : 'Started'}</span><input type="date" name="start" value="${d.start}"></label><label class="field"><span class="f-l">Start time</span><input type="time" name="time" value="${d.time}"></label></div>
      <div class="field"><span class="f-l">Length</span>${seg('mins', LENGTHS.map(m => [m, fmtMins(m)]).concat([['x', 'Other']]), LENGTHS.includes(d.mins) && !d._otherMins ? d.mins : 'x')}
      ${!LENGTHS.includes(d.mins) || d._otherMins ? `<input class="inp" style="margin-top:8px" name="mins" type="number" inputmode="numeric" min="5" max="600" value="${d.mins}" aria-label="Length in minutes"><small class="f-h">Minutes</small>` : ''}</div>
      <div class="field"><span class="f-l">Repeats</span>${seg('rtype', [['weekly', 'Weekly'], ['monthly', 'Monthly'], ['once', 'Just once']], r.type)}</div>`;
    if (r.type === 'weekly') {
      b += `<div class="field"><span class="f-l">How often</span>${seg('every', [[1, 'Every week'], [2, 'Fortnightly'], [3, '3 weeks'], [4, '4 weeks']], r.every)}</div>
        <div class="field"><span class="f-l">On</span><div class="days">${DAY_SHORT.map((n, i) => chip(n, r.days.includes(i), `data-act="day" data-d="${i}" aria-label="${DAY_LONG[i]}"`)).join('')}</div></div>`;
    } else if (r.type === 'monthly') {
      b += `<div class="field"><span class="f-l">Which day</span>${seg('month', [['date', `The ${ordinal(sd)}`], ['nth', `${cap(ordinal(Math.min(4, Math.ceil(sd / 7))))} ${DAY_SHORT[dow(d.start)]}`], ['last', `Last ${DAY_SHORT[dow(d.start)]}`]], r.month)}<small class="f-h">Worked out from the first class’s date (${fmtDate(d.start)}, a ${wd}).</small></div>`;
    }
    if (r.type !== 'once') {
      b += `<div class="field"><span class="f-l">Ends</span>${seg('end', [['never', 'Never'], ['date', 'On a date'], ['count', 'After a number']], r.end)}
        ${r.end === 'date' ? `<input class="inp" style="margin-top:8px" type="date" name="until" value="${esc(r.until)}" aria-label="Last date">` : ''}
        ${r.end === 'count' ? `<input class="inp" style="margin-top:8px" type="number" inputmode="numeric" name="count" min="1" max="500" value="${r.count}" aria-label="Number of classes"><small class="f-h">Classes in total</small>` : ''}</div>
        <label class="check"><input type="checkbox" name="termsOnly"${d.termsOnly ? ' checked' : ''}><span>School terms only<small>No classes in the school holidays.</small></span></label>
        ${d.termsOnly && !S.terms.length ? `<div class="callout warn">${icon('school')}<div><p>Add your term dates so Atelier knows when the holidays are.</p><button type="button" class="btn sm" data-act="nsw">Add NSW school terms</button> <a class="btn sm ghost" href="#/settings">Enter my own</a></div></div>` : ''}`;
    }
    b += `<p class="fine" style="margin-top:12px">${icon('repeat', 'sm')} ${repeatText(d)} · ${fmtSpan(d.time, d.mins)}</p>`;
    if (!isNew && hasPast && schedSig(d) !== orig) {
      b += `<div class="card flat" style="margin-top:12px"><p class="g-l">Apply the new times and days</p>${seg('scope', [['from', 'From a date'], ['all', 'To every class']], scope)}
        ${scope === 'from' ? `<label class="field" style="margin:12px 0 0"><span class="f-l">Starting</span><input type="date" name="from" value="${from}"><small class="f-h">Classes before this stay as they were.</small></label>` : '<p class="fine" style="margin:12px 0 0">Past classes move to the new pattern too. Ticked classes keep their pay.</p>'}</div>`;
    }

    b += '<h3 class="form-sec">Pay</h3>';
    if (d.kind === 'private') b += `<label class="field"><span class="f-l">Fee per class</span><span class="money-in"><input name="flat" inputmode="decimal" value="${esc(d.pay.flat || '')}" placeholder="0"></span></label>`;
    else {
      b += `<div class="field">${seg('pmode', [['student', 'Per student'], ['flat', 'One fee for the class']], d.pay.mode)}</div>`;
      if (d.pay.mode === 'flat') b += `<label class="field"><span class="f-l">Fee per class</span><span class="money-in"><input name="flat" inputmode="decimal" value="${esc(d.pay.flat || '')}" placeholder="0"></span><small class="f-h">The same amount whoever comes.</small></label>`;
      else {
        const terms = sortedTerms().filter(t => t.end >= addDays(today(), -120)), tt = S.terms.find(t => t.id === feeTerm) || terms[0], n = tt ? draftCount(d, tt.start, tt.end) : 0;
        b += `<div class="two"><label class="field"><span class="f-l">Term students, per class</span><span class="money-in"><input name="term" inputmode="decimal" value="${esc(d.pay.term || '')}" placeholder="0"></span></label>
          <label class="field"><span class="f-l">Casual, per class</span><span class="money-in"><input name="casual" inputmode="decimal" value="${esc(d.pay.casual || '')}" placeholder="0"></span></label></div>
          <p class="fine" style="margin-top:-8px">Term students have paid for the whole term, so they’re counted every class. Casual students pay on the day, so they’re counted when you tick them as there.</p>
          <details class="more"${fee ? ' open' : ''}><summary>${icon('chev-d')} Work out the term rate from a term fee</summary>
          ${terms.length ? `<div class="two"><label class="field"><span class="f-l">Term fee</span><span class="money-in"><input name="fee" inputmode="decimal" value="${esc(fee)}" placeholder="e.g. 250"></span></label>
            <label class="field"><span class="f-l">Term</span><select name="feeterm">${terms.map(t => `<option value="${t.id}"${tt && tt.id === t.id ? ' selected' : ''}>${esc(t.name)}</option>`).join('')}</select></label></div>
            <p class="fine">${tt ? `${plural(n, 'class', 'classes')} in ${esc(tt.name)}${hasNum(fee) && n ? ` → <b>${money(num(fee) / n)}</b> a class` : ''}` : ''}</p>
            ${hasNum(fee) && n ? `<button type="button" class="btn sm soft" data-act="usefee" data-v="${round2(num(fee) / n)}">Use ${money(num(fee) / n)} a class</button>` : ''}`
            : `<p class="fine">Add your term dates first (in Settings, or <button type="button" class="btn sm ghost" data-act="nsw">add NSW school terms</button>).</p>`}</details>`;
      }
      b += `<h3 class="form-sec">Students</h3>${regs.length ? '' : '<p class="fine">Add the students who come regularly. Drop-ins can be added on the day.</p>'}
        ${regs.map(st => `<div class="stu"><input class="inp" data-f="sname" data-id="${st.id}" value="${esc(st.name)}" placeholder="Name" aria-label="Student name" autocomplete="off">
          ${seg('st:' + st.id, [['term', 'Term'], ['casual', 'Casual']], st.type, `aria-label="${esc(st.name || 'Student')} pays"`)}
          ${d.pay.mode === 'student' ? `<span class="money-in"><input class="inp" data-f="srate" data-id="${st.id}" inputmode="decimal" value="${hasNum(st.rate) ? esc(st.rate) : ''}" placeholder="Own rate" aria-label="Own rate per class (optional)"></span>` : ''}
          <button type="button" class="icon-btn" data-act="srm" data-id="${st.id}" aria-label="Remove ${esc(st.name || 'student')}">${icon('close')}</button></div>`).join('')}
        <div class="btn-row"><button type="button" class="btn soft" data-act="sadd">${icon('plus')} Add student</button>${regs.length > 1 ? '<button type="button" class="btn sm ghost" data-act="sall" data-v="term">All term</button><button type="button" class="btn sm ghost" data-act="sall" data-v="casual">All casual</button>' : ''}</div>
        ${d.pay.mode === 'student' && regs.length ? '<p class="fine" style="margin-top:8px">Leave “own rate” empty to use the class rate.</p>' : ''}
        ${past.length ? `<details class="more"><summary>${icon('chev-d')} Past students and drop-ins (${past.length})</summary><div class="list">${past.map(st => `<div class="lrow"><span class="t"><b>${esc(st.name || 'Student')}</b><small>${st.from && st.from === st.to ? `Drop-in, ${fmtDate(st.from)}` : `Left ${fmtDate(st.to)}`}</small></span>${st.from && st.from === st.to ? '' : `<button type="button" class="btn sm" data-act="sback" data-id="${st.id}">Bring back</button>`}</div>`).join('')}</div></details>` : ''}`;
    }
    b += `<h3 class="form-sec">Notes</h3><label class="field"><span class="vh">Notes about this class</span><textarea name="note" placeholder="Anything to remember: ages, materials, parking…">${esc(d.note)}</textarea></label>`;
    if (!isNew) b += `<h3 class="form-sec">Finished with this class?</h3><div class="btn-row" style="margin-top:0">${d.archived ? '' : `<button type="button" class="btn" data-act="archive">${icon('archive')} Archive</button>`}<button type="button" class="btn danger-ghost" data-act="del">${icon('trash')} Delete</button></div><p class="fine" style="margin-top:8px">Archiving takes it off the calendar but keeps its history and earnings. Deleting removes everything.</p>`;
    return framed(sheetHead(isNew ? 'New class' : 'Edit class'), b, `<button type="button" class="btn" data-close>Cancel</button><button type="button" class="btn primary" data-act="save">${isNew ? 'Add class' : 'Save'}</button>`);
  };
  const redraw = () => sh.set(tpl());
  const regsOf = () => d.students.filter(st => !(st.from && st.from === st.to) && !st.to);
  const usedStudent = id => Object.values(S.sessions).some(s => s.c === d.id && ((s.att && s.att[id] !== undefined) || (s.art || []).some(a => a.who === id)));
  const segs = {
    kind: v => { d.kind = v; d.pay.mode = v === 'group' ? 'student' : 'flat'; },
    mins: v => { if (v === 'x') d._otherMins = true; else { d.mins = +v; d._otherMins = false; } },
    rtype: v => { d.rep.type = v; },
    every: v => { d.rep.every = +v; },
    month: v => { d.rep.month = v; },
    end: v => { d.rep.end = v; if (v === 'date' && !d.rep.until) d.rep.until = addDays(d.start, 7 * 10); },
    scope: v => { scope = v; },
    pmode: v => { d.pay.mode = v; },
  };
  const sh = openSheet(tpl(), {
    label: isNew ? 'New class' : 'Edit class',
    act: {
      col: a => { d.color = a.dataset.c; redraw(); },
      day: a => { const i = +a.dataset.d, ds = d.rep.days; if (ds.includes(i)) { if (ds.length > 1) ds.splice(ds.indexOf(i), 1); } else ds.push(i); redraw(); },
      nsw: () => { addNswTerms(); redraw(); },
      usefee: a => { d.pay.term = +a.dataset.v; fee = ''; redraw(); },
      sadd: () => { const last = regsOf().slice(-1)[0]; d.students.push({ id: uid(), name: '', type: last ? last.type : 'term', rate: null, from: '', to: '' }); redraw(); const ins = $$('[data-f=sname]', sh.el); ins[ins.length - 1].focus(); },
      sall: a => { regsOf().forEach(st => { st.type = a.dataset.v; }); redraw(); },
      srm: a => {
        const st = d.students.find(x => x.id === a.dataset.id);
        if (!st) return;
        if (!isNew && usedStudent(st.id)) st.to = addDays(today(), -1); else d.students.splice(d.students.indexOf(st), 1);
        redraw();
      },
      sback: a => { const st = d.students.find(x => x.id === a.dataset.id); if (st) st.to = ''; redraw(); },
      archive: () => { c.archived = true; save(); sh.close(); go('#/classes'); toast(`${icon('archive')} ${esc(c.name)} archived`, { undo: () => { c.archived = false; save(); render(); } }); },
      del: async () => {
        const n = Object.values(S.sessions).filter(s => s.c === c.id && s.done).length;
        if (!(await ask({ title: `Delete ${esc(c.name)}?`, body: `This removes the class, its calendar and its history${n ? `, including ${plural(n, 'ticked class', 'ticked classes')} from your earnings` : ''}. Photos stay in Photos. If you just want it off the calendar, archive it instead.`, ok: 'Delete class', danger: true }))) return;
        const keep = {};
        for (const [k, s] of Object.entries(S.sessions)) if (s.c === c.id) { keep[k] = s; delete S.sessions[k]; }
        delete S.classes[c.id];
        save();
        sh.close();
        go('#/classes');
        toast(`${icon('trash')} Class deleted`, { undo: () => { S.classes[c.id] = c; Object.assign(S.sessions, keep); save(); render(); }, ms: 8000 });
      },
      save: () => {
        d.name = d.name.trim();
        const r = d.rep;
        err = !d.name ? 'Give the class a name.' : r.type === 'weekly' && !r.days.length ? 'Choose at least one day.' : r.type !== 'once' && r.end === 'date' && (!validDate(r.until) || r.until < d.start) ? 'The end date needs to be after the first class.'
          : !validDate(d.start) || !validTime(d.time) ? 'Choose a start date and time.' : !isNew && scope === 'from' && hasPast && schedSig(d) !== orig && !validDate(from) ? 'Choose the date the change starts from.' : '';
        if (err) { redraw(); $('.sheet-scroll', sh.el).scrollTop = 0; return; }
        d.students = d.students.filter(st => st.name.trim() || (st.from && st.from === st.to));
        d.students.forEach(st => { st.name = st.name.trim(); });
        delete d._otherMins;
        if (isNew) {
          S.classes[d.id] = fixClass(d);
          save();
          sh.close();
          const nx = nextOcc(S.classes[d.id]);
          if (opts.open) go(`#/class/${d.id}`); else render();
          toast(`${icon('check')} ${esc(d.name)} added${nx ? `. First class ${relDay(nx.date).toLowerCase() === 'today' ? 'today' : `on ${fmtDate(nx.date)}`}, ${fmtTime(nx.time)}` : ''}`, { ms: 4500 });
          return;
        }
        const schedChanged = schedSig(d) !== orig;
        const next = { start: d.start, time: d.time, mins: d.mins, rep: d.rep, termsOnly: d.termsOnly };
        for (const k of ['name', 'kind', 'color', 'place', 'note', 'pay', 'students']) c[k] = d[k];
        if (schedChanged) {
          const f = scope === 'from' && hasPast ? from : '';
          if (f && f > (c.since || c.start) && occurrences(firstDate(c), addDays(f, -1), c.id, true).some(o => !o.extra)) {
            c.past.push({ from: c.since || '', to: addDays(f, -1), start: c.start, time: c.time, mins: c.mins, rep: JSON.parse(JSON.stringify(c.rep)), termsOnly: !!c.termsOnly });
            c.since = f;
          }
          Object.assign(c, next);
          rekeyAfterChange(c, f > today() ? f : today());
        }
        fixClass(c);
        save();
        sh.close();
        render();
        toast(`${icon('check')} Saved`);
      },
    },
    input: e => {
      const el = e.target, n = el.name, v = el.value;
      if (n === 'name') d.name = v;
      else if (n === 'place') d.place = v;
      else if (n === 'note') d.note = v;
      else if (n === 'pname') { if (!d.students[0]) d.students[0] = { id: uid(), name: '', type: 'casual', rate: null, from: '', to: '' }; d.students[0].name = v; }
      else if (n === 'flat' || n === 'term' || n === 'casual') d.pay[n] = hasNum(v) ? num(v) : 0;
      else if (el.dataset.f === 'sname') { const st = d.students.find(x => x.id === el.dataset.id); if (st) st.name = v; }
      else if (el.dataset.f === 'srate') { const st = d.students.find(x => x.id === el.dataset.id); if (st) st.rate = hasNum(v) ? num(v) : null; }
      else if (n === 'fee') { fee = v; const pos = el.selectionStart; redraw(); const i = $('[name=fee]', sh.el); if (i) { i.focus(); i.setSelectionRange(pos, pos); } }
    },
    change: e => {
      const el = e.target, n = el.name, v = el.value;
      if (n === 'start' && validDate(v)) { const was = d.start; d.start = v; if (d.rep.type === 'weekly' && d.rep.days.length === 1 && d.rep.days[0] === dow(was)) d.rep.days = [dow(v)]; redraw(); }
      else if (n === 'time' && validTime(v)) { d.time = v; redraw(); }
      else if (n === 'mins') { d.mins = clamp(Math.round(+v) || 60, 5, 600); redraw(); }
      else if (n === 'until') { d.rep.until = v; redraw(); }
      else if (n === 'count') { d.rep.count = clamp(Math.round(+v) || 1, 1, 500); redraw(); }
      else if (n === 'termsOnly') { d.termsOnly = el.checked; redraw(); }
      else if (n === 'from') { from = v; }
      else if (n === 'feeterm') { feeTerm = v; redraw(); }
    },
  });
  sh.el.addEventListener('click', e => {
    const b = e.target.closest('[data-seg]');
    if (!b) return;
    const name = b.dataset.seg, v = b.dataset.v;
    if (segs[name]) segs[name](v);
    else if (name.startsWith('st:')) { const st = d.students.find(x => x.id === name.slice(3)); if (st) st.type = v; }
    redraw();
  });
  return sh;
}
// After a schedule change, planned lessons on dates the class no longer runs move to its next free dates, in order.
function rekeyAfterChange(c, from) {
  const recs = Object.entries(S.sessions).filter(([k, s]) => s.c === c.id && !s.done && s.d >= from && !k.includes('@x'));
  if (!recs.length) return;
  const occs = occurrences(from, addDays(from, 400), c.id).filter(o => !o.extra), valid = new Set(occs.map(o => o.key));
  const orphans = recs.filter(([k]) => !valid.has(k)).sort((a, b) => a[1].d.localeCompare(b[1].d));
  const free = occs.filter(o => !S.sessions[o.key]);
  orphans.forEach(([k, s], i) => { const o = free[i]; if (!o) return; delete S.sessions[k]; s.d = o.date; s.t = o.time; S.sessions[o.key] = s; });
}
function addNswTerms() {
  let n = 0;
  for (const [name, start, end] of NSW_TERMS) {
    if (end < addDays(today(), -200) || S.terms.some(t => t.start === start && t.end === end)) continue;
    S.terms.push({ id: uid(), name, start, end });
    n++;
  }
  save();
  toast(n ? `${icon('school')} Added ${plural(n, 'NSW school term')}` : 'Those terms are already in');
}
