/* Atelier — photos, kept in this phone's own database (IndexedDB) and resized to save space; backups as a ZIP */
'use strict';

const PH = { db: null, urls: new Map(), ok: true };
function phDb() {
  if (!PH.db) {
    PH.db = new Promise((res, rej) => {
      let r;
      try { r = indexedDB.open('atelier-photos', 1); } catch (e) { rej(e); return; }
      r.onupgradeneeded = () => r.result.createObjectStore('img');
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
      r.onblocked = () => rej(new Error('blocked'));
    }).catch(e => { PH.ok = false; PH.db = null; throw e; });
  }
  return PH.db;
}
// Stored as { type, buf } (an ArrayBuffer), which every phone browser keeps reliably.
async function imgPut(key, blob) {
  const rec = { type: blob.type || 'image/jpeg', buf: await blob.arrayBuffer() };
  const db = await phDb();
  return new Promise((res, rej) => { const tx = db.transaction('img', 'readwrite'); tx.objectStore('img').put(rec, key); tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); tx.onabort = () => rej(tx.error); });
}
async function imgGet(key) {
  const db = await phDb();
  const rec = await new Promise((res, rej) => { const q = db.transaction('img').objectStore('img').get(key); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); });
  return rec ? new Blob([rec.buf], { type: rec.type }) : null;
}
async function imgDel(keys) {
  const db = await phDb();
  return new Promise((res, rej) => { const tx = db.transaction('img', 'readwrite'); const st = tx.objectStore('img'); keys.forEach(k => st.delete(k)); tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); });
}
async function imgKeys() {
  const db = await phDb();
  return new Promise((res, rej) => { const q = db.transaction('img').objectStore('img').getAllKeys(); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); });
}
async function imgClear() {
  const db = await phDb();
  return new Promise((res, rej) => { const tx = db.transaction('img', 'readwrite'); tx.objectStore('img').clear(); tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); });
}

/* ---------- adding a photo ---------- */
function decodeImage(file) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => { res(img); setTimeout(() => URL.revokeObjectURL(url), 2000); };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('That file isn’t a picture this phone can open.')); };
    img.src = url;
  });
}
function scaleTo(img, max, q) {
  const w0 = img.naturalWidth || img.width, h0 = img.naturalHeight || img.height, k = Math.min(1, max / Math.max(w0, h0));
  const w = Math.max(1, Math.round(w0 * k)), h = Math.max(1, Math.round(h0 * k));
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const g = cv.getContext('2d');
  g.fillStyle = '#fff';
  g.fillRect(0, 0, w, h);
  g.imageSmoothingQuality = 'high';
  g.drawImage(img, 0, 0, w, h);
  return new Promise((res, rej) => cv.toBlob(b => (b ? res({ blob: b, w, h }) : rej(new Error('Couldn’t shrink the photo.'))), 'image/jpeg', q));
}
// Keeps a 1600-pixel copy and a small thumbnail. Returns the new photo's id.
async function addPhotoFile(file, meta = {}) {
  const img = await decodeImage(file);
  const full = await scaleTo(img, 1600, 0.84), th = await scaleTo(img, 420, 0.8);
  const id = uid();
  await imgPut(id + ':f', full.blob);
  await imgPut(id + ':t', th.blob);
  S.photos[id] = Object.assign({ id, at: Date.now(), added: today(), title: '', tags: [], note: '', w: full.w, h: full.h, kb: Math.round((full.blob.size + th.blob.size) / 1024) }, meta);
  save();
  return id;
}
async function addPhotoFiles(files, meta = {}, onEach) {
  const ids = [], fails = [];
  for (const f of files) {
    try { ids.push(await addPhotoFile(f, Object.assign({}, meta, { tags: (meta.tags || []).slice() }))); } catch (e) { fails.push(f.name || 'photo'); }
    if (onEach) onEach(ids.length + fails.length, files.length);
  }
  if (fails.length) toast(`${icon('warn')} ${plural(fails.length, 'file')} couldn’t be added: ${esc(fails.slice(0, 3).join(', '))}. Try saving it as a JPEG first.`, { ms: 7000 });
  return ids;
}
// A file picker for photos (on iPhone: Photo Library, Take Photo or Choose File).
function pickFiles(multiple = true) {
  return new Promise(res => {
    const inp = document.createElement('input');
    let done = false;
    const fin = files => { if (done) return; done = true; res(files); inp.remove(); };
    inp.type = 'file';
    inp.accept = 'image/*';
    inp.multiple = multiple;
    inp.style.display = 'none';
    inp.onchange = () => fin([...inp.files]);
    inp.addEventListener('cancel', () => fin([]));
    document.body.append(inp);
    inp.click();
  });
}

