---
form: write-the-benchmark-report
by: agent
signed_off: 2026-08-20T10:02:39.746Z
authors: agent
files:
---

# Evidence form / write-the-benchmark-report

## current_situation

write-the-benchmark-report, the chunk gate-prototype singled out.

IT CARRIES THE ONE UNTESTED CELL OF THE WINNER. The incremental report was declared as inherited rather than endorsed, and the gate required it to get M7's first test. It has one now.

THE ROUTER HANDED THIS CHUNK BEFORE ITS OWN DEPENDENCY. It depends on bind-a-run-and-write-its-conditions, which is not built. What it owns is self-contained — the guard over a report's fields and the set the conditions stamp covers — so it was built where it stood rather than re-aimed.

## built

THREE THINGS, all under `project/deliverable`.

- `reportProblems` in `engine/benchmark-report.ts`. One problem per absent field, each naming the field. Eight conditions and two stop fields.
- `conditionsStampDirs` in the same file. Six directories, not one hash.
- `machines/items/benchmark-run.md`, the item template. It costs no engine change: `vocabulary.ts` scans the items folder, so a template is discovered by being written.

BOTH STOP FIELDS ARE REQUIRED EVEN WHEN THEY ARE EQUAL, and the code says why. A reader cannot tell `reached the end` from `nobody recorded it` when one of them is simply absent. That is the incremental report's whole claim: a run that died still leaves a result.

THE STAMP IS A SET BECAUSE THE MATRIX HASH IS NOT ENOUGH, and that was probed rather than assumed. `rigorMatrixContentHash` hashes `rigor_matrix/rows/*.md` and nothing else. Guidance, form templates, item templates, method cards and the engine all change what a walk costs and none of them moves it — the placeholder fix shipped in this iteration turned an unwalkable chain into a walkable one and moved zero rows.

VERIFIED. `tsc` clean, biome clean, preflight green, sweep green. The battery went from 19 failures to 10. Every one of the ten belongs to the two chunks still unbuilt: four to stand-the-rewound-tree, three to bind-a-run-and-write-its-conditions, two to conceal-the-reports-while-a-run-is-bound, and one suite roll-up. No report case is among them.

## follow_up

- stand-the-rewound-tree owns four of the ten remaining failures and is the last dependency-free chunk.
- bind-a-run-and-write-its-conditions owns three, and it is what makes the report's fields have values to carry.
- conceal-the-reports-while-a-run-is-bound owns two and WILL NOT GO GREEN here. It waits on wt-three-separate-lists-decide-which-paths-a-lane-verb-may-see-.
- THE STAMP SET IS NAMED AND NOT YET COMPUTED. `conditionsStampDirs` says which directories the conditions cover; hashing them is the binding chunk's job, because the stamp is taken when a run binds.
- `raid-asm-the-rigor-matrix-hash-identifies-what-changes-walk-cost` STAYS OPEN. Naming the directories does not close it; the engine still stamps the matrix alone everywhere else, and this is one consumer.

## anything_else

ONE CASE HERE IS WIDER THAN ITS REQUIREMENT, ON PURPOSE.

The requirement asks only that a report carry its conditions. A report stamping `rigor_matrix_hash` would satisfy it exactly as worded.

IT WOULD ALSO BE A LIE, AND THE LIE IS MEASURED. So the check asserts the SET of directories the stamp must cover, and it fails the day that set changes. Writing it the narrow way would have produced a green test over a benchmark whose central control does not control.

THE ITEM TEMPLATE CARRIES THE LIMIT RATHER THAN THE LANE. Every report says, in the template itself, that it measures process overhead under observation and never production behaviour, and that a median over at least three runs is the unit rather than a single number. Tau-bench's `pass^8` below 25 percent against single-trial under 50 percent is why. Putting that on the template means no report can be written without it.
