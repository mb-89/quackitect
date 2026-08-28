---
id: mechanical-steps
statement: Work the method asks a hand to do that a script could compute instead, found while rating the rigor matrix.
---

# The mechanical steps

WHAT THIS IS. On 2026-08-28 four hands read all 63 rigor-matrix rows to rate
their complexity. The owner asked them to hunt at the same time: find the work
a SCRIPT could do, so it can be written rather than typed.

WHY THE RATING FOUND THEM. A row rated LOW on judgement and HIGH on reading is
a step that reads a great deal and decides very little. That is the shape a
script replaces, and the rating made it visible.

WHERE THIS GOES. The speed-up round, when it is seeded. Until then it stands
here rather than in a scratchpad, because a scratchpad does not travel.

WHAT A READER SHOULD DO WITH IT. Treat each find as a candidate, not a ruling.
Every one names the file and line it was read from, so it can be checked before
it is believed.

## The four biggest, and each has a measured failure behind it

1. A RULE STATED IN A ROW AND ENFORCED NOWHERE.
   `M4_30_evaluate-set` line 54 says "4 and 5 need that name. No name, no
   score above 3." `deliverable/engine/pareto.ts` lines 103 to 105 says in its
   own words that nothing checks them, and records the cost: 22 of 44 cells sat
   at the top two marks with that column blank, and the front was computed from
   it anyway.

2. ONE EDITOR BUG PRODUCING FOUR FIELDS OF RETYPING.
   `deliverable/engine/editors/node-table.ts` line 15 builds every cell from
   the stored fill and never opens the node, against its own header comment at
   lines 5 to 6. `stateform-problems.ts` line 371 reads the values off the
   nodes, and line 677 then refuses the hand's table for any cell left empty.

3. A COUNT CLAIMED, HELD NOWHERE, COMPUTED BY NOTHING.
   `M5_30B_decompose-structure` lines 97 to 98 name a `trace_complete` field
   holding the count of requirements reaching the structure. The field does not
   exist; the evidence list at lines 19 to 27 carries only two others. The
   computation is a plain graph traversal.

4. A SWEEP WITH NO COMPUTED CANDIDATE SET.
   `M8_20A_sweep-consistency` line 57 orders the hand to list what the
   iteration changed. Its exit script checks markers and conformance only. A
   diff of the record's own commits would produce the candidate list, and the
   judgement would stay a hand's.


---

# Hunt 1

# Mechanical work in rows M0_05 through M2_90

Rater 1. 18 finds, 11 of them `certain`.

Grounding used throughout:

- `reads:` is a live wiring key. Four rows carry it, all at M4/M5 (`M4_30_evaluate-set.md:68`, `M5_10`, `M5_20`, `M5_25`). None of my 17 rows carry one.
- `covers:` is engine-implemented. `deliverable/engine/machine.ts:44` declares it; `deliverable/engine/stateform-problems.ts:607-633` computes BOTH sides from the corpus and refuses a hole. It traverses `refines` edges only.
- Every `template: refs` field already refuses dangling references at submit — `deliverable/engine/stateform-problems.ts:590-591`.
- Every referenced node's own edges are already schema-checked — `deliverable/engine/stateform-problems.ts:597-602`.

---

## M0_90_gate-kickoff — pulled_in
- what a hand does today: reads `se_survey`, eyeballs every backlog item for a `place` naming this record, and retypes each one into the field.
- what a script would do instead: filter the backlog by `place == this record id` and emit the list pre-filled, so the bless pulls them instead of a hand collecting them.
- what it needs to read: the backlog pool on trunk that `se_survey` serves, field `place`; the current record id.
- confidence: certain
- evidence: `deliverable/machines/rigor_matrix/rows/M0_90_gate-kickoff.md:168-185` — the row says "NOT BUILT YET. Do it by hand here until it is", and records the cost: sixteen items named a record that then shipped without collecting one of them, measured 2026-08-28.

