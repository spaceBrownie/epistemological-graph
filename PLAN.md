# Epistemological Civ Tree — Visualization Plan

Entry point: `visualization_agent_handoff.md`. Canonical data: `epistemological_civ_tree_final.json`.

## Model summary
- 92 nodes, 184 edges, 9 stages (0–8), 11 layers, 12 global (stage-less) nodes, 6 explicit cycles, 7 state effects.
- `progressionRole` ∈ knowledge/state/gateway/pressure/attractor. `attractors[]` list also promotes `a_resurrection` (a gateway).
- `transitionClass` and sign of `weight` are independent: defeaters can point forward, feedback/reinterpretation are positive backward edges.
- Lateral (stageDelta 0) edges are ~1/3 of edges.

## Architecture
- Single static page `index.html`, D3 v7 (cdnjs), fetches the JSON. Serve with `python3 -m http.server`.
- Deterministic layout: x = stage column, y = layer swimlane, nodes packed 2-wide inside each (stage, layer) cell. Collision-free by construction, so no force simulation.
- Global nodes on rails: `human_experience` globals on a top rail, other globals on a bottom rail.
- All lookups (stage names, layer order, roles, classes, cycles, attractors, stateEffects) read from the JSON. Only colors/shapes per role/class are in the renderer.

## Encoding
| Thing | Encoding |
|---|---|
| progressionRole | card shape/border: knowledge plain, state pill, gateway gold double border, pressure dashed warm, attractor large + glow |
| attractors[] | glow ring regardless of role |
| transitionClass | color + dash: forward/unlock blue, lateral grey, defeater red, feedback violet thick, backward orange, reinterpretation teal dashed, global_modifier faint |
| weight | stroke width by |weight| |
| direction | forward = horizontal S-curve; lateral = right-side loop; backward = tall arc, height ∝ stage span; positive arcs above, negative below |

## Readability of cycles
Default dimmed edges; hover/select lights a node's edges. Cycle mode draws only the resolved cycle edges. Path mode (click, shift-click) shows shortest path over visible edges. Every edge class is toggleable.

## Milestone 1 (this repo)
1. Stage columns  2. Layer swimlanes  3. Node style by role  4. Edge style by class
5. Feedback arcs  6. Pan/zoom  7. Search  8. Filters (stage, layer, edge class)
9. Inspector (description, prereqs, unlocks, in/out pressures, stateEffects)  10. Cycle + path highlight

## Milestone 2 (later)
Runtime status model (locked/available/…), applying `stateEffects`, prerequisite-driven unlocking, simulation mode.

## Check
`node check.mjs` validates referential integrity: edge endpoints, prerequisites, unlocks, cycles resolve to real edges, stateEffect targets exist.
