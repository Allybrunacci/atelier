/* Atelier — expenses (art supplies and other costs for your classes, with receipt photos), car trips, and a
   tax-time summary and pack for each Australian financial year (1 July to 30 June) */
'use strict';

const EXP_CATS = [
  ['supplies', 'Art supplies', 'palette', 'butter'], ['venue', 'Venue or room hire', 'home', 'sky'], ['equip', 'Equipment', 'brush', 'lilac'],
  ['print', 'Printing and stationery', 'print', 'mint'], ['ads', 'Advertising and website', 'globe', 'pink'], ['ins', 'Insurance and checks', 'shield', 'lime'],
  ['learn', 'Courses and books', 'book', 'peach'], ['phone', 'Phone and internet', 'phone', 'sky'], ['travel', 'Parking, tolls and fares', 'pin', 'peach'], ['other', 'Other', 'tag', 'lilac'],
];
const CAT_BY = Object.fromEntries(EXP_CATS.map(c => [c[0], c]));
const catOf = id => CAT_BY[id] || CAT_BY.other;
const SHOP_HINTS = ['Officeworks', 'Eckersley’s Art & Craft', 'Art Shed', 'Riot Art & Craft', 'Spotlight', 'Kmart', 'Big W', 'Bunnings', 'Jackson’s Art'];
// The ATO's cents per kilometre rates, by the year each financial year starts. From ato.gov.au, checked 19 November 2026.
const KM_RATES = { 2020: 0.72, 2021: 0.72, 2022: 0.78, 2023: 0.85, 2024: 0.88, 2025: 0.88, 2026: 0.91 };
const KM_CAP = 5000;
const kmRateKnown = fy => KM_RATES[+fy.slice(0, 4)] !== undefined;
function kmRate(fy) {
  const y = +fy.slice(0, 4), own = S.prefs.kmRates && S.prefs.kmRates[y];
  if (hasNum(own)) return num(own);
  if (KM_RATES[y] !== undefined) return KM_RATES[y];
  const ys = Object.keys(KM_RATES).map(Number).sort((a, b) => a - b);
  return KM_RATES[y < ys[0] ? ys[0] : ys[ys.length - 1]];
}
const fyOf = p => finYearStart(validDate(p) ? p : today());

/* ---------- sums ---------- */
const expBiz = e => round2((num(e.amt) * clamp(hasNum(e.biz) ? num(e.biz) : 100, 0, 100)) / 100);
const expGst = e => (e.gst ? round2(expBiz(e) / 11) : 0);
const expensesBetween = (a, b) => S.expenses.filter(e => e.d >= a && e.d <= b).sort((x, y) => y.d.localeCompare(x.d) || (y.at || 0) - (x.at || 0));
const spentBetween = (a, b) => round2(sum(expensesBetween(a, b).map(expBiz)));
// Car trips: each ticked class whose class has a distance set, plus trips added by hand.
function tripsBetween(a, b) {
  const out = [];
  for (const [key, s] of Object.entries(S.sessions)) {
    if (!s.done || s.d < a || s.d > b) continue;
    const c = S.classes[s.c];
    if (c && num(c.km) > 0) out.push({ auto: true, key, d: s.d, km: num(c.km), what: c.name, place: c.place || '' });
  }
  for (const t of S.trips) if (t.d >= a && t.d <= b) out.push(Object.assign({ auto: false }, t));
  return out.sort((x, y) => y.d.localeCompare(x.d));
}
function taxSummary(fy) {
  const fe = finYearEnd(fy), exps = expensesBetween(fy, fe), trips = tripsBetween(fy, fe), km = round2(sum(trips.map(t => t.km)));
  const cats = EXP_CATS.map(([id, n]) => [id, n, round2(sum(exps.filter(e => catOf(e.cat)[0] === id).map(expBiz)))]).filter(c => c[2] > 0);
  const spent = round2(sum(cats.map(c => c[2]))), kmClaim = Math.min(km, KM_CAP), rate = kmRate(fy), car = round2(kmClaim * rate), done = doneBetween(fy, fe);
  const earned = round2(sum(done.map(x => x.amt))), received = receivedBetween(fy, fe);
  return { fy, fe, exps, trips, km, kmClaim, rate, car, cats, spent, gst: round2(sum(exps.map(expGst))), earned, classes: done.length, received, net: round2(earned - spent - car) };
}

