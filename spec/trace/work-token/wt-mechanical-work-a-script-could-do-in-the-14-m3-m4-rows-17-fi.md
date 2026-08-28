---
id: wt-mechanical-work-a-script-could-do-in-the-14-m3-m4-rows-17-fi
type: "[[work-token]]"
statement: |-
  Mechanical work a script could do, in the 14 M3/M4 rows: 17 findings from the rating pass.

  ## M4_30_evaluate-set — scores, the prior_art rule

  - what a hand does today: reads every score of 4 or 5 and checks by eye that the prior_art cell names an external comparison, because "No name, no score above 3" is enforced nowhere.
  - what a script would do instead: refuse the submit for any row scoring 4 or 5 with an empty prior_art cell, naming the candidate and axis.
  - what it needs to read: the stored score table, parsed by `readScores` — columns candidate, axis, score, prior_art.
  - confidence: certain
  - evidence: deliverable/engine/pareto.ts lines 103-105 — "NOTHING CHECKS THEM. This comment used to claim a checker read them, and no such checker exists anywhere in the engine. One scoring run put 22 of 44 cells at the top two marks with that column blank and nothing objected." The rule it fails to enforce is at deliverable/machines/rigor_matrix/rows/M4_30_evaluate-set.md line 54.

  ## M4_30_evaluate-set — reading, the flat axes

  - what a hand does today: reads the whole score grid by eye to find axes where every candidate scored alike, then writes them into the free-form `reading` field.
  - what a script would do instead: print the flat axis list and ask only the judgment — decision does not turn on it, or a criterion is missing.
  - what it needs to read: nothing new. `pareto()` already returns `flat`.
  - confidence: certain
  - evidence: deliverable/engine/pareto.ts line 86 computes `flat`; line 30 documents it as "Axes where every candidate scores the same". The field asks the hand for the same list at deliverable/machines/rigor_matrix/rows/M4_30_evaluate-set.md lines 85-86.

  ## M4_30_evaluate-set — reading, distance from utopia

  - what a hand does today: writes "How far the front sits from utopia, if that is far on every axis" as prose.
  - what a script would do instead: compute the per-axis gap between each front member and the utopia point, and print the box between utopia and nadir; the hand judges only whether the box is narrow enough to mean all-options-equal.
  - what it needs to read: nothing new. `pareto()` returns `utopia` and `nadir`.
  - confidence: certain
  - evidence: deliverable/engine/pareto.ts lines 77-85; the row's own body says so at deliverable/machines/rigor_matrix/rows/M4_30_evaluate-set.md lines 130-131 — "the front, every elimination and both corners are a FUNCTION of the score table".

  ## M4_30_evaluate-set — scores, grid completeness

  - what a hand does today: checks that every surviving candidate has a row against every surviving axis.
  - what a script would do instead: refuse or warn on the `incomplete` list before the front is drawn, since a front computed over holes is not a front.
  - what it needs to read: the score table plus `$candidates` and `$criterion_axes`.
  - confidence: worth a look — `incomplete` is computed at deliverable/engine/pareto.ts lines 60-62, and I did not confirm whether the submit reads it.
  - evidence: deliverable/engine/pareto.ts lines 33-35 and 60-62.

  ## M4_28_cut-criteria — cuts, the pool is not the delta's

  - what a hand does today: receives every non-`must` requirement in the whole product and cuts the ones this round's candidates never touch, by position, one at a time.
  - what a script would do instead: compute the pool as the axes THESE candidates differ on, from the candidate records, and serve only those rows for judgment.
  - what it needs to read: the composed candidate notes for this record, and each requirement's `function` frontmatter field against the functions under redesign.
  - confidence: certain
  - evidence: deliverable/engine/stateform.ts lines 1171-1172 — `criterionAxisItems` calls `poolNodes(traceRoot)` with no owner scope, while `typedItems` at line 1097 shows the engine already has `scopedToOwner` and `minted_in`. The row admits the gap at deliverable/machines/rigor_matrix/rows/M4_28_cut-criteria.md lines 100-102, and the owner ruling it breaks is at lines 83-89.

  ## M4_28_cut-criteria — cuts, the no-differentiation shortlist

  - what a hand does today: asks per row whether every candidate meets the axis identically by construction.
  - what a script would do instead: join each criterion's `function` field against the functions the candidates actually vary, and pre-mark the rows that are untouched by every option as shortlisted for the no-differentiation cut.
  - what it needs to read: requirement frontmatter `function`, the function nodes under redesign, and the candidate records.
  - confidence: probable — the row rules the join is a filter and never a verdict, so the script proposes and the hand still confirms each cut.
  - evidence: deliverable/machines/rigor_matrix/rows/M4_28_cut-criteria.md lines 155-157 — "one frontmatter field away", "THAT IS A FILTER AND NEVER A VERDICT".

  ## M3_10_write-requirements — set_criteria, no_tbd

  - what a hand does today: runs a text search for the four placeholder markers the sweep's own MARKERS list holds, across the requirement nodes, and writes an argument saying it found zero. The markers are not spelled out here, because writing one is what the marker check looks for.
  - what a script would do instead: run the existing marker sweep scoped to the requirement nodes as an exit script, and refuse the state on any hit, naming file and line.
  - what it needs to read: the frontmatter of every requirement node. The scanner already exists and reads fields rather than prose.
  - confidence: certain
  - evidence: deliverable/engine/bin/sweep.ts lines 17 and 29-53 hold `MARKERS` and `markerHits`. M3_10 carries no `exit_script` key at all (deliverable/machines/rigor_matrix/rows/M3_10_write-requirements.md lines 42-55), and the hand is asked for the answer in prose at line 98. The row's `legal_tools` do not include `se_run`, so the hand cannot even execute the script that exists.

  ## M3_20C_probe-assumptions — probes, the probed date

  - what a hand does today: types the probe date into the `probed` column as YYYY-MM-DD, once per assumption.
  - what a script would do instead: stamp the date when the `probe` cell is filled.
  - what it needs to read: the clock, and the cell write it is already handling.
  - confidence: certain
  - evidence: deliverable/machines/rigor_matrix/rows/M3_20C_probe-assumptions.md line 40 asks the hand to write it; deliverable/engine/editors/node-table.ts lines 5-7 show the editor already writes each cell onto the node.

  ## M3_20C_probe-assumptions — the outcome word's write-back

  - what a hand does today: writes one of four outcome words in the `probe` column, then separately edits the node so `status` becomes probed, or `kind` becomes issue where the word was `false`.
  - what a script would do instead: derive `status` and `kind` from the outcome word, since the mapping is stated and total.
  - what it needs to read: the `probe` cell it already wrote. The columns are `probe` and `probed`; `status` and `kind` are not columns, so nothing carries the consequence today.
  - confidence: certain
  - evidence: the four-way mapping is stated at deliverable/machines/rigor_matrix/rows/M3_20C_probe-assumptions.md lines 99-104; the column list that omits both keys is at lines 28-30.

  ## M3_20C_probe-assumptions — fallout after a false probe

  - what a hand does today: when an assumption proves false, hunts for every item whose `source_refs` names that entry and lists them in `fallout`.
  - what a script would do instead: reverse-index `source_refs` across the corpus and print everything pointing at the falsified entry.
  - what it needs to read: `source_refs` on every node. Half the walk already exists as `registerPull`, which reads raid to requirement in one direction and counts only `req-` ids.
  - confidence: certain
  - evidence: deliverable/engine/stateform.ts lines 968-983 is the existing half; the hand-run version is asked at deliverable/machines/rigor_matrix/rows/M3_20C_probe-assumptions.md lines 108-113. A search for `fallout` across deliverable/engine/**/*.ts returns nothing.

  ## M3_05_spawn-for-requirements and M4_05_spawn-for-candidates — the zero-ceiling pass-through

  - what a hand does today: walks a state that asks it for nothing, because the ceiling is zero and the checklist resolves to empty.
  - what a script would do instead: nothing new is needed in the script; the state needs to be skippable when `walkerCeiling()` returns zero.
  - what it needs to read: the kickoff gate's `walkers` section, which both the form resolver and the exit script already read.
  - confidence: certain, and already diagnosed in the code as unfixed.
  - evidence: deliverable/engine/bin/hands-spawned.ts lines 191-200 — "IT IS STILL WALKED, AND THAT IS THE PART THAT IS NOT FIXED. Skipping it outright needs a machine that can disable a state, which does not exist." The empty resolution is at deliverable/engine/stateform.ts lines 540-545.

  ## M3_10_write-requirements — register, the delta list

  - what a hand does today: types one node reference per line for the requirements this record moved, because the field says "only you know which this record moved".
  - what a script would do instead: pre-fill the list from `minted_in` for the minted half and from the record's own commits for the reworded half, leaving the hand to correct it.
  - what it needs to read: `minted_in` on each requirement node, plus git history for nodes modified but not minted here.
  - confidence: probable — `minted_in` and `scopedToOwner` cover minting only, and the modified-not-minted half needs git.
  - evidence: deliverable/engine/stateform.ts lines 1097-1106 show `scopedToOwner` filtering on `minted_in`; the claim that only the hand knows is at deliverable/machines/rigor_matrix/rows/M3_10_write-requirements.md line 61.

  ## M3_20A_derive-functions — functions and flows, the reference lists

  - what a hand does today: types every function node and every flow node one reference per line, after the engine has already checked coverage both ways and flow closure both ways.
  - what a script would do instead: pre-fill both lists from the nodes minted under this record, and leave the hand only the `neutrality` field, which is the one part no check catches.
  - what it needs to read: `minted_in` on function and flow nodes.
  - confidence: probable — same `minted_in` caveat as above.
  - evidence: coverage and closure are already wired at deliverable/machines/rigor_matrix/rows/M3_20A_derive-functions.md lines 20-21 and 31-36; `scopedToOwner` at deliverable/engine/stateform.ts lines 1097-1106.

  ## M3_10_write-requirements — set_criteria, complete

  - what a hand does today: argues in prose that every use-case step and extension has a covering row, and names what has none.
  - what a script would do instead: print the uncovered list; the field already declares `covers: use-case`, and `coverProblems` refuses the submit on either direction.
  - what it needs to read: nothing new for the node-level half. Step and extension granularity lives inside the use-case body and is not parsed today, so that half stays a hand's.
  - confidence: worth a look — the coarse half duplicates a wired refusal, the fine half does not exist.
  - evidence: deliverable/engine/stateform-problems.ts line 593 calls `coverProblems`; the row's own guidance says "COVERAGE IS CHECKED, NEVER WRITTEN DOWN" at deliverable/machines/rigor_matrix/rows/M3_10_write-requirements.md line 80, then asks for it again in prose at line 93.

  ## M4_10A_derive-criteria — comparisons, the implied pairs

  - what a hand does today: answers pairwise cards ten at a time over the whole non-`must` pool.
  - what a script would do instead: take the transitive closure after each answer and stop serving the pairs already implied.
  - what it needs to read: the `weighs_against` edges answered so far. Cycle detection already exists, per gate-candidates' claim that "Every pair settled, no cycle" is derived.
  - confidence: probable — it removes work rather than producing an answer, so it is a speed-up and not a replacement.
  - evidence: deliverable/machines/rigor_matrix/rows/M4_10A_derive-criteria.md lines 39-49; the derived claim is at deliverable/machines/rigor_matrix/rows/M4_90_gate-candidates.md line 71.

  ## M4_20_enumerate-space — the finder cross-products

  - what a hand does today: holds forty TRIZ principles, twelve operators and eight heuristics against every cluster, and has no mechanical record that every cell was visited.
  - what a script would do instead: mint the grid of principle by cluster so an unvisited cell is visible, and refuse a finder marked complete with cells never opened.
  - what it needs to read: the catalog files for each finder, and `$clusters`.
  - confidence: probable — the script produces the scaffold and the completeness check, never the content of a cell.
  - evidence: deliverable/machines/rigor_matrix/rows/M4_20_enumerate-space.md lines 74-84.

  ## Rows where I found nothing

  - M3_20B_identify-assumptions. The six-source sweep is a judgment per source, and a nil answer with a reason cannot be computed. The `assumptions` refs list shares the `minted_in` shape above, but the field is what the state exists to produce rather than a restatement.
  - M3_90_gate-requirements. Its six mechanical checks were already moved out by the 2026-08-07 ruling. The one remaining ask, ruling on each gap the nine-characteristic sweep names, is adjudication.
  - M4_25_run-candidates. Seeding refuses mechanically already, and the three sections it writes are authored architecture.
  - M4_90_gate-candidates. Six of seven asks were removed for being already computed. What is left is whether a stated reason is real, which is the one thing a script cannot judge.


  ---
