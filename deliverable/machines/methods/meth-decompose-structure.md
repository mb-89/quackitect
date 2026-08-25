---
kind: method
statement: "Structural decomposition: the winner's picks become elements. Every function, boundary crossing and requirement then lands on that structure."
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
- THE STANDING SYSTEM. Brownfield joins as it is.
  - Integrate useful legacy rather than redrawing it.
- THE GROUPING JUDGMENT. Substrate several picks lean on becomes its own
  element. Cohesion up, coupling down; volatility separated from
  stability; an element not overloaded; separation of concerns.

Write the black box as each element is named: what it does, what crosses
its boundary, make/reuse/buy ([[element]]). The `group` key on the node
holds the grouping — the same node-borne mechanism `cluster` uses on
functions, written by the same editor.

### Allocation

Every element names the functions it realizes in `implements` — the
node-borne DMM, pointing the same way `refines` points on a requirement:
the newer artifact names what it derives from.

THE MATCH IS NOT ONE TO ONE: several elements or interfaces may implement
one function. Software tends to one-to-one; systems spread a function across
sensor, converter and filter, and the spread is exactly what the DSM shows.

CHECKED: every function implemented at least once, and nothing implementing
nothing — the four-holes logic, review-class now, engine-computed later.

Elements and interfaces both stand in the trace graph's design half, one
radius past the functions.

An element that turns out to need a support function sends you back one
act, and that is the loop working, not a failure.

### Interfaces

The owed cells are COMPUTED: every flow whose producing and consuming
functions sit in different elements crosses a boundary, and each crossing
element pair owes one interface. Each owed cell is answered by an
[[interface]] node: both ends, the flows it carries, the concrete form.

Two coverage directions, both checked: a crossing no interface carries is
a hole; an interface no crossing demands is a question the other way.

## The trace is complete, on two paths

NO RESIDUE: a trace with holes cannot show the
changes, and change visibility is what the graph is FOR.

- THE TRANSITIVE PATH carries most requirements: a requirement is served
  by functions, its functions are implemented by elements, an interface
  carries flows that belong to functions. Nothing writes a requirement id
  onto structure for this path — the chain already exists, and second
  copies drift.
- THE DIRECT PATH carries the rest: a requirement no function chain
  reaches — a structural quality the SHAPE answers (modularity,
  replaceability), an imposed constraint binding a choice, an
  interface-kind requirement about a boundary itself — is named in the
  answering element's or interface's `satisfies`, and only there.

THE UNION IS THE LAW: every requirement reached by one path or the other,
zero unreached. Perturb any node and the affected cone is in the graph,
whole. The trace_complete field carries the count and the direct list;
review-class now, engine-computed later like every coverage here.

SysML's names hold on both paths: behavior ALLOCATED to structure
(implements), structure SATISFIES requirements directly where the shape
is the answer.

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
