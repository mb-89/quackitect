---
minted_in: i1
id: dsp-record-lifecycle
type: "[[design-spec]]"
statement: records seeded, bound, landed and archived as folders on trunk, with generated container machines
realizes:
  - el-record-store
  - if-front-desk-to-record-store
files:
  - deliverable/engine/iterations.ts
  - deliverable/engine/iterations-draw.ts
  - deliverable/engine/records.ts
  - deliverable/engine/seed.ts
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

## One tree one path

ONE TREE, ONE PATH (owner ruling 2026-08-16). A record is read from the
 working tree and from nowhere else.

 WHAT WENT: a branch read. This used to try the record's own worktree, then
 trunk, then `git show <branch>:<rel>` — three places for one file, and the
 answer depended on which of them happened to have it. That third path is
 the retrieval the whole iteration exists to delete.

## The statuses a record cannot be walked from

THE STATUSES A RECORD CANNOT BE WALKED FROM. One definition, because two
 readers disagreeing about what "open" means is the defect this replaces:
 the survey read the status and the container read the filesystem, so i28
 stood in one list and not the other on 2026-08-16.

THERE ARE THREE, AND `abandoned` IS THE THIRD (owner ruling 2026-08-24).

- `shipped` — the walk reached the end and the work is delivered.
- `closed` — the same for a record that does not ship.
- `abandoned` — THE RECORD IS PUT DOWN. It will not be walked, and nobody
  is waiting for it.

WHAT `abandoned` IS FOR. A record whose work is no longer wanted, or whose
outcome arrived by another road while its own walk stood unfinished. Neither
of the other two words can say that: `shipped` claims gates that never
happened, and returning it to `seeded` claims work that was never begun.

THE GAP IT CLOSES, measured 2026-08-24. One record stood open for four days
with every one of its goals satisfied in the tree and three of its ten gates
never walked. No word in the vocabulary fitted it, so it could not leave the
open set at all.

AN ABANDONED RECORD KEEPS EVERYTHING. Its folder, its evidence and its
decisions stay exactly where they are. The standing is a statement about the
future, never an erasure of the past.

IT SAYS WHY, IN THE RECORD. A standing that does not carry its reason leaves
the next reader to guess whether the work was wrong, overtaken, or merely
dropped.

## The container is a dag

THE CONTAINER IS A DAG, AND THIS KEY IS ITS ONLY INPUT (owner ruling
2026-08-12). An iteration naming another here cannot be entered until
that one leaves the open set, because the drawn edge runs dep -> this
and the walk never enters a state whose inbound edges have not fired.

## The seeded machine

THE SEEDED MACHINE (owner design 2026-07-30): an authoring state writes
 the drawing as markdown data in the record (machines/<kind>.md), and the
 matching runs-state descends into its compilation — build-chunks, spikes
 and candidates all share this one shape. Each step's realization kind
 becomes a TAG on its state, so the existing tag-pull serves each builder
 its discipline's guidance. An absent or empty drawing is a TYPED
 REFUSAL, never a plain serve — unless it carries an explicit none with
 its reason, which passes the run state without ceremony.

## The bar sits on the end

THE BAR SITS ON THE END, AND THERE IS NO JOIN PILL (owner ruling
2026-08-09). A build is done when EVERY leaf step is, so plain fan-in
would be an OR — but the bar is a FIELD, not a state, so the end pill
carries it directly.

THE SEPARATE JOIN WAS CEREMONY. It held no evidence, asked nothing and
did no work; it merged, which the bar already does. A pill a reader
cannot act on is a pill that teaches them to click past pills.

## The steps topology

THE STEP'S TOPOLOGY, digested. What a step ASKS FOR and where it SITS are
 different facts, and only the first was ever compared.

 So a row could gain a dependency and no standing iteration would notice.
 That happened on 2026-08-13: build-steps was given a dependency on the
 state that seeds its drawing, and i3's pinned machine kept walking straight
 past it, because no demand had moved.

 Sorted, so re-ordering a list is not a change.

## Did the matrix move under this pin

DID THE MATRIX MOVE UNDER THIS PIN — and nothing about which steps care.

 TWO QUESTIONS USED TO SHARE ONE ANSWER. `iterationDrift` returns an empty
 list both when the matrix is unchanged and when it changed in a way no
 step's demand noticed, and the walk read the second as the first.

 So a matrix edit that reshaped the MACHINE — a new dependency, a state the
 column regained — never refreshed the pin, and the record went on walking a
 snapshot taken before the fix. Seen live on 2026-08-13: build-steps was
 given its dependency on specify-build and i3 kept skipping it.

## The iterations container

THE ITERATIONS CONTAINER, generated: every open iteration is ONE node
 whose machine is the iteration's own walk — M0 alone until the
 kickoff's bless pins a column, the full pinned machine after. The walk
 shows FLAT: milestones are groups on the states, never sub-machines
 (owner ruling 2026-08-04). Nothing open: start runs to end.

## The iterations machine compiled live at call time from

The iteration's machine, COMPILED LIVE at call time from the pinned
 COLUMN. The pin records WHICH column this iteration walks; the shape of
 that column and every form in it are derived from the matrix, so a row
 edited a moment ago shows on the next render — from anywhere, with nobody
 standing in the machine.

 THE MACHINE IS NOT STORED (owner ruling 2026-08-05). A frozen copy made
 the walk hand back the OLD question after the drift had already reopened
 the step for asking a new one, and a reader looking at the state saw a
 form the matrix had stopped asking for.

 WHAT THE ITERATION WAS JUDGED AGAINST is the pin's DEMANDS LEDGER, which
 is a different record and the one the drift check reads. Freezing the
 machine never served that job; the ledger always did.

 The machine id is the iteration's short id either way, so evidence keys
 and history survive.