place: i68-the-walk-gets-fast-the-fixed-per-call-to
ready_when: ready when the speed-up round scopes its build
---

## Why it stands

Mechanical work a script could do, in the 14 M3/M4 rows: 17 findings from the rating pass.

## M4_30_evaluate-set — scores, the prior_art rule

- what a hand does today: reads every score of 4 or 5 and checks by eye that the prior_art cell names an external comparison, because "No name, no score above 3" is enforced nowhere.
- what a script would do instead: refuse the submit for any row scoring 4 or 5 with an empty prior_art cell, naming the candidate and axis.
- what it needs to read: the stored score table, parsed by `readScores` — columns candidate, axis, score, prior_art.
- confidence: certain
- evidence: deliverable/engine/pareto.ts lines 103-105 — "NOTHING CHECKS THEM. This comment used to claim a checker read them, and no such checker exists anywhere in the engine. One scoring run put 22 of 44 cells at the top two marks with that column blank and nothing objected." The rule it fails to enforce is at deliverable/machines/rigor_matrix/rows/M4_30_evaluate-set.md line 54.

## M4_30_evaluate-set — reading, the flat axes

- what a hand does today: reads the whole score grid by eye to find axes where every candidate scored alike, then writes them into the free-form `reading` field.
- what a script would do instead: print the flat axis list and ask only the judgment — decision does not turn on it, or a criterion is missing.
- what it needs to read: nothing new. `pareto()` already returns `flat`.
- confidence: certain
- evidence: deliverable/engine/pareto.ts line 86 computes `flat`; line 30 documents it as "Axes where every candidate scores the same". The field asks the hand for the same list at deliverable/machines/rigor_matrix/rows/M4_30_evaluate-set.md lines 85-86.

