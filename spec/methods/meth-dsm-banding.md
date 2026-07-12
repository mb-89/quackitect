---
statement: DSM banding - on a partitioned DSM, group mutually-independent elements at the same topological level into the same band, exposing within-layer parallelism.
applies_chapters: [design-output]
applies_type: [default]
applies_rigor: [systematic]
source: ref-structural-complexity-management
aliases: [DSM banding]
---
## Situation
Reach for it once a [DSM partitioning](meth-dsm-partitioning) layering exists and "what can be worked on, or reasoned about, concurrently at this layer" becomes a real question.
## Effect
Elements that can be processed independently of each other, sitting side-by-side after partitioning, group into the same band (visualized as alternating light/dark matrix column bands). The objective is to minimize the number of bands, i.e. maximize parallelism per band; a band's most-constrained element is its critical element. Banding explicitly ignores backward/cycle edges - it looks only at forward adjacency in the already-partitioned order. Quality is bounded by the prior partitioning: a bad ordering yields bad bands, and the same caveat applies to [tearing](meth-dsm-tearing) run beforehand.
## Procedure
Run banding only on an already-partitioned (and, where relevant, torn) DSM; group forward-adjacent, mutually non-dependent elements at the same level into one band.
## Tools
Quackitect's seam bands (the i16 structural model) already name this concept; DSM banding gives the data-driven check that a band's members are genuinely mutually independent, not merely co-located by hand-authored placement.
