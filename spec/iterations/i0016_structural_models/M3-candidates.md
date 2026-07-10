# M3 - Candidate architectures (i0016_structural_models, systematic)

TL;DR: Three morphological axes (canvas format x text language x split policy) yield six named candidates - four viable, two knocked out by demands and scored for the record. Seven criteria weighted from the requirements. Provisional leader: the Excalidraw+Mermaid per-kind hybrid at 0.795, with the JSON-Canvas hybrid as the strongest rival (0.78) and M4 Pugh datum. The riskiest new scope - the Excalidraw extractor - goes to the M5 spike against the owner's real i14 draft, which is also the recorded decider between the two hybrids.

## Alternatives elaborated  -> i16-m3-alternatives
Morphological axes (SyA: function x option matrix):

### Axis 1 - canvas format (spatial kinds)
Context: which surface carries decomposition and layers+flow, where arrangement means something.
- **Excalidraw.** Pro: the owner's preferred sketch surface; bindings and frames give the graph; probed live in i14. Con: volatile fields (seeds, nonces) noise the diff; extractor must interpret bindings.
- **JSON Canvas.** Pro: trivial open spec (nodes+edges), clean diffs, Obsidian-native editor. Con: stiffer sketching; rings built from groups; less expressive.
- **None (all-text).** Pro: no canvas extractor at all. Con: spatial meaning falls to derived views only.

### Axis 2 - text language (topological kinds)
Context: which language carries state machines and sequences, where topology is the meaning.
- **Mermaid.** Pro: renders native in Obsidian and GitHub; vendorable into the book (cytoscape precedent); best agent fluency; line-grammar subsets hand-parseable. Con: expressiveness ceiling on exotic diagrams.
- **PlantUML.** Pro: richer sequence and component forms. Con: render needs a JVM or an external server - fails the book demand as PRIMARY; stays a recorded per-kind option (owner ruling 2026-07-09) where expressiveness demands and external render is accepted.
- **D2.** Pro: modern, pleasant grammar. Con: render needs the d2 binary - same demand failure; recorded, not carried.
- **SysML v2 textual.** Pro: the standard; text-primary validates our direction. Con: KerML-grade grammar; no sketch editor; external render. Knocked out (see cand-sysml-v2).
- **Bespoke DSL.** Knocked out by the ownership law (see cand-bespoke-dsl).

### Axis 3 - split policy
Context: one format for everything, or per-kind best fit.
- **All-canvas / all-text.** Pro: one extractor, one skill. Con: each is weak on half the kinds.
- **Per-kind hybrid.** Pro: each kind in its best format (owner pre-approved per-kind choice). Con: two extractors, two contracts.
- **Preferred: per-kind hybrid.** The kinds genuinely differ: state machines are typed faster than drawn; rings are drawn, not typed.

### The six named candidates (scores after the M3 review revision)
- [cand-text-all](cand-text-all.md) - small text languages everything, spatial reading from derived renders. **0.835 - LEADER.**
- [cand-hybrid-exca-mermaid](cand-hybrid-exca-mermaid.md) - Excalidraw spatial + Mermaid topological. 0.783 - strongest rival, the M4 datum.
- [cand-hybrid-canvas-mermaid](cand-hybrid-canvas-mermaid.md) - JSON Canvas spatial + Mermaid topological. 0.77.
- [cand-canvas-all](cand-canvas-all.md) - Excalidraw everything. 0.645.
- [cand-sysml-v2](cand-sysml-v2.md) - 0.38, KNOCKOUT (good-editor and render demands).
- [cand-bespoke-dsl](cand-bespoke-dsl.md) - 0.54, KNOCKOUT (ownership law).

### Review revision (owner challenge, 2026-07-09, pre-bless)
The owner challenged the decomposition-to-canvas assignment: "trees are also very easy in text." The challenge holds and generalizes:
- Trees are pure hierarchy - text is their native form; tree layout is computed trivially.
- Layers+flow derives from a list - PROVEN in i14 (the approved cytoscape onion renders from design-layers.md; what was wrong was the declared content, not the medium).
- The spatial criterion conflated READING spatially (satisfied by derived renders from text truth) with AUTHORING spatially (arrangement as meaning no algorithm computes - physical placement). No current kind authors arrangement.
Consequence: crit-spatial-meaning re-anchored, text-all re-rated on the owner's testimony, the leader flipped from the Excalidraw hybrid (0.795 -> 0.783) to text-first (0.755 -> 0.835). The hybrid's substance survives as the ADMISSION CLAUSE: views-chosen may admit a canvas format for an arrangement-authored kind (mechatronics wave); req-model-tray and req-model-groom stay dormant Where-conditionals until then. The M5 spike RETARGETS: derive the onion and tree renders from text models and prove semantic-hash stability; the Excalidraw extractor moves behind the admission clause.