/* ---------- adding or changing an expense ---------- */
function openExpense(e = null) {
  const isNew = !e, added = [];
  const d = e ? JSON.parse(JSON.stringify(e)) : { id: uid(), d: today(), what: '', shop: '', amt: '', cat: S.prefs.expCat || 'supplies', biz: 100, gst: !!biz().gst, rc: [], note: '', cid: '' };
  d.amt = d.amt === '' ? '' : String(d.amt);
  d.rc = d.rc || [];
  let part = hasNum(d.biz) && num(d.biz) < 100, saved = false;
  const shops = [...new Set(S.expenses.map(x => x.shop).filter(Boolean).reverse().concat(SHOP_HINTS))].slice(0, 40);
  const whats = [...new Set(S.expenses.map(x => x.what).filter(Boolean).reverse())].slice(0, 40);
  const forClasses = () => round2(((hasNum(d.amt) ? num(d.amt) : 0) * (part ? clamp(num(d.biz), 0, 100) : 100)) / 100);
  const tpl = () => framed(sheetHead(isNew ? 'Add an expense' : 'Edit expense', isNew ? 'Things you buy or pay for your classes' : ''),
    `<label class="field big-money"><span class="f-l">Amount</span><span class="money-in"><input name="amt" inputmode="decimal" value="${esc(d.amt)}" placeholder="0.00" autocomplete="off"></span></label>
    ${field('What for', `<input name="what" value="${esc(d.what)}" list="exp-whats" placeholder="e.g. Acrylic paints and brushes" autocomplete="off"><datalist id="exp-whats">${whats.map(w => `<option value="${esc(w)}"></option>`).join('')}</datalist>`)}
    <div class="two">${field('Where from', `<input name="shop" value="${esc(d.shop)}" list="exp-shops" placeholder="e.g. Officeworks" autocomplete="off"><datalist id="exp-shops">${shops.map(w => `<option value="${esc(w)}"></option>`).join('')}</datalist>`)}${field('Date', `<input type="date" name="d" value="${d.d}">`)}</div>
    <div class="field"><span class="f-l">Kind</span><div class="cat-grid" role="radiogroup" aria-label="Kind of expense">${EXP_CATS.map(([id, n, ic, tint]) => `<button type="button" role="radio" aria-checked="${d.cat === id}" class="cat tint-${tint}${d.cat === id ? ' on' : ''}" data-act="cat" data-v="${id}">${icon(ic)}<span>${n}</span></button>`).join('')}</div></div>
    <div class="field"><span class="f-l">Receipt</span><div class="thumbs">${d.rc.map(id => `<div class="thumb">${S.photos[id] ? `<button type="button" class="thumb-open" data-act="rcview" data-id="${esc(id)}" aria-label="Look at the receipt">${phImg(id)}</button>` : '<span class="cap">Missing</span>'}<button type="button" class="rm" data-act="rcrm" data-id="${esc(id)}" aria-label="Remove this receipt photo">${icon('close')}</button></div>`).join('')}<button type="button" class="thumb add" data-act="rcadd">${icon('camera')}${d.rc.length ? 'Another' : 'Add photo'}</button></div><small class="f-h">A clear photo of each receipt is a good record to keep.</small></div>
    <div class="field"><span class="f-l">Used for your classes</span>${seg('part', [['all', 'All of it'], ['part', 'Only part']], part ? 'part' : 'all')}
      ${part ? `<div class="row" style="margin-top:8px"><input class="inp" name="biz" inputmode="numeric" value="${esc(d.biz)}" style="max-width:88px" aria-label="Percentage used for classes"><span>% for classes: <b id="bizamt">${money(forClasses())}</b></span></div>` : ''}</div>
    ${biz().gst ? `<label class="check"><input type="checkbox" name="gst"${d.gst ? ' checked' : ''}><span>The price includes GST<small id="gstamt">GST: ${money(round2(forClasses() / 11))}</small></span></label>` : ''}
    ${liveClasses().length ? field('For a class (optional)', `<select name="cid"><option value="">Any or all classes</option>${liveClasses().map(c => `<option value="${c.id}"${d.cid === c.id ? ' selected' : ''}>${esc(c.name)}</option>`).join('')}</select>`) : ''}
    ${field('Notes (optional)', `<textarea class="inp" name="note">${esc(d.note)}</textarea>`)}
    <p class="err" id="experr" role="alert" hidden></p>`,
    `${isNew ? '' : `<button type="button" class="btn danger-ghost" data-act="del" aria-label="Delete this expense">${icon('trash')}</button>`}<button type="button" class="btn" data-close>Cancel</button><button type="button" class="btn primary" data-act="ok">${isNew ? 'Add expense' : 'Save'}</button>`);
  const redraw = () => sh.set(tpl());
  const upd = () => { const a = $('#bizamt', sh.el), g = $('#gstamt', sh.el); if (a) a.textContent = money(forClasses()); if (g) g.textContent = `GST: ${money(round2(forClasses() / 11))}`; };
  const dropPhotos = ids => { if (!ids.length) return; ids.forEach(id => { delete S.photos[id]; forgetUrls(id); }); save(); imgDel(ids.flatMap(id => [`${id}:f`, `${id}:t`])).catch(() => {}); };
  const sh = openSheet(tpl(), {
    label: isNew ? 'Add an expense' : 'Edit expense',
    act: {
      cat: a => { d.cat = a.dataset.v; $$('.cat', sh.el).forEach(b => { const on = b === a; b.classList.toggle('on', on); b.setAttribute('aria-checked', on); }); },
      rcadd: async () => {
        const files = await pickFiles(false);
        if (!files.length || sh.closed) return;
        if (!PH.ok) { toast(`${icon('warn')} Photos can’t be saved in this browser. Open Atelier in Safari.`, { ms: 6000 }); return; }
        try { const id = await addPhotoFile(files[0], { kind: 'receipt', title: `Receipt${d.shop ? `, ${d.shop}` : ''}`, d: d.d }); added.push(id); d.rc.push(id); redraw(); } catch (err) { toast(`${icon('warn')} ${esc(err.message || 'That photo couldn’t be added.')}`, { ms: 6000 }); }
      },
      rcrm: a => { d.rc = d.rc.filter(id => id !== a.dataset.id); redraw(); },
      rcview: a => viewReceipt(a.dataset.id),
      del: () => { saved = true; sh.close(); deleteExpense(e); },
      ok: () => {
        const er = $('#experr', sh.el);
        if (!hasNum(d.amt) || num(d.amt) <= 0) { er.textContent = 'Enter how much it cost.'; er.hidden = false; $('[name=amt]', sh.el).focus(); return; }
        if (!validDate(d.d)) { er.textContent = 'Choose the date.'; er.hidden = false; return; }
        const rec = { id: d.id, d: d.d, what: d.what.trim() || catOf(d.cat)[1], shop: d.shop.trim(), amt: num(d.amt), cat: d.cat, biz: part ? clamp(Math.round(num(d.biz)), 0, 100) : 100, gst: biz().gst ? !!d.gst : false, rc: d.rc.slice(), note: d.note.trim(), cid: d.cid || '', at: e ? e.at || Date.now() : Date.now() };
        const gone = e ? (e.rc || []).filter(id => !rec.rc.includes(id)) : [];
        if (isNew) S.expenses.push(rec); else Object.assign(e, rec);
        rec.rc.forEach(id => { if (S.photos[id]) { S.photos[id].d = rec.d; S.photos[id].title = `Receipt${rec.shop ? `, ${rec.shop}` : ''}`; } });
        dropPhotos(gone);
        S.prefs.expCat = rec.cat;
        saved = true;
        save();
        sh.close();
        refresh();
        if (isNew) toast(`${icon('check')} ${money(rec.amt)} added to expenses`, { undo: () => { S.expenses = S.expenses.filter(x => x !== rec); dropPhotos(rec.rc); save(); refresh(); } });
        else toast(`${icon('check')} Saved`);
      },
    },
    input: ev => {
      const el = ev.target, n = el.name;
      if (n === 'amt') { d.amt = el.value; upd(); } else if (n === 'what') d.what = el.value; else if (n === 'shop') d.shop = el.value; else if (n === 'note') d.note = el.value; else if (n === 'biz') { d.biz = el.value; upd(); }
    },
    change: ev => {
      const el = ev.target, n = el.name;
      if (n === 'd') d.d = el.value; else if (n === 'gst') d.gst = el.checked; else if (n === 'cid') d.cid = el.value;
    },
    onClose: () => { if (!saved) dropPhotos(added); },
  });
  sh.el.addEventListener('click', ev => { const b = ev.target.closest('[data-seg="part"]'); if (b) { part = b.dataset.v === 'part'; if (part && (!hasNum(d.biz) || num(d.biz) >= 100)) d.biz = 50; redraw(); } });
  if (isNew) setTimeout(() => { const i = $('[name=amt]', sh.el); if (i && !sh.closed) i.focus({ preventScroll: true }); }, 60);
}
function deleteExpense(e) {
  const i = S.expenses.indexOf(e);
  if (i < 0) return;
  S.expenses.splice(i, 1);
  save();
  refresh();
  toast(`${icon('trash')} Expense deleted`, {
    undo: () => { S.expenses.splice(i, 0, e); save(); refresh(); },
    onExpire: () => { if (S.expenses.includes(e)) return; (e.rc || []).forEach(id => { delete S.photos[id]; forgetUrls(id); }); save(); imgDel((e.rc || []).flatMap(id => [`${id}:f`, `${id}:t`])).catch(() => {}); },
  });
}
function viewReceipt(id) {
  const sh = openSheet(`${sheetHead('Receipt')}<div class="viewer">${phImg(id, 'f')}</div><div class="btn-row"><button type="button" class="btn" data-act="share">${icon('share')} Share</button></div>`, {
    label: 'Receipt',
    act: {
      share: async () => { const b = await imgGet(`${id}:f`).catch(() => null); if (!b) { toast('Couldn’t open the photo'); return; } const r = await shareFile(b, `receipt-${(S.photos[id] && S.photos[id].d) || today()}.jpg`, 'Receipt'); if (r === 'downloaded') toast(`${icon('download')} Saved to your downloads`); },
    },
  });
  return sh;
}

