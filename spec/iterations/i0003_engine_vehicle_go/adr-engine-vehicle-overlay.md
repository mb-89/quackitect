---
id: adr-engine-vehicle-overlay
type: adr
statement: Separate the engine from the vehicle as an overlay resolution chain (vehicle to engine), where the most-specific layer wins and un-overridden resources are inherited. Prior art is OverlayFS, Kustomize bases and overlays, Hugo theme inheritance, and Rails mountable engines. The chain is nestable. A vehicle can itself be an engine for another.
addresses: [req-engine-vehicle-split, req-overlay-resolver]
adjudicated_by: human
killer: true
---

## Rationale (not load-bearing)
i0003. File-level override for prompts and guides (simple). Keep semantic merge for rigor and checklists (already exists). Merge granularity is the one open fork.
