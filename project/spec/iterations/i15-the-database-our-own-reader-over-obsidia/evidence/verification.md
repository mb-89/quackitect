---
form: verification
reopened: "2026-08-16T19:09:01.002Z — Verification's claims form is signed correctly, but every subsequent pull refuses with SE-C-123 (wedge-guard/AND-join) trying to complete verification's failed exit_script outcome into fix-findings, identically across 5+ attempts with both qualified and unqualified choice values. se_why reports fix-findings itself has only one blocker (unsubmitted form, ready to fill) and nothing upstream waiting, contradicting se_pull's route computation. Reopening to reset internal fired/active bookkeeping that may be stuck from repeated failed completion attempts."
by: agent
signed_off: 2026-08-16T19:09:07.679Z
authors: agent
files:
---

# Evidence form / verification

## current_situation

A fresh-eyes tester subagent (no knowledge of the build) verified the two specs that could be verified from this delta: tsp-coupling-disposition and tsp-read-back-inspection.

## claims

- [x] tsp-coupling-disposition
- [x] tsp-read-back-inspection
- [owed] tsp-autonomy-tiers — raid-iss-the-autonomy-number-still-rides-every-answer
- [owed] tsp-bound-surface — raid-iss-whole-product-claims-reverified-by-every-record
- [owed] tsp-derivation-analysis — raid-issue-the-corpus-wide-inspections-have-no-runner
- [owed] tsp-desk-and-gates — raid-issue-must-demos-owed
- [owed] tsp-first-run — raid-issue-must-demos-owed
- [owed] tsp-panel-walkthrough — raid-issue-must-demos-owed
- [owed] tsp-prose-inspection — raid-issue-the-corpus-wide-inspections-have-no-runner
- [owed] tsp-record-inspection — raid-issue-the-corpus-wide-inspections-have-no-runner
- [owed] tsp-tour-run — raid-issue-must-demos-owed
- [owed] tsp-two-machines — raid-iss-whole-product-claims-reverified-by-every-record
- [owed] tsp-unattended-start — raid-debt-human-observed-demonstrations

## follow_up

TWO OBSERVED GREEN BY FRESH EYES. tsp-coupling-disposition: the tester read recordCouplingDisposition (engine/disposition.ts) directly — a bare .map with status:"pending" a literal, no threshold/config referenced inside the function, all 3 checklist lines PASS. tsp-read-back-inspection: the tester applied all 5 checklist lines to resolution.test.ts and bound-engine.test.ts independently — every write-then-read case reads back from the named store, none concludes from a bare non-throw, all 5 PASS.

A FINDING FOR FIX-FINDINGS: the tester flagged that tsp-coupling-disposition.md's own closing line still says "Not yet run — engine/disposition.ts is a throwing stub," which is now false — the function is fully implemented and was just inspected green. This state grants read-only tools by design, so the correction is fix-findings work, not verification's.

ELEVEN OWED, EACH AGAINST THE OPEN ENTRY THAT ALREADY CARRIES WHY. Four need a person watching a live session (raid-issue-must-demos-owed): tsp-first-run, tsp-panel-walkthrough, tsp-desk-and-gates, tsp-tour-run. Three demand a whole-corpus sweep nothing runs (raid-issue-the-corpus-wide-inspections-have-no-runner): tsp-prose-inspection, tsp-record-inspection, tsp-derivation-analysis. Two need two records/hosts running at once, which this delta never touches (raid-iss-whole-product-claims-reverified-by-every-record): tsp-bound-surface, tsp-two-machines. One is the numeric-autonomy leak this delta does not touch (raid-iss-the-autonomy-number-still-rides-every-answer): tsp-autonomy-tiers. One needs a cloud host that does not exist (raid-debt-human-observed-demonstrations, the open entry closest to the launch-path gap raid-debt-cloud-validation-needs-a-machine-this-one-cannot-make names but cannot itself carry, since its own status is accepted rather than open): tsp-unattended-start.

None of the eleven is new to this record and none is this record's own doing — i15's delta is the query verb and the coupling disposer, and touches none of them.

## anything_else

