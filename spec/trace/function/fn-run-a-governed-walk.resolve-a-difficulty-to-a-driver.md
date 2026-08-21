---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: fn-run-a-governed-walk.resolve-a-difficulty-to-a-driver
type: "[[function]]"
cluster: the-sizing
statement: resolve a difficulty to the driver it calls for, the same way on every supported host, or answer that none matches
satisfies:
  - req-one-model-list-is-read-live-from-the-repository
  - req-an-unmatched-rung-names-itself-and-publishes-no-driver
  - req-a-machine-decision-repeats
inputs:
  - flow-milestone-difficulty
outputs:
  - flow-driver-recommendation
---

## Rationale

RESTATED 2026-08-20, AFTER ITS REQUIREMENT WAS. The statement used to say "from
one standing mapping". A single mapping is a mechanism, and
`req-one-model-list-is-read-live-from-the-repository` stopped demanding one at
gate-architecture.

WHAT REPLACED IT IS THE OUTCOME THE MAPPING WAS THERE FOR: the same answer on
every supported host for the same inputs. A design holding no roster at all can
satisfy that, and one of the four candidates does.

TWO OUTCOMES AND BOTH ARE ANSWERS. A driver, or the fact that nothing matched with the difficulty named. There is no third outcome and in particular no quiet substitution of whatever is already running.

THIS IS WHERE REPEATABILITY IS TRUE OR FALSE. The three functions around it
read, reduce and publish; this one turns an input into the decision, so it is
the link where the same inputs either give the same answer or do not. That is
why the repeatability criterion hangs here rather than on the chain as a whole.

THIS STATEMENT IS NOT FULLY SOLUTION-NEUTRAL AND THE FORM NOW SAYS SO. "From one
standing mapping" commits to the fixed-table decision: a runtime router or a
per-host resolver could not satisfy it. It stays because the requirement it
serves makes that commitment explicitly and a function neutral about it could
not be traced to anything — but it is an impurity, not a clean case, and it was
first listed among the clean ones.

ONE MAPPING, NOT ONE PER MACHINE. What the mapping HOLDS — a vendor name, a capability word, a row wide enough to differ by host — is not settled, and this function is neutral to all three.
