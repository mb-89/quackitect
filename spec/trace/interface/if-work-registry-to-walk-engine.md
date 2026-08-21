---
minted_in: i51-work-running-out-of-sight-reports-itself
id: if-work-registry-to-walk-engine
type: "[[interface]]"
statement: The account of work out of sight is handed to the lane's own answer, riding beside whatever the caller asked for.
source: el-work-registry
destination: el-walk-engine
carries:
  - flow-work-account
form: call, read when the answer is composed
bound: inherited — the read is in-process and is paid for by the lane call it rides on
source_refs:
  - decompose-structure, the argued spread
  - raid-dec-the-account-rides-beside-the-door-rather-than-replacing-it
---

THE ACCOUNT RIDES; IT DOES NOT REPLACE. The caller asked for something, and
that answer arrives unchanged. The account is a second field beside it.

WHY THIS CONTRACT EXISTS THOUGH NO FUNCTION CONSUMES THE FLOW.
`flow-work-account` leaves the system, and this element is the door it leaves
through. A builder needs to know where the account is attached, and the
element matrix cannot demand a cell for a flow whose consumer is the world.

WHEN IT IS READ: as the answer is composed, on every lane call. The registry
holds the list already, so composing the account is a read and not a
computation over the world.

WHAT AN EMPTY ACCOUNT LOOKS LIKE: an empty list, never an absent field. An
absent field is indistinguishable from a build that never emitted one, which
is one of the two findings the re-scoring pass raised against this candidate.
