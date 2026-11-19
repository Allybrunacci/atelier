/* Atelier — settings (name, school terms, backups, storage, start again) and start-up */
'use strict';

const standalone = () => (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
VIEWS.settings = {
  tab: 'today', title: 'Settings',
  head() { return { back: '#/today', title: 'Settings', sub: `Atelier ${APP_VERSION}` }; },
  render() {
    const terms = sortedTerms(), t = today(), nPh = Object.keys(S.photos).length, kb = sum(Object.values(S.photos).map(p => p.kb || 0));
    const bk = S.prefs.backupAt;
    let h = `<label class="field"><span class="f-l">Your first name (for the greeting)</span><input id="sname" value="${esc(S.name)}" autocomplete="given-name" placeholder="Optional"></label>`;
    h += `<div class="sec"><h2>School terms</h2></div><p class="sec-intro">Classes set to “school terms only” skip the holidays between these dates. Term students’ rates can be worked out from a term fee.</p>
      ${terms.length ? `<div class="list">${terms.map(x => `<button type="button" class="lrow" data-act="term" data-id="${x.id}"><span class="t"><b>${esc(x.name)}${x.start <= t && x.end >= t ? ' <span class="pill ok">Now</span>' : ''}</b><small>${fmtDate(x.start, { year: true })} to ${fmtDate(x.end, { year: true })} · ${plural(Math.round((daysBetween(x.start, x.end) + 1) / 7), 'week')}</small></span>${icon('edit', 'go')}</button>`).join('')}</div>` : ''}
      <div class="btn-row"><button type="button" class="btn soft" data-act="term">${icon('plus')} Add a term</button><button type="button" class="btn" data-act="nsw">${icon('school')} Add NSW school terms</button></div>
      <p class="fine" style="margin-top:8px">NSW public school terms (Eastern division, including Sydney) for Term 4 2026 and all of 2027, from the NSW Department of Education. Some schools differ, so check your students’ schools.</p>`;
    h += `<div class="sec"><h2>Backup</h2></div><p class="sec-intro">Everything is kept on this phone only. A backup is one file with your classes, earnings, plans and photos.${bk ? ` Last backup: ${fmtDate(new Date(bk).toISOString().slice(0, 10), { long: true })}.` : ' You haven’t made one yet.'}</p>
      <div class="btn-row" style="margin-top:0"><button type="button" class="btn primary" data-act="backup">${icon('download')} Back up now</button><button type="button" class="btn" data-act="restore">${icon('upload')} Restore a backup</button></div>
      <input type="file" id="restore-file" accept=".zip,.json,application/zip,application/json" hidden>
      <p class="fine" style="margin-top:8px">On iPhone, choose <b>Save to Files</b> and pick iCloud Drive, so the backup is safe if the phone is lost.</p>`;
    h += `<div class="sec"><h2>Earnings</h2></div><div class="btn-row" style="margin-top:0"><button type="button" class="btn" data-act="csv">${icon('share')} Export earnings to a spreadsheet</button></div>`;
    h += `<div class="sec"><h2>Storage</h2></div><p>${plural(Object.keys(S.classes).length, 'class', 'classes')}, ${plural(Object.values(S.sessions).filter(s => s.done).length, 'ticked class', 'ticked classes')}, ${plural(nPh, 'photo')} (${kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`}).</p><p class="fine" id="persist"></p>
      ${standalone() ? '' : `<div class="callout">${icon('info')}<p>On iPhone, open Atelier in Safari, tap <b>Share</b>, then <b>Add to Home Screen</b>. It then opens like an app, works offline, and Safari won’t clear your photos.</p></div>`}`;
    h += `<div class="sec"><h2>About</h2></div><p class="fine">Atelier ${APP_VERSION}. No accounts, no ads and no tracking. Nothing leaves this phone unless you share or back it up. Fonts: Fraunces and Nunito Sans (SIL Open Font License 1.1). Illustrations are drawn by the app. School term dates: NSW Department of Education.</p>`;
    h += `<div class="sec"><h2>Start again</h2></div><p class="sec-intro">Deletes every class, earning, plan and photo on this phone. Make a backup first if you might want them back.</p><button type="button" class="btn danger-ghost" data-act="wipe">${icon('trash')} Delete everything</button>`;
    return h;
  },
  act: {
    nsw: () => { addNswTerms(); render(); },
    term: a => editTerm(S.terms.find(x => x.id === a.dataset.id)),
    csv: () => exportEarnings(),
    backup: async a => {
      a.disabled = true;
      try {
        const n = Object.keys(S.photos).length;
        toast(n ? `Packing ${plural(n, 'photo')}…` : 'Making a backup…', { ms: 60000 });
        const zip = await makeBackup((i, total) => { if (total > 4 && i % 4 === 0) toast(`Packing photos… ${i} of ${total}`, { ms: 60000 }); });
        const r = await shareFile(zip, `atelier-backup-${today()}.zip`, 'Atelier backup');
        if (r === 'cancelled') { toast('Backup not saved'); return; }
        S.prefs.backupAt = Date.now();
        save();
        render();
        toast(`${icon('check')} Backup ${r === 'downloaded' ? 'saved to your downloads' : 'ready'} (${(zip.size / 1048576).toFixed(1)} MB)`);
      } catch (e) { toast(`${icon('warn')} The backup didn’t work: ${esc(e.message || e)}`, { ms: 6000 }); } finally { a.disabled = false; }
    },
    restore: () => $('#restore-file').click(),
    wipe: async () => {
      if (!(await ask({ title: 'Delete everything?', body: 'Every class, earning, plan and photo on this phone will be deleted. This can’t be undone.', ok: 'Delete everything', danger: true }))) return;
      // Nothing may be saved from memory while the page reloads, or the data would come straight back.
      NO_SAVE = true;
      S = freshState();
      try { await imgClear(); } catch (e) { /* no photos */ }
      try { localStorage.removeItem(STORE_KEY); } catch (e) { /* nothing saved */ }
      location.hash = '#/today';
      location.reload();
    },
  },
  after(view) {
    let tm = 0;
    const inp = e => { if (e.target.id === 'sname') { S.name = e.target.value.trim(); clearTimeout(tm); tm = setTimeout(save, 400); } };
    const chg = async e => {
      if (e.target.id !== 'restore-file' || !e.target.files[0]) return;
      const f = e.target.files[0];
      e.target.value = '';
      if (!(await ask({ title: 'Restore this backup?', body: `It replaces everything on this phone with the backup in “${esc(f.name)}”.`, ok: 'Restore', danger: true }))) return;
      toast('Restoring…', { ms: 60000 });
      try { const r = await restoreBackup(f); render(true); toast(`${icon('check')} Restored ${plural(r.classes, 'class', 'classes')} and ${plural(r.photos, 'photo')}`); } catch (err) { toast(`${icon('warn')} ${esc(err.message || 'That file couldn’t be read.')}`, { ms: 6000 }); }
    };
    view.addEventListener('input', inp);
    view.addEventListener('change', chg);
    if (navigator.storage && navigator.storage.estimate) {
      Promise.all([navigator.storage.estimate(), navigator.storage.persisted ? navigator.storage.persisted() : Promise.resolve(false)]).then(([est, p]) => {
        const el = $('#persist', view);
        if (el) el.textContent = `About ${Math.max(1, Math.round((est.usage || 0) / 1048576))} MB used on this phone.${p ? ' Your data is marked to be kept.' : ''}`;
      }).catch(() => {});
    }
    return () => { clearTimeout(tm); save(); view.removeEventListener('input', inp); view.removeEventListener('change', chg); };
  },
};
function editTerm(t) {
  const isNew = !t, prev = sortedTerms().slice(-1)[0];
  const d = t ? Object.assign({}, t) : { id: uid(), name: '', start: prev ? addDays(prev.end, 17) : today(), end: prev ? addDays(prev.end, 17 + 69) : addDays(today(), 69) };
  const sh = openSheet(`${sheetHead(isNew ? 'Add a term' : 'Edit term')}
    <label class="field"><span class="f-l">Name</span><input name="n" value="${esc(d.name)}" placeholder="e.g. Term 1 2027" autocomplete="off"></label>
    <div class="two"><label class="field"><span class="f-l">First day</span><input type="date" name="s" value="${d.start}"></label><label class="field"><span class="f-l">Last day</span><input type="date" name="e" value="${d.end}"></label></div>
    <p class="err" id="terr" role="alert" hidden></p>
    <div class="btn-row end">${isNew ? '' : `<button type="button" class="btn danger-ghost" data-act="del" style="margin-right:auto">${icon('trash')} Delete</button>`}<button type="button" class="btn ghost" data-close>Cancel</button><button type="button" class="btn primary" data-act="ok">Save</button></div>`, {
    label: isNew ? 'Add a term' : 'Edit term', cls: 'small',
    act: {
      ok: () => {
        const n = $('[name=n]', sh.el).value.trim(), s = $('[name=s]', sh.el).value, e = $('[name=e]', sh.el).value, er = $('#terr', sh.el);
        const msg = !validDate(s) || !validDate(e) ? 'Choose the first and last days.' : e < s ? 'The last day is before the first day.' : '';
        if (msg) { er.textContent = msg; er.hidden = false; return; }
        Object.assign(d, { name: n || `Term from ${fmtDate(s, { noDay: true, year: true })}`, start: s, end: e });
        if (isNew) S.terms.push(d); else Object.assign(t, d);
        save();
        sh.close();
        render();
        toast(`${icon('check')} ${esc(d.name)} saved`);
      },
      del: () => { const i = S.terms.indexOf(t); S.terms.splice(i, 1); save(); sh.close(); render(); toast(`${icon('trash')} ${esc(t.name)} deleted`, { undo: () => { S.terms.splice(i, 0, t); save(); render(); } }); },
    },
  });
}

/* ---------- start-up ---------- */
let DAY = '';
function checkDay() { const t = today(); if (t === DAY) return; DAY = t; if (!SHEET) render(); }
// Home-screen apps come back from memory rather than reloading, so a fix wouldn't arrive until the app was fully
// closed. When Atelier comes back on screen it checks for a newer version and reloads, but never while a panel is open.
let UPDATE_READY = false, lastUpdateCheck = 0;
const busy = () => !!SHEET;
async function checkForUpdate() {
  if (UPDATE_READY || !/^https?:$/.test(location.protocol) || /[?&]nosw/.test(location.search) || Date.now() - lastUpdateCheck < 60000) return;
  lastUpdateCheck = Date.now();
  try {
    const r = await fetch('core.js', { cache: 'no-store' });
    const m = /APP_VERSION = '([^']+)'/.exec(r.ok ? await r.text() : '');
    if (m && m[1] !== APP_VERSION) { UPDATE_READY = true; if (!busy()) { save(); location.reload(); } }
  } catch (e) { /* offline: try again later */ }
}
async function boot() {
  S = load();
  DAY = today();
  $('#view').addEventListener('click', onViewClick);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && SHEET) closeSheet(); });
  window.addEventListener('hashchange', () => { closeAllSheets(); render(true); if (UPDATE_READY && !busy()) location.reload(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) save(); else { checkDay(); checkForUpdate(); } });
  setInterval(checkDay, 60000);
  window.addEventListener('storage', e => { if (e.key === STORE_KEY && !SHEET) { S = load(); render(); } });
  try { await Promise.race([Promise.all([document.fonts.load('16px "Nunito Sans"'), document.fonts.load('600 32px Fraunces')]), sleep(1500)]); } catch (e) { /* fonts are optional */ }
  render(true);
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !/[?&]nosw/.test(location.search)) navigator.serviceWorker.register('sw.js').catch(() => {});
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persisted().then(p => p || navigator.storage.persist()).catch(() => {}); } catch (e) { /* not supported */ }
}
document.addEventListener('DOMContentLoaded', boot);
