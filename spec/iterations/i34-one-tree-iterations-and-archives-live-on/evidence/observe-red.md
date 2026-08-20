---
form: observe-red
by: agent
signed_off: 2026-08-16T09:04:08.163Z
authors: agent
files: null
---

# Evidence form / observe-red

## current_situation

i34 stands at observe-red, the gate between the specification and the build. Nothing of the old behaviour has been removed yet.

FOUR NEW REQUIREMENTS NEED A RED. Three verify by test and one by inspection, which is the split author-tests argued and the reason this state has both halves to report.

THE THREE TESTS ARE WRITTEN AND ALL THREE FAIL: project/deliverable/tests/onetree.test.ts, run test-msvh8sho-12, 0 of 3 passing. Each fails for the reason its requirement names, and the failure text is quoted below rather than summarised.

THE INSPECTION RED IS A READING, because the demand is the absence of a tree-chooser and no run can show an absence.

## red_observed

- [x] tsp-autonomy-tiers
- [x] tsp-bound-surface
- [x] tsp-derivation-analysis
- [x] tsp-desk-and-gates
- [x] tsp-first-run
- [x] tsp-panel-walkthrough
- [x] tsp-prose-inspection
- [x] tsp-read-back-inspection
- [x] tsp-record-inspection
- [x] tsp-tour-run
- [x] tsp-unattended-start

## follow_up

- THE INSPECTION RED, and it was the only one of the ten original non-test specs carrying a new demand. req-every-record-path-resolves-in-one-tree asks that no call selects between trees. Six choosers stood when this state first ran.
  - resolve.ts:48 — `return roots.bound ?? roots.machine`, which IS the selection.
  - resolve.ts:60 — builds `Roots` from a bound path, feeding the branch above.
  - paths.ts:237 — `machineRootOf`, whose whole job is stripping `.worktrees/<id>` off a path.
  - paths.ts:210 — `fansOut`, which exists because several trees hold copies of one method file.
  - paths.ts:267 — `methodFilesIn`, the other half of that fan-out.
  - files.ts:329 with session.ts:1155 — `setMethodMirror` and `fanOutMethod`, the copying itself.
- AN ELEVENTH SPEC JOINED AFTER THIS STATE FIRST SIGNED. tsp-unattended-start came in when i28's specification was merged back into the corpus during the rescue step, and it is a demonstration rather than a test.
- ITS RED IS OBSERVED AND IT IS OLDER THAN i34. The demonstration has never been run at all: it needs a host nobody prepared, and this machine cannot make one. That is raid-debt-cloud-validation-needs-a-machine-this-one-cannot-make, owned by the owner, and it was red before this iteration existed.
- i34 ALSO CHANGED WHAT IT DEMONSTRATES. The entrypoint had seven steps and now has six — `adopt` went with the claim system. The spec's step table, its scope line and its pass line all said seven, and all three are corrected here rather than left to be discovered at the demonstration.
- NINE SPECS HAVE NOTHING TO OBSERVE. i34 adds no requirement to tsp-autonomy-tiers, tsp-bound-surface, tsp-derivation-analysis, tsp-desk-and-gates, tsp-first-run, tsp-panel-walkthrough, tsp-prose-inspection, tsp-record-inspection or tsp-tour-run. Their boxes are checked because the checklist demands every box, not because a red was seen.
- THE THREE TEST REDS, each with the words the run produced.
  - req-a-pull-carrying-no-choice-enters-no-iteration: a bare pull at the container entered `iterations/i1/onboard-retro`, with `walked: [iterations/i1/start, iterations/i1/onboard-retro]`. The record was entered and bound by a pull carrying no choice.
  - req-a-records-own-status-decides-whether-it-is-open: a record stamped `status: shipped` stayed on the offer, which read `["iterations/i1","iterations/i2"]`.
  - req-a-closed-records-folder-stays-on-trunk: after `itCloseShipped`, `project/spec/iterations/i1-open-iteration-number-1` is gone from the working tree.
- NEXT IS build-steps.

## anything_else

ONE CHECK PASSED ON THE FIRST RUN AND THE PASS WAS FALSE. It is recorded here because it is the failure mode this whole state exists to catch.

The shipped-status check asserted that the container's offer did not include `iterations/i1-open-iteration-number-1`. The offer never carries that string. `generateIterations` keys every node by `itShortId`, so the options read `iterations/i1`. The assertion looked for something that could not have been in the list under any behaviour, and passed.

A CHECK THAT CANNOT FAIL IS WORSE THAN NO CHECK. It reports coverage it does not have, and it would have gone green after the build for the same wrong reason — so the build would have been declared correct on evidence that never tested it.

WHAT CAUGHT IT was this state's own discipline and nothing else. The red was expected, the green arrived, and the green had to be explained. Had all three failed on the first run, nobody would have looked.

THE CORRECTION IS IN THE TEST, with the reasoning kept beside it, and the check now fails: `["iterations/i1","iterations/i2"]`.
