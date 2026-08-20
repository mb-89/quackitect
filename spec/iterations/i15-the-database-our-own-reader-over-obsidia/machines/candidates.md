---
steps:
  - id: cand-continue-v1s-shape
    statement: "Continue v1's shape: v1's YAML view-spec query shape, plus a threshold band on candidate disposition"
    depends_on: []
    realization: software
  - id: cand-explicit-and-safe
    statement: "Explicit and safe: v1's query shape, but every candidate gets a disposition row up front"
    depends_on: []
    realization: software
  - id: cand-fast-path-plus-blocking
    statement: "Fast path plus blocking: a stat-invalidated corpus cache, and grouped review for a wide candidate pool"
    depends_on: []
    realization: software
  - id: cand-relational-plus-ensemble
    statement: "Relational plus ensemble: an embedded relational store, and two independent rankers required to agree"
    depends_on: []
    realization: software
  - id: cand-narrow-grammar-plus-explicit
    statement: "Narrow grammar plus explicit: the probed closed regex grammar, and explicit review with no auto-classification"
    depends_on: []
    realization: software
---
