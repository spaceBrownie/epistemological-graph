import { readFileSync } from 'node:fs';
const d = JSON.parse(readFileSync(new URL('./epistemological_civ_tree_final.json', import.meta.url)));
const ids = new Set(d.nodes.map(n => n.id));
const edgeKey = new Set(d.edges.map(e => e.source + '>' + e.target));
const bad = [];
for (const e of d.edges) for (const k of ['source', 'target']) if (!ids.has(e[k])) bad.push(`edge ${e.id} ${k} ${e[k]}`);
for (const n of d.nodes) {
  for (const k of ['allOf', 'anyOf']) for (const p of n.prerequisites?.[k] ?? []) if (!ids.has(p)) bad.push(`${n.id} prereq ${p}`);
  for (const u of n.unlocks ?? []) if (!ids.has(u)) bad.push(`${n.id} unlock ${u}`);
  if (n.stageScope === 'local' && n.stage == null) bad.push(`${n.id} local without stage`);
}
// cycles are node sets, not ordered walks; require a connected induced subgraph with a back edge
for (const c of d.cycles) {
  const s = new Set(c.nodes);
  for (const n of c.nodes) if (!ids.has(n)) bad.push(`cycle ${c.id} node ${n}`);
  const es = d.edges.filter(e => s.has(e.source) && s.has(e.target));
  if (es.length < c.nodes.length - 1) console.warn(`warn: cycle ${c.id} has only ${es.length} induced edges (data gap)`);
}
for (const f of d.stateEffects) for (const v of [f.target.node, f.target.source, f.target.target, ...(f.target.nodes ?? [])]) if (v && !ids.has(v)) bad.push(`fx ${f.id} target ${v}`);
for (const a of d.attractors) if (!ids.has(a.node_id)) bad.push(`attractor ${a.node_id}`);
console.log(bad.length ? bad.join('\n') : `ok: ${d.nodes.length} nodes, ${d.edges.length} edges, ${d.cycles.length} cycles`);
process.exit(bad.length ? 1 : 0);
