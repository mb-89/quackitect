---
minted_in: i34-one-tree-iterations-and-archives-live-on
id: raid-dec-one-tree-beats-a-record-travelling-between-machines
type: "[[raid]]"
kind: decision
statement: One tree per machine wins over a record travelling between machines, so the claim ledger, the seed's push and itAdopt are switched off rather than redesigned.
owner: the owner
trigger: when cloud work is next taken up, or when a second machine is actually needed
status: decided
impact: A cloud machine loses every way to claim an iteration and every way to be refused one. Two machines given the same id would both walk it, silently.
breaks_how_badly: crippling
how_likely: conceivable
source_refs:
  - i34-one-tree-iterations-and-archives-live-on
  - note-0d016e8178b2
  - note-a6d2f0781686
weighs_with: none
weighs_against: none
---

## Rejected options

- TWO PLAIN CLONES, each a single tree, keeping the claim ledger. The owner's
  own first proposal. Rejected because it keeps the engine deciding which tree
  answers a path, which is the fault being removed. Their words: "the engine
  doesn't need to know that."
- A MANIFEST OF CLOSED ID TO COMMIT HASH, with records read back out of git.
  Designed in full earlier the same day and rejected when the owner ruled the
  archive stays on disk. It bought nothing once nothing needed retrieving.
- A BARE REF PER CLOSED RECORD, keeping the existing branch enumeration. It
  costs 41 bytes and no new code. Rejected because it is still a branch, and
  the owner ruled branches out.
- FIXING THE RESOLUTION SEAM INSTEAD. Rejected on evidence rather than taste:
  two or three attempts have been made and the fault recurs. It recurred again
  while this very iteration was being entered.

## Consequences

- THE CLAIMS BRANCH GOES, with engine/claims.ts and its eight claim files.
- itAdopt GOES. A branch handed to a machine can no longer be picked up.
- THE SEED STOPS PUSHING a stub, so a record no longer announces itself.
- WHAT IS NOT LOST, and it matters for whoever restores travel later: the
  conflict is between travel and SEVERAL TREES ON ONE MACHINE, never between
  travel and one-tree-per-machine. claims.ts already works on refs through a
  temporary index and never touches a working tree, so travel can be restored
  without restoring worktrees.
- THE MEASURE THIS BINDS: vp-the-engine's acts-from-clone-to-first-claimed-
  iteration stops being meaningful, because nothing is claimed. Whoever revives
  it must revive a measure too.
- ISOLATION BETWEEN OPEN RECORDS IS GIVEN UP, and this line was missing until a
  verifier asked what the decision had cost. It is the loss most likely to be
  read as a win, so it is written plainly here rather than left to be inferred
  from what was deleted.

## What the isolation loss actually is

WORKTREES MADE IT IMPOSSIBLE FOR ONE OPEN RECORD TO READ ANOTHER'S UNLANDED
WORK. One tree makes it ordinary. Two open records now share every file, and
nothing mechanical stops one from overwriting the other's edits.

req-shared-change-reaches-without-unlanded-work-reaching CARRIED THAT DEMAND AND
WAS RETIRED HERE. It was `priority: must` and `breaks_how_badly: fatal`. Its
measure read "zero unlanded file from one is readable by the other's walk",
which is false by construction today.

THE ROW WAS RETIRED FOR THE WRONG REASON, and the reason is the interesting
part. It was recorded as "satisfied by construction, so it measures nothing".
Its statement has two halves joined by an `and`: the method change reaches the
walk, AND no other record's unlanded work reaches it. One tree satisfies the
first half and VIOLATES the second. Half satisfied and half broken reads exactly
like retired, from the outside.

THE ROW EXISTED TO CATCH THIS EXACT MOVE. Its own Detail says the two halves
were once separate rows that "pull opposite ways", and that written apart "a
design can satisfy either and look compliant". It was written to make that
impossible, and then deleted by the design it was written to catch.

SO THE RETIREMENT STANDS AND THE REASONING DOES NOT. The owner ruled one tree,
and giving up isolation is the owner's trade to make. What was wrong was
recording it as a row that measures nothing, when it was a fatal-graded demand
deliberately broken.

WHAT LIMITS THE EXPOSURE TODAY, so this is not read as worse than it is:
raid-asm-only-one-agent-works-a-clone-at-a-time. One record is walked at a time,
so nothing collides in practice. THAT IS A HABIT, NOT A MECHANISM. It holds
until the day two walks run at once, and 22 iterations stand open.

WHOEVER WANTS PARALLEL WALKING MUST BRING ISOLATION BACK IN SOME FORM, and it
will not be worktrees. opt-overlay-the-shared-layer-under-each-record still
stands and still answers both halves at once, which is where to start.

WHY IT COULD BE ARGUED WITH. Travel was never observed working end to end.
i28's validation gate passed with an override saying exactly that: the
mechanism exists and no rented host has ever run it. So what is switched off is
a capability that never delivered, and what is served has cost measurable time
in every session this week.
