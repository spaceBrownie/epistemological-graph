# Visualization Agent Handoff: Epistemological Civ Tree

## Goal
Continue the implemented interactive visualization resembling a Sid Meier's Civilization technology tree, except this graph is intentionally cyclic. Later discoveries can feed backward into earlier worldview states.

Do not start over. Milestone 1 and the first game-style navigation pass are already implemented in the current uncommitted working tree.

## Files
- epistemological_civ_tree_final.json — canonical graph
- epistemological_civ_tree_schema.json — structural contract
- index.html — complete static D3 renderer and interaction controller
- check.mjs — referential and ordered cycle/trace validation
- PLAN.md — implementation status, priorities, and acceptance criteria

## Current state
- 92 nodes, 184 edges, 9 stages, 11 layers, and 12 global nodes.
- Home opens the early-stage decision space at 0.82×; Fit all, Fit selection, search zoom, and deep links are implemented.
- Semantic zoom progressively reveals ordinary nodes, labels, and edges while preserving gateways, attractors, stages, and feedback structure at overview scale.
- Selection distinguishes incoming prerequisites from outgoing consequences and dims unrelated structure.
- Route mode is an explicit choose-start/choose-end interaction; shift-click remains a shortcut.
- Filters and inspector are responsive overlay drawers. Desktop and 390×844 layouts have been checked in-browser.
- SVG nodes have accessible labels, visible focus, spatial arrow navigation, Enter/Space activation, and Escape clearing.
- Every declared cycle/trace carries ordered `edgeIds`. The data contains 2 closed cycles and 4 incomplete directed traces; the renderer displays only the declared edges.

## Mental model
Layered epistemic state machine + technology tree + cyclic causal network.

## Layout
- X axis = node.stage, left to right.
- Y axis = node.layer, rendered as swimlanes.
- Nodes with stageScope = global sit outside normal stage columns as ambient modifiers.
- Do not use a pure force-directed layout.

Suggested layer order:
human_experience
epistemology
metaphysics
moral_philosophy
naturalism
religious_comparison
history
christianity
deconstruction
worldview_end_states
meta

## Node semantics
progressionRole:
- knowledge
- state
- gateway
- pressure
- attractor

Runtime statuses:
locked, available, explored, accepted, rejected, contested, high_confidence.

Locked nodes should remain visible but muted, Civ-style.

## Edge semantics
transitionClass:
- forward
- unlock
- lateral
- backward
- feedback
- defeater
- reinterpretation
- global_modifier

weight is signed [-1, 1].
Magnitude = strength.
Sign = supportive vs counter-pressure.
Weights are illustrative epistemic pressures, not empirical probabilities.

## Critical behavior
Backward and feedback edges are the defining feature.
Example:
a_resurrection -> s_personal_theism

Render feedback/backward edges as large curved arcs above or below the tree. They should not be visually confused with ordinary forward progression.

## Prerequisites
Nodes may contain:
{
  "prerequisites": {
    "allOf": ["node_a", "node_b"],
    "anyOf": ["node_c", "node_d"]
  },
  "unlocks": ["node_e"]
}

These represent epistemic availability, not deductive entailment.

## Global pressures
stageScope = global nodes are persistent human/existential pressures such as love, suffering, trauma, beauty, forgiveness, consciousness, and religious experience.

Render them as a top/bottom rail or side band rather than normal technologies.

## State effects
stateEffects model dynamic re-weighting.
Example: accepting personal theism reduces the miracle-prior penalty against resurrection.

The current renderer exposes state effects in the node inspector. A later simulation mode can apply them dynamically.

## Attractors
Important attractors:
- Resurrection
- Love
- Naturalistic simplicity
- Global explanatory coherence

Make attractors visually prominent.

## Implemented interactions
- pan / zoom and Home/Fit controls
- search, deep links, and selected-node camera focus
- filters by layer, stage, and edge type
- click or keyboard select -> inspector
- explicit directed route mode
- exact cycle/incomplete-trace highlighting
- responsive drawers and keyboard navigation

## D3 strategy
The renderer uses deterministic positioning:
x = stage
y = layer swimlane

Nodes are packed two-wide inside each stage/layer cell. Do not add a force simulation unless the deterministic packing demonstrably fails.

SVG curved paths distinguish forward, lateral, backward, feedback, reinterpretation, and global-modifier relationships.

## Next assignment
Work from the prioritized `Next agent` section in `PLAN.md`:
1. Add a Show all connections override without disrupting selection, route, cycle/trace, or filter state.
2. Add a searchable points-of-interest list that reuses the existing selection and camera functions.
3. Add minimal regression coverage for the interaction state and narrow canvas behavior.
4. Repeat desktop and 390×844 browser QA.

Keep the implementation dependency-free: one static page, D3 v7, and the canonical JSON. Do not introduce a framework, bundler, or speculative abstraction.

## Validation
Run:
```sh
node check.mjs
node -e 'const fs=require("fs");const s=fs.readFileSync("index.html","utf8");new Function(s.match(/<script>\s*([\s\S]*?)<\/script>/)[1]);console.log("inline JS parses")'
git diff --check
python3 -m http.server 8765
```

Expected data result: `ok: 92 nodes, 184 edges, 2 closed cycles, 4 incomplete traces`, preceded by four explicit incomplete-trace warnings.

Do not build probabilistic simulation until the static semantic visualization is correct.