## M0_90_gate-kickoff — goals count against change_size
- what a hand does today: counts the rows of the goals table by eye and argues the column against that count.
- what a script would do instead: count the goals-table rows, refuse above six ("MORE THAN HALF A DOZEN GOALS IS TOO BIG"), and print the column the count implies as an advisory beside the choice field.
- what it needs to read: the `goals` field's own table rows; the `change_size` option list.
- confidence: probable — the refusal above six is certain, the column implication stays advisory because the choice is judgment.
- evidence: `deliverable/machines/rigor_matrix/rows/M0_90_gate-kickoff.md:216-224` — "One goal has a patch's shape. Two or three have a minor's. More than that argues for major."

## M0_10_onboard-retro — call_log_mined
- what a hand does today: queries the call log and types counts and rejection clauses since the last retro into a prose list.
- what a script would do instead: read `.se/calls.jsonl` from the last retro's timestamp, and emit the call count, the per-clause rejection counts and the refusal totals as a filled table; the hand then writes only the leads it reads off that table.
- what it needs to read: `.se/calls.jsonl`; the timestamp of the previous retro.
- confidence: certain for the figures, judgment for the leads.
- evidence: `deliverable/machines/rigor_matrix/rows/M0_10_onboard-retro.md:19-21` — "counts and rejection clauses since the last retro, one lead per line".

## M0_10_onboard-retro — promotions
- what a hand does today: goes looking for the previous record's `emit_back` list and retypes its items before judging each one.
- what a script would do instead: read the previous record's `package` state evidence, pull `emit_back`, and pre-populate this field one item per line with each awaiting a land-or-drop word.
- what it needs to read: the previous record's package-state evidence file, field `emit_back`.
- confidence: probable — the list is mechanical, the land-or-drop call is judgment.
- evidence: `deliverable/machines/rigor_matrix/rows/M0_10_onboard-retro.md:26-28` and `:89` — "The previous record's emit_back list is the first place to look".

## M0_10_onboard-retro — notes_drained pre-check
- what a hand does today: reads each pending note and decides among done, obsolete, carried and backlog.
- what a script would do instead: for each note, grep the tree for the thing it asks about and flag the ones where the code already carries it, so the `done` and `obsolete` candidates arrive pre-sorted.
- what it needs to read: the notes inbox (already wired as `$inbox`); the working tree.
- confidence: worth a look — the contract itself calls `done` and `obsolete` "CHECKS ANYONE CAN RUN", but the grep is heuristic.
- evidence: `deliverable/machines/rigor_matrix/rows/M0_10_onboard-retro.md:14-18`; CLAUDE.md, the `se_note_drain` paragraph.

## M1_90_gate-motivation — "the reference RESOLVES"
- what a hand does today: follows every value-prop id by hand and confirms a file is there, as the first per-prop review step.
- what a script would do instead: nothing new — the engine already refuses a dangling ref when `frame-delta` submits its `value_props` field, so this step is a hand re-running a check that has already passed. Strike the line.
- what it needs to read: already read; `refProblems` builds `byId` from the corpus and names every dangling id.
- confidence: certain
- evidence: check at `deliverable/engine/stateform-problems.ts:589-591`; the redundant manual step at `deliverable/machines/rigor_matrix/rows/M1_90_gate-motivation.md:74`.

## M1_90_gate-motivation — "No two props claim the same id"
- what a hand does today: scans the prop set for a duplicate id.
- what a script would do instead: nothing — a node id is its filename, so two nodes cannot share one. This is a hand checking something the filesystem already guarantees. Strike the line.
- what it needs to read: nothing.
- confidence: certain
- evidence: `deliverable/machines/rigor_matrix/rows/M1_90_gate-motivation.md:85`.

## M1_90_gate-motivation — risks_logged
- what a hand does today: attests in prose that the register is open with owners and triggers on its entries.
- what a script would do instead: read every node under `spec/trace/raid/`, report any with an empty `owner` or `trigger`, and refuse rather than print a paragraph.
- what it needs to read: `spec/trace/raid/*.md` frontmatter keys `owner` and `trigger`, both declared on the item template.
- confidence: certain
- evidence: field at `deliverable/machines/rigor_matrix/rows/M1_90_gate-motivation.md:31-32`; the declared frontmatter at `deliverable/machines/items/raid.md:29`, `:36`, `:304-305`.

