---
id: model-kind-state
question: what modes does it have, and what moves it between them?
format: mermaid-state
choose-when: behavior is modal - lifecycles, protocol states, operating modes
smells: unreachable-state
---
# state

stateDiagram-v2: states and labeled transitions. The transition label names the
trigger. Cheap to conformance-check against a code enum plus its transition set.

## By example (the mint stub)
```mermaid
stateDiagram-v2
  [*] --> open
  open --> done: bless
  done --> suspect: input changed
  suspect --> done: bless
```
