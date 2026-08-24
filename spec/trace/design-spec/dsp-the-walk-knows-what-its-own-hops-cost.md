---
minted_in: i60-the-walk-gets-fast-and-it-is-measurable-
id: dsp-the-walk-knows-what-its-own-hops-cost
type: "[[design-spec]]"
statement: The walk times each hop it takes, tells a deciding step apart from a failed one when drawing a route, and answers a bare aim without walking.
realizes:
  - el-walk-engine
files:
  - deliverable/engine/session.ts
  - deliverable/engine/machine.ts
  - deliverable/engine/calllog.ts
  - deliverable/tests/route.test.ts
  - deliverable/tests/clear-jump.test.ts
---

## Responsibility

FOUR THINGS, ALL INSIDE THE WALK'S FORWARD VERB. They are one design concern
because they are one function seen at four grains, and splitting them would put
the cost in one place and the reason for it in another.

- TIME EACH HOP and record the figure where the trail can be read.
- DRAW A ROUTE USING THE THREE-WORD STANDING rather than a yes or no, so a step
  still deciding is not read as a step that failed.
- ANSWER A BARE AIM WITHOUT WALKING, while the combined aim-and-go keeps its own
  behaviour untouched.
- GIVE UP QUICKLY when no route can be drawn.

## The route standing, and why the fix is narrow

THE SHARED CHECK STAYS AS IT IS. It returns a yes or no and many places call it,
and only one of them wants the third word.

SO THE DRAWER ASKS ITS OWN QUESTION. A separate call that returns the standing,
used by the route drawer alone. Widening the shared one would touch every caller
to serve one.

THAT IS THE REPAYMENT THE STANDING DEBT ALREADY DESCRIBED, in its own words: give
the route drawer its own question about a step's standing, and leave the shared
check alone.

THE SAFE DIRECTION MUST NOT REVERSE. Today the drawer reads deciding as failed,
which refuses a walk that has done nothing wrong. The fix must stop it refusing a
DECIDING step without also stopping it refusing a FAILING one, and those live one
line apart.

## Timing a hop

THE HOP IS THE UNIT, not the call. A call may carry many hops, so one duration
per call cannot answer the question and a test asserting it would pass while
proving the opposite.

WHERE THE FIGURE GOES. Beside the hop in the trail, so it is readable by the same
query that reads everything else. Nothing new is invented to hold it.

## The walking is the cost

A HOP HAS TWO HALVES AND THEY DIFFER BY THREE ORDERS OF MAGNITUDE.

| half | what it does | what it costs |
| --- | --- | --- |
| drawing | expands the arriving state to find the way | about 8 ms |
| walking | enters the state, weighs the dial, proves the reads, runs the scripts | about 5,400 ms |

MEASURED on three hops of boot: 16,179 ms of walking, against under 30 ms of
drawing for the same hops. One bare process start on the same machine costs
49 ms, so a single hop is worth 110 of them.

SO BOTH ARE TIMED, SEPARATELY. `RouteStep.ms` is the drawing. `swept_ms` on a
sweep's answer is the walking, one entry per hop actually walked.

TIMING ONLY THE DRAWING WAS THE FIRST ATTEMPT, and it read like an instrument
while pointing at a thousandth of the cost. That is worse than no figure: a
number nobody can act on still looks like a measurement.

THE REFUSED HOP IS NOT TIMED. It did not complete, and putting the cost of a
refusal beside the cost of a walk would make the two unreadable together.

WHAT THIS STILL DOES NOT SAY is which part of the walking costs the 5,400 ms.
The candidates are the condition scripts, the reading proofs and the state's own
entry work. That is the next measurement and it is not this one.

WHAT IS NOT DESIGNED HERE. Any reuse of a passing hop's verdict. The owner's
instruction is to measure before deciding what a reuse check would cover, and
that decision waits on the measurement this spec makes possible.

## Walking over is not entering

OWNER RULING 2026-08-24: "if we can fast forward a route to the goal, then we
don't need to read everything on the way there. We only need to read stuff if we
actually enter a state."

A SWEEP LANDS ON ONE STATE AND PASSES THROUGH THE REST. Only the landing is
worked. The reading proof exists so the hand holds the material for the state it
is about to work, so a state nobody works needed nothing.

WHAT IT COST BEFORE. Re-entering a record after a restart re-owed the reading on
every already-passed state — eleven documents and about thirty calls before any
work could begin. The signatures were all still standing; only the reading credit
is per session.

### How it is decided

MORE STEPS AFTER THIS ONE MEANS THIS ONE IS NOT THE LANDING. The sweep redraws
after every hop, so the last step of the current route is where it lands, and
every earlier step is a pass-through.

### Why the guarantee survives, and it is stronger than it first read

THE LANDING ASSERTS ITS OWN READING DIRECTLY. The route is redrawn every
iteration and only its first step is walked, so "more steps after this one" is
true exactly while the walk is passing through. On the landing hop it is false
and the reading demand runs as it always did.

SO A SWEEP THAT COMPLETES NEEDS NO FALLBACK. A reviewer went at this expecting
the flag to be constant across the loop and therefore to skip the landing too. It
is not.

