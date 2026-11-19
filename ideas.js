/* Atelier — ideas: the hub, the techniques library, art therapy activities and a lesson-idea generator */
'use strict';

const SUBJECTS = ['a piece of fruit', 'a crumpled paper bag', 'your own hand', 'a pot plant', 'a shell', 'an old shoe', 'a set of keys', 'a teacup', 'a feather', 'a pine cone', 'a toy animal', 'a glass jar', 'a banana skin', 'a leaf, very large',
  'a reference photo of an animal', 'a portrait reference photo', 'a landscape reference photo', 'the view from a window', 'a stack of books', 'a folded tea towel', 'a capsicum cut in half', 'a spoon (and the reflection in it)', 'a kitchen whisk', 'a backpack'];
const IDEA = { n: 0 };
function lessonIdea() {
  const r = rng(`${today()}#${IDEA.n}`), pool = TECH.filter(t => ['shade', 'media', 'found', 'colour'].includes(t.s));
  return { t: pool[Math.floor(r() * pool.length)], subj: SUBJECTS[Math.floor(r() * SUBJECTS.length)], warm: WARMUPS[Math.floor(r() * WARMUPS.length)] };
}
const techHref = id => (id.startsWith('a:') ? `#/activity/${id.slice(2)}` : `#/technique/${id}`);
const isFav = k => !!S.favs[k];
const favBtn = k => `<button type="button" class="icon-btn${isFav(k) ? ' on' : ''}" data-act="fav" data-k="${k}" aria-pressed="${isFav(k)}" aria-label="${isFav(k) ? 'Remove from favourites' : 'Add to favourites'}">${icon(isFav(k) ? 'star-fill' : 'star')}</button>`;
const toggleFav = k => { if (S.favs[k]) delete S.favs[k]; else S.favs[k] = Date.now(); save(); render(); toast(S.favs[k] ? `${icon('star-fill')} Added to favourites` : 'Removed from favourites'); };
// Adds a technique ('id') or activity ('a:id') to a class session.
function addToClass(id) {
  const name = techName(id);
  pickSession({
    title: `Add “${esc(name)}” to…`, onPick: o => {
      const s = sessionOf(o, true);
      s.tech = s.tech || [];
      if (!s.tech.includes(id)) s.tech.push(id);
      if (!s.topic) s.topic = name;
      save();
      toast(`${icon('check')} Added to ${esc(o.c.name)}, ${fmtDate(o.date)}`, { undo: () => { s.tech = s.tech.filter(x => x !== id); if (s.topic === name) s.topic = ''; save(); render(); } });
    },
  });
}

