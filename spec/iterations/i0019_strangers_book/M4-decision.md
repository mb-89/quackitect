# M4 - Decide the architecture (i0019_strangers_book)

## Chosen architecture stated  -> i19-m4-chosen
Pugh runs per fork, datum = the strongest rival (M3), criteria and weights from i19-m3-criteria:

**Fork A (datum: A2 router)** - A1 fragment-reflection: single-file (=), shareable links (=), one-owner-per-mechanism (+, the router CONTENDS with the existing hash rail), machine-digestible/minimal JS (+), DRY (=), hash-honesty (=). **A1 wins on 2 criteria, loses none.**
**Fork B (datum: B2 curated list)** - B1 glossary-as-list: DRY (+, no shadow list), single-source growth (+), independence from glossary thinness (-, carried RAID). **B1 wins 2:1**; the loss is mitigated by the glossary growth the stranger needs anyway.
**Fork C (datum: C1 renderer-only substitution)** - C3 hybrid: hash-honesty (+, no render-time prose rewriting), mechanical testability of identity surfaces (=), bounded prose sweep (-, effort). **C3 wins 1:-1 net positive with the effort priced at M6.**

**Sensitivity check, REVERSED (find the world where the winner loses):** A1 loses if a future book becomes a multi-VIEW SPA where many components own navigation state - then a router is the right owner. Credibility: LOW for a document that is deliberately one self-contained HTML; recorded as a tripwire, not a blocker: IF a second hash-state owner ever appears beyond the existing rail, revisit adr-deck-anchor-fragment. B1 loses if the glossary permanently stays thin - then the lint is inert; credibility MEDIUM, carried as the M1 RAID with the mitigation in-scope (glossary growth is part of the stranger fixes). C3 loses if the prose sweep explodes (hundreds of self-referential sites); credibility LOW - the M2 probe found the vehicle book small and the M6 white-label test enumerates leaks first.

Decisions recorded: adr-deck-anchor-fragment, adr-terms-source-glossary, adr-white-label-hybrid (all kind: architecture, informed-by wired to their elements).

## Choice traced  -> i19-m4-traced-choice
Every choice traces to the weighted criteria, which trace to requirements and standing laws: single-file (the book's law), shareable links (uc-deck-deep-link), one-owner (the M2 probe's existing rail), DRY (owner law), hash-honesty (the ledger's trust chain). No criterion is taste.

## Views chosen  -> i19-m4-views
The engine onion (model-engine-layers) is the ONE view, updated - no new model kind is needed for three render-band elements (the registry offers no better-fitting kind for this delta; a state or tree view would answer no question this iteration asks). **Structuring method: considered and SKIPPED** - three elements with obvious family homes (deck render, lints, book shell) is below any clustering threshold; the meth-dsm menu stays unused this round, per the checklist's menu-not-mandate.

## Model authored  -> i19-m4-model-authored  (KILLER, HARD RULE - owner adjudicates)
The three elements are ALLOCATED ahead of any code, each beside its family, each with its placement rationale:
- **go-deck-anchors** (rim--graph, beside go-deck-mode): a coordinate transform on the rendered document's navigation state - it reads/writes the URL hash against deck ids; it belongs with the deck render it addresses, not in the JS-shell rim.
- **go-terms-order-lint** (rim--graph, beside go-spec-lints): a raw-text lint over the rendered book's reading order - exactly the band's "raw-text lints" family (the model's own banding note).
- **go-white-label-identity** (rim--graph, beside go-shell-title-card): the identity surfaces ARE the title-card family's concern; it resolves brand-layer strings into the shell.
Each architecture ADR is linked informed-by to the element it shapes (addresses edges to go-deck-anchors, go-terms-order-lint, go-white-label-identity). The review render with the three marks: `onion-review.html` (graph band 93 -> 96, the change dot rides the graph ring only - verified by screenshot).
**Non-engine work carries no onion element by design:** the 2.2 chapter and the deck are MANIFEST content; the guides row and README link are template content; RUNME's design home is the method layer (its scripts live in tools/, outside the design scanner - the design region binds in the method doc that specifies them, the selftest binds the actual script bytes; the apply-default-lane precedent).

## ADRs traced  -> i19-m4-adr-traced  (derived: coverage:adr-traced)
The three new ADRs address their requirements (and their elements). Computed live.

## Open question at this gate: q-trace-graph-scaling
Carried from i18 per the iteration motivation: the trace-graph clarity-at-scale design discussion (expedition with rendered mockups before any rebuild - the fan-fold attempt is retired). It does NOT block this iteration's scope (no i19 requirement touches the trace graph). The owner rules at this gate: DECIDE now (schedule the expedition), or DEFER explicitly to a later iteration with the question staying open.

## Milestone review  -> i19-m4-gate  (KILLER - owner adjudicates)
**Verify:** every fork carries a Pugh run against the STRONGEST rival, the sensitivity check is reversed with each flip-world's credibility judged out loud, the ADRs are minted kind: architecture and informed-by wired, the elements are allocated with placement rationale ahead of code, and the review render is verified. **Validate:** the choices implement the owner's design rulings (fragment anchors on the existing rail, glossary as the term source, identity-not-occurrences white-labeling). **Red-team:** the sharpest attack - "three small elements, was M4 ceremony?" No: fork A had a genuinely viable rival whose rejection needed the M2 probe's rail discovery, and fork C's rejected candidate (render-time substitution) would have QUIETLY broken hash-honesty - exactly what an architecture gate exists to catch. **Verdict: PASS from the agent side - hand-off for the owner's M4 bless, with the q-trace-graph-scaling ruling.**
