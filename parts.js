/* Atelier — shared pieces: class sessions in lists, ticking classes off, and pickers for photos, sessions and techniques */
'use strict';

const pigmentName = col => (PIGMENTS.find(p => p[1].toLowerCase() === String(col).toLowerCase()) || ['Colour'])[0];
const lvlDots = n => `<span class="lvl" role="img" aria-label="Level ${n} of 3">${[1, 2, 3].map(i => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</span>`;
const LEVELS = ['', 'Beginner', 'Some experience', 'Confident'];

function sessRow(o, opts = {}) {
  const k = esc(o.key), when = opts.date ? `${relDay(o.date)} · ` : '';
  if (o.cancelled) {
    return `<div class="srow cancelled" style="--c:${o.c.color}"><button type="button" class="s-main" data-act="open" data-key="${k}"><span class="sbar"></span><span class="s-txt"><b>${esc(o.c.name)}</b><small>${when}Cancelled${o.moved ? '' : ` · was ${fmtTime(o.time)}`}</small></span></button><button type="button" class="btn sm ghost restore" data-act="restore" data-key="${k}">Restore</button></div>`;
  }
  const s = o.s, done = !!(s && s.done);
  const bits = [fmtSpan(o.time, o.mins)];
  if (o.moved) bits.push(`moved from ${fmtDate(o.orig)}`);
  if (o.extra) bits.push('extra class');
  if (o.c.place && !opts.noPlace) bits.push(esc(o.c.place));
  const topic = s && s.topic ? `<small class="s-topic">${esc(s.topic)}</small>` : '';
  return `<div class="srow${done ? ' done' : ''}" style="--c:${o.c.color}">
    <button type="button" class="s-main" data-act="open" data-key="${k}"><span class="sbar"></span><span class="s-txt"><b>${esc(o.c.name)}</b><small>${when}${bits.join(' · ')}</small>${topic}</span><span class="s-amt">${money(payOf(o))}</span></button>
    <button type="button" class="tick${done ? ' on' : ''}" data-act="tick" data-key="${k}" aria-pressed="${done}" aria-label="${done ? 'Taught' : 'Mark as taught'}: ${esc(o.c.name)}, ${fmtDate(o.date)}">${icon('check')}</button></div>`;
}
// Sessions grouped under day headings.
function dayGroups(occs, emptyText = '') {
  if (!occs.length) return emptyText;
  let out = '', last = '';
  for (const o of occs) {
    if (o.date !== last) { last = o.date; out += `<p class="daylbl${o.date === today() ? ' today' : ''}">${relDay(o.date) === fmtDate(o.date) ? fmtDate(o.date, { long: true }) : `${relDay(o.date)} · ${fmtDate(o.date, { long: true })}`}</p>`; }
    out += sessRow(o);
  }
  return out;
}

