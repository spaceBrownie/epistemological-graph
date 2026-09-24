// Regenerates kind:"journey" tours in place. Authored argument and return tours are left untouched.
import { readFileSync, writeFileSync } from 'node:fs';
const file = new URL('./epistemological_civ_tree_final.json', import.meta.url);
const d = JSON.parse(readFileSync(file, 'utf8'));
const nodes = new Map(d.nodes.map(n => [n.id, n]));
const profiles = new Map((d.profiles ?? []).map(p => [p.id, p]));

// Same rule as effectiveWeight in index.html: the most specific multiplier wins.
const effectiveWeight = (e, p) => {
  const m = p?.multipliers ?? {};
  return Math.max(-1, Math.min(1, e.weight * (m.byEdge?.[e.id] ?? m.byNode?.[e.source] ?? m.byNodeType?.[nodes.get(e.source)?.type] ?? m.byEdgeType?.[e.type] ?? 1)));
};

const out = new Map();
for (const e of d.edges) if (e.weight > 0) (out.get(e.source) ?? out.set(e.source, []).get(e.source)).push(e);

// Most persuasive path: maximum product of effective weights, i.e. Dijkstra on -log w.
function persuasive(start, end, p, allowGlobal = true) {
  const dist = new Map([[start, 0]]), prev = new Map(), done = new Set();
  while (true) {
    let u = null;
    for (const [k, v] of dist) if (!done.has(k) && (u == null || v < dist.get(u))) u = k;
    if (u == null) return null;
    if (u === end) break;
    done.add(u);
    for (const e of out.get(u) ?? []) {
      if (!allowGlobal && e.transitionClass === 'global_modifier') continue;
      const w = effectiveWeight(e, p);
      if (w <= 0) continue;
      const c = dist.get(u) - Math.log(w);
      if (c < (dist.get(e.target) ?? Infinity)) { dist.set(e.target, c); prev.set(e.target, e); }
    }
  }
  const path = [];
  for (let n = end; n !== start; n = prev.get(n).source) path.unshift(prev.get(n));
  return path;
}

// ponytail: brute-force DFS for the longest simple path, capped at BUDGET steps. The graph has loops back out of naturalism, so the search can blow up; past the cap it falls back to the most persuasive path. Upgrade: memoize over strongly connected components if the cap starts biting.
const BUDGET = 5_000_000;
// ponytail: journeys are capped at MAX_STEPS = 20, close to the original 9-23 range. Uncapped, the loops back out of naturalism give 24-32-step random walks.
const MAX_STEPS = 20;
function longest(start, end) {
  let best = null, bestSum = -Infinity, sum = 0, steps = 0;
  const seen = new Set([start]), path = [];
  (function dfs(u) {
    if (++steps > BUDGET) return;
    if (u === end) {
      // Among equally long paths, keep the one with the highest summed weight.
      if (!best || path.length > best.length || (path.length === best.length && sum > bestSum + 1e-9)) { best = [...path]; bestSum = sum; }
      return;
    }
    if (path.length === MAX_STEPS) return;
    for (const e of out.get(u) ?? []) {
      if (e.transitionClass === 'global_modifier' || seen.has(e.target)) continue;
      seen.add(e.target); path.push(e); sum += e.weight;
      dfs(e.target);
      sum -= e.weight; path.pop(); seen.delete(e.target);
    }
  })(start);
  if (steps <= BUDGET) return best;
  console.warn(`warn: longest path ${start} -> ${end} hit the ${BUDGET} step budget; using the most persuasive path`);
  return persuasive(start, end, null, false);
}

const startName = { human_agent: 'a person inside reality', arg_beauty: 'beauty', arg_personhood: 'personhood', p_pluralism: 'religious diversity', h_empty_tomb: 'the empty tomb', c_restoration: 'resurrection hope' };
const endName = { s_christian_with_tension: 'committed faith, with tensions', m_constructed_meaning: 'constructed meaning' };
const label = id => nodes.get(id).label;
const passes = (path, start, end) => {
  const via = path.map(e => e.target).filter(n => n !== end && n !== start && ['gateway', 'attractor'].includes(nodes.get(n).progressionRole)).map(label);
  if (!via.length) return '';
  return ` Along the way it passes ${via.length > 1 ? via.slice(0, -1).join(', ') + ', and ' + via.at(-1) : via[0]}.`;
};

const journeys = [];
for (const s of Object.keys(startName)) for (const t of Object.keys(endName)) {
  const path = longest(s, t);
  if (!path) { console.warn(`warn: no path ${s} -> ${t}`); continue; }
  journeys.push({ id: `journey_${s}_${t}`, kind: 'journey', label: `From ${startName[s]} to ${endName[t]}`, edgeIds: path.map(e => e.id),
    description: `The longest route in the map from ${label(s)} to ${label(t)} that never revisits a concept: ${path.length} steps.${passes(path, s, t)} Long routes double back through the core, the way a lived journey does.` });
}
for (const p of profiles.values()) if (p.id !== 'default') for (const t of Object.keys(endName)) {
  const path = persuasive('human_agent', t, p);
  if (!path) { console.warn(`warn: no path for ${p.id} -> ${t}`); continue; }
  journeys.push({ id: `journey_${p.id}_human_agent_${t}`, kind: 'journey', profile: p.id, label: `${p.label}: from ${startName.human_agent} to ${endName[t]}`, edgeIds: path.map(e => e.id),
    description: `The most persuasive route for the ${p.label.toLowerCase()} profile from ${label('human_agent')} to ${label(t)}: ${path.length} steps, keeping as much of each argument's pull as this person feels it.${passes(path, 'human_agent', t)}` });
}

const firstJourney = d.tours.findIndex(t => t.kind === 'journey');
const rest = d.tours.filter(t => t.kind !== 'journey');
d.tours = [...rest.slice(0, firstJourney < 0 ? rest.length : firstJourney), ...journeys, ...rest.slice(firstJourney < 0 ? rest.length : firstJourney)];
writeFileSync(file, JSON.stringify(d, null, 2) + '\n');
const missing = [...new Set(journeys.flatMap(j => j.edgeIds))].filter(id => !d.edges.find(e => e.id === id).explanation);
if (missing.length) console.warn(`warn: journeys walk edges without an explanation: ${missing.join(', ')}`);
console.log(`ok: ${journeys.length} journeys (${journeys.filter(j => j.profile).length} per-profile)`);
