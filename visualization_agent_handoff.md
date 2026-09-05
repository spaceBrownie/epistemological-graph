# Visualization Agent Handoff: Epistemological Civ Tree

## Goal
Build an interactive visualization resembling a Sid Meier's Civilization technology tree, except this graph is intentionally cyclic. Later discoveries can feed backward into earlier worldview states.

## Files
- epistemological_civ_tree_final.json — canonical graph
- epistemological_civ_tree_schema.json — structural contract

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

First version only needs to expose state effects in the node inspector. A later simulation mode can apply them dynamically.

## Attractors
Important attractors:
- Resurrection
- Love
- Naturalistic simplicity
- Global explanatory coherence

Make attractors visually prominent.

## Recommended interactions
- pan / zoom
- search
- filter by layer
- filter by stage
- filter by edge type
- toggle global pressures
- toggle backward/feedback edges
- click node -> inspector
- highlight paths
- highlight explicit cycles
- optional worldview simulation mode

## Recommended D3 strategy
Use deterministic positioning:
x = stage
y = layer swimlane

Then use a small constrained force simulation only for collision avoidance inside a stage/layer cell.

Use SVG curved paths for cross-stage and feedback arcs.

## First milestone
1. stage columns
2. layer swimlanes
3. node styles by progressionRole
4. edge styles by transitionClass
5. large feedback arcs
6. node inspector
7. filters

Do not build probabilistic simulation until the static semantic visualization is correct.
