import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const data = JSON.parse(readFileSync(new URL('./epistemological_civ_tree_final.json', import.meta.url)));
const script = html.match(/<script>\s*\(async function \(\) \{([\s\S]*?)<\/script>/)?.[1];

assert.ok(script, 'inline controller script is present');
for (const id of ['home', 'fitAll', 'route', 'allConnections', 'filtersToggle', 'inspectorToggle', 'poi', 'poiResults', 'toursToggle', 'tourMenu', 'tour', 'tourNext', 'tourPrev']) {
  assert.match(html, new RegExp(`id="${id}"`), `${id} control is present`);
}
assert.match(script, /function home\(\)/, 'camera has a home state');
assert.match(script, /function fitBounds\(/, 'camera can fit a target');
assert.match(script, /function showPath\(a, b\)/, 'route state is implemented');
assert.match(script, /function toggleDrawer\(id, open\)/, 'drawer accessibility state is implemented');
assert.match(script, /function startTour\(id\)/, 'tours can be started');
assert.match(script, /function renderTour\(/, 'tours render one step at a time');
assert.match(script, /toggleDrawer\('left', false\); toggleDrawer\('right', false\)/, 'starting a tour clears both drawers at any width');
assert.match(script, /function setConnectionOverride\(on\)/, 'connection override is implemented');
assert.match(script, /function renderPoints\(query = ''\)/, 'point-of-interest search is implemented');
assert.match(script, /select\(n\); focusNode\(n\)/, 'point-of-interest selection uses the shared selection flow');

const edgeIds = new Set(data.edges.map(e => e.id));
for (const cycle of data.cycles) {
  assert.ok(cycle.edgeIds.length, `${cycle.id} declares edges`);
  for (const id of cycle.edgeIds) assert.ok(edgeIds.has(id), `${cycle.id} references an existing edge`);
}
console.log('ok: UI controls, interaction states, tours, and exact trace edges');
