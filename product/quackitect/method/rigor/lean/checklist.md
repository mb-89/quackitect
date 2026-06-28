---
id: rigor-lean-checklist
rigor: lean
statement: The lean checklist — light structure: one grounded-review gate per concern, executed checks where cheap. Inherits vibe; is inherited by systematic.
---

# Lean — checklist template

A **condensed systematic walk**: every concern gets ONE grounded-review gate (point at the
referent — file/line/value, not a bare "looks good"), and cheap executed checks (tests,
compile, lint) run where they're free. The concerns map 1:1 onto the systematic milestones,
so a project can step up to `systematic` without restructuring. `(killer)` = mandatory.
`(executed)` = a run decides.

- **L1 — Frame** · *gate: review* — maps to M1
  - method: the problem, who has it, and what "done well" means — a sentence or two.
  - [ ] problem & success stated *(killer)*

- **L2 — Requirements** · *gate: review* — maps to M2
  - method: what it must do, each item stated so it is checkable; note the main constraints.
  - [ ] requirements stated, each checkable *(killer)*

- **L3 — Design** · *gate: review* — maps to M3–M5
  - method: the approach in brief, plus one rationale line (why this, not the obvious
    alternative); spike only the single riskiest unknown, if there is one.
  - [ ] approach chosen with a recorded reason

- **L4 — Build & test** · *gate: review* — maps to M6
  - method: implement; run the cheap checks.
  - [ ] tests pass *(killer, executed)*
  - [ ] internal quality ok — a quick self / peer review

- **L5 — Docs & ship** · *gate: review* — maps to M7–M8 → then `engage ship`
  - method: docs match the actual surface; package it.
  - [ ] docs match the surface *(killer)*
  - [ ] packaged

> Field review is the opening question of `/review retro` at the next `engage start`
> (same as systematic).
