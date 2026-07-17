# M6 - Build plan (i0016_structural_models, systematic)

TL;DR: Nine resumable steps under the build task:

- red battery first
- then the extractor core
- then four parallel consumers (behavior subsets, lints, conformance, render)
- the method/catalog lane beside them
- the owner-facing dogfood last

The dormant canvas requirements (tray and groom) are DEFERRED with a recorded ready-when, so coverage stays honest.

## Build planned  -> i16-m6-plan
**Ordering discipline:** ORDER IS NOT DEPENDENCY - every depends_on names a real producer-consumer link; parallel steps hang flat.
**The steps (children of i16-m6-build):**
- Stage 1 - the red floor:
  - [i16-b1-red-suite](tasks/i16-b1-red-suite.md) - the seventeen-test battery authored, registered, observed RED.
- Stage 2 - the core producer:
  - [i16-b2-extract](tasks/i16-b2-extract.md) - pinned flowchart-subset extractor + canonical semantic hash (BOM stripped; beyond-subset lints and continues - both M5 findings).
- Stage 3 - consumers of the extractor (parallel):
  - [i16-b3-model-nodes](tasks/i16-b3-model-nodes.md) - model nodes in the spec; graph hash folds into the ledger.
  - [i16-b4-behavior-subsets](tasks/i16-b4-behavior-subsets.md) - stateDiagram + sequenceDiagram subsets.
  - [i16-b7-catalog-method](tasks/i16-b7-catalog-method.md) - the kind REGISTRY (owner ruling 2026-07-09): one engine-scanned method file per kind under method/models/, the file IS the registration (the rigor/project_types/roles pattern); its embedded example doubles as the mint stub; views-chosen derives its menu from the scan; a new kind reusing a built-in format subset is alive on day one - kinds are data, formats are code (a new grammar owes an engine step, and lint says so); per-language extraction guidance nests in the appendix.
- Stage 4 - consumers of model nodes (parallel):
  - [i16-b5-lints](tasks/i16-b5-lints.md) - ambiguity, dangling cross-model references, views-chosen coverage.
  - [i16-b6-conformance](tasks/i16-b6-conformance.md) - as-built graph from imports + markers; convergence/divergence/absence; SUSPECT flip; no-flow + sky-fall smells.
  - [i16-b8-render](tasks/i16-b8-render.md) - book design-output chapter + report onion re-pointed.
- Stage 5 - the owner lane:
  - [i16-b9-dogfood](tasks/i16-b9-dogfood.md) - the engine's REAL models authored with the owner; views-chosen recorded; the infra no-flow judgment resolved.
- Stage 6 - the conformance harvest (owner ruling 2026-07-10: the iteration theme is "introduce the models and render them" - ALL findings resolve IN this iteration; b10/b11/b13 run as parallel builders on disjoint files):
  - [i16-b10-seam-rewire](tasks/i16-b10-seam-rewire.md) - ask paths through the AskAdapter seam, never the concrete transport.
  - [i16-b11-core-split](tasks/i16-b11-core-split.md) - go-engine-core splits: loading to the rim--graph band (go-graph-load), hashing stays kernel.
  - [i16-b13-onion-repoint](tasks/i16-b13-onion-repoint.md) - the onion derives from model-engine-layers; design-layers.md retires to a stub-project fallback.
  - [i16-b12-io-sweep](tasks/i16-b12-io-sweep.md) - after b10+b11: every remaining finding resolved by refactor, honest re-allocation, or recorded exemption (adr-logging-ambient is the pattern); the models lint reaches zero.

**Deferrals recorded at plan time:** req-model-tray and req-model-groom are DORMANT Where-conditionals (no canvas kind admitted this iteration) - deferred via decision nodes with ready-when "a canvas format is admitted for an arrangement-authored kind". Deferral carries through coverage (the i15 mechanism), so designs-realized and tests-red stay honest without building dead code.

**Sizing honesty:** the widest step is b6 (conformance). If the schedule breaks, the SMELLS (no-flow and sky-fall) can land in a follow-up walk while convergence/divergence/absence ship. The render step b8 can ship the book chapter first and the report re-point second. b9 needs the owner present - it is LAST deliberately.
**Next after the plan bless:** observe every new test RED (b1), then walk in stage order.

## Internal quality  -> i16-m6-quality
Reviewed 2026-07-10, post-sweep:
- Fourteen new selftests (thirteen minted + the answer-validated class guard), every one observed RED at its recorded hash before its build step; the full battery is green across all iterations.
- models.go carries seven design regions with clear seams; the extractor is one line grammar with three regexes; the canonical-hash rule is stated once and tested twice (cosmetic vs semantic).
- The b12 sweep repaired six NESTED-MARKER hazards (two markers sharing one enddesign made region ownership flap with map order) - a determinism fix beyond its brief.
- Residual debt, recorded as a note: two checker blind spots (builder-Fprintf false-positive class; zero-reference regions invisible) - class guards owed at the next checker touch.
- Voice and comment density match the surrounding code; no gofmt regression introduced (the pre-existing sweep stays a backlog note).

## Implementation risks  -> i16-m6-risks
- The conformance checker gates the ENGINE's own board only via lint visibility, not via a coverage rule - drift shows on every lint but does not flip a check SUSPECT by itself; acceptable for the proof iteration, a lead for the pruning iteration.
- The model re-allocations moved many command shells to the rim - correct per the checker's print-counting, but it thins the services layer; the owner's red pen at the gate rules whether the layer earns its keep or merges away later.
- raid-false-done (the semantic hash missing a real change) is mitigated by the full-graph hash + the cosmetic/semantic test pair; no incident in the walk.

## Milestone review  -> i16-m6-gate

**Verify.** Fourteen steps under the build task, each blessed after its green:

- the red battery (b1)
- the extractor core (b2)
- model nodes in the ledger (b3)
- behavior subsets (b4)
- the lints (b5)
- conformance + smells (b6)
- the kind registry + method steps (b7)
- book rendering (b8)
- the owner dogfood - three models + the rulings as ADRs (b9)
- the seam rewire (b10)
- the core split (b11)
- the conformance sweep to ZERO real findings (b12)
- the onion re-point (b13)
- region-blocks with theme clusters (b14)

Derived checks compute live:

- tests-red (fourteen red records)
- designs-realized (fifteen requirements, two deferred by decision)
- tests-pass (the full battery, all iterations)

**Validate.** The commission holds end to end:

- Models declared before code and checked against it (the sky-fall lint caught the checker's own region within minutes of its birth - proof by use).
- The book renders models from their extracted graphs.
- The onion shows the owner's physics with regions as blocks and themes as clusters.
- The code was restructured to conform (65 findings burned to zero, zero exemptions beyond the one the owner ruled - adr-logging-ambient).

The theme ruling ("introduce the models and render them, all changes in this iteration") is satisfied. The real-book fig-model manifest lines are DESCOPED by owner ruling to the pruning iteration (note captured).

**Red-team.** Sharpest attack: the sweep re-allocated its way to zero - did it launder violations as re-allocations? Defense:

- every re-allocation carries a transform-essence or console-essence argument recorded in the model's rationale
- the false-edge kill was verified against the AST attribution (a shared method name, renamed)
- zero EXEMPTIONS were needed - nothing was waved through

Second attack: the checker itself has the two recorded blind spots - true. They are noted and guarded at next touch. They hide findings. They do not fake greens. Kill-criterion from M4 (authoring comfort in anger) remains armed for M7 validation.

**Verdict: PASS** - hand-off to the adjudicator for the M6 gate.
