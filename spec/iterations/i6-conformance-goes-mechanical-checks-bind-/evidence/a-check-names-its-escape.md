---
form: a-check-names-its-escape
by: agent
signed_off: 2026-08-16T17:25:52.006Z
authors: agent
files: null
---

# Evidence form / a-check-names-its-escape

## current_situation

THE THREE WAYS FORWARD ARE THE VOCABULARY NOW, and `refuse` is not one of them.

BUILDING THIS CHUNK FOUND A DEFECT IN CHUNK SIX. `on_break` admitted `refuse | report`, which let a rule declare a block with no way out — the exact thing this requirement exists to prevent. The requirement names three, and I had built two, one of them wrong.

TWO NEW CASES join `boundrules.test.ts`. Both runs are owed with the rest, waiting on the reload.

## built

### The code

- `project/deliverable/engine/rules.ts` — `WAYS_FORWARD` is now `report | signed | carry`, with a `WayForward` type and an `isWayForward` guard. Each one carries what it means in a comment beside it.
- `project/deliverable/engine/guard.ts` — the block condition changed from `=== "refuse"` to `!== "report"`, and the refusal now names the rule's declared way forward.
- `project/deliverable/tests/boundrules.test.ts` — two cases added, one fixture corrected from `refuse` to `carry`.

### The three, and why each is a shape already proven here

NONE OF THEM IS A NAME INVENTED FOR THE SCHEMA. Each is something this engine already does.

- `report` — the rule never blocks. The break rides the write's result and the author reads it. This is what `req-a-standing-break-reports-and-lands` demands of every corpus-wide subject, and chunk five built it.
- `signed` — the rule blocks until evidence already stamped answers it. This is the shape observe-red ended up with at i11, after its own exit script blocked its own iteration on re-entry.
- `carry` — the rule blocks until the item travels forward, counted, on the record. This is the shape the close ended up with after the same failure.

### Why `refuse` is deliberately absent

REFUSING IS WHAT `signed` AND `carry` DO until their escape is taken. Naming it separately would let a rule declare a block and stop there, which is a rule with no way out wearing a complete-looking declaration.

THE OLD SPELLING MADE THAT POSSIBLE, and chunk six shipped it. The requirement was written before the code and the code drifted from it inside two chunks.

### What the cases assert

- A RULE WITH NO `on_break` DOES NOT ARM, and the refusal names all three ways forward individually, so a subset or a count fails it.
- A RULE WHOSE WAY FORWARD IS `report` NEVER BLOCKS. The fixture breaks its own rule, the write lands, and the break rides the result.

## follow_up

CHUNK NINE IS NEXT — `coverage-computes-both-sides`, which has no dependency and is the largest of the remaining conformance items.

WHAT IS OWED ACROSS THE BUILD SO FAR. Three runs — chunks six, seven and eight — all waiting on the same reload, and all covered by the battery at verification.

ONE THING THIS CHUNK PROVED ABOUT THE METHOD. Writing the requirement first and the code second did not stop the code drifting from it; only building the NEXT chunk against the same requirement caught it. That is worth carrying to the retro.

NOTHING IS BLOCKED.

## anything_else

### A requirement written first still drifted, and what caught it

req-a-check-names-its-way-forward SAYS THREE, by name, in its own Detail section: report instead of refuse, accept a signed answer, carry.

CHUNK SIX BUILT `refuse | report`. Both words appear in the requirement's prose, which is presumably how it happened — `refuse` is in the sentence "REPORT INSTEAD OF REFUSE" as the thing being replaced.

NOTHING CAUGHT IT AT CHUNK SIX. Not the typecheck, not the lint, not the case, because the case used the same wrong word the code did. Test-first does not protect against a test written from the same misreading as the code.

WHAT CAUGHT IT was arriving at the chunk whose statement quotes the three, and reading the requirement again with that statement in hand.

### The general form, and it is this iteration's own subject

A VOCABULARY STATED IN PROSE AND IMPLEMENTED IN CODE HAS NO CHECK BETWEEN THEM. The requirement's three words and the engine's two were both readable, in the same repository, and nothing compared them.

THAT IS EXACTLY WHAT `req-a-value-outside-its-vocabulary-refuses` DOES FOR CORPUS NODES — the allowed list lives in the item template and the guard reads it, so the two cannot disagree.

THE ENGINE'S OWN VOCABULARIES GET NO SUCH TREATMENT. `WAYS_FORWARD` is a const in TypeScript and the requirement is prose in markdown. Making a requirement's enumerated list bind to the code that implements it is a real extension of this iteration's thesis, and it is not in scope.

IT GOES TO THE RETRO rather than into this iteration, because it is a new mechanism rather than a defect in a built one.