/* ---------- showing photos ---------- */
async function photoUrl(id, v = 't') {
  const k = `${id}:${v}`;
  if (PH.urls.has(k)) return PH.urls.get(k);
  let u = '';
  try { const b = await imgGet(k); if (b) u = URL.createObjectURL(b); } catch (e) { /* missing */ }
  if (u) PH.urls.set(k, u);
  return u;
}
const phImg = (id, v = 't', cls = '') => `<img class="ph-img${cls ? ' ' + cls : ''}" data-ph="${esc(id)}" data-v="${v}" alt="${esc((S.photos[id] && S.photos[id].title) || 'Photo')}" decoding="async">`;
// Fills in any <img data-ph> inside root.
function hydrate(root) {
  if (!root) return;
  $$('img[data-ph]', root).forEach(async img => {
    if (img.dataset.filled) return;
    img.dataset.filled = '1';
    const u = await photoUrl(img.dataset.ph, img.dataset.v || 't');
    if (u) img.src = u; else img.classList.add('missing');
  });
}
function forgetUrls(id) { for (const v of ['t', 'f']) { const k = `${id}:${v}`; if (PH.urls.has(k)) { URL.revokeObjectURL(PH.urls.get(k)); PH.urls.delete(k); } } }
// Removes a photo, with a few seconds to undo before the picture itself is deleted.
function deletePhoto(id, after, msg) {
  const meta = S.photos[id];
  if (!meta) return;
  delete S.photos[id];
  save();
  if (after) after();
  toast(`${icon('trash')} ${msg || 'Photo deleted'}`, {
    undo: () => { S.photos[id] = meta; save(); render(); if (after) after(); },
    onExpire: () => { if (!S.photos[id]) { forgetUrls(id); imgDel([id + ':f', id + ':t']).catch(() => {}); } },
  });
}
// Where a photo has been used: [{ key, s, c, how: 'reference'|'artwork' }]
function photoUses(id) {
  const out = [];
  for (const [key, s] of Object.entries(S.sessions)) {
    if ((s.refs || []).includes(id)) out.push({ key, s, c: S.classes[s.c], how: 'reference' });
    if ((s.art || []).some(a => a.photo === id)) out.push({ key, s, c: S.classes[s.c], how: 'artwork' });
  }
  return out.sort((a, b) => b.s.d.localeCompare(a.s.d));
}

