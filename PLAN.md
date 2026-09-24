# Epistemological Civ Tree — Visualization Plan

Entry point: `visualization_agent_handoff.md`. Canonical data: `epistemological_civ_tree_final.json`.

## Model summary
- 105 nodes, 257 edges, 6 persuasion profiles, 34 tours (9 argument, 22 journey, 3 return), 9 stages (0–8), 11 layers, 12 global (stage-less) nodes, 6 declared cycle/trace motifs (2 closed, 4 incomplete), 7 state effects.
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
Milestone 1, the game-style navigation pass, and its planned accessibility/regression follow-up are implemented in the current working tree. The graph remains a deterministic static visualization; no progression simulation or runtime status model is present.

The navigation pass resolves the live-review baseline: the original fit-all view opened near 0.178×, search did not zoom, fixed sidebars could collapse the mobile canvas, routes depended on an implicit gesture, nodes lacked keyboard semantics, and cycles were guessed from induced edges. The current implementation establishes a readable camera, explicit modes, progressive disclosure, responsive overlays, accessible node navigation, and exact declared traces.

## Game-style navigation and focus — implementation status
Prioritize legibility, meaningful choices, and progressive disclosure over decorative game styling.

1. **Camera controls — implemented:** Home opens the early-stage map at a readable 0.82×; Fit all and Fit selection are explicit controls; search and deep links center and zoom to the selected concept.
2. **Semantic zoom — implemented:** overview scale retains stages, gateways, attractors, and feedback structure, and shows ordinary nodes as faint blocks so density stays visible; labels and edge detail return across the mid and gameplay zoom thresholds. Stage and layer names are pinned to the viewport edges at every zoom. At overview, gateways and attractors (or the active tour's stops) get screen-size labels placed greedily above or below their node, and each stage × layer cluster is a click-to-zoom target that reports its concept count on hover.
3. **Selection focus — implemented:** selection dims unrelated structure and distinguishes incoming prerequisites from outgoing consequences. Show all connections temporarily restores unrelated visible structure while retaining selection, route, or trace context.
4. **Route mode — implemented:** the command bar exposes clear choose-start/choose-end state and fits the resolved directed path. Shift-click remains only as a compatibility shortcut, not the primary discovery mechanism.
5. **Responsive HUD — implemented:** filters and inspector are collapsible overlays/drawers around a canvas-first layout, including narrow mobile viewports; camera and route controls remain in the command bar.
6. **Keyboard and accessibility — implemented:** nodes are focusable buttons with accessible labels, visible focus, spatial arrow navigation, Enter/Space activation, and Escape clearing. The Filters drawer also contains a searchable points-of-interest list for non-spatial browsing.
7. **Exact cycles and traces as tours — implemented:** every declaration carries ordered `edgeIds`, and the renderer highlights only those edges. The data honestly resolves to 2 closed loops and 4 open traces rather than inventing missing closure edges. Each one is a **tour**: the header Tours menu (or an inspector pill, or `?tour=<id>`) opens a dock that walks one edge per step with numbered markers on the map, frames each step, and ends on the whole tour with an explicit loop-closes / trace-ends message. Every edge walked by a tour or cycle carries an `explanation` (one or two plain sentences on why the source leads to the target), stored on the edge so tours, the inspector, edge hover, and any later simulation reuse it; `check.mjs` fails if a walked edge lacks one or exceeds two sentences. Two **return journeys** (`kind: "return"`) trace someone convinced of Christianity who meets friction (evil at the cross; hiddenness at the incarnation), falls back to agnostic classical-theism, tests Islam or re-examines the history, and returns to Christianity leading hypothesis before going further into historic commitment; `check.mjs` requires a return to revisit a concept. Note the data has no edge out of agnostic naturalism back toward theism, so returns must pass through agnostic classical-theism (the only two-way door). Twelve **personal journeys** (`kind: "journey"`) are the longest simple paths from six starting points (a person inside reality, beauty, personhood, religious diversity, the empty tomb, resurrection hope) to each terminal settling (Christian commitment with tensions; meaning constructed), generated from positive non-global edges; `check.mjs` verifies they never revisit a concept. Nine authored (`kind: "argument"`) **argument paths** live in `tours` in the canonical JSON (existing edges only, validated by `check.mjs`): a three-chapter theistic ascent with Continue links, stalled theism, suffering to constructed meaning, the personhood fork (love vs humanism), and the residual tensions each end state still carries. Their step text names the declared loop an edge belongs to, and the end card says where the path settles, reaches, or presses. When a step's two ends can't both be framed readably, the camera starts at the source and travels along the edge to the destination. During a tour, other edges are hidden and other nodes become unlabeled blocks, in place (never re-laid-out, so spatial memory holds); Show all connections lifts this. Clicking a node mid-tour inspects it without leaving the tour; Escape or × ends it.
8. **Validation and browser QA — implemented:** `check.mjs` validates declared edge existence, uniqueness, endpoints, directed continuity, and closed-versus-incomplete status. `ui-check.mjs` covers the control surface, camera/route/drawer hooks, tour hooks, and exact trace-edge declarations. Search, route, tours, filters, POI navigation, keyboard interaction, resize behavior, and representative desktop/mobile browser layouts passed QA.

Follow-up work for this milestone is limited to future regression automation. Preserve the deterministic layout and canonical JSON-driven rendering.

## Next agent
Do not rebuild the visualization or replace the deterministic layout. The perception and tours pass is on branch `pfd-visual-pass` (PR #1).

The planned follow-up slice is complete:
1. **Show all connections** is a keyboard-reachable, pressed-state toggle that keeps the active selection, route, or trace intact.
2. A searchable **points of interest** list reuses `select()` and `focusNode()`.
3. `ui-check.mjs` is the smallest dependency-free regression check for control hooks, route/drawer state, tours, and exact trace edges.
4. Desktop interactions and a 390×844 pass confirmed a 390px-wide canvas, collapsed drawers, working POI navigation, preserved route context, and no console errors.

Treat the 4 incomplete traces as honest data gaps. Do not invent closure edges or silently relabel them as closed cycles. Milestone 2 remains out of scope unless the user explicitly starts it.

Acceptance criteria for the next slice:
- Current search, Home/Fit controls, filters, route mode, exact trace highlighting, drawers, deep links, and keyboard navigation remain intact.
- New controls are keyboard reachable, visibly focused, and usable at narrow widths.
- `node check.mjs`, inline-script parsing, `git diff --check`, and browser console checks pass.

## Issue #2 contract: exits, splits, persuasion profiles
Work plan: `~/.claude/plans/pull-the-latest-issues-twinkly-flamingo.md`. The data agent and the UI agent both build against this shape.

- Node `terminal: true` marks an intentional sink. `check.mjs` fails on any node with zero out-edges that isn't marked terminal.
- New edges are numbered from `e185`, and each carries an `explanation` of one or two sentences.
- Top-level `profiles[]`: `{ id, label, description, multipliers: { byEdge: {edgeId: m}, byNode: {sourceNodeId: m}, byNodeType: {sourceNodeType: m}, byEdgeType: {edgeType: m} } }`. `m` is in [0, 3]. The `default` profile has empty multipliers.
- Effective weight: `clamp(w * (byEdge[e.id] ?? byNode[e.source] ?? byNodeType[type(e.source)] ?? byEdgeType[e.type] ?? 1), -1, 1)`. The most specific match wins.
- `tours[].profile` (optional) is the profile id. A tour carrying a profile is that profile's "most persuasive route" journey. Tours without a profile show for every profile.
- `node tours.mjs` regenerates `kind: "journey"` tours in place. Authored `argument` and `return` tours are never touched.

## Issue #2 outcome
- **Exits:** agnostic naturalism, secular humanism, constructed meaning, naturalistic morality, the residual tensions and the closed posture all have exits now. There are paths from naturalism back to theism that avoid `s_agnostic_theism` (relabelled "Tentative theism").
- **New positions:** atheism, deism, classical theism, settled Judaism and Islam, and reopened inquiry.
- **New arguments and pressures:** fine-tuning, ontological, religious experience, reformed epistemology, argument from reason, evolutionary debunking, and the evidential problem of evil (split from the logical one).
- **Profiles:** default, evidentialist, existential, moral realist, empiricist and rationalist. The UI's "Weigh as" picker reweights edges: stronger edges glow, weaker ones are dashed. `tours.mjs` computes each profile's most persuasive route to each end state.
- **Known shape:** every route that ends in Christian commitment goes through the resurrection question, so the evidentialist, empiricist and rationalist routes to that end state coincide. Step markers can still overlap on dense end cards (deferred).

## Milestone 2 (later)
Runtime status model (locked/available/…), applying `stateEffects`, prerequisite-driven unlocking, simulation mode.

## Check
`node tours.mjs && node check.mjs` and `node ui-check.mjs` pass. The data check reports 105 nodes, 257 edges, 2 closed cycles, and 4 incomplete traces. It fails on any node with no outgoing edges that isn't marked `terminal` (only `a_coherence` is), on edges after `e184` with no explanation, and on invalid profile multipliers. It warns when a node's in-degree is more than 4× its out-degree (currently only `s_agnostic_naturalism`, at 24 in / 4 out). It validates edge endpoints, prerequisites, unlocks, ordered cycle/trace edges, stateEffect targets, and attractor references; incomplete traces are reported as warnings rather than misrepresented as closed cycles.
