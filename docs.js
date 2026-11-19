/* Atelier — invoices and receipts: your details, numbered invoices and receipts, drawn as A4 pages in Atelier's
   colours and shared as PDF files (each page is a picture inside the PDF, so any name or language prints correctly) */
'use strict';

const BIZ_DEF = { name: '', person: '', abn: '', email: '', phone: '', addr: '', accName: '', bsb: '', acc: '', payid: '', days: 7, note: '', gst: false, prefix: 'INV-', nextInv: 1, nextRec: 1 };
const biz = () => Object.assign({}, BIZ_DEF, S.biz);
const digitsOf = s => String(s || '').replace(/\D/g, '');
// The ATO's ABN check: take 1 from the first digit, weight the digits, and the total divides by 89.
function abnOk(s) {
  const d = digitsOf(s), w = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  if (d.length !== 11) return false;
  let t = 0;
  for (let i = 0; i < 11; i++) t += (+d[i] - (i ? 0 : 1)) * w[i];
  return t % 89 === 0;
}
const fmtAbn = s => { const d = digitsOf(s); return d.length === 11 ? `${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 8)} ${d.slice(8)}` : String(s || '').trim(); };
const fmtBsb = s => { const d = digitsOf(s); return d.length === 6 ? `${d.slice(0, 3)}-${d.slice(3)}` : String(s || '').trim(); };
const docNo = (kind, n) => `${kind === 'rec' ? 'R-' : biz().prefix || 'INV-'}${String(n).padStart(4, '0')}`;
const docById = id => S.docs.find(x => x.id === id) || null;
const docTotal = doc => round2(sum(doc.items.map(it => num(it.amt))));
const docKindName = doc => (doc.kind === 'rec' ? 'Receipt' : biz().gst ? 'Tax invoice' : 'Invoice');
// An invoice is paid when you've marked it, or when every class on it has been marked paid.
function docPaid(doc) {
  if (doc.paid) return doc.paid;
  if (doc.kind !== 'inv' || !doc.items.length || doc.items.some(it => !it.key || !S.paid[it.key])) return null;
  const last = doc.items.map(it => S.paid[it.key]).sort((a, b) => a.d.localeCompare(b.d)).pop();
  return { d: last.d, how: last.how, auto: true };
}
function docStatus(doc) {
  const p = docPaid(doc);
  if (p) return ['ok', `Paid ${fmtDate(p.d)}`];
  if (doc.due && doc.due < today()) return ['warn', `Overdue since ${fmtDate(doc.due)}`];
  return ['', doc.due && doc.due > doc.d ? `Due ${fmtDate(doc.due)}` : 'Not paid yet'];
}
// charge key → the unpaid invoice it's on
function invoicedKeys() {
  const m = new Map();
  for (const doc of S.docs) if (doc.kind === 'inv' && !docPaid(doc)) doc.items.forEach(it => { if (it.key) m.set(it.key, doc); });
  return m;
}
function withBiz(fn) {
  if (biz().name.trim()) fn();
  else openBizEditor({ why: 'Add your name or business name first. It goes at the top of each invoice and receipt.', then: fn });
}

