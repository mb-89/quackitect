# M4 — Build & verification (i0014_doc_review, lean L4)

## Compact renders  → i14-bs20-compact-renders

The check was a DISCUSS-BLOCK: the three oversized renders (field c33, c34 and c36) waited behind a design discussion. The discussion ran 2026-07-08. The owner ruled. The bounds landed in the trace. The templates changed FIRST. The spec mirrored. The engine realized them.

### The rulings (owner, 2026-07-08)

- Candidates leave the design chapter entirely. The design chapter documents only the architecture in use; the record - candidates and decisions - lives with the project chapter's timeline. ([req-candidates-timeline](req-candidates-timeline.md))
- The design figure becomes a layered onion with Simulink-style drill-down: click a layer to enter it, click a file to see its design elements, breadcrumbs lead back, leaves link to their trace items. The onion models data flow - inputs enter, travel the layers, outputs leave. Layer membership is the ONE judgment input (spec/design-layers.md); everything else derives. Iteration files stay out. ([req-figure-drilldown](req-figure-drilldown.md))
- The verification chapter opens with the verdict: a derived count plus every unverified requirement by name, before the full matrix. ([req-vv-exceptions](req-vv-exceptions.md))
- Every reader-facing table gets expandable rows (collapsed to the item's cells, detail one click away), expand-all/collapse-all controls, and need-paging at twenty rows. ([req-table-expand](req-table-expand.md))
- General laws, recorded in the guidance chapter: no green ocean (reds prominent, greens collapse to counts) and one screen by default (full detail one interaction away). ([req-compact-renders](req-compact-renders.md) carries the bounds.)
- Rulings beyond this check's scope (trace chapter placement and transport, sidebar numbers, reuse of the report graph, all nodes visible by default) were captured into [req-system-overview](req-system-overview.md) and [req-sidebar-order](req-sidebar-order.md); their re-walk follows via the suspect ripple.

### What was built

- Templates first, spec mirrored in the same move (no template↔spec drift): man-ch4 (candidates and decision tables out, onion in, current-state lede), man-ch5 (verdict-first unit + matrix prose), man-ch6 (timeline expands to decisions and candidates; design-decision views land here), man-ch8 (the three laws), design-layers.md (new template + filled spec map).
- Engine ([book.go](../../../product/engine-go/book.go)):
  - `fig: onion` - static drill-down, all levels pre-rendered, script only toggles visibility (design `go-onion-figure`). Renders 5 rings / 55 files / 151 elements; an unmapped file gets an outermost `unmapped` ring, so the map cannot rot silently.
  - `fig: vv-exceptions` - the verdict-first block (design `go-vv-exceptions`). Current dogfood verdict: 256 requirements, all verified - the block collapses to one green sentence.
  - `fig: candidates-matrix` retired with a pointer to the project chapter; `fig: project-table` reworked: each iteration expands to its decisions and per-axis candidate tables (that axis's criteria only - no sparse union), verdict scan kept deterministic (design `go-project-record`, carrying `go-verdict-order`).
  - The q-table substrate (design `go-q-table`, extended): detail rows from statement+body ([base.go](../../../product/engine-go/base.go) now fills Head/Body for every view), expand/collapse-all, need-paging (rows stamped by the first need they trace up to; off-page rows hidden AT EMIT, so the no-script default is one bounded page).

### Bounds check (rendered book, quack book)

- Onion: one screen at every level; 62 pre-rendered views; breadcrumbs on each.
- Verification chapter: verdict first (one sentence today); the full matrix pages by need at twenty rows.
- Candidates: zero occurrences left in the design chapter; the record reachable per iteration in the project chapter (15 expandable iteration blocks).
- Tables: 603 detail rows across the book, 3 tables page (the rest fit a screen), every table carries the controls.
- Render exits clean: no findings; advisories are the pre-existing term-link and spelling notes.

## Designs realized  → i14-m4-designs-realized

- The five spec-side des- notes had no realized code region - the rule says designs live in the artifact. Each moved into a design marker INSIDE its realizing template (man-sys-overview, man-ch6-project, man-ch8-guidance, man-ch0-orientation, the template README for the example notes); the spec-side notes were deleted. Editing a marked unit now reopens its design - the semantics the rule wants.
- `coverage:designs-realized` computes PASS.

Second round (2026-07-09), after the owner-draft capture reopened the cone - eight holes closed:

- Seven requirements had realizing code without a marker. Each landed at its true home:
  - [req-readme-chapter](req-readme-chapter.md) → `go-book-emitter` (hosts renderReadme).
  - [req-details-pane](req-details-pane.md) → `go-book-shell` (the pane markup and JS hooks).
  - [req-comment-ux](req-comment-ux.md) → `go-annotator-core` (beforeunload warn, stable bar).
  - [req-table-facets](req-table-facets.md) → `go-q-table` (the upills render).
  - [req-criteria-in-needs](req-criteria-in-needs.md) → `method-criteria-items` (ch1 template; stale crit- wording fixed in the same move).
  - [req-decision-rationale](req-decision-rationale.md) → new `method-decision-rationale` (the decision item template mandates the MADR rationale body).
  - [req-example-content](req-example-content.md) → `method-spec-template` (the ex- seed convention, named in the marker).
- [req-context-diagram](req-context-diagram.md) had no realization; the owner ruled 2026-07-09: build it in i14. Test-first: [test-context-diagram](test-context-diagram.md) mechanized to `selftest:context-star-derived`, observed red @ 4b987e58, then built green:
  - New `neighbour` item kind (`nbr-`, minted, trace content); template `items/neighbour.md`.
  - `go-context-neighbours`: the context star derives from the nbr- notes (sorted, border-connected via rectBorder); an empty set says so - the class-derived actors died.
  - ch3 context unit (template + spec mirror): derived star + `neighbours.base` view replace the hand-authored interface list; six nbr- notes now carry the neighbours (console, agent, git, obsidian, vale, reader) as the one source.
- `coverage:designs-realized` computes PASS again (zero holes).

## Documentation completion (owner directive 2026-07-08)

The owner scoped i14 to complete the documentation and capture the gaps into design input, all non-architectural. New design-input requirements (both non-architectural, refine to uc-book-content): [req-example-content](req-example-content.md), [req-decision-rationale](req-decision-rationale.md).

### Chapter numbers  → i14-bs02-sidebar-order (re-walk)

- Manifests carry an explicit `order:` (new frontmatter key; parser + strict-key allowlist + Node.Order). Chapters sort by order then id.
- The toc and each chapter H1 lead with the chapter number (render order, 1-indexed). Verified: 1–10 in both.
- CSS: `.toc-num` tabular, muted.

### Trace chapter  → i14-bs13-system-overview (re-walk)

- man-sys-overview declares `order: 25` — renders as chapter 4, immediately before Design input (chapter 5). Verified.
- The chapter is now the per-need trace graph (design `go-trace-graph`), replacing the old ucfn board + block tree. It REUSES the report's per-need grouping verbatim (`graphTabs`/`subtree`/`buildTab`) - the report bakes those tabs into a cytoscape canvas, which the book cannot run under its zero-dependency CSP, so the same tab data renders as a static SVG per need.
- One page per need: a tab bar toggles which need's graph shows (7 needs). All nodes shown by default (owner override of the report's collapse). Each node is a transport link to its table row (shared data-node-link handler); each node carries a `type · ch N` badge naming the chapter its table renders in.
- REBUILT to embed the report's cytoscape graph 1:1 (owner ruling 2026-07-08): the book inlines the same cytoscape+dagre assets and runs the SAME `reportJS` over the same `graphTabs` data, so the graph looks and behaves exactly like the report - the per-need tabs, the dagre layout, the type-toggle legend, and the filter are all present and identical. The ONE change is the node tap: `reportJS` now calls `window.QUACK_NODE_TAP` when a host sets it (the report leaves it unset, unchanged), and the book sets it to transport to the item's table row (page to it, expand it, scroll). A `window.__quackGraphRefit` hook re-fits cytoscape when the paged trace chapter becomes visible (a graph sized in a hidden container needs it). Table rows carry `data-node="<id>"` as the transport target. Chapter marking sits OUTSIDE the 1:1 graph as a caption line (node colour is type; the caption says which chapter each type's table is in). This retires the static-SVG attempt and the 341-node width concern with it - cytoscape pans and zooms.
- Book size ~2.4MB (cytoscape inlines ~1.2MB). Accepted per the owner's explicit request.

### Reading column width  → owner tweak

- `main` max-width widened 760px → 1040px (~80 → ~110 characters), per the owner. Adjustable.

### Decision rationales  → req-decision-rationale

- The nine ADRs that shipped with `TODO` rationale bodies were autofilled from evidence (engine design markers, git history, sibling ADRs) - none invented. Verified: zero `TODO` rationale bodies remain.
- Two grounding notes for the owner: adr-veto-pointer-entry records the historical i6 why AND cites its later reversal (adr-pointer-entry-unveto), so it stays accurate; rationales run 5–6 lines matching the house model (adr-pointer-entry-unveto), slightly over the 2–4 sentence guide.

### Example content  → req-example-content

- The rules, methods, and partitioning-force views already ship clearly-marked `EXAMPLE — delete me when...` notes.
- Guides were the one empty view: ch8 now renders `type: guide` notes routed to their audience subchapter (falling back to the honest "no guide yet" line). A marked example guide (`ex-guide`, audience user) ships in the template and the dogfood spec. Verified: it renders in chapter 10's user subchapter.

## Internal quality  → i14-m4-internal-quality

Self review of the changed engine, template and spec content (2026-07-08):

- Template↔spec mirror parity spot-checked on every changed unit (onion, vv-exceptions, design-decisions move, candidates removal): no drift. Design markers live template-side only, per convention.
- The q-table substrate: sort moves row PAIRS, filters hide pairs, an active filter searches across pages; group headers hide when their rows do. All interaction toggles visibility only - the script never creates content (the annotator law held).
- No-script default: off-page rows are hidden at emit, so the bound holds without JS; later pages' group headers stay visible empty (cosmetic, script restores them). Accepted.
- Detail-row bodies stay out of the sidebar search until expanded (same tradeoff as the disclosure pattern). Accepted, recorded above.
- needOf cycle guard can blank a need only on a true edge cycle; the monotonic lint keeps the graph acyclic. Deterministic order everywhere (sorted walks).
- CLI: `book` moved under `report` (owner ruling): `quack report book [--out F]`; usage line, ship hint, and report card tooltip updated.
- The engine source is NOT gofmt-clean - pre-existing and iteration-wide, untouched files flagged too. A formatting sweep would churn every design-region hash; parked as a retro note for a dedicated one-shot.

Second round (2026-07-09), covering the marker sweep and the context-diagram build:

- Region semantics respected: the new `go-context-neighbours` region self-closes before `go-block-tree-design`; no neighbouring region truncated (the scanner ends a region at the NEXT enddesign line - verified before every insertion).
- The implements-extensions ride existing regions rather than splitting them. Honest but coarse - `go-book-emitter` now implements seven requirements over ~430 lines. The structural-decomposition method note (HANDOVER) already owns this smell for a later iteration.
- TDD ritual held for the one new behavior: red observed before the build, green after, no statement amended post-observe.
- DRY held: the ch3 interface list lives once (the nbr- notes); star and table derive; template and spec mirror byte-equal on the changed units.
- `projectClasses` keeps one live caller (the dogfood type derivation) - no dead code left by the star's source swap.
- New prose follows the voice: short sentences, lists, roles not names.
- Known-open, deliberately NOT chased here: the crit- template drift (owner discussion pending), the onion drill-down rebuild (its own reopened checks), the committed-book drift (regenerates at ship).

## Verification green  → i14-m4-tests-pass (second round, 2026-07-09)

The rebuild invalidated the verdict cache; the fresh run revealed reds the cached greens had masked - the 2026-07-08 rulings never reached the older tests. All reconciled to the RULED behavior:

- Candidates → project chapter: [test-verdict-order](../i0012_spec_book), test-candidates retarget `renderFigure("project-table")`.
- Decision views → ch6: test-ch4-mech drops the ch4 decision embeds; fig count 1 (the onion).
- ch7 died: test-chapter-canning and test-spec-template-set drop `man-ch7-rationales`.
- Criteria on needs: test-criteria-validation now feeds a NEED with a `## Success criteria` body through criteria.base.
- Unified reader table: test-fig-tables, test-stakeholder-links, test-ch2-derived assert the name+brief anatomy (`data-gp`, `data-node`, detail rows).
- Term affordance: test-glossary-shared, test-ref-tooltips, test-book-depth assert the termref buttons (`data-goto`, `data-help`); the (?)-marker and first-use-expansion asserts died with the mechanism.
- Sidebar rework: test-sidebar-order (views live in the pane), test-search-hitlist (matches counter, the hit list died), test-section-paging (pager bar gone; toc/hash/arrow keys page).
- Details pane: the dom-static law gets its ONE recorded chrome exemption (`window.bookDetail`); test-book-shell and test-book-dom-static pin it to exactly one innerHTML.
- Comment-layer lint: bookAnnotatorFindings now flags artifact SIGNATURES, not vocabulary - a design statement naming the island is legal prose.
- Orphan lint: the synthetic orphan became a requirement (the i14 ucfn board blanket-reaches every need and use case).
- **One genuine engine regression found and fixed**: the pull-law usage detection only saw `href="#slug"` anchors; the i14 termref affordance emits `data-goto` buttons, so ALL references and fundamentals silently dropped out of ch2/ch8. `usedContentSlugs` now counts both. The fixture test caught it.
- `tests_red` bookkeeping: [adr-red-unobservable](../../decisions/adr-red-unobservable.md) minted (addresses req-testsred-exempt via the connections lane); the three i13 markers without a citation and the five post-build statement amendments now cite it.
- Full selftest battery green in one process; `coverage:tests-pass` computes TRUE across all iterations.

## The onion rebuild  → req-figure-drilldown (owner draft 2026-07-09)

- The drill-down implements the owner's excalidraw draft: one true circle filling the width minus port margins; input port boxes outside left, output boxes outside right; the plain `lower levels` centre circle drills down (none on the kernel view); in-flow nodes left, out-flow right, direct throughput as ONE middle box; dotted vertical divider; vertical fan-out from the middle with inward column wrapping; infra pills below; sectors deferred.
- The context star (req-context-diagram) gained the same left/right ruling: neighbour notes carry a `direction` field (in = feeds quack, left; out = consumes from quack, right).
- Rendered: 5 views (overview + 4 layers), zero ellipses, battery green. The visual awaits the owner's eye at the M4 gate.

## Onion review rounds (owner, 2026-07-09)

- Round 1 (draft cut): ports still missed the nodes; connections unclear. → direct curved edges, tooltips, hit twins, legend, hover isolation, in/out labels dropped, rails tried and killed.
- Round 2 (ruling): the rendering approach is right, the LAYER STRUCTURE is not - parked as a note (structure discussions). Print-friendliness is not needed → the layer views SWAPPED to cytoscape/dagre (the trace chapter's inlined assets); the overview rings stay. The deck left the toc. Every figure gained a fullscreen toggle ([req-fig-fullscreen](req-fig-fullscreen.md), minted with its review test).
- Lessons baked into the method (engage.md): the opinionated-visuals law, the ruling-owes-its-test-sweep law, and the already-built exemption citing adr-red-unobservable.

## M4 verdict (second round, 2026-07-09)

Round 1 (existence): every planned step built. The owner-draft onion and the context diagram realized. designs-realized, tests-red and tests-pass all compute green. Round 2 (spot-scrutiny): the reconciled tests assert the RULED behavior, not the code's accidents. The one engine regression (pull-law usage) was found BY a fixture test and fixed in the engine, not the test. Round 3 (adversarial): the riskiest claim is the onion visual - the data is derived and pinned, the layout is one first cut from the owner's draft and is exactly what this gate presents for adjudication. Recommended: bless, with the onion look explicitly reviewed in the rendered book.

### Interpretation noted for the adjudicator

- "Rows are only the names": rows keep their query columns (they power the c21 filters); the detail row carries the full item. If the owner wants name-only cells, the base files' order lines slim per query.
- Onion leaf links (`trace ↗`) scroll to wherever the node renders; they gain their full target when the amended trace chapter lands (bs13 re-walk).
- Detail-row bodies are hidden from the sidebar search until expanded (static-DOM tradeoff, same as the disclosure pattern).