## M4_30_evaluate-set — reading, distance from utopia

- what a hand does today: writes "How far the front sits from utopia, if that is far on every axis" as prose.
- what a script would do instead: compute the per-axis gap between each front member and the utopia point, and print the box between utopia and nadir; the hand judges only whether the box is narrow enough to mean all-options-equal.
- what it needs to read: nothing new. `pareto()` returns `utopia` and `nadir`.
- confidence: certain
- evidence: deliverable/engine/pareto.ts lines 77-85; the row's own body says so at deliverable/machines/rigor_matrix/rows/M4_30_evaluate-set.md lines 130-131 — "the front, every elimination and both corners are a FUNCTION of the score table".

## M4_30_evaluate-set — scores, grid completeness

- what a hand does today: checks that every surviving candidate has a row against every surviving axis.
- what a script would do instead: refuse or warn on the `incomplete` list before the front is drawn, since a front computed over holes is not a front.
- what it needs to read: the score table plus `$candidates` and `$criterion_axes`.
- confidence: worth a look — `incomplete` is computed at deliverable/engine/pareto.ts lines 60-62, and I did not confirm whether the submit reads it.
- evidence: deliverable/engine/pareto.ts lines 33-35 and 60-62.

## M4_28_cut-criteria — cuts, the pool is not the delta's

