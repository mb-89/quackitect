---
id: wt-mechanical-work-a-script-could-do-in-rows-m0-05-through-m2-9
type: "[[work-token]]"
statement: |-
  Mechanical work a script could do, in rows M0_05 through M2_90: 18 findings from the rating pass.

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
place: i68-the-walk-gets-fast-the-fixed-per-call-to
ready_when: ready when the speed-up round scopes its build
---

## Why it stands

Mechanical work a script could do, in rows M0_05 through M2_90: 18 findings from the rating pass.

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

## When it comes back

ready when the speed-up round scopes its build
