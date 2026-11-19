/* Atelier — teaching worksheets (value and shading, line and texture, colour, drawing skills) listed under Ideas,
   and the ways in to them and the reference tools from technique pages */
'use strict';

const hasSheets = () => typeof TEACH_SHEETS !== 'undefined' && Array.isArray(TEACH_SHEETS) && TEACH_SHEETS.length > 0;
if (hasSheets()) TEACH_SHEETS.forEach(p => { p.teach = true; PRN_BY[p.id] = p; });
const sheetFor = techId => (hasSheets() ? TEACH_SHEETS.find(p => p.tech === techId) || null : null);
// Techniques you can try on a photo with the reference tools, and how the tools start.
const RT_FOR = { 'grid-method': { grid: true, look: 'colour' }, notan: { look: 'values', tones: 2 }, 'value-scale': { look: 'values', tones: 5 }, chiaroscuro: { look: 'values', tones: 3 }, 'light-form': { look: 'values', tones: 4 }, 'hue-value-sat': { look: 'grey' }, schemes: { pal: true, look: 'colour' }, thumbnails: { look: 'values', tones: 3 } };

VIEWS.worksheets = {
  tab: 'ideas', title: 'Worksheets',
  head() { return { deco: true, back: '#/ideas', title: 'Worksheets', sub: 'Printable practice pages for your lessons' }; },
  render() {
    if (!hasSheets()) return emptyState('print', 'Worksheets are on their way', 'They’ll appear here after the next update.');
    const groups = [...new Set(TEACH_SHEETS.map(p => p.g))];
    return `<p class="lead">Print a class set, or save a page to share. On iPhone, “Save or share” opens the share sheet, which has Print and Save to Files.</p>`
      + groups.map(g => `<div class="sec"><h2>${esc(g)}</h2></div><div class="pr-grid">${TEACH_SHEETS.filter(p => p.g === g).map(p => `<a class="pr-tile" href="#/printable/${p.id}"><span class="pv" aria-hidden="true">${p.svg()}</span><b>${esc(p.n)}</b><small class="fine">${esc(p.d)}</small></a>`).join('')}</div>`).join('');
  },
};
