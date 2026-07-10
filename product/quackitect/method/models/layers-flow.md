---
id: model-kind-layers-flow
question: what may depend on what, and how do signals travel through the system?
format: mermaid-flowchart
choose-when: elements rank along an abstraction gradient and signals travel through the ranks - engines, pipelines, embedded systems, layered services
smells: no-flow-layer, sky-fall, rank-mixed-region
---
# layers-flow

The onion (owner physics). Rank = ABSTRACTION GRADIENT:
the outermost layer (the rim) touches the real world and is mechanical; the
innermost (the kernel) holds the core algorithms - the most complicated part,
ignorant of the periphery. Swap a rim element (an IO board, a fieldbus, a UI)
and nothing inward changes.

## The laws (each one checkable)

- **Dependencies point inward, at any depth** (open layering). An inner element
  naming an outer one is a divergence.
- **Signals originate at the rim.** Only rim elements read or write the world;
  external I/O in any inner rank is a divergence (derivable from the code's
  reads/writes analysis).
- **The kernel is pure** - no external I/O, no knowledge of surfaces.
- **Transforms live in SEAM BANDS**, not layers: a subgraph named
  `<outer>--<inner>` declares the adapter band on that seam. Bands OWN CODE
  (transform modules are real and can be big); a band element may be called by
  the outer rank and may call the inner rank. Bands are not layers: no rank of
  their own, exempt from the no-flow smell.
- **Identity transit is legal.** A signal that fits the lower coordinate system
  as-is routes through untransformed - transforms are never invented for
  pass-throughs.
- **A-to-B notation, never input/output.** "Input" and "output" flip meaning
  with the speaker's seat; every movement is named by its endpoints
  (rim-to-graph, graph-to-rim) - in flow labels, prose, and renders alike.
- **Ambient band**: a subgraph named `ambient` holds meaning-free utilities -
  callable from every rank, may call only ambient, exempt from the no-flow
  smell. Self-policing: an ambient element calling a real rank is a divergence
  and must move.
- **Elements are design regions; files are themes.** The model allocates each
  marked region to one rank or band. A FILE may span ranks - it groups regions
  by THEME (the Schlauch/vertical slice), and the theme derives from
  co-location, zero syntax. Renders show ranks as rings and themes as
  highlights, never as always-on borders.
- **Unmarked code is architecturally invisible.** File-local helpers outside any
  design region are detail, not architecture (Bass's line) - no allocation, no
  sky-fall, no pill.
- **Smells**: a REAL layer whose elements touch no flow (push its content down);
  a realized code REGION no model allocates (sky-fall - "no device falls from
  the sky"); a region whose body spans ranks (rank-mixed - split it; the model
  leads, the code follows).

## By example (the mint stub)
```mermaid
flowchart TD
  %% subgraph order = rank, innermost first; bands and ambient anywhere after
  subgraph kernel
    elem-core["the core algorithm"]
  end
  subgraph rim
    elem-io["world contact, mechanical"]
  end
  subgraph rim--kernel
    elem-adapt["rim coords => kernel coords"]
  end
  subgraph ambient
    elem-util["meaning-free utility"]
  end
  elem-io -->|raw signal| elem-adapt
  elem-adapt -->|logical signal| elem-core
```
