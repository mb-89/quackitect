---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: raid-dec-the-seal-outranks-the-overlay
type: "[[raid]]"
kind: decision
statement: Where the seal and the overlay pull against each other, the seal wins — an overlay that cannot express something is a limitation, and an overlay that writes under the engine destroys the update path for everyone.
owner: the driving agent
trigger: any design that would let a host write under the engine folder to express an override
status: superseded
breaks_how_badly: crippling
how_likely: expected
impact: This is the ordering every later design decision inherits. Reversed, an update stops being a replacement and becomes a merge, which is the exact cost vp-vendoring exists to avoid, and the failure is silent until the next version arrives.
source_refs:
  - req-nothing-a-copy-does-reaches-its-source
  - req-overlay-resolution
  - vp-vendoring
---

## The conflict, and it was already recorded

THE CORPUS CARRIES IT IN THE REQUIREMENTS' OWN FRONTMATTER.
`req-engine-folder-is-sealed` records `weighs_against: req-overlay-resolution >`,
so the seal already outranked the overlay before this iteration opened.

THIS ENTRY CONFIRMS THAT ORDER RATHER THAN INVENTING IT. i16's goal system
quotes the line and rules the same way, so the ordering is now stated in a
place a later record can point at.

## Why the seal wins

AN OVERLAY THAT CANNOT EXPRESS SOMETHING IS A LIMITATION. A builder meets it,
sees it, and works around it. The cost is visible and it is theirs.

AN OVERLAY THAT WRITES UNDER THE ENGINE DESTROYS THE UPDATE PATH, silently, for
everyone. Nobody discovers it until an engine version arrives and the
replacement takes their edit with it.

A VISIBLE LIMITATION BEATS AN INVISIBLE DESTRUCTION, and that is the whole
argument.

## What it binds

GOAL 1 SITS ABOVE GOAL 2 in i16's goal system for this reason. Any design that
buys expressiveness by relaxing the seal is refused by this entry rather than
argued again.

## Rejected options

THE OVERLAY OUTRANKS THE SEAL. A host may write under the engine folder where
that is the only way to express an override. REJECTED because it makes the
replacement unsafe for everyone in order to make one override possible for
somebody. The cost lands on a person who made no choice, at a moment nobody is
watching.

A SANCTIONED WRITE-THROUGH ZONE under the engine — one named directory a host
may write into, which the update preserves. REJECTED as the seal with extra
steps: it is still an update that has to merge, and it moves the question from
"may I write here" to "which here", which is harder to check and easier to get
wrong. req-engine-folder-is-sealed says zero files, and zero is checkable.

NO ORDERING AT ALL, resolving each collision on its merits. REJECTED because
the corpus already carries the ordering in `weighs_against`, and leaving it
unstated means every future design re-argues it from scratch.

## Consequences

GOAL 1 SITS ABOVE GOAL 2 in this iteration's goal system, and every design
below inherits that order.

A DESIGN THAT BUYS EXPRESSIVENESS BY RELAXING THE SEAL IS REFUSED by pointing
here, rather than argued again.

AN OVERLAY LIMITATION IS AN ACCEPTED COST. When the chain cannot express
something a builder wants, the answer is to widen what an overlay may replace,
never to let it write inward.

AND THE SEAL BECOMES MECHANICALLY CHECKABLE, which is the practical payoff:
vp-vendoring's first success criterion is writes under the engine during a
vehicle run, target zero. A count of zero is a test. "Only in the sanctioned
zone" is a judgment.

## SUPERSEDED 2026-08-18, by owner ruling

THIS DECISION IS VOID. It ranked a seal above the overlay, and the owner ruled
that nothing is sealed: a vehicle is a complete independent copy, owns
everything in it, and may change all of it including what the parent wrote.

THEIR WORDS: "At no point is there any sealing. But again, make sure that
you're not already thinking about solutions. Sealing sounds like a solution."

WHAT REPLACES IT: raid-dec-an-import-is-read-only-and-a-vendored-copy-is-yours,
which carries v2's own law verbatim. The rule was never about a folder — it is
about the DIRECTION OF WRITES. An import is read-only and nothing may reach it.
A vendored copy is yours and you may change all of it.

WHY IT IS SUPERSEDED RATHER THAN DELETED. meth-raid says a decision can only be
superseded, and the reason holds here: this entry records a wrong turn that a
later reader would otherwise take again, because the seal is genuinely the
obvious-looking answer. What it got wrong is worth keeping.

WHAT IT GOT WRONG, in one line: it protected the copy from its owner, when the
thing needing protection was the SOURCE from the copy.
