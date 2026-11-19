/* Atelier — photos: references you might use, and photos of students' artworks. Kept on this phone. */
'use strict';

const DEFAULT_TAGS = ['Animals', 'Portraits', 'People', 'Hands', 'Landscapes', 'Seascapes', 'Flowers', 'Plants', 'Still life', 'Buildings', 'Textures', 'Light and shadow', 'Colour', 'Seasonal', 'Abstract', 'Kids'];
const PHO = { kind: 'ref', q: '', tag: '' };
const usedSomewhere = id => photoUses(id).length > 0;

VIEWS.photos = {
  title: 'Photos',
  head() {
    const n = Object.keys(S.photos).length;
    return { title: 'Photos', sub: n ? `${plural(n, 'photo')}, kept on this phone` : '', actions: `<div class="vh-act"><button type="button" class="icon-btn" data-act="add" aria-label="Add photos">${icon('plus')}</button></div>` };
  },
  render() {
    const refs = photoIds('ref').length, arts = photoIds('art').length;
    if (!refs && !arts) {
      return emptyState('image', 'Save ideas for later', 'Add photos you might use as references: animals, faces, landscapes, textures. Photos of students’ artworks are kept here too.', `<button type="button" class="btn primary big" data-act="add">${icon('camera')} Add photos</button>`)
        + `<p class="fine" style="text-align:center">${icon('info', 'sm')} Photos are shrunk to save space and stay on this phone. Include them in your backups from Settings.</p>`;
    }
    const tags = allTags(PHO.kind);
    if (PHO.tag && PHO.tag !== '·unused' && !tags.includes(PHO.tag)) PHO.tag = '';
    return `${seg('pkind', [['ref', `References (${refs})`], ['art', `Artworks (${arts})`]], PHO.kind)}
      <div class="search" style="margin-top:12px">${icon('search')}<input type="search" id="pq" value="${esc(PHO.q)}" placeholder="Search titles, tags and notes" aria-label="Search photos"></div>
      <div class="chips scroll">${chip('All', !PHO.tag, 'data-act="tag" data-t=""')}${PHO.kind === 'ref' ? chip('Not used yet', PHO.tag === '·unused', 'data-act="tag" data-t="·unused"') : ''}${tags.map(t => chip(esc(t), PHO.tag === t, `data-act="tag" data-t="${esc(t)}"`)).join('')}</div>
      <div id="pg" style="margin-top:8px">${photoGrid()}</div>
      <button type="button" class="fab" data-act="add">${icon('camera')} Add photos</button>`;
  },
  act: {
    add: async () => { const ids = await importPhotos({ kind: PHO.kind }); if (ids.length) { render(); tagNew(ids); } },
    tag: a => { PHO.tag = a.dataset.t; render(); },
  },
  after(view) {
    const segClick = e => { const b = e.target.closest('[data-seg="pkind"]'); if (b) { PHO.kind = b.dataset.v; PHO.tag = ''; render(); } };
    const q = e => { if (e.target.id === 'pq') { PHO.q = e.target.value; const g = $('#pg', view); g.innerHTML = photoGrid(); hydrate(g); } };
    view.addEventListener('click', segClick);
    view.addEventListener('input', q);
    return () => { view.removeEventListener('click', segClick); view.removeEventListener('input', q); };
  },
};
function photoGrid() {
  const ids = photoIds(PHO.kind).filter(id => (PHO.tag === '·unused' ? !usedSomewhere(id) && matchPhoto(S.photos[id], PHO.q, '') : matchPhoto(S.photos[id], PHO.q, PHO.tag)));
  if (!ids.length) return '<p class="fine">No photos match.</p>';
  return `<div class="pgrid">${ids.map(id => { const p = S.photos[id], cls = p.cls && S.classes[p.cls]; return photoTile(id, { href: `#/photo/${id}`, cap: p.title || (PHO.kind === 'art' && cls ? `${cls.name}${p.d ? `, ${fmtDate(p.d, { noDay: true })}` : ''}` : '') }); }).join('')}</div>`;
}
// Title and tags for photos just added.
function tagNew(ids) {
  const tags = new Set();
  let title = '', extra = '';
  const tpl = () => {
    const pool = [...new Set(allTags('').concat(DEFAULT_TAGS, [...tags]))].sort((a, b) => a.localeCompare(b));
    return framed(sheetHead(ids.length > 1 ? `Tag ${ids.length} new photos` : 'Tag your new photo', 'So you can find them again. You can skip this.'),
      `<div class="thumbs" style="margin-bottom:16px">${ids.slice(0, 8).map(id => `<div class="thumb">${phImg(id)}</div>`).join('')}</div>
      ${ids.length === 1 ? `<label class="field"><span class="f-l">Title</span><input name="title" value="${esc(title)}" placeholder="e.g. Kookaburra on a branch" autocomplete="off"></label>` : ''}
      <div class="g-l">Tags</div><div class="chips">${pool.map(t => chip(esc(t), tags.has(t), `data-act="t" data-t="${esc(t)}"`)).join('')}</div>
      <div class="row" style="margin-top:12px"><input class="inp grow" name="newtag" value="${esc(extra)}" placeholder="New tag" aria-label="New tag" autocomplete="off"><button type="button" class="btn" data-act="addtag">Add</button></div>`,
      '<button type="button" class="btn" data-close>Skip</button><button type="button" class="btn primary" data-act="ok">Save</button>');
  };
  const sh = openSheet(tpl(), {
    label: 'Tag new photos',
    act: {
      t: a => { const t = a.dataset.t; if (tags.has(t)) tags.delete(t); else tags.add(t); sh.set(tpl()); },
      addtag: () => { const t = cap(extra.trim()); if (t) { tags.add(t); extra = ''; sh.set(tpl()); } },
      ok: () => { ids.forEach(id => { const p = S.photos[id]; if (!p) return; p.tags = [...new Set((p.tags || []).concat([...tags]))]; if (ids.length === 1 && title.trim()) p.title = title.trim(); }); save(); sh.close(); render(); },
    },
    input: e => { if (e.target.name === 'title') title = e.target.value; if (e.target.name === 'newtag') extra = e.target.value; },
  });
  sh.el.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.name === 'newtag') { e.preventDefault(); $('[data-act=addtag]', sh.el).click(); } });
}

