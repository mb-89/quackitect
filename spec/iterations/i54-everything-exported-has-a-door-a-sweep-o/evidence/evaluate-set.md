---
form: evaluate-set
by: agent
signed_off: 2026-08-26T12:39:53.296Z
authors: agent
files: null
---

# Evidence form / evaluate-set

## current_situation

Three candidates stand, composed and measured. Six criteria survived the cut, from 123.

A research hand with a clean context scored 24 rows. It received the candidate records, the six axes and the anchors. It received nothing of the composer's reasoning about which should win.

The baseline was scored too, as a reference line.

## scores

| candidate | axis | score | anchor | prior_art |
| --- | --- | --- | --- | --- |
| cand-the-narrow-guard | req-a-wrong-act-never-passes-silently | 3 | Typed refusal with a remedy on the guarded path and the shell-write bypass is named. | none |
| cand-the-narrow-guard | req-first-green-needs-a-red | 2 | The predicate is testable but no red observation or exemption is recorded. | none |
| cand-the-narrow-guard | req-call-answers-in-one-second | 3 | Measured write cost of a few milliseconds with the sweep sitting near its budget. | none |
| cand-the-narrow-guard | req-a-preflight-check-asks-the-reader-where-it-looked | 4 | One module holds the rule and every caller reads it rather than copying it. | dependency-cruiser |
| cand-the-narrow-guard | req-sweep-covers-every-drift-class | 3 | A whole-tree sweep answers completeness for the class with departures in one list. | none |
| cand-the-narrow-guard | req-only-a-file-with-its-own-door-is-withheld | 3 | A string predicate is a text proxy for a semantic reach and the write-sweep asymmetry is recorded. | none |
| cand-buy-the-sweep | req-a-wrong-act-never-passes-silently | 2 | Refuses only at lint time and the day-one suppression pass lets existing violations report green. | none |
| cand-buy-the-sweep | req-first-green-needs-a-red | 1 | No test ships and the first green is reached by suppression rather than by a red. | none |
| cand-buy-the-sweep | req-call-answers-in-one-second | 3 | Runs outside the driver's call path so it adds no latency to any admitted call. | none |
| cand-buy-the-sweep | req-a-preflight-check-asks-the-reader-where-it-looked | 3 | The rule sits in one config stanza while departures scatter across per-file comments. | none |
| cand-buy-the-sweep | req-sweep-covers-every-drift-class | 2 | Covers import forms only and suppressed sites drop out of the report in silence. | none |
| cand-buy-the-sweep | req-only-a-file-with-its-own-door-is-withheld | 1 | With no importer axis the rule refuses the very door it means to allow. | none |
| cand-the-handed-capability | req-a-wrong-act-never-passes-silently | 1 | A rank 1 claim with nothing enforcing it degrades to a silent pass. | none |
| cand-the-handed-capability | req-first-green-needs-a-red | 1 | No checkable mechanism exists so no red is observable at any point. | none |
| cand-the-handed-capability | req-call-answers-in-one-second | 3 | Parameter passing adds no runtime cost to an admitted call. | none |
| cand-the-handed-capability | req-a-preflight-check-asks-the-reader-where-it-looked | 2 | The governed set is spread over 29 composition roots instead of one place. | none |
| cand-the-handed-capability | req-sweep-covers-every-drift-class | 1 | There is no sweep so drift back to a direct import is invisible. | none |
| cand-the-handed-capability | req-only-a-file-with-its-own-door-is-withheld | 3 | Handing the capability governs exactly what it hands but leaves direct imports ungoverned. | none |

## front


## reading

### The front has one member

cand-the-narrow-guard scores at least as high as every other candidate on every axis, and higher on four. Nothing trades against it. The front is one candidate wide.

ONE CROSSING EXISTS IN THE WHOLE SET. cand-buy-the-sweep beats cand-the-handed-capability on four axes and loses on door-exactness. Neither dominates the other, and both are dominated by the narrow guard.

### The front sits AT utopia, and that is a warning

Utopia is the best score any candidate reached on each axis: 3, 2, 3, 4, 3, 3. That is the narrow guard's own line, exactly.

A front that reaches utopia on every axis means no candidate was better than the winner at anything. The set was not really multi-objective. Lines that never cross are the all-options-equal signal arriving as a picture.

