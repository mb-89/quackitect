---
id: i13-the-machine-format-state-machines-become
status: seeded
opened: 2026-08-12T19:41:55.164Z
goal: "The machine format: state machines become PlantUML files with our own Cytoscape renderer, coordinates go, the hash moves from bytes to the extracted graph, and the autonomy tag rename rides along because this rewrites every machine file anyway."
vision: |-
  MUST NOT RACE i14 — the ladder's engine half touches the same files. Run them in series or as one walk.

  DONE LOOKS LIKE: every machine is a PlantUML file, no file carries coordinates, our Cytoscape renderer draws them, and reformatting a machine ripples nothing.

  THE OWNER'S RULING. State machines are implemented as PlantUML files, in PlantUML syntax. We write our OWN renderer, Cytoscape-based, the same way the trace graph renderer is. @plantuml/core is UNDECIDED — the format is the decision and the renderer is ours either way; check whether to integrate the library when you get there. Obsidian stops being the editor, and truth stays markdown and other human-readable files.

  HASH THE GRAPH, NOT THE BYTES, AND DECIDE IT HERE. v1 extracted the semantic graph and hashed THAT, so comments, whitespace and line reordering left the hash BIT-IDENTICAL while one added flow moved it — proven live. We hash bytes today, so reformatting a machine would flip its dependents suspect for no semantic reason. This migration rewrites every machine file, which is exactly when that matters. The compiler already extracts the graph, so the extractor exists.

  THE AUTHORING DISCIPLINE, portable from v1 whole. Declare every element FIRST, one per line, then flows on declared names only. A flow to an undeclared name is a dangling reference and a lint finding. EVERY FLOW CARRIES A PAYLOAD LABEL; an empty one is a lint finding. NO COORDINATES, EVER — layout derives. The syntax is a PINNED SUBSET: anything beyond it is a lint finding and the file still parses past it.

  THAT LAST RULE IS THE SHAPE TO COPY. Pin a subset, lint the rest, keep the file valid in ordinary tools. v1's own law for why a mainstream format rather than an invented one: NEVER BE THE LANGUAGE'S OWNER. PlantUML satisfies it.

  LAYOUT DERIVES, BUT NOT DOGMATICALLY. Derived layout is the default and it settles the whole parked layout cluster. Some graphs still need design work — the trace graph among them. Deriving is the default, not a prohibition on shaping a view. AND THERE IS NO INFRASTRUCTURE GRAVE: v1 recorded that deterministic layout of arbitrary graphs is one, and the owner has overridden it. Humans cannot read the data without visualisations. v1 stopped because AI is bad at visual design, which makes the work slow, not impossible.

  THE AUTONOMY TAG RENAME RIDES HERE. The priority tag becomes autonomy and takes a WORD, never a number. Six canvases carry numeric machine-level priorities: boot 0.01, enumerate-space 0.2, expeditions 0.4, ideation 1, and both archives 1.5. One canvas already uses the word — iterations.canvas says "operational" — which proves the migration is mechanical. The 1.5 tier becomes the word blocked. The engine half of the ladder is i14 and does not belong here.

  MINT THE OBSIDIAN-COMPATIBILITY REQUIREMENT here. Every markdown we write stays Obsidian-compatible where it makes sense, as a requirement row rather than a convention.

  ALREADY IN THE TREE: project/scratchpad/trace-mindmap.puml, so we already emit PlantUML somewhere, and deliverable/vendor/mermaid is already vendored. Also worth knowing before choosing: GitHub renders Mermaid natively and PlantUML needs a service, though we render with our own code either way.

  READ FIRST: spec/guides/guide-model-syntax.md at ref main. It is the most directly useful document in v1 for this work, and it documents the hash behaviour, the pinned subset, the element-major discipline and the state-machine kind by example.

  FULL CONTEXT: project/spec/version-planning.md, sections D1, hashing, visualisation, and i13.

  FROM THE POOL, 2026-08-13. Four more, and the first is a format change wearing another name.

  A SEEDED MACHINE MUST BE INDISTINGUISHABLE FROM A DRAWN ONE - SEEDING IS DRAWING (owner ruling, note-7f10db48fd9e). The engine has two kinds of sub-machine and they behave differently. A DRAWN one is a canvas whose states are notes with their own evidence forms. A SEEDED one is generated from a record's drawing file, with states built in code. THAT DIFFERENCE SHOULD NOT EXIST, because when a record seeds build-chunks, candidates or spikes it is authoring a canvas, and nothing downstream should be able to tell the two apart. THE DEBT IS CONCRETE: two fields were removed from the candidates and spikes run states and nothing carries them yet, since a seeded machine's generated states carry their own evidence but nothing collects the SET after the join. Make seeding produce a real drawing, so a collecting state after the join is authored rather than generated - then the rigor matrix's refusal reads the same for both.

  THE DERIVED STEP TABLE WAITS ON THAT UNIFICATION (note-e41b65c8edc4). The build-specification form now holds the design-spec register and the promotion assignment, and the seeded drawing stays the step artifact. A derived read-only step table wants the unified mechanism first; build it there, not as a special case.

  SEEDING DRIFT, recorded OPEN in v1 (note-6ba748959a02). The engine-seeded checklist drifts from the rigor template, either because a template change stops reaching new iterations or because the seeder bakes a divergent copy. V1'S MITIGATION: the seeder reads the source at seed time, with no baked copy, and the composer tailors ABOVE the floor without editing emitted wiring by hand. WE CHOSE THE OPPOSITE - a baked hash plus drift detection - and that choice deserves to be made deliberately here rather than inherited.

  IS THE SPIKE TOO LATE (owner question, note-d59e030d4886). The derisking value of a spike is highest while it can still change the DECISION, before the architecture is set. So run the spike lane before the winner is declared, and a red probe moves the winner instead of invalidating a declared one - and the method already has the precedent, since its probing finder treats probes as pre-decision finders. THE COUNTERWEIGHT, RECORDED HONESTLY: the unknowns ranking reads the sensitivity tripwires as an input today, so moving spikes earlier changes what seeds them. This changes the machine ORDER rather than any one state, which is why it lands here.
