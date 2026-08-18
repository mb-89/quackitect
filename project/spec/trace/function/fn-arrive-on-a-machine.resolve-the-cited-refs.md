---
minted_in: i35-the-cloud-run-s-findings-land-the-fix-fi
id: fn-arrive-on-a-machine.resolve-the-cited-refs
type: "[[function]]"
cluster: the-arrival
statement: "make the branches the corpus cites resolvable, and name any left unresolved"
satisfies:
  - req-every-ref-the-corpus-cites-resolves-on-arrival
inputs:
  - flow-arrival-request
outputs:
  - flow-repository-refs
  - flow-arrival-account
---

## Rationale

A record cites v1 and v2 by ref, and a cloud clone carries one branch. Without this the citation is not merely unavailable — it fails in a way that reads as absence, and i15 minted an assumption on that absence and spread a false claim through six evidence forms.

NAMING WHAT IS LEFT UNRESOLVED is half the function. A silent degradation is what made that failure expensive.
