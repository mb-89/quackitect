---
minted_in: i1
id: dsp-record-lifecycle
type: "[[design-spec]]"
statement: records seeded, bound, landed and archived as folders on trunk, with generated container machines
realizes:
  - "el-record-store"
  - "if-front-desk-to-record-store"
files:
  - "project/deliverable/engine/iterations.ts"
  - "project/deliverable/engine/worktree.ts"
  - "project/deliverable/engine/seed.ts"
---

## Responsibility

A record opens on the person's word, minted from templates as a FOLDER
ON TRUNK. Entering binds; the pinned column compiles the walk live;
closing refuses loose ends; the archive lists every closed record as it
closed, and the folder stays where it is. The container machines —
iterations, expeditions, archives — generate from what stands on disk.

## Behavior and constraints

- ONE TREE, AND NO WORKTREE PER RECORD (i34). The statement and this
  line both said records were carried one worktree each, which stopped
  being true the day the seed stopped making them. What replaced the
  guarantee is an assumption with a trigger,
  raid-asm-only-one-agent-works-a-clone-at-a-time, rather than a lock.
- A SEED STATES ITS DEPENDENCY OR REFUSES (i6). Both seed verbs and the
  mirror's two seed forms hold to one demand, in `seed.ts`, so a person
  and an agent read the same remedy. An empty list is legal and is
  written out, because a silence and a decision must not be the same
  bytes on disk.
- The pin records the demands ledger; the machine itself is never
  stored.
- The layout places a fallback state beside the state it recovers.

## The close is the ruling

ENTERING AN EXPEDITION CREATES ITS RECORD, continuing binds the lane to it,
and the CLOSE IS THE RULING: apply merges the changes to trunk, dismiss
archives them unmerged.

EVERY EXPEDITION IS A FOLDER ON TRUNK, and open comes from its own status —
the same shape iterations took. Before that, the list came from `exp/*`
branches and open meant "a worktree directory exists". Both halves asked the
filesystem a question the record already answers.

THE RECORD'S FRONTMATTER COMES FROM THE ONE TREE. It used to come from three
places: the working copy while open, a merged copy on trunk, and failing both,
a read of the branch. Which one answered depended on what happened to exist.

THE BRANCH READ IS GONE. A closed expedition's record used to live on its
branch, so the reader fell back to reading that branch and cached the result
because a closed branch never moves. The archive lives on disk now, so the
folder is still there and there is nothing to retrieve.

## A disposition is agreed, never asserted

THE CLOSE IS HELD by any register entry still waiting for a ruling.

THE RULE FOR TELLING THEM APART: has somebody ruled on this entry, or is it
still waiting for one? `open` and `probed` are waiting — an assumption that
has been probed is still live, because the probe told you something rather
than disposing of it.

`accepted` AND `deferred` LOOK WRONG IN THE AGREED LIST AND ARE NOT. They
are exactly where a carried finding drifts, and both are real rulings: accepted
means somebody chose to live with it, deferred means somebody chose to move it.
Treating either as unresolved would make the close refuse work already ruled
on, which is what teaches people to stop using the bucket.

## A dirty trunk is settled first

FOUND LIVE, CLOSING AN EXPEDITION. A merge refuses to overwrite uncommitted
local changes, so the merge failed — and the abort that follows failed too,
because no merge had started. The record was already stamped closed by then,
leaving an expedition marked shut, unmerged, with its working copy still
standing.

THE CLOSE COMMITS THE ROOT'S STRAYS rather than refusing. It already does
exactly this on the other side of the merge, on the principle that a walk's
work never silently vanishes, and the root deserves the same.

NOT A STASH. A stash pop can conflict AFTER the merge has started, which
strands uncommitted work halfway through a close.

TRACKED CHANGES ONLY. Untracked files are left alone, so scratch files stay
out of it. An untracked file the incoming branch also creates still fails the
merge, which aborts cleanly and says so.

KEEPING TRUNK CLEAN IS WHAT KEEPS THE READ-PROOF HONEST. A dirty trunk is
exactly when the tree the lane serves and the tree the proof hashes drift
apart.

## The pin, and what reopens under it

THE KICKOFF BLESS COMPILES the blessed change size from the LIVE rigor matrix
and pins that machine into the record with its content hash. Matrix edits reach
the NEXT kickoff, never a running walk, and drift stays silent until asked.

ESCALATION IS RE-PINNING WITH A LARGER SIZE. Monotonicity guarantees every
filled state survives. DE-ESCALATION IS REFUSED: a prediction that proved too
big is finished at its size.

