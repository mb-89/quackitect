---
form: verification
by: agent
signed_off: 2026-08-19T18:00:25.890Z
reopened: 2026-08-16T19:09:01.002Z — Verification's claims form is signed correctly, but every subsequent pull refuses with SE-C-123 (wedge-guard/AND-join) trying to complete verification's failed exit_script outcome into fix-findings, identically across 5+ attempts with both qualified and unqualified choice values. se_why reports fix-findings itself has only one blocker (unsubmitted form, ready to fill) and nothing upstream waiting, contradicting se_pull's route computation. Reopening to reset internal fired/active bookkeeping that may be stuck from repeated failed completion attempts.
authors: agent
files: null
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
- [owed] tsp-a-slow-signal-keeps-the-wait — raid-issue-must-demos-owed
- [owed] tsp-a-vehicle-is-made-and-then-drives-something-else — raid-issue-must-demos-owed
- [owed] tsp-one-door-into-the-pool — raid-issue-the-corpus-wide-inspections-have-no-runner
- [owed] tsp-the-arrival-in-one-act — raid-debt-cloud-validation-needs-a-machine-this-one-cannot-make
- [owed] tsp-the-cited-refs-resolve — raid-debt-cloud-validation-needs-a-machine-this-one-cannot-make
- [owed] tsp-the-engine-keeps-no-record-of-what-it-produced — raid-issue-the-corpus-wide-inspections-have-no-runner

## follow_up

TWO OBSERVED GREEN BY FRESH EYES. tsp-coupling-disposition: the tester read recordCouplingDisposition (engine/disposition.ts) directly - a bare .map with status:"pending" a literal, no threshold/config referenced inside the function, all 3 checklist lines PASS. tsp-read-back-inspection: the tester applied all 5 checklist lines to resolution.test.ts and bound-engine.test.ts independently - every write-then-read case reads back from the named store, none concludes from a bare non-throw, all 5 PASS.

A FINDING FOR FIX-FINDINGS: the tester flagged that tsp-coupling-disposition.md's own closing line still says "Not yet run - engine/disposition.ts is a throwing stub," which is now false - the function is fully implemented and was just inspected green. This state grants read-only tools by design, so the correction is fix-findings work, not verification's.

SEVENTEEN OWED, EACH AGAINST THE OPEN ENTRY THAT ALREADY CARRIES WHY. Four need a person watching a live session (raid-issue-must-demos-owed): tsp-first-run, tsp-panel-walkthrough, tsp-desk-and-gates, tsp-tour-run. Two more join that same bucket, minted by other iterations since this state first signed: tsp-a-slow-signal-keeps-the-wait, tsp-a-vehicle-is-made-and-then-drives-something-else. Four demand a whole-corpus sweep nothing runs (raid-issue-the-corpus-wide-inspections-have-no-runner): tsp-prose-inspection, tsp-record-inspection, tsp-derivation-analysis, tsp-one-door-into-the-pool, tsp-the-engine-keeps-no-record-of-what-it-produced. Two need two records/hosts running at once, which this delta never touches (raid-iss-whole-product-claims-reverified-by-every-record): tsp-bound-surface, tsp-two-machines. One is the numeric-autonomy leak this delta does not touch (raid-iss-the-autonomy-number-still-rides-every-answer): tsp-autonomy-tiers. Three need a cloud host that does not exist: tsp-unattended-start (raid-debt-human-observed-demonstrations), tsp-the-arrival-in-one-act and tsp-the-cited-refs-resolve (raid-debt-cloud-validation-needs-a-machine-this-one-cannot-make).

None of the seventeen is new to this record and none is this record's own doing - i15's delta is the query verb and the coupling disposer, and touches none of them.

## anything_else

