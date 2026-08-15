---
form: draft-vision
by: agent
signed_off: 2026-08-15T10:12:43.669Z
authors: agent
files:
---

# Evidence form / draft-vision

## current_situation

The kickoff is blessed at minor and the machine below is compiled.

This iteration does not move the product's identity. It makes the machine answer faster without letting it answer less truthfully.

The vision is INHERITED rather than re-derived. The resident declaration stands in project/product.md, and the standing goal this record serves is already a requirement: req-call-answers-in-one-second.

What follows is the delta only, which is the goal conflict this record creates.

## goal_system

THE GOALS THIS RECORD SERVES, most important first.

1. THE MACHINE ANSWERS INSIDE A SECOND. This is the resident goal, standing as req-call-answers-in-one-second. Nothing here invents it.
2. THE GUARD STAYS WHOLE. The battery must keep proving everything it proves today.
3. THE ANSWER STAYS COMPLETE. A smaller answer must never be a cut answer.
4. THE MEASUREMENT STAYS HONEST. A number that cannot be separated into work and queueing is not a measurement.

THREE CONFLICTS, NAMED OPENLY. Each is real, and each has an obvious cheap resolution that this record refuses.

CONFLICT ONE, goal 1 against goal 2. The cheapest way to halve the battery is to run less of it. Thinning the test set would show up as pure win in the wall clock and would quietly cost coverage.

RULED: goal 2 wins. Speed is bought inside the guarded write path, never by removing what the guard checks. v1 faced the same choice and chose a bounded worker pool over thinning, and the record carries that shape forward.

CONFLICT TWO, goal 1 against goal 3. The cheapest way to stop the pull overflowing is to send less of the form.

RULED: goal 3 wins. The standing ruling is that the pull PAGINATES rather than overflows. Paging keeps the whole answer reachable; cutting does not, and a cut answer is worse than a slow one because nothing says what went missing.

CONFLICT THREE, goal 1 against goal 4. Measuring honestly costs a detour before any fix lands, and the detour produces no speed of its own.

RULED: goal 4 wins, and it wins FIRST. The whole ranking of what to speed up is currently derived from contended numbers, so a fix chosen on that ranking is a guess wearing a measurement's clothes.

NO NEW GOAL IS NEEDED, so no escalation is owed. All four goals are the resident ones applied to this delta, and the conflicts are between them rather than against them.

## follow_up

- The three rulings above bind the rest of this record. A later state that buys speed by thinning the battery, by cutting an answer, or by skipping the measurement is contradicting a ruled conflict, not making a trade-off.
- raid-asm-battery-timings-measure-work carries conflict three as a probe rather than an opinion.

## anything_else

ON INHERITING RATHER THAN DRAFTING.

The state's own guidance says a minor cannot move the big idea, the to-be world or the pitch, and the form drops those three mechanically. What survives is the goal system, and it survives because a delta can pull one standing goal against another.

That is exactly what happened here. Nothing in this record proposes a new goal. Three pairs of existing goals pull against each other under this delta, and each pair has a cheap wrong answer that would have looked like progress.

Writing the rulings down here costs one field. Discovering them at a gate, after the work is built the cheap way, costs the build.
