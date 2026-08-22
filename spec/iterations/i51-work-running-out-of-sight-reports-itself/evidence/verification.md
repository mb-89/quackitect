---
form: verification
judgment: passed at 2026-08-21T14:15:39.497Z
by: agent
signed_off: 2026-08-21T11:52:55.133Z
authors: agent
files:
---

# Evidence form / verification

## current_situation

THE TESTER FOUND FOURTEEN FINDINGS. Eight are high confidence and every one carries a file and a line. Not one of the five requirements came back fully satisfied.

FRESH EYES DID THE WORK ([[meth-verification-discipline]]). A tester subagent read the specs first, then the code, with no share of the builder's context. It ran nothing — this state grants three read verbs and no test verb — so every verdict below is inspection of source against spec. The battery is the engine's own and runs on this submit.

THE VERDICTS, one line each.

- `req-one-call-reports-every-piece-of-work-out-of-sight` — PARTIAL. Three kinds reach one call at `run.ts:484`. A job that starts and settles between two lane calls is dropped forever at `run.ts:544`.
- `req-a-time-remaining-names-its-basis` — PARTIAL. Every branch names a basis. No branch detects a measurement that has stopped moving, which the requirement demands at its line 41.
- `req-a-leaving-check-does-not-hold-the-call` — PARTIAL. The wait is bounded at `session.ts:3730`. What the caller is handed on timeout is `"not run yet"` at `session.ts:3646`, which the requirement names as its own failure mode.
- `req-a-pending-verdict-is-recorded-against-its-state` — SATISFIED for the readers the tester could reach. Two readers it could not reach stay open.
- `req-a-diff-no-test-answers-for-is-reported-not-swept` — PARTIAL. The answer names three unmapped files and drops the rest at `discipline.ts:455`.
- All three test specs — PARTIAL. Each has a case that cannot fail on the thing it is named for.

THE ONE THAT MATTERS MOST is finding 5. On the single path the handback exists for, the refusal tells the caller the check has not started, while it is in fact running.

## claims

- [x] no spec in this record needs a person's eye — all three test specs carry `method: test`, so the battery answers for every one of them and the drawn claim list is correctly empty

## follow_up

EVERY FINDING GOES TO fix-findings, IN ONE PASS. That is the drawn path from here and it carries the write verbs this state withholds on purpose.

THE FOURTEEN, grouped by what they are.

- REAL DEFECTS IN THE ACCOUNT. A settled job the caller never saw running is dropped (`run.ts:544`). The `reported` and `seenRunning` sets are process-global, keyed without a root, and never shrink (`run.ts:529`). The basis claims "measured on this run" without checking the progress file's own start header (`run.ts:252`), where the sibling reader does check it (`tools-run.ts:223`).
- REAL DEFECTS IN THE HANDBACK. A timed-out judgment is reported as `"not run yet"` and the remedy tells the caller the script re-runs, which is false while one is in flight (`session.ts:3646`, `session.ts:3649`). No account rides on a refusal at all (`mcp.ts:159`), which is the one moment the caller most needs it.
- A MEASURE THE BUILD CANNOT MEET. The requirement says under one second; the timer is exactly 1000 ms and the call does more work after it fires. One of the two must move, not both.
- CLAUSES NOT IMPLEMENTED. Stall detection is absent entirely. The unmapped list is truncated to three with no field carrying the whole.
- DOCUMENTS THAT NOW CONTRADICT THE CODE. The design spec and the element both say an entry never leaves the table; `run.ts:533` says the opposite in as many words. The third standing, `read`, is declared in both documents and exists nowhere in `JobView`.
- TESTS THAT CANNOT FAIL. The load-bearing account case never exercises a figure (`work-account.test.ts:74`). No case anywhere measures elapsed time. The truncation case uses a one-file fixture. The implemented middle branch of the scope decision has no test at all.

THREE THINGS THE TESTER COULD NOT CHECK, said plainly rather than left blank.

- Nothing was run, so the suite's colour is unverified by fresh eyes. This submit's battery answers that half.
- The gate's own reader of the third standing was not traced. Whether a gate receives `deciding` and flattens it is genuinely open.
- The route drawer's standing read, for the same reason.

## anything_else

THE TESTER STANDS AS GATEKEEPER across the fix rounds ([[meth-verification-discipline]]). It is not respawned. After the fix pass it is shown the deltas — what was found, what changed, which runs confirm — and re-verifies against the same specs and its own standing findings.

SEVERAL FINDINGS QUOTE THE SPEC PREDICTING THEM. `tsp-a-leaving-check-hands-the-call-back:69` parked the timing case until the mechanism existed. The mechanism exists now, and the case was still not written. A parked reason that expires and is never revisited is its own failure mode, and it happened three times in this record.
