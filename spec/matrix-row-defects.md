---
id: matrix-row-defects
statement: Contradictions inside rigor-matrix rows, found while rating all 63 of them on 2026-08-28.
---

# Defects found in the matrix rows

WHAT THIS IS. Four hands read every rigor-matrix row in full on 2026-08-28 to
rate its complexity. Reading a row properly turns up things that reading it
casually does not, and this is what they found.

WHY IT IS SEPARATE FROM THE RATINGS. A rating is a judgement about how hard a
step is. These are defects in the row itself: a demand with nowhere to record
its answer, a headline the row's own guidance contradicts, a promise nothing
keeps. Different things, different fixes.

WHAT IS NOT HERE. The mechanical work — a step a script could do — is in
[[mechanical-steps]]. The spawn-row defects are on
[[wt-owner-ruling-the-positions-whose-only-job-is-to-start-a-hand]], because
the owner has ruled those rows out and the defects are the argument for it.

EVERY ONE NAMES ITS FILE AND LINE, so a reader checks rather than trusts.

## A gate asks for a ruling and gives it nowhere to go

`M3_90_gate-requirements` carries `evidence: []` at line 21. Its guidance at
lines 69 to 71 asks for a real judgement: read `quality_groups_swept` from
write-requirements, and rule on every gap it names. Each gap stays open with a
stated reason, or a row is owed before the gate blesses.

EVERY OTHER GATE THAT ASKS A JUDGEMENT GIVES IT A FIELD. `gate-candidates` has
`reasons_hold`. This one has none, so the adjudication its guidance demands is
written nowhere and nothing can refuse its absence.

THE ROW DEFENDS THE ASK AT LINE 73, calling it a real judgement that can say
no. So the empty evidence list is the mismatch, not the guidance.

## A gate's headline asserts what its own guidance calls unsettled

`M6_90_gate-prototype`'s statement reads "the riskiest assumptions are
validated by evidence". Its guidance reads "ASSUMPTIONS VALIDATED is UNDER
DISCUSSION with the owner — its shape here is not settled."

ITS ONLY EVIDENCE FIELD IS `buildable`. The gate's headline claim has no field
behind it, and the row says so about itself two paragraphs down.

## A gate is sold on a reviewer it never requires

`M5_05_spawn-for-architecture` carries the motivation "The roster is why the
architecture gate means something", and its major note says the architecture
gate spawns a reviewer later.

`M5_90_gate-architecture` has `evidence: []` and names no reviewer anywhere in
its frontmatter. The separation the earlier row is sold on is recorded nowhere
at the gate that depends on it.

## A row says the engine fills it, then asks a hand for judgement

`M7_50_verification` declares `filled_by: engine`. Its statement says the
battery runs mechanically, and its evidence description says the battery is the
engine's and needs no field.

BUT THE ROW CARRIES A `claims` CHECKLIST the agent must check per non-test
spec, and its guidance demands a spawned tester subagent with fresh context
that reads the card and the specs and then verifies, held as a gatekeeper
across the fix-findings rounds.

THAT IS A SUBSTANTIAL AGENT-ANSWERED JUDGEMENT on a row whose `filled_by` says
no agent fills it. Anything reading `filled_by` to decide whether a hand is
needed here concludes none is.

## A gate depends on a state that does not run at two sizes

`M8_90_gate-validation` declares `depends_on: run-demos`. `run-demos` is `none`
at minor and `none` at patch. Its `musts_demonstrated` field cites reports from
a state that does not run at those sizes.

THE MINOR NOTE PATCHES IT — resident reports cited as they stand — so this is
a wrinkle rather than a contradiction. It is here because the dependency and
the note say different things and only one of them is read mechanically.

## A prefill register names three fields that no longer exist

`spec/evidence-typing-prefill.md` lines 71 to 76 register six prefills touching
the M5 rows. Three name fields that are gone: `sensitivity_ruled`,
`evaluation_recorded` and `adrs_traced`, all listed against
`gate-architecture`, whose evidence list is now empty. Two more rows appear
under old names.

THAT DOCUMENT NEEDS A PASS AGAINST THE CURRENT ROWS before anybody uses it as
a work list.

## One thing checked and found NOT to be a defect

`M7_50_verification`'s `legal_tools` is a bare comma-separated scalar where
every other row uses a YAML block list. `asList` in
`deliverable/engine/machines/compile.ts` line 454 documents and handles exactly
that form, so it parses correctly.

RECORDED BECAUSE IT LOOKS WRONG AND IS NOT. The next reader who notices it
should not spend the same time.