- what a hand does today: receives every non-`must` requirement in the whole product and cuts the ones this round's candidates never touch, by position, one at a time.
- what a script would do instead: compute the pool as the axes THESE candidates differ on, from the candidate records, and serve only those rows for judgment.
- what it needs to read: the composed candidate notes for this record, and each requirement's `function` frontmatter field against the functions under redesign.
- confidence: certain
- evidence: deliverable/engine/stateform.ts lines 1171-1172 — `criterionAxisItems` calls `poolNodes(traceRoot)` with no owner scope, while `typedItems` at line 1097 shows the engine already has `scopedToOwner` and `minted_in`. The row admits the gap at deliverable/machines/rigor_matrix/rows/M4_28_cut-criteria.md lines 100-102, and the owner ruling it breaks is at lines 83-89.

## M4_28_cut-criteria — cuts, the no-differentiation shortlist

- what a hand does today: asks per row whether every candidate meets the axis identically by construction.
- what a script would do instead: join each criterion's `function` field against the functions the candidates actually vary, and pre-mark the rows that are untouched by every option as shortlisted for the no-differentiation cut.
- what it needs to read: requirement frontmatter `function`, the function nodes under redesign, and the candidate records.
- confidence: probable — the row rules the join is a filter and never a verdict, so the script proposes and the hand still confirms each cut.
- evidence: deliverable/machines/rigor_matrix/rows/M4_28_cut-criteria.md lines 155-157 — "one frontmatter field away", "THAT IS A FILTER AND NEVER A VERDICT".

