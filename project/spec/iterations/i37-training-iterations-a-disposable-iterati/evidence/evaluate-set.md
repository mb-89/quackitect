---
form: evaluate-set
by: agent
signed_off: 2026-08-19T18:48:00.433Z
authors: agent
files:
---

# Evidence form / evaluate-set

## current_situation

i37 stands at evaluate-set. Three candidates are composed, three standing criteria survived the cut, and this iteration's own three criteria are ranked on their nodes because the offered list did not carry them.

Nine scores are written: three candidates against the three surviving axes.

The three own criteria are read rather than scored, and the reading below says how.

## scores

| cand-the-thin-run | req-a-wrong-act-never-passes-silently | 2 | The ceiling is a check, so a wrong read passes if the check errors. The positive control catches a wrong ABSENCE but says nothing about the ceiling itself. |  |
| cand-the-refusing-run | req-a-wrong-act-never-passes-silently | 3 | Same checked ceiling, plus a forbidden request per run that proves the guard was watching at the moment the numbers were taken. |  |
| cand-the-guarded-run | req-a-wrong-act-never-passes-silently | 5 | The wrong act cannot be expressed. A request for a commit past the rewind point cannot be formed, so there is no path on which it passes silently. | Property-based testing and fuzzing keep the failing input rather than re-deriving it; making the illegal state unconstructible is the same move one level up. ref-agent-benchmark-harnesses-2026. |
| cand-the-thin-run | req-fallen-condition-named | 2 | A run whose ancestry test cannot be exercised still binds and then refuses per request, producing a report full of refusals that reads as a machine failure. |  |
| cand-the-refusing-run | req-fallen-condition-named | 5 | A run that cannot establish its own ceiling never binds. One refusal names one cause, at the earliest point where the cause is knowable. | Laboratory practice refuses a reading when the control fails rather than reporting it with a caveat. ref-agent-benchmark-harnesses-2026, the calibration transfer. |
| cand-the-guarded-run | req-fallen-condition-named | 3 | There is less to fall, because the ceiling is structural. What can still fall — the visibility rule, the report writer — falls mid-run rather than at bind time. |  |
| cand-the-thin-run | req-walk-survives-host-swap | 4 | The three unrecoverable conditions are written at bind time, so a result taken on any host carries the model, the effort and the harness. | SPEC and TPC quote every result with its conditions rather than deriving them afterwards. ref-agent-benchmark-harnesses-2026. |
| cand-the-refusing-run | req-walk-survives-host-swap | 1 | Conditions are derived from the call log, and the log holds none of the three that matter. On a host swap the result cannot say what it was taken on. |  |
| cand-the-guarded-run | req-walk-survives-host-swap | 4 | Same bind-time write as the thin run, and the incremental report means a run that dies on an unfamiliar host still leaves its conditions. | SPEC and TPC again — the reference configuration is recorded before the run, not after. ref-agent-benchmark-harnesses-2026. |

## front


## reading

THE ARITHMETIC PICKS THE GUARDED RUN AND THE ARITHMETIC IS NOT THE WHOLE ANSWER.

Totals across the three scored axes: guarded 12, refusing 9, thin 8. No candidate is dominated on every axis, so all three sit on the front.

WHAT THE NUMBERS CANNOT SEE, and it decides this.

### The guarded run's best cell has never been run

It scores 5 on silent-failure because a future commit cannot be expressed. Nothing has tested whether the lane's verbs can read from a history that genuinely ends at a commit. The export was probed. The ancestry primitive was probed. This was not.

A 5 ON AN UNPROBED MECHANISM AND A 5 ON A PROBED ONE ARE NOT THE SAME NUMBER, and the table has no column for that.

### The refusing run's 1 is fixable by swapping one cell

It scores 1 on host-swap because it derives conditions from a log that does not hold the model, the effort or the harness. That is one cell. Give it the thin run's conditions cell and it scores 4 there while keeping its 5 on fallen-condition.

THAT FOURTH CURVE NOBODY DREW WOULD TOTAL 12, level with the guarded run, on entirely probed mechanisms.

### This iteration's own criteria point the same way

They are ranked ceiling first, then conditions, then concealment. Read against the candidates:

- THE CEILING. The guarded run is strongest and unproved. The refusing run is second and fully probed.
- THE CONDITIONS. The thin run and the guarded run are equal; the refusing run fails on one cell.
- THE CONCEALMENT. The guarded run's single visibility rule is the only answer that does not depend on three lists agreeing, and it is a work token this iteration does not own.

### The reading

TAKE THE REFUSING RUN WITH THE THIN RUN'S CONDITIONS CELL, and carry the guarded run's unrepresentable ceiling into M6 as the spike that could still overturn it.

WHY NOT THE GUARDED RUN OUTRIGHT. Its winning margin rests entirely on a mechanism nobody has run, and it makes a work token this iteration does not own into a hard dependency. Choosing it now would be choosing a design on the strength of an unprobed claim, which is what M6 exists to prevent.

WHY NOT THE THIN RUN. It is the cheapest and it scores lowest on the criterion this iteration ranked first. Cheapness is not the axis.

## follow_up

- gate-candidates is next. The recommendation it carries is the composed fourth curve rather than any of the three as drawn.
- THE FOURTH CURVE NEEDS DRAWING before the gate, or the gate rules on something that is not on the chart.
- M6 CARRIES ONE SPIKE FROM HERE, and it is now ranked: can the lane read from a history that ends at the rewind commit? If yes, the guarded run's ceiling is available and the choice reopens at its own escalation. If no, the refusing run's checked ceiling plus its forbidden-request proof is the answer.
- The single visibility rule stays a work token rather than becoming a dependency, which is the practical consequence of not taking the guarded run whole.

## anything_else

ONE SCORE IN THIS TABLE IS DOING WORK THE TABLE CANNOT SHOW, and it is worth saying plainly.

The guarded run scores 5 on silent failure. So would a design that solved the problem by magic. The anchor asks what the candidate achieves, not what it has been shown to achieve, so an unprobed mechanism and a measured one score identically.

THIS ITERATION HAS ALREADY BEEN BITTEN BY EXACTLY THAT SHAPE. Twice in one session an absence was read as a finding when it was a refusal, and the calibration analogy exists because of it. The same instinct applies here: a number with nothing behind it looks exactly like a number with everything behind it.

SO THE READING CARRIES THE EVIDENCE GRADE and the table does not. That is a gap in the form rather than a complaint about it — the prior_art column asks for a named external comparison, which is not the same question as has this been run here.
