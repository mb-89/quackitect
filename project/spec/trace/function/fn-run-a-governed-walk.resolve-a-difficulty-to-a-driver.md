---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: fn-run-a-governed-walk.resolve-a-difficulty-to-a-driver
type: "[[function]]"
cluster: the-walk
statement: resolve a difficulty to the driver it calls for, from one standing mapping, or answer that none matches
satisfies:
  - req-one-model-list-is-read-live-from-the-repository
  - req-an-unmatched-rung-names-itself-and-publishes-no-driver
  - req-a-machine-decision-repeats
inputs:
  - flow-step-difficulty
outputs:
  - flow-driver-recommendation
---

## Rationale

TWO OUTCOMES AND BOTH ARE ANSWERS. A driver, or the fact that nothing matched with the difficulty named. There is no third outcome and in particular no quiet substitution of whatever is already running.

THIS IS WHERE REPEATABILITY IS TRUE OR FALSE. The three functions around it
read, reduce and publish; this one turns an input into the decision, so it is
the link where the same inputs either give the same answer or do not. That is
why the repeatability criterion hangs here rather than on the chain as a whole.

ONE MAPPING, NOT ONE PER MACHINE. What the mapping HOLDS — a vendor name, a capability word, a row wide enough to differ by host — is not settled, and this function is neutral to all three.