UTOPIA ITSELF IS LOW. The best score reached anywhere is a single 4. The rest of the top line is 3, and one axis tops out at 2. This is not a strong field; it is a weak field with one member less weak than the others.

### The axis every candidate scored alike

req-call-answers-in-one-second: 3, 3, 3, and 3 for the baseline.

THAT ROW SHOULD HAVE BEEN CUT AND I KEPT IT. I reasoned that only the write-time guard spends the budget. The scorer judged that a few milliseconds against a one-second bound is a 3 for everybody, and it is right.

WHICH OF THE TWO IT IS: the decision does not turn on latency, because the budget is three orders of magnitude above the cost. A DISCRIMINATING CRITERION IS MISSING in its place, and it is about the SWEEP's runtime rather than the call's. The sweep already measured 974 ms for the current rule set, which is close to the one-second figure. A rule set that grows has a real ceiling and no row watches it.

### An elimination I do not fully accept

THE SCORE: cand-buy-the-sweep, 1 on req-only-a-file-with-its-own-door-is-withheld, anchored "with no importer axis the rule refuses the very door it means to allow".

THE DISAGREEMENT, recorded beside the score and not over it: the suppression-comment route gives the importer axis back, per file, and its explanation is mandatory in the syntax. Scored on that route the row is a 2 or a 3, not a 1.

WHY I LEAVE THE 1 STANDING. The scorer's reading is defensible on the rule as configured, and the suppression route is a departure mechanism rather than a rule mechanism. Overwriting a clean-context score with the composer's own reading is the exact failure the spawn exists to prevent.

IT DOES NOT CHANGE THE FRONT. At 3 on that axis buy-the-sweep would tie the narrow guard there and still lose on four others.

### The disconfirming question, asked out loud

THE NARROW GUARD IS THE SHAPE THE REQUIREMENTS WERE WRITTEN FOR. It already exists in this tree for another rule. It then dominated on six criteria drawn from the same register those requirements live in.

That is a validation-shaped question finding validation, and it should be said before the result is used.

THE FALSIFYING QUESTION: which of the six axes would a reader who had never seen the existing rule have chosen? Two of the six (the one-copy row and the door-exactness row) are close paraphrases of what that rule already does well.

WHAT SURVIVES THE QUESTION ANYWAY: the two axes that are not paraphrases are the four ranked failure modes and the first-green-needs-a-red row. The narrow guard wins both, and it wins the first one at rank 3 rather than rank 1 - which is an honest, unflattering placement.

## follow_up

- A missing criterion is named above: nothing scores the SWEEP's runtime. The current sweep measured 974 ms against a one-second reference, and a growing rule set has a ceiling no row watches. That belongs in the register, not in this form.

- The set was not really multi-objective. One candidate dominates every other and the front reaches utopia on all six axes. The design gate should ask whether three candidates was enough rather than accepting a clean winner.

- The best score anywhere is a single 4. Nothing in this field reaches 5, and only one row cites a named comparison at all. That is a field of solid baselines, and the decision milestone should be told so plainly.

- The disagreement on cand-buy-the-sweep's door-exactness score is recorded and left standing. If the design milestone wants it re-scored, the suppression route has to be composed as its own candidate rather than argued into this one.

## anything_else

THE `front` FIELD IS DERIVED AND STORES NOTHING, so it is left empty on purpose. The template says a reading is recomputed rather than copied, because a stored front drifts the moment one score changes.

THE ARITHMETIC, so the gate can check it without recomputing by hand. Higher is better; A dominates B when A is at least equal everywhere and higher somewhere.

| candidate | the six scores in axis order |
| --- | --- |
| cand-the-narrow-guard | 3, 2, 3, 4, 3, 3 |
| cand-buy-the-sweep | 2, 1, 3, 3, 2, 1 |
| cand-the-handed-capability | 1, 1, 3, 2, 1, 3 |
| baseline | 0, 0, 3, 0, 0, 0 |

- The narrow guard dominates all three others.
- buy-the-sweep and the handed capability cross on the last axis, so neither dominates the other.
- Both dominate the baseline.

THE BASELINE SCORES 3 ON ONE AXIS AND ZERO ON FIVE. Doing nothing meets the latency bound perfectly, which is the clearest evidence that the latency row does not belong in this set.
