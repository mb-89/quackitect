---
form: a-step-stands-in-one-of-three-words
by: agent
signed_off: 2026-08-21T11:26:28.895Z
authors: agent
files:
---

# Evidence form / a-step-stands-in-one-of-three-words

## current_situation

A step's standing was a boolean, and a boolean cannot hold three words. `exit_met` said passed or not passed and had nowhere to put still-deciding.

THE WORD EXISTS NOW AND IT IS ONE OF THREE. `scriptStanding` returns passed, not passed or deciding, and nothing else.

THE PULL'S ANSWER CARRIES IT beside the boolean, at both places that report `exit_met`. The boolean stays for every reader that only wants a yes or no.

THE GATE FLATTENS TOWARD NOT-PASSED, and that is the safe direction. A gate asking whether its feeders are green sees a step whose judgment has not landed as not yet green, so it refuses rather than opening on evidence that does not exist.

## built

TWO FILES CHANGED.

`deliverable/engine/session.ts` — a new `stepStanding` returns the third word where a state declares a leaving judgment and that judgment is in flight, and the boolean's answer otherwise. It rides beside `exit_met` at both sites that report it.

`deliverable/tests/handback.test.ts` — two cases. `a step's standing is one word from a closed set of three` asserts the surface offers exactly passed, not passed and deciding and nothing else. `the pull's answer carries the standing beside the boolean` asserts every place reporting `exit_met` reports the standing too, counting both.

MEASURED, 2026-08-21: four cases in that file, all four pass. The typechecker is clean.

THE SECOND CASE COUNTS RATHER THAN SPOT-CHECKS. A third `exit_met` site added later without its standing beside it fails the case, which is what stops this from decaying into two readers that disagree.

## follow_up

`a-fresh-session-knows-a-deciding-step` IS THE LAST CHUNK, and it is the fatal one. [[raid-ar-walk-resumes-from-repo]] says the repository cannot settle a word only a live process knows.

THE MIRROR'S PAINT ALREADY HAD THE THIRD WORD in a different shape. `scriptStatus` returns `running` beside `ran` and `ok`, and `render.ts` reads it. Nothing there was flattened, so nothing there needed changing.

THE FULL BATTERY IS OWED AGAIN before the chunk closes. This change touches the pull's answer shape, which many cases read.

## anything_else

THE THREE READERS OF GREEN LANDED IN THREE DIFFERENT PLACES, and only one of them needed work.

- THE ROUTE DRAWER reads `exit_met` on the pull's answer. It now gets the word beside it, and that is this chunk.
- WHATEVER PAINTS A STEP reads `scriptStatus`, which has carried `running` since before this record. It was never flattened.
- A GATE ASKING WHETHER ITS FEEDERS ARE GREEN reads `conditionMet`, which is false while a judgment is in flight. That is a flattening, toward not-passed, and it is the safe one.

SAYING WHICH FLATTENING IS SAFE IS THE POINT. `flow-step-standing` says a reader that flattens the third value gets a wrong answer rather than a coarse one, and it names both directions. Toward passed is the unsafe one, and no reader does it.
