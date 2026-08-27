---
minted_in: i11-the-engine-fix-bundle-about-twenty-named
id: req-a-harmless-finding-is-carried-not-stopped-on
type: "[[requirement]]"
statement: When a check turns up a defect that blocks nothing downstream, the engine shall let the state sign with that defect recorded as an owed item, and shall move the walk on.
kind: functional
verify_method: test
breaks_if_removed: Every finding must be fixed at once or forgotten, so real defects get fixed out of turn and small ones are lost.
breaks_how_badly: crippling
refines:
  - uc-take-a-step
source_refs:
  - sty-carry-a-finding-without-stopping
  - uc-take-a-step extension 4c
  - "owner ruling 2026-08-16: name the defects, put them in a bucket, and if it breaks nothing continue"
  - "NASA NPR 7123.1: a review completes on the agreed disposition of every finding"
  - raid-risk-an-owed-item-without-a-guard-ships-a-known-defect
priority: must
---

## Detail

TODAY A FINDING HAS TWO FATES AND BOTH ARE BAD. It blocks the state until
somebody fixes it, or it becomes a note that nobody reads again. i34 ran a
whole iteration in the first mode and spent its day there.

THE CHECKLIST TEMPLATE HAS ACCEPTED A THIRD STATE ALL ALONG: `- [owed] <item>
— <ref>`, addressed to an open register entry. It was never used once in i34;
every box was ticked `[x]`. So the shape exists and nothing routes work into
it.

## What "blocks nothing downstream" means

IT IS THE AUTHOR'S JUDGMENT AND IT IS RECORDED, not computed. A defect blocks
when a later state's claim would rest on it. Everything else is carried.

THE JUDGMENT IS CHEAP TO ARGUE WITH BECAUSE IT IS WRITTEN DOWN. An owed item
names what it is and where it is owed, so a reviewer can disagree with the
call rather than discover it.

## What this row does NOT permit

IT DOES NOT PERMIT SHIPPING. req-a-harmless-finding-names-an-open-entry is the
guard, and req-close-refuses-loose-ends is the wall at the end. This row opens
a path; those two make it safe.

WITHOUT BOTH, CONTRACT RULE 4 WINS INSTEAD — a hole in the thing under your
hands is the work, and it gets fixed rather than carried.

## Behaviour

No model wanted. One invariant, checked with a state whose checklist carries an
owed item: the state signs, the walk moves on, and the item is still standing
when the close is attempted.

## Addition — work tokens

THE OWED ITEM ALSO BECOMES WORK, AND THE TWO ARE ONE ACT. This row already
demands the state sign with the defect recorded and the walk move on. What is
added is where the defect goes: onto the state that will fix it, rather than
onto a list somebody routes afterwards.

NEITHER HALF REPLACES THE OTHER. The owed item still names an open register
entry with an owner, because that is what makes the disposition somebody
agreed to. The placement is what makes the fix owed somewhere rather than
remembered.

SO A FINDING CARRIES TWO EDGES after this round: the register entry it names,
and the state it now sits on. req-placing-work-makes-the-destination-owe-it
carries the second.
