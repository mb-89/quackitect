---
id: wt-mechanical-work-a-script-could-do-in-rows-m7-05-to-m9-99-13
type: "[[work-token]]"
statement: |-
  Mechanical work a script could do, in rows M7_05 to M9_99: 13 findings from the rating pass.

  11 finds. 6 rated `certain`.

  ## trace-design — design_trace (the node-table)

  - what a hand does today: types a 25-row markdown table whose two columns are `realizes` and `files`, read off the same design-spec nodes the engine parses on the very next line of the same submit.
  - what a script would do instead: render the table from the nodes and serve it filled, leaving the hand only the unclaimed-file findings.
  - what it needs to read: every `design-spec` node's `realizes:` and `files:` frontmatter, which `traceDesignLawProblems` already loads.
  - confidence: certain
  - evidence: `deliverable/machines/rigor_matrix/rows/M7_45_trace-design.md:17-28` declares the field; `deliverable/engine/stateform-problems.ts:371-372` reads `fm.realizes` and `fm.files` off those same nodes; `deliverable/engine/stateform-problems.ts:677` refuses any cell the hand left empty.

  ## trace-design — the whole field duplicates specify-build's

  - what a hand does today: fills a field that is byte-identical in `of`, `items`, `columns` and `page_size` to the one it already filled two states earlier.
  - what a script would do instead: drop the field entirely, since the laws at this state read the nodes rather than the table.
  - what it needs to read: nothing new.
  - confidence: certain
  - evidence: `deliverable/machines/rigor_matrix/rows/M7_45_trace-design.md:18-27` against `deliverable/machines/rigor_matrix/rows/M7_20_specify-build.md:23-32`.

  ## The node-table editor never seeds a cell from its node

  - what a hand does today: retypes frontmatter into cells at every node-table field, because the served form carries only the stored fill.
  - what a script would do instead: populate `fl.content` from each node's frontmatter before rendering, which is what the editor's own header comment claims already happens.
  - what it needs to read: the `columns` keys on each node named in `items`.
  - confidence: certain
  - evidence: `deliverable/engine/editors/node-table.ts:5-6` says "editing the note shows in the form"; `deliverable/engine/editors/node-table.ts:15` builds every cell from `fl.content` and never opens the note. This is the root cause of the two finds above.

  ## author-tests — checks (the node-table)

  - what a hand does today: mints each test-spec node with `method:` and `verifies:` in its frontmatter, then types those same two values again as table cells.
  - what a script would do instead: fill both columns from the minted nodes and refuse only where the node itself is missing the key.
  - what it needs to read: every `test-spec` node's `method:` and `verifies:`, which `authorTestsLawProblems` already loads.
  - confidence: certain
  - evidence: `deliverable/machines/rigor_matrix/rows/M7_10_author-tests.md:22-32`; `deliverable/engine/stateform-problems.ts:424-429` parses those nodes directly.

  ## specify-build — promotions (the node-table)

  - what a hand does today: types `promote` and `chunk` per promoted spike, both of which live on the experiment node's own frontmatter.
  - what a script would do instead: render both columns from the experiment nodes, since the assignment law already reads `chunk:` from there.
  - what it needs to read: each `experiment` node's `promote:` and `chunk:`.
  - confidence: certain
  - evidence: `deliverable/machines/rigor_matrix/rows/M7_20_specify-build.md:33-41`; `deliverable/engine/stateform-problems.ts:332` `promotionAssignmentProblems` reads the same fields.

  ## sweep-consistency — the candidate document set

  - what a hand does today: works out by eye which documents teach a behaviour this iteration changed, across every surface class on the card, with no computed starting list.
  - what a script would do instead: diff the record's commits for changed symbols, file paths and node ids, then grep every describing surface for those tokens and emit a candidate list per surface class.
  - what it needs to read: the record's git range, and the documents in each class named by the `sweep_surfaces` catalog.
  - confidence: certain
  - evidence: `deliverable/machines/rigor_matrix/rows/M8_20A_sweep-consistency.md:57` tells the hand to "LIST WHAT THE ITERATION CHANGED first"; the row's exit script `deliverable/engine/bin/sweep.ts:17-54` only checks frontmatter markers and corpus conformance, and never looks for a stale document. This is the single largest reading load in my 18 rows and nothing computes any part of it.

  ## gate-implementation — debt_taken

  - what a hand does today: collects by hand the raid entries of kind `debt` this iteration opened, and types them as references.
  - what a script would do instead: resolve a `$debt-taken` item source — raid nodes with `kind: debt` scoped to the open record — exactly the way `$promotions` is already owner-scoped.
  - what it needs to read: the raid nodes' `kind:` and owner.
  - confidence: certain
  - evidence: `deliverable/machines/rigor_matrix/rows/M7_90_gate-implementation.md:27-30`; the row carries only one `$` source in total (`$iq_checklist`), so this field has no wiring; `deliverable/engine/stateform.ts:580` shows the owner-scoped pattern that would serve it.

  ## gate-implementation — risks_acceptable, the list half

  - what a hand does today: works out which implementation risks were added or regraded this iteration, then judges them.
  - what a script would do instead: compute the added-or-regraded set from the raid nodes and the record's diff, and hand the judgement that list.
  - what it needs to read: raid nodes of kind `risk`, plus their grade at the record's base commit.
  - confidence: probable
  - evidence: `deliverable/machines/rigor_matrix/rows/M7_90_gate-implementation.md:31-36`. The judgement stays a hand's; only the enumeration moves.

  ## gate-validation — musts_demonstrated, the report-on-file check

  - what a hand does today: asserts per must story that its demonstration report was performed for real and its reference is on file.
  - what a script would do instead: check `reports/rpt-<story>.md` exists in the record for every must story, and that the story's evidence half cites it.
  - what it needs to read: the record's `reports/` folder and each must story's deck.
  - confidence: certain
  - evidence: `deliverable/machines/rigor_matrix/rows/M8_15_run-demos.md:55` fixes the filename convention as `reports/rpt-<story>.md`; `deliverable/engine/stateform-problems.ts:238-266` checks only that a demonstration spec NAMES the story and that no slide half is empty, never that the report file exists.

  ## package — the package file-ref

  - what a hand does today: types the root-relative path of the ZIP that a script just built.
  - what a script would do instead: have the assembling script emit the path straight into the field.
  - what it needs to read: the packaging script's own output path.
  - confidence: probable
  - evidence: `deliverable/machines/rigor_matrix/rows/M9_20_package.md:21-23` declares the field; line 63 of the same file states the packaging is automated and that assembling by hand is the defect. The row carries no `$` source of any kind.

  ## package — the version bump

  - what a hand does today: applies a major, minor or patch bump chosen by the record's declared size.
  - what a script would do instead: read the size the engine already published for the record and bump accordingly.
  - what it needs to read: the record's size column, which the matrix already resolves per cell.
  - confidence: probable
  - evidence: `deliverable/machines/rigor_matrix/rows/M9_20_package.md:42-50` states one bump per size, with no judgement offered.

  ## The three spawn rows — the hands checklist

  - what a hand does today: ticks a one-item roster box asserting a walker was started, at spawn-for-implementation, spawn-for-validation and spawn-for-release.
  - what a script would do instead: tick it from the job registry, which the exit script already reads for the ceiling check.
  - what it needs to read: the registered agents for the open record.
  - confidence: probable
  - evidence: `deliverable/machines/rigor_matrix/rows/M7_05_spawn-for-implementation.md:21-27` and the identical blocks at `M8_05_spawn-for-validation.md:21-27` and `M9_05_spawn-for-release.md:21-27`; `deliverable/machines/methods/meth-spawn-hands.md:146-149` says `hands-spawned.ts` already reads the registry.

  ## Where I found nothing

  `observe-red` has nothing left to mechanize. The test reds are already fired by `red-observed.ts`, and the remaining checklist is a genuine per-spec judgement about whether a procedure fails today.

  `verification`'s owed-claim pre-fill is already built, contrary to what its guidance implies is still pending. `deliverable/engine/stateform-problems.ts:781-789` defines an `owed` checklist status carrying its register reference, and `openRaidRef` at line 842 resolves it.

  `fix-findings`, `build-steps` and `shipped` carry no evidence fields and nothing mechanical to lift.

  `fill-story-evidence` is already fully computed and carries no form, as its own guidance says.
