# M4 - Architecture decision (i0016_structural_models, systematic)

TL;DR: Text-first structural models win - element-major model files (the owner's TikZ discipline) plus Mermaid for the behavioral kinds. Spatial reading is derived. Canvas is preserved as a per-kind admission clause. The Pugh run against the strongest rival (the Excalidraw hybrid) holds under both convergence runs. The reverse argumentation found ONE credible flip (authoring comfort in anger) and armed it as a tripwire with the hybrid as fallback.

## Chosen architecture stated  -> i16-m4-chosen
One decision card per axis:
- **Split policy** - Decision: text-first for ALL current kinds ([adr-text-first-models](../../decisions/adr-text-first-models.md)). Because: crit-delta-ergonomics, crit-agent-fluency, crit-render-book, and the re-anchored crit-spatial-meaning (derived renders satisfy spatial READING; no current kind AUTHORS arrangement). Rejected: the per-kind canvas hybrids - they buy authored-arrangement power no current kind needs at the price of a second extractor (YAGNI with a recorded resurrection path: the admission clause).
- **Text language (behavioral kinds)** - Decision: Mermaid subsets for state machines and sequences. Because: crit-render-book (vendorable, the cytoscape precedent) and crit-agent-fluency (1.0). Rejected: PlantUML and D2 as PRIMARY (render dependency - JVM / external binary; both stay recorded per-kind options where expressiveness demands); SysML v2 (knockout: good-editor and render demands); bespoke DSL (knockout: the ownership law).
- **Structural-kind format** - Decision: element-major discipline carried in a lint-pinned Mermaid subset ([adr-element-major-format](../../decisions/adr-element-major-format.md)) - flowchart TD with subgraph=layer (declaration order = rank, innermost first), node declarations before edges (TikZ discipline), node label = responsibility, edge labels mandatory; coordinates refused, layout derives. Because: crit-editor-truth (the owner's own TikZ habit AND the truth file previews natively as a diagram), crit-diff-versioning (one element = one line = one hunk), the ownership law (a bespoke markdown grammar - however small - would be an owned format; the pinned subset is constrained mainstream, one grammar family across all four authored kinds), and the plan-ahead demand (elements allocated BEFORE code; the design-marker id is the join; sky-fall and absence lints close the loop). Rejected: layer-major long lines (owner), element-owned code tags (killed by plan-ahead), owned markdown lists (killed by the ownership law at the owner's Mermaid round, 2026-07-09).
- **Edit-path discipline** - Decision: unique-or-mediated ([adr-edit-paths-unique](../../decisions/adr-edit-paths-unique.md)) - the extracted graph is derived and read-only; one owning view per element; siblings reference by name. Because: the view-update problem (lens ambiguity) makes unmediated multi-view editing drift by construction, and the zero-dep/no-daemon constraints leave no seat for a mediator.
- **Method step** - Decision: views-chosen after the architecture decision ([adr-views-chosen](../../decisions/adr-views-chosen.md)) - kinds named with their questions, rejected kinds recorded, two models default. Because: req-views-chosen and the SyA Stakeholder/View discipline (minimal appropriate set).

**Pugh run 1.** Datum = the STRONGEST viable rival: cand-hybrid-exca-mermaid (0.783).
| Criterion (weight) | Hybrid (datum) | Text-first |
|---|---|---|
| editor-truth (0.20) | S | - (0.7 vs 0.8: canvas sketching still edges out typing) |
| agent-fluency (0.15) | S | + (1.0 vs 0.9) |
| extractor-cost (0.15) | S | + (one format family vs two) |
| delta-ergonomics (0.15) | S | + (text edit vs tray+placement) |
| render-book (0.15) | S | + (vendored mermaid + trivial SVG vs hand-rolled sketch renderer) |
| diff-versioning (0.10) | S | + (clean text vs volatile JSON) |
| spatial-meaning (0.10) | S | - (derived renders vs authored arrangement) |
Net: +5 / -2 for text-first - the two minuses are exactly the canvas's raison d'etre, and no current kind exercises either.

**Pugh run 2 (controlled convergence).** Datum = the winner (text-first): every rival scores net-negative against it; no criterion pattern suggests a composite better than winner + admission clause. Converged.

**Status-quo run (worth-doing-at-all).** Datum = today (ad-hoc design-layers.md, structure recovered from code). The i14 record is the evidence:

- six render passes
- a structure fight
- a no-flow layer nobody caught
- the owner's ruling that recovery-from-code is the wrong direction

Worth doing is established by observed failure, not projection.

**Sensitivity check:** weights perturbed one at a time (+/-0.05 with renormalization): the winner holds in every single-weight world. The closest gap is editor-truth-heavy worlds (gap narrows to ~0.03).
**Reverse argumentation:** the FIRST plausible flip - crit-editor-truth for text-first drops 0.7 -> 0.4 (authoring element-major files and Mermaid in anger proves uncomfortable for the owner) -> 0.775 vs the hybrid's 0.783: the hybrid WINS. Credible? YES - the owner has never authored these files in production use. The rating rests on testimony about trees, not on lived layer-model editing. TRIPWIRE ARMED: the M7 dogfood (authoring the engine's own models) is the live test. If the owner rules the authoring experience bad, the canvas slot reopens with cand-hybrid-exca-mermaid as the recorded fallback and the dormant tray/groom requirements activate. Second probe (an arrangement-authored kind arrives early): handled WITHOUT reopening - the admission clause is built for exactly that. Third probe (render weight rises): text-first only gains. No other plausible flip found within reason.

