---
minted_in: i1
id: dsp-lane-door
type: "[[design-spec]]"
statement: the typed tool lane, carried by one registry of verbs with schemas, clauses and remedies
realizes:
  - "el-walk-engine"
files:
  - "project/deliverable/engine/tools.ts"
  - "project/deliverable/engine/tools-file.ts"
  - "project/deliverable/engine/tools-run.ts"
  - "project/deliverable/engine/tools-desk.ts"
  - "project/deliverable/engine/mcp.ts"
  - "project/deliverable/engine/errors.ts"
  - "project/deliverable/engine/discipline.ts"
  - "project/deliverable/engine/promptlayer.ts"
  - "project/deliverable/engine/params.ts"
  - "project/deliverable/engine/bound.ts"
  - "project/deliverable/engine/bin/se-mcp.ts"
  - "project/deliverable/engine/bin/se-manual.ts"
---

## Responsibility

Every agent act enters through one door. The door validates arguments
against schemas, refuses with a typed clause and an executable remedy,
and logs the call. The lane rules steer shell use back into lane verbs.

## Interface

The MCP server surface: one tool per verb, schemas generated from the
registry. The prompt layer places the standing sources into the host.

## Rationale

One registry feeds the tool list, the refusals and the warnings, so
feed-forward and feedback cannot drift apart.

## Always legal, whatever the state

THE PULL IS THE MACHINERY — one verb, legal in every state. The agent says
pull and the machine says what to do.

`se_note` IS LEGAL EVERYWHERE TOO. A stray is captured where it strikes,
never chased. `se_note_drain` joins it by the same logic: an inbox you may
only add to is not an inbox.

`se_aim` JOINS THEM BECAUSE AIMING IS NOT WORK. The engine is born aimed at
the front desk and the mirror has long had a setter, so the capability existed
and simply was not reachable from the lane. An agent that cannot aim can only
take the next offered door, which means it wanders one hop at a time and no
route is ever drawn. That is not a walk; it is guessing with extra steps.

`se_reopen` AND `se_amend` JOIN THEM BECAUSE A CLAIM IS FIXED FROM OUTSIDE
IT. The state that carries a broken claim is not the state you are standing in
when you find it.

## Nothing is restricted today

A RESTRICTED TOOL IS ONE THAT `all` DOES NOT GRANT — a state must name it.
The set is empty.

`se_note_drain` USED TO BE RESTRICTED, so that only the desk and the retro
could take anything out of the inbox. That was struck: an obsolete note is
deleted where it is found and does not wait for a ceremony.

THE HALF THAT MATTERED WAS NEVER THERE ANYWAY. `carried` and `backlog`
decide what work MEANS and when it returns, and the inbox still refuses those
outside the retro. `done` and `obsolete` are checks anyone can run.

## A bad update never destroys its call

THE UPDATE RIDES FIRST — applied before any other verdict, so the narration
stands even when the call itself is then refused. It is logged as its own
record and pays the toll, and it is stripped before any handler sees it.

BUT NARRATION IS COMMENTARY, and commentary that vetoes the act it comments on
has the causality backwards. A brief with one separator too many used to reject
the whole call and take the payload with it — a four-thousand-word answer, a
four-file atomic patch, a finished note, all discarded over the punctuation of
a label riding alongside. Measured at a retro: this mechanism caused 18 of 25
sampled refusals.

THE WORK LANDS. The complaint rides back on the result. And the toll goes
UNPAID, so the rule keeps its teeth — it just bites the narration now instead
of the work.

## Method cannot be changed from inside a record

WHILE A RECORD IS BOUND, a method write once resolved into that record's own
tree, and the fan-out pushed it from there to trunk. So editing guidance or the
engine while bound published the RECORD's copy over the shared one. It happened
twice in one afternoon, and the first time it ate two lane verbs out of trunk's
tool list.

IT IS GUARDED AT DISPATCH, before the handler runs, so the whole call refuses
and nothing is half-written. A guard at the write sites would refuse partway
through a multi-file patch.

THE REFUSAL THAT USED TO STAND HERE IS RETIRED, and replaced by a RESOLUTION
rather than merely dropped. Shared method now resolves to the machine root
whatever tree is bound, so a method write cannot land in a tree that does not
own it and there is nothing left to refuse.

WHAT THE REFUSAL COST WHILE IT STOOD: escape to the desk, edit, aim back, and a
forty-four-hop replay that timed out twice on the way in. Six times in one
session, and twice more the day it was removed.

## A scoped run answers the caller that asked

