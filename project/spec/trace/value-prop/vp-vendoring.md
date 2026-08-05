---
id: vp-vendoring
type: "[[value-prop]]"
statement: As a builder with my own product, I need to run quackitect as it is, or overlay it with my own method without forking it.
audience: stk-vehicle-owner
outcome: a vehicle vendors the engine and overlays its own guidance, methods and behaviour through one resolution chain, and never writes under the engine
priority: must
---

## Success criteria

- A vehicle run resolves engine and vehicle resources through ONE overlay chain, and never writes under the engine.
  Metric: writes under the engine during a vehicle run. Target: zero.
- A colleague clones the vehicle repository without access to the quackitect checkout.
  Metric: the vehicle repository's dependencies on the quackitect working copy. Target: none.

## Unlike

Forking. A fork gets you your own guidance and loses every upstream improvement from the day you take it. The difference is the overlay chain: your method sits on top, and the engine underneath keeps moving.

## Notes (not load-bearing)

The wording follows v1's own Moore frame at its engine-vehicle iteration: other projects VENDOR AND OVERLAY WITHOUT FORKING.

The reason this is a must rather than a nice-to-have: quackitect goes open source, while company-specific guidance must stay inside the company. Without vendoring, those two facts cannot both hold.
