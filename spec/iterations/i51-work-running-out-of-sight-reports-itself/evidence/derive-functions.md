---
form: derive-functions
by: agent
signed_off: 2026-08-21T09:08:47.417Z
authors: agent
files:
---

# Evidence form / derive-functions

## current_situation

Five requirement rows stand. This state derives what the system must DO for them, solution-neutral.

Two new functions hang under `fn-run-a-governed-walk`, and one resident function gains a row.

Three flows were minted, because two of the new functions produce things the tree had no name for.

## functions

- [[fn-run-a-governed-walk.hand-back-a-step-still-deciding]]
- [[fn-run-a-governed-walk.account-for-work-out-of-sight]]
- [[fn-run-a-governed-walk.answer-with-tests]]

## flows

- [[flow-work-under-way]]
- [[flow-work-account]]
- [[flow-step-standing]]
- [[flow-instruction]]
- [[flow-worktree]]
- [[flow-test-timings]]
- [[flow-battery-verdict]]

## neutrality

THE TEST IS ONE QUESTION: could two honestly different designs both do this? Applied to each of the three, with the tempting non-neutral wording named.

`hand-back-a-step-still-deciding` PASSES. It says the caller gets control back while a leaving JUDGMENT is still being reached, and that the judgment stays attached to the step.

- THE TEMPTATION WAS "start the exit script and return a handle". That names a process, a handle and today's mechanism in seven words.
- WHAT THE NEUTRAL WORDING ADMITS: a design that computes the judgment inline and caches it, a design that hands it to something else entirely, and a design where the caller is told rather than asking.
- THE WORD "JUDGMENT" IS DOING THE WORK. Calling it a script would have chosen the winner before M4 enumerated anything.

`account-for-work-out-of-sight` PASSES. It says the system states what is under way, how far each piece has left, and what the estimate rests on.

- THE TEMPTATION WAS "list the job tables with a time remaining computed from the previous run's case count". That names two tables, a list, and the arithmetic.
- WHAT THE NEUTRAL WORDING ADMITS: an account that rides every answer rather than being asked for, and an estimate from a count of finished steps rather than from a previous run.
- "WHAT THE ESTIMATE RESTS ON" IS THE NEUTRAL FORM of the honesty demand. It holds for a basis nobody has thought of.

`answer-with-tests` PASSES AND ALREADY DID. Its statement promises the narrowest scope that settles a question. The fifth row is that promise reaching the honest end of its own range, so no new wording was needed.

THE THIRD TELL WAS APPLIED, the one no word list catches: does the function only make sense given one design?

- Ask what `hand-back-a-step-still-deciding` would be called in a design where judgments are reached by a separate service. Answer: the same thing. It passes.
- Ask what `account-for-work-out-of-sight` would be called in a design that pushes rather than answers. Answer: the same thing. It passes.

NO NOUN NAMES A PRODUCT and no verb names an implementation. "Poll", "cache", "queue", "handle" and "script" appear nowhere in the three statements.

WHERE A SOLUTION IS GENUINELY FORCED, it is a constraint rather than a function. One exists and it is already recorded as a boundary fact rather than a function: the caller's own limit on how long it will wait is not ours to set or read. It rides as a CONTROL on the first function, which is where a forced condition belongs.

## follow_up

Assumptions come next, sweeping these rows for what they lean on.

One finding from the flow walk belongs to the design rather than here. `flow-work-under-way` has no declared producer, because the two things that start work today do not declare it as an output. That is the two-table split seen from the flow side, and it is the design's to close.

One question stays open from milestone three. How a passed verdict is noticed to have gone stale is still unanswered, and it is the last transition in the first row's behaviour model.

## anything_else

THE FLOWS, FUNCTION BY FUNCTION, since the field carries only references.

- `hand-back-a-step-still-deciding` consumes `flow-instruction` and `flow-worktree`, and produces `flow-instruction` and `flow-step-standing`. It answers the caller and publishes where the step stands.
- `account-for-work-out-of-sight` consumes `flow-work-under-way` and `flow-test-timings`, and produces `flow-work-account`. The timings are the only measurement that exists today, which is why they are an input rather than a detail.
- `answer-with-tests` is unchanged in its flows. Saying that nothing answers is a different value on `flow-battery-verdict`, not a new thing crossing.

THREE OF THE SEVEN ARE NEW, and each was forced by a function producing something the tree could not name.

- `flow-work-under-way` is deliberately ONE flow rather than one per kind. The split into two tables is the defect this iteration ends, and two flows would carry it into the design.
- `flow-work-account` carries the basis beside every figure, because the measurement behind it is recorded as unreliable.
- `flow-step-standing` names a third value. Passed and not-passed always existed and were never named as something crossing; still-deciding is what forced the naming.

THE OUTPUT WALK FOUND SOMETHING THE REQUIREMENT WALK COULD NOT, which is why the method runs both.

`flow-step-standing` has three consumers and none is a function in this tree. A gate, the route drawer and whatever paints a step are existing behaviour inside functions that already stand.

THE METHOD CARD CALLS THAT A HOLE: an output nobody consumes means a missing function, or work nobody needs. Here it is neither. It is consumed by readers the resident tree never modelled as functions, and recutting the tree to model them is outside the change's cone.

ONE INPUT HAS NO DECLARED PRODUCER. `flow-work-under-way` is produced by whatever starts the work, and neither of today's two starters declares it as an output. That is the two-table split seen from the flow side, and it is named rather than papered over.