place: i68-the-walk-gets-fast-the-fixed-per-call-to
ready_when: ready when the speed-up round scopes its build
---

## Why it stands

Mechanical work a script could do, in rows M7_05 to M9_99: 13 findings from the rating pass.

11 finds. 6 rated `certain`.

## trace-design — design_trace (the node-table)

- what a hand does today: types a 25-row markdown table whose two columns are `realizes` and `files`, read off the same design-spec nodes the engine parses on the very next line of the same submit.
- what a script would do instead: render the table from the nodes and serve it filled, leaving the hand only the unclaimed-file findings.
- what it needs to read: every `design-spec` node's `realizes:` and `files:` frontmatter, which `traceDesignLawProblems` already loads.
- confidence: certain
- evidence: `deliverable/machines/rigor_matrix/rows/M7_45_trace-design.md:17-28` declares the field; `deliverable/engine/stateform-problems.ts:371-372` reads `fm.realizes` and `fm.files` off those same nodes; `deliverable/engine/stateform-problems.ts:677` refuses any cell the hand left empty.

## trace-design — the whole field duplicates specify-build's

- what a hand does today: fills a field that is byte-identical in `of`, `items`, `columns` and `page_size` to the one it already filled two states earlier.
- what a script would do instead: drop the field entirely, since the laws at this state read the nodes rather than the table.
- what it needs to read: nothing new.
- confidence: certain
- evidence: `deliverable/machines/rigor_matrix/rows/M7_45_trace-design.md:18-27` against `deliverable/machines/rigor_matrix/rows/M7_20_specify-build.md:23-32`.

