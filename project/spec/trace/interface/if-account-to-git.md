---
minted_in: i33-every-interface-a-person-or-an-agent-tou
id: if-account-to-git
type: "[[interface]]"
statement: Everything the product remembers is committed here, and the repository is the memory rather than a backup of it.
source: el-account
destination: nbr-git
carries:
  - flow-repository
  - flow-trunk
  - flow-worktree
form: child process, allowlisted verbs
bound: 1 second
source_refs:
  - "i33 model-the-boundaries: the outside edges the element matrix never drew"
  - "contract rule 8: the repo is the memory"
---

## What crosses

- the commits the machine makes on the walk's behalf
- trunk, read at a ref for a past version of the corpus
- worktrees, raised and torn down per record

## Measured 2026-08-17, directly rather than from the log

- `git status --porcelain` over this repo: 56 ms
- `git log -1`: 42 ms

BOTH INSIDE THE BOUND BY MORE THAN AN ORDER OF MAGNITUDE. These are direct
timings of the crossing itself, not counts mined from the call log — which
matters, because the log undercounts silently
(raid-iss-the-call-log-query-omits-matching-records-and-says-it-did-not).

## The bound

ONE SECOND, and it is ordinarily met — these are small commits over a local
repository. The exception is a worktree raise, which copies and is measured in
seconds rather than milliseconds.

SO THE HONESTY HALF BINDS THE RAISE. It is one of the two places a person waits
on this edge, and it must say it is working rather than hold still.

## The push stays with the person, and that is a property of this edge

THE AGENT NEVER PUSHES. It is refused at the lane, so this interface carries
commits outward and never past the origin. `if-record-store-to-origin-remote`
is the edge that would, and it is a person's act.
