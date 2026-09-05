# Epistemological Civ Tree — Visualization Plan

Entry point: `visualization_agent_handoff.md`. Canonical data: `epistemological_civ_tree_final.json`.

## Model summary
- 92 nodes, 184 edges, 9 stages (0–8), 11 layers, 12 global (stage-less) nodes, 6 declared cycle/trace motifs (2 closed, 4 incomplete), 7 state effects.
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

## Current shipped state
Milestone 1 and the game-style navigation pass are implemented in the current working tree. The graph remains a deterministic static visualization; no progression simulation or runtime status model is present.

The navigation pass resolves the live-review baseline: the original fit-all view opened near 0.178×, search did not zoom, fixed sidebars could collapse the mobile canvas, routes depended on an implicit gesture, nodes lacked keyboard semantics, and cycles were guessed from induced edges. The current implementation establishes a readable camera, explicit modes, progressive disclosure, responsive overlays, accessible node navigation, and exact declared traces.

## Game-style navigation and focus — implementation status
Prioritize legibility, meaningful choices, and progressive disclosure over decorative game styling.

1. **Camera controls — implemented:** Home opens the early-stage map at a readable 0.82×; Fit all and Fit selection are explicit controls; search and deep links center and zoom to the selected concept.
2. **Semantic zoom — implemented:** overview scale retains stages, gateways, attractors, and feedback structure; ordinary nodes, labels, and edge detail return across the mid and gameplay zoom thresholds.
3. **Selection focus — implemented, one follow-up:** selection dims unrelated structure and distinguishes incoming prerequisites from outgoing consequences. A user-controlled Show all connections override remains optional follow-up work.
4. **Route mode — implemented:** the command bar exposes clear choose-start/choose-end state and fits the resolved directed path. Shift-click remains only as a compatibility shortcut, not the primary discovery mechanism.
5. **Responsive HUD — implemented:** filters and inspector are collapsible overlays/drawers around a canvas-first layout, including narrow mobile viewports; camera and route controls remain in the command bar.
6. **Keyboard and accessibility — implemented, one follow-up:** nodes are focusable buttons with accessible labels, visible focus, spatial arrow navigation, Enter/Space activation, and Escape clearing. A separate point-of-interest list remains follow-up work for non-spatial browsing.
7. **Exact cycles and traces — implemented:** every declaration now carries ordered `edgeIds`, and the renderer highlights only those edges. The data honestly resolves to 2 closed cycles and 4 incomplete directed traces rather than inventing missing closure edges.
8. **Validation and browser QA — implemented:** `check.mjs` validates declared edge existence, uniqueness, endpoints, directed continuity, and closed-versus-incomplete status. Search, route, cycle/trace, filters, keyboard interaction, resize behavior, and representative desktop/mobile browser layouts passed QA.

Follow-up work for this milestone is limited to the optional connection override, point-of-interest list, and future regression automation. Preserve the deterministic layout and canonical JSON-driven rendering.

## Next agent
Start by reviewing the current implementation diff; do not rebuild the visualization or replace the deterministic layout. The working tree is intentionally uncommitted.

Recommended next slice, in order:
1. Add a **Show all connections** toggle that temporarily restores filtered-but-unrelated edges without losing the selected node or route/cycle mode.
2. Add a searchable **points of interest** list for keyboard and screen-reader navigation. Selecting an item should reuse the existing `select()` and `focusNode()` flow.
3. Add the smallest practical regression check for camera state, exact cycle-edge selection, route status, drawer accessibility state, and a 390px-wide canvas. Do not introduce a frontend framework or build step.
4. Re-run desktop and 390×844 browser QA and update this section with the result.

Treat the 4 incomplete traces as honest data gaps. Do not invent closure edges or silently relabel them as closed cycles. Milestone 2 remains out of scope unless the user explicitly starts it.

Acceptance criteria for the next slice:
- Current search, Home/Fit controls, filters, route mode, exact trace highlighting, drawers, deep links, and keyboard navigation remain intact.
- New controls are keyboard reachable, visibly focused, and usable at narrow widths.
- `node check.mjs`, inline-script parsing, `git diff --check`, and browser console checks pass.

## Milestone 2 (later)
Runtime status model (locked/available/…), applying `stateEffects`, prerequisite-driven unlocking, simulation mode.

## Check
`node check.mjs` passes: 92 nodes, 184 edges, 2 closed cycles, and 4 incomplete traces. It validates edge endpoints, prerequisites, unlocks, ordered cycle/trace edges, stateEffect targets, and attractor references; incomplete traces are reported as warnings rather than misrepresented as closed cycles.
