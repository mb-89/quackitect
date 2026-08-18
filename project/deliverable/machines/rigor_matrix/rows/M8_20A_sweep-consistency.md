---
kind: matrix-row
name: sweep-consistency
statement: "Sweep the describing surfaces: everything this iteration changed is re-documented where it is taught, and the corpus reads back clean."
state_kind: work
filled_by: agent
depends_on:
  - run-demos
exit_script:
  - project/deliverable/engine/bin/sweep.ts
floor: true
legal_tools:
  - se_file_read
  - se_file_write
  - se_file_patch
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
  - se_lint
evidence:
  - name: swept
    template: checklist
    items:
      - $sweep_surfaces
    description: the surface classes walked - the meth-consistency-sweep card holds the classes, and checking a box claims its documents teach the current behavior
major: full
minor: full
patch: full
product: full
specification: tailored
major_note: |
  FLOOR - never struck. An architecture move touches many teaching
  surfaces; the sweep is correspondingly wide.
minor_note: |
  FLOOR - never struck. Everything the iteration changed is re-documented
  where it is taught, in full.
patch_note: |
  FLOOR - never struck. A fix that changes behavior a document teaches
  leaves that document lying until the sweep runs. The sweep is scoped to
  what the patch touched, and it always runs.
product_note: |
  FLOOR, standing: every describing surface teaches the current behavior.
  The product-level check is the book's drift law - same state, same
  bytes, and what it teaches is what ships.
specification_note: |
  DOCUMENT FORM: the swept-surfaces list in the record. The sweep's real
  output IS the corrected documents themselves.
---

## Guidance

Per [[meth-consistency-sweep]]. A doc that still teaches the superseded way is a defect here, not a later surprise.

LIST WHAT THE ITERATION CHANGED first - the evidence trail has it. Then walk the surface classes on the card, and for each class find every document teaching a changed behavior and fix it. Checking the box is the claim, per class.

## It runs AFTER the demonstrations, not beside them

THE SWEEP DOCUMENTS WHAT THE DEMONSTRATIONS PRODUCED. Their reports are documents like any other, so sweeping before they are performed sweeps an unfinished corpus.

IT USED TO FAN FROM fill-story-evidence, in parallel with run-demos. That drawing cannot be walked by one agent (2026-08-18). A fan hands out one leg and reports the rest as not walked, and run-demos is a SUBMACHINE, so walking it leaves the walk at that submachine's `end`. The engine's escape for an unwalked leg asks whether the state it stands on owes a form. An `end` owes none. So the offer is never made, and the validation busbar starves for good.

The chain costs nothing here. Both legs are walked by the same agent either way, and this order is the one that makes sense.

## The mechanical half runs on the way out

THE CONFORMANCE SWEEP IS THIS ROW'S EXIT SCRIPT, and it is the engine's rather than the agent's. It reads every node under `project/spec` and reports four kinds:

- a node that will not parse
- a value outside its key's vocabulary
- a rule with no way forward
- a rule bound to a node the corpus does not hold

THE CHECKED BOXES ARE THE JUDGMENT AND THE SWEEP IS THE ARITHMETIC. A person decides whether a document still teaches the current behaviour. Nobody has to decide whether a frontmatter word is in its own list, so nobody is asked.

THERE IS NO VERB FOR IT, ON PURPOSE (owner ruling 2026-08-16). A check that moved out of the write because it costs too much per write must not come back as something an agent can call whenever it feels uncertain. The engine decides when it runs.

IT BLOCKS HERE AND ONLY HERE. The write guard REPORTS a standing break and lands the write; the sweep is where that break finally stops something, and the thing it stops is leaving the state whose job was to clear it.

MEASURED 2026-08-16: 1015 nodes in 388 ms.
