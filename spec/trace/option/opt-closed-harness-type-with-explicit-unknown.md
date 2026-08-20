---
minted_in: i36
id: opt-closed-harness-type-with-explicit-unknown
type: "[[option]]"
statement: Represent the identified harness as a closed set of named values with an explicit Unknown member, never a free-form string, so an unrecognised harness cannot silently pass through code written for one of the known five.
cluster: cluster-the-arrival
found_by: heuristic
source: "Heuristic: make the illegal unrepresentable, not merely checked (meth-heuristics-catalog.md)."
---

## Mechanism

A free-form string read from a handshake can hold anything, including a
typo or a harness nobody has seen yet, and code written against "one of
five known values" has to re-check that on every use.

A closed type with an explicit Unknown member makes the fifth case a value
the type system already knows about, rather than a string comparison every
caller has to remember to add.

WHAT SURVIVES THE TRANSFER. identify-the-harness's output should carry this
shape: one of the named supported harnesses, or Unknown — never a bare
string that happens to usually be one of five things.

WHAT DOES NOT. The heuristic says nothing about WHICH five harnesses belong
in the closed set, or how the set grows when a sixth is supported — that
stays this project's own decision, revisited as harnesses are added.