A FILLED STEP SURVIVES ONLY WHILE ITS DEMAND STANDS. If the applies stepped up
or the evidence spec changed, the step reopens and its evidence is re-earned.
Guidance-only wording never reopens, and a WEAKENED demand never does either —
what was filed already covers it.

ONLY STEPS THE PREVIOUS LEDGER KNEW ARE COMPARED. A step that did not exist
then is not in the pinned machine, so there is nothing there to reopen, and an
escalation must reopen exactly what GREW rather than everything the bigger
column added.

THE STEP'S SHAPE COUNTS AS WELL AS ITS DEMAND. A row that gains a dependency
changes where the walk may go, and a pin taken before that change would keep
walking past a state the column now requires. Seen live: build-steps was given
its dependency on the state that seeds its drawing, and a walk went straight
past it because no demand had moved.

## The container is a DAG, never a stack

FOUND IN A SCREENSHOT of twenty-four iterations drawn as one vertical chain.

THE CHAIN WAS A LAYOUT ARTIFACT, NOT A DECLARATION ONE. The declaration
already fanned start to every iteration and every iteration to end; the canvas
was hand-built by stacking boxes down one axis. So the drawing said "series"
while the machine meant "parallel", which is the worst pairing — the reader
believes the picture.

`depends_on` NOW DRIVES THE EDGES and the layout follows. That buys both
halves at once:

- INDEPENDENT ITERATIONS SIT SIDE BY SIDE, because the layout rows states by
  dependency depth.
- AN ITERATION WHOSE DEPENDENCY IS UNMET CANNOT BE ENTERED, because the walk
  never enters a state whose inbound edges have not fired. No new guard, and no
  second rule to keep in step with the drawing.

A SHIPPED DEPENDENCY STOPS CONSTRAINING. Only open iterations are wired, so
closing one frees everything waiting on it on the next paint.

## Leaving is a drawn door, and it comes first

BEFORE THIS THE CONTAINER HAD NO EXIT that did not pass through an iteration.
Its first state fanned to the open records, and each record's only edge ran to
the end. So a route to anywhere outside — the front desk, idle, a retro — could
only be drawn THROUGH an iteration, and drawing it is what entered it.

THAT IS FIVE UNINTENDED ENTRIES INTO ONE RECORD IN A DAY, and it explains why
every one happened on a bare recovery pull. The standing target was the front
desk; the only way the router could reach it was through the first record on
the list, and entering BINDS that record and stamps it started.

FIRST IN THE EDGE LIST IS NOT COSMETIC. The mover walks the edges in order and
takes the first whose role is authored, so edge order IS the default when
nothing chose. The default must be to leave, never to take up work nobody
picked.

## The container's first state is the selection

IT KEEPS THE START KIND, so nothing about the machine's mechanics changes, and
it takes the name of the job it does.

IT IS THE SAME STATE RENAMED, rather than a new one in front. A separate select
state one hop past start was built first and measured: the walk ARRIVES at a
container by landing on its initial state, so the offer stood one hop ahead of
where the walk stopped and came back empty.

## A state sits under its inputs

EVERY ROW USED TO BE CENTRED ON THE AXIS, whatever fed it. A row of three above
a row of one put the lone dependant under the MIDDLE of the three — whoever
that happened to be — and drew its real parent's arrow straight past it. A
reader cannot tell that picture from a join, which is the exact confusion the
busbar exists to remove.

SO EACH NODE WANTS THE MEAN CENTRE of its already-placed inputs, and one input
means it lands squarely under that input. Wants collide, so the row is laid out
in want order with the gap enforced, then shifted so its own centre lands where
the wants averaged. A row whose inputs are not placed yet keeps the old
centring.

## An unauthored sub-machine may be drawn, never entered

THE SCAFFOLD USED TO READ AS AN AUTHORED NONE, and a whole build was skipped
that way, in silence. The pin writes a placeholder so the ROUTE stays drawable
before the authoring state has run, and the run state was then served as a bare
start-to-end pill that walked through without a word.

REFUSING AT THE DRAWING IS THE WRONG SEAM. The placeholder must RESOLVE,
because the machine view has to draw a route through a sub-machine nobody has
authored yet. Two tests refused that refusal and were right to.

SO THE DECLARATION IS MARKED INSTEAD, and the walk refuses to enter a marked
one. Drawing and routing stay legal; entering does not.

AN EXPLICIT NONE PASSES WITHOUT CEREMONY. Zero spikes is a normal outcome when
the drawing says why. Only the scaffold's own literal is marked, so an authored
none is untouched.
