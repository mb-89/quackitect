---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: raid-iss-the-matrix-cache-is-keyed-on-size-and-modification-time
type: "[[raid]]"
kind: issue
statement: The rigor matrix is cached against a stamp of each row's size and modification time, and the code beside it says in capitals that it must never be — so a mtime-preserving copy can leave a long-lived process serving a matrix the disk no longer holds.
owner: the owner
trigger: any restore, rsync --times, cp -p or tar -x that rewrites a row to the same byte length, against a server that has already read it
status: open
impact: "A long-lived lane server publishes a rung computed from content that is no longer on disk, and nothing says so. Measured by a red team: the same bytes on disk gave 'derive' in the warm process and 'frame' in a fresh one — the weakest answer where the truth was the strongest. That is req-a-machine-decision-repeats, which asks for the same decision on every machine and at every repetition."
breaks_how_badly: corrosive
how_likely: conceivable
probe: "PROBED BY A RED TEAM AT i38's implementation gate, 2026-08-20. Rate every cell C0/R0, load, rewrite every cell to C4/R4 at identical byte length, restore the mtimes, then compare a warm process against a fresh one: warm answered derive on hash 1d0dfd43f884, fresh answered frame on hash d6683e9e2c88, with identical bytes on disk. ON THIS FILESYSTEM A NATURAL COLLISION DOES NOT OCCUR — 200 tight same-size rewrites produced zero. The vector is mtime-preserving tools and filesystems with coarser stamps."
probed: 2026-08-20
source_refs:
  - deliverable/engine/rigor-matrix.ts
  - req-a-machine-decision-repeats
  - dsp-the-sizing-block
weighs_with: none
weighs_against: req-call-answers-in-one-second
---

## The shape of it

TWO CACHES SIT ON TOP OF EACH OTHER. `MATRIX_CACHE` is keyed on a content
hash, which is right. The content hash is itself memoised against `rowsStamp`,
which is `size:mtimeMs` per file — so the stamp decides whether the content is
ever read, and the content decides nothing when the stamp matches.

THE COMMENT ABOVE `MATRIX_CACHE` STATES THE INVARIANT THIS BREAKS, in
capitals: "CACHED AGAINST CONTENT, never against size and modification time".
The sentence is true of the cache it sits on and false of the pair.

## Why it was built this way, and the cost of undoing it

THE STAMP SWEEP IS 48 STATS AND HASHING IS 150 FILE READS. The memo was added
because the hash was recomputed about a hundred times to enter one record —
4,836 times measured — and it was the largest read cost in the profile.

SO THE FIX IS NOT "HASH EVERY TIME". It weighs against
`req-call-answers-in-one-second`, which this milestone measures at a 3.7 per
cent breach already, concentrated in the pull.

## What would close it

A CHEAP CONTENT SIGNAL THAT DOES NOT LIE. A file's inode change time moves on a
mtime-preserving restore where its modification time does not; a size-and-ctime
stamp costs the same 48 stats. That is a candidate rather than a decision, and
it belongs to whoever picks this up.

WHAT MUST NOT CLOSE IT is deleting the comment. The comment is the accurate
statement of what the design wants; the code is what disagrees with it.

## A second, narrower face

`passEpoch()` RETURNS THE CACHED HASH WITHOUT STAMPING AT ALL inside a pass.
So an out-of-band write to a row during a pass is invisible for the rest of it,
regardless of mtime. That is deliberate — the pass already decided — and it is
recorded here because a reader chasing the first face will find it.