MEASURED THE DAY BEFORE THIS LANDED: 494 test calls produced 66 verdicts. About
428 asked only whether a job had finished, and a fifty-second battery cost ten
calls to watch.

THE JOB MACHINERY STAYS UNDER IT. The verdict is still persisted and still
logged, so a lookup by job id keeps working and nothing that reads one has to
change. The caller simply stops having to.

THE BATTERY STILL HANDS OFF, and that is not an oversight. It is the engine's
to fire at verification, where nobody is waiting on the answer, and blocking a
caller for fifty seconds buys nothing.

## Escape is one hatch

ONE HATCH, AND IT LANDS AT THE FRONT DESK — where the person is. Every kind of
stepping out is this same move, told apart only by its reason: the person said
stop, the walk is mechanically stuck, earlier work no longer stands.

THE WALK THAT WAS LEFT IS LEFT STANDING. A later walk re-enters it,
fast-forwarding on stored evidence. Boot is the one exception, because it must
complete.

A QUESTION IS NOT AN ESCAPE. An agent waiting on an answer stays in its state,
asks, and stops — the state holds and the reply resumes it there. Escaping is
for when NO answer could let the walk continue from here.

THE HATCH IS NEVER GATED: no weighing against the dial, no read demand. Going
to the desk IS going to ask the person — the andon cord — and a cord that can
refuse to be pulled is no cord. What the desk demands arrives on the next pull.

## A call that never returns still leaves something to read

── THE POSTMORTEM (owner ruling 2026-08-07, after three silent deaths).

   The engine died three times in one afternoon and left NOTHING to read.
   The call log writes on completion, so a call that never returns is
   never logged; stderr goes to whatever launched us, which in the VS Code
   host is an output channel nobody can grep. The last death showed four
   lines and ended "engine exited (1)" with no trace at all.

   THREE HANDLERS, BECAUSE THEY TRIANGULATE. Between them they tell three
   endings apart, and each wants a different fix:

   - a crash record, then an exit record  → it THREW; the trace names where
   - an exit record with no crash record  → somebody called exit(1)
   - neither, and the log just stops      → it was KILLED from outside,
     or the loop wedged and never got to exit at all

   IT STILL EXITS. Node already ends the process on an unhandled
   rejection; catching one and carrying on would leave a server running in
   a state nobody reasoned about, which is worse than dying. These record
   and then do exactly what would have happened anyway.

   SYNCHRONOUS WRITES ONLY. A dying process never flushes an async one.

   IT DOES NOT CATCH EVERYTHING. A hard kill and an out-of-memory run no
   handler, so silence here is not proof the engine did not crash — only
   proof it did not crash in a way JavaScript could see.

## Children never outlive the engine

CHILDREN NEVER OUTLIVE THE ENGINE (found 2026-08-02: two orphaned test
workers held a folder lock for four hours after their session died).
Every deliberate exit reaps the job registry — the registry is where
every spawned child now lives.

## The session cleans up after itself

THE SESSION CLEANS UP AFTER ITSELF (owner, 2026-07-30): tell the
terminal host to end the agent — politely, then by force — so end
leaves no strays holding the ports. No host answering is fine:
own-terminal and manual runs have nothing to clean.

## The answers bound

THE ANSWER'S BOUND (tsp-answer-bound, req-the-answer-never-exceeds-its-bound).

THE FLOOR, NOT THE WHOLE FIX. The owner's design is both halves: split the
sources into chunks small enough to be pulled whole, AND keep a mechanism
that guarantees no answer can ever overflow whatever the sources look like.
This file is the second half.

WHY IT IS URGENT. Three overflows landed in i27's M0 alone, at 281 KB and
277 KB. Every pull in the session of 2026-08-14 returned between 280 and
350 KB and could not be read, and two fills were misdirected as a direct
result. When a SUBMIT is refused, the reason sits inside a payload nobody
can read, and no cheap question answers it.

A POINTER ALONE RECURSES, and the owner caught it: an answer of 350 KB
whose pointer says "fetch the whole from the log" produces another 350 KB
answer, which is cut again, forever. So the bound PAGES.

  - The FIRST PAGE rides inline, so the caller always sees content.
  - The whole answer spills to .se/answers/<tool>.json, machine-local and
    never committed.
  - The cursor names se_file_read with offset and limit, which is the
    lane's own paging verb and is itself bounded by its limit. No recursion
    is possible, because each page is small by construction.

## The discipline lane

THE DISCIPLINE LANE — rule-based, no second model (owner ruling 2026-08-02).

