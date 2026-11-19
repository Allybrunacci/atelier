/* Atelier — classes and when they happen: repeats, school terms, changes to single dates, pay and earnings */
'use strict';

// Class colours, named after paints. White text on each passes 4.5:1.
const PIGMENTS = [['Ultramarine', '#3346A8'], ['Cadmium red', '#B83A2E'], ['Sap green', '#4A7A2F'], ['Yellow ochre', '#8E650E'], ['Burnt sienna', '#A3482A'], ['Cerulean', '#1D6F9A'],
  ['Dioxazine violet', '#6A3E9E'], ['Alizarin crimson', '#9E2442'], ['Viridian', '#1A7663'], ['Raw umber', '#6B5332'], ['Payne’s grey', '#44505F'], ['Quinacridone rose', '#A8366F']];

// NSW public school terms, Eastern division (Sydney), first to last days for students.
// From education.nsw.gov.au/schooling/calendars, checked 19 November 2026.
const NSW_TERMS = [
  ['Term 4 2026', '2026-10-13', '2026-12-17'],
  ['Term 1 2027', '2027-02-03', '2027-04-09'], ['Term 2 2027', '2027-04-29', '2027-07-02'],
  ['Term 3 2027', '2027-07-20', '2027-09-24'], ['Term 4 2027', '2027-10-11', '2027-12-17'],
];

function fixRep(r, start) {
  r = Object.assign({ type: 'weekly', every: 1, days: [dow(start)], month: 'date', end: 'never', until: '', count: 10 }, r || {});
  if (!['weekly', 'monthly', 'once'].includes(r.type)) r.type = 'weekly';
  r.days = (r.days || []).filter(n => n >= 0 && n <= 6);
  if (!r.days.length) r.days = [dow(start)];
  r.every = clamp(Math.round(+r.every) || 1, 1, 8);
  r.count = clamp(Math.round(+r.count) || 10, 1, 500);
  return r;
}
function fixClass(c) {
  c.kind = c.kind === 'group' ? 'group' : 'private';
  c.start = validDate(c.start) ? c.start : today();
  c.time = validTime(c.time) ? c.time : '16:00';
  c.mins = clamp(Math.round(+c.mins) || 60, 5, 600);
  c.rep = fixRep(c.rep, c.start);
  c.past = (c.past || []).filter(v => validDate(v.from || v.start) && validDate(v.to));
  c.skip = c.skip || {};
  c.moved = c.moved || {};
  c.extra = c.extra || {};
  c.pay = Object.assign({ mode: c.kind === 'group' ? 'student' : 'flat', flat: 0, term: 0, casual: 0 }, c.pay || {});
  if (c.kind === 'private') c.pay.mode = 'flat';
  c.students = (c.students || []).map(st => Object.assign({ id: uid(), name: '', type: 'casual', rate: null, from: '', to: '' }, st));
  c.color = c.color || PIGMENTS[0][1];
  c.name = c.name || 'Class';
  c.place = c.place || '';
  c.note = c.note || '';
  return c;
}
const liveClasses = () => Object.values(S.classes).filter(c => !c.archived).sort((a, b) => a.name.localeCompare(b.name));

/* ---------- school terms ---------- */
const sortedTerms = () => S.terms.slice().sort((a, b) => a.start.localeCompare(b.start));
const termOf = d => S.terms.find(t => d >= t.start && d <= t.end) || null;
const inTerms = d => S.terms.some(t => d >= t.start && d <= t.end);
// The term running on day d, or else the next one.
function currentTerm(d = today()) {
  const ts = sortedTerms();
  return ts.find(t => d >= t.start && d <= t.end) || ts.find(t => t.start > d) || null;
}

