---
minted_in: i62-background-work-reports-its-own-end-the-
id: req-a-run-closes-its-own-entry-when-its-process-exits
type: "[[requirement]]"
statement: When a process the product launched exits, the product shall settle that work's entry with the process's own outcome, without waiting for any interval to fall due.
kind: functional
verify_method: test
measure: "runs that exit normally and whose entry is still recorded as running one second later: zero. Kinds of launched work whose exit does not settle its own entry: zero."
breaks_if_removed: "The heartbeat becomes the only guard, so every ordinary exit waits up to a full interval to be noticed and the account is wrong for that whole window."
breaks_how_badly: corrosive
priority: must
refines:
  - uc-close-the-record-of-work-that-has-ended
source_refs:
  - raid-iss-a-finished-run-keeps-reporting-itself-as-running
  - vp-autonomy-range
---

## Detail

TWO CLOSERS, AND THIS IS THE FIRST ONE. It is the direct fix and it costs no
new machinery: the exit is already observed, and what is missing is the write
that follows it.

EVERY KIND, NOT ONE. The product's job table holds shell work, test runs, a
step's leaving judgment and a registered hand. This row binds all four.

| kind | closes itself today | after this row |
| --- | --- | --- |
| test run | partly — a settled record on disk beats a running one in memory | yes |
| shell job | no | yes |
| leaving judgment | no | yes |
| registered hand | no, and it is closed by the driving agent | yes on process exit where one exists |

WHY THE HEARTBEAT IS STILL NEEDED. A run that crashes or is killed never
reaches its own close, and those are the runs that produced the entries this
record was opened for.

WHAT THE PRODUCT ALREADY DOES, so this row is not specified twice. A previous
instance's abandoned entries are settled when the next instance starts. That
covers a restart and does not cover a process dying while this instance runs.

NO BEHAVIOUR MODEL HERE. One condition, one response.
