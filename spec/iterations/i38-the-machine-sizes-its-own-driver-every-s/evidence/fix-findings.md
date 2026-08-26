---
form: fix-findings
by: agent
signed_off: 2026-08-20T21:33:32.420Z
authors: agent
files: null
---

# Evidence form / fix-findings

## current_situation

Nine findings came out of verification, all from a fresh-eyes tester, none of them a failing test. The battery was 1632 pass, 0 fail. The tester built an isolated copy of the repository, deleted mechanisms one at a time, and re-ran.

FIVE MECHANISMS COULD BE DELETED WITHOUT A SINGLE RED, and two of the five were not merely untested — they were broken.

ALL NINE ARE FIXED IN ONE PASS, and the confirm run is 1642 pass, 0 fail: ten more cases than the tester ran against.

### The live defect, and it was worse one layer down

A LANE CALL CARRYING A `part` OUTSIDE THE VOCABULARY WAS ANSWERED NORMALLY AND NEVER REACHED THE LOG. `append` threw, and the dispatch's log hook catches and discards, because a log hook must never break dispatch. This build put the first throw into `append`, so this build created a way for a call to vanish.

THE REFUSAL RECORD WAS BEING LOST THE SAME WAY, which the tester did not reach and the first fix exposed. A refused call is observed too, so the same bad value went to `append` again on the way to recording the refusal.

SO THE DIVISION IS NOW EXPLICIT AND WRITTEN DOWN. The LANE refuses a bad declaration, typed, before anything is logged. The LOG never refuses a record it is asked to write, and falls back — with the caller's raw claim still visible in the recorded arguments.

### The head's lookup had never worked

`active()` reports a nested id like `iterations/i1/onboard-retro`; a compiled iteration's states are named bare. The lookup missed every time, and the catch around it treats a refusal as the ordinary case, because an unrated step IS the ordinary case today.

A LOOKUP THAT MISSES AND A STEP WITH NO RATING PRODUCE THE SAME SILENCE. The silence was designed in, which is why deleting the whole call changed no test.

IT ALSO NEEDED A PINNED COLUMN TO BE REACHABLE. A difficulty is per change-size column, so an iteration before its kickoff gate has none — its M0 steps compile through `compileM0`, which has no column to read a cell from. Nothing is published there and nothing should be.

### The mark counted the wrong thing

`unreasoned` fired on any named driver with no reason, and the lane's schema asks for `named_driver` on every call while walking a rated step. Nearly every record would have carried the mark, and a mark that fires on nearly everything counts nothing.

IT FIRES ON A CALLER-DECLARED `went_weaker` NOW. "Weaker" is not computable here: a rung and a self-reported model name have no mapping between them in this tree, which is the declared design's own measurement seam.

## follow_up

THE ASYMMETRY IS TWICE VOLUNTARY NOW and that is worse than it was, honestly stated. The walker declares that it went weaker, and only then owes a sentence. `raid-risk-the-weaker-model-asymmetry-has-nothing-enforcing-it` stands at crippling and this build does not retire it.

WHAT WOULD RETIRE IT is the comparison arriving from the walk rather than from the caller: the pull knows what it published, so a later iteration could stamp the named driver where it stamps the state, and compare. That is the same shape as taking the mark off the model coordinate.

THE UNMATCHED BRANCH IS UNREACHABLE FROM ANY INPUT THE LOADER ACCEPTS, and it is not dead. It guards a coupling: the rung is `RUNGS[max(judgement, reading)]`, so the three ladders must stay the same length. That coupling is now a check, and the requirement is discharged at the loader for every input a rating can take.

ONE FINDING WAS MINE AND NOT THE TESTER'S. The field on the pull is `hand` now, not `needs`: the pull already serves a `needs` on each OPTION meaning "this door needs the person". No check would ever have caught one word doing two jobs in one envelope — the inspection found it by reading the whole thing.

WHAT THE TESTER'S METHOD COST AND BOUGHT, because it should be repeated. It cost an isolated copy of the repository and six full battery runs, about ten minutes of machine time. It bought two live defects and four checks that could not see their own mechanism removed. Reading the tests finds a missing case; reading the code finds a missing branch; only deleting the mechanism finds a check that cannot see it go.

## anything_else