/* ---------- the hub ---------- */
VIEWS.ideas = {
  title: 'Ideas',
  head() { return { deco: true, title: 'Ideas', sub: 'Term plans, techniques and lesson ideas', actions: `<div class="vh-act"><a class="icon-btn" href="#/settings" aria-label="Settings">${icon('cog')}</a></div>` }; },
  render() {
    const plans = Object.values(S.plans).sort((a, b) => b.at - a.at), favs = Object.keys(S.favs).sort((a, b) => S.favs[b] - S.favs[a]);
    const idea = lessonIdea();
    let h = `<div class="hub">
      <a class="card hub-card tint-sky" href="#/plan"><span class="hub-ico art" aria-hidden="true">${themeArt('programs')}</span><span class="t"><h3>Plan a term</h3><p>Week-by-week lesson plans with timings for your class, in three styles to choose from.</p></span>${icon('chev-r', 'go')}</a>
      <a class="card hub-card tint-peach" href="#/techniques"><span class="hub-ico art" aria-hidden="true">${motifArt('paint', 'techniques')}</span><span class="t"><h3>Techniques</h3><p>${TECH.length} skills, methods and techniques, explained step by step with illustrations.</p></span>${icon('chev-r', 'go')}</a>
      <a class="card hub-card tint-pink" href="#/therapy"><span class="hub-ico art" aria-hidden="true">${themeArt('feel')}</span><span class="t"><h3>Art therapy</h3><p>${THERAPY.length} wellbeing activities, plus calming tools, prompts, programs and guides, in their own tab.</p></span>${icon('chev-r', 'go')}</a></div>`;
    h += `<div class="sec"><h2>Lesson idea</h2><button type="button" class="btn sm ghost" data-act="shuffle">${icon('shuffle', 'sm')} Another</button></div>
      <div class="card"><div class="row" style="align-items:flex-start"><figure class="illus mini" style="margin:0">${illus(idea.t.ill)}</figure><div class="grow"><p class="kicker" style="margin:0">Draw ${esc(idea.subj)} using</p><h3 style="margin:2px 0 4px"><a class="h-link" href="#/technique/${idea.t.id}">${esc(idea.t.n)}</a></h3><p class="fine" style="margin:0">Warm-up: ${esc(idea.warm[0])}</p></div></div>
      <div class="btn-row"><button type="button" class="btn soft sm" data-act="useidea">${icon('plus', 'sm')} Use for a class</button></div></div>`;
    if (plans.length) h += `<div class="sec"><h2>Saved plans</h2></div><div class="list">${plans.map(p => `<a class="lrow" href="#/plan/${p.id}"><span class="t"><b>${esc(p.name)}</b><small>${plural(p.weeks.length, 'week')} · ${esc(p.opt)}${p.cid && S.classes[p.cid] ? ` · ${esc(S.classes[p.cid].name)}` : ''}</small></span>${icon('chev-r', 'go')}</a>`).join('')}</div>`;
    if (favs.filter(k => k.startsWith('t:')).length) h += `<div class="sec"><h2>Favourite techniques</h2></div><div class="list">${favs.filter(k => k.startsWith('t:')).map(k => { const x = TECH_BY[k.slice(2)]; return x ? `<a class="lrow" href="#/technique/${x.id}">${icon('brush')}<span class="t"><b>${esc(x.n)}</b><small>${esc(x.sum)}</small></span>${icon('chev-r', 'go')}</a>` : ''; }).join('')}</div>`;
    return h;
  },
  act: {
    shuffle: () => { IDEA.n++; render(); },
    useidea: () => {
      const idea = lessonIdea();
      pickSession({
        title: 'Use this idea for…', onPick: o => {
          const s = sessionOf(o, true);
          s.tech = s.tech || [];
          if (!s.tech.includes(idea.t.id)) s.tech.push(idea.t.id);
          s.topic = s.topic || `${cap(idea.subj)} in ${idea.t.n.toLowerCase()}`;
          if (!s.note) s.note = `Warm-up: ${idea.warm[0]}. ${idea.warm[1]}`;
          save();
          toast(`${icon('check')} Added to ${esc(o.c.name)}, ${fmtDate(o.date)}`);
        },
      });
    },
  },
};

