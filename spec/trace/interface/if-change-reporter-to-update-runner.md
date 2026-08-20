---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: if-change-reporter-to-update-runner
type: "[[interface]]"
statement: The reporter hands over every path the vehicle made its own, with what the engine shipped there and what the vehicle now holds, and the runner uses that list to decide which of the arriving program's instructions land on content somebody already changed.
source: el-change-reporter
destination: el-update-runner
carries:
  - flow-vehicle-inventory
form: an in-process call answered from the vehicle's own repository, made once at the start of an update rather than per instruction
bound: inherited. It is one repository diff against a local commit, in the tree already in hand. NOT inherited on a vehicle that has taken many updates and whose base commit must be found first — that lookup is unmeasured and is named below.
satisfies:
  - req-overlay-drift-reported
source_refs:
  - decompose-structure, the element matrix's owed cell
  - raid-dec-serve-the-overlay-and-report-the-drift
  - raid-dec-an-update-arrives-as-a-program
  - cluster-the-bootstrap
---

## The first flow ever to run inside the-bootstrap

[[cluster-the-bootstrap]] SHARED NO FLOW AT ALL UNTIL 2026-08-18. Its members
each acted on a whole tree from outside it and none of them fed another.

THIS IS THE ONE THAT CHANGED THAT, and it is why the cluster's own node had to
be rewritten in the same visit. A candidate that splits the reporter from the
runner turns this into a second cross-cluster seam.

## What crosses, and in which direction

ONE WAY ONLY. The reporter answers; the runner asks. Nothing travels back.

THE TWO ENDS MEET IN TIME, unlike the iteration's other new interface. Both run
inside the same vehicle, in the same act, moments apart. That is what makes a
call the right form here and a written record the right form there.

## Why the runner cannot proceed without it

[[req-overlay-drift-reported]] CLAUSE THREE IS THE CONTRACT. The report of what
the vehicle changed is the only thing that can say which of those changes an
arriving update touches.

WITHOUT IT THE RUNNER IS BLIND. It would apply every instruction and discover
the collisions afterwards, which is the failure mode the whole route was chosen
to avoid.

STEP 7 OF [[uc-vendor-and-overlay]] IS THE STEP THAT DIES. Where the update and
one of their own changes meet, they decide it once. Deciding needs both halves
on the table, and this interface is what puts the vehicle's half there.

## What an integrator has to know

AN EMPTY INVENTORY IS A LEGAL ANSWER, not an error. A vehicle that has changed
nothing takes an update with no decisions to make, and that is the common case
on the first update after a vehicle is produced.

AN INVENTORY THE RUNNER CANNOT BUILD IS NOT AN EMPTY ONE. If the base commit
cannot be found, the answer is a refusal naming the missing base, never an
empty list. The two have opposite consequences: empty means apply everything,
missing means apply nothing.

THAT DISTINCTION IS THE ONE THING ON THIS INTERFACE MOST LIKELY TO BE GOT
WRONG, because both arrive as "no paths".

## What is unmeasured

WHICH COMMIT COUNTS AS THE VERSION IT WAS BUILT FROM, once a vehicle has taken
several updates. On the first update it is the clone point. Afterwards it is
whatever the last accepted update landed at, and nothing yet records that.

SO THE UPDATE MECHANISM OWES A MARK, and this interface is where the need shows
up rather than where it is solved. It belongs to M6.
