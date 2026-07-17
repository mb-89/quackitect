# M6 — Build evidence (i0012_spec_book, systematic; extends M6-build-plan.md)

TL;DR: all twenty planned steps realized in stage order. Every requirement carries a realized design. The 26 mechanized tests went RED then GREEN. The dogfood book renders clean with:

- the deck
- the glossary
- the emitted AGENTS.md

## Build  → i12-m6-build

All twenty steps landed, in the planned stage order (the walk's own ledger is the referent). Highlights per stage:

- Stage 1: `quack build` now re-baselines through the freshly built binary and flushes stale verdicts - the i11 wedge and self-wedge both died.
- Stage 2: templates, mint skeletons, glossary terms, guidance docs, methodology map, type/class notes, and the drafting method with the mark law.
- Stage 3: the deterministic emitter - transclusion at depth, identity stamp, per-unit anchors, robot margin marks, generated glossary, derived figures.
- Stage 4: presets and until-found disclosure, computed-contrast a11y, drift lint, Vale auto-pull (exercised live on the real channel - the advisories in the build log are its output), the AGENTS.md emission.
- Stage 5: the dogfood content - six chapters, four presets, the presentation deck, the agent guide as one source for the book chapter and the repo AGENTS.md, and the 230-node exclusion record that keeps the orphan lint honest.

## Internal quality  → i12-m6-internal-quality

- Zero-dep in linking held: net/http and archive/zip are stdlib; Vale runs as a subprocess, never linked.
- Selftest seams everywhere: glossaryDirOverride, the pure buildRebaseline, the fixture builders (bookFixture, glossFixture), canned-output parsing for Vale.
- Voice held: the mark law binds every book prose unit structurally; the wording sweep stayed green through every content step (and caught one violation of mine mid-walk, which was fixed before its bless).
- Scope guard held: ONE emitter, ONE manifest node type, TWO fatal lints (orphan, meta-quarantine) plus the drift check; tables and figures are emitter internals, not new machinery.

## Implementation risks acceptable  → i12-m6-impl-risks

- Vale is a soft runtime dependency with a pinned version and loud graceful absence - the accepted trade, recorded in its ADR.
- The until-found disclosure is Chromium-first; other engines degrade to closed details plus EXPAND ALL - accepted, spike-recorded.
- The trig approximation in the context star is a hand-rolled Taylor pair - bounded input range (one turn), deterministic by construction.
- The agent-guide manifest now owns AGENTS.md; an accidental hand-edit of AGENTS.md is overwritten at the next `quack book` - mitigated by the manifest being the documented single source (its own lede says so) and by version control.

## Verification green / designs realized / tests red  → derived checks

Compute live on this board:

- 27/27 requirements with realized designs (`quack lint`: the last hole closed with the deck step).
- All 26 mechanized tests carry birth-red observations and pass at their current hashes.
- The review-residue test (template-flow) waits for its M8 adjudication by design.

## Extension build (owner-directed 2026-07-05) — the spec template  → i12-m6-build

All fourteen extension steps realized in stage order: bs6 substrate -> bs7 machinery -> bs8 authoring. Each step is individually blessed with its selftest green at bless time:

- Stage 6: one-level frontmatter maps under strict parse; the spec content roots (glossary MIGRATED to spec/glossary, references/fundamentals/methods loaders, aliases); the pinned-subset Bases evaluator (volatile functions refuse, out-of-subset refuses, byte-identical evaluation proven).
- Stage 7: the alias auto-linker (authored links win, longest match, collision refuses); three lints (external-links-only-in-references, slot residue, dangling heading anchors); decision kinds + candidate nodes with 0..1 ratings; the faceted coverage board with type-layer vocabularies and zero-count holes; vv-table and stakeholder-matrix migrated to canned base queries; the quarantine boundary moved to everything-except-guidance.
- Stage 8: the nine chapter skeletons + README + seven canned queries; the thirteen item templates (fields declared with name, semantics, value range); start stubs emits the skeleton; the pilot retro-migration ran and its findings are recorded in M6-build-plan.md.

## Extension internal quality  → i12-m6-internal-quality

- Zero-dep held: the YAML subset, the expression parser, and the auto-linker are hand-rolled; no new linkage.
- Seams everywhere: contentRootOverride, specLintFindingsAt, glossaryDirOverride kept; fixtures per selftest.
- The user-wording sweep caught one violation of mine (the decision template) mid-walk; fixed before its bless — the lint generalized correctly to new method content.
- Fail loudly held: alias collisions, out-of-subset constructs, unknown facet values, unknown decision kinds all refuse with named errors.

## Extension risks acceptable  → i12-m6-impl-risks

- Bases is Obsidian's language and moves: pinned subset, loud refusal, the engine authoritative; authoring-preview divergence can mislead an author but never corrupt output. Accepted.
- The pilot proved the ledger survives retro-migration honestly: the ADR wiring flipped old cumulative checks SUSPECT through a genuinely failing test, named it, and recovered on the fix.
- The template files carry unfilled slots by design until the dogfood redraft; the residue lint keeps them visible in workspaces.

## Milestone review  → i12-m6-gate

- **Verify:** every planned step is individually blessed with its selftest green at bless time. The derived checks compute. The book artifact exists and regenerates byte-identically.
- **Validate:** the build honors every owner ruling of this walk:
  - the mark law with surface-versus-core
  - margin robots
  - Vale-not-hand-rolled
  - generous machine-readable figures
  - one-source AGENTS.md
  - truth only in spec
- **Red-team:** the largest risk was scope under deadline. Answered: the relief valve was never needed - all five stages landed. The two soft spots (Vale dependency, browser-specific disclosure) are ADR-recorded trades with fallbacks, not surprises.
- **Extension review:**
  - Verify - 34 steps total realized. 42 tests birth-red and green at their hashes. Coverage clean. Lint clean. Full battery green.
  - Validate - every 2026-07-05 owner ruling is realized or recorded:
    - two markdowns
    - pull law
    - items and views
    - facets as expected work
    - decision kinds
    - the quarantine
    - the anchors
  - Red-team - the biggest exposure is the unproven authoring loop (no dogfood chapter has been drafted through the template yet). Answered: the redraft is deliberately the refine track, with the owner in the review loop where judgment belongs.
- **Verdict: PASS - pending the adjudicator's bless.**

## Dogfood-redraft record (2026-07-07) - the gate condition worked off  → i12-m6-gate

Three engine defects surfaced by the redraft. Each was walked test-first (amend -> observe red -> fix -> green):

- Fill comments (owner note, 07:56): proseUnitsMarked had no multi-line comment state - the shared stripFillComments helper now strips non-mark comments in the predicate, the renderer, and the AGENTS.md emitter. Red at b56741bc.
- Orphan lint vs live views (owner ruling): bookOrphanFindings now counts nodes a chapter's embedded base view matches as reached; pull-law (`referenced`) queries are excluded - they follow references, never create them. Red at ca0bc4a5.
- Grouped refs views (owner ruling): a groupBy refs view renders each group as a disclosure whose summary carries the key node's statement - usecases.base groups by the refined need. Red at 13ef4183.

The redraft itself is template-faithful (canned units verbatim, fills authored):

- ch0 orientation: lede fill; per-paragraph marks (a TEMPLATE defect the instantiation exposed - fixed in the template first, mirrored here; the ch8 about-unit likewise).
- ch1 motivation: the owner-driven morning draft, rendering since the fill-comment fix.
- ch2 fundamentals: instantiated, pull-law views.
- ch3 design input: context-and-scope and functions fills authored; the views carry the rest.
- ch4 design output: canned machinery; budgets skipped (type-gated, software).
- ch5 verification-validation: the validation fill traces the five criteria; records skipped (type-gated); the abbreviated man-ch5-vv id retired for the template's spelled-out id.
- ch6 project: the approach fill with the tailoring record (the two type-gated skips named).
- ch7 rationales, ch8 guidance: instantiated; the guides fill records the demand-driven state.
- Facets: all 187 requirements tagged phase/discipline/quality from the type-layer vocabularies (hash-neutral; the coverage board and register filters are live).
- Needs: the two i0004 needs gained their source stakeholders.

Internal quality:

- Full selftest ALL OK.
- quack lint fully clean.
- The book renders finding-free with all ten chapters.
- Zero suspects throughout - the facet and needs edits proved hash-neutral as designed.

**Review of the redraft:**

- Verify - the book renders every chapter through the template. The three fixes carry red-observed tests now green.
- Validate - the gate condition (the dogfood spec redrafted through the template) is MET in structure. The owner's full-book read is the remaining judgment. The ELI5 rule the owner set mid-walk is baked into the voice.
- Red-team - the weakest spots (none blocks the review; all are visible in the artifact):
  - the empty views (methods, rules, interfaces, force-rationales - no such notes exist yet)
  - the pattern-based facet tags (bulk judgment, owner sampling advised)
  - the long need statements heading the grouped use-case views
- **Verdict: redraft COMPLETE - the pager and the owner's read of the full book decide the gate.**

## Owner-directed second wave (2026-07-07, afternoon)  → i12-m6-gate

- Layout mirror (owner ruling): the spec now mirrors the template - manifests at the spec ROOT, stakeholders/usecases/raid in their item homes; `start stubs` seeds the root (test-first: test-stub-spec red at e3760119, test-stubs-folders red at 38a16b90); existing workspaces convert through the ENGINE determinizer `quack migrate-layout` (test-migrate-layout red at 4888eac1; an interim PowerShell script did this workspace's move and was retired the same day - migrations live in the one binary, owner correction); 41 files moved hash-neutrally.
- Book shell (owner ruling): mdbook-style - ONE sidebar carries the chapter TOC (unit headings linked), the GLOBAL search, the view presets, and the details card; every filter control compiles into one hand-editable expression (`preset: phase: discipline: quality: state:` plus free text); the report's visual language carries over; the script stays toggle-only. req-book-shell minted, test-book-shell red at 1f6ea55a, now green.
- Empty views (owner ruling): clearly-marked EXAMPLE notes ship for methods and force-rationales (template + workspace) and rules (workspace); the interface example was REFUSED by the strict guard - a connection note cannot reference a code-derived design (noted, a real gap).
- Two determinizer defects noted for triage: mint writes frontmatter edges in connections mode (refused nodes); the interface-endpoint gap above.
- Battery: selftest ALL OK, lint fully clean, book renders finding-free, zero suspects.
