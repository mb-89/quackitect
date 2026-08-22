---
form: define-actual
by: agent
signed_off: 2026-08-21T08:48:22.331Z
authors: agent
files:
---

# Evidence form / define-actual

## current_situation

The register is open with five entries. The vision inherits and states its delta.

This state states the baseline the delta is measured against. Every claim below was read out of the engine rather than recalled, and each carries the file and line it was read from.

## as_is

WHAT WORKS TODAY, said first because the baseline is not only pains.

THE HANDOFF SHAPE ALREADY EXISTS, in two places. A battery started through `se_test` returns `handed_off: true` with a job handle and records its own verdict when it lands (`deliverable/engine/tools-run.ts:546`). A shell command started through `se_run` does the same. Nothing has to be invented for work to run out of sight.

A SECOND CALLER JOINS A RUNNING SCRIPT RATHER THAN STARTING A SECOND ONE. In-flight runs are keyed by state, and a second hand gets the same promise (`deliverable/engine/sessionscript.ts:105`). That was learned the hard way, from repeated clicks queueing whole extra suite runs.

A CONDITION SCRIPT ALREADY REPORTS ITS OWN PROGRESS. It writes `##progress <done> <total> <label>` on stdout, and the engine reads those lines to drive the mirror's bar (`sessionscript.ts:56-74`). The counting instrument exists; nothing reads it back to an agent.

AND THE BATTERY ALREADY SIZES A WAIT FROM MEASUREMENT. `batteryPace` reads the last run's wall clock and says "the last battery took Ns wall" (`tools-run.ts:31-40`). Where no record exists it says so plainly rather than guessing. The honesty rule this iteration wants is already the house style.

NOW THE PAINS, each with its witness.

THE PULL FREEZES FOR AS LONG AS THE EXIT SCRIPT RUNS. A tick attempt awaits the script inline: `if (from.exit?.script !== undefined && !escaping) await this.scripts.scriptRun(from.id);` (`deliverable/engine/session.ts:3686`). Nothing returns until it finishes.

HOW LONG THAT CAN BE IS WRITTEN DOWN. The script kill timer is 600,000 ms (`sessionscript.ts:87`), and its comment says a 150-second cap already killed the battery mid-run. So the engine's own declared upper bound on a frozen pull is ten minutes.

WHAT IT COST, MEASURED. Sixty-eight seconds on one step, with two calls timing out at the tool boundary. One of those had partly landed, so the caller was told the work failed while it had in fact moved. Witness: `wt-a-step-whose-leaving-condition-runs-a-long-program-should-no`, which records the measurement.

THE LISTING VERB COVERS SHELL WORK ONLY. `jobArm` answers `{jobs: true}` with `jobList(root)` (`tools-run.ts:44`), and that list holds spawned shell processes. A test job lives in a different table, `testVerdicts` (`tools-run.ts:539`).

AND THE REFUSAL FOR AN UNKNOWN TEST JOB SENDS THE CALLER TO THAT WRONG LIST. `JOB_UNKNOWN` carries the remedy `{tool: "se_run", args: {jobs: true}}` (`tools-run.ts:152`). Following it lists shell jobs, which by construction cannot hold the test job the caller was asking about. The remedy is executable and answers a different question.

A TEST JOB IS ASKED ABOUT ONE AT A TIME, BY HANDLE. `se_test {job: id}` reads exactly one entry (`tools-run.ts:144`). There is no call that lists them.

AND THE FIGURE THAT COMES BACK IS NOT A TIME REMAINING. `batteryPace` reports what the LAST battery took, appended to the handoff note at start (`tools-run.ts:483`). It is a rate for sizing a wait, never a countdown against this run's own progress. Asking again a minute later returns the same sentence.

A SCOPED RUN DOES NOT HAND OFF AT ALL. `if (decision.scope === "scoped") { await entry.done; ... }` (`tools-run.ts:542`). Only a battery returns a handle, so the caller cannot choose to keep working.

SIX BRANCHES LEAD TO THE WHOLE BATTERY, and two of them are the documents case. `decideScope` returns `battery` when any changed file has no test that answers for it (`deliverable/engine/discipline.ts:455`), and again when the diff maps to no test file at all (`discipline.ts:463`). The second branch's own comment says the battery is the wrong answer to a pure-documents diff.

THE VOLUME IS RECORDED. Ten batteries ran in one session on that fallback, most fired by changes to markdown alone. Witness: `note-d393a93e0112`, carried into the iteration record as the third piece.

WHAT NOBODY HAS MEASURED. There is no recorded figure for how often an agent polls a running job, or what that polling costs across a session. The claim that it happens comes from the work token; the frequency does not. Stated as a gap rather than filled with an estimate.

## follow_up

The delta comes next, and it is where these pains sharpen into what we want to fix.

One gap is named rather than closed. Nobody has measured how often an agent polls a running job. The call log could answer it, and the frame-delta state is where that question belongs if the delta leans on it.

## anything_else

THE THREE GOALS ARE NOT EQUALLY GROUNDED, and the baseline shows which.

The frozen pull rests on a measured incident and a line of code that explains it. That is the strongest of the three.

The missing report rests on code reading: two job tables, one listing verb, and a refusal pointing at the wrong list. Strong, and none of it needs a measurement.

The battery fallback rests on a count from one session. Weakest, and its risk entry says so.
