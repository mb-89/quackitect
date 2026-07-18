# M3 - Candidate architectures (i0027_book_feedback, systematic)

TL;DR: Three open axes with two candidates each; two axes already settled by owner rulings. The riskiest new scope is the onion render, and its unknowns go to the M5 spike.

## Alternatives elaborated  -> i27-m3-2-alternatives-elaborated

### Settled axes (owner rulings at M2 elicitation, never re-opened)
- **Timeline keeper**: the handover pager's drill-down renderer survives and is extracted as the one shared component ([req-project-timeline](req-project-timeline.md)). The rejected shape, aligning three renders by shared CSS only, keeps the drift the ruling exists to kill.
- **Function representation**: functions become a first-class node type ([req-function-nodes](req-function-nodes.md)). The cheap alternative, deriving pseudo-nodes from the strings at load, was implicitly rejected by the owner's "their own notes" ruling.

### Axis 1 - the onion renderer
Context: how the bus-bar layered render with clusters, enter navigation, and the boilerplate fold gets built.
- **A - [cand-onion-extend](cand-onion-extend.md).** Pro: the deterministic bus-bar SVG layout already exists (go-onion-busbar, go-onion-figure) and is battle-tested. Con: the new spec's cluster interiors and history navigation may fight the old figure's assumptions.
- **B - [cand-onion-fresh](cand-onion-fresh.md).** Pro: clean against the new layout spec. Con: duplicates a working renderer during the transition and pays parity testing.
- **Preferred: A.** Spec fidelity is reachable either way; build cost splits them, and A reuses the heaviest machinery. The M5 spike probes whether cluster interiors fit the old layout's assumptions; a failed probe flips to B.

### Axis 2 - the split slide's live right half
Context: how an IFU slide embeds a live, interactive book rendering.
- **A - [cand-embed-template](cand-embed-template.md).** Pro: the budgeted embed-fence lane exists with its inertness and size discipline. Con: written for executable demos, not book-figure reuse; budget pressure.
- **B - [cand-embed-figref](cand-embed-figref.md).** Pro: fig-line resolution already reuses book figures without duplication; no budget cost. Con: figures were not designed to live interactively inside a slide's half-width.
- **Preferred: B, with A kept for executable demos.** The two lanes compose rather than compete; the spike confirms half-width interactivity.

### Axis 3 - the Pugh data format
Context: where weights and the datum live so the matrix derives ([req-pugh-render](req-pugh-render.md)).
- **A - [cand-pugh-fields](cand-pugh-fields.md).** Pro: weight is already a legal frontmatter key; smallest diff; field-per-fact matches the register. Con: datum-on-decision adds a key to the decision type.
- **B - [cand-pugh-block](cand-pugh-block.md).** Pro: one block holds the whole matrix config. Con: invents a second map convention beside ratings; harder to lint per-field.
- **Preferred: A.** It reuses the existing parse lanes and the strict allowlist as-is.

## Criteria weighted  -> i27-m3-criteria-weighted-derived

Five criteria, authored as nodes in the proven i0016 format (metric, target; weight in the rationale, ported to a field when the M4 Pugh-render design rules the format):

- [crit-spec-fidelity](crit-spec-fidelity.md) (from req-onion-io-rendering, req-ifu-user-stories, req-risk-matrix): **0.30**
- [crit-one-renderer](crit-one-renderer.md) (from req-project-timeline, req-type-colors, req-filter-pill-rule): **0.20**
- [crit-build-cost](crit-build-cost.md) (from the M2 red-team's three warnings): **0.20**
- [crit-responsiveness-law](crit-responsiveness-law.md) (from req-responsive-status lineage, the responsiveness guide): **0.15**
- [crit-self-contained](crit-self-contained.md) (from req-book-trust lineage, the embed budget): **0.15**

Weights sum to one. The owner vetoes or re-weights at the M3 gate.

## Feasibility rough-checked  -> i27-m3-feasibility-rough-checked
- cand-onion-extend: FEASIBLE with referent - go-onion-busbar and go-onion-figure render today's onion; go-onion-change-marks proves element-to-ring propagation works in that machinery. UNPROVEN residue -> M5 spike: cluster interiors and browser-history navigation inside the old layout.
- cand-onion-fresh: FEASIBLE - a graph-to-SVG render in the established rim--graph family; cost is the concern, not possibility.
- cand-embed-template: FEASIBLE with referent - the embed lane shipped in i19 with budget discipline and inert templates.
- cand-embed-figref: FEASIBLE with referent - fig-line resolution inside slides shipped with the deck rail. UNPROVEN residue -> M5 spike: interactivity at half-width.
- cand-pugh-fields: FEASIBLE with referent - `weight` sits in the strict allowlist today; ratings maps parse (go-ratings-map).
- cand-pugh-block: FEASIBLE - the map parser generalizes; no probe needed.

## Milestone review  -> i27-m3-gate

**Verify.** Five weighted criteria exist as nodes with metrics and targets, each derived from named requirements. Three open axes carry two elaborated candidates each with pros, cons, and a preference argued in the criteria's terms; two settled axes name their settling rulings. Every candidate has a feasibility verdict with a referent or a named spike question.

**Validate.** The axes cover the iteration's real forks: the onion render, the live slide half, and the Pugh data format. Nothing requirement-shaped hides in the axes; the settled axes honor the owner's M2 rulings instead of re-opening them.

**Red-team.** The opposing case: the preferences all lean reuse-over-fresh, which could be build-cost bias dressed as prudence — exactly what crit-build-cost's 0.20 weight would over-reward if the spike evidence is soft. Answer: both preferred candidates carry named spike questions at M5, and a failed probe flips the axis (the kill-criterion is explicit on axis 1). Second counter: three axes may be too few for a 40-requirement iteration - answered: the register, timeline, filters, and colors are render work inside settled architecture, not new axes; forcing axes onto them would be ceremony.

**Verdict: PASS proposed.** The owner rules at the gate; the M4 scoring runs on these criteria and candidates.