Harvested from 2,589 logged se_run calls: 46% were improvised text tools —
Select-String standing in for the searcher, Get-Content for the reader,
Set-/Add-Content for the writer — every one uninstrumented, un-CAS'd, and
invisible to the guards the lane exists to provide. The lane now covers
those jobs, so doing them through the shell stops being a gap and starts
being a choice.

The ladder: first classified run GOES THROUGH, carrying a named warning —
that warning is the feed-forward for the second attempt. From then on the
category refuses (SE-C-129), remedy naming the lane tool. The valve:
no_tool_reason runs it once and LOGS THE REASON — when the classifier is
wrong or a verb is truly missing, the agent documents the gap at the moment
it hits it, and the reasons pile up where the retro reads. A frequent
reason IS the next verb.

ONE TABLE, THREE OUTPUTS. The rules below drive (a) the classifier, (b)
the warning/refusal text, and (c) the se_run description (laneSummary) —
feed-forward and feedback generated from the same source, so they cannot
drift apart.

## Testgate is deleted

`testGate` IS DELETED (owner ruling 2026-08-16), with SE-C-130 and SE-C-131.

It refused a re-run over an identical tree. `decideScope` answers the same
question without refusing anything: scope "nothing", with the standing
verdict quoted back. An unchanged tree is news, not an obstacle.

NOTHING IN THE LANE EVER CALLED IT after the rewrite. Its own tests were the
only callers left, so the refusal it threw could not be seen by anybody — and
a clause nobody can reach is a documented promise the engine does not keep.

## The scope economy

── the scope economy ──────────────────────────────────────────────────────
THE BATTERY IS THE EXCEPTION, NOT THE HABIT (owner ruling 2026-08-02).
Measured live: one session ran the full battery ~60 times in two hours,
mostly to answer single-test questions — then grepped a temp file for the
one failure it cared about. The rules below make the scoped run the cheap
default and the battery the call you EARN — and they make gaming the rule
unprofitable, because piecemeal coverage past a threshold GRANTS the
battery instead of policing it.

## Whether this diff wants the conformance sweep too

WHETHER THIS DIFF WANTS THE CONFORMANCE SWEEP TOO (owner ruling
 2026-08-16). A change made of DOCUMENTS is exactly the change a test
 battery says nothing about and the sweep says everything about.

 IT RIDES THE TEST DECISION BECAUSE THE SWEEP HAS NO VERB. The engine
 already reads the diff here to size the run; asking one more question of
 the same diff costs nothing and gives the sweep a third mechanically
 clear moment, beside the boot and sweep-consistency's exit.

## The engine decides what gets tested

THE ENGINE DECIDES WHAT GETS TESTED, AND THE AGENT NEVER DOES (owner
 ruling 2026-08-16).

 THE AGENT ASKS FOR A TEST AND SAYS WHAT IT WANTS TO KNOW. This function
 reads what actually changed, picks the scope, and the result SAYS what it
 picked. There is no argument the agent can pass to widen or narrow it.

 WHAT IT REPLACED, and why the replacement is structural rather than a
 threshold tweak. Two refusals used to guard this from opposite sides:
 batteryGate refused the battery while every change mapped to a scoped run,
 and scopedGate refused scoped runs once the piecemeal odometer crossed the
 flip. Each refusal's remedy was the OTHER refusal.

 ON 2026-08-16 THEY CLOSED ON EACH OTHER. At i6's sixth build chunk the
 odometer stood at 42 and the battery was illegal outside verification, so
 no test call was legal at all — with four milestones still to walk before
 the state that fires the battery. Narrowing to one file changed nothing,
 because the flip counts the odometer rather than the call.

 THE CAUSE WAS NOT THE THRESHOLD. It was that the agent chose the scope and
 the engine graded the choice. Two graders with different subjects will
 eventually disagree, and an agent standing between them has no move. Now
 there is one decider and nothing to disagree with.

## A failure inside a describe block is still a failure

EVERY DEPTH, NOT ONLY THE TOP (i11, from the 2026-08-12 seed).

This matched `^not ok` with no leading space, so a failure inside a
describe() block was invisible: TAP indents the child and reports the
PARENT at the top level with `1 subtest failed` and the suite's
location. The one line that says WHAT failed — the assertion's message
and diff — was dropped, every time.

MEASURED 2026-08-16: three separate failures had to be re-run through
the shell with a different reporter to be read at all, each one a
logged escape from the lane the lane exists to replace.

## Se-c-130 and se-c-131 are retired

SE-C-130 AND SE-C-131 ARE RETIRED (owner ruling 2026-08-16). One refused a
re-run over an unchanged tree; the other refused the wrong test scope. On
2026-08-16 they closed on each other — each remedy was the other refusal,
and no test call was legal at all for four milestones.

