/* Atelier — money: who owes what (casual students, private and one-fee classes, and term fees), payments received,
   and the money pieces on Today and the Money screen */
'use strict';

const PAY_HOW = [['cash', 'Cash'], ['transfer', 'Bank transfer'], ['card', 'Card'], ['other', 'Other']];
const howName = h => (PAY_HOW.find(x => x[0] === h) || PAY_HOW[3])[1];
const payerKey = name => String(name || '').trim().toLowerCase().replace(/\s+/g, ' ') || 'someone';
// Who gets the bill for a private or one-fee class.
const classPayer = c => (c.payer || '').trim() || (c.kind === 'private' ? (c.students[0] && c.students[0].name) || c.name : c.name);
// Payments are tracked for classes from S.payFrom (earlier ones count as paid).
const tracksPay = d => !S.payFrom || d >= S.payFrom;

/* ---------- charges: what each class or term fee should bring in ---------- */
// o is a class occurrence (or anything with key, c, date and s). st is a student, or null for the whole class.
function chargeFor(o, st) {
  const c = o.c, s = o.s || S.sessions[o.key] || null, when = fmtDate(o.date, { year: true });
  if (!st) {
    const who = classPayer(c);
    return { key: `${o.key}|c`, kind: 'class', who, pk: payerKey(who), d: o.date, c, sess: o.key, amt: payOf(o), desc: `${c.name}, ${when}` };
  }
  const line = s && s.done && s.pay ? s.pay.lines.find(l => l[3] === st.id) : null, who = st.name || 'Student';
  return { key: `${o.key}|${st.id}`, kind: 'class', who, pk: payerKey(who), d: o.date, c, st, sess: o.key, amt: line ? line[1] : rateOf(c, st), desc: `${c.name}, ${when}${st.from && st.from === st.to ? ' (drop-in)' : ''}` };
}
// A ticked session's charges: one for a private or one-fee class, or one per casual student who came.
// (Term students pay a term fee instead.)
function sessionCharges(key, s) {
  const c = S.classes[s.c];
  if (!c || !s.done) return [];
  const o = { key, c, date: s.d, s };
  if (c.kind === 'private' || c.pay.mode === 'flat') return [chargeFor(o, null)];
  return activeStudents(c, s.d).filter(st => st.type !== 'term' && isHere(s, st)).map(st => chargeFor(o, st));
}
// Term fees: each term student, each term that has started (or starts within 4 weeks), for the classes in that term.
const FEE_AHEAD = 28;
function feeCharges() {
  const out = [], t = today(), memo = new Map();
  const count = (c, a, b) => { const k = `${c.id}|${a}|${b}`; if (!memo.has(k)) memo.set(k, classCountIn(c, a, b)); return memo.get(k); };
  for (const term of sortedTerms()) {
    if (term.start > addDays(t, FEE_AHEAD)) continue;
    for (const c of Object.values(S.classes)) {
      if (c.archived || c.kind !== 'group' || c.pay.mode !== 'student') continue;
      for (const st of c.students) {
        if (st.type !== 'term' || (st.from && st.from === st.to)) continue;
        const a = st.from && st.from > term.start ? st.from : term.start, b = st.to && st.to < term.end ? st.to : term.end;
        if (a > b) continue;
        const n = count(c, a, b);
        if (!n) continue;
        const key = `fee|${c.id}|${st.id}|${term.id}`, f = S.fees[key], who = st.name || 'Student';
        out.push({ key, kind: 'fee', who, pk: payerKey(who), d: a, c, st, term, n, amt: f && hasNum(f.amt) ? num(f.amt) : round2(rateOf(c, st) * n), desc: `${c.name}, ${term.name} (${plural(n, 'class', 'classes')})` });
      }
    }
  }
  return out;
}
function charges() {
  const out = [];
  for (const [k, s] of Object.entries(S.sessions)) if (s.done && tracksPay(s.d)) out.push(...sessionCharges(k, s));
  for (const f of feeCharges()) if (tracksPay(f.d)) out.push(f);
  return out.filter(ch => ch.amt > 0);
}
// Unpaid charges, grouped by who pays (by name, across classes), oldest first.
function owingByPayer() {
  const groups = new Map();
  for (const ch of charges()) {
    if (S.paid[ch.key]) continue;
    const g = groups.get(ch.pk) || { pk: ch.pk, who: ch.who, items: [], amt: 0 };
    g.items.push(ch);
    g.amt = round2(g.amt + ch.amt);
    groups.set(ch.pk, g);
  }
  const gs = [...groups.values()];
  gs.forEach(g => g.items.sort((a, b) => a.d.localeCompare(b.d) || a.desc.localeCompare(b.desc)));
  return gs.sort((a, b) => a.items[0].d.localeCompare(b.items[0].d) || a.who.localeCompare(b.who));
}
const owingTotal = gs => round2(sum(gs.map(g => g.amt)));
const receivedBetween = (a, b) => round2(sum(Object.values(S.paid).filter(p => p.d >= a && p.d <= b).map(p => num(p.amt))));

