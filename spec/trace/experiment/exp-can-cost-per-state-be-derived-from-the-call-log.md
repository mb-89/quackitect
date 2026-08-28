---
minted_in: i37-training-iterations-a-disposable-iterati
id: exp-can-cost-per-state-be-derived-from-the-call-log
type: "[[experiment]]"
statement: Can the call log say which state each call was made in, so cost per state — the benchmark report's central number — is derivable rather than needing a new capture?
probes:
  - raid-asm-the-call-log-attributes-every-call-to-the-state-it-was-made-in
timebox: minutes — a pass over this session's own log
form: calculation
faked: nothing. The measurement ran over the real log of this walk, 1282 calls.
fallback: "pre-agreed before the run: if attribution is not derivable, el-benchmark-report needs a different input and the design change lands after two blessed gates."
folds_to: raid-asm-the-call-log-attributes-every-call-to-the-state-it-was-made-in — half false, half true by another route
promote: "the carry-forward rule: walk the log and carry each se_pull's where until the next"
verdict: holds
source_refs:
  - el-benchmark-report
  - if-benchmark-binding-to-report
  - req-a-benchmark-report-carries-the-conditions-of-its-run
chunk: derive-what-the-walk-cost
---

## The run

RUN 2026-08-19 over this walk's own log: **1282 calls**.

| what was asked | answer |
| --- | --- |
| call records carrying a state field | **0** |
| calls whose args carry a `visit` | 219 (17%) |
| `se_pull` records | 359 |
| `se_pull` records whose logged response still names `where` | **338** |
| responses visibly truncated | 0 |
| calls attributable by carrying the last pull's position forward | **1281 (99%)** |

## The verdict

IT HOLDS, and it holds by a route the assumption did not name.

NO CALL RECORD CARRIES A STATE. That half of the assumption is false, and it
was the half that mattered if the derivation had to be direct.

THE POSITION IS RECOVERABLE ANYWAY. `se_pull` logs its full response, and the
response opens with `where`. Carrying the last pull's position forward
attributes 99% of calls.

## Why 99% and not 100%

ONE CALL PRECEDES THE FIRST PULL OF THE SESSION. Nothing can attribute it
because no position had been reported yet. That is a boundary rather than a
gap.

## What it costs the design

NOTHING NEW TO CAPTURE, and that is the finding. `el-benchmark-report` derives
cost per state from the log exactly as `if-benchmark-binding-to-report`
already says, with one added rule: the derivation walks the log forward and
carries each `se_pull`'s `where` until the next one.

A STATE FIELD ON EVERY RECORD WOULD STILL BE BETTER. It would remove the
carry-forward, survive a log that starts mid-session, and cost one field the
session already knows at dispatch. It is an improvement rather than a
prerequisite.

## The measurement error inside this experiment, kept on purpose

THE FIRST PASS REPORTED 0 of 359 pull responses retaining `where`, and that
was the agent's bug rather than the log's.

The response is stored as a STRING. Searching it with the pattern that works
against an object finds nothing, because the quotes inside a JSON string are
escaped.

READ COLD, THAT ZERO SAYS THE ASSUMPTION FAILS and the design needs rewriting.
It was caught by looking at one record directly instead of trusting the count.

THIRD OCCURRENCE IN THIS ITERATION of an absence-shaped measurement that was
wrong. The rule from `find_analogy` is the answer and was under-applied here:
a control was not run before the number was believed.
