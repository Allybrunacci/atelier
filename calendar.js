/* Atelier — calendar: month and week views, with each day's classes */
'use strict';

VIEWS.calendar = {
  title: 'Calendar',
  head() { return { deco: true, title: 'Calendar', actions: `<div class="vh-act"><button type="button" class="icon-btn" data-act="new" aria-label="New class">${icon('plus')}</button><a class="icon-btn" href="#/settings" aria-label="Settings">${icon('cog')}</a></div>` }; },
  render(p) {
    const sel = validDate(p) ? p : today(), mode = S.prefs.cal === 'week' ? 'week' : 'month', t = today();
    let h = `<div style="margin-bottom:16px">${seg('cmode', [['month', 'Month'], ['week', 'Week']], mode)}</div>`;
    if (mode === 'month') {
      const m0 = monthStart(sel), last = addDays(addMonths(m0, 1), -1), g0 = mondayOf(m0), g1 = addDays(mondayOf(last), 6);
      const by = {};
      occurrences(g0, g1, null, true).forEach(o => { (by[o.date] = by[o.date] || []).push(o); });
      h += `<div class="cal-top"><button type="button" class="icon-btn" data-act="mon" data-v="-1" aria-label="Previous month">${icon('chev-l')}</button><h2>${fmtMonth(m0)}</h2>${m0 !== monthStart(t) ? '<button type="button" class="btn sm ghost" data-act="today">Today</button>' : ''}<button type="button" class="icon-btn" data-act="mon" data-v="1" aria-label="Next month">${icon('chev-r')}</button></div>`;
      h += `<div class="cal" id="cal">${DAY_SHORT.map(d => `<div class="dow" aria-hidden="true">${d.slice(0, 1)}</div>`).join('')}`;
      for (let d = g0; d <= g1; d = addDays(d, 1)) {
        const os = by[d] || [], live = os.filter(o => !o.cancelled), hol = S.terms.length && !inTerms(d);
        const cls = ['d', d.slice(0, 7) !== m0.slice(0, 7) && 'out', d === t && 'today', d === sel && 'sel', hol && 'hol'].filter(Boolean).join(' ');
        const label = `${fmtDate(d, { long: true, year: true })}${live.length ? `, ${plural(live.length, 'class', 'classes')}` : ''}${os.length > live.length ? `, ${os.length - live.length} cancelled` : ''}${hol ? ', school holidays' : ''}`;
        h += `<button type="button" class="${cls}" data-act="day" data-d="${d}" aria-label="${label}"${d === sel ? ' aria-current="date"' : ''}><span class="n">${+d.slice(8)}</span><span class="dots" aria-hidden="true">${os.slice(0, 4).map(o => `<i class="${o.cancelled ? 'x' : o.s && o.s.done ? 'done' : ''}" style="--c:${o.c.color}"></i>`).join('')}</span></button>`;
      }
      h += `</div><p class="legend"><span><i class="sw" style="--c:var(--ink-3);width:8px;height:8px"></i>Class</span><span><i class="sw" style="--c:var(--ink-3);width:6px;height:6px;box-shadow:0 0 0 1.5px var(--paper),0 0 0 3px var(--ink-3)"></i>Taught</span><span><i class="sw" style="width:8px;height:8px;background:none;box-shadow:inset 0 0 0 1.5px var(--ink-3)"></i>Cancelled</span>${S.terms.length ? '<span><u style="text-decoration:underline dotted;text-underline-offset:3px">12</u> School holidays</span>' : ''}</p>`;
      const os = occurrences(sel, sel, null, true), term = termOf(sel);
      h += `<div class="sec"><h2>${relDay(sel) === fmtDate(sel) ? fmtDate(sel, { long: true }) : `${relDay(sel)}, ${fmtDate(sel, { long: true, noDay: true })}`}</h2></div>`;
      if (S.terms.length) h += `<p class="fine" style="margin-top:-6px">${term ? esc(term.name) : 'School holidays'}</p>`;
      h += os.length ? os.map(o => sessRow(o)).join('') : '<p class="fine">No classes this day.</p>';
      h += `<div class="btn-row"><button type="button" class="btn sm" data-act="addday">${icon('plus', 'sm')} Add a class on this day</button></div>`;
    } else {
      const mon = mondayOf(sel), sum7 = weekSummary(mon);
      h += `<div class="cal-top"><button type="button" class="icon-btn" data-act="wk" data-v="-7" aria-label="Previous week">${icon('chev-l')}</button><h2>${fmtWeek(mon)}</h2>${mon !== mondayOf(t) ? '<button type="button" class="btn sm ghost" data-act="today">This week</button>' : ''}<button type="button" class="icon-btn" data-act="wk" data-v="7" aria-label="Next week">${icon('chev-r')}</button></div>`;
      h += `<a class="card tap" href="#/earnings/${mon}" style="margin-bottom:8px"><span class="row"><span class="grow"><b>${money(sum7.earned)}</b> earned${sum7.aheadAmt ? ` · ${money(sum7.aheadAmt)} to come` : ''}${sum7.missed.length ? ` · <span style="color:var(--warn)">${sum7.missed.length} not ticked</span>` : ''}</span>${icon('chev-r', 'go')}</span></a>`;
      const all = occurrences(mon, addDays(mon, 6), null, true);
      for (let i = 0; i < 7; i++) {
        const d = addDays(mon, i), os = all.filter(o => o.date === d), hol = S.terms.length && !inTerms(d);
        h += `<p class="daylbl${d === t ? ' today' : ''}">${DAY_LONG[i]} ${+d.slice(8)} ${MON_SHORT[+d.slice(5, 7) - 1]}${d === t ? ' · today' : ''}${hol ? ' · holidays' : ''}</p>${os.length ? os.map(o => sessRow(o)).join('') : '<p class="fine" style="margin:0 0 4px">No classes</p>'}`;
      }
    }
    return h;
  },
  act: Object.assign({}, SESS_ACTS, {
    day: a => go(`#/calendar/${a.dataset.d}`),
    mon: a => { const p = validDate(UI.param) ? UI.param : today(), m = addMonths(p, +a.dataset.v); go(`#/calendar/${m.slice(0, 7) === today().slice(0, 7) ? today() : m}`); },
    wk: a => go(`#/calendar/${addDays(mondayOf(validDate(UI.param) ? UI.param : today()), +a.dataset.v)}`),
    today: () => go(`#/calendar/${today()}`),
    new: () => openClassEditor(null, { date: validDate(UI.param) && UI.param >= today() ? UI.param : today() }),
    addday: () => addOnDay(validDate(UI.param) ? UI.param : today()),
  }),
  after(view) {
    const segClick = e => { const b = e.target.closest('[data-seg="cmode"]'); if (b) { S.prefs.cal = b.dataset.v; save(); render(); } };
    view.addEventListener('click', segClick);
    // Swipe the month sideways to change month.
    const cal = $('#cal', view);
    let x0 = null, y0 = 0;
    const down = e => { x0 = e.clientX; y0 = e.clientY; };
    const up = e => {
      if (x0 === null) return;
      const dx = e.clientX - x0, dy = e.clientY - y0;
      x0 = null;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) { const p = validDate(UI.param) ? UI.param : today(); go(`#/calendar/${addMonths(p, dx < 0 ? 1 : -1)}`); }
    };
    if (cal) { cal.addEventListener('pointerdown', down); cal.addEventListener('pointerup', up); }
    return () => view.removeEventListener('click', segClick);
  },
};
function addOnDay(d) {
  const cls = liveClasses();
  const sh = openSheet(`${sheetHead('Add a class', fmtDate(d, { long: true }))}
    <div class="list"><button type="button" class="lrow" data-act="newc"><span class="hub-ico" style="width:44px;height:44px">${icon('repeat')}</span><span class="t"><b>A new class</b><small>Starting this day, repeating or just once</small></span>${icon('chev-r', 'go')}</button></div>
    ${cls.length ? `<h3>An extra class for…</h3><div class="list">${cls.map(c => `<button type="button" class="lrow" data-act="ex" data-id="${c.id}"><span class="sw" style="--c:${c.color}"></span><span class="t"><b>${esc(c.name)}</b><small>${kindLabel(c)}</small></span>${icon('plus', 'go')}</button>`).join('')}</div>` : ''}`, {
    label: 'Add a class',
    act: {
      newc: () => { sh.close(); openClassEditor(null, { date: d }); },
      ex: a => { sh.close(); openExtra(S.classes[a.dataset.id], d); },
    },
  });
}
