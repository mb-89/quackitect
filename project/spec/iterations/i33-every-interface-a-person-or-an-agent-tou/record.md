---
id: i33-every-interface-a-person-or-an-agent-tou
status: open
started: 2026-08-17T11:01:32.755Z
opened: 2026-08-15T13:26:51.317Z
goal: "Every interface a person or an agent touches answers inside a second, or says plainly that it will not — and the boundaries themselves get modelled first, because today none of them exist as nodes."
vision: "OWNER FRAMING, 2026-08-15: \"get the performance under one second for everything that is user facing, and everything that is over one second needs to be non-intrusive. Every interface that goes to a human or to an agent needs to be that fast. Either that fast, or very transparent about how slow it is.\"\n\nMODELLING COMES FIRST, AND THAT IS A FINDING RATHER THAN A CHOICE. The trace holds 40 interface nodes and every one is element-to-element. A search of every interface and element file for `nbr-` returns ZERO. The neighbours exist as nodes — nbr-engineer, nbr-agent-harness, nbr-vscode, nbr-obsidian — and nothing connects an element to one.\n\nSo the boundary this iteration is about has no node. There is nowhere to hang the demand and nothing for a check to enumerate. That is also why the one-second rule has never had a list to be checked against: req-call-answers-in-one-second and req-surface-answers-in-one-second are written against ELEMENTS rather than against a boundary.\n\nNothing else plans this. version-planning.md returns zero hits for `interface`, and its two `boundary` hits are the trace graph's fan collapse and the options pool's privacy line.\n\nFOUR MILESTONES, in this order.\n\nONE — MODEL THE OUTSIDE BOUNDARIES. One interface node per element-to-neighbour pair that actually carries traffic. Small: the elements exist, the neighbours exist, what is missing is the edges. This draws boundaries that already exist in fact.\n\nTWO — BIND THE DEMAND TO THEM. Every such interface answers inside a second, or is transparent about not doing so. The transparency half is a real requirement and not a consolation: non-intrusive, honest about what it is doing, and a person never left guessing whether it is working.\n\nTHREE — INSTRUMENT PER INTERFACE, so the check is mechanical rather than a person watching. The capability already exists and this is its lesson: mirror_profile recorded a phase breakdown 324 times over a second, for days, and NO STATE READ IT. An instrument nobody reads is not instrumentation. The reading has to be somebody's job in the machine.\n\nFOUR — FIX WHAT THE NUMBERS NAME.\n\nWHAT THE NUMBERS ALREADY NAME, measured at i12's close and not to be re-derived.\n\n- 2311 calls over a second in the log; 422 over ten.\n- The slow surface is ONE derivation repeated: \"is this state green\", once per state, per render, when at most one state moved since the last render. render.ts:3699-3724, in drawingSets and stateDetails.\n- IT IS NOT the compile (the session phase measures 3.4 ms), NOT the SVG (machineSvg consumes an existing canvas and reads no disk), NOT the corpus (4.3 ms warm, and the data phase is 0.2 ms), NOT the cubic comparison walk (about 2 ms a question, and i12 struck that clause from its own goal for exactly this reason).\n- THE DAG IS THE INSTRUMENT for the repetition. downstreamCone already exists in engine/machine.ts and is already imported into session.ts — the engine knows what a change reaches, and uses it to invalidate rather than to avoid work. The missing half is the memo on the other side of the same edge.\n- THE WORST BREACH IS NOT A SURFACE. /mcp POST answered in 33,461 ms and 12,337 ms. That is the lane's own door, and the owner's scope wording puts it in.\n- se_pull: 351 calls over a second, 156 over ten, worst 117,559 ms. Two causes at two dates. i27's pulls REPLAYED, every walked array restarting at idle. Today's do not, and a pull walking ZERO hops still cost 5989 ms.\n- Answers of 300,000 characters are routine; one submit cost 33,456 ms. The form packet ships every template's meta and about 25 null-valued keys per field, on every call.\n\nTHE FIRST MOVE IS FOUR LINES, and it decides the shape of everything after it: split the `machine` phase into its four parts. The mechanism is already in the function. Prediction on the record, so it can be wrong in public: drawingSets and stateDetails hold over 90%, and the SVG is under 50 ms. Spread evenly across states means the DAG is the answer. Concentrated in one call means a targeted fix is, and the DAG is the wrong instrument.\n\nWHAT DONE LOOKS LIKE. Every modelled human-facing and agent-facing interface either answers inside a second, or is measured, named and visibly honest about not doing so. The check is mechanical and a state reads it. Nobody has to ask an agent to go and look."
inputs:
  - "note-5e2d3cae20e0"
  - "note-f9d6dd98f126"
  - "i12"