/* ---------- ticking a class off ---------- */
const SESS_ACTS = {
  open: a => openSession(a.dataset.key),
  tick: a => quickTick(a.dataset.key),
  restore: a => restoreDate(a.dataset.key),
};
const needsRollCall = o => o.c.kind === 'group' && o.c.pay.mode === 'student' && activeStudents(o.c, o.date).some(st => st.type === 'casual');
function quickTick(key) {
  const o = occByKey(key);
  if (!o || o.cancelled) return;
  if (o.s && o.s.done) {
    setDone(o, false);
    refresh();
    toast(`${icon('undo')} ${esc(o.c.name)} unticked`, { undo: () => { setDone(o, true); refresh(); } });
    return;
  }
  if (needsRollCall(o)) { openRollCall(o); return; }
  setDone(o, true);
  refresh();
  toast(`${icon('check')} ${esc(o.c.name)} taught · ${money(payOf(o))}`, { undo: () => { setDone(o, false); refresh(); } });
}
// Who came? (for group classes with casual students). Term students are ticked already.
function openRollCall(o) {
  const s = sessionOf(o, true);
  const tpl = () => {
    const sts = activeStudents(o.c, o.date);
    return framed(sheetHead('Who came?', `${esc(o.c.name)} · ${fmtDate(o.date, { long: true })}`),
      `<p class="fine">Term students are counted every class. Tick the casual students who came.</p>
      <div class="list">${sts.map(st => attRow(st, s)).join('') || '<p class="fine" style="padding:12px 16px">No students yet.</p>'}</div>
      ${dropInForm()}`,
      `<button type="button" class="btn big primary" data-act="done">${icon('check')} Taught · ${money(linesTotal(payLines(o.c, s, o.date)))}</button>`);
  };
  const sh = openSheet(tpl(), {
    label: 'Who came?',
    act: Object.assign(attActs(o, () => sh.set(tpl())), {
      done: () => { setDone(o, true); sh.close(); refresh(); toast(`${icon('check')} ${esc(o.c.name)} taught · ${money(payOf(o))}`, { undo: () => { setDone(o, false); refresh(); } }); },
    }),
  });
}
function attRow(st, s) {
  const here = isHere(s, st), drop = st.from && st.from === st.to;
  const kind = st.type === 'term' ? '<span class="pill term">Term</span>' : `<span class="pill casual">${drop ? 'Drop-in' : 'Casual'}</span>`;
  const rate = hasNum(st.rate) ? ` · ${money(st.rate)}` : '';
  return `<div class="att"><div class="t"><b>${esc(st.name || 'Student')}</b><small>${kind}${rate}</small></div>
    <button type="button" class="att-btn${here ? ' on' : ' away'}" data-act="att" data-id="${esc(st.id)}" aria-pressed="${here}" aria-label="${esc(st.name || 'Student')}: ${here ? 'here' : 'not here'}">${here ? `${icon('check', 'sm')} Here` : st.type === 'term' ? 'Away' : 'Not here'}</button></div>`;
}
const dropInForm = () => `<details class="more"><summary>${icon('plus')} Add a drop-in student</summary>
  <div class="two"><label class="field"><span class="f-l">Name</span><input name="dname" autocomplete="off" placeholder="Name"></label>
  <label class="field"><span class="f-l">Paid (optional)</span><span class="money-in"><input name="drate" inputmode="decimal" placeholder="Casual rate"></span></label></div>
  <button type="button" class="btn soft" data-act="dropin">Add drop-in</button></details>`;
// Attendance taps and drop-ins (used by the roll call and the session sheet).
function attActs(o, redraw) {
  return {
    att: a => {
      const s = sessionOf(o, true), st = o.c.students.find(x => x.id === a.dataset.id);
      if (!st) return;
      s.att[st.id] = isHere(s, st) ? 0 : 1;
      refreshPay(o);
      save();
      redraw();
    },
    dropin: (a, e, sh) => {
      const name = ($('[name=dname]', sh.el).value || '').trim();
      if (!name) { $('[name=dname]', sh.el).focus(); return; }
      const r = $('[name=drate]', sh.el).value, st = { id: uid(), name, type: 'casual', rate: hasNum(r) ? num(r) : null, from: o.date, to: o.date };
      o.c.students.push(st);
      sessionOf(o, true).att[st.id] = 1;
      refreshPay(o);
      save();
      redraw();
      toast(`${icon('check')} ${esc(name)} added for ${fmtDate(o.date)}`);
    },
  };
}
function restoreDate(key) {
  const o = occByKey(key);
  if (!o) return;
  delete o.c.skip[o.orig];
  save();
  refresh();
  toast(`${icon('undo')} ${esc(o.c.name)} is back on ${fmtDate(o.date)}`);
}
// Redraws whatever's open: the top sheet (if it can) and the screen underneath.
function refresh() { render(); if (SHEET && SHEET.redraw) SHEET.redraw(); }