## M3_10_write-requirements — set_criteria, no_tbd

- what a hand does today: runs a text search for TBD, TBC, TBR and ??? across the requirement nodes and writes an argument saying it found zero.
- what a script would do instead: run the existing marker sweep scoped to the requirement nodes as an exit script, and refuse the state on any hit, naming file and line.
- what it needs to read: the frontmatter of every requirement node. The scanner already exists and reads fields rather than prose.
- confidence: certain
- evidence: deliverable/engine/bin/sweep.ts lines 17 and 29-53 hold `MARKERS` and `markerHits`. M3_10 carries no `exit_script` key at all (deliverable/machines/rigor_matrix/rows/M3_10_write-requirements.md lines 42-55), and the hand is asked for the answer in prose at line 98. The row's `legal_tools` do not include `se_run`, so the hand cannot even execute the script that exists.

## M3_20C_probe-assumptions — probes, the probed date

- what a hand does today: types the probe date into the `probed` column as YYYY-MM-DD, once per assumption.
- what a script would do instead: stamp the date when the `probe` cell is filled.
- what it needs to read: the clock, and the cell write it is already handling.
- confidence: certain
- evidence: deliverable/machines/rigor_matrix/rows/M3_20C_probe-assumptions.md line 40 asks the hand to write it; deliverable/engine/editors/node-table.ts lines 5-7 show the editor already writes each cell onto the node.

## M3_20C_probe-assumptions — the outcome word's write-back

- what a hand does today: writes one of four outcome words in the `probe` column, then separately edits the node so `status` becomes probed, or `kind` becomes issue where the word was `false`.
- what a script would do instead: derive `status` and `kind` from the outcome word, since the mapping is stated and total.
- what it needs to read: the `probe` cell it already wrote. The columns are `probe` and `probed`; `status` and `kind` are not columns, so nothing carries the consequence today.
- confidence: certain
- evidence: the four-way mapping is stated at deliverable/machines/rigor_matrix/rows/M3_20C_probe-assumptions.md lines 99-104; the column list that omits both keys is at lines 28-30.

## M3_20C_probe-assumptions — fallout after a false probe

- what a hand does today: when an assumption proves false, hunts for every item whose `source_refs` names that entry and lists them in `fallout`.
- what a script would do instead: reverse-index `source_refs` across the corpus and print everything pointing at the falsified entry.
- what it needs to read: `source_refs` on every node. Half the walk already exists as `registerPull`, which reads raid to requirement in one direction and counts only `req-` ids.
- confidence: certain
- evidence: deliverable/engine/stateform.ts lines 968-983 is the existing half; the hand-run version is asked at deliverable/machines/rigor_matrix/rows/M3_20C_probe-assumptions.md lines 108-113. A search for `fallout` across deliverable/engine/**/*.ts returns nothing.

## M3_05_spawn-for-requirements and M4_05_spawn-for-candidates — the zero-ceiling pass-through

- what a hand does today: walks a state that asks it for nothing, because the ceiling is zero and the checklist resolves to empty.
- what a script would do instead: nothing new is needed in the script; the state needs to be skippable when `walkerCeiling()` returns zero.
- what it needs to read: the kickoff gate's `walkers` section, which both the form resolver and the exit script already read.
- confidence: certain, and already diagnosed in the code as unfixed.
- evidence: deliverable/engine/bin/hands-spawned.ts lines 191-200 — "IT IS STILL WALKED, AND THAT IS THE PART THAT IS NOT FIXED. Skipping it outright needs a machine that can disable a state, which does not exist." The empty resolution is at deliverable/engine/stateform.ts lines 540-545.

## M3_10_write-requirements — register, the delta list