## Two kinds of sub-machine

TWO KINDS OF SUB-MACHINE, told apart by the name (owner ruling
2026-08-08). A SEEDED one is authored per iteration and lives in the
record, so it is generated here: build-chunks, spikes, candidates.
A STATIC one is method — the same five finders every time — and its
drawing is a .canvas under machines/. Naming a file is what says so.

A static name is left OUT of subGen on purpose. Session.seedSubs and
Session.declForPrefix both fall back to compiling the ref when no
generator answers, which is exactly the right path for a drawing.
Registering it here instead sent the walk looking for a seeded file
in the record and refused with "a run without visible steps".

## A recovery edge is the loops back half

A RECOVERY EDGE IS THE LOOP'S BACK HALF, never a dependency. Counted, it
made every fallback pair a cycle; the cycle guard cut the walk mid-way and
the half-computed layer got MEMOIZED — fix-findings drew at the top of its
group, rows away from the verification it serves (owner report 2026-08-11).

## A drawn view of any machine top to bottom

A drawn view of ANY machine, top to bottom like the walk reads: the
 shared start and end pills, each milestone a labelled group box, states
 inside layered by dependency — independent ones side by side — and every
 edge declaring its sides.

 EXPORTED, AND NOT ONLY FOR GENERATED MACHINES (owner ruling 2026-08-08).
 A hand-drawn sub-machine served its authored x and y, so it read left to
 right while every compiled machine read top to bottom, and a fan's AND bar
 did not look like a bar. Same layout, whatever built the states.

## The seed states its dependency or refuses

THE SEED STATES ITS DEPENDENCY OR REFUSES (owner ruling 2026-08-13).

 TWO ANSWERS USED TO LOOK IDENTICAL ON DISK: I FORGOT, and I DECIDED NONE.
 Only one of them is a decision, and the empty list is what makes it
 expressible. Without it the key cannot tell a silence from a statement,
 and that is the whole defect rather than a nicety.

 THE GUIDANCE ALREADY EXISTED AND DID NOT HOLD. The rule stood in the seed
 tool's own argument description, in the argument list, unmissable.
 Measured 2026-08-13: twenty-seven iterations seeded and the key set on
 seven. Three stated a wait in their own vision prose and carried no edge
 for it — the UI sitting after the panel round, the comment system after
 the machine format, and the cloud iteration after the lane binding.

 A RULE BROKEN THAT WAY WANTS A REFUSAL, NOT ANOTHER SENTENCE.

 ONE MODULE, TWO DOORS. The agent's seed verbs and the mirror's seed form
 both land here, so a person and an agent are held to the same demand and
 read the same remedy.

 req-a-seed-states-its-dependency

## Quoted because the writer controls the field and not

QUOTED, because the writer controls the field and NOT its content.
An override is free prose from a person, so it carries colons, quotes
and line breaks. Unquoted, "in chat, 2026-07-29: after reading" is a
nested mapping and the WHOLE record stops parsing. That happened for
real on e22 and took the record down with it.

## The close hands over

THE CLOSE HANDS OVER, IT DOES NOT REFUSE (owner ruling 2026-08-16).

 IT REFUSED UNTIL TODAY, and the refusal was the wrong shape. Disposing an
 owed item means fixing the thing or RULING its register entry, and a ruling
 is usually the person's. So the refusal put a person-blocking step at the
 very end of every record — at the one moment the only thing left to do is
 ship, which is when the pressure to wave it through is highest.

 AND IT TRAPPED THE WALK. A close that will not pass leaves the walk standing
 in the last state with no legal move, which is the failure the owner named
 after it happened three times in one day.

 CARRYING IS STILL A DISPOSITION. "Carried to the next record, on the record"
 is an agreed outcome, which is what NASA NPR 7123.1 means by a review
 completing on dispositions rather than on every finding being fixed.

 THE STOP MOVES TO THE SEED. The count rides the closed record, so the next
 record can read it, surface it and — above a threshold — be a pruning
 record rather than a new one. That half is not built here; this is the end
 that stops the trap.

## Mergeandretire and mergetotrunk are gone

`mergeAndRetire` AND `mergeToTrunk` ARE GONE (i34). They merged a record's
branch to trunk and then ran `git rm -r` on the record's directory, under
the 2026-07-28 ruling that closed records live in git and the tree carries
only live work.

THERE IS NOTHING TO MERGE, because a record's work is written on trunk from
the first keystroke, and NOTHING TO RETIRE, because the archive reads the
folder from disk.

WHAT WENT WITH THEM: the conflict handling, the abort, and the typed refusal
that named the conflicting files. A merge that cannot happen cannot conflict.

## Close the shipped iteration

CLOSE THE SHIPPED ITERATION — fired by the walk itself as it leaves
 through the terminal (owner ruling 2026-08-11: after the last bless the
 iteration archives itself, exactly like an expedition). The blessed
 release gate was the human ruling, so this close carries no second
 judgment and no report guard. Trunk strays settle, leftovers commit,
 the branch merges, the record dir retires to its branch, the worktree
 goes — the iteration archive lists it from then on.

## A generated machine is drawn from the record

A RECORD IS A DOCUMENT AND THE WALK NEEDS A MACHINE, so one is generated from
the other: the seeded steps become states, the pin becomes their order, and
the whole thing gets a canvas laid out by dependency depth.

READING A RECORD AND DRAWING ONE ARE DIFFERENT JOBS. The reading half answers
what the record says; the drawing half takes records already read and answers
with a machine and its canvas. Nothing in the drawing half is asked for while
a record is being read, which is why the dependency runs one way.

THE BROWSABLE LISTS ARE DRAWINGS TOO — the iteration list, the archive decades
— generated the same way from the same records, which is why they live beside
the walk's own machine rather than beside the reading.
