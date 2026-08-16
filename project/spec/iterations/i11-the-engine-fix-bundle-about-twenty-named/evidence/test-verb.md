---
form: test-verb
by: agent
signed_off: 2026-08-16T13:32:44.285Z
reopened: "2026-08-16T13:24:46.633Z — the battery refusal points at verification, which does not grant se_test — so the full battery can now run nowhere"
authors: agent
files:
---

# Evidence form / test-verb

## current_situation

THE BATTERY RUNS WHERE THE METHOD SAYS, AND THE ENGINE IS WHAT RUNS IT. Both halves are true for the first time; before today one was a refusal with nowhere to land and the other was a sentence in a row.

WHAT THE REOPEN COST: one escape and a re-entry. What it caught: two regressions from this same chunk, one of which made the record unverifiable.

WORTH SAYING PLAINLY — THE SUITE NEVER CAUGHT THE FIRST ONE. Every test builds its own server in-process and calls se_test with `force: true`, so no case ever stood at verification and asked for a battery. The defect was only reachable by walking the real machine.

## built

TWO CLAUSES, SHIPPED TOGETHER, AND A THIRD THE FIRST TWO TURNED OUT TO NEED.

### A scoped run answers its caller

494 se_test CALLS IN ONE DAY PRODUCED 66 VERDICTS. About 428 asked only whether a job had finished. The owner's design: "you don't do polling" — a long task's updates piggyback on calls already being made, the way narration already does.

A SCOPED RUN IS SHORT BY CONSTRUCTION, so it blocks and answers. `if (scoped) { await entry.done; return entry.verdict ?? {job: id, running: false}; }`. The handle and the job registry stay, so `se_test {job}` still recovers a verdict across sessions — nothing was removed, the caller is simply not sent away.

THE BATTERY STILL HANDS OFF, because it is genuinely long (50 seconds measured). That is where a handle earns its keep.

### An agent-initiated battery outside verification is refused

M7_50_verification HAS SAID THIS ALL ALONG: `filled_by: engine`, "THE ONE PLACE the full battery runs", "its verdict records itself". Two runs per iteration is the designed maximum. FIVE RAN ON 2026-08-16, every one on an agent's own judgment, none sanctioned by any row.

CHECKED BEFORE THE HANDOFF, because a refusal raised inside the async body becomes the JOB's verdict — the call would answer with a handle and fail quietly a second later.

### What was WRONG, and why this claim was reopened

THE REFUSAL POINTED AT A STATE THAT CANNOT CALL THE VERB. verification's legal tools are `se_file_read, se_file_search, se_file_glob`. No se_test, and it never had one.

SO THE FULL BATTERY COULD RUN NOWHERE. I closed the practice without opening the design, and the record could not be verified at all. The walk found it by standing on verification with nothing legal to run.

THE MISSING HALF WAS NEVER BUILT BY ANYBODY. `filled_by: engine` reaches exactly three places in the code — a machine-validation error, a priority of 0.01, and a field copied onto the compiled state. No path ever executed the command. `pending_run` is declared on the session type and referenced nowhere. The row described a mechanism that did not exist, and the agent running the battery by hand is what filled the gap.

### The third clause: the engine fires it

`project/deliverable/engine/bin/battery.ts` is verification's `exit_script`, the same mechanism observe-red now uses and that four states already used before this iteration.

IT READS THE COMMAND FROM THE ROW rather than carrying its own. The row is the one place a project names its battery, and a second copy here would be the same duplication the row exists to prevent. A row that declares itself engine-filled with no command is a RED, not a silent green.

THE TAIL IS WHAT IT KEEPS ON A FAILURE. Ends carry verdicts; a head slice would hold the opening banner and drop the failures.

THE SCRIPT TIMEOUT WENT FROM 120s TO 600s. `tools.ts` already recorded that the battery is long by design and that 150s once killed it mid-run. A cap that kills the battery reads as a red that never happened.

### Green

FIRST REAL RUN: 1318 of 1319, one red — and the red was also mine. `verdictlog.test.ts` asserted a scoped run hands back a handle, which this chunk changed.

THE CASE'S REAL CLAIM SURVIVES INTACT, and its own header states it: "a test job's verdict must land in the call log by itself. An unfetched failure must not be invisible to the retro." It now asserts the scoped run ANSWERS and still logs, and that the battery still hands off — both halves of the seam, neither weakened.

SECOND RUN: `battery green — npm --prefix project/deliverable test`, exit 0, 1319 of 1319, 50 seconds.

## follow_up

NOTHING BLOCKS. Verification is next, and its submit now fires the battery itself.

ONE THING FOR A LATER ITERATION. `filled_by: engine` still means nothing in code — verification's battery is fired by an `exit_script`, not by the field. The field is now documentation with a working implementation beside it rather than documentation alone, which is better but not honest. Either the field drives the execution or it goes. note-7282de9ddb3c carries the finding.

## anything_else