## M1_90_gate-motivation — success_measurable and the Metric/Target check
- what a hand does today: reads every value prop's criteria bullets and attests that each names a Metric and a Target, and that every need carries a pass line.
- what a script would do instead: parse each value-prop node's success-criteria section and name the bullets missing either half.
- what it needs to read: `spec/trace/value-prop/*.md`, the success-criteria bullets.
- confidence: probable — the convention is a body bullet shape rather than frontmatter, so the parse is a regex rather than a field read.
- evidence: field at `deliverable/machines/rigor_matrix/rows/M1_90_gate-motivation.md:29-30` and `:80-81`; the bullet convention at `deliverable/machines/items/value-prop.md:129`.

## M1_90_gate-motivation — "audience names a stakeholder that exists"
- what a hand does today: reads each prop's `audience` and confirms the role is real.
- what a script would do instead: join every value-prop `audience` against the stakeholder node ids and name the ones that resolve to nothing.
- what it needs to read: `spec/trace/value-prop/*.md` field `audience`; `spec/trace/stakeholder/*.md` ids.
- confidence: probable — mechanical, but note the ordering: stakeholders are authored at M2, one milestone AFTER this gate, so the check can only run against the resident set.
- evidence: `deliverable/machines/rigor_matrix/rows/M1_90_gate-motivation.md:77`.

## M2_10B_map-stakeholders — coverage
- what a hand does today: writes a prose paragraph asserting that every value prop's audience resolves to a role here and that every always-on class is present or ruled out.
- what a script would do instead: compute the audience-to-role join from the corpus and refuse while any prop's audience resolves to no role, leaving the field to carry only the always-on rulings-out, which are judgment.
- what it needs to read: `spec/trace/value-prop/*.md` field `audience`; `spec/trace/stakeholder/*.md` ids; the always-on class list in `deliverable/machines/methods/meth-stakeholder-analysis.md`.
- confidence: certain that the first half is computable. The existing `covers:` key does not fit as-is, because it traverses `refines` edges and `audience` is not one — so this wants either an audience-aware coverage rule or a `reads:` wiring.
- evidence: the field at `deliverable/machines/rigor_matrix/rows/M2_10B_map-stakeholders.md:25-26`, whose guidance at `:67` says "COVERAGE IS WHAT THIS STEP PROVES", with no `covers:` and no `reads:` anywhere in the row. Its sibling in the same milestone does it right and says why: `M2_10C_write-stories.md:71-73` — "COVERAGE IS CHECKED, NEVER WRITTEN DOWN... THERE IS NO COVERAGE FIELD, deliberately. A form field asking whoever fills it to restate a computed result gets a paragraph that agrees with the engine until the day it does not."

## M1_30_frame-delta — value_props carries no covers:
- what a hand does today: nothing catches a value prop that refines no vision, or a vision element no prop serves.
- what a script would do instead: declare `covers:` on the field so the existing engine rule computes both sides, the same way `write-stories` and `generalize-use-cases` already do one and two hops downstream.
- what it needs to read: the trace corpus; already loaded at this field.
- confidence: worth a look — the guidance says "the vision is their parent", but whether the vision is a trace node with an id needs checking before the key can be added.
- evidence: field at `deliverable/machines/rigor_matrix/rows/M1_30_frame-delta.md:27-30` with no `covers:`; the parent claim at `:107`; the product note naming the gap at `:70-71` — "a need without a pass line, or a prop no story realizes, is a standing defect the orphan check should surface".

