---
kind: method
statement: "DSM banding groups mutually-independent elements at the same topological level into one band. It exposes within-layer parallelism."
source: ref-structural-complexity-management
---

## Situation

Reach for it once a [DSM partitioning](meth-dsm-partitioning) layering exists.
The real question then is what can be worked on concurrently at this layer.

## Effect

Elements that can be processed independently of each other sit side-by-side
after partitioning. They group into the same band, drawn as alternating light
and dark matrix column bands.

The objective is to minimise the number of bands. That maximises parallelism
per band.

A band's most-constrained element is its critical element.

Banding explicitly ignores backward and cycle edges. It looks only at forward
adjacency in the already-partitioned order.

Quality is bounded by the prior partitioning. A bad ordering yields bad bands,
and the same caveat applies to [tearing](meth-dsm-tearing) run beforehand.

## Procedure

Run banding only on an already-partitioned DSM, torn first where that is
relevant.

Group elements that are forward-adjacent and mutually non-dependent at the
same level into one band.