THE FALLBACK COVERS THE TWO EARLY EXITS — the time budget and a refusal. There
the walk stands on a state whose reading was skipped, and the next pull demands
it for wherever the walk actually stands.

### One hole in that argument, and it is older than this change

A BACK HOP NEVER ASSERTS ITS READING AT ALL. It un-picks a leg the fan handed out
and does not go through `advance`, so it never reaches the reading demand and
never consults this flag.

IF A ROUTE'S LAST STEP IS A BACK HOP, the walk lands with no reading asserted and
only the pull catches it. That was true before this change and is unchanged by
it; it is written down here because the safety argument above would otherwise
read as covering it.

### The flag is saved and restored, not cleared

CLEARING IT TO FALSE would let an inner sweep un-skip an outer sweep's reads on
the way out. The mirror shares the session, so a second sweep is not
hypothetical. Two sweeps genuinely interleaving on one session is a wider
question than this flag, and saving the previous value is strictly better than
assuming there is only ever one.

### It is a property of the act, never a mode

The flag is set around ONE hop and cleared in a `finally`, so a throw cannot
leave it standing. Anything outside a sweep reads it false, which is what a test
gets and what is right.

## A green state walked over keeps its verdict

LEAVING A STATE RAN ITS EXIT SCRIPT AGAIN, every time, whether or not the state
had already passed. So a fast-forward through finished work paid for every
judgment it already had on file.

IT IS THE RIGHT SHAPE AND IT IS NOT WHERE THE TIME WAS. An earlier draft of this
section claimed 2,455 milliseconds of a 6,084 millisecond three-hop sweep was the
call waiting on scripts already signed. A phase trace refuted that: leaving a
state measures ONE millisecond, and the idle the claim rested on was the
TypeScript loader compiling modules at import, outside the sweep entirely.

SO THIS CHANGE IS CORRECT AND CHEAP, not a saving. It is kept because re-running
a settled judgment is wrong on its own terms. The saving is in the three sections
below.

THE LESSON IS THE ONE THE RECORD KEEPS RE-LEARNING. A number read off a profile's
`(idle)` line attributes nothing by itself. Something has to be shown waiting.

### Three conditions, and each closes a way this could turn a red hop green

| condition | what it stops |
| --- | --- |
| the walk is passing THROUGH, not landing | a state the walk works always re-judges, because that is where the verdict is about to be relied on |
| the standing verdict says PASSED | a red never survives on a stale answer; anything but a pass re-runs |
| the scripts have not moved | a verdict reached with a different script is a verdict about a different question |

ALL THREE MUST HOLD. Any one of them failing runs the script.

### The stamp is over content, not size and time

Same reason the drawing cache stamps that way: a same-size edit inside one
filesystem timestamp tick would go unseen. It reads through the door, so one
pass reads each script once however many states cite it.

### Why this is the risky one, said plainly

THIS IS THE EXACT SHAPE `raid-risk-a-faster-walk-must-not-turn-a-red-hop-green`
WATCHES FOR: a change made to go faster that skips a check rather than reusing
its answer.

IT REUSES THE ANSWER RATHER THAN SKIPPING THE CHECK, which is the distinction
that entry draws. The verdict is the script's own, reached by running it, and it
is kept only while the thing that produced it is unchanged.

WHAT IS NOT STAMPED is what the script READS. A battery judges the whole tree,
and this stamp does not cover the tree. The passing-through condition is what
makes that safe: a state being worked re-runs regardless, so the stale window is
only ever a hop nobody stops on.

## Where the hop time actually was

FOUR READS, EACH REPEATED HUNDREDS OF TIMES PER HOP. A profile of the same
three-hop sweep put the cost in drawing the route, not in judging states.

MEASURED, AND THE TWO SCOPES SAID APART because they are different numbers.

- ACROSS THE WHOLE ROUND, cold: 15,404 milliseconds down to 2,562.
- ACROSS THE FOUR FIXES BELOW, cold: 6,113 down to 2,562. The difference is the
  caches that had already landed earlier in the round.
- THE FILE DOOR'S OWN METER: 612,532 calls a sweep down to 22,040.

WARM IS A DIFFERENT MEASUREMENT AGAIN, and it is the one a live engine sees:
those same three hops cost 34, 66 and 59 milliseconds.

EACH FIX IS ONE SHAPE, and it is the owner's: check whether the input moved, and
reuse the answer where it did not. None of them skips a check.

THE PASS IS WHAT MAKES IT SAFE. A pass is synchronous, so nothing can interleave
inside one, and the file door has already verified every file it holds. An answer
built from those files inside that pass is exactly as fresh as they are.

OUTSIDE A PASS EVERY ONE OF THESE IS INERT. The pass number is zero there, and
the caches neither read nor write.

## A state form is built once per pass

BUILDING ONE STATE FORM IS A TEMPLATE, A LINT, A BOUND VIEW, A PROBLEMS LIST AND
AN OWED LIST. Drawing a route asks for one per state on the way and per state
feeding one, and the leaving check asks again.

