# M4 - Architecture decision (i0027_book_feedback, systematic)

TL;DR: All three axes settled for reuse-with-proof: extend the bus-bar onion machinery, reuse figure resolution for live slide halves, and field-based Pugh data. Each reuse choice carries an M5 spike as its kill-criterion; the falsify pass found no killer.

## Chosen architecture stated  -> i27-m4-chosen-architecture-stated

One decision card per axis:

- **Onion renderer** - Decision: extend the existing bus-bar machinery in place ([adr-onion-extend](../../decisions/adr-onion-extend.md)). Because: crit-build-cost and crit-one-renderer split the near-tie on fidelity. Rejected: cand-onion-fresh - pays a transitional second renderer and 2.5x the build cost for a 0.15 fidelity edge.
- **Slide live half** - Decision: reuse fig-line figure resolution ([adr-slide-figref](../../decisions/adr-slide-figref.md)). Because: crit-self-contained and crit-one-renderer - no embed budget spent, no duplicate figure path. Rejected: cand-embed-template as the DEFAULT - it stays the lane for executable demos; the lanes compose.
- **Pugh data format** - Decision: frontmatter fields, weight on criterion and datum on decision ([adr-pugh-fields](../../decisions/adr-pugh-fields.md)). Because: crit-build-cost - `weight` already sits in the strict allowlist and the ratings parser exists. Rejected: cand-pugh-block - a second map convention beside ratings, harder to lint per field.

**Pugh run.** Weighted totals over the five criteria (weights 0.30 spec-fidelity, 0.20 one-renderer, 0.20 build-cost, 0.15 responsiveness, 0.15 self-contained). Datum per axis = the incumbent machinery, the strongest viable rival to any change:

| Axis | Datum/rival | Score | Chosen | Score |
|---|---|---|---|---|
| onion renderer | cand-onion-fresh | 0.76 | cand-onion-extend | 0.85 |
| slide live half | cand-embed-template | 0.74 | cand-embed-figref | 0.86 |
| pugh format | cand-pugh-block | 0.82 | cand-pugh-fields | 0.93 |

The full ratings live on the candidate nodes; this table derives from them and renders as the matrix once req-pugh-render is built.

**Sensitivity check.** Axis 1 is the only close one: raising crit-spec-fidelity to 0.50 and zeroing crit-build-cost still leaves extend at 0.86 vs fresh at 0.87 - a dead heat, not a flip. The other axes hold under any plausible re-weighting.

**Reverse argumentation.** The first plausible world where extend LOSES: the M5 spike shows cluster interiors or history navigation cannot fit the old layout's assumptions without contortion. That world is credible - the old figure predates the cluster spec. RECORDED TRIPWIRE: a failed spike flips axis 1 to cand-onion-fresh, and the fallback is budgeted as the M2 red-team's cost warning already anticipates.

**Falsify pass (scaled inline).** A targeted adversarial search on the extend-vs-rewrite question found the field's warning - extended frameworks eventually stop fitting and force rewrites - which is precisely the tripwire above, and independent guidance capping on-screen elements at a few dozen via drill-down, which validates the cluster design. No killer surfaced. The heavyweight falsifying harness was judged disproportionate for three render-internal axes; the owner may order it anyway.

## Choice traced  -> i27-m4-choice-traced-to

Every card's Because names its criterion. Both losers carry their killing reason. The scores derive from the criterion weights (in the criterion rationales, ported to fields when adr-pugh-fields is built) and the ratings maps on the candidates.

## Views chosen  -> i27-m4-views-chosen-model

Per the owner's model-kind walk (recorded in [req-models-useful](req-models-useful.md)):

- **The quack structural model** ([model-quack-structure](../../models/model-quack-structure.md)) - NEW, the middle altitude between context and onion. Authored this milestone, kind element-tree until the kind renames to structural at the build.
- **The onion** (model-engine-layers, becoming kind onion at the build) - kept as the determinizer's view; this milestone allocates the build's new elements into it ahead of code, per the standing M4 hard rule.
- Rejected kinds: sequence and state drop with their instances at the build (owner ruling); context stays derived.
- Overlap flagged for the owner: model-product-tree answers a part-of question the structural model may absorb. The owner rules keep-or-absorb at this gate.