inputs:
  - project/spec/version-planning.md
  - spec/guides/guide-model-syntax.md at ref main
  - spec/decisions/adr-element-major-format.md at ref main
  - project/scratchpad/trace-mindmap.puml
---

# i13-the-machine-format-state-machines-become

## Goal

The machine format: state machines become PlantUML files with our own Cytoscape renderer, coordinates go, the hash moves from bytes to the extracted graph, and the autonomy tag rename rides along because this rewrites every machine file anyway.

## Rough vision

MUST NOT RACE i14 — the ladder's engine half touches the same files. Run them in series or as one walk.

DONE LOOKS LIKE: every machine is a PlantUML file, no file carries coordinates, our Cytoscape renderer draws them, and reformatting a machine ripples nothing.

THE OWNER'S RULING. State machines are implemented as PlantUML files, in PlantUML syntax. We write our OWN renderer, Cytoscape-based, the same way the trace graph renderer is. @plantuml/core is UNDECIDED — the format is the decision and the renderer is ours either way; check whether to integrate the library when you get there. Obsidian stops being the editor, and truth stays markdown and other human-readable files.

HASH THE GRAPH, NOT THE BYTES, AND DECIDE IT HERE. v1 extracted the semantic graph and hashed THAT, so comments, whitespace and line reordering left the hash BIT-IDENTICAL while one added flow moved it — proven live. We hash bytes today, so reformatting a machine would flip its dependents suspect for no semantic reason. This migration rewrites every machine file, which is exactly when that matters. The compiler already extracts the graph, so the extractor exists.

THE AUTHORING DISCIPLINE, portable from v1 whole. Declare every element FIRST, one per line, then flows on declared names only. A flow to an undeclared name is a dangling reference and a lint finding. EVERY FLOW CARRIES A PAYLOAD LABEL; an empty one is a lint finding. NO COORDINATES, EVER — layout derives. The syntax is a PINNED SUBSET: anything beyond it is a lint finding and the file still parses past it.

THAT LAST RULE IS THE SHAPE TO COPY. Pin a subset, lint the rest, keep the file valid in ordinary tools. v1's own law for why a mainstream format rather than an invented one: NEVER BE THE LANGUAGE'S OWNER. PlantUML satisfies it.

LAYOUT DERIVES, BUT NOT DOGMATICALLY. Derived layout is the default and it settles the whole parked layout cluster. Some graphs still need design work — the trace graph among them. Deriving is the default, not a prohibition on shaping a view. AND THERE IS NO INFRASTRUCTURE GRAVE: v1 recorded that deterministic layout of arbitrary graphs is one, and the owner has overridden it. Humans cannot read the data without visualisations. v1 stopped because AI is bad at visual design, which makes the work slow, not impossible.

