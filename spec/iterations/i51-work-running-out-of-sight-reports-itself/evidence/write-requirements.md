---
form: write-requirements
by: agent
signed_off: 2026-08-21T09:05:30.495Z
authors: agent
files:
---

# Evidence form / write-requirements

## current_situation

The inputs gate is blessed and the user picture is fixed. Milestone three writes the demands.

Five rows are written across the three use cases: two, two and one. No use case reaches the fan-out threshold of five, so no clustering look is owed.

The standing rows the change touches were re-read rather than assumed. `req-work-past-its-bound-says-it-is-working` and `req-call-answers-in-one-second` both stand and neither is contradicted.

## register

- [[req-a-leaving-check-does-not-hold-the-call]]
- [[req-a-pending-verdict-is-recorded-against-its-state]]
- [[req-one-call-reports-every-piece-of-work-out-of-sight]]
- [[req-a-time-remaining-names-its-basis]]
- [[req-a-diff-no-test-answers-for-is-reported-not-swept]]

## set_criteria

- complete: every step and extension of the three use cases has a covering row, and the coverage rule is computed both ways. Walked by hand as well: the seven steps of the leaving-check case are covered by rows one and two, the six steps of the report case by rows three and four, and the four steps of the scope case by row five. NOTHING HAS NO ROW, with one qualification stated rather than hidden — extension 7a of the leaving-check case, where a verdict's ground moves while it runs, is named in row one's behaviour model as an unanswered transition rather than covered by a demand of its own. It cannot carry a pass line until the design says how staleness is detected.
- consistent: no two rows conflict, and the terms hold. "Basis" means one thing in rows three and four: something a reader could go and look at. "Kind" means one thing in rows three and five. The two rows on the leaving check are complements rather than duplicates — one is measured with a clock on one call, the other by asking each reader what it returns. AGAINST THE STANDING SET: row one does not relax `req-call-answers-in-one-second`, it is how that row is met for a case that breaches it today.
- affordable: buildable and verifiable together. Every row's method is `test`, and four of the five are assertions over a returned value with no watcher needed. The one that costs more is row five, which needs a controlled tree to change documents in. NOTHING HERE NEEDS AN INSTRUMENT THAT DOES NOT EXIST, which is what makes the set affordable rather than merely small.
- bounded: every row answers to a source in `source_refs` and every one sits inside the binding excluded list drawn at draw-context. Nothing was written for work started by another session, for a screen, or for cancelling a job — all three are excluded there with reasons. NO GOLD PLATING FOUND, and the nearest temptation was reading a running check's own progress lines to build a better estimate. That is excluded, and row four's honest fallback is what makes the exclusion survivable.
- comprehensible: a reader from any involved discipline can say what the system must do from the set alone. Each statement is one EARS sentence, each measure is a count or a duration with its unit, and each row's Detail names the readers or the branches by name rather than by reference. THE TEST APPLIED: row two names its three readers in a table, because "every reader" without a list is unverifiable by anyone who did not write it.
- no_tbd: zero. The sweep for the literal markers TBD, TBC, TBR and ??? was run over the five rows and found none. WHAT IS NOT A TBD, said because it looks like one: row one's behaviour model names a transition whose detection is unsettled. It is written as an open question in prose with an owner, not as a marker in a field.
- behaviour_modelled: ONE ROW EARNED A MODEL AND FOUR DID NOT. `req-a-leaving-check-does-not-hold-the-call` carries a state model of ten transitions, because this row introduces a state that does not exist today and a condition-and-response sentence cannot say what brings a pending verdict into being. The first line, `(nothing) -> clear`, is what forced row two to exist. THE FOUR THAT DID NOT: rows two, three, four and five are each one condition and one response, and a diagram of that restates the statement in a second notation that can then drift. Row four says so in its own body so the next reader does not ask.
- quality_groups_swept: nine answers, one per ISO/IEC 25010:2023 characteristic. PERFORMANCE EFFICIENCY — touched, and it is the whole iteration. Rows one, three and four all serve `uc-quality-performance-efficiency`, whose step 4 promised the handing-off at i1 and has never had it. RELIABILITY — touched. Row two is a reliability demand wearing a functional label: a state whose standing is misread by a gate is a correctness failure, and it is graded `crippling` for that reason. FUNCTIONAL SUITABILITY — touched lightly. Row five changes which tests answer a question, which is about the correctness of an answer rather than its speed. INTERACTION CAPABILITY — not touched. The actor is a program in all three use cases, and the mirror's presentation is in the binding excluded list. COMPATIBILITY — not touched. No interface with another system changes, and the harness boundary gains a written consequence rather than a new crossing. SECURITY — not touched. No new data crosses any boundary and no new process is spawned. MAINTAINABILITY — touched, in one direction worth naming. Row two makes every reader of a state's standing handle a third case, which is more to maintain, and that cost is the iteration's central risk rather than a side effect. FLEXIBILITY — not touched. Nothing here is host-specific, and the one host-dependent fact, the caller's limit, is deliberately not read. SAFETY — not touched. Nothing in this product can hurt anybody.

## follow_up

Functions and assumptions come next, and the machine offers both.

One demand is owed and cannot be written yet. Extension 7a of the leaving-check use case says a verdict whose ground moved while it ran is stale, and nothing decides how that is detected. It is named in row one's behaviour model as the last transition, and the design owes the answer before a row can carry a pass line for it.

One thing is settled that was open for three states. What a time remaining means for a plain shell command is answered by row four: where there is no measurement, the entry says it cannot estimate.

## anything_else

THE BEHAVIOUR MODEL EARNED ITS PLACE ONCE, AND IT PAID IMMEDIATELY.

Writing `(nothing) -> clear` for the leaving check forced the question the method card says it forces: what brings a pending verdict into being.

Nothing did. The first draft of this set had one row — the call must not be held — and that row is satisfiable by a product that answers fast and then loses the verdict.

ROW TWO EXISTS BECAUSE OF ONE LINE OF DIAGRAM. It is the same failure shape the method card records from the claim ledger: seven correct rows and none that created the thing they all talked about.

THE LAST TRANSITION IS THE HONEST ONE. `passed -> running` says a verdict can go stale, and nothing here says how that is noticed. Written as a transition with no answer rather than left out to keep the model tidy.