## M2_90_gate-inputs — unspecified_capability
- what a hand does today: walks the live lane tool list and the machine's offered doors by eye, against the use cases, and writes down what has no coverage.
- what a script would do instead: enumerate the lane verbs from the tool surface and the doors from the machine, join them against the use-case corpus, and emit the uncovered list as a computed field the gate cannot pass while it is non-empty.
- what it needs to read: `deliverable/engine/tools.ts` for the verb list; the machine's door definitions; `spec/trace/use-case/*.md`.
- confidence: certain — the row says so itself and a note is already filed.
- evidence: `deliverable/machines/rigor_matrix/rows/M2_90_gate-inputs.md:77-84` — "They can be compared against the use cases mechanically. Until that check is built (note-9c5253b4da67) it is walked by hand HERE." The row also records the gate failing on exactly this at `:69-71`: four capabilities with no use case were found by hand and the gate recommended pass anyway.

## M1_10_draft-vision — moore_pitch
- what a hand does today: writes the pitch and attests that all five slots are filled.
- what a script would do instead: match the fixed sentence shape and name any slot left empty or missing, since the template is literal — FOR / WHO / THE / IS A / THAT / UNLIKE / OUR PRODUCT.
- what it needs to read: the `moore_pitch` field content only.
- confidence: certain — the evidence description is itself a machine-checkable predicate, "all five slots filled".
- evidence: `deliverable/machines/rigor_matrix/rows/M1_10_draft-vision.md:35-43`.

## M2_10C_write-stories — deck shape
- what a hand does today: writes the decks, and nothing checks the shape the row calls "not common knowledge".
- what a script would do instead: parse each referenced story node's body and refuse when a slide has no separator, when a slide lacks either its statement or its evidence half, when an evidence half is non-empty before M8, or when a must-story carries no priority grade in frontmatter.
- what it needs to read: `spec/trace/story/*.md` bodies and frontmatter; the slide shape in `deliverable/machines/methods/meth-story-slideshow.md`.
- confidence: certain — every rule is a shape, fully stated.
- evidence: `deliverable/machines/rigor_matrix/rows/M2_10C_write-stories.md:59`, `:63`, `:65`, and the frontmatter grading at `:52-54`.

## M0_05 / M1_05 / M2_05 spawn rows — the ceiling arithmetic
- what a hand does today: writes a rationale reasoning that the record's walker ceiling is N and therefore this phase may or may not start a hand, once per spawn state, at every spawn state in the record.
- what a script would do instead: read the blessed `walkers` value from the kickoff, count the walkers already registered, and print "ceiling N, registered M, you may start N-M" on the form; the hand then only says whether this phase earns one.
- what it needs to read: `gate-kickoff` evidence field `walkers`; the registered-agent records in the call log.
- confidence: certain
- evidence: the ceiling ruling at `deliverable/machines/rigor_matrix/rows/M0_90_gate-kickoff.md:104-114`; the sentence retyped by hand in at least seven spawn evidence files of a single record, e.g. `spec/iterations/i4-the-panel-round-the-archived-iteration-b/evidence/spawn-for-prototype.md:21` — "declined: the record's walker ceiling is zero, so no walker may start."
- note: at `M0_05_spawn-the-hands` the script would report the ceiling as unsigned, because that row runs two states before `gate-kickoff` sets it.

## M2_20_generalize-use-cases — "NO UI MECHANICS"
- what a hand does today: reads each use case and judges whether it names buttons or screens.
- what a script would do instead: lint use-case node bodies for a small vocabulary — click, button, screen, tab, dropdown, scroll — and flag the lines for a human to confirm.
- what it needs to read: `spec/trace/use-case/*.md` bodies.
- confidence: worth a look — a lint that flags rather than refuses, since a use case may legitimately name a screen a neighbour owns.
- evidence: `deliverable/machines/rigor_matrix/rows/M2_20_generalize-use-cases.md:69`.

## M1_40B_pressure-test — findings_folded
- what a hand does today: recalls which upstream artifacts the PR-FAQ changed, and writes it as prose or says none-with-reason.
- what a script would do instead: diff the motivation artifacts between the state's entry and its exit, and pre-fill the field with the files that actually moved.
- what it needs to read: git history between the state entry commit and now, scoped to the M1 artifacts and the raid register.
- confidence: probable — the file list is mechanical, the account of WHY each moved is not.
- evidence: `deliverable/machines/rigor_matrix/rows/M1_40B_pressure-test.md:21-22` and `:53`.