/* ---------- the expenses screen ---------- */
const EXPV = { q: '' };
const fyNav = (route, fy) => {
  const cur = finYearStart(today());
  return `<div class="cal-top"><a class="icon-btn" href="#/${route}/${finYearStart(addDays(fy, -1))}" aria-label="Previous financial year">${icon('chev-l')}</a><h2>${fy === cur ? 'This financial year' : `${finYearName(fy)}`}</h2>${fy !== cur ? `<a class="btn sm ghost" href="#/${route}/${cur}">This year</a>` : ''}<a class="icon-btn" href="#/${route}/${finYearStart(addDays(finYearEnd(fy), 1))}" aria-label="Next financial year">${icon('chev-r')}</a></div>`;
};
function expRow(e) {
  const [, n, ic, tint] = catOf(e.cat), part = expBiz(e) !== num(e.amt);
  return `<button type="button" class="exp-row" data-act="open" data-id="${esc(e.id)}"><span class="cat-ico tint-${tint}" aria-hidden="true">${icon(ic)}</span><span class="t"><b>${esc(e.what)}</b><small>${[e.shop ? esc(e.shop) : '', fmtDate(e.d), part ? `${e.biz}% for classes` : ''].filter(Boolean).join(' · ')}</small></span><span class="s-amt">${money(part ? expBiz(e) : e.amt)}${(e.rc || []).length ? ` <span class="rc-mark" aria-label="Has a receipt photo">${icon('receipt', 'sm')}</span>` : ''}</span></button>`;
}
VIEWS.expenses = {
  tab: 'today', title: 'Expenses',
  head(p) { return { deco: true, back: '#/earnings', title: 'Expenses', sub: `Financial year ${finYearName(fyOf(p))}, 1 July to 30 June`, actions: `<div class="vh-act"><button type="button" class="icon-btn" data-act="csv" aria-label="Export expenses to a spreadsheet">${icon('share')}</button></div>` }; },
  render(p) {
    const fy = fyOf(p), fe = finYearEnd(fy), all = expensesBetween(fy, fe), x = taxSummary(fy), q = EXPV.q.trim().toLowerCase();
    const list = q ? all.filter(e => `${e.what} ${e.shop} ${catOf(e.cat)[1]} ${e.note}`.toLowerCase().includes(q)) : all;
    const noRc = all.filter(e => !(e.rc || []).length).length;
    let h = fyNav('expenses', fy);
    h += `<div class="card"><div class="stat">${money(x.spent)}</div><p class="fine" style="margin:4px 0 0">Spent on your classes from ${plural(all.length, 'expense')}${x.gst ? `, including ${money(x.gst)} GST` : ''}</p>
      ${noRc ? `<p style="margin:10px 0 0;color:var(--warn)">${icon('receipt', 'sm')} ${plural(noRc, 'expense')} without a receipt photo</p>` : ''}</div>
      <div class="btn-row"><button type="button" class="btn primary" data-act="add">${icon('plus')} Add an expense</button><button type="button" class="btn" data-act="trips">${icon('car')} Car trips</button></div>`;
    if (x.cats.length) {
      const top = Math.max(...x.cats.map(c => c[2]));
      h += `<div class="sec"><h2>By kind</h2></div><div class="card byclass">${x.cats.slice().sort((a, b) => b[2] - a[2]).map(([id, n, v]) => `<div class="r" style="--c:var(--${catOf(id)[3]})"><span>${esc(n)}</span><b class="tnum">${money(v)}</b><span class="bar"><i style="width:${Math.max(3, Math.round((v / top) * 100))}%"></i></span></div>`).join('')}</div>`;
    }
    h += `<div class="sec"><h2>Car travel</h2></div><button type="button" class="card tap car-card" data-act="trips"><span class="cat-ico tint-sky" aria-hidden="true">${icon('car')}</span><span class="t"><b>${x.km.toLocaleString('en-AU')} km</b><small>${x.km ? `${money(x.car)} at ${Math.round(x.rate * 100)} cents a km${x.km > KM_CAP ? ` (up to ${KM_CAP.toLocaleString('en-AU')} km)` : ''}` : 'Add a distance to a class, or add trips, to count car travel'}</small></span>${icon('chev-r', 'go')}</button>`;
    h += `<div class="sec"><h2>All expenses</h2></div>`;
    if (all.length > 6) h += `<div class="search">${icon('search')}<input type="search" id="eq" value="${esc(EXPV.q)}" placeholder="Search, e.g. paint, Officeworks" aria-label="Search expenses"></div>`;
    h += `<div id="exl">${expList(list, all.length)}</div>`;
    h += `<p class="fine" style="margin-top:16px">Atelier keeps your records; it doesn’t give tax advice. For what you can claim, check <b>ato.gov.au</b> or ask a registered tax agent. The ATO asks you to keep records for 5 years.</p>`;
    return h;
  },
  act: {
    add: () => openExpense(),
    open: a => { const e = S.expenses.find(x => x.id === a.dataset.id); if (e) openExpense(e); },
    trips: () => openTrips(fyOf(UI.param)),
    csv: () => { const fy = fyOf(UI.param); shareCsv(expensesCsv(fy, finYearEnd(fy)), `atelier-expenses-${finYearName(fy)}.csv`, 'Atelier expenses'); },
  },
  after(view) {
    const f = e => { if (e.target.id === 'eq') { EXPV.q = e.target.value; const fy = fyOf(UI.param), all = expensesBetween(fy, finYearEnd(fy)), q = EXPV.q.trim().toLowerCase(); $('#exl', view).innerHTML = expList(q ? all.filter(x => `${x.what} ${x.shop} ${catOf(x.cat)[1]} ${x.note}`.toLowerCase().includes(q)) : all, all.length); } };
    view.addEventListener('input', f);
    return () => view.removeEventListener('input', f);
  },
};
function expList(list, total) {
  if (!total) return emptyState('receipt', 'No expenses this year', 'Add things you buy for your classes, like paint, paper and brushes, with a photo of the receipt.', '<button type="button" class="btn primary" data-act="add">Add an expense</button>');
  if (!list.length) return '<p class="fine">Nothing matches. Try another word.</p>';
  let h = '', last = '';
  for (const e of list) {
    const m = e.d.slice(0, 7);
    if (m !== last) { last = m; const tot = sum(list.filter(x => x.d.slice(0, 7) === m).map(expBiz)); h += `<p class="daylbl">${fmtMonth(m + '-01')} · ${money(tot)}</p>`; }
    h += expRow(e);
  }
  return h;
}

