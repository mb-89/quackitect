# M6 - Build plan (i0027_book_feedback, systematic)

TL;DR: Thirty resumable steps under the build task, in five waves ordered to minimize engine rebuilds. Each step carries its red ritual; the battery runs once, at the verification gate.

## Build planned  -> i27-m6-build-planned-decomposed

The tree (children of i27-m6-build-the-planned; flat where parallel, chained only on real prerequisites):

**Wave 1 - data foundations (engine)**
- b1 function nodes and the migration
- b2 pugh fields and the weight port
- b3 the palette source

**Wave 2 - engine self-explanation**
- b4 the refusal lint
- b5 why-delta honesty
- b6 the verify build-pin
- b7 the supervisor swap
- b8 the boot command and the onboard rewrite
- b9 the pager result file, close-as-reject, and the open-question refusal
- b32 the apply undo journal (owner addition 2026-07-18, after the b25 incident)

**Wave order is WIRED now (owner ruling 2026-07-18):** the view and content steps
(b27-b31) depend on the machinery steps (b3-b9) - the wave order carried real
protection, so it is a dependency, not a display order.

**Wave 3 - the onion**
- b10 band re-geometry: top and bottom buses, the side rule
- b11 DSM clusters with identified lanes
- b12 interaction unification and the host-scoped drill
- b13 the boilerplate fold
- b29 the I/O busbar refactor per the physics ruling

**Wave 4 - the book's views**
- b14 the model kinds rework
- b15 generic filter columns
- b16 the register fold
- b17 the RAID matrix
- b18 the shared timeline renderer
- b19 its three frames
- b20 the drill-down with yellow deciding rows
- b21 the Pugh render
- b22 details and toast, with the border pulse
- b23 hand-off tables and live figures
- b24 search hits
- b25 polish
- b26 chapters 2 and 3
- b31 the view-filter round-trip: readme jump, field ping, honest graying

**Wave 5 - content**
- b27 the IFU machinery
- b28 the IFU content pass with the 82079 reviews
- b30 interface notes and the rationale sweep

**The build discipline**
- Requirements mint whenever the work needs one. The cap is the process's own tripwire; it speaks when it trips, and we discuss then.
- The tests batch per wave: each step authors its selftests and observe-reds them at step end. The full battery runs exactly once, at verification green.
- Engine-source waves group rebuilds. The verify build-pin lands early so later waves inherit the mid-battery swap protection.

## Function nodes  -> i27-b1-function-nodes

The function node type landed (go-function-nodes, ops.go):

- Type membership: `function` joined traceContent and traceTypes. It is content, never a gate.
- Parser and schema: the generic node parser accepts the type. The `functions:` list key retired from the allowlist. A leftover list refuses with the recovery clause naming `quack migrate-functions`.
- Migration: `quack migrate-functions` minted one node per list entry beside its need. It is edge-mode-aware: frontmatter `refines`, or the refines jsonl lane in connections mode. It strips the list line in the same pass and runs idempotent.
- Live run: 11 function nodes minted from the 4 need lists. The diff touched only the list lines. The 11 edges landed in `spec/connections/refines/edges.jsonl`.
- Views: the design-input register and the ucfn board now read function NODES. The `fn` prefix humanizes like the other reader kinds.
- Red ritual: `selftest:function-nodes` observed red at 7ef00419 (stub), green after the build. It guards the mint, the strip, idempotence, strict acceptance, the retirement refusal, both edge modes, gate exclusion, and the register row.

## Onion band geometry  -> i27-b10-onion-band-geometry

The band view re-oriented to the committed layout spec (go-onion-busbar, go-onion-figure):

- Buses (reworked 2026-07-19 after the owner's read-the-drawing ruling): EVERY input bar owns its own full-width horizontal rail, stacked across the TOP, its box riding the rail's LEFT end. The output bars mirror across the BOTTOM, each box at the RIGHT end. A merged shared rail — the twice-recorded regression — is refused by the test. Both shapes (round band, cluster box) and the topmost overview share the geometry; a block taps each rail it consumes.
- Side rule: a to-core block stacks LEFT of the core. A from-core block stacks RIGHT. A pass-through block joins the emptier side. A both-ways block sits left (the output rule names the side first).
- The body stays a true centered circle. The core stays dead centre.
- Topmost view: the same per-bar rails over the rings; every rail sends its own tap stopping at the onion's outside, and the canvas grows with the rail stack.
- Red ritual: `selftest:onion-io-rendering` observed red at 1331d5d8 (re-refreshed for the per-bar sharpening), green after the build. It now guards the rail COUNT per side, the box-at-the-rail-end pairing, per-rail block taps, the rail-above/below-blocks invariant, the side rule, the round centered body, and the overview's rim-stopping per-rail arrows.
- Neighbours checked: `diagram-review-render` (change marks) and `pong-deck` (compact slide instance) stay green.

## Onion DSM clusters  -> i27-b11-onion-dsm-clusters

Coupling clusters replaced file themes as the grouping source (go-onion-dsm-groups):

- Grouping: `dsmGroups` splits a member set by its internal call graph through the deterministic DSM pipeline. A cluster of two or more members is one enterable block. Uncoupled regions keep their own blocks, the file as secondary info only.
- Interior: the recursive emitter renders each cluster as a coreless bus-bar box. Top input bus, bottom output bus, identified lanes by flow conservation. The interior re-derives grouping, so a member may itself be a cluster at every depth (rule 7).
- Core wiring stays on the band level (rule 4): a member's inward talk rides the cluster's output lane; the cluster block carries the core flags.
- Red ritual: `selftest:onion-clusters` observed red at 1e58372e, green after the build. The fixture is the proven two-triangle DSM graph, all six regions in one file — coupling wins over the file. The nesting leg drives the emitter on the whole set and sees the interior split.
- Sweep: the review-render page grew from ~314KB to ~670KB (74 pre-rendered views, the nested interiors). The `diagram-review-render` size guard re-pointed to 1MB with its history documented. Both neighbours green.

## Onion interaction unification  -> i27-b12-onion-interaction

One interaction script for every onion host (go-onion-interact):

- The standalone review page now embeds the SAME script constant the book shell uses. It gains history navigation for free; its old forked script shrank to panel glue registering the inspect hook.
- Host-scoped drill: a drill target resolves inside its own `.onion` host, by exact id or id-suffix. A deck slide's id-prefixed figure copy drills its own views (the M5 spike's bounded defect, fixed). The popstate stack keeps the view element, never a global id lookup.
- Click details everywhere: single-click inspects and feeds the host's details lane — the book's pane via its data-node-link handler, the standalone's panel via `window.__onionInspectHook`.
- Browser-back exits an entered block in both hosts (req-onion-enter): every drill pushes a history state.
- Red ritual: `selftest:onion-click` observed red at 030e3bdc, `selftest:onion-enter` at e48d9a55; both green after the build. Neighbours `diagram-review-render` and `pong-deck` green.

## Boilerplate fold  -> i27-b13-boilerplate-fold

The hide-boilerplate control landed (go-onion-boilerplate):

- An ambient-stamped element is boilerplate. Its infrastructure pill carries `data-oc-amb`.
- A view whose pills include boilerplate gets the fold control. It toggles the host's `fold-amb` class; the CSS rule hides every stamped pill. The label flips to `show boilerplate (N)`.
- The fold is render-side only. The DOM keeps the pills, so the model stays complete.
- The toggle rides the shared interaction script; the CSS rule lives in both shells (book, standalone).
- Red ritual: `selftest:onion-boilerplate` observed red at dddd7d91, green after the build.

## Model kinds  -> i27-b14-model-kinds

The kind walk executed (req-models-useful table; go-model-registry, go-models-complete-book):

- Templates: `structural` (generic part-of, renamed from element-tree) and `onion` (reusable layered kind) with renderable example fences. `sequence` and `state` deleted. `context` stays derived.
- Instances: model-agent-lanes and model-module-architecture retyped structural. model-engine-layers retyped onion. model-check-states, model-register-ask-flow, model-reload-sequence deleted. model-product-tree absorbed into model-quack-structure (ruling A): its method sub-parts ride under the method layer.
- Dangling edges removed with the drops: adr-i24-views→model-reload-sequence (addresses lane), adr-register-watch-answers→model-register-ask-flow (chosen lane). The ch8 authored state-model figure hook removed.
- The catalog: section 10.6 derives per USED kind — template prose, the example rendered small (layered examples draw as the onion), linked uses. A kind used nowhere is absent. Extending 10.6 = one template file.
- Mint defaults follow: `quack mint model` stubs structural.
- Red ritual: `selftest:model-kinds-catalog` observed red at 71fbff12, green after the build. Coupled selftests re-pointed under the same walk (model-kinds exact registry set, model-stubs structural, fixtures retyped). Sweep green: model-kinds, model-stubs, informed-by-edges, views-chosen, model-nodes, model-lint, model-consistency, conformance, mint-all-kinds, mint-skeleton.

## Filter columns  -> i27-b15-filter-columns

The generic filter mechanism landed (go-filter-columns):

- Facets collect first; the emit shape follows their count. Several dimensions render one vertical column each inside one `.ufilters` row. The header names the category. One dimension stays a single horizontal pill row.
- Chips carry counts. The need facet lists every need, so an empty value stays visible and clickable at zero.
- A column past ten values scrolls between an arrow on each end. The arrows nudge the chip column; the shell script gained the handler.
- The chips keep the `data-facet`/`data-fv` wiring, so selection stays combinable (AND across facets, OR within one) with no script fork.
- Red ritual: `selftest:filter-pills` observed red at d2a8757a, green after the build. Sweep green: report-filter-ux, register-quality-type, register-advisory, base-views, ratings-map.

