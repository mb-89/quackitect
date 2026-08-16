---
form: engine-runs-the-red
by: agent
signed_off: 2026-08-16T12:22:54.219Z
authors: agent
files:
---

# Evidence form / engine-runs-the-red

## current_situation

observe-red now refuses mechanically, and the agent no longer decides when the new checks run.

THE CHECK IS LIVE FROM THE NEXT RECORD, not this one. i11 walked past observe-red before the script existed, so nothing re-fires here. That is the ordinary shape of an engine fix landing inside the record that authored it.

WHAT THE RUN SAYS ABOUT i11 RIGHT NOW: 7 of 8 new cases green, 1 red. The red is `deletion-names-dependents`, whose chunk is next and unbuilt.

TWO OF THE THREE RULINGS IN raid-dec-the-engine-runs-the-red-and-owns-its-own-promotions ARE STILL OWED. `promotions-are-own-record` and `pipe-refused` have their own chunks and neither is built.

## built

THE ENGINE FIRES observe-red'S CHECKS, and the mechanism it uses already existed.

### What was actually missing

THE CHUNK'S OWN PREMISE WAS FALSE. Its statement says "the way verification already fires the battery", and verification does not fire it. `filled_by: engine` today reaches exactly three places: a machine-validation error if no `command` is declared, a priority of 0.01, and a field on the compiled state. No code path ever executes an engine-filled state's command. `pending_run` is declared on the session type and referenced nowhere else.

SO THE HONEST FIX WAS NOT TO COPY VERIFICATION. It was to use the mechanism that does work: `exit_script`. Four states already declare one, `assertConditions` runs it at every tick attempt, a non-zero exit refuses the submit, and the result is recorded as engine-observed evidence nobody can claim.

### What landed

- `project/deliverable/engine/bin/red-observed.ts` — reads every test-spec minted in the open record whose `method` is `test`, resolves the files they name, runs them, and demands a failure.
- `M7_30_observe-red` declares it as `exit_script`, and its guidance now says what fires and what it refuses.

THREE THINGS FAIL IT, and each names a different hole.

- Every new case PASSES before the build. Green from birth proves nothing.
- A spec names a file that does not exist. The check was never written.
- No TAP summary, or zero cases ran. An instrument failure must never read as a red.

A RECORD THAT AUTHORED NO RUNNABLE SPEC PASSES, and says so. A documentation change or a pure deletion writes demonstration specs and nothing else; demanding a red from it would demand a test nobody needs.

### The run

FIRED TWICE AGAINST THE LIVE TREE. The first run found a defect in itself: the frontmatter list parser matched the closing `---` as a sequence entry, so both specs reported a file called `--` that does not exist. The guard is that a YAML entry is `- ` with a space and the delimiter is not.

SECOND RUN, EXIT 0: `red observed: 1 of 8 new cases fail, as they should` over `tsp-lane-cost` and `tsp-the-bucket`.

THE ONE FAILING CASE IS CORRECT. It is `deleting a node names what points at it, including a mention in prose` — the authored red for `deletion-names-dependents`, which is not built yet.

### No new check of its own

THE PLAN ALLOTS THIS CHUNK NO AUTHORED RED. Its proof is that it fires: the first run caught a real defect in its own parser, and the second reports the tree accurately. A test asserting that a script which runs the suite runs the suite would restate the script.

## follow_up

NOTHING IS OWED BY THIS CHUNK. The script is written, wired to the row, and observed working twice.

ONE THING IS WORTH SAYING RATHER THAN FIXING HERE. `filled_by: engine` promises an execution that does not exist — verification's battery is run by the agent, not the engine, whatever M7_50's row says about itself. That is a second, larger defect on the same surface, and it belongs to `test-verb`'s territory rather than this chunk's. It is captured as a note.

NEXT: `deletion-names-dependents`, which is the one authored red still failing.

## anything_else

