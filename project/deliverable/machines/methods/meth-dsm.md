---
kind: method
statement: A DSM is one domain's elements as a square, directed dependency matrix. Row affects column, and every structure-analysis operation reads it.
source: ref-structural-complexity-management
---

## Situation

Many elements, with directed dependencies between them. The coupling has so
far only been eyeballed off a diagram.

Reach for a DSM whenever a grouping or tearing decision needs data instead of
intuition.

## Effect

Turns coupling into a data structure every downstream operation reads:

- clustering
- partitioning
- tearing
- banding

A filled cell means "row affects column". A bi-directional dependency needs
two mirrored cells.

Steward coined the term in 1981, analysing a design process's information
flow.

Browning's classification splits the kinds in two.

- Component, architecture and parameter DSMs. Analysed by clustering.
- Activity and schedule DSMs. Analysed by sequencing.

## Procedure

List the domain's elements once, in the same order on rows and columns.

Blacken the diagonal, which is self-reflexive.

Mark a cell where the row element depends on the column element. The mark is
either binary existence or a weighted value.

Keep ONE dependency meaning per matrix. Where more than one relation kind
exists, model each as its own DSM subset.

An example is "reads-from" beside "calls". Do not overlay them into one
binary matrix.

Mixing meanings breaks every analysis that reads the matrix afterwards.
