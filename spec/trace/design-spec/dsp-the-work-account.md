---
minted_in: i51-work-running-out-of-sight-reports-itself
id: dsp-the-work-account
type: "[[design-spec]]"
statement: how every kind of long work becomes one operation in one table, how a duration is computed with its basis beside it, and how the account rides back on the lane's own answer
realizes:
  - el-work-registry
  - if-test-runner-to-work-registry
  - if-walk-engine-to-work-registry
  - if-work-registry-to-walk-engine
files:
  - deliverable/engine/run.ts
  - deliverable/engine/tools-run.ts
  - deliverable/engine/sessionscript.ts
  - deliverable/engine/session.ts
---

## Responsibility

ONE TABLE FOR EVERY KIND OF LONG WORK. A shell job, a scoped test run and a
step's leaving judgment become the same object: an operation.

WHAT IT ANSWERS: what is running, how much longer each piece needs, and what that
figure rests on.

WHAT IT DELIBERATELY DOES NOT DO. It does not decide what a verdict MEANS. A
refused hop is the walk engine's judgment; this design only moves the fact and
records when it arrived.

IT DOES NOT PAINT ANYTHING EITHER. Whether the account reaches a screen is
outside this record, and `flow-work-account` says so in its own body.

## Interface

### Registering

EVERY STARTER REGISTERS AT HANDOFF, not at completion. The operation exists
before anybody can ask about it.

An entry carries:

- `kind` — which sort of work it is.
- `id` — its own identity.
- `started` — when, as a timestamp.
- `state` — the step it belongs to, or absent where it belongs to none.
- `progress` — where its own progress is written, or absent.
- `total` — the count its progress divides into, or absent.

THE LAST THREE ARE WHAT TODAY'S JOB RECORD LACKS. Measured 2026-08-21 in
[[exp-what-a-fresh-session-sees]]: a job record holds id, command, started, exit,
running and pid, and nothing else.

### Reading the account

ONE READ RETURNS EVERY OPERATION, running and finished alike. A finished entry
keeps its outcome so a caller that missed the moment still learns what happened.

### Settling

A LEAVING JUDGMENT SETTLES AGAINST ITS STEP through
[[if-walk-engine-to-work-registry]]. Without the `state` field the verdict has
nowhere to land, which is the whole of
`req-a-pending-verdict-is-recorded-against-its-state`.

### Riding out

THE ACCOUNT IS ATTACHED WHERE THE LANE COMPOSES ITS REPLY, through
[[if-work-registry-to-walk-engine]]. It rides beside the answer the caller asked
for and never replaces it, per
[[raid-dec-the-account-rides-beside-the-door-rather-than-replacing-it]].

AN EMPTY ACCOUNT IS AN EMPTY LIST, never an absent field. An absent field cannot
be told apart from a build that never emitted one.

## Behavior and constraints

### The estimate grades itself

EVERY PREDICTION IS SCORED AGAINST WHAT ACTUALLY HAPPENED (owner ruling
2026-08-23). An estimate nobody grades never gets better, and the first version
of this estimator was exactly that: it extrapolated from the pace so far and
stopped there.

THE FIRST GUESS IS THE ONE KEPT. A prediction made seconds before a job ends is
right by construction and teaches nothing, so the entry remembers what the
engine said the FIRST time it said anything, and when it said it.

THE RATIO IS MEASURED FROM THAT MOMENT, never from the start of the job. The
engine said "this much longer" at a point in time. What it is graded against is
how much longer it actually took FROM THAT POINT. Comparing against the whole
duration would grade a sentence it never said.

THE GRADES LIVE IN `.se/estimates.jsonl`, one line per finished job, machine
local and never committed. Each line carries the job, its kind, the MODEL that
answered for it, what was predicted, what happened, and the ratio between them.

THE MODEL IS ON EVERY LINE BECAUSE THE BIAS IS PER MODEL. A hand that
consistently overruns and one that consistently finishes early need opposite
corrections, and averaging them together produces a number that is wrong for
both.

THE CORRECTION IS THE MEDIAN RATIO, not the mean. One job that hung for an hour
would otherwise set the correction for every job after it.

THREE GRADED RUNS ARE NEEDED BEFORE A CORRECTION IS APPLIED. Below that the
figure is reported raw and the basis SAYS SO, naming how many runs are still
wanted. Two samples of a model is superstition rather than calibration.

A STALLED FIGURE IS NOT GRADED. The engine has already said the number is not
advancing. Scoring it would teach the calibration that the model is slow, when
what happened was a stall.

THE BASIS ALWAYS SAYS WHICH IT IS. A reader can tell a corrected estimate from
a raw one without opening anything.

