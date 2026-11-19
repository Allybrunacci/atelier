/* Atelier — today: this week's earnings, today's classes, anything not ticked yet, and what's coming up */
'use strict';

const dayPick = (arr, salt) => arr[Math.floor(rng(today() + salt)() * arr.length)];
VIEWS.today = {
  title: 'Today',
  head() {
    const h = new Date().getHours(), g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    return { kicker: fmtDate(today(), { long: true }), title: `${g}${S.name ? `, ${esc(S.name)}` : ''}`, actions: `<div class="vh-act"><a class="icon-btn" href="#/settings" aria-label="Settings">${icon('cog')}</a></div>` };
  },
  render() {
    const t = today(), cls = liveClasses();
    if (!cls.length && !Object.keys(S.sessions).length) return welcome();
    const mon = mondayOf(t), wk = weekSummary(mon), all = wk.earned + wk.aheadAmt + wk.missedAmt;
    let h = `<a class="wk" href="#/earnings/${mon}" aria-label="This week: ${money(wk.earned)} earned. Open earnings.">${icon('chev-r', 'go')}
      <span class="wk-l">This week · ${fmtWeek(mon)}</span><div class="wk-n">${money(wk.earned)}</div>
      <div class="wk-bar"><i style="width:${all ? Math.round((wk.earned / all) * 100) : 0}%"></i></div>
      <div class="wk-s"><span>${wk.done.length} of ${plural(wk.occs.length, 'class', 'classes')} taught</span><span>${wk.aheadAmt ? `${money(wk.aheadAmt)} to come` : wk.occs.length ? 'All done' : ''}</span></div></a>`;

    const missed = notTicked();
    if (missed.length) {
      h += `<div class="sec"><h2>Not ticked yet</h2>${missed.length > 4 ? `<a class="link" href="#/earnings/${mondayOf(missed[0].date)}">See all ${missed.length}</a>` : ''}</div><p class="fine" style="margin-top:-6px">Tick the classes you taught so they’re added to your earnings.</p>${missed.slice(-4).reverse().map(o => sessRow(o, { date: true })).join('')}`;
    }

    const todays = occurrences(t, t, null, true);
    h += `<div class="sec"><h2>Today</h2><a class="link" href="#/calendar/${t}">Calendar</a></div>`;
    if (todays.length) h += todays.map(o => sessRow(o)).join('');
    else {
      const nx = occurrences(addDays(t, 1), addDays(t, 60))[0];
      h += `<div class="card flat"><p style="margin:0">No classes today.${nx ? ` Next: <b>${esc(nx.c.name)}</b>, ${relDay(nx.date).toLowerCase() === 'tomorrow' ? 'tomorrow' : fmtDate(nx.date, { long: true })} at ${fmtTime(nx.time)}.` : ''}</p></div>`;
    }
    const soon = occurrences(addDays(t, 1), addDays(t, 6));
    if (soon.length) h += `<div class="sec"><h2>Coming up</h2></div>${dayGroups(soon.slice(0, 8))}`;

    const lastBk = S.prefs.backupAt || 0, stuff = Object.keys(S.photos).length + Object.keys(S.sessions).length;
    if (stuff >= 5 && Date.now() - lastBk > 30 * 864e5) h += `<div class="callout warn" style="margin-top:24px">${icon('download')}<div><p><b>${lastBk ? 'It’s been a while since your last backup.' : 'Make a backup.'}</b> Everything is kept on this phone only, so a backup protects your classes and photos if the phone is lost or replaced.</p><a class="btn sm" href="#/settings">Back up in Settings</a></div></div>`;

    const tech = dayPick(TECH, 'tech'), act = dayPick(THERAPY, 'calm');
    h += `<div class="sec"><h2>Ideas for today</h2><a class="link" href="#/ideas">More ideas</a></div>
      <a class="card tcard" href="#/technique/${tech.id}"><figure class="illus mini" style="margin:0">${illus(tech.ill)}</figure><span class="t"><small>Technique</small><b>${esc(tech.n)}</b><small>${esc(tech.sum)}</small></span></a>
      <a class="card tcard" href="#/activity/${act.id}"><span class="hub-ico s">${icon('heart')}</span><span class="t"><small>Art therapy activity</small><b>${esc(act.n)}</b><small>${esc(act.sum)}</small></span></a>`;

    const recent = photoIds('ref').slice(0, 6);
    if (recent.length) h += `<div class="sec"><h2>Recent photos</h2><a class="link" href="#/photos">All photos</a></div><div class="thumbs">${recent.map(id => photoTile(id, { href: `#/photo/${id}`, cap: '' })).join('')}</div>`;
    return h;
  },
  act: Object.assign({}, SESS_ACTS, { add: () => openClassEditor(null, { open: true }), nsw: () => { addNswTerms(); render(); } }),
};
function welcome() {
  return `<div class="card"><h3>Welcome to Atelier</h3><p class="lead">Your art classes, references, student artworks and pay, all in one place, kept on this phone.</p>
    <ol class="doc" style="padding-left:22px;margin:0 0 4px">
      <li><b>Add your classes</b> once, with how often they repeat. Private or group, with each student as term-paid or casual.</li>
      <li><b>Tick each class</b> after you teach it. Atelier adds up your week, Monday to Sunday.</li>
      <li><b>Add reference photos</b> you might use, then attach them, and photos of the artworks, to each class.</li>
    </ol>
    <button type="button" class="btn primary big block" data-act="add" style="margin-top:12px">${icon('plus')} Add your first class</button></div>
    ${S.terms.length ? '' : `<div class="card"><h3>School terms</h3><p>If some classes only run in school terms, add the term dates so the holidays are skipped.</p><div class="btn-row" style="margin-top:0"><button type="button" class="btn soft" data-act="nsw">${icon('school')} Add NSW school terms</button><a class="btn ghost" href="#/settings">Enter my own</a></div></div>`}
    <div class="card"><h3>Ideas</h3><p>Plan a whole term of lessons, browse ${TECH.length} techniques with illustrations, or find an art therapy activity.</p><a class="btn soft" href="#/ideas">${icon('bulb')} Explore ideas</a></div>
    <p class="fine" style="margin-top:16px">${icon('info', 'sm')} On iPhone, open this page in Safari, tap Share, then <b>Add to Home Screen</b> so it opens like an app and your photos stay safe.</p>`;
}
