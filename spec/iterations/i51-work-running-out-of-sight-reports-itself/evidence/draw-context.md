---
form: draw-context
by: agent
signed_off: 2026-08-21T08:55:48.227Z
authors: agent
files:
---

# Evidence form / draw-context

## current_situation

Milestone one is blessed and the vision is axiom. Milestone two opens with the boundary.

The change is internal to the walk engine and the lane, so no neighbour is created. Three standing neighbours are touched, and one of them was extended here.

`nbr-agent-harness` already listed cancellation as a limit the harness controls, with no consequence attached. It now carries the consequence, because that crossing is what makes a deferred verdict a boundary concern rather than a comfort.

## boundary

INSIDE: the walk engine, the lane process and everything they own.

- The state machine and its hop-completion rule.
- The lane's tool surface, including whatever verb answers the report.
- Both job tables, `jobList` for spawned shell work and `testVerdicts` for test runs.
- The scope decision that picks which tests answer for a change.
- The recorded timings a figure could be computed from.

OUTSIDE: everything that decides how long it will wait, and everything that does the waiting.

- The harness's cancellation limit. We do not set it and cannot read it.
- The processes the checks run in. They are spawned, not owned.
- The clock. Wall time is read, never controlled.
- The person, who is not present on the run this work is for.

THE BOUNDARY MOVES IN ONE PLACE ONLY, and it is worth stating precisely. Today the lane's answer to a pull is produced AFTER the exit script finishes, so the script's duration is inside the call. After this change the script's duration is outside it, and only the starting of the script is inside.

NOTHING ELSE CROSSES THAT WAS NOT CROSSING BEFORE. No new process is spawned, no new file is written outside the root, and no network call is added.

## neighbours

- [[nbr-agent-harness]]
- [[nbr-toolchain]]
- [[nbr-engineer]]

## intended_use

AN AGENT DRIVING A WALK STARTS WORK THAT TAKES LONGER THAN A CALL, and keeps working.

THREE PASSES ARE INTENDED, and the design serves all three.

1. START AND CARRY ON. The agent asks a question with `se_test`, or leaves a state whose exit condition runs a program. The call answers at once with a handle. The agent does other work.

2. ASK ONCE, WAIT THE ANSWER, ASK AGAIN. One call lists every piece of work out of sight, each entry saying how much longer it needs and what that figure was computed from. The agent waits roughly that long and asks again. It does not poll.

3. LEARN WITHOUT ASKING. The state rides ordinary calls, so an agent doing other work finds out a job finished on the next call it was making anyway.

AND ONE READER IS NOT AN AGENT. `nbr-engineer` reads the same answer through the mirror. That is intended use of the ANSWER and not of a second surface, which is why the mirror's presentation is a non-goal rather than a second design.

WHAT THE INTENDED USE ASSUMES. That the caller acts on a time remaining rather than displaying it. A caller that displays it is a person's tool and gets no worse; a caller that acts on it is why the figure must name its basis.

## excluded_use

SYSTEM-LEVEL AND BINDING, sharper than milestone one's vision-level non-goals.

- REPORTING WORK STARTED BY ANOTHER SESSION OR ANOTHER CLONE. There is no shared store and none is added. The report answers for this lane process only, and a caller asking about another machine's job gets nothing rather than a guess.

- REPORTING A PROCESS THE LANE DID NOT START. The two job tables hold what the lane spawned. A process started outside the lane is invisible here and stays invisible.

- A FIGURE WITH NO STATED BASIS. Binding, and it is the honesty clause made system-level. An entry that cannot say what its figure was computed from reports that it cannot estimate.

- A DEFERRED VERDICT FOR ANYTHING BUT A STATE'S EXIT SCRIPT. Entry conditions, form checks and the corpus write guards stay synchronous. Widening the deferred shape is out of bounds even where it would be convenient.

- RETIRING OR CHANGING `se_run {jobs: true}`. It keeps answering exactly as it does today. The new report is additive, and the old door is not narrowed while the new one is unproven.

- SETTING OR READING THE HARNESS'S CANCELLATION LIMIT. It belongs to `nbr-agent-harness`. The design works inside it by not producing long answers, never by negotiating with it.

- REPAIRING THE RECORDED TIMINGS. `raid-asm-battery-timings-measure-work` stands open. The instrument is used as it is, with its error disclosed.

- PRESENTING THE JOB LIST ON A SCREEN. The mirror may read the same answer. Designing what it draws is outside this boundary.

## follow_up

Stakeholders come next, then the stories.

One exclusion is worth re-reading at the design. "A deferred verdict for anything but a state's exit script" is binding, and the walking core may turn out to have no way to defer one without deferring all. If that is true it is a design finding, not a licence to widen the boundary quietly.

## anything_else

THE ONE CROSSING THAT MATTERS IS OTHERS' TO CONTROL, and that shapes the whole design.

The harness decides how long it waits. We cannot read that number, cannot set it, and cannot detect that it expired — the lane never hears about a cancelled call.

SO THE ONLY SAFE STRATEGY IS TO NEVER PRODUCE A LONG ANSWER. Not a longer timeout, not a keepalive, not a negotiation. Answer at once, every time, and let the caller come back.

That is why the deferred exit verdict is a boundary requirement rather than an internal tidy-up, and it is now written into `nbr-agent-harness` where the next reader will find it.