## Structuring method considered  -> i27-m4-structuring-method-considered

Considered and SKIPPED with reason: the structural model's cut (launcher / engine / method / brand / state) follows the repo's existing physical boundaries - the grouping is obvious, and a DSM over five elements answers nothing the boundaries do not. DSM clustering remains the named method for the ONION's cluster derivation at build time (req-onion-clusters rule 8), where the element count earns it.

## ADRs recorded and traced  -> derived check

adr-onion-extend -> req-onion-io-rendering; adr-slide-figref -> req-ifu-split-slide; adr-pugh-fields -> req-pugh-render. Each carries chosen and rejected edges to its candidates.

## Architecture model ready  -> i27-m4-architecture-model-ready

The two diagrams of the decided architecture, for the owner's review:

**The quack structural model** - the new middle altitude. Its elements are the blocks the reading path opens; the determinizer element is the onion's door.

fig: model model-quack-structure

**The onion** (model-engine-layers, becoming kind onion at the build) - with i27's ten new elements allocated ahead of code: function nodes (graph), the refusal lint (kernel), five renders (band), the boot command and pager result (rim), the palette source (ambient). Everything else lands as behavior changes to existing elements.

fig: model model-engine-layers

## The boilerplate question (the M4 review rule)

Candidates for the owner's boilerplate stamp, from the onion's own physics - the ambient band is defined as meaning-free utilities:

- go-data-home, go-workspace-base (path resolution)
- go-call-log, go-call-log-cap (telemetry plumbing)
- go-overlay-resolver (resource resolution)
- go-brand (name lookup)
- go-readout-width (console probes)
- go-palette-source (color lookup, new)

Proposal: stamp the ambient band wholesale; the hide-boilerplate control then folds it. No element outside ambient is proposed - stable rim verbs like go-cli-help are plumbing but carry user-visible behavior worth seeing.

## Milestone review  -> i27-m4-gate

**Verify.** Three decisions carry ADRs with chosen, rejected, and addresses edges; ratings live on the candidate nodes; the derived adr-traced check computes. The two views exist as model nodes; the onion's new elements are allocated ahead of the build with band assignments by essence.

**Validate.** The decisions serve the frame: every axis traces to the iteration's requirements, the reuse choices respect the cost warnings the M2 review named, and the model chain realizes the owner's three-altitude ruling.

**Red-team.** The standing counter from M3 - reuse-bias dressed as prudence - now has its tripwire recorded as the reverse argument: a failed M5 spike flips axis 1, and the sensitivity check shows axis 1 is a dead heat under fidelity-heavy weights, so the spike genuinely decides. Second counter: the structural model is shallow (seven elements, no interfaces drawn). Answered honestly: the interface descriptions are M6 content work (req-interface-notes); the model's job at M4 is the enterable structure, and the owner may reject it as too thin at this gate. Third: model-product-tree overlaps the new model - escalated to the owner rather than silently resolved.

**The conformance debt, surfaced.** Retyping the onion's source from guide to model re-armed the conformance lint, which found twelve regions built across i22-i26 with no allocation - the model was conformance-blind the whole time. All twelve are now allocated by essence. Two physics findings remain and ride this gate as owner questions: go-coverage-ids does external I/O from the kernel (tests-pass shells out; the model's rationale has always documented this as the expected finding) and calls go-verify-feedback outward. Accept-as-documented, or order a refactor at a build.

**Verdict: PASS.** The three rulings are DECIDED question nodes, ruled by the owner in chat on 2026-07-18: [q-boilerplate-stamps](q-boilerplate-stamps.md) = A (ambient band stamped wholesale); [q-coverage-ids-physics](q-coverage-ids-physics.md) = B, with the law that external I/O goes through the layers on an I/O busbar - the refactor lands in the M6 plan, spill explicit; [q-product-tree-absorb](q-product-tree-absorb.md) = A, with the kind correction that structural is a GENERIC kind (an assembly is another instance) and product-tree is absorbed. The gate is ready for the closing bless.
