# M4 — Architecture decision (i0012_spec_book, systematic)

TL;DR: the chosen architecture is the two-stage book pipeline with owner-ruled provenance and register lanes. It beat the strongest rival - maximal report-machinery reuse - in a Pugh run that survives the sensitivity flip. Five ADRs record the consequential calls.

## Chosen architecture stated  → i12-m4-architecture-stated

**The composite, one decision card per axis (Decision / Because / Rejected):**

- **Emitter** — Decision (owner-refined): truth only in the spec sources, all judgment there; the emitter is deterministic end to end; assembled chapter markdown MAY materialize as an EPHEMERAL review surface in the data home - never committed, never truth ([adr-book-two-stage](../../decisions/adr-book-two-stage.md)). Because: the substrate thesis applied to the emitter itself; corrections land in sources, the next emit proves them. Rejected: intermediates as source of truth (drift by construction); view-time assembly (excluded by req-book-dom-static).
- **Resolution** — Decision: all transclusion at emit time; JS only filters, presets, and searches over a complete DOM. Because: blessed requirement; extraction and find-in-page need the text present. Rejected: data-blob + view-time build.
- **Glossary** — Decision: one note per term, marked-link usage, generated used-only chapter ([adr-glossary-discipline](../../decisions/adr-glossary-discipline.md)). Because: the LaTeX discipline makes consistency and autogeneration mechanical. Rejected: single glossary file (merge surface, no per-term links); trusted plain-text usage (no lint grip).
- **Deck** — Decision: same HTML, present mode; Marp interop covers exports. Because: one artifact to keep honest (rule of cool, recorded). Rejected: second deck pipeline.
- **Provenance** — Decision: involvement-only marks, surface-versus-core adjustment, margin icons ([adr-provenance-involvement](../../decisions/adr-provenance-involvement.md)). Because: the author owns everything; quality ratchets up. Rejected: faceted stored axes (sprawl; solves a refused problem); bare textual label (proven worst); touch-resets-to-3 (owner: too blunt).
- **Mark storage** — Decision: inline markers in the markdown body (design-marker pattern). Because: travels with the content; edits flip SUSPECT as desired. Rejected: sidecar file (rots silently).
- **Register** — Decision: Vale auto-pulled per OS, subprocess, loud graceful degradation ([adr-vale-autopull](../../decisions/adr-vale-autopull.md)). Because: zero maintenance of ours; industry rules. Rejected: hand-rolled linter (owner: we would maintain it); linked dependency (breaks zero-dep).
- **Figures** — Decision: engine-derived fixed diagram set as inline SVG, spike-gated; AI-drawn inline SVG for everything else ([adr-figures-derived-set](../../decisions/adr-figures-derived-set.md)). Because: arbitrary-graph layout is the recorded infra grave; the release valve keeps figures generous. Rejected: view-time Mermaid (script-created visuals); hand-committed assets (drift).

**Pugh run.** Datum = the strongest viable rival: the REPORT-REUSE architecture (one-pass emitter on report.go, single glossary file, view-time JS figures, hand-rolled register checks) - genuinely fastest to first pixel. Criteria and weights from M3.

| Criterion (weight) | Rival (datum) | Chosen |
|---|---|---|
| Trust & honesty (5) | 0 | **+** (identity stamp and drift lint fall out of determinism; provenance inline) |
| Zero-dep in linking (5) | 0 | **=** (Vale is subprocess-only; rival hand-rolls) |
| LLM digestibility (5) | 0 | **+** (rival's JS figures and view-rendering lose extraction) |
| Deadline cost (4) | 0 | **−** (rival reuses more existing code) |
| Scope guard (4) | 0 | **=** (both capped; rival smaller, chosen spike-gated) |
| Register fit (3) | 0 | **+** (Vale rules vs hand-rolled floor) |
| Reversibility (2) | 0 | **+** (markdown intermediates keep every exit open) |

Weighted score: chosen = +5 +5 +3 +2 − 4 = **+11** against the datum. **Sensitivity check:** raise deadline weight to 5 and drop reversibility - chosen still +10; the win rests on the three 5-weights, not on tuning. A second run with the status-quo datum (no book at all) was not needed - worth-doing was settled at M1 (the killer).

**Reverse argumentation (method addition, owner 2026-07-05): the first plausible world where the winner loses.**

- **Flip by weights alone: NOT credible.** The rival leads on one criterion (deadline). To flip +11, trust and digestibility must fall from 5 toward 1 - in a product whose entire point is a trustworthy, extractable board. Rejected as an absurd world; the choice is weight-robust.
- **Flip by rival variant: CREDIBLE, and it found a soft spot.** Upgrade the datum to a HYBRID: one-pass emitter over the markdown SOURCES (nodes and manifests are markdown either way), emit-time DOM, Vale auto-pull kept. That hybrid neutralizes trust and digestibility, keeps a real deadline edge, and loses only reversibility (+2) - the hybrid wins on paper whenever the intermediate stage costs more than days. The honest finding: the two-stage emitter's edge is NOT the drafting surface (the sources are that surface in both worlds) - it is the reusable chapter intermediates (SSG fallback, flat-file exit), which the design note valued deliberately.
- **Recorded tripwire, then DEFUSED by the owner's M4 refinement:** the intermediates are now ephemeral projections in the data home, never truth - so "collapse to one-pass" is a free implementation call at M6, not an architecture change. The hybrid flip world and the chosen world converged: the reverse argumentation surfaced the soft spot, and the refinement removed it by demoting the intermediate from architecture to convenience.

## Choice traced  → i12-m4-choice-traced

Every card's Because names its criterion or blessed requirement; the Pugh columns ARE the M3 weights; each Rejected entry names its killing reason. The five consequential calls carry ADRs addressing their requirements; the losing options live in the cards and the ADR statements - the graveyard feeds the book's non-goals chapter later, per the design note.

## ADRs recorded and traced  → i12-m4-adr-traced

Derived, computes live: five ADRs minted this milestone, each addressing a requirement. All decisions of record for this iteration trace.

## Milestone review  → i12-m4-gate

**Verify:** each axis card carries Decision, Because, and Rejected with reasons; the Pugh datum is the strongest rival, not a strawman - report-reuse would genuinely ship faster; the sensitivity flip is recorded. **Validate:** the composite honors every owner ruling from M2/M3 verbatim - involvement-only marks with the refined touch rule, auto-pull Vale with the loud warning, generous figures through the release valve, emit-time everything. **Red-team:** the deadline criterion lost to the trust criteria - is that right under a real presentation date? Answered: the rival's speed buys a book that extractors cannot read and that renders figures only with script - it fails two blessed requirements outright; speed that fails requirements is not speed. Kill-criterion carried forward: if the M5 spike shows the derived-SVG set or the disclosure mechanism infeasible, the affected axis falls back (ASCII figures, always-expanded details) WITHOUT reopening this composite. **Verdict: PASS - pending the adjudicator's bless.**