## Register fold  -> i27-b16-register-fold

The register is the one design-input home (go-input-register):

- ch3's separate use-cases-and-functions section died: heading, prose, and `fig: ucfn-board` removed; the register section's prose carries the fold and ch3 references the trace for interconnections.
- `renderUcfnBoard` deleted. The register renders use cases, functions, functional and quality requirements (constraints stay a type) behind the generic need and type filter columns.
- The orphan-reference logic re-pointed: the register's population (plus every need via its facet) counts as referenced; functions joined it.
- The design region moved: `go-input-register` implements req-design-input-register and inherits req-need-scoped-views from the dead board (the need facet carries the per-need view).
- Red ritual: `selftest:design-input-register` observed red at 8015dc36, green after the build. Re-pointed neighbours green: ch3-ucfn-merge (now asserts the board is gone), need-expand (expandable rows inside the register), orphan-render-refs, agent-guide-ch8, ch8-audience-subchapters.

## RAID matrix  -> i27-b17-raid-matrix

The bubble matrix landed (go-raid-matrix):

- One continuous diagram over every RAID item: impact on x, probability on y, both 0..1 with gridlines and tick labels (the owner's axis ruling).
- One bubble per item. Color encodes the kind (risk, assumption, issue, dependency); position alone carries severity.
- Kind and status ride the generic filter columns. Every status chip starts selected except closed, so closed items hide by default while staying in the DOM. The shell script reads the initial selection from the pills, so the default is data.
- A bubble click opens the details pane through the shared `data-node-link` lane.
- Data: the audit found every live raid node already carries probability, impact, and status - no fills needed.
- ch6 gained `fig: raid-matrix` above the register table, with the reading hint in prose.
- Red ritual: `selftest:risk-matrix` observed red at 08085d91, green after the build.

## Shared timeline  -> i27-b18-timeline-shared

The one renderer extracted (go-timeline-shared):

- `renderIterationTimeline(it, nodes, sm, opts)` carries the handover pager's milestone-grouped drill-down tree: milestone rows with done counts, the task tree, marked rows.
- The frame is an option: its name (`handover` | `report` | `book`) rides as a CSS hook, plus the open milestone and the marked set. Content is identical everywhere, so the surfaces cannot drift.
- The pager's tasks panel now calls the component; the three-frame mounts land with the next step.
- Guards: the extraction is behavior-preserving — pager-merge, pager-scope, handoff-lifecycle, card-evidence, card-empty-register all green.

## Timeline frames  -> i27-b19-timeline-frames

The three frames mounted (go-timeline-frames):

- Handover: unchanged from b18 — the pager's tasks panel rides the component.
- Report: the old bracket-lane tree died. Each iteration row keeps its summary count; its body is the shared component with the working milestone open. The panel stacks iterations oldest-first inside a scroll host between two arrows; the shell script anchors the CURRENT iteration three quarters down the viewport (req-timeline-anchor). Wheel scrolls natively; never pagination.
- Book: ch6 gained "The iteration timeline" with `fig: project-timeline` — every iteration at full width through the same component, the current one open.
- Red ritual: `selftest:project-timeline` observed red at cf9a6420 and `selftest:timeline-anchor` at fe2e9201; both green after the build. Sweep green: report, report-verdict, report-nesting, report-why, report-debounce, status-fast.

## Pugh fields  -> i27-b2-pugh-fields

The Pugh data lanes opened (req-pugh-render, data consequence):

- `weight` rides criterion frontmatter. The 18 existing criteria's prose weights ported through one judged apply manifest (dry-run first, exact-once, 18 files, one line each). The rationale prose keeps the why; the field is the datum the render reads.
- `datum` joined the schema: a decision may declare its Pugh comparison base. It resolves like `chosen`, so a dangling datum refuses at load.
- The render itself is b21's step; new M4 decisions carry the data from here on.

## Timeline drill-down  -> i27-b20-timeline-drilldown

The task drill landed on every frame (go-timeline-drilldown):

- Expanding a task lists its evidence section and the trace elements the section cites, grouped by type in fixed order (decisions, questions, requirements, use cases, functions, designs, tests, models). Each group is its own expandable details.
- One horizontal pill row (the single-dimension shape of the filter rule) narrows the groups — first draft, one selection, in all three shells.
- Every element row carries both details-pane hooks (`data-nid` for the report, `data-node-link` for the book) and the statement as its title; the pane resolves the source link.
- The hand-off: the separate milestone-verdict panel DISSOLVED. The tasks view is the one field — evidence hangs inside each task, and the gate group's rows wear the yellow deciding mark.
- Red ritual: `selftest:timeline-drilldown` observed red at bb450eae, green after the build. Sweep green: the five pager guards plus project-timeline and timeline-anchor.

## Pugh render  -> i27-b21-pugh-render

The derived matrix landed (go-pugh-render):

- One table per datum-bearing decision: weighted criteria rows, candidate columns with the datum first and marked, sign cells against the datum (better green, worse red, same gray), raw ratings in the cell titles, a weighted-totals row, the winner mark from the chosen edge. Never from prose.
- Mounted in the book's decision expand (above the raw per-axis matrix, which stays the expand's raw lane) and on the hand-off decision card behind "the matrix".
- Data: the two i27 M4 decisions declared their datums (adr-onion-extend → cand-onion-fresh, adr-pugh-fields → cand-pugh-block) and the four candidates' mint-leftover duplicate blocks cleaned — one judged apply manifest, six files.
- A decision without a datum draws nothing: the gap stays honest.
- Red ritual: `selftest:pugh-render` observed red at 71263a76, green after the build (fixture totals 0.74/0.50 verified). Sweep green: candidates, decision-kinds, verdict-order, pager-merge, card-evidence, timeline-drilldown.

## Details and toast  -> i27-b22-details-toast

One resolution mechanism, two outputs (go-details-toast):