/* ---------- car trips ---------- */
function openTrips(fy) {
  const fe = finYearEnd(fy);
  let adding = false;
  const tpl = () => {
    const x = taxSummary(fy), y = +fy.slice(0, 4), auto = x.trips.filter(t => t.auto), withKm = liveClasses().filter(c => num(c.km) > 0);
    return framed(sheetHead('Car trips', `Financial year ${finYearName(fy)}`),
      `<div class="card flat"><p style="margin:0"><b>${x.km.toLocaleString('en-AU')} km</b> × ${Math.round(x.rate * 100)} cents = <b>${money(x.car)}</b>${x.km > KM_CAP ? ` <span class="pill warn">Counted up to ${KM_CAP.toLocaleString('en-AU')} km</span>` : ''}</p>
        <p class="fine" style="margin:6px 0 0">The ATO’s cents per kilometre method: one rate covers all your car costs (fuel, servicing, rego, insurance), for up to 5,000 km per car a year. You don’t need fuel receipts, but you do need a record of how you worked out the kilometres, like this list.</p></div>
      ${kmRateKnown(fy) ? '' : `<label class="field" style="margin-top:12px"><span class="f-l">Rate for ${finYearName(fy)} (dollars per km)</span><input name="rate" inputmode="decimal" value="${esc(kmRate(fy))}"><small class="f-h">Check the ATO’s rate for this year and change it if it’s different.</small></label>`}
      <h3>From your classes</h3>${withKm.length ? `<p class="fine">${withKm.map(c => `${esc(c.name)}: ${num(c.km)} km there and back`).join(' · ')}. Each class you tick counts as a trip.</p>` : '<p class="fine">Add the distance there and back to a class (Edit class, under “Where”), and every class you tick counts as a trip.</p>'}
      ${auto.length ? `<div class="list card" style="padding:0">${auto.slice(0, 60).map(t => `<div class="lrow"><span class="t"><b>${esc(t.what)}</b><small>${fmtDate(t.d)}${t.place ? ` · ${esc(t.place)}` : ''}</small></span><span class="s-amt">${t.km} km</span></div>`).join('')}${auto.length > 60 ? `<p class="fine" style="padding:8px 16px">…and ${auto.length - 60} more in the spreadsheet</p>` : ''}</div>` : ''}
      <h3>Other trips</h3>${S.trips.filter(t => t.d >= fy && t.d <= fe).length ? `<div class="list card" style="padding:0">${S.trips.filter(t => t.d >= fy && t.d <= fe).sort((a, b) => b.d.localeCompare(a.d)).map(t => `<div class="lrow"><span class="t"><b>${esc(t.what || 'Trip')}</b><small>${fmtDate(t.d)}</small></span><span class="s-amt">${t.km} km</span><button type="button" class="icon-btn" data-act="rm" data-id="${esc(t.id)}" aria-label="Delete this trip">${icon('trash')}</button></div>`).join('')}</div>` : '<p class="fine">For example, a trip to buy supplies or to a venue to set up.</p>'}
      ${adding ? `<div class="card" style="margin-top:12px"><div class="two">${field('Date', `<input type="date" name="td" value="${today() <= fe && today() >= fy ? today() : fe}">`)}${field('Kilometres', `<input name="tkm" inputmode="decimal" placeholder="There and back" autocomplete="off">`)}</div>${field('What for', '<input name="tw" placeholder="e.g. Buying supplies at Eckersley’s" autocomplete="off">')}<div class="btn-row end"><button type="button" class="btn ghost" data-act="cancel">Cancel</button><button type="button" class="btn primary" data-act="ok">Add trip</button></div></div>`
        : `<div class="btn-row"><button type="button" class="btn soft" data-act="add">${icon('plus')} Add a trip</button></div>`}
      <p class="fine" style="margin-top:16px">Trips between home and a regular place of work usually can’t be claimed. If you’re not sure which trips count, check “Trips you can and can’t claim” on ato.gov.au or ask a tax agent.</p>`,
      `<button type="button" class="btn" data-act="csv">${icon('share')} Spreadsheet</button><button type="button" class="btn primary" data-close>Done</button>`);
  };
  const sh = openSheet(tpl(), {
    label: 'Car trips',
    act: {
      add: () => { adding = true; sh.set(tpl()); const i = $('[name=tkm]', sh.el); if (i) i.focus(); },
      cancel: () => { adding = false; sh.set(tpl()); },
      ok: () => {
        const d = $('[name=td]', sh.el).value, km = $('[name=tkm]', sh.el).value, w = $('[name=tw]', sh.el).value.trim();
        if (!validDate(d) || !hasNum(km) || num(km) <= 0) { toast(`${icon('warn')} Add the date and the kilometres`); return; }
        S.trips.push({ id: uid(), d, km: num(km), what: w });
        adding = false;
        save();
        sh.set(tpl());
        render();
      },
      rm: a => { const i = S.trips.findIndex(t => t.id === a.dataset.id); if (i < 0) return; const t = S.trips.splice(i, 1)[0]; save(); sh.set(tpl()); render(); toast('Trip deleted', { undo: () => { S.trips.splice(i, 0, t); save(); if (!sh.closed) sh.set(tpl()); render(); } }); },
      csv: () => shareCsv(tripsCsv(fy, fe), `atelier-car-trips-${finYearName(fy)}.csv`, 'Atelier car trips'),
    },
    change: e => { if (e.target.name === 'rate' && hasNum(e.target.value)) { S.prefs.kmRates = Object.assign({}, S.prefs.kmRates, { [+fy.slice(0, 4)]: num(e.target.value) }); save(); sh.set(tpl()); render(); } },
  });
}