/* ---------- one photo ---------- */
VIEWS.photo = {
  tab: 'photos', title: 'Photo',
  head(id) {
    const p = S.photos[id];
    if (!p) return { back: '#/photos', title: 'Photo not found' };
    return { back: '#/photos', kicker: (p.kind || 'ref') === 'art' ? 'Artwork' : 'Reference', title: esc(p.title || 'Untitled'), actions: `<div class="vh-act"><button type="button" class="icon-btn" data-act="share" aria-label="Share photo">${icon('share')}</button><button type="button" class="icon-btn" data-act="del" aria-label="Delete photo">${icon('trash')}</button></div>` };
  },
  render(id) {
    const p = S.photos[id];
    if (!p) return emptyState('image', 'This photo has been deleted', '', '<a class="btn" href="#/photos">Back to photos</a>');
    const uses = photoUses(id), pool = [...new Set(allTags('').concat(DEFAULT_TAGS, p.tags || []))].sort((a, b) => a.localeCompare(b));
    const cls = p.cls && S.classes[p.cls];
    let h = `<div class="viewer">${phImg(id, 'f')}</div>
      <label class="field"><span class="f-l">Title</span><input id="ptitle" value="${esc(p.title || '')}" placeholder="Untitled" autocomplete="off"></label>
      <div class="field"><span class="f-l">Kind</span>${seg('pk', [['ref', 'Reference'], ['art', 'Student artwork']], p.kind || 'ref')}</div>
      <div class="g-l">Tags</div><div class="chips">${pool.map(t => chip(esc(t), (p.tags || []).includes(t), `data-act="tg" data-t="${esc(t)}"`)).join('')}</div>
      <div class="row" style="margin:12px 0 16px"><input class="inp grow" id="pnewtag" placeholder="New tag" aria-label="New tag" autocomplete="off"><button type="button" class="btn" data-act="addtag">Add</button></div>
      <label class="field"><span class="f-l">Notes</span><textarea id="pnote" class="inp" placeholder="Where it’s from, ideas for using it…">${esc(p.note || '')}</textarea></label>
      <p class="fine">Added ${fmtDate(p.added || today(), { long: true })} · ${p.w && p.h ? `${p.w} × ${p.h}` : ''} · ${p.kb || '?'} KB${cls ? ` · ${esc(cls.name)}${p.d ? `, ${fmtDate(p.d)}` : ''}` : ''}</p>`;
    h += `<div class="sec"><h2>Used with</h2></div>${uses.length ? `<div class="list">${uses.map(u => `<button type="button" class="lrow" data-act="open" data-key="${esc(u.key)}"><span class="sw" style="--c:${u.c ? u.c.color : 'var(--line-2)'}"></span><span class="t"><b>${u.c ? esc(u.c.name) : 'Deleted class'}</b><small>${fmtDate(u.s.d, { long: true })} · as ${u.how === 'artwork' ? 'an artwork' : 'a reference'}</small></span>${icon('chev-r', 'go')}</button>`).join('')}</div>` : '<p class="fine">Not used with a class yet.</p>'}
      <div class="btn-row"><button type="button" class="btn soft" data-act="use">${icon('plus')} Use with a class</button></div>`;
    return h;
  },
  act: {
    open: a => openSession(a.dataset.key),
    tg: a => { const p = S.photos[UI.param], t = a.dataset.t; p.tags = p.tags || []; if (p.tags.includes(t)) p.tags = p.tags.filter(x => x !== t); else p.tags.push(t); save(); render(); },
    addtag: () => { const i = $('#pnewtag'), t = cap((i.value || '').trim()), p = S.photos[UI.param]; if (!t) { i.focus(); return; } p.tags = [...new Set((p.tags || []).concat(t))]; save(); render(); },
    use: () => {
      const id = UI.param;
      pickSession({
        title: 'Use as a reference for…', onPick: o => {
          const before = refUses(o.c.id, id, o.key), s = sessionOf(o, true);
          if (!s.refs.includes(id)) s.refs.push(id);
          save();
          render();
          toast(before.length ? `${icon('warn')} Added. You used this with ${esc(o.c.name)} on ${fmtDate(before[before.length - 1])} too.` : `${icon('check')} Added to ${esc(o.c.name)}, ${fmtDate(o.date)}`, { ms: 5000 });
        },
      });
    },
    share: async () => {
      const id = UI.param, b = await imgGet(id + ':f').catch(() => null);
      if (!b) { toast('Couldn’t open the photo'); return; }
      const r = await shareFile(b, `${(S.photos[id].title || 'photo').replace(/[^\w\- ]+/g, '').trim() || 'photo'}.jpg`, S.photos[id].title || 'Photo');
      if (r === 'downloaded') toast(`${icon('download')} Saved to your downloads`);
    },
    del: () => { const id = UI.param, n = photoUses(id).length; go('#/photos'); deletePhoto(id, null, n ? `Photo deleted (it was used in ${plural(n, 'class', 'classes')})` : ''); },
  },
  after(view, id) {
    let t = 0;
    const later = () => { clearTimeout(t); t = setTimeout(save, 400); };
    const inp = e => { const p = S.photos[id]; if (!p) return; if (e.target.id === 'ptitle') { p.title = e.target.value; later(); } if (e.target.id === 'pnote') { p.note = e.target.value; later(); } };
    const segClick = e => { const b = e.target.closest('[data-seg="pk"]'); if (b) { S.photos[id].kind = b.dataset.v; save(); render(); } };
    const key = e => { if (e.key === 'Enter' && e.target.id === 'pnewtag') { e.preventDefault(); VIEWS.photo.act.addtag(); } };
    view.addEventListener('input', inp);
    view.addEventListener('click', segClick);
    view.addEventListener('keydown', key);
    return () => { clearTimeout(t); save(); view.removeEventListener('input', inp); view.removeEventListener('click', segClick); view.removeEventListener('keydown', key); };
  },
};
