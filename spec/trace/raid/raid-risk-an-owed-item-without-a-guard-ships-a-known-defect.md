---
minted_in: i11-the-engine-fix-bundle-about-twenty-named
id: raid-risk-an-owed-item-without-a-guard-ships-a-known-defect
type: "[[raid]]"
kind: risk
statement: An owed item with no open raid entry behind it lets a known defect ship, because the close guard has nothing to block on.
owner: the adjudicator
trigger: any change to the owed disposition, to req-close-refuses-loose-ends, or the first close that passes with an owed item standing
status: open
impact: the bucket becomes a way to carry a defect past every gate without anybody agreeing to carry it, and the iteration ships with a hole nobody ruled on.
breaks_how_badly: fatal
how_likely: plausible
source_refs:
  - i11 draft-vision, the named goal conflict and its ruling
  - "NASA NPR 7123.1: a review completes on the agreed disposition of every finding, not on every finding being fixed"
  - req-close-refuses-loose-ends
  - "contract rule 4: a defect in the work you are building is not a stray"
---

## Why this entry exists

i11 introduces a BUCKET: a finding that breaks nothing is named, filed and
carried, and the work continues. That is the owner's ruling of 2026-08-16 and
it is the right shape — NASA's own procedure closes a review on the agreed
DISPOSITION of every finding rather than on every finding being fixed.

THE WORD THAT CARRIES THE RISK IS "AGREED". A disposition somebody asserts is
not a disposition somebody agreed. Without the second half, the bucket is a
mechanism for shipping known defects quietly, and it directly contradicts
contract rule 4, which says a hole in the thing under your hands IS the work.

## What makes it live rather than theoretical

CORRECTED 2026-08-16 AT probe-assumptions, and the correction makes this entry
WORSE rather than better. This section claimed both halves of the guard already
existed and were merely never used. Only one of them does.

- THE FORM SIDE EXISTS. The checklist template has accepted `- [owed] <item> —
  <ref>` for months.
- THE CLOSE SIDE DOES NOT. req-close-refuses-loose-ends is a `must` graded
  fatal whose Detail says the engine shall refuse while any finding stands
  without a recorded ruling. Searching the engine for a loose-end computation
  returns nothing. The requirement stands; the mechanism appears not to.

i34 RAN A WHOLE ITERATION WITHOUT WRITING `[owed]` ONCE. Every checklist box
was ticked `[x]`. So there were two failure modes stacked, not one: nothing
routes a finding into the bucket, AND nothing would have stopped it at the far
end if something had.

THE OWNER RULED ON IT THE SAME DAY, in as many words: "you're building the
close site in this iteration. There's no way around it." So the close-side
guard is scope, not an assumption this iteration leans on.

WHY THE MISTAKE IS WORTH KEEPING ON THE RECORD. This entry was written to warn
about a guard being bypassed, on the belief that the guard was there. The real
exposure was larger, and the belief came from reading a requirement rather than
the code that should implement it. A `must` graded fatal with no mechanism
reads exactly like a `must` graded fatal with one.

## The response

AN OWED ITEM NAMES AN OPEN RAID ENTRY WITH AN OWNER, or the submit refuses.
That is what makes the disposition agreed rather than asserted, and it is a
demand on write-requirements rather than an intention recorded here.

WHERE THE GUARD IS ABSENT, RULE 4 WINS and the finding is fixed rather than
carried.