### Format resolution rounds (owner-driven, 2026-07-09, pre-bless)
Three design rounds settled the layers+flow truth syntax inside the leading candidate:
1. **Membership ownership.** Element-owned code tags (option B) were proposed and KILLED by the plan-ahead requirement: with membership in code, nothing exists to review before code. Resolution: the MODEL allocates elements to layers ahead of code; the existing design-marker id is the join key (no new marker syntax); allocated-but-unrealized = honest planned hole (the req-has-design analogy); realized-but-unallocated = the sky-fall lint ("no device falls from the sky", Janschek).
2. **Element-major syntax (the owner's TikZ discipline).** Declare every element first, one line each - id, layer attribute, one-line responsibility - then the layer ORDER section (order only), then flows between declared names. No long layer-major lines. Coordinates explicitly refused: layout stays derived. One element = one line = one diff hunk.
3. **Flows.** Plain arrow lines with payload labels between declared names - the complete inter-layer interface list; an undeclared name in a flow is a dangling reference (req-model-consistency); an inter-layer code dependency with no covering flow is a divergence.

## Criteria weighted  -> i16-m3-criteria
Weights sum to 1.00; each derives from a requirement or a dated owner ruling:
- [crit-editor-truth](crit-editor-truth.md) (req-draft-is-truth): **0.20**
- [crit-agent-fluency](crit-agent-fluency.md) (owner ruling: never the language's owner): **0.15**
- [crit-extractor-cost](crit-extractor-cost.md) (req-model-nodes, zero-dep law): **0.15**
- [crit-delta-ergonomics](crit-delta-ergonomics.md) (owner scenario: new function enters the drawing): **0.15**
- [crit-render-book](crit-render-book.md) (req-models-in-book): **0.15**
- [crit-diff-versioning](crit-diff-versioning.md) (req-semantic-hash): **0.10**
- [crit-spatial-meaning](crit-spatial-meaning.md) (the onion lesson): **0.10**
Selection precedes evaluation (Pahl/Beitz): the DEMANDS - good editor, zero-dep render path, no language ownership - knock out before scoring. E and F fail demands; scored only for the record.

## Feasibility rough-checked  -> i16-m3-feasibility
- cand-hybrid-exca-mermaid: FEASIBLE - Excalidraw graph read PROBED live (i14 draft, 2026-07-09); Mermaid state/sequence subsets are line grammars in the EARS-lint class; groom and tray are pure JSON transforms (QR-encoder precedent for hand-rolled machinery). UNPROVEN residue -> M5 spike: the extractor against the real i14 file, including semantic-hash stability under a cosmetic edit.
- cand-hybrid-canvas-mermaid: FEASIBLE - .canvas parse is trivial; render = simple SVG. UNPROVEN residue -> whether groups express rings acceptably to the owner.
- cand-text-all: FEASIBLE - all machinery exists (mermaid.js vendorable like cytoscape). The spatial gap is a product judgment, not a technical risk.
- cand-canvas-all: FEASIBLE but the behavioral-kind extraction (hand-drawn sequences) is the fragile end - rough-checked and priced into its rating.
- cand-sysml-v2: NOT FEASIBLE in scope (KerML-grade parser).
- cand-bespoke-dsl: feasible and forbidden.

## Milestone review  -> i16-m3-gate

**Verify.** Six candidates minted with full rating maps; seven criteria minted with metric, weight, and scale anchors; weights sum to 1.00; every criterion traces to a requirement or a dated ruling; feasibility carries referents (the i14 probe) or names its spike question.

**Validate.** The candidate space covers the owner's explicit instructions: text-first small languages seriously weighed (not decoration), SysML named and rejected on grounds, bespoke DSL killed by the recorded ownership law, per-kind split honored. Today's design discussions (tray, groom, delta scenario, one-owning-view) all surface as criteria or candidate features.

**Red-team.** The original matrix disclosed its sharpest weakness itself: the co-moving canvas criteria carried 0.30 on an assumed sketching preference. The adjudicator answered the disclosed question pre-bless ("trees are also very easy in text") and the leader flipped - the review round above records the revision. Remaining attack surface: text-all's editor score (0.6) still assumes the owner accepts typing layer lists and Mermaid; the M5 spike's derived-render targets give the evidence either way. Kill-criterion (revised): if the derived renders from text models cannot reproduce the reading value of the i14 onion, the canvas hybrids reopen (both preserved with full ratings).

**Verdict: PASS** - candidates ready for the M4 Pugh run (datum: cand-hybrid-exca-mermaid, the strongest rival after revision). Adjudication: the owner drove the M3 review live (matrix challenge, leader flip, format rounds) and closed it with the explicit instruction "make sure this is represented in the m3 matrix, then go to m4" - the killer and gate are blessed actor=agent under the contract rule-3 exception (explicit gate-naming instruction), with this line as the record.
