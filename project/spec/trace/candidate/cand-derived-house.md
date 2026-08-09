---
id: cand-derived-house
type: "[[candidate]]"
name: "Derived house"
statement: "store nothing the corpus can recompute"
picks:
  - "[[opt-graph-with-cycles]]"
  - "[[opt-derive-every-view-on-every-look]]"
  - "[[opt-the-branch-is-the-record]]"
  - "[[opt-no-installer-clone-the-template]]"
  - "[[opt-the-stray-is-a-log-entry]]"
---

## Why this one

This is the deletion candidate. It asks what is left when every derived
thing is recomputed and every lifecycle is a git primitive.

The record is a branch. The note store is a query over the log. The installer
is a clone. No view is written down, because the corpus is small enough to
rebuild each one on demand.

What it trades away is durable state that nothing can derive. Reading credit
is the sharp case: it is not in the corpus, so a restart loses it. It also
bets that the corpus stays small. The bet is measurable rather than
believed — 322 nodes rebuild in 465 ms cold and 119 ms warm today.

It is drawn to be the far end of the space, not the favourite.

## How it works

The baseline stays. The lane, the pull loop, the evidence forms and the rigor
matrix are untouched. What changes is where state lives.

THE SEAM THAT MATTERS IS BETWEEN THE GRAPH AND THE CORPUS. The walk carries
its position in one shared state object rather than a token set. Everything
else a reader might want — which states are green, what the inbox holds, what
the trace says — is recomputed from the corpus at the moment somebody looks.

That makes the position the ONLY thing the system remembers. The corpus is on
disk and git owns its history, so a record needs no lifecycle of its own: a
branch is opened, worked and merged, and its archive is the history.

THE SECOND SEAM IS THE NOTE STORE, and it disappears. A stray becomes a log
entry of its own kind. Pending is a query over the log for strays with no
disposition entry after them, which is the same shape the green computation
already uses.

WHAT THE COMBINATION MAKES POSSIBLE. Nothing can drift, because there is only
ever one copy of anything. The whole class of defect this iteration spent its
day on — a stored rendering disagreeing with the nodes it was rendered from —
is unreachable.

WHAT IT MAKES IMPOSSIBLE. Anything the corpus cannot express. Reading credit
is the concrete case, and it is not a corner: the reading loop is how every
session starts.

## What it costs

RESOURCE, ROUGH. The corpus rebuild is measured, not guessed: 322 nodes in
465 ms cold and 119 ms warm on this machine, on 2026-08-09. A pull that
rebuilds twice is inside a quarter second warm.

THE WORST CASE THAT DECIDES VIABILITY is corpus growth. At 322 nodes the warm
rebuild is 119 ms. The relationship past a few thousand nodes is NOT KNOWN,
and no measurement exists for it. That is a risk with a trigger, not a number.

MAKE, REUSE OR BUY. Every part is reuse. Git supplies the record lifecycle,
the log supplies the note store, and the corpus supplies every view. Nothing
here is bought and almost nothing is built.

THE FAILURE MODE THAT DECIDES. State that cannot be derived has nowhere to
live. Reading credit is lost on every restart, and this session lost it four
times in one afternoon — seven documents re-read each time. A candidate whose
normal operation re-owes the same work is paying a real cost, repeatedly.

## What it leans on

- THE CORPUS STAYS SMALL ENOUGH TO REBUILD ON EVERY LOOK. Measured at 322
  nodes; unmeasured above that.
- NOTHING WORTH KEEPING FALLS OUTSIDE THE CORPUS. Reading credit already
  falsifies this, so the candidate either accepts the loss or needs a home
  for it, and that home is a second store by another name.
- A BRANCH IS ENOUGH OF A RECORD. It carries no goal, no vision and no
  kickoff, so those move into a file on the branch and the claim becomes
  weaker than it sounds.
- GIT'S HISTORY IS THE ARCHIVE, which holds only while nothing is ever
  rewritten. The lane already refuses a rewrite (SE-C-002), so this one is
  supported rather than assumed.