## The node-table editor never seeds a cell from its node

- what a hand does today: retypes frontmatter into cells at every node-table field, because the served form carries only the stored fill.
- what a script would do instead: populate `fl.content` from each node's frontmatter before rendering, which is what the editor's own header comment claims already happens.
- what it needs to read: the `columns` keys on each node named in `items`.
- confidence: certain
- evidence: `deliverable/engine/editors/node-table.ts:5-6` says "editing the note shows in the form"; `deliverable/engine/editors/node-table.ts:15` builds every cell from `fl.content` and never opens the note. This is the root cause of the two finds above.

## author-tests — checks (the node-table)

- what a hand does today: mints each test-spec node with `method:` and `verifies:` in its frontmatter, then types those same two values again as table cells.
- what a script would do instead: fill both columns from the minted nodes and refuse only where the node itself is missing the key.
- what it needs to read: every `test-spec` node's `method:` and `verifies:`, which `authorTestsLawProblems` already loads.
- confidence: certain
- evidence: `deliverable/machines/rigor_matrix/rows/M7_10_author-tests.md:22-32`; `deliverable/engine/stateform-problems.ts:424-429` parses those nodes directly.

## specify-build — promotions (the node-table)

- what a hand does today: types `promote` and `chunk` per promoted spike, both of which live on the experiment node's own frontmatter.
- what a script would do instead: render both columns from the experiment nodes, since the assignment law already reads `chunk:` from there.
- what it needs to read: each `experiment` node's `promote:` and `chunk:`.
- confidence: certain
- evidence: `deliverable/machines/rigor_matrix/rows/M7_20_specify-build.md:33-41`; `deliverable/engine/stateform-problems.ts:332` `promotionAssignmentProblems` reads the same fields.

## sweep-consistency — the candidate document set

- what a hand does today: works out by eye which documents teach a behaviour this iteration changed, across every surface class on the card, with no computed starting list.
- what a script would do instead: diff the record's commits for changed symbols, file paths and node ids, then grep every describing surface for those tokens and emit a candidate list per surface class.
- what it needs to read: the record's git range, and the documents in each class named by the `sweep_surfaces` catalog.
- confidence: certain
- evidence: `deliverable/machines/rigor_matrix/rows/M8_20A_sweep-consistency.md:57` tells the hand to "LIST WHAT THE ITERATION CHANGED first"; the row's exit script `deliverable/engine/bin/sweep.ts:17-54` only checks frontmatter markers and corpus conformance, and never looks for a stale document. This is the single largest reading load in my 18 rows and nothing computes any part of it.

