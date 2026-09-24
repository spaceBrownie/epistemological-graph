import { readFileSync } from 'node:fs';
const d = JSON.parse(readFileSync(new URL('./epistemological_civ_tree_final.json', import.meta.url)));
const ids = new Set(d.nodes.map(n => n.id));
const edgesById = new Map(d.edges.map(e => [e.id, e]));
const bad = [];
for (const e of d.edges) for (const k of ['source', 'target']) if (!ids.has(e[k])) bad.push(`edge ${e.id} ${k} ${e[k]}`);
for (const n of d.nodes) {
  for (const k of ['allOf', 'anyOf']) for (const p of n.prerequisites?.[k] ?? []) if (!ids.has(p)) bad.push(`${n.id} prereq ${p}`);
  for (const u of n.unlocks ?? []) if (!ids.has(u)) bad.push(`${n.id} unlock ${u}`);
  if (n.stageScope === 'local' && n.stage == null) bad.push(`${n.id} local without stage`);
}
let closedCycles = 0;
let incompleteTraces = 0;
for (const c of d.cycles) {
  const s = new Set(c.nodes);
  for (const n of c.nodes) if (!ids.has(n)) bad.push(`cycle ${c.id} node ${n}`);
  const edgeIds = Array.isArray(c.edgeIds) ? c.edgeIds : [];
  if (!edgeIds.length) bad.push(`cycle ${c.id} has no edgeIds`);
  if (new Set(edgeIds).size !== edgeIds.length) bad.push(`cycle ${c.id} repeats an edgeId`);
  const es = edgeIds.map(id => edgesById.get(id));
  for (let i = 0; i < es.length; i++) {
    const e = es[i];
    if (!e) {
      bad.push(`cycle ${c.id} edge ${edgeIds[i]}`);
      continue;
    }
    if (!s.has(e.source) || !s.has(e.target)) bad.push(`cycle ${c.id} edge ${e.id} endpoint outside cycle nodes`);
    const next = es[i + 1];
    if (next && e.target !== next.source) bad.push(`cycle ${c.id} edges ${e.id}>${next.id} do not form a directed walk`);
  }
  const first = es[0];
  const last = es.at(-1);
  if (first && last && first.source === last.target) closedCycles++;
  else if (first && last) {
    incompleteTraces++;
    console.warn(`warn: cycle ${c.id} is an incomplete trace (${first.source} -> ${last.target})`);
  }
}
for (const t of d.tours ?? []) {
  const es = t.edgeIds.map(id => edgesById.get(id));
  if (new Set(t.edgeIds).size !== t.edgeIds.length) bad.push(`tour ${t.id} repeats an edgeId`);
  if (!['argument', 'journey', 'return'].includes(t.kind)) bad.push(`tour ${t.id} has unknown kind ${t.kind}`);
  if (t.kind === 'journey' && new Set(es.flatMap(e => e ? [e.source, e.target] : [])).size !== es.length + 1) bad.push(`journey ${t.id} revisits a concept`);
  if (t.kind === 'return' && new Set(es.flatMap(e => e ? [e.source, e.target] : [])).size === es.length + 1) bad.push(`return ${t.id} never comes back to a concept`);
  es.forEach((e, i) => {
    if (!e) return bad.push(`tour ${t.id} edge ${t.edgeIds[i]}`);
    const next = es[i + 1];
    if (next && e.target !== next.source) bad.push(`tour ${t.id} edges ${e.id}>${next.id} do not form a directed walk`);
  });
}
for (const id of new Set([...d.cycles, ...(d.tours ?? [])].flatMap(t => t.edgeIds))) {
  const x = edgesById.get(id)?.explanation;
  if (!x) bad.push(`edge ${id} is walked by a tour but has no explanation`);
  else if ((x.match(/[.?!](\s|$)/g) ?? []).length > 2) bad.push(`edge ${id} explanation is longer than two sentences`);
}
const outDeg = new Map(), inDeg = new Map();
for (const e of d.edges) { outDeg.set(e.source, (outDeg.get(e.source) ?? 0) + 1); inDeg.set(e.target, (inDeg.get(e.target) ?? 0) + 1); }
for (const n of d.nodes) {
  const o = outDeg.get(n.id) ?? 0, i = inDeg.get(n.id) ?? 0;
  if (!o && !n.terminal) bad.push(`${n.id} has no outgoing edges and is not marked terminal`);
  if (!n.terminal && i >= 4 && i > 4 * o) console.warn(`warn: ${n.id} has in-degree ${i} and out-degree ${o}`);
}
// ponytail: baseline cutoff, e001-e184 predate the explanation rule; drop the number check once every edge is explained.
for (const e of d.edges) if (+e.id.slice(1) > 184 && !e.explanation) bad.push(`edge ${e.id} has no explanation`);
const profileIds = new Set((d.profiles ?? []).map(p => p.id));
const multiplierKeys = { byEdge: edgesById, byNode: ids, byNodeType: new Set(d.graph.node_types), byEdgeType: new Set(d.graph.edge_types) };
for (const p of d.profiles ?? []) for (const [k, known] of Object.entries(multiplierKeys)) for (const [key, m] of Object.entries(p.multipliers?.[k] ?? {})) {
  if (!known.has(key)) bad.push(`profile ${p.id} ${k} key ${key} is unknown`);
  if (typeof m !== 'number' || m < 0 || m > 3) bad.push(`profile ${p.id} ${k}.${key} multiplier ${m} is outside [0, 3]`);
}
for (const p of d.profiles ?? []) for (const k of Object.keys(p.multipliers ?? {})) if (!(k in multiplierKeys)) bad.push(`profile ${p.id} has unknown multiplier group ${k}`);
for (const t of d.tours ?? []) if (t.profile != null && !profileIds.has(t.profile)) bad.push(`tour ${t.id} names unknown profile ${t.profile}`);
for (const f of d.stateEffects) for (const v of [f.target.node, f.target.source, f.target.target, ...(f.target.nodes ?? [])]) if (v && !ids.has(v)) bad.push(`fx ${f.id} target ${v}`);
for (const a of d.attractors) if (!ids.has(a.node_id)) bad.push(`attractor ${a.node_id}`);
console.log(bad.length ? bad.join('\n') : `ok: ${d.nodes.length} nodes, ${d.edges.length} edges, ${closedCycles} closed cycles, ${incompleteTraces} incomplete traces, ${(d.tours ?? []).filter(t => t.kind === 'argument').length} argument paths, ${(d.tours ?? []).filter(t => t.kind === 'journey').length} journeys, ${(d.tours ?? []).filter(t => t.kind === 'return').length} returns, ${profileIds.size} profiles`);
process.exit(bad.length ? 1 : 0);
