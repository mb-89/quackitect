---
id: rigor-lean-checklist
rigor: lean
statement: The lean checklist. Light structure. One grounded-review gate per concern. Executed checks where cheap. It inherits vibe. Systematic inherits it.
---

# Lean — checklist template

A **condensed systematic walk**. Every concern gets ONE grounded-review gate. Point at the
referent: a file, a line, a value. Not a bare "looks good". Cheap executed checks (tests,
compile, lint) run where they are free. The concerns map 1:1 onto the systematic milestones.
So a project can step up to `systematic` without restructuring. `(killer)` means mandatory.
`(executed)` means a run decides.

- **L1 — Frame** · *gate: review* — maps to M1
  - method: State the problem. Name who has it. Say what "done well" means. A sentence or two.
  - [ ] problem & success stated *(killer)*

- **L2 — Requirements** · *gate: review* — maps to M2
  - method: List what it must do. State each item so it is checkable. Note the main constraints.
  - [ ] requirements stated, each checkable *(killer)*

- **L3 — Design** · *gate: review* — maps to M3–M5
  - method: State the approach in brief. Add one rationale line: why this, not the obvious
    alternative. Spike only the single riskiest unknown, if there is one.
  - [ ] approach chosen with a recorded reason

- **L4 — Build & test** · *gate: review* — maps to M6
  - method: Implement. Run the cheap checks.
  - [ ] tests pass *(killer, executed)*
  - [ ] internal quality ok — a quick self or peer review

- **L5 — Docs & ship** · *gate: review* — maps to M7–M8 → then `engage ship`
  - method: Make the docs match the actual surface. Package it.
  - [ ] docs match the surface *(killer)*
  - [ ] packaged

> Field review is the opening question of `/review retro` at the next `engage start`.
> Same as systematic.
