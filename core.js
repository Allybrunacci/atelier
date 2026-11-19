/* Atelier — core: helpers, dates (weeks start on Monday), saved data, screens, sheets and messages */
'use strict';

const APP_VERSION = '1.0.0';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const sum = a => a.reduce((t, n) => t + n, 0);
const plural = (n, one, many) => `${n} ${n === 1 ? one : many || one + 's'}`;
const icon = (id, cls = '') => `<svg class="ico${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-${id}"/></svg>`;
const uid = () => Date.now().toString(36).slice(-6) + Math.random().toString(36).slice(2, 7);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const cap = s => (s ? s[0].toUpperCase() + s.slice(1) : s);
const reduceMotion = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const joinAnd = a => (a.length < 2 ? a.join('') : `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}`);
const ordinal = n => n + (n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th');
function rng(seed) {
  let a = typeof seed === 'string' ? [...seed].reduce((h, ch) => Math.imul(h ^ ch.charCodeAt(0), 2654435761) >>> 0, 1779033703) : seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/* ---------- dates as 'YYYY-MM-DD', worked out in UTC so daylight saving never moves a day ---------- */
const pad = n => String(n).padStart(2, '0');
const isoOf = d => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
const D = s => { const [y, m, d] = s.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); };
const today = () => { const n = new Date(); return `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`; };
const nowTime = () => { const n = new Date(); return `${pad(n.getHours())}:${pad(n.getMinutes())}`; };
const addDays = (s, n) => { const d = D(s); d.setUTCDate(d.getUTCDate() + n); return isoOf(d); };
const daysBetween = (a, b) => Math.round((D(b) - D(a)) / 864e5);
const dow = s => (D(s).getUTCDay() + 6) % 7; // Monday 0 … Sunday 6
const mondayOf = s => addDays(s, -dow(s));
const monthStart = s => s.slice(0, 8) + '01';
const addMonths = (s, n) => { const d = D(monthStart(s)); d.setUTCMonth(d.getUTCMonth() + n); return isoOf(d); };
const daysInMonth = s => { const d = D(s); return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate(); };
const validDate = s => /^\d{4}-\d{2}-\d{2}$/.test(s || '') && isoOf(D(s)) === s;
const validTime = t => /^\d{2}:\d{2}$/.test(t || '');
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_LONG = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MON_SHORT = MONTHS.map(m => m.slice(0, 3));
function fmtDate(s, o = {}) {
  const d = D(s), w = dow(s), day = d.getUTCDate(), m = d.getUTCMonth(), y = d.getUTCFullYear();
  const yr = o.year === true || (o.year !== false && y !== +today().slice(0, 4));
  if (o.long) return `${o.noDay ? '' : DAY_LONG[w] + ' '}${day} ${MONTHS[m]}${yr ? ` ${y}` : ''}`;
  return `${o.noDay ? '' : DAY_SHORT[w] + ' '}${day} ${MON_SHORT[m]}${yr ? ` ${y}` : ''}`;
}
const fmtMonth = s => `${MONTHS[+s.slice(5, 7) - 1]} ${s.slice(0, 4)}`;
function relDay(s) {
  const n = daysBetween(today(), s);
  return n === 0 ? 'Today' : n === 1 ? 'Tomorrow' : n === -1 ? 'Yesterday' : fmtDate(s);
}
function fmtTime(t) {
  if (!validTime(t)) return '';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${pad(m)} ${h < 12 ? 'am' : 'pm'}`;
}
const addMins = (t, mins) => { const [h, m] = t.split(':').map(Number); const x = (((h * 60 + m + mins) % 1440) + 1440) % 1440; return `${pad(Math.floor(x / 60))}:${pad(x % 60)}`; };
function fmtSpan(t, mins) {
  const a = fmtTime(t), b = fmtTime(addMins(t, mins));
  return a.slice(-2) === b.slice(-2) ? `${a.slice(0, -3)}–${b}` : `${a} – ${b}`;
}
function fmtWeek(mon) {
  const sun = addDays(mon, 6), a = D(mon), b = D(sun);
  if (a.getUTCMonth() === b.getUTCMonth()) return `${a.getUTCDate()}–${b.getUTCDate()} ${MON_SHORT[b.getUTCMonth()]}${b.getUTCFullYear() !== +today().slice(0, 4) ? ' ' + b.getUTCFullYear() : ''}`;
  return `${fmtDate(mon, { noDay: true, year: false })} – ${fmtDate(sun, { noDay: true })}`;
}
const fmtMins = m => (m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ''}` : `${m} min`);

/* ---------- money (Australian dollars) ---------- */
const MONEY = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' });
const money = n => { const v = Math.round((+n || 0) * 100) / 100; const s = MONEY.format(v); return Number.isInteger(v) ? s.replace(/\.00$/, '') : s; };
const num = v => { const n = parseFloat(String(v == null ? '' : v).replace(/[^0-9.\-]/g, '')); return isFinite(n) ? Math.round(n * 100) / 100 : 0; };
const hasNum = v => v !== null && v !== undefined && String(v).trim() !== '' && isFinite(parseFloat(String(v).replace(/[^0-9.\-]/g, '')));

/* ---------- saved data (this phone only) ---------- */
const STORE_KEY = 'atelier:v1';
const freshState = () => ({ v: 1, created: today(), name: '', terms: [], classes: {}, sessions: {}, photos: {}, plans: {}, favs: {}, tags: [], prefs: { seen: {} }, savedAt: 0 });
let S = freshState();
let SAVE_OK = true, NO_SAVE = false;
function migrate(s) {
  const f = freshState();
  for (const k of Object.keys(f)) if (s[k] === undefined || s[k] === null) s[k] = f[k];
  s.prefs = Object.assign(f.prefs, s.prefs);
  Object.values(s.classes).forEach(fixClass);
  return s;
}
function load() {
  let raw = null;
  try { raw = localStorage.getItem(STORE_KEY); } catch (e) { SAVE_OK = false; }
  if (!raw) return freshState();
  try { return migrate(JSON.parse(raw)); } catch (e) {
    try { localStorage.setItem(`${STORE_KEY}:unreadable-${Date.now()}`, raw); } catch (_) { /* full */ }
    return freshState();
  }
}
function save() {
  if (NO_SAVE) return;
  S.savedAt = Date.now();
  try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); SAVE_OK = true; } catch (e) {
    SAVE_OK = false;
    toast(`${icon('warn')} Couldn’t save on this phone (storage may be full). Make a backup in Settings.`, { ms: 7000 });
  }
}