THE AUTONOMY TAG RENAME RIDES HERE. The priority tag becomes autonomy and takes a WORD, never a number. Six canvases carry numeric machine-level priorities: boot 0.01, enumerate-space 0.2, expeditions 0.4, ideation 1, and both archives 1.5. One canvas already uses the word — iterations.canvas says "operational" — which proves the migration is mechanical. The 1.5 tier becomes the word blocked. The engine half of the ladder is i14 and does not belong here.

MINT THE OBSIDIAN-COMPATIBILITY REQUIREMENT here. Every markdown we write stays Obsidian-compatible where it makes sense, as a requirement row rather than a convention.

ALREADY IN THE TREE: project/scratchpad/trace-mindmap.puml, so we already emit PlantUML somewhere, and deliverable/vendor/mermaid is already vendored. Also worth knowing before choosing: GitHub renders Mermaid natively and PlantUML needs a service, though we render with our own code either way.

READ FIRST: spec/guides/guide-model-syntax.md at ref main. It is the most directly useful document in v1 for this work, and it documents the hash behaviour, the pinned subset, the element-major discipline and the state-machine kind by example.

FULL CONTEXT: project/spec/version-planning.md, sections D1, hashing, visualisation, and i13.

FROM THE POOL, 2026-08-13. Four more, and the first is a format change wearing another name.

A SEEDED MACHINE MUST BE INDISTINGUISHABLE FROM A DRAWN ONE - SEEDING IS DRAWING (owner ruling, note-7f10db48fd9e). The engine has two kinds of sub-machine and they behave differently. A DRAWN one is a canvas whose states are notes with their own evidence forms. A SEEDED one is generated from a record's drawing file, with states built in code. THAT DIFFERENCE SHOULD NOT EXIST, because when a record seeds build-chunks, candidates or spikes it is authoring a canvas, and nothing downstream should be able to tell the two apart. THE DEBT IS CONCRETE: two fields were removed from the candidates and spikes run states and nothing carries them yet, since a seeded machine's generated states carry their own evidence but nothing collects the SET after the join. Make seeding produce a real drawing, so a collecting state after the join is authored rather than generated - then the rigor matrix's refusal reads the same for both.

THE DERIVED STEP TABLE WAITS ON THAT UNIFICATION (note-e41b65c8edc4). The build-specification form now holds the design-spec register and the promotion assignment, and the seeded drawing stays the step artifact. A derived read-only step table wants the unified mechanism first; build it there, not as a special case.

SEEDING DRIFT, recorded OPEN in v1 (note-6ba748959a02). The engine-seeded checklist drifts from the rigor template, either because a template change stops reaching new iterations or because the seeder bakes a divergent copy. V1'S MITIGATION: the seeder reads the source at seed time, with no baked copy, and the composer tailors ABOVE the floor without editing emitted wiring by hand. WE CHOSE THE OPPOSITE - a baked hash plus drift detection - and that choice deserves to be made deliberately here rather than inherited.

IS THE SPIKE TOO LATE (owner question, note-d59e030d4886). The derisking value of a spike is highest while it can still change the DECISION, before the architecture is set. So run the spike lane before the winner is declared, and a red probe moves the winner instead of invalidating a declared one - and the method already has the precedent, since its probing finder treats probes as pre-decision finders. THE COUNTERWEIGHT, RECORDED HONESTLY: the unknowns ranking reads the sensitivity tripwires as an input today, so moving spikes earlier changes what seeds them. This changes the machine ORDER rather than any one state, which is why it lands here.

## Inputs

- project/spec/version-planning.md
- spec/guides/guide-model-syntax.md at ref main
- spec/decisions/adr-element-major-format.md at ref main
- project/scratchpad/trace-mindmap.puml

## Overhaul input (2026-08-20)

The overhaul's render sweep was blocked by a host safety classifier and
never ran, so the presentation half got reference-level coverage only. Two
items land here, where the drawing is rewritten anyway.

- Verify raid-debt-two-drawing-mechanisms while replacing the renderer:
  the duplication it records is this record's territory.
- A render audit is owed: dead template branches, duplicated drawing
  paths, and drifted comments across render.ts, traceui.ts, tables.ts,
  trace-layout.ts and iterations-draw.ts.