/* ---------- photos ---------- */
const photoIds = kind => Object.values(S.photos).filter(p => (kind ? (p.kind || 'ref') === kind : true)).sort((a, b) => b.at - a.at).map(p => p.id);
// Sessions of a class where this photo was a reference.
const refUses = (cid, pid, exceptKey) => Object.entries(S.sessions).filter(([k, s]) => s.c === cid && k !== exceptKey && (s.refs || []).includes(pid)).map(([, s]) => s.d).sort();
function photoTile(id, opts = {}) {
  const p = S.photos[id] || {}, cap = opts.cap !== undefined ? opts.cap : p.title;
  const inner = `${phImg(id)}${cap ? `<span class="cap">${esc(cap)}</span>` : ''}`;
  if (opts.href) return `<a class="thumb" href="${opts.href}" aria-label="${esc(p.title || 'Photo')}">${inner}</a>`;
  return `<button type="button" class="thumb${opts.sel ? ' sel' : ''}" data-act="${opts.act || 'photo'}" data-id="${esc(id)}" aria-pressed="${opts.sel === undefined ? '' : !!opts.sel}" aria-label="${esc(p.title || 'Photo')}${opts.label ? `, ${opts.label}` : ''}">${inner}${opts.sel !== undefined ? `<span class="tickmark">${icon('check')}</span>` : ''}${opts.badge ? `<span class="cap used-cap">${opts.badge}</span>` : ''}</button>`;
}
// Adds photos from the phone, with progress. Returns their ids.
async function importPhotos(meta = {}) {
  const files = await pickFiles(true);
  if (!files.length) return [];
  if (!PH.ok) { toast(`${icon('warn')} Photos can’t be saved in this browser. Open Atelier in Safari.`, { ms: 6000 }); return []; }
  toast(`Adding ${plural(files.length, 'photo')}…`, { ms: 60000 });
  const ids = await addPhotoFiles(files, meta, (n, t) => { if (t > 1) toast(`Adding photos… ${n} of ${t}`, { ms: 60000 }); });
  if (ids.length) toast(`${icon('check')} ${plural(ids.length, 'photo')} added`);
  return ids;
}
// Choose photos from the library. onDone(ids) gets the chosen ones.
function pickPhotos({ title = 'Choose photos', cid = '', exceptKey = '', already = [], onDone }) {
  const sel = new Set();
  let q = '', tag = '', kind = 'ref';
  const tpl = () => {
    const ids = photoIds(kind).filter(id => !already.includes(id) && matchPhoto(S.photos[id], q, tag));
    const tags = allTags(kind);
    return framed(sheetHead(title, cid ? 'Photos marked “used” have been a reference for this class before.' : ''),
      `${seg('kind', [['ref', 'References'], ['art', 'Artworks']], kind)}
      <div class="search" style="margin-top:12px">${icon('search')}<input type="search" name="q" value="${esc(q)}" placeholder="Search titles and tags" aria-label="Search photos"></div>
      ${tags.length ? `<div class="chips scroll">${chip('All', !tag, 'data-act="tag" data-t=""')}${tags.map(t => chip(esc(t), tag === t, `data-act="tag" data-t="${esc(t)}"`)).join('')}</div>` : ''}
      <div class="pgrid" style="margin-top:8px">${ids.map(id => {
        const used = cid ? refUses(cid, id, exceptKey) : [];
        return photoTile(id, { act: 'pick', sel: sel.has(id), cap: '', badge: used.length ? `Used ${fmtDate(used[used.length - 1], { noDay: true })}` : '', label: used.length ? `used with this class on ${fmtDate(used[used.length - 1])}` : '' });
      }).join('')}</div>
      ${ids.length ? '' : `<p class="fine" style="margin-top:12px">${Object.keys(S.photos).length ? 'No photos match.' : 'No photos yet. Add some from your phone.'}</p>`}`,
      `<button type="button" class="btn" data-act="new">${icon('camera')} From phone</button><button type="button" class="btn primary" data-act="ok"${sel.size ? '' : ' disabled'}>${sel.size ? `Add ${plural(sel.size, 'photo')}` : 'Choose photos'}</button>`);
  };
  const sh = openSheet(tpl(), {
    label: title,
    act: {
      pick: a => { const id = a.dataset.id; if (sel.has(id)) sel.delete(id); else sel.add(id); sh.set(tpl()); },
      tag: a => { tag = a.dataset.t; sh.set(tpl()); },
      ok: () => { sh.close(); onDone([...sel]); },
      new: async () => { const ids = await importPhotos({ kind }); ids.forEach(id => sel.add(id)); if (!sh.closed) sh.set(tpl()); },
    },
    input: e => { if (e.target.name === 'q') { q = e.target.value; const pos = e.target.selectionStart; sh.set(tpl()); const i = $('[name=q]', sh.el); i.focus(); i.setSelectionRange(pos, pos); } },
  });
  sh.el.addEventListener('click', e => { const b = e.target.closest('[data-seg="kind"]'); if (b) { kind = b.dataset.v; tag = ''; sh.set(tpl()); } });
}
const matchPhoto = (p, q, tag) => p && (!tag || (p.tags || []).includes(tag)) && (!q || `${p.title} ${(p.tags || []).join(' ')} ${p.note}`.toLowerCase().includes(q.toLowerCase().trim()));
const allTags = kind => [...new Set([].concat(...Object.values(S.photos).filter(p => !kind || (p.kind || 'ref') === kind).map(p => p.tags || [])))].sort((a, b) => a.localeCompare(b));

