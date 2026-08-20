---
form: recurring-failure-becomes-work
by: agent
signed_off: 2026-08-19T16:46:35.222Z
authors: agent
files:
---

# Evidence form / recurring-failure-becomes-work

## current_situation

Nothing counted failures. Each refusal was answered and forgotten, so a shape that hit repeatedly in one session left the session with it.

THIS SESSION IS THE EVIDENCE. SE-C-129 refused se_run for tests five times, and each time the remedy named an argument se_test refuses. That is a defect in the pair of them, and without counting it would have been five separate annoyances rather than one finding.

## built

project/deliverable/engine/failure-shapes.ts, new.

`shapeOf(record)` returns the failure shape of one call record, or undefined when it is not a failure. THE CLAUSE IS THE SHAPE, paired with the verb. Two refusals of one clause from one verb are the same problem twice; the message text varies with the arguments and would split one shape into many.

`MISUSE_CLAUSES` names the refusals that mean the agent called a tool wrongly and was told so: SE-C-101, SE-C-046, SE-C-110, SE-C-112. The system working is not a defect, however often it happens.

`recurringShapes(records, threshold)` counts non-misuse shapes and returns those at or over the threshold, worst first. Different shapes are never collapsed.

`asWorkStatement(shape)` turns one into a statement and a `ready when …` re-entry condition, which is what the pool refuses a work token without.

TESTS. project/deliverable/tests/failure-shapes.test.ts, nine cases, all green. The four partitions the design was built around are each a case: one occurrence produces nothing, twice produces exactly one, two different shapes stay two, and misuse produces none however often it repeats.

Run on 2026-08-19: 9 passed, 0 failed.

## follow_up

THE THRESHOLD IS AN ASSUMPTION AND IT IS WRITTEN AS ONE. req-repeated-failure-shape-becomes-durable-work carries an empty measure, so "recurs" has no counted meaning. RECURRENCE_THRESHOLD is 2, the cheapest honest reading, and it is a named export so the number moves in one place when the measure lands.

THE MISUSE LIST IS AUTHORED, and that is the judgment in this module. Four clauses are on it today. A clause that belongs there and is missing turns real misuse into false work; a clause wrongly on it hides a real defect. Neither is mechanical.

NOTHING MINTS THE TOKEN YET. The module detects and phrases; it does not call the pool. Wiring it to se_note_drain's backlog path is the step that makes the work actually durable, and it needs a decision about WHEN it runs — the retro is the obvious candidate, since minting to the backlog is the retro's own judgment.

## anything_else

