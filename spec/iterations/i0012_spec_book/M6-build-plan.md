# M6 — Build plan (i0012_spec_book, systematic)

TL;DR: twenty resumable steps under the build task, in the owner's agreed order (infra, then method data, then emitter, then surfaces, then deck and content). Order rides the ID stage digit; dependency edges carry only real prerequisites. The pre-agreed defer lane stays open if the walk proves too big for the deadline.

## Build planned  → i12-m6-build-planned

**Ordering discipline:** the agreed order (infra friction → templates → glossary and guidance → book emitter → deck) is encoded in the id stage digit (`bs1`…`bs5`), which the walk's deterministic ID tie-break honors — no fake dependency edges (ORDER IS NOT DEPENDENCY, i10 ruling). Every `depends_on` names a real prerequisite: a consumer on its producer.

**The steps (children of i12-m6-build):**

- Stage 1 — infra, on the side:
  - `bs1-authoring-cheap` — the one-command honest board.
- Stage 2 — method-layer data:
  - `bs2-types` — class notes. Three type files. Union derivation.
  - `bs2-templates` — the templates home. Eight milestone shapes.
  - `bs2-mint-skeleton` — mint stamps skeletons (consumes the templates).
  - `bs2-glossary-terms` — per-term notes with classification.
  - `bs2-guidance-split` — audience prose apart from internals.
  - `bs2-method-map` — the methodology map.
  - `bs2-drafting` — the drafting prompt. The marker syntax.
- Stage 3 — emitter:
  - `bs3-manifests` — the node type. The orphan lint.
  - `bs3-emitter-core` — deterministic transclusion into one file. Ledes. Anchors. Identity stamp.
  - `bs3-honesty-marks` — ledger states. The SVG robot margin column.
  - `bs3-glossary-gen` — the used-only chapter. The meta-quarantine lint.
  - `bs3-figures` — the derived SVG set.
- Stage 4 — reader surfaces:
  - `bs4-views` — presets. Search. Until-found disclosure.
  - `bs4-a11y` — keyboard and AA over the views.
  - `bs4-drift` — regeneration-is-a-noop lint.
  - `bs4-register` — Vale auto-pull, loud on absence.
  - `bs4-agents` — the AGENTS.md emit.
- Stage 5 — deliverables:
  - `bs5-deck` — present mode.
  - `bs5-content` — the quackitect book itself, AI-first drafted with marks.

**Sizing honesty:** twenty steps carrying 27 requirements is the largest build of the project so far, under a real deadline. The relief valve is pre-agreed since planning: if mid-build the schedule breaks, the stage-4/5 tail (or the deck alone) defers to a fresh version as a first-class move — stages 1–3 alone already ship the templates, the type model, and a readable book core. Owner option recorded at the plan bless: a BRAKE (a review stop) between stages may be added mid-walk when wanted.

**Next after the plan bless:** observe every one of the 27 new tests RED (`quack observe-red`, the batch), then walk the steps in stage order.

## Extension (owner-directed, 2026-07-05) — the spec template

The owner ruled the rendered book a tech demo, not proper output, and directed the fix INTO this iteration: a spec template drives the document; the design was settled in a full-day walk (the ch0–ch8 SETTLED note series). Sixteen new requirements under `uc-spec-template` (plus two under `uc-book-read`), sixteen new tests, fourteen new build steps in three stages, flat off `i12-m6-tests-red`, real prerequisites only:

- Stage 6 — engine substrate:
  - `bs6-ratings-map` — one-level frontmatter maps under strict parse.
  - `bs6-spec-roots` — glossary/references/fundamentals/methods load from spec/ (project content); the glossary migrates.
  - `bs6-base-eval` — the pinned-subset Bases evaluator (needs the map parser).
- Stage 7 — machinery over the substrate:
  - `bs7-auto-link` — alias auto-linking at emit (needs the loaders).
  - `bs7-lints` — external-link, slot-residue, dangling-anchor lints.
  - `bs7-items` — decision kinds, candidates, facets, allowlist growth.
  - `bs7-board` — the faceted coverage board (needs evaluator + items).
  - `bs7-fig-tables` — vv-table and stakeholder-matrix to canned queries.
  - `bs7-quarantine` — the boundary moves to everything-except-guidance.
  - `bs7-ch2-derived` — the pull-law lists (needs loaders + auto-link).