---

# Hunt 2

# Mechanical work in the 14 M3/M4 rows — rater 2

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

# Hunt 3

# mechanical work in the 14 M5/M6 rows

17 finds. 9 certain, 6 probable, 2 worth a look.

`deliverable/engine/pugh.ts` lines 8 to 11 is the standing ruling this hunt keeps
landing on: "WHAT A PERSON STILL OWES at converge-pugh is the why beyond the
arithmetic and the veto on the computed winner. At reverse-sensitivity it is one
ruling per computed flip ... Nothing else is theirs to fill." Several fields in
these rows ask for more than that.

## reverse-sensitivity — reverse_graft

- what a hand does today: writes one line per strength the leader holds, naming which rivals could take it, having worked the strength list out of the score table by reading.
- what a script would do instead: emit the row set directly as the axes where score(winner) > score(rival), per rival, leaving only the plausible/not verdict and its reason for the hand.
- what it needs to read: `evaluate-set#scores`, the surviving axes from cut-criteria, the computed winner from `deliverable/engine/pugh.ts` (`PughView.winner`).
- confidence: certain
- evidence: `deliverable/machines/rigor_matrix/rows/M5_20_reverse-sensitivity.md` lines 31 to 32 claim "The list comes from the score table, so nothing is skipped by choosing what to look at", while the field at lines 23 to 25 carries no `reads:` key. Its sibling `sensitivity` at line 21 does carry `reads: evaluate-set#scores`. The contrast is inside one evidence block.

## graft-onto-the-winner — grafts, the strength and from columns

- what a hand does today: types one row per axis a loser beat the winner on, including which candidate it came from, having derived that set by eye.
- what a script would do instead: compute the row set as every (rival, axis) pair where score(rival) > score(winner) and pre-fill the `strength` and `from` columns, leaving only `verdict` and `why`.
- what it needs to read: `evaluate-set#scores`, the axis list, the declared winner.
- confidence: certain
- evidence: `deliverable/machines/rigor_matrix/rows/M5_27_graft-onto-the-winner.md` lines 39 to 41 say "The list is computed from the score table, so nothing is skipped by choosing what to look at". The field at lines 19 to 37 has `picks.from: $candidates` and no `reads:`. `$candidates` is an option source, not a read of the scores, so the completeness the guidance promises is unenforced.

## graft-onto-the-winner — rescored, the was column

- what a hand does today: retypes the winner's pre-graft score on each moved axis into a `was` column, picking from a 0-to-5 dropdown.
- what a script would do instead: fill `was` from the signed score table and make the column read-only, so the only typed number is the re-scorer's `now`.
- what it needs to read: `evaluate-set#scores` for the winner's row.
- confidence: certain
- evidence: `deliverable/machines/rigor_matrix/rows/M5_27_graft-onto-the-winner.md` line 68 declares the `was` column, line 73 defines it as "the winner's score before the graft", and lines 78 to 84 make it a hand-picked 0-to-5 value. That number is already signed at evaluate-set.

## declare-winner — the whole state

- what a hand does today: opens a state whose only computed field is redrawn from the same scores converge-pugh already showed, and writes an optional free-text comment.
- what a script would do instead: derive the declaration from `PughView.winner` and `PughView.stable` and pre-fill the state, so the only act left is the submit.
- what it needs to read: `evaluate-set#scores` through `deliverable/engine/pugh.ts`; nothing else.
- confidence: certain
- evidence: `deliverable/machines/rigor_matrix/rows/M5_25_declare-winner.md` line 19 already carries `reads: evaluate-set#scores`, and lines 50 to 52 say "The card draws the computed winner ... Nothing here recomputes or overrides it." The only unwired field is `comments` at lines 21 to 22, described as "free text, short is fine". This is the lowest-judgement, wholly-derived state in the set.

## decompose-structure — the allocation coverage check

