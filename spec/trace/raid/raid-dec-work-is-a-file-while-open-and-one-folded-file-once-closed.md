---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: raid-dec-work-is-a-file-while-open-and-one-folded-file-once-closed
type: "[[raid]]"
kind: decision
statement: "A piece of work is an editable markdown file while its iteration is open. At close the whole iteration folds into one file, leaves the working tree, and is read back out of version control at a commit the fold records."
owner: the owner
trigger: "the first iteration closed under this rule, and any report that reading an archived iteration is slower or harder than reading the tree was"
status: decided
impact: "It settles what a person edits, what version control holds, and where the tree stops growing. Every later milestone builds on it, and the engine's fourteen readers of the iteration folder change with it."
breaks_how_badly: crippling
how_likely: expected
weighs_with: none
weighs_against: none
source_refs:
  - cand-files-while-open-one-file-in-version-control-once-closed
  - raid-dec-the-volume-is-bounded-by-one-open-iteration
  - opt-a-closed-iteration-leaves-trunk-as-one-file-read-back-from-version-control
  - "scored 2026-08-26: 41 of 75 after grafts, against 34, 35 and 31 for the rivals that were not eliminated"
  - "measured 2026-08-26: git grep over HEAD objects 114 ms against 161 ms over the worktree at 20,000 files"
  - "measured 2026-08-26: git add 26,073 ms across 20,000 files against 97 ms for one folded file"
  - "owner ruling 2026-08-26: version control counts as kept only where the commit can be named"
---

## What it settles

WHERE A PIECE OF WORK LIVES, at both ends of its life.

- WHILE THE ITERATION IS OPEN it is one markdown file, frontmatter and prose
  together, editable with the tools a person already has.
- AT CLOSE the iteration's content becomes one file, one line per item, and the
  folder leaves the working tree.
- AFTERWARDS it is read at a commit, by the lane's own verbs, which already take
  a ref.

THE FOLD DISCARDS NOTHING. It moves what the folder held rather than
summarising it, which is what separates this from folding work into the
evidence.

## The address condition, which is the owner's and binds the build

A DESIGN THAT DELETES OWES AN ADDRESS. The commit holding the pre-fold state is
recorded where a reader will find it, at the moment of folding. "It is in the
history somewhere" is not an address, and content left at a commit nothing names
is lost whatever version control holds.

THAT CONDITION IS WHAT EARNS THE ONE PRIOR-ART PAR THIS DESIGN HOLDS. Without
the recorded address the fold is irreversible, and the changeable-shape row
falls from 4 to 2.

## Rejected options

- ONE FILE PER PIECE OF WORK FOREVER, the round as written. Rejected on
  measurement: staging 20,000 such files takes 26 seconds, disc allocates 7.5
  times the content at 4 KB clusters, and the tree grows with every iteration.
  Scored 31 of 75.
- FOLD THE WORK INTO THE EVIDENCE AT CLOSE and keep the folder. Rejected because
  it discards how the record was worked while keeping what it concluded. Scored
  34 of 75, and it is the closest rival: it reaches a tie by adopting two
  documentation acts the winner performs.
- INVERT THE RELATION so the work names the positions it holds. Rejected as the
  storage answer, and its merge property is separately rejected as incompatible
  below. Scored 35 of 75.
- FOLD THE OPEN ITERATION TOO. On the chart, never composed as a candidate. The
  owner ruled it out directly: a person cannot edit a line inside a folded file,
  and editability is what the file shape is bought for. Its measured purchase was
  real — `git add` 28 ms against 516 ms at 400 files.
- CHANGE NOTHING. Eliminated at the gate rather than out-scored. It fails eight
  of seventeen must rows because it builds no work-token system at all.

## Consequences

- FOURTEEN ENGINE FILES READ `spec/iterations` FROM DISC, across 33 sites.
  Each learns the folded file or the commit read.
- THE BENCHMARK POOL STOPS COMING FROM A DIRECTORY LISTING.
  `shippedIterations` finds 32 shipped folders today and would find none.
- 37 PROSE CITATIONS STOP BEING LINKS THAT OPEN SOMETHING. A regex rewrites the
  path to a commit-pinned reference, which is resolvable rather than clickable.
  That is a loss and it is smaller than a dead path.
- `req-a-closed-records-folder-stays-on-trunk` HAD TO BE REWRITTEN, from naming
  a place to demanding readability, and is now redundant with two standing
  archive rows. Its deletion is owed.
- ONE STANDING TEST ASSERTS THE OPPOSITE. `deliverable/tests/onetree.test.ts`
  checks that a closed record's folder stays in the working tree.
- THE ARCHIVE READ IS NOT YET PERSON-ONLY. `se_git`'s allowlist carries `show`,
  so an agent reads any folded blob at every autonomy setting. Three of four
  doors are closed and the fourth is open.

## The back-check against the prior art it re-derives

FOSSIL DOES TWO THINGS BETTER. It keeps tickets and wiki inside the repository
database from the start, so the checkout never accretes them and there is no
migration to pay. And it regenerates every derived view from immutable
artifacts, so a view format can change at any release without touching what is
held.

WHAT FOSSIL PAID THAT WE HAVE NOT. Its content is unreadable without Fossil.
Every artifact here is text a person opens with anything, which is the demand
that ruled out both shipped counter-examples in the first place.

GIT-BUG STORES ISSUES AS GIT OBJECTS RATHER THAN FILES, for the same reason and
with the same price. It also carries a stored format version per issue and has
shipped migrations for it, which is the cost of choosing a serialized shape at
all.

WHAT NEITHER OF THEM HAS. Deriving the work from the reading a step demands, and
routing it by which hand can carry it. Neither appeared in any scan, and both
are the round's own.

## What falsifies it

A CLOSED ITERATION NOBODY CAN READ, or a fold format that turns out wrong with
no named commit to re-fold from.