MEASURED: 1,034 milliseconds of a 6,113 millisecond sweep.

THE KEY IS THE INSTANCE TEXT, not the pass alone. A pass writes generated
containers while it walks, so a form written mid-pass must not be served from
before the write. The door forgets a file it wrote, so the text comes back
changed and the entry misses by itself.

THE READ GOES THROUGH THE DOOR NOW. It used to ask the filesystem directly, which
is two syscalls the pass had already paid.

## A signature is read without building the form

THE INPUT CHECK WANTS ONE FIELD. `feedersUnsigned` asks whether each feeding
state is signed, and read that one boolean off a whole rebuilt form.

MEASURED: 914 milliseconds of a 5,772 millisecond sweep went to building forms
nobody read a second field of.

THE ANSWER IS THE SAME ANSWER. It is the same frontmatter key, judged the same
way — a `signed_off` that is a string and not blank. The door parses each note
once and holds it, so a repeat ask costs a map lookup.

THIS IS NOT A SKIPPED CHECK. The check is unchanged; only the work around it is
gone.

## The reachable machines are drawn once per pass

ASKING WHICH MACHINES ARE REACHABLE DRAWS THEM. Every container in that answer is
generated, so the question builds the iteration walk, its pinned canvas, and
every row and group on it.

THE ROUTE SEARCH ASKS PER NODE IT EXPANDS. Working out which iteration owns a
machine falls through to this, and the search does that for every node.

MEASURED: 498 milliseconds of a 3,939 millisecond sweep, redrawing containers
that had not moved since the hop before.

THE KEY CARRIES THE WALKED STACK, because entering a sub-machine adds a machine
to the answer.

## The corpus stamps itself through the door

EVERY WRITE DROPS EVERY DERIVED ANSWER. A derived answer cannot say which files
it read, so one write moves them all, and the trace corpus is one of them.

MEASURED: twelve such writes in a three-hop sweep, four a hop.

THE CORPUS THEN RE-STAMPS ITSELF to decide whether to rebuild, and that stamp
asked the filesystem for all 2,790 nodes, one at a time.

IT ASKS THE DOOR NOW. Inside a pass the door has already stat'd each of those
files, so the stamp costs map lookups. The string compared is the door's own,
which is the one it uses before trusting a held file — the check is the same
check, not a weaker one.

### What was tried and did not earn its place

SHARING ONE GREEN PASS ACROSS A DOOR PASS. `recordDone` memoizes on the pass it
is handed, and most callers hand it none, so the memo was discarded between
calls. Holding one per door pass looked obvious.

IT MEASURED NOTHING — 548 milliseconds against 502 before, inside the noise — so
it was reverted rather than kept. A change made to go faster that does not go
faster is a change with only its risk left.

## The bare aim

THE TWO FORMS ARE ONE VERB WITH A FLAG, and both already exist. The flag decides
whether the walking happens.

WHAT CHANGES IS ONLY THE BARE FORM. It must return having recorded the direction
and walked nothing, and its answer must say which of the two happened so a caller
is never left guessing whether it arrived.

WHAT MUST NOT CHANGE. The combined form. An owner ruling guarantees that a caller
who knows both things can say both at once, and an earlier draft of this round's
requirement would have removed it.

### The bare form still draws, and the measurement is why

A DRAFT OF THIS SECTION HAD THE BARE FORM SKIP THE DRAWING TOO, on the reasoning
that drawing is the search whose cost grows with distance. That reasoning was
never measured, and measuring it killed it.

WHAT WAS MEASURED, on this graph, from the walk's own position:

| what | cost |
| --- | --- |
| building a session | 33 ms |
| expanding one state, cold | 3.7 ms |
| expanding the same state again | 0.1 ms |
| the whole route to `end` | 68 ms, 6 states visited, 6 hops |

SO THE DRAWING IS NOT THE COST. Skipping it saves tens of milliseconds against
an aim that was observed taking seconds, and the seconds are somewhere else.

AND SKIPPING IT COSTS SOMETHING REAL. Only the drawing can say whether the target
can be reached at all. A bare aim that does not draw stores a direction it cannot
vouch for, and the refusal then arrives a call later — which is the opposite of
what req-a-target-that-cannot-be-reached-is-refused-quickly asks for.

WHAT THE BARE FORM SKIPS IS THE SWEEP. That is the walking, and the walking is
what pointing must not pay for.

WHAT IS BOUNDED, AND HOW. The search expands each state at most once and reports
how many it looked at. Distance therefore changes the answer's size and not the
search's shape, which is the property the row was really after.

## The surface half is deliberately absent

THE FOURTH REQUIREMENT OF THIS ROUND is that a slow answer does not freeze the
surface beside it. Its design is not here and that is a decision rather than an
oversight.

WHY. The two honest designs are moving long work off the serving path, or serving
the surfaces from somewhere else. The first is owned by a sibling round walking
at the same time, and specifying it here would collide with it.

WHAT THIS ROUND DOES INSTEAD. It states the demand and verifies it by behaviour,
so whichever design lands satisfies it. The check measures the surface against
itself and keeps its meaning either way.