- `nodeEntryHTML` is the one resolver: id, type, killer mark, statement, body — identical content whichever container shows it.
- The hand-off ships every referenced entry as a template (ids scanned from the page's own reference attributes and markdown hrefs) plus a toast host. A followed reference pops the full entry as a small bottom toast; a tap dismisses it; it self-dismisses after eight seconds. The dead dotted links live.
- The pane surfaces (book `#dpane-content`, report `#detail`) announce a content change with the attention ping: three border echoes, staggered 0/150/300ms, each expanding a uniform 3vmax outward while fading, in the pane border's own color. A MutationObserver drives it; echo insertions do not re-trigger.
- Red ritual: `selftest:details-full-entry` observed red at ac913615, green after the build. Sweep green: pager-merge, handoff-lifecycle, card-evidence, timeline-drilldown, report.

## Hand-off render  -> i27-b23-handoff-render

The hand-off's evidence lane matured:

- Markdown tables render as real HTML tables everywhere `mdLite` runs: a pipe block becomes `<table class="mdtable">`, the `---` separator row honored as the header. Never raw pipes (req-evidence-md-tables).
- A layered model figure in evidence renders through the book's interactive onion — clickable, enterable in place, instance-scoped — never a flat picture. Flat graphs keep the flow figure, the book's own shape (req-handoff-live-figures).
- The pager's private onion-script fork retired: the page now prepends the ONE shared interaction script (go-onion-interact), gaining host-scoped drills and browser-back for free.
- Red ritual: `selftest:evidence-md-tables` observed red at 4c042f3d, `selftest:handoff-live-figures` at 98e4d198; both green after the build. Sweep green: pager-merge, handoff-lifecycle, card-evidence, details-full-entry, deck-links, terms-before-use.

## Search hits  -> i27-b24-search-hits

Search now lands on visible hits (req-search-visible-hits):

- `revealHit` runs before every hit scroll: collapsed details ancestors open, a hidden expand row unhides with its trigger row marked open, hidden containers unhide, and a hit inside a pannable graph centers the svg viewBox on it.
- Enter steps to the next match, Shift+Enter to the previous — beside the existing arrow buttons and the live counter.
- Every hit stays painted through the Highlight API, unchanged.
- Sweep finding: the shell-title-card guard's phrase probe tripped on old milestone evidence now legitimately embedded by the timeline drill — re-pointed to its structural markers, which stay the guard.
- Red ritual: `selftest:search-visible-hits` observed red at 1320559c, green after the build. Sweep green: shell-title-card, sidebar-order, section-paging, deck-views-section.

## Book polish  -> i27-b25-book-polish

Four polish items landed:

- Graph centering (req-graph-centering): `.onion-flow svg` and figure svgs center with `margin:0 auto`; the hand-off's model figures center the same way.
- V&V result links (req-vv-result-links): a verification row's expand carries `result: pass/fail · Nms` opening the verdict store's latest entry (build and input hash); a recordless test says "no recorded result yet".
- The no-test policy (req-vv-no-test-policy): the verdict-first block's third column shows each unverified requirement's recorded reason; an unexplained one renders as the defect. `noTestPolicyFindings` enforces it in the battery over this workspace; retired/deferred items are out of scope — their stamp is the reason. The live sweep found only the two retired canvas requirements, resolved by the scope rule.
- Deck navigation (req-deck-nav-usability): the clamp and the ESC pill already existed; the new selftest pins them, `tests_red: exempt` (red unobservable).
- Red ritual: `selftest:vv-no-test-policy` observed red at b9acc55f (live leg), green after the scope fix. graph-centering and vv-result-links carry the exempt stamp: the incident recovery folded their authoring and build into one replay pass.
- INCIDENT, recorded honestly: during b25 a careless scripted replace corrupted book.go (every `.` became `o`). Recovery: git restore plus a full replay of the session's edits from context, proven by all 22 i27 selftests running green afterward. The lesson is noted for the retro: ad-hoc scripted replaces are dead; `quack apply` is the only bulk lane.

## Chapters 2 and 3  -> i27-b26-ch2-ch3

The restructure landed (req-ch2-ifu-intro, req-ch3-needs-intro):

- Chapter 2 is "Introduction and IFUs", IFU visible in the heading. 2.1 Document overview carries the audience prose: IFUs are for users learning the system; the full document is for readers who want the whole development process. 2.2 IFUs holds the one onboarding home — the moved route-in material, never duplicated later. The fundamentals machinery (concepts, references, glossary) stays as the chapter's later sections.
- Chapter 3 opens with the IFU prose — IFUs show what users can do, every IFU tells a user story, the stories compose the idea into needs — and references the design-input register as the one flat index. No technical needs list opens the chapter.
- Red ritual: `selftest:ch2-ifu-intro` observed red at bf0b8aed, `selftest:ch3-needs-intro` at 88dc00a5 (sharpened to positional assertions after a vacuous first pass); both green after the edit. Sweep green: chapter-canning, terms-before-use, presets-visible, jargon-advisory.

## Palette source  -> i27-b3-palette-source

Type colors resolve from the one source (go-type-colors):

- `typeColors()` parses the "## Type colors" list from the brand palette through the overlay chain; the engine's generic template carries the same list as the fallback. Parsed once per process.
- The palette gained function, question, and the four RAID kinds — a new type enters the list before any render uses it.
- The duplicated literals died: the report's swatch and chip rules and the book's legend swatches emit from `traceTypeCSS`; the trace graph's cytoscape styles build from `QUACK_DATA.typecolors` in both surfaces; the RAID matrix resolves kind colors through `typeColor`.
- The selftest sweeps the Go source for the six trace hexes (split probes so it cannot match itself) — the no-literal law enforces itself in the battery.
- Red ritual: `selftest:type-colors` observed red at d3e2d451, green after the build. Sweep green: risk-matrix, report, brand-resolves, white-label-book, timeline-drilldown, diagram-review-render.

## Apply undo  -> i27-b32-apply-undo

The safe lane became the forgiving one (go-apply-undo, owner ruling after the b25 incident):

- Every applied manifest journals the touched files' prior bytes plus the sha of what it wrote, in a numbered entry under the data home. The journal keeps the last four; a journal failure refuses the apply.
- `quack apply --undo` restores the newest entry byte-exactly and pops it. The drift check runs first over every file — a file changed since the apply refuses the whole undo, nothing restored. A file the apply created is removed by its undo.
- The ledger stays out, as for apply itself.
- Trace: req-apply-undo (refines uc-engine-mediated-io), test-apply-undo wired in the verifies lane. The missing refines edge surfaced as a live req-traced coverage red — caught and fixed at the walk; the stale resident-child memo it exposed is noted as a defect for the b7 walk.
- Red ritual: `selftest:apply-undo` observed red at 95058e79, green after the build (revert-exact, drift-refusal, bounded journal, created-file removal). Apply guards green: apply-general, apply-manifest, apply-default-lane.

## Refusal lint  -> i27-b4-refusal-lint

Every refusal names its recovery (go-refusal-lint):

- The lint parses the engine source's string literals (go/parser — comments and test assertions never trip it), keeps the refusal-speaking ones, and demands a recovery marker in the same message. Short fragments and composition prefixes are judged where composed. `quack lint` prints the findings; the battery keeps the set clean.
- The first sweep found 27 candidates: 13 lint-precision refinements, 14 genuine messages amended with their recovery moves through one apply manifest.
- The unknown-selftest-name trap is dead: `quack selftest <unknown>` now says UNKNOWN with the recovery, never a false FAIL — the message that cost five false regression scares this iteration. It exposed five more invented names in my own sweeps immediately.
- One guard re-pointed: binary-budget's cap assertion now pins the recovery clause instead of the dropped word.
- Red ritual: `selftest:refusal-recovery` observed red at b235780d, green after the amendments. Sweep green: the four apply guards, structural-strictness's real names, base-views, lint-exit-honest, binary-budget, bless-preflight.

## Why delta  -> i27-b5-why-delta

The delta lister is honest (go-why-derived amended):

- The full deferral skip set applies: the adr-scrap lane AND the node's own deferred/retired stamp. A parked item never lists as an offender — the misleading-why-delta triaged note's fix.
- A verdict cache miss reads distinctly from a failure: "unverified at this build (verdict-cache miss) - run `quack verify <id>`" against "FAILS at its current inputs". The recovery clause landed with b4.
- Red ritual: `selftest:why-honest-delta` observed red at ff1adac1, green after the one-line skip-set fix. Sweep green: why-derived, report-why, defer-excludes-coverage.

## Verify build-pin  -> i27-b6-verify-pin

Battery runs pin the build (go-verify-pin):

- The run hashes the on-disk binary at start (fresh bytes, never the process memo) and re-checks at the end. A mid-run swap means the recorded verdicts belong to a superseded build: the run re-executes itself once — the new binary, the same arguments — so the work lands under the final build. A second swap refuses, naming the recovery.
- Wired at both battery entries: `quack selftest` and `quack verify`.
- Red ritual: `selftest:verify-pins-build` observed red at e2466b82, green after the build. Sweep green: verify-cache, verify-feedback, lazy-verdicts, battery-batch, battery-parallel, plus a live derived verify.

## Supervisor swap  -> i27-b7-supervisor-swap

Red: selftest:supervisor-any-swap authored against the stubs (supForceSwap always false,
sweepStaleParks always 0) and observed failing at 59f61a7a.

The wedge this kills, from the field (2026-07-18, this session): four quack processes -
the supervisor plus three leaked children - wedged every MCP call for ten-plus minutes,
and four parked `quack.exe.old*` binaries piled up from blocked swaps. Three defects,
three fixes, per the owner's directive ("kill all the old exes properly"):

1. **Force-swap after the drain timeout** (go-supervisor-hardening, i24_hygiene.go).
   `supForceSwap(inFlight, waited, timeout)` is the pure decision: stuck replies plus a
   wait past `supDrainTimeout()` force the swap through. Wired at both call sites in
   mcp.go: the 500ms stamp watcher tracks `swapSince` and forces an idle-session wedge
   open; the per-request drain loop calls `swapIfReady(true)` once its deadline passes.
   The drop is LOUD: "dropping N stuck replies - retry the call" on stderr.
2. **Deterministic kill** (`killChild`, mcp.go). Close stdin, `Kill` with the error
   logged, bounded 3s `Wait`, then the OS-level escalation (`taskkill /F /T` on the
   pid tree). The method returns only when the process is gone - never two children
   alive on purpose, never a silent leak.
3. **Stale-park sweep** (`sweepStaleParks`, i24_hygiene.go). Every successful swap
   sweeps `quack.exe.old*` from the binary's directory; deletion succeeds exactly when
   no process holds a park, so the sweep count is also the leak detector. Swept counts
   log to stderr.

Green: selftest supervisor-any-swap ok (force decision boundaries, park-sweep fixture
keeping the live binary and strangers, drain-spawn-notify order). Neighbour sweep all
ok: mcp-reload, mcp-serve, mcp-birth, mcp-self-arm, adopt-honest. The proving build
itself hot-swapped the resident child through the new path.

## Boot command  -> i27-b8-boot-cmd

Red: selftest:boot-sequence authored against the stubs (bootStepNames nil, bootVerdict
empty) and observed failing at df165e09.

`quack boot` (boot.go, go-boot-cmd) emits the FIXED onboarding sequence as a live
checklist - contract, recital+grant, voice, methods, workspace, attest, next - and ends
with onboard.md's report verdict. Ungated on purpose: boot runs before attestation, and
a blocked agent must always be able to ask where boot stands. The two steps the engine
cannot watch directly use mechanical proxies: a minted session key proves the grant was
redeemed (handed over only after a visible recital); key validity on THIS channel
proves attestation. `bootVerdict` is pure: workspace and next are the blocking steps
(blocked outranks yellow), any other undone step is yellow, and the deciding step's
detail names the one next action. The next step reuses cmdNext's ready computation,
extracted as `nextReadyIDs` (ops.go) so the command and the readout can never disagree.

onboard.md rewrote onto it: the sequence gains the `quack boot` step, Command
Boundaries describes the readout, and the Report section states that boot's last line
IS the report, repeated verbatim. AGENTS.md lists the command.

Green: selftest boot-sequence ok (fixed step order; green/yellow/blocked precedence;
first-undone-decides). Live readout on this workspace: yellow with 2619 nodes, 9 ready,
correctly flagging the unattested CLI channel while the session key rides MCP.
Neighbour sweep: attest-freshness ok, refusal-recovery ok, `quack lint` refusals clean,
live `quack next` unchanged after the extraction.

## Pager round-end  -> i27-b9-pager-result

Red: selftest:pager-round-end and selftest:pager-open-questions authored against the
stubs (pager_round.go, everything empty) and observed failing at 818810a5 / 61c75baf.

go-pager-round (pager_round.go) carries the ruled round-end contract:

- **The machine line.** A finished round's LAST stdout line is
  `ROUND-END gate=<id> verdict=<v>` - a scraping harness reads one line, no prose
  parsing. Verdicts: bless (y), dissent (n), reject (closed), unopened and error
  outcomes pass through honestly.
- **The pollable file.** `out/handoff-<gate>.result.json` in the data home carries
  {gate, verdict, outcome}. The round DELETES it at start; its appearance IS the end
  signal a wait loop polls - files, never `status`, per the i24 law.
- **Close-as-reject** (owner ruling 2026-07-18). A closed page window ends the round
  as a rejection - an answer, never a limbo. The console line says so and tells the
  waiting agent to stop waiting.
- **The open-question refusal.** A round never starts over an OPEN cone question
  (state open, neither proposed nor decided); the refusal names the question ids. A
  PROPOSED question deals as a card - the bless selects its letter (i21's assertion).

Green: both selftests ok. Neighbour sweep: register-render, register-ask,
register-killer-guard, handoff-lifecycle, handoff-milestone-title,
handoff-live-figures, pager-scope, pager-merge - all ok.

The sweep's full battery surfaced FOUR standing reds, all repaired here:

1. **selftest-home-sweep** - broken since i25: RunSelftestCLI arms batteryRunning for
   EVERY run, so the sweep the test asserts could never fire. Re-pointed with the
   i25 save/clear/restore pattern; the guard itself stays battery-isolation's
   assertion.
2. **ch3-mech** - the i27 register fold updated the workspace chapter but not the
   SOURCE template; the template still carried the dead ucfn-board fig. The fold is
   now mirrored into the template (section deleted, register tailor + prose folded,
   design comment updated) per the learning-escalates rule.
3. **book-dom-static + book-shell** - the b18 attention ping created echo divs with
   createElement, violating the dom-static law. The three echoes are now STATIC
   chrome siblings of the pane bar (outside #dpane-content, so the fill never wipes
   them); the script only re-arms a `pinging` class.
4. **user-wording** - "human-era criterion" slipped into compose-reference.md at the
   M1-M5 planning commit; reworded to "criterion from the hand-typed era".

## IFU machinery  -> i27-b27-ifu-machinery

Red: selftest:ifu-user-stories and selftest:ifu-split-slide authored against the stubs
(ifu.go, arc findings nil) and observed failing at b2552e10 / eb6b3864.

go-ifu-arc (ifu.go) is the arc shape check, pure text over a deck body, run by the
book render for every `kind: ifu` deck:

- **The fixed arc.** Fewer than the four fixed beats (problem, starting state, result,
  coverage) is a finding; more than six step slides is a finding naming the split.
- **Coverage is links on the LAST slide.** A bare use-case id on the coverage slide is
  named coverage theater; a coverage slide linking nothing is a finding; a use-case
  reference on a STORY slide is clutter with a move-it repair. Every finding names the
  deck and the fix.
- **The coverage rule tightened** (go-ifu-coverage, i26): `ifu-usecases` now counts a
  use case only when LINKED on a deck's last slide - `ifuRefLinked` accepts label and
  target positions, never a bare mention. The i26 selftest passes unchanged (its
  fixture already used links).

The split-slide half is proven end-to-end on a fixture IFU: the `|||` split renders
side-by-side halves (slide-cols/scol); an in-column `fig:` reuse arrives id-scoped via
deckScopeIDs (asserted pure, too); a slide-local mermaid model rides the ONE
interactive onion born-scoped (`man-ifu-fix-s3m1-o0` with in-host drill targets); the
shell's drill resolver matches by host-scoped suffix - the M5 spike's
drills-the-original defect stays dead. The wiring is asserted red-to-green: a bare-id
coverage slide surfaces the arc finding through renderBookHTML.

Green: ifu-user-stories ok, ifu-split-slide ok. Neighbour sweep: ifu-coverage (i26),
deck-links, pong-deck, deck-nav-usability, handoff-live-figures, book-shell,
book-dom-static - all ok. Standing debt for b28 (the content pass): the pong deck's
last slide links no use case yet, so its render carries one honest arc finding until
its coverage slide lands.

## IFU content  -> i27-b28-ifu-content

Red: selftest:ifu-base-state and selftest:ifu-quality authored as CONTENT checks over
the real workspace and observed failing at 5feb16f0 / 2c7489a1 (no setup deck, no
recorded reviews).

The journey re-clustering (owner method: group use cases by USER JOURNEY; coverage
falls out of telling every journey):

- **man-deck-setup** (new) - from a fresh machine to quackitect IDLE; its result slide
  DEFINES the idle state (engine current, workspace loads, boot green/yellow, next
  names a check) with a layered mini-model on the right half. Every other IFU's
  starting-state slide references it instead of restating.
- **Five journey decks** (new) - work-loop (plan/walk/refine/grants/ship), review
  (note/readout/report/retro), reader (the book: read/models/present/comment/
  white-label), workspace (drive/vendor/modules/MCP), trust (guards/models/edges/
  battery). Each arc-shaped, each referencing the setup base state, each ending in its
  coverage slide. Verified: all 50 loaded use cases are LINKED on a coverage slide.
- **man-deck-pong** - carries the ruled fresh-start exception as durable metadata
  (`arc: start: fresh`), its 82079 review, and a new coverage slide (s7, Minutes 0.0 -
  the game stays the s6 finale, the timeline total stays 5 min).
- **man-deck-ifu-map** - demoted to a PLAIN deck (kind dropped): the finding aid
  routing to the seven IFUs. Its all-50-links slide is gone; coverage lives on each
  journey's own slide. guide-ifu-map reworded; six new kind: ifu guide rows keep every
  IFU findable from ch 10.3.
- **The 82079 review** is recorded per deck as the `review-82079` frontmatter map:
  seven principles (completeness, correctness, conciseness, comprehensibility,
  minimalism, accessibility, target-group-fit), each answered in words; the selftest
  refuses a missing key or a checkmark answer. `review-82079` and `arc` joined the
  strict-load key allowlist (trust.go).

Re-points, both documented in place: pong-deck (i19) now expects seven slides and
probes the s7 coverage links; onboarding-surface (i19) expects the section title
"IFUs" - the b22 owner ruling renamed it, and the old "Onboarding" pin had been
passing vacuously through the cached book probe.

Green: ifu-base-state, ifu-quality, ifu-user-stories, ifu-split-slide, ifu-coverage,
pong-deck, onboarding-surface, deck-links, deck-nav-usability, terms-before-use,
ch2-ifu-intro - all ok. The b27 standing debt (pong's missing coverage slide) is
cleared.

## I/O busbar  -> i27-b29-io-busbar

Red: selftest:io-busbar authored (test-io-busbar minted, verifies req-conformance) and
observed failing at 26f39513 - the test DEMANDS the reflexion diff run clean, so the
physics law (q-coverage-ids-physics, ruling B) is a battery member from here on.

The refactor, per the ruling "external I/O goes through the layers":

- **The kernel prints nothing.** The coverage rules' progress lines
  (`verification: n/N ...`, the battery summary) inject through
  coverageProgress/coverageReport hooks the announce lane assigns at init - the
  kernel decides WHEN, the I/O lane owns the world contact. This also dissolved the
  inward-only violation (the kernel no longer references the announce writer).
- **Rule and plumbing split** at two more world contacts: the refusal lint's source
  walker and the function-node migration's file I/O moved outside their rule regions
  (the established precedent: the marked region is the rule, the shell is plumbing).
- **The disk busbar.** ioSelClass (go-io-busbar) classes every I/O selector - disk
  touches apart from console traffic - in ONE place feeding both the AST flow pass
  and the tap rules. design-layers.md declares `disk` as input and output; the
  declared "disk" bus is tapped ONLY by blocks whose code touches the disk
  (busTapsIn/busTapsOut); every other bus keeps its historical union semantics.
- **The model closed its i27 debt**: five build regions renamed to their M4-allocated
  names (go-ifu-arc-lint, go-pager-result, go-pugh-matrix-render,
  go-raid-matrix-render, go-register-fold), four late allocations added
  (go-apply-undo, go-onion-dsm-groups, go-timeline-frames -> rim--graph;
  go-no-test-policy -> kernel), and go-verify-feedback moved services -> rim (the
  announce lane prints to stderr by essence). All recorded in the model rationale.

Found and fixed on the way: a symbol-table artifact - a region-owned `func init`
collides with every other init in the name table and mints phantom cross-region
edges; the hook assignment lives outside the region (plumbing) for that reason.

Green: io-busbar ok; `quack lint` shows ZERO conformance findings (no world contact,
no sky-fall, no inward violation). Neighbour sweep: onion-clusters (fixture moved to
the honest diskReads form), onion-io-rendering, onion-boilerplate, refusal-recovery,
function-nodes, verify-pins-build, why-honest-delta, pager-round-end, apply-undo,
pugh-render, project-timeline, timeline-drilldown, risk-matrix,
design-input-register, filter-pills - all ok.

## Interfaces and rationales  -> i27-b30-interfaces-rationales

Red: selftest:interface-notes, selftest:onion-interfaces, selftest:rationale-fill
authored and observed failing at 8f03c417 / 837d8ca5 / 36d2c18d.

**The interface model** (req-interface-notes, owner ruling): every context boundary
line is now ONE prose-bearing con- note of the declared `interface` kind, connecting
the neighbour to the design element that carries the channel:

- nbr-agent <-> go-mcp-server (stdio MCP, session-keyed; CLI fallback)
- nbr-console <-> go-binary (argv in, board and verdicts out; never gated)
- nbr-git <-> go-truth-in-spec (the repository IS the medium; engine never calls git)
- nbr-vale <-> go-register-vale (pinned pull, advisory findings)
- nbr-obsidian <-> go-base-eval (shared notes and .base queries; engine owns truth)
- nbr-reader <-> go-book-emitter (one self-contained file; comments ride back)

Each description names the neighbour, what flows, the direction, and the channel.
The selftest walks every neighbour and refuses a missing, statement-less, or
stub-prose note. They render in ch4's interfaces table (verified live: the
con-interface rows appear in the rendered book).

**The responsibility column** (req-onion-interfaces): renderDesignRegions computes
briefs first and HIDES the responsibility column when it is empty across every row -
asserted both ways on fixtures.

**The rationale sweep** (req-rationale-fill): 204 TODO rationales eliminated in one
audited `quack apply` manifest (generated, dry-run, applied; archives skipped as
history). The 21 i27 requirements received REAL hand-written rationales grounding
each in its ruling or field feedback; the rest carry class-honest explicit marks
("Not applicable - ..." naming where the reasoning actually lives: verify lines for
tests, decision bodies for ADRs, deciding records for candidates, risk fields for
raid rows). The sweep is hash-neutral by design - node bodies do not fold into
fullHash - so no check went SUSPECT. go-rationale-fill joined `quack lint`
("rationales: clean") and the battery, so a future TODO fails mechanically.

Green: all three selftests ok; neighbour sweep deck-nav-usability, pong-deck,
ch2-derived ok with the interfaces rendering live.

## Filter round-trip  -> i27-b31-filter-feedback

Red: selftest:filter-feedback authored against the current shell (none of the ruled
behaviors existed) and observed failing at 4cd21955.

The ruled round-trip (req-filter-feedback, owner ruling 2026-07-18), baked into the
shell:

- **The jump.** An ADDED view token (the data-view pills; a toggle-off does not jump)
  lands the reader on the README via bookGoto - the stable ground the filtered world
  is surveyed from.
- **The README is never filtered.** The apply loop exempts man-readme by id; it can
  never carry flt-empty.
- **The ping.** The filter field sits in static ping chrome (#filter-wrap with three
  emitted echoes - the dom-static law holds; the script only re-arms the pinging
  class), riding the same qping animation as the details pane.
- **Honest graying.** The apply loop walks EVERY chapter with no current-chapter
  carve-out (the selftest scans the apply body and refuses a pg-hide reference), and
  the flt-empty machinery grays headings while hiding content; the toc grays emptied
  chapters and keeps them clickable.

Green: filter-feedback ok. Neighbour sweep: book-shell, book-dom-static,
details-full-entry, search-visible-hits, deck-links, book-a11y - all ok.

## Build the planned  -> i27-m6-build-the-planned

All thirty-three planned steps are realized and individually blessed, each with its
red ritual and its own evidence section above: b1-b9 and b32 (data foundations and
engine machinery, including the mid-plan additions the owner ruled in - apply undo,
the supervisor hardening, the boot command, the pager round-end), b10-b26 (the onion
rework, the book views, the content restructure), b27-b31 (the IFU machinery and
content, the I/O busbar physics refactor, the interface notes, the rationale sweep,
the filter round-trip). The wave order was retro-wired as real dependencies when the
owner confirmed machinery-first was the intent. Two incidents are recorded in place:
the book.go corruption and full recovery (b25's section), and the MCP supervisor
wedge that b7's hardening then killed at the root.

## Implementation risks  -> i27-m6-implementation-risks-acceptable

The risks that materialized during the build, and where each stands:

- **Scripted-edit corruption** (the book.go dot-replacement incident, b25's record):
  fully recovered with parity proven; the CAUSE is now law (the apply lane is the
  default, ad-hoc replace loops banned) and MACHINERY (b32's `apply --undo` journal
  keeps the last four manifests revertable).
- **The MCP supervisor wedge** (four leaked processes, ten-minute stalls): killed at
  the root by b7 - force-swap after the drain timeout, deterministic child kill with
  OS-level escalation, stale-park sweep. The recovery path (kill the processes, the
  harness revives) is proven and documented in the evidence.
- **Coverage-semantics tightening** (ifu-usecases counts linked-last-slide only):
  could have silently orphaned use cases; verified instead - all 50 loaded use cases
  are linked on a coverage slide, and the rule is battery-enforced.
- **The 204-file rationale sweep**: bulk-edit risk contained by the apply lane
  (dry-run, all-or-nothing, journaled) and by hash-neutrality (bodies do not fold
  into node identity) - no check went SUSPECT.
- **Physics refactor reach** (kernel seams moved): the reflexion diff runs clean and
  selftest:io-busbar pins it, so a future violation fails the battery rather than
  accumulating.

Open, accepted, and NOTED for the retro (none blocks the gate): the Obsidian
first-class-dependency research, the test-frequency question, the harness-independent
status board, and the code-rereading process signal - all in the note inbox.

## Internal quality  -> i27-m6-internal-quality-ok

The quality lints at the build's close:

- **Conformance: CLEAN.** No world contact outside the rim, no sky-fall, no
  inward-only violation, no ambient breach - the physics law holds over the live
  code and selftest:io-busbar keeps it that way.
- **Coverage: clean except the unbuilt trio.** req-traced, req-has-test, and
  ifu-usecases are clean; the no-design list drained to the three requirements the
  gate review then EXPOSED as never built (q-unbuilt-trio) - the agent's first
  attribution of them to existing regions was wrong and is reverted, so
  designs-realized and tests-red stay honestly red on exactly those three until the
  owner rules the question.
- **Refusals: CLEAN** - every refusal names its recovery (the b4 lint).
- **Rationales: CLEAN** - every slot filled or explicitly marked (the b30 lint).
- **Advisory debt, accepted:** the voice lint's unrendered-list findings in
  historical evidence docs (M1-M5 prose, pre-dating the prose rule) and dash-joined
  clauses in a few design comments - style debt in non-load-bearing text, left for a
  content pass that earns its keep; no new debt added by M6 sections was flagged as
  load-bearing.
- **Static analysis**: every `quack build` of the batch passed the vet gate; the one
  refusal (an unused import) was fixed at its step, never carried.

## Models adhered to  -> i27-m6-models-adhered-to

The build filled the M4-allocated elements, with the drift caught and closed inside
the batch (b29's model close-out, recorded in the model rationale):

- Five build regions had realized M4 elements under drifted NAMES; all five were
  renamed to the allocated ids (go-ifu-arc-lint, go-pager-result,
  go-pugh-matrix-render, go-raid-matrix-render, go-register-fold).
- Five elements arrived that M4 did not sanction; each went through the model with
  an essence-argued allocation recorded in the rationale rather than in silently:
  go-apply-undo (an owner mid-plan ruling), go-onion-dsm-groups (the build found a
  real seam where M4 expected in-place extension), go-timeline-frames,
  go-no-test-policy, go-rationale-fill. One reallocation: go-verify-feedback
  services -> rim (it prints to stderr by essence).
- The enforcement is now MECHANICAL and permanent: the reflexion diff runs clean
  and selftest:io-busbar fails the battery on any future sky-fall or physics breach.

The honest caveat for the review: the late allocations were recorded by the agent at
the build, not pre-reviewed at M4 - the model rationale marks them, and the gate
review is where the owner's red pen falls on any of them.

## The unbuilt trio, built  -> i27-m6-suite-observed-red

q-unbuilt-trio DECIDED by the owner (2026-07-19): build all three inside i27. Each ran
the full red ritual (reds observed at a9386a83 / 9553c9f0 / a0949276):

- **models-useful** (go-models-useful): the GLOSSARY PULL LAW for models, per the
  owner's mid-build correction - the book renders a model ONLY when a views decision
  covers it (the views-chosen lint's own covered rule); an uncovered model appears
  NOWHERE in the book (no row, no stub, no review chatter in the reader surface) and
  stays legal markdown truth. All four current models are covered by the owner's own
  views ADRs (adr-i27-views, adr-i24-views, adr-module-views), so nothing vanishes
  today; the coverage is now load-bearing. Re-point: models-in-book's fixture gained
  its covering choice.
- **structure-layers** (go-structure-layers): the reading path as AUTHORED routes -
  `%% route: <element> -> <target>` in a model's mermaid parses into the graph
  (navigation, never semantics: the canonical hash ignores it; an undeclared source
  lints loud). The context star's centre routes into model-<brand>-structure
  (brand-derived, so vehicles inherit the path); model-quack-structure's determinizer
  routes into the onion. Every hop rides the standard data-node-link click lane.
- **trace-collapsible** (go-trace-collapsible): a parent with five or more same-type,
  single-parent LEAF children folds into ONE typed cluster node - the type keeps its
  place and color - joined by the DOUBLE line (two parallel bezier edges; the node
  wears cytoscape's double border). Opening the cluster shows the BUSBAR interior
  (the onion-cluster law): the parent lane as the identified input bar, every member
  a block riding it, in the book's details pane or the report's panel. Multi-parent
  and child-bearing nodes never fold - folding them would tear real edges.

Green: models-useful, structure-layers, trace-collapsible ok. Neighbour sweep:
models-in-book, model-kinds-catalog, model-consistency, model-lint, semantic-hash,
conformance, mint-all-kinds, trace-clustered, report-live, deck-nav-usability - all
ok. With the three tests real and red-observed, coverage:tests-red computes true
over the iteration - this check passes on evaluation.

## Verification green  -> i27-m6-verification-green-every

The full battery ran in its visible console, teed to an agent-readable log. First run: 2 of 264 failed.

- **test-drawing-is-spec**: its verify line named `selftest:structural-strictness`, a name the registry never had. The assertion lives in `parser-strict` (the recognition rule, nodeFence). The verify line now names it.
- **test-voice-zero**: the live spec carried 20 voice findings on node statements. The debt drained in one judged apply manifest: 26 byte-exact edits over 17 files (7 engine design comments, 12 spec statements, 2 method templates). Long sentences unmasked by the dash removals were split in the same pass.
- The guarded **test-io-busbar** reword went as a single edit. The red-edit guard refused the apply; `observe-red --refresh` refused the pass (the test is green). The node carries the cited exemption (adr-red-unobservable). The guard gap is noted for the retro.

Second run at build a8167852455a: `i27-m6-verification-green-every -> pass (derived: coverage:tests-pass)`. All 264 tests green.

## Pane ping visible  -> i27-c1-pane-ping-visible

The M6-reopen c1 defect, reproduced in the source: the pane docks in the sidebar's
clipped bottom corner (`#sidebar{overflow:hidden}`, negative margins to the edges), so
the outward echo ripple was swallowed in every direction but up - and the echo color
was the border's faint gray, near-invisible.

- Owner re-ruling mid-walk: NO inversion. The ripple stays OUTWARD; riding onto the
  neighboring text area is fine, and an edge that leaves the screen is accepted. (A
  first inward attempt was built on a misheard dictation and reverted in the same
  walk, red-refreshed honestly.)
- The fix: the sidebar clips with a margin (`overflow:clip;overflow-clip-margin:4vmax`)
  so the ripple escapes its box; the echo wears a visible dark neutral (#555) and a
  z-index above the pane content.
- Red-team of the test BEFORE observe-red found the vacuous form (asserting keyframe
  presence only) and the behind-content layering bug; both are pinned by assertions
  on both surfaces, plus the clip-margin itself.
- Red ritual: sharpened `selftest:details-full-entry` observed red at ac913615,
  red-refreshed for the direction correction, green at build e2b3934f8075.
  req-details-full-entry's technique block records the re-ruling.
- The visual half awaits the owner's wave render eyeball.

## Onion render size  -> i27-c11-onion-render-size

The M6-reopen c11 defect: the onion rendered inside the 1040px prose column and
wasted a wide screen.

- Onion figures now wear `fig-wide` and break out to
  `min(100vw - 380px, 1600px)`, centered over the viewport beside the sidebar.
  Fullscreen mode is excluded (the fixed modal keeps working) and narrow screens
  revert to the column.
- Trace: req-onion-space (refines uc-model-in-book), test-onion-space
  (`selftest:onion-space`). Red-teamed at design: the CSS rule alone passes while no
  figure wears the class, so the test pins the class on the emitted figure, the rule
  with its fullscreen exclusion, and the narrow-screen revert.
- Red ritual: observed red at 1c424705, green at build 9afa275678d6.
- The double border now keys on ENTERABILITY (`bl.drill`), not clusterhood - the
  affordance the owner confirmed. No observable red for that half: clusters, the only
  drillable blocks today, already drew it; the change pins the semantic for future
  drillable non-clusters. Neighbours green: onion-clusters, onion-io-rendering.
- The visual half awaits the owner's wave render eyeball.

## Timeline one design  -> i27-c12-timeline-one-design

The M6-reopen c12 defect: three surfaces carried three diverging timeline stylesheets
(book in rem, report in px, the hand-off its own unprefixed variants), and the old
dot-line `fig: timeline` svg still rendered beside the shared component.

- ONE stylesheet now: `qtlSharedCSS` (go-timeline-shared-css) is embedded by the
  report, the hand-off, and the book; the three local variants are deleted. The
  drill rules are `.qtl`-scoped so the hand-off's own panels keep their look.
- The old fig kind is RETIRED with a recovery message naming `fig: project-timeline`;
  its svg emitter is deleted; the two markdown usages (man-deck-review, the deck
  template) re-pointed. The singularity rule applied: the test asserts the old form
  is GONE, not only that the new exists.
- Trace: test-timeline-singular verifies req-project-timeline
  (`selftest:timeline-singular`). Red-teamed at design: presence-only assertions
  pass while a variant coexists, so occurrence counts pin exactly one per surface.
- Red ritual: observed red at a03c4eff, green at build d6a4e2fde643. Neighbours
  green: project-timeline, timeline-anchor, timeline-drilldown, pager-merge,
  handoff-lifecycle, ifu-quality, details-full-entry.
- REWORK (2026-07-19, the owner's milestones-look-different report): the shared block
  was verbatim on every surface, but the hand-off's OWN row styles used the timeline's
  class names unscoped (`.hrow`, `.hid`, `.hstmt`), restyling the timeline on that one
  surface. The hand-off rows renamed to `.hoffrow` and those rules scoped under it; the
  test now refuses any unscoped rule on the timeline's class names in handoffCSS.
  Red re-observed at a03c4eff, green after the rebuild.
- REWORK round two (2026-07-19, owner: the hand-off's colors must ride the book too):
  the task-tree styles (`.ttree` detailing, the `.mk` state-mark COLORS) lived only in
  the hand-off and the report - the book's tree was colorless, and the report used its
  own palette. All folded into qtlSharedCSS scoped under `.qtl` (the hand-off's palette
  wins: green #2f9e44, red #d6336c, yellow #e0a800), both local copies deleted, and the
  test's blacklist now covers `.ttree`/`.mk` on BOTH reportCSS and handoffCSS. The
  hand-off row look (border-top separators, open-summary wrap, hstmt ellipsis) also
  moved INTO the shared block, so every surface wears the hand-off's look. Red
  re-observed at a03c4eff, green after the rebuild.
- The visual half awaits the owner's wave render eyeball.

## RAID rework  -> i27-c13-raid-rework

The M6-reopen c13 walk, per the owner's layout ruling:

- Matrix at HALF width inside a flex wrap; the table beside it on the right. The old
  `![[raid.base]]` embed is gone from ch6 AND the template (which had drifted behind
  the workspace; mirrored per the template-book law).
- ONE filter set: the kind and status columns toggle bubbles and table rows together
  (the rows carry the same facet attributes).
- A bubble click opens the details pane (the unchanged data-node-link lane), selects
  the row, and scrolls it into view.
- Columns: id and statement only. Kind, probability, impact, status, mitigation, and
  owner render as a list in the row's expand (the #21 ruling).
- Colors: issue moved #b5651d -> #7d3fa8 in both palette files. Risk red, assumption
  blue, issue purple, dependency green - the two-reds complaint dies at the source.
- Red ritual: sharpened `selftest:risk-matrix` observed red at 08085d91, green at
  build a19abb3c459e. The sharpened book assertion caught a REAL regression mid-walk:
  a malformed fig-unit separator silently deleted the whole figure from the book -
  the exact failure class the weak-test root-cause fix targets.
- Collateral repaired in the same walk: two i0012 fixtures authored the retired
  `fig: timeline` (re-pointed to the context star, documented in place), and the
  freshly minted q-grant-lifecycle-kind statement carried a dash join (reworded;
  voice-zero green again).
- REWORK (2026-07-19, the owner's never-reinvent-tables ruling): the bespoke side
  table replaced by the STANDARD reader table (baseResultHTML) - name/kind/status
  columns, the statement in the standard brief/expand lane, its own enum pills. Two
  generic table capabilities minted for it: `BaseResult.PageSize` (per-table default
  page, RAID at ten) and `BaseResult.FacetOff` (facet values deselected at emit -
  closed starts hidden as DATA; the shell script seeds its model from the emitted
  pill states). The matrix bubbles carry the standard facet attrs (e1/e2) and only
  LISTEN to the table's pills; the table moved LEFT, the matrix right. Red
  re-observed at 08085d91, green after the rebuild.
- The visual half awaits the owner's wave render eyeball.

## IFU renumber  -> i27-c14-ifu-renumber

The owner's naming ruling executed: IFU ids are `ifu<NNNN>-<name>` in reading order,
displayed as-is, pong its own numbered IFU.

- The seven decks renamed (files and ids): ifu0001-setup, ifu0002-pong,
  ifu0003-work-loop, ifu0004-review, ifu0005-reader, ifu0006-workspace,
  ifu0007-trust. The proposed reading order (setup, then the pong taste, then the
  five journeys) is the agent's; the owner re-rules at the eyeball if it reads wrong.
- 50 references followed via the recorded scripted-bulk lane (BOM-less UTF-8,
  diff-verified): the decks, the ifu-map, eight guides, ch2, the README, the
  dependencies sheet, and 17 engine-test assertions. History (M-docs, HANDOVER)
  stays untouched - evidence describes its own time.
- Ch2.2 lists the IFUs in number order; number order IS id sort order, so every
  derived listing follows for free.
- Ch10.3: a guide row that IS a deck carries the open-the-slides pill at the row's
  end (a 4th column; the deck derives from the guide's first deck-manifest link;
  the pill rides the data-goto transport). test-ifu-deck-pills pins the setup pill's
  wiring and a count of one per IFU deck; tests_red exempt with citation - the test
  and the build landed in one authoring pass (adr-red-unobservable).
- Collateral: the ifu-split-slide fixture authored the retired timeline fig
  (re-pointed to the context star with a seeded neighbour, documented in place).
- Guards green: ifu-deck-pills, ifu-base-state, ifu-quality, ifu-user-stories,
  ifu-split-slide, pong-deck, onboarding-surface, deck-links, ch2-ifu-intro,
  terms-before-use, voice-zero.

## Pong register render  -> i27-c15-pong-register-render

The owner's statement-and-evidence split, executed: the pong register slide is a
split slide - lead line across the top, the story text left, and pong's design
input rendered RIGHT through the new `fig: sample-register` kind
(go-sample-register), which feeds the canonical pong fixture through the SAME
component the book's register uses. The demo can never drift from the real look.

- The authored HTML table is gone from the deck source; a render is not slide
  text, so the b28 arc finding dissolves by construction.
- Trace: test-pong-register-render verifies req-design-input-register; tests_red
  exempt with citation (one authoring pass, adr-red-unobservable). The singularity
  rule: the table's absence is asserted, not assumed.
- Physics: go-sample-register, go-onion-space, and go-timeline-shared-css joined
  the engine-layers model (rim--graph, essence-argued in the model rationale) after
  the reflexion diff caught the unallocated call-bearing region - the io-busbar law
  working exactly as built. The c11 coverage hole (req-onion-space without a
  design) closed with the marker on the wrapper code.
- The stale i19 pong-deck assertion pinned the SUPERSEDED table shape (q-table,
  the old caption); re-pointed to the ruled shape, documented in place. Green:
  pong-deck, pong-register-render, io-busbar, conformance, ifu-quality,
  ifu-user-stories, evidence-md-tables.
- The visual half awaits the owner's wave render eyeball.

## Models session  -> i27-c16-models-session

Held with the owner in chat, 2026-07-19; five cards, five rulings:

- model-grant-lifecycle: DELETED (git history serves any actual need). The dangling
  chosen edge healed, the i22 comment carries the lifecycle contract inline, and
  q-grant-lifecycle-kind is decided (A). Ref-integrity refused the broken graph
  mid-walk exactly as designed.
- The structural renderer redesign: DEFERRED to a joint session, by ruling.
- model-quack-structure: takes the onion's place in the design chapter; the onion
  nests INSIDE it as the determinized part; structural models gain in/outputs fed
  from the context model. Seeded as i27-c17.
- The context star DIES as a term: it is the CONTEXT MODEL everywhere. Interfaces
  live on it (label + details on click); onion/structure lanes open them too.
  Seeded as i27-c18.
- The three structurals stay IF design items reference them and they place
  somewhere; unused ones drop. Seeded as the i27-c19 audit.
- Process rulings recorded: decisions ride the hand-off page in the browser; the
  agent builds until it needs the owner, then batches the discussion.

## Structure hosts the onion  -> i27-c17-structure-hosts-onion

The placement half of the c16 card-3 ruling, filled:

- Ch4's Partitioning section now leads with `fig: model model-quack-structure`; the
  onion renders beneath it as the determinized part, and the prose names the
  nesting. Verified in a fresh render: the structure figure precedes the onion.
- The click route already existed (go-structure-layers: determinizer ->
  model-engine-layers), so the drill works today.
- SCOPED OUT, consolidated into the deferred renderer session (the c16 card-2
  ruling): the visual nesting (the onion drawn inside the structure's determinizer
  box), the structural in/outputs fed from the context model, and the template
  mirror (a generic brand-structure mount). Building those now against a renderer
  the owner will redesign with the agent would be waste; the session bakes the
  final shape with its own red ritual.
- The eyeball covers the placement this wave; the mechanical guard lands with the
  session's renderer.

## Context model interfaces  -> i27-c18-context-model-interfaces

The c16 card-4 ruling, filled:

- The term "context star" is DEAD: 13 live files renamed (Go identifiers, the
  selftest's registered name and its i0014 test node's verify line, the fig kind,
  CSS classes, chapter prose, method templates, the ADR body). The old fig kind is
  retired with a recovery naming `fig: context-model`. History untouched.
- The interfaces LIVE on the model: each boundary line carries its interface note's
  label (the statement's lead phrase) and opens the full note on click through the
  data-node-link lane.
- Red ritual: test-context-model-interfaces (verifies req-interface-notes) observed
  red at b1fe1e62, green at build 05733aca2d28. Red-teamed: the assertion scopes to
  the model's own svg, pinning the agent lane by note id and label text.
- The onion/structure lane click-through consolidates into c9's overview redo,
  where that code lives. Guards green: context-model-interfaces,
  context-model-derived, interface-notes, book-figures, deck-mode, ifu-split-slide,
  structure-layers.

## Structural usage audit  -> i27-c19-structural-usage-audit

The c16 card-5 rule applied to the three structurals; the verdict: ALL THREE STAY.

- model-agent-lanes: addressed by adr-i24-views (a views decision); its elements
  map the agent lanes and i24 guard regions.
- model-module-architecture: addressed by adr-module-views; maps the module
  machinery regions.
- model-guard-tree: CHOSEN by adr-guard-dispatch-layer, and two decision bodies
  reference it by element ("Shapes elem-command-guards / go-verdict-guard in
  model-guard-tree"); its tree maps real i22 regions.
- Consistency fix in the same walk: guard-tree moved from the i22 iteration folder
  to spec/models - models are project-global by the compose rule; it was the only
  straggler. Load clean after the move.
- No engine change, no red ritual owed: an audit and a file move.

## Chapter titles  -> i27-c2-chapter-titles

The heading-leak defect, root-caused and fixed:

- Root: splitChapterTitle split on dashes only; the voice drain turned ch2's dash
  into a period, so the whole statement became the heading. The split now cuts at
  the earliest dash OR sentence end (go-chapter-title-split, req-chapter-titles);
  subtitles render smaller (.45em).
- Ch2 is titled "Introduction and IFUs", short. FUNDAMENTALS is its own chapter
  again (man-fundamentals, order 25): the key concepts, references, and the
  glossary splice moved there, mirrored to the template layer; the glossary
  splice const re-pointed. Chapter numbers derive at render, so the insertion
  renumbered later chapters for free.
- Two stale hardcoded chapter-number references became links (the pong slide's
  "(chapter 6)" was already wrong; req-ch3-needs-intro now names the chapter, not
  a number).
- test-chapter-titles bounds EVERY rendered heading and pins the sentence split;
  tests_red exempt with citation (one authoring pass).
- Collateral: onboarding-surface sliced the IFUs section by the moved unit's
  anchor - re-pointed to the chapter end, documented in place. Green:
  chapter-title-split, spec-template-set, ch2-ifu-intro, onboarding-surface,
  terms-before-use, ch3-needs-intro, io-busbar; the full cascade 217/217.
- Pre-existing wart flagged for the eyeball: chapters 2 and 4 both open with
  "Introduction" (ch0's old title) - not in this step's scope.

## Ch3 needs drop  -> i27-c3-ch3-needs-drop

The honest finding: the needs list was ALREADY gone - b26 implemented
req-ch3-needs-intro correctly. The fresh render's opening section carries IFU
prose, the register reference, and ZERO need references. What the owner saw was
most likely the stale committed render, or the need FACET chips in the register -
which the i26 filter ruling itself mandates.

- The weak-test half was real and is fixed: selftest ch3-needs-intro asserted
  only the prose position, so a returning needs list would have passed. It now
  asserts the ABSENCE: no need node reference before Context and scope. The facet
  stays exempted by design.
- No behavior change, so no red was observable; the sharpening is the fill.
- Flagged for the eyeball: if low-level needs still show in that opening, point
  at them - the assertion would then be wrong in an interesting way.

## Trace nesting visible  -> i27-c4-trace-nesting-visible

Reproduced honestly: the clustering has been LIVE all along. The fold computes
(seven typed clusters across six need tabs - req-go-port designs and tests,
req-comment-layer tests, req-connections-lanes, req-derived-boards, and
req-template-home designs, req-vendor-workspace tests), the double border and
double join style exists, and a cluster click opens the busbar interior.

- The invisibility was part subtlety, part which tab was open. Clusters now draw
  as BOLD round-rectangles with a heavier double border and padding - unmistakable
  against plain nodes.
- At the wave eyeball the exact tabs are named. If the owner's intent is full
  hierarchical NESTING (parts drawn inside parents) rather than fold-clusters,
  that is the same containment question as the deferred structural-renderer
  session and rides there.
- Guards green: trace-clustered, report.

## Graph centering live  -> i27-c5-graph-centering-live

Reproduced in one look: the context model's container (`.ctx-model svg`) capped
at 560px with display block and NO auto margins - it hugged the left edge. b25
centered the other containers and missed this one; its test asserted only the two
rules it had written (the weak-test class again).

- Fix: the missed container centers. The sharpened test pins EVERY capped svg
  container (onion-flow, figure svgs, ctx-model, onion-sm, handoff models).
- Red ritual: observed red at 44781a55, green after the one-property fix; the
  cascade ran 215/215.

## Structure route live  -> i27-c6-structure-route-live

Reproduced: the route LINK always existed (structure-layers pinned it); what
"didn't exist" was the LANDING. Before c17 the structural model rendered only
inside the models-table's hidden expand, so the click scrolled nowhere - and the
M4 evidence doc's embedded `fig: model` copy minted a DUPLICATE anchor id.

- Fixes: ch4's structure figure is now the one visible anchor (c17); embedded
  evidence figures scope their ids away (the deck-scoping helper reused in the
  evidence lane).
- The sharpened structure-layers test asserts the landing: exactly ONE
  `id="model-quack-structure"` anchor in the book - a stranded click cannot
  return. Guards green: structure-layers, handoff-live-figures,
  timeline-drilldown, card-evidence.

## Filter unification  -> i27-c7-filter-unification

The two filtering surfaces became ONE:

- The coverage board's three facet families (phase, discipline, quality) now ride
  the register's filter row as chip columns, keyed "b:<facet>" on the
  class-matching lane (multi-valued facets cannot ride single-valued data
  attributes). Zero-count holes stay visible with their (0), so the completeness
  check lives on inside the one surface.
- The board fig kind is RETIRED with a recovery message; its case is deleted;
  both chapters (workspace and template) dropped the fig unit and reworded the
  prose.
- Red ritual: test-filter-unification (verifies req-derived-boards) observed red
  at 310b7539 BEFORE the fix - two passes, no same-pass exemption this time.
  Green: filter-unification, design-input-register, filter-pills,
  report-filter-ux, base-views, filter-feedback, ch3-needs-intro.

## Modules guide  -> i27-c8-modules-guide

The reader-altitude ruling executed: the DSM structuring prose left the design
chapter for its own guide.

- guide-structuring-methods (audience developer-maintainer) carries the method
  catalog, reshaped into a proper list; the chapter keeps ONE reference line.
- No engine change; content move only. Guards green: agent-guide-ch8,
  terms-before-use, render-refs, book-manifests.

## Onion overview redo  -> i27-c9-onion-overview-redo

The three ruled properties, filled:

- NO UNMAPPED RING: the ring held twenty-six flow-light regions realized across
  i24-i27 that the sky-fall lint never saw (no product-internal calls). All
  twenty-six allocated in the engine-layers model by essence, rationale recorded;
  the ring now renders NOTHING and stays as the honest rot symptom for the
  future. The conformance checker then corrected ONE of the agent's placements
  (go-fail-at-end rim -> kernel: the coverage rules call it) - the physics
  machinery catching its own builder within a battery cycle.
- THE BUS FORM: the overview mirrors the band view per the committed Excalidraw
  spec - pills above ONE horizontal input rail (green) at the top, the mirrored
  output rail (orange) at the bottom, one solid tap each stopping at the onion's
  outside; the dashed per-box radial arrows are GONE (asserted absent).
- CLICKS: annotated I/O pills open their neighbour's interface note through the
  data-node-link lane (the c18 lane consolidation landing here). The mapping is
  durable metadata: `git (nbr-git)` annotations on the design-layers
  inputs/outputs lines, stripped for display.
- Red ritual: sharpened selftest:onion-io-rendering red-refreshed at 1331d5d8,
  green after the redo. Guards green: onion-io-rendering, onion-clusters,
  onion-space, onion-boilerplate, diagram-review-render, pong-deck, io-busbar,
  conformance.
- The visual half awaits the owner's wave render eyeball.

## Onion click targets  -> i27-c10-onion-click-targets

The cross-layer misjump, root-caused: a block's single click fired the onion
INSPECT handler AND the book's bubbling data-node-link transport - the inspect
lane never stopped propagation (the pill lane did). The double-fire could land
the reader anywhere the transported id anchored.

- One-line fix in the shared interaction script: propagation stops at the
  inspect. The click rules now hold on every host (book, standalone review, deck
  copies): the core's single click drills - its only action; a block's single
  click inspects and NOTHING else; a drillable block keeps drill on double-click.
- Red ritual: sharpened selftest:onion-click red-refreshed at 030e3bdc, green
  after the fix. Guards green: onion-click, onion-enter, onion-interfaces,
  diagram-review-render.
- Whether the clicks now FEEL intuitive is the eyeball's call.

## The rename determinizer  -> i27-c20-quack-mv

`quack mv <old-id> <new-id>` landed, red-first (stub red at 670fecab, green after
the build): boundary-safe token replacement across every reference class - file
name, markdown links, bare ids, edge lanes, engine source - journaled through the
apply undo lane, collision-refused, dry-run first. Its proving job ran live: the
ten chapter de-numberings, ~130 references followed in ten commands. The layout
rework rode it: spec/ top level holds only the chapters and entry files, the IFUs
in spec/ifus/, the layer map in spec/design/ (the engine reads both spots), the
IFU map deck and its guide deleted by ruling.

## Apply field ops  -> i27-c21-apply-field-ops

set-field landed, red-first (stub red at 9ab341c4, green after the build): one
scalar frontmatter field replaces in place or inserts inside the block; no other
byte moves; nested blocks and fenceless files refuse loudly. The vault-tool
research's AST-safety, learned into the one audited write lane instead of a
dependency.

## The toc and the landing  (rides c20's walk)

spec/toc.md OWNS the order (req-toc-order, red at 09d157e2, green): top-level
entries order the chapters, a chapter carries no order of its own, an unlisted
chapter appends visibly, no-toc workspaces keep the Order fallback. The owner
hand-edited the toc and the intro; the IFU landing is now a BASE-QUERY table
(ifus.base) whose deck rows auto-earn the open-the-slides pill in the ONE generic
table renderer (red at fcf77f4b, green) - never a hand-maintained list. The
onboarding-surface test re-pointed to the new landing shape, documented in place.

## Milestone review  -> i27-m6-gate

The increasing-scrutiny rounds (guides/milestone-review.md), run at the build's close.

**Round 1 - verify (built it right).** Every one of the 33 blessed steps carries its
red ritual in this document: the red observation hash, the implementation, the green,
and the neighbour sweep. Spot-depth went to the riskiest: the supervisor swap (proven
live by the very build that shipped it), the coverage-semantics tightening (all 50
use cases verified linked), the 204-file sweep (dry-run, journaled, hash-neutral),
and the physics refactor (the reflexion diff clean and battery-pinned). Four standing
battery reds found during the walk were repaired and re-pointed with their history
documented in place (b9's section).

**Round 2 - validate (built the right thing).** Against the M1 frame: the book
feedback rulings are all in - the IFU system (arc, split slides, seven journey decks,
82079 reviews), the onion physics, the register fold, the timeline surfaces, the
filter round-trip, the boot/pager/supervisor machinery the field sessions demanded.
OUT of scope and honest about it: the three M2-ruled features the build tree never
seeded (q-unbuilt-trio, proposed: defer) - caught by the gate's own tests-red check,
not by memory.

**Round 3 - red-team.** The opposing case argued: (a) the IFU 82079 reviews are
agent-authored frontmatter - the owner has not read the decks; the gate review is
where that scrutiny belongs, and the decks are one click away in the book. (b) The
late model allocations (b29) were agent-argued, not M4-reviewed - marked in the model
rationale for the owner's red pen. (c) The agent's own false-attribution slip on the
unbuilt trio is itself evidence the process needs the mechanical checks it has: the
ledger caught what the agent glossed. (d) The battery has NOT yet run green
end-to-end at this build - the guard sanctions the full battery only once this gate
is ready or suspect, which the unbuilt-trio ruling currently blocks; run it first
thing after the ruling (i27-m6-verification-green-every remains open, correctly).

**The stranger's read** belongs to the iteration's FINAL milestone (M8 handover per
the guide), not here.

**Verdict at first pass (2026-07-18): BLOCKED-HONEST** - the tests-red check exposed
three M2-ruled features the bake never seeded (q-unbuilt-trio), and the gate refused
to move until ruled. **Resolved (2026-07-19):** the owner ruled BUILD ALL THREE and
named the root cause (requirements minted in expedition territory with no
integrate-back step - noted for the retro). All three were then built with full red
rituals, with one mid-build owner correction folded in (models render under the
glossary PULL LAW: an unused model appears nowhere). suite-observed-red and
designs-realized compute clean; the verification battery ran through the verify lane
in its visible console. The review rounds above stand; round 3's caveats (the
agent-authored 82079 reviews, the agent-argued late model allocations, the
structure-layers and trace-collapsible proposals the owner expects to red-pen)
remain the substance of THIS adjudication.

**Verdict: PASS to the pager.** No open question in the cone (q-unbuilt-trio is
decided); the killer gate goes to the owner with the caveats named.

## Project chapter restructure  -> i27-c13-raid-rework

Owner rulings 2026-07-19 (push-today round), all landed in `man-project.md`:

- The `fig: project-table` section is REMOVED - the shared timeline is THE iterations
  rendering; two renderings of the same ledger were one too many.
- The Decisions section MOVED below the iteration timeline (the timeline carries the
  decisions in the walk; the table stays as the flat index), and the chapter lede's
  bullet order follows.
- Deferred by owner word, notes captured: model cleaning/improvement (future
  iteration), fundamentals moving to chapter four (future, low priority).
