---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: raid-dec-the-volume-is-bounded-by-one-open-iteration
type: "[[raid]]"
kind: decision
statement: "Trunk carries the work tokens of one open iteration and no more. A finished work token is deleted, an archived iteration leaves the working tree, and its evidence is folded into one file per iteration read back out of version control."
owner: the owner
trigger: "the first iteration archived under this rule, and any report that the vault or the tree got slow while one iteration was open"
status: decided
impact: "It moves the volume ceiling from the whole corpus to one iteration. The measured 22,080 to 27,738 files across 69 records becomes 320 to 402, and the file-per-work-token shape stops being falsified on volume."
breaks_how_badly: corrosive
how_likely: expected
weighs_with: none
weighs_against: req-a-closed-records-folder-stays-on-trunk
source_refs:
  - raid-asm-one-file-per-work-token-stays-workable-in-the-vault-and-the-repository
  - req-a-closed-records-folder-stays-on-trunk
  - cand-files-while-open-evidence-once-closed
  - "owner ruling 2026-08-26: an ephemeral work token is on disc only while open"
  - "owner ruling 2026-08-26: an archived iteration is deleted from disc and read through git"
  - "owner ruling 2026-08-26: one iteration is open at a time"
  - "measured 2026-08-26: 68 iteration folders on disc, 1,312 files, 9.7 MB"
---

## What it settles

How big the work-token corpus can get. The answer is one iteration's worth.

Three separate rules produce that one ceiling.

- A FINISHED WORK TOKEN IS DELETED. It exists on disc while it is open and
  nowhere afterwards. Only the trail of which ones existed survives.
- AN ARCHIVED ITERATION LEAVES THE WORKING TREE. Reading an old iteration is a
  version-control operation, not a file read.
- ONE ITERATION IS OPEN AT A TIME. Fifty half-finished iterations is not a
  state this system enters.

## What it does to the falsified assumption

THE MEASUREMENT STANDS AND ITS SCENARIO DOES NOT.

The probe counted 320 to 402 work token files per record and multiplied by the
69 records on trunk, giving 22,080 to 27,738. The arithmetic is right.

WHAT THE RULING REMOVES IS THE MULTIPLICATION. Trunk never holds 69 records'
work tokens, because 68 of them are gone by then.

SO THE CEILING IS 320 TO 402, against 1,821 trace nodes standing today. That is
a fifth of the corpus rather than fifteen times it.

## The fold

AN ARCHIVED ITERATION'S EVIDENCE BECOMES ONE FILE. The owner named JSONL, one
line per item, written at the moment of archiving.

IT IS THE SAME ACT AS LEAVING TRUNK. The fold and the removal happen together,
so there is no window where both forms exist.

## What this costs, stated rather than discovered

FOURTEEN ENGINE FILES REACH `spec/iterations` ON DISC, across 33 sites.
Measured 2026-08-26. Every one of them is a reader that would have to learn the
git path or the folded file.

THE BENCHMARK IS THE CLEAREST CASE. `shippedIterations` in
`deliverable/engine/benchmark.ts` reads the directory to build its pool, and 32
of the 68 folders say shipped. An empty directory gives it an empty pool.

## Rejected options

- KEEP EVERYTHING ON TRUNK FOREVER, which is i34's answer and the one standing today. Rejected on volume: i34 priced the tree at its evidence files, and work tokens multiply that by roughly twenty.
- DELETE THE WORK TOKENS AND KEEP THE FOLDERS. Rejected: the evidence is the larger half, at 1,312 files and 9.7 MB measured 2026-08-26, and it grows with every iteration whatever the work tokens do.
- COMPRESS THE FOLDER RATHER THAN REMOVE IT. Rejected: a compressed archive is unreadable without unpacking it, and every artifact being text a person can open is a standing demand.
- FOLD WITHOUT REMOVING, so the tree carries both shapes. Rejected: it adds a file and removes none, which is the opposite of the purchase.

## Consequences

- Fourteen engine files reach `spec/iterations` on disc, across 33 sites. Each becomes a reader of the git path or of the folded file.
- The benchmark pool stops coming from a directory listing. `shippedIterations` finds 32 shipped folders today and would find none.
- The must requirement req-a-closed-records-folder-stays-on-trunk has to be reopened by the owner before any of this is buildable.
- The fold format is one JSONL file per iteration, one line per item, written at the moment of archiving.
- Reading an archived iteration becomes a version-control operation for a person as well as for the system.

## What falsifies it

AN ITERATION THAT NEEDS A SECOND ONE OPEN BESIDE IT. The ceiling is one
iteration only while that holds.