/* ---------- repeats ---------- */
// The schedules a class has had: earlier ones kept in c.past, and the current one (in use from c.since).
function versions(c) {
  return c.past.concat([{ from: c.since || '', to: '', start: c.start, time: c.time, mins: c.mins, rep: c.rep, termsOnly: !!c.termsOnly, cur: true }]);
}
const versionAt = (c, d) => versions(c).find(v => (!v.from || d >= v.from) && (!v.to || d <= v.to)) || null;
// Does this schedule land on day d (before any one-off changes)?
function ruleHits(v, d) {
  if (d < v.start || (v.from && d < v.from) || (v.to && d > v.to)) return false;
  const r = v.rep;
  if (r.end === 'date' && validDate(r.until) && d > r.until) return false;
  if (v.termsOnly && !inTerms(d)) return false;
  if (r.type === 'once') return d === v.start;
  if (r.type === 'weekly') {
    if (!r.days.includes(dow(d))) return false;
    return Math.round(daysBetween(mondayOf(v.start), mondayOf(d)) / 7) % r.every === 0;
  }
  if (r.type === 'monthly') {
    const sd = D(v.start).getUTCDate(), dd = D(d).getUTCDate(), n = daysInMonth(d);
    if (r.month === 'date') return dd === Math.min(sd, n);
    if (dow(d) !== dow(v.start)) return false;
    if (r.month === 'last') return dd + 7 > n;
    return Math.ceil(dd / 7) === Math.min(4, Math.ceil(sd / 7));
  }
  return false;
}
// The last day a schedule can run ('' = no end). For "after N classes" it counts them (and remembers the answer).
const END_CACHE = new Map();
function seriesEnd(v) {
  const r = v.rep;
  if (r.type === 'once') return v.start;
  let end = r.end === 'date' && validDate(r.until) ? r.until : '';
  if (r.end === 'count') {
    const sig = JSON.stringify([v.from, v.to, v.start, r, v.termsOnly, v.termsOnly ? S.terms : 0]);
    if (END_CACHE.has(sig)) end = END_CACHE.get(sig);
    else {
      const probe = Object.assign({}, v, { rep: Object.assign({}, r, { end: 'never' }) });
      const want = r.count, lim = addDays(v.start, 366 * 6);
      let n = 0;
      end = lim;
      for (let d = v.from > v.start ? v.from : v.start; d <= lim; d = addDays(d, 1)) if (ruleHits(probe, d) && ++n >= want) { end = d; break; }
      END_CACHE.set(sig, end);
    }
  }
  if (v.to && (!end || v.to < end)) end = v.to;
  return end;
}
const keyOf = (cid, orig) => `${cid}@${orig}`;
function occ(c, v, orig, date, time, kind) {
  const key = keyOf(c.id, orig);
  return { key, c, orig, date, time, mins: v ? v.mins : c.mins, moved: kind === 'moved', extra: kind === 'extra', cancelled: kind === 'cancelled', s: S.sessions[key] || null };
}
// Every class between two dates (inclusive), in time order. withCancelled adds cancelled ones, flagged.
function occurrences(from, to, onlyId, withCancelled) {
  const out = [];
  for (const c of Object.values(S.classes)) {
    if (c.archived || (onlyId && c.id !== onlyId)) continue;
    for (const v of versions(c)) {
      const end = seriesEnd(v);
      let lo = from;
      if (v.start > lo) lo = v.start;
      if (v.from > lo) lo = v.from;
      const hi = end && end < to ? end : to;
      for (let d = lo; d <= hi; d = addDays(d, 1)) {
        if (!ruleHits(v, d) || c.moved[d]) continue;
        if (c.skip[d]) { if (withCancelled) out.push(occ(c, v, d, d, v.time, 'cancelled')); } else out.push(occ(c, v, d, d, v.time));
      }
    }
    for (const [o, m] of Object.entries(c.moved)) {
      if (m.date < from || m.date > to) continue;
      const v = versionAt(c, o), end = v && seriesEnd(v);
      if (!v || !ruleHits(v, o) || (end && o > end)) continue;
      if (c.skip[o]) { if (withCancelled) out.push(occ(c, v, o, m.date, m.time || v.time, 'cancelled')); } else out.push(occ(c, v, o, m.date, m.time || v.time, 'moved'));
    }
    for (const [x, t] of Object.entries(c.extra)) if (x >= from && x <= to) out.push(occ(c, null, 'x' + x, x, t || c.time, 'extra'));
  }
  return out.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time) || a.c.name.localeCompare(b.c.name));
}
function occByKey(key) {
  const i = key.lastIndexOf('@'), c = S.classes[key.slice(0, i)], orig = key.slice(i + 1);
  if (!c) return null;
  if (orig[0] === 'x') { const d = orig.slice(1); return c.extra[d] !== undefined ? occ(c, null, orig, d, c.extra[d] || c.time, 'extra') : null; }
  const v = versionAt(c, orig) || versions(c).pop(), m = c.moved[orig];
  if (c.skip[orig]) return occ(c, v, orig, m ? m.date : orig, (m && m.time) || v.time, 'cancelled');
  return m ? occ(c, v, orig, m.date, m.time || v.time, 'moved') : occ(c, v, orig, orig, v.time);
}
// The class's next session that isn't ticked off (today counts until it's ticked).
function nextOcc(c, from = today()) { return occurrences(from, addDays(from, 400), c.id).find(o => o.date > from || !(o.s && o.s.done)) || null; }
const upcoming = (c, n, from = today()) => occurrences(from, addDays(from, 400), c.id).filter(o => o.date > from || !(o.s && o.s.done)).slice(0, n);
const classCountIn = (c, from, to) => occurrences(from, to, c.id).length;

