---
minted_in: i37-training-iterations-a-disposable-iterati
id: raid-asm-the-rigor-matrix-hash-identifies-what-changes-walk-cost
type: "[[raid]]"
kind: assumption
statement: "The rigor matrix hash stamped on a report identifies the machine's shape, so two reports carrying different hashes were taken on genuinely different machines and two carrying the same hash were not."
owner: the maintainer of the machine
trigger: the first comparison of two benchmark reports taken across a machine change
status: open
probed: 2026-08-20
impact: "Two runs read as comparable when the machine moved underneath them, or as incomparable when it did not. The central question — does a weaker model on an improved machine do the same work — is answered against a control that does not control."
breaks_how_badly: crippling
how_likely: expected
probe: "FALSE, read 2026-08-20. rigorMatrixContentHash in engine/rigor-matrix.ts hashes rows/*.md and nothing else. Guidance, form templates, item templates, method cards and the engine all change walk cost and none of them moves the hash."
source_refs:
  - i37-training-iterations-a-disposable-iterati
weighs_with: none
weighs_against: none
---

## Where it comes from

THE REPORT STAMPS THE HASH so two runs can be told apart. That is the design's
own answer to the owner's ruling that rigor-matrix drift is not a cost, because
the machine is the variable being studied.

STAMPING ONLY WORKS IF THE STAMP TRACKS THE VARIABLE. A hash that misses half
the changes that alter walk cost is a label rather than an identity.

## Why it probably does not hold as worded

THE MATRIX IS 52 ROWS COMPILED PER CHANGE-SIZE COLUMN. It decides which states
a walk visits and what each one demands.

WHAT IT DOES NOT COVER, and each of these changes what a walk costs.

- GUIDANCE. `project/guidance` is method rather than subject and is not in the
  matrix at all. A rewritten refusal card can halve the number of failed calls.
- FORM TEMPLATES. `per-item`, `findings` and the rest shape how much an agent
  writes and how often a submit refuses.
- THE ENGINE. The placeholder fix shipped in this iteration turned an unwalkable
  chain into a walkable one and moved no matrix row.

SO THE HASH IS NECESSARY AND NOT SUFFICIENT, and the report currently treats it
as sufficient.

## Probe

Take the three changes above, one at a time, and recompute the hash. Any that
leaves it unchanged proves the gap and names what else the stamp must carry.

## The shape of a fix, not designed here

The stamp becomes a set rather than one hash: matrix, guidance, forms, engine
version. `se_version` is already on every call record.


## Probed 2026-08-20 — FALSE, and the boundary is exact

`rigorMatrixContentHash` in `engine/rigor-matrix.ts` reads one directory:

    for (const file of readdirSync(join(dir, "rows")).filter(f => f.endsWith(".md")).sort())

IT HASHES `machines/rigor_matrix/rows/*.md` AND NOTHING ELSE. 48 row files.

`pinIteration` in `engine/iterations.ts` stamps that value onto the pin as
`rigor_matrix_hash`, so the pin — and any report reading it — inherits exactly
that scope.

WHAT CHANGES WALK COST AND DOES NOT MOVE THE HASH.

- `project/guidance`. Method and refusal cards. A rewritten refusal card
  changes how many calls an agent burns recovering, which is a first-order
  term in what a benchmark measures.
- FORM TEMPLATES, at `machines/forms/templates/`. `per-item` and `findings`
  decide how much an agent writes and how often a submit refuses.
- ITEM TEMPLATES, at `machines/items/`. These are scanned by `readdirSync` at
  run time and are not in the matrix.
- METHOD CARDS, at `machines/methods/`.
- THE ENGINE ITSELF. Proved on this iteration: the placeholder fix shipped
  today turned an unwalkable chain into a walkable one and moved zero rows.

SO THE STAMP IS NECESSARY AND NOT SUFFICIENT, and a report that treats it as an
identity will call two runs comparable across exactly the changes this project
makes most often.

## The fix, drawn and not built

THE STAMP BECOMES A SET RATHER THAN ONE HASH: matrix, guidance, forms, items,
methods, engine.

THE ENGINE HALF IS ALREADY THERE. `se_version` is on every call record in
`engine/calllog.ts`, so the report can read it without new capture.

THE REST IS THE SAME FUNCTION POINTED AT MORE DIRECTORIES. `rigorMatrixContentHash`
already walks a directory, sorts, and hashes name-then-content. Nothing new is
needed except the list of directories.

M7 OWNS THIS. The report cannot honestly stamp its conditions until it does.
