---
minted_in: i9-se-and-the-corpus-move-the-machine-state
id: exp-how-many-places-build-a-path-from-the-machine-state-folder
type: "[[experiment]]"
statement: How many places build a file path from the machine-state folder, and how many of them never ask a resolver?
probes:
  - raid-risk-a-path-that-resolves-the-machine-state-folder-is-missed
timebox: 30 minutes
form: calculation
chunk: the-move — the eleven recorded queries enter there as the check that nothing was missed, re-run after the move with the old name expected to return nothing
faked: nothing was faked, and three trees were unreachable. Version control ignores the build output, the machine-state folder itself and the workbench, and the search honours that. The folder's own contents matter most of the three, because a generated client script is written into it carrying its own path.
fallback: NOT WRITTEN IN ADVANCE, the third seeding to carry a question and a timebox with no fallback. The count was never going to falsify anything; it was going to size the work, and a fallback for a sizing probe should have said what number would change the plan.
verdict: falls
measured: 2026-08-19. Forty-seven code sites in the engine. Four resolvers, three of them scripts re-implementing the one real one. Seventeen consumers that ask. Twenty-six hard-codes that never ask. Four more hard-codes outside the engine, one of them the ignore file. Twenty-four test files and about twenty documentation files name it directly. Nine served strings quote it to the agent at runtime.
folds_to: the move is sized from forty-seven rather than three, and the twenty-six hard-codes are the work because no rename reaches them. Every query is recorded on the register entry so the count can be repeated after the move.
promote: the queries themselves. Re-running them after the move is the check that nothing was missed, and it costs one call.
source_refs:
  - rank-unknowns, the seeded pick
  - raid-iss-this-records-cited-line-numbers-moved-under-it
---

## Setup

THE RECORD CLAIMED ONE PLACE, ABOUT THREE LINES. The register entry's own
source line already doubted it and guessed at least four other modules.

THE FAILURE THIS SIZES IS THE QUIET ONE. A missed caller finds nothing at the
new location, and nothing is a legal answer here: a machine that has never run
has no call log and no notes.

## Result

FORTY-SEVEN CODE SITES IN THE ENGINE. The record is wrong by roughly a factor
of fifteen, and the entry's own guess was an undercount too.

THE SPLIT IS THE FINDING, NOT THE TOTAL.

- RESOLVER, four. One intended resolver, and three scripts that re-implement it
  independently. One of those three resolves relative to the working directory
  rather than the root.
- CONSUMER, seventeen. They take the path and join a filename onto it. Safe
  under a move, because they ask.
- HARD-CODED, twenty-six. They write the folder name themselves and never ask.
  This is the majority and it is the dangerous kind.

FOUR MORE HARD-CODES SIT OUTSIDE THE ENGINE. One is the ignore file. Miss that
one and machine state gets committed.

## Where the risk actually concentrates

THE TEST FILES ARE THE SAFETY NET RATHER THAN THE RISK. Twenty-four of them
build the path themselves and fail loudly.

THE PROMPT LAYER IS THE QUIET RISK. Three documents reach the agent every turn
and name the folder directly. A stale path there misdirects the agent rather
than breaking a program, and nothing fails.

NINE SERVED STRINGS QUOTE A PATH TO THE AGENT at runtime — tool descriptions,
refusal remedies, banners. They build nothing and each becomes a wrong
instruction after the move.

## What the count cannot see

THREE TREES WERE NEVER SEARCHED because version control ignores them: the build
output, the machine-state folder itself, and the workbench.

TWO ENVIRONMENT VARIABLES CARRY THE FOLDER BY VALUE into every condition script
and into the test reporter. Any script reading one gets the path without naming
it, so no search for the literal can reach those call sites.

A PATH ASSEMBLED AT RUNTIME from a variable or a config value would match no
literal. None was found, and the searches could not have found one.