/* ---------- your details ---------- */
function openBizEditor(o = {}) {
  const d = biz();
  const abnMsg = v => (!v.trim() ? '' : abnOk(v) ? `${icon('check', 'sm')} That ABN looks right.` : 'That ABN doesn’t look right. Check the 11 digits.');
  const sh = openSheet(framed(sheetHead('Your details', 'For your invoices and receipts. Only the name is needed.'),
    `${o.why ? `<div class="callout" style="margin-bottom:12px">${icon('info')}<p>${esc(o.why)}</p></div>` : ''}
    ${field('Business or trading name', `<input name="name" value="${esc(d.name)}" placeholder="e.g. Ally’s Art Studio" autocomplete="organization">`)}
    ${field('Your name (optional)', `<input name="person" value="${esc(d.person)}" autocomplete="name">`)}
    ${field('ABN (optional)', `<input name="abn" value="${esc(d.abn)}" inputmode="numeric" placeholder="11 digits" autocomplete="off">`, `<span id="abnmsg">${abnMsg(d.abn)}</span>`)}
    <div class="two">${field('Email', `<input name="email" type="email" value="${esc(d.email)}" autocomplete="email">`)}${field('Phone', `<input name="phone" type="tel" value="${esc(d.phone)}" autocomplete="tel">`)}</div>
    ${field('Address (optional)', `<input name="addr" value="${esc(d.addr)}" autocomplete="street-address">`)}
    <h3 class="form-sec">How people pay you</h3>
    ${field('Account name', `<input name="accName" value="${esc(d.accName)}" autocomplete="off">`)}
    <div class="two">${field('BSB', `<input name="bsb" value="${esc(d.bsb)}" inputmode="numeric" placeholder="000-000" autocomplete="off">`)}${field('Account number', `<input name="acc" value="${esc(d.acc)}" inputmode="numeric" autocomplete="off">`)}</div>
    ${field('PayID (optional)', `<input name="payid" value="${esc(d.payid)}" placeholder="Email or mobile" autocomplete="off">`)}
    <div class="field"><span class="f-l">Invoices are due</span>${seg('days', [['0', 'On receipt'], ['7', '7 days'], ['14', '14 days'], ['30', '30 days']], String(d.days))}</div>
    ${field('Note at the bottom (optional)', `<textarea class="inp" name="note" placeholder="e.g. Thank you for creating with me!">${esc(d.note)}</textarea>`)}
    <label class="check"><input type="checkbox" name="gst"${d.gst ? ' checked' : ''}><span>I’m registered for GST<small>Only tick this if you’ve registered for GST with the ATO. Invoices then say “Tax invoice” and show the GST included in the price.</small></span></label>
    <details class="more"><summary>${icon('chev-d')} Invoice numbers</summary><div class="two">${field('Starts with', `<input name="prefix" value="${esc(d.prefix)}" autocomplete="off">`)}${field('Next number', `<input name="nextInv" inputmode="numeric" value="${esc(d.nextInv)}" autocomplete="off">`)}</div><p class="fine">Receipts are numbered R-0001, R-0002 and so on.</p></details>
    <p class="err" id="bizerr" role="alert" hidden></p>`,
    `<button type="button" class="btn" data-close>Cancel</button><button type="button" class="btn primary" data-act="ok">Save</button>`), {
    label: 'Your details',
    act: {
      ok: () => {
        const v = n => ($(`[name=${n}]`, sh.el).value || '').trim(), er = $('#bizerr', sh.el);
        if (!v('name')) { er.textContent = 'Add your business or trading name (your own name is fine).'; er.hidden = false; $('[name=name]', sh.el).focus(); return; }
        const n = Math.max(1, Math.round(num(v('nextInv'))) || 1);
        S.biz = Object.assign({}, S.biz, { name: v('name'), person: v('person'), abn: v('abn'), email: v('email'), phone: v('phone'), addr: v('addr'), accName: v('accName'), bsb: v('bsb'), acc: v('acc'), payid: v('payid'), days: +days, note: $('[name=note]', sh.el).value.trim(), gst: $('[name=gst]', sh.el).checked, prefix: v('prefix') || 'INV-', nextInv: n });
        save();
        sh.close();
        render();
        toast(`${icon('check')} Your details are saved`);
        if (o.then) o.then();
      },
    },
    input: e => { if (e.target.name === 'abn') $('#abnmsg', sh.el).innerHTML = abnMsg(e.target.value); },
  });
  let days = String(d.days);
  sh.el.addEventListener('click', e => { const b = e.target.closest('[data-seg="days"]'); if (b) { days = b.dataset.v; $$('[data-seg="days"]', sh.el).forEach(x => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-checked', on); }); } });
}

/* ---------- the list ---------- */
const DOCV = { tab: 'inv' };
const docRow = d => { const [cls, label] = docStatus(d); return `<a class="lrow" href="#/doc/${d.id}"><span class="t"><b>${esc(d.no)} · ${esc(d.to.name || 'No name')}</b><small>${fmtDate(d.d, { year: true })} <span class="pill ${cls}">${esc(label)}</span></small></span><span class="s-amt">${money(docTotal(d))}</span>${icon('chev-r', 'go')}</a>`; };
VIEWS.invoices = {
  tab: 'today', title: 'Invoices',
  head() { return { deco: true, back: '#/earnings', title: 'Invoices', sub: 'Invoices and receipts, kept on this phone', actions: `<div class="vh-act"><button type="button" class="icon-btn" data-act="biz" aria-label="Your details for invoices">${icon('cog')}</button></div>` }; },
  render() {
    const kind = DOCV.tab === 'rec' ? 'rec' : 'inv', list = S.docs.filter(d => d.kind === kind).sort((a, b) => b.d.localeCompare(a.d) || b.at - a.at);
    let h = `<div class="btn-row" style="margin-top:0"><button type="button" class="btn primary" data-act="new">${icon('plus')} New invoice</button><button type="button" class="btn ghost" data-act="biz">${icon('user')} Your details</button></div>`;
    if (!biz().name) h += `<div class="callout" style="margin-top:12px">${icon('info')}<p>Add your details once (your name, and how people can pay you) and they go on every invoice.</p></div>`;
    h += `<div style="margin-top:16px">${seg('dtab', [['inv', 'Invoices'], ['rec', 'Receipts']], DOCV.tab)}</div>`;
    if (!list.length) return h + emptyState('invoice', kind === 'rec' ? 'No receipts yet' : 'No invoices yet', kind === 'rec' ? 'When you mark a payment as paid, you can make a receipt to send.' : 'Make an invoice for anyone who owes you, then share it as a PDF by email or message.');
    if (kind === 'inv') {
      const open = list.filter(d => !docPaid(d)), late = open.filter(d => d.due && d.due < today());
      if (open.length) h += `<p style="margin:16px 0 0">${icon('clock', 'sm')} <b>${money(sum(open.map(docTotal)))}</b> waiting on ${plural(open.length, 'invoice')}${late.length ? `, <span style="color:var(--warn)">${late.length} overdue</span>` : ''}.</p>`;
    }
    return h + `<div class="list card" style="padding:0;margin-top:12px">${list.map(docRow).join('')}</div>`;
  },
  act: { new: () => openInvoiceEditor(), biz: () => openBizEditor() },
  after(view) {
    const f = e => { const b = e.target.closest('[data-seg="dtab"]'); if (b) { DOCV.tab = b.dataset.v; render(); } };
    view.addEventListener('click', f);
    return () => view.removeEventListener('click', f);
  },
};

/* ---------- making an invoice ---------- */
const itemDesc = ch => (ch.st ? `${ch.who} · ${ch.desc}` : ch.desc);
function openInvoiceEditor({ pk = '', doc = null } = {}) {
  if (!biz().name.trim()) { withBiz(() => openInvoiceEditor({ pk, doc })); return; }
  const isNew = !doc, groups = owingByPayer(), onInv = invoicedKeys();
  const kept = doc ? doc.items.filter(it => it.key) : [];
  const st = doc
    ? { pk: doc.pk || '', to: doc.to.name || '', contact: doc.to.contact || '', d: doc.d, due: doc.due || doc.d, note: doc.note || '', sel: new Set(kept.map(it => it.key)), lines: doc.items.filter(it => !it.key).map(it => ({ desc: it.desc, amt: String(it.amt) })) }
    : { pk: '', to: '', contact: '', d: today(), due: addDays(today(), biz().days), note: biz().note, sel: new Set(), lines: [] };
  const setPk = k => {
    st.pk = k;
    st.extra = [];
    const g = groups.find(x => x.pk === k), r = S.payers[k] || {};
    st.to = r.to || (g ? g.who : '');
    st.contact = r.contact || '';
    st.sel = new Set(g ? g.items.filter(ch => !onInv.has(ch.key)).map(ch => ch.key) : []);
    if (!g && !st.lines.length) st.lines.push({ desc: '', amt: '' });
  };
  st.extra = st.extra || [];
  if (isNew) { if (pk) setPk(pk); else st.lines.push({ desc: '', amt: '' }); }
  // What can go on it: this person's unpaid classes and fees (and any brothers' or sisters' added), plus anything already on the invoice.
  const avail = () => {
    const out = [];
    [st.pk, ...st.extra].forEach(k => { const g = groups.find(x => x.pk === k); if (g) g.items.forEach(ch => out.push({ key: ch.key, desc: itemDesc(ch), amt: ch.amt, other: onInv.has(ch.key) && (!doc || onInv.get(ch.key) !== doc) ? onInv.get(ch.key) : null })); });
    kept.forEach(it => { if (!out.some(x => x.key === it.key)) out.push({ key: it.key, desc: it.desc, amt: num(it.amt), other: null }); });
    return out;
  };
  const total = () => round2(sum(avail().filter(x => st.sel.has(x.key)).map(x => x.amt)) + sum(st.lines.map(l => (hasNum(l.amt) ? num(l.amt) : 0))));
  const tpl = () => {
    const items = avail();
    return framed(sheetHead(isNew ? 'New invoice' : `Edit ${esc(doc.no)}`, isNew ? `Number ${esc(docNo('inv', biz().nextInv))}` : ''),
      `${groups.length || st.pk ? `<label class="field"><span class="f-l">Who’s it for?</span><select name="pk"><option value=""${st.pk ? '' : ' selected'}>Someone else</option>${groups.map(g => `<option value="${esc(g.pk)}"${g.pk === st.pk ? ' selected' : ''}>${esc(g.who)} · ${money(g.amt)} owing</option>`).join('')}${st.pk && !groups.some(g => g.pk === st.pk) ? `<option value="${esc(st.pk)}" selected>${esc(st.to || st.pk)}</option>` : ''}</select></label>` : ''}
      ${field('Bill to', `<input name="to" value="${esc(st.to)}" placeholder="e.g. Sarah Lee (Mia’s mum)" autocomplete="off">`)}
      ${field('Email or phone (optional)', `<input name="contact" value="${esc(st.contact)}" autocomplete="off">`)}
      <h3 class="form-sec">What it’s for</h3>
      ${items.length ? `<div class="inv-items">${items.map(x => `<label class="check inv-it"><input type="checkbox" data-k="${esc(x.key)}"${st.sel.has(x.key) ? ' checked' : ''}${x.other ? ' disabled' : ''}><span>${esc(x.desc)}${x.other ? `<small>Already on ${esc(x.other.no)}</small>` : ''}</span><b class="tnum">${money(x.amt)}</b></label>`).join('')}</div>` : ''}
      ${st.pk && groups.some(g => g.pk !== st.pk && !st.extra.includes(g.pk)) ? `<label class="field" style="margin-top:8px"><span class="f-l">Add a brother’s or sister’s classes (optional)</span><select name="extra"><option value="">Choose a student</option>${groups.filter(g => g.pk !== st.pk && !st.extra.includes(g.pk)).map(g => `<option value="${esc(g.pk)}">${esc(g.who)} · ${money(g.amt)} owing</option>`).join('')}</select></label>` : ''}
      ${st.lines.map((l, i) => `<div class="inv-line"><input class="inp" data-ld="${i}" value="${esc(l.desc)}" placeholder="What for, e.g. Holiday workshop" aria-label="Description"><span class="money-in"><input class="inp" data-la="${i}" inputmode="decimal" value="${esc(l.amt)}" placeholder="0" aria-label="Amount"></span><button type="button" class="icon-btn" data-act="rmline" data-i="${i}" aria-label="Remove this line">${icon('close')}</button></div>`).join('')}
      <div class="btn-row" style="margin-top:8px"><button type="button" class="btn sm soft" data-act="addline">${icon('plus', 'sm')} Add a line</button></div>
      <p class="pay-total">Total <b id="invtot">${money(total())}</b></p>
      <div class="two">${field('Date', `<input type="date" name="d" value="${st.d}">`)}${field('Due', `<input type="date" name="due" value="${st.due}">`)}</div>
      ${field('Note (optional)', `<textarea class="inp" name="note" placeholder="Anything else they should know">${esc(st.note)}</textarea>`)}
      <p class="err" id="inverr" role="alert" hidden></p>`,
      `<button type="button" class="btn" data-close>Cancel</button><button type="button" class="btn primary" data-act="ok">${isNew ? 'Make invoice' : 'Save'}</button>`);
  };
  const upd = () => { const t = $('#invtot', sh.el); if (t) t.textContent = money(total()); };
  const sh = openSheet(tpl(), {
    label: isNew ? 'New invoice' : 'Edit invoice',
    act: {
      addline: () => { st.lines.push({ desc: '', amt: '' }); sh.set(tpl()); const ins = $$('[data-ld]', sh.el); ins[ins.length - 1].focus(); },
      rmline: a => { st.lines.splice(+a.dataset.i, 1); sh.set(tpl()); },
      ok: () => {
        const er = $('#inverr', sh.el), fail = m => { er.textContent = m; er.hidden = false; };
        if (!st.to.trim()) return fail('Add who the invoice is for.');
        if (!validDate(st.d) || !validDate(st.due)) return fail('Choose the invoice date and the due date.');
        if (st.due < st.d) return fail('The due date is before the invoice date.');
        const lines = st.lines.filter(l => l.desc.trim() || hasNum(l.amt));
        if (lines.some(l => !hasNum(l.amt) || num(l.amt) <= 0)) return fail('Each extra line needs an amount.');
        const items = avail().filter(x => st.sel.has(x.key)).map(x => ({ key: x.key, desc: x.desc, amt: x.amt })).concat(lines.map(l => ({ desc: l.desc.trim() || 'Art classes', amt: num(l.amt) })));
        if (!items.length) return fail('Tick at least one class, or add a line.');
        let d = doc;
        if (!d) { const b = biz(); d = { id: uid(), kind: 'inv', no: docNo('inv', b.nextInv), at: Date.now(), paid: null }; S.biz.nextInv = b.nextInv + 1; S.docs.push(d); }
        const key = st.pk || payerKey(st.to);
        Object.assign(d, { d: st.d, due: st.due, to: { name: st.to.trim(), contact: st.contact.trim() }, pk: key, items, note: st.note.trim() });
        S.payers[key] = { to: st.to.trim(), contact: st.contact.trim() };
        save();
        sh.close();
        if (UI.cur === 'doc' && UI.param === d.id) render(true); else go(`#/doc/${d.id}`);
        toast(`${icon('check')} ${esc(d.no)} ${isNew ? 'made' : 'saved'}`);
      },
    },
    input: e => {
      const el = e.target;
      if (el.name === 'to') st.to = el.value;
      else if (el.name === 'contact') st.contact = el.value;
      else if (el.name === 'note') st.note = el.value;
      else if (el.dataset.ld !== undefined) st.lines[+el.dataset.ld].desc = el.value;
      else if (el.dataset.la !== undefined) { st.lines[+el.dataset.la].amt = el.value; upd(); }
    },
    change: e => {
      const el = e.target;
      if (el.name === 'pk') { setPk(el.value); sh.set(tpl()); }
      else if (el.name === 'extra' && el.value) { const g = groups.find(x => x.pk === el.value); if (g) { st.extra.push(g.pk); g.items.filter(ch => !onInv.has(ch.key)).forEach(ch => st.sel.add(ch.key)); } sh.set(tpl()); }
      else if (el.name === 'd') { const was = st.d; st.d = el.value; if (validDate(st.d) && validDate(was) && st.due >= was) { st.due = addDays(st.d, daysBetween(was, st.due)); const i = $('[name=due]', sh.el); if (i) i.value = st.due; } }
      else if (el.name === 'due') st.due = el.value;
      else if (el.dataset.k) { if (el.checked) st.sel.add(el.dataset.k); else st.sel.delete(el.dataset.k); upd(); }
    },
  });
}

/* ---------- one invoice or receipt ---------- */
const DOCPDF = new Map(); // signature → PDF blob, made ahead so sharing starts straight from the tap
const docSig = (doc, receipt) => JSON.stringify([doc, S.biz, receipt ? docPaid(doc) : 0, APP_VERSION]);
VIEWS.doc = {
  tab: 'today', title: 'Invoice',
  head(id) { const d = docById(id); return d ? { back: '#/invoices', kicker: docKindName(d), title: esc(d.no), sub: esc(d.to.name || '') } : { back: '#/invoices', title: 'Not found' }; },
  render(id) {
    const d = docById(id);
    if (!d) return emptyState('warn', 'Not found', 'It may have been deleted.', '<a class="btn" href="#/invoices">Invoices</a>');
    const [cls, label] = docStatus(d), paid = docPaid(d), isInv = d.kind === 'inv';
    return `<div class="doc-top"><span class="pill ${cls}">${esc(label)}</span><b class="doc-amt tnum">${money(docTotal(d))}</b></div>
      <div class="btn-row"><button type="button" class="btn primary" data-act="share">${icon('share')} Share PDF</button>
        ${isInv ? (paid ? `<button type="button" class="btn" data-act="receipt">${icon('receipt')} Receipt PDF</button>${paid.auto ? '' : '<button type="button" class="btn ghost" data-act="unpaid">Not paid after all</button>'}` : `<button type="button" class="btn ok" data-act="paid">${icon('check')} Mark paid</button>`) : ''}</div>
      <div class="doc-pages" id="docp" role="img" aria-label="${esc(`${docKindName(d)} ${d.no} for ${d.to.name || ''}, ${money(docTotal(d))}`)}"><p class="fine">Drawing the page…</p></div>
      <h3>On this ${d.kind === 'rec' ? 'receipt' : 'invoice'}</h3><div class="list card" style="padding:0">${d.items.map(it => `<div class="lrow"><span class="t"><b>${esc(it.desc)}</b></span><span class="s-amt">${money(it.amt)}</span></div>`).join('')}</div>
      ${d.note ? `<p class="fine" style="margin-top:12px">Note: ${esc(d.note)}</p>` : ''}
      <div class="btn-row" style="margin-top:20px">${isInv && !paid ? `<button type="button" class="btn" data-act="edit">${icon('edit')} Edit</button>` : ''}<button type="button" class="btn ghost" data-act="biz">${icon('user')} Your details</button><button type="button" class="btn danger-ghost" data-act="del">${icon('trash')} Delete</button></div>`;
  },
  act: {
    share: a => shareDoc(docById(UI.param), false, a),
    receipt: a => shareDoc(docById(UI.param), true, a),
    paid: () => openDocPaid(docById(UI.param)),
    unpaid: () => {
      const d = docById(UI.param), was = d.paid, keys = d.items.filter(it => it.key && S.paid[it.key] && S.paid[it.key].inv === d.id).map(it => it.key);
      d.paid = null;
      const undo = unmarkPaid(keys);
      render();
      toast(`${esc(d.no)} marked as not paid`, { undo: () => { d.paid = was; undo(); render(); } });
    },
    edit: () => openInvoiceEditor({ doc: docById(UI.param) }),
    biz: () => openBizEditor(),
    del: async () => {
      const d = docById(UI.param);
      if (!(await ask({ title: `Delete ${esc(d.no)}?`, body: 'Payments you’ve marked stay as they are. You can undo straight after.', ok: 'Delete', danger: true }))) return;
      const i = S.docs.indexOf(d);
      S.docs.splice(i, 1);
      save();
      go('#/invoices');
      toast(`${icon('trash')} ${esc(d.no)} deleted`, { undo: () => { S.docs.splice(i, 0, d); save(); render(); } });
    },
  },
  after(view, id) {
    const d = docById(id);
    if (!d) return null;
    let live = true;
    (async () => {
      await docFontsReady();
      if (!live) return;
      const pages = docPages(d), box = $('#docp', view);
      if (!box) return;
      box.innerHTML = '';
      pages.forEach(cv => { cv.className = 'doc-page'; box.append(cv); });
      const sig = docSig(d, false);
      if (!DOCPDF.has(sig)) DOCPDF.set(sig, await pdfFromCanvases(pages, `${docKindName(d)} ${d.no}`));
      if (live && d.kind === 'inv' && docPaid(d)) { const s2 = docSig(d, true); if (!DOCPDF.has(s2)) DOCPDF.set(s2, await docPdf(d, { receipt: true })); }
    })().catch(e => { const box = $('#docp', view); if (box && live) box.innerHTML = `<p class="err">Couldn’t draw the page: ${esc(e.message || e)}</p>`; });
    return () => { live = false; };
  },
};
const docFileName = (d, receipt) => `${receipt && d.kind === 'inv' ? `Receipt for ${d.no}` : d.no} ${d.to.name || ''}`.replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, ' ').trim().slice(0, 60) + '.pdf';
async function shareDoc(d, receipt, btn) {
  if (!d) return;
  if (btn) btn.disabled = true;
  try {
    const sig = docSig(d, receipt);
    let blob = DOCPDF.get(sig);
    if (!blob) { toast('Making the PDF…', { ms: 20000 }); blob = await docPdf(d, { receipt }); DOCPDF.set(sig, blob); }
    const r = await shareFile(blob, docFileName(d, receipt), `${receipt ? 'Receipt' : docKindName(d)} ${d.no}`);
    toast(r === 'downloaded' ? `${icon('download')} Saved to your downloads` : r === 'shared' ? `${icon('check')} Shared` : 'Not shared');
  } catch (e) { toast(`${icon('warn')} ${esc(e.message || 'Couldn’t make the PDF.')}`, { ms: 6000 }); } finally { if (btn) btn.disabled = false; }
}
function openDocPaid(d) {
  const st = { d: today(), how: S.prefs.payHow || 'transfer' };
  const sh = openSheet(`${sheetHead(`${esc(d.no)} paid`, `${esc(d.to.name || '')} · ${money(docTotal(d))}`)}
    ${field('Date paid', `<input type="date" name="d" value="${st.d}">`)}
    <div class="field"><span class="f-l">How</span>${seg('how', PAY_HOW, st.how)}</div>
    <div class="btn-row end"><button type="button" class="btn ghost" data-close>Cancel</button><button type="button" class="btn primary" data-act="ok">${icon('check')} Mark paid</button></div>`, {
    label: 'Mark invoice paid', cls: 'small',
    act: {
      ok: a => {
        const dd = $('[name=d]', sh.el).value;
        if (!validDate(dd)) { toast(`${icon('warn')} Choose the date it was paid`); return; }
        const list = d.items.filter(it => it.key && !S.paid[it.key]).map(it => ({ key: it.key, amt: num(it.amt), who: d.to.name, desc: it.desc }));
        const was = d.paid, undo = markPaid(list, { d: dd, how: st.how, inv: d.id });
        d.paid = { d: dd, how: st.how };
        save();
        celebrateAt(a);
        sh.close();
        render();
        toast(`${icon('check')} ${esc(d.no)} paid`, { undo: () => { d.paid = was; undo(); render(); } });
      },
    },
  });
  sh.el.addEventListener('click', e => { const b = e.target.closest('[data-seg="how"]'); if (b) { st.how = b.dataset.v; $$('[data-seg="how"]', sh.el).forEach(x => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-checked', on); }); } });
}
// A receipt for payments already marked paid. list: [{ key, who, desc, amt, st? }]
function makeReceipt(list, paid) {
  const b = biz(), who = list[0].who || '', pk = payerKey(who), r = S.payers[pk] || {};
  const doc = { id: uid(), kind: 'rec', no: docNo('rec', b.nextRec), at: Date.now(), d: paid.d, to: { name: r.to || who, contact: r.contact || '' }, pk, items: list.map(ch => ({ key: ch.key, desc: itemDesc(ch), amt: num(ch.amt) })), note: b.note || '', paid: { d: paid.d, how: paid.how } };
  S.biz.nextRec = b.nextRec + 1;
  S.docs.push(doc);
  save();
  return doc;
}

/* ---------- drawing a page (A4, measured in millimetres) ---------- */
const DOCK = { W: 1654, ink: '#2E2433', ink2: '#4F4354', ink3: '#6B5E70', line: '#E6DCEB', accent: '#6D28D9', ok: '#2E7349' };
const RAINBOW_C = ['#FF6B6B', '#FF9F4A', '#FFD23F', '#8EDB5A', '#59B8FF', '#A77BFF'];
const dFont = (w, size, serif) => `${w} ${size}px ${serif ? 'Fraunces, Georgia, serif' : 'Nunito, Arial, sans-serif'}`;
async function docFontsReady() {
  try { await Promise.race([Promise.all(['600 20px Fraunces', '400 20px Nunito', '700 20px Nunito', '800 20px Nunito'].map(f => document.fonts.load(f))), sleep(2000)]); } catch (e) { /* the system fonts will do */ }
}
function pageCanvas(W) {
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = Math.round((W * 297) / 210);
  const g = cv.getContext('2d');
  g.fillStyle = '#fff';
  g.fillRect(0, 0, cv.width, cv.height);
  const k = W / 210;
  g.setTransform(k, 0, 0, k, 0, 0);
  g.lineJoin = 'round';
  g.lineCap = 'round';
  return { cv, g };
}
function dText(g, s, x, y, font, color = DOCK.ink, align = 'left') { g.font = font; g.fillStyle = color; g.textAlign = align; g.fillText(String(s), x, y); }
function dWrap(g, s, maxW, font) {
  g.font = font;
  const words = String(s || '').split(/\s+/).filter(Boolean), out = [];
  let cur = '';
  for (const w of words) { const t = cur ? `${cur} ${w}` : w; if (cur && g.measureText(t).width > maxW) { out.push(cur); cur = w; } else cur = t; }
  if (cur) out.push(cur);
  return out.length ? out : [''];
}
function dRound(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function dSparkle(g, x, y, r, fill) {
  g.beginPath();
  g.moveTo(x, y - r);
  g.quadraticCurveTo(x + r * 0.16, y - r * 0.16, x + r, y);
  g.quadraticCurveTo(x + r * 0.16, y + r * 0.16, x, y + r);
  g.quadraticCurveTo(x - r * 0.16, y + r * 0.16, x - r, y);
  g.quadraticCurveTo(x - r * 0.16, y - r * 0.16, x, y - r);
  g.closePath();
  g.fillStyle = fill;
  g.fill();
  g.lineWidth = 0.35;
  g.strokeStyle = DOCK.ink;
  g.stroke();
}
function dDecor(g, seed) {
  RAINBOW_C.forEach((c, i) => { g.fillStyle = c; g.fillRect(i * 35, 0, 35.3, 3.4); });
  dSparkle(g, 196, 13, 3.4, '#FFD23F');
  const R = rng(seed);
  for (let i = 0; i < 9; i++) {
    g.fillStyle = `${RAINBOW_C[i % 6]}66`;
    g.beginPath();
    g.arc(i % 2 ? 176 + R() * 26 : 6 + R() * 26, 272 + R() * 18, 0.7 + R() * 1.1, 0, Math.PI * 2);
    g.fill();
  }
}
function dStamp(g, x, y, paid) {
  g.save();
  g.translate(x, y);
  g.rotate(-0.12);
  g.strokeStyle = DOCK.ok;
  g.lineWidth = 0.9;
  dRound(g, -21, -9.5, 42, 19, 4);
  g.stroke();
  g.lineWidth = 0.35;
  dRound(g, -19.2, -7.7, 38.4, 15.4, 3);
  g.stroke();
  dText(g, 'PAID', 0, 1.6, dFont(800, 8.4), DOCK.ok, 'center');
  if (paid && paid.d) dText(g, `${fmtDate(paid.d, { noDay: true, year: true })}${paid.how ? ` · ${howName(paid.how)}` : ''}`, 0, 5.8, dFont(700, 2.5), DOCK.ok, 'center');
  g.restore();
}
function howToPay(b, doc) {
  const out = [];
  if (b.bsb || b.acc) { out.push(`Bank transfer to ${b.accName || b.name}`); out.push([b.bsb ? `BSB ${fmtBsb(b.bsb)}` : '', b.acc ? `Account ${b.acc}` : ''].filter(Boolean).join('    ')); }
  if (b.payid) out.push(`PayID ${b.payid}`);
  if (out.length) out.push(`Please use ${doc.no} as the reference.`);
  if (doc.due && doc.due > doc.d) out.push(`Please pay by ${fmtDate(doc.due, { long: true, year: true })}.`);
  return out;
}
// Returns the page canvases for an invoice or receipt (o.receipt draws a paid invoice as its receipt).
function docPages(doc, o = {}) {
  const W = o.W || DOCK.W, b = biz(), rec = doc.kind === 'rec' || !!o.receipt, paid = rec ? docPaid(doc) || doc.paid || { d: doc.d, how: '' } : null;
  const title = rec ? 'Receipt' : b.gst ? 'Tax invoice' : 'Invoice', number = rec && doc.kind === 'inv' ? `For ${doc.no}` : doc.no;
  const pages = [];
  let g, y = 0;
  const page = first => {
    const p = pageCanvas(W);
    pages.push(p);
    g = p.g;
    dDecor(g, `${doc.id}:${pages.length}`);
    if (!first) { dText(g, `${title} ${number}, continued`, 20, 20, dFont(700, 3.6), DOCK.ink2); y = 32; }
  };
  page(true);
  // who it's from
  let ly = 25;
  dWrap(g, b.name, 104, dFont(600, 7, true)).forEach(l => { dText(g, l, 20, ly, dFont(600, 7, true)); ly += 7.6; });
  const meta = [b.person && b.person.trim() !== b.name.trim() ? b.person : '', b.abn ? `ABN ${fmtAbn(b.abn)}` : '', b.email, b.phone].filter(Boolean);
  if (b.addr) meta.push(...dWrap(g, b.addr, 96, dFont(400, 3.4)));
  meta.forEach(l => { dText(g, l, 20, ly, dFont(400, 3.4), DOCK.ink2); ly += 4.9; });
  // what it is
  dText(g, title, 190, 27, dFont(600, 10, true), DOCK.ink, 'right');
  const rows = [['Number', number], ['Date', fmtDate(rec && doc.kind === 'inv' ? paid.d : doc.d, { long: true, year: true, noDay: true })]];
  if (!rec && doc.due) rows.push(['Due', doc.due > doc.d ? fmtDate(doc.due, { long: true, year: true, noDay: true }) : 'On receipt']);
  let ry = 36;
  rows.forEach(([k, v]) => { dText(g, k, 136, ry, dFont(800, 3.2), DOCK.ink3); dText(g, v, 190, ry, dFont(700, 3.5), DOCK.ink, 'right'); ry += 5.4; });
  // who it's for
  y = Math.max(ly, ry) + 9;
  const top = y;
  dText(g, rec ? 'Received from' : 'Bill to', 20, y, dFont(800, 3.3), DOCK.accent);
  y += 6.4;
  dWrap(g, doc.to.name || '', 112, dFont(700, 4.8)).forEach(l => { dText(g, l, 20, y, dFont(700, 4.8)); y += 5.8; });
  if (doc.to.contact) { dText(g, doc.to.contact, 20, y, dFont(400, 3.4), DOCK.ink2); y += 5; }
  if (rec) { dStamp(g, 163, top + 6, paid); y = Math.max(y, top + 20); }
  y += 9;
  // the items
  const head = () => {
    g.fillStyle = '#F3ECFF';
    dRound(g, 16, y - 6.4, 178, 9.6, 3.2);
    g.fill();
    dText(g, 'Description', 22, y, dFont(800, 3.3), DOCK.ink2);
    dText(g, 'Amount', 188, y, dFont(800, 3.3), DOCK.ink2, 'right');
    y += 10;
  };
  head();
  for (const it of doc.items) {
    const ls = dWrap(g, it.desc, 128, dFont(400, 3.8)), h = ls.length * 5.1 + 3.6;
    if (y + h > 262) { page(false); head(); }
    ls.forEach((l, i) => dText(g, l, 22, y + i * 5.1, dFont(400, 3.8)));
    dText(g, money(it.amt), 188, y, dFont(700, 3.8), DOCK.ink, 'right');
    y += h;
    g.strokeStyle = DOCK.line;
    g.lineWidth = 0.3;
    g.beginPath();
    g.moveTo(20, y - 4.4);
    g.lineTo(190, y - 4.4);
    g.stroke();
  }
  // the total
  const total = docTotal(doc), pay = rec ? [] : howToPay(b, doc), note = (doc.note || '').trim(), noteLines = note ? dWrap(g, note, 170, dFont(400, 3.5)) : [];
  const need = 20 + (b.gst ? 6 : 0) + (rec ? 10 : pay.length ? 14 + pay.length * 5.3 : 0) + (noteLines.length ? 4 + noteLines.length * 5 : 0);
  if (y + need > 280) page(false);
  y += 1;
  g.fillStyle = '#FFE066';
  dRound(g, 116, y - 1, 78, 13.4, 6.7);
  g.fill();
  g.strokeStyle = DOCK.ink;
  g.lineWidth = 0.5;
  g.stroke();
  dText(g, rec ? 'Total paid' : 'Total', 123, y + 7.8, dFont(800, 3.8));
  dText(g, money(total), 188, y + 8.2, dFont(600, 6.2, true), DOCK.ink, 'right');
  y += 19;
  if (b.gst) { dText(g, `Includes GST of ${money(round2(total / 11))}`, 190, y, dFont(700, 3.3), DOCK.ink2, 'right'); y += 6; }
  if (rec) { dText(g, `Received with thanks${paid.how ? ` by ${howName(paid.how).toLowerCase()}` : ''} on ${fmtDate(paid.d, { long: true, year: true })}.`, 20, y + 2, dFont(600, 3.6), DOCK.ink2); y += 10; }
  else if (pay.length) {
    const h = 12 + pay.length * 5.3;
    g.fillStyle = '#E3F2FF';
    dRound(g, 16, y, 178, h, 4);
    g.fill();
    g.strokeStyle = '#59B8FF';
    g.lineWidth = 0.4;
    g.stroke();
    dText(g, 'How to pay', 22, y + 7.4, dFont(800, 3.7));
    pay.forEach((l, i) => dText(g, l, 22, y + 13.6 + i * 5.3, dFont(400, 3.5), DOCK.ink2));
    y += h + 6;
  }
  noteLines.forEach(l => { dText(g, l, 20, y + 3, dFont(400, 3.5), DOCK.ink2); y += 5; });
  // a footer on every page
  const foot = [b.name, b.email].filter(Boolean).join(' · ');
  pages.forEach((p, i) => {
    p.g.strokeStyle = DOCK.line;
    p.g.lineWidth = 0.3;
    p.g.beginPath();
    p.g.moveTo(20, 283);
    p.g.lineTo(190, 283);
    p.g.stroke();
    dText(p.g, `${foot}${pages.length > 1 ? `   ·   Page ${i + 1} of ${pages.length}` : ''}`, 105, 289, dFont(600, 2.9), DOCK.ink3, 'center');
  });
  return pages.map(p => p.cv);
}

/* ---------- PDF files: each page is a JPEG picture filling an A4 page ---------- */
const canvasJpeg = (cv, q = 0.9) => new Promise((res, rej) => cv.toBlob(b => (b ? b.arrayBuffer().then(x => res(new Uint8Array(x)), rej) : rej(new Error('Couldn’t make the page.'))), 'image/jpeg', q));
const pdfStr = s => `<FEFF${[...String(s)].map(ch => { const c = ch.codePointAt(0); if (c < 0x10000) return c.toString(16).padStart(4, '0'); const v = c - 0x10000; return ((v >> 10) + 0xd800).toString(16) + ((v & 0x3ff) + 0xdc00).toString(16); }).join('').toUpperCase()}>`;
function pdfFromJpegs(pages, title) {
  const enc = new TextEncoder(), chunks = [], offs = [];
  let len = 0;
  const put = x => { const u = typeof x === 'string' ? enc.encode(x) : x; chunks.push(u); len += u.length; };
  const obj = (n, body) => { offs[n] = len; put(`${n} 0 obj\n`); body(); put('\nendobj\n'); };
  const W = 595.28, H = 841.89, N = pages.length, now = new Date(), ts = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  put('%PDF-1.4\n');
  put(new Uint8Array([0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a]));
  obj(1, () => put('<< /Type /Catalog /Pages 2 0 R >>'));
  obj(2, () => put(`<< /Type /Pages /Kids [${pages.map((_, i) => `${4 + i * 3} 0 R`).join(' ')}] /Count ${N} >>`));
  obj(3, () => put(`<< /Title ${pdfStr(title)} /Producer (Atelier) /CreationDate (D:${ts}) >>`));
  pages.forEach((p, i) => {
    const pid = 4 + i * 3, iid = pid + 1, cid = pid + 2, cs = `q ${W} 0 0 ${H} 0 0 cm /Im${i} Do Q`;
    obj(pid, () => put(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /XObject << /Im${i} ${iid} 0 R >> /ProcSet [/PDF /ImageC] >> /Contents ${cid} 0 R >>`));
    obj(iid, () => { put(`<< /Type /XObject /Subtype /Image /Width ${p.w} /Height ${p.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${p.jpg.length} >>\nstream\n`); put(p.jpg); put('\nendstream'); });
    obj(cid, () => put(`<< /Length ${cs.length} >>\nstream\n${cs}\nendstream`));
  });
  const xref = len, n = 4 + N * 3;
  put(`xref\n0 ${n}\n0000000000 65535 f \n${offs.slice(1, n).map(o => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`);
  put(`trailer\n<< /Size ${n} /Root 1 0 R /Info 3 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  return new Blob(chunks, { type: 'application/pdf' });
}
async function pdfFromCanvases(cvs, title) {
  const pages = [];
  for (const cv of cvs) pages.push({ jpg: await canvasJpeg(cv), w: cv.width, h: cv.height });
  return pdfFromJpegs(pages, title);
}
async function docPdf(doc, o = {}) {
  await docFontsReady();
  return pdfFromCanvases(docPages(doc, o), `${o.receipt || doc.kind === 'rec' ? 'Receipt' : docKindName(doc)} ${doc.no}`);
}