- what a hand does today: confirms by eye that every function is implemented at least once and that no element implements nothing.
- what a script would do instead: nothing new — `elematrix.ts` already computes both lists; the row's guidance needs to stop asking for the eye-check and point at the computed view.
- what it needs to read: the element nodes' `implements` keys and the function set.
- confidence: certain
- evidence: `deliverable/machines/rigor_matrix/rows/M5_30B_decompose-structure.md` lines 78 to 79 say "Checked: every function implemented at least once, nothing implementing nothing — review-class now, engine-computed later". It is not later: `deliverable/engine/elematrix.ts` lines 37 to 40 already expose `unimplemented` and `idle`. The guidance is stale and buys hand work the engine has already done.

## decompose-structure — the owed interface cells

- what a hand does today: works out which element pairs owe an interface because a flow crosses between them.
- what a script would do instead: nothing new — `elematrix.ts` computes `owed`, `missing` and `undemanded` per pair already.
- what it needs to read: the flows, the allocation, the interface nodes.
- confidence: certain
- evidence: `deliverable/machines/rigor_matrix/rows/M5_30B_decompose-structure.md` lines 82 to 83 say "The owed cells are computable from the flows and the allocation" and then leave it as prose. `deliverable/engine/elematrix.ts` lines 22 to 43 already return exactly that.

## decompose-structure — the requirement trace union count

- what a hand does today: confirms every requirement reaches the structure, by the function chain or by a direct `satisfies`, with zero unreached.
- what a script would do instead: traverse requirement to function to element, union it with the direct `satisfies` edges, and print the unreached list and the count; refuse the submit while it is non-empty.
- what it needs to read: every requirement node, the `refines`/serves edges to functions, the `implements` key on elements and interfaces, and the `satisfies` key on elements and interfaces.
- confidence: certain
- evidence: `deliverable/machines/rigor_matrix/rows/M5_30B_decompose-structure.md` lines 97 to 98 say "THE UNION IS THE BAR: every requirement reached by one path or the other, zero unreached, counted in the trace_complete field". No `trace_complete` field exists — the evidence list at lines 19 to 27 carries only `elements` and `allocation`. A count is claimed, there is no field to hold it, and no script computes it.

## decompose-structure — the neighbour crossing law

- what a hand does today: checks both directions by authorship at submit — every flow marked `crosses: in`/`out` has an interface naming a `nbr-` target, and every element-to-neighbour interface carries at least one crossing flow.
- what a script would do instead: read the `crosses` key off every flow node and the endpoints off every interface node, and print the two difference sets.
- what it needs to read: flow nodes with `crosses:`, interface nodes' source and destination, the `nbr-` node set.
- confidence: certain
- evidence: `deliverable/machines/rigor_matrix/rows/M5_30B_decompose-structure.md` lines 115 to 123 state the law both ways, and line 145 says outright "THE ENGINE CHECK IS OWED. Until it lands the law holds by authorship at this state's submit." Lines 131 to 134 record the measurement that set the rule: 26 flows carried `crosses:`, 40 interfaces existed, and a search for `nbr-` returned zero. That is a one-query script that has already caught a real hole once.

## record-adrs — the adrs list

- what a hand does today: types one raid id per line for each decision the record minted.
- what a script would do instead: filter the register for `kind: decision` nodes minted in this record and pre-fill the list, leaving the hand to remove any that do not belong.
- what it needs to read: `spec/trace/raid/*.md` frontmatter — `kind`, `minted_in`.
- confidence: certain
- evidence: `deliverable/machines/rigor_matrix/rows/M5_30A_record-adrs.md` lines 19 to 22 declare `template: refs, of: raid` with the description "one raid id of kind decision per line". The filter is stated in the description itself.

## record-adrs — the each-traced check

- what a hand does today: confirms each decision carries its grades, its `source_refs`, a `## Rejected options` section and a `## Consequences` section, and that the refs resolve.
- what a script would do instead: lint each cited decision node for the six required keys and two required sections, and resolve every `source_ref` against the corpus.
- what it needs to read: the decision nodes' frontmatter and section headings.
- confidence: probable
- evidence: `deliverable/machines/rigor_matrix/rows/M5_30A_record-adrs.md` lines 64 to 72 list the required keys and sections. `spec/evidence-typing-prefill.md` line 73 already registers the resolution half of this as a gate-architecture prefill, so the speed-up iteration should treat the two as one job.

