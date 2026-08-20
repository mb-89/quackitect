---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: opt-the-folder-cannot-exist-without-a-live-claim
type: "[[option]]"
statement: A worktree is created only as a side effect of taking a claim, and released as a side effect of the claim ending, so a folder without a live claim is unrepresentable rather than merely wrong.
cluster: the-record-life
found_by: heuristic
source: "the heuristic: make the illegal unrepresentable, not merely checked"
---

## Mechanism

TAKING A CLAIM PRODUCES THE FOLDER; the claim ending removes it. There is no
call that makes a worktree and no call that removes one, because neither is a
step anybody takes.

- Entering an iteration writes a claim. The claim's creation is what
  materialises the tree from the branch.
- The claim ending, by close or by expiry, is what releases the tree.
- Nothing else can create one, so nothing else has to remember to remove one.

THE CHECK DISAPPEARS RATHER THAN MOVING. Today the close removes the folder
and a sweep catches what earlier closes left. Both are checks against a state
that should not have been reachable.

## What it is

THE FOLDER STOPS BEING A THING ANYBODY CREATES. Nothing calls "make a
worktree". Taking a claim produces one, and the claim ending removes it, so
the two cannot disagree because they are one act.

## What it sheds

THE WHOLE CLASS OF STALE FOLDERS. A crashed walk cannot leave a folder that
means nothing, because the folder's existence is not an independent fact that
survives the claim. Whatever expires the claim expires the folder.

IT ALSO SHEDS THE CLOSE'S CLEANUP STEP. There is nothing to remember to
remove.

## What it costs

THE CLAIM BECOMES LOAD-BEARING FOR THE FILESYSTEM. Today a claim is a small
file on a branch that records who holds an iteration. This makes it the thing
that owns a directory, which is a much bigger job for an artifact designed to
be a marker.

AND IT NEEDS A CLAIM THAT CAN EXPIRE. Today a claim is released by a person's
judgment, deliberately, with no timeout. A folder that outlives its walk is
exactly the case a timeout would answer, so this option reopens a decision
that was made the other way.

## Where it came from

THE HEURISTIC SWEEP AT M4, holding "make the illegal unrepresentable, not
merely checked" against the-record-life.

THE DESIGN ALREADY HAD THE WEAKER VERSION: the close removes the folder, and
the sweep removes what earlier closes left. Both are checks. This is the
version where the check has nothing to catch.

## What it does not answer

THE OFFLINE CASE, which is settled the other way. Work starts offline and the
claim fails with a warning while the walk continues. If the folder needs a
live claim, an offline entry has no claim to hang it on, and that contradiction
is the first thing to resolve before this option is taken seriously.