depends_on:
---

# i33-every-interface-a-person-or-an-agent-tou

## Goal

Every interface a person or an agent touches answers inside a second, or says plainly that it will not — and the boundaries themselves get modelled first, because today none of them exist as nodes.

## Rough vision

OWNER FRAMING, 2026-08-15: "get the performance under one second for everything that is user facing, and everything that is over one second needs to be non-intrusive. Every interface that goes to a human or to an agent needs to be that fast. Either that fast, or very transparent about how slow it is."

MODELLING COMES FIRST, AND THAT IS A FINDING RATHER THAN A CHOICE. The trace holds 40 interface nodes and every one is element-to-element. A search of every interface and element file for `nbr-` returns ZERO. The neighbours exist as nodes — nbr-engineer, nbr-agent-harness, nbr-vscode, nbr-obsidian — and nothing connects an element to one.

So the boundary this iteration is about has no node. There is nowhere to hang the demand and nothing for a check to enumerate. That is also why the one-second rule has never had a list to be checked against: req-call-answers-in-one-second and req-surface-answers-in-one-second are written against ELEMENTS rather than against a boundary.

Nothing else plans this. version-planning.md returns zero hits for `interface`, and its two `boundary` hits are the trace graph's fan collapse and the options pool's privacy line.

FOUR MILESTONES, in this order.

ONE — MODEL THE OUTSIDE BOUNDARIES. One interface node per element-to-neighbour pair that actually carries traffic. Small: the elements exist, the neighbours exist, what is missing is the edges. This draws boundaries that already exist in fact.

TWO — BIND THE DEMAND TO THEM. Every such interface answers inside a second, or is transparent about not doing so. The transparency half is a real requirement and not a consolation: non-intrusive, honest about what it is doing, and a person never left guessing whether it is working.

THREE — INSTRUMENT PER INTERFACE, so the check is mechanical rather than a person watching. The capability already exists and this is its lesson: mirror_profile recorded a phase breakdown 324 times over a second, for days, and NO STATE READ IT. An instrument nobody reads is not instrumentation. The reading has to be somebody's job in the machine.

FOUR — FIX WHAT THE NUMBERS NAME.

WHAT THE NUMBERS ALREADY NAME, measured at i12's close and not to be re-derived.

- 2311 calls over a second in the log; 422 over ten.
- The slow surface is ONE derivation repeated: "is this state green", once per state, per render, when at most one state moved since the last render. render.ts:3699-3724, in drawingSets and stateDetails.
- IT IS NOT the compile (the session phase measures 3.4 ms), NOT the SVG (machineSvg consumes an existing canvas and reads no disk), NOT the corpus (4.3 ms warm, and the data phase is 0.2 ms), NOT the cubic comparison walk (about 2 ms a question, and i12 struck that clause from its own goal for exactly this reason).
- THE DAG IS THE INSTRUMENT for the repetition. downstreamCone already exists in engine/machine.ts and is already imported into session.ts — the engine knows what a change reaches, and uses it to invalidate rather than to avoid work. The missing half is the memo on the other side of the same edge.
- THE WORST BREACH IS NOT A SURFACE. /mcp POST answered in 33,461 ms and 12,337 ms. That is the lane's own door, and the owner's scope wording puts it in.
- se_pull: 351 calls over a second, 156 over ten, worst 117,559 ms. Two causes at two dates. i27's pulls REPLAYED, every walked array restarting at idle. Today's do not, and a pull walking ZERO hops still cost 5989 ms.
- Answers of 300,000 characters are routine; one submit cost 33,456 ms. The form packet ships every template's meta and about 25 null-valued keys per field, on every call.

THE FIRST MOVE IS FOUR LINES, and it decides the shape of everything after it: split the `machine` phase into its four parts. The mechanism is already in the function. Prediction on the record, so it can be wrong in public: drawingSets and stateDetails hold over 90%, and the SVG is under 50 ms. Spread evenly across states means the DAG is the answer. Concentrated in one call means a targeted fix is, and the DAG is the wrong instrument.

WHAT DONE LOOKS LIKE. Every modelled human-facing and agent-facing interface either answers inside a second, or is measured, named and visibly honest about not doing so. The check is mechanical and a state reads it. Nobody has to ask an agent to go and look.

## Inputs

- note-5e2d3cae20e0
- note-f9d6dd98f126
- i12
