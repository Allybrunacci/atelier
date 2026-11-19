/* Atelier — one class session: tick it off, who came, pay, the lesson, references, artworks, notes, and changes to this date */
'use strict';

function openSession(key) {
  let o = occByKey(key);
  if (!o) { toast('That class isn’t on the calendar any more.'); return; }
  let payEdit = false, moving = false, timer = 0;
  const later = () => { clearTimeout(timer); timer = setTimeout(save, 400); };
  const S_ = () => sessionOf(o, true);

  const tpl = () => {
    o = occByKey(key) || o;
    const c = o.c, s = o.s || { att: {}, refs: [], art: [], tech: [] }, done = !!s.done;
    const head = `<div class="band" style="--c:${c.color}"></div>${sheetHead(esc(c.name), `${fmtDate(o.date, { long: true })} · ${fmtSpan(o.time, o.mins)}${c.place ? ` · ${esc(c.place)}` : ''}`)}`;
    let b = '';
    if (o.cancelled) b += `<div class="callout warn">${icon('cancel')}<div><p><b>This class is cancelled.</b> It isn’t counted on the calendar or in your earnings.</p><button type="button" class="btn sm" data-act="uncancel">Restore it</button></div></div>`;
    else if (o.moved) b += `<p class="fine">${icon('move', 'sm')} Moved from ${fmtDate(o.orig, { long: true })} at ${fmtTime(versionAt(c, o.orig) ? versionAt(c, o.orig).time : c.time)}.</p>`;
    else if (o.extra) b += `<p class="fine">${icon('plus', 'sm')} An extra class, outside the usual pattern.</p>`;

    // who came
    if (c.kind === 'group') {
      const sts = activeStudents(c, o.date);
      b += `<h3>Who came</h3>${c.pay.mode === 'student' ? '<p class="fine">Term students are counted every class, even when they’re away. Casual students are counted when ticked.</p>' : ''}
        <div class="list">${sts.map(st => attRow(st, s)).join('') || '<p class="fine" style="padding:12px 16px">No students in this class yet.</p>'}</div>${dropInForm()}`;
    }

    // pay
    const lines = done && s.pay ? s.pay.lines : payLines(c, s, o.date), worked = linesTotal(lines), adj = hasNum(s.adj);
    b += `<h3>Pay</h3><table class="pay-lines"><tbody>${lines.map(l => `<tr><td>${esc(l[0])}${l[2] ? `<small>${esc(l[2])}</small>` : ''}</td><td>${money(l[1])}</td></tr>`).join('') || '<tr><td colspan="2" class="muted">Nobody counted yet</td></tr>'}
      ${adj ? `<tr><td>Changed by you<small>Worked out: ${money(worked)}</small></td><td>${money(s.adj)}</td></tr>` : ''}
      <tr class="total"><td>${done ? 'Earned' : 'To earn'}</td><td>${money(adj ? s.adj : worked)}</td></tr></tbody></table>
      ${payEdit ? `<div class="row" style="margin-top:12px"><label class="field grow" style="margin:0"><span class="f-l">Amount for this class</span><span class="money-in"><input name="adj" inputmode="decimal" value="${adj ? esc(num(s.adj)) : ''}" placeholder="${esc(worked)}"></span></label><button type="button" class="btn primary" data-act="adjok" style="align-self:flex-end">Save</button></div>`
        : `<div class="btn-row"><button type="button" class="btn sm" data-act="adj">${icon('edit', 'sm')} Change amount</button>${adj ? '<button type="button" class="btn sm ghost" data-act="adjclear">Use worked-out amount</button>' : ''}</div>`}
      ${done && s.pay && linesTotal(payLines(c, s, o.date)) !== s.pay.total && !adj ? `<p class="fine" style="margin-top:8px">${icon('info', 'sm')} The class’s rates have changed since this was ticked. <button type="button" class="btn sm ghost" data-act="repay">Use new rates (${money(linesTotal(payLines(c, s, o.date)))})</button></p>` : ''}`;

    // lesson
    b += `<h3>Lesson</h3><label class="field"><span class="f-l">What you’re teaching</span><input name="topic" value="${esc(s.topic || '')}" placeholder="e.g. Cross-hatching a still life" autocomplete="off"></label>
      <div class="g-l">Techniques</div><div class="chips">${(s.tech || []).map(id => `<span class="chip" style="padding-right:4px"><a href="${techHref(id)}" style="color:inherit;text-decoration:none">${esc(techName(id))}</a><button type="button" class="icon-btn" style="width:36px;height:36px" data-act="untech" data-id="${esc(id)}" aria-label="Remove ${esc(techName(id))}">${icon('close', 'sm')}</button></span>`).join('')}${chip(`${icon('plus')} Add technique`, false, 'data-act="tech"')}</div>
      ${s.plan ? planCard(s.plan, o.mins, c.color) : `<p class="fine" style="margin-top:12px">Need an idea? <a href="#/plan">Plan a term</a> or browse <a href="#/techniques">techniques</a>.</p>`}`;

    // references
    const refs = s.refs || [];
    b += `<h3>References</h3><div class="thumbs">${refs.map(id => {
      const used = refUses(c.id, id, key).filter(d => d !== o.date);
      return `<div class="thumb">${S.photos[id] ? `<a href="#/photo/${esc(id)}" aria-label="${esc(S.photos[id].title || 'Reference photo')}">${phImg(id)}</a>` : '<span class="cap">Photo deleted</span>'}${used.length ? `<span class="cap">Also ${fmtDate(used[used.length - 1], { noDay: true })}</span>` : ''}<button type="button" class="rm" data-act="unref" data-id="${esc(id)}" aria-label="Remove this reference">${icon('close')}</button></div>`;
    }).join('')}<button type="button" class="thumb add" data-act="refs">${icon('image')}From Photos</button><button type="button" class="thumb add" data-act="refnew">${icon('camera')}New</button></div>`;

    // artworks
    const art = s.art || [], who = c.kind === 'group' ? activeStudents(c, o.date) : [];
    b += `<h3>Artworks</h3>${art.length ? '' : '<p class="fine">Add photos of what was made today. They’ll appear on the class’s page.</p>'}
      ${art.map((a, i) => `<div class="art">${S.photos[a.photo] ? `<a class="thumb" href="#/photo/${esc(a.photo)}" aria-label="Open artwork photo">${phImg(a.photo)}</a>` : '<div class="thumb"><span class="cap">Deleted</span></div>'}
        <div><label class="field"><span class="f-l">Title</span><input data-f="atitle" data-i="${i}" value="${esc(a.title || '')}" placeholder="Untitled" autocomplete="off"></label>
        ${who.length ? `<label class="field"><span class="f-l">By</span><select data-f="awho" data-i="${i}"><option value="">Not set</option>${who.map(st => `<option value="${esc(st.id)}"${a.who === st.id ? ' selected' : ''}>${esc(st.name || 'Student')}</option>`).join('')}<option value="all"${a.who === 'all' ? ' selected' : ''}>The whole class</option></select></label>` : ''}
        <button type="button" class="btn sm danger-ghost" data-act="unart" data-i="${i}">${icon('trash', 'sm')} Remove</button></div></div>`).join('')}
      <div class="btn-row"><button type="button" class="btn soft" data-act="artnew">${icon('camera')} Add artwork photos</button><button type="button" class="btn ghost" data-act="artpick">From Photos</button></div>`;

    // notes
    b += `<h3>Notes</h3><label class="field"><span class="vh">Notes for this class</span><textarea class="inp" name="note" placeholder="How it went, what to bring next time…">${esc(s.note || '')}</textarea></label>`;

    // this date
    if (!o.cancelled) {
      b += `<h3>This date</h3>${moving ? `<div class="two"><label class="field"><span class="f-l">New date</span><input type="date" name="mdate" value="${o.date}"></label><label class="field"><span class="f-l">Start time</span><input type="time" name="mtime" value="${o.time}"></label></div>
        <div class="btn-row" style="margin-top:0"><button type="button" class="btn primary" data-act="moveok">Move it</button><button type="button" class="btn ghost" data-act="movecancel">Keep as is</button>${o.moved ? '<button type="button" class="btn ghost" data-act="unmove">Put it back</button>' : ''}</div>`
        : `<div class="btn-row" style="margin-top:0"><button type="button" class="btn" data-act="move">${icon('move')} Move</button>${o.extra ? `<button type="button" class="btn" data-act="unextra">${icon('trash')} Remove extra class</button>` : `<button type="button" class="btn" data-act="cancel">${icon('cancel')} Cancel this date</button>`}<button type="button" class="btn ghost" data-act="editclass">${icon('edit')} Edit class</button></div>`}`;
    }
    const foot = o.cancelled ? '<button type="button" class="btn big" data-close>Close</button>'
      : done ? `<button type="button" class="btn big ok" data-act="done" aria-pressed="true">${icon('check')} Taught · ${money(payOf(o))}</button>`
        : `<button type="button" class="btn big primary" data-act="done" aria-pressed="false">Mark as taught · ${money(payOf(o))}</button>`;
    return framed(head, b, foot);
  };

  const redraw = () => { if (!sh.closed) sh.set(tpl()); };
  const addRefs = ids => {
    const s = S_(), fresh = ids.filter(id => !s.refs.includes(id));
    s.refs.push(...fresh);
    save();
    redraw();
    const before = fresh.filter(id => refUses(o.c.id, id, key).length);
    if (before.length) toast(`${icon('warn')} ${before.length === 1 ? 'That photo has' : `${before.length} of those have`} been used with this class before`, { ms: 5000 });
  };
  const addArt = ids => {
    const s = S_();
    ids.forEach(id => { s.art.push({ id: uid(), photo: id, title: '', who: o.c.kind === 'private' ? '' : '', note: '' }); Object.assign(S.photos[id], { kind: 'art', cls: o.c.id, d: o.date }); });
    save();
    redraw();
  };
  const act = Object.assign(attActs(o, redraw), {
    done: () => {
      const was = !!(o.s && o.s.done);
      setDone(o, !was);
      redraw();
      render();
      toast(was ? `${icon('undo')} Unticked` : `${icon('check')} Taught · ${money(payOf(o))} added to this week`, { undo: () => { setDone(o, was); redraw(); render(); } });
    },
    adj: () => { payEdit = true; redraw(); const i = $('[name=adj]', sh.el); if (i) i.focus(); },
    adjok: () => { const v = $('[name=adj]', sh.el).value, s = S_(); if (hasNum(v)) s.adj = num(v); else delete s.adj; payEdit = false; save(); redraw(); render(); },
    adjclear: () => { delete S_().adj; save(); redraw(); render(); },
    repay: () => { refreshPay(o); save(); redraw(); render(); },
    tech: () => pickTechnique({ already: (o.s && o.s.tech) || [], onPick: id => { const s = S_(); s.tech = s.tech || []; s.tech.push(id); if (!s.topic) s.topic = techName(id); save(); redraw(); render(); } }),
    untech: a => { const s = S_(); s.tech = s.tech.filter(x => x !== a.dataset.id); save(); redraw(); },
    refs: () => pickPhotos({ title: 'Add references', cid: o.c.id, exceptKey: key, already: (o.s && o.s.refs) || [], onDone: addRefs }),
    refnew: async () => { const ids = await importPhotos({ kind: 'ref' }); if (ids.length) addRefs(ids); },
    unref: a => { const s = S_(), i = s.refs.indexOf(a.dataset.id); if (i < 0) return; s.refs.splice(i, 1); save(); redraw(); toast('Reference removed', { undo: () => { s.refs.splice(i, 0, a.dataset.id); save(); redraw(); } }); },
    artnew: async () => { const ids = await importPhotos({ kind: 'art', cls: o.c.id, d: o.date }); if (ids.length) addArt(ids); },
    artpick: () => pickPhotos({ title: 'Add artworks', already: ((o.s && o.s.art) || []).map(a => a.photo), onDone: addArt }),
    unart: a => { const s = S_(), i = +a.dataset.i, gone = s.art.splice(i, 1)[0]; save(); redraw(); toast('Artwork removed from this class (the photo stays in Photos)', { undo: () => { s.art.splice(i, 0, gone); save(); redraw(); } }); },
    move: () => { moving = true; redraw(); },
    movecancel: () => { moving = false; redraw(); },
    unmove: () => { delete o.c.moved[o.orig]; moving = false; save(); redraw(); render(); toast(`${icon('undo')} Back on ${fmtDate(o.orig)}`); },
    moveok: () => {
      const d = $('[name=mdate]', sh.el).value, t = $('[name=mtime]', sh.el).value;
      if (!validDate(d) || !validTime(t)) { toast(`${icon('warn')} Choose a date and a time`); return; }
      const c = o.c;
      if (o.extra) {
        const old = o.orig.slice(1);
        if (d !== old && c.extra[d] !== undefined) { toast(`${icon('warn')} There’s already an extra class that day`); return; }
        delete c.extra[old];
        c.extra[d] = t;
        const s = S.sessions[key];
        if (s) { delete S.sessions[key]; S.sessions[keyOf(c.id, 'x' + d)] = s; s.d = d; s.t = t; }
        key = keyOf(c.id, 'x' + d);
      } else {
        const v = versionAt(c, o.orig);
        if (d === o.orig && v && t === v.time) delete c.moved[o.orig]; else c.moved[o.orig] = { date: d, time: t };
      }
      moving = false;
      save();
      o = occByKey(key);
      if (o && o.s) { o.s.d = o.date; o.s.t = o.time; save(); }
      redraw();
      render();
      toast(`${icon('move')} Moved to ${fmtDate(d)} at ${fmtTime(t)}`);
    },
    cancel: async () => {
      const wasDone = !!(o.s && o.s.done);
      if (wasDone && !(await ask({ title: 'Cancel a class you’ve ticked?', body: `It was marked as taught, so its ${money(payOf(o))} comes off your earnings.`, ok: 'Cancel class', cancel: 'Keep it', danger: true }))) return;
      const c = o.c, orig = o.orig;
      if (wasDone) setDone(o, false);
      c.skip[orig] = 1;
      save();
      sh.close();
      render();
      toast(`${icon('cancel')} ${esc(c.name)} cancelled on ${fmtDate(o.date)}`, { undo: () => { delete c.skip[orig]; if (wasDone) setDone(occByKey(key), true); save(); render(); } });
    },
    uncancel: () => { delete o.c.skip[o.orig]; save(); redraw(); render(); toast(`${icon('undo')} Restored`); },
    unextra: async () => {
      const s = S.sessions[key], has = s && (s.done || (s.refs || []).length || (s.art || []).length || s.note || s.topic);
      if (has && !(await ask({ title: 'Remove this extra class?', body: 'Its notes, references, artworks and pay are removed with it. You can undo straight after.', ok: 'Remove', danger: true }))) return;
      const c = o.c, d = o.orig.slice(1), t = c.extra[d];
      delete c.extra[d];
      delete S.sessions[key];
      save();
      sh.close();
      render();
      toast(`${icon('trash')} Extra class removed`, { undo: () => { c.extra[d] = t; if (s) S.sessions[key] = s; save(); render(); } });
    },
    editclass: () => openClassEditor(o.c),
  });
  const sh = openSheet(tpl(), {
    label: `${o.c.name}, ${fmtDate(o.date, { long: true })}`, act,
    input: e => {
      const el = e.target;
      if (el.name === 'topic') { S_().topic = el.value; later(); }
      else if (el.name === 'note') { S_().note = el.value; later(); }
      else if (el.dataset.f === 'atitle') { const a = S_().art[+el.dataset.i]; if (a) { a.title = el.value; if (S.photos[a.photo]) S.photos[a.photo].title = el.value; later(); } }
    },
    change: e => {
      const el = e.target;
      if (el.dataset.f === 'awho') { const a = S_().art[+el.dataset.i]; if (a) { a.who = el.value; save(); } }
      else if (el.name === 'topic' || el.name === 'note') { save(); render(); }
    },
    onClose: () => { clearTimeout(timer); save(); render(); },
  });
  sh.redraw = redraw;
  return sh;
}

// A lesson from the planner, with its running sheet for the class's length.
function planCard(p, mins, color) {
  const run = runSheet(p, mins, p.age);
  return `<div class="card flat plan-card" style="--c:${color || 'var(--accent)'};margin-top:16px">
    <p class="kicker" style="margin:0">${esc(p.from || 'From your term plan')}${p.wk ? ` · week ${p.wk}` : ''}</p>
    <h3 style="margin:4px 0 6px">${esc(p.t)}</h3>${p.aim ? `<p>${esc(p.aim)}</p>` : ''}
    <ul class="run">${run.map(r => `<li><b>${r[0]} min</b><span><em>${esc(r[1])}</em>${esc(r[2])}</span></li>`).join('')}</ul>
    ${(p.tech || []).length ? `<p class="fine" style="margin:10px 0 0">Techniques: ${p.tech.map(id => `<a href="${techHref(id)}">${esc(techName(id))}</a>`).join(', ')}</p>` : ''}</div>`;
}