/* ---------- tax time ---------- */
const TAXV = { zip: null, fy: '' };
VIEWS.tax = {
  tab: 'today', title: 'Tax time',
  head(p) { return { deco: true, back: '#/earnings', title: 'Tax time', sub: `Financial year ${finYearName(fyOf(p))}, 1 July to 30 June` }; },
  render(p) {
    const fy = fyOf(p), x = taxSummary(fy), row = (l, v, o = {}) => `<div class="tx-r${o.cls ? ` ${o.cls}` : ''}"><span>${l}</span><b class="tnum">${v}</b></div>`;
    let h = fyNav('tax', fy);
    h += `<div class="card tx"><h3>${icon('money')} Income</h3>${row(`Earned from ${plural(x.classes, 'class', 'classes')} you taught`, money(x.earned))}${x.received ? row('Payments marked as received', money(x.received)) : ''}
      <p class="fine" style="margin:8px 0 0">Earnings count each class when you tick it. Term students are counted class by class.</p></div>`;
    h += `<div class="card tx"><h3>${icon('receipt')} Expenses</h3>${x.cats.length ? x.cats.map(([, n, v]) => row(esc(n), money(v))).join('') + row('Total', money(x.spent), { cls: 'tot' }) : '<p class="fine" style="margin:0">No expenses added for this year.</p>'}${x.gst ? row('GST included in expenses', money(x.gst)) : ''}
      <div class="btn-row"><a class="btn sm" href="#/expenses/${fy}">${icon('list', 'sm')} See expenses</a><button type="button" class="btn sm ghost" data-act="add">${icon('plus', 'sm')} Add one</button></div></div>`;
    h += `<div class="card tx"><h3>${icon('car')} Car travel</h3>${row(`${x.km.toLocaleString('en-AU')} km${x.km > KM_CAP ? ` (counted up to ${KM_CAP.toLocaleString('en-AU')})` : ''} × ${Math.round(x.rate * 100)} cents`, money(x.car))}<div class="btn-row"><button type="button" class="btn sm" data-act="trips">${icon('car', 'sm')} Car trips</button></div></div>`;
    h += `<div class="card tx est"><h3>${icon('calc')} Rough estimate</h3>${row('Earned', money(x.earned))}${row('Less expenses', x.spent ? `−${money(x.spent)}` : money(0))}${row('Less car travel', x.car ? `−${money(x.car)}` : money(0))}${row('What’s left, before tax', money(x.net), { cls: 'tot' })}</div>`;
    const ready = TAXV.zip && TAXV.fy === fy;
    h += `<div class="sec"><h2>For your tax return</h2></div><p class="sec-intro">A tax pack is one ZIP file with a summary PDF, spreadsheets of your earnings, payments, expenses and car trips, and every receipt photo, ready to keep or send to your tax agent.</p>
      <div class="btn-row" style="margin-top:0">${ready ? `<button type="button" class="btn primary" data-act="zipshare">${icon('share')} Share the tax pack (${(TAXV.zip.size / 1048576).toFixed(1)} MB)</button>` : `<button type="button" class="btn primary" data-act="zip">${icon('download')} Make a tax pack</button>`}<button type="button" class="btn" data-act="pdf">${icon('print')} Summary PDF</button><button type="button" class="btn ghost" data-act="csv">${icon('share')} Expenses spreadsheet</button></div>
      <p class="fine" style="margin-top:16px">This is a record of what you’ve entered, not tax advice. What you can claim depends on your situation, so check ato.gov.au or ask a registered tax agent. The ATO asks you to keep records for 5 years.</p>`;
    return h;
  },
  act: {
    add: () => openExpense(),
    trips: () => openTrips(fyOf(UI.param)),
    csv: () => { const fy = fyOf(UI.param); shareCsv(expensesCsv(fy, finYearEnd(fy)), `atelier-expenses-${finYearName(fy)}.csv`, 'Atelier expenses'); },
    pdf: async a => {
      a.disabled = true;
      try { toast('Making the PDF…', { ms: 20000 }); await docFontsReady(); const fy = fyOf(UI.param), blob = await pdfFromCanvases(taxPages(fy), `Tax summary ${finYearName(fy)}`); const r = await shareFile(blob, `Atelier tax summary ${finYearName(fy)}.pdf`, 'Tax summary'); toast(r === 'downloaded' ? `${icon('download')} Saved to your downloads` : r === 'shared' ? `${icon('check')} Shared` : 'Not shared'); } catch (e) { toast(`${icon('warn')} ${esc(e.message || 'Couldn’t make the PDF.')}`, { ms: 6000 }); } finally { a.disabled = false; }
    },
    zip: async a => {
      a.disabled = true;
      try { const fy = fyOf(UI.param); toast('Packing your tax pack…', { ms: 60000 }); TAXV.zip = await taxPack(fy); TAXV.fy = fy; render(); toast(`${icon('check')} Your tax pack is ready. Tap Share to save or send it.`, { ms: 6000 }); } catch (e) { toast(`${icon('warn')} ${esc(e.message || 'Couldn’t make the tax pack.')}`, { ms: 6000 }); } finally { a.disabled = false; }
    },
    zipshare: async () => { const r = await shareFile(TAXV.zip, `atelier-tax-pack-${finYearName(TAXV.fy)}.zip`, 'Atelier tax pack'); toast(r === 'downloaded' ? `${icon('download')} Saved to your downloads` : r === 'shared' ? `${icon('check')} Shared` : 'Not shared'); },
  },
  // A tax pack made here is let go when you leave, so a new one always has your latest entries.
  after() { return () => { TAXV.zip = null; }; },
};