THE CAUSE WAS THE AGENT CHOOSING AND THE ENGINE GRADING THE CHOICE. Now
`decideScope` reads what changed and decides, so there is nothing to grade:
an unchanged tree is answered with scope "nothing", and a scope the agent
cannot name is a scope the agent cannot get wrong.
SE-C-134 IS RETIRED (owner ruling 2026-08-14). Shared method resolves to
the machine root whatever tree is bound, so a method write can no longer
land in a tree that does not own it. The number is not reused.

## The one exit the bound cannot cover

THE ONE EXIT THE BOUND CANNOT COVER (i27, 2026-08-14). A tools list
must arrive as a tools ARRAY the client can parse, so paging it
into a text page would leave the agent with no tools at all. It is
kept small by keeping DESCRIPTIONS short, which is authorship
rather than mechanism, and this comment is the only guard there is.

## The prompt layer

THE PROMPT LAYER — the always-true tier, assembled from its sources.

THREE TIERS, ONE CRITERION (owner-approved, 2026-08-02).
  always-true    → the prompt layer. Present every turn, survives a
                   compaction, costs no round trip.
  here-true      → the packet. The pull serves state guidance, unchanged.
  sometimes-true → the read layer. Pulled by the states that bind it.
Only the constant tier leaves the wire. The other two do not change.

NO LLM STANDS IN THIS PATH. The sources are AUTHORED TERSE and assembled
verbatim, so one rule cannot come out compressed differently on different
days. Compression is a retro judgment, never a boot step.

The read-proof disappears for what is promoted, by design: text present on
every turn is a stronger guarantee than a hash of a read that a compaction
erases. Read-proofs remain for everything the pull still serves.

## Rootof takes the path because one lane serves two

rootOf takes the path because ONE lane serves two trees: `.se/` is session
state at the project root, everything else follows the walk into its bound
worktree (Session.laneRoot, owner ruling 2026-07-28). Callers that act on no
single path — search, glob, run, git — pass nothing and get the work root.
judgmentDrainAllowed answers ONE question for se_note_drain: may this
caller park a note or carry it, or only record the mechanical verdicts.
It is a thunk because the walk moves under a built tool list.
THE PEEK RETIRED WITH THE TICK: an agent choosing among doors gets them
from the pull's own offer, statements and weights riding along. The
mirror still reads any state through stateInfo.

## A shape that cuts before the engine sees

A SHAPE THAT CUTS BEFORE THE ENGINE SEES. Select-Object -First, head, tail,
 cut -c, Measure-Object: each one drops output between the command and the
 capture, so what it removed exists NOWHERE — not on the result, not in the
 log, not under the ref.

 A FILTER AFTER A PIPE IS THE SAME THING, and it was the one actually doing
 the damage. `| Select-String fail` keeps the matching lines and throws away
 the TAP summary — which is where the counts live. That is how a run came
 back as exit 1 with empty output on 2026-08-16, inside the iteration
 building this refusal.

 BEFORE a pipe they are a different offence: reaching for the shell's
 searcher instead of the lane's, which SE-C-129 already covers.

## The discipline ladder

THE DISCIPLINE LADDER (engine/discipline.ts): a command doing a lane
tool's job runs once with a warning, then refuses. Judged BEFORE the
spawn, so a blocked category costs nothing to block.
REFUSED AT THE BOUNDARY, NOT ANNOTATED AFTER (owner ruling
2026-08-16). The lane already warned about this and the warning did
not work: an agent shaped output through Select-String IN THIS
ITERATION, while building the fix for it, and got exit 1 with empty
stdout. A warning that has failed twice is evidence about warnings.

WHY IT HAPPENS SO OFTEN is the part worth answering, and the remedy
answers it: the pipe is reached for when the raw output is expected
to be long, so the refusal names the verb that handles length.

## A test run never outlives its session

A TEST RUN NEVER OUTLIVES ITS SESSION (found 2026-08-02: two
orphaned workers held a folder lock for four hours). Children run
in the job registry — whole-tree killed on timeout, reaped at
shutdown, visible to se_run {jobs: true}.

## The battery is earned, never habitual

The battery: EARNED, not habitual. The gate computes the scoped
remedy from the diff since the last green battery.
THE SWEEP RIDES THE DECISION, NEVER A VERB (owner ruling 2026-08-16).
A verb an agent can call is a verb an agent will call, and the whole
reason this check left the write is that it costs too much to run per
write. `decideScope` already reads the diff; when that diff is mostly
DOCUMENTS it says so, and the sweep runs with the tests.