## gate-implementation — debt_taken

- what a hand does today: collects by hand the raid entries of kind `debt` this iteration opened, and types them as references.
- what a script would do instead: resolve a `$debt-taken` item source — raid nodes with `kind: debt` scoped to the open record — exactly the way `$promotions` is already owner-scoped.
- what it needs to read: the raid nodes' `kind:` and owner.
- confidence: certain
- evidence: `deliverable/machines/rigor_matrix/rows/M7_90_gate-implementation.md:27-30`; the row carries only one `$` source in total (`$iq_checklist`), so this field has no wiring; `deliverable/engine/stateform.ts:580` shows the owner-scoped pattern that would serve it.

## gate-implementation — risks_acceptable, the list half

- what a hand does today: works out which implementation risks were added or regraded this iteration, then judges them.
- what a script would do instead: compute the added-or-regraded set from the raid nodes and the record's diff, and hand the judgement that list.
- what it needs to read: raid nodes of kind `risk`, plus their grade at the record's base commit.
- confidence: probable
- evidence: `deliverable/machines/rigor_matrix/rows/M7_90_gate-implementation.md:31-36`. The judgement stays a hand's; only the enumeration moves.

## gate-validation — musts_demonstrated, the report-on-file check

- what a hand does today: asserts per must story that its demonstration report was performed for real and its reference is on file.
- what a script would do instead: check `reports/rpt-<story>.md` exists in the record for every must story, and that the story's evidence half cites it.
- what it needs to read: the record's `reports/` folder and each must story's deck.
- confidence: certain
- evidence: `deliverable/machines/rigor_matrix/rows/M8_15_run-demos.md:55` fixes the filename convention as `reports/rpt-<story>.md`; `deliverable/engine/stateform-problems.ts:238-266` checks only that a demonstration spec NAMES the story and that no slide half is empty, never that the report file exists.

## package — the package file-ref

- what a hand does today: types the root-relative path of the ZIP that a script just built.
- what a script would do instead: have the assembling script emit the path straight into the field.
- what it needs to read: the packaging script's own output path.
- confidence: probable
- evidence: `deliverable/machines/rigor_matrix/rows/M9_20_package.md:21-23` declares the field; line 63 of the same file states the packaging is automated and that assembling by hand is the defect. The row carries no `$` source of any kind.

## package — the version bump

- what a hand does today: applies a major, minor or patch bump chosen by the record's declared size.
- what a script would do instead: read the size the engine already published for the record and bump accordingly.
- what it needs to read: the record's size column, which the matrix already resolves per cell.
- confidence: probable
- evidence: `deliverable/machines/rigor_matrix/rows/M9_20_package.md:42-50` states one bump per size, with no judgement offered.

## The three spawn rows — the hands checklist

- what a hand does today: ticks a one-item roster box asserting a walker was started, at spawn-for-implementation, spawn-for-validation and spawn-for-release.
- what a script would do instead: tick it from the job registry, which the exit script already reads for the ceiling check.
- what it needs to read: the registered agents for the open record.
- confidence: probable
- evidence: `deliverable/machines/rigor_matrix/rows/M7_05_spawn-for-implementation.md:21-27` and the identical blocks at `M8_05_spawn-for-validation.md:21-27` and `M9_05_spawn-for-release.md:21-27`; `deliverable/machines/methods/meth-spawn-hands.md:146-149` says `hands-spawned.ts` already reads the registry.

## Where I found nothing

`observe-red` has nothing left to mechanize. The test reds are already fired by `red-observed.ts`, and the remaining checklist is a genuine per-spec judgement about whether a procedure fails today.

`verification`'s owed-claim pre-fill is already built, contrary to what its guidance implies is still pending. `deliverable/engine/stateform-problems.ts:781-789` defines an `owed` checklist status carrying its register reference, and `openRaidRef` at line 842 resolves it.

`fix-findings`, `build-steps` and `shipped` carry no evidence fields and nothing mechanical to lift.

`fill-story-evidence` is already fully computed and carries no form, as its own guidance says.

## When it comes back

ready when the speed-up round scopes its build