/* ---------- spreadsheets and the tax pack ---------- */
const toCsv = rows => '\ufeff' + rows.map(r => r.map(csvCell).join(',')).join('\r\n') + '\r\n';
async function shareCsv(text, name, title) { const r = await shareFile(new Blob([text], { type: 'text/csv' }), name, title); if (r === 'downloaded') toast(`${icon('download')} Saved to your downloads`); }
const receiptName = (e, i, n) => `receipts/${e.d} ${(e.shop || e.what || 'receipt').replace(/[\\/:*?"<>|]+/g, '').trim().slice(0, 40)} ${num(e.amt).toFixed(2)}${n > 1 ? ` (${i + 1})` : ''}.jpg`;
function expensesCsv(a, b) {
  const gst = biz().gst, rows = [['Date', 'What for', 'Where from', 'Kind', 'Amount (AUD)', 'Used for classes (%)', 'Amount for classes (AUD)'].concat(gst ? ['GST included (AUD)'] : [], ['Class', 'Receipt photos', 'Notes'])];
  for (const e of expensesBetween(a, b).slice().reverse()) {
    const c = e.cid && S.classes[e.cid], rc = e.rc || [];
    rows.push([e.d, e.what, e.shop, catOf(e.cat)[1], num(e.amt).toFixed(2), String(hasNum(e.biz) ? e.biz : 100), expBiz(e).toFixed(2)].concat(gst ? [expGst(e).toFixed(2)] : [], [c ? c.name : '', rc.map((id, i) => receiptName(e, i, rc.length)).join('; '), e.note || '']));
  }
  return toCsv(rows);
}
function tripsCsv(a, b) {
  const t = tripsBetween(a, b).slice().reverse();
  return toCsv([['Date', 'Trip', 'Place', 'Kilometres', 'From']].concat(t.map(x => [x.d, x.what || '', x.place || '', String(x.km), x.auto ? 'A ticked class' : 'Added by hand']), [['', 'Total', '', String(round2(sum(t.map(x => x.km)))), '']]));
}
function paymentsCsv(a, b) {
  const rows = Object.values(S.paid).filter(p => p.d >= a && p.d <= b).sort((x, y) => x.d.localeCompare(y.d));
  return toCsv([['Date', 'From', 'What for', 'How', 'Amount (AUD)']].concat(rows.map(p => [p.d, p.who || '', p.desc || '', howName(p.how), num(p.amt).toFixed(2)])));
}
async function taxPack(fy) {
  const fe = finYearEnd(fy), enc = new TextEncoder(), n = finYearName(fy), files = [];
  await docFontsReady();
  const pages = taxPages(fy), pdf = await pdfFromCanvases(pages, `Tax summary ${n}`);
  files.push({ name: `Tax summary ${n}.pdf`, data: new Uint8Array(await pdf.arrayBuffer()) });
  files.push({ name: `earnings ${n}.csv`, data: enc.encode(earningsCsv(fy, fe)) });
  files.push({ name: `payments received ${n}.csv`, data: enc.encode(paymentsCsv(fy, fe)) });
  files.push({ name: `expenses ${n}.csv`, data: enc.encode(expensesCsv(fy, fe)) });
  files.push({ name: `car trips ${n}.csv`, data: enc.encode(tripsCsv(fy, fe)) });
  for (const e of expensesBetween(fy, fe)) {
    const rc = e.rc || [];
    for (let i = 0; i < rc.length; i++) { const b = await imgGet(`${rc[i]}:f`).catch(() => null); if (b) files.push({ name: receiptName(e, i, rc.length), data: new Uint8Array(await b.arrayBuffer()) }); }
  }
  return makeZip(files);
}
// The summary as A4 pages, in the same style as invoices.
function taxPages(fy) {
  const x = taxSummary(fy), b = biz(), pages = [];
  let g, y;
  const page = () => { const p = pageCanvas(DOCK.W); pages.push(p); g = p.g; dDecor(g, `tax:${fy}:${pages.length}`); y = 24; };
  const ensure = h => { if (y + h > 276) { page(); dText(g, `Tax summary ${finYearName(fy)}, continued`, 20, y, dFont(700, 3.6), DOCK.ink2); y += 10; } };
  const heading = t => { ensure(16); y += 4; dText(g, t, 20, y, dFont(600, 5.4, true)); y += 7; };
  const row = (l, v, bold) => { ensure(7); dText(g, l, 22, y, dFont(bold ? 800 : 400, 3.7)); dText(g, v, 188, y, dFont(bold ? 800 : 700, 3.7), DOCK.ink, 'right'); y += 2.4; g.strokeStyle = DOCK.line; g.lineWidth = 0.25; g.beginPath(); g.moveTo(20, y); g.lineTo(190, y); g.stroke(); y += 4.6; };
  page();
  dText(g, 'Tax time summary', 20, y + 2, dFont(600, 9, true));
  y += 10;
  dText(g, `Financial year ${finYearName(fy)}: ${fmtDate(fy, { long: true, year: true, noDay: true })} to ${fmtDate(x.fe, { long: true, year: true, noDay: true })}`, 20, y, dFont(600, 3.8), DOCK.ink2);
  y += 5.4;
  if (b.name) { dText(g, [b.name, b.abn ? `ABN ${fmtAbn(b.abn)}` : ''].filter(Boolean).join(' · '), 20, y, dFont(400, 3.6), DOCK.ink2); y += 5.4; }
  dText(g, `Made with Atelier on ${fmtDate(today(), { long: true, year: true })}`, 20, y, dFont(400, 3.2), DOCK.ink3);
  y += 6;
  heading('Income');
  row(`Earned from ${plural(x.classes, 'class', 'classes')} taught`, money(x.earned));
  if (x.received) row('Payments marked as received', money(x.received));
  heading('Expenses');
  if (x.cats.length) { x.cats.forEach(([, n, v]) => row(n, money(v))); row('Total expenses', money(x.spent), true); } else row('No expenses entered', money(0));
  if (x.gst) row('GST included in expenses', money(x.gst));
  heading('Car travel');
  row(`${x.km.toLocaleString('en-AU')} km${x.km > KM_CAP ? `, counted up to ${KM_CAP.toLocaleString('en-AU')} km` : ''}, at ${Math.round(x.rate * 100)} cents per km`, money(x.car));
  heading('Rough estimate');
  row('Earned, less expenses and car travel', money(x.net), true);
  y += 2;
  dWrap(g, 'This summary lists what was entered in Atelier. It isn’t tax advice: what can be claimed depends on your situation. Check ato.gov.au or ask a registered tax agent. Keep your records for 5 years.', 168, dFont(400, 3.3)).forEach(l => { ensure(5); dText(g, l, 20, y, dFont(400, 3.3), DOCK.ink2); y += 4.8; });
  if (x.exps.length) {
    heading('Every expense');
    const exps = x.exps.slice().reverse();
    for (const e of exps) {
      const label = `${fmtDate(e.d, { noDay: true, year: true })}  ${e.what}${e.shop ? `, ${e.shop}` : ''}${expBiz(e) !== num(e.amt) ? ` (${e.biz}% of ${money(e.amt)})` : ''}`;
      const ls = dWrap(g, label, 140, dFont(400, 3.4));
      ensure(ls.length * 4.8 + 3);
      ls.forEach((l, i) => dText(g, l, 22, y + i * 4.8, dFont(400, 3.4)));
      dText(g, money(expBiz(e)), 188, y, dFont(700, 3.4), DOCK.ink, 'right');
      y += ls.length * 4.8 + 2;
    }
  }
  pages.forEach((p, i) => dText(p.g, `Tax summary ${finYearName(fy)}${pages.length > 1 ? `   ·   Page ${i + 1} of ${pages.length}` : ''}`, 105, 289, dFont(600, 2.9), DOCK.ink3, 'center'));
  return pages.map(p => p.cv);
}
