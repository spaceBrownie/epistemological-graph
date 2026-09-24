# Epistemological Civ Tree

Interactive tech-tree-style visualization of a cyclic worldview-formation graph. See `PLAN.md` for the architecture and `visualization_agent_handoff.md` for the conceptual model.

```
python3 -m http.server 8765   # then open http://localhost:8765/
node tours.mjs                # regenerate journeys (longest + per-profile)
node check.mjs                # data integrity check
node ui-check.mjs             # UI regression check
```

Deep link to a node: `http://localhost:8765/?node=a_resurrection`

Weigh the map for an audience: `?profile=evidentialist` (see `profiles` in the JSON).
