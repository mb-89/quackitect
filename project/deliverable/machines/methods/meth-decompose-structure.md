---
kind: method
statement: "Structural decomposition: the winner's picks become elements, every function lands on one, every boundary crossing gets its contract, and every requirement lands on the structure."
---

## Situation

M5's decompose-structure, after the winner is declared. The winner is five
picks and a compose record; the architecture needs elements, allocation,
interfaces and the requirements trace. This card says how each is derived
and where the judgment sits.

## The three acts, in a loop

The acts move each other — a grouping change moves crossings, moved
crossings change interfaces, a support need adds a function. One state
holds all three on purpose. The corpus draws the same loop: static
partitioning may send you back to functional partitioning.

### Elements

Three sources, in order of how much they decide for you:

- THE WINNER'S PICKS. Each pick names a mechanism; each mechanism becomes
  one or more elements. Mostly derivation — the decisions were made at
  compose time.
- THE STANDING SYSTEM. Brownfield joins as it is. Integrate useful legacy
  rather than redrawing it.
- THE GROUPING JUDGMENT. Substrate several picks lean on becomes its own
  element. Cohesion up, coupling down; volatility separated from
  stability; an element not overloaded; separation of concerns.

Write the black box as each element is named: what it does, what crosses
its boundary, make/reuse/buy ([[element]]). The `group` key on the node
holds the grouping — the same node-borne mechanism `cluster` uses on
functions, written by the same editor.

### Allocation

Every function carries an `element` key naming EXACTLY ONE element — the
node-borne DMM. Exactly-once is a column property: review-class now,
engine-computed later. A function no element takes, or an element no
function needs, is a finding — the same four-holes logic derive-functions
runs.

An element that turns out to need a support function sends you back one
act, and that is the loop working, not a failure.

### Interfaces

The owed cells are COMPUTED: every flow whose producing and consuming
functions sit in different elements crosses a boundary, and each crossing
element pair owes one interface. Each owed cell is answered by an
[[interface]] node: both ends, the flows it carries, the concrete form.

Two coverage directions, both checked: a crossing no interface carries is
a hole; an interface no crossing demands is a question the other way.

## The requirements trace

Every requirement lands on the structure: an element or an interface names
it in `satisfies`. Interface-kind requirements land on interfaces
naturally. Both directions are judgment with a computed count: a
requirement nothing satisfies is a hole in the architecture; an element or
interface satisfying nothing is gold-plating. The vocabulary is SysML's
own — structure SATISFIES requirements, behavior is ALLOCATED to
structure — so the trace reads the same to anyone who knows the standard.

## The closing act

What stood before is SUPERSEDED, explicitly — the CM law: a baseline is
immutable, change means a new one. The losers stay on record and stop
being the architecture.

## The recorded tradeoff

The corpus decomposes per candidate, inside solution elaboration, and
compares structures. This machine compares at pick grain and decomposes
once, after the winner: one decomposition instead of five, at the price
that the scores judged mechanisms rather than structures. Recorded here so
nobody rediscovers it as a gap.

## The metrics are NOT here

DSM coupling and cycle counts belong to evaluate-architecture — the corpus
files matrix analysis under quantitative review, and a number computed
before the structure settles would be interpreted twice.

## Sources

- The SyA architecting deck: the seven contents of an architecture, static
  partitioning, allocation via DMM, black-box descriptions, the good-
  partitioning indicators.
- The owner's own elaborate-solutions notes: the three-step loop with the
  go-back edge, FRAME's Elements pillar, "describe each decision and map
  it to requirements".
- The owner's interface-analysis note: clarify the type of exchange, the
  properties of both ends, and the functionalities involved.
- SysML's satisfy and allocate relationships — the standard names for the
  two trace edges.
- [[meth-dsm]], [[meth-dmm]], [[meth-dsm-clustering]] — the matrix
  mechanics this state reuses.
