---
minted_in: i37-training-iterations-a-disposable-iterati
id: opt-the-instrument-s-own-history-is-hidden-by-the-binding-not-by-the-folder
type: "[[option]]"
cluster: cluster-the-benchmark-run
question: how earlier results are kept from anchoring a run
found_by: contradiction
statement: "Previous results are unreachable exactly while a measurement is being taken and freely readable at every other moment, so concealment costs nothing outside the run."
source: "separation in TIME again \u2014 the same lens applied to the second concealment, found by asking whether the two hidings share a shape"
---

## The contradiction it breaks

A run must not read previous results, or it anchors on them. A normal walk MUST
read them, or the benchmark history is write-only.

## Why the binding dissolves it

The two demands are never in force at the same moment. Making the rule a
property of the binding rather than of the folder means no reader ever loses
anything it needed.

## Mechanism

One visibility rule keyed on whether a run is bound, consulted by read, search,
glob and list alike. Outside a bound run it is inert.

## What it depends on

The three-list drift. Today read consults no exclusion list at all, so there is
no single place to put this.