## rank-unknowns — the spike drawing

- what a hand does today: authors `<record>/machines/spikes.md` by hand, one state per seeded ref, all parallel, with a join waiting for every one.
- what a script would do instead: generate the drawing from the `seeded` list, since the shape is fixed and the only per-spike variable is the timebox in the drawn statement.
- what it needs to read: the `seeded` list, the register entry behind each ref for its question, and the timebox the hand sets.
- confidence: certain
- evidence: `deliverable/machines/rigor_matrix/rows/M6_10_rank-unknowns.md` lines 79 to 83 describe the expansion exactly, including "the same shape as the candidate drawing". `deliverable/machines/rigor_matrix/rows/M6_15_run-spikes.md` line 48 confirms the hand does it: "rank-unknowns AUTHORS the spike drawing". `spec/evidence-typing-prefill.md` line 74 already registers reading the drawing back; generating it is the other half and is not registered.

## rank-unknowns — the not-already-probed filter

- what a hand does today: excludes register entries that the iteration's own goal or a standing mechanism already exercises.
- what a script would do instead: flag register entries whose `source_refs` or subject already appear in the record's goal or in a standing check, as a shortlist for the hand to confirm.
- what it needs to read: the open register, the record's goal, the standing exit scripts.
- confidence: worth a look
- evidence: `deliverable/machines/rigor_matrix/rows/M6_10_rank-unknowns.md` lines 73 to 74. The match is fuzzy, so this is a prompt for the hand rather than a refusal.

## evaluate-architecture — fitness_candidates typed by hand

- what a hand does today: may type requirement references into the fitness list instead of using the deck's button.
- what a script would do instead: make the field a filter over requirement nodes carrying `fitness_candidate: true`, the same way fold-back's promotions are a filter and not a list.
- what it needs to read: the quality requirement nodes' `fitness_candidate` key.
- confidence: probable
- evidence: `deliverable/machines/rigor_matrix/rows/M5_40_evaluate-architecture.md` line 27 says "filed by the deck's fitness button, or typed as references", and `deliverable/machines/forms/templates/scenario-deck.md` lines 43 to 45 confirm "More refs can be typed into that list by hand". A typed copy can drift from the flag. `M6_20_fold-back.md` lines 66 to 67 already state the correct rule for the same shape: "PROMOTIONS ARE A FILTER, NEVER A LIST: ... A typed copy would drift from the nodes."

## fold-back — folds_to reference resolution

- what a hand does today: names what each experiment changed upstream, in free text that may name a requirement, a register entry or a structure edit.
- what a script would do instead: resolve every id named in `folds_to` against the corpus and confirm the named node was actually touched in this record's diff, refusing an unresolvable or untouched ref.
- what it needs to read: the experiment nodes' `folds_to` values, the corpus node ids, the record's own git diff.
- confidence: probable
- evidence: `deliverable/machines/rigor_matrix/rows/M6_20_fold-back.md` lines 59 to 61. The row already refuses an unanswered key (lines 63 to 64); it does not check that the answer points at anything real.

## spawn-for-architecture and spawn-for-prototype — the roster checkbox

- what a hand does today: ticks a checklist box saying a walker was started, after registering that walker through `se_run {agent}`.
- what a script would do instead: fill the box from the job registry the exit script already reads, so the box reports rather than asserts.
- what it needs to read: the agent registry the exit script consults.
- confidence: probable
- evidence: `deliverable/machines/rigor_matrix/rows/M5_05_spawn-for-architecture.md` lines 22 to 27 and the same lines in `M6_05_spawn-for-prototype.md`. `deliverable/machines/methods/meth-spawn-hands.md` lines 146 to 149 say `hands-spawned.ts` "reads the registry" already, and that it "proves a hand was registered and nothing more" — which is precisely what the checkbox restates.

