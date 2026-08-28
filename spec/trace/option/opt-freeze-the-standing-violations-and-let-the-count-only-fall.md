---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: opt-freeze-the-standing-violations-and-let-the-count-only-fall
type: "[[option]]"
statement: The rule records how many violations stand today and refuses any change that raises that number, so a large codebase moves onto a rule in stages.
cluster: cluster-the-door-regime
found_by: prior-art
source: the six-system comparison in this record's prior-art-one-door.md — ArchUnit's freeze mechanism stores the current violations and fails only on new ones, and dependency-cruiser's generated baseline does the same
---

## Mechanism

One recorded number, or one recorded set. A change that leaves it the same or
lower passes. A change that raises it fails.

WHY IT MATTERS HERE MORE THAN IN THE SYSTEMS IT COMES FROM. 79 modules import
the filesystem directly. A rule that refuses all of them turns red on day one
and stays red, and a rule nobody can turn on governs nothing.

WHAT IT BUYS THAT A DEPARTURE LIST DOES NOT. A departure list needs a decision
per site, so 79 sites is 79 acts of judgment before anything is enforced. A
frozen count needs none: the existing state is accepted wholesale and only the
next change is judged.

WHAT IT COSTS. The accepted state is accepted without anybody reading it, so
nothing is learned from the 79. That is the exact opposite trade from the
predecessor's voice ruling, which refused exemptions on the ground that they
freeze debt and teach nothing.

SO THE TWO ARE A REAL CHOICE rather than a preference, and they sit in the
same cell of the chart. This registers as
raid-risk-seventy-nine-modules-cannot-reach-a-door-in-one-step-and-nothing-ratchets.