/* ---------- the record for one session (made the first time anything is saved on it) ---------- */
function sessionOf(o, create) {
  let s = S.sessions[o.key];
  if (!s && create) s = S.sessions[o.key] = { c: o.c.id, d: o.date, t: o.time, done: false, att: {}, refs: [], art: [], note: '', topic: '', tech: [], plan: null };
  if (s) { s.d = o.date; s.t = o.time; o.s = s; }
  return s;
}

/* ---------- pay ---------- */
const activeStudents = (c, d) => c.students.filter(st => (!st.from || st.from <= d) && (!st.to || st.to >= d));
// Term students are counted every class (they've paid for the term); casual students only when ticked as there.
const isHere = (s, st) => { const a = s && s.att ? s.att[st.id] : undefined; return st.type === 'term' ? a !== 0 : a === 1; };
const rateOf = (c, st) => (hasNum(st.rate) ? num(st.rate) : num(st.type === 'term' ? c.pay.term : c.pay.casual));
function payLines(c, s, d) {
  if (c.kind === 'private') return [['Private class', num(c.pay.flat)]];
  if (c.pay.mode === 'flat') return [['Class fee', num(c.pay.flat)]];
  const lines = [];
  for (const st of activeStudents(c, d)) {
    if (st.type === 'term') lines.push([`${st.name || 'Student'} · term`, rateOf(c, st), isHere(s, st) ? '' : 'away, paid for the term']);
    else if (isHere(s, st)) lines.push([`${st.name || 'Student'} · ${st.from && st.from === st.to ? 'drop-in' : 'casual'}`, rateOf(c, st)]);
  }
  return lines;
}
const round2 = n => Math.round(n * 100) / 100;
const linesTotal = lines => round2(sum(lines.map(l => l[1])));
// What a session is worth: the saved amount once ticked, otherwise worked out from the class's settings.
function payOf(o) {
  const s = o.s || S.sessions[o.key];
  if (s && hasNum(s.adj)) return num(s.adj);
  if (s && s.done && s.pay) return s.pay.total;
  return linesTotal(payLines(o.c, s, o.date));
}
function snapPay(o, s) { const lines = payLines(o.c, s, o.date); s.pay = { total: linesTotal(lines), lines }; }
function setDone(o, done) {
  const s = sessionOf(o, true);
  s.done = !!done;
  s.at = done ? Date.now() : 0;
  if (done) snapPay(o, s); else s.pay = null;
  save();
}
// Works the saved amount out again (after attendance or rates change on a ticked session).
function refreshPay(o) { const s = o.s || S.sessions[o.key]; if (s && s.done) snapPay(o, s); }
const amountOf = s => (hasNum(s.adj) ? num(s.adj) : s.pay ? s.pay.total : 0);