## gate-architecture — the reviewer separation check

- what a hand does today: relies on the roster rule that the gate's reviewer must not have argued for the winner, with nothing recording that it held.
- what a script would do instead: compare the `part` and agent identity stamped on the calls that filled converge-pugh, graft-onto-the-winner and decompose-structure against the identity that blesses this gate, and refuse a match.
- what it needs to read: `.se/calls.jsonl` — the `actor`, `part` and `state` coordinates.
- confidence: probable
- evidence: `deliverable/machines/rigor_matrix/rows/M5_05_spawn-for-architecture.md` lines 58 to 59 make the separation the reason the phase has a roster at all, and `deliverable/machines/methods/meth-spawn-hands.md` lines 90 to 92 make it a rule. `M5_90_gate-architecture.md` line 19 is `evidence: []`, so nothing at the gate records that the separation held. The call log already carries every coordinate the check needs.

## gate-prototype — spike evidence pinned and reachable

- what a hand does today: satisfies itself that every spike's evidence is pinned and reachable from the gate record.
- what a script would do instead: resolve the evidence link on every experiment node and refuse an unresolvable or absent one.
- what it needs to read: the experiment nodes and the paths they cite.
- confidence: probable
- evidence: `deliverable/machines/rigor_matrix/rows/M6_90_gate-prototype.md` line 47 states the obligation as a document-form note. Lines 54 to 56 already struck "RESULTS RECORDED" as mechanical, so the neighbouring reachability check is the same job left undone. `spec/evidence-typing-prefill.md` line 76 registers the results half only.

## Not mechanical, checked and rejected

- `converge-pugh` — the runs are already computed by `deliverable/engine/pugh.ts` and nothing is typed. What remains is the why beyond the arithmetic and the veto, and pugh.ts lines 8 to 11 name both as the person's.
- `evaluate-architecture` verdicts — the deck, the ordering and the path are all computed (`deliverable/machines/forms/templates/scenario-deck.md` lines 20 to 29). The three-way ruling and the named hinge are judgment.
- `run-spikes` — the spikes themselves are experiments. Only the drawing that seeds them is mechanical, and that is filed against rank-unknowns.
- `gate-prototype` buildable — a milestone verdict that can reject. No script produces it.
- `graft-onto-the-winner` verdict and why — the adopted/rejected/incompatible ruling and the trade it names are the point of the state.

## A note for the speed-up iteration

`spec/evidence-typing-prefill.md` lines 71 to 76 already register six prefills
touching these rows. Three of them name fields that no longer exist:
`sensitivity_ruled`, `evaluation_recorded` and `adrs_traced` are listed against
gate-architecture, whose evidence list is now empty, and two rows are named by
their old names (`evaluate-baseline`, `consolidate-baseline`). That document
needs a pass against the current rows before it is used as a work list.

## Two ratings I now think are too high

These are NOT changed in `scratchpad/rate-3.tsv`, which stands as filed. The
correction travels here so nothing is altered silently under the collation.

- `M5_40_evaluate-architecture` — filed C3/R4, should be C3/R3. I gave R4 for
  holding the whole decomposition, the register and every scenario at once. The
  deck deals one card at a time and computes that card's path for it
  (`deliverable/machines/forms/templates/scenario-deck.md` lines 20 to 29), so
  the hand never holds the structure whole. The judgement stays C3: the
  three-way verdict and the named hinge are real. The rung drops from 4 to 3.
- `M5_25_declare-winner` — filed C1/R2, should be C1/R1, and C0/R1 is arguable.
  I gave R2 for holding the convergence and the flip rulings to write the
  comment. The comment is optional free text and the winner is drawn, so the
  reading is a single card. The rung stays 2 either way under
  max(judgement, reading) only if C1 holds; on the C0 reading the state is a
  pure derivation and the whole row is a candidate for deletion.

No rating in the set is too LOW on this second pass.


---

# Hunt 4

# Mechanical work in rows M7_05 to M9_99 — rater 4

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
