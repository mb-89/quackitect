# Many agents, one box: what collides and what does not

Measured on a cloud box in September 2026, with sixteen agents on one tree for
an afternoon. The owner asks for the conflicts and a proposal. It happens on
other boxes too, so this is about the shape rather than about that day.

The decision is on [[wk-eb382e8b6d]].

## The result first

The claim is not the scarce resource. The tree is.

Claims did not collide once. Agents on one box share `.se/holds.json`, and the
queue handed each of them different work all afternoon, sixteen of them. That
half of the design works and needs nothing.

Everything else on the box is one copy shared by everybody: the source tree,
the git index, the built engine at `.bin/se`, and the one engine serving the
lane. Each of those was a real outage that day, and each stopped every agent
rather than one.

## What collides on one box

### One. A half-finished edit breaks the build for everyone

Three separate times a worker's edit left `src/engine` unable to compile its
tests, and while that stood nobody on the box could run a single test.

- The `logbook` move into `src/engine/internal` left `log_test.go` reaching for
  `l.limit` and `owed_test.go` for `l2.session`, both now unexported across the
  package boundary. `go build` passed and the test binary did not.
- Later `enginefromthetree_test.go` named `theNamedEngine` and
  `newestSourceUnder`, which did not exist yet.

**What it cost.** Three rounds of mine, and a message asking another worker to
finish. The work was correct in both cases and mid-flight. There is no version
of a shared tree where this does not happen, because a refactor is not atomic
and the tree has no notion of whose edit is whose.

### Two. The index belongs to nobody, so an ordinary commit is unsafe

The tree carries every agent's unfinished work at once. `git add -A`, or any
commit that does not name paths, sweeps up files that belong to four other
agents and are half written.

**What it cost.** Every push made that day was built with plumbing rather than
a commit: read the remote's tree into a private index, hash the changed files,
write a tree, commit-tree on origin's head, push. That works, and it is not
something an agent should have to invent.

**And it has bitten for real.** A whole-tree commit deleted `version.go` and
`yaml.go` and `origin/v4` stopped compiling until a later commit put them back.
That is [[wk-ad32a95f60]], and the token that duplicates it is [[wk-07df68aa8e]].

### Three. The built engine goes backwards

`.bin/se` is one file for every agent. A fix was landed, tested, and the engine
swapped onto it three times. The fourth check found `.bin/se` with an *earlier*
timestamp than the build that had just been made, a link count of two, and the
new function absent from the binary: another agent's build had replaced it with
a cached one.

**What it cost.** A fix proved green by its own test could not be demonstrated
at the live door, and the token records that criterion unmet rather than ticked.
Worse, the guard the whole box runs under was quietly older than the tree.

### Four. One lane, and a timeout that is not a failure

One engine answers every agent. Under load `se_apply` and `se_test` timed out at
sixty seconds repeatedly.

**Twice a call that reported a timeout had in fact landed.** Both writes
applied. The result was a constant declared twice in `claim.go` and a build that
failed for everyone until it was found. An agent that retries a timeout is doing
the right thing and gets punished for it.

### Five. The staffing gate asks for hands the queue cannot use

The engine refuses every call until enough agents have pulled. A session doing
one piece of work therefore spawns agents repeatedly to buy the right to write a
file.

Eleven reviewers were spawned that afternoon. Every one answered `wait`, because
thirteen of the fourteen verdicts owed were held by another box, nine of them by
a box that was gone. The gate counted hands present rather than hands the queue
could give work to.

### Six. Two records of who holds what, and they disagree

`.se/holds.json` held a token under an actor the token's own frontmatter did not
name, and the wait notice named a token whose file the engine had deleted.
Nothing asserts that the two agree.

## What collides between boxes

Only claims, and git settles those. The loser of a race is refused, reads the
winner's ref, and writes again on top. That was the one thing genuinely broken,
because a cloud box could not push the claims ref at all, and it is fixed:
[[wk-4759d90994]].

So the two lists do not overlap. A second box brings no tree conflict and one
class of conflict that is already handled.

## The proposal

### One fix removes most of it: a working tree per agent

Give each agent its own working tree over one repository, the way `git worktree`
does. Then an edit in flight cannot break anybody else's build, which is one.
Each agent commits normally, naming nothing, because the index is its own, which
is two. Each agent builds its own binary, which is three. The lane is per tree,
which is four.

Five and six are unaffected and want their own fixes below.

This is the same answer as adding boxes, done cheaply: what a second box really
buys is a second tree. Claims already coordinate across trees, which is exactly
what was made to work today.

### Where that is too much, one fix per conflict

- **The build.** A lock around the build, and `.bin` per agent rather than one
  file. A build that finds the binary newer than its own inputs leaves it alone.
- **The index.** The engine offers the plumbing path as a verb, so an agent
  landing work names its paths and never touches the shared index.
- **The lane.** Either a call that is safe to repeat, or one that says whether it
  landed. A timeout must never be ambiguous. This is the smallest change with
  the largest return, because it turns a quiet corruption into a retry.
- **The staffing gate.** Count hands the queue can hand work to, not hands
  present. A gate that demands agents for work that is all held teaches the
  session to spawn for nothing.
- **The two records.** Assert that `.se/holds.json` and the token frontmatter
  agree, in a test, in both directions.

### What not to do

Do not raise the agent count per box to get throughput. Sixteen on one tree
spent their time waiting for each other to finish an edit, and the failures
above all scale with the number of agents on a tree rather than with the amount
of work. Two or three per tree is about what one tree and one engine carry.
