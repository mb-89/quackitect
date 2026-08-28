---
id: wt-mechanical-work-a-script-could-do-in-the-14-m5-m6-rows-20-fi
type: "[[work-token]]"
statement: |-
  Mechanical work a script could do, in the 14 M5/M6 rows: 20 findings from the rating pass.

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
place: i68-the-walk-gets-fast-the-fixed-per-call-to
ready_when: ready when the speed-up round scopes its build
---

## Why it stands

Mechanical work a script could do, in the 14 M5/M6 rows: 20 findings from the rating pass.

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

## When it comes back

ready when the speed-up round scopes its build