/* ---------- screens ---------- */
const VIEWS = {};
const UI = { cur: null, param: '', cleanup: null };
function route() {
  const parts = (location.hash || '').replace(/^#\/?/, '').split('/');
  const name = VIEWS[parts[0]] ? parts[0] : 'today';
  return { name, param: decodeURIComponent(parts.slice(1).join('/')) };
}
function go(hash) { if (location.hash === hash) render(true); else location.hash = hash; }
function back(fallback) { if (history.length > 1 && UI.from) history.back(); else go(fallback); }
function render(fresh) {
  const { name, param } = route();
  if (name !== UI.cur || param !== UI.param) fresh = true;
  if (fresh && UI.cleanup) { try { UI.cleanup(); } catch (e) { console.error(e); } UI.cleanup = null; }
  UI.from = UI.cur !== null;
  UI.cur = name;
  UI.param = param;
  const v = VIEWS[name], view = $('#view');
  const keep = fresh ? 0 : window.scrollY;
  const head = v.head ? v.head(param) : null;
  view.innerHTML = `${head ? `<header class="vhead">${head.back ? `<a class="icon-btn" href="${head.back}" aria-label="Back">${icon('chev-l')}</a>` : ''}<div class="vh-txt">${head.kicker ? `<p class="kicker">${head.kicker}</p>` : ''}<h1>${head.title}</h1>${head.sub ? `<p class="vh-sub">${head.sub}</p>` : ''}</div>${head.actions || ''}</header>` : ''}${v.render(param)}`;
  window.scrollTo(0, keep);
  if (fresh && !reduceMotion()) { view.classList.remove('view-in'); void view.offsetWidth; view.classList.add('view-in'); }
  if (v.after) { const c = v.after(view, param); if (fresh || c) UI.cleanup = c || UI.cleanup; }
  hydrate(view);
  const tab = v.tab || name;
  $$('.tab').forEach(t => { const on = t.dataset.tab === tab; t.classList.toggle('active', on); if (on) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current'); });
  document.title = name === 'today' ? 'Atelier' : `${v.title || cap(name)} · Atelier`;
  if (fresh) { const h = $('h1', view); if (h && UI.from) { h.tabIndex = -1; h.focus({ preventScroll: true }); } }
}
function onViewClick(e) {
  const a = e.target.closest('[data-act]');
  if (!a || a.disabled || !$('#view').contains(a)) return;
  const v = VIEWS[UI.cur], fn = v && v.act && v.act[a.dataset.act];
  if (fn) { e.preventDefault(); fn(a, e); }
}

/* ---------- sheets (panels that slide up) ---------- */
let SHEET = null;
const SHEETS = [];
function openSheet(html, opts = {}) {
  const root = $('#sheet-root');
  const back = document.createElement('div');
  back.className = 'backdrop';
  const el = document.createElement('div');
  el.className = 'sheet' + (opts.cls ? ' ' + opts.cls : '');
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  if (opts.label) el.setAttribute('aria-label', opts.label);
  el.tabIndex = -1;
  root.append(back, el);
  document.body.classList.add('locked');
  const prevFocus = document.activeElement;
  const sh = {
    el, back, opts, closed: false,
    close: () => closeSheet(sh),
    set(content) {
      const sc0 = $('.sheet-scroll', el) || el, top = sc0.scrollTop;
      el.innerHTML = `<div class="grab" aria-hidden="true"></div>${content}`;
      el.classList.toggle('framed', !!$('.sheet-scroll', el));
      ($('.sheet-scroll', el) || el).scrollTop = top;
      hydrate(el);
      if (opts.onSet) opts.onSet(sh);
    },
    prevFocus,
  };
  sh.set(html);
  SHEETS.push(sh);
  SHEET = sh;
  back.addEventListener('click', () => closeSheet(sh));
  el.addEventListener('click', e => {
    if (e.target.closest('[data-close]')) { e.preventDefault(); closeSheet(sh); return; }
    const a = e.target.closest('[data-act]');
    if (a && opts.act && opts.act[a.dataset.act] && !a.disabled) { e.preventDefault(); opts.act[a.dataset.act](a, e, sh); }
  });
  if (opts.input) el.addEventListener('input', e => opts.input(e, sh));
  if (opts.change) el.addEventListener('change', e => opts.change(e, sh));
  el.addEventListener('submit', e => { e.preventDefault(); if (opts.submit) opts.submit(e, sh); });
  el.focus({ preventScroll: true });
  if (opts.onOpen) opts.onOpen(sh);
  return sh;
}
function closeSheet(sh, quiet) {
  sh = sh || SHEET;
  if (!sh || sh.closed) return;
  sh.closed = true;
  const i = SHEETS.indexOf(sh);
  if (i >= 0) SHEETS.splice(i, 1);
  SHEET = SHEETS[SHEETS.length - 1] || null;
  if (sh.opts.onClose) sh.opts.onClose(sh, quiet);
  const done = () => { sh.el.remove(); sh.back.remove(); };
  if (quiet || reduceMotion()) done(); else { sh.el.classList.add('out'); sh.back.classList.add('out'); setTimeout(done, 180); }
  if (!SHEETS.length) document.body.classList.remove('locked');
  if (sh.prevFocus && sh.prevFocus.focus && document.contains(sh.prevFocus)) sh.prevFocus.focus({ preventScroll: true });
}
const closeAllSheets = () => { while (SHEETS.length) closeSheet(SHEETS[SHEETS.length - 1], true); };
const sheetHead = (title, sub) => `<div class="sheet-head"><div><h2>${title}</h2>${sub ? `<p class="sub">${sub}</p>` : ''}</div><button type="button" class="icon-btn" data-close aria-label="Close">${icon('close')}</button></div>`;
// A sheet whose buttons stay at the bottom while the rest scrolls.
const framed = (head, body, foot) => `<div class="sheet-scroll">${head}${body}</div><div class="sheet-foot">${foot}</div>`;
// A question with a clear answer. Resolves true (the main button) or false.
function ask({ title, body = '', ok = 'OK', cancel = 'Cancel', danger = false }) {
  return new Promise(res => {
    let answered = false;
    openSheet(`${sheetHead(title)}${body ? `<p class="lead">${body}</p>` : ''}<div class="btn-row end"><button type="button" class="btn ghost" data-act="no">${cancel}</button><button type="button" class="btn ${danger ? 'danger' : 'primary'}" data-act="yes">${ok}</button></div>`, {
      label: title, cls: 'small',
      act: { yes: (a, e, sh) => { answered = true; res(true); sh.close(); }, no: (a, e, sh) => { answered = true; res(false); sh.close(); } },
      onClose: () => { if (!answered) res(false); },
    });
  });
}

/* ---------- messages ---------- */
let toastTimer = null;
function toast(msg, o = {}) {
  const root = $('#toast-root');
  clearTimeout(toastTimer);
  if (root._done) root._done();
  root._done = o.onExpire || null;
  root.innerHTML = `<div class="toast${o.undo ? ' has-btn' : ''}"><span>${msg}</span>${o.undo ? `<button type="button" class="toast-btn">${o.undoLabel || 'Undo'}</button>` : ''}</div>`;
  if (o.undo) $('.toast-btn', root).onclick = () => { root._done = null; o.undo(); root.innerHTML = ''; };
  toastTimer = setTimeout(() => { if (root._done) { const d = root._done; root._done = null; d(); } root.innerHTML = ''; }, o.ms || (o.undo ? 6000 : 3200));
}

/* ---------- small pieces of interface ---------- */
const chip = (label, on, attrs = '') => `<button type="button" class="chip${on ? ' on' : ''}" aria-pressed="${!!on}" ${attrs}>${label}</button>`;
const seg = (name, items, val, attrs = '') => `<div class="seg" role="radiogroup" ${attrs}>${items.map(([v, l]) => `<button type="button" role="radio" aria-checked="${String(v) === String(val)}" class="${String(v) === String(val) ? 'on' : ''}" data-seg="${name}" data-v="${esc(v)}">${l}</button>`).join('')}</div>`;
const field = (label, input, hint = '') => `<label class="field"><span class="f-l">${label}</span>${input}${hint ? `<small class="f-h">${hint}</small>` : ''}</label>`;
const swatch = c => `<i class="sw" style="--c:${esc(c)}" aria-hidden="true"></i>`;
function emptyState(ico, title, text, btn = '') {
  return `<div class="empty">${icon(ico, 'big')}<h3>${title}</h3><p>${text}</p>${btn}</div>`;
}
// When a tap really happened: the event's own timestamp if it's on the page clock.
const tapTime = e => { const now = performance.now(), t = e && e.timeStamp; return t > 0 && t <= now + 5 && now - t < 1000 ? t : now; };
