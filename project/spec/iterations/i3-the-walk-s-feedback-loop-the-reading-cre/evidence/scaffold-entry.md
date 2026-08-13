---
form: scaffold-entry
by: agent
signed_off: 2026-08-13T12:14:31.040Z
authors: agent
files:
---

# Evidence form / scaffold-entry

## current_situation

The size record scaffolds every seeded drawing so the route stays drawable before its authoring state runs. That scaffold compiled to a bare start-to-end pill, and the walk went straight through it: i3 passed specify-build, seeded nothing, and build-steps reported itself done. A whole build was skipped in silence on 2026-08-13.

## built

Three files, one seam.

- iterations.ts: the placeholder literal becomes `SCAFFOLD_NONE`, exported, written by the size record and read back by the compiler. Two copies would drift and the guard would stop firing with nothing going red.
- iterations.ts: the compiled machine carries `scaffold: true` when the drawing still holds that literal. An AUTHORED none is untouched — zero steps with a stated reason is a legal outcome.
- machine.ts: `MachineDecl` gains the flag, documented as drawable and routable but not enterable.
- session.ts `seedSubs`: refuses to push into a marked machine, and the remedy names the step that authors it.

WHY NOT AT COMPILE. drawnsub.test.ts pins that the placeholder must RESOLVE, because the machine view has to draw a route through work nobody has authored. Two standing tests refused that refusal and were right to. The guard belongs at ENTRY, which is where a note from earlier today said to put it.

IT TESTED ITSELF ON THIS RECORD. i3's own build drawing arrived carrying the placeholder, and this guard is what made me author it.

Cases: tests/scaffold-entry.test.ts — four, including that an authored none stays walkable and that the literal lives in exactly one place.

## follow_up

One step owed and named in its spec: a WALKING case. Today the refusal is asserted by inspection, which proves it ships and not that it fires. Reaching it needs a walk down to a run state, a different fixture at a different cost.

## anything_else

