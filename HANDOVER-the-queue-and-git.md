# The queue, git, and where a token's state lives

A handover for an agent the owner wants to design this with. It carries the
problem, what was measured, the proposal, what is settled, and what is open.
The open parts are open on purpose. Argue with them.

The token for the work is [[wk-ea3fc56219]], the queue rides git. It carries
needs_human, so nothing picks it up before a person decides.

## The problem, in one line

A token's state travels at the speed of code review, and it should travel at
the speed of work.

## What that means, and what it cost

Every tracked token is a file under `doc/work`, and `doc/work` rides the code
branch. So a box learns that another box closed a token only when somebody
merges code.

Measured on this box in September 2026. This clone sat behind `origin/v4` for a
morning. Forty-one tokens it still carried had been closed and archived
upstream. The engine knew, and it knew only because the pull reaches into git
and asks what the branch has archived.

That reach works. It is also a patch over the coupling rather than a fix, and
it puts git on the pull path, which the owner disliked on sight and was right
to.

The same staleness deadlocked a session for over an hour. The staffing guard
counted those forty-one as open work and held the main agent until reviewers
arrived. Every reviewer spawned pulled, was told wait, and left. The guard then
asked again. That half is fixed, and the fix is described at the end.

## The proposal, from the owner

Expand the claims branch into a queue branch. Every tracked token lives on it.
A mint pushes, a claim pushes, a close pushes. It works offline and catches up.

The claims branch already proves the mechanism. It publishes without touching
the working tree, so the shape and the cost are both known rather than guessed.

## What is settled

**The branch belongs to the work root, never the method root.** The owner's
point, and a sharp one. The work belongs to the project being worked on. A
method carried into three projects would otherwise gather three queues onto one
branch, and hand a box a token from a project it is not in.

The two roots are one folder today, which is why nothing has broken yet.
`fetchedBranch` in `src/engine/pullbehind.go` reads the git at the work root and
is right by accident rather than by intent. Naming the work root makes it right
for the reason.

**Every work root has a repository.** The owner settled this: where init finds
no repository, it makes one. A repository with no remote and no upstream is
fine and is nobody's problem here. The queue branch is local, and it publishes
if and when there is somewhere to publish to.

That removes a branch of the design rather than adding one. There is no case
where tracked tokens live on disk and travel nowhere, and no question about what
a queue means without git. The queue is always a branch. Sometimes nobody else
fetches it.

## What is open, and needs the design

### One authority, or two that drift

If `doc/work` stays on the code branch while the queue branch also carries
tokens, there are two writers over one fact. They will drift, which is the
defect this is meant to end.

The honest version has `doc/work` leave the code branch and live on the queue
branch alone, checked out beside the tree. The owner put it as: the work folder
and that branch need to be in sync. They do, and the cheapest way for two things
to stay in sync is for there to be one of them.

That is a large move. Every token in the tree changes address. It wants
deciding before anything is built.

### The archive, and a correction

An earlier draft said the archive should go. That was wrong and the owner caught
it. Closed tokens go into the archive. That is the record and it stays.

The real problem is the shape, not the fact. `doc/work/archive.jsonl` is one
file that every close appends to. Two boxes closing two different tokens both
write the last line, and that is a conflict every time. One was hand-merged on
this box in September 2026.

Everything else in the design has no conflict. A token is one file, and a claim
stops two boxes touching one. The single shared list is the one place the design
fights itself.

So: one row per archived token, as its own file. The archive stays whole and
answers the same questions, by listing a folder rather than by reading a file
everybody appends to. A single-file view can still be built from the folder for
anyone who wants one, built rather than appended to.

That is a proposal, not a conclusion. If there is a better way to hold an
archive many boxes write at once, it belongs here instead.

### Offline, and conflicts

A failed push leaves the local file standing and the branch catches up. Two
boxes that did touch one token need a rule, and there is a good one available: a
token's status only moves forward, open to done to closed. On a conflict the
further-along side wins. That merges without a person.

Whether that rule holds for every field, or only for status, is open. A note's
prose is not a lattice.

### Cost

A push on mint, on claim and on close. The claims branch already pays that, so
the price is known. It should be a background retry rather than something on the
critical path, or the queue gets slower every time the network does.

## What is already fixed, so it is not designed again

The staffing guard and the queue now share one rule. `WouldHandOut` in
`src/engine/pull.go` answers whether the queue would hand a token to an agent in
a role. The pull's own loop walks it, and `StaffingOf` in
`src/engine/staffing.go` counts with it.

The count previously missed four of the pull's rules: what the branch had
archived, a claim another box holds, never handing a reviewer its own work, and
a note the record refuses to write. `TheRecordRefuses` in `src/engine/store.go`
is that last one, factored out of `SaveToken` so both can ask it.

This does not solve the staleness. It stops the staleness deadlocking a
session, which is a different and smaller thing.