/* ---------- techniques ---------- */
const TQ = { q: '' };
VIEWS.techniques = {
  tab: 'ideas', title: 'Techniques',
  head() { return { back: '#/ideas', title: 'Techniques', sub: `${TECH.length} skills, methods and techniques` }; },
  render() {
    return `<div class="search">${icon('search')}<input type="search" id="tq" value="${esc(TQ.q)}" placeholder="Search, e.g. shading, watercolour, eyes" aria-label="Search techniques"></div>
      <div class="chips scroll">${SECTIONS.map(s => chip(s.n, false, `data-act="jump" data-s="${s.id}"`)).join('')}</div><div id="tl">${techList()}</div>`;
  },
  act: { jump: a => { const el = $(`#sec-${a.dataset.s}`); if (el) el.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' }); } },
  after(view) {
    const f = e => { if (e.target.id === 'tq') { TQ.q = e.target.value; const l = $('#tl', view); l.innerHTML = techList(); } };
    view.addEventListener('input', f);
    return () => view.removeEventListener('input', f);
  },
};
function techList() {
  const q = TQ.q.trim().toLowerCase();
  const hit = t => !q || `${t.n} ${t.sum} ${t.what} ${(t.mat || []).join(' ')}`.toLowerCase().includes(q);
  const out = SECTIONS.map(s => {
    const ts = TECH.filter(t => t.s === s.id && hit(t));
    return ts.length ? `<div class="sec" id="sec-${s.id}" style="scroll-margin-top:16px"><h2>${s.n}</h2></div><p class="sec-intro">${esc(s.d)}</p>${ts.map(t => `<a class="card tcard" href="#/technique/${t.id}"><figure class="illus mini" style="margin:0">${illus(t.ill)}</figure><span class="t"><b>${esc(t.n)}${isFav('t:' + t.id) ? ` ${icon('star-fill', 'sm')}` : ''}</b><small>${esc(t.sum)}</small><small>${LEVELS[t.lvl]} ${lvlDots(t.lvl)}</small></span></a>`).join('')}` : '';
  }).join('');
  return out || '<p class="fine">Nothing matches. Try another word.</p>';
}
VIEWS.technique = {
  tab: 'ideas', title: 'Technique',
  head(id) {
    const t = TECH_BY[id];
    if (!t) return { back: '#/techniques', title: 'Not found' };
    return { back: '#/techniques', kicker: SECTIONS.find(s => s.id === t.s).n, title: esc(t.n), actions: `<div class="vh-act">${favBtn('t:' + id)}</div>` };
  },
  render(id) {
    const t = TECH_BY[id];
    if (!t) return emptyState('warn', 'Technique not found', '', '<a class="btn" href="#/techniques">All techniques</a>');
    const sib = TECH.filter(x => x.s === t.s), i = sib.indexOf(t), prev = sib[i - 1], next = sib[i + 1];
    const list = (arr, tag = 'ul') => `<${tag}>${arr.map(x => `<li>${esc(x)}</li>`).join('')}</${tag}>`;
    return `<figure class="illus" style="margin:0">${illus(t.ill, true)}${t.cap ? `<figcaption>${esc(t.cap)}</figcaption>` : ''}</figure>
      <div class="meta-chips"><span class="pill">${LEVELS[t.lvl]} ${lvlDots(t.lvl)}</span><span class="pill">${icon('clock', 'sm')} ${fmtMins(t.mins)} to practise</span></div>
      <div class="doc"><p class="lead" style="margin-top:12px">${esc(t.what)}</p>
      <h3>Why it matters</h3><p>${esc(t.why)}</p>
      <h3>How to do it</h3>${list(t.steps, 'ol')}
      <h3>Tips</h3>${list(t.tips)}
      <h3>Common mistakes</h3>${list(t.mistakes)}
      <h3>Try this</h3><div class="callout">${icon('target')}<p>${esc(t.ex)}</p></div>
      <h3>Teaching it</h3><div class="two-col"><div class="card flat"><p class="kicker">Children</p><p style="margin:0">${esc(t.kids)}</p></div><div class="card flat"><p class="kicker">Teens and adults</p><p style="margin:0">${esc(t.adults)}</p></div></div>
      <h3>You’ll need</h3>${list(t.mat)}
      ${(t.rel || []).length ? `<h3>Related</h3><div class="chips">${t.rel.filter(r => TECH_BY[r]).map(r => `<a class="chip" href="#/technique/${r}">${esc(TECH_BY[r].n)}</a>`).join('')}</div>` : ''}</div>
      <div class="btn-row" style="margin-top:24px"><button type="button" class="btn primary" data-act="add">${icon('plus')} Add to a class</button>${focusFor(t.id) ? `<a class="btn soft" href="#/plan/focus/${focusFor(t.id)}">${icon('plan')} Plan a term with it</a>` : ''}</div>
      <div class="btn-row" style="justify-content:space-between">${prev ? `<a class="btn ghost" href="#/technique/${prev.id}">${icon('chev-l')} ${esc(prev.n)}</a>` : '<span></span>'}${next ? `<a class="btn ghost" href="#/technique/${next.id}">${esc(next.n)} ${icon('chev-r')}</a>` : ''}</div>`;
  },
  act: { fav: a => toggleFav(a.dataset.k), add: () => addToClass(UI.param) },
};