- what a hand does today: types one node reference per line for the requirements this record moved, because the field says "only you know which this record moved".
- what a script would do instead: pre-fill the list from `minted_in` for the minted half and from the record's own commits for the reworded half, leaving the hand to correct it.
- what it needs to read: `minted_in` on each requirement node, plus git history for nodes modified but not minted here.
- confidence: probable — `minted_in` and `scopedToOwner` cover minting only, and the modified-not-minted half needs git.
- evidence: deliverable/engine/stateform.ts lines 1097-1106 show `scopedToOwner` filtering on `minted_in`; the claim that only the hand knows is at deliverable/machines/rigor_matrix/rows/M3_10_write-requirements.md line 61.

## M3_20A_derive-functions — functions and flows, the reference lists

- what a hand does today: types every function node and every flow node one reference per line, after the engine has already checked coverage both ways and flow closure both ways.
- what a script would do instead: pre-fill both lists from the nodes minted under this record, and leave the hand only the `neutrality` field, which is the one part no check catches.
- what it needs to read: `minted_in` on function and flow nodes.
- confidence: probable — same `minted_in` caveat as above.
- evidence: coverage and closure are already wired at deliverable/machines/rigor_matrix/rows/M3_20A_derive-functions.md lines 20-21 and 31-36; `scopedToOwner` at deliverable/engine/stateform.ts lines 1097-1106.

## M3_10_write-requirements — set_criteria, complete

- what a hand does today: argues in prose that every use-case step and extension has a covering row, and names what has none.
- what a script would do instead: print the uncovered list; the field already declares `covers: use-case`, and `coverProblems` refuses the submit on either direction.
- what it needs to read: nothing new for the node-level half. Step and extension granularity lives inside the use-case body and is not parsed today, so that half stays a hand's.
- confidence: worth a look — the coarse half duplicates a wired refusal, the fine half does not exist.
- evidence: deliverable/engine/stateform-problems.ts line 593 calls `coverProblems`; the row's own guidance says "COVERAGE IS CHECKED, NEVER WRITTEN DOWN" at deliverable/machines/rigor_matrix/rows/M3_10_write-requirements.md line 80, then asks for it again in prose at line 93.

## M4_10A_derive-criteria — comparisons, the implied pairs

- what a hand does today: answers pairwise cards ten at a time over the whole non-`must` pool.
- what a script would do instead: take the transitive closure after each answer and stop serving the pairs already implied.
- what it needs to read: the `weighs_against` edges answered so far. Cycle detection already exists, per gate-candidates' claim that "Every pair settled, no cycle" is derived.
- confidence: probable — it removes work rather than producing an answer, so it is a speed-up and not a replacement.
- evidence: deliverable/machines/rigor_matrix/rows/M4_10A_derive-criteria.md lines 39-49; the derived claim is at deliverable/machines/rigor_matrix/rows/M4_90_gate-candidates.md line 71.

## M4_20_enumerate-space — the finder cross-products

- what a hand does today: holds forty TRIZ principles, twelve operators and eight heuristics against every cluster, and has no mechanical record that every cell was visited.
- what a script would do instead: mint the grid of principle by cluster so an unvisited cell is visible, and refuse a finder marked complete with cells never opened.
- what it needs to read: the catalog files for each finder, and `$clusters`.
- confidence: probable — the script produces the scaffold and the completeness check, never the content of a cell.
- evidence: deliverable/machines/rigor_matrix/rows/M4_20_enumerate-space.md lines 74-84.

## Rows where I found nothing

- M3_20B_identify-assumptions. The six-source sweep is a judgment per source, and a nil answer with a reason cannot be computed. The `assumptions` refs list shares the `minted_in` shape above, but the field is what the state exists to produce rather than a restatement.
- M3_90_gate-requirements. Its six mechanical checks were already moved out by the 2026-08-07 ruling. The one remaining ask, ruling on each gap the nine-characteristic sweep names, is adjudication.
- M4_25_run-candidates. Seeding refuses mechanically already, and the three sections it writes are authored architecture.
- M4_90_gate-candidates. Six of seven asks were removed for being already computed. What is left is whether a stated reason is real, which is the one thing a script cannot judge.


---

## When it comes back

ready when the speed-up round scopes its build