/* ---------- earnings ---------- */
// Ticked sessions between two dates, from every class (including ones archived or deleted since).
function doneBetween(from, to) {
  return Object.entries(S.sessions).filter(([, s]) => s.done && s.d >= from && s.d <= to)
    .map(([key, s]) => ({ key, s, c: S.classes[s.c] || null, amt: amountOf(s) }))
    .sort((a, b) => (a.s.d + (a.s.t || '')).localeCompare(b.s.d + (b.s.t || '')));
}
const earnedBetween = (from, to) => round2(sum(doneBetween(from, to).map(x => x.amt)));
function weekSummary(mon) {
  const sun = addDays(mon, 6), t = today();
  const occs = occurrences(mon, sun), done = doneBetween(mon, sun);
  const open = occs.filter(o => !(o.s && o.s.done));
  const ahead = open.filter(o => o.date >= t), missed = open.filter(o => o.date < t);
  return { mon, sun, occs, done, earned: round2(sum(done.map(x => x.amt))), ahead, aheadAmt: round2(sum(ahead.map(payOf))), missed, missedAmt: round2(sum(missed.map(payOf))) };
}
// Past classes (last 8 weeks) that haven't been ticked as taught.
const notTicked = () => occurrences(addDays(today(), -56), addDays(today(), -1)).filter(o => !(o.s && o.s.done));
// The Australian financial year (1 July to 30 June) that day d falls in.
const finYearStart = d => (+d.slice(5, 7) >= 7 ? `${d.slice(0, 4)}-07-01` : `${+d.slice(0, 4) - 1}-07-01`);
const finYearEnd = d => `${+finYearStart(d).slice(0, 4) + 1}-06-30`;
const finYearName = d => { const y = +finYearStart(d).slice(0, 4); return `${y}–${String(y + 1).slice(2)}`; };

/* ---------- words ---------- */
function repeatText(c, short) {
  const r = c.rep;
  if (r.type === 'once') return `Once, ${fmtDate(c.start, { long: !short })}`;
  let s;
  if (r.type === 'weekly') {
    const days = r.days.slice().sort((a, b) => a - b).map(i => (short ? DAY_SHORT[i] : DAY_LONG[i]));
    s = r.every === 1 ? `Every ${joinAnd(days)}` : r.every === 2 ? `Every second ${joinAnd(days)}` : `Every ${ordinal(r.every)} week on ${joinAnd(days)}`;
  } else {
    const sd = D(c.start).getUTCDate(), wd = DAY_LONG[dow(c.start)];
    s = r.month === 'date' ? `Monthly on the ${ordinal(sd)}` : r.month === 'last' ? `Monthly on the last ${wd}` : `Monthly on the ${ordinal(Math.min(4, Math.ceil(sd / 7)))} ${wd}`;
  }
  if (c.termsOnly) s += short ? ', in term' : ', school terms only';
  if (!short) {
    if (r.end === 'date' && validDate(r.until)) s += `, until ${fmtDate(r.until, { noDay: true })}`;
    if (r.end === 'count') s += `, ${plural(r.count, 'class', 'classes')} from ${fmtDate(c.since && c.since > c.start ? c.since : c.start, { noDay: true })}`;
  }
  return s;
}
function payText(c) {
  if (c.kind === 'private' || c.pay.mode === 'flat') return `${money(c.pay.flat)} a class`;
  const types = new Set(c.students.filter(st => !(st.from && st.from === st.to)).map(st => st.type)), parts = [];
  if (types.has('term') || !types.size) parts.push(`term ${money(c.pay.term)}`);
  if (types.has('casual') || !types.size) parts.push(`casual ${money(c.pay.casual)}`);
  return `${parts.join(', ')} a student`;
}
const regulars = c => c.students.filter(st => !(st.from && st.from === st.to) && (!st.to || st.to >= today()));
const kindLabel = c => (c.kind === 'group' ? `Group · ${plural(regulars(c).length, 'student')}` : `Private${c.students[0] && c.students[0].name ? ` · ${esc(c.students[0].name)}` : ''}`);
