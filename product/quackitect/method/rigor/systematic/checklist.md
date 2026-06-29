---
id: rigor-systematic-checklist
rigor: systematic
statement: The systematic-architecting checklist, at full rigor. Each milestone is a human-adjudicated gate. Its checks are the acceptance. A project TYPE may override or extend any item. It may never go below this floor.
---

# Systematic architecting — checklist template

Condensed from the V-model and systematic-architecting method (sebot keel M1–M9).
Rigor sets this **principle structure**. The project type overrides specifics.
Each milestone is a **gate** — a `review` check, blessed by a human in increasing-scrutiny rounds
(`guides/milestone-review.md`). Its acceptance items become **subtasks**. A subtask tagged
`(derived: coverage:<rule>)` is computed from the trace by the engine (`class: executed`, no human
stamp). The rest are human-judged (`class: review`). The trace itself is content, never a gate.

- **M1 — Frame the problem & vision** · *gate: motivation*
  - method: State goal, actual, and delta. Draft the vision (Moore: For/Who/The/That/Unlike).
    Pressure-test it with a Working-Backwards PR-FAQ.
  - [ ] vision & scope stated
  - [ ] problem agreed — the delta is real and worth solving *(killer)*
  - [ ] success is measurable — Ch1 success criteria defined
  - [ ] top risks logged (RAID)

- **M2 — Requirements** · *gate: requirements*
  - method: Draw a context diagram (system-in-focus plus environment, IN/OUT). List stakeholders by
    role. Build a function tree. Build an ISO 25010 quality tree with 6-part scenarios. Write
    requirements in EARS.
  - [ ] inputs captured — context, stakeholders, use cases
  - [ ] stakeholder coverage — no role left out
  - [ ] requirements verifiable — every requirement has a test *(derived: coverage:req-has-test)*
  - [ ] requirements traced — every requirement back to a need *(derived: coverage:req-traced)*

- **M3 — Candidate architectures** · *gate: candidates*
  - method: Produce >=2 viable alternatives (morphological analysis, reference patterns). Derive the
    vital-few decision criteria from the requirements. Weight them.
  - [ ] ≥2 alternatives elaborated *(killer)*
  - [ ] criteria weighted — derived from the requirements
  - [ ] feasibility rough-checked per candidate

- **M4 — Decide the architecture** · *gate: architecture*
  - method: Score the candidates with a Pugh controlled-convergence matrix. Add a sensitivity check.
    Record the deciding ADR(s).
  - [ ] chosen architecture stated
  - [ ] choice traced to the weighted criteria
  - [ ] ADR recorded and traced — every ADR addresses a requirement *(derived: coverage:adr-traced)*

- **M5 — Prove the riskiest unknowns** · *gate: prototype*
  - method: Timebox a spike or tracer-bullet — a walking skeleton. Validate the riskiest assumptions.
    Let the evidence update the requirements or architecture.
  - [ ] riskiest assumptions validated by evidence *(killer)*
  - [ ] design is buildable
  - [ ] spike results recorded — design advanced as needed

- **M6 — Build & verify** · *gate: implementation*
  - method: Implement to the detailed design (arc42/C4, black/grey-box each block). Build the
    qualities in; do not bolt them on. Every requirement has a passing `verified_by`.
  - [ ] detailed design complete — every requirement has a realized design *(derived: coverage:designs-realized)*
  - [ ] internal quality ok (review)
  - [ ] verification green — the executed tests pass *(derived: coverage:tests-pass)*
  - [ ] implementation risks acceptable

- **M7 — Validate & accept** · *gate: validation*
  - method: Validate against the original need and use cases (Ch1 success criteria). Obtain
    stakeholder sign-off. Log gaps as RAID.
  - [ ] meets the need — demonstrated against Ch1 success criteria *(killer)*
  - [ ] acceptance obtained — sign-off evidence recorded
  - [ ] validation gaps captured (RAID)

- **M8 — Package & hand over** · *gate: release* → then `engage ship`
  - method: Finalize the docs (user/operator, install and deploy, release notes, as-built
    arc42/C4). Package versioned artifacts. Baseline the configuration.
  - [ ] docs complete & match the actual surface *(killer)*
  - [ ] packaged & versioned
  - [ ] configuration baselined
  - [ ] handover accepted

> **Field review is not a milestone.** The old M9 re-measured outcomes against the Ch1 criteria,
> captured lessons, decided continue / iterate / retire, and harvested reusable assets. That work
> now lives in **`/review retro`**. Its field-feedback question opens the next `engage start`. There
> is nothing to measure on a fresh build, so it sits at the seam between one ship and the next start.

> **Refine.** M5's spike, iterated after M6, IS the refine loop (`engage refine`). Explore an idea
> in a gitignored spike. Capture the keeper backward into the design input. The suspect DAG reopens
> exactly what it invalidates. Refine is a track, orthogonal to this rigor.
