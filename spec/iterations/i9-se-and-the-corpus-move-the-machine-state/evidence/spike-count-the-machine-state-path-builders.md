---
form: spike-count-the-machine-state-path-builders
by: agent
signed_off: 2026-08-19T19:06:49.424Z
authors: agent
files:
---

# Evidence form / spike-count-the-machine-state-path-builders

## current_situation

FORTY-SEVEN CODE SITES IN THE ENGINE. The record claimed one place, about three lines. It is wrong by roughly a factor of fifteen, and this risk's own source line guessed four other modules, which was also an undercount.

### The split, which is the finding rather than the total

- RESOLVER, four. One intended resolver, and three scripts that re-implement it independently. One of those three resolves relative to the working directory rather than the root.
- CONSUMER, seventeen. They take the folder path and join a filename onto it. Safe under a move, because they ask.
- HARD-CODED, twenty-six. They write the folder name themselves and never ask anything. The majority, and the dangerous kind.

FOUR MORE HARD-CODES SIT OUTSIDE THE ENGINE. One is the ignore file. Miss that one and machine state gets committed.

### Where the risk concentrates, and it is not where it looks

THE TEST FILES ARE THE SAFETY NET RATHER THAN THE RISK. Twenty-four of them build the path themselves and fail loudly, which is exactly what a move wants.

THE PROMPT LAYER IS THE QUIET RISK. Three documents reach the agent on every turn and name the folder directly. A stale path there misdirects the agent rather than breaking a program, and nothing fails.

NINE SERVED STRINGS QUOTE A PATH TO THE AGENT at runtime. Tool descriptions, refusal remedies, banners. They build nothing, and each becomes a wrong instruction the moment the folder moves.

### Every query is recorded

ELEVEN SEARCHES, EACH WITH ITS HIT COUNT, so the count can be repeated after the move rather than taken on trust. Re-running them is the check that nothing was missed.

ONE THING THE SEARCH ENGINE WILL NOT TAKE, worth passing on: it has no look-ahead, so a word-boundary match is the form that works.

## built

- exp-how-many-places-build-a-path-from-the-machine-state-folder

## follow_up

THE MOVE IS SIZED FROM FORTY-SEVEN, NOT THREE. That is what this spike bought, and it bought it in half an hour.

THE TWENTY-SIX HARD-CODES ARE THE WORK. No rename reaches them, because they never ask a resolver. The seventeen consumers come along for free.

ONE RESOLVER IS WRONG IN A WAY THE MOVE WILL NOT FIX. A script resolves the folder relative to the working directory rather than the root, so it already answers differently depending on where it is invoked from.

### Three blind spots, named rather than left as a clean number

THE BUILD OUTPUT, THE MACHINE-STATE FOLDER ITSELF, AND THE WORKBENCH were never searched. Version control ignores all three and the search honours that.

THE FOLDER'S OWN CONTENTS MATTER MOST OF THE THREE. A generated client script is written into it carrying its own path in its usage text, and no search above could see it.

TWO ENVIRONMENT VARIABLES CARRY THE FOLDER BY VALUE into every condition script and into the test reporter. Any script that reads one gets the path without naming it, so no search for the literal can find those call sites.

### What the build owes

RE-RUN THE ELEVEN QUERIES AFTER THE MOVE. The count going to zero for the old name is the check, and it costs one call.

SEARCH THE THREE IGNORED TREES BY HAND, because no ordinary sweep will.

DECIDE WHAT HAPPENS TO THE SERVED STRINGS. They are the only class here that fails by lying to the agent rather than by throwing, and the agent cannot tell.

## anything_else