IT REPORTS AND NEVER DECIDES THE VERDICT HERE. The sweep BLOCKS at
sweep-consistency's own exit, which is the state whose job is
clearing it. Riding a test run, it is news.

## The question is checked before the handoff

THE QUESTION IS CHECKED BEFORE THE HANDOFF, on purpose. A refusal
raised inside the async body becomes the JOB's verdict, so a call
that could never run would still answer with a handle and fail
quietly a second later (found by verdictlog.test.ts, 2026-08-13).
THE ENGINE DECIDES WHAT RUNS (owner ruling 2026-08-16). The agent
asked a question; this reads what changed and picks the scope.

WHAT THIS REPLACED. Two refusals guarded the scope from opposite
sides — one refused the battery toward a scoped run, the other
refused scoped runs toward the battery — and on 2026-08-16 they
closed on each other at i6's sixth build chunk. Each remedy was the
other refusal, and no test call was legal at all.

THE CAUSE WAS THE AGENT CHOOSING AND THE ENGINE GRADING THE CHOICE.
Two graders with different subjects eventually disagree, and the
agent standing between them has no move. One decider has nothing to
disagree with.

DECIDED BEFORE THE HANDOFF, because a refusal raised inside the
async body becomes the JOB's verdict — the call would answer with a
handle and fail quietly a second later.

## The record carries the question it answered

THE RECORD CARRIES THE QUESTION IT ANSWERED (i33, 2026-08-17,
tsp-record-inspection item 12). It did not until now: the
question rode the call that STARTED the run and the verdict
recorded only a job id, so the log held eight test runs and
could not say what any of them was for.

## Build the server

Build the server: session machine + tools + guards + the raw call log.
 Guard order: arg shape → THE STATE GATE → handler. Pass a Session to
 share it with another hand (the embedded mirror drives the SAME walk).
THE PROSE-WALL LINT (owner law 2026-07-28): every HTML surface keeps
 line breaks — so long prose MUST carry them. An authored wall is refused
 at the tool boundary, mechanically.

## Setests handed-off runs

se_test's handed-off runs: the verdict outlives the CALL — recorded here,
served by se_test {job}, whatever the client's timeout did.
THE ON-CHANGE TYPECHECK (owner ruling 2026-08-03): a lane edit touching a
.ts file kicks an incremental compile in the background, and while the
tree is red every result carries typecheck_error. The EDIT itself is
never refused — a two-file fix passes through a red middle; the
pre-commit hook is where red blocks. Nothing here may throw.

## The verdict outlives the call

THE VERDICT OUTLIVES THE CALL (found 2026-08-02: the battery outran
 the MCP client's timeout and the counts were lost). Past the
 handoff budget the caller gets a handle; the run carries on, the
 verdict is recorded, and {job} serves it.

## Any write clears the route memo

ANY WRITE CLEARS THE ROUTE MEMO. Which claims stand depends on the
evidence AND on the trace nodes that evidence references, so a node
repaired through the file lane can change the objective without any form
being touched.

It wedged the walk on 2026-08-07: a broken node was fixed, the state went
green, and the router kept handing back the route to the state the walk
already stood in. Re-aiming could not shift it, because the key had not
changed either.

Clearing here costs one recomputation after a write, which is precisely
when the answer may have moved.

## Every external call is a new drawing epoch

EVERY EXTERNAL CALL IS A NEW DRAWING EPOCH — "the next call" is the
read-it-live law's unit, and pull alone was not enough: a gate check
on any other tool trusted a stamp from the previous call and went
stale for up to a second (caught by the battery, 2026-08-02).

## The verbs are grouped by what they touch

THE REGISTRY IS ONE LIST and it always was; what changed is where the entries
are written. Three groups fall out of the lane on their own:

- THE FILE VERBS go through the model file system, so the write rules hold
  whoever asked. Read, write, patch, replace, move, delete, list, glob and
  search, plus the reading service that credits a document as it serves it.
- THE SHELL VERBS start something outside this process — a screenshot, a
  shell run, the battery, git. Each is a child with a job id, and the job
  store is what lets a verdict outlive the call that asked for it.
- THE DESK VERBS carry words: the web, the notes, the prose lint, the answer,
  the survey and the call log.

WHAT THE GROUPING DOES NOT CHANGE. The lane still assembles one array and
dispatches from one table, so a verb's clause, remedy and log line are the
same whichever file its entry is written in. The split is about where a
reader looks, never about how a call is served.