### The three standings of an entry

- `running` — registered and not yet finished.
- `finished` — the outcome is in and nobody has read it.
- `read` — the outcome has been handed to a caller.

AN ENTRY NEVER LEAVES THE TABLE INSIDE ONE SESSION. The account is the whole
list, not the tail of it.

### The duration and its basis are one value

A FIGURE IS NEVER RETURNED WITHOUT WHAT IT RESTS ON, per
[[raid-dec-the-duration-and-its-basis-are-one-return-value]].

WHERE NO MEASUREMENT EXISTS, the entry carries no figure and says so. It still
lists.

THE FIRST BASIS IS A LINEAR PROJECTION over the work's own progress count. Its
accuracy is not dependable in either direction, and that is measured rather than
assumed: an earlier replay over-predicted throughout and converged, while the run
in [[exp-does-a-standing-hold-still]] under-predicted at 88.6 s against an actual
near 100 s.

THAT UNRELIABILITY IS WHY THE BASIS TRAVELS. A reader who can see it can discount
it.

### Reading progress

PROGRESS IS READ ON DEMAND AND NEVER ON A TIMER. A kind that writes progress is
read at its named path; a kind that writes nothing has no figure.

THE READ IS ONCE PER OPERATION PER ACCOUNT. Composing the account is a read of a
list the table already holds, so it stays inside the bound of the call it rides
on. What grows with the number of live operations is the count of progress reads,
and that cost is recorded against
[[raid-ar-one-operation-reads-its-input-once]] rather than hidden.

### Failure behavior

A PROGRESS FILE THAT IS MISSING OR UNREADABLE makes the entry duration-less,
never absent. The entry lists and its basis says no measurement was found.

A JUDGMENT THAT DIES WITHOUT SETTLING is settled as failed. The table reads the
process, finds it gone, and never leaves an entry deciding for ever.

THAT CLAIM WAS NOT HONOURED ON ONE PATH, and the path is named here because it
looks identical from outside. A run whose child is killed can fail to close its
output pipes, so the promise behind the step never settles at all. There was
nothing left to read: the process was gone, no record stood behind the step, and
the step reported `deciding` for the life of the engine.

TWO GUARDS CLOSE IT.

- THE RUN ENDS ITSELF. Killing the child arms a second clock, and the run
  reports what it has when that clock fires, whatever the pipes are doing.
- A RUN PAST ITS CEILING IS DROPPED. The in-flight table records when each run
  started, and one older than the kill ceiling plus its grace is forgotten, so
  the next attempt starts a real run rather than joining a promise that will
  never resolve.

MEASURED: a walk sat at its repair step reporting a battery still running,
nineteen minutes after that battery's last case finished, with no battery
process alive anywhere on the machine.

THE SIGNAL IS UNAMBIGUOUS AND WAS MEASURED. In
[[exp-does-a-left-check-survive-its-call]] a killed judgment closed with
`code=null signal=SIGTERM` and left no verdict file at all, so absence plus a dead
process cannot be mistaken for a judgment still thinking.

A TREE THAT CANNOT BE RESOLVED refuses the handback rather than starting a
judgment with nowhere to run. The caller sees that refusal inside its second.

## Rationale

### Why one table and not one per kind

TWO TABLES STAND ON DISK TODAY and neither can see the other: `.se/jobs` held 35
entries and `.se/test-jobs` held 1 when this was measured. That split is the
defect `req-one-call-reports-every-piece-of-work-out-of-sight` exists to end, and
modelling it as two would carry the defect into the design.

A KIND ADDED LATER JOINS THIS TABLE. Nothing here names which kinds exist.

### Why the spawn does not change

[[exp-does-a-left-check-survive-its-call]] MEASURED THE EXISTING SHAPE and it
survives. The call answered in 4 ms against a 3-second judgment, and an orphaned
judgment whose starter had exited still ran to completion and wrote its verdict.

SO THE BUILD STOPS AWAITING AND CHANGES NOTHING ELSE about how a condition script
is started. `deliverable/engine/sessionscript.ts` spawns it undetached with piped
stdio, and that is enough on the platform measured.

WINDOWS AND MACOS ARE UNMEASURED, and
[[raid-asm-a-check-left-running-survives-on-every-platform]] keeps its trigger
armed for that reason.

### Why the pace already exists in the wrong shape

A TEST JOB'S RECORD TODAY CARRIES a `pace` string: "The last battery took 92s
wall — expect the verdict on that scale." The figure and its basis are both there
and they are one English sentence.

SO THIS DESIGN IS SMALLER THAN IT LOOKS. It turns a sentence into two fields
rather than inventing an estimator.
