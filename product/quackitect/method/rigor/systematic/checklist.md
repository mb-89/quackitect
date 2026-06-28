---
id: rigor-systematic-checklist
rigor: systematic
statement: The systematic-architecting checklist — full rigor. Each milestone is a human-adjudicated gate; its checks are the acceptance. A project TYPE may override or extend any item, but never below this floor.
---

# Systematic architecting — checklist template

Condensed from the V-model / systematic-architecting method (sebot keel M1–M9).
Rigor sets this **principle structure**; the project type overrides specifics.
Each milestone is a **gate** (human-adjudicated). `(killer)` = mandatory, cannot be
tailored away. `(executed)` = adjudicated by a run, not a sign-off.

- **M1 — Frame the problem & vision** · *gate: motivation*
  - method: state goal / actual / delta; draft the vision (Moore "For/Who/The/That/Unlike")
    and pressure-test it with a Working-Backwards PR-FAQ.
  - [ ] vision & scope stated
  - [ ] problem agreed — the delta is real and worth solving *(killer)*
  - [ ] success is measurable — Ch1 success criteria defined
  - [ ] top risks logged (RAID)

- **M2 — Requirements** · *gate: requirements*
  - method: context diagram (system-in-focus + environment, IN/OUT); stakeholders by role;
    function tree; ISO 25010 quality tree with 6-part scenarios; requirements in EARS.
  - [ ] inputs captured — context, stakeholders, use cases
  - [ ] stakeholder coverage — no role left out
  - [ ] requirements verifiable — each states how it is checked *(killer)*
  - [ ] requirements traced — every requirement back to a need

- **M3 — Candidate architectures** · *gate: candidates*
  - method: produce ≥2 viable alternatives (morphological analysis, reference
    patterns); derive the vital-few decision criteria from the requirements and weight them.
  - [ ] ≥2 alternatives elaborated *(killer)*
  - [ ] criteria weighted — derived from the requirements
  - [ ] feasibility rough-checked per candidate

- **M4 — Decide the architecture** · *gate: architecture*
  - method: score candidates with a Pugh controlled-convergence matrix + a sensitivity
    check; record the deciding ADR(s).
  - [ ] chosen architecture stated
  - [ ] choice traced to the weighted criteria
  - [ ] ADR recorded — context, options, decision, consequences *(killer)*

- **M5 — Prove the riskiest unknowns** · *gate: prototype*
  - method: timebox a spike / tracer-bullet (walking skeleton) to validate the riskiest
    assumptions; let evidence update requirements / architecture.
  - [ ] riskiest assumptions validated by evidence *(killer)*
  - [ ] design is buildable
  - [ ] spike results recorded — design advanced as needed

- **M6 — Build & verify** · *gate: implementation*
  - method: implement to the detailed design (arc42 / C4, black/grey-box each block);
    build the qualities in, don't bolt them on; every requirement has a passing `verified_by`.
  - [ ] detailed design complete
  - [ ] internal quality ok (review)
  - [ ] verification green — every requirement has a passing check; coverage green *(killer, executed)*
  - [ ] implementation risks acceptable

- **M7 — Validate & accept** · *gate: validation*
  - method: validate against the original need and use cases (Ch1 success criteria);
    obtain stakeholder sign-off; log gaps as RAID.
  - [ ] meets the need — demonstrated against Ch1 success criteria *(killer)*
  - [ ] acceptance obtained — sign-off evidence recorded
  - [ ] validation gaps captured (RAID)

- **M8 — Package & hand over** · *gate: release* → then `engage ship`
  - method: finalize docs (user/operator, install & deploy, release notes, as-built
    arc42/C4); package versioned artifacts; baseline the configuration.
  - [ ] docs complete & match the actual surface *(killer)*
  - [ ] packaged & versioned
  - [ ] configuration baselined
  - [ ] handover accepted

> **Field review is not a milestone.** The old M9 (re-measure outcomes vs. the Ch1
> criteria, capture lessons, decide continue / iterate / retire, harvest reusable assets)
> is handled by **`/review retro`'s opening field-feedback question at the next
> `engage start`** — there is nothing to measure on a fresh build, so it lives at the
> seam between one iteration's ship and the next one's start.

> **Refine.** M5's spike, iterated after M6, IS the refine loop (`engage refine`):
> explore an idea in a gitignored spike, capture the keeper backward into the design input, and the
> suspect DAG reopens exactly what it invalidates. Refine is a track, orthogonal to this rigor.
