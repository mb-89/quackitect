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

WHY IT COULD BE ARGUED WITH. Travel was never observed working end to end.
i28's validation gate passed with an override saying exactly that: the
mechanism exists and no rented host has ever run it. So what is switched off is
a capability that never delivered, and what is served has cost measurable time
in every session this week.
