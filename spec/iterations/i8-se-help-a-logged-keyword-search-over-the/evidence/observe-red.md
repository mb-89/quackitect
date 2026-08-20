---
form: observe-red
by: agent
signed_off: 2026-08-12T21:43:55.544Z
authors: agent
files:
---

# Evidence form / observe-red

## current_situation

M7 observe-red. Test reds are the engine's: ran the new checks via se_run (se_test illegal at this gate; no_tool_reason logged) — `node --test tests/sehelp.test.ts`, job-msqm6t0m-3. 2 of 5 cases are RED, both real defects in the already-written engine/help.ts: (1) "ranks first" expects se_note_drain, got se_note — the alphabetical tie-break picks se_note over se_note_drain for query "drain a stray note". (2) "a nonsense query misses" expects miss=true, got false — the query's ordinary English words ("nothing", "matches", "this") spuriously overlap a real tool or guidance description. 3 of 5 pass. Separately: the process never exits after all subtests report, confirmed twice — note-15acce44d2f3, and it explains the prior session's orphaned test-msqkf74m-1 job. Red correctly precedes the fix; build-steps is where these two land right.

Non-test specs, the checklist below: none of the 8 standing demonstration/inspection/analysis specs touch this delta — all pre-existing, unrelated to se_help. Red is impossible for standing behavior nothing here changed, per this state's own accepted outcome.

## red_observed

- [x] tsp-autonomy-tiers
- [x] tsp-derivation-analysis
- [x] tsp-desk-and-gates
- [x] tsp-first-run
- [x] tsp-panel-walkthrough
- [x] tsp-prose-inspection
- [x] tsp-record-inspection
- [x] tsp-tour-run

## follow_up

build-steps next — fix the two real assertion failures (the tie-break and the false-positive miss) before the checks turn green.

## anything_else