/* ---------- marking payments ---------- */
// Returns an undo function.
function markPaid(list, { d = today(), how = S.prefs.payHow || 'cash', inv = '' } = {}) {
  const before = list.map(ch => [ch.key, S.paid[ch.key]]);
  for (const ch of list) S.paid[ch.key] = Object.assign({ d, how, amt: ch.amt, who: ch.who, desc: ch.desc }, inv ? { inv } : {});
  S.prefs.payHow = how;
  save();
  return () => { for (const [k, v] of before) { if (v) S.paid[k] = v; else delete S.paid[k]; } save(); };
}
function unmarkPaid(keys) {
  const before = keys.map(k => [k, S.paid[k]]);
  keys.forEach(k => { delete S.paid[k]; });
  save();
  return () => { for (const [k, v] of before) if (v) S.paid[k] = v; save(); };
}
// The "Paid?" switch on a student (or the whole class) in a class session.
function paidBtn(o, st) {
  const ch = chargeFor(o, st), p = S.paid[ch.key];
  return `<button type="button" class="paid-btn${p ? ' on' : ''}" data-act="paid" data-sid="${st ? esc(st.id) : ''}" aria-pressed="${!!p}" aria-label="${esc(ch.who)} has paid">${p ? `${icon('check', 'sm')} Paid` : `${icon('money', 'sm')} Paid?`}</button>`;
}
function togglePaid(o, sid) {
  const st = sid ? o.c.students.find(x => x.id === sid) : null, ch = chargeFor(o, st);
  if (S.paid[ch.key]) { delete S.paid[ch.key]; save(); return false; }
  markPaid([ch]);
  return true;
}
// Mark one or more charges as paid: date, how, and (for a term fee) the amount. opts.after() runs once they're marked.
function openMarkPaid(list, opts = {}) {
  if (!list.length) return;
  const fee = list.length === 1 && list[0].kind === 'fee' ? list[0] : null;
  const st = { d: today(), how: S.prefs.payHow || 'cash', rec: false, amt: fee ? String(fee.amt) : '' };
  const total = () => round2(fee ? (hasNum(st.amt) ? num(st.amt) : 0) : sum(list.map(ch => ch.amt)));
  const tpl = () => framed(sheetHead('Mark as paid', esc(list[0].who)),
    `<div class="list owe-list">${list.map(ch => `<div class="lrow"><span class="t"><b>${esc(ch.desc)}</b>${ch.st && list.length > 1 ? `<small>${esc(ch.who)}</small>` : ''}</span><span class="s-amt">${money(ch.amt)}</span></div>`).join('')}</div>
    ${fee ? field('Amount paid', `<span class="money-in"><input name="amt" inputmode="decimal" value="${esc(st.amt)}" autocomplete="off"></span>`, `Worked out as ${plural(fee.n, 'class', 'classes')} × ${money(rateOf(fee.c, fee.st))}. Change it if the fee was different.`) : list.length > 1 ? `<p class="pay-total">Total <b>${money(total())}</b></p>` : ''}
    ${field('Date paid', `<input type="date" name="d" value="${st.d}">`)}
    <div class="field"><span class="f-l">How</span>${seg('how', PAY_HOW, st.how)}</div>
    <label class="check"><input type="checkbox" name="rec"${st.rec ? ' checked' : ''}><span>Make a receipt<small>A PDF to send from your phone.</small></span></label>`,
    `<button type="button" class="btn" data-close>Cancel</button><button type="button" class="btn primary" data-act="ok">${icon('check')} Mark paid · ${money(total())}</button>`);
  const sh = openSheet(tpl(), {
    label: 'Mark as paid',
    act: {
      ok: () => {
        if (!validDate(st.d)) { toast(`${icon('warn')} Choose the date it was paid`); return; }
        if (fee) {
          if (!hasNum(st.amt) || num(st.amt) <= 0) { toast(`${icon('warn')} Enter the amount paid`); return; }
          if (num(st.amt) !== fee.amt) { S.fees[fee.key] = { amt: num(st.amt) }; fee.amt = num(st.amt); }
        }
        const undo = markPaid(list, { d: st.d, how: st.how });
        sh.close();
        refresh();
        toast(`${icon('check')} ${money(total())} from ${esc(list[0].who)} marked paid`, { undo: () => { undo(); refresh(); } });
        if (opts.after) opts.after();
        if (st.rec) withBiz(() => { const doc = makeReceipt(list, { d: st.d, how: st.how }); go(`#/doc/${doc.id}`); });
      },
    },
    input: e => { if (e.target.name === 'amt') { st.amt = e.target.value; $('[data-act=ok]', sh.el).innerHTML = `${icon('check')} Mark paid · ${money(total())}`; } },
    change: e => { if (e.target.name === 'd') st.d = e.target.value; if (e.target.name === 'rec') st.rec = e.target.checked; },
  });
  sh.el.addEventListener('click', e => { const b = e.target.closest('[data-seg="how"]'); if (b) { st.how = b.dataset.v; $$('[data-seg="how"]', sh.el).forEach(x => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-checked', on); }); } });
}
function openPayFrom() {
  const sh = openSheet(`${sheetHead('Track payments from')}<p class="lead">Classes and term fees before this date count as paid, so they don’t show as owing.</p>
    ${field('Date', `<input type="date" name="d" value="${S.payFrom || S.created || today()}">`)}
    <div class="btn-row end"><button type="button" class="btn ghost" data-act="all">Track everything</button><button type="button" class="btn primary" data-act="ok">Save</button></div>`, {
    label: 'Track payments from', cls: 'small',
    act: {
      ok: () => { const d = $('[name=d]', sh.el).value; if (!validDate(d)) { toast(`${icon('warn')} Choose a date`); return; } S.payFrom = d; delete S.prefs.payAsk; save(); sh.close(); render(); },
      all: () => { S.payFrom = ''; delete S.prefs.payAsk; save(); sh.close(); render(); },
    },
  });
}

/* ---------- the Who's paid screen ---------- */
const PAYV = { tab: 'owing', more: 40 };
VIEWS.payments = {
  tab: 'today', title: 'Who’s paid',
  head() { return { deco: true, back: '#/earnings', title: 'Who’s paid', sub: 'Class payments and term fees' }; },
  render() {
    const groups = owingByPayer(), tot = owingTotal(groups), t = today(), mon = mondayOf(t);
    let h = S.prefs.payAsk ? payStartCard() : '';
    h += `<div class="card"><div class="stat">${money(tot)}</div><p class="fine" style="margin:4px 0 0">${tot ? `Owing from ${plural(groups.length, 'person', 'people')}` : 'Nobody owes you anything right now'}</p>
      <p style="margin:12px 0 0">${icon('money', 'sm')} Received <b>${money(receivedBetween(mon, addDays(mon, 6)))}</b> this week and <b>${money(receivedBetween(monthStart(t), addDays(addMonths(t, 1), -1)))}</b> in ${MONTHS[+t.slice(5, 7) - 1]}</p></div>`;
    h += `<div style="margin-top:16px">${seg('ptab', [['owing', groups.length ? `Owing (${groups.length})` : 'Owing'], ['fees', 'Term fees'], ['paid', 'Paid']], PAYV.tab)}</div>`;
    h += PAYV.tab === 'fees' ? feesList() : PAYV.tab === 'paid' ? paidList() : owingList(groups);
    h += `<p class="fine" style="margin-top:20px">${S.payFrom ? `Tracking payments for classes from ${fmtDate(S.payFrom, { long: true, year: true })}. Earlier ones count as paid.` : 'Tracking payments for every class you’ve ticked.'} <button type="button" class="btn sm ghost" data-act="from">Change</button></p>`;
    return h;
  },
  act: {
    from: () => openPayFrom(),
    from0: a => { S.payFrom = a.dataset.v; delete S.prefs.payAsk; save(); render(); },
    pay1: a => {
      const ch = charges().find(x => x.key === a.dataset.k);
      if (!ch) return;
      const undo = markPaid([ch]);
      if (!reduceMotion()) celebrateAt(a);
      render();
      toast(`${icon('check')} ${money(ch.amt)} from ${esc(ch.who)} marked paid`, { undo: () => { undo(); render(); } });
    },
    payall: a => { const g = owingByPayer().find(x => x.pk === a.dataset.pk); if (g) openMarkPaid(g.items); },
    inv: a => openInvoiceEditor({ pk: a.dataset.pk }),
    feepay: a => { const ch = feeCharges().find(x => x.key === a.dataset.k); if (ch) openMarkPaid([ch]); },
    feeun: a => { const undo = unmarkPaid([a.dataset.k]); render(); toast('Marked as not paid', { undo: () => { undo(); render(); } }); },
    feeamt: a => editFee(a.dataset.k),
    paidrow: a => openPayment(a.dataset.k),
    more: () => { PAYV.more += 60; render(); },
  },
  after(view) {
    const f = e => { const b = e.target.closest('[data-seg="ptab"]'); if (b) { PAYV.tab = b.dataset.v; render(); } };
    view.addEventListener('click', f);
    // Who's paid always opens on what's owing.
    return () => { view.removeEventListener('click', f); PAYV.tab = 'owing'; PAYV.more = 40; };
  },
};
function payStartCard() {
  const t = today(), term = termOf(t), mon = mondayOf(t);
  return `<div class="callout" style="margin-bottom:16px">${icon('money')}<div><p><b>Start tracking payments from…</b> Classes and term fees before then count as paid, so only new ones show as owing.</p>
    <div class="btn-row" style="margin-top:8px"><button type="button" class="btn sm primary" data-act="from0" data-v="${mon}">This week</button>${term ? `<button type="button" class="btn sm" data-act="from0" data-v="${term.start}">Start of ${esc(term.name)}</button>` : ''}<button type="button" class="btn sm ghost" data-act="from0" data-v="">Everything</button></div></div></div>`;
}
function owingList(groups) {
  if (!groups.length) return emptyState('money', 'All paid up', 'When a casual student, private class or term fee hasn’t been paid, it shows up here.');
  const inv = invoicedKeys(), t = today();
  return groups.map(g => `<div class="card payer">
    <div class="payer-h"><h3>${esc(g.who)}</h3><b class="tnum">${money(g.amt)}</b></div>
    <ul class="owe">${g.items.map(ch => { const d = inv.get(ch.key); return `<li><span class="t">${esc(ch.desc)}${d ? ` <a class="pill" href="#/doc/${d.id}">On ${esc(d.no)}</a>` : ''}${ch.kind === 'fee' && ch.d > t ? ` <span class="pill">Due ${fmtDate(ch.d)}</span>` : ''}</span><span class="a tnum">${money(ch.amt)}</span><button type="button" class="tick" data-act="pay1" data-k="${esc(ch.key)}" aria-label="Mark paid: ${esc(ch.who)}, ${esc(ch.desc)}">${icon('check')}</button></li>`; }).join('')}</ul>
    <div class="btn-row"><button type="button" class="btn sm" data-act="payall" data-pk="${esc(g.pk)}">${icon('check', 'sm')} ${g.items.length > 1 ? 'Mark all paid' : 'Mark paid'}</button><button type="button" class="btn sm ghost" data-act="inv" data-pk="${esc(g.pk)}">${icon('invoice', 'sm')} Invoice</button></div></div>`).join('');
}
function feesList() {
  const t = today(), all = feeCharges();
  const terms = [...new Map(all.map(f => [f.term.id, f.term])).values()].filter(term => term.end >= addDays(t, -42) || all.some(f => f.term === term && tracksPay(f.d) && !S.paid[f.key]));
  const cur = currentTerm(t);
  if (!S.terms.length) return emptyState('school', 'No term dates yet', 'Add your school terms in Settings, and term students’ fees will be worked out here for each term.', '<a class="btn" href="#/settings">Settings</a>');
  if (!terms.length) return emptyState('school', 'No term fees', `Term fees appear here for classes with term students${cur ? `, from ${esc(cur.name)}` : ''}.`);
  return terms.slice().reverse().map(term => {
    const fs = all.filter(f => f.term === term), shown = fs.filter(f => tracksPay(f.d));
    const paid = shown.filter(f => S.paid[f.key]), byClass = new Map();
    shown.forEach(f => { if (!byClass.has(f.c.id)) byClass.set(f.c.id, []); byClass.get(f.c.id).push(f); });
    let h = `<div class="sec"><h2>${esc(term.name)}</h2><span class="fine">${shown.length ? `${money(sum(paid.map(f => num(S.paid[f.key].amt))))} paid of ${money(sum(shown.map(f => (S.paid[f.key] ? num(S.paid[f.key].amt) : f.amt))))}` : ''}</span></div>`;
    if (!shown.length) return h + `<p class="fine">${esc(term.name)} started before you began tracking payments. <button type="button" class="btn sm ghost" data-act="from">Change the date</button> to include its fees.</p>`;
    h += [...byClass.values()].map(list => `<div class="card fee-card" style="--c:${list[0].c.color}"><h3>${esc(list[0].c.name)}</h3><ul class="fees">${list.map(f => {
      const p = S.paid[f.key];
      return `<li><span class="t"><b>${esc(f.who)}</b><small>${plural(f.n, 'class', 'classes')}${S.fees[f.key] ? '' : ` × ${money(rateOf(f.c, f.st))}`}</small></span>
        ${p ? `<span class="a tnum">${money(p.amt)}</span><button type="button" class="paid-btn on" data-act="feeun" data-k="${esc(f.key)}" aria-pressed="true" aria-label="${esc(f.who)} has paid">${icon('check', 'sm')} ${fmtDate(p.d, { noDay: true })}</button>`
          : `<button type="button" class="btn sm ghost tnum" data-act="feeamt" data-k="${esc(f.key)}" aria-label="Change ${esc(f.who)}’s fee, ${money(f.amt)}">${money(f.amt)}</button><button type="button" class="paid-btn" data-act="feepay" data-k="${esc(f.key)}" aria-pressed="false" aria-label="${esc(f.who)} has paid">${icon('money', 'sm')} Paid?</button>`}</li>`;
    }).join('')}</ul></div>`).join('');
    return h;
  }).join('') + '<p class="fine" style="margin-top:12px">A term fee is the student’s rate × the classes they have that term. Tap an amount to change it.</p>';
}
function editFee(key) {
  const f = feeCharges().find(x => x.key === key);
  if (!f) return;
  const sh = openSheet(`${sheetHead(`${esc(f.who)}’s fee`, esc(f.desc))}
    ${field('Term fee', `<span class="money-in"><input name="amt" inputmode="decimal" value="${esc(f.amt)}" autocomplete="off"></span>`, `${plural(f.n, 'class', 'classes')} × ${money(rateOf(f.c, f.st))} = ${money(round2(rateOf(f.c, f.st) * f.n))}`)}
    <div class="btn-row end">${S.fees[key] ? '<button type="button" class="btn ghost" data-act="reset">Use worked-out fee</button>' : ''}<button type="button" class="btn primary" data-act="ok">Save</button></div>`, {
    label: 'Term fee', cls: 'small',
    act: {
      ok: () => { const v = $('[name=amt]', sh.el).value; if (!hasNum(v) || num(v) < 0) { toast(`${icon('warn')} Enter an amount`); return; } S.fees[key] = { amt: num(v) }; save(); sh.close(); render(); },
      reset: () => { delete S.fees[key]; save(); sh.close(); render(); },
    },
  });
}
function paidList() {
  const rows = Object.entries(S.paid).map(([k, p]) => Object.assign({ k }, p)).sort((a, b) => b.d.localeCompare(a.d) || String(a.who).localeCompare(String(b.who)));
  if (!rows.length) return emptyState('money', 'No payments yet', 'Tick payments off as they come in and they’re listed here, newest first.');
  let h = '', last = '';
  for (const r of rows.slice(0, PAYV.more)) {
    if (r.d !== last) { last = r.d; h += `<p class="daylbl">${fmtDate(r.d, { long: true })}</p>`; }
    h += `<button type="button" class="lrow card tap paid-row" data-act="paidrow" data-k="${esc(r.k)}"><span class="t"><b>${esc(r.who || 'Payment')}</b><small>${esc(r.desc || '')} · ${howName(r.how)}</small></span><span class="s-amt">${money(r.amt)}</span></button>`;
  }
  if (rows.length > PAYV.more) h += `<div class="btn-row"><button type="button" class="btn block" data-act="more">Show earlier payments (${rows.length - PAYV.more})</button></div>`;
  return h;
}
function openPayment(key) {
  const p = S.paid[key];
  if (!p) return;
  const inv = p.inv && S.docs.find(d => d.id === p.inv);
  const sh = openSheet(`${sheetHead(esc(p.who || 'Payment'), `${money(p.amt)} · ${howName(p.how)} · ${fmtDate(p.d, { long: true, year: true })}`)}
    <p>${esc(p.desc || '')}</p>${inv ? `<p class="fine">Paid with invoice <a href="#/doc/${inv.id}">${esc(inv.no)}</a>.</p>` : ''}
    <div class="btn-row"><button type="button" class="btn primary" data-act="rec">${icon('receipt')} Make a receipt</button><button type="button" class="btn danger-ghost" data-act="un">Not paid after all</button></div>`, {
    label: 'Payment', cls: 'small',
    act: {
      rec: () => withBiz(() => { sh.close(); const doc = makeReceipt([{ key, who: p.who, desc: p.desc, amt: p.amt }], { d: p.d, how: p.how }); go(`#/doc/${doc.id}`); }),
      un: () => { const undo = unmarkPaid([key]); sh.close(); render(); toast('Marked as not paid', { undo: () => { undo(); render(); } }); },
    },
  });
}

/* ---------- money pieces for Today and the Money screen ---------- */
function moneyStrip() {
  const tot = owingTotal(owingByPayer());
  return `<div class="mstrip">
    <a class="mchip${tot ? ' owe' : ''}" href="#/payments">${icon('money')}<span>${tot ? `<b>${money(tot)}</b> owing` : 'All paid'}</span></a>
    <button type="button" class="mchip" data-act="spend">${icon('plus')}<span>Expense</span></button>
    <a class="mchip" href="#/invoices">${icon('invoice')}<span>Invoices</span></a></div>`;
}
function moneyTiles() {
  const t = today(), tot = owingTotal(owingByPayer()), unpaid = S.docs.filter(d => d.kind === 'inv' && !docPaid(d)).length;
  return `<div class="mtiles">
    <a class="mtile tint-pink" href="#/payments">${icon('money')}<b>Who’s paid</b><small>${tot ? `${money(tot)} owing` : 'All paid up'}</small></a>
    <a class="mtile tint-sky" href="#/invoices">${icon('invoice')}<b>Invoices</b><small>${unpaid ? plural(unpaid, 'unpaid invoice') : 'Invoices and receipts'}</small></a>
    <a class="mtile tint-butter" href="#/expenses">${icon('receipt')}<b>Expenses</b><small>${money(spentBetween(finYearStart(t), finYearEnd(t)))} in ${finYearName(t)}</small></a>
    <a class="mtile tint-mint" href="#/tax">${icon('calc')}<b>Tax time</b><small>Your ${finYearName(t)} summary</small></a></div>`;
}
