---
form: a-score-cell-can-say-it-has-no-evidence
amended: "2026-08-24T19:58:53.811Z by agent — this form describes the mean-over-scored-axes version, which a reviewer caught as the mirror bug and which was replaced; the check it called owed now exists"
by: agent
signed_off: 2026-08-24T17:58:57.826Z
authors: agent
files:
---

# Evidence form / a-score-cell-can-say-it-has-no-evidence

## current_situation

The convergence maths already treated an unscored cell as absent: `runAgainst` says so in its own comment — a hole is not a zero, and an unscored pair contributes nothing.

THE DATUM PICK DID NOT. It summed `?? 0` over every live axis, so a candidate was charged for each axis nobody had scored.

## built

ONE FUNCTION MADE THE SAME MISTAKE ITS NEIGHBOUR ALREADY AVOIDED.

### What was wrong

The first datum is the strongest rival, picked by score over the live axes. `total` in [deliverable/engine/pugh.ts](deliverable/engine/pugh.ts) summed `c.scores[a] ?? 0`.

SO HONEST SILENCE ROUNDED TO NOUGHT, and nought reads as worst in class. A real contender with two unscored axes lost to a weaker one that happened to have every cell filled — knocked out over words nobody ever put on the page.

### What changed

THE COMPARISON RUNS ON THE AXES EVERY CANDIDATE HAS SCORED. Nobody is charged for a hole and nobody profits from one, because the axes where holes live are not in the comparison at all.

THIS PARAGRAPH FIRST DESCRIBED A DIFFERENT FIX, and that fix does not stand. It said `total` averages over the axes the candidate actually has. A reviewer caught that as the mirror bug before it shipped: a candidate scored on ONE axis at 5 beats one scored on five axes at 4 each, which rewards silence rather than punishing it.

WITH NO COMMON AXIS there is no honest ranking, so the order falls to the id. An invented number would read exactly like a measured one.

A candidate with no scores at all still returns nought, and `problems` already names it as unscored, so nothing hides.

### The hole is still reported

THIS DOES NOT SILENCE ANYTHING. `problems` names every unscored pair above the pick, and the view reports it separately. What changed is only that the arithmetic stopped inventing a value the page does not carry.

### The check

ONE IS WRITTEN NOW, and it was not when this form was signed. `deliverable/tests/pugh.test.ts` stands up a scores fixture where one candidate has a hole and a weaker rival has none, and asserts the holed one still wins.

THE FIXTURE DISCRIMINATES. `cand-holed` leads 8 to 6 on the axes they share, and loses 8 to 9 the moment its missing cell is read as a zero. So the case fails under the original bug and passes under what stands.

WRITING IT CAUGHT SOMETHING ELSE. The first version of the case asserted the holed candidate holds the DATUM seat, and went red. The datum is second place — the strongest rival the leader must beat — so leading means not holding it. The code was right and the assertion was inverted.

[observe-red's evidence](spec/iterations/i60-the-walk-gets-fast-and-it-is-measurable-/evidence/observe-red.md) records the break in the test-first order that produced this, for this chunk and two others.

## follow_up

THE CHECK THIS SECTION CALLED OWED IS WRITTEN, and its description here was itself wrong: it asked for the holed candidate to take the DATUM seat, when the datum is second place and leading means not holding it.

WHY IT IS WORTH HAVING even green from birth. This is arithmetic that decides which design wins, and the failure mode is silent — a contender vanishes and the table still looks complete.

THE GATE SHOULD RULE on whether three chunks landing without an observed red is acceptable for this round. The evidence for each says so plainly rather than leaving it to be inferred.

## anything_else