/* ---------- ZIP files (stored, not compressed: photos are already compressed) ---------- */
const CRC_T = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(u8) { let c = 0xffffffff; for (let i = 0; i < u8.length; i++) c = CRC_T[(c ^ u8[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function makeZip(files) {
  const enc = new TextEncoder(), parts = [], central = [];
  const dt = new Date(), time = ((dt.getHours() << 11) | (dt.getMinutes() << 5) | (dt.getSeconds() >> 1)) & 0xffff, date = (((dt.getFullYear() - 1980) << 9) | ((dt.getMonth() + 1) << 5) | dt.getDate()) & 0xffff;
  let off = 0, cdSize = 0;
  for (const f of files) {
    const name = enc.encode(f.name), crc = crc32(f.data), size = f.data.length;
    const lh = new DataView(new ArrayBuffer(30));
    lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true); lh.setUint16(10, time, true); lh.setUint16(12, date, true);
    lh.setUint32(14, crc, true); lh.setUint32(18, size, true); lh.setUint32(22, size, true); lh.setUint16(26, name.length, true);
    parts.push(lh.buffer, name, f.data);
    const ch = new DataView(new ArrayBuffer(46));
    ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true); ch.setUint16(8, 0x0800, true); ch.setUint16(12, time, true); ch.setUint16(14, date, true);
    ch.setUint32(16, crc, true); ch.setUint32(20, size, true); ch.setUint32(24, size, true); ch.setUint16(28, name.length, true); ch.setUint32(42, off, true);
    central.push(ch.buffer, name);
    off += 30 + name.length + size;
    cdSize += 46 + name.length;
  }
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true); end.setUint32(12, cdSize, true); end.setUint32(16, off, true);
  return new Blob([...parts, ...central, end.buffer], { type: 'application/zip' });
}
function readZip(buf) {
  const dv = new DataView(buf), u8 = new Uint8Array(buf), dec = new TextDecoder(), out = {};
  let e = buf.byteLength - 22;
  while (e >= 0 && dv.getUint32(e, true) !== 0x06054b50) e--;
  if (e < 0) throw new Error('not a zip');
  const n = dv.getUint16(e + 10, true);
  let p = dv.getUint32(e + 16, true);
  for (let i = 0; i < n; i++) {
    if (dv.getUint32(p, true) !== 0x02014b50) throw new Error('damaged zip');
    const method = dv.getUint16(p + 10, true), size = dv.getUint32(p + 20, true), nl = dv.getUint16(p + 28, true), xl = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), lo = dv.getUint32(p + 42, true);
    const name = dec.decode(u8.subarray(p + 46, p + 46 + nl));
    if (method !== 0) throw new Error('compressed zip');
    const start = lo + 30 + dv.getUint16(lo + 26, true) + dv.getUint16(lo + 28, true);
    out[name] = u8.subarray(start, start + size);
    p += 46 + nl + xl + cl;
  }
  return out;
}
// Shares a file (iPhone: Save to Files, AirDrop, Mail…) or downloads it where sharing isn't available.
async function shareFile(blob, name, title) {
  const file = new File([blob], name, { type: blob.type });
  if (navigator.canShare && navigator.share) {
    try { if (navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title }); return 'shared'; } } catch (e) { if (e && e.name === 'AbortError') return 'cancelled'; }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 60000);
  return 'downloaded';
}
async function makeBackup(onStep) {
  const enc = new TextEncoder(), files = [{ name: 'atelier.json', data: enc.encode(JSON.stringify(S)) }];
  const ids = Object.keys(S.photos);
  let i = 0;
  for (const id of ids) {
    for (const v of ['f', 't']) {
      const b = await imgGet(`${id}:${v}`).catch(() => null);
      if (b) files.push({ name: `photos/${id}-${v}.jpg`, data: new Uint8Array(await b.arrayBuffer()) });
    }
    if (onStep) onStep(++i, ids.length);
  }
  return makeZip(files);
}
// Replaces everything on this phone with the backup. Returns { photos, classes }.
async function restoreBackup(file) {
  const buf = await file.arrayBuffer();
  let data, pics = {};
  if (/\.json$/i.test(file.name) || new Uint8Array(buf)[0] === 0x7b) data = JSON.parse(new TextDecoder().decode(buf));
  else {
    const z = readZip(buf);
    if (!z['atelier.json']) throw new Error('This ZIP isn’t an Atelier backup.');
    data = JSON.parse(new TextDecoder().decode(z['atelier.json']));
    pics = z;
  }
  if (!data || data.v !== 1 || typeof data.classes !== 'object') throw new Error('This file isn’t an Atelier backup.');
  await imgClear();
  PH.urls.forEach(u => URL.revokeObjectURL(u));
  PH.urls.clear();
  for (const [name, u8] of Object.entries(pics)) {
    const m = /^photos\/(.+)-([ft])\.jpg$/.exec(name);
    if (m) await imgPut(`${m[1]}:${m[2]}`, new Blob([u8], { type: 'image/jpeg' }));
  }
  S = migrate(data);
  save();
  return { photos: Object.keys(S.photos).length, classes: Object.keys(S.classes).length };
}
