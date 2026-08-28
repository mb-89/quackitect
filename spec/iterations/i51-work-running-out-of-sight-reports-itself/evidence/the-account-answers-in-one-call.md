---
form: the-account-answers-in-one-call
by: agent
signed_off: 2026-08-21T11:15:39.346Z
authors: agent
files: null
---

# Evidence form / the-account-answers-in-one-call

## current_situation

The one table already returned finished operations beside running ones — that came with the previous chunk, because recovering a record from disk does not care whether it ended.

WHAT IT DID NOT CARRY WAS THE OUTCOME. A test run's outcome is a verdict rather than a stream, so an entry said `running: false` and nothing else. A caller that missed the moment learned a run had ended and never learned how.

AND A FINISHED RUN'S DURATION GREW FOR EVER. Nothing recorded when the verdict landed, so `duration_ms` counted from the start to now.

BOTH ARE CLOSED. An entry carries a one-line outcome, and a settled run reports how long it took.

## built

ONE FILE CHANGED AND ONE CASE ADDED.

`deliverable/engine/run.ts` — `JobView` and `Job` gain `outcome`. A new `testOutcome` reads a verdict into one line: green or red, with the counts where the verdict carries them. `testOperations` was split along its own phases into `lastRecord`, `testOutcome` and `testOperation`, because adding the outcome pushed it past the complexity ceiling and `guidance/craft/software.md` says the fix is splitting rather than suppressing.

`deliverable/tests/work-account.test.ts` — one case: `a settled operation keeps what happened, for a caller that missed it`. It asserts the outcome reads `red — 1719 of 1722 passed, 3 failed`, and that the duration is 100 seconds rather than the time since the run started.

MEASURED, 2026-08-21: three cases in that file, two pass. The one that fails is the basis case, which is the next chunk's to close. The typechecker is clean and biome checked the file with no fixes.

THE `ended` FIELD CAME WITH THE PREVIOUS CHUNK, written when a verdict lands. This chunk is the first thing that reads it.

## follow_up

`the-figure-carries-its-basis` IS NEXT ON THIS STRAND, and it has everything it needs: a progress path, a total, and an entry shape with room for the figure.

THE OTHER STRAND DOES NOT WAIT. `the-leaving-judgment-stops-holding-the-call` leans only on the table, which is signed.

ONE OWED CASE FROM THE SPEC IS NOW WRITTEN. `tsp-the-account-of-work-out-of-sight` named `an entry that finished unobserved` as owed once the surface existed. It exists, so the case is written rather than carried.

## anything_else

THE COMPLEXITY CEILING IS WORTH RECORDING AS A GOOD OUTCOME rather than an obstacle.

Adding the outcome to `testOperations` took it to 39 against a maximum of 25. The refactor that followed produced three named functions whose names say what each phase does: read the last line that parses, read a verdict into one line, build one operation.

THE RULE FORBIDS SUPPRESSING IT and that is why the split happened rather than an inline disable. The result is easier to read than what it replaced, which is the argument for the ceiling in the first place.