/* ---------- choosing a class session ---------- */
// onPick(o). Lists each class's next few sessions.
function pickSession({ title = 'Which class?', sub = '', onPick, n = 4 }) {
  const cls = liveClasses();
  const body = cls.length ? cls.map(c => {
    const ups = upcoming(c, n);
    return `<h3 style="display:flex;align-items:center;gap:8px">${swatch(c.color)} ${esc(c.name)}</h3>${ups.length ? `<div class="list">${ups.map(o => `<button type="button" class="lrow" data-act="pick" data-key="${esc(o.key)}"><span class="t"><b>${relDay(o.date)}</b><small>${fmtDate(o.date, { long: true })} · ${fmtTime(o.time)}${o.s && o.s.topic ? ` · ${esc(o.s.topic)}` : ''}</small></span>${icon('chev-r', 'go')}</button>`).join('')}</div>` : '<p class="fine">No classes coming up.</p>'}`;
  }).join('') : emptyState('users', 'No classes yet', 'Add a class first, then you can plan its sessions.', '<a class="btn primary" href="#/classes">Go to classes</a>');
  const sh = openSheet(`${sheetHead(title, sub)}${body}`, { label: title, act: { pick: a => { const o = occByKey(a.dataset.key); sh.close(); if (o) onPick(o); } } });
}

/* ---------- choosing a technique ---------- */
function pickTechnique({ title = 'Add a technique', onPick, already = [] }) {
  let q = '';
  const tpl = () => {
    const hits = TECH.filter(t => !already.includes(t.id) && (!q || `${t.n} ${t.sum}`.toLowerCase().includes(q.toLowerCase())));
    return `${sheetHead(title)}<div class="search">${icon('search')}<input type="search" name="q" value="${esc(q)}" placeholder="Search techniques" aria-label="Search techniques"></div>
      ${SECTIONS.map(sec => { const ts = hits.filter(t => t.s === sec.id); return ts.length ? `<h3>${sec.n}</h3><div class="list">${ts.map(t => `<button type="button" class="lrow" data-act="pick" data-id="${t.id}"><span class="t"><b>${esc(t.n)}</b><small>${esc(t.sum)}</small></span>${icon('plus', 'go')}</button>`).join('')}</div>` : ''; }).join('') || '<p class="fine">Nothing matches.</p>'}`;
  };
  const sh = openSheet(tpl(), {
    label: title,
    act: { pick: a => { sh.close(); onPick(a.dataset.id); } },
    input: e => { if (e.target.name === 'q') { q = e.target.value; const pos = e.target.selectionStart; sh.set(tpl()); const i = $('[name=q]', sh.el); i.focus(); i.setSelectionRange(pos, pos); } },
  });
}
const techName = id => { if (id.startsWith('a:')) { const a = THERAPY_BY[id.slice(2)]; return a ? a.n : id; } const t = TECH_BY[id]; return t ? t.n : id; };
