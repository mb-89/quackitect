---
minted_in: i5-engine-hygiene-one-version-source-every-
id: fn-arrive-on-a-machine.state-which-build-this-is
type: "[[function]]"
cluster: the-arrival
statement: state which build of the product is installed here, without bringing any of it up
satisfies:
  - req-the-entrypoint-answers-its-version-without-starting
inputs:
  - flow-arrival-request
outputs:
  - flow-arrival-account
source_refs:
  - uc-prove-an-install
---

## Rationale

AN INSTALL THAT CANNOT BE ASKED WHAT IT IS CANNOT BE CHECKED. Every other
arrival function does something: it judges the runtime, supplies the
dependencies, places the cage, raises the lane. This one does the opposite —
it answers and stops.

WHY IT IS ITS OWN FUNCTION AND NOT PART OF ACCOUNTING FOR THE ARRIVAL. The
account is produced BY an arrival that happened. This is asked when no arrival
is wanted at all, by somebody who has installed files and wants to know what
they got before they run anything.

IT IS SOLUTION-NEUTRAL. Nothing here says a flag, a command, or a file. A
design that answered by writing the version into a manifest the caller reads,
or by a service endpoint, would serve this function equally. The flag is the
requirement's business, not this node's.

WHAT IT DELIBERATELY DOES NOT DO. It does not prove the product works. It
states which build is present, and the difference is the whole of its worth:
a wrong build that runs is invisible to every other check in the arrival.
