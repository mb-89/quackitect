---
form: graft-onto-the-winner
by: agent
signed_off: 2026-08-21T10:05:54.101Z
authors: agent
files:
---

# Evidence form / graft-onto-the-winner

## current_situation

The winner is declared and this state asks whether it can take what the losers did better.

Three cells were grafted and two were refused with reasons. A second hand re-scored the result with a clean context, as the state requires.

Its scores land verbatim. It also found three stale passages and one design hole in the winner's own record, and all four are fixed.

## grafts

| strength | from | verdict | why |
| --- | --- | --- | --- |
| a standing that makes a forgotten third value loud rather than silent | cand-the-measured-answer | adopted | the winner's own seams admitted the open state word lets a reader silently ignore a new value, which is the failure the fatal-graded axis exists to stop; the two are genuine alternatives so it is a replacement |
| a duration and what it was computed from as one return value | cand-the-measured-answer | adopted | it replaces the bare late computation and absorbs it; computing at the ask and carrying the basis are complements in fact, and the chart made them alternatives only because both were folded onto one row |
| one door that answers for every kind of work out of sight | cand-the-measured-answer | adopted | the winner's prose said the verb that asks still exists while its picks chose no such verb; the rider option names this listing in its own body as the door it rides beside, so the chart's telling row was wrong to make them alternatives |
| having nothing to be wrong about, by carrying no duration at all | cand-the-quiet-handback | rejected | refused on scope rather than on score: it genuinely beats the winner on the fatal axis and the winner could take it, because the winner's strengths come from the rider rather than the estimate; the iteration's first goal demands each entry say how much longer it needs, and a graft may not strike a goal |
| telling the caller when it is worth asking again | cand-the-guided-caller | rejected | the rider already delivers what it is for, since a caller that learns of completion inside an answer it was getting anyway does not need telling when to come back; the one case it still served, a job with nothing to count, is now covered by the basis field saying so |

## rescored

| axis | was | now | what_changed |
| --- | --- | --- | --- |
| req-a-wrong-act-never-passes-silently | 2 | 3 | the closed standing word, grafted from cand-the-measured-answer. Scored by a spawned second hand with a clean context, which named that cell as the whole reason the axis sat at 2 and said the closed word reaches rank one in the requirement's own table, prevented by construction rather than checked. It stopped at 3 rather than 4 for a reason the graft did not touch: an absent rider is indistinguishable from a rider never emitted |
| req-call-answers-in-one-second | 5 | 5 | nothing. Neither grafted cell touches latency or the observation of completion, and the second hand said so plainly. The 5 rests where it rested, on the rider and the unchanged handback, against AIP-151 and GitHub Actions as named comparisons |
| req-a-slowness-signal-never-shortens-the-wait | 3 | 2 | no graft. The second hand was explicit that this is one scorer disagreeing with another rather than the graft moving anything: the 3 anchor demands recorded holes, and the effect of a published figure on a person's willingness to wait is weighed nowhere in the winner's record |

## follow_up

The deciding ADRs come next, then the structure is decomposed.

TWO THINGS THE RE-SCORER FOUND GO FORWARD AS WORK RATHER THAN AS NOTES.

- AN ABSENT RIDER IS INDISTINGUISHABLE FROM A RIDER NEVER EMITTED. The rider appears only when there is something to say, so a caller relying on it can miss a completion inside an answer that reported success. That is the fatal axis's own forbidden shape and nothing in the design accounts for it. It is why the axis stopped at 3.
- THE RIDER'S PER-CALLER BOOKKEEPING IS UNPRICED. It carries whatever changed since the caller last heard, which implies state read and written on every answer. Nothing says where that state lives or what it costs against the one-second bound.

AND ONE THING IS OWED TO THE SLOWNESS AXIS. The winner publishes a figure and weighs its effect on a person's willingness to wait nowhere. The refusal to drop the estimate was made on scope, which is the one place that axis could have been weighed and was not.

## anything_else

THE SAME DEFECT CLASS APPEARED TWICE IN ONE ITERATION, and the second hand caught it both times.

At `evaluate-set` two candidate records had prose describing picks they no longer held. Fixed there, and each record says it was corrected.

HERE THE WINNER HAD THREE MORE. Its "How it works" still named the open state word, its estimate row still said no basis field, and its seams still argued FOR the open word. All three contradicted the picks the graft had just written.

AND THE GRAFT ITSELF CLAIMED SOMETHING FALSE. It said the winner is now the measured answer with a rider. Two of four rows still differ, and if it HAD been a copy the front would have collapsed to one line and the whole comparison would have been wasted.

THE PATTERN IS ONE THING: a picks list is edited and the prose beside it is not. It has now cost two review passes in one iteration.

WHAT WOULD CATCH IT MECHANICALLY. A check that reads a candidate's picks and refuses prose naming an option the candidate does not hold. Every option id is a known token and every picks list is frontmatter, so the check is a set membership test over the body's wiki links. That is a lint, not a judgment.

ONE MORE FINDING BELONGS TO THE CELL RATHER THAN THE CANDIDATE. The warning that a recomputed figure may rise lived in one candidate's prose. Grafting the cell carried the mechanism and dropped the warning. The disclosure now lives on `opt-the-figure-and-its-basis-are-two-fields`, because a property of a cell must travel with the cell.
