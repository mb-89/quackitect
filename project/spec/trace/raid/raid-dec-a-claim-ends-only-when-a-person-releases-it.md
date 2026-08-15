---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: raid-dec-a-claim-ends-only-when-a-person-releases-it
type: "[[raid]]"
kind: decision
statement: A claim stays with the machine that took it until a person releases it, and nothing takes it away on a timer.
owner: the owner
trigger: superseded only, or the first time an abandoned claim blocks work badly enough that somebody wants a timer
status: decided
breaks_how_badly: crippling
how_likely: conceivable
source_refs:
  - req-a-held-iteration-names-its-holder
  - el-claim-ledger
---

## What was decided

A CLAIM DOES NOT EXPIRE. A machine that took an iteration keeps it, however
long it sits idle.

ONLY A PERSON ENDS IT. The override is a recorded act, and it is the only way
a claim moves to another machine.

## Why, in the owner's own words

RULED ON 2026-08-15: "this machine is working on an iteration. You don't need
an automatic lapse of that. Normally, even if a machine doesn't work on
something for five hours, it's still this machine's item. Unless we manually
override it, it stays with that machine. I don't want automatic override for
this."

## What this reverses

AN EARLIER DECISION IN THIS SAME ITERATION said a claim is renewed while a
walk runs and ends by itself when renewal stops. It was recorded, and then it
was wrong.

IT WAS WRONG FOR A REASON WORTH KEEPING. It was designed to answer a machine
that dies mid-iteration, and it answered that by making every claim temporary.

THE CURE WAS WORSE THAN THE DISEASE. Making every claim expire so that rare
abandoned ones clear themselves puts a clock on ordinary work, and honest slow
work is the common case while an abandoned claim is the rare one.

## Rejected options

- A CLAIM THAT IS RENEWED AND ENDS WHEN RENEWAL STOPS. Rejected by the owner
  on 2026-08-15. It evicts a walk that merely paused, and it puts a timer on
  the one thing a person expects to be stable.
- A HEARTBEAT THAT WARNS WITHOUT ENDING ANYTHING. Not rejected, and not
  adopted either. It is a smaller idea than a timer and it changes nothing
  about who owns a claim, so it belongs to whoever wants to raise it later.
- A SWEEP THAT CLEARS OLD CLAIMS. Rejected on the same ground as the timer.
  Age is not evidence that a claim is abandoned.

## Consequences

- AN ABANDONED CLAIM STAYS ABANDONED until a person clears it. That is
  accepted, not overlooked.
- A MACHINE THAT DIES STILL HOLDS ITS ITERATION. Somebody has to notice.
  [[raid-a-crashed-walk-leaves-a-folder-that-means-nothing]] stays open.
- NO CLOCK SITS ON THE CRITICAL PATH, so no honest walk can lose its work by
  being slow.
- THE FORCE RELEASE STAYS THE MECHANISM rather than becoming an override on
  top of one.
