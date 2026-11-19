/* Atelier — earnings: each week (Monday to Sunday), a 12-week chart, totals, and a spreadsheet export */
'use strict';

VIEWS.earnings = {
  tab: 'today', title: 'Earnings',
  head(p) {
    const mon = mondayOf(validDate(p) ? p : today());
    return { deco: true, back: '#/today', title: 'Earnings', sub: `Week of ${fmtWeek(mon)}`, actions: `<div class="vh-act"><button type="button" class="icon-btn" data-act="csv" aria-label="Export to a spreadsheet">${icon('share')}</button></div>` };
  },
  render(p) {
    const t = today(), cur = mondayOf(t), mon = mondayOf(validDate(p) ? p : t), wk = weekSummary(mon);
    let h = `<div class="cal-top"><button type="button" class="icon-btn" data-act="wk" data-v="-7" aria-label="Previous week">${icon('chev-l')}</button><h2>${mon === cur ? 'This week' : mon === addDays(cur, -7) ? 'Last week' : mon === addDays(cur, 7) ? 'Next week' : fmtWeek(mon)}</h2>${mon !== cur ? '<button type="button" class="btn sm ghost" data-act="now">This week</button>' : ''}<button type="button" class="icon-btn" data-act="wk" data-v="7" aria-label="Next week">${icon('chev-r')}</button></div>`;
    h += `<div class="card"><div class="stat">${money(wk.earned)}</div><p class="fine" style="margin:4px 0 0">Earned ${fmtDate(mon, { noDay: true })} to ${fmtDate(wk.sun, { noDay: true })} from ${plural(wk.done.length, 'class', 'classes')} you ticked</p>
      ${wk.aheadAmt ? `<p style="margin:12px 0 0">${icon('clock', 'sm')} <b>${money(wk.aheadAmt)}</b> still to come from ${plural(wk.ahead.length, 'class', 'classes')}</p>` : ''}
      ${wk.missed.length ? `<p style="margin:8px 0 0;color:var(--warn)">${icon('warn', 'sm')} <b>${plural(wk.missed.length, 'class', 'classes')}</b> not ticked yet (${money(wk.missedAmt)})</p>` : ''}</div>`;
    if (wk.missed.length) h += `<div class="sec"><h2>Not ticked yet</h2></div>${wk.missed.map(o => sessRow(o, { date: true })).join('')}`;
    if (wk.done.length) {
      h += `<div class="sec"><h2>Taught</h2></div>${wk.done.map(x => { const o = x.c && occByKey(x.key); return o ? sessRow(o, { date: true }) : `<div class="srow done"><div class="s-main"><span class="sbar" style="--c:var(--line-2)"></span><span class="s-txt"><b>${x.c ? esc(x.c.name) : 'Deleted class'}</b><small>${fmtDate(x.s.d)}</small></span><span class="s-amt">${money(x.amt)}</span></div></div>`; }).join('')}`;
      const by = new Map();
      wk.done.forEach(x => { const k = x.s.c, r = by.get(k) || { c: x.c, n: 0, amt: 0 }; r.n++; r.amt += x.amt; by.set(k, r); });
      if (by.size > 1) {
        const rows = [...by.values()].sort((a, b) => b.amt - a.amt), top = rows[0].amt || 1;
        h += `<div class="sec"><h2>By class</h2></div><div class="card byclass">${rows.map(r => `<div class="r" style="--c:${r.c ? r.c.color : 'var(--line-2)'}"><span>${r.c ? esc(r.c.name) : 'Deleted class'} <span class="muted">× ${r.n}</span></span><b class="tnum">${money(r.amt)}</b><span class="bar"><i style="width:${Math.round((r.amt / top) * 100)}%"></i></span></div>`).join('')}</div>`;
      }
    }
    if (wk.ahead.length) h += `<div class="sec"><h2>Still to come</h2></div>${wk.ahead.map(o => sessRow(o, { date: true })).join('')}`;
    if (!wk.occs.length && !wk.done.length) h += '<p class="fine" style="margin-top:16px">No classes this week.</p>';

    // the last 12 weeks, ending with the one shown (or this week, if that's later)
    const end = mon > cur ? mon : cur, weeks = [];
    for (let i = 11; i >= 0; i--) { const m = addDays(end, -7 * i); weeks.push([m, earnedBetween(m, addDays(m, 6))]); }
    const top = Math.max(1, ...weeks.map(w => w[1])), avg = sum(weeks.filter(w => w[0] <= cur).map(w => w[1])) / Math.max(1, weeks.filter(w => w[0] <= cur).length);
    h += `<div class="sec"><h2>12 weeks</h2><span class="fine">Average ${money(avg)}</span></div><div class="card"><div class="hbars">${weeks.map(([m, v], i) => `<button type="button" class="hb${m === mon ? ' sel' : ''}${m === cur ? ' cur' : ''}" data-act="go" data-mon="${m}" aria-label="Week of ${fmtWeek(m)}: ${money(v)}"${m === mon ? ' aria-current="true"' : ''}><span class="hb-v">${m === mon ? money(v) : ''}</span><span class="hb-col"><i style="height:${Math.max(2, Math.round((v / top) * 100))}%"></i></span><span class="hb-l">${i % 3 === 2 || m === mon ? `${+m.slice(8)} ${MON_SHORT[+m.slice(5, 7) - 1]}` : ''}</span></button>`).join('')}</div></div>`;

    const fy0 = finYearStart(t), y0 = t.slice(0, 4) + '-01-01', m0 = monthStart(t);
    const tot = [[MONTHS[+t.slice(5, 7) - 1], earnedBetween(m0, addDays(addMonths(m0, 1), -1))], [`Financial year ${finYearName(t)}`, earnedBetween(fy0, finYearEnd(t))], [`${t.slice(0, 4)} so far`, earnedBetween(y0, t.slice(0, 4) + '-12-31')], ['All time', earnedBetween('0000-01-01', '9999-12-31')]];
    h += `<div class="sec"><h2>Totals</h2></div><div class="stats">${tot.map(([l, n]) => `<div class="card"><div class="n">${money(n)}</div><div class="l">${l}</div></div>`).join('')}</div>
      <p class="fine" style="margin-top:12px">Totals count ticked classes. Term students are counted at their per-class rate each class, rather than when the term fee is paid. The Australian financial year runs 1 July to 30 June.</p>
      <div class="btn-row"><button type="button" class="btn" data-act="csv">${icon('share')} Export to a spreadsheet</button></div>`;
    return h;
  },
  act: Object.assign({}, SESS_ACTS, {
    wk: a => go(`#/earnings/${addDays(mondayOf(validDate(UI.param) ? UI.param : today()), +a.dataset.v)}`),
    now: () => go(`#/earnings/${mondayOf(today())}`),
    go: a => go(`#/earnings/${a.dataset.mon}`),
    csv: () => exportEarnings(),
  }),
};
const csvCell = v => { const s = String(v == null ? '' : v); return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
function earningsCsv(from, to) {
  const rows = [['Date', 'Day', 'Start', 'Class', 'Type', 'Counted', 'Amount (AUD)', 'Changed by you', 'Lesson', 'Notes']];
  for (const x of doneBetween(from, to)) {
    const s = x.s, c = x.c, counted = s.pay ? s.pay.lines.map(l => `${l[0]} ${money(l[1])}`).join('; ') : '';
    rows.push([s.d, DAY_SHORT[dow(s.d)], s.t || '', c ? c.name : 'Deleted class', c ? (c.kind === 'group' ? 'Group' : 'Private') : '', counted, x.amt.toFixed(2), hasNum(s.adj) ? 'Yes' : '', s.topic || '', s.note || '']);
  }
  return '\ufeff' + rows.map(r => r.map(csvCell).join(',')).join('\r\n') + '\r\n';
}
function exportEarnings() {
  const t = today(), mon = mondayOf(validDate(UI.param) && UI.cur === 'earnings' ? UI.param : t);
  const opts = [['week', `The week of ${fmtWeek(mon)}`, mon, addDays(mon, 6)], ['fy', `Financial year ${finYearName(t)}`, finYearStart(t), finYearEnd(t)], ['lastfy', `Financial year ${finYearName(addDays(finYearStart(t), -1))}`, finYearStart(addDays(finYearStart(t), -1)), addDays(finYearStart(t), -1)], ['all', 'Everything', '0000-01-01', '9999-12-31']];
  const sh = openSheet(`${sheetHead('Export earnings', 'A CSV file that opens in Numbers, Excel or Google Sheets.')}<div class="list">${opts.map(([k, l, a, b]) => { const n = doneBetween(a, b).length; return `<button type="button" class="lrow" data-act="x" data-k="${k}"${n ? '' : ' disabled'}><span class="t"><b>${l}</b><small>${plural(n, 'class', 'classes')} · ${money(earnedBetween(a, b))}</small></span>${icon('share', 'go')}</button>`; }).join('')}</div>`, {
    label: 'Export earnings', cls: 'small',
    act: {
      x: async a => {
        const o = opts.find(x => x[0] === a.dataset.k);
        sh.close();
        const r = await shareFile(new Blob([earningsCsv(o[2], o[3])], { type: 'text/csv' }), `atelier-earnings-${o[0] === 'all' ? 'all' : o[2]}.csv`, 'Atelier earnings');
        if (r === 'downloaded') toast(`${icon('download')} Saved to your downloads`);
      },
    },
  });
}
