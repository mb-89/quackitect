---
minted_in: i1
id: dsp-walk-machine
type: "[[design-spec]]"
statement: the pull-driven walk over compiled machines, carried by one session that recomputes position on every call
realizes:
  - el-walk-engine
  - if-method-compiler-to-walk-engine
  - if-record-store-to-walk-engine
files:
  - project/deliverable/engine/session.ts
  - project/deliverable/engine/machine.ts
  - project/deliverable/engine/pull.ts
  - project/deliverable/engine/route.ts
  - project/deliverable/engine/atamwalk.ts
  - project/deliverable/engine/conditions.ts
  - project/deliverable/engine/scale.ts
  - project/deliverable/engine/readproof.ts
---

## Responsibility

One pull answers with one instruction: read, fill, choose, do or wait.

THE READING PROOF IS PART OF THAT ANSWER, which is why engine/readproof.ts sits
here rather than beside the lane door. A `read` instruction is not complete
until the walk can tell whether the document arrived, and the probe maths is
what decides it. It was minted on trunk on 2026-08-18 and claimed by nothing
until i17 reached this check.
The session recomputes position from the repository on every call,
weighs each hop against the autonomy slider, serves the owed reading
with its proof, and never trusts a client-held position.

## Interface

The compiled machine arrives from the method compiler; the record's
instance and worktree arrive from the record store. The session is the
one consumer of both.

## Behavior and constraints

- Blocking is an instruction, never an error.
- A crash lands safe: the walk resumes from the repository.
- The pull answers inside a second on the driver's critical path.

## The busbar is the only AND

A STATE'S INPUTS MEET AT AN AND BAR. The bar is passed only when every state
feeding it is done, and the state cannot submit before then.

IT IS THE ONLY AND-MECHANISM. The activation rule, the submit check and the
drawing all read the same field. There is no second word and no second place
it is enforced.

THE BAR IS AUTHORED, NEVER INFERRED. It is an element of the state machine,
drawn by whoever writes the row. The engine never decides where one belongs.

ITS ABSENCE IS THE OR, and that is the default. A state with several inputs
and no bar above it moves on the first input that arrives. No vocabulary says
this — the missing bar already does.

IT IS NOT A GATE THING. A gate is one state that happens to carry a bar, and
work states carry them too. The engine once keyed the rule off the state being
a gate, which gave every work state an accidental OR.

`state_kind: join` survives as DRAWING vocabulary only. The compiler turns it
into a busbar and nothing at run time reads it. The two used to be read in two
places under two names: a matrix row's bar was checked at submit and never at
activation, a drawn join at activation with no submit rule. Same idea, two
mechanisms, nothing making them agree.

INBOUND EDGES ARE DEDUPED, because two edges from one source into one state
are one inbound. Counted twice, a busbar could never reach its own total.

## A green branch satisfies its edge

A BUSBAR WAITS FOR EVERY INBOUND EDGE. An edge whose source already stands
filled has nothing left to deliver — the work is done and its fuel was consumed
the last time the join ran.

WITHOUT THIS A THREE-WAY JOIN IS UNREACHABLE by a single token. Walking one
branch fires one edge; reaching a sibling routes back through the fork, which
re-walks the branch and clears the fuel. Measured: all three branches walked,
the gate still shut, and stepping out to re-enter reset the count to zero.

THE REOPEN PATH SOLVES THE SAME PROBLEM BY PUTTING FUEL BACK. This solves it
for a plain walk, by not demanding it.

## What makes a branch an AND

A BRANCH IS AN AND WHEN a state is reachable from every leg AND carries a
busbar over several inputs.

THE INPUT COUNT IS LOAD-BEARING. Reachability alone says nothing: a machine's
END is downstream of every leg by construction, so any bar on it would turn
every branch in every machine into an AND — including idle's doors, where
taking one is a decision and the others are never walked.

A BAR OVER ONE INPUT SYNCHRONISES NOTHING. It is a bar over two that says the
legs below it are all required.

## The ripple names its root

A FALLEN CLAIM USUALLY FELL BECAUSE ITS INPUT FELL, and that one because its
own did. Naming the first hop sent a reader to amend a state that was merely
waiting, watch nothing change, and ask again.

WHAT IT COST: a value outside its vocabulary trapped a walk for eleven calls,
four states away. Three amends were aimed at states that were fine.

A ROOT IS A FALLEN CLAIM WITH NO FALLEN INPUT OF ITS OWN. That is where work
has to happen; everything between it and here is waiting. The path comes back
with it, root first, so a reader can see how a state four hops away is the
reason this one will not go.

A CYCLE RETURNS NO ROOT, and the caller falls back to naming the first hop,
which is still better than silence.

## Feeders are looked through, never gated on

THE CLAIM-BEARING FEEDERS of a state are found by looking THROUGH states that
carry no claim of their own. This is the ripple computed rather than written:
green stops at the first input that is not green, and no mark on a file is
needed to say so.

TRANSPARENT STATES ARE LOOKED THROUGH. `start` and plain waypoints carry no
evidence form, so they can never be green, and gating on them would grey the
entire machine. The question is the first input that COULD be green and is not.

## Tokens go on the frontier

A RE-PIN REOPENS SEVERAL STEPS, and a token belongs only on the roots of that
set.

WHAT PUTTING ONE EVERYWHERE COST: a re-pin reopened eight scattered steps and
placed eight tokens. The walk then stood in M0's kickoff gate and M3's
requirements at once — two steps on one sequential chain, which no legal
marking holds. The mirror painted eight live states, the pull offered eight,
and the input check refused the later ones on arrival. Enforcement held; the
POSITION was a lie.

A REOPENED STATE BELOW ANOTHER IS RE-REACHED BY WALKING. Its inbound fuel was
just dropped above, so it re-arms and fires again once its feeders sign. Only
the roots need placing by hand.

A GENUINE FORK KEEPS ITS SEVERAL TOKENS. The frontier of a real AND branch is
several states, none downstream of another, and the filter leaves every one of
them standing.