- Stage 8 — the template set and its proof:
  - `bs8-templates` — README + nine chapter skeletons + canned queries.
  - `bs8-item-templates` — the thirteen item templates.
  - `bs8-stubs` — instantiation via start stubs (needs the templates).
  - `bs8-pilot` — the retro-migration stress test (needs items, board, item templates).

The dogfood content redraft (the book rewritten through the template, with owner review loops) is deliberately NOT in this build — it is the refine track after the template and engine stand. Rigor arithmetic recorded in the notes: net near-zero per iteration; M8 docs-complete becomes checkable.

### Pilot migration findings (bs8-pilot, recorded as they broke)

Converted: eleven cand- notes from the M3 axes (wired chosen/rejected into the five deciding ADRs), four raid- items from the M1/M6 risk record, eleven stk- notes for the derived classes. What broke, and what it taught:

- New item types leaked into the WALKABLE set — candidates rendered as OPEN checks on the board. The trace-content filters (engine + report) did not know the new types. Fixed: candidate, stakeholder, raid, rationale, record are trace content, never gates; selftest:no-trace-gate holds.
- The user-wording sweep caught the decision item template mentioning the banned word outside the allowed vocabulary — the i10 lint generalized correctly to NEW method content. Fixed by rephrasing; the lint was right.
- The ADR edits flipped the i10/i11 backward-cumulative verification checks SUSPECT — through a genuinely failing test, not a false alarm. The ledger computed the ripple, named the failing test, and recovered to DONE on the fix. The stress test's core question — does the ledger survive a retro-migration honestly — answers YES.
- Schema finding: the stakeholder item's class field collided with the node grammar's own class key. Renamed to role (matches the privacy ruling's vocabulary); template, queries, and fixtures corrected.

## Milestone review  → i12-m6-gate

Written at the gate, after the build and verification.


# M6 extension record (2026-07-06) - the mechanization + connections build

## Build (extension)  -> i12-m6-build

Sixteen steps (bs9-bs24), all realized and selftested; 32 tests observed RED first (two carry honest tests_red exemptions after post-observation statement amendments - the retro lead is noted).

- The connection system is LIVE on this workspace: quack migrate-edges moved 572 edges across 6 kinds into spec/connections/<kind>/edges.jsonl; the audit reported byte-equal multisets; the board kept its exact suspect set - the hash-neutrality requirement held on the real ledger, not just the fixture.
- Engine: two-lane loader with loud refusals, hash-neutral adjacency, virtual edge properties for queries, the edge-mode referee, the id-charset lint, three determinizers (mint/promote/connections), the verdict-order fix, render: refs, the results-by-exception fig, block-tree from design elements.
- Template: seven new item kinds plus the need repair, mint for every kind (content kinds included), example notes instantiated by generalized stubs, ch3 and ch4 fully mechanized, ch5-ch8 canned, deck/preset/agent-guide skeletons, the methods view, folder READMEs.
- Riders honored: the trace-graph whitelist reverted to the six core types (M2-approved rider on bs21); task wiring stayed frontmatter (M4 sub-ruling).

## Implementation risks acceptable (extension)  -> i12-m6-impl-risks

Every red-team fence is a passing test: silent edge loss (refuse-never-skip), duplicate collapse (migration refuses), interim ambiguity (mode referee plus the loud unfinished-migration state), id ambiguity (charset lint), prose mutation (connection bodies hash), mass-suspect (hash-neutral proof on 572 live edges). Two live catches during the walk are the system working: the strict guard caught the scrap-sink exemption gap at the dogfood migration, and the gate count exposed the missing traceContent classification - both fixed and covered.

## Internal quality (extension)  -> i12-m6-internal-quality

Full selftest ALL OK (including the 32 extension tests); quack lint clean: coverage no holes, EARS clean (61 exemptions), ids clean, no double claims, no orphans; the book renders finding-free; a pre-migration spec backup sits in the data home (backup-pre-migrate-20260706).

## Milestone review (extension)  -> i12-m6-gate

**Verify:** every extension step traces to its requirements; every requirement has a red-observed (or honestly exempted) test now green and a design region. **Validate:** the owner's rulings are honored verbatim - one system for semantic relations with the two evidence-forced carve-outs, option-A lanes, determinizer housekeeping, example notes, the mechanized chapters. **Red-team:** the standing gate condition is NOT met yet - the owner holds this gate for the DOGFOOD SPEC redrafted through the template; the machinery is complete, the redraft is the remaining work before the y. **Verdict: machinery PASS - the gate stays with the adjudicator's condition (dogfood redraft), then the bless.**
