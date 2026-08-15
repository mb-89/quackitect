---
minted_in: i2
id: req-machine-id-anonymous
type: "[[requirement]]"
statement: The engine shall mint a random short machine id at first boot, store it machine-locally outside git, and use it in every claim; no hostname and no personal datum shall reach the remote.
kind: constraint
verify_method: test
breaks_if_removed: Hostnames carry people's names, and the privacy law keeps personal data out of everything stored or published.
breaks_how_badly: corrosive
refines:
  - uc-claim-an-iteration
source_refs:
  - uc-claim-an-iteration precondition
priority: must
---

## Detail

- Eight hex characters suffice for a fleet of machines.
- A person MAY attach a friendly label in the panel; the label is local
  decoration, the id is the identity.