## Choice traced  -> i16-m4-traced
Every decision card names its criteria above; every loser carries its killing reason; the weighted totals (0.835 / 0.783 / 0.77 / 0.645 / knockouts 0.54, 0.38) trace to the minted crit-/cand- nodes with their scale anchors. The two owner-driven review rounds (matrix challenge, format rounds) are recorded in M3-candidates.md.

## ADRs recorded and traced  -> i16-m4-adr-traced
- [adr-views-chosen](../../decisions/adr-views-chosen.md) addresses req-views-chosen.
- [adr-text-first-models](../../decisions/adr-text-first-models.md) addresses req-draft-is-truth.
- [adr-element-major-format](../../decisions/adr-element-major-format.md) addresses req-model-nodes.
- [adr-edit-paths-unique](../../decisions/adr-edit-paths-unique.md) addresses req-semantic-hash.
The derived check computes live.

## Milestone review  -> i16-m4-gate

**Verify.** The evidence:

- four ADRs minted and traced
- the Pugh table scores against the honestly-strongest datum
- both convergence runs recorded
- the status-quo run grounds worth-doing in the i14 record
- every criterion carries its metric, weight, and anchors in its node

**Validate.** The decision satisfies the commission end to end:

- models after architecture and before implementation (views-chosen + plan-ahead allocation + sky-fall lint)
- draft==truth with no transcription
- implementation follows the models (an unallocated region is a lint finding - the agent cannot silently invent structure)
- book rendering in scope
- report tabs still deferred as the owner ruled

The owner's live rulings this session are each embodied in a decision card or a method rule:

- no bespoke DSL
- trees-in-text
- TikZ element-major
- both-lanes hand-offs

**Red-team (scrutiny at the owner's explicit request).** The strongest case for the beaten hybrid: authored arrangement is the mechatronics moat's native mode, and the owner sketches to think - killing canvas now could make the models feel like bookkeeping. Answer: canvas is not killed. It is DORMANT with requirements already baked (tray, groom) and a named fallback candidate. The tripwire hands the decision back to lived experience at M7 rather than taste today. Strongest case against text-first on its own terms: mermaid.js vendoring grows the single-file book (~1MB class) - accepted under the cytoscape precedent, WATCH at M6 (a lite hand-rolled renderer for state/sequence stays possible). And Mermaid's grammar evolves outside our control - a risk that GREW at the owner's Mermaid round (all four authored kinds now ride one grammar family). That risk is fenced twice: the lint refuses beyond-subset syntax (the drawing-contract move), and the extractor is ours - the files parse and the derived renders run even if upstream Mermaid changes or dies. Kill-criterion for the whole decision: the retargeted M5 spike - if derived renders from text models cannot reproduce the i14 onion's reading value, the decision reopens at the canvas slot.

**Verdict: PASS** - hand-off to the adjudicator for the M4 gate.
